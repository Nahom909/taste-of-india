# Taste of India, Kassel – Website

One-Pager für das indische Restaurant **Taste of India**, Wolfhager Str. 415, 34128 Kassel.
Filmische Scroll-Website: Beim Scrollen führt eine Kamerafahrt durch die Gerichte.

## Aufbau

| Datei / Ordner | Inhalt |
|---|---|
| `index.html` | Seitengerüst ohne Inhaltstexte |
| `content.json` | **Alle Texte, Preise, Öffnungszeiten, Links und Bildpfade** |
| `LIES-MICH.md` | Anleitung für den Inhaber: Texte ändern, Bilder tauschen, hochladen |
| `assets/js/content.js` | Lädt `content.json`, setzt die Inhalte ein, Fallback bei Fehlern |
| `assets/js/content-fallback.js` | Sicherheitskopie der Texte (greift, wenn `content.json` fehlerhaft ist) |
| `assets/js/motion.js` | Scroll-Choreografie mit GSAP, ScrollTrigger und Lenis |
| `assets/css/style.css` | Gestaltung (Farben und Schriften als Variablen ganz oben) |
| `assets/fonts/` | Fraunces und Hanken Grotesk, selbst gehostet und auf Deutsch/Latein reduziert |
| `assets/img/` | Bilder (WebP, jeweils mit `-m`-Version fürs Handy) |
| `assets/vendor/` | GSAP 3.13, ScrollTrigger, Lenis 1.3 (lokal, keine CDN-Verbindung) |
| `impressum.html`, `datenschutz.html` | **Platzhalter**, vor Veröffentlichung ausfüllen |

## Szenen

1. **Hero**: Gewürze, Headline baut sich Buchstabe für Buchstabe auf, Kamera zoomt in die Gewürze
2. **Impressionen**: horizontale Galerie (Desktop gepinnt, Handy wischbar)
3. **Butter Chicken** und **Lamm Biryani**: fertiges Gericht blendet weich ins explodierte Bild über, Zutaten fliegen in Tiefenebenen auseinander
4. **Saag Paneer**: Bild öffnet sich aus einem Kreis, dreht sich und wandert zur Seite
5. Speisekarte, Bewertungen, Standort & Öffnungszeiten, Abschluss, Footer

Bei „Bewegung reduzieren“ im System werden alle Szenen statisch gezeigt.

## Lokal ansehen

Die Seite liest `content.json` per `fetch`, deshalb über einen kleinen Webserver öffnen
(nicht per Doppelklick auf `index.html`):

```
python -m http.server 8781
```

Dann `http://localhost:8781` im Browser öffnen.

## Wichtige Hinweise

- **KI-Bilder:** Alle Food- und Gewürzbilder sind KI-generierte Symbolbilder. Jedes Bild trägt die
  Kennzeichnung „KI-generiertes Symbolbild“, im Footer steht ein Hinweis. Beides ist in `content.json` abschaltbar.
- **Platzhalter:** Die Galerie „Impressionen“ zeigt lizenzfreie Stockfotos von Pexels (Quellen im Kommentar in
  `index.html` und im Feld `quelle` in `content.json`). Die drei Bewertungen sind ebenfalls Platzhalter.
- **Preise** der Signature-Gerichte und die Einstiegspreise der Speisekarte vom Inhaber bestätigen lassen.
- Nach Änderungen an CSS oder JavaScript die Versionsnummer `?v=` in `index.html` hochzählen,
  damit Browser nicht die alte Version aus dem Cache zeigen.
