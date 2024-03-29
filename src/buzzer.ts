let audioContext: AudioContext;
let gain: GainNode;
let buzzerBuffers: { [key: number]: AudioBuffer };
let beepNode: AudioBufferSourceNode;
let currentFrequency;

export function init() {
  // @ts-ignore
  audioContext = new (window.AudioContext || window.webkitAudioContext)();
  window.addEventListener("mousedown", resumeAudio);
  window.addEventListener("touchstart", resumeAudio);
  window.addEventListener("keydown", resumeAudio);
  gain = audioContext.createGain();
  gain.gain.value = 0.05;
  gain.connect(audioContext.destination);
  buzzerBuffers = {};
  currentFrequency = 0;
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      beepOff();
    }
  });
}

export function beepOn(frequency: number) {
  if (frequency === currentFrequency) {
    return;
  }
  if (currentFrequency > 0) {
    beepNode.stop();
  }
  let buffer: AudioBuffer;
  if (buzzerBuffers[frequency] == null) {
    buzzerBuffers[frequency] = createBuzzerBufferData(frequency);
  }
  buffer = buzzerBuffers[frequency];
  beepNode = new AudioBufferSourceNode(audioContext, {
    buffer,
    loop: true,
  });
  beepNode.start();
  beepNode.stop(getAudioTime() + 3);
  beepNode.connect(gain);
  currentFrequency = frequency;
}

export function beepOff() {
  if (currentFrequency === 0) {
    return;
  }
  beepNode.stop();
  currentFrequency = 0;
}

export function getAudioTime() {
  return audioContext.currentTime;
}

function resumeAudio() {
  audioContext.resume();
}

function createBuzzerBufferData(frequency: number) {
  const buffer = new AudioBuffer({
    numberOfChannels: 1,
    length: audioContext.sampleRate,
    sampleRate: audioContext.sampleRate,
  });
  const buzzerBufferData = buffer.getChannelData(0);
  for (let i = 0; i < audioContext.sampleRate; i++) {
    const vl =
      0.5 +
      (Math.floor(i / (audioContext.sampleRate / 5000)) % 2 === 0 ? 0.2 : -0.2);
    let v =
      Math.floor(i / (audioContext.sampleRate / frequency)) % 2 === 0
        ? vl
        : -vl;
    buzzerBufferData[i] = v;
  }
  return buffer;
}
