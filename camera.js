const video = document.getElementById('video');
const flame = document.getElementById('flame');
const flame2 = document.getElementById('flame2');
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

  // 確実に炎非表示スタート
  flame.style.display = 'none';
  flame2.style.display = 'none';
})
.catch(e => console.error('カメラアクセスエラー:', e));

// シャッター機能（炎も描画・黒背景透明化対応）
snapBtn.addEventListener('click', () => {
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  // キャンバスを透明でクリア（黒背景を防ぐ）
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // カメラ映像描画
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  // 炎動画描画用関数（黒背景を透明化）
  function drawFlame(flameEl, xRatio, yRatio, sizeRatio) {
    if (!flameEl || flameEl.style.display === 'none') return;

    const flameW = Math.floor(canvas.width * sizeRatio);
    const flameH = flameW; // 正方形と仮定

    const flameX = Math.floor(canvas.width * xRatio);
    const flameY = Math.floor(canvas.height * yRatio);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = flameW;
    tempCanvas.height = flameH;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(flameEl, 0, 0, flameW, flameH);

    // 黒背景を透明にする処理（閾値40）
    const imgData = tempCtx.getImageData(0, 0, flameW, flameH);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) {
        data[i + 3] = 0;
      }
    }
    tempCtx.putImageData(imgData, 0, 0);

    ctx.drawImage(tempCanvas, flameX, flameY, flameW, flameH);
  }

  // 炎の位置とサイズはcanvasの比率で指定
  drawFlame(flame, 0.34, 0.1, 0.2);
  drawFlame(flame2, 0.45, 0.1, 0.2);

  // 画像保存
  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot_with_flame.png';
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

// 炎表示切替
toggleFlameBtn.addEventListener('click', () => {
  const isHidden = flame.style.display === 'none' || flame.style.display === '';
  flame.style.display = isHidden ? 'block' : 'none';
  flame2.style.display = isHidden ? 'block' : 'none';
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