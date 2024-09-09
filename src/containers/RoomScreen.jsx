"use client";

import { useSocket } from "@/context/socketProvider";
import React, { useCallback, useEffect, useState } from "react";
import ReactPlayer from "react-player";
import PeerService from "@/service/peer";
import { useRouter } from "next/navigation";

const RoomScreen = () => {
  const [remoteSocketId, setRemoteSocketId] = useState(null);
  const [myStream, setMyStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const socket = useSocket();
  const { push } = useRouter();

  const handleUserJoin = useCallback((data) => {
    if (data?.email && data?.socketId) {
      setRemoteSocketId(data?.socketId);
    }
  }, []);

  const handleOutGoingCall = useCallback(async () => {

    console.log( navigator)
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await PeerService.getOffer();
    socket.emit("outgoing:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [remoteSocketId, socket]);

  const handleIncomingCall = useCallback(
    async (data) => {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const { from, offer } = data;
      setRemoteSocketId(from);
      const answer = await PeerService.getAnswer(offer);
      console.log(answer, ": answer");
      socket.emit("call:accepted", { to: from, answer });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    if (myStream) {
      // Retrieve existing tracks from the peer connection
      const existingTracks = new Set(PeerService.peer.getSenders().map(sender => sender.track));
  
      // Add only new tracks
      for (const track of myStream.getTracks()) {
        if (!existingTracks.has(track)) {
          PeerService.peer.addTrack(track, myStream);
        }
      }
    }
  }, [myStream]);
  

  const handleCallAccepted = useCallback(
    async (data) => {
      const { from, answer } = data;
      PeerService.setLocalDescription(answer);
      console.log("Call Accepted!");
      sendStream()
    },
    [sendStream]
  );

  const handleNegotiationNeeded = useCallback(async () => {
    const offer = await PeerService.getOffer();
    socket.emit("peer:negotiation:needed", { to: remoteSocketId, offer });
  }, [socket, remoteSocketId]);

  const handleIncomingNegotiation = useCallback(
    async (data) => {
      const { from, offer } = data;
      const answer = await PeerService.getAnswer(offer);
      socket.emit("peer:negotiation:done", { to: from, answer });
    },
    [socket]
  );
  
  const handleNegotiationFinal = useCallback(async (data) => {
    const {from, answer} = data;
    await PeerService.setLocalDescription(answer)
  },[])

  useEffect(() => {
    PeerService.peer.addEventListener(
      "negotiationneeded",
      handleNegotiationNeeded
    );

    return () => {
      PeerService.peer.removeEventListener(
        "negotiationneeded",
        handleNegotiationNeeded
      );
    };
  }, [handleNegotiationNeeded]);

  useEffect(() => {
    PeerService.peer.addEventListener("track",  (event) => {
        const remoteStream = event.streams[0];
        console.log(remoteStream, "offer@@@")
        setRemoteStream(remoteStream);
      });
  }, []);

  useEffect(() => {
    if (!socket) return;

    socket.on("user:joined", handleUserJoin);
    socket.on("incoming:call", handleIncomingCall);
    socket.on("call:accepted", handleCallAccepted);
    socket.on("peer:negotiation:needed", handleIncomingNegotiation);
    socket.on('peer:negotiation:final', handleNegotiationFinal)

    return () => {
      socket.off("user:joined", handleUserJoin);
      socket.off("incoming:call", handleIncomingCall);
      socket.off("call:accepted", handleCallAccepted);
      socket.off("peer:negotiation:needed", handleIncomingNegotiation);
      socket.off('peer:negotiation:final', handleNegotiationFinal)
    };
  }, [socket, handleUserJoin, handleIncomingCall, handleCallAccepted]);

  return (
    <div className={`flex items-center justify-center p-5`}>
      <div>
        <h1>{remoteSocketId ? "Connected" : "No one in the room"}</h1>
        {remoteSocketId && <button onClick={handleOutGoingCall}>CALL</button>}
        {myStream && <button onClick={sendStream}>Send Stream</button>}
        {myStream && <h1>My Stream</h1>}
        {myStream && <ReactPlayer muted playing url={myStream} />}
        {remoteStream && <h1>Remote Stream</h1>}
        {myStream && <ReactPlayer playing url={remoteStream} />}
        <button onClick={() => push("/")}>Goto Home</button>
      </div>
    </div>
  );
};

export default RoomScreen;
