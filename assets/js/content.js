/* Taste of India: Inhalte laden und in die Seite schreiben.
   Alle sichtbaren Texte kommen aus content.json. Ist die Datei fehlerhaft oder nicht erreichbar,
   springt die gespeicherte Kopie aus content-fallback.js ein, und die Konsole erklärt, was los ist. */
(function () {
  'use strict';

  var LOG = '[Taste of India]';
  var FALLBACK = window.TOI_FALLBACK || {};
  var DAY_INDEX = { sonntag: 0, montag: 1, dienstag: 2, mittwoch: 3, donnerstag: 4, freitag: 5, samstag: 6 };
  var SPICES = ['d-anise', 'd-chili', 'd-cardamom', 'd-cinnamon', 'd-leaf'];

  /* ---------- Laden ---------- */

  function lineCol(text, pos) {
    var before = text.slice(0, pos).split('\n');
    return { line: before.length, col: before[before.length - 1].length + 1 };
  }

  function explainJsonError(text, err) {
    var where = '';
    var m = /position (\d+)/i.exec(err.message);
    if (m) {
      var lc = lineCol(text, +m[1]);
      where = ' in Zeile ' + lc.line + ' (oder am Ende der Zeile davor)';
    }
    console.error(
      LOG + ' content.json enthält einen Fehler' + where + '.\n' +
      'Die Website zeigt deshalb die gespeicherten Standard-Texte an.\n' +
      'Häufige Ursachen: ein fehlendes oder überzähliges Komma, ein fehlendes Anführungszeichen,\n' +
      'oder ein Anführungszeichen mitten im Text (dann \\" schreiben).\n' +
      'Tipp: Den Inhalt der Datei auf https://jsonlint.com einfügen, dort wird die Stelle markiert.\n' +
      'Technische Meldung: ' + err.message
    );
  }

  function isObj(v) { return v && typeof v === 'object' && !Array.isArray(v); }

  /* Legt die geladenen Werte über die Standard-Texte. Fehlt etwas, bleibt der Standard stehen. */
  function merge(base, over) {
    if (Array.isArray(base)) {
      if (!Array.isArray(over)) return base;
      return over.map(function (item, i) {
        return isObj(item) && isObj(base[i]) ? merge(base[i], item) : (item == null ? base[i] : item);
      });
    }
    if (isObj(base)) {
      var out = {};
      Object.keys(base).forEach(function (k) { out[k] = base[k]; });
      if (!isObj(over)) return out;
      Object.keys(over).forEach(function (k) {
        out[k] = k in base ? merge(base[k], over[k]) : over[k];
      });
      return out;
    }
    if (over === undefined || over === null) return base;
    if (typeof base === 'string' && typeof over !== 'string' && typeof over !== 'number') return base;
    return over;
  }

  function load() {
    if (location.protocol === 'file:') {
      console.warn(LOG + ' Die Seite wurde direkt als Datei geöffnet. Browser erlauben dann kein Lesen von content.json.\n' +
        'Es werden die Standard-Texte gezeigt. Auf dem Webspace (oder mit einem lokalen Server) erscheint der Inhalt aus content.json.');
      return Promise.resolve(FALLBACK);
    }
    return fetch('content.json', { cache: 'no-cache' })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        return res.text();
      })
      .then(function (text) {
        try {
          return merge(FALLBACK, JSON.parse(text));
        } catch (err) {
          explainJsonError(text, err);
          return FALLBACK;
        }
      })
      .catch(function (err) {
        console.error(LOG + ' content.json konnte nicht geladen werden (' + err.message + '). ' +
          'Liegt die Datei im selben Ordner wie index.html und heißt sie genau "content.json"? Es werden die Standard-Texte gezeigt.');
        return FALLBACK;
      });
  }

  /* ---------- Helfer ---------- */

  function get(obj, path) {
    return path.split('.').reduce(function (o, k) { return o == null ? undefined : o[k]; }, obj);
  }
  function str(v) { return v == null ? '' : String(v); }
  function esc(v) {
    return str(v).replace(/[&<>"']/g, function (ch) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch];
    });
  }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function icon(id, cls) { return '<svg class="' + (cls || 'ico') + '" aria-hidden="true" focusable="false"><use href="#' + id + '"/></svg>'; }

  function pic(src, srcMobile, alt, opts) {
    opts = opts || {};
    var img = '<img src="' + esc(src) + '" alt="' + esc(alt) + '" width="1376" height="768" decoding="async"' +
      (opts.eager ? '' : ' loading="lazy"') + (opts.cls ? ' class="' + opts.cls + '"' : '') + '>';
    return '<picture>' + (srcMobile ? '<source media="(max-width: 767px)" srcset="' + esc(srcMobile) + '">' : '') + img + '</picture>';
  }

  /* Überschrift in Wörter und Buchstaben zerlegen (für die Buchstaben-Animation).
     Screenreader lesen den ganzen Satz aus der unsichtbaren Kopie. */
  function rich(el, text, italicWord, underlineWord) {
    text = str(text).trim();
    var clean = function (w) { return w.toLowerCase().replace(/[.,!?:;]/g, ''); };
    var it = clean(str(italicWord)), ul = clean(str(underlineWord));
    var html = '<span class="sr-only">' + esc(text) + '</span><span class="rich" aria-hidden="true">';
    text.split(/\s+/).forEach(function (word, i, arr) {
      var cls = 'w';
      if (it && clean(word) === it) cls += ' w--it';
      if (ul && clean(word) === ul) cls += ' w--ul';
      html += '<span class="' + cls + '">';
      Array.from(word).forEach(function (ch) {
        html += '<span class="ch"><span class="chi">' + esc(ch) + '</span></span>';
      });
      if (cls.indexOf('w--ul') > -1) {
        html += '<svg class="squiggle squiggle--tomato" preserveAspectRatio="none" aria-hidden="true"><use href="#d-underline"/></svg>';
      }
      html += '</span>' + (i < arr.length - 1 ? ' ' : '');
    });
    el.innerHTML = html + '</span>';
  }

  function stars(n) {
    var out = '';
    for (var i = 0; i < 5; i++) out += icon('i-star-fill', 'star' + (i < n ? '' : ' star--off'));
    return out;
  }

  /* ---------- Gerichte-Szenen ---------- */

  function dishScene(d, i, c) {
    // Effekte: "explosion" (braucht ein zweites, passendes Bild in bild_explodiert) oder "kreis".
    // Fehlt das explodierte Bild, wird automatisch "kreis" verwendet.
    var effect = str(d.effekt).toLowerCase() === 'explosion' && d.bild_explodiert ? 'burst' : 'orb';
    var side = str(d.ueberschrift).toLowerCase() === 'links' ? 'links' : 'rechts';   // Seite der Überschrift
    var id = 'gericht-' + (i + 1);
    var alt = d.bild_beschreibung || d.name;
    var stage;

    if (effect === 'burst') {
      var pieces = ['base', 'l', 'r', 't'].map(function (p) {
        return '<div class="piece piece--' + p + '">' + pic(d.bild_explodiert, d.bild_explodiert_mobil, '') + '</div>';
      }).join('');
      stage =
        '<div class="plate">' + pic(d.bild, d.bild_mobil, alt) + '</div>' +
        '<div class="burst" aria-hidden="true">' + pieces + '</div>';
    } else {
      stage =
        '<div class="orb">' + pic(d.bild, d.bild_mobil, alt, { cls: 'orb__img' }) + '</div>' +
        '<svg class="orb__ring" viewBox="0 0 100 100" aria-hidden="true"><path vector-effect="non-scaling-stroke" d="M50.6 3.4C76.4 3 97.2 23.4 96.7 49.7 96.2 76.3 75.6 97 49.2 96.6 23.1 96.2 3.1 75.2 3.4 49.3 3.7 26.8 19.3 8.6 42 4.6"/></svg>' +
        '<div class="orb__orbit" aria-hidden="true">' +
          icon('d-chili', 'orbit-ico orbit-ico--1') + icon('d-cardamom', 'orbit-ico orbit-ico--2') +
          icon('d-anise', 'orbit-ico orbit-ico--3') + icon('d-leaf', 'orbit-ico orbit-ico--4') +
        '</div>';
    }

    var name = document.createElement('h2');
    name.className = 'scene__name';
    name.id = id;
    rich(name, d.name, d.kursives_wort, '');

    return '' +
      '<section class="scene scene--' + effect + ' scene--text-' + side + '" data-effect="' + effect + '" data-text="' + side + '"' +
        ' data-burst-src="' + esc(d.bild_explodiert || '') + '" aria-labelledby="' + id + '">' +
        '<div class="scene__stage">' +
          '<div class="scene__cam"><div class="scene__drift"><div class="scene__tilt">' + stage + '</div></div></div>' +
          '<div class="scene__text">' +
            name.outerHTML +
            '<p class="scene__desc">' + esc(d.beschreibung) + '</p>' +
            '<p class="scene__price"><span>' + esc(d.preis) + '</span>' +
              '<svg class="squiggle squiggle--curry" preserveAspectRatio="none" aria-hidden="true"><use href="#d-underline"/></svg></p>' +
          '</div>' +
          (d.ki_generiert === true ? '<p class="ki-badge">' + esc(get(c, 'ki_kennzeichnung.bild_text')) + '</p>' : '') +
        '</div>' +
      '</section>';
  }

  /* ---------- Öffnungszeiten ---------- */

  function parseSlot(s) {
    var m = /(\d{1,2})[:.](\d{2})\s*[-–bis ]+\s*(\d{1,2})[:.](\d{2})/.exec(str(s));
    if (!m) return null;
    return { from: +m[1] * 60 + +m[2], to: +m[3] * 60 + +m[4], a: m[1] + ':' + m[2], b: m[3] + ':' + m[4] };
  }

  function renderHours(c) {
    var o = c.oeffnungszeiten || {};
    var tage = Array.isArray(o.tage) ? o.tage : [];
    var now = new Date();
    var today = now.getDay();
    var mins = now.getHours() * 60 + now.getMinutes();
    var status = { open: false, until: '', next: '' };

    var html = tage.map(function (t) {
      var idx = DAY_INDEX[str(t.tag).trim().toLowerCase()];
      var slots = (Array.isArray(t.zeiten) ? t.zeiten : []).map(parseSlot).filter(Boolean);
      var isToday = idx === today;
      if (isToday) {
        slots.forEach(function (s) {
          if (mins >= s.from && mins < s.to) { status.open = true; status.until = s.b; }
          else if (mins < s.from && !status.next) status.next = s.a;
        });
      }
      var times = slots.length
        ? slots.map(function (s) { return '<span class="slot"><span>' + s.a + '</span><span class="slot__sep">-</span><span>' + s.b + '</span></span>'; }).join('')
        : '<span class="slot slot--closed">' + esc(o.geschlossen_text) + '</span>';
      return '<div class="hours__row' + (isToday ? ' is-today' : '') + '">' +
        '<dt>' + esc(t.tag) + (isToday ? ' <em class="hours__today">' + esc(o.heute_text) + '</em>' : '') + '</dt>' +
        '<dd>' + times + '</dd>' +
        (isToday ? '<svg class="hours__mark" preserveAspectRatio="none" aria-hidden="true"><use href="#d-scribble"/></svg>' : '') +
        '</div>';
    }).join('');
    $$('[data-hours]').forEach(function (el) { el.innerHTML = html; });

    var uhr = o.uhr_text ? ' ' + o.uhr_text : '';
    var text = status.open
      ? o.jetzt_geoeffnet_text + ', ' + o.bis_text + ' ' + status.until + uhr
      : o.jetzt_geschlossen_text + (status.next ? ', ' + o.oeffnet_heute_um_text + ' ' + status.next + uhr : '');
    $$('[data-status]').forEach(function (el) {
      el.innerHTML = '<span class="status__icon">' + icon('i-clock') + '</span><span>' + esc(text) + '</span>';
      el.classList.toggle('is-open', status.open);
    });
  }

  /* ---------- Strukturierte Daten (schema.org) ---------- */

  function jsonLd(c) {
    var r = c.restaurant || {};
    var days = { 0: 'Sunday', 1: 'Monday', 2: 'Tuesday', 3: 'Wednesday', 4: 'Thursday', 5: 'Friday', 6: 'Saturday' };
    var spec = [];
    (get(c, 'oeffnungszeiten.tage') || []).forEach(function (t) {
      var idx = DAY_INDEX[str(t.tag).trim().toLowerCase()];
      (t.zeiten || []).map(parseSlot).filter(Boolean).forEach(function (s) {
        spec.push({ '@type': 'OpeningHoursSpecification', dayOfWeek: days[idx], opens: s.a, closes: s.b });
      });
    });
    var base = location.href.split('#')[0].replace(/index\.html$/, '');
    var data = {
      '@context': 'https://schema.org',
      '@type': 'Restaurant',
      name: r.name,
      description: get(c, 'seo.beschreibung'),
      url: base,
      image: base + 'assets/img/og-image.jpg',
      telephone: r.telefon_waehlen,
      servesCuisine: 'Indisch',
      acceptsReservations: true,
      hasMenu: r.bestellen_link,
      address: {
        '@type': 'PostalAddress',
        streetAddress: r.strasse,
        postalCode: r.plz,
        addressLocality: r.ort,
        addressCountry: 'DE'
      },
      openingHoursSpecification: spec,
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: str(r.google_sterne).replace(',', '.'),
        reviewCount: str(r.google_anzahl_rezensionen),
        bestRating: '5'
      }
    };
    var s = document.createElement('script');
    s.type = 'application/ld+json';
    s.textContent = JSON.stringify(data);
    document.head.appendChild(s);
  }

  /* ---------- Alles einsetzen ---------- */

  function render(c) {
    var r = c.restaurant || {};

    // SEO
    if (get(c, 'seo.seitentitel')) document.title = c.seo.seitentitel;
    var md = document.querySelector('meta[name="description"]');
    if (md && get(c, 'seo.beschreibung')) md.setAttribute('content', c.seo.beschreibung);

    // Szenen zuerst, damit ihre Texte unten mit gefüllt werden
    var dishes = document.querySelector('[data-dishes]');
    if (dishes) dishes.innerHTML = (Array.isArray(c.gerichte) ? c.gerichte : []).map(function (d, i) { return dishScene(d, i, c); }).join('');

    // einfache Texte
    $$('[data-c]').forEach(function (el) { el.textContent = str(get(c, el.getAttribute('data-c'))); });
    $$('[data-attr]').forEach(function (el) {
      el.getAttribute('data-attr').split(',').forEach(function (pair) {
        var p = pair.split('=');
        var v = get(c, p[1].trim());
        if (v != null && v !== '') el.setAttribute(p[0].trim(), v);
      });
    });
    $$('[data-rich]').forEach(function (el) {
      rich(el, get(c, el.getAttribute('data-rich')),
        get(c, el.getAttribute('data-rich-italic') || ''), get(c, el.getAttribute('data-rich-underline') || ''));
    });

    // Links
    $$('[data-tel]').forEach(function (el) { el.setAttribute('href', 'tel:' + str(r.telefon_waehlen).replace(/\s+/g, '')); });
    $$('[data-order]').forEach(function (el) { el.setAttribute('href', r.bestellen_link || '#'); });
    $$('[data-route]').forEach(function (el) { el.setAttribute('href', r.route_link || '#'); });
    $$('[data-google]').forEach(function (el) { el.setAttribute('href', r.google_link || '#'); });

    // Bilder aus content.json
    $$('[data-src-from]').forEach(function (el) {
      var v = get(c, el.getAttribute('data-src-from'));
      if (!v) return;
      if (el.tagName === 'SOURCE') { if (el.getAttribute('srcset') !== v) el.setAttribute('srcset', v); }
      else if (el.getAttribute('src') !== v) el.setAttribute('src', v);
    });

    // KI-Kennzeichnung
    $$('[data-ki]').forEach(function (el) {
      if (get(c, el.getAttribute('data-ki')) === true) el.textContent = str(get(c, 'ki_kennzeichnung.bild_text'));
      else el.remove();
    });
    $$('[data-ki-footer]').forEach(function (el) {
      if (get(c, 'ki_kennzeichnung.footer_text_anzeigen') === true) el.textContent = str(get(c, 'ki_kennzeichnung.footer_text'));
      else el.remove();
    });

    // Sterne
    $$('[data-stars]').forEach(function (el) { el.innerHTML = stars(+el.getAttribute('data-stars') || 5); });

    // Speisekarte
    var cats = get(c, 'speisekarte.kategorien');
    var pre = str(get(c, 'speisekarte.preis_vorsilbe'));
    $$('[data-menu]').forEach(function (el) {
      el.innerHTML = (Array.isArray(cats) ? cats : []).map(function (k, i, arr) {
        return '<li class="menu__item">' +
          '<span class="menu__name">' + esc(k.name) + '</span>' +
          '<span class="menu__price">' + esc(pre) + ' ' + esc(k.preis) + '</span>' +
          (i < arr.length - 1 ? icon(SPICES[i % SPICES.length], 'menu__sep') : '') +
          '</li>';
      }).join('');
    });

    // Bewertungen (Endlos-Band: sichtbare Originale + versteckte Wiederholungen)
    var b = c.bewertungen || {};
    var list = Array.isArray(b.eintraege) ? b.eintraege : [];
    var card = function (e, hidden) {
      var n = Math.max(0, Math.min(5, Math.round(+e.sterne || 5)));
      return '<figure class="quote"' + (hidden ? ' aria-hidden="true"' : '') + '>' +
        '<span class="stars" role="img" aria-label="' + n + ' ' + esc(get(c, 'bedienhilfen.sterne_von_fuenf')) + '">' + stars(n) + '</span>' +
        '<blockquote>' + esc(e.text) + '</blockquote>' +
        '<figcaption><span class="quote__name">' + esc(e.name) + '</span>' +
        (e.ist_platzhalter ? '<span class="quote__tag">' + esc(b.platzhalter_label) + '</span>' : '') +
        '</figcaption>' + icon('d-anise', 'quote__sep') + '</figure>';
    };
    $$('[data-reviews]').forEach(function (el) {
      if (!list.length) { el.closest('.reviews').remove(); return; }
      var html = list.map(function (e) { return card(e, false); }).join('');
      var reps = Math.max(1, Math.ceil(6 / list.length));
      for (var k = 1; k < reps * 2; k++) html += list.map(function (e) { return card(e, true); }).join('');
      el.innerHTML = html;
    });

    // Galerie (Platzhalter-Stockfotos, siehe content.json "galerie")
    var g = c.galerie || {};
    var shots = Array.isArray(g.bilder) ? g.bilder : [];
    $$('[data-gallery-track]').forEach(function (el) {
      if (!shots.length) { el.closest('.gallery').remove(); return; }
      el.innerHTML = shots.map(function (b, i) {
        var hoch = str(b.format).toLowerCase() === 'hoch';
        return '<figure class="shot shot--' + (hoch ? 'hoch' : 'quer') + '" data-depth="' + [0.6, -0.4, 0.9, -0.7, 0.4, -0.9][i % 6] + '">' +
          '<div class="shot__frame"><img class="shot__img" src="' + esc(b.bild) + '" alt="' + esc(b.beschreibung) + '"' +
          ' width="' + (hoch ? 900 : 1350) + '" height="' + (hoch ? 1125 : 900) + '" loading="lazy" decoding="async"></div>' +
          '<figcaption><span>' + esc(b.bildunterschrift) + '</span>' +
          (b.ist_platzhalter === true ? '<span class="quote__tag">' + esc(g.platzhalter_label) + '</span>' : '') +
          '</figcaption></figure>';
      }).join('');
    });
    var anyPlaceholder = shots.some(function (b) { return b.ist_platzhalter === true; });
    if (!anyPlaceholder) $$('.gallery .placeholder-note').forEach(function (el) { el.remove(); });

    renderHours(c);
    jsonLd(c);
  }

  function start() {
    load().then(function (c) {
      window.TOI_CONTENT = c;
      try { render(c); }
      catch (err) {
        console.error(LOG + ' Beim Einsetzen der Inhalte ist etwas schiefgelaufen. Standard-Texte werden verwendet.', err);
        if (c !== FALLBACK) { try { render(FALLBACK); } catch (e2) { /* nichts mehr zu retten */ } }
      }
      document.documentElement.classList.add('content-ready');
      document.dispatchEvent(new CustomEvent('toi:content'));
    });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();
})();
