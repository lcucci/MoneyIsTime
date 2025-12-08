const RATES_ENDPOINT = 'https://open.er-api.com/v6/latest/';

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'getRates') {
    handleRatesRequest(message.base, sendResponse);
    return true;
  }

  return false;
});

async function handleRatesRequest(baseCurrency, sendResponse) {
  try {
    const response = await fetch(`${RATES_ENDPOINT}${encodeURIComponent(baseCurrency)}`);
    if (!response.ok) throw new Error('Failed to fetch rates');
    const data = await response.json();
    sendResponse({ rates: data.rates || {} });
  } catch (error) {
    sendResponse({ rates: {}, error: error.message });
  }
}
