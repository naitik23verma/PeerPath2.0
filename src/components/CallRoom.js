import React, { useEffect, useRef, useState } from 'react';
import io from 'socket.io-client';
import Peer from 'simple-peer';
import { useParams } from 'react-router-dom';

const socket = io('http://localhost:5000'); // Adjust if your backend runs elsewhere

function CallRoom({ user }) {
  const { roomId } = useParams();
  const [stream, setStream] = useState();
  const [remoteStream, setRemoteStream] = useState();
  const [peer, setPeer] = useState();
  const myVideo = useRef();
  const remoteVideo = useRef();

  useEffect(() => {
    let currentPeer = null;
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(currentStream => {
      setStream(currentStream);
      if (myVideo.current) {
        myVideo.current.srcObject = currentStream;
      }

      socket.emit('join-call-room', roomId);

      socket.on('user-joined', (userId) => {
        // Initiator
        const newPeer = new Peer({
          initiator: true,
          trickle: false,
          stream: currentStream
        });

        newPeer.on('signal', signal => {
          socket.emit('signal', { roomId, signal, to: userId });
        });

        newPeer.on('stream', remoteStream => {
          setRemoteStream(remoteStream);
          if (remoteVideo.current) {
            remoteVideo.current.srcObject = remoteStream;
          }
        });

        socket.on('signal', ({ signal }) => {
          newPeer.signal(signal);
        });

        setPeer(newPeer);
        currentPeer = newPeer;
      });

      socket.on('signal', ({ signal, from }) => {
        // Receiver
        if (!currentPeer) {
          const newPeer = new Peer({
            initiator: false,
            trickle: false,
            stream: currentStream
          });

          newPeer.on('signal', signal => {
            socket.emit('signal', { roomId, signal, to: from });
          });

          newPeer.on('stream', remoteStream => {
            setRemoteStream(remoteStream);
            if (remoteVideo.current) {
              remoteVideo.current.srcObject = remoteStream;
            }
          });

          newPeer.signal(signal);
          setPeer(newPeer);
          currentPeer = newPeer;
        } else {
          currentPeer.signal(signal);
        }
      });
    });

    return () => {
      socket.off('user-joined');
      socket.off('signal');
      if (peer) peer.destroy();
    };
    // eslint-disable-next-line
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: 'white' }}>
      <h2>Video Call Room: {roomId}</h2>
      <div style={{ display: 'flex', gap: 20 }}>
        <video ref={myVideo} autoPlay muted style={{ width: 300, background: '#222' }} />
        <video ref={remoteVideo} autoPlay style={{ width: 300, background: '#222' }} />
      </div>
    </div>
  );
}

export default CallRoom; 