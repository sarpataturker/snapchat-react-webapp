import React, { useRef, useEffect } from 'react';

function CameraComponent() {
  const videoRef = useRef(null);

  useEffect(() => {
    const currentVideoRef = videoRef.current;  // Capture the current value of the ref

    // Request access to the webcam
    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Assign the user's video stream to the video element's source
        if (currentVideoRef) {
          currentVideoRef.srcObject = stream;
        }
      })
      .catch((err) => {
        console.error('Error accessing the camera: ', err);
      });

    // Clean up: stop the camera stream when the component is unmounted
    return () => {
      if (currentVideoRef && currentVideoRef.srcObject) {
        const tracks = currentVideoRef.srcObject.getTracks();
        tracks.forEach((track) => {
          track.stop();
        });
      }
    };
}, []);


  return (
    <div>
      <video ref={videoRef} autoPlay playsInline width="720" height="560"></video>
    </div>
  );
}

export default CameraComponent;