import { load, save } from './storage.js';

export function renderWater() {
  const ml = load('waterToday', 0);
  document.getElementById('waterDisplay').innerHTML = `${ml} <span>/ 2000 ml</span>`;
  const cups = document.getElementById('waterCups');
  const filled = Math.floor(ml / 250);
  let html = '';
  for (let i = 0; i < 8; i++) {
    html += `<div class="water-cup ${i < filled ? 'filled' : ''}" onclick="addWater(250)">💧</div>`;
  }
  cups.innerHTML = html;
}

export function addWater(ml) {
  const current = load('waterToday', 0);
  const next = Math.min(3000, current + ml);
  save('waterToday', next);
  renderWater();
  window._toast(`+${ml} ml 已記錄`);
}

export function resetWater() {
  if (confirm('確定清除今日喝水紀錄？')) {
    save('waterToday', 0);
    renderWater();
    window._toast('已清除');
  }
}
