# kultivarfinder_app another fine release by Benne

Created with CodeSandbox

# 🌿 Kultivarfinder-App

🚀 **Finde passende Cannabis-Kultivare basierend auf medizinischen Wirkungen.**  
Diese Web-App hilft medizinischem Fachpersonal und Patienten, geeignete Cannabis-Kultivare basierend auf deren potenziellen Wirkungen zu filtern.

---

## 🔥 **Funktionen**

✅ Auswahl von bis zu **zwei Wirkungen** zur Filterung  
✅ **Datenbank mit Kultivaren**, inklusive THC-, CBD- und Terpengehalt  
✅ **Detaillierte Terpen-Wirkungen** mit wissenschaftlichen Quellen  
✅ **Entourage-Effekt Erklärung** und Kontextualisierung  
✅ **Direkter Download von Datenblättern** als PDF  
✅ **Dynamische Filterung** mit sofortiger Anzeige passender Kultivare  
✅ **HWG-konforme Hinweise** für medizinische Anwendung  
✅ Gehostet auf **Netlify** mit **automatischen Deployments über GitHub**

---

## 🎯 **Technologien**

- **React** (Frontend)
- **JSON-Datenbank** für Kultivare
- **Netlify** (Deployment)
- **GitHub** (Versionierung)

## 🚀 **Deployment**

Die App wird **automatisch mit jeder Änderung auf GitHub auf Netlify neu deployed.**  
Falls ein manuelles Deployment nötig ist:

1. **Gehe ins Netlify-Dashboard**
2. **Wähle dein Projekt aus**
3. **Klicke auf „Trigger deploy“**

---

## 🔗 **Live-Version**

👉 [Hier geht’s zur Live-Version](https://420kultivarfinder.netlify.app/)

---

## 📂 **Projektstruktur**

```plaintext
📦 kultivarfinder_app
 ┣ 📂 public/               # Statische Dateien (z. B. index.html, JSONs)
┃ ┣ 📜 index.html
┃ ┣ 📜 kultivare.json      # Datenbank mit allen Kultivaren
┃ ┣ 📂 data/               # Terpen-Datenbanken
┃ ┃ ┣ 📜 terpenes.json     # Detaillierte Terpen-Informationen
┃ ┃ ┗ 📜 references.json   # Wissenschaftliche Quellen
┃ ┗ 📂 datenblaetter/      # PDFs für jede Sorte
┣ 📂 src/                  # Hauptcode der App
┃ ┣ 📂 components/         # React-Komponenten
 ┃ ┃ ┣ 📜 CultivarTerpenPanel.jsx  # Terpen-Wirkungen Panel
 ┃ ┃ ┗ 📜 EntourageInfo.jsx        # Entourage-Effekt Info
┃ ┣ 📜 App.js              # Hauptkomponente
┃ ┣ 📜 index.js            # Einstiegspunkt der App
┃ ┗ 📜 styles.css          # Styles für die App
┣ 📂 scripts/              # Build-Scripts
┃ ┗ 📜 validate-terpenes.mjs # Datenvalidierung
┣ 📜 package.json          # Abhängigkeiten & Scripts
┗ 📜 README.md             # Diese Datei!
```

> Halte `public/data` frei von Backup-Kopien (z. B. `*.bak`), damit Skripte und Live-Daten ausschließlich die validierten JSON-Dateien nutzen.

## 🔬 **Neue Features (Branch: feature/terpen-panel)**

### Terpen-Wirkungen Integration
- **Detaillierte Terpen-Datenbank** mit wissenschaftlichen Quellen
- **Wirkungsstärken** (schwach/mittel/stark) für jeden Effekt
- **Mindestens 2 Quellen pro Wirkung** für wissenschaftliche Fundierung
- **HWG-konforme Hinweise** für medizinische Anwendung

### Entourage-Effekt
- **Erklärung der synergistischen Wirkungen** zwischen Terpenen und Cannabinoiden
- **Kontextualisierung** der komplexen Cannabis-Wirkungen
- **Benutzerfreundliche Darstellung** wissenschaftlicher Konzepte

### Technische Verbesserungen
- **Validator-Script** für Datenintegrität (`npm run validate:data`)
- **Automatische Validierung** vor jedem Build
- **Minimalistische UI** ohne zusätzliche Libraries
- **Barrierefreie Implementierung** mit ARIA-Labels

---

## ✨ **To-Do / Weiterentwicklung**

- 🔹 Verbesserung der Benutzeroberfläche (UI/UX)
- 🔹 Erweiterung der Datenbank um weitere Kultivare
- 🔹 Mehrsprachige Unterstützung (Deutsch/Englisch)
- 🔹 Integration einer API für Live-Daten

---

## 📩 **Kontakt & Feedback**

Falls du Feedback oder Fragen hast, melde dich gerne:  
📧 **E-Mail:** [Benne](mailto:benedikt.blazeowsky@420pharma.eu)  
🐙 **GitHub:** [@Benne420](https://github.com/Benne420)

---

**🔗 Lizenz:** MIT License – Nutzung & Weiterentwicklung erlaubt. 🎉

---
