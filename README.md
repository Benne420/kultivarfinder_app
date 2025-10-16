# Cannabis Kultivar Finder

Eine React-Anwendung zur Suche und Filterung von Cannabis-Kultivaren basierend auf Terpenen und Wirkungen.

## Projektstruktur

```
src/
├── components/           # Wiederverwendbare React-Komponenten
│   ├── Button.js        # Button-Komponente mit Accessibility-Features
│   ├── Card.js          # Card- und CardContent-Komponenten
│   ├── FilterSection.js # Filter-Bereich für Terpene und Wirkungen
│   ├── Modal.js         # Zugängliches Modal für Terpen-Informationen
│   └── ResultsTable.js  # Tabelle für die Anzeige der Ergebnisse
├── constants/           # Konstanten und statische Daten
│   └── terpenInfo.js    # Terpen-Informationsdatenbank
├── hooks/              # Custom React Hooks
│   ├── useFilterOptions.js # Hook für Filter-Optionen
│   ├── useFilterState.js   # Hook für Filter-Zustand
│   └── useKultivareData.js # Hook für Datenladung
├── styles/             # Organisierte CSS-Module
│   ├── variables.css   # CSS Custom Properties
│   ├── base.css        # Basis-Styles und Resets
│   ├── layout.css      # Layout-Komponenten
│   ├── components.css  # Komponenten-Styles
│   ├── filters.css     # Filter-spezifische Styles
│   ├── table.css       # Tabellen-Styles
│   ├── terpene-chips.css # Terpen-Chip-Styles
│   ├── modal.css       # Modal-Styles
│   └── performance.css # Performance-Optimierungen
├── utils/              # Utility-Funktionen
│   └── filterUtils.js  # Filter- und PDF-Utility-Funktionen
├── App.js              # Hauptkomponente
├── index.js            # Einstiegspunkt
└── styles.css          # CSS-Imports
```

## Verbesserungen für Lesbarkeit

### 1. Komponenten-Extraktion
- **Card & CardContent**: Wiederverwendbare Container-Komponenten
- **Button**: Konsistente Button-Komponente mit Accessibility-Features
- **FilterSection**: Eigenständige Filter-Komponente
- **ResultsTable**: Getrennte Tabellen-Komponente mit Terpen-Chips
- **Modal**: Zugängliches Modal mit Keyboard-Navigation

### 2. Custom Hooks
- **useKultivareData**: Datenladung und Fehlerbehandlung
- **useFilterOptions**: Generierung von Filter-Optionen aus Daten
- **useFilterState**: Verwaltung des Filter-Zustands

### 3. Utility-Funktionen
- **filterKultivare**: Filterlogik für Kultivare
- **getPdfFileForName**: PDF-Dateinamen-Generierung
- **getFilteredOptions**: Optionen-Filterung

### 4. CSS-Organisation
- **Modulare Struktur**: Aufgeteilt in logische CSS-Module
- **CSS Custom Properties**: Konsistente Design-Tokens
- **Responsive Design**: Mobile-first Ansatz
- **Accessibility**: Focus-Styles und Touch-Targets

### 5. Dokumentation
- **JSDoc-Kommentare**: Vollständige Funktionsdokumentation
- **TypeScript-ähnliche Typen**: Präzise Parameter- und Rückgabetypen
- **Klare Namenskonventionen**: Aussagekräftige Variablen- und Funktionsnamen

## Verwendung

```bash
# Dependencies installieren
npm install

# Entwicklungsserver starten
npm start

# Produktions-Build erstellen
npm run build
```

## Features

- **Terpen-Filter**: Auswahl von bis zu 2 Terpenen
- **Wirkungs-Filter**: Auswahl von bis zu 2 Wirkungen
- **Responsive Design**: Optimiert für alle Bildschirmgrößen
- **Accessibility**: WCAG-konforme Bedienung
- **PDF-Integration**: Direkte Links zu Datenblättern
- **Terpen-Informationen**: Detaillierte Terpen-Beschreibungen

## Technische Details

- **React 18**: Moderne React-Features
- **CSS Custom Properties**: Konsistente Design-Tokens
- **Custom Hooks**: Wiederverwendbare Logik
- **Performance**: Content-Visibility und Lazy-Loading
- **Accessibility**: ARIA-Labels und Keyboard-Navigation