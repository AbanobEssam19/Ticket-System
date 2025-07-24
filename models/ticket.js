const mongoose = require('mongoose');

// Seat sub-schema
const seatInfo = new mongoose.Schema({
  row: {
    type: String,
    required: true
  },
  number: {
    type: Number,
    required: true
  },
  seatPosition: {
    type: String,
    default: 'down',
    required: true
  }
}, { _id: false }); // Important: avoid nested _id

// Main ticket schema
const ticketSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  seat: {
    type: seatInfo,
    required: true
  },
  image: {
    type: String,
    default: null
  },
  isScanned: {
    type: Boolean,
    default: false
  },
  createdBy: {
    type: String
  },
});

ticketSchema.index({
  'seat.row': 1,
  'seat.number': 1,
  'seat.seatPosition': 1
}, { unique: true });

const Tickets = mongoose.model('Tickets', ticketSchema);

module.exports = Tickets;