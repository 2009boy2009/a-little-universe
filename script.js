const PASSWORD = "Muskan";
const messagesUrl = "./messages.json";

const passwordScreen = document.getElementById("password-screen");
const messagesScreen = document.getElementById("messages-screen");
const passwordInput = document.getElementById("password-input");
const passwordError = document.getElementById("password-error");
const unlockButton = document.getElementById("unlock-button");
const todayDate = document.getElementById("today-date");
const todayHeading = document.getElementById("today-heading");
const todayMessage = document.getElementById("today-message");
const todayMusicButton = document.getElementById("today-music");
const archiveList = document.getElementById("archive-list");
const archiveCount = document.getElementById("archive-count");
const modal = document.getElementById("note-modal");
const modalDate = document.getElementById("modal-date");
const modalTitle = document.getElementById("modal-title");
const modalMessage = document.getElementById("modal-message");
const modalMusicButton = document.getElementById("modal-music");
const audioPlayer = document.getElementById("audio-player");

let allMessages = {};
let activeMusicButton = null;
let activeMusicPath = "";

function localDateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
function formatDate(key, suppliedLabel) {
  if (suppliedLabel) return suppliedLabel;
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, m - 1, d).toLocaleDateString("en-GB", {
    day: "numeric", month: "long", year: "numeric"
  });
}
function stopMusic() {
  audioPlayer.pause();
  audioPlayer.currentTime = 0;
  audioPlayer.removeAttribute("src");
  audioPlayer.load();
  if (activeMusicButton) {
    activeMusicButton.classList.remove("playing");
    activeMusicButton.setAttribute("aria-label", "Play music");
  }
  activeMusicButton = null;
  activeMusicPath = "";
}
async function toggleMusic(path, button) {
  if (!path) {
    button.title = "A song will be connected here when the songs folder is added";
    return;
  }
  if (activeMusicPath === path && !audioPlayer.paused) {
    stopMusic();
    return;
  }
  stopMusic();
  activeMusicPath = path;
  activeMusicButton = button;
  audioPlayer.src = path;
  try {
    await audioPlayer.play();
    button.classList.add("playing");
    button.setAttribute("aria-label", "Pause music");
  } catch (error) {
    stopMusic();
    alert("This song could not be played. Check that the MP3 filename and path match messages.json.");
  }
}
audioPlayer.addEventListener("ended", stopMusic);

function unlock() {
  if (passwordInput.value === PASSWORD) {
    passwordError.textContent = "";
    passwordScreen.classList.add("leaving");
    passwordScreen.style.opacity = "0";
    passwordScreen.style.transform = "scale(1.025)";
    window.setTimeout(() => {
      passwordScreen.classList.add("hidden");
      messagesScreen.classList.remove("hidden");
      messagesScreen.setAttribute("aria-hidden", "false");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 650);
  } else {
    passwordError.textContent = "That isn't quite the right key ♡";
    passwordInput.select();
  }
}
unlockButton.addEventListener("click", unlock);
passwordInput.addEventListener("keydown", event => {
  if (event.key === "Enter") unlock();
});

function renderToday() {
  const todayKey = localDateKey();
  const entry = allMessages[todayKey];
  todayDate.textContent = entry ? formatDate(todayKey, entry.dateLabel) : formatDate(todayKey);
  if (entry) {
    todayHeading.textContent = entry.title || "One small moment";
    todayMessage.textContent = entry.message || "";
    todayMusicButton.disabled = !entry.music;
    todayMusicButton.style.opacity = entry.music ? "1" : ".65";
    todayMusicButton.onclick = () => toggleMusic(entry.music, todayMusicButton);
    todayMusicButton.title = entry.music ? "Play today's music" : "Song not connected yet";
  } else {
    todayHeading.textContent = "One small moment";
    todayMessage.textContent = "A little moment my moon 🌙, your note is awaiting";
    todayMusicButton.disabled = true;
    todayMusicButton.style.opacity = ".55";
    todayMusicButton.onclick = null;
    todayMusicButton.title = "No song for today yet";
  }
}
function openNote(key) {
  const note = allMessages[key];
  if (!note) return;
  stopMusic();
  modalDate.textContent = formatDate(key, note.dateLabel);
  modalTitle.textContent = note.title || "A little note";
  modalMessage.textContent = note.message || "";
  modalMusicButton.disabled = !note.music;
  modalMusicButton.style.opacity = note.music ? "1" : ".65";
  modalMusicButton.title = note.music ? "Play this note's music" : "Song not connected yet";
  modalMusicButton.onclick = () => toggleMusic(note.music, modalMusicButton);
  modal.classList.remove("hidden");
  document.body.style.overflow = "hidden";
}
function closeNote() {
  stopMusic();
  modal.classList.add("hidden");
  document.body.style.overflow = "";
}
modal.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeNote));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && !modal.classList.contains("hidden")) closeNote();
});
function renderArchive() {
  const todayKey = localDateKey();
  const keys = Object.keys(allMessages).filter(key => key < todayKey).sort((a, b) => b.localeCompare(a));
  archiveCount.textContent = `${keys.length} ${keys.length === 1 ? "note" : "notes"}`;
  archiveList.innerHTML = "";
  if (!keys.length) {
    const empty = document.createElement("div");
    empty.className = "empty-archive";
    empty.textContent = "Your little trail of stars will appear here ♡";
    archiveList.appendChild(empty);
    return;
  }
  keys.forEach(key => {
    const note = allMessages[key];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "archive-card";
    const star = document.createElement("span");
    star.className = "star-line";
    star.textContent = "⟶ ✧ ⟵";
    const date = document.createElement("span");
    date.className = "archive-date";
    date.textContent = formatDate(key, note.dateLabel);
    const chevron = document.createElement("span");
    chevron.className = "chevron";
    chevron.textContent = "⌄";
    button.append(star, date, chevron);
    button.addEventListener("click", () => openNote(key));
    archiveList.appendChild(button);
  });
}
async function loadMessages() {
  try {
    const response = await fetch(messagesUrl, { cache: "no-store" });
    if (!response.ok) throw new Error("Could not load messages.json");
    const data = await response.json();
    allMessages = data.messages || {};
    renderToday();
    renderArchive();
  } catch (error) {
    todayDate.textContent = formatDate(localDateKey());
    todayMessage.textContent = "Your little notes couldn't be loaded. Please check messages.json.";
    archiveList.textContent = "Messages are temporarily unavailable.";
  }
}
loadMessages();

/* Procedural animated night-sky landscape: no background screenshot is used. */
(() => {
  const canvas = document.getElementById("sky");
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1, stars = [], shooters = [], t = 0;
  const rand = (a,b) => Math.random() * (b-a) + a;
  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth; h = window.innerHeight;
    canvas.width = w*dpr; canvas.height = h*dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0);
    stars = Array.from({length: Math.floor(w*h/2300)}, () => ({
      x: rand(0,w), y: rand(0,h*.7), r: rand(.35,1.7), phase: rand(0,6.28), speed: rand(.5,1.8)
    }));
  }
  function glow(x,y,rx,ry,color,alpha=1) {
    const g = ctx.createRadialGradient(x,y,0,x,y,Math.max(rx,ry));
    g.addColorStop(0, color.replace("ALPHA", alpha));
    g.addColorStop(1, color.replace("ALPHA", 0));
    ctx.save(); ctx.scale(rx/Math.max(rx,ry), ry/Math.max(rx,ry));
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(x* Math.max(rx,ry)/rx, y* Math.max(rx,ry)/ry, Math.max(rx,ry),0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  function drawCloudBand(yBase, phase, color, opacity, scale=1) {
    ctx.save(); ctx.globalAlpha = opacity;
    for (let i=0;i<8;i++) {
      const x = (i*w/6 + Math.sin(phase+i)*24 + w) % (w+180)-90;
      const y = yBase + Math.sin(i*1.7+phase*.4)*35;
      const r = (45 + (i%3)*22)*scale;
      const grad = ctx.createRadialGradient(x-r*.2,y-r*.2,2,x,y,r*1.8);
      grad.addColorStop(0,color); grad.addColorStop(.48,"rgba(160,91,164,.45)"); grad.addColorStop(1,"rgba(68,44,100,0)");
      ctx.fillStyle=grad;
      for(let j=0;j<5;j++){ ctx.beginPath(); ctx.arc(x+(j-2)*r*.48,y+Math.sin(j*2+phase)*r*.18,r*(.7+(j%2)*.22),0,Math.PI*2); ctx.fill(); }
    }
    ctx.restore();
  }
  function drawMountain(points, color) {
    ctx.beginPath(); ctx.moveTo(0,h);
    points.forEach(([x,y])=>ctx.lineTo(x*w,y*h));
    ctx.lineTo(w,h); ctx.closePath(); ctx.fillStyle=color; ctx.fill();
  }
  function drawMoon() {
    const x=w*.79, y=h*.18, r=Math.min(w,h)*.075;
    ctx.save(); ctx.shadowColor="#ffb8e7"; ctx.shadowBlur=35;
    ctx.fillStyle="#ffe0e9"; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
    ctx.shadowBlur=0; ctx.globalCompositeOperation="destination-out";
    ctx.beginPath(); ctx.arc(x-r*.42,y-r*.18,r*.91,0,Math.PI*2); ctx.fill();
    ctx.globalCompositeOperation="source-over"; ctx.restore();
    const halo=ctx.createRadialGradient(x,y,r*.5,x,y,r*2.4);
    halo.addColorStop(0,"rgba(255,190,226,.18)"); halo.addColorStop(1,"rgba(255,190,226,0)");
    ctx.fillStyle=halo; ctx.beginPath(); ctx.arc(x,y,r*2.4,0,Math.PI*2); ctx.fill();
  }
  function drawFlowers() {
    for(let i=0;i<14;i++){
      const x=(i/13)*w+Math.sin(t*.7+i)*8, y=h*(.91+(i%3)*.025), sway=Math.sin(t+i)*5;
      ctx.save(); ctx.translate(x,y); ctx.rotate(sway*.015);
      ctx.strokeStyle="rgba(35,26,53,.9)"; ctx.lineWidth=2;
      ctx.beginPath(); ctx.moveTo(0,30); ctx.quadraticCurveTo(-8,0,0,-22-(i%4)*5); ctx.stroke();
      if(i%2===0){ctx.fillStyle="rgba(77,105,83,.8)";ctx.beginPath();ctx.ellipse(-7,12,9,3,-.5,0,Math.PI*2);ctx.fill();}
      const cy=-25-(i%4)*5;
      for(let p=0;p<6;p++){const a=p*Math.PI/3;ctx.fillStyle=i%2?"rgba(255,163,202,.8)":"rgba(255,190,216,.8)";ctx.beginPath();ctx.ellipse(Math.cos(a)*7,cy+Math.sin(a)*7,4,8,a,0,Math.PI*2);ctx.fill();}
      ctx.fillStyle="#ffd68a";ctx.beginPath();ctx.arc(0,cy,4,0,Math.PI*2);ctx.fill();ctx.restore();
    }
  }
  function frame() {
    t += .008;
    const sky=ctx.createLinearGradient(0,0,0,h);
    sky.addColorStop(0,"#100d2a"); sky.addColorStop(.38,"#38204f"); sky.addColorStop(.72,"#75406f"); sky.addColorStop(1,"#17152f");
    ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    const neb=ctx.createRadialGradient(w*.55,h*.2,0,w*.55,h*.2,w*.65);
    neb.addColorStop(0,"rgba(210,64,169,.30)");neb.addColorStop(.4,"rgba(128,54,150,.20)");neb.addColorStop(1,"rgba(50,28,82,0)");
    ctx.fillStyle=neb;ctx.fillRect(0,0,w,h*.75);
    glow(w*.25,h*.42,w*.35,h*.25,"rgba(255,100,188,ALPHA)",.24);
    stars.forEach(s=>{
      const a=.35+.65*(.5+.5*Math.sin(t*s.speed+s.phase));
      ctx.globalAlpha=a;ctx.fillStyle="#ffe6fa";ctx.shadowColor="#ffb4e6";ctx.shadowBlur=s.r*5;
      ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();
      if(s.r>1.35){ctx.fillRect(s.x-5,s.y-.35,10,.7);ctx.fillRect(s.x-.35,s.y-5,.7,10);}
    });ctx.globalAlpha=1;ctx.shadowBlur=0;
    drawMoon();
    if(Math.random()<.006) shooters.push({x:rand(w*.05,w*.95),y:rand(0,h*.35),life:0,len:rand(70,150),speed:rand(7,12)});
    shooters=shooters.filter(s=>s.life<1);
    shooters.forEach(s=>{s.life+=.012;s.x+=s.speed;s.y+=s.speed*.36;const g=ctx.createLinearGradient(s.x,s.y,s.x-s.len,s.y-s.len*.36);g.addColorStop(0,"rgba(255,255,255,.95)");g.addColorStop(1,"rgba(255,180,226,0)");ctx.strokeStyle=g;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(s.x,s.y);ctx.lineTo(s.x-s.len,s.y-s.len*.36);ctx.stroke();});
    drawCloudBand(h*.55,t,"#e58abf",.35,1.1);
    drawCloudBand(h*.69,t+2,"#f3a0ca",.47,1.25);
    const horizon=h*.78;
    drawMountain([[0,.77],[.09,.69],[.16,.75],[.25,.68],[.34,.76],[.47,.70],[.58,.77],[.69,.68],[.79,.76],[.9,.67],[1,.75]],"rgba(34,25,56,.92)");
    drawMountain([[0,.83],[.12,.76],[.22,.82],[.34,.75],[.48,.84],[.62,.76],[.74,.82],[.88,.75],[1,.83]],"rgba(24,22,48,.96)");
    const water=ctx.createLinearGradient(0,horizon,0,h);
    water.addColorStop(0,"rgba(94,54,104,.8)");water.addColorStop(.35,"rgba(57,42,83,.95)");water.addColorStop(1,"rgba(20,19,43,1)");
    ctx.fillStyle=water;ctx.fillRect(0,horizon,w,h-horizon);
    const reflection=ctx.createLinearGradient(0,horizon,0,h);
    reflection.addColorStop(0,"rgba(255,163,212,.34)");reflection.addColorStop(1,"rgba(255,163,212,0)");
    ctx.fillStyle=reflection;ctx.fillRect(w*.72,horizon,w*.18,h-horizon);
    for(let i=0;i<65;i++){
      const yy=horizon+((i*13+t*25)%(h-horizon));
      const xx=w*(.79+Math.sin(i*12+t)*.08);
      ctx.strokeStyle=`rgba(255,190,224,${.05+.15*(1-i/70)})`;ctx.lineWidth=rand(1,3);
      ctx.beginPath();ctx.moveTo(xx,yy);ctx.lineTo(xx+rand(-20,20),yy);ctx.stroke();
    }
    drawFlowers();
    requestAnimationFrame(frame);
  }
  window.addEventListener("resize",resize); resize(); requestAnimationFrame(frame);
})();
