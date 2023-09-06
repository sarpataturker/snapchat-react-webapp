import React from 'react';
import { bootstrapCameraKit, Transform2D } from "@snap/camera-kit";

function createLensSelect(id, lenses, callback) {
  const selectElement = document.getElementById(id);
  lenses.forEach(lens => {
    const option = document.createElement('option');
    option.value = lens.id;
    option.textContent = lens.name;
    selectElement.appendChild(option);
  });
  selectElement.addEventListener('change', (event) => {
    const selectedLens = lenses.find(l => l.id === event.target.value);
    if (selectedLens) callback(selectedLens);
  });
}

async function createSourceSelect(id, callback) {
  const selectElement = document.getElementById(id);
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  videoDevices.forEach(device => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Camera ${device.deviceId}`;
    selectElement.appendChild(option);
  });
  selectElement.addEventListener('change', async (event) => {
    const selectedDeviceId = event.target.value;
    const stream = await navigator.mediaDevices.getUserMedia({ video: { deviceId: selectedDeviceId } });
    callback(stream);
  });
}

const breakpoints = {
  xs: 480
};

class App extends React.Component {
  async componentDidMount() {
    try {
        const JSON_WEB_TOKEN = process.env.REACT_APP_JSON_WEB_TOKEN;
        const DEFAULT_GROUP_KEY = process.env.REACT_APP_DEFAULT_GROUP_KEY;


        const cameraKit = await bootstrapCameraKit({ apiToken: JSON_WEB_TOKEN });
        const session = await cameraKit.createSession();

        session.events.addEventListener("error", (event) => console.error(event.detail));

        const canvasElement = document.getElementById("canvas-output");
        if (canvasElement) {
            canvasElement.replaceWith(session.output.live);
        }

        const { lenses } = await cameraKit.lensRepository.loadLensGroups([DEFAULT_GROUP_KEY]);
        createLensSelect("lens-select", lenses, async (lens) => {
            await session.applyLens(lens);
        });

        createSourceSelect("source-select", async (source) => {
            try {
                await session.setSource(source);  
                const shouldUsePortrait = window.innerWidth <= breakpoints.xs;
            } catch (error) {
                console.error(error);
                throw error;
            }
            session.play("live");
        });
    } catch (error) {
        console.error(error);
    }
  }

  render() {
    return (
      <div>
        <canvas id="canvas-output"></canvas>
        <select id="lens-select"></select>
        <select id="source-select"></select>
      </div>
    );
  }
}

export default App;
