import Signal from "./signal";

const MESSAGE_TYPE = {
  VIDEO_OFFER: "vide-offer",
  VIDEO_ANSWER: "video-answer",
  CANDIDATE: "new-ice-candidate"
}

class PeerRtc {
    constructor(params) {
      this.signal = new Signal({
        domain: params.domain,
      });
      this.pc = null
      this.myUserName = params.myUserName
      this.targetUserName = params.targetUserName

      this.localView = null
      this.remoteView = new Map()

      this.localStream = null
      this.removeStream = new Map()

      this.mediaConstraints = {
        audio: true,
        video: true,
      }

      this.signal.on('message', this.handleMessage.bind(this))
    }

    createPeerConnection() {
      this.pc = new RTCPeerConnection({
        iceServers: [{
          urls: "stun:stun.l.google.com:19302" // TODO ICE Server ?
        }]
      })

      this.pc.onicecandidate = this.handleIceCandidate.bind(this)
      this.pc.ontrack = this.handleTrack.bind(this)
      this.pc.onremovetrack = this.handleRemoveTrack.bind(this)
      this.pc.onnegotiationneeded = this.handleNegotiationNeeded.bind(this)
      this.pc.oniceconnectionstatechange = this.handleIceConnectionStateChange.bind(this)
      this.pc.onicegatheringstatechange = this.handleIceGatheringStateChange.bind(this)
      this.pc.onsignalingstatechange = this.handleSignalingStateChange.bind(this)
    }

    handleMessage(msg) {
      switch(msg.type) {
        case MESSAGE_TYPE.VIDEO_OFFER:
          this.handleVideoOffer(msg)
          break;
        case MESSAGE_TYPE.VIDEO_ANSWER:
          break
        case MESSAGE_TYPE.CANDIDATE:
          this.handleNewIceCandidate(msg)
          break
      }
    }

    async handleVideoOffer(msg) {
      try {
        this.targetUserName = msg.name
        this.createPeerConnection()

        const desc = new RTCSessionDescription(msg.sdp)

        await this.pc.setRemoteDescription(desc)
        this.localStream = await navigator.mediaDevices.getUserMedia(ths.mediaConstraints)
        thihs.localView.srcObject = this.localStream
        this.localStream.getTracks().forEach(track => this.pc.addTrack(track, this.localStream))
        const answer =  await this.pc.createAnswer()
        await this.pc.setLocalDescription(answer)
        this.sendToServer({
          name: this.myUserName,
          target: this.targetUserName,
          type: MESSAGE_TYPE.VIDEO_ANSWER,
          sdp: this.pc.localDescription
        })
      } catch (error) {
        console.error('handleVideoOffer error: ', error)
        throw error
      }
    }

    async handleNewIceCandidate(msg) {
      try {
        const candidate = new RTCIceCandidate(msg.candidate)
        await this.pc.addIceCandidate(candidate)
      } catch (error) {
        console.error('handleNewIceCandidate error: ', error)
        throw error
      }
    }

    handleIceCandidate(event) {
      if (event.candidate) {
        this.sendToServer({
          type: MESSAGE_TYPE.CANDIDATE,
          candidate: event.candidate,
          target: this.targetUserName
        })
      }
    }

    handleTrack(event) {
      const stream = event.stream
      this.localView.srcObject = stream
    }

    handleRemoveTrack(event) {

    }

    handleIceGatheringStateChange(event) {
      console.log('handleIceGatheringStateChange: ', event)
    }

    handleSignalingStateChange(event) {
      console.log('handleSignalingStateChange: ', event)
    }

    handleIceConnectionStateChange(event) {
      switch(this.pc.iceConnectionState) {
        case 'closed':
        case 'failed':
        case 'disconnected':
          this.close()
          break;
      }
    }

    async handleNegotiationNeeded() {
      try {
        const offer = await this.pc.createOffer()
        await this.pc.setLocalDescription(offer)
        this.sendToServer({
          name: this.myUserName,
          target: this.targetUserName,
          type: MESSAGE_TYPE.VIDEO_OFFER,
          sdp: this.pc.localDescription
        })
      } catch (error) {
        console.error('handleNegotiationNeeded error: ', error)
        throw error
      }
    }

    sendToServer(params) {
      const message = JSON.stringify(params)
      return this.signal.send(message)
    }

    close() {}
}

export default PeerRtc
