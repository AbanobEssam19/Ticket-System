const mongoose = require('mongoose');
const Joi = require('joi');

const Tickets = mongoose.model('Tickets', {
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    seatNum: {
        type: String,
        required: true
    },
    isScanned: {
        type: Boolean,
        default: false
    },
    seatPosition: {
        type: String,
        required: true
    }
})

function handleTicketValidation(ticket) {
    const schema = Joi.object({
        name: Joi.string().min(3).max(120).required(),
        phone:Joi.string().min(11).max(11).required(),
        seatNum: Joi.string().min(2).max(20).required(),
    });
    return schema.validate(ticket, { abortEarly: false });
}

module.exports = Tickets
module.exports.handleTicketValidation = handleTicketValidation