const users = []

function addUser({ id, username, room }) {
    username = username.trim()
    room = room.trim()

    if (!username || !room) {
        return {
            error: 'Username and room are required!'
        }
    }

    const existingUser = users.find((user) => {
        return user.room.toLowerCase() === room.toLowerCase() && user.username.toLowerCase() === username.toLowerCase()
    })

    if (existingUser) {
        return {
            error: 'Username is in use!'
        }
    }

    const user = { id, username, room }
    users.push(user)
    return { user }
}

function removeUser(id) {
    const index = users.findIndex((user) => user.id === id)

    if (index !== -1) {
        return users.splice(index, 1)[0]
    }
}

function getUser(id) {
    return users.find((user) => user.id === id)
}

function getUsersinRoom(room) {
    return users.filter((user) => user.room.toLowerCase() === room.trim().toLowerCase())
}

module.exports = {
    addUser,
    removeUser,
    getUser,
    getUsersinRoom
}