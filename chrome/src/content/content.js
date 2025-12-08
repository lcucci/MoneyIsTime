(() => {
  const DEFAULT_SETTINGS = {
    blacklist: [],
    salary: 0,
    salaryType: 'hourly',
    currency: 'EUR',
    hoursPerDay: 8,
    daysPerMonth: 21,
    enabled: true,
    language: 'en'
  };

  const DEFAULT_LANGUAGE = 'en';
  const currencySymbols = {
    // AED (ar)
    'AED': 'AED',

    // ARS (es)
    'ARS': 'ARS',

    // AUD (en)
    'AUD': 'AUD',
    'A$': 'AUD',

    // BRL (pt-BR)
    'BRL': 'BRL',
    'R$': 'BRL',

    // CAD (en, fr)
    'CAD': 'CAD',
    'C$': 'CAD',

    // CHF (de, fr, it)
    'CHF': 'CHF',

    // CNY (zh-CN)
    'CNY': 'CNY',
    'CN¥': 'CNY',

    // COP (es)
    'COP': 'COP',

    // EUR (it, de, fr, es, pt-BR ecc.)
    'EUR': 'EUR',
    '€': 'EUR',

    // GBP (en)
    'GBP': 'GBP',
    '£': 'GBP',

    // INR (hi)
    'INR': 'INR',
    '₹': 'INR',

    // JPY (ja)
    'JPY': 'JPY',
    '¥': 'JPY',

    // MXN (es)
    'MXN': 'MXN',

    // RUB (ru)
    'RUB': 'RUB',
    '₽': 'RUB',

    // SAR (ar)
    'SAR': 'SAR',

    // TRY (tr)
    'TRY': 'TRY',
    '₺': 'TRY',

    // USD (en)
    'USD': 'USD',
    '$': 'USD'
  };


  const currencyCodes = Object.values(currencySymbols);
  const processedClass = 'money-is-time-processed';
  const ratesCache = {};
  const DEFAULT_TRANSLATIONS = {
    minutes_unit: 'minutes',
    hours_unit: 'hours',
    days_unit: 'days',
    months_unit: 'months',
    years_unit: 'years'
  };
  const localeCache = {};
  let translations = {};
  let priceRegex;

  init();

  async function init() {
    const settings = await getSettings();
    const domain = location.hostname;
    if (!settings.enabled || settings.blacklist.includes(domain)) return;

    translations = await loadTranslations(settings.language);
    priceRegex = buildPriceRegex();
    injectStyles();

    const observer = new MutationObserver(debounce(() => scanTextNodes(document.body, settings), 120));
    observer.observe(document.body, { childList: true, subtree: true });
    setTimeout(() => scanTextNodes(document.body, settings), 100);
  }

  function getSettings() {
    return new Promise((resolve) => chrome.storage.local.get(DEFAULT_SETTINGS, resolve));
  }

  async function loadTranslations(language) {
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

  function sendMessage(payload) {
    return new Promise((resolve) => chrome.runtime.sendMessage(payload, resolve));
  }

  function buildPriceRegex() {
    const escape = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const symbolPattern = Object.keys(currencySymbols)
      .sort((a, b) => b.length - a.length)
      .map(escape)
      .join('|');
    const codePattern = currencyCodes.join('|');
    return new RegExp(
      `(?:(${symbolPattern})|\\b(${codePattern})\\b)\\s*([\\d.,]+)|([\\d.,]+)\\s*(?:(${symbolPattern})|\\b(${codePattern})\\b)`,
      'gu'
    );
  }

  function injectStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .money-is-time-badge {
        background: rgba(33, 150, 243, 0.12);
        border: 1px solid rgba(33, 150, 243, 0.3);
        margin-left: 4px;
        font-size: 0.82em;
        padding: 4px 6px;
        border-radius: 6px;
        line-height: 1.2;
        font-weight: 600;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.12);
        white-space: nowrap;
      }
      @media (prefers-color-scheme: dark) {
        .money-is-time-badge {
          background: rgba(33, 150, 243, 0.2);
          border-color: rgba(33, 150, 243, 0.35);
        }
      }
    `;
    document.head.appendChild(style);
  }

  function debounce(fn, delay = 120) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => fn(...args), delay);
    };
  }

  function scanTextNodes(root, settings) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    let node;

    while ((node = walker.nextNode())) {
      const parent = node.parentElement;
      if (!parent || parent.classList.contains(processedClass)) continue;
      if (shouldSkipNode(parent)) continue;

      const text = node.nodeValue;
      if (!text) continue;

      const matches = [...text.matchAll(priceRegex)];
      if (!matches.length) continue;

      for (const match of matches) {
        const currencyToken = match[1] || match[2] || match[5] || match[6];
        const amountToken = match[3] || match[4];
        const currency = resolveCurrency(currencyToken);
        const amount = parseFloat(normalizeNumber(amountToken || ''));

        if (!currency || Number.isNaN(amount)) continue;

        annotate(parent, amount, currency, settings);
        parent.classList.add(processedClass);
        break;
      }
    }
  }

  function shouldSkipNode(element) {
    const tag = element.tagName;
    if (element.classList.contains('money-is-time-badge')) return true;
    return ['SCRIPT', 'STYLE', 'NOSCRIPT', 'HEAD', 'META', 'TITLE'].includes(tag);
  }

  function resolveCurrency(token) {
    if (!token) return null;
    if (currencySymbols[token]) return currencySymbols[token];
    if (currencyCodes.includes(token.toUpperCase())) return token.toUpperCase();
    return null;
  }

  function normalizeNumber(raw) {
    const value = raw.replace(/\s/g, '');
    const dotCount = (value.match(/\./g) || []).length;
    const commaCount = (value.match(/,/g) || []).length;

    if (dotCount && commaCount) {
      const decimalSeparator = value.lastIndexOf(',') > value.lastIndexOf('.') ? ',' : '.';
      const thousandsSeparator = decimalSeparator === ',' ? '.' : ',';
      return value
        .replace(new RegExp(`\\${thousandsSeparator}`, 'g'), '')
        .replace(decimalSeparator, '.');
    }

    if (commaCount && !dotCount) {
      if (/^\d{1,3}(,\d{3})+$/.test(value)) return value.replace(/,/g, '');
      return value.replace(',', '.');
    }

    if (dotCount && !commaCount) {
      if (/^\d{1,3}(\.\d{3})+$/.test(value)) return value.replace(/\./g, '');
      return value;
    }

    return value;
  }

  async function annotate(element, amount, priceCurrency, settings) {
    try {
      const hourlyRate = computeHourlyRate(settings);
      if (!hourlyRate) return;

      const converted = await convertAmount(amount, priceCurrency, settings.currency);
      if (converted === null) return;

      const hoursNeeded = converted / hourlyRate;
      const label = formatDuration(hoursNeeded, translations, settings);
      if (!label) return;

      const badge = document.createElement('span');
      badge.textContent = `${label}`;
      badge.className = 'money-is-time-badge';
      element.insertAdjacentElement('afterend', badge);
    } catch (error) {
      console.warn('[MoneyIsTime] Unable to render badge', error);
    }
  }

  function computeHourlyRate(settings) {
    const { salary, salaryType, hoursPerDay, daysPerMonth } = settings;
    if (!salary || salary <= 0 || hoursPerDay <= 0 || daysPerMonth <= 0) return null;

    if (salaryType === 'daily') return salary / hoursPerDay;
    if (salaryType === 'monthly') return salary / (daysPerMonth * hoursPerDay);
    return salary;
  }

  async function convertAmount(amount, fromCurrency, toCurrency) {
    if (fromCurrency === toCurrency) return amount;

    const directRates = await getRates(fromCurrency);
    if (directRates[toCurrency]) return amount * directRates[toCurrency];

    const inverseRates = await getRates(toCurrency);
    if (inverseRates[fromCurrency]) return amount / inverseRates[fromCurrency];

    return null;
  }

  async function getRates(baseCurrency) {
    const now = Date.now();
    const cached = ratesCache[baseCurrency];
    if (cached && now - cached.timestamp < 86400000) return cached.rates;

    const response = await sendMessage({ type: 'getRates', base: baseCurrency });
    const rates = response?.rates || {};

    if (Object.keys(rates).length) {
      ratesCache[baseCurrency] = { rates, timestamp: now };
    }
    return rates;
  }

  function formatDuration(hours, translationsMap, settings) {
    if (!Number.isFinite(hours) || hours <= 0) return null;

    const totalHoursPerMonth = settings.daysPerMonth * settings.hoursPerDay;
    const totalHoursPerYear = totalHoursPerMonth * 12;
    let remaining = hours;

    const years = Math.floor(remaining / totalHoursPerYear);
    remaining -= years * totalHoursPerYear;

    const months = Math.floor(remaining / totalHoursPerMonth);
    remaining -= months * totalHoursPerMonth;

    const days = Math.floor(remaining / settings.hoursPerDay);
    remaining -= days * settings.hoursPerDay;

    const wholeHours = Math.floor(remaining);
    remaining -= wholeHours;

    const minutes = Math.round(remaining * 60);

    const units = [
      [years, translationsMap.years_unit],
      [months, translationsMap.months_unit],
      [days, translationsMap.days_unit],
      [wholeHours, translationsMap.hours_unit],
      [minutes, translationsMap.minutes_unit]
    ]
      .filter(([value]) => value)
      .map(([value, unit]) => `${value}${(unit || '').charAt(0).toLowerCase()}`);

    return units.slice(0, 2).join(' ');
  }
})();
