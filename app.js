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
  const {name, phone, seatNum} = req.body;
  let ticket = new tickets({name, phone, seatNum});
  ticket = await ticket.save();
  console.log(ticket);
  const link = `http://localhost:3000/ticket/${ticket._id}`;
  const qr = await QRCODE(link);
  return res.status(200).json({ticket: ticket, qr: qr, link: link});
})

app.get('/api/ticket/:id', async (req, res) => {
  console.log('API /api/ticket/:id called', req.params.id);
  const ticket = await tickets.findById(req.params.id);
  return res.status(200).json({ticket: ticket});
})

app.get('/ticket/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','ticket.html'));
});
 
app.listen(3000, () => {
  console.log('Example app listening on port 3000!');
});

