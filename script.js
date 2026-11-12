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
