import { load, save } from './storage.js';

const API_URL = 'https://api.anthropic.com/v1/messages';

// module-level state to bridge the prep → loading → result steps
let _pendingFile = null;
let _pendingMealIndex = null;

function getApiKey() {
  let key = localStorage.getItem('anthropicApiKey');
  if (!key) {
    key = prompt('請輸入 Anthropic API Key（只需一次，儲存在本機）：');
    if (key && key.trim()) localStorage.setItem('anthropicApiKey', key.trim());
  }
  return key ? key.trim() : null;
}

function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = e => {
      const base64 = e.target.result.split(',')[1];
      resolve({ base64, mediaType: file.type || 'image/jpeg' });
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function triggerFoodPhoto(mealIndex) {
  const input = document.getElementById('foodPhotoInput');
  input.dataset.mealIndex = mealIndex;
  input.click();
}

// Called after file is selected — shows preview + text input before API call
function showPrepModal(file, mealIndex) {
  _pendingFile = file;
  _pendingMealIndex = mealIndex;

  const modal = document.getElementById('foodModal');
  modal.classList.add('active');
  document.getElementById('foodModalPrep').style.display = 'block';
  document.getElementById('foodModalLoading').style.display = 'none';
  document.getElementById('foodModalResult').style.display = 'none';

  const url = URL.createObjectURL(file);
  document.getElementById('foodPrepThumb').src = url;
  document.getElementById('foodSupplementText').value = '';
}

export async function startAnalysis() {
  if (!_pendingFile) return;
  const note = document.getElementById('foodSupplementText').value.trim();
  await analyzePhotoFile(_pendingFile, _pendingMealIndex, note);
}

async function analyzePhotoFile(file, mealIndex, note = '') {
  const apiKey = getApiKey();
  if (!apiKey) return;

  document.getElementById('foodModalPrep').style.display = 'none';
  document.getElementById('foodModalLoading').style.display = 'flex';
  document.getElementById('foodModalResult').style.display = 'none';

  try {
    const { base64, mediaType } = await readFileAsBase64(file);

    const textPrompt = note
      ? `你是營養師。分析這張餐點照片，使用者補充說明：「${note}」。估算食物品項與三大營養素。只回傳 JSON（不加 markdown 或說明），格式：{"foods":["食物1","食物2"],"protein_g":數字,"carbs_g":數字,"fat_g":數字,"confidence":"high|medium|low"}`
      : '你是營養師。分析這張餐點照片，估算食物品項與三大營養素。只回傳 JSON（不加 markdown 或說明），格式：{"foods":["食物1","食物2"],"protein_g":數字,"carbs_g":數字,"fat_g":數字,"confidence":"high|medium|low"}';

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 350,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: textPrompt },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else throw new Error('無法解析 AI 回應');
    }

    showResultModal(result, mealIndex, file);
  } catch (err) {
    hideModal();
    window._toast('分析失敗：' + err.message);
  }
}

function showResultModal(result, mealIndex, file) {
  document.getElementById('foodModalLoading').style.display = 'none';
  document.getElementById('foodModalResult').style.display = 'block';

  const url = URL.createObjectURL(file);
  document.getElementById('foodThumb').src = url;

  document.getElementById('foodsTextarea').value = (result.foods || []).join('、');

  setMacroValues(result);

  const conf = document.getElementById('foodConfidence');
  const confMap = { high: '高', medium: '中', low: '低' };
  conf.textContent = `信心度：${confMap[result.confidence] || result.confidence || '-'}`;
  conf.dataset.level = result.confidence || '';

  document.getElementById('foodConfirmBtn').dataset.mealIndex = mealIndex;
}

function setMacroValues(result) {
  document.getElementById('foodProteinInput').value = result.protein_g ?? '';
  document.getElementById('foodCarbsInput').value = result.carbs_g ?? '';
  document.getElementById('foodFatInput').value = result.fat_g ?? '';
}

export async function reestimate() {
  if (!_pendingFile) return;
  const correctedFoods = document.getElementById('foodsTextarea').value.trim();
  if (!correctedFoods) return;

  const apiKey = getApiKey();
  if (!apiKey) return;

  const btn = document.querySelector('[onclick="reestimateMacros()"]');
  if (btn) { btn.textContent = '估算中…'; btn.disabled = true; }

  try {
    const { base64, mediaType } = await readFileAsBase64(_pendingFile);

    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 200,
        messages: [{
          role: 'user',
          content: [
            { type: 'image', source: { type: 'base64', media_type: mediaType, data: base64 } },
            { type: 'text', text: `根據這張照片，以及以下已確認的食物清單：「${correctedFoods}」，重新估算三大營養素。只回傳 JSON（不加 markdown），格式：{"protein_g":數字,"carbs_g":數字,"fat_g":數字,"confidence":"high|medium|low"}` },
          ],
        }],
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${response.status}`);
    }

    const data = await response.json();
    const text = data.content[0].text.trim();

    let result;
    try {
      result = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (match) result = JSON.parse(match[0]);
      else throw new Error('無法解析回應');
    }

    setMacroValues(result);
    const conf = document.getElementById('foodConfidence');
    const confMap = { high: '高', medium: '中', low: '低' };
    conf.textContent = `信心度：${confMap[result.confidence] || result.confidence || '-'}`;
    conf.dataset.level = result.confidence || '';
    window._toast('重新估算完成 ✓');
  } catch (err) {
    window._toast('估算失敗：' + err.message);
  } finally {
    if (btn) { btn.textContent = '重新估算'; btn.disabled = false; }
  }
}

export function confirmFoodAnalysis() {
  const mealIndex = Number(document.getElementById('foodConfirmBtn').dataset.mealIndex);
  const protein = parseFloat(document.getElementById('foodProteinInput').value);
  const carbs = parseFloat(document.getElementById('foodCarbsInput').value);
  const fat = parseFloat(document.getElementById('foodFatInput').value);

  // save protein via existing system
  if (!isNaN(protein) && protein >= 0) {
    const input = document.getElementById('pi_' + mealIndex);
    if (input) {
      input.value = protein;
      window.saveMeal(mealIndex);
    }
  }

  // save carbs/fat to macrosToday
  const macros = load('macrosToday', {});
  macros[mealIndex] = {
    carbs: isNaN(carbs) ? 0 : carbs,
    fat: isNaN(fat) ? 0 : fat,
  };
  save('macrosToday', macros);

  hideModal();
  // renderMeals is called by saveMeal; trigger an extra render for macro totals
  if (window.renderMeals) window.renderMeals();
}

export function hideModal() {
  document.getElementById('foodModal').classList.remove('active');
  _pendingFile = null;
  _pendingMealIndex = null;
  const thumb = document.getElementById('foodThumb');
  if (thumb && thumb.src.startsWith('blob:')) URL.revokeObjectURL(thumb.src);
  const prepThumb = document.getElementById('foodPrepThumb');
  if (prepThumb && prepThumb.src.startsWith('blob:')) URL.revokeObjectURL(prepThumb.src);
}

export function setupFoodPhotoInput() {
  const input = document.getElementById('foodPhotoInput');
  input.addEventListener('change', e => {
    const file = e.target.files[0];
    if (!file) return;
    const mealIndex = input.dataset.mealIndex;
    input.value = '';
    showPrepModal(file, mealIndex);
  });
}
