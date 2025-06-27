const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("db connected");
  })
  .catch(() => {
    console.log("faild to connect");
  });

module.exports = mongoose;
