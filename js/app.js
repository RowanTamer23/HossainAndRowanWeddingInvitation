(function () {
  "use strict";

  /* ======================================================
     CONFIG — edit these for your event
  ====================================================== */
  var WEDDING_DATE_ISO = "2026-10-12T19:00:00"; // interpreted as 12 October 2026, 7:00 PM
  var VENUE_QUERY = "Sea Garden Open Air Hall";  // used to build the Google Maps link/embed (English name works best for geocoding)
  var APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbw-PkR5mOYlPFNnlOv440_7aCfmxbUkCp-YD3TfHm9fbtpffGWF_iCQ6Bp8FWfElIAG/exec"; // see SETUP-RSVP-DATABASE.md

  /* ======================================================
     TRANSLATIONS
  ====================================================== */
  var STR = {
    en: {
      inviteEyebrow: "You're Invited", tapHint: "Tap the seal to open", seal: "H&R",
      coverEyebrow: "Wedding Invitation", coverMonogram: "H&R", coverDateNum: "12 · 10 · 2026", coverTagline: "Save Our Date",
      familyLine: "Together with their families", name1: "Hossain", amp: "&", name2: "Rowan",
      tagline: "joyfully invite you to share the celebration of their wedding — an evening of love, laughter, and new beginnings.",
      saveDateEyebrow: "Save the Date", dateSub: "Save the Date",
      timeLabel: "7:00 PM", timeSub: "Arrival & Ceremony",
      findUs: "Find Us At", venueName: "Sea Garden Open Air Hall",
      venueNote: 'tap "Open in Google Maps" to check the location.',
      openMaps: "Open in Google Maps", copyLink: "Copy Location Link", copiedToast: "Location link copied!",
      kindlyRespond: "Kindly confirm your attendance", willYouJoin: "Will you be able to join us? 💍",
      yourName: "Your Name", namePlaceholder: "e.g. Rowan", yourResponse: "Your Response",
      accept: "Joyfully Accepts", decline: "Regretfully Declines", sendRsvp: "Send RSVP",
      changeResponse: "Change your response",
      confirmYes: function (n) { return "Wonderful, " + n + "! We can't wait to celebrate with you — see you on October 12th!"; },
      confirmNo: function (n) { return "We'll miss you, " + n + ". Thank you for letting us know — you'll be in our hearts on the day."; },
      footerSig: "With love, Hossain & Rowan",
      dateLocale: "en-US"
    },
    ar: {
      inviteEyebrow: "أنتم مدعوون", tapHint: "المسوا الختم لفتح الدعوة", seal: "ح & ر",
      coverEyebrow: "دعوة زفاف", coverMonogram: "ح & ر", coverDateNum: "١٢ · ١٠ · ٢٠٢٦", coverTagline: "احفظوا التاريخ",
      familyLine: "بمشاركة أسرتيهما", name1: "حسين", amp: "و", name2: "روان",
      tagline: "يتشرفان بدعوتكم لمشاركتهما فرحة زفافهما — أمسية مليئة بالحب والسعادة وبداية جديدة.",
      saveDateEyebrow: "احفظوا التاريخ", dateSub: "احفظوا التاريخ",
      timeLabel: "٦:٠٠ مساءً", timeSub: "موعد الحضور وبدء الحفل",
      findUs: "موقع الحفل", venueName: "قاعة سي جاردن المفتوحة",
      venueNote: 'اضغطوا على "فتح في خرائط جوجل" للوصول إلى المكان.',
      openMaps: "فتح في خرائط جوجل", copyLink: "نسخ رابط الموقع", copiedToast: "تم نسخ رابط الموقع بنجاح!",
      kindlyRespond: "تأكيد الحضور", willYouJoin: "يسعدنا حضوركم ومشاركتنا الفرحة 💍",
      yourName: "الاسم الكريم", namePlaceholder: "مثال: روان", yourResponse: "هل ستتمكن من الحضور؟",
      accept: "بكل سرور يشرفني الحضور 🌿", decline: "أعتذر لعدم التمكن من الحضور 🤍", sendRsvp: "إرسال الرد",
      changeResponse: "تعديل الرد",
      confirmYes: function (n) { return "أهلاً بك يا " + n + "! يسعدنا جداً حضورك ونتطلع للاحتفال معاً في ١٢ أكتوبر!"; },
      confirmNo: function (n) { return "سنشتاق إليك يا " + n + ". نشكرك على إعلامنا، وستكون في قلوبنا دائماً."; },
      footerSig: "مع كامل الحب، حسين وروان",
      dateLocale: "ar-EG"
    }
  };

  var currentLang = 'en';

  var idMap = {
    coverEyebrow: 'coverEyebrow', coverMonogram: 'coverMonogram', coverDateNum: 'coverDateNum', coverTagline: 'coverTagline',
    txtFamilyLine: 'familyLine', txtName1: 'name1', txtAmp: 'amp', txtName2: 'name2', txtTagline: 'tagline',
    txtSaveDateEyebrow: 'saveDateEyebrow', txtDateSub: 'dateSub', txtTimeLabel: 'timeLabel', txtTimeSub: 'timeSub',
    txtFindUs: 'findUs', txtVenueName: 'venueName', txtVenueNote: 'venueNote',
    txtOpenMaps: 'openMaps', txtCopyLink: 'copyLink',
    txtKindlyRespond: 'kindlyRespond', txtWillYouJoin: 'willYouJoin',
    txtYourName: 'yourName', txtYourResponse: 'yourResponse',
    txtAccept: 'accept', txtDecline: 'decline', txtSendRsvp: 'sendRsvp',
    txtChangeYes: 'changeResponse', txtChangeNo: 'changeResponse',
    txtFooterSig: 'footerSig'
  };

  function applyLanguage(lang) {
    currentLang = lang;
    var t = STR[lang];
    Object.keys(idMap).forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.textContent = t[idMap[id]];
    });
    document.getElementById('guestName').placeholder = t.namePlaceholder;
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
    document.body.classList.toggle('lang-ar', lang === 'ar');
    document.body.classList.toggle('lang-en', lang === 'en');
    document.getElementById('btnLangEn').classList.toggle('active', lang === 'en');
    document.getElementById('btnLangAr').classList.toggle('active', lang === 'ar');

    var pointerText = document.getElementById('langPointerText');
    if (pointerText) {
      pointerText.textContent = lang === 'en' ? 'عربي' : 'English';
    }

    updateDate();
    updateCountdown();

    // refresh any visible confirmation message in the new language
    try {
      var saved = JSON.parse(localStorage.getItem('wedding_rsvp'));
      if (saved && saved.name && saved.response) { showConfirmation(saved.name, saved.response); }
    } catch (e) { }
  }

  document.getElementById('btnLangEn').addEventListener('click', function () { applyLanguage('en'); });
  document.getElementById('btnLangAr').addEventListener('click', function () { applyLanguage('ar'); });

  /* ======================================================
     ENVELOPE OPEN SEQUENCE — seal & ribbon release, flap opens,
     folded card slides out, then visibly unfolds, then the
     invitation itself is revealed.
  ====================================================== */
  var wrap = document.getElementById('envelopeWrap');
  var envelope = document.getElementById('envelope');
  var card = document.getElementById('invitation');
  var scene = document.getElementById('envelope-scene');
  var opened = false;


  function openEnvelope() {
    if (opened) return;
    opened = true;

    scene.classList.add('opening');   // fade out "You're Invited" and tap hint immediately
    wrap.classList.add('open');
    envelope.classList.add('open');   // flap flips open, seal drops behind and fades

    // ── Step 1: Card emerges after flap has fully opened from the front (750ms) ──
    setTimeout(function () {
      card.parentElement.classList.add('card-out');
      card.classList.add('emerge');
    }, 350);

    // ── Step 2: Smooth FLIP Fullscreen Expansion (1300ms) ────────────────
    // Card has fully settled at center. We measure its static position and animate to full viewport.
    setTimeout(function () {
      var rect = card.getBoundingClientRect();
      document.body.appendChild(card);

      card.style.cssText = [
        'position:fixed',
        'left:' + Math.round(rect.left) + 'px',
        'top:' + Math.round(rect.top) + 'px',
        'width:' + Math.round(rect.width) + 'px',
        'height:' + Math.round(rect.height) + 'px',
        'transform:none',
        'transition:none',
        'z-index:20000',
        'border-radius:4px',
        'overflow:hidden',
        'margin:0'
      ].join(';');

      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          card.classList.add('zooming');
          card.style.left = '0';
          card.style.top = '0';
          card.style.width = '100vw';
          card.style.height = '100vh';
          card.style.borderRadius = '0';

          // Seamlessly crossfade cover -> full invitation during expansion
          setTimeout(function () {
            card.classList.add('fade-to-content');
          }, 350);
        });
      });
    }, 1300);

    // ── Step 3: Complete transition & enable normal scrolling (2100ms) ───
    setTimeout(function () {
      card.style.cssText = '';
      card.classList.remove('envelope-card', 'emerge', 'zooming', 'fade-to-content');

      scene.classList.add('closed');
      document.body.classList.add('invitation-open');
      document.body.style.overflow = 'auto';

      var scrollArrow = document.getElementById('scrollArrow');
      if (scrollArrow) {
        scrollArrow.classList.remove('hidden');
        scrollArrow.classList.add('visible');
      }

      revealOnScroll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 2100);
  }
  wrap.addEventListener('click', openEnvelope);
  wrap.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });
  document.body.style.overflow = 'hidden';

  /* ======================================================
     SCROLL ARROW INDICATOR & SCROLL REVEAL
  ====================================================== */
  var scrollArrow = document.getElementById('scrollArrow');
  if (scrollArrow) {
    scrollArrow.addEventListener('click', function () {
      var detailsSec = document.getElementById('details');
      if (detailsSec) {
        detailsSec.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollBy({ top: window.innerHeight * 0.75, behavior: 'smooth' });
      }
    });
  }

  window.addEventListener('scroll', function () {
    var arrow = document.getElementById('scrollArrow');
    if (!arrow) return;
    if (window.scrollY > 80) {
      arrow.classList.add('hidden');
      arrow.classList.remove('visible');
    } else if (document.body.classList.contains('invitation-open')) {
      arrow.classList.remove('hidden');
      arrow.classList.add('visible');
    }
  }, { passive: true });

  function revealOnScroll() {
    var sections = document.querySelectorAll('main section');
    sections.forEach(function (s) {
      var r = s.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.9) {
        s.classList.add('revealed');
      }
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('revealed'); } });
    }, { threshold: 0.15 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ======================================================
     DATE FORMATTING + COUNTDOWN
  ====================================================== */
  var eventDate = new Date(WEDDING_DATE_ISO);

  function updateDate() {
    var dateBig = document.getElementById('dateBig');
    var covDate = document.getElementById('covDate');
    if (!isNaN(eventDate.getTime())) {
      var dateStr = eventDate.toLocaleDateString(STR[currentLang].dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
      if (dateBig) dateBig.textContent = dateStr;
      if (covDate) covDate.textContent = dateStr;
    }
  }
  function updateCountdown() {
    var now = new Date();
    var diff = eventDate - now;
    var el = document.getElementById('countdown');
    if (diff <= 0) { el.textContent = currentLang === 'ar' ? "اليوم هو اليوم المنتظر! 🌿" : "Today is the day! 🌿"; return; }
    var days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (currentLang === 'ar') {
      var num = new Intl.NumberFormat('ar-EG').format(days);
      el.textContent = days === 1 ? "يوم واحد متبقٍ" : days === 2 ? "يومان متبقيان" : ("متبقٍ " + num + " يومًا");
    } else {
      el.textContent = days + (days === 1 ? " day to go" : " days to go");
    }
  }
  updateDate(); updateCountdown();
  setInterval(updateCountdown, 1000 * 60 * 30);

  /* ======================================================
     MAP EMBED + LINKS
  ====================================================== */
  var mapsLink = "https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(VENUE_QUERY);
  var mapsEmbed = "https://www.google.com/maps?q=" + encodeURIComponent(VENUE_QUERY) + "&output=embed";
  document.getElementById('mapEmbed').src = mapsEmbed;
  document.getElementById('openMapsBtn').href = mapsLink;

  var toastEl = document.getElementById('toast');
  function showToast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(function () { toastEl.classList.remove('show'); }, 2200);
  }

  document.getElementById('copyLinkBtn').addEventListener('click', function () {
    function fallbackCopy(text) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      try { document.execCommand('copy'); } catch (e) { }
      document.body.removeChild(ta);
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(mapsLink).then(function () {
        showToast(STR[currentLang].copiedToast);
      }).catch(function () { fallbackCopy(mapsLink); showToast(STR[currentLang].copiedToast); });
    } else {
      fallbackCopy(mapsLink);
      showToast(STR[currentLang].copiedToast);
    }
  });

  /* ======================================================
     RSVP FORM
  ====================================================== */
  var choiceYesBtn = document.getElementById('choiceYes');
  var choiceNoBtn = document.getElementById('choiceNo');
  var submitBtn = document.getElementById('submitBtn');
  var nameInput = document.getElementById('guestName');
  var form = document.getElementById('rsvpForm');
  var selected = null;

  function pick(choice) {
    selected = choice;
    choiceYesBtn.setAttribute('aria-pressed', choice === 'yes');
    choiceNoBtn.setAttribute('aria-pressed', choice === 'no');
    checkReady();
  }
  function checkReady() { submitBtn.disabled = !(selected && nameInput.value.trim().length > 0); }
  choiceYesBtn.addEventListener('click', function () { pick('yes'); });
  choiceNoBtn.addEventListener('click', function () { pick('no'); });
  nameInput.addEventListener('input', checkReady);

  function showConfirmation(name, choice) {
    form.style.display = 'none';
    if (choice === 'yes') {
      document.getElementById('msgYes').textContent = STR[currentLang].confirmYes(name);
      document.getElementById('rsvpConfirmYes').classList.add('show');
      document.getElementById('rsvpConfirmNo').classList.remove('show');
    } else {
      document.getElementById('msgNo').textContent = STR[currentLang].confirmNo(name);
      document.getElementById('rsvpConfirmNo').classList.add('show');
      document.getElementById('rsvpConfirmYes').classList.remove('show');
    }
  }

  function resetForm() {
    localStorage.removeItem('wedding_rsvp');
    form.style.display = 'block';
    form.reset();
    selected = null;
    choiceYesBtn.setAttribute('aria-pressed', 'false');
    choiceNoBtn.setAttribute('aria-pressed', 'false');
    submitBtn.disabled = true;
    document.getElementById('rsvpConfirmYes').classList.remove('show');
    document.getElementById('rsvpConfirmNo').classList.remove('show');
  }
  document.getElementById('changeYes').addEventListener('click', resetForm);
  document.getElementById('changeNo').addEventListener('click', resetForm);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = nameInput.value.trim();
    if (!name || !selected) return;

    localStorage.setItem('wedding_rsvp', JSON.stringify({ name: name, response: selected, ts: Date.now() }));

    if (APPS_SCRIPT_URL && APPS_SCRIPT_URL.indexOf('PASTE_YOUR') === -1) {
      fetch(APPS_SCRIPT_URL, {
        method: 'POST', mode: 'no-cors', headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify({ name: name, response: selected, timestamp: new Date().toISOString() })
      }).catch(function () { /* fail silently — response is still saved locally */ });
    }
    showConfirmation(name, selected);
  });

  /* ======================================================
     AMBIENT BACKGROUND PARTICLES & PARALLAX
  ====================================================== */
  function initAmbientAtmosphere() {
    var container = document.getElementById('bgParticles');
    var glowWrap = document.getElementById('bgGlowWrap');
    var foliageWrap = document.getElementById('bgFoliageWrap');
    if (!container) return;

    var isReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (isReduced) return;

    var particleTemplates = {
      terracotta_petal: '<svg class="particle-petal" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C 18 10, 24 18, 20 25 C 16 32, 8 32, 4 25 C 0 18, 6 10, 12 2 Z" fill="var(--terracotta)" opacity="0.7"/><path d="M12 5 C 16 11, 20 18, 17 23 C 14 27, 10 27, 7 23 C 4 18, 8 11, 12 5 Z" fill="var(--amber)" opacity="0.55"/></svg>',
      blush_petal: '<svg class="particle-petal" viewBox="0 0 24 30" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 2 C 18 10, 24 18, 20 25 C 16 32, 8 32, 4 25 C 0 18, 6 10, 12 2 Z" fill="var(--blush-deep)" opacity="0.65"/><path d="M12 5 C 16 11, 20 18, 17 23 C 14 27, 10 27, 7 23 C 4 18, 8 11, 12 5 Z" fill="var(--blush)" opacity="0.55"/></svg>',
      leaf: '<svg class="particle-leaf" viewBox="0 0 20 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M10 2 C 18 12, 18 22, 10 30 C 2 22, 2 12, 10 2 Z" fill="var(--forest)" opacity="0.65"/><path d="M10 2 L 10 30" stroke="var(--sage-light)" stroke-width="0.8" opacity="0.7"/></svg>',
      sparkle: '<span class="particle-sparkle">✦</span>',
      dust: '<svg style="width:8px;height:8px;opacity:0.6;" viewBox="0 0 10 10"><circle cx="5" cy="5" r="3.5" fill="var(--amber-light)"/></svg>'
    };

    var types = ['terracotta_petal', 'blush_petal', 'leaf', 'leaf', 'sparkle', 'sparkle', 'dust'];
    var count = window.innerWidth < 768 ? 12 : 18;
    var particles = [];

    for (var i = 0; i < count; i++) {
      var type = types[i % types.length];
      var el = document.createElement('div');
      el.className = 'particle';
      el.innerHTML = particleTemplates[type];
      container.appendChild(el);

      particles.push({
        el: el,
        type: type,
        x: Math.random() * window.innerWidth,
        y: Math.random() * window.innerHeight,
        vy: type === 'sparkle' || type === 'dust' ? -(0.2 + Math.random() * 0.4) : (0.4 + Math.random() * 0.6),
        vx: (Math.random() - 0.5) * 0.3,
        rot: Math.random() * 360,
        vRot: (Math.random() - 0.5) * 0.8,
        swayAmp: 15 + Math.random() * 25,
        swayFreq: 0.01 + Math.random() * 0.02,
        swayPhase: Math.random() * Math.PI * 2,
        scale: 0.6 + Math.random() * 0.55
      });
    }

    var animId = null;
    var lastTime = performance.now();

    function updateParticles(now) {
      var dt = Math.min((now - lastTime) / 16.667, 2.5);
      lastTime = now;

      var w = window.innerWidth;
      var h = window.innerHeight;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.y += p.vy * dt;
        p.x += p.vx * dt;
        p.swayPhase += p.swayFreq * dt;
        p.rot += p.vRot * dt;

        var swayOffset = Math.sin(p.swayPhase) * p.swayAmp;
        var currentX = p.x + swayOffset;

        // Reset if drifted beyond screen bounds
        if (p.vy > 0 && p.y > h + 40) {
          p.y = -30;
          p.x = Math.random() * w;
        } else if (p.vy < 0 && p.y < -30) {
          p.y = h + 20;
          p.x = Math.random() * w;
        }
        if (currentX < -40) p.x = w + 20;
        if (currentX > w + 40) p.x = -20;

        p.el.style.transform = 'translate3d(' + currentX.toFixed(1) + 'px,' + p.y.toFixed(1) + 'px,0) rotate(' + p.rot.toFixed(1) + 'deg) scale(' + p.scale + ')';
      }

      animId = requestAnimationFrame(updateParticles);
    }

    animId = requestAnimationFrame(updateParticles);

    // Pause animation when tab is in background to save battery
    document.addEventListener('visibilitychange', function () {
      if (document.hidden) {
        if (animId) cancelAnimationFrame(animId);
      } else {
        lastTime = performance.now();
        animId = requestAnimationFrame(updateParticles);
      }
    });

    // Subtle gentle parallax response to mouse movement
    var targetX = 0, targetY = 0;
    var curGlowX = 0, curGlowY = 0;
    var curFoliageX = 0, curFoliageY = 0;
    var parallaxActive = false;

    window.addEventListener('mousemove', function (e) {
      targetX = (e.clientX / window.innerWidth - 0.5) * 24;
      targetY = (e.clientY / window.innerHeight - 0.5) * 24;
      if (!parallaxActive) {
        parallaxActive = true;
        renderParallax();
      }
    }, { passive: true });

    function renderParallax() {
      curGlowX += (targetX * 0.7 - curGlowX) * 0.05;
      curGlowY += (targetY * 0.7 - curGlowY) * 0.05;
      curFoliageX += (targetX * 0.4 - curFoliageX) * 0.05;
      curFoliageY += (targetY * 0.4 - curFoliageY) * 0.05;

      if (glowWrap) {
        glowWrap.style.transform = 'translate3d(' + curGlowX.toFixed(2) + 'px,' + curGlowY.toFixed(2) + 'px,0)';
      }
      if (foliageWrap) {
        foliageWrap.style.transform = 'translate3d(' + curFoliageX.toFixed(2) + 'px,' + curFoliageY.toFixed(2) + 'px,0)';
      }

      if (Math.abs(targetX * 0.7 - curGlowX) > 0.05 || Math.abs(targetY * 0.7 - curGlowY) > 0.05) {
        requestAnimationFrame(renderParallax);
      } else {
        parallaxActive = false;
      }
    }
  }

  initAmbientAtmosphere();

  // Restore previous response on this device
  (function restore() {
    try {
      var saved = JSON.parse(localStorage.getItem('wedding_rsvp'));
      if (saved && saved.name && saved.response) { showConfirmation(saved.name, saved.response); }
    } catch (e) { }
  })();

  applyLanguage('en');

})();
