export function load(key, def) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : def; } catch { return def; }
}

export function save(key, val) {
  localStorage.setItem(key, JSON.stringify(val));
}

export function getToday() {
  return new Date().toDateString();
}

export function getWeekKey() {
  const d = new Date();
  const day = d.getDay();
  const monday = new Date(d);
  monday.setDate(d.getDate() - (day === 0 ? 6 : day - 1));
  return monday.toDateString();
}

export function checkDay() {
  const saved = load('lastDay', '');
  if (saved !== getToday()) {
    save('lastDay', getToday());
    save('suppsDone', {});
    save('waterToday', 0);
    save('proteinToday', {});
  }
}
