import { io } from 'socket.io-client'
import EventEmitter from 'eventemitter3'

class Signal extends EventEmitter {
  constructor(params) {
    this.socket = io(params.domain)

    this.socket.on("connect", () => {
      console.log("connected", this.socket.id)
    })
    this.socket.on("disconnect", () => {
      console.log("disconnect", this.socket.id)
    })
    this.socket.on("message", (data) => {
      try {
        data = JSON.parse(data)
      } catch (error) {
        data = data
      }
      this.emit("message", data)
    })

    this.socket.connect()
  }

  send(data) {
    return this.socket.emit("message", data)
  }

  destroy() {
    this.socket.disconnect()
  }
}

export default Signal

