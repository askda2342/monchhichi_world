(() => {
  const BASE_W = 1448;
  const BASE_H = 1086;
  const PLAYLIST_URL = "https://youtube.com/playlist?list=PLbBfd-eYS5YE&si=NPUobM5t7c7YwxTU";

  const state = { x:692, y:515, hasKey:false, modalOpen:false };
  const FOOTBOX = { left:16, top:68, width:32, height:24 };
  const ROOM_BOUNDS = { left:38, top:270, right:1410, bottom:1015 };

  const obstacles = [
    { name:"bed", x:52, y:175, w:340, h:535 },
    { name:"nightstand", x:390, y:250, w:120, h:205 },
    { name:"vanity", x:1070, y:90, w:300, h:385 },
    { name:"shelf", x:1200, y:555, w:155, h:185 },
    { name:"basket", x:1095, y:790, w:210, h:205 },
    { name:"plant", x:55, y:820, w:150, h:185 }
  ];

  const interactives = {
    letter:{ x:180, y:360, w:360, h:430, margin:35, objectId:"letterObject", promptId:"letterPrompt" },
    radio:{ x:1060, y:500, w:330, h:300, margin:30, objectId:"radioObject", promptId:"radioPrompt" },
    basket:{ x:955, y:715, w:400, h:315, margin:30, objectId:"basketObject", promptId:"basketPrompt" },
    chest:{ x:1020, y:330, w:410, h:190, margin:35, objectId:"chestObject", promptId:"chestPrompt" }
  };

  const sprites = { up:"assets/mon_back.png", down:"assets/mon_front.png", left:"assets/mon_left.png", right:"assets/mon_right.png" };

  const game = document.getElementById("game");
  const player = document.getElementById("player");
  const debugLayer = document.getElementById("debugLayer");
  const debugBtn = document.getElementById("debugBtn");
  const letterModal = document.getElementById("letterModal");
  const letterImage = document.getElementById("letterImage");
  const minigameModal = document.getElementById("minigameModal");
  const fallingBanana = document.getElementById("fallingBanana");
  const catchBasket = document.getElementById("catchBasket");
  const bananaCountText = document.getElementById("bananaCountText");
  const victoryPanel = document.getElementById("victoryPanel");
  const minigameControls = document.getElementById("minigameControls");
  const minigameAudio = document.getElementById("minigameAudio");
  const letterObject = document.getElementById("letterObject");
  const radioObject = document.getElementById("radioObject");
  const basketObject = document.getElementById("basketObject");
  const chestObject = document.getElementById("chestObject");
  const chestPrompt = document.getElementById("chestPrompt");
  const chestSparkle = document.getElementById("chestSparkle");
  const controls = Array.from(document.querySelectorAll(".ctrl"));
  const miniControls = Array.from(document.querySelectorAll(".mini-ctrl"));

  function overlaps(a,b) { return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y; }
  function playerFootRect(x,y) {
    x = x === undefined ? state.x : x;
    y = y === undefined ? state.y : y;
    return { x:x+FOOTBOX.left, y:y+FOOTBOX.top, w:FOOTBOX.width, h:FOOTBOX.height };
  }
  function playerFootCenter() { const f=playerFootRect(); return { x:f.x+f.w/2, y:f.y+f.h/2 }; }
  function validPosition(x,y) {
    const f=playerFootRect(x,y);
    if (f.x<ROOM_BOUNDS.left || f.y<ROOM_BOUNDS.top || f.x+f.w>ROOM_BOUNDS.right || f.y+f.h>ROOM_BOUNDS.bottom) return false;
    return !obstacles.some(function(o){ return overlaps(f,o); });
  }
  function isNear(item) {
    const p=playerFootCenter();
    const nearestX=Math.max(item.x,Math.min(p.x,item.x+item.w));
    const nearestY=Math.max(item.y,Math.min(p.y,item.y+item.h));
    return Math.hypot(p.x-nearestX,p.y-nearestY)<=item.margin;
  }
  function renderRoom() {
    player.style.left=(state.x/BASE_W*100)+"%";
    player.style.top=(state.y/BASE_H*100)+"%";
    updateInteractionPrompts();
  }
  function face(dir) { player.src=sprites[dir]; }
  function move(dir) {
    if (state.modalOpen) return;
    const STEP=18; let nx=state.x, ny=state.y;
    if (dir==="up") ny-=STEP;
    if (dir==="down") ny+=STEP;
    if (dir==="left") nx-=STEP;
    if (dir==="right") nx+=STEP;
    face(dir);
    if (validPosition(nx,ny)) { state.x=nx; state.y=ny; }
    else {
      if (validPosition(nx,state.y)) state.x=nx;
      if (validPosition(state.x,ny)) state.y=ny;
    }
    renderRoom();
  }
  function setReady(key,ready) {
    const cfg=interactives[key];
    const obj=document.getElementById(cfg.objectId);
    const prompt=document.getElementById(cfg.promptId);
    obj.classList.toggle("ready",ready);
    prompt.classList.toggle("visible",ready);
    obj.setAttribute("aria-disabled",String(!ready));
  }
  function updateInteractionPrompts() {
    setReady("letter",isNear(interactives.letter));
    setReady("radio",isNear(interactives.radio));
    setReady("basket",isNear(interactives.basket));
    setReady("chest",isNear(interactives.chest));
    chestPrompt.src=state.hasKey?"assets/open_prompt.png":"assets/locked_prompt.png";
    chestSparkle.classList.toggle("visible",state.hasKey);
  }
  function openLetter(src) { letterImage.src=src; letterModal.hidden=false; state.modalOpen=true; }
  function closeLetter() { letterModal.hidden=true; state.modalOpen=false; game.focus(); }

  letterObject.addEventListener("click",function(){ if (isNear(interactives.letter)) openLetter("assets/letter_one.png"); });
  radioObject.addEventListener("click",function(){ if (isNear(interactives.radio)) window.open(PLAYLIST_URL,"_blank","noopener,noreferrer"); });
  basketObject.addEventListener("click",function(){ if (isNear(interactives.basket)) openMinigame(); });
  document.getElementById("letterPrompt").addEventListener("click",function(){ if (isNear(interactives.letter)) openLetter("assets/letter_one.png"); });
  document.getElementById("radioPrompt").addEventListener("click",function(){ if (isNear(interactives.radio)) window.open(PLAYLIST_URL,"_blank","noopener,noreferrer"); });
  document.getElementById("basketPrompt").addEventListener("click",function(){ if (isNear(interactives.basket)) openMinigame(); });
  document.getElementById("chestPrompt").addEventListener("click",function(){ if (!isNear(interactives.chest) || !state.hasKey) return; openLetter("assets/letter_two.png"); });
  chestObject.addEventListener("click",function(){ if (!isNear(interactives.chest) || !state.hasKey) return; openLetter("assets/letter_two.png"); });
  document.querySelectorAll("[data-close-modal]").forEach(function(el){ el.addEventListener("click",closeLetter); });

  const MINI = {
    W:1000,H:750,basketW:140,basketH:105,basketY:585,basketX:430,
    bananaW:72,bananaH:76,bananaX:450,bananaY:-90,
    fallSpeed:185,moveSpeed:390,count:0,target:5,running:false,completed:false,
    raf:0,lastT:0,moveLeft:false,moveRight:false
  };

  function setMiniElementPosition(el,x,y,w,h) {
    el.style.left=(x/MINI.W*100)+"%";
    el.style.top=(y/MINI.H*100)+"%";
    el.style.width=(w/MINI.W*100)+"%";
    el.style.height=(h/MINI.H*100)+"%";
  }
  function randomBananaX() { const m=65; return m+Math.random()*(MINI.W-MINI.bananaW-m*2); }
  function resetBanana() { MINI.bananaX=randomBananaX(); MINI.bananaY=-MINI.bananaH-15; renderMinigame(); }
  function renderMinigame() {
    setMiniElementPosition(catchBasket,MINI.basketX,MINI.basketY,MINI.basketW,MINI.basketH);
    setMiniElementPosition(fallingBanana,MINI.bananaX,MINI.bananaY,MINI.bananaW,MINI.bananaH);
    bananaCountText.textContent=MINI.count+"/"+MINI.target;
  }
  function miniCollision() {
    const banana={ x:MINI.bananaX+15,y:MINI.bananaY+15,w:MINI.bananaW-30,h:MINI.bananaH-25 };
    const basket={ x:MINI.basketX+12,y:MINI.basketY+22,w:MINI.basketW-24,h:MINI.basketH-30 };
    return overlaps(banana,basket);
  }
  function catchBananaNow() {
    MINI.count+=1;
    bananaCountText.textContent=MINI.count+"/"+MINI.target;
    if (MINI.count>=MINI.target) winMinigame();
    else resetBanana();
  }
  function winMinigame() {
    MINI.running=false;
    MINI.completed=true;
    cancelAnimationFrame(MINI.raf);
    minigameAudio.pause();
    minigameAudio.currentTime=0;
    fallingBanana.style.display="none";
    minigameControls.style.display="none";
    victoryPanel.hidden=false;
    state.hasKey=true;
    updateInteractionPrompts();
  }
  function minigameFrame(t) {
    if (!MINI.running) return;
    if (!MINI.lastT) MINI.lastT=t;
    const dt=Math.min((t-MINI.lastT)/1000,.04);
    MINI.lastT=t;
    let dx=0;
    if (MINI.moveLeft) dx-=MINI.moveSpeed*dt;
    if (MINI.moveRight) dx+=MINI.moveSpeed*dt;
    MINI.basketX=Math.max(38,Math.min(MINI.W-MINI.basketW-38,MINI.basketX+dx));
    MINI.bananaY+=MINI.fallSpeed*dt;
    if (miniCollision()) {
      catchBananaNow();
      if (!MINI.running) return;
    } else if (MINI.bananaY>MINI.H+20) {
      resetBanana();
    }
    renderMinigame();
    MINI.raf=requestAnimationFrame(minigameFrame);
  }
  function startMinigameLoop() {
    if (MINI.completed) {
      victoryPanel.hidden=false;
      fallingBanana.style.display="none";
      minigameControls.style.display="none";
      renderMinigame();
      return;
    }
    MINI.running=true;
    MINI.lastT=0;
    fallingBanana.style.display="block";
    minigameControls.style.display="flex";
    victoryPanel.hidden=true;
    renderMinigame();
    cancelAnimationFrame(MINI.raf);
    MINI.raf=requestAnimationFrame(minigameFrame);
    minigameAudio.currentTime=0;
    const p=minigameAudio.play();
    if (p && typeof p.catch==="function") p.catch(function(){});
  }
  function openMinigame() {
    minigameModal.hidden=false;
    state.modalOpen=true;
    if (MINI.count===0 && !MINI.completed) { MINI.basketX=430; resetBanana(); }
    requestAnimationFrame(startMinigameLoop);
  }
  function closeMinigame() {
    MINI.running=false;
    MINI.moveLeft=false;
    MINI.moveRight=false;
    cancelAnimationFrame(MINI.raf);
    minigameAudio.pause();
    minigameAudio.currentTime=0;
    minigameModal.hidden=true;
    state.modalOpen=false;
    renderRoom();
    game.focus();
  }
  document.querySelectorAll("[data-close-minigame]").forEach(function(el){ el.addEventListener("click",closeMinigame); });
  function setMiniMove(dir,active) {
    if (dir==="left") MINI.moveLeft=active;
    if (dir==="right") MINI.moveRight=active;
  }
  miniControls.forEach(function(btn){
    const dir=btn.dataset.miniDir;
    btn.addEventListener("pointerdown",function(e){
      e.preventDefault();
      setMiniMove(dir,true);
      if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
    });
    const end=function(){ setMiniMove(dir,false); };
    btn.addEventListener("pointerup",end);
    btn.addEventListener("pointercancel",end);
    btn.addEventListener("lostpointercapture",end);
  });

  const keyToDir={ ArrowUp:"up",w:"up",W:"up",ArrowDown:"down",s:"down",S:"down",ArrowLeft:"left",a:"left",A:"left",ArrowRight:"right",d:"right",D:"right" };
  window.addEventListener("keydown",function(e){
    if (e.key==="Escape") {
      if (!letterModal.hidden) closeLetter();
      if (!minigameModal.hidden) closeMinigame();
      return;
    }
    if (!minigameModal.hidden && !MINI.completed) {
      if (["ArrowLeft","a","A"].includes(e.key)) { e.preventDefault(); MINI.moveLeft=true; }
      if (["ArrowRight","d","D"].includes(e.key)) { e.preventDefault(); MINI.moveRight=true; }
      return;
    }
    const dir=keyToDir[e.key];
    if (!dir) return;
    e.preventDefault();
    move(dir);
  });
  window.addEventListener("keyup",function(e){
    if (["ArrowLeft","a","A"].includes(e.key)) MINI.moveLeft=false;
    if (["ArrowRight","d","D"].includes(e.key)) MINI.moveRight=false;
  });

  let holdTimer=null;
  function stopHold() { clearInterval(holdTimer); holdTimer=null; }
  controls.forEach(function(btn){
    const dir=btn.dataset.dir;
    btn.addEventListener("pointerdown",function(e){
      e.preventDefault();
      stopHold();
      move(dir);
      holdTimer=setInterval(function(){ move(dir); },85);
      if (btn.setPointerCapture) btn.setPointerCapture(e.pointerId);
    });
    btn.addEventListener("pointerup",stopHold);
    btn.addEventListener("pointercancel",stopHold);
    btn.addEventListener("lostpointercapture",stopHold);
  });

  function updateDebugScale() { debugLayer.style.transform="scale("+(game.clientWidth/BASE_W)+")"; }
  debugBtn.addEventListener("click",function(){
    const on=debugLayer.classList.toggle("on");
    debugBtn.textContent="DEBUG: "+(on?"ON":"OFF");
    updateDebugScale();
  });
  window.addEventListener("resize",updateDebugScale);

  window.MON_GAME={
    getState:function(){ return Object.assign({},state,{bananas:MINI.count,minigameCompleted:MINI.completed}); },
    setKey:function(value){ state.hasKey=Boolean(value); updateInteractionPrompts(); },
    interactives:interactives,
    obstacles:obstacles,
    roomBounds:ROOM_BOUNDS
  };

  updateDebugScale();
  renderRoom();
  renderMinigame();
  game.focus();
})();