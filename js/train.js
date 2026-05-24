import { load, save, getToday } from './storage.js';

export const EXERCISES = {
  A: [
    { name: '槓鈴臥推', sets: 4, reps: '8–10', weight: 32.5, note: 'RPE 7–8｜肩胛骨收緊，空槓暖身 × 15', tag: 'warm' },
    { name: '上斜啞鈴推', sets: 3, reps: '10–12', weight: 10, note: '30–45° 角，手肘不過度外展', tag: 'key' },
    { name: '啞鈴肩推（坐姿）', sets: 3, reps: '10–12', weight: 10, note: '核心收緊，不要用腰代償' },
    { name: '側平舉', sets: 4, reps: '12–15', weight: 7, note: 'RPE 7｜小拇指略高於大拇指，不聳肩', tag: 'key' },
    { name: '滑輪三頭下壓', sets: 3, reps: '12–15', weight: 0, note: '手肘固定，感受收縮鎖死' },
  ],
  B: [
    { name: '髖屈肌伸展 + 90/90', sets: 2, reps: '各30秒', weight: 0, note: '穿鉛衣上班後必做，不能省', tag: 'warm' },
    { name: '背蹲舉', sets: 4, reps: '6–8', weight: 32.5, note: 'RPE 7–8｜大腿平行地面，膝蓋對齊腳尖', tag: 'key' },
    { name: '羅馬尼亞硬舉', sets: 4, reps: '8–10', weight: 35, note: '感受腿後側被拉長，背部保持平直', tag: 'key' },
    { name: '保加利亞分腿蹲', sets: 3, reps: '8–10 each', weight: 9, note: 'RPE 7｜離心 3 秒，膝蓋不過腳尖太多' },
    { name: '腿彎舉（機器）', sets: 3, reps: '12–15', weight: 0, note: '感受收縮，不是甩重量' },
    { name: '站姿提踵', sets: 4, reps: '15–20', weight: 0, note: '頂部停 1 秒' },
  ],
  C: [
    { name: '滑輪下拉（寬握）', sets: 4, reps: '10–12', weight: 32.5, note: 'RPE 7｜想像手肘往腋下插', tag: 'warm' },
    { name: '坐姿划船（低位後拉）', sets: 4, reps: '10–12', weight: 37.5, note: 'RPE 7–8｜肩胛骨收緊夾緊，不聳肩', tag: 'key' },
    { name: '單手啞鈴划船', sets: 3, reps: '10–12 each', weight: 16, note: '以背帶動手臂，不是手臂帶動背' },
    { name: 'Face Pull', sets: 3, reps: '15', weight: 0, note: '拉向臉部，手肘略高於肩，護肩必做', tag: 'key' },
    { name: '啞鈴二頭彎舉（交替）', sets: 3, reps: '12 each', weight: 9, note: '離心放下 2 秒，不要甩動' },
  ]
};

const DAYS = ['日','一','二','三','四','五','六'];

let currentDay = 'A';

export function renderWeekBar() {
  const bar = document.getElementById('weekBar');
  const trained = load('trainedDays', {});
  const today = new Date();
  const dayOfWeek = today.getDay();
  const monday = new Date(today);
  monday.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

  let html = '';
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const key = d.toDateString();
    const isToday = key === today.toDateString();
    const isTrained = trained[key];
    const label = DAYS[d.getDay()];
    html += `<div class="week-day ${isTrained?'trained':''} ${isToday?'today':''}" onclick="toggleTrainDay('${key}')">
      <span class="wd-label">${label}</span>
      <span class="wd-dot"></span>
    </div>`;
  }
  bar.innerHTML = html;
}

export function renderExercises() {
  const list = document.getElementById('exerciseList');
  const exercises = EXERCISES[currentDay];
  const done = load('exDone_' + getToday() + '_' + currentDay, {});
  const weights = load('exWeights', {});

  let html = '';
  exercises.forEach((ex, i) => {
    const key = currentDay + '_' + i;
    const isDone = done[key];
    const savedWeight = weights[key] !== undefined ? weights[key] : ex.weight;
    const tagHtml = ex.tag === 'key' ? '<span class="tag-pill tag-key">重點</span>' :
                    ex.tag === 'warm' ? '<span class="tag-pill tag-warm">暖身</span>' : '';

    html += `<div class="ex-card">
      <div class="ex-header">
        <div class="ex-check ${isDone?'done':''}" onclick="toggleEx('${key}', '${currentDay}')">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#000" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
        </div>
        <div style="flex:1">
          <div class="ex-name">${ex.name} ${tagHtml}</div>
          <div class="ex-meta">${ex.sets} 組 × ${ex.reps}</div>
        </div>
      </div>
      <div class="ex-body">
        <div class="ex-sets">
          <div class="set-box">
            <div class="set-label">使用重量</div>
            <div style="display:flex;align-items:center;justify-content:center;gap:2px">
              <input class="set-input" type="number" step="0.5" value="${savedWeight}" onchange="saveWeight('${key}', this.value)" style="width:60px">
              <span style="font-size:11px;color:var(--muted)">kg</span>
            </div>
          </div>
          <div class="set-box">
            <div class="set-label">建議起始</div>
            <div style="font-size:14px;font-family:var(--font-mono);font-weight:500;padding-top:4px">${ex.weight > 0 ? ex.weight + ' kg' : '輕重量'}</div>
          </div>
          <div class="set-box">
            <div class="set-label">組 × 次</div>
            <div style="font-size:13px;font-family:var(--font-mono);font-weight:500;padding-top:4px">${ex.sets}×${ex.reps}</div>
          </div>
        </div>
        <div class="ex-note">${ex.note}</div>
      </div>
    </div>`;
  });
  list.innerHTML = html;
}

export function toggleEx(key, day) {
  const doneKey = 'exDone_' + getToday() + '_' + day;
  const done = load(doneKey, {});
  done[key] = !done[key];
  save(doneKey, done);
  renderExercises();
  if (done[key]) window._toast('完成 ✓');
}

export function saveWeight(key, val) {
  const weights = load('exWeights', {});
  weights[key] = parseFloat(val) || 0;
  save('exWeights', weights);
  window._toast('重量已儲存');
}

export function selectDay(day) {
  currentDay = day;
  document.querySelectorAll('.day-tab').forEach((b, i) => {
    b.classList.toggle('active', ['A','B','C'][i] === day);
  });
  renderExercises();
}

export function toggleTrainDay(key) {
  const trained = load('trainedDays', {});
  trained[key] = !trained[key];
  save('trainedDays', trained);
  renderWeekBar();
  window._toast(trained[key] ? '訓練日記錄 ✓' : '已取消');
}

export function resetToday() {
  if (confirm('確定清除今日訓練紀錄？')) {
    save('exDone_' + getToday() + '_' + currentDay, {});
    renderExercises();
    window._toast('今日紀錄已清除');
  }
}
