# MoneyIsTime

[![en](https://img.shields.io/badge/lang-italiano-green.svg)](https://github.com/lcucci/MoneyIsTime/blob/main/README.it.md)

Browser extension that converts product prices into the amount of work time required to afford them.


## ✨ Features

* **Real-time price annotation**: Automatically detects prices on any webpage and displays the equivalent work time needed based on your salary settings.
* **Multiple salary modes**: Hourly, daily, or monthly salary, with customizable working hours/day and days/month.
* **Automatic currency detection & conversion**: Supports price strings with symbols (€ $, £…) or ISO codes, with conversion using live exchange rates from open.er-api.com.
* **Multilingual interface**: Full popup and badge localization.
* **Per-site blacklist**: Quickly disable the extension on specific domains directly from the popup.


## 🛠️ Technologies used

* JavaScript (Manifest V3)
* Browser APIs:
   - chrome.storage
   - chrome.tabs
   - chrome.runtime messaging
* Live exchange rate API: https://open.er-api.com
* HTML/CSS for popup UI


## 🚀 Deployment

1. Clone or download this repository.
2. Open:
   - Chrome: `cloudchrome://extensions`
   - Edge: `edge://extensions`
3. Enable Developer mode.
4. Click Load unpacked.
5. Select the folder containing manifest.json.


## 🗂️ Project structure

```plaintext
.
├── chrome/                         # Chrome extension code
│   ├── icons/                      # Icons used by the extension in various formats
│   ├── _locales/                   # Translations for popup and badge
│   ├── src/
│   │   ├── background/
│   │   │   └── index.js            # Service worker for exchange rates and translations
│   │   ├── content/
│   │   │   └── content.js          # Injected script that detects prices and adds badges
│   │   └── popup/
│   │       ├── popup.html          # Settings popup structure
│   │       ├── popup.css           # Popup interface styles
│   │       └── popup.js            # Logic for saving, language, and domain blacklist
│   └────────── manifest.json       # Extension configuration (MV3)
├── firefox/                        # Firefox extension code (work in progress)
└── README.md                       # Project documentation
```


## 🤝 Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.


## 📄 License

This project is licensed under the MIT License.
