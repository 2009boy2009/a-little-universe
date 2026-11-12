const PASSWORD="Muskan", $=id=>document.getElementById(id);
let messages={},revealed=false,activeAudioKey=null;
const audio=$("audioPlayer"),modal=$("noteModal");
const reduced=matchMedia("(prefers-reduced-motion: reduce)").matches;
function dateKey(d=new Date()){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`}
function prettyDate(d=new Date()){return new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(d)}
function stopMusic(){audio.pause();audio.currentTime=0;audio.removeAttribute("src");audio.load();activeAudioKey=null;document.querySelectorAll(".music-button").forEach(b=>b.classList.remove("playing"))}
function playMusic(item,key,button){
 if(!item?.music){return}
 if(activeAudioKey===key&&!audio.paused){stopMusic();return}
 stopMusic();audio.src=item.music;activeAudioKey=key;button?.classList.add("playing");
 audio.play().catch(()=>{stopMusic();alert("Couldn't play this MP3. Check the filename and path in messages.json.")});
}
audio.addEventListener("ended",stopMusic);audio.addEventListener("error",()=>{if(activeAudioKey)stopMusic()});
async function loadMessages(){
 try{const r=await fetch("messages.json",{cache:"no-store"});if(!r.ok)throw Error();const data=await r.json();messages=data.messages||{};renderToday();renderArchive()}
 catch(e){$("archiveGrid").textContent="Could not load messages.json. Keep it beside index.html."}
}
function renderToday(){
 const key=dateKey(),item=messages[key];
 $("todayDate").textContent=item?.dateLabel||prettyDate();
 const music=$("todayMusic");music.disabled=!item?.music;music.onclick=()=>playMusic(item,`today-${key}`,music);
 $("todayTitle").textContent=item?.title||"One small moment";
 $("todayPreview").textContent=item?"Your note is waiting here.":"A little moment my moon 🌙, your note is awaiting.";
 $("revealButton").classList.toggle("hidden",!item);
 $("todayContent").classList.remove("hidden");$("todayMessage").classList.add("hidden");revealed=false;
 $("revealButton").textContent="Reveal today’s message ♡";$("todayFootnote").textContent="A little note, just for today.";
 $("todayMessage").textContent=item?.message||"";
}
$("revealButton").addEventListener("click",()=>{if(revealed)return;revealed=true;$("todayMessage").classList.remove("hidden");$("todayContent").classList.add("hidden")});
function renderArchive(){
 const today=dateKey(),entries=Object.entries(messages).filter(([k])=>k!==today).sort((a,b)=>b[0].localeCompare(a[0]));
 $("noteCount").textContent=`${entries.length} ${entries.length===1?"note":"notes"}`;$("archiveGrid").innerHTML="";
 if(!entries.length){$("archiveGrid").textContent="Your little trail of stars will appear here.";return}
 entries.forEach(([key,item])=>{
  const d=item.dateLabel||prettyDate(new Date(`${key}T12:00:00`)),card=document.createElement("button");
  card.type="button";card.className="archive-card";
  const star=document.createElement("span");star.className="starline";star.textContent="⟶ ✧ ⟵";
  const date=document.createElement("span");date.className="arch-date";date.textContent=d;
  const title=document.createElement("span");title.className="arch-title";title.textContent=item.title||"A little note";
  const down=document.createElement("span");down.className="down";down.textContent="⌄";
  card.append(star,date,title,down);card.addEventListener("click",()=>openNote(key,item));$("archiveGrid").append(card);
 });
}
function openNote(key,item){
 stopMusic();$("modalDate").textContent=item.dateLabel||prettyDate(new Date(`${key}T12:00:00`));$("modalTitle").textContent=item.title||"A little note";$("modalMessage").textContent=item.message||"";
 const b=$("modalMusic");b.disabled=!item.music;b.onclick=()=>playMusic(item,`archive-${key}`,b);
 modal.classList.remove("hidden");document.body.style.overflow="hidden";
}
function closeNote(){modal.classList.add("hidden");document.body.style.overflow="";stopMusic()}
$("closeModal").addEventListener("click",closeNote);modal.addEventListener("click",e=>{if(e.target.dataset.close)closeNote()});
document.addEventListener("keydown",e=>{if(e.key==="Escape"&&!modal.classList.contains("hidden"))closeNote()});
$("passwordForm").addEventListener("submit",e=>{
 e.preventDefault();if($("passwordInput").value===PASSWORD){$("passwordError").textContent="";$("loginScreen").classList.remove("active");$("universeScreen").classList.add("active");$("universeScreen").setAttribute("aria-hidden","false");$("loginScreen").setAttribute("aria-hidden","true");loadMessages()}
 else{$("passwordError").textContent="That key doesn't seem right. Try again ♡";$("passwordInput").value="";$("passwordInput").focus()}
});

/* Procedural night-sky scene: stars, nebulae, moon, layered clouds, distant ridges,
   reflective lake, and foreground silhouettes are drawn and animated on canvas. */
(()=>{
 const c=$("world"),ctx=c.getContext("2d");let W,H,DPR,stars=[],shooters=[],clouds=[],flowers=[],t=0;
 const rand=(a,b)=>a+Math.random()*(b-a);
 function resize(){
  DPR=Math.min(devicePixelRatio||1,1.7);W=innerWidth;H=innerHeight;c.width=W*DPR;c.height=H*DPR;c.style.width=W+"px";c.style.height=H+"px";ctx.setTransform(DPR,0,0,DPR,0,0);
  stars=Array.from({length:Math.max(140,Math.floor(W*H/2600))},()=>({x:rand(0,W),y:rand(0,H*.72),r:rand(.35,1.5),p:rand(0,6.28),s:rand(.004,.018),a:rand(.35,.95)}));
  clouds=Array.from({length:13},(_,i)=>({x:rand(-W*.3,W*1.2),y:H*(.36+i*.027),scale:rand(.65,1.65),speed:rand(.035,.11),alpha:rand(.24,.52),seed:rand(0,100)}));
  flowers=Array.from({length:65},()=>({x:rand(-20,W+20),y:rand(H*.84,H*1.02),s:rand(2,7),h:rand(0,6.28)}));
 }
 function glow(x,y,r,color){let g=ctx.createRadialGradient(x,y,0,x,y,r);g.addColorStop(0,color);g.addColorStop(1,"rgba(0,0,0,0)");ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2)}
 function drawSky(){
  let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,"#100a27");g.addColorStop(.34,"#28133f");g.addColorStop(.64,"#75416e");g.addColorStop(1,"#24132f");ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  glow(W*.36,H*.34,Math.max(W,H)*.58,"rgba(104,57,145,.34)");glow(W*.76,H*.47,Math.max(W,H)*.43,"rgba(219,104,167,.24)");glow(W*.17,H*.61,Math.max(W,H)*.3,"rgba(119,73,151,.18)");
  // Soft nebula filaments
  ctx.save();ctx.globalCompositeOperation="screen";for(let i=0;i<7;i++){let x=W*(.1+i*.13)+Math.sin(t*.00015+i)*W*.035,y=H*(.19+(i%3)*.095),r=W*(.12+(i%2)*.05);glow(x,y,r,`rgba(${150+i*10},${75+i*7},${185+i*5},.055)`)}ctx.restore();
 }
 function drawStars(){
  stars.forEach(s=>{s.p+=reduced?0:s.s;let a=s.a*(.68+.32*Math.sin(s.p));ctx.fillStyle=`rgba(255,239,251,${a})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();if(s.r>1.2){ctx.strokeStyle=`rgba(255,211,245,${a*.25})`;ctx.lineWidth=.6;ctx.beginPath();ctx.moveTo(s.x-4,s.y);ctx.lineTo(s.x+4,s.y);ctx.moveTo(s.x,s.y-4);ctx.lineTo(s.x,s.y+4);ctx.stroke()}});
  if(!reduced&&Math.random()<.012)shooters.push({x:rand(-W*.1,W*.8),y:rand(0,H*.38),vx:rand(5,9),life:0,len:rand(70,145)});
  shooters=shooters.filter(s=>s.life<35);shooters.forEach(s=>{s.x+=s.vx;s.y+=s.vx*.42;s.life++;let g=ctx.createLinearGradient(s.x-s.len,s.y-s.len*.42,s.x,s.y);g.addColorStop(0,"rgba(255,213,245,0)");g.addColorStop(1,"rgba(255,244,252,.95)");ctx.strokeStyle=g;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(s.x-s.len,s.y-s.len*.42);ctx.lineTo(s.x,s.y);ctx.stroke();glow(s.x,s.y,8,"rgba(255,215,246,.18)")});
 }
 function drawMoon(){
  let x=W*.805,y=H*.155,r=Math.min(52,W*.047);ctx.save();glow(x,y,r*2.7,"rgba(255,179,221,.19)");
  ctx.shadowColor="#ffd8ec";ctx.shadowBlur=22;let g=ctx.createRadialGradient(x-r*.35,y-r*.4,2,x,y,r);g.addColorStop(0,"#fff9ed");g.addColorStop(.6,"#f6d4e1");g.addColorStop(1,"#d99ecb");ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;
  ctx.globalCompositeOperation="destination-out";ctx.beginPath();ctx.arc(x-r*.34,y-r*.22,r*.94,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation="source-over";
  // faint crescent rim
  ctx.strokeStyle="rgba(255,224,239,.48)";ctx.lineWidth=1.1;ctx.beginPath();ctx.arc(x,y,r,Math.PI*.75,Math.PI*1.7);ctx.stroke();ctx.restore();
 }
 function cloudBlob(x,y,scale,alpha){
  ctx.save();ctx.globalAlpha=alpha;ctx.filter="blur(11px)";
  let g=ctx.createLinearGradient(0,y-55*scale,0,y+75*scale);g.addColorStop(0,"rgba(255,190,218,.82)");g.addColorStop(.35,"rgba(220,135,190,.72)");g.addColorStop(1,"rgba(91,55,119,.05)");ctx.fillStyle=g;
  ctx.beginPath();ctx.ellipse(x,y,150*scale,48*scale,0,0,Math.PI*2);ctx.ellipse(x-85*scale,y-28*scale,70*scale,61*scale,0,0,Math.PI*2);ctx.ellipse(x-12*scale,y-57*scale,88*scale,82*scale,0,0,Math.PI*2);ctx.ellipse(x+76*scale,y-28*scale,76*scale,61*scale,0,0,Math.PI*2);ctx.fill();
  ctx.filter="blur(2px)";ctx.globalAlpha=alpha*.45;ctx.strokeStyle="rgba(255,205,229,.42)";ctx.lineWidth=2*scale;ctx.beginPath();ctx.arc(x-10*scale,y-49*scale,75*scale,Math.PI*1.05,Math.PI*1.85);ctx.stroke();ctx.restore();
 }
 function drawClouds(){
  clouds.forEach((cl,i)=>{if(!reduced){cl.x+=cl.speed*(i<5?1:-.7);if(cl.x>W+300)cl.x=-320;if(cl.x<-330)cl.x=W+320}cloudBlob(cl.x,cl.y+Math.sin(t*.0004+cl.seed)*5,cl.scale,cl.alpha)});
 }
 function ridge(points,fill){ctx.beginPath();ctx.moveTo(points[0][0]*W,points[0][1]*H);points.slice(1).forEach(p=>ctx.lineTo(p[0]*W,p[1]*H));ctx.closePath();ctx.fillStyle=fill;ctx.fill()}
 function drawLand(){
  let y=H*.76;
  let g=ctx.createLinearGradient(0,y-80,0,H);g.addColorStop(0,"#42284f");g.addColorStop(1,"#100e20");
  ridge([[0,.78],[.08,.69],[.16,.75],[.27,.64],[.36,.75],[.48,.71],[.57,.76],[.7,.67],[.8,.75],[.9,.63],[1,.72],[1,1],[0,1]],g);
  ridge([[0,.82],[.08,.76],[.17,.81],[.25,.75],[.34,.83],[.48,.77],[.62,.83],[.74,.76],[.86,.81],[1,.73],[1,1],[0,1]],"#1d1830");
  // rocky promontory on right
  ctx.fillStyle="#171326";ctx.beginPath();ctx.moveTo(W*.84,H*.81);ctx.lineTo(W*.87,H*.72);ctx.lineTo(W*.89,H*.66);ctx.lineTo(W*.91,H*.7);ctx.lineTo(W*.94,H*.65);ctx.lineTo(W*.96,H*.78);ctx.lineTo(W,H*.82);ctx.lineTo(W,H);ctx.lineTo(W*.82,H);ctx.closePath();ctx.fill();
  ctx.strokeStyle="rgba(220,157,194,.16)";ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(W*.87,H*.74);ctx.lineTo(W*.89,H*.68);ctx.lineTo(W*.91,H*.72);ctx.stroke();
 }
 function drawWater(){
  let top=H*.79;let g=ctx.createLinearGradient(0,top,0,H);g.addColorStop(0,"rgba(117,66,119,.48)");g.addColorStop(.28,"rgba(73,43,91,.76)");g.addColorStop(1,"#120d25");ctx.fillStyle=g;ctx.fillRect(0,top,W,H-top);
  let cx=W*.53,phase=t*.0012;ctx.save();
  for(let i=0;i<65;i++){let yy=top+8+i*i*.12;if(yy>H)break;let spread=8+i*2.6,xx=cx+Math.sin(phase+i*.53)*i*.35;let alpha=(1-i/72)*.23;ctx.strokeStyle=`rgba(255,196,224,${alpha})`;ctx.lineWidth=i%5===0?1.5:.7;ctx.beginPath();ctx.moveTo(xx-spread,yy);ctx.lineTo(xx+spread,yy);ctx.stroke()}
  let reflection=ctx.createLinearGradient(cx,top,cx,H);reflection.addColorStop(0,"rgba(255,206,228,.34)");reflection.addColorStop(.3,"rgba(255,167,214,.1)");reflection.addColorStop(1,"rgba(255,177,216,0)");ctx.fillStyle=reflection;ctx.beginPath();ctx.moveTo(cx-7,top);ctx.lineTo(cx+7,top);ctx.lineTo(cx+W*.13,H);ctx.lineTo(cx-W*.13,H);ctx.closePath();ctx.fill();ctx.restore();
 }
 function drawFlowers(){
  flowers.forEach(f=>{let sway=Math.sin(t*.001+f.h)*3;ctx.strokeStyle="rgba(28,26,39,.9)";ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(f.x,f.y+18);ctx.quadraticCurveTo(f.x+sway,f.y,f.x+sway,f.y-7);ctx.stroke();let x=f.x+sway,y=f.y-8;ctx.fillStyle="rgba(255,190,218,.75)";for(let j=0;j<5;j++){let a=j*Math.PI*2/5;ctx.beginPath();ctx.ellipse(x+Math.cos(a)*f.s*.8,y+Math.sin(a)*f.s*.8,f.s*.48,f.s*.8,a,0,Math.PI*2);ctx.fill()}ctx.fillStyle="#ffe4a9";ctx.beginPath();ctx.arc(x,y,1.7,0,Math.PI*2);ctx.fill()});
  // dark foreground grass silhouettes
  ctx.fillStyle="rgba(13,12,27,.72)";ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W;x+=18)ctx.lineTo(x,H*.96+Math.sin(x*.04+t*.0007)*8);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 }
 function frame(now){t=now||0;drawSky();drawStars();drawMoon();drawClouds();drawLand();drawWater();drawFlowers();if(!reduced)requestAnimationFrame(frame)}
 resize();addEventListener("resize",resize);requestAnimationFrame(frame);
})();