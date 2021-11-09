// Import socket
const socket = io('/')

// Global State
let myVideoStream = null
const peer = new Peer(undefined, {
  path: '/peerjs',
  host: '/',
  port: '443'
})

// Elements
const grid = document.querySelector('#video-grid')
const myVideo = document.createElement('video')
const messages = document.querySelector('.messages')
const message = document.querySelector('#chat_message')
myVideo.muted = true

document.body.addEventListener('keypress', e => {
  if (e.which === 13 && message.value.trim() !== '') {
    socket.emit('message', message.value)
    message.value = ''
  }
})

// Get the access to the camera
navigator.mediaDevices.getUserMedia({
  video: true,
  audio: true
}).then(stream => {
  myVideoStream = stream
  addVideoStream( myVideo, stream )

  // Answer the call
  peer.on('call', call => {
    call.answer(stream)
    const video = document.createElement('video')
    call.on('stream', userVideoStream => {
      addVideoStream(video, userVideoStream)
    })
  })

  // Nos intentamos conectar un nuevo usuario
  socket.on('user-connected', (userID) => {
    connectToNewUser(userID, stream)
  })
})

// Join the room, roomID comes from ejs
peer.on('open', id => {
  socket.emit('join-room', roomID, id);
})

socket.on('createMessage', message => {
  const newMessage = document.createElement('li')
  newMessage.innerText = message
  messages.appendChild( newMessage )
  scrollToBottom()
})

/**
 * Show de video in html
 * @param {*} video HTML Element that contains the video
 * @param {*} stream the stream of the video
 */
const addVideoStream = (video, stream) => {
  video.srcObject = stream
  video.addEventListener('loadedmetadata', () => {
    video.play()
  })
  grid.appendChild(video)
}

const connectToNewUser = (userID, stream) => {
  const call = peer.call(userID, stream)
  const video = document.createElement('video')
  call.on('stream', userVideoStream => {
    addVideoStream(video, userVideoStream)
  })
}

const scrollToBottom = () => {
  const d = document.querySelector('.main__chat_window')
  d.scrollTop()
}

/**
 * Mute our video
 */
const muteUnmute = () => {
  const enabled = myVideoStream.getAudioTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getAudioTracks()[0].enabled = false;
    setUnmuteButton();
  } else {
    setMuteButton();
    myVideoStream.getAudioTracks()[0].enabled = true;
  }
}

const playStop = () => {
  let enabled = myVideoStream.getVideoTracks()[0].enabled;
  if (enabled) {
    myVideoStream.getVideoTracks()[0].enabled = false;
    setPlayVideo()
  } else {
    setStopVideo()
    myVideoStream.getVideoTracks()[0].enabled = true;
  }
}

const setMuteButton = () => {
  const html = `
    <i class="fas fa-microphone"></i>
    <span>Mute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setUnmuteButton = () => {
  const html = `
    <i class="unmute fas fa-microphone-slash"></i>
    <span>Unmute</span>
  `
  document.querySelector('.main__mute_button').innerHTML = html;
}

const setStopVideo = () => {
  const html = `
    <i class="fas fa-video"></i>
    <span>Stop Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}

const setPlayVideo = () => {
  const html = `
  <i class="stop fas fa-video-slash"></i>
    <span>Play Video</span>
  `
  document.querySelector('.main__video_button').innerHTML = html;
}