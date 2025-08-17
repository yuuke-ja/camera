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
  video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" }
}).then(stream => {
  video.srcObject = stream;
  flame.style.display = 'none';
  flame2.style.display = 'none';
});

// サブボタンのトグル
const categoryBtns = document.querySelectorAll('.category-btn');
categoryBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    const category = btn.dataset.category;
    const subMenu = document.getElementById(`${category}-buttons`);

    // 他のサブメニューを閉じる
    document.querySelectorAll('.sub-buttons').forEach(menu => {
      if (menu !== subMenu) menu.style.display = 'none';
    });

    // 押したカテゴリだけトグル
    subMenu.style.display = (subMenu.style.display === 'block') ? 'none' : 'block';
  });
});

// 炎表示切替
toggleFlameBtn.addEventListener('click', () => {
  const isHidden = flame.style.display === 'none' || flame.style.display === '';
  flame.style.display = isHidden ? 'block' : 'none';
  flame2.style.display = isHidden ? 'block' : 'none';
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

// タイマー処理
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
