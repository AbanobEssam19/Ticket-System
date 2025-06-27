const express = require('express');
 
const app = express();

const path = require('path');

app.use(express.json()); 

app.use(express.static('public'));

require("dotenv").config();

require("./mongodb");

const tickets = require("./models/ticket");
 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.post('/ticket/add', async (req, res) => {
  const {name, phone, seatNum} = req.body;
  let ticket = new tickets({name, phone, seatNum});
  ticket = await ticket.save();
  console.log(ticket);
  return res.status(200).json({ticket: ticket});
})
 
app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});