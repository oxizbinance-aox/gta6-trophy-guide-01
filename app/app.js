// Leonida Trophy Guide — checklist, roadmap, missables. No network at run time:
// the only fetch is the app's own data file, and source links open only on click.
const STORE_KEY = 'leonida-trophy-guide-v1';
const DEMO_EARNED = [2, 3, 8, 16, 20, 21, 28, 33, 36, 46, 51, 53, 55];

const ROADMAP_STAGES = [
  {
    n: 1, title: 'Stage 1 — Play the story', hours: '60–80 hours',
    blurb: 'Finish the story and pick up optional missions as they appear: purple icons, plus black icons with pink letters. Scan every new vehicle with the WAiNK app and study animals through binoculars — that progress already counts toward 100%.',
    tips: ['Do the Chapter 1 balcony meditation for Positive Mental Attitude before Chapter 1 ends.', 'Keep a manual save at the start and end of every chapter — there is no mission replay.', 'Cheats disable trophies and saving: keep them off this save.'],
  },
  {
    n: 2, title: 'Stage 2 — 100% Completion & Challenges', hours: 'About 100 hours',
    blurb: 'After the ending, Progress > Stats > 100% Completion shows the checklist. It is closer to 60% true completion: most side quests are not needed, but every robbery, underwater discovery, shooting range, drone race and the Bret quest are.',
    tips: ['Scan 200 of the 277 base vehicle models; study 100 of the 255 animals.', 'Gold all 42 Shooting Range challenges; win drone races at all 14 locations.', 'Complete 70 of 80 Challenges — you may skip the hardest 10.'],
  },
  {
    n: 3, title: 'Stage 3 — Strangers & Freaks and cleanup', hours: 'About 10 hours',
    blurb: 'The checklist does not ask for Strangers & Freaks, so they are usually what is left, together with any stray trophies that did not pop on their own. Finish them and the platinum pops.',
    tips: ['Complete 8 stranger strands — the five named stranger trophies are five of the eight.', 'Every trophy-related character is available in free roam after the story.', 'Tick off the last collectibles: card sets, garages, WAiNK spots.'],
  },
];

let trophies = [];
let sourceList = {};
let earned = new Set();
let spoilerOn = false;
let selectedId = null;
let currentView = 'checklist';
let demoMode = false;

const $ = (id) => document.getElementById(id);

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) earned = new Set(data.earned.filter((n) => Number.isInteger(n)));
    spoilerOn = !!data.spoilers;
  } catch (e) { /* a corrupt save starts fresh */ }
}

function saveProgress() {
  if (demoMode) return;
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify({ earned: [...earned].sort((a, b) => a - b), spoilers: spoilerOn, savedAt: new Date().toISOString() }));
  } catch (e) { /* private mode: progress just does not persist */ }
}

function gradeLabel(t) { return t.grade; }
function isStory(t) { return t.kinds.includes('story'); }
function isSpoilerHidden(t) { return spoilerOn && isStory(t) && !earned.has(t.id); }
function trophyById(id) { return trophies.find((t) => t.id === id); }

function filteredTrophies() {
  const q = $('search').value.trim().toLowerCase();
  const kind = $('kindFilter').value;
  const grade = $('gradeFilter').value;
  const status = $('statusFilter').value;
  return trophies.filter((t) => {
    if (kind === 'story' && !isStory(t)) return false;
    if (kind === 'missable' && !t.missable) return false;
    if (kind === 'collectibles' && !t.kinds.includes('collectibles')) return false;
    if (kind === 'activities' && !t.kinds.includes('activities')) return false;
    if (kind === 'online') return false;
    if (grade !== 'all' && t.grade !== grade) return false;
    if (status === 'earned' && !earned.has(t.id)) return false;
    if (status === 'remaining' && earned.has(t.id)) return false;
    if (q) {
      if (isSpoilerHidden(t)) return false;
      const hay = (t.name + ' ' + t.description + ' ' + t.guide).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });
}

function tagHtml(t) {
  const tags = [];
  if (t.missable) tags.push('<span class="tag miss">Missable</span>');
  if (isStory(t)) tags.push('<span class="tag story">Story</span>');
  if (t.kinds.includes('collectibles')) tags.push('<span class="tag coll">Collectible</span>');
  if (t.kinds.includes('activities')) tags.push('<span class="tag act">Activity</span>');
  if (t.hidden) tags.push('<span class="tag">Hidden on PSN</span>');
  if (t.count) tags.push('<span class="tag count">× ' + t.count.toLocaleString('en-US') + '</span>');
  return tags.join('');
}

function renderProgress() {
  const n = earned.size;
  $('progressCount').textContent = n + ' / 55';
  $('progressFill').style.width = Math.round((n / 55) * 100) + '%';
  $('progressPct').textContent = Math.round((n / 55) * 100) + '% to the platinum';
}

function renderList() {
  const list = filteredTrophies();
  const ul = $('trophyList');
  ul.innerHTML = '';
  $('listMeta').textContent = 'Showing ' + list.length + ' of 55 trophies · ' + earned.size + ' earned · 28 hidden on PSN until earned';
  $('listEmpty').hidden = list.length > 0;
  for (const t of list) {
    const hidden = isSpoilerHidden(t);
    const li = document.createElement('li');
    li.className = 'row' + (earned.has(t.id) ? ' earned' : '') + (selectedId === t.id ? ' selected' : '');
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(t.id);
    box.setAttribute('aria-label', 'Mark ' + (hidden ? 'story trophy' : t.name) + ' earned');
    box.addEventListener('click', (ev) => { ev.stopPropagation(); toggleEarned(t.id); });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = 'tName';
    name.textContent = hidden ? 'Hidden story trophy' : t.name;
    const desc = document.createElement('div');
    desc.className = 'tDesc';
    desc.textContent = hidden ? 'Earn it to reveal its name and description.' : t.description;
    const tags = document.createElement('div');
    tags.className = 'tags';
    tags.innerHTML = tagHtml(t);
    body.append(name, desc, tags);
    const medal = document.createElement('div');
    medal.className = 'medal';
    medal.innerHTML = '<span class="dot ' + t.grade + '"></span><span class="g">' + gradeLabel(t) + '</span>';
    li.append(box, body, medal);
    li.addEventListener('click', () => { selectedId = t.id; renderList(); renderDetail(); });
    ul.appendChild(li);
  }
}

function sourceLink(key) {
  const s = sourceList[key];
  if (!s) return '';
  const a = document.createElement('a');
  a.href = s.url;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = s.name;
  return a;
}

function renderDetail() {
  const pane = $('detailPane');
  pane.innerHTML = '';
  const t = trophyById(selectedId) || trophies[0];
  if (!t) { pane.textContent = 'Loading trophies…'; return; }
  if (isSpoilerHidden(t)) {
    const h = document.createElement('h2');
    h.textContent = 'Hidden story trophy';
    const p = document.createElement('p');
    p.className = 'hiddenNote';
    p.textContent = 'Spoilers are hidden. Earn this trophy — or switch the spoiler setting off — to see its name, description and guide.';
    pane.append(h, p);
    return;
  }
  const h = document.createElement('h2');
  h.textContent = t.name;
  const off = document.createElement('p');
  off.className = 'off';
  off.textContent = '“' + t.description + '” — official description · ' + gradeLabel(t) + (t.count ? ' · × ' + t.count.toLocaleString('en-US') : '');
  pane.append(h, off);
  if (t.missable) {
    const w = document.createElement('div');
    w.className = 'warn';
    w.innerHTML = '<b>Missable — the only one.</b> Do the Chapter 1 balcony meditation before Chapter 1 ends (see the guide below), and keep a manual save at the start of the chapter.';
    pane.appendChild(w);
  }
  const g = document.createElement('div');
  g.className = 'guide';
  for (const para of t.guide.split('\n')) {
    const p = document.createElement('p');
    p.textContent = para;
    g.appendChild(p);
  }
  pane.appendChild(g);
  if (t.sources && t.sources.length) {
    const box = document.createElement('div');
    box.className = 'srcs';
    const sh = document.createElement('h3');
    sh.textContent = 'Sources for this guide';
    box.appendChild(sh);
    const ul = document.createElement('ul');
    for (const key of t.sources) {
      const li = document.createElement('li');
      const link = sourceLink(key);
      if (link) li.appendChild(link);
      ul.appendChild(li);
    }
    box.appendChild(ul);
    pane.appendChild(box);
  }
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'markBtn' + (earned.has(t.id) ? ' earned' : '');
  btn.textContent = earned.has(t.id) ? '✓ Earned — click to unmark' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(t.id));
  pane.appendChild(btn);
}

function toggleEarned(id) {
  if (earned.has(id)) earned.delete(id); else earned.add(id);
  saveProgress();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
}

function renderRoadmap() {
  const wrap = $('stages');
  wrap.innerHTML = '';
  for (const s of ROADMAP_STAGES) {
    const stageTrophies = trophies.filter((t) => t.stage === s.n);
    const done = stageTrophies.filter((t) => earned.has(t.id)).length;
    const card = document.createElement('div');
    card.className = 'stage';
    const h = document.createElement('h3');
    h.textContent = s.title;
    const hours = document.createElement('div');
    hours.className = 'hours';
    hours.textContent = s.hours + ' · ' + done + ' / ' + stageTrophies.length + ' trophies earned';
    const blurb = document.createElement('p');
    blurb.textContent = s.blurb;
    card.append(h, hours, blurb);
    const tips = document.createElement('ul');
    for (const tip of s.tips) {
      const li = document.createElement('li');
      li.textContent = tip;
      tips.appendChild(li);
    }
    card.appendChild(tips);
    const list = document.createElement('ul');
    for (const t of stageTrophies) {
      const li = document.createElement('li');
      if (earned.has(t.id)) li.className = 'done';
      li.textContent = (earned.has(t.id) ? '✓ ' : '○ ') + (isSpoilerHidden(t) ? 'Hidden story trophy' : t.name) + ' (' + gradeLabel(t) + ')';
      list.appendChild(li);
    }
    card.appendChild(list);
    wrap.appendChild(card);
  }
}

function renderMissables() {
  const wrap = $('missableCards');
  wrap.innerHTML = '';
  for (const t of trophies.filter((x) => x.missable)) {
    const card = document.createElement('div');
    card.className = 'missCard';
    const h = document.createElement('h3');
    h.textContent = '⚠ ' + t.name + ' — ' + gradeLabel(t);
    const off = document.createElement('p');
    off.className = 'off';
    off.textContent = '“' + t.description + '”';
    const g = document.createElement('p');
    g.textContent = t.guide;
    card.append(h, off, g);
    wrap.appendChild(card);
  }
}

function showView(name) {
  currentView = name;
  document.querySelectorAll('.tabs button').forEach((b) => b.classList.toggle('active', b.dataset.view === name));
  document.querySelectorAll('.view').forEach((v) => v.classList.toggle('active', v.id === 'view-' + name));
  $('toolbar').style.display = name === 'checklist' ? '' : 'none';
  if (name === 'roadmap') renderRoadmap();
  if (name === 'missables') renderMissables();
}

function downloadFile(name, text) {
  const blob = new Blob([text], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  a.click();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

function exportProgress() {
  downloadFile('gta6-trophy-progress.json', JSON.stringify({ game: 'Grand Theft Auto VI', earned: [...earned].sort((a, b) => a - b), spoilers: spoilerOn, exportedAt: new Date().toISOString() }, null, 2));
}

function importProgress(file) {
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!Array.isArray(data.earned)) throw new Error('no earned list');
      earned = new Set(data.earned.filter((n) => Number.isInteger(n) && trophyById(n)));
      spoilerOn = !!data.spoilers;
      $('spoilerToggle').checked = spoilerOn;
      saveProgress();
      renderProgress(); renderList(); renderDetail(); renderRoadmap();
    } catch (e) { alert('That file is not a progress export from this guide.'); }
  };
  reader.readAsText(file);
}

// Screenshot states for the entry's own screenshots (hash only, never the default view).
function applyShotState() {
  const m = location.hash.match(/shot=(cover|roadmap|missable|spoiler)/);
  if (!m) return;
  demoMode = true;
  earned = new Set(DEMO_EARNED);
  if (m[1] === 'cover') { selectedId = 28; showView('checklist'); }
  if (m[1] === 'roadmap') { showView('roadmap'); }
  if (m[1] === 'missable') { showView('missables'); }
  if (m[1] === 'spoiler') { spoilerOn = true; $('spoilerToggle').checked = true; selectedId = 4; showView('checklist'); }
}

async function boot() {
  loadProgress();
  const res = await fetch('data/trophies.json');
  const data = await res.json();
  trophies = data.trophies;
  sourceList = data.source_list || {};
  if (!selectedId) selectedId = 28;
  document.querySelectorAll('.tabs button').forEach((b) => b.addEventListener('click', () => showView(b.dataset.view)));
  $('search').addEventListener('input', renderList);
  $('kindFilter').addEventListener('change', renderList);
  $('gradeFilter').addEventListener('change', renderList);
  $('statusFilter').addEventListener('change', renderList);
  $('spoilerToggle').checked = spoilerOn;
  $('spoilerToggle').addEventListener('change', (ev) => { spoilerOn = ev.target.checked; saveProgress(); renderList(); renderDetail(); });
  $('exportBtn').addEventListener('click', exportProgress);
  $('importFile').addEventListener('change', (ev) => { if (ev.target.files[0]) importProgress(ev.target.files[0]); ev.target.value = ''; });
  applyShotState();
  renderProgress();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

boot();
