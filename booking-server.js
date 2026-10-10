/*
 H A M A R A   B E A U T Y — standalone appointment API
 Uses only Node built-in modules. Run with: node booking-server.js
 Data persists in booking-data.json in this folder. Do not expose this server publicly
 without HTTPS, rate limiting, backups, and a strong BOOKING_ADMIN_TOKEN.
*/
"use strict";
const http=require("http"),fs=require("fs"),path=require("path"),crypto=require("crypto");
const PORT=Number(process.env.BOOKING_PORT||5001);
const ADMIN_TOKEN=process.env.BOOKING_ADMIN_TOKEN||"";
const DATA_FILE=path.join(__dirname,"booking-data.json");
const SERVICES={"Soft Glam":90,"Full Glam":120,"Bridal Makeup":180,"Birthday / Event Makeup":120,"Photoshoot Makeup":120,"Custom Makeup":90};
const OPEN_HOUR=9,CLOSE_HOUR=18,SLOT_STEP=30;
const DEFAULT={bookings:[],blockedDates:[]};
function readData(){try{return JSON.parse(fs.readFileSync(DATA_FILE,"utf8"))}catch{return structuredClone(DEFAULT)}}
function writeData(d){const tmp=DATA_FILE+".tmp";fs.writeFileSync(tmp,JSON.stringify(d,null,2));fs.renameSync(tmp,DATA_FILE)}
function send(res,status,obj){res.writeHead(status,{"Content-Type":"application/json; charset=utf-8","Access-Control-Allow-Origin":"*","Access-Control-Allow-Methods":"GET,POST,DELETE,OPTIONS","Access-Control-Allow-Headers":"Content-Type,Authorization","Cache-Control":"no-store"});res.end(JSON.stringify(obj))}
function parseBody(req){return new Promise((resolve,reject)=>{let raw="";req.on("data",c=>{raw+=c;if(raw.length>20000){reject(new Error("Request too large"));req.destroy()}});req.on("end",()=>{try{resolve(JSON.parse(raw||"{}"))}catch{reject(new Error("Invalid JSON"))}});req.on("error",reject)})}
function validDate(s){if(!/^\d{4}-\d{2}-\d{2}$/.test(s||""))return false;const d=new Date(s+"T00:00:00");return !Number.isNaN(d.getTime())&&d.toISOString().slice(0,10)===s}
function startOfDay(date,time){return new Date(`${date}T${time}:00`)}
function overlap(a,b){return a.start<b.end&&b.start<a.end}
function blocked(data,date){return data.blockedDates.some(x=>x.date===date)}
function slotList(date,service,data){if(!validDate(date)||!SERVICES[service])return [];const day=new Date(date+"T12:00:00").getDay();if(day===0||blocked(data,date))return [];const duration=SERVICES[service],out=[];for(let mins=OPEN_HOUR*60;mins+duration<=CLOSE_HOUR*60;mins+=SLOT_STEP){const hh=String(Math.floor(mins/60)).padStart(2,"0"),mm=String(mins%60).padStart(2,"0"),time=`${hh}:${mm}`;const start=startOfDay(date,time);if(start.getTime()<=Date.now())continue;const candidate={start:start.getTime(),end:start.getTime()+duration*60000};const taken=data.bookings.some(b=>b.date===date&&b.status==="confirmed"&&overlap(candidate,{start:startOfDay(b.date,b.time).getTime(),end:startOfDay(b.date,b.time).getTime()+SERVICES[b.service]*60000}));if(!taken)out.push(time)}return out}
function authorized(req){if(!ADMIN_TOKEN)return false;const supplied=(req.headers.authorization||"").replace(/^Bearer\s+/i,"");return supplied.length===ADMIN_TOKEN.length&&crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(ADMIN_TOKEN))}
function clean(v,max=500){return typeof v==="string"?v.trim().slice(0,max):""}
const server=http.createServer(async(req,res)=>{if(req.method==="OPTIONS")return send(res,204,{});const u=new URL(req.url,"http://localhost");try{
 if(req.method==="GET"&&u.pathname==="/api/health")return send(res,200,{ok:true,service:"Hamara Beauty booking API"});
 if(req.method==="GET"&&u.pathname==="/api/availability"){const date=u.searchParams.get("date"),service=u.searchParams.get("service");if(!validDate(date)||!SERVICES[service])return send(res,400,{error:"Choose a valid date and service."});const d=readData(),slots=slotList(date,service,d);return send(res,200,{date,service,durationMinutes:SERVICES[service],slots,message:slots.length?"":"No times are available. Sundays and blocked dates are closed."})}
 if(req.method==="POST"&&u.pathname==="/api/bookings"){const b=await parseBody(req);const service=clean(b.service,80),date=clean(b.date,10),time=clean(b.time,5),location=clean(b.location,20),name=clean(b.name,100),phone=clean(b.phone,30),email=clean(b.email,160),address=clean(b.address,240),notes=clean(b.notes,700);
 if(!SERVICES[service]||!validDate(date)||!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)||!["Studio","Mobile"].includes(location)||name.length<2||phone.length<7||!/^\d{2}:\d{2}$/.test(time)||(location==="Mobile"&&address.length<5))return send(res,400,{error:"Please complete all required booking details correctly."});
 const d=readData();if(!slotList(date,service,d).includes(time))return send(res,409,{error:"That time is no longer available. Please choose another available slot."});
 const booking={id:crypto.randomUUID(),reference:"HB-"+crypto.randomBytes(3).toString("hex").toUpperCase(),service,date,time,location,address,name,phone,email,notes,status:"confirmed",createdAt:new Date().toISOString()};
 d.bookings.push(booking);writeData(d);return send(res,201,{message:"Appointment confirmed.",booking});
 }
 if(u.pathname.startsWith("/api/admin/")){if(!authorized(req))return send(res,401,{error:"Unauthorized. Check the admin token in your .env file."});
 if(req.method==="GET"&&u.pathname==="/api/admin/bookings"){const d=readData(),date=u.searchParams.get("date"),statusFilter=u.searchParams.get("status");const bookings=d.bookings.filter(b=>(!date||b.date===date)&&(!statusFilter||b.status===statusFilter)).sort((a,b)=>(a.date+a.time).localeCompare(b.date+b.time));return send(res,200,{bookings})}
 if(req.method==="POST"&&u.pathname.startsWith("/api/admin/bookings/")&&u.pathname.endsWith("/cancel")){const id=u.pathname.split("/")[4],d=readData(),b=d.bookings.find(x=>x.id===id);if(!b)return send(res,404,{error:"Booking not found."});b.status="cancelled";b.cancelledAt=new Date().toISOString();writeData(d);return send(res,200,{booking:b})}
 if(req.method==="GET"&&u.pathname==="/api/admin/blocked-dates")return send(res,200,{dates:readData().blockedDates.sort((a,b)=>a.date.localeCompare(b.date))});
 if(req.method==="POST"&&u.pathname==="/api/admin/blocked-dates"){const b=await parseBody(req);if(!validDate(b.date))return send(res,400,{error:"Choose a valid date."});const d=readData();if(!d.blockedDates.some(x=>x.date===b.date))d.blockedDates.push({date:b.date,reason:clean(b.reason,100)});writeData(d);return send(res,201,{dates:d.blockedDates})}
 if(req.method==="DELETE"&&u.pathname.startsWith("/api/admin/blocked-dates/")){const date=u.pathname.split("/").pop();const d=readData();d.blockedDates=d.blockedDates.filter(x=>x.date!==date);writeData(d);return send(res,200,{dates:d.blockedDates})}
 }
 return send(res,404,{error:"Route not found."});
 }catch(e){console.error(e);if(!res.headersSent)send(res,500,{error:"Server error. Check booking-server console."})}});
server.listen(PORT,()=>console.log(`Hamara Beauty booking API running at http://localhost:${PORT}\nAdmin dashboard: open booking-admin.html\nSet BOOKING_ADMIN_TOKEN before using outside local testing.`));
