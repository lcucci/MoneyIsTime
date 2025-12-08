# MoneyIsTime

[![en](https://img.shields.io/badge/lang-english-blue.svg)](https://github.com/lcucci/MoneyIsTime/blob/main/README.md)

Estensione browser che converte i prezzi dei prodotti nel tempo di lavoro necessario per poterseli permettere.

## 🗂️ Struttura del progetto

```plaintext
.
├── chrome/                         # Codice dell'estensione Chrome
│   ├── icons/                      # Icone utilizzate dall'estensione in vari formati
│   ├── _locales/                   # Traduzioni per popup e badge
│   ├── src/
│   │   ├── background/
│   │   │   └── index.js            # Service worker per tassi di cambio e traduzioni
│   │   ├── content/
│   │   │   └── content.js          # Script iniettato che rileva i prezzi e aggiunge i badge
│   │   └── popup/
│   │       ├── popup.html          # Struttura del popup delle impostazioni
│   │       ├── popup.css           # Stili dell'interfaccia del popup
│   │       └── popup.js            # Logica per salvataggio, lingua e blacklist dei domini
│   └────────── manifest.json       # Configurazione dell'estensione (MV3)
├── firefox/                        # Codice dell'estensione Firefox (work in progress)
└── README.md                       # Documentazione del progetto
```


## ðŸ¤ Contribuire

Le pull request sono benvenute. Per modifiche importanti, apri prima una issue per discutere ciÃ² che desideri proporre.

## ðŸ“„ Licenza

Questo progetto Ã¨ distribuito sotto licenza MIT.


