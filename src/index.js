const express = require('express');
const http = require('http');
const path = require('path');
const socketio = require('socket.io');
const Filter = require('bad-words');
require('../src/db/mongoose');
const { Message } = require('../src/models/message');
const { generateAndStoreMessage, generateMessage, generateAndStoreLocationMessage } = require('./utils/messages');
const { addUser, removeUser, getUser, getUsersinRoom } = require('../src/utils/users');

const app = express()
const server = http.createServer(app)
const io = socketio(server);

const port = process.env.PORT || 3000
const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

io.on('connection', (socket) => {
    socket.on('join', async ({ username, room }, cb) => {
        const { error, user } = addUser({
            id: socket.id,
            username,
            room
        })

        if (error) {
            return cb(error)
        }

        socket.join(user.room)


        const messages = await Message.find({ room: user.room })

        socket.emit('renderData', messages)
        socket.emit('message', generateMessage('Admin', `${username}, welcome to ${room} room`))

        socket.broadcast.to(user.room).emit('message', generateAndStoreMessage('Admin', `${user.username} has joined`, user.room))
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersinRoom(user.room)
        })

        cb()
    })

    socket.on('sendMessage', (msg, cb) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(msg)) {
            return cb('Profanity is not allowed')
        }
        io.to(user.room).emit('message', generateAndStoreMessage(user.username, msg, user.room))
        cb()
    })

    socket.on('sendLocation', ({ latitude, longitude }, cb) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('locationMessage', generateAndStoreLocationMessage(user.username, `https://www.google.com/maps/embed/v1/view?key=AIzaSyAR6Z35liIzHKXzx2IWBiMZuTOc2FYJXlM&center=${latitude},${longitude}&zoom=18`, user.room))
        cb()
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id)
        if (user) {
            socket.broadcast.to(user.room).emit('message', generateAndStoreMessage('Admin', `${user.username} has left!`, user.room))
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersinRoom(user.room)
            })
        }
    })
})

server.listen(port, () => console.log(`Server is up on ${port}`))