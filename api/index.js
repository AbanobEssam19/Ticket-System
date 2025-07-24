const express = require('express');
const path = require('path');
const bcrypt = require('bcrypt');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}
const connectDB = require('../mongodb');
require('../qr');
const tickets = require('../models/ticket');
const users = require('../models/user');
const { QRCODE } = require('../qr');
const jwt = require('jsonwebtoken');

const cloudinary = require("cloudinary").v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const multer = require('multer');

// Store uploaded file in memory buffer
const storage = multer.memoryStorage();
const upload = multer({ storage, limits: { fileSize: 1 * 1024 * 1024 } });

const app = express();
app.use(express.json());

app.use(express.static(path.join(__dirname, '../public')));

app.use(async (req, res, next) => {
  try {
    await connectDB(); // Only connects once per instance
    next();
  } catch (err) {
    console.error('DB connection error:', err.message);
    res.status(500).send('Database connection failed');
  }
});

const streamifier = require("streamifier");
const { number } = require('joi');

async function uploadToCloudinary(buffer) {
  return await new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ticket-images" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}



app.post('/ticket/add', upload.single('image'), async (req, res) => {
  try {
    const { name, phone, row, seatNum, seatPosition, domain, token } = req.body;

    let user = "";
    let id;

    await jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
      if (err) {
        return res.status(400).json({ messege: 'Invalid token' });
      }
      user = decoded.name;
      id = decoded._id;
    });



    // Upload image buffer to Cloudinary if image was provided
    let imageUrl = null;
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer); // ✅ now you wait

    }
    let ticket = new tickets({ name, phone, seat: { row, number: seatNum, seatPosition: seatPosition }, image: imageUrl, createdBy: user });
    ticket = await ticket.save();
    await users.findOneAndUpdate({ _id: id }, { $inc: { numberOfTickets: 1 } });
    const link = `${domain}/ticket/${ticket._id}`;
    const qr = await QRCODE(link);
    return res.status(200).json({ ticket: ticket, qr: qr, link: link });
  }
  catch (err) {
    if (err.code === 11000) {
      return res.status(400).json({ message: 'Seat is already taken' });
    }
    console.error(err);
    return res.status(500).json({ message: 'Server error' });
  }

});

app.get('/api/ticket/:id', async (req, res) => {
  const ticket = await tickets.findById(req.params.id).populate();
  return res.status(200).json({ ticket: ticket });
});

app.get('/api/tickets', async (req, res) => {
  const ticket = await tickets.find({}).populate();
  return res.status(200).json({ tickets: ticket });
});

app.get('/api/users', async (req, res) => {
  const user = await users.find({});
  return res.status(200).json({ users: user });
});

app.get('/ticket/:id', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/ticket.html'));
});

app.get('/tickets', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/tickets.html'));
});

app.delete('/api/ticket/delete/:id', async (req, res) => {
  const ticket = await tickets.findById(req.params.id);
  await users.findOneAndUpdate({ name: ticket.createdBy }, { $inc: { numberOfTickets: -1 } });
  await tickets.findByIdAndDelete(req.params.id);
  return res.status(200).json({ messege: 'deleted successfully' });
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/login.html'));
});

app.post('/users/add', async (req, res) => {
  const { name, password } = req.body;
  let user = new users({ name, password });
  const salt = await bcrypt.genSalt(10);
  user.password = await bcrypt.hash(user.password, salt);
  user = await user.save();
  return res.status(200).json({ user: user });
});

app.post('/users/login', async (req, res) => {
  const { name, password } = req.body;
  const user = await users.findOne({ name });
  if (!user) {
    return res.status(400).json({ messege: 'Invalid credentials' });
  }
  const validPassword = await bcrypt.compare(password, user.password);
  if (validPassword) {
    const token = user.generateAuthToken();
    return res.status(200).json({ token: token });
  } else {
    return res.status(400).json({ messege: 'Invalid credentials' });
  }
});

app.post('/api/verify', (req, res) => {
  const { token } = req.body;
  jwt.verify(token, process.env.JWT_PRIVATE_KEY, (err, decoded) => {
    if (err) {
      return res.status(400).json({ messege: 'Invalid token' });
    }
    return res.status(200).json({ messege: 'Valid token' });
  });
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/qrScanner.html'));
});

app.get('/api/scan/:id', async (req, res) => {
  const id = req.params.id;
  const ticket = await tickets.findById(id);
  const previousScanned = ticket.isScanned;
  ticket.isScanned = true;
  await tickets.findByIdAndUpdate(id, ticket);
  return res.status(200).json({ ticket: ticket, previousScanned: previousScanned });
});

app.get('/seat', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/seatBooking.html'));
});

app.get('/api/selectedSeats', async (req, res) => {
  const allTickets = await tickets.find({}, 'seat');
  const seatInfos = allTickets.map(ticket => ticket.seat);
  return res.status(200).json({ selectedSeats: seatInfos });
});

app.get('/report', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/report.html'));
});

module.exports = app;
