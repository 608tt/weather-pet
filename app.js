const scenes = {
  sunny: {image: 'scene-sunny-cat.jpg', alt: '阳光下晒太阳的橘猫', weather: '☀️ 28°C · 模拟', message: '先开始一小步，阳光陪着你。'},
  rainy: {image: 'scene-rainy-cat.jpg', alt: '雨天躲在猫窝里的橘猫', weather: '🌧️ 19°C · 模拟', message: '雨声慢慢落下，给自己一点耐心。'},
  fish: {image: 'scene-sunny-fish.jpg', alt: '水族箱里游动的小金鱼', weather: '💧 25°C · 模拟', message: '安静陪伴，完成眼前这一件小事。'},
  night: {image: 'scene-night-dog.jpg', alt: '夜晚仰望星空的小腊肠', weather: '🌙 22°C · 模拟', message: '今天也在往前走，慢慢收尾吧。'}
};
const pets = {cat: '橘座', fish: '小金鱼', dog: '小腊肠'};
const storageKey = 'weather-pet:v1';
let storageAvailable = true;
let initial;
try { initial = JSON.parse(localStorage.getItem(storageKey)); }
catch { storageAvailable = false; }
let state = PetCore.normalize(initial);
const $ = id => document.getElementById(id);

function save() {
  try { localStorage.setItem(storageKey, JSON.stringify(state)); }
  catch { storageAvailable = false; $('focus-status').textContent = '浏览器保存不可用；当前会话仍可使用。'; }
}

function renderScene() {
  const scene = scenes[state.scene];
  $('scene-image').src = `assets/${scene.image}`;
  $('scene-image').alt = scene.alt;
  $('scene-image').className = `scene-image ${state.scene}`;
  $('widget').className = `widget ${state.scene}`;
  $('weather').textContent = scene.weather;
  $('pet-line').textContent = `${pets[state.pet]} · 陪伴你`;
  $('message').textContent = scene.message;
  document.querySelectorAll('[data-scene]').forEach(button => {
    const active = button.dataset.scene === state.scene;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  document.querySelectorAll('[data-pet]').forEach(button => {
    const active = button.dataset.pet === state.pet;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
}

function renderTasks() {
  $('task-list').replaceChildren();
  for (const task of state.tasks) {
    const li = document.createElement('li');
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox'; checkbox.checked = task.done;
    checkbox.id = `task-${task.id}`;
    checkbox.addEventListener('change', () => {task.done = checkbox.checked; save(); renderTasks();});
    const label = document.createElement('label');
    label.htmlFor = checkbox.id; label.textContent = task.text;
    if (task.done) label.style.textDecoration = 'line-through';
    const remove = document.createElement('button');
    remove.type = 'button'; remove.textContent = '×';
    remove.setAttribute('aria-label', `删除任务：${task.text}`);
    remove.addEventListener('click', () => {state.tasks = state.tasks.filter(t => t.id !== task.id); save(); renderTasks();});
    li.append(checkbox, label, remove); $('task-list').append(li);
  }
  $('task-empty').hidden = state.tasks.length > 0;
  const next = state.tasks.find(task => !task.done);
  $('agenda-title').textContent = next ? '下一件小事' : '留一段空白';
  $('agenda-text').textContent = next ? next.text : '慢慢开始，或者休息一下。';
}

function tick() {
  const now = new Date();
  document.querySelector('.phone-status span').textContent = new Intl.DateTimeFormat('zh-CN', {hour: '2-digit', minute: '2-digit', hour12: false}).format(now);
  document.querySelector('.date').textContent = new Intl.DateTimeFormat('zh-CN', {month: 'long', day: 'numeric', weekday: 'long'}).format(now);
  const left = PetCore.remaining(state.focus, Date.now());
  if (state.focus.deadline !== null && left === 0) {
    state.focus = {deadline: null, remaining: 0};
    $('focus-status').textContent = '这一段专注完成了。停下来，看看自己走了多远。';
    save();
  }
  $('timer').textContent = PetCore.display(left);
  $('focus-toggle').textContent = state.focus.deadline !== null ? '暂停' : left === 0 ? '再开始一次' : '开始专注';
  $('duration').disabled = state.focus.deadline !== null;
}

document.querySelectorAll('[data-scene]').forEach(button => button.addEventListener('click', () => {
  state.scene = button.dataset.scene;
  state.pet = ({sunny: 'cat', rainy: 'cat', fish: 'fish', night: 'dog'})[state.scene];
  save(); renderScene();
}));
document.querySelectorAll('[data-pet]').forEach(button => button.addEventListener('click', () => {
  state.pet = button.dataset.pet;
  state.scene = ({cat: 'sunny', fish: 'fish', dog: 'night'})[state.pet];
  save(); renderScene();
}));
$('task-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('task-input').value.trim();
  if (!text) return;
  if (state.tasks.length >= 100) {$('focus-status').textContent = '先整理已有任务，最多保存 100 件小事。'; return;}
  const id = globalThis.crypto?.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  state.tasks.push({id, text: text.slice(0, 160), done: false});
  $('task-input').value = ''; save(); renderTasks();
});
$('duration').value = String(state.duration);
$('duration').addEventListener('change', () => {
  state.duration = Number($('duration').value);
  state.focus = {deadline: null, remaining: state.duration * 60000};
  save(); tick();
});
$('focus-toggle').addEventListener('click', () => {
  if (PetCore.remaining(state.focus, Date.now()) === 0) state.focus = {deadline: null, remaining: state.duration * 60000};
  state.focus = PetCore.toggle(state.focus, Date.now());
  $('focus-status').textContent = state.focus.deadline === null ? '暂停一下；准备好后继续。' : '这一段时间，只做眼前的小事。';
  save(); tick();
});
$('focus-reset').addEventListener('click', () => {
  state.focus = {deadline: null, remaining: state.duration * 60000};
  $('focus-status').textContent = '选好第一步后，慢慢开始。'; save(); tick();
});
if (!storageAvailable) $('focus-status').textContent = '浏览器保存不可用；当前会话仍可使用。';
renderScene(); renderTasks(); tick();
setInterval(tick, 1000);
document.addEventListener('visibilitychange', tick);
