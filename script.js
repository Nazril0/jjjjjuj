const STORAGE_KEY = 'notifications';
const typeLabel = { info:'Info', sukses:'Sukses', peringatan:'Peringatan', darurat:'Darurat' };

/*
  CATATAN PENTING:
  File ini didesain untuk memakai window.storage (fitur bawaan Claude Artifacts)
  jika tersedia. Ketika dibuka sebagai file HTML biasa di browser (bukan di
  dalam Claude), window.storage tidak ada — kode akan otomatis memakai
  localStorage sebagai cadangan.

  localStorage HANYA tersimpan di satu browser/perangkat itu saja.
  Artinya versi standalone ini TIDAK bisa mengirim notifikasi lintas HP
  secara nyata tanpa server/backend (misalnya Firebase Realtime Database,
  Supabase, atau server Node.js + WebSocket). Untuk kebutuhan produksi
  sungguhan lintas perangkat, storageGet/storageSet di bawah ini perlu
  diganti agar terhubung ke backend tersebut.
*/

const hasClaudeStorage = typeof window.storage !== 'undefined';

async function storageGet(key){
  if(hasClaudeStorage){
    try{
      const res = await window.storage.get(key, true);
      return res ? res.value : null;
    }catch(e){
      return null;
    }
  }
  return localStorage.getItem(key);
}

async function storageSet(key, value){
  if(hasClaudeStorage){
    try{
      await window.storage.set(key, value, true);
      return;
    }catch(e){
      console.error('Gagal menyimpan (window.storage)', e);
      return;
    }
  }
  localStorage.setItem(key, value);
}

// ---------- TAB SWITCHING ----------
document.querySelectorAll('.tab').forEach(tab=>{
  tab.addEventListener('click', ()=>{
    document.querySelectorAll('.tab').forEach(t=>t.classList.remove('active'));
    document.querySelectorAll('.panel').forEach(p=>p.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById('panel-'+tab.dataset.tab).classList.add('active');
  });
});

// ---------- ADMIN: TYPE SELECT ----------
let selectedType = 'info';
document.getElementById('type-row').addEventListener('click', (e)=>{
  const chip = e.target.closest('.type-chip');
  if(!chip) return;
  document.querySelectorAll('.type-chip').forEach(c=>c.classList.remove('sel'));
  chip.classList.add('sel');
  selectedType = chip.dataset.type;
});

// ---------- STORAGE HELPERS (notifikasi) ----------
async function getNotifications(){
  try{
    const raw = await storageGet(STORAGE_KEY);
    if(!raw) return [];
    return JSON.parse(raw);
  }catch(e){
    return [];
  }
}
async function saveNotifications(list){
  await storageSet(STORAGE_KEY, JSON.stringify(list));
}

function timeLabel(ts){
  const d = new Date(ts);
  return d.toLocaleTimeString('id-ID', {hour:'2-digit', minute:'2-digit', second:'2-digit'});
}

// ---------- ADMIN: RENDER LOG ----------
function renderAdminLog(list){
  const el = document.getElementById('admin-log');
  if(!list.length){
    el.innerHTML = '<div class="empty">Belum ada siaran terkirim.</div>';
    return;
  }
  el.innerHTML = list.map(n => `
    <div class="log-item">
      <div class="dot ${n.type}"></div>
      <div class="log-body">
        <strong>${escapeHtml(n.title)}</strong>
        <p>${escapeHtml(n.message)}</p>
      </div>
      <div class="log-time">${timeLabel(n.ts)}</div>
    </div>
  `).join('');
}

function escapeHtml(str){
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

async function loadAdminLog(){
  const list = await getNotifications();
  renderAdminLog(list);
}
loadAdminLog();

// ---------- ADMIN: SEND ----------
document.getElementById('send-btn').addEventListener('click', async ()=>{
  const title = document.getElementById('f-title').value.trim();
  const message = document.getElementById('f-msg').value.trim();
  if(!title || !message){
    alert('Judul dan pesan wajib diisi.');
    return;
  }
  const btn = document.getElementById('send-btn');
  btn.disabled = true;
  btn.textContent = 'Mengirim...';

  const list = await getNotifications();
  const newItem = {
    id: Date.now() + '-' + Math.random().toString(36).slice(2,7),
    title, message,
    type: selectedType,
    ts: Date.now()
  };
  list.unshift(newItem);
  const trimmed = list.slice(0, 50);
  await saveNotifications(trimmed);
  renderAdminLog(trimmed);

  document.getElementById('f-title').value = '';
  document.getElementById('f-msg').value = '';
  btn.disabled = false;
  btn.textContent = 'Kirim Notifikasi';
});

document.getElementById('clear-btn').addEventListener('click', async ()=>{
  if(!confirm('Hapus semua riwayat siaran? Tindakan ini tidak bisa dibatalkan.')) return;
  await saveNotifications([]);
  renderAdminLog([]);
});

// ---------- MEMBER: TOGGLE + POLLING ----------
let memberActive = false;
let pollTimer = null;
let lastSeenTs = Date.now(); // hanya notifikasi baru sejak diaktifkan yang dianggap "masuk"
let seenIds = new Set();
let receivedFeed = [];

const radar = document.getElementById('radar');
const toggleBtn = document.getElementById('toggle-btn');
const statusText = document.getElementById('status-text');
const statusSub = document.getElementById('status-sub');

toggleBtn.addEventListener('click', async ()=>{
  if(!memberActive){
    if('Notification' in window && Notification.permission === 'default'){
      await Notification.requestPermission();
    }
    memberActive = true;
    lastSeenTs = Date.now();
    radar.classList.add('on');
    toggleBtn.classList.add('on');
    toggleBtn.textContent = 'Nonaktifkan Notifikasi';
    statusText.textContent = 'Notifikasi aktif';
    statusSub.textContent = 'Mendengarkan siaran dari admin...';
    startPolling();
  } else {
    memberActive = false;
    radar.classList.remove('on');
    toggleBtn.classList.remove('on');
    toggleBtn.textContent = 'Aktifkan Notifikasi';
    statusText.textContent = 'Notifikasi nonaktif';
    statusSub.textContent = 'Aktifkan untuk menerima siaran dari admin';
    stopPolling();
  }
});

function startPolling(){
  checkForNew();
  pollTimer = setInterval(checkForNew, 4000);
}
function stopPolling(){
  if(pollTimer) clearInterval(pollTimer);
  pollTimer = null;
}

async function checkForNew(){
  const list = await getNotifications();
  const fresh = list.filter(n => n.ts > lastSeenTs && !seenIds.has(n.id));
  if(fresh.length){
    fresh.sort((a,b)=>a.ts-b.ts);
    fresh.forEach(n=>{
      seenIds.add(n.id);
      receivedFeed.unshift(n);
      showToast(n);
      showBrowserNotification(n);
    });
    lastSeenTs = Math.max(...fresh.map(n=>n.ts));
    renderFeed();
  }
}

function renderFeed(){
  const el = document.getElementById('member-feed');
  if(!receivedFeed.length){
    el.innerHTML = '<div class="empty">Belum ada pesan masuk.</div>';
    return;
  }
  el.innerHTML = receivedFeed.map(n => `
    <div class="feed-item ${n.type}">
      <strong>${escapeHtml(n.title)}</strong>
      <p>${escapeHtml(n.message)}</p>
      <span class="feed-time">${typeLabel[n.type]} · ${timeLabel(n.ts)}</span>
    </div>
  `).join('');
}

function showToast(n){
  const toast = document.getElementById('toast');
  document.getElementById('toast-title').textContent = n.title;
  document.getElementById('toast-msg').textContent = n.message;
  toast.classList.add('show');
  clearTimeout(toast._t);
  toast._t = setTimeout(()=> toast.classList.remove('show'), 4500);
}

function showBrowserNotification(n){
  if('Notification' in window && Notification.permission === 'granted'){
    try{
      new Notification(n.title, { body: n.message });
    }catch(e){ /* diam-diam abaikan jika gagal */ }
  }
}
