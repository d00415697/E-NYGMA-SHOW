'use strict';

const DATA_URL = './data/riddles.json';

let All_Riddles = [];
let Pool = [];
let current = null;
let answered = false;
const RecentIds = [];   //reduce repetition

const New_Button = document.getElementById('btn-new');
const Check_Asylum = document.getElementById('chk-asylum');
const Check_City = document.getElementById('chk-city');
const Check_Knight = document.getElementById('chk-knight');

const card = document.getElementById('riddle-card');
const game_el = document.getElementById('riddle-game');
const id_el = document.getElementById('riddle-id');
const text_el = document.getElementById('riddle-text');

const form = document.getElementById('answer-form');
const input = document.getElementById('answer-input');
const feedback = document.getElementById('feedback');
const submit_btn = form.querySelector('button[type="submit"]');
const btn_reveal = document.getElementById('btn-reveal');
const btnAudio  = document.getElementById('btn-audio');

const ledgerList = document.getElementById('ledger-list');

const normalize = (s) =>
  String(s || '')
    .toLowerCase()
    .trim()
    .replace(/[`'’"]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ');

const gameKey = (g) => {
  const n = normalize(g);
  if (n.includes('asylum')) return 'asylum';
  if (n.includes('city')) return 'city';
  if (n.includes('knight')) return 'knight';
  // allow short labels too (e.g., "Asylum")
  if (n === 'asylum') return 'asylum';
  if (n === 'city') return 'city';
  if (n === 'knight') return 'knight';
  return n; // fallback
};

function isCorrect(answer, validList){
    const a = normalize(answer);
    const arr = Array.isArray(validList) ? validList : (validList ? [validList] : []);
    return arr.some((v) => {
        const b = normalize(v);
        return a === b || a.includes(b) || b.includes(a);
    });
}

function pickRandom(arr){
    return arr[Math.floor(Math.random() * arr.length)];
}

function updatePool(){
    const allowed = new Set();
    if (Check_Asylum.checked) allowed.add('asylum');
    if (Check_City.checked) allowed.add('city');
    if (Check_Knight.checked) allowed.add('knight');

    Pool = All_Riddles.filter((r) => allowed.has(gameKey(r.game)));
}

function renderRiddle(r){
    game_el.textContent = r.game;
    id_el.textContent = r.id ? `#${r.id}` : '';
    text_el.textContent = r.text;

    input.value = '';
    feedback.textContent = '';
    feedback.className = 'feedback';
    card.classList.remove('hidden');
    input.focus();
}

function drawRiddle() {
    if (!Pool.length){
        card.classList.add('hidden');
        feedback.textContent = 'no riddles available with the selected filters.';
        return;
    }

    let candidate;
    let guard = 40;
    do {
        candidate = pickRandom(Pool);
    } while(RecentIds.includes(candidate.id) && guard--> 0);

    RecentIds.push(candidate.id);
    if (RecentIds.length > 5) RecentIds.shift();

    current = candidate;
    answered = false;
    input.disabled = false;
    btn_reveal.disabled = false;
    if (submit_btn) submit_btn.disabled = false;
    renderRiddle(current);
}

function appendtoLedger(riddle, textShown, revealed = false){
    const li = document.createElement('li');
    li.innerHTML = `
    <div><span class="tag">${riddle.game}</span> <span class="muted">${riddle.id ? '#' + riddle.id : ''}</span></div>
    <div>${riddle.text}</div>
    <div class="answer">${revealed ? 'Answer:' : 'Your answer:'} <strong>${textShown}</strong></div>
  `;
  ledgerList.prepend(li);
}

function scheduleNext(delayMs = 1200){
    if (submit_btn) submit_btn.disabled = true;
    input.disabled = true;
    btn_reveal.disabled = true;
    setTimeout(() => {
        updatePool();
        drawRiddle();
    }, delayMs);
}

New_Button.addEventListener('click', () => {
    updatePool();
    drawRiddle();
});

[Check_Asylum, Check_City, Check_Knight].forEach((check) => {
    check.addEventListener('change', () => {
        updatePool();
    });
});

form.addEventListener('submit', (e) => {
    e.preventDefault();
    if(!current || answered) return;
    const user_answer = input.value;
    if(isCorrect(user_answer, current.answers)){
        answered = true;
        feedback.textContent = 'A challenge completed. Can you do more?';
        feedback.className = 'feedback ok';
        appendtoLedger(current, user_answer, false);
        scheduleNext();
    } else{
        feedback.textContent = 'There is no shame in cheating, if you admit you cannot solve my challenges.';
        feedback.className = 'feedback bad';
    }
});

btn_reveal.addEventListener('click', () =>{
    if(!current || answered) return;
    const canon = (current.answers && current.answers[0]) || '(no answer provided)' ;
    answered = true;
    feedback.textContent = `Answer: ${canon}`;
    feedback.textContent = 'I see you have resorted to cheating... ';
    feedback.className = 'feedback';
    appendtoLedger(current, canon, true);
});

btnAudio.addEventListener('click', async () =>{
    if (music.paused){
        await tryStartMusic();
    } else {
        music.pause();
        setAudioUI(false);
        localStorage.setItem('musicOn', 'false');
    } 
});

// document.addEventListener('DOMContentLoaded', loadRiddles);


document.addEventListener('keydown', (e) =>{
    if(e.key.toLocaleLowerCase() === 'x') btnAudio.click();
});

const music = new Audio('Dai-Li.mp3');
music.loop = true;
music.volume = 0.5;

function setAudioUI(on){
    btnAudio.textContent = on ? 'Music: On' : 'music: off';
    btnAudio.setAttribute('aria-pressed', String(on));
    btnAudio.classList.toggle('primary', on);
}

async function tryStartMusic() {
  try {
    await music.play();
    setAudioUI(true);
    localStorage.setItem('musicOn', 'true');
  } catch (err) {
    // Autoplay blocked: start on first interaction
    const resume = async () => {
      try {
        await music.play();
        setAudioUI(true);
        localStorage.setItem('musicOn', 'true');
      } catch (_) { /* ignore */ }
      document.removeEventListener('pointerdown', resume);
      document.removeEventListener('keydown', resume);
    };
    document.addEventListener('pointerdown', resume, { once: true });
    document.addEventListener('keydown', resume, { once: true });
    setAudioUI(false);
  }
}

function showLoading(isLoading){
    let el = document.getElementById('loading');
    if (isLoading){
        if(!el){
            el = document.createElement('p');
            el.id = 'loading';
            el.className = 'muted';
            el.textContent ='Loading riddles... ';
            document.querySelector('.container').prepend(el);
        }
    } else if(el){
        el.remove();
    }
}

function showError(message){
    let el = document.getElementById('fetch-error');
    if (!el){
        el = document.createElement('p');
        el.id = 'fetch-error';
        el.className = 'feedback bad';
        document.querySelector('.container').prepend(el);
    }
    el.textContent = message;
}

function loadRiddles() {
  showLoading(true);

  fetch('./data/riddles.json', { headers:{ Accept:'application/json' }, cache:'no-store' })
    .then(response => {
      if (!response.ok) {
        throw new Error(`Response status: ${response.status} ${response.statusText}`);
      }
      const ct = response.headers.get('content-type') || '';
      if (!ct.includes('application/json')) {
        throw new Error(`Expected JSON but got "${ct}"`);
      }
      return response.json();
    })
    .then(data => {
      if (!Array.isArray(data)) {
        throw new Error('riddles.json must be a JSON array');
      }

      All_Riddles = data;
      console.log('riddles length =', All_Riddles.length);
      updatePool();
      drawRiddle();
    })
    .catch(err => {
      console.error(err);
      showError('Could not load riddles. Check the server, path, and JSON format.');
      ;
    })
    .finally(() => {
      showLoading(false);
    });
}

document.addEventListener('DOMContentLoaded', loadRiddles);
const pref = localStorage.getItem('musicOn');
if (pref === 'true' || pref === null){
    tryStartMusic();
} else{
    setAudioUI(false);
}