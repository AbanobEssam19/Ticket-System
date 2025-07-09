const mongoose = require("mongoose");

console.log("MONGO_URI:", process.env.MONGO_URI);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("db connected");
  })
  .catch(() => {
    console.log("faild to connect");
  });

module.exports = mongoose;
