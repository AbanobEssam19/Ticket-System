verify();
document
  .getElementById("ticketForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    let userName = formData.get("name");
    
    let phone = formData.get("phone");
    let regex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!regex.test(phone)) {
      document.getElementById("errorMessege").style.display = "block";
      console.log("Invalid phone number");
      return;
    }
    document.getElementById("errorMessege").style.display = "none";

    let seatNo = formData.get("seatNum");
    console.log(`User ${userName} ${phone} ${seatNo}`);

    const res = await fetch("/ticket/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userName, phone: phone, seatNum: seatNo, domain: window.location.origin }),
    });

    const result = await res.json();

    if (res.ok) {
      const qrData = result.qr;
      // Automatically trigger download
      const downloadLink = document.createElement("a");
      downloadLink.href = qrData;
      downloadLink.download = `ticket-${result.ticket.name}-${result.ticket.phone}.png`;
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);

      // Show success message and QR
      document.getElementById("result").innerHTML = `
          <h3>تم حجز تذكرة</h3>
          <p><strong>الرقم:</strong> <p>${result.ticket._id}</p></p>
          <p><strong>عرض التذكرة:</strong> <p><a href="${result.link}" target="_blank">${result.link}</a></p></p>
          <img src="${qrData}" alt="QR Code" style="width:200px;"/>
          <p><em>تم تحميل رمز QR تلقائيًا.</em></p>
        `;
    } else {
      alert("Failed to create ticket.");
    }
    document.getElementById("result").style.display = "block";
    form.reset();
  });

document.getElementById("viewTickets").addEventListener("click", () => {
  window.location.href = "/tickets";
});
 
async function verify() {
  const token = localStorage.getItem("token");
  const res = await fetch("/api/verify", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ token }),
  });
  
  if (!res.ok) {
    window.location.href = "/login";
  }
}


