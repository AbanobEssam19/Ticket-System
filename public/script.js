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
      document.getElementById("errorPhoneMessege").style.display = "block";
      console.log("Invalid phone number");
      return;
    }
    document.getElementById("errorPhoneMessege").style.display = "none";


    let seatRegex = /^[A-P](L|R)([1-9]|1[0-2])$/;
    let seatNo = formData.get("seatNum");
    let seatPos = formData.get("seatPos");
    console.log(seatPos);

    if(seatRegex.test(seatNo) == false) {
      document.getElementById("errorSeatMessege").style.display = "block";
      return;
    }
    document.getElementById("errorSeatMessege").style.display = "none";

    console.log(`User ${userName} ${phone} ${seatNo}`);

    const res = await fetch("/ticket/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userName, phone: phone, seatNum: seatNo, seatPosition: seatPos, domain: window.location.origin }),
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
        document.getElementById("result").style.display = "block";
        form.reset();
    } else {
      document.getElementById("seatTakenModal").style.display = "flex";
    }
  });
  

document.getElementById("viewTickets").addEventListener("click", () => {
  window.location.href = "/tickets";
});

document.getElementById("qrScanner").addEventListener("click", () => {
  window.location.href = "/qr";
});

document.getElementById("closeModalBtn").addEventListener("click", () => {
  document.getElementById("seatTakenModal").style.display = "none";
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


