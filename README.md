# kultivarfinder_app another fine release by Benne

Created with CodeSandbox

# 🌿 Kultivarfinder-App

🚀 **Finde passende Cannabis-Kultivare basierend auf medizinischen Wirkungen.**  
Diese Web-App hilft medizinischem Fachpersonal und Patienten, geeignete Cannabis-Kultivare basierend auf deren potenziellen Wirkungen zu filtern.

---

## 🔥 **Funktionen**

✅ Auswahl von mehreren **Wirkungen**, **Terpenen** und **Typ** (Indica-/Sativa-dominant) zur Filterung
✅ **Datenbank mit Kultivaren**, inklusive THC-, CBD- und Terpengehalt
✅ **Grid- und Listenansicht** umschaltbar
✅ **Sortenvergleich** (bis zu 4 Kultivare parallel, inkl. Detailansicht)
✅ **Ähnlichkeitssuche** zu einer Referenzsorte
✅ **Detaillierte Terpen-Wirkungen** mit wissenschaftlichen Quellen
✅ **Entourage-Effekt Erklärung** und Kontextualisierung
✅ **Netzdiagramme (Radar-Charts)** des Terpenprofils je Sorte
✅ **Direkter Download von Datenblättern** als PDF
✅ **Dynamische Filterung** mit sofortiger Anzeige passender Kultivare
✅ **HWG-konforme Hinweise** für medizinische Anwendung
✅ **Automatisierte Datenvalidierung** (Skripte + CI-Workflow, siehe unten)
✅ Gehostet auf **Cloudflare Pages** mit **automatischen Deployments über GitHub**

---

## 🎯 **Technologien**

- **React** (Frontend, via `react-scripts`)
- **JSON-Datenbank** für Kultivare, Terpene und Quellenangaben
- **Cloudflare Pages** (Deployment)
- **GitHub Actions** (Referenz-Validierung, siehe `.github/workflows/validate-refs.yml`)
- **GitHub** (Versionierung)

## 🚀 **Deployment**

Die App wird **automatisch mit jeder Änderung auf `main` über die Cloudflare-Pages-GitHub-Integration neu deployed.**
Falls ein manuelles Deployment nötig ist:

1. **Gehe ins Cloudflare-Dashboard → Workers & Pages**
2. **Wähle das Projekt `kultivarfinder-app` aus**
3. **Löse unter „Deployments“ ein erneutes Deployment aus**

---

## 🔗 **Live-Version**

👉 [Hier geht’s zur Live-Version](https://kultivarfinder-app.pages.dev/)

---

## 📂 **Projektstruktur**

```plaintext
📦 kultivarfinder_app
 ┣ 📂 public/                  # Statische Dateien, live über Cloudflare Pages ausgeliefert
 ┃ ┣ 📜 index.html
 ┃ ┣ 📜 kultivare.json         # Datenbank mit allen Kultivaren
 ┃ ┣ 📜 favicon.svg
 ┃ ┣ 📜 robots.txt
 ┃ ┣ 📂 data/                  # Terpen-/Quellen-Datenbanken
 ┃ ┃ ┣ 📜 terpenes.json        # Detaillierte Terpen-Informationen
 ┃ ┃ ┗ 📜 references.json      # Wissenschaftliche Quellen
 ┃ ┣ 📂 datenblaetter/         # PDF-Datenblatt je Sorte
 ┃ ┣ 📂 netzdiagramme/         # Radar-Chart (SVG) je Sorte
 ┃ ┗ 📂 thumbnails/            # Vorschaubild (AVIF) je Sorte
 ┣ 📂 src/                     # Hauptcode der App
 ┃ ┣ 📂 components/            # React-Komponenten (Filter, Grid/Tabelle, Modals, Vergleich, …)
 ┃ ┃ ┗ 📂 __tests__/           # Komponententests (react-scripts test)
 ┃ ┣ 📂 context/               # TerpeneContext (Terpen-Metadaten, Quellen, Alias-Lookup)
 ┃ ┣ 📂 constants/             # z. B. Terpen-Rang-Icons
 ┃ ┣ 📂 data/                  # Default-Optionen (Terpene, Wirkungen) als Fallback
 ┃ ┣ 📂 utils/                 # Hilfsfunktionen: Normalisierung, Dateipfade, Vergleichsmetriken
 ┃ ┣ 📜 App.js                 # Hauptkomponente (Filter-State via useReducer)
 ┃ ┣ 📜 index.js               # Einstiegspunkt der App
 ┃ ┗ 📜 styles.css             # Styles für die App
 ┣ 📂 scripts/                 # Node-Skripte zur Datenpflege (siehe „Datenvalidierung“)
 ┣ 📂 data/                    # kultivare.json.bak – Backup außerhalb von public/
 ┣ 📂 reports/                 # Output von validate-refs-online.mjs (Crossref-Check)
 ┣ 📂 .github/workflows/       # CI: validate-refs.yml (läuft bei PRs gegen main)
 ┣ 📜 package.json             # Abhängigkeiten & Scripts
 ┗ 📜 README.md                # Diese Datei!
```

> Halte `public/data` frei von Backup-Kopien (z. B. `*.bak`) – die aktuelle Backup-Datei liegt bewusst unter `data/kultivare.json.bak`, außerhalb des public-Ordners, damit Skripte und Live-Daten ausschließlich die validierten JSON-Dateien nutzen.

## 🔬 **Terpen-Wirkungen & Entourage-Effekt**

- **Detaillierte Terpen-Datenbank** mit wissenschaftlichen Quellen
- **Wirkungsstärken** (schwach/mittel/stark) für jeden Effekt
- **Mindestens 2 Quellen pro Wirkung** für wissenschaftliche Fundierung
- **HWG-konforme Hinweise** für medizinische Anwendung
- **Erklärung der synergistischen Wirkungen** zwischen Terpenen und Cannabinoiden (Entourage-Effekt-Modal)
- **Barrierefreie Implementierung** mit ARIA-Labels

## ✅ **Datenvalidierung**

Verfügbare npm-Skripte (siehe `package.json`):

| Skript | Zweck |
| --- | --- |
| `npm run validate` | Offline-Validierung von `public/kultivare.json` (Struktur, Pflichtfelder, Terpene) |
| `npm run validate:backups` | Prüft, ob Backup-Dateien mit den Live-Daten übereinstimmen |
| `npm run validate:refs` | Prüft wissenschaftliche Quellenangaben online (Crossref) |
| `npm run audit:scripts` | Audit der eigenen Node-Skripte |
| `npm run sync:backups` | Synchronisiert Backup-Kopien |

⚠️ Der CI-Workflow `.github/workflows/validate-refs.yml` ruft intern `npm run validate:data` auf – dieses Skript existiert aktuell **nicht** in `package.json` (nur `validate`). Das sollte angeglichen werden (Skript umbenennen oder Workflow-Aufruf korrigieren), sonst schlägt dieser CI-Schritt bei jedem PR gegen `main` fehl.

---

## ✨ **To-Do / Weiterentwicklung**

- 🔹 Verbesserung der Benutzeroberfläche (UI/UX)
- 🔹 Erweiterung der Datenbank um weitere Kultivare
- 🔹 Mehrsprachige Unterstützung (Deutsch/Englisch)
- 🔹 Integration einer API für Live-Daten
- 🔹 Fehlende Bild-Assets ergänzen: einigen Sorten fehlt aktuell das Netzdiagramm und/oder Thumbnail (z. B. „Gas Leak“, „Fight Club“, „Jealousy“, „Rose Gold Runtz“ ohne Radar-SVG)
- 🔹 CI-Workflow und `package.json`-Skriptnamen angleichen (`validate:data` vs. `validate`)
- 🔹 Testabdeckung erhöhen (aktuell nur `ComparisonPanel` und `StrainTable` getestet)

---

## 📩 **Kontakt & Feedback**

Falls du Feedback oder Fragen hast, melde dich gerne:  
📧 **E-Mail:** [Benne](mailto:benedikt.blazeowsky@420pharma.eu)  
🐙 **GitHub:** [@Benne420](https://github.com/Benne420)

---

**🔗 Lizenz:** Internes Projekt der Curaleaf-Gruppe (420 Pharma). Es liegt keine LICENSE-Datei im Repository vor – die bisherige Angabe „MIT License“ war nicht durch eine Lizenzdatei gedeckt. Bitte mit Legal/Compliance klären, bevor Code oder Daten außerhalb der Organisation weitergegeben werden.

---
