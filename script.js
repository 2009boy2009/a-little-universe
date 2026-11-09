const PASSWORD = 'Muskan';
const fallbackMessage = 'A little moment my moon 🌙, your note is awaiting';
const gate = document.getElementById('gate');
const universe = document.getElementById('universe');
const audio = document.getElementById('audioPlayer');
const dialog = document.getElementById('noteDialog');
let messages = {};
let activeMusicButton = null;
let currentMusic = '';
let toastTimer;

function localDateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
function formatDate(key) {
  const [y,m,d] = key.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {day:'numeric', month:'long', year:'numeric'});
}
function showToast(message) {
  const el = document.getElementById('toast');
  el.textContent = message;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}
function stopMusic() {
  audio.pause();
  audio.currentTime = 0;
  audio.removeAttribute('src');
  audio.load();
  currentMusic = '';
  if (activeMusicButton) activeMusicButton.classList.remove('playing');
  activeMusicButton = null;
}
async function playMusic(path, button) {
  if (!path) { showToast('There is no music attached to this note yet ♡'); return; }
  if (currentMusic === path && !audio.paused) { stopMusic(); return; }
  stopMusic();
  currentMusic = path;
  activeMusicButton = button;
  audio.src = path;
  try {
    await audio.play();
    button?.classList.add('playing');
  } catch (error) {
    stopMusic();
    showToast('Music file not found. Check the MP3 path in messages.json.');
  }
}
audio.addEventListener('ended', stopMusic);
audio.addEventListener('error', () => { if (currentMusic) { stopMusic(); showToast('Could not load this MP3 file.'); } });

function renderToday() {
  const key = localDateKey();
  const note = messages[key];
  document.getElementById('todayDate').textContent = note?.dateLabel || formatDate(key);
  document.getElementById('todayTitle').textContent = note?.title || 'One small moment';
  document.getElementById('todayText').textContent = note?.message || fallbackMessage;
  document.getElementById('todayMusicTitle').textContent = note?.musicTitle || '';
  const musicButton = document.getElementById('todayMusic');
  musicButton.onclick = () => playMusic(note?.music, musicButton);
  musicButton.title = note?.music ? `Play ${note.musicTitle || 'music'}` : 'No music attached';
  musicButton.style.opacity = note?.music ? '1' : '.55';
}
function renderArchive() {
  const archive = document.getElementById('archive');
  const todayKey = localDateKey();
  const entries = Object.entries(messages).filter(([key]) => key !== todayKey).sort(([a],[b]) => b.localeCompare(a));
  document.getElementById('noteCount').textContent = `${entries.length} ${entries.length === 1 ? 'note' : 'notes'}`;
  archive.replaceChildren();
  entries.forEach(([key,note]) => {
    const button = document.createElement('button');
    button.className = 'archive-note';
    button.type = 'button';
    const date = note.dateLabel || formatDate(key);
    const parts = date.split(' ');
    const dateShort = parts.length >= 3 ? `${parts[0]} ${parts[1]}` : date;
    button.innerHTML = `<span class="star-mark">— ✧ —</span><span class="date"></span><span class="title"></span><span class="arrow">⌄</span>`;
    button.querySelector('.date').textContent = dateShort;
    button.querySelector('.title').textContent = note.title || 'A little note';
    button.addEventListener('click', () => openNote(key, note));
    archive.appendChild(button);
  });
  if (!entries.length) {
    const empty = document.createElement('p');
    empty.className = 'intro-copy';
    empty.textContent = 'Your little trail of stars will appear here.';
    archive.appendChild(empty);
  }
}
function openNote(key, note) {
  stopMusic();
  document.getElementById('modalDate').textContent = note.dateLabel || formatDate(key);
  document.getElementById('modalTitle').textContent = note.title || 'A little note';
  document.getElementById('modalMessage').textContent = note.message || '';
  const musicButton = document.getElementById('modalMusic');
  musicButton.onclick = () => playMusic(note.music, musicButton);
  musicButton.style.opacity = note.music ? '1' : '.55';
  dialog.showModal();
}
function closeNote() { dialog.close(); stopMusic(); }
document.getElementById('closeDialog').addEventListener('click', closeNote);
dialog.addEventListener('click', event => { if (event.target === dialog) closeNote(); });
dialog.addEventListener('close', stopMusic);
document.getElementById('unlockForm').addEventListener('submit', event => {
  event.preventDefault();
  const entered = document.getElementById('password').value;
  if (entered === PASSWORD) {
    document.getElementById('passwordError').textContent = '';
    gate.classList.add('hidden');
    universe.classList.remove('hidden');
    renderToday(); renderArchive();
  } else {
    document.getElementById('passwordError').textContent = 'That key does not open this little universe. ♡';
    document.getElementById('password').value = '';
  }
});

function makeStars() {
  const field = document.getElementById('starfield');
  const count = Math.min(170, Math.floor(window.innerWidth * window.innerHeight / 8500));
  for (let i=0;i<count;i++) {
    const star = document.createElement('i');
    star.className = `star${Math.random() > .9 ? ' big' : ''}`;
    star.style.left = `${Math.random()*100}%`;
    star.style.top = `${Math.random()*76}%`;
    star.style.setProperty('--dur', `${2 + Math.random()*4}s`);
    star.style.setProperty('--delay', `${Math.random()*5}s`);
    field.appendChild(star);
  }
}
function makeFlowers() {
  const field = document.getElementById('flowers');
  for (let i=0;i<17;i++) {
    const flower = document.createElement('i');
    flower.className = 'flower';
    flower.style.left = `${Math.random()*100}%`;
    flower.style.setProperty('--size', `${17+Math.random()*22}px`);
    flower.style.setProperty('--sway', `${3+Math.random()*4}s`);
    flower.style.animationDelay = `${Math.random()*-5}s`;
    field.appendChild(flower);
  }
}
async function loadMessages() {
  try {
    const response = await fetch('messages.json', {cache:'no-store'});
    if (!response.ok) throw new Error('Could not load messages.json');
    const data = await response.json();
    messages = data.messages || {};
  } catch (error) {
    console.warn(error);
    showToast('Could not read messages.json. Open this folder using a local server or GitHub Pages.');
  }
}
makeStars(); makeFlowers();
loadMessages();
