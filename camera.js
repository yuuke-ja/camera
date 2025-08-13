const video = document.getElementById('video');
const flame = document.getElementById('flame');
const flame2 = document.getElementById('flame2');
const glasses = document.getElementById('glasses');

const snapBtn = document.getElementById('snap');
const recordBtn = document.getElementById('record');
const toggleFlameBtn = document.getElementById('toggleFlame');
const toggleGlassesBtn = document.getElementById('toggleGlasses');
const timer = document.getElementById('timer');

const faceBtn = document.getElementById('faceBtn');
const headBtn = document.getElementById('headBtn');
const bgBtn = document.getElementById('bgBtn');
const faceOptions = document.getElementById('faceOptions');

// --- カメラ起動 ---
navigator.mediaDevices.getUserMedia({
  video: { width:{ideal:1280}, height:{ideal:720}, facingMode:"user" }
})
.then(stream => { video.srcObject = stream; })
.catch(e => console.error('カメラアクセスエラー:', e));

// --- 顔オプション表示制御 ---
function hideAllOptionGroups(){ faceOptions.style.display='none'; }

faceBtn.addEventListener('click', ()=>{ faceOptions.style.display=(faceOptions.style.display==='none')?'flex':'none'; });
headBtn.addEventListener('click', ()=>{ hideAllOptionGroups(); });
bgBtn.addEventListener('click', ()=>{ hideAllOptionGroups(); });

// --- 炎・サングラスON/OFF ---
toggleFlameBtn.addEventListener('click', ()=>{ 
  const show = flame.style.display==='none'; 
  flame.style.display = flame2.style.display = show?'block':'none'; 
});
toggleGlassesBtn.addEventListener('click', ()=>{ 
  glasses.style.display = (glasses.style.display==='none')?'block':'none'; 
});

// --- 黒背景透過で描画 ---
function drawWithTransparency(ctx, el, xRatio, yRatio, sizeRatio, canvasWidth, canvasHeight){
  if(!el || el.style.display==='none') return;
  const w = Math.floor(canvasWidth*sizeRatio);
  const h = w;
  const x = Math.floor(canvasWidth*xRatio);
  const y = Math.floor(canvasHeight*yRatio);

  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = w;
  tempCanvas.height = h;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(el,0,0,w,h);

  const imgData = tempCtx.getImageData(0,0,w,h);
  const data = imgData.data;
  for(let i=0;i<data.length;i+=4){
    if(data[i]<40 && data[i+1]<40 && data[i+2]<40){
      data[i+3]=0;
    }
  }
  tempCtx.putImageData(imgData,0,0);
  ctx.drawImage(tempCanvas,x,y,w,h);
}

// --- シャッター ---
snapBtn.addEventListener('click', ()=>{
  const canvas = document.createElement('canvas');
  canvas.width=video.videoWidth; canvas.height=video.videoHeight;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(video,0,0,canvas.width,canvas.height);
  drawWithTransparency(ctx, flame, 0.34, 0.1, 0.2, canvas.width, canvas.height);
  drawWithTransparency(ctx, flame2, 0.45, 0.1, 0.2, canvas.width, canvas.height);
  drawWithTransparency(ctx, glasses, 0.36, 0.2, 0.28, canvas.width, canvas.height);

  canvas.toBlob(blob=>{
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='snapshot.png'; a.click();
    URL.revokeObjectURL(url);
  },'image/png');
});

// --- 録画 ---
let recorder, chunks=[], recording=false, timerInterval;

recordBtn.addEventListener('click', ()=>{
  if(!recording){
    const canvas = document.createElement('canvas');
    canvas.width=video.videoWidth; canvas.height=video.videoHeight;
    const ctx = canvas.getContext('2d');

    function drawAll(){
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      drawWithTransparency(ctx, flame, 0.34, 0.1, 0.2, canvas.width, canvas.height);
      drawWithTransparency(ctx, flame2, 0.45, 0.1, 0.2, canvas.width, canvas.height);
      drawWithTransparency(ctx, glasses, 0.36, 0.2, 0.28, canvas.width, canvas.height);
      requestAnimationFrame(drawAll);
    }
    drawAll();

    const stream = canvas.captureStream();
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e=>chunks.push(e.data);
    recorder.onstop = ()=>{
      const blob = new Blob(chunks,{type:'video/webm'});
      const url = URL.createObjectURL(blob);
      const a=document.createElement('a'); a.href=url; a.download='recording.webm'; a.click();
      URL.revokeObjectURL(url);
    };
    chunks=[]; recorder.start();
    recording=true; recordBtn.textContent='■ 停止'; startTimer();
  }else{
    recorder.stop(); recording=false; recordBtn.textContent='● 録画'; stopTimer();
  }
});

// --- タイマー ---
function startTimer(){ timer.style.display='block'; let sec=0; timerInterval=setInterval(()=>{ sec++; const m=String(Math.floor(sec/60)).padStart(2,'0'); const s=String(sec%60).padStart(2,'0'); timer.textContent=`${m}:${s}`; },1000); }
function stopTimer(){ timer.style.display='none'; clearInterval(timerInterval); }
