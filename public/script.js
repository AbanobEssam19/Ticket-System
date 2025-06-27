document
  .getElementById("ticketForm")
  .addEventListener("submit", async (event) => {
    event.preventDefault();

    const form = event.target;
    const formData = new FormData(form);

    let userName = formData.get("userName");
    let phone = formData.get("phone");
    let seatNo = formData.get("seatNo");
    console.log(`User ${userName} ${phone} ${seatNo}`);

    const res = await fetch("/ticket/add", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: userName, phone: phone, seatNum: seatNo }),
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
          <h3>Ticket Created!</h3>
          <p><strong>ID:</strong> ${result.ticket._id}</p>
          <p><strong>View Ticket:</strong> <a href="${result.link}" target="_blank">${result.link}</a></p>
          <img src="${qrData}" alt="QR Code" style="width:200px;"/>
          <p><em>QR Code was automatically downloaded.</em></p>
        `;
    } else {
      alert("Failed to create ticket.");
    }
  });
