const { Message } = require("../models/message")

function generateAndStoreMessage(username, text, room) {
    const message = new Message({
        room,
        username,
        text,
        createdAt: new Date()
    })

    message.save()
        .then()
        .catch(err => console.log(err))
    return generateMessage(username, text)
}


function generateMessage(username, text) {
    return {
        username,
        text,
        class: 'byOther',
        createdAt: new Date().getTime()
    }
}

function generateAndStoreLocationMessage(username, location, room) {
    const message = new Message({
        room,
        username,
        location,
        createdAt: new Date()
    });

    message.save()
        .then()
        .catch(err => console.log(err))

    return {
        username,
        location,
        class: 'byOther',
        createdAt: new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateAndStoreMessage,
    generateAndStoreLocationMessage
}