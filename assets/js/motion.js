/* Taste of India: Scroll-Choreografie (GSAP + ScrollTrigger + Lenis).
   Jede Szene ist eine gepinnte "Kamerafahrt", der Scrollbalken ist der Abspielkopf.
   Bei "Bewegung reduzieren" im System läuft nichts davon: die Seite zeigt alles statisch. */
(function () {
  'use strict';

  var root = document.documentElement;
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function $(sel, el) { return (el || document).querySelector(sel); }
  function $$(sel, el) { return Array.prototype.slice.call((el || document).querySelectorAll(sel)); }

  var lenis = null;

  /* ---------- Grundgerüst ---------- */

  function setupScroll() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });

    if (!reduce && window.Lenis) {
      lenis = new Lenis({ lerp: 0.09, wheelMultiplier: 0.95, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add(function (t) { lenis.raf(t * 1000); });
      gsap.ticker.lagSmoothing(0);
    }

    // Sprungmarken (#speisekarte usw.) weich anfahren
    document.addEventListener('click', function (e) {
      var a = e.target.closest && e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute('href').slice(1);
      var target = id ? document.getElementById(id) : null;
      if (!target) return;
      e.preventDefault();
      var done = function () {
        if (id === 'top') return;
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      };
      if (lenis) lenis.scrollTo(id === 'top' ? 0 : target, { duration: 1.6, onComplete: done });
      else { target.scrollIntoView(); done(); }
      history.replaceState(null, '', '#' + id);
    });

  }

  /* Nach den Pins anlegen, damit ihre Positionen die Pin-Abstände schon kennen */
  function chrome() {
    // Navigation bekommt Fläche, sobald die Szenen vorbei sind
    var nav = $('[data-nav]');
    var menu = $('#speisekarte');
    if (nav && menu) {
      ScrollTrigger.create({
        trigger: menu, start: 'top top+=80',
        onEnter: function () { nav.classList.add('is-solid'); },
        onLeaveBack: function () { nav.classList.remove('is-solid'); }
      });
    }

    // Fortschrittslinie
    gsap.to('.progress span', { scaleX: 1, ease: 'none', scrollTrigger: { start: 0, end: 'max', scrub: 0.3 } });
  }

  /* ---------- 1 · Hero ---------- */

  function hero(mobile) {
    var sec = $('.hero');
    if (!sec) return;
    var chars = $$('.hero__title .ch', sec);
    var inner = $$('.hero__title .chi', sec);
    var squiggle = $('.hero__title .squiggle', sec);
    var meta = $$('.hero__claim, .hero__rating', sec);

    // Auftakt beim Laden: Buchstaben bauen sich einzeln auf, das Bild setzt sich
    var intro = gsap.timeline({ defaults: { ease: 'expo.out' } });
    intro
      .from('.hero__pic', { scale: 1.16, rotation: -2, duration: 2.4 }, 0)
      // sichtbar ab dem ersten Bild: die Buchstaben liegen lose und rasten einzeln in die Zeile ein
      .from(inner, {
        yPercent: function (i) { return i % 2 ? 26 : -18; },
        rotation: function (i) { return i % 2 ? 9 : -7; },
        duration: 1.1, ease: 'back.out(2.2)', stagger: 0.045
      }, 0.1)
      .from(meta, { yPercent: 45, rotation: 1.5, duration: 1.2, stagger: 0.12 }, 0.45)
      .from('.hero__cue i', { scaleY: 0, duration: 1 }, 1);
    if (squiggle) intro.fromTo(squiggle, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.1, ease: 'power2.inOut' }, 0.95);

    // Scroll: Kamera fährt in die Gewürze, die Schrift fliegt nach oben weg
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: sec, start: 'top top', end: mobile ? '+=110%' : '+=150%', scrub: 1, pin: true, anticipatePin: 1 }
    });
    tl.to('.hero__img', { scale: mobile ? 2.1 : 2.6, rotation: 11, transformOrigin: '86% 30%', duration: 10, ease: 'power1.in' }, 0)
      .to(chars, {
        yPercent: mobile ? -240 : -320,
        rotation: function () { return gsap.utils.random(-32, 32); },
        autoAlpha: 0, duration: 3.6, ease: 'power2.in',
        stagger: { each: 0.16, from: 'center' }
      }, 0)
      .to(meta, { y: -140, autoAlpha: 0, duration: 2.6, stagger: 0.35, ease: 'power2.in' }, 0)
      .to('.hero__cue', { autoAlpha: 0, duration: 0.8 }, 0)
      .to('.hero__media', { autoAlpha: 0, duration: 3, ease: 'power1.in' }, 7);
    if (squiggle) tl.to(squiggle, { clipPath: 'inset(0 0 0 100%)', duration: 2 }, 0);
    if (sec.querySelector('.ki-badge')) tl.to('.hero .ki-badge', { autoAlpha: 0, duration: 1 }, 8.6);
  }

  /* ---------- 1b · Galerie (Platzhalter-Stockfotos) ---------- */
  /* Nur Desktop: die Szene pinnt, senkrechtes Scrollen schiebt die Bilderreihe waagerecht.
     Jedes Bild driftet mit eigener Geschwindigkeit (data-depth), das Foto gleitet im Rahmen gegen.
     Auf dem Handy bleibt es bei nativem Wischen (CSS-Grundform). Gibt eine Aufräumfunktion zurück. */
  function gallery() {
    var sec = $('[data-gallery]');
    var track = sec && $('[data-gallery-track]', sec);
    if (!track || !track.children.length) return null;
    var pin = $('[data-gallery-pin]', sec);
    var intro = $('[data-gallery-intro]', sec);
    var home = intro.parentNode, next = intro.nextSibling;

    sec.classList.add('gallery--pinned');
    pin.removeAttribute('tabindex');
    track.insertBefore(intro, track.firstChild);

    var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
    var move = gsap.to(track, {
      x: function () { return -dist(); }, ease: 'none',
      scrollTrigger: {
        trigger: sec, start: 'top top', end: function () { return '+=' + dist(); },
        pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    $$('.shot', track).forEach(function (fig) {
      var depth = parseFloat(fig.getAttribute('data-depth')) || 0;
      var along = { trigger: fig, containerAnimation: move, start: 'left right', end: 'right left', scrub: true };
      gsap.fromTo(fig, { x: depth * 3.5 + 'vw', rotation: depth * 1.2 }, { x: -depth * 3.5 + 'vw', rotation: -depth * 1.2, ease: 'none', scrollTrigger: along });
      gsap.fromTo($('.shot__img', fig), { xPercent: -8, scale: 1.2 }, { xPercent: 8, scale: 1.2, ease: 'none', scrollTrigger: Object.assign({}, along) });
    });
    gsap.to(intro, { x: '9vw', ease: 'none', scrollTrigger: { trigger: intro, containerAnimation: move, start: 'left 8%', end: 'right left', scrub: true } });

    // Auslauf: auf den letzten Metern hebt sich die Reihe schon an. Die Bewegung biegt so weich
    // von waagerecht in senkrecht, statt am Ende hart zu stoppen.
    gsap.to(track, {
      y: '-10vh', ease: 'sine.in',
      scrollTrigger: {
        trigger: sec, scrub: 1, invalidateOnRefresh: true,
        start: function () { return 'top+=' + Math.round(dist() * 0.8) + ' top'; },
        end: function () { return 'top+=' + dist() + ' top'; }
      }
    });

    return function () {
      sec.classList.remove('gallery--pinned');
      pin.setAttribute('tabindex', '0');
      home.insertBefore(intro, next);
    };
  }

  /* ---------- Gemeinsame Text-Choreografie der Gerichte ---------- */

  function textIn(tl, sec, at, dir) {
    var chi = $$('.scene__name .chi', sec);
    var desc = $('.scene__desc', sec);
    var price = $('.scene__price', sec);
    var sq = $('.scene__price .squiggle', sec);
    tl.fromTo(chi, { yPercent: 118, rotation: 9 * dir }, { yPercent: 0, rotation: 0, duration: 1.6, ease: 'power3.out', stagger: 0.07 }, at)
      .fromTo(desc, { x: 36 * dir, clipPath: 'inset(0 100% 0 0)' }, { x: 0, clipPath: 'inset(0 0% 0 0)', duration: 1.5, ease: 'power2.out' }, at + 0.6)
      .fromTo(price, { yPercent: 70, clipPath: 'inset(-20% -10% 100% -10%)' }, { yPercent: 0, clipPath: 'inset(-20% -10% -60% -10%)', duration: 1.2, ease: 'power3.out' }, at + 1)
      .fromTo(sq, { clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.inOut' }, at + 1.5);
  }

  function textOut(tl, sec, at) {
    tl.to($$('.scene__name .ch', sec), { yPercent: -130, autoAlpha: 0, duration: 1.2, ease: 'power2.in', stagger: 0.04 }, at)
      .to($$('.scene__desc, .scene__price', sec), { y: -50, autoAlpha: 0, duration: 1, ease: 'power2.in', stagger: 0.12 }, at + 0.1);
  }

  /* Einflug: die nächste Szene kommt von unten, noch nach hinten gekippt */
  function entry(sec, mobile) {
    gsap.fromTo($('.scene__drift', sec),
      { yPercent: mobile ? 22 : 30, scale: 0.8, rotationX: 24, transformPerspective: 1400 },
      { yPercent: 0, scale: 1, rotationX: 0, ease: 'none', scrollTrigger: { trigger: sec, start: 'top bottom', end: 'top top', scrub: true } });
  }

  /* ---------- 2-3 · Explosion (Butter Chicken, Biryani) ---------- */
  /* Ausrichtung der Bildpaare: wo sitzt die Schüssel im fertigen Bild (plate) und im
     explodierten Bild (burst), in Prozent der Bildbreite/-höhe, und wie stark ist sie
     im explodierten Bild verkleinert (s). sl/sr/sy = Schnittlinien der Tiefenebenen. */
  var BURSTS = {
    'butter-chicken-explode': { layout: 'fan', sl: 30, sr: 70, sy: 54, plate: [49.5, 45], burst: [50, 72], s: 1.67, vig: [56, 100] },
    'biryani-explode': { layout: 'band', sl: 48, sr: 48, sy: 54, f: 9, plate: [49, 44], burst: [49, 63.5], s: 1.25, vig: [34, 90] }
  };
  var BURST_DEFAULT = { layout: 'fan', sl: 30, sr: 70, sy: 50, plate: [50, 55], burst: [50, 60], s: 1.2, vig: [56, 100] };

  function burstConfig(src) {
    var key = String(src || '').split('/').pop().replace(/\.(webp|png|jpe?g|avif)$/i, '').replace(/-m$/, '');
    return BURSTS[key] || BURST_DEFAULT;
  }

  function burstScene(sec, mobile) {
    var cfg = burstConfig(sec.getAttribute('data-burst-src'));
    var dir = sec.getAttribute('data-text') === 'links' ? -1 : 1;  // 1 = Text rechts, Bild wandert nach links
    var cam = $('.scene__cam', sec);
    var tilt = $('.scene__tilt', sec);
    var plate = $('.plate', sec);
    var burst = $('.burst', sec);
    var P = { base: $('.piece--base', sec), l: $('.piece--l', sec), r: $('.piece--r', sec), t: $('.piece--t', sec) };

    burst.classList.add('burst--' + cfg.layout);
    burst.classList.toggle('burst--lite', mobile);
    burst.style.setProperty('--sl', cfg.sl + '%');
    burst.style.setProperty('--sr', cfg.sr + '%');
    burst.style.setProperty('--sy', cfg.sy + '%');
    burst.style.setProperty('--f', (cfg.f || 4) + '%');
    [plate, burst].forEach(function (el) {
      el.style.setProperty('--vig-in', cfg.vig[0] + '%');
      el.style.setProperty('--vig-out', cfg.vig[1] + '%');
    });

    var dx = cfg.plate[0] - cfg.burst[0];
    var dy = cfg.plate[1] - cfg.burst[1];
    gsap.set(plate, { transformOrigin: cfg.plate[0] + '% ' + cfg.plate[1] + '%' });
    gsap.set(burst, { transformOrigin: cfg.burst[0] + '% ' + cfg.burst[1] + '%' });
    gsap.set(tilt, { transformPerspective: 1500 });

    entry(sec, mobile);

    var k = mobile ? 0.6 : 1;          // Flugweite
    var shift = mobile ? 0 : -19 * dir; // Kamera weicht dem Text aus (vw)
    // Zeitachse in 12 Einheiten:  A 0-3.2 nur das fertige Gericht  |  B 3.2-7.6 Überblendung (37 %)
    //                             C 7.6-12 nur das explodierte Bild, Ebenen fliegen, Text
    var A = 0, B = 3.2, BD = 4.4, C = B + BD;
    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: mobile ? '+=240%' : '+=380%',
        scrub: mobile ? 0.7 : 1, pin: true, anticipatePin: 1, invalidateOnRefresh: true
      }
    });

    // A · Kamera fährt heran und kippt. Zoom und Kippen sitzen auf gemeinsamen Eltern-Ebenen
    // (.scene__cam, .scene__tilt) und wirken damit immer auf BEIDE Bilder gleichzeitig.
    tl.fromTo(cam, { scale: 1 }, { scale: 1.06, duration: B, ease: 'sine.inOut' }, A)
      .fromTo(tilt, { rotationX: 0, rotationY: 0, rotation: 0 }, { rotationX: 8, rotationY: -6 * dir, duration: B, ease: 'sine.inOut' }, A);

    // B · Überblendung. Beide Ebenen liegen deckungsgleich übereinander und hängen an derselben
    // Kurve: Deckkraft, Größe und Lage laufen gemeinsam, die Schüssel bleibt an Ort und Stelle.
    var fade = { duration: BD, ease: 'sine.inOut' };
    tl.fromTo(plate, { autoAlpha: 1 }, Object.assign({ autoAlpha: 0 }, fade), B)
      .fromTo(burst, { autoAlpha: 0 }, Object.assign({ autoAlpha: 1 }, fade), B)
      .fromTo(plate, { scale: 1, xPercent: 0, yPercent: 0 }, Object.assign({ scale: 1 / cfg.s, xPercent: -dx, yPercent: -dy }, fade), B)
      .fromTo(burst, { scale: cfg.s, xPercent: dx, yPercent: dy }, Object.assign({ scale: 1, xPercent: 0, yPercent: 0 }, fade), B)
      // gemeinsames Kippen und leichtes Rollen, das am Ende einrastet
      .to(tilt, { rotationX: 12, rotationY: -10 * dir, rotation: 5 * dir, duration: BD * 0.5, ease: 'sine.inOut' }, B)
      .to(tilt, { rotation: 0, duration: BD * 0.5, ease: 'back.out(1.6)' }, B + BD * 0.5)
      .to(cam, { scale: 1, duration: BD, ease: 'sine.inOut' }, B);

    // Tiefenebenen: in B aus der Schüssel heraus auf ihren Platz, in C mit eigener Geschwindigkeit auseinander
    var near = dir === 1 ? 'r' : 'l';   // Ebene auf der Textseite fliegt eher nach oben als seitlich
    var fly = cfg.layout === 'band'
      ? { l: { xPercent: -6, yPercent: -3, rotation: -6, scale: 1.14 }, r: { xPercent: 6, yPercent: -5, rotation: 7, scale: 1.16 } }
      : { l: { xPercent: -13, yPercent: -3, rotation: -9, scale: 1.04 }, r: { xPercent: 13, yPercent: -6, rotation: 10, scale: 1.06 }, t: { xPercent: 2 * dir, yPercent: -15, rotation: 4 * dir, scale: 1.1 } };
    fly[near].xPercent *= 0.45;
    fly[near].yPercent -= cfg.layout === 'band' ? 3 : 7;

    Object.keys(fly).forEach(function (key) {
      var el = P[key];
      if (!el || (mobile && key === 't')) return;
      var f = fly[key];
      tl.fromTo(el,
        { xPercent: -f.xPercent * 0.35, yPercent: -f.yPercent * 0.5, rotation: -f.rotation * 0.4, scale: 0.9 },
        Object.assign({ xPercent: 0, yPercent: 0, rotation: 0, scale: 1 }, fade), B)
        .to(el, { xPercent: f.xPercent * k, yPercent: f.yPercent * k, rotation: f.rotation, scale: f.scale, duration: 3, ease: 'power1.out' }, C)
        .to(el, { xPercent: f.xPercent * k * 1.9, yPercent: f.yPercent * k * 1.9, rotation: f.rotation * 1.7, autoAlpha: 0, duration: 1.4, ease: 'power2.in' }, 10.6);
    });
    tl.to(P.base, { yPercent: 2.5, scale: 0.97, duration: 3, ease: 'power2.out' }, C);

    // C · Kamera schwenkt zur Seite und kippt gegenläufig zurück
    tl.to(cam, { x: shift + 'vw', scale: mobile ? 1 : 0.76, duration: 2.4, ease: 'power2.inOut' }, C - 0.2)
      .to(tilt, { rotationX: 3, rotationY: 7 * dir, duration: 2.6, ease: 'sine.inOut' }, C - 0.2);

    // Text am Höhepunkt
    textIn(tl, sec, C + 0.3, dir);

    // Ausflug nach oben in die nächste Szene
    textOut(tl, sec, 10.6);
    tl.to(cam, { yPercent: -18, scale: mobile ? 0.94 : 0.7, autoAlpha: 0, duration: 1.4, ease: 'power2.in' }, 10.6)
      .to(tilt, { rotationX: -12, duration: 1.4, ease: 'power2.in' }, 10.6)
      .set({}, {}, 12); // Timeline auf volle Länge halten
    var badge = $('.ki-badge', sec);
    if (badge) tl.to(badge, { autoAlpha: 0, duration: 0.4 }, 11.5);
  }

  /* ---------- 4 · Kreis-Reveal (Saag Paneer) ---------- */

  function orbScene(sec, mobile) {
    var dir = sec.getAttribute('data-text') === 'links' ? -1 : 1;
    var cam = $('.scene__cam', sec);
    var orb = $('.orb', sec);
    var img = $('.orb__img', sec);
    var ring = $('.orb__ring', sec);
    var orbit = $('.orb__orbit', sec);
    var icons = $$('.orbit-ico', sec);
    gsap.set(img, { transformOrigin: '50% 58%' });   // Drehpunkt = Mitte der Schale

    entry(sec, mobile);

    var tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: sec, start: 'top top', end: mobile ? '+=150%' : '+=230%',
        scrub: mobile ? 0.7 : 1, pin: true, anticipatePin: 1
      }
    });

    // Kreis öffnet sich, der Ring folgt exakt der Kante (gleiche Kurve), das Bild dreht sich ein
    var open = { duration: 5.4, ease: 'power2.inOut' };
    tl.fromTo(orb, { clipPath: 'circle(9% at 50% 58%)' }, Object.assign({ clipPath: 'circle(78% at 50% 58%)' }, open), 0.4)
      .fromTo(ring, { scale: 1, rotation: -50 }, Object.assign({
        scale: 78 / 9, rotation: 40,
        // Strich bleibt beim Vergrößern gleich dünn (CSS-Skalierung würde ihn sonst mitwachsen lassen)
        onUpdate: function () { ring.style.strokeWidth = (1.6 / gsap.getProperty(ring, 'scale')) + 'px'; }
      }, open), 0.4)
      .to(ring, { autoAlpha: 0, duration: 1.4 }, 4.4)
      // Das Bild dreht sich über die ganze Szene hinweg, fest an den Scroll-Fortschritt gebunden
      .fromTo(img, { rotation: -26 * dir }, { rotation: 22 * dir, duration: 10, ease: 'none' }, 0)
      .fromTo(img, { scale: 1.5 }, { scale: 1, duration: 6.2, ease: 'power2.out' }, 0)
      .fromTo(orbit, { scale: 1, rotation: 0 }, Object.assign({ scale: 4.8, rotation: 160 * dir }, open), 0.4)
      .fromTo(icons, { rotation: 0 }, { rotation: -220 * dir, duration: 5.4, stagger: 0.1 }, 0.4)
      .to(icons, { autoAlpha: 0, duration: 1.8, stagger: 0.15 }, 3.4)
      .fromTo(cam, { scale: 0.94 }, { scale: 1.04, duration: 3, ease: 'sine.out' }, 0)
      // Gleichzeitig wandert alles von der Überschrift weg: gleiche Kurve (power2.inOut) wie der
      // Kameraschwenk der Explosions-Szenen, parallel zur Kreisöffnung statt danach
      .fromTo(cam, { x: (mobile ? 7 : 14) * dir + 'vw' }, Object.assign({ x: (mobile ? -7 : -17) * dir + 'vw' }, open), 0.4)
      .to(cam, { scale: mobile ? 1.04 : 0.8, duration: 3.4, ease: 'power2.inOut' }, 3);

    textIn(tl, sec, 4.4, dir);
    textOut(tl, sec, 8.4);
    tl.to(cam, { yPercent: -14, autoAlpha: 0, duration: 1.6, ease: 'power2.in' }, 8.4);
    var badge = $('.ki-badge', sec);
    if (badge) tl.to(badge, { autoAlpha: 0, duration: 0.5 }, 9.5);
    tl.set({}, {}, 10);
  }

  /* ---------- 5-8 · ruhigere Sektionen, aber mit eigener Bewegung ---------- */

  function sections() {
    // Titel-Kringel zeichnen sich
    $$('.h2 .squiggle').forEach(function (sq) {
      gsap.fromTo(sq, { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', duration: 1.2, ease: 'power2.inOut',
        scrollTrigger: { trigger: sq.parentNode, start: 'top 80%' }
      });
    });

    // Speisekarte: Kategorien kippen wie gesetzte Lettern auf die Zeile, Gewürze drehen mit
    var items = $$('.menu__item');
    if (items.length) {
      gsap.from(items, {
        yPercent: 80, rotation: 4, autoAlpha: 0, transformOrigin: '0% 100%',
        duration: 1.1, ease: 'expo.out', stagger: 0.06,
        scrollTrigger: { trigger: '.menu__list', start: 'top 82%' }
      });
      gsap.fromTo('.menu__sep', { rotation: -90 }, {
        rotation: 200, ease: 'none',
        scrollTrigger: { trigger: '.menu__list', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
      });
    }

    // Bewertungen: Zahl zählt hoch, Sterne springen nacheinander auf
    var num = $('[data-count]');
    if (num) {
      var target = parseFloat(String(num.textContent).replace(',', '.'));
      if (!isNaN(target)) {
        var o = { v: 0 };
        num.textContent = '0,0';
        gsap.to(o, {
          v: target, duration: 1.6, ease: 'power3.out',
          scrollTrigger: { trigger: num, start: 'top 85%' },
          onUpdate: function () { num.textContent = o.v.toFixed(1).replace('.', ','); }
        });
      }
      gsap.from('.score .star', {
        scale: 0, rotation: -120, duration: 0.8, ease: 'back.out(2.2)', stagger: 0.09,
        scrollTrigger: { trigger: '.score', start: 'top 85%' }
      });
    }

    // Besuch: Adresse schiebt sich zeilenweise hoch, der heutige Tag wird umkringelt
    gsap.from('.visit__address > span', {
      yPercent: 90, clipPath: 'inset(0 0 100% 0)', duration: 1.1, ease: 'expo.out', stagger: 0.1,
      scrollTrigger: { trigger: '.visit__address', start: 'top 85%' }
    });
    gsap.from('.hours__row', {
      x: -28, autoAlpha: 0, duration: 0.9, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: { trigger: '.hours', start: 'top 85%' }
    });
    var mark = $('.hours__mark');
    if (mark) {
      gsap.fromTo(mark, { clipPath: 'inset(0 100% 0 0)' }, {
        clipPath: 'inset(0 0% 0 0)', duration: 1.3, ease: 'power2.inOut', delay: 0.5,
        scrollTrigger: { trigger: '.hours', start: 'top 80%' }
      });
    }

    // Abschluss: Buchstaben steigen mit dem Scrollen auf, der Sternanis dreht sich
    var fin = $$('.finale__title .chi');
    if (fin.length) {
      gsap.fromTo(fin, { yPercent: 115, rotation: 10 }, {
        yPercent: 0, rotation: 0, ease: 'power3.out', stagger: 0.03,
        scrollTrigger: { trigger: '.finale', start: 'top 85%', end: 'top 30%', scrub: 0.8 }
      });
    }
    gsap.fromTo('.finale__anise', { rotation: -40, yPercent: 30 }, {
      rotation: 150, yPercent: -30, ease: 'none',
      scrollTrigger: { trigger: '.finale', start: 'top bottom', end: 'bottom top', scrub: 0.6 }
    });
  }

  /* ---------- Start ---------- */

  function init() {
    if (!window.gsap || !window.ScrollTrigger) {
      root.classList.remove('motion-ok');   // Bibliotheken fehlen: statisch zeigen
      console.warn('[Taste of India] Animations-Bibliotheken nicht geladen, die Seite wird statisch gezeigt.');
      return;
    }
    setupScroll();
    if (reduce) { chrome(); return; }

    var mm = gsap.matchMedia();
    mm.add({ desktop: '(min-width: 768px)', mobile: '(max-width: 767px)' }, function (ctx) {
      var mobile = ctx.conditions.mobile;
      hero(mobile);
      var undoGallery = mobile ? null : gallery();
      $$('.scene').forEach(function (sec) {
        if (sec.getAttribute('data-effect') === 'burst') burstScene(sec, mobile);
        else orbScene(sec, mobile);
      });
      sections();
      return function () { if (undoGallery) undoGallery(); };
    });
    chrome();

    var refresh = function () { ScrollTrigger.refresh(); };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(refresh);
    window.addEventListener('load', function () {
      refresh();
      if (location.hash.length > 1) {
        var t = document.getElementById(location.hash.slice(1));
        if (t && lenis) lenis.scrollTo(t, { immediate: true });
      }
    });
  }

  if (root.classList.contains('content-ready')) init();
  else document.addEventListener('toi:content', init, { once: true });
})();
