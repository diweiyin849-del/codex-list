'use strict';
const storageKey = 'shixu-todos-v1';
let tasks = [];
let filter = 'all';
try {
  const saved = JSON.parse(localStorage.getItem(storageKey) || '[]');
  if (Array.isArray(saved)) tasks = saved.filter(task => task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean');
} catch { /* A blocked or invalid store should not prevent using the list. */ }
const $ = id => document.getElementById(id);
const today = new Date();
$('month').textContent = `${today.getFullYear()} / ${String(today.getMonth() + 1).padStart(2, '0')}`;
$('day').textContent = String(today.getDate()).padStart(2, '0');
$('weekday').textContent = today.toLocaleDateString('zh-CN', { weekday: 'long' });
function save(message) {
  try { localStorage.setItem(storageKey, JSON.stringify(tasks)); }
  catch { message += '；浏览器无法保存数据，刷新后可能丢失'; }
  render();
  $('announcement').textContent = message;
}
function render() {
  const done = tasks.filter(task => task.done).length;
  $('total').textContent = tasks.length;
  $('all-count').textContent = tasks.length;
  $('active-count').textContent = tasks.length - done;
  $('done-count').textContent = done;
  $('remaining').textContent = `${tasks.length - done} 件任务待完成`;
  $('progress-text').textContent = tasks.length ? `已完成 ${done} / ${tasks.length}` : '慢慢来，也是在前进';
  $('progress-bar').style.width = `${tasks.length ? done / tasks.length * 100 : 0}%`;
  $('clear').disabled = !done;
  const visible = tasks.filter(task => filter === 'all' || task.done === (filter === 'done'));
  $('tasks').replaceChildren();
  for (const task of visible) {
    const row = document.createElement('li');
    row.className = `task${task.done ? ' done' : ''}`;
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `task-${task.id}`;
    checkbox.checked = task.done;
    checkbox.addEventListener('change', () => { task.done = checkbox.checked; save(task.done ? '任务已完成' : '任务已恢复'); document.getElementById(checkbox.id)?.focus(); });
    const label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.textContent = task.text;
    const remove = document.createElement('button');
    remove.className = 'delete';
    remove.textContent = '×';
    remove.setAttribute('aria-label', `删除任务：${task.text}`);
    remove.addEventListener('click', () => { tasks = tasks.filter(item => item.id !== task.id); save('任务已删除'); $('task-input').focus(); });
    row.append(checkbox, label, remove);
    $('tasks').append(row);
  }
  $('empty').hidden = visible.length > 0;
  $('empty').querySelector('h3').textContent = filter === 'done' ? '完成的每一步，都会留在这里' : filter === 'active' && tasks.length ? '今天的待办，全部完成了' : '留白，是新的开始';
  $('empty').querySelector('p').textContent = filter === 'done' ? '勾选完成一件任务，给自己一点小小的鼓励。' : filter === 'active' && tasks.length ? '给自己一点休息的时间吧。' : '添加你的第一件待办，让今天有个小小的方向。';
}
$('add-form').addEventListener('submit', event => {
  event.preventDefault();
  const text = $('task-input').value.trim();
  if (!text) { $('task-input').value = ''; $('task-input').focus(); return; }
  tasks.unshift({ id: globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}`, text, done: false });
  $('task-input').value = '';
  if (filter === 'done') setFilter('all');
  save('任务已添加');
  $('task-input').focus();
});
function setFilter(value) {
  filter = value;
  document.querySelectorAll('[data-filter]').forEach(button => {
    const active = button.dataset.filter === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', String(active));
  });
  render();
}
document.querySelectorAll('[data-filter]').forEach(button => button.addEventListener('click', () => setFilter(button.dataset.filter)));
$('clear').addEventListener('click', () => { tasks = tasks.filter(task => !task.done); save('已清除完成的任务'); });
window.addEventListener('storage', event => {
  if (event.key !== storageKey) return;
  try {
    const saved = JSON.parse(event.newValue || '[]');
    if (Array.isArray(saved)) { tasks = saved.filter(task => task && typeof task.id === 'string' && typeof task.text === 'string' && typeof task.done === 'boolean'); render(); }
  } catch { /* Ignore malformed changes from another tab. */ }
});
render();
