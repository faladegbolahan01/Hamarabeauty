
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

// Configure the frontend allowed to contact this backend.
const allowedOrigins = (
    process.env.FRONTEND_URL ||
    "https://faladegbolahan01.github.io"
)
    .split(",")
    .map((origin) => origin.trim().replace(/\/$/, ""))
    .filter(Boolean);

app.disable("x-powered-by");
app.use(helmet());

app.use(
    cors({
        origin(origin, callback) {
            // Allow server-to-server requests and tools without an Origin.
            if (!origin) return callback(null, true);

            const normalizedOrigin = origin.replace(/\/$/, "");

            if (allowedOrigins.includes(normalizedOrigin)) {
                return callback(null, true);
            }

            return callback(new Error("Origin not allowed by CORS"));
        },
        methods: ["GET", "POST", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"]
    })
);

app.use(express.json({ limit: "20kb" }));

// Temporary order storage. This is for testing only;
// orders disappear when the server restarts.
const pendingOrders = new Map();
const ORDER_EXPIRY_MS = 30 * 60 * 1000;

app.get("/", (req, res) => {
    res.json({
        status: "success",
        message: "Hamara Beauty backend is running!"
    });
});

app.get("/health", (req, res) => {
    res.json({ status: "ok" });
});

// Register an order before opening Flutterwave checkout.
// IMPORTANT: amount must ultimately be calculated and validated
// against trusted server-side product prices.
app.post("/create-order", (req, res) => {
    try {
        const { tx_ref, amount, currency } = req.body || {};
        const orderAmount = Number(amount);

        if (
            typeof tx_ref !== "string" ||
            tx_ref.length < 5 ||
            tx_ref.length > 100 ||
            !Number.isFinite(orderAmount) ||
            orderAmount <= 0 ||
            currency !== "NGN"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Invalid order details."
            });
        }

        // Remove expired orders.
        for (const [ref, order] of pendingOrders.entries()) {
            if (Date.now() - order.createdAt > ORDER_EXPIRY_MS) {
                pendingOrders.delete(ref);
            }
        }

        if (pendingOrders.has(tx_ref)) {
            return res.status(409).json({
                status: "error",
                message: "This order reference already exists."
            });
        }

        pendingOrders.set(tx_ref, {
            tx_ref,
            amount: Math.round(orderAmount * 100) / 100,
            currency: "NGN",
            status: "pending",
            createdAt: Date.now()
        });

        return res.status(201).json({
            status: "success",
            message: "Order registered.",
            data: { tx_ref }
        });
    } catch (error) {
        console.error("Create order error:", error.message);

        return res.status(500).json({
            status: "error",
            message: "Could not register the order."
        });
    }
});

// Verify the payment directly with Flutterwave.
app.post("/verify-payment", async (req, res) => {
    try {
        const { transaction_id, tx_ref } = req.body || {};

        if (
            transaction_id === undefined ||
            transaction_id === null ||
            !/^\d+$/.test(String(transaction_id)) ||
            typeof tx_ref !== "string"
        ) {
            return res.status(400).json({
                status: "error",
                message: "Transaction ID and order reference are required."
            });
        }

        const order = pendingOrders.get(tx_ref);

        if (!order) {
            return res.status(400).json({
                status: "error",
                message: "Order not found. Please try checkout again."
            });
        }

        if (order.status === "paid") {
            return res.status(409).json({
                status: "error",
                message: "This order has already been confirmed."
            });
        }

        if (Date.now() - order.createdAt > ORDER_EXPIRY_MS) {
            pendingOrders.delete(tx_ref);

            return res.status(400).json({
                status: "error",
                message: "This order has expired. Please check out again."
            });
        }

        const secretKey = process.env.FLW_SECRET_KEY;

        if (!secretKey) {
            console.error("FLW_SECRET_KEY is not configured.");

            return res.status(500).json({
                status: "error",
                message: "Payment verification is not configured."
            });
        }

        const response = await fetch(
            `https://api.flutterwave.com/v3/transactions/${encodeURIComponent(
                String(transaction_id)
            )}/verify`,
            {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${secretKey}`,
                    Accept: "application/json"
                },
                signal: AbortSignal.timeout(15000)
            }
        );

        const result = await response.json();

        if (!response.ok || result.status !== "success") {
            return res.status(400).json({
                status: "error",
                message: "Flutterwave could not verify this transaction."
            });
        }

        const transaction = result.data;

        if (
            !transaction ||
            !["successful", "completed"].includes(transaction.status)
        ) {
            return res.status(400).json({
                status: "error",
                message: "Payment has not been confirmed as successful."
            });
        }

        const actualAmount = Number(transaction.amount);

        if (
            String(transaction.tx_ref) !== order.tx_ref ||
            transaction.currency !== order.currency ||
            !Number.isFinite(actualAmount) ||
            Math.abs(actualAmount - order.amount) > 0.01
        ) {
            console.error("Payment/order mismatch:", {
                transactionId: transaction.id,
                tx_ref: transaction.tx_ref
            });

            return res.status(400).json({
                status: "error",
                message: "Payment details do not match this order."
            });
        }

        order.status = "paid";
        order.transactionId = String(transaction.id);
        order.paidAt = new Date().toISOString();

        console.log("Payment verified:", {
            transactionId: transaction.id,
            tx_ref: transaction.tx_ref,
            amount: transaction.amount,
            currency: transaction.currency
        });

        return res.json({
            status: "success",
            message: "Payment verified successfully.",
            data: {
                transaction_id: transaction.id,
                status: "success",
                amount: transaction.amount,
                currency: transaction.currency,
                tx_ref: transaction.tx_ref
            }
        });
    } catch (error) {
        console.error("Payment verification error:", error.message);

        return res.status(500).json({
            status: "error",
            message: "Server error while verifying payment."
        });
    }
});

// Return JSON errors instead of exposing internal error details.
app.use((error, req, res, next) => {
    if (res.headersSent) return next(error);

    if (error.message === "Origin not allowed by CORS") {
        return res.status(403).json({
            status: "error",
            message: "This website is not allowed to access the backend."
        });
    }

    if (error instanceof SyntaxError && "body" in error) {
        return res.status(400).json({
            status: "error",
            message: "Invalid JSON request."
        });
    }

    console.error("Unhandled error:", error.message);

    return res.status(500).json({
        status: "error",
        message: "An unexpected server error occurred."
    });
});

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Hamara Beauty backend listening on port ${PORT}`);
});
