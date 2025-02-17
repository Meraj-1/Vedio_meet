import React, { useState, useRef, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import io from "socket.io-client";
import styles from "../styles/VideoComponent.module.css";
import server from "../envioment";

const VideoMeet = () => {
  const server_url = "http://localhost:8000";
  const connections = {};
  const peerConfigConnection = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  var socketRef = useRef();
  let socketIdRef = useRef();

  let localVideoRef = useRef();
  let videoRef = useRef([]);

  let [videoAvailable, setVideoAvailable] = useState(true);
  let [audioAvailable, setAudioAvailable] = useState(true);
  let [video, setVideo] = useState([]);
  let [audio, setAudio] = useState();
  let [screen, setScreen] = useState();
  let [showModal, setModal] = useState(true);
  let [screenAvailable, setScreenAvailable] = useState();
  let [messages, setMessages] = useState([]);
  let [message, setMessage] = useState("");
  let [newMessages, setNewMessages] = useState(3);
  let [askForUsername, setAskForUsername] = useState(true);
  let [username, setUsername] = useState("");
  let [videos, setVideos] = useState([]);

  // Function to get media permissions
  
  const getPermissions = async () => {
    try {
      const videoPermission = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      if (videoPermission) {
        setVideoAvailable(true);
        console.log("Video permission granted");
      } else {
        setVideoAvailable(false);
        console.log("Video permission denied");
      }
    } catch (error) {
      setVideoAvailable(false);
      console.log("Video permission error:", error);
    }
  
    try {
      const audioPermission = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });
      if (audioPermission) {
        setAudioAvailable(true);
        console.log("Audio permission granted");
      } else {
        setAudioAvailable(false);
        console.log("Audio permission denied");
      }
    } catch (error) {
      setAudioAvailable(false);
      console.log("Audio permission error:", error);
    }
  
    if (navigator.mediaDevices.getDisplayMedia) {
      setScreenAvailable(true);
    } else {
      setScreenAvailable(false);
    }
  
    try {
      if (videoAvailable || audioAvailable) {
        const userMediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoAvailable,
          audio: audioAvailable,
        });
        if (userMediaStream) {
          window.localStream = userMediaStream;
          if (localVideoRef.current) {
            localVideoRef.current.srcObject = userMediaStream;
          }
        }
      }
    } catch (error) {
      console.log("Error accessing media:", error);
    }
  };
  

  useEffect(() => {
    getPermissions();
  }, []);


  let getUserMediaSuccess = (stream) => {
    try {
      window.localStream.getTracks().forEach((track) => track.stop());
    } catch (error) {
      console.log(error);
    }
  
    // Assign the new stream to global and video reference
    window.localStream = stream;
    localVideoRef.current.srcObject = stream;
  
    // Loop through connections and add the stream
    for (let id in connections) {
      if (id === socketIdRef.current) continue;
  
      connections[id].addStream(window.localStream);
      connections[id]
        .createOffer()
        .then((description) => {
          connections[id]
            .setLocalDescription(description)
            .then(() => {
              socketIdRef.current.emit(
                "signal",
                id,
                JSON.stringify({ sdp: connections[id].localDescription })
              );
            })
            .catch((e) => console.log(e));
        });
    }
  
    // Handle when media stream tracks end
    stream.getTracks().forEach(
      (track.onended = () => {
        setVideo(false);
        setAudio(false);
  
        try {
          let tracks = localVideoRef.current.srcObject.getTracks();
          tracks.forEach((track) => track.stop());
        } catch (error) {
          console.log(error); }

          let blackSilence = (...args) => new MediaStream([black(...args), silence]);
          window.localStream = blackSilence();
          localVideoRef.current.srcObject = window.localStream;
  
          for (let id in connections) {
            connections[id].addStream(window.localStream);
            connections[id]
              .createOffer()
              .then((description) => {
                connections[id]
                  .setLocalDescription(description)
                  .then(() => {
                    socketIdRef.current.emit(
                      "signal",
                      id,
                      JSON.stringify({ sdp: connections[id].localDescription })
                    );
                  })
                  .catch((error) => console.log(error));
              });
          }
        }
      )
    );
  };


  let silence = () => {
    let ctx = new AudioContext();
    let oscillator = ctx.createOscillator();

    let dst = oscillator.connect(ctx.createMediaStreamDestination())
    oscillator.start();
    ctx.resume()
    return Object.assign(dst.stream.getAudioTracks()[0], {enable: false})
  }

  let black = ({width = 640, height = 480}= {}) => {
     let canvas = Object.assign(document.createElement('canvas'), {width, height});

     canvas.getContext('2d').fillRect(0, 0, width, height);
     let stream = canvas.captureStream();
     return Object.assign(stream.getVideoTracks()[0], {enable: false})
  }
  
  let getUserMedia = () => {
    if((video && videoAvailable ) || (audio && audioAvailable)) {
        navigator.mediaDevices.getUserMedia({video: video, audio: audio})
        .then((getUserMediaSuccess))
        .then((stream) => {})
        .catch((error)=> console.log(error))
    } else {
        try {
            let tracks = localVideoRef.current.srcObject.getTracks();
            tracks.forEach(track => track.stop());
        } catch (error) {
            
        }
    }
  }


  useEffect(() => {
    if (video !== undefined && audio !== undefined) {
      getUserMedia();
    }
  }, [audio, video]);


  const addMessage = (data, sender, socketIdSender) => {
    setMessages((prevMessages) => [
        ...prevMessages,
        { sender: sender, data: data }
    ]);
    if (socketIdSender !== socketIdRef.current) {
        setNewMessages((prevNewMessages) => prevNewMessages + 1);
    }
};


  let connectToSocketServer = () => {
    socketRef.current = io.connect(server_url, {secure: false});
    
    socketRef.current.on('signal', gotMessageFromServer);

    socketRef.current.on("connect", () => {
        socketRef.current.emit("join-call", window.location.href);
        socketIdRef.current = socketRef.current.id;
        socketRef.current.on("chat-message", addMessage);
        socketRef.current.on("user-left", (id) => {
            setVideo((video) => video.filter((video) => video.socketId !== id));
        })


        socketRef.current.on("user-joined", (id, clients) => {
            clients.forEach((socketListId) =>{
             connections[socketListId] = new RTCPeerConnection(peerConfigConnection)
             
             connections[socketListId].onicecandidate = (event) => {
                 if (event.candidate !== null) {
                     socketRef.current.emit("signal", socketListId, JSON.stringify({'ice': event.candidate}))
                 }
             }


             connections[socketListId].onaddStream = (event) => {
                let videoExists = videoRef.current.find(video => video.socketId === videoListId);

                if(videoExists){
                    setVideo(vedio => {
                        const upadateVideos = videos.mao(video => 
                            video.socketId === videoListId? {... vedio, stream: event.stream} : vedio
                        );
                        video.Ref.current = upadateVideos;
                        return upadateVideos;
                    })
                }else {
                    let newVideo = {
                        socketId: videoListId,
                        stream: event.stream,
                        autoPlay: true,
                        playsinline: true
                    }
                    setVideos(video => {
                        const upadateVideos = [...video, newVideo]
                        videoRef.current = upadateVideos;
                        return upadateVideos;
                    });
                }
             };

             if(window.localStream !== undefined && window.localStream !== null) {
              connections[socketListId].addStream(window.localStream);
             }else {
              
              let blackSilence = (...args) => new MediaStream([black(...args), silence]);
              window.localStream = blackSilence();
              connections[socketListId].addStream(window.localStream);
             }

            })

            if(id === socketIdRef.current) {
              for(let id2 in connections) {
                if(id2 === socketIdRef.current) continue;
                
                try {
                  connections[id2].addStream(window.localStream);
                } catch (error) {   }
               
                connections[id2].createOffer().then((description) => {
                  connections[id2].setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit('signal', id2, JSON.stringify({"sdp": connections[id2].localDescription}))
                  })
                  .catch((err) => console.log(err)
                  )
                })
              }
            }
        })
     })
 
  }


let gotMessageFromServer = (fromId, message) => {
  let signal = JSON.parse(message);

  if (fromId !== socketIdRef.current) {
    if (signal.sdp) {
      connections[fromId]
        .setRemoteDescription(new RTCSessionDescription(signal.sdp))
        .then(() => {
          if (signal.sdp.type === "offer") {
            connections[fromId]
              .createAnswer()
              .then((description) => {
                connections[fromId]
                  .setLocalDescription(description)
                  .then(() => {
                    socketRef.current.emit(
                      "signal",
                      fromId,
                      JSON.stringify({ sdp: connections[fromId].localDescription })
                    );
                  })
                  .catch((e) => console.log("Error setting local description:", e));
              })
              .catch((e) => console.log("Error creating answer:", e));
          }
        })
        .catch((e) => console.log("Error setting remote description:", e));
    }
  }

  if (signal.ice) {
    connections[fromId]
      .addIceCandidate(new RTCIceCandidate(signal.ice))
      .catch((e) => console.log("Error adding ICE candidate:", e));
  }
};

  

  const getMedia = () => {
    setVideo(videoAvailable);
    setAudio(audioAvailable);
    connectToSocketServer();
  };

  
  
  let connect = () => {
    setAskForUsername(false);
    getMedia();
}

  return (
    <div>
      {askForUsername ? (
        <div>
          <h2>Enter Into Lobby</h2>
          <TextField
            id="outlined-basic"
            label="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            variant="outlined"
          />
          <Button variant="contained" onClick={connect}>
            Connect
          </Button>
          <div>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              style={{ width: "400px", border: "2px solid black" }}
            ></video>
          </div>
        </div>
      ) : (
        <>
        <video>ref={localVideoRef}</video></>
      )}
    </div>
  );
};

export default VideoMeet;
