export let audioContext: AudioContext;
let gain: GainNode;
let buzzerBuffer: AudioBuffer;

export function init() {
  // @ts-ignore
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  window.addEventListener("mousedown", resumeAudio);
  window.addEventListener("touchstart", resumeAudio);
  window.addEventListener("keydown", resumeAudio);
  gain = audioContext.createGain();
  gain.gain.value = 0.05;
  gain.connect(audioContext.destination);
  buzzerBuffer = new AudioBuffer({
    numberOfChannels: 1,
    length: audioContext.sampleRate,
    sampleRate: audioContext.sampleRate,
  });
  const buzzerBufferData = buzzerBuffer.getChannelData(0);
  for (let i = 0; i < audioContext.sampleRate; i++) {
    const vl =
      0.5 +
      (Math.floor(i / (audioContext.sampleRate / 5000)) % 2 === 0 ? 0.2 : -0.2);
    let v =
      Math.floor(i / (audioContext.sampleRate / 2400)) % 2 === 0 ? vl : -vl;
    buzzerBufferData[i] = v;
  }
}

let isBeepOn = false;
let beepNode: AudioBufferSourceNode;

export function beepOn() {
  if (isBeepOn) {
    return;
  }
  beepNode = new AudioBufferSourceNode(audioContext, {
    buffer: buzzerBuffer,
    loop: true,
  });
  beepNode.start();
  beepNode.connect(gain);
  isBeepOn = true;
}

export function beepOff() {
  if (!isBeepOn) {
    return;
  }
  beepNode.stop();
  isBeepOn = false;
}

export function getAudioTime() {
  return audioContext.currentTime;
}

function resumeAudio() {
  audioContext.resume();
}
