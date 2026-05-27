import { checkDay } from './storage.js';
import { renderWeekBar, renderExercises, toggleEx, saveWeight, selectDay, toggleTrainDay, resetToday } from './train.js';
import { renderMeals, saveMeal, resetProtein } from './nutrition.js';
import { renderWater, addWater, resetWater } from './water.js';
import { renderSupps, toggleSupp, resetSupps } from './supps.js';
import { triggerFoodPhoto, confirmFoodAnalysis, hideModal, startAnalysis, reestimate, setupFoodPhotoInput } from './foodVision.js';

// toast 函式（其他模組透過 window._toast 呼叫）
function toast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 1800);
}

// 暴露到全域（給 HTML 中的 onclick 屬性使用）
window._toast = toast;
window.showPage = showPage;
window.selectDay = selectDay;
window.toggleTrainDay = toggleTrainDay;
window.toggleEx = toggleEx;
window.saveWeight = saveWeight;
window.resetToday = resetToday;
window.saveMeal = saveMeal;
window.resetProtein = resetProtein;
window.addWater = addWater;
window.resetWater = resetWater;
window.toggleSupp = toggleSupp;
window.resetSupps = resetSupps;
window.triggerFoodPhoto = triggerFoodPhoto;
window.confirmFoodAnalysis = confirmFoodAnalysis;
window.hideFoodModal = hideModal;
window.startFoodAnalysis = startAnalysis;
window.reestimateMacros = reestimate;
window.renderMeals = renderMeals;

function showPage(name) {
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById('page-' + name).classList.add('active');
  event.target.classList.add('active');
}

// INIT
checkDay();
renderWeekBar();
renderExercises();
renderMeals();
renderWater();
renderSupps();
setupFoodPhotoInput();
