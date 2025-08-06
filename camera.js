const video = document.getElementById('video');
const flame = document.getElementById('flame');
const snapBtn = document.getElementById('snap');
const recordBtn = document.getElementById('record');
const toggleFlameBtn = document.getElementById('toggleFlame');
const timer = document.getElementById('timer');

let recorder;
let chunks = [];
let recording = false;
let timerInterval;

// カメラ起動
navigator.mediaDevices.getUserMedia({
  video: {
    width: { ideal: 1280 },
    height: { ideal: 720 },
    facingMode: "user"
  }
})
.then(stream => {
  video.srcObject = stream;
})
.catch(e => console.error('カメラアクセスエラー:', e));

// シャッター機能
snapBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});

// 録画機能
recordBtn.addEventListener('click', () => {
  if (!recording) {
    chunks = [];
    recorder = new MediaRecorder(video.srcObject);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = e => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    recording = true;
    recordBtn.textContent = '■ 停止';
    startTimer();
  } else {
    recorder.stop();
    recording = false;
    recordBtn.textContent = '● 録画';
    stopTimer();
  }
});

// 炎の表示切替
toggleFlameBtn.addEventListener('click', () => {
  if (flame.style.display === 'none') {
    flame.style.display = 'block';
  } else {
    flame.style.display = 'none';
  }
});

// タイマー開始
function startTimer() {
  timer.style.display = 'block';
  let seconds = 0;
  timer.textContent = '00:00';

  timerInterval = setInterval(() => {
    seconds++;
    const m = String(Math.floor(seconds / 60)).padStart(2, '0');
    const s = String(seconds % 60).padStart(2, '0');
    timer.textContent = `${m}:${s}`;
  }, 1000);
}

// タイマー停止
function stopTimer() {
  timer.style.display = 'none';
  clearInterval(timerInterval);
}
