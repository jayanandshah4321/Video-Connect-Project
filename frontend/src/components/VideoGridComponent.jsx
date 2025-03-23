import { useEffect } from "react";
import React from "react";
import styles from "../styles/videoComponent.module.css";

export const VideoGridComponent = ({ localVideoref, getPermissions, videos }) => {
  useEffect(() => {
    if (localVideoref && localVideoref.current) {
      getPermissions();
    }
  }, []);
  
  return (
    <>
      {/* Only show local video if there are other participants */}
      {videos.length > 0 ? (
        <div className={styles.conferenceView}>
          {/* Local video */}
          <div>
            <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
          </div>
          
          {/* Remote videos */}
          {videos.map((video, index) => (
            <div key={index}>
              <video
                data-socket={video.socketId}
                ref={ref => {
                  if (ref && video.stream) {
                    ref.srcObject = video.stream;
                  }
                }}
                autoPlay
              ></video>
            </div>
          ))}
        </div>
      ) : (
        // Only local video when no other participants
        <div className={styles.soloView}>
          <video className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
          <div className={styles.waitingMessage}>
            Waiting for others to join...
          </div>
        </div>
      )}
    </>
  );
};
