# Website Taste of India: Texte selbst ändern

Hier steht, wie Sie Texte, Preise, Öffnungszeiten und Bilder Ihrer Website selbst ändern können.
Sie brauchen dafür keine Programmierkenntnisse, sondern nur einen einfachen Texteditor.

---

## 1. Welche Datei öffne ich?

**Alles Sichtbare steht in einer einzigen Datei: `content.json`**

Sie liegt im Hauptordner der Website, direkt neben `index.html`.

Zum Öffnen einen **einfachen Texteditor** verwenden:

- **Windows:** Rechtsklick auf `content.json` → „Öffnen mit“ → **Editor** (Notepad).
  Noch angenehmer ist das kostenlose Programm **Notepad++**.
- **Mac:** Rechtsklick → „Öffnen mit“ → **TextEdit**.
  Wichtig: In TextEdit vorher im Menü *Format* → **„In reinen Text umwandeln“** wählen.

**Nicht verwenden:** Word, Pages oder LibreOffice. Diese Programme verändern die Anführungszeichen und machen die Datei unbrauchbar.

---

## 2. Wie ist die Datei aufgebaut?

Jede Zeile hat links einen **Namen** und rechts den **Inhalt**:

```
"telefon_anzeige": "0561 97010337",
```

- Links vom Doppelpunkt steht der Name, z. B. `"telefon_anzeige"`. **Den nie ändern.**
- Rechts steht der Text zwischen Anführungszeichen, z. B. `"0561 97010337"`. **Nur den ändern Sie.**

Die Datei ist in Bereiche gegliedert:

| Bereich | Was drinsteht |
|---|---|
| `restaurant` | Name, Telefon, Adresse, Link zu Lieferando, Google-Sterne |
| `seo` | Titel und Beschreibung für Google |
| `hero` | Große Überschrift ganz oben, Satz darunter, Bild |
| `galerie` | Die Bilderreihe „Impressionen“ direkt unter der Überschrift (**noch Platzhalter-Fotos**) |
| `gerichte` | Die drei großen Gerichte-Szenen: Name, Beschreibung, Preis, Bilder |
| `speisekarte` | Kategorien mit „ab“-Preis |
| `bewertungen` | Die Kundenstimmen |
| `oeffnungszeiten` | Tage und Uhrzeiten |
| `standort`, `abschluss`, `footer` | Button-Texte, Schlusssatz, Links zu Impressum und Datenschutz |
| `ki_kennzeichnung` | Hinweis „KI-generiertes Symbolbild“ |

---

## 3. Was darf ich ändern, was nicht?

### Das dürfen Sie

- Jeden Text **zwischen den Anführungszeichen rechts** ändern.
- Preise ändern, z. B. `"14,50 €"` → `"15,00 €"`.
- `true` und `false` umstellen (ohne Anführungszeichen!), z. B. beim KI-Hinweis.

### Das bitte nicht

1. **Kommas nicht löschen.** Am Ende fast jeder Zeile steht ein Komma. Es trennt die Einträge.
   Die **letzte** Zeile in einem Bereich (direkt vor `}` oder `]`) hat **kein** Komma.
2. **Anführungszeichen nicht löschen.** Jeder Text beginnt und endet mit `"`.
3. **Keine Anführungszeichen im Text selbst.** Wenn Sie eins brauchen, schreiben Sie `\"`
   oder nehmen Sie typografische Zeichen wie „so“.
4. **Die Namen links** (`"preis"`, `"tag"` …) sowie die Klammern `{ } [ ]` nicht verändern.

**Richtig:**
```
"preis": "15,90 €",
```
**Falsch** (Komma fehlt, Anführungszeichen fehlt):
```
"preis": "15,90 €
```

---

## 4. Häufige Änderungen, Schritt für Schritt

### Einen Preis ändern
Suchen Sie (Strg+F bzw. Cmd+F) nach dem Gericht, z. B. `Butter Chicken`. Zwei Zeilen darunter steht `"preis": "14,50 €",`. Nur die Zahl ändern.

### Öffnungszeiten ändern
Im Bereich `oeffnungszeiten` steht für jeden Tag:
```
{ "tag": "Montag", "zeiten": ["11:30-14:30", "16:30-22:00"] },
```
- Zeiten immer im Format `"11:30-14:30"` (Stunde:Minute, Bindestrich, Stunde:Minute).
- **Ruhetag:** leere Klammern → `"zeiten": []`
- **Nur ein Zeitfenster:** `"zeiten": ["12:00-22:00"]`

Die Website hebt den heutigen Tag automatisch hervor und zeigt an, ob gerade geöffnet ist.

### Telefonnummer ändern
Zwei Einträge im Bereich `restaurant`:
- `telefon_anzeige`: so, wie die Nummer auf der Seite **aussehen** soll (`"0561 97010337"`)
- `telefon_waehlen`: für den Anruf-Button, **international ohne Leerzeichen** (`"+4956197010337"`)

### Echte Bewertungen eintragen
Im Bereich `bewertungen` → `eintraege` gibt es drei Einträge. Für jeden:
- `text`: das Zitat aus Google (kurz halten, zwei bis drei Sätze)
- `name`: Name, wie er bei Google steht, z. B. `"Martina K."`
- `sterne`: Zahl von 1 bis 5, ohne Anführungszeichen
- `ist_platzhalter`: auf **`false`** stellen, dann verschwindet das Schild „Platzhalter“

Wenn alle drei echt sind, auch den Satz bei `platzhalter_hinweis` ändern, z. B. in `""` (leer) oder einen eigenen Satz.

### Echte Fotos einsetzen
1. Foto in den Ordner `assets/img/` hochladen (am besten als `.webp` oder `.jpg`, **Querformat 16:9**, ca. 1400 Pixel breit).
2. In `content.json` den Pfad ändern, z. B.
   `"bild": "assets/img/butter-chicken-echt.jpg",`
   Für Handys gibt es `bild_mobil` (gleiches Foto, ca. 800 Pixel breit). Sie können dort auch dasselbe Foto eintragen.
3. **KI-Kennzeichnung abschalten:** beim selben Gericht `"ki_generiert": false` setzen.

**Bewegung der Gerichte:**
- `ueberschrift`: `"rechts"` oder `"links"`, also auf welcher Seite Name und Preis stehen. Das Bild weicht zur anderen Seite aus.
- `effekt`: `"explosion"` (die Zutaten fliegen beim Scrollen auseinander) oder `"kreis"` (das Bild öffnet sich aus einem kleinen Kreis und dreht sich dabei).
  Die Explosion braucht ein zweites, exakt passendes Bild in `bild_explodiert`. Wenn Sie echte Fotos einsetzen, lassen Sie
  `bild_explodiert` leer (`""`); die Szene zeigt das Foto dann automatisch mit dem Kreis-Effekt.

Echte Fotos wirken am besten, wenn die Schale in der Bildmitte steht und der Hintergrund hell und ruhig ist.

### Galerie „Impressionen“: Platzhalter durch eigene Fotos ersetzen

**Wichtig:** Die sechs Bilder der Galerie sind **Platzhalter**. Es sind lizenzfreie Stockfotos
(Pexels, frei nutzbar) und sie zeigen **nicht** Ihr Restaurant. Auf der Website tragen sie deshalb das
Schild „Platzhalter“. Bitte so bald wie möglich durch eigene Fotos ersetzen.

Die Bilder liegen im Ordner `assets/img/galerie/`:

| Datei | Format | Motiv-Idee für Ihr Foto |
|---|---|---|
| `platzhalter-ambiente-1.jpg` | **hoch** (4:5) | Ihr Gastraum |
| `platzhalter-gewuerzmarkt.jpg` | **quer** (3:2) | Gewürze aus Ihrer Küche |
| `platzhalter-tandoor.jpg` | **hoch** (4:5) | Ihr Tandoor-Ofen oder die Küche |
| `platzhalter-naan.jpg` | **quer** (3:2) | frisches Naan |
| `platzhalter-ambiente-2.jpg` | **hoch** (4:5) | ein gedeckter Tisch, Deko, Eingang |
| `platzhalter-gedeckter-tisch.jpg` | **quer** (3:2) | mehrere Gerichte auf dem Tisch |

**Der einfachste Weg (gleicher Dateiname):**
1. Ihr Foto auf das richtige Format zuschneiden:
   - „hoch“ = Hochformat **4:5**, ideal **900 × 1125 Pixel**
   - „quer“ = Querformat **3:2**, ideal **1350 × 900 Pixel**
   Das geht z. B. am Handy in der Fotos-App (Zuschneiden → Seitenverhältnis) oder am PC mit „Paint“.
   Stimmt das Seitenverhältnis nicht, wird das Foto am Rand abgeschnitten.
2. Das Foto als **JPG** speichern und **genau so benennen** wie die Datei, die es ersetzen soll,
   z. B. `platzhalter-naan.jpg`.
3. Die Datei in `assets/img/galerie/` hochladen und die alte **überschreiben**.
4. In `content.json` im Bereich `galerie` → `bilder` beim passenden Bild
   `"ist_platzhalter": false` setzen, dann verschwindet das Schild „Platzhalter“.
   Auch `bildunterschrift` (kurzer Text unter dem Bild) und `beschreibung` (für Blinde und Google)
   passend zu Ihrem Foto ändern. Die Zeile `quelle` können Sie dann löschen oder leer lassen (`""`).
5. Sind alle sechs ersetzt, verschwindet der Hinweis „Platzhalter: Diese Stockfotos …“ automatisch.

**Anderer Dateiname?** Auch möglich: Foto hochladen und in `content.json` den Pfad bei `"bild"` ändern.
Bei `"format"` eintragen, ob es `"hoch"` oder `"quer"` ist.

### KI-Hinweis im Footer
Im Bereich `ki_kennzeichnung`: `"footer_text_anzeigen": false` blendet den Satz aus.
Das bitte erst tun, wenn **alle** Bilder echte Fotos sind.

---

## 5. Wie lade ich die Datei hoch?

1. Datei speichern (Strg+S bzw. Cmd+S). Der Dateiname bleibt **genau** `content.json`.
2. Beim Webhoster anmelden (z. B. IONOS, Strato, all-inkl) und den **Dateimanager** öffnen,
   oder ein FTP-Programm wie **FileZilla** verwenden.
3. In den Ordner der Website wechseln (dort liegt auch `index.html`).
4. `content.json` hochladen und die alte Datei **ersetzen**.
5. Die Website im Browser neu laden. Falls noch der alte Text zu sehen ist: **Strg+F5** (Windows) bzw. **Cmd+Shift+R** (Mac).

**Tipp:** Vor jeder Änderung eine Kopie anlegen, z. B. `content-sicherung.json`. Dann können Sie jederzeit zurück.

---

## 6. Und wenn ich mich vertippt habe?

Keine Sorge, die Seite bleibt **nicht leer**. Bei einem Fehler in `content.json` zeigt sie automatisch
die zuletzt ausgelieferten Standard-Texte an. Ihre Änderungen erscheinen dann aber auch nicht.

So finden Sie den Fehler:

1. Den gesamten Inhalt von `content.json` kopieren.
2. Auf **https://jsonlint.com** einfügen und auf „Validate JSON“ klicken.
3. Die Seite zeigt die Zeile mit dem Fehler, meist ein fehlendes Komma oder Anführungszeichen.

Wer mag, sieht die Meldung auch im Browser: Taste **F12** → Reiter **Konsole**. Dort steht auf Deutsch,
in welcher Zeile der Fehler liegt.

---

## 7. Was steht NICHT in content.json?

- **Impressum und Datenschutz** (`impressum.html`, `datenschutz.html`): Das sind Platzhalter. Sie müssen
  vor der Veröffentlichung mit den echten Angaben gefüllt werden. Name, Adresse und Telefon kommen aber
  auch dort automatisch aus `content.json`.
- **Vorschau für Google und Messenger**: Titel und Beschreibung stehen zusätzlich oben in `index.html`,
  weil manche Dienste (WhatsApp, Facebook) keine Skripte ausführen. Wer den Titel in `content.json`
  ändert, sollte ihn dort ebenfalls anpassen (Zeilen mit `<title>` und `description`).
- `assets/js/content-fallback.js` ist die Sicherheitskopie für den Notfall. **Bitte nicht bearbeiten.**

---

## Wichtig beim Testen

Die Website muss über einen Webserver laufen (also online oder mit einem lokalen Testserver).
Öffnen Sie `index.html` per Doppelklick direkt vom Computer, zeigt der Browser nur die Standard-Texte,
weil er aus Sicherheitsgründen `content.json` nicht lesen darf.
