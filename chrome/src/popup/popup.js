const DEFAULT_OPTIONS = {
  salary: 0,
  salaryType: 'hourly',
  currency: 'EUR',
  hoursPerDay: 8,
  daysPerMonth: 21,
  enabled: true,
  language: 'en',
  blacklist: []
};

const DEFAULT_LANGUAGE = 'en';
const DEFAULT_TRANSLATIONS = {
  settings_label: 'Settings',
  salary_label: 'Salary',
  salary_type_label: 'Salary type',
  salary_type_hourly: 'Hourly',
  salary_type_daily: 'Daily',
  salary_type_monthly: 'Monthly',
  working_time_group_label: 'Working time',
  working_hours_per_day_label: 'Working hours per day',
  working_days_per_month_label: 'Working days per month',
  language_label: 'Language',
  minutes_unit: 'minutes',
  hours_unit: 'hours',
  days_unit: 'days',
  months_unit: 'months',
  years_unit: 'years',
  exclude_site: 'Exclude',
  include_site: 'Include',
  cannot_determine_site: 'Cannot determine site'
};

let translations = {};
let options = { ...DEFAULT_OPTIONS };
let currentDomain = null;
const localeCache = {};

document.addEventListener('DOMContentLoaded', init);

async function init() {
  options = await getOptions();
  translations = await loadTranslations(options.language);
  currentDomain = await getCurrentTabDomain();

  applyTranslations();
  populateForm(options);
  refreshExcludeButton();
  bindEvents();
}

function $(id) {
  return document.getElementById(id);
}

async function loadTranslations(language = DEFAULT_LANGUAGE) {
  const base = await loadLocale(DEFAULT_LANGUAGE, DEFAULT_TRANSLATIONS);
  if (language === DEFAULT_LANGUAGE) return base;

  const localized = await loadLocale(language);
  return { ...base, ...localized };
}

async function loadLocale(language, fallback = {}) {
  const normalized = normalizeLocale(language);
  if (localeCache[normalized]) return localeCache[normalized];

  try {
    const url = chrome.runtime.getURL(`_locales/${normalized}/messages.json`);
    const response = await fetch(url);
    if (!response.ok) throw new Error('Missing locale');
    const data = await response.json();
    const parsed = parseMessages(data);
    localeCache[normalized] = parsed;
    return parsed;
  } catch (error) {
    console.warn('[MoneyIsTime] Using fallback translations', error);
    return fallback;
  }
}

function parseMessages(raw) {
  return Object.fromEntries(
    Object.entries(raw || {}).map(([key, value]) => [key, value?.message || ''])
  );
}

function normalizeLocale(language) {
  return (language || DEFAULT_LANGUAGE).replace('-', '_');
}

function getOptions() {
  return new Promise((resolve) => chrome.storage.local.get(DEFAULT_OPTIONS, resolve));
}

function setOptions(values) {
  return new Promise((resolve) => chrome.storage.local.set(values, resolve));
}

function populateForm(data) {
  $('salary').value = data.salary;
  $('currency').value = data.currency;
  $('hours-per-day').value = data.hoursPerDay;
  $('days-per-month').value = data.daysPerMonth;
  $('enabled').checked = data.enabled;
  $('language').value = data.language;
  $('salary-type').value = data.salaryType;
}

function applyTranslations() {
  const t = translations || DEFAULT_TRANSLATIONS;

  $('header-title').textContent = t.settings_label || DEFAULT_TRANSLATIONS.settings_label;
  $('language-label').textContent = t.language_label || DEFAULT_TRANSLATIONS.language_label;
  $('group-salary-title').textContent = t.salary_label || DEFAULT_TRANSLATIONS.salary_label;
  $('group-working-title').textContent =
    t.working_time_group_label || DEFAULT_TRANSLATIONS.working_time_group_label;
  $('working-hours-label').textContent =
    t.working_hours_per_day_label || DEFAULT_TRANSLATIONS.working_hours_per_day_label;
  $('working-days-label').textContent =
    t.working_days_per_month_label || DEFAULT_TRANSLATIONS.working_days_per_month_label;
  $('salary-type-label').textContent =
    t.salary_type_label || t.salary_label || DEFAULT_TRANSLATIONS.salary_type_label;

  const salaryTypeSelect = $('salary-type');
  const currentValue = salaryTypeSelect.value || options.salaryType;
  salaryTypeSelect.innerHTML = `
    <option value="hourly">${t.salary_type_hourly || DEFAULT_TRANSLATIONS.salary_type_hourly}</option>
    <option value="daily">${t.salary_type_daily || DEFAULT_TRANSLATIONS.salary_type_daily}</option>
    <option value="monthly">${t.salary_type_monthly || DEFAULT_TRANSLATIONS.salary_type_monthly}</option>
  `;
  salaryTypeSelect.value = currentValue;
}

async function getCurrentTabDomain() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  try {
    return new URL(tab.url).hostname;
  } catch {
    return null;
  }
}

function refreshExcludeButton() {
  const btn = $('exclude-site-button');
  const t = translations || DEFAULT_TRANSLATIONS;

  if (!currentDomain) {
    btn.disabled = true;
    btn.textContent = t.cannot_determine_site || DEFAULT_TRANSLATIONS.cannot_determine_site || 'Unavailable';
    btn.classList.remove('include');
    btn.classList.remove('exclude');
    return;
  }

  const isExcluded = (options.blacklist || []).includes(currentDomain);
  btn.disabled = false;
  btn.classList.toggle('exclude', !isExcluded);
  btn.classList.toggle('include', isExcluded);

  const key = isExcluded ? 'include_site' : 'exclude_site';
  const label = t[key] || DEFAULT_TRANSLATIONS[key] || '';
  btn.textContent = `${label} ${currentDomain}`;
}

function bindEvents() {
  $('settings-form').addEventListener('input', () => saveOptions());

  $('language').addEventListener('change', async (event) => {
    options.language = event.target.value;
    translations = await loadTranslations(options.language);
    applyTranslations();
    refreshExcludeButton();
    saveOptionsImmediate();
  });

  $('exclude-site-button').addEventListener('click', () => toggleBlacklist());
}

const saveOptions = debounce(() => {
  options = collectOptionsFromForm();
  setOptions(options);
}, 200);

function saveOptionsImmediate() {
  options = collectOptionsFromForm();
  setOptions(options);
}

function toggleBlacklist() {
  if (!currentDomain) return;

  const isExcluded = (options.blacklist || []).includes(currentDomain);
  const updated = isExcluded
    ? options.blacklist.filter((domain) => domain !== currentDomain)
    : [...options.blacklist, currentDomain];

  options = { ...options, blacklist: updated };
  chrome.storage.local.set({ blacklist: updated }, refreshExcludeButton);
}

function debounce(fn, delay = 200) {
  let timeout;
  return (...args) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function collectOptionsFromForm() {
  return {
    ...options,
    salary: parseFloat($('salary').value) || 0,
    salaryType: $('salary-type').value,
    currency: $('currency').value.toUpperCase(),
    hoursPerDay: clamp(parseFloat($('hours-per-day').value) || 0, 0.5, 24),
    daysPerMonth: clamp(parseInt($('days-per-month').value, 10) || 0, 1, 31),
    enabled: $('enabled').checked,
    language: $('language').value
  };
}
