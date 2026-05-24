import { load, save } from './storage.js';

export const MEALS = [
  { name: '早餐', range: '30–35g', suggestion: '饅頭/包子/麵包 + 蛋 2–3 顆 + 拿鐵\n加蛋是最簡單的蛋白質升級', default: 32 },
  { name: '午餐', range: '25–35g', suggestion: '外食照常 + 一個拳頭大蛋白質來源\n肉不夠就加滷蛋或豆腐', default: 30 },
  { name: '訓練前', range: '12–15g', suggestion: '香蕉/能量果凍 + 半球乳清加水\n碳水 + 少量蛋白質，不傷腸胃', default: 13 },
  { name: '訓練後', range: '25g', suggestion: '乳清一球 + 肌酸 3–5g\n固定這個時間喝，不要視情況', default: 25 },
  { name: '晚餐', range: '20–30g', suggestion: '白飯 1.5–2 碗（訓練日加量）+ 青菜 + 肉\n訓練日飯量是最簡單的碳水補法', default: 25 },
  { name: '睡前（選）', range: '10–15g', suggestion: '希臘優格 or 再半球乳清\n若當日蛋白質還不到 115g 再補', default: 12 },
];

export function renderMeals() {
  const protein = load('proteinToday', {});
  let total = 0;
  Object.values(protein).forEach(v => total += Number(v) || 0);

  const pct = Math.min(100, Math.round(total / 115 * 100));
  document.getElementById('proteinDisplay').innerHTML = `${total} <span>/ 115g</span>`;
  document.getElementById('proteinBar').style.width = pct + '%';

  const list = document.getElementById('mealList');
  let html = '';
  MEALS.forEach((meal, i) => {
    const val = protein[i] !== undefined ? protein[i] : '';
    html += `<div class="meal-card">
      <div class="meal-header">
        <div>
          <div class="meal-name">${meal.name}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">建議 ${meal.range}</div>
        </div>
        <div class="meal-protein">${val || 0}g</div>
      </div>
      <div class="meal-detail">
        <p>${meal.suggestion.replace(/\n/g,'<br>')}</p>
        <div class="protein-add">
          <div class="protein-input-row">
            <span style="font-size:11px;color:var(--muted)">實際攝取</span>
            <input type="number" value="${val}" placeholder="${meal.default}" id="pi_${i}" style="width:45px">
            <span style="font-size:11px;color:var(--muted)">g</span>
          </div>
          <button class="btn-sm btn-accent" onclick="saveMeal(${i})">儲存</button>
        </div>
      </div>
    </div>`;
  });
  list.innerHTML = html;
}

export function saveMeal(i) {
  const input = document.getElementById('pi_' + i);
  const val = parseFloat(input.value) || 0;
  const protein = load('proteinToday', {});
  protein[i] = val;
  save('proteinToday', protein);
  renderMeals();
  window._toast('蛋白質已記錄 ✓');
}

export function resetProtein() {
  if (confirm('確定清除今日蛋白質紀錄？')) {
    save('proteinToday', {});
    renderMeals();
    window._toast('已清除');
  }
}
