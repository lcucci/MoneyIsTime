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

const FALLBACK_TRANSLATIONS = {
  en: {
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
  }
};

let translations = {};
let options = { ...DEFAULT_OPTIONS };
let currentDomain = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  translations = await loadTranslations();
  options = await getOptions();
  currentDomain = await getCurrentTabDomain();

  applyTranslations(options.language);
  populateForm(options);
  refreshExcludeButton();
  bindEvents();
}

function $(id) {
  return document.getElementById(id);
}

async function loadTranslations() {
  try {
    const response = await fetch(chrome.runtime.getURL('assets/translations.json'));
    const data = await response.json();
    return { ...FALLBACK_TRANSLATIONS, ...data };
  } catch (error) {
    console.warn('[MoneyIsTime] Using fallback translations', error);
    return FALLBACK_TRANSLATIONS;
  }
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

function applyTranslations(lang) {
  const t = translations[lang] || translations.en || {};

  $('header-title').textContent = t.settings_label;
  $('language-label').textContent = t.language_label;
  $('group-salary-title').textContent = t.salary_label;
  $('group-working-title').textContent = t.working_time_group_label;
  $('working-hours-label').textContent = t.working_hours_per_day_label;
  $('working-days-label').textContent = t.working_days_per_month_label;
  $('salary-type-label').textContent = t.salary_type_label || t.salary_label;

  const salaryTypeSelect = $('salary-type');
  const currentValue = salaryTypeSelect.value || options.salaryType;
  salaryTypeSelect.innerHTML = `
    <option value="hourly">${t.salary_type_hourly}</option>
    <option value="daily">${t.salary_type_daily}</option>
    <option value="monthly">${t.salary_type_monthly}</option>
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
  const t = translations[options.language] || translations.en || {};

  if (!currentDomain) {
    btn.disabled = true;
    btn.textContent = t.cannot_determine_site || 'Unavailable';
    btn.classList.remove('include');
    return;
  }

  const isExcluded = (options.blacklist || []).includes(currentDomain);
  btn.disabled = false;
  btn.classList.toggle('include', isExcluded);

  const key = isExcluded ? 'include_site' : 'exclude_site';
  btn.textContent = `${t[key]} ${currentDomain}`;
}

function bindEvents() {
  $('settings-form').addEventListener('input', () => saveOptions());

  $('language').addEventListener('change', (event) => {
    options.language = event.target.value;
    applyTranslations(options.language);
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
