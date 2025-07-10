const mongoose = require('mongoose');
const Joi = require('joi');

const seatInfo = mongoose.Schema({
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
})

const Tickets = mongoose.model('Tickets', {
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
    }
})

// function handleTicketValidation(ticket) {
//     const schema = Joi.object({
//         name: Joi.string().min(3).max(120).required(),
//         phone:Joi.string().min(11).max(11).required(),
//         seatNum: Joi.string().min(2).max(20).required(),
//     });
//     return schema.validate(ticket, { abortEarly: false });
// }

module.exports = Tickets