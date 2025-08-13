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
  video: { width: { ideal:1280 }, height: { ideal:720 }, facingMode:"user" }
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

// --- シャッター ---
snapBtn.addEventListener('click', ()=>{
  const canvas = document.createElement('canvas');
  canvas.width = video.videoWidth; canvas.height = video.videoHeight;
  const ctx = canvas.getContext('2d');

  ctx.drawImage(video,0,0,canvas.width,canvas.height);

  function drawVideoOrImg(el,xRatio,yRatio,sizeRatio){
    if(!el || el.style.display==='none') return;
    const w = Math.floor(canvas.width*sizeRatio);
    const h = w;
    const x = Math.floor(canvas.width*xRatio);
    const y = Math.floor(canvas.height*yRatio);
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width=w; tempCanvas.height=h;
    const tempCtx=tempCanvas.getContext('2d');
    if(el.tagName==='VIDEO'){ tempCtx.drawImage(el,0,0,w,h); }
    else { tempCtx.drawImage(el,0,0,w,h); }
    ctx.drawImage(tempCanvas,x,y,w,h);
  }

  drawVideoOrImg(flame,0.34,0.1,0.2);
  drawVideoOrImg(flame2,0.45,0.1,0.2);
  drawVideoOrImg(glasses,0.36,0.2,0.28);

  canvas.toBlob(blob=>{
    const url = URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download='snapshot.png'; a.click();
    URL.revokeObjectURL(url);
  },'image/png');
});

// --- 録画 ---
let recorder, chunks=[], recording=false, timerInterval;

recordBtn.addEventListener('click', ()=>{
  if(!recording){
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');

    // 画面合成フレーム描画
    function drawAll(){
      ctx.drawImage(video,0,0,canvas.width,canvas.height);
      if(flame.style.display!=='none'){ ctx.drawImage(flame,canvas.width*0.34,canvas.height*0.1,canvas.width*0.2,canvas.width*0.2); }
      if(flame2.style.display!=='none'){ ctx.drawImage(flame2,canvas.width*0.45,canvas.height*0.1,canvas.width*0.2,canvas.width*0.2); }
      if(glasses.style.display!=='none'){ ctx.drawImage(glasses,canvas.width*0.36,canvas.height*0.2,canvas.width*0.28,canvas.width*0.28); }
      requestAnimationFrame(drawAll);
    }
    drawAll();

    const stream = canvas.captureStream();
    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = e=>chunks.push(e.data);
    recorder.onstop=()=>{
      const blob=new Blob(chunks,{type:'video/webm'});
      const url=URL.createObjectURL(blob);
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
