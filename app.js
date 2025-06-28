const express = require('express');

const app = express();

const path = require('path');

app.use(express.json()); 

app.use(express.static('public'));

require("dotenv").config();

require("./mongodb");

require("./qr")

const tickets = require("./models/ticket");
const { QRCODE } = require('./qr');
 
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','index.html'));
});

app.post('/ticket/add', async (req, res) => {
  const {name, phone, seatNum, domain} = req.body;
  let ticket = new tickets({name, phone, seatNum});
  ticket = await ticket.save();
  console.log(ticket);
  const link = `${domain}/ticket/${ticket._id}`;
  const qr = await QRCODE(link);
  return res.status(200).json({ticket: ticket, qr: qr, link: link});
})

app.get('/api/ticket/:id', async (req, res) => {
  const ticket = await tickets.findById(req.params.id);
  return res.status(200).json({ticket: ticket});
})

app.get('/api/tickets', async (req, res) => {
  const ticket = await tickets.find({});
  return res.status(200).json({tickets: ticket});
})

app.get('/ticket/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','ticket.html'));
});

app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','tickets.html'));
});
 
app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

