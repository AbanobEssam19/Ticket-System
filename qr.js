const qr = require("qrcode");

const QRCODE = async (data) => {
  try {
    const qrDataURL = await qr.toDataURL(data, {
      color: {
        dark: "#000",
        light: "#fff",
      },
    });
    return qrDataURL;
  } catch (err) {
    console.error("QR generation error:", err);
    return null;
  }
};

module.exports = {QRCODE}