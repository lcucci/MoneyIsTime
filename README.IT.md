# MoneyIsTime

[![en](https://img.shields.io/badge/lang-inglese-blue.svg)](https://github.com/lcucci/MoneyIsTime/blob/main/README.md)

Estensione browser che converte i prezzi dei prodotti nel tempo di lavoro necessario per poterseli permettere.

## ✨ Funzionalità

* **Annotazione dei prezzi in tempo reale**: rileva automaticamente i prezzi su qualsiasi pagina web e mostra il tempo di lavoro equivalente in base alle impostazioni del tuo salario.
* **Modalità salario multiple**: salario orario, giornaliero o mensile, con ore lavorative/giorno e giorni lavorativi/mese personalizzabili.
* **Rilevamento e conversione automatica della valuta**: supporta prezzi con simboli (€ $, £…) o codici ISO, convertendo i valori usando tassi di cambio aggiornati da open.er-api.com.
* **Interfaccia multilingua**: localizzazione completa del popup e dei badge.
* **Blacklist per dominio**: consente di disattivare rapidamente l’estensione su siti specifici direttamente dal popup.

## 🛠️ Tecnologie utilizzate

* JavaScript (Manifest V3)
* API del browser:
   - chrome.storage
   - chrome.tabs
   - chrome.runtime messaging
* API tassi di cambio: https://open.er-api.com
* HTML/CSS per l’interfaccia del popup

## 🚀 Installazione e utilizzo

1. Clona o scarica questo repository.
2. Apri:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
3. Abilita la Modalità sviluppatore.
4. Clicca su Carica estensione non pacchettizzata (Load unpacked).
5. Seleziona la cartella contenente `manifest.json`.

## 🗂️ Struttura del progetto

```plaintext
.
├── assets/                         # Risorse statiche e file di traduzione
│   └── translations.json
├── icons/                          # Icone utilizzate dall'estensione in vari formati
│   ├── icon16-nobg.png
│   ├── icon32.png
│   ├── icon48-nobg.png
│   └── icon128-nobg.png
├── src/
│   ├── background/
│   │   └── index.js                # Service Worker: recupera tassi di cambio e traduzioni
│   ├── content/
│   │   └── content.js              # Script iniettato: rileva prezzi e aggiunge i time badge
│   └── popup/
│       ├── popup.html              # Struttura HTML del popup delle impostazioni
│       ├── popup.css               # Stile dell'interfaccia del popup
│       └── popup.js                # Logica salvataggio impostazioni, lingua e blacklist
├── manifest.json                   # Configurazione principale dell’estensione (MV3)
└── README.it.md                    # Documentazione del progetto (versione italiana)
```

## 🤝 Contribuire

Le pull request sono benvenute. Per modifiche importanti, apri prima una issue per discutere ciò che desideri proporre.

## 📄 Licenza

Questo progetto è distribuito sotto licenza MIT.
