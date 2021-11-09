const express = require('express')
const app = express()
const server = require('http').Server(app)
const { v4: uuidv4 } = require('uuid')
const { ExpressPeerServer } = require('peer')
const io = require('socket.io')(server)

const peerServer = ExpressPeerServer(server, {
  debug: true
})

app.use('/peerjs', peerServer)
app.use(express.static('public'))

app.set('view engine', 'ejs')

app.get('/', (_, res) => {
  res.redirect(`/${uuidv4()}`)
})

app.get('/:room', (req, res) => {
  res.render('room', { roomID:  req.params.room})
})

io.on('connection', socket => {
  socket.on('join-room', (roomID, userID) => {
    socket.join(roomID)
    socket.to(roomID).emit('user-connected', userID)
    socket.on('message', message => {
      io.to(roomID).emit('createMessage', message)
    })
  })
})

server.listen(3030)