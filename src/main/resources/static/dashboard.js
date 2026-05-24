const API_BASE_URL = '';
let currentUser = null;
let currentPhase = null;
let selectedMood = null;
let selectedEnergy = null;
let selectedSymptom = null;
let selectedDayForMark = null;
let cycleMarks = {};
let hasSurveyToday = false;
let allSurveys = [];

function loadCycleMarks() {
    const saved = localStorage.getItem('cycleMarks');
    if (saved) cycleMarks = JSON.parse(saved);
}
function saveCycleMarks() {
    localStorage.setItem('cycleMarks', JSON.stringify(cycleMarks));
}

async function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
}

async function checkAuth() {
    const userId = localStorage.getItem('userId');
    if (!userId) { window.location.href = 'login.html'; return; }
    currentUser = { id: parseInt(userId), username: localStorage.getItem('username') };
    document.getElementById('username-display').textContent = currentUser.username;
    loadCycleMarks();
    await loadPhase();
    renderCalendar();
    updateThoughtBubble();
    updateCycleCountdown();
    await loadNotes();
    await loadAllSurveys();
    await checkTodaySurvey();
}

async function loadPhase() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/cycle/phase/${currentUser.id}`);
        if (res.ok) currentPhase = await res.json();
        else window.location.href = 'check-cycle.html';
    } catch(e) { console.error(e); }
}

function openPhaseInfo() {
    if (!currentPhase) return;
    const phases = {
        menstrual: '🌸 Менструальная (1-5 дн): усталость, чувствительность. Поддержка: чай, плед, терпение.',
        follicular: '🍃 Фолликулярная (6-13 дн): энергия растёт. Время для планов и активности.',
        ovulatory: '⭐ Овуляторная (14-16 дн): пик энергии, романтика, комплименты.',
        luteal: '🌙 Лютеиновая (17-28 дн): перепады настроения. Будь рядом, не дави.'
    };
    alert(phases[currentPhase.phase] || 'Фаза цикла');
}

const phaseMessages = {
    1: "🌸 Китти: Сегодня первый день цикла. Я чувствую усталость и хочу тепла. Пожалуйста, укрой меня пледом и подари чай с шоколадкой. Обними меня покрепче! 💕",
    2: "😢 Китти: Второй день цикла. Мне немного грустно и хочется тишины. Посиди со мной рядом, не говори много. Просто побудь здесь. Обними меня! 🤗",
    3: "🎬 Китти: Третий день. У меня болит животик, и я хочу лежать под пледом. Давай посмотрим вместе мультики или кино? Твоя забота меня согревает! 🎬",
    4: "🌸 Китти: Четвертый день. Я понемногу прихожу в себя, но всё ещё нуждаюсь в твоей заботе. Сделай мне чай и скажи что-то тёплое. 🌸",
    5: "☕ Китти: Пятый день. Уже лучше, но чашка горячего чая и кусочек шоколада поднимут мне настроение. Спасибо, что ты рядом! ☕",
    6: "🌞 Китти: Шестой день! Энергия возвращается! Мне хочется гулять на свежем воздухе. Давай устроим небольшую прогулку вместе? 🌞",
    7: "⚡ Китти: Целая неделя прошла! Я снова полна сил и энергии. Давай запланируем что-то интересное на ближайшие дни! ⚡",
    8: "✨ Китти: Восьмой день цикла. Отличное время для новых дел и начинаний. Поддержи меня в моих идеях! ✨",
    9: "🎉 Китти: День девятый. Я активна и весела, давай устроим небольшое приключение или сходим в кафе! 🎉",
    10: "🎨 Китти: Десятый день. Хочется творить, создавать красоту. Похвали мои старания, это очень важно для меня сейчас. 🎨",
    11: "💖 Китти: 11 день. Я просто счастлива быть с тобой. Скажи мне что-нибудь приятное, я жду твоих комплиментов! 💖",
    12: "💫 Китти: 12 день. Энергия бьет ключом! Чем мы займемся сегодня? Я открыта для любых идей! 💫",
    13: "🌹 Китти: 13 день. Я особенно нежна и романтична сегодня. Устрой мне маленький романтический сюрприз! 🌹",
    14: "💝 Китти: 14 день - овуляция! Я игрива и полна любви. Обнимашки и ласка сейчас лучше всего! 💝",
    15: "🍃 Китти: 15 день. Всё ещё в отличном настроении, но немного спокойнее. Посидим вместе в тишине? 🍃",
    16: "💬 Китти: 16 день. Хороший день для объятий и душевных разговоров. Давай поболтаем о важном! 💬",
    17: "🌙 Китти: 17 день. Начинаю чуть-чуть уставать. Просто будь рядом, ничего не говори. Мне важно твоё присутствие. 🌙",
    18: "🍪 Китти: 18 день. Хочу вкусняшек и твоего внимания. Угости меня чем-нибудь сладким, пожалуйста! 🍪",
    19: "😊 Китти: 19 день. Немного капризная сегодня, но это не значит, что я тебя не люблю. Просто прижми меня к себе. 😊",
    20: "📺 Китти: 20 день. Может, посмотрим фильм и просто побудем вместе? Мне нужно твоё тепло. 📺",
    21: "🫂 Китти: 21 день. Уровень нежности повышен, обнимашки приветствуются. Не отпускай меня сегодня! 🫂",
    22: "💌 Китти: 22 день. Я очень чувствительная сегодня. Говори мне приятные слова, они значат для меня очень много! 💌",
    23: "🤗 Китти: 23 день. Хочется уюта и спокойствия. Обними меня покрепче и ничего не требуй. 🤗",
    24: "🌧️ Китти: 24 день. Предменструальный синдром на подходе. Я могу быть раздражительной, но это не против тебя. Пожалуйста, будь терпелив. 🌧️",
    25: "😅 Китти: 25 день. Могу быть немного капризной, но это пройдет. Просто люби меня сегодня, даже если я ворчу. 😅",
    26: "🤍 Китти: 26 день. Мне хочется плакать и смеяться одновременно. Просто прижми меня к себе и ничего не говори. 🤍",
    27: "💫 Китти: 27 день. Скоро новый цикл. Будь особенно внимателен и нежен со мной. Я это очень ценю. 💫",
    28: "🌈 Китти: 28 день. Спасибо, что был со мной весь этот месяц. Твоя забота делает меня счастливой! 🌈"
};

function updateThoughtBubble() {
    if (!currentPhase) return;
    const day = currentPhase.currentDay;
    let msg = phaseMessages[day];
    if (!msg) {
        if (currentPhase.phase === 'menstrual') msg = "🌸 Китти: У меня красные деньки. Хочу тепла и заботы. Пожалуйста, будь нежен и терпелив со мной!";
        else if (currentPhase.phase === 'follicular') msg = "✨ Китти: Я полна энергии! Давай делать что-то интересное вместе, поддержи мои идеи!";
        else if (currentPhase.phase === 'ovulatory') msg = "💕 Китти: Я сегодня особенно нежная. Люблю тебя! Скажи мне что-нибудь приятное, я жду!";
        else msg = "🤗 Китти: Немного устала. Побудь со мной рядом, обними меня, мне нужно твоё тепло.";
    }
    const bubble = document.getElementById('main-thought-bubble');
    if (bubble) bubble.textContent = msg;
    const kitty = document.getElementById('main-kitty-image');
    if (kitty) {
        const moodMap = { happy:'kitty_happy.png', sad:'kitty_sad.png', playful:'kitty_playful.png', irritated:'kitty_irritated.png' };
        kitty.src = `icons/${moodMap[currentPhase.mood] || 'icon-512.png'}`;
    }
}

function getDateForDay(day) {
    if (!currentPhase || !currentPhase.nextPeriodDate) return '';
    const next = new Date(currentPhase.nextPeriodDate);
    const target = new Date(next);
    target.setDate(next.getDate() - (currentPhase.cycleLength - day));
    return target.toISOString().split('T')[0];
}

function updateCycleCountdown() {
    if (!currentPhase) return;
    const container = document.getElementById('countdown-container');
    if (!container) return;
    const curDay = currentPhase.currentDay;
    const cycleLen = currentPhase.cycleLength;
    let text = '';
    let days = 0;
    if (curDay > 5 && curDay <= 14) {
        days = 14 - curDay;
        if (days > 0) text = `🌸 Овуляция через ${days} ${getDayWord(days)}`;
        else if (days === 0) text = `🌸 Овуляция сегодня!`;
    } else if (curDay >= cycleLen - 6) {
        days = cycleLen - curDay;
        if (days > 0) text = `🩸 Менструация через ${days} ${getDayWord(days)}`;
        else if (days === 0) text = `🩸 Менструация сегодня!`;
    }
    container.textContent = text;
}

function getDayWord(days) {
    if (days % 10 === 1 && days % 100 !== 11) return 'день';
    if ([2,3,4].includes(days % 10) && ![12,13,14].includes(days % 100)) return 'дня';
    return 'дней';
}

function renderCalendar() {
    if (!currentPhase) return;
    const grid = document.getElementById('calendar-grid');
    if (!grid) return;
    const len = currentPhase.cycleLength;
    const curDay = currentPhase.currentDay;
    const phaseDayEl = document.getElementById('phase-day-number');
    const phaseNameEl = document.getElementById('phase-name-text');

    if (phaseDayEl) {
        phaseDayEl.textContent = `День ${curDay}`;
        phaseDayEl.className = `phase-day-number ${currentPhase.phase}`;
    }
    if (phaseNameEl) {
        const names = { menstrual:'🌸 Менструальная фаза', follicular:'🍃 Фолликулярная фаза', ovulatory:'⭐ Овуляторная фаза', luteal:'🌙 Лютеиновая фаза' };
        phaseNameEl.textContent = names[currentPhase.phase] || '';
        phaseNameEl.className = `phase-name-text ${currentPhase.phase}`;
    }

    const phaseCard = document.querySelector('.phase-card');
    if (phaseCard) {
        if (currentPhase.phase === 'menstrual') phaseCard.style.backgroundColor = '#ffb6c1';
        else if (currentPhase.phase === 'follicular') phaseCard.style.backgroundColor = '#ccffcc';
        else if (currentPhase.phase === 'ovulatory') phaseCard.style.backgroundColor = '#ffffcc';
        else if (currentPhase.phase === 'luteal') phaseCard.style.backgroundColor = '#e6ccff';
        else phaseCard.style.backgroundColor = 'white';
    }

    let html = '';
    for (let d=1; d<=len; d++) {
        let cls = 'day-button';
        if (d<=5) cls += ' period';
        else if (d<=13) cls += ' follicular';
        else if (d<=16) cls += ' ovulation';
        else cls += ' luteal';

        if (d === curDay) {
            cls += ' today';
            if (d<=5) cls += ' period';
            else if (d<=13) cls += ' follicular';
            else if (d<=16) cls += ' ovulation';
            else cls += ' luteal';
        }

        const date = getDateForDay(d);
        const mark = cycleMarks[date];
        let emoji = '';
        if (mark) {
            if (mark === 'period') emoji = '🩸';
            else if (mark === 'sex_protected') emoji = '🔒';
            else if (mark === 'sex_unprotected') emoji = '💕';
            else if (mark === 'ovulation') emoji = '✨';
            else if (mark === 'pms') emoji = '☁️';
            cls += ` ${mark}`;
        }
        html += `<div class="${cls}" onclick="openDayMarkModal(${d})">${d}${emoji ? `<span style="font-size:9px; margin-left:2px;">${emoji}</span>` : ''}</div>`;
    }
    grid.innerHTML = html;
}

function openDayMarkModal(day) {
    selectedDayForMark = day;
    const span = document.getElementById('selectedDayDate');
    if (span) span.textContent = getDateForDay(day);
    const modal = document.getElementById('dayMarkModal');
    if (modal) modal.style.display = 'flex';
}
function closeDayMarkModal() {
    const modal = document.getElementById('dayMarkModal');
    if (modal) modal.style.display = 'none';
    selectedDayForMark = null;
}
function markDay(type) {
    if (!selectedDayForMark) return;
    const date = getDateForDay(selectedDayForMark);
    if (cycleMarks[date] === type) delete cycleMarks[date];
    else cycleMarks[date] = type;
    if (type === 'period') {
        fetch(`${API_BASE_URL}/api/cycle/start?userId=${currentUser.id}&date=${date}&length=${currentPhase.cycleLength}`, { method: 'POST' })
            .then(() => loadPhase());
    }
    saveCycleMarks();
    closeDayMarkModal();
    renderCalendar();
    updateCycleCountdown();
}

document.addEventListener('click', function(e) {
    if (!e.target.closest('.survey-block')) {
        const moodOpt = document.getElementById('mood-options');
        const energyOpt = document.getElementById('energy-options');
        const symptomOpt = document.getElementById('symptom-options');
        if (moodOpt) moodOpt.style.display = 'none';
        if (energyOpt) energyOpt.style.display = 'none';
        if (symptomOpt) symptomOpt.style.display = 'none';
    }
});

function toggleMoodOptions() { if (hasSurveyToday) return; document.getElementById('mood-options').style.display = 'block'; document.getElementById('energy-options').style.display = 'none'; document.getElementById('symptom-options').style.display = 'none'; }
function toggleEnergyOptions() { if (hasSurveyToday) return; document.getElementById('mood-options').style.display = 'none'; document.getElementById('energy-options').style.display = 'block'; document.getElementById('symptom-options').style.display = 'none'; }
function toggleSymptomOptions() { if (hasSurveyToday) return; document.getElementById('mood-options').style.display = 'none'; document.getElementById('energy-options').style.display = 'none'; document.getElementById('symptom-options').style.display = 'block'; }

function selectMood(m) { if (hasSurveyToday) return; selectedMood = m; const names = { happy:'😊 Счастливая', sad:'😢 Грустная', irritated:'😠 Раздражительная', playful:'🎈 Игривая', tired:'😴 Уставшая' }; document.getElementById('mood-value').textContent = names[m]; document.getElementById('mood-options').style.display = 'none'; }
function selectEnergy(e) { if (hasSurveyToday) return; selectedEnergy = e; const names = { high:'⚡ Много энергии', medium:'✨ Средне', low:'😴 Хочу спать', tired:'🛋️ Упадок сил' }; document.getElementById('energy-value').textContent = names[e]; document.getElementById('energy-options').style.display = 'none'; }
function selectSymptom(s) { if (hasSurveyToday) return; selectedSymptom = s; const names = { none:'✅ Все ок', cramps:'😖 Болит животик', headache:'🤕 Головная боль', backpain:'🔴 Болит спина', bloating:'🎈 Вздутие' }; document.getElementById('symptom-value').textContent = names[s]; document.getElementById('symptom-options').style.display = 'none'; }

async function submitSurvey() {
    if (hasSurveyToday) { alert('Ты уже отвечал сегодня!'); return; }
    if (!selectedMood || !selectedEnergy || !selectedSymptom) { alert('Выбери все пункты'); return; }
    try {
        await fetch(`${API_BASE_URL}/api/survey`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ userId: currentUser.id, mood: selectedMood, energy: selectedEnergy, symptom: selectedSymptom, date: new Date().toISOString().split('T')[0] }) });
        alert('Спасибо! Состояние сохранено.');
        hasSurveyToday = true;
        document.querySelectorAll('.survey-block').forEach(block => block.classList.add('disabled'));
        const btn = document.querySelector('.survey-submit-btn'); if (btn) { btn.disabled = true; btn.textContent = '✅ Уже ответил сегодня'; }
        await loadAllSurveys();
    } catch(e) { alert('Ошибка'); }
}

async function checkTodaySurvey() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/survey/${currentUser.id}/today`);
        if (res.ok) {
            hasSurveyToday = true;
            document.querySelectorAll('.survey-block').forEach(block => block.classList.add('disabled'));
            const btn = document.querySelector('.survey-submit-btn'); if (btn) { btn.disabled = true; btn.textContent = '✅ Уже ответил сегодня'; }
        }
    } catch(e) {}
}

async function loadAllSurveys() {
    try {
        const res = await fetch(`${API_BASE_URL}/api/survey/history/${currentUser.id}`);
        if (res.ok) allSurveys = await res.json();
        else allSurveys = [];
    } catch(e) { allSurveys = []; }
    renderTables();
}

function renderTables() {
    // Таблица настроения
    const moodContainer = document.getElementById('mood-table-container');
    // Таблица энергии
    const energyContainer = document.getElementById('energy-table-container');
    // Таблица самочувствия
    const symptomContainer = document.getElementById('symptom-table-container');

    if (!allSurveys || allSurveys.length === 0) {
        moodContainer.innerHTML = '<div class="empty-table">Нет данных</div>';
        energyContainer.innerHTML = '<div class="empty-table">Нет данных</div>';
        symptomContainer.innerHTML = '<div class="empty-table">Нет данных</div>';
        return;
    }

    const moodNames = { happy:'😊 Счастливая', sad:'😢 Грустная', irritated:'😠 Раздражительная', playful:'🎈 Игривая', tired:'😴 Уставшая' };
    const energyNames = { high:'⚡ Много энергии', medium:'✨ Средне', low:'😴 Хочу спать', tired:'🛋️ Упадок сил' };
    const symptomNames = { none:'✅ Все ок', cramps:'😖 Болит животик', headache:'🤕 Головная боль', backpain:'🔴 Болит спина', bloating:'🎈 Вздутие' };

    const sorted = [...allSurveys].sort((a,b) => new Date(b.date) - new Date(a.date));

    let moodHtml = '<table class="dynamics-table"><thead><tr><th>Дата</th><th>Настроение</th></tr></thead><tbody>';
    let energyHtml = '<table class="dynamics-table"><thead><tr><th>Дата</th><th>Энергия</th></tr></thead><tbody>';
    let symptomHtml = '<table class="dynamics-table"><thead><tr><th>Дата</th><th>Самочувствие</th></tr></thead><tbody>';

    for (const s of sorted) {
        const date = new Date(s.date).toLocaleDateString('ru-RU');
        moodHtml += `<tr><td>${date}</td><td>${moodNames[s.mood] || '?'}</td></tr>`;
        energyHtml += `<tr><td>${date}</td><td>${energyNames[s.energy] || '?'}</td></tr>`;
        symptomHtml += `<tr><td>${date}</td><td>${symptomNames[s.symptom] || '?'}</td></tr>`;
    }

    moodHtml += '</tbody></table>';
    energyHtml += '</tbody></table>';
    symptomHtml += '</tbody></table>';

    moodContainer.innerHTML = moodHtml;
    energyContainer.innerHTML = energyHtml;
    symptomContainer.innerHTML = symptomHtml;
}

async function addNote() { const textarea = document.getElementById('main-note-input'); if (!textarea) return; const content = textarea.value.trim(); if (!content) { alert('Напиши заметку'); return; } const today = new Date().toISOString().split('T')[0]; const note = { userId: currentUser.id, content, date: today }; try { const response = await fetch(`${API_BASE_URL}/api/notes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(note) }); if (response.ok) { textarea.value = ''; await loadNotes(); } else { alert('Ошибка сохранения'); } } catch(e) { alert('Ошибка соединения'); } }
function renderNotes(notes) { const container = document.getElementById('main-notes-list'); if (!container) return; const oldCounter = container.parentElement.querySelector('.today-counter'); if (oldCounter) oldCounter.remove(); if (!notes || notes.length === 0) { container.innerHTML = '<div class="empty-notes">📝 Пока нет заметок</div>'; updateNotesCounter(0); return; } const sorted = [...notes].sort((a,b) => new Date(b.date) - new Date(a.date)); let html = ''; for (const n of sorted) { const date = new Date(n.date).toLocaleDateString('ru-RU'); html += `<div class="note-item"><div style="flex:1"><div class="note-date-time">${date}</div><div class="note-content">${escapeHtml(n.content)}</div></div><button class="delete-note" onclick="deleteNote(${n.id})">✖</button></div>`; } container.innerHTML = html; updateNotesCounter(notes.length); }
function updateNotesCounter(cnt) { const container = document.getElementById('main-notes-list'); if (!container) return; const parent = container.parentElement; const existing = parent.querySelector('.today-counter'); if (existing) existing.remove(); const counter = document.createElement('div'); counter.className = 'today-counter'; counter.innerHTML = `📝 Всего заметок: ${cnt}`; parent.insertBefore(counter, container); }
async function loadNotes() { if (!currentUser) return; try { const res = await fetch(`${API_BASE_URL}/api/notes/${currentUser.id}`); if (!res.ok) { renderNotes([]); return; } const notes = await res.json(); renderNotes(notes); } catch(e) { renderNotes([]); } }
async function deleteNote(nid) { if (!confirm('Удалить заметку?')) return; try { await fetch(`${API_BASE_URL}/api/notes/${nid}`, { method: 'DELETE' }); await loadNotes(); } catch(e) { alert('Ошибка'); } }
function escapeHtml(s) { if (!s) return ''; return s.replace(/[&<>]/g, function(m) { return { '&':'&amp;', '<':'&lt;', '>':'&gt;' }[m]; }); }

window.onclick = function(e) { if (e.target === document.getElementById('dayMarkModal')) closeDayMarkModal(); };
window.onload = checkAuth;