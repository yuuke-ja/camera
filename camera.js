const video = document.getElementById('video');
const flame = document.getElementById('flame');
const flame2 = document.getElementById('flame2');
const snapBtn = document.getElementById('snap');
const recordBtn = document.getElementById('record');
const toggleFlameBtn = document.getElementById('toggleFlame');
const addSunglassesBtn = document.getElementById("addSunglasses");
const toggleSantaBtn = document.getElementById("toggleSanta");
const timer = document.getElementById('timer');

let recorder;
let chunks = [];
let recording = false;
let timerInterval;
let sunglassesOn = false;
let santaHatOn = false;

const sunglassesImg = new Image();
sunglassesImg.src = "38578.png";

const santaHatImg = new Image();
santaHatImg.src = "13102.png";

const canvas = document.createElement('canvas');
const ctx = canvas.getContext('2d');

const overlay = document.createElement('canvas');
overlay.id = 'overlay';
overlay.style.position = 'fixed';
overlay.style.top = '0';
overlay.style.left = '0';
overlay.style.width = '100vw';
overlay.style.height = '100vh';
overlay.style.pointerEvents = 'none';
overlay.style.zIndex = '12';
document.body.appendChild(overlay);
const overlayCtx = overlay.getContext('2d');

navigator.mediaDevices.getUserMedia({
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
}).then(stream => {
  video.srcObject = stream;
  flame.style.display = 'none';
  flame2.style.display = 'none';

  video.addEventListener('loadedmetadata', () => {
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    overlay.width = video.videoWidth;
    overlay.height = video.videoHeight;
  });
});

addSunglassesBtn.addEventListener("click", () => {
  sunglassesOn = !sunglassesOn;
});

toggleSantaBtn.addEventListener("click", () => {
  santaHatOn = !santaHatOn;
});

function drawOverlay() {
  overlayCtx.clearRect(0, 0, overlay.width, overlay.height);

  if (sunglassesOn) {
    const w = overlay.width * 0.3;
    const h = w * (sunglassesImg.height / sunglassesImg.width);
    const x = overlay.width * 0.35;
    const y = overlay.height * 0.35; // 修正済み
    overlayCtx.drawImage(sunglassesImg, x, y, w, h);
  }

  if (santaHatOn) {
    const w = overlay.width * 0.3;
    const h = w * (santaHatImg.height / santaHatImg.width);
    const x = (overlay.width - w) / 2;
    const y = overlay.height * 0.0; // 修正済み
    overlayCtx.drawImage(santaHatImg, x, y, w, h);
  }

  requestAnimationFrame(drawOverlay);
}
drawOverlay();

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
      if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) data[i+3] = 0;
    }
    tempCtx.putImageData(imgData, 0, 0);
    ctx.drawImage(tempCanvas, flameX, flameY, flameW, flameH);
  }

  drawFlame(flame, 0.34, 0.2, 0.2);  // 修正済み
  drawFlame(flame2, 0.45, 0.2, 0.2); // 修正済み

  if (sunglassesOn) {
    const w = canvas.width * 0.3;
    const h = w * (sunglassesImg.height / sunglassesImg.width);
    const x = canvas.width * 0.35;
    const y = canvas.height * 0.35; // 修正済み
    ctx.drawImage(sunglassesImg, x, y, w, h);
  }

  if (santaHatOn) {
    const w = canvas.width * 0.4;
    const h = w * (santaHatImg.height / santaHatImg.width);
    const x = canvas.width * 0.3;
    const y = canvas.height * 0.15; // 修正済み
    ctx.drawImage(santaHatImg, x, y, w, h);
  }

  canvas.toBlob(blob => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'snapshot_with_flame_sunglasses_santa.png';
    a.click();
    URL.revokeObjectURL(url);
  }, 'image/png');
});

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

toggleFlameBtn.addEventListener('click', () => {
  const isHidden = flame.style.display === 'none' || flame.style.display === '';
  flame.style.display = isHidden ? 'block' : 'none';
  flame2.style.display = isHidden ? 'block' : 'none';
});

recordBtn.addEventListener('click', () => {
  if (!recording) {
    chunks = [];
    recording = true;
    recordBtn.textContent = '■ 停止';

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
          if (data[i] < 40 && data[i + 1] < 40 && data[i + 2] < 40) data[i+3]=0;
        }
        tempCtx.putImageData(imgData,0,0);
        ctx.drawImage(tempCanvas, flameX, flameY, flameW, flameH);
      }

      drawFlame(flame, 0.34, 0.2, 0.2);
      drawFlame(flame2, 0.45, 0.2, 0.2);

      if (sunglassesOn) {
        const w = canvas.width * 0.3;
        const h = w * (sunglassesImg.height / sunglassesImg.width);
        const x = canvas.width * 0.35;
        const y = canvas.height * 0.35;
        ctx.drawImage(sunglassesImg, x, y, w, h);
      }

      if (santaHatOn) {
        const w = canvas.width * 0.4;
        const h = w * (santaHatImg.height / santaHatImg.width);
        const x = canvas.width * 0.3;
        const y = canvas.height * 0.15;
        ctx.drawImage(santaHatImg, x, y, w, h);
      }

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
      a.download = 'recording_with_flame_sunglasses_santa.webm';
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
