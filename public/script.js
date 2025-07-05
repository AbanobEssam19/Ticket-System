verify();
document
  .getElementById("ticketForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    let userName = sessionStorage.getItem("name");

    let phone = sessionStorage.getItem("phone");
    let regex = /^01[0-2,5]{1}[0-9]{8}$/;
    if (!regex.test(phone)) {
      document.getElementById("errorPhoneMessege").style.display = "block";
      console.log("Invalid phone number");
      return;
    }
    document.getElementById("errorPhoneMessege").style.display = "none";

    // let seatRegex = /^[A-P](L|R)([1-9]|1[0-2])$/;
    // let seatNo = formData.get("seatNum");
    // let seatPos = formData.get("seatPos");
    // console.log(seatPos);

    // if(seatRegex.test(seatNo) == false) {
    //   document.getElementById("errorSeatMessege").style.display = "block";
    //   return;
    // }
    // document.getElementById("errorSeatMessege").style.display = "none";

    // console.log(`User ${userName} ${phone} ${seatNo}`);

    const seatSession = sessionStorage.getItem("selectedSeat");
    if (!seatSession) {
      document.getElementById("errorSeatMessege").style.display = "block";
      return;
    }
    document.getElementById("errorSeatMessege").style.display = "none";
    const row = seatSession.split("-")[0];
    const seatNum = seatSession.split("-")[1];

    const res = await fetch("/ticket/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: userName,
        phone: phone,
        row: row,
        seatNum: seatNum,
        domain: window.location.origin,
      }),
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
      sessionStorage.removeItem("selectedSeat");
      sessionStorage.removeItem("name");
      sessionStorage.removeItem("phone");
      document.getElementById("seatNumber").textContent = "";
      document.getElementById("seatNumber").style.display = "none";
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

document.getElementById("chooseSeat").addEventListener("click", () => {
  window.location.href = "/seat";
});

const seatSession = sessionStorage.getItem("selectedSeat");

if (seatSession) {
  const row = seatSession.split("-")[0];
  const number = seatSession.split("-")[1];
  document.getElementById("seatNumber").textContent = `${row}${number}`;
  document.getElementById("seatNumber").style.display = "block";
} else {
  document.getElementById("seatNumber").style.display = "none";
}

document.getElementById("name").addEventListener("blur", () => {
  sessionStorage.setItem("name", document.getElementById("name").value);
});

document.getElementById("phone").addEventListener("blur", () => {
  sessionStorage.setItem("phone", document.getElementById("phone").value);
});

const nameSession = sessionStorage.getItem("name");
if (nameSession) {
  document.getElementById("name").value = nameSession;
}

const phoneSession = sessionStorage.getItem("phone");
if (phoneSession) {
  document.getElementById("phone").value = phoneSession;
}
