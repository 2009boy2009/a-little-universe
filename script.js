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

/* Painterly procedural scene: layered nebula, volumetric cloud banks, moonlight,
   atmospheric ridges, reflective lake and a detailed flower foreground. */
(()=>{
 const canvas=$('world'),ctx=canvas.getContext('2d',{alpha:false});
 let W=0,H=0,D=1,now=0,stars=[],dust=[],shooters=[],cloudBanks=[],flowers=[],mountainGrain=[];
 const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function resize(){
  D=Math.min(devicePixelRatio||1,1.5);W=innerWidth;H=innerHeight;canvas.width=Math.round(W*D);canvas.height=Math.round(H*D);canvas.style.width=W+'px';canvas.style.height=H+'px';ctx.setTransform(D,0,0,D,0,0);
  stars=Array.from({length:Math.max(260,Math.round(W*H/1250))},()=>({x:rnd(0,W),y:rnd(0,H*.72),r:rnd(.25,1.55),phase:rnd(0,6.28),speed:rnd(.00025,.0018),alpha:rnd(.25,.95),warm:Math.random()<.18}));
  dust=Array.from({length:500},()=>({x:rnd(0,W),y:rnd(0,H*.75),r:rnd(.25,1.1),a:rnd(.04,.25),p:rnd(0,6.28)}));
  cloudBanks=[
   {y:.48,scale:1.45,speed:.012,alpha:.36,seed:2,side:'left'},
   {y:.57,scale:1.65,speed:-.018,alpha:.54,seed:7,side:'right'},
   {y:.67,scale:1.85,speed:.009,alpha:.77,seed:13,side:'both'},
   {y:.77,scale:1.35,speed:-.012,alpha:.65,seed:21,side:'both'}
  ];
  flowers=Array.from({length:Math.round(W/8)},(_,i)=>({x:rnd(-25,W+25),y:rnd(H*.84,H*1.03),size:rnd(4,13),phase:rnd(0,6.28),stem:rnd(24,85),petals:Math.floor(rnd(5,9)),depth:rnd(.45,1.2),hue:rnd(0,1)}));
  mountainGrain=Array.from({length:260},()=>({x:rnd(0,W),y:rnd(H*.68,H*.91),r:rnd(.3,1.4),a:rnd(.025,.12)}));
 }
 function radial(x,y,r,stops,blend='screen'){
  ctx.save();ctx.globalCompositeOperation=blend;const g=ctx.createRadialGradient(x,y,0,x,y,r);stops.forEach(([p,c])=>g.addColorStop(p,c));ctx.fillStyle=g;ctx.fillRect(x-r,y-r,r*2,r*2);ctx.restore();
 }
 function sky(){
  const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#09071e');g.addColorStop(.22,'#17102f');g.addColorStop(.48,'#39204f');g.addColorStop(.7,'#9b527f');g.addColorStop(1,'#28152f');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);
  // Broad nebula clouds with soft overlapping colour volumes.
  radial(W*.25,H*.28,W*.55,[[0,'rgba(116,66,173,.28)'],[.34,'rgba(88,49,146,.19)'],[1,'rgba(40,20,70,0)']]);
  radial(W*.68,H*.38,W*.48,[[0,'rgba(207,76,163,.26)'],[.42,'rgba(138,55,150,.17)'],[1,'rgba(40,20,70,0)']]);
  radial(W*.45,H*.55,W*.42,[[0,'rgba(255,126,183,.19)'],[.35,'rgba(184,75,157,.13)'],[1,'rgba(40,20,70,0)']]);
  ctx.save();ctx.globalCompositeOperation='screen';
  for(let i=0;i<18;i++){
   const x=W*(.04+i*.055)+Math.sin(now*.000025+i)*W*.012,y=H*(.12+(i%6)*.065),r=W*(.045+(i%4)*.018);
   radial(x,y,r,[[0,`rgba(${145+i%4*20},${76+i%5*10},${195+i%3*18},.12)`],[1,'rgba(80,40,120,0)']]);
  }
  // Thin, broken nebula filaments.
  ctx.lineWidth=1;for(let i=0;i<22;i++){let x=W*(i/22),y=H*(.13+(i%7)*.048);ctx.strokeStyle=`rgba(235,153,220,${.025+(i%4)*.012})`;ctx.beginPath();ctx.moveTo(x,y);ctx.bezierCurveTo(x+W*.12,y-H*.04,x+W*.13,y+H*.07,x+W*.26,y-H*.02);ctx.stroke()}
  ctx.restore();
  // A soft horizon bloom behind the clouds.
  radial(W*.5,H*.7,W*.72,[[0,'rgba(255,160,199,.17)'],[.35,'rgba(221,110,177,.1)'],[1,'rgba(0,0,0,0)']]);
 }
 function starfield(){
  dust.forEach(p=>{ctx.fillStyle=`rgba(242,216,255,${p.a*(.75+.25*Math.sin(now*.0005+p.p))})`;ctx.fillRect(p.x,p.y,p.r,p.r)});
  stars.forEach(s=>{const a=s.alpha*(.55+.45*Math.sin(now*s.speed+s.phase));ctx.fillStyle=s.warm?`rgba(255,218,226,${a})`:`rgba(242,232,255,${a})`;ctx.beginPath();ctx.arc(s.x,s.y,s.r,0,Math.PI*2);ctx.fill();if(s.r>1.15){ctx.save();ctx.globalAlpha=a*.55;ctx.shadowColor='#f6c8ff';ctx.shadowBlur=8;ctx.strokeStyle='#f9ddff';ctx.lineWidth=.65;ctx.beginPath();ctx.moveTo(s.x-4,s.y);ctx.lineTo(s.x+4,s.y);ctx.moveTo(s.x,s.y-4);ctx.lineTo(s.x,s.y+4);ctx.stroke();ctx.restore()}});
  if(!reduced&&Math.random()<.004)shooters.push({x:rnd(W*.08,W*.9),y:rnd(0,H*.38),vx:rnd(3.2,5.5),life:0,max:rnd(28,42),len:rnd(65,135)});
  shooters=shooters.filter(s=>s.life<s.max);shooters.forEach(s=>{s.x+=s.vx;s.y+=s.vx*.42;s.life++;let a=1-s.life/s.max;const g=ctx.createLinearGradient(s.x-s.len,s.y-s.len*.42,s.x,s.y);g.addColorStop(0,'rgba(255,211,245,0)');g.addColorStop(1,`rgba(255,244,255,${a})`);ctx.strokeStyle=g;ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(s.x-s.len,s.y-s.len*.42);ctx.lineTo(s.x,s.y);ctx.stroke()});
 }
 function moon(){
  const x=W*.79,y=H*.17,r=Math.min(58,W*.052);radial(x,y,r*3.7,[[0,'rgba(255,210,239,.2)'],[.45,'rgba(239,158,221,.08)'],[1,'rgba(0,0,0,0)']]);
  ctx.save();ctx.shadowColor='#ffd5ec';ctx.shadowBlur=28;const g=ctx.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r);g.addColorStop(0,'#fff9ed');g.addColorStop(.55,'#f9d9e7');g.addColorStop(1,'#d98fbd');ctx.fillStyle=g;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.globalCompositeOperation='destination-out';ctx.beginPath();ctx.arc(x-r*.43,y-r*.19,r*.93,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.strokeStyle='rgba(255,232,244,.62)';ctx.lineWidth=1.2;ctx.beginPath();ctx.arc(x,y,r,Math.PI*.76,Math.PI*1.72);ctx.stroke();ctx.restore();
 }
 // Cloud puffs are rendered as dozens of overlapping light/shadow volumes, not flat ellipses.
 function puff(x,y,rx,ry,alpha,seed){
  const wob=Math.sin(seed*1.71+now*.00018)*2;ctx.save();ctx.globalAlpha=alpha;
  const base=ctx.createRadialGradient(x-rx*.22,y-ry*.48,ry*.04,x,y,Math.max(rx,ry)*1.22);base.addColorStop(0,'rgba(255,210,229,.98)');base.addColorStop(.22,'rgba(244,157,202,.92)');base.addColorStop(.58,'rgba(178,91,157,.83)');base.addColorStop(1,'rgba(65,39,91,0)');ctx.fillStyle=base;ctx.beginPath();ctx.ellipse(x,y+wob,rx,ry,0,0,Math.PI*2);ctx.fill();
  const light=ctx.createRadialGradient(x-rx*.34,y-ry*.6,0,x-rx*.2,y-ry*.25,rx*.9);light.addColorStop(0,'rgba(255,229,239,.8)');light.addColorStop(.34,'rgba(255,181,218,.25)');light.addColorStop(1,'rgba(255,170,220,0)');ctx.fillStyle=light;ctx.beginPath();ctx.ellipse(x-rx*.14,y-ry*.24,rx*.82,ry*.73,-.12,0,Math.PI*2);ctx.fill();ctx.restore();
 }
 function cloudBank(bank,index){
  const baseY=H*bank.y,drift=reduced?0:Math.sin(now*.00008+bank.seed)*W*.012;
  const count=Math.max(10,Math.round(W/70));
  // Deep shadow mass, with a layered, irregular silhouette.
  ctx.save();ctx.globalAlpha=bank.alpha*.52;const sh=ctx.createLinearGradient(0,baseY-H*.11,0,baseY+H*.13);sh.addColorStop(0,'rgba(108,55,123,.12)');sh.addColorStop(.48,'rgba(76,43,100,.7)');sh.addColorStop(1,'rgba(25,18,43,.1)');ctx.fillStyle=sh;ctx.beginPath();ctx.moveTo(-40,baseY+H*.13);for(let i=0;i<=count;i++){const x=i/count*W;const y=baseY+Math.sin(i*1.7+bank.seed)*H*.022+Math.sin(i*.63+bank.seed)*H*.018;ctx.lineTo(x,y)}ctx.lineTo(W+40,H);ctx.lineTo(-40,H);ctx.closePath();ctx.fill();ctx.restore();
  for(let i=0;i<count;i++){
   const x=(i/count)*W+drift+Math.sin(i*2.1+bank.seed)*W*.018;const y=baseY+Math.sin(i*1.8+bank.seed)*H*.025;
   const size=(.035+((Math.sin(i*4.1+bank.seed)+1)*.022))*W*bank.scale;
   puff(x,y,size,size*.53,bank.alpha*.72,bank.seed+i);
   if(i%2===0)puff(x+size*.34,y-size*.48,size*.48,size*.53,bank.alpha*.72,bank.seed+i+40);
   if(i%3===0)puff(x-size*.28,y-size*.33,size*.42,size*.46,bank.alpha*.58,bank.seed+i+80);
  }
  // Scattered luminous cloud rims catch the pink moonlight.
  ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<count*2;i++){const x=(i/(count*2))*W+drift+Math.sin(i*2.8+bank.seed)*W*.012;const y=baseY-H*.035+Math.sin(i*1.5+bank.seed)*H*.025;radial(x,y,W*.035,[[0,`rgba(255,196,224,${bank.alpha*.09})`],[1,'rgba(255,150,210,0)']])}ctx.restore();
 }
 function distantLand(){
  const horizon=H*.755;
  // Distant layered mountain silhouettes softened by atmospheric haze.
  const layers=[{y:.76,c:'#56335f',a:.55},{y:.79,c:'#342340',a:.8},{y:.83,c:'#20182f',a:1}];
  layers.forEach((l,k)=>{ctx.save();ctx.globalAlpha=l.a;ctx.fillStyle=l.c;ctx.beginPath();ctx.moveTo(0,H);ctx.lineTo(0,H*l.y);for(let i=0;i<=24;i++){const x=i/24*W;const peak=Math.sin(i*1.31+k*2)*H*(.025+k*.008)+Math.sin(i*.47+k)*H*.022;ctx.lineTo(x,H*l.y+peak)}ctx.lineTo(W,H);ctx.closePath();ctx.fill();ctx.restore()});
  // Distinct rocky cliff at the far right, broken into irregular faces.
  const x=W*.87,y=H*.68;ctx.fillStyle='#171426';ctx.beginPath();ctx.moveTo(x-W*.055,H);ctx.lineTo(x-W*.026,y+H*.12);ctx.lineTo(x-W*.01,y+H*.045);ctx.lineTo(x+W*.005,y-H*.025);ctx.lineTo(x+W*.021,y+H*.06);ctx.lineTo(x+W*.035,y+.02*H);ctx.lineTo(x+W*.055,y+H*.16);ctx.lineTo(W,H*.83);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
  ctx.strokeStyle='rgba(223,164,205,.2)';ctx.lineWidth=1.5;for(let i=0;i<8;i++){let xx=x-W*.025+i*W*.009;ctx.beginPath();ctx.moveTo(xx,H*.79);ctx.lineTo(xx+W*.006,H*(.72+Math.sin(i)*.025));ctx.stroke()}
  mountainGrain.forEach(p=>{ctx.fillStyle=`rgba(241,177,218,${p.a})`;ctx.fillRect(p.x,p.y,p.r,p.r)});
  // Horizon haze softens the land/water boundary.
  radial(W*.5,horizon,W*.48,[[0,'rgba(255,168,205,.17)'],[1,'rgba(255,150,210,0)']]);
 }
 function water(){
  const top=H*.79;const g=ctx.createLinearGradient(0,top,0,H);g.addColorStop(0,'#805078');g.addColorStop(.16,'#503453');g.addColorStop(.58,'#241b35');g.addColorStop(1,'#100e21');ctx.fillStyle=g;ctx.fillRect(0,top,W,H-top);
  // Vertical broken moon reflection, widening with distance.
  const cx=W*.51;ctx.save();ctx.globalCompositeOperation='screen';for(let i=0;i<130;i++){const p=i/130,y=top+8+p*p*(H-top-8),width=(3+p*W*.18)*(0.55+0.45*Math.sin(i*1.83+now*.002));const x=cx+Math.sin(now*.001+i*.31)*p*W*.018;const a=(1-p)*.27*(.45+.55*Math.sin(i*2.17));ctx.strokeStyle=`rgba(255,190,222,${Math.max(0,a)})`;ctx.lineWidth=.6+p*1.2;ctx.beginPath();ctx.moveTo(x-width,y);ctx.lineTo(x+width,y);ctx.stroke()}
  for(let i=0;i<75;i++){const y=top+10+i*i*.12;if(y>H)break;const x=cx+Math.sin(now*.0008+i*.49)*i*.42,w=5+i*2.2;ctx.strokeStyle=`rgba(255,211,230,${.05+(1-i/75)*.18})`;ctx.lineWidth=i%6===0?1.5:.7;ctx.beginPath();ctx.moveTo(x-w,y);ctx.lineTo(x+w,y);ctx.stroke()}
  ctx.restore();
 }
 function flowersDraw(){
  flowers.forEach(f=>{const sway=reduced?0:Math.sin(now*.0011+f.phase)*5*f.depth;const x=f.x+sway,y=f.y;ctx.save();ctx.globalAlpha=.9;ctx.strokeStyle='#171628';ctx.lineWidth=1.4*f.depth;ctx.beginPath();ctx.moveTo(f.x,y+12);ctx.quadraticCurveTo(f.x+sway*.2,y-f.stem*.48,x,y-f.stem);ctx.stroke();
   // Leaves on the stem.
   ctx.fillStyle='rgba(61,77,72,.8)';for(let k=0;k<2;k++){ctx.beginPath();ctx.ellipse(f.x+sway*.3+(k?7:-7),y-f.stem*(.35+k*.2),5*f.depth,2.3*f.depth,k?-.45:.45,0,Math.PI*2);ctx.fill()}
   const fx=x,fy=y-f.stem;const petal=f.hue>.5?'rgba(255,194,224,.9)':'rgba(249,213,231,.92)';ctx.fillStyle=petal;for(let p=0;p<f.petals;p++){const a=p/f.petals*Math.PI*2;ctx.beginPath();ctx.ellipse(fx+Math.cos(a)*f.size*.63,fy+Math.sin(a)*f.size*.63,f.size*.34,f.size*.68,a,0,Math.PI*2);ctx.fill()}ctx.fillStyle='#ffe5b4';ctx.beginPath();ctx.arc(fx,fy,f.size*.22,0,Math.PI*2);ctx.fill();ctx.restore();
  });
  // Foreground foliage framing both lower corners.
  ctx.fillStyle='rgba(10,12,25,.72)';ctx.beginPath();ctx.moveTo(0,H);for(let x=0;x<=W;x+=8)ctx.lineTo(x,H*.97+Math.sin(x*.035+now*.0007)*8);ctx.lineTo(W,H);ctx.closePath();ctx.fill();
 }
 function frame(ts){now=ts||0;sky();starfield();moon();cloudBanks.forEach(cloudBank);distantLand();water();flowersDraw();if(!reduced)requestAnimationFrame(frame)}
 resize();addEventListener('resize',resize,{passive:true});requestAnimationFrame(frame);
})();
