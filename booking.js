const API_BASE = "http://localhost:5001/api";
const WHATSAPP_NUMBER = "2340000000000"; // Replace with your WhatsApp number in international digits only.
const form = document.getElementById("bookingForm");
const service = document.getElementById("service");
const dateInput = document.getElementById("date");
const timeInput = document.getElementById("time");
const slots = document.getElementById("slots");
const message = document.getElementById("message");
const addressField = document.getElementById("addressField");
const addressInput = document.getElementById("address");
const submitBtn = document.getElementById("submitBtn");
let chosenSlot = "";
const today = new Date();
dateInput.min = `${today.getFullYear()}-${String(today.getMonth()+1).padStart(2,"0")}-${String(today.getDate()).padStart(2,"0")}`;
document.getElementById("year").textContent = new Date().getFullYear();
document.querySelector(".menu-toggle").addEventListener("click",()=>document.querySelector(".nav-links").classList.toggle("open"));
document.querySelectorAll('input[name="location"]').forEach(el=>el.addEventListener("change",()=>{
  const mobile = el.checked && el.value==="Mobile";
  if(!el.checked) return;
  addressField.hidden=!mobile; addressInput.required=mobile;
}));
document.getElementById("whatsappHelp").href=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent("Hello Hamara Beauty, I need help choosing a makeup service.")}`;
function showMessage(text,error=false){message.textContent=text;message.classList.toggle("error",error)}
function clearSlots(text){slots.replaceChildren();timeInput.value="";chosenSlot="";const p=document.createElement("p");p.className="hint";p.textContent=text;slots.append(p)}
async function loadSlots(){
  if(!service.value||!dateInput.value){clearSlots("Choose a service and date to see available times.");return}
  clearSlots("Checking availability…");
  try{
    const url=`${API_BASE}/availability?date=${encodeURIComponent(dateInput.value)}&service=${encodeURIComponent(service.value)}`;
    const res=await fetch(url);const data=await res.json();if(!res.ok)throw new Error(data.error||"Could not load availability.");
    slots.replaceChildren();
    if(!data.slots.length){clearSlots(data.message||"No available times on this date. Please choose another day.");return}
    data.slots.forEach(slot=>{
      const b=document.createElement("button");b.type="button";b.className="slot";b.textContent=slot;
      b.addEventListener("click",()=>{document.querySelectorAll(".slot").forEach(x=>x.classList.remove("selected"));b.classList.add("selected");chosenSlot=slot;timeInput.value=slot;showMessage("")});
      slots.append(b);
    });
  }catch(e){clearSlots("Availability service is not connected.");showMessage(`${e.message} Start the booking server and try again.`,true)}
}
service.addEventListener("change",loadSlots);dateInput.addEventListener("change",loadSlots);
form.addEventListener("submit",async e=>{
  e.preventDefault();showMessage("");
  if(!chosenSlot){showMessage("Please choose one of the available time slots.",true);return}
  const payload={service:service.value,location:document.querySelector('input[name="location"]:checked').value,address:addressInput.value.trim(),date:dateInput.value,time:chosenSlot,name:document.getElementById("name").value.trim(),phone:document.getElementById("phone").value.trim(),email:document.getElementById("email").value.trim(),notes:document.getElementById("notes").value.trim()};
  submitBtn.disabled=true;submitBtn.querySelector("span").textContent="…";
  try{
    const res=await fetch(`${API_BASE}/bookings`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(payload)});
    const data=await res.json();if(!res.ok)throw new Error(data.error||"Booking could not be saved.");
    showMessage(`Booking confirmed! Reference: ${data.booking.reference}. Your appointment is saved.`);
    const waText=`Hello Hamara Beauty, my online appointment is confirmed.\nReference: ${data.booking.reference}\nService: ${payload.service}\nDate: ${payload.date}\nTime: ${payload.time}\nLocation: ${payload.location}${payload.address?`\nAddress: ${payload.address}`:""}\nName: ${payload.name}\nPhone: ${payload.phone}`;
    // WhatsApp opens as an optional notification; the booking is already stored before this link is opened.
    const wa=`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(waText)}`;
    if(WHATSAPP_NUMBER!=="2340000000000") window.open(wa,"_blank","noopener");
    form.reset();chosenSlot="";timeInput.value="";addressField.hidden=true;addressInput.required=false;await loadSlots();
  }catch(err){showMessage(err.message,true);await loadSlots()}
  finally{submitBtn.disabled=false;submitBtn.querySelector("span").textContent="↗"}
});
if(typeof AOS!=="undefined")AOS.init({duration:750,once:true,offset:55});
