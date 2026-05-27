import { load, save } from './storage.js';


export const MEALS = [
  { name: '早餐', range: '30–35g', suggestion: '饅頭/包子/麵包 + 蛋 2–3 顆 + 拿鐵\n加蛋是最簡單的蛋白質升級', default: 32 },
  { name: '午餐', range: '25–35g', suggestion: '外食照常 + 一個拳頭大蛋白質來源\n肉不夠就加滷蛋或豆腐', default: 30 },
  { name: '訓練前', range: '12–15g', suggestion: '香蕉/能量果凍 + 半球乳清加水\n碳水 + 少量蛋白質，不傷腸胃', default: 13 },
  { name: '訓練後', range: '25g', suggestion: '乳清一球 + 肌酸 3–5g\n固定這個時間喝，不要視情況', default: 25 },
  { name: '晚餐', range: '20–30g', suggestion: '白飯 1.5–2 碗（訓練日加量）+ 青菜 + 肉\n訓練日飯量是最簡單的碳水補法', default: 25 },
  { name: '睡前（選）', range: '10–15g', suggestion: '希臘優格 or 再半球乳清\n若當日蛋白質還不到 115g 再補', default: 12 },
];

const GOALS = { protein: 120, carbs: 300, fat: 70 };

export function renderMeals() {
  const protein = load('proteinToday', {});
  const macros = load('macrosToday', {});

  let totalProtein = 0, totalCarbs = 0, totalFat = 0;
  Object.values(protein).forEach(v => totalProtein += Number(v) || 0);
  Object.values(macros).forEach(m => {
    totalCarbs += Number(m.carbs) || 0;
    totalFat += Number(m.fat) || 0;
  });

  document.getElementById('proteinDisplay').innerHTML = `${totalProtein} <span>/ ${GOALS.protein}g</span>`;
  document.getElementById('proteinBar').style.width = Math.min(100, Math.round(totalProtein / GOALS.protein * 100)) + '%';

  document.getElementById('carbsDisplay').textContent = totalCarbs;
  document.getElementById('carbsBar').style.width = Math.min(100, Math.round(totalCarbs / GOALS.carbs * 100)) + '%';

  document.getElementById('fatDisplay').textContent = totalFat;
  document.getElementById('fatBar').style.width = Math.min(100, Math.round(totalFat / GOALS.fat * 100)) + '%';

  const list = document.getElementById('mealList');
  let html = '';
  MEALS.forEach((meal, i) => {
    const pVal = protein[i] !== undefined ? protein[i] : '';
    const mMacros = macros[i] || {};
    const cVal = mMacros.carbs !== undefined ? mMacros.carbs : '';
    const fVal = mMacros.fat !== undefined ? mMacros.fat : '';
    html += `<div class="meal-card">
      <div class="meal-header">
        <div>
          <div class="meal-name">${meal.name}</div>
          <div style="font-size:11px;color:var(--muted);margin-top:2px">建議蛋白質 ${meal.range}</div>
        </div>
        <div class="meal-protein">${pVal || 0}g</div>
      </div>
      <div class="meal-detail">
        <p>${meal.suggestion.replace(/\n/g,'<br>')}</p>
        <div class="meal-macro-grid">
          <div class="set-box">
            <div class="set-label" style="color:var(--accent)">蛋白質</div>
            <input type="number" value="${pVal}" placeholder="${meal.default}" id="pi_${i}" class="set-input">
            <div class="set-unit">g</div>
          </div>
          <div class="set-box">
            <div class="set-label" style="color:var(--accent2)">碳水</div>
            <input type="number" value="${cVal}" placeholder="0" id="ci_${i}" class="set-input">
            <div class="set-unit">g</div>
          </div>
          <div class="set-box">
            <div class="set-label" style="color:var(--accent3)">脂肪</div>
            <input type="number" value="${fVal}" placeholder="0" id="fi_${i}" class="set-input">
            <div class="set-unit">g</div>
          </div>
        </div>
        <div class="meal-action-row">
          <button class="btn-sm btn-ghost" onclick="triggerFoodPhoto(${i})">📷 拍照</button>
          <button class="btn-sm btn-accent" onclick="saveMeal(${i})">儲存</button>
        </div>
      </div>
    </div>`;
  });
  list.innerHTML = html;
}

export function saveMeal(i) {
  const pVal = parseFloat(document.getElementById('pi_' + i).value) || 0;
  const cVal = parseFloat(document.getElementById('ci_' + i).value) || 0;
  const fVal = parseFloat(document.getElementById('fi_' + i).value) || 0;

  const protein = load('proteinToday', {});
  protein[i] = pVal;
  save('proteinToday', protein);

  const macros = load('macrosToday', {});
  macros[i] = { carbs: cVal, fat: fVal };
  save('macrosToday', macros);

  renderMeals();
  window._toast('已記錄 ✓');
}

export function resetProtein() {
  if (confirm('確定清除今日飲食紀錄？')) {
    save('proteinToday', {});
    save('macrosToday', {});
    renderMeals();
    window._toast('已清除');
  }
}
