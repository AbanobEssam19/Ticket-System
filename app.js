const express = require('express');

const app = express();

const path = require('path');
const bcrypt = require('bcrypt');

app.use(express.json()); 

app.use(express.static('public'));

require("dotenv").config();

require("./mongodb");

require("./qr")

const tickets = require("./models/ticket");
const users = require("./models/user");
const { QRCODE } = require('./qr');
const jwt = require('jsonwebtoken');
const { boolean } = require('joi');
 
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

app.delete('/api/ticket/delete/:id', async (req, res) => {
  await tickets.findByIdAndDelete(req.params.id);
  return res.status(200).json({messege: "deleted successfully"});
})

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','login.html'));
})

app.post('/users/add', async (req, res) => {
  const { name, password } = req.body;
  let user = new users({ name, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user = await user.save();
  return res.status(200).json({user: user});
})

app.post('/users/login', async (req, res) => {
  const { name, password } = req.body;
  const user = await users.findOne({ name });
  if (!user) {
    return res.status(400).json({ messege: "Invalid credentials" });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    const token = user.generateAuthToken();
    return res.status(200).json({ token: token });
  }
  else {
    return res.status(400).json({ messege: "Invalid credentials" });
  }
});

app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(400).json({ messege: "Invalid token" });
    }
    return res.status(200).json({ messege: "Valid token" });
  })
})

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'public','qrScanner.html'));
});

app.get('/api/scan/:id', async (req, res) => {
  const id = req.params.id;
  const ticket = await tickets.findById(id);
  const previousScanned = ticket.isScanned;
  ticket.isScanned = true;
  await tickets.findByIdAndUpdate(id, ticket);
  return res.status(200).json({ ticket: ticket, previousScanned: previousScanned });
});
 
app.listen(3000, () => {
  console.log('Ticket System app listening on port 3000!');
});