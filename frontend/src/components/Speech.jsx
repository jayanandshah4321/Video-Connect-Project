import React, { useEffect, useState } from "react";
import ClosedCaptionOffOutlinedIcon from '@mui/icons-material/ClosedCaptionOffOutlined';
import ClosedCaptionDisabledOutlinedIcon from '@mui/icons-material/ClosedCaptionDisabledOutlined';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import CloseIcon from '@mui/icons-material/Close';
import styles from "../styles/videoComponent.module.css";
import { IconButton, Drawer, Typography, Box } from "@mui/material";

export function Speech({ localVideoref, getPermissions, socketRef, username }) {
  const [transcription, setTranscription] = useState([]);
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [socketId, setSocketId] = useState(null); // State to store socketId
  const [captions, setCaptions] = useState("");
  const [showTranscripts, setShowTranscripts] = useState(false);
  const socket = socketRef.current;

  useEffect(() => {
    // Listen for socket connection
    const handleConnect = () => {
      console.log("✅ Socket connected");
      setSocketId(socket.id); // Update socketId once connected
    };

    socket.on("connect", handleConnect);

    // Cleanup listener
    return () => {
      socket.off("connect", handleConnect);
    };
  }, [socket]);

  useEffect(() => {
    if (localVideoref && localVideoref.current) {
      getPermissions();
      console.log("Local Video Ref: ", localVideoref.current);
    } else {
      console.error("localVideoref is undefined or null");
    }
  }, [localVideoref, getPermissions]);

  useEffect(() => {
    const handleTranscription = (data) => {
      console.log("📝 Transcription received:", data);
      setTranscription((prev)=>[...prev, data]);
      console.log("transcription:", transcription);
      if(data.user === username){
        setCaptions("");
      }
      else{
        setCaptions(data.user + ": " + data.text);
      }
      console.log("captions:", captions);
    };

    socket.on("transcription", handleTranscription);

    return () => {
      socket.off("transcription"); // Cleanup listener
    };
  }, [socket]);

  const startRecording = async () => {
    console.log("🎤 Started recording");
    
    // Check if video ref and srcObject exist
    if (!localVideoref?.current?.srcObject) {
      console.error("Cannot start recording: Video stream not available");
      return;
    }
    
    const audioTracks = localVideoref.current.srcObject.getAudioTracks();
    
    // Check if audio tracks exist
    if (!audioTracks || audioTracks.length === 0) {
      console.error("Cannot start recording: No audio tracks available");
      return;
    }
    
    setIsRecording(true);
    const stream = new MediaStream(audioTracks);
    console.log("stream:", stream);

    try {
      const recorder = new MediaRecorder(stream, {
        mimeType: "audio/webm; codecs=opus",
      });
      console.log("recorder:", recorder);
      let webmHeader = null; // Stores the header from the first chunk

      recorder.ondataavailable = async (event) => {
        const blob = event.data;
        if (blob.size === 0) return; // Ignore empty blobs

        const arrayBuffer = await blob.arrayBuffer();
        const uint8Array = new Uint8Array(arrayBuffer);

        // 🔍 Detect silence (all bytes are zero or match previous chunk)
        if (isSilent(uint8Array)) {
          console.log("🔇 Silent chunk detected, skipping...");
          return;
        }

        if (!webmHeader) {
          webmHeader = uint8Array; // Store the first chunk as the WebM header
        } else {
          const fullChunk = new Uint8Array(webmHeader.length + uint8Array.length);
          fullChunk.set(webmHeader, 0);
          fullChunk.set(uint8Array, webmHeader.length);

          const fixedBlob = new Blob([fullChunk], { type: "audio/webm" });
          sendToServer(fixedBlob);
        }
      };

      recorder.start(3000); // Record chunks every 3 seconds
      setMediaRecorder(recorder);
    } catch (error) {
      console.error("Error creating MediaRecorder:", error);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder) {
      mediaRecorder.stop();
      setMediaRecorder(null);
    }
    setIsRecording(false);
  };

  function sendToServer(blob) {
    const reader = new FileReader();
    console.log("📤 Sending audio chunk to server...");
    reader.readAsDataURL(blob);
    reader.onloadend = () => {
      const base64Data = reader.result.split(",")[1];
      console.log("📤 Sending audio chunk to server... line 88");
      console.log("this is username and socketId in speech file:", username, socketId);
      socket.emit("audio-stream", { user: username, audio: base64Data, socketId: socketId });
    };
  }

  function isSilent(chunk) {
    return chunk.every((byte) => byte === 0); // Simple silence check
  }

  const toggleTranscripts = () => {
    setShowTranscripts(!showTranscripts);
  };

  return (
    <div className="speech-container">
      <div className="speech-controls">
        <IconButton 
          className="record-button" 
          onClick={isRecording ? stopRecording : startRecording}
          title={isRecording ? "Stop captions" : "Start captions"}
        >
          {!isRecording ? <ClosedCaptionDisabledOutlinedIcon /> : <ClosedCaptionOffOutlinedIcon />}
        </IconButton>
        
        <IconButton 
          className="transcripts-button" 
          onClick={toggleTranscripts}
          title="Show transcripts"
        >
          <FormatListBulletedIcon />
        </IconButton>
      </div>
      
      <div>
        
        {!isRecording? <p></p>:captions.length > 0 ? (
          <p>
            <strong>{captions}</strong>
          </p>
        ) : (
          <p className="placeholder">Captions will appear here...</p>
        )}
      </div>
      
      {/* Transcript Drawer */}
      <Drawer
        anchor="right"
        open={showTranscripts}
        onClose={() => setShowTranscripts(false)}
      >
        <Box sx={{ width: 350, padding: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Transcripts</Typography>
            <IconButton onClick={() => setShowTranscripts(false)}>
              <CloseIcon />
            </IconButton>
          </Box>
          
          <Box sx={{ maxHeight: 'calc(100vh - 100px)', overflowY: 'auto' }}>
            {transcription.length > 0 ? (
              transcription.map((item, index) => (
                <Box 
                  key={index} 
                  sx={{ 
                    mb: 1.5, 
                    p: 1.5, 
                    backgroundColor: item.user === username ? '#e3f2fd' : '#f5f5f5',
                    borderRadius: 1
                  }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 'bold' }}>
                    {item.user === username ? 'You' : item.user}
                  </Typography>
                  <Typography variant="body2">{item.text}</Typography>
                </Box>
              ))
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary', textAlign: 'center', mt: 3 }}>
                No transcripts available yet
              </Typography>
            )}
          </Box>
        </Box>
      </Drawer>
    </div>
  );
}