const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    room: {
        type: String,
        required: true
    },
    text: {
        type: String,
        trim: true
    },
    location: {
        type: String,
        trim: true
    },
    username: {
        type: String
    },
    createdAt: {
        type: Date
    }
})

// const locationMessageSchema = new mongoose.Schema({
//     room: {
//         type: String,
//         required: true
//     },
//     location: {
//         type: String,
//         required: true,
//         trim: true
//     },
//     username: {
//         type: String
//     },
//     createdAt: {
//         type: Date
//     }
// })

const Message = mongoose.model('Message', messageSchema)
// const LocationMessage = mongoose.model('LocationMessage', locationMessageSchema)

module.exports = { Message }