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

verify();

const html5QrCode = new Html5Qrcode("reader");
let isScanning = false;

async function onScanSuccess(decodedText, decodedResult) {
  if (isScanning) {
    isScanning = false;
    html5QrCode.stop().then(() => {
      document.getElementById("reader").style.display = "none";
      document.getElementById("link").href = decodedText;
      document.getElementById("link").innerText = 'عرض التذكرة';
      document.getElementById("ticketFrame").src = decodedText;

      const id = decodedText.split("/")[4];
      fetch("/api/scan/" + id)
        .then((res) => res.json())
        .then((data) => {
          document.getElementById("result").innerText = data.previousScanned
            ? "تم مسح التذكرة مسبقًا"
            : "تم مسح التذكرة بنجاح";
          document.getElementById("result").style.color = data.previousScanned
            ? "#F44336"
            : "#4CAF50";
        })

        .catch((err) => {
          document.getElementById("result").innerText = "حدث خطأ أثناء المسح";
        });
    });
  }
}

document.getElementById("startScan").addEventListener("click", () => {
  Html5Qrcode.getCameras().then((devices) => {
    if (devices && devices.length) {
      const backCamera = devices.find(device =>
        device.label.toLowerCase().includes('back') ||
        device.label.toLowerCase().includes('environment')
      );

      const cameraId = backCamera ? backCamera.id : devices[0].id;

      isScanning = true;
      document.getElementById("reader").style.display = "block";
      html5QrCode.start(
        cameraId,
        { fps: 10, qrbox: 250 },
        onScanSuccess,
        () => { }
      );
    }
  });
});

