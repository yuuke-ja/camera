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

// Canvas 用意（録画用）
const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

// カメラ起動
navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
}).then(stream => {
  video.srcObject = stream;
  flame.style.display = 'none';
  flame2.style.display = 'none';

  // canvas サイズを video に合わせる
  video.addEventListener('loadedmetadata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
  });
});

// ===== シャッター機能（写真） =====
snapBtn.addEventListener('click', () => {
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  function drawFlame(flameEl, xRatio, yRatio, sizeRatio) {
    if (!flameEl || flameEl.style.display === 'none') return;

    const flameW = Math.floor(canvas.width * sizeRatio);
    const flameH = flameW;
    const flameX = Math.floor(canvas.width * xRatio);
    const flameY = Math.floor(canvas.height * yRatio);

    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = flameW;
    tempCanvas.height = flameH;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(flameEl, 0, 0, flameW, flameH);

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

  drawFlame(flame, 0.34, 0.1, 0.2);
  drawFlame(flame2, 0.45, 0.1, 0.2);

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot_with_flame.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});

// ===== サブボタンのトグル =====
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    const subMenu = document.getElementById(`${category}-buttons`);

    document.querySelectorAll('.sub-buttons').forEach(menu => {
      if (menu !== subMenu) menu.style.display = 'none';
    });

    subMenu.style.display = (subMenu.style.display === 'block') ? 'none' : 'block';
  });
});

// ===== 炎表示切替 =====
toggleFlameBtn.addEventListener('click', () => {
  const isHidden = flame.style.display === 'none' || flame.style.display === '';
  flame.style.display = isHidden ? 'block' : 'none';
  flame2.style.display = isHidden ? 'block' : 'none';
});

// ===== 録画機能（炎合成対応） =====
recordBtn.addEventListener('click', () => {
  if (!recording) {
    chunks = [];

    recording = true;
    recordBtn.textContent = '■ 停止';

    // 毎フレーム canvas に描画
    function drawFrame() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      function drawFlame(flameEl, xRatio, yRatio, sizeRatio) {
        if (!flameEl || flameEl.style.display === 'none') return;

        const flameW = Math.floor(canvas.width * sizeRatio);
        const flameH = flameW;
        const flameX = Math.floor(canvas.width * xRatio);
        const flameY = Math.floor(canvas.height * yRatio);

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = flameW;
        tempCanvas.height = flameH;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(flameEl, 0, 0, flameW, flameH);

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

      drawFlame(flame, 0.34, 0.1, 0.2);
      drawFlame(flame2, 0.45, 0.1, 0.2);

      if (recording) requestAnimationFrame(drawFrame);
    }
    drawFrame();

    const stream = canvas.captureStream(30);
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e => chunks.push(e.data);
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'recording_with_flame.webm';
      a.click();
      URL.revokeObjectURL(url);
    };
    recorder.start();
    startTimer();

  } else {
    recorder.stop();
    recording = false;
    recordBtn.textContent = '● 録画';
    stopTimer();
  }
});

// ===== タイマー =====
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
function stopTimer() {
  timer.style.display = 'none';
  clearInterval(timerInterval);
}
