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
      familyLine: "Together with their families", name1: "Hossain", amp: "&", name2: "Rowan",
      tagline: "joyfully invite you to share the celebration of their wedding — an evening of love, laughter, and new beginnings.",
      saveDateEyebrow: "Save the Date", dateSub: "Save the Date",
      timeLabel: "7:00 PM", timeSub: "Arrival & Ceremony",
      findUs: "Find Us", venueName: "Sea Garden Open Air Hall",
      venueNote: 'tap "Open in Google Maps" to check the location.',
      openMaps: "Open in Google Maps", copyLink: "Copy Location Link", copiedToast: "Location link copied!",
      kindlyRespond: "Kindly confirm your attendance", willYouJoin: "Will you be able to join us? 💍",
      yourName: "Your Name", namePlaceholder: "e.g. Sarah Ahmed", yourResponse: "Your Response",
      accept: "Joyfully Accepts", decline: "Regretfully Declines", sendRsvp: "Send RSVP",
      changeResponse: "Change your response",
      confirmYes: function (n) { return "Wonderful, " + n + "! We can't wait to celebrate with you — see you on October 12th!"; },
      confirmNo: function (n) { return "We'll miss you, " + n + ". Thank you for letting us know — you'll be in our hearts on the day."; },
      footerSig: "With love, Hossain & Rowan",
      dateLocale: "en-US"
    },
    ar: {
      inviteEyebrow: "أنتم مدعوون", tapHint: "المسي الختم لفتح الدعوة", seal: "ح ر",
      familyLine: "بمشاركة أسرتيهما", name1: "حسين", amp: "و", name2: "روان",
      tagline: "يتشرّفان بدعوتكم للاحتفال بزفافهما — أمسية مفعمة بالحب والفرح وبداية جديدة.",
      saveDateEyebrow: "احفظوا التاريخ", dateSub: "احفظوا التاريخ",
      timeLabel: "٧:٠٠ مساءً", timeSub: "الحضور والحفل",
      findUs: "موقع الحفل", venueName: "قاعة سي جاردن المفتوحة",
      venueNote: 'اضغطوا على "فتح في خرائط جوجل" لمعرفة المكان.',
      openMaps: "فتح في خرائط جوجل", copyLink: "نسخ رابط الموقع", copiedToast: "تم نسخ رابط الموقع!",
      kindlyRespond: "يُرجى تأكيد الحضور", willYouJoin: "هل ستتمكن من الانضمام إلينا؟ 💍",
      yourName: "اسمكم", namePlaceholder: "مثال: سارة أحمد", yourResponse: "ردّكم",
      accept: "يسعدنا الحضور", decline: "يؤسفنا الاعتذار", sendRsvp: "إرسال الرد",
      changeResponse: "تغيير الرد",
      confirmYes: function (n) { return "رائع يا " + n + "! لا نطيق الانتظار للاحتفال معكم — نراكم في ١٢ أكتوبر!"; },
      confirmNo: function (n) { return "سنشتاق إليكم يا " + n + ". شكرًا لإخباركم إيانا — ستكونون في قلوبنا في هذا اليوم."; },
      footerSig: "بكل حب، حسين وروان",
      dateLocale: "ar-EG"
    }
  };

  var currentLang = 'en';

  var idMap = {
    txtInviteEyebrow: 'inviteEyebrow', txtTapHint: 'tapHint', txtSeal: 'seal', foldMonogram: 'seal',
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
  var foldFace = document.getElementById('foldFace');
  var scene = document.getElementById('envelope-scene');
  var opened = false;

  function openEnvelope() {
    if (opened) return;
    opened = true;
    document.body.style.overflow = 'auto';

    wrap.classList.add('open');
    envelope.classList.add('open');                          // t=0: ribbon/seal release, flap opens
    setTimeout(function () { card.classList.add('stage1'); }, 350);   // slides out above envelope, folded in 4
    setTimeout(function () { card.classList.add('stage1-mid'); }, 1050); // glides to middle of screen
    setTimeout(function () { card.classList.add('stage2'); }, 1850);  // starts unfolding horizontally (0.8s later)
    setTimeout(function () {
      card.classList.add('stage2-vert');                       // unfolds vertically
      foldFace.classList.add('fade');
    }, 2550);
    setTimeout(function () { card.classList.add('stage3'); }, 3250);  // zooms to screen
    setTimeout(function () {
      // Append the card directly to the body and remove envelope constraints
      document.body.appendChild(card);
      card.classList.remove('envelope-card', 'stage1', 'stage1-mid', 'stage2', 'stage2-vert', 'stage3');
      
      scene.classList.add('closed');                          // the invitation itself appears
      document.body.classList.add('invitation-open');         // trigger main zoom-in animation
      revealOnScroll();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 3950);
  }
  wrap.addEventListener('click', openEnvelope);
  wrap.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openEnvelope(); }
  });
  document.body.style.overflow = 'hidden';

  /* ======================================================
     SCROLL REVEAL
  ====================================================== */
  function revealOnScroll() {
    var sections = document.querySelectorAll('main section');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) { if (entry.isIntersecting) { entry.target.classList.add('revealed'); } });
    }, { threshold: 0.2 });
    sections.forEach(function (s) { io.observe(s); });
  }

  /* ======================================================
     DATE FORMATTING + COUNTDOWN
  ====================================================== */
  var eventDate = new Date(WEDDING_DATE_ISO);

  function updateDate() {
    var dateBig = document.getElementById('dateBig');
    if (!isNaN(eventDate.getTime())) {
      dateBig.textContent = eventDate.toLocaleDateString(STR[currentLang].dateLocale, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
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

  // Restore previous response on this device
  (function restore() {
    try {
      var saved = JSON.parse(localStorage.getItem('wedding_rsvp'));
      if (saved && saved.name && saved.response) { showConfirmation(saved.name, saved.response); }
    } catch (e) { }
  })();

  applyLanguage('en');

})();
