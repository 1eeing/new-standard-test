const { Server } = require('socket.io')

function start(port, cb) {
  const io = new Server(port)

  io.on('connection', (socket) => {
    console.log('a user connected')

    socket.on('message', (message) => {
      console.log('server recive message', message)

      socket.emit('message', message)
    })
  })

  cb()
}

const port = 3000

start(port, () => {
  console.log(`server start on port ${port} ……`)
})
