const socket = io()

const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormBtn = messageForm.querySelector('button')
const locationBtn = document.querySelector('#send-location')
const messages = document.querySelector('#messages')

const messageTemplate = document.querySelector('#message-template').innerHTML;
const locationTemplate = document.querySelector('#location-message-template').innerHTML;
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML;

const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

function autoScroll() {
    messages.scrollTop = messages.scrollHeight
}

socket.on('renderData', (messagesArr) => {
    let html = '';
    messagesArr.forEach(message => {
        if (message.username === username) {
            message.class = 'byMe'
        } else {
            message.class = 'byOther'
        }
        if (message.text) {
            html += Mustache.render(messageTemplate, {
                username: message.username,
                message: message.text,
                class: message.class,
                createdAt: moment(message.createdAt).format('h:mm a')
            })
        } else {
            html += Mustache.render(locationTemplate, {
                username: message.username,
                url: message.location,
                class: message.class,
                createdAt: moment(message.createdAt).format('h:mm a')
            })
        }
    })
    messages.insertAdjacentHTML('beforeend', html)
})

socket.on('message', message => {
    const regex = /((http|https):\/\/)?[\w+]+\.[\w+]{2,5}(\/)?/;
    if (message.text.match(regex)) {
        const url = message.text.match(regex)[0]
        const urlIndex = message.text.match(regex).index
        const urlEndIndex = url.length + urlIndex + 1

        message.text = message.text.split('')
        message.text.splice(urlIndex, 0, `<a href=${url}>`)
        message.text.splice(urlEndIndex, 0, '</a>')
        message.text = message.text.join('')
    }

    if (username === message.username) {
        message.class = 'byMe'
    }

    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        class: message.class,
        createdAt: moment(message.createdAt).format('h:mm a')
    })

    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

socket.on('locationMessage', (message) => {
    if (username === message.username) {
        message.class = 'byMe'
    }
    const html = Mustache.render(locationTemplate, {
        username: message.username,
        url: message.location,
        class: message.class,
        createdAt: moment(message.createdAt).format('h:mm a')
    })
    messages.insertAdjacentHTML('beforeend', html)
    autoScroll()
})

messageForm.addEventListener('submit', (e) => {
    messageFormBtn.disabled = true

    const msg = e.target.elements.message.value;

    socket.emit('sendMessage', msg, (err) => {
        messageFormBtn.disabled = false;
        messageFormInput.value = '';
        messageFormInput.focus()
        if (err) {
            return console.log(err)
        }
    });

    e.preventDefault();
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector('#sidebar').innerHTML = html
})

locationBtn.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation is not supported by your browser')
    }

    navigator.geolocation.getCurrentPosition(position => {
        locationBtn.disabled = true
        const { latitude, longitude } = position.coords
        socket.emit('sendLocation', {
            latitude,
            longitude
        }, () => {
            locationBtn.disabled = false;
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})

if (location.href === `${location.origin}/chat.html`) {
    location.href = `/`
}