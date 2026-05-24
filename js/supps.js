import { load, save } from './storage.js';

export const SUPPS = [
  { name: '乳清蛋白', dose: '1 球（訓練後必喝）', time: '訓練後 30–60 分鐘內', icon: '🥛' },
  { name: '肌酸 Creatine', dose: '3–5g（非 7g）', time: '訓練日加進乳清｜非訓練日隨一餐', icon: '⚡' },
];

export function renderSupps() {
  const done = load('suppsDone', {});
  const list = document.getElementById('suppList');
  let html = '';
  SUPPS.forEach((s, i) => {
    const isDone = done[i];
    html += `<div class="supp-card ${isDone?'done':''}" onclick="toggleSupp(${i})">
      <div class="supp-icon">${s.icon}</div>
      <div class="supp-info">
        <div class="supp-name">${s.name}</div>
        <div class="supp-dose">${s.dose}</div>
        <div class="supp-time">${s.time}</div>
      </div>
      <div class="supp-check">
        ${isDone ? '<svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>' : ''}
      </div>
    </div>`;
  });
  list.innerHTML = html;
}

export function toggleSupp(i) {
  const done = load('suppsDone', {});
  done[i] = !done[i];
  save('suppsDone', done);
  renderSupps();
  window._toast(done[i] ? '已服用 ✓' : '已取消');
}

export function resetSupps() {
  if (confirm('確定清除今日補充品紀錄？')) {
    save('suppsDone', {});
    renderSupps();
  }
}
