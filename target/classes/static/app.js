// Глобальные переменные
let currentUser = null;
let currentPhase = null;
let hasCycleData = false;
let selectedMood = null;
let selectedEnergy = null;
let selectedSymptom = null;
let selectedDayForMark = null;
let cycleMarks = {};

// ===== УПРАВЛЕНИЕ ЭКРАНАМИ =====

// Проверка при загрузке
window.onload = function() {
    const savedUserId = localStorage.getItem('userId');
    if (savedUserId) {
        currentUser = {
            id: parseInt(savedUserId),
            username: localStorage.getItem('username')
        };
        checkCycleData();
    }

    if (Notification.permission !== 'granted') {
        Notification.requestPermission();
    }

    // Загружаем сохраненные отметки
    loadCycleMarks();
};

// Загрузка отметок дней
function loadCycleMarks() {
    const saved = localStorage.getItem('cycleMarks');
    if (saved) {
        cycleMarks = JSON.parse(saved);
    }
}

// Сохранение отметок дней
function saveCycleMarks() {
    localStorage.setItem('cycleMarks', JSON.stringify(cycleMarks));
}

// Проверка, есть ли данные о цикле
async function checkCycleData() {
    try {
        const response = await fetch(`http://localhost:8081/api/cycle/phase/${currentUser.id}`);
        if (response.ok) {
            currentPhase = await response.json();
            hasCycleData = true;
            showMainScreen();
        } else {
            hasCycleData = false;
            showCycleSetup();
        }
    } catch (error) {
        console.error('Ошибка проверки цикла:', error);
        showCycleSetup();
    }
}

function showCycleSetup() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('cycle-setup-screen').classList.add('active');
}

function showMainScreen() {
    document.getElementById('auth-screen').classList.remove('active');
    document.getElementById('cycle-setup-screen').classList.remove('active');
    document.getElementById('main-screen').classList.add('active');
    document.getElementById('username-display').textContent = currentUser.username;
    loadMainData();
}

// Сохранение первичных данных цикла
async function saveInitialCycleData() {
    const date = document.getElementById('setup-lastPeriod').value;
    const length = document.getElementById('setup-cycleLength').value;

    if (!date) {
        alert('Выбери дату начала цикла');
        return;
    }

    try {
        await fetch(`http://localhost:8081/api/cycle/start?userId=${currentUser.id}&date=${date}&length=${length}`, {
            method: 'POST'
        });
        checkCycleData();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка при сохранении данных');
    }
}

// ===== АВТОРИЗАЦИЯ =====
async function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('http://localhost:8081/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username: username, password: password })
        });

        if (response.ok) {
            const user = await response.json();
            currentUser = user;
            localStorage.setItem('userId', user.id);
            localStorage.setItem('username', user.username);

            checkCycleData();
        } else {
            const error = await response.text();
            alert('Ошибка входа: ' + error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось подключиться к серверу');
    }
}

async function register() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const user = {
        username: username,
        passwordHash: password
    };

    try {
        const response = await fetch('http://localhost:8081/api/auth/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(user)
        });

        if (response.ok) {
            alert('✅ Регистрация успешна! Теперь войди.');
        } else {
            const error = await response.text();
            alert('❌ Ошибка регистрации: ' + error);
        }
    } catch (error) {
        console.error('Ошибка:', error);
        alert('Не удалось подключиться к серверу');
    }
}

function logout() {
    localStorage.removeItem('userId');
    localStorage.removeItem('username');
    currentUser = null;
    document.getElementById('main-screen').classList.remove('active');
    document.getElementById('cycle-setup-screen').classList.remove('active');
    document.getElementById('auth-screen').classList.add('active');
    document.getElementById('username').value = '';
    document.getElementById('password').value = '';
}

// ===== ЗАГРУЗКА ДАННЫХ =====
async function loadMainData() {
    await loadPhase();
    updateThoughtBubble();
    renderCalendar();
    await loadNotes();
    await checkTodaySurvey();
}

async function loadPhase() {
    if (!currentUser) return;

    try {
        const response = await fetch(`http://localhost:8081/api/cycle/phase/${currentUser.id}`);
        if (response.ok) {
            currentPhase = await response.json();
            updatePhaseInfo();
        }
    } catch (error) {
        console.error('Ошибка загрузки фазы:', error);
    }
}

function updatePhaseInfo() {
    if (!currentPhase) return;

    const phaseInfo = document.getElementById('phase-info');
    if (!phaseInfo) return;

    const phaseNames = {
        'menstrual': 'Менструальная фаза',
        'follicular': 'Фолликулярная фаза',
        'ovulatory': 'Овуляторная фаза',
        'luteal': 'Лютеиновая фаза'
    };

    phaseInfo.innerHTML = `
        <span class="phase-day">День ${currentPhase.currentDay}</span>
        <span class="phase-name">${phaseNames[currentPhase.phase] || ''}</span>
    `;
}

// ===== ФРАЗЫ ДЛЯ РАЗНЫХ ДНЕЙ ЦИКЛА =====
const phaseMessages = {
    1: "Сегодня первый день цикла. Хочу тепла, внимания и ласки 💕",
    2: "У меня второй день. Немного грустно, обними меня 🤗",
    3: "Третий день. Хочу лежать под пледом и смотреть мультики 🎬",
    4: "День четвертый. Понемногу прихожу в себя, но still нужна забота 🌸",
    5: "Пятый день. Уже лучше, но чай с шоколадкой не помешает ☕",
    6: "Шестой день! Появляются силы, хочется гулять 🌞",
    7: "Неделя прошла! Я снова полна энергии ⚡",
    8: "Восьмой день. Отличное время для новых дел! ✨",
    9: "День девятый. Я активна и весела, давай приключение! 🎉",
    10: "Десятый день. Хочется творить и радоваться жизни 🎨",
    11: "11 день. Я просто счастлива быть с тобой 💖",
    12: "12 день. Энергия бьет ключом! Чем займемся? 💫",
    13: "13 день. Я особенно нежна и романтична сегодня 🌹",
    14: "14 день - овуляция! Я игрива и полна любви 💝",
    15: "15 день. Все еще в отличном настроении, но чуть спокойнее 🍃",
    16: "16 день. Хороший день для объятий и разговоров 💬",
    17: "17 день. Начинаю чуть-чуть уставать, будь рядом 🌙",
    18: "18 день. Хочу вкусняшек и твоего внимания 🍪",
    19: "19 день. Немного капризная сегодня, но все еще люблю тебя 😊",
    20: "20 день. Может, посмотрим фильм и просто побудем вместе? 📺",
    21: "21 день. Уровень нежности повышен, обнимашки приветствуются 🫂",
    22: "22 день. Чувствительная сегодня, говори мне приятные слова 💌",
    23: "23 день. Хочется уюта и спокойствия. Обними меня покрепче 🤗",
    24: "24 день. Предменструальный синдром на подходе, будь терпелив 🌧️",
    25: "25 день. Могу быть немного раздражительной, но это не про нас 😅",
    26: "26 день. Хочется плакать и смеяться одновременно. Просто прижми меня 🤍",
    27: "27 день. Скоро, скоро... Будь особенно внимателен 💫",
    28: "28 день. Завтра новый цикл. Спасибо, что был со мной весь месяц 🌈"
};

// Обновление сообщения в облачке
function updateThoughtBubble() {
    if (!currentPhase) return;

    const bubble = document.getElementById('main-thought-bubble');
    const day = currentPhase.currentDay;

    let message = phaseMessages[day];
    if (!message) {
        switch(currentPhase.phase) {
            case 'menstrual':
                message = "У меня красные деньки. Хочу тепла и заботы 🌸";
                break;
            case 'follicular':
                message = "Я полна энергии! Давай делать что-то интересное ✨";
                break;
            case 'ovulatory':
                message = "Я сегодня особенно нежная. Люблю тебя! 💕";
                break;
            case 'luteal':
                message = "Немного устала. Побудь со мной рядом 🤗";
                break;
            default:
                message = "Хочу твоей заботы и внимания! 🌟";
        }
    }

    bubble.textContent = message;

    const kittyImage = document.getElementById('main-kitty-image');
    switch(currentPhase.mood) {
        case 'happy':
            kittyImage.src = 'icons/kitty_happy.png';
            break;
        case 'sad':
            kittyImage.src = 'icons/kitty_sad.png';
            break;
        case 'playful':
            kittyImage.src = 'icons/kitty_playful.png';
            break;
        case 'irritated':
            kittyImage.src = 'icons/kitty_irritated.png';
            break;
        default:
            kittyImage.src = 'icons/icon-512.png';
    }
}

// ===== КАЛЕНДАРЬ =====
function renderCalendar() {
    if (!currentPhase) return;

    const calendarGrid = document.getElementById('calendar-grid');
    if (!calendarGrid) return;

    const cycleLength = currentPhase.cycleLength;
    const currentDay = currentPhase.currentDay;

    let html = '';

    // Добавляем названия дней недели
    const weekdays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'];
    weekdays.forEach(day => {
        html += `<div class="weekday">${day}</div>`;
    });

    // Определяем первый день цикла (для простоты начинаем с понедельника)
    const firstDayOffset = 0; // 0 = понедельник

    // Пустые ячейки до первого дня
    for (let i = 0; i < firstDayOffset; i++) {
        html += '<div class="calendar-day empty"></div>';
    }

    // Дни цикла
    for (let day = 1; day <= cycleLength; day++) {
        let dayClass = 'calendar-day';

        // Определяем класс в зависимости от фазы
        if (day <= 5) dayClass += ' period';
        else if (day <= 13) dayClass += ' follicular';
        else if (day <= 16) dayClass += ' ovulation';
        else dayClass += ' luteal';

        // Добавляем класс для сегодняшнего дня
        if (day === currentDay) {
            dayClass += ' today';
        }

        // Добавляем отметки пользователя
        const date = getDateForDay(day);
        const mark = cycleMarks[date];
        if (mark) {
            dayClass += ` ${mark}`;
        }

        html += `<div class="${dayClass}" onclick="openDayMarkModal(${day})">${day}</div>`;
    }

    calendarGrid.innerHTML = html;
}

function getDateForDay(day) {
    if (!currentPhase || !currentPhase.lastPeriodDate) return '';

    const lastPeriod = new Date(currentPhase.lastPeriodDate);
    const targetDate = new Date(lastPeriod);
    targetDate.setDate(lastPeriod.getDate() + (day - 1));

    return targetDate.toISOString().split('T')[0];
}

// ===== МОДАЛЬНОЕ ОКНО ДЛЯ ОТМЕТОК =====
function openDayMarkModal(day) {
    selectedDayForMark = day;
    const date = getDateForDay(day);
    document.getElementById('selectedDayDate').textContent = date;
    document.getElementById('dayMarkModal').style.display = 'flex';
}

function closeDayMarkModal() {
    document.getElementById('dayMarkModal').style.display = 'none';
    selectedDayForMark = null;
}

function markDay(type) {
    if (!selectedDayForMark) return;

    const date = getDateForDay(selectedDayForMark);

    // Удаляем предыдущую отметку для этого дня, если она была
    if (cycleMarks[date] === type) {
        delete cycleMarks[date];
    } else {
        cycleMarks[date] = type;
    }

    saveCycleMarks();
    closeDayMarkModal();
    renderCalendar(); // Обновляем календарь
}

// ===== УПРАВЛЕНИЕ ОПРОСАМИ =====
function toggleMoodOptions() {
    document.getElementById('mood-options').style.display = 'block';
    document.getElementById('energy-options').style.display = 'none';
    document.getElementById('symptom-options').style.display = 'none';
}

function toggleEnergyOptions() {
    document.getElementById('mood-options').style.display = 'none';
    document.getElementById('energy-options').style.display = 'block';
    document.getElementById('symptom-options').style.display = 'none';
}

function toggleSymptomOptions() {
    document.getElementById('mood-options').style.display = 'none';
    document.getElementById('energy-options').style.display = 'none';
    document.getElementById('symptom-options').style.display = 'block';
}

function selectMood(mood) {
    selectedMood = mood;
    const moodNames = {
        'happy': '😊 Счастливая',
        'sad': '😢 Грустная',
        'irritated': '😠 Раздражительная',
        'playful': '🎈 Игривая',
        'tired': '😴 Уставшая'
    };
    document.getElementById('mood-value').textContent = moodNames[mood];
    document.getElementById('mood-options').style.display = 'none';
}

function selectEnergy(energy) {
    selectedEnergy = energy;
    const energyNames = {
        'high': '⚡ Много энергии',
        'medium': '✨ Средне',
        'low': '😴 Хочу спать',
        'tired': '🛋️ Упадок сил'
    };
    document.getElementById('energy-value').textContent = energyNames[energy];
    document.getElementById('energy-options').style.display = 'none';
}

function selectSymptom(symptom) {
    selectedSymptom = symptom;
    const symptomNames = {
        'none': '✅ Все ок',
        'cramps': '😖 Болит животик',
        'headache': '🤕 Головная боль',
        'backpain': '🔴 Болит спина',
        'bloating': '🎈 Вздутие'
    };
    document.getElementById('symptom-value').textContent = symptomNames[symptom];
    document.getElementById('symptom-options').style.display = 'none';
}

async function submitSurveyFromMain() {
    if (!selectedMood || !selectedEnergy || !selectedSymptom) {
        alert('Пожалуйста, выбери все пункты!');
        return;
    }

    const survey = {
        userId: currentUser.id,
        mood: selectedMood,
        energy: selectedEnergy,
        symptom: selectedSymptom,
        date: new Date().toISOString().split('T')[0]
    };

    try {
        await fetch('http://localhost:8081/api/survey', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(survey)
        });

        alert('✅ Спасибо! Теперь я знаю, как себя чувствует Китти');

        selectedMood = selectedEnergy = selectedSymptom = null;
        document.getElementById('mood-value').textContent = 'Не выбрано';
        document.getElementById('energy-value').textContent = 'Не выбрано';
        document.getElementById('symptom-value').textContent = 'Не выбрано';

    } catch (error) {
        console.error('Ошибка:', error);
        alert('Ошибка при отправке');
    }
}

async function checkTodaySurvey() {
    try {
        const response = await fetch(`http://localhost:8081/api/survey/${currentUser.id}/today`);
        if (response.ok) {
            document.querySelector('.survey-submit-btn').disabled = true;
            document.querySelector('.survey-submit-btn').textContent = '✅ Уже ответил сегодня';
        }
    } catch (error) {
        console.error('Ошибка:', error);
    }
}

// ===== ЗАМЕТКИ =====
async function addNoteFromMain() {
    const content = document.getElementById('main-note-input').value;
    if (!content.trim()) return;

    const today = new Date().toISOString().split('T')[0];
    const todayNotesCount = await getTodayNotesCount();

    if (todayNotesCount >= 10) {
        alert('❌ Сегодня уже 10 заметок. Завтра будет новый день!');
        return;
    }

    const now = new Date();
    const moscowTime = new Date(now.toLocaleString('en-US', { timeZone: 'Europe/Moscow' }));
    const timeString = moscowTime.toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    const note = {
        userId: currentUser.id,
        content: content,
        date: today,
        time: timeString
    };

    try {
        await fetch('http://localhost:8081/api/notes', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(note)
        });

        document.getElementById('main-note-input').value = '';
        await loadNotes(); // Ждем загрузки заметок

    } catch (error) {
        console.error('Ошибка:', error);
    }
}

async function getTodayNotesCount() {
    try {
        const response = await fetch(`http://localhost:8081/api/notes/${currentUser.id}`);
        const notes = await response.json();
        const today = new Date().toISOString().split('T')[0];

        return notes.filter(note => note.date === today).length;
    } catch (error) {
        console.error('Ошибка подсчета заметок:', error);
        return 0;
    }
}

async function loadNotes() {
    if (!currentUser) return;

    try {
        const response = await fetch(`http://localhost:8081/api/notes/${currentUser.id}`);
        const notes = await response.json();
        renderNotes(notes);
    } catch (error) {
        console.error('Ошибка загрузки заметок:', error);
    }
}

function renderNotes(notes) {
    const list = document.getElementById('main-notes-list');
    if (!list) return;

    // Удаляем старый счетчик, если есть
    const oldCounter = list.parentElement.querySelector('.today-counter');
    if (oldCounter) oldCounter.remove();

    if (!notes || notes.length === 0) {
        list.innerHTML = '<div class="empty-notes">📝 Пока нет заметок</div>';
        return;
    }

    // Сортируем: сначала новые по дате и времени
    notes.sort((a, b) => {
        // Сначала сравниваем даты
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;

        // Если даты одинаковые, сравниваем время
        const timeA = a.time || '00:00:00';
        const timeB = b.time || '00:00:00';
        return timeB.localeCompare(timeA);
    });

    list.innerHTML = notes.map(note => {
        const date = new Date(note.date).toLocaleDateString('ru-RU');
        const time = note.time || '00:00:00';

        return `
        <div class="note-item">
            <div style="flex: 1">
                <div class="note-date-time">${date} ${time}</div>
                <div class="note-content">${note.content}</div>
            </div>
            <button onclick="deleteNote(${note.id})" class="delete-note">✖</button>
        </div>
    `}).join('');

    // Добавляем счетчик заметок за сегодня
    const today = new Date().toISOString().split('T')[0];
    const todayNotes = notes.filter(n => n.date === today);
    const counter = document.createElement('div');
    counter.className = 'today-counter';
    counter.innerHTML = `📝 Сегодня: ${todayNotes.length}/10 заметок`;
    list.parentElement.insertBefore(counter, list);
}

async function deleteNote(noteId) {
    try {
        await fetch(`http://localhost:8081/api/notes/${noteId}`, {
            method: 'DELETE'
        });
        await loadNotes();
    } catch (error) {
        console.error('Ошибка удаления:', error);
    }
}

// Закрытие модального окна при клике вне его
window.onclick = function(event) {
    const modal = document.getElementById('dayMarkModal');
    if (event.target === modal) {
        closeDayMarkModal();
    }
};