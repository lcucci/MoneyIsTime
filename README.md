# MoneyIsTime

MoneyIsTime is a browser extension that turns prices into the time you need to work to afford them.

## Features
- Price-to-time conversion using your salary, schedule, and currency
- Live exchange rates from open.er-api.com
- Multi-language labels for the popup and badges
- Per-site blacklist toggle from the popup

## Installation
1. Clone this repository or download it as a ZIP file.
2. Open the extensions page in your browser:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Enable Developer mode.
4. Click "Load unpacked" and select the folder containing the extension files.

## Usage
1. Open the extension popup and set salary, salary type, currency, working hours per day, working days per month, and language.
2. Toggle the extension on or off.
3. Use "Exclude/Include <domain>" to control where annotations appear.
4. Prices on pages will show a badge with the estimated work time.

## Project structure
- `manifest.json` — extension manifest.
- `src/background/index.js` — service worker for exchange rates and translations.
- `src/content/content.js` — content script that detects prices and renders badges.
- `src/popup/*` — popup markup, styles, and logic.
- `assets/translations.json` — locale strings for the popup and badges.
- `icons/` — extension icons.

## License
MIT
