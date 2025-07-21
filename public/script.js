verify();
document
  .getElementById("ticketForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const loadingOverlay = document.getElementById("loadingOverlay");
loadingOverlay.style.display = "flex"; // Show before fetch

    const form = event.target;

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
    const seatPosition = seatSession.split("-")[2];

    const image = document.getElementById("imageUpload").files[0];
    const options = {
    maxSizeMB: 1,
    maxWidthOrHeight: 1024,
    useWebWorker: true
    };
    let compressedImage = image;

    if(image != null) {
      compressedImage = await imageCompression(image, options);
    }


    const formData = new FormData();
    formData.append("name", userName);
    formData.append("phone", phone);
    formData.append("row", row);
    formData.append("seatNum", seatNum);
    formData.append("seatPosition", seatPosition);
    formData.append("domain", window.location.origin);
    formData.append("image", compressedImage); 

    const res = await fetch("/ticket/add", {
      method: "POST",
      body: formData, 
    });

    const result = await res.json();

    loadingOverlay.style.display = "none"; // Hide after fetch completes or fails

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
  const position = seatSession.split("-")[2];
  document.getElementById("seatNumber").textContent = `${row}${number}-${position == "up" ? "U" : "D"}`;
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

document.getElementById('imageUpload').addEventListener('change', function () {
  const fileNameSpan = document.getElementById('fileName');
  fileNameSpan.textContent = this.files.length ? this.files[0].name : 'لم يُحدَّد ملف بعد';
});