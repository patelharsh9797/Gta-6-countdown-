/* Countdown, country data and list. The map (map.js) plugs into window.GTA6. */
(function () {
  'use strict';

  // Release: midnight local on this calendar date.
  var Y = 2026, M = 11, D = 19;
  // The US store region (US, Canada and US territories) unlocks as one, keyed to this zone.
  var NA_KEY = 'America/New_York';
  var NA = { US: 1, CA: 1, PR: 1, VI: 1, GU: 1, MP: 1, AS: 1 };

  // code | zone | city label (only for countries split into several zones) | lon,lat (zone pins only)
  var DATA = (
    'NZ|Pacific/Auckland;FJ|Pacific/Fiji;TO|Pacific/Tongatapu;WS|Pacific/Apia;KI|Pacific/Tarawa;MH|Pacific/Majuro;NR|Pacific/Nauru;TV|Pacific/Funafuti;' +
    'WF|Pacific/Wallis;NU|Pacific/Niue;CK|Pacific/Rarotonga;PF|Pacific/Tahiti;PN|Pacific/Pitcairn;NC|Pacific/Noumea;NF|Pacific/Norfolk;' +
    'SB|Pacific/Guadalcanal;VU|Pacific/Efate;FM|Pacific/Pohnpei;PG|Pacific/Port_Moresby;PW|Pacific/Palau;GU|Pacific/Guam;MP|Pacific/Saipan;AS|Pacific/Pago_Pago;' +
    'AU|Australia/Sydney|Sydney, Melbourne|151.2,-33.9;AU|Australia/Brisbane|Brisbane|153,-27.5;AU|Australia/Adelaide|Adelaide|138.6,-34.9;AU|Australia/Darwin|Darwin|130.8,-12.5;AU|Australia/Perth|Perth|115.9,-32;' +
    'JP|Asia/Tokyo;KR|Asia/Seoul;KP|Asia/Pyongyang;TL|Asia/Dili;CN|Asia/Shanghai;HK|Asia/Hong_Kong;MO|Asia/Macau;TW|Asia/Taipei;PH|Asia/Manila;SG|Asia/Singapore;' +
    'MY|Asia/Kuala_Lumpur;BN|Asia/Brunei;MN|Asia/Ulaanbaatar;ID|Asia/Jakarta|Jakarta|106.8,-6.2;ID|Asia/Makassar|Bali, Makassar|119.4,-5.1;ID|Asia/Jayapura|Jayapura|140.7,-2.5;' +
    'TH|Asia/Bangkok;VN|Asia/Ho_Chi_Minh;KH|Asia/Phnom_Penh;LA|Asia/Vientiane;MM|Asia/Yangon;BD|Asia/Dhaka;BT|Asia/Thimphu;NP|Asia/Kathmandu;IN|Asia/Kolkata;' +
    'LK|Asia/Colombo;MV|Indian/Maldives;PK|Asia/Karachi;AF|Asia/Kabul;KZ|Asia/Almaty;KG|Asia/Bishkek;UZ|Asia/Tashkent;TJ|Asia/Dushanbe;TM|Asia/Ashgabat;' +
    'IR|Asia/Tehran;AE|Asia/Dubai;OM|Asia/Muscat;SA|Asia/Riyadh;QA|Asia/Qatar;BH|Asia/Bahrain;KW|Asia/Kuwait;YE|Asia/Aden;IQ|Asia/Baghdad;JO|Asia/Amman;' +
    'SY|Asia/Damascus;LB|Asia/Beirut;IL|Asia/Jerusalem;PS|Asia/Hebron;AM|Asia/Yerevan;AZ|Asia/Baku;GE|Asia/Tbilisi;TR|Europe/Istanbul;CY|Asia/Nicosia;' +
    'RU|Europe/Moscow|Moscow|37.6,55.8;RU|Asia/Yekaterinburg|Yekaterinburg|60.6,56.8;RU|Asia/Novosibirsk|Novosibirsk|82.9,55;RU|Asia/Vladivostok|Vladivostok|131.9,43.1;' +
    'BY|Europe/Minsk;UA|Europe/Kiev;MD|Europe/Chisinau;RO|Europe/Bucharest;BG|Europe/Sofia;GR|Europe/Athens;FI|Europe/Helsinki;AX|Europe/Mariehamn;EE|Europe/Tallinn;LV|Europe/Riga;LT|Europe/Vilnius;' +
    'PL|Europe/Warsaw;CZ|Europe/Prague;SK|Europe/Bratislava;HU|Europe/Budapest;AT|Europe/Vienna;DE|Europe/Berlin;CH|Europe/Zurich;LI|Europe/Vaduz;IT|Europe/Rome;' +
    'SM|Europe/San_Marino;VA|Europe/Vatican;MT|Europe/Malta;SI|Europe/Ljubljana;HR|Europe/Zagreb;BA|Europe/Sarajevo;RS|Europe/Belgrade;ME|Europe/Podgorica;' +
    'XK|Europe/Belgrade;MK|Europe/Skopje;AL|Europe/Tirane;FR|Europe/Paris;MC|Europe/Monaco;BE|Europe/Brussels;NL|Europe/Amsterdam;LU|Europe/Luxembourg;' +
    'ES|Europe/Madrid;AD|Europe/Andorra;DK|Europe/Copenhagen;NO|Europe/Oslo;SE|Europe/Stockholm;GB|Europe/London;IE|Europe/Dublin;PT|Europe/Lisbon;IS|Atlantic/Reykjavik;' +
    'JE|Europe/Jersey;GG|Europe/Guernsey;IM|Europe/Isle_of_Man;FO|Atlantic/Faroe;GL|America/Nuuk;' +
    'EG|Africa/Cairo;LY|Africa/Tripoli;TN|Africa/Tunis;DZ|Africa/Algiers;MA|Africa/Casablanca;EH|Africa/El_Aaiun;SD|Africa/Khartoum;SS|Africa/Juba;ET|Africa/Addis_Ababa;ER|Africa/Asmara;' +
    'DJ|Africa/Djibouti;SO|Africa/Mogadishu;KE|Africa/Nairobi;UG|Africa/Kampala;TZ|Africa/Dar_es_Salaam;RW|Africa/Kigali;BI|Africa/Bujumbura;KM|Indian/Comoro;' +
    'MG|Indian/Antananarivo;MU|Indian/Mauritius;SC|Indian/Mahe;ZA|Africa/Johannesburg;LS|Africa/Maseru;SZ|Africa/Mbabane;BW|Africa/Gaborone;NA|Africa/Windhoek;' +
    'ZW|Africa/Harare;ZM|Africa/Lusaka;MW|Africa/Blantyre;MZ|Africa/Maputo;AO|Africa/Luanda;CD|Africa/Kinshasa;CG|Africa/Brazzaville;GA|Africa/Libreville;' +
    'GQ|Africa/Malabo;CM|Africa/Douala;CF|Africa/Bangui;TD|Africa/Ndjamena;NE|Africa/Niamey;NG|Africa/Lagos;BJ|Africa/Porto-Novo;TG|Africa/Lome;GH|Africa/Accra;' +
    'CI|Africa/Abidjan;BF|Africa/Ouagadougou;ML|Africa/Bamako;LR|Africa/Monrovia;SL|Africa/Freetown;GN|Africa/Conakry;GW|Africa/Bissau;SN|Africa/Dakar;GM|Africa/Banjul;' +
    'MR|Africa/Nouakchott;ST|Africa/Sao_Tome;CV|Atlantic/Cape_Verde;SH|Atlantic/St_Helena;' +
    'BR|America/Sao_Paulo|São Paulo, Rio|-46.6,-23.5;BR|America/Manaus|Manaus|-60,-3.1;AR|America/Argentina/Buenos_Aires;UY|America/Montevideo;PY|America/Asuncion;CL|America/Santiago;' +
    'FK|Atlantic/Stanley;BO|America/La_Paz;PE|America/Lima;EC|America/Guayaquil;CO|America/Bogota;VE|America/Caracas;GY|America/Guyana;SR|America/Paramaribo;' +
    'TT|America/Port_of_Spain;BB|America/Barbados;GD|America/Grenada;VC|America/St_Vincent;LC|America/St_Lucia;DM|America/Dominica;AG|America/Antigua;KN|America/St_Kitts;' +
    'AW|America/Aruba;CW|America/Curacao;SX|America/Lower_Princes;MF|America/Marigot;BL|America/St_Barthelemy;AI|America/Anguilla;MS|America/Montserrat;VG|America/Tortola;' +
    'VI|America/St_Thomas;PR|America/Puerto_Rico;TC|America/Grand_Turk;KY|America/Cayman;BM|Atlantic/Bermuda;PM|America/Miquelon;' +
    'DO|America/Santo_Domingo;HT|America/Port-au-Prince;JM|America/Jamaica;CU|America/Havana;BS|America/Nassau;PA|America/Panama;CR|America/Costa_Rica;NI|America/Managua;' +
    'HN|America/Tegucigalpa;SV|America/El_Salvador;GT|America/Guatemala;BZ|America/Belize;' +
    'MX|America/Mexico_City|Mexico City|-99.1,19.4;MX|America/Cancun|Cancún|-86.8,21.2;MX|America/Tijuana|Tijuana|-117,32.5;' +
    'US|America/New_York|Eastern;US|America/Chicago|Central;US|America/Denver|Mountain;US|America/Los_Angeles|Pacific;US|America/Anchorage|Alaska;US|Pacific/Honolulu|Hawaii;' +
    'CA|America/Toronto|Eastern;CA|America/St_Johns|Newfoundland;CA|America/Halifax|Atlantic;CA|America/Winnipeg|Central;CA|America/Edmonton|Mountain;CA|America/Vancouver|Pacific'
  ).split(';');

  // Browser zone names that differ from the ones used above.
  var ALIAS = {
    'Asia/Calcutta': 'Asia/Kolkata', 'Europe/Kyiv': 'Europe/Kiev', 'Asia/Saigon': 'Asia/Ho_Chi_Minh', 'Asia/Katmandu': 'Asia/Kathmandu',
    'Asia/Rangoon': 'Asia/Yangon', 'America/Buenos_Aires': 'America/Argentina/Buenos_Aires', 'Australia/Melbourne': 'Australia/Sydney',
    'Australia/Hobart': 'Australia/Sydney', 'Australia/Canberra': 'Australia/Sydney', 'America/Montreal': 'America/Toronto',
    'America/Phoenix': 'America/Denver', 'America/Detroit': 'America/New_York', 'America/Boise': 'America/Denver',
    'America/Regina': 'America/Winnipeg', 'America/Calgary': 'America/Edmonton', 'Asia/Istanbul': 'Europe/Istanbul', 'Asia/Dacca': 'Asia/Dhaka',
    'America/Godthab': 'America/Nuuk', 'Atlantic/Faeroe': 'Atlantic/Faroe'
  };

  var fmtCache = {};
  function partsFmt(tz) {
    return fmtCache[tz] || (fmtCache[tz] = new Intl.DateTimeFormat('en-US', {
      timeZone: tz, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric',
      hour: 'numeric', minute: 'numeric', second: 'numeric'
    }));
  }
  function offsetMs(tz, t) {
    var o = {};
    partsFmt(tz).formatToParts(new Date(t)).forEach(function (p) { o[p.type] = +p.value; });
    return Date.UTC(o.year, o.month - 1, o.day, o.hour % 24, o.minute, o.second) - Math.floor(t / 1000) * 1000;
  }
  function midnightIn(tz) {
    var wall = Date.UTC(Y, M - 1, D);
    var t = wall - offsetMs(tz, wall);
    return wall - offsetMs(tz, t);
  }
  function validZone(tz) {
    try { new Intl.DateTimeFormat('en-US', { timeZone: tz }); return true; } catch (e) { return false; }
  }

  var regionNames = null;
  try { regionNames = new Intl.DisplayNames(['en'], { type: 'region' }); } catch (e) {}
  function countryName(cc) {
    var n = null;
    try { n = regionNames && regionNames.of(cc); } catch (e) {}
    return n && n !== cc ? n : cc;
  }
  function flag(cc) {
    return cc ? String.fromCodePoint(0x1F1E6 + cc.charCodeAt(0) - 65, 0x1F1E6 + cc.charCodeAt(1) - 65) : '🌐';
  }
  function fmtIn(tz, t) {
    var opts = { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' };
    if (tz) opts.timeZone = tz;
    return new Intl.DateTimeFormat(undefined, opts).format(new Date(t));
  }
  function fmtShort(tz, t) {
    var opts = { weekday: 'short', hour: 'numeric', minute: '2-digit' };
    if (tz) opts.timeZone = tz;
    return new Intl.DateTimeFormat(undefined, opts).format(new Date(t));
  }
  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  var naKey = midnightIn(NA_KEY);
  var places = [], byCountry = {};
  DATA.forEach(function (line, i) {
    var f = line.split('|');
    if (!validZone(f[1])) return;
    var name = countryName(f[0]);
    var p = {
      id: f[0] + (f[2] ? ':' + f[1] : ''),
      cc: f[0], tz: f[1], city: f[2] || '', name: name,
      label: name + (f[2] ? ' · ' + f[2] : ''),
      at: NA[f[0]] ? naKey : midnightIn(f[1]),
      pin: f[3] ? f[3].split(',').map(Number) : null,
      hay: (name + ' ' + (f[2] || '') + ' ' + f[1].replace(/_/g, ' ') + ' ' + f[0]).toLowerCase(),
      order: i
    };
    places.push(p);
    // The first zone listed for a country is its main one.
    if (!byCountry[p.cc]) byCountry[p.cc] = p;
  });

  // ----- Where is the visitor? -----
  var userTz = '';
  try { userTz = Intl.DateTimeFormat().resolvedOptions().timeZone || ''; } catch (e) {}
  var lookTz = ALIAS[userTz] || userTz;
  var home = places.filter(function (p) { return p.tz === lookTz; })[0];
  if (!home) {
    // Unknown zone: fall back to midnight on the visitor's own clock.
    var wall = new Date(Y, M - 1, D).getTime();
    var naGuess = /^(America\/(Indiana|Kentucky|North_Dakota)\/|US\/|Canada\/)/.test(userTz);
    home = { id: 'local', cc: '', tz: userTz && validZone(userTz) ? userTz : undefined, city: '', name: 'your time zone', label: 'your time zone', at: naGuess ? naKey : wall, custom: true };
  }

  var selected = home;
  try {
    var saved = localStorage.getItem('gta6.place');
    if (saved) selected = places.filter(function (p) { return p.id === saved; })[0] || home;
  } catch (e) {}

  function remaining(ms) {
    var s = Math.max(0, Math.floor(ms / 1000));
    return { d: Math.floor(s / 86400), h: Math.floor(s % 86400 / 3600), m: Math.floor(s % 3600 / 60), s: s % 60 };
  }
  // "1:07:58:51" — days:hours:minutes:seconds
  function clockStr(ms) {
    if (ms <= 0) return 'OUT NOW';
    var r = remaining(ms);
    return r.d + ':' + pad(r.h) + ':' + pad(r.m) + ':' + pad(r.s);
  }

  // ----- Shared hooks for the map -----
  var listeners = [];
  var api = window.GTA6 = {
    places: places, byCountry: byCountry, home: home, naKey: naKey,
    flag: flag, fmtIn: fmtIn, fmtShort: fmtShort, clockStr: clockStr,
    selected: function () { return selected; },
    choose: function (p, opts) { choose(p, opts); },
    on: function (fn) { listeners.push(fn); },
    focus: null // set by map.js: focus(place)
  };
  function emit(type) { for (var i = 0; i < listeners.length; i++) listeners[i](type); }

  // ----- Header clock -----
  var $ = function (id) { return document.getElementById(id); };
  var hero = $('hero'), elD = $('d'), elH = $('h'), elM = $('m'), elS = $('s');

  function describe() {
    var p = selected;
    var line = $('whereLine');
    line.textContent = '';
    line.append(p.custom ? 'Unlocks in ' : 'Unlocks in ' + flag(p.cc) + ' ', Object.assign(document.createElement('b'), { textContent: p.label }), ' on ' + fmtIn(p.tz, p.at));
    var sameClock = p === home || offsetMs(p.tz || userTz || 'UTC', p.at) === offsetMs(home.tz || userTz || 'UTC', p.at);
    $('whereSub').textContent = sameClock ? '' : 'That is ' + fmtIn(undefined, p.at) + ' your time';
    $('reset').hidden = p === home;
  }

  // ----- Country list -----
  var list = $('list'), rows = [], sortBy = 'time';
  places.forEach(function (p) {
    var li = document.createElement('li');
    var b = document.createElement('button');
    b.className = 'row'; b.type = 'button';
    var fl = document.createElement('span'); fl.className = 'flag'; fl.textContent = flag(p.cc); fl.setAttribute('aria-hidden', 'true');
    var nm = document.createElement('span'); nm.className = 'name'; nm.textContent = p.name;
    if (p.city) { var c = document.createElement('i'); c.textContent = ' · ' + p.city; nm.append(c); }
    if (p === home) { var y = document.createElement('span'); y.className = 'you'; y.textContent = 'You'; nm.append(y); }
    var wh = document.createElement('span'); wh.className = 'when';
    var same = fmtShort(p.tz, p.at) === fmtShort(undefined, p.at);
    wh.textContent = same || p.at === naKey ? fmtShort(p.tz, p.at) + ' local time' : fmtShort(undefined, p.at) + ' your time';
    wh.title = fmtIn(p.tz, p.at) + ' local time / ' + fmtIn(undefined, p.at) + ' your time';
    var lf = document.createElement('span'); lf.className = 'left';
    b.append(fl, nm, wh, lf);
    b.addEventListener('click', function () {
      choose(p);
      $('map').scrollIntoView({ behavior: 'smooth', block: 'start' });
      if (api.focus) api.focus(p);
    });
    li.append(b);
    rows.push({ p: p, li: li, b: b, left: lf });
  });

  function render() {
    var q = $('q').value.trim().toLowerCase();
    var shown = rows.filter(function (r) { return !q || r.p.hay.indexOf(q) !== -1; });
    shown.sort(sortBy === 'time'
      ? function (a, b) { return a.p.at - b.p.at || a.p.order - b.p.order; }
      : function (a, b) { return a.p.label.localeCompare(b.p.label); });
    list.replaceChildren.apply(list, shown.map(function (r) { return r.li; }));
    $('empty').hidden = shown.length > 0;
    $('count').textContent = shown.length + ' of ' + rows.length + ' regions';
  }
  function setSort(s) {
    sortBy = s;
    $('sortTime').setAttribute('aria-pressed', s === 'time');
    $('sortName').setAttribute('aria-pressed', s === 'name');
    render();
  }

  function choose(p) {
    selected = p;
    try { p === home ? localStorage.removeItem('gta6.place') : localStorage.setItem('gta6.place', p.id); } catch (e) {}
    rows.forEach(function (r) { r.b.setAttribute('aria-pressed', r.p === selected ? 'true' : 'false'); });
    describe(); tick();
    emit('select');
  }

  // Change a clock number and replay its roll-in.
  function setNum(el, v) {
    if (el.textContent === v) return;
    el.textContent = v;
    el.classList.remove('roll'); void el.offsetWidth; el.classList.add('roll');
  }

  function tick() {
    var now = Date.now();
    var left = selected.at - now;
    hero.classList.toggle('is-live', left <= 0);
    var r = remaining(left);
    setNum(elD, pad(r.d)); setNum(elH, pad(r.h)); setNum(elM, pad(r.m)); setNum(elS, pad(r.s));
    document.title = left > 0 ? r.d + 'd ' + pad(r.h) + 'h ' + pad(r.m) + 'm · GTA VI Countdown' : 'GTA VI is out now';
    for (var i = 0; i < rows.length; i++) {
      var ms = rows[i].p.at - now, out = ms <= 0;
      rows[i].left.textContent = clockStr(ms);
      if (out !== rows[i].out) { rows[i].out = out; rows[i].b.classList.toggle('out', out); }
    }
    emit('tick');
  }

  $('q').addEventListener('input', render);
  $('sortTime').addEventListener('click', function () { setSort('time'); });
  $('sortName').addEventListener('click', function () { setSort('name'); });
  $('reset').addEventListener('click', function () { choose(home); if (api.focus) api.focus(home); });

  var byTime = places.slice().sort(function (a, b) { return a.at - b.at || a.order - b.order; });
  var first = byTime[0], last = byTime[byTime.length - 1];
  $('rollout').textContent = 'The rollout starts in ' + first.name + ' and reaches ' + last.label + ' ' +
    Math.round((last.at - first.at) / 36e5) + ' hours later.';

  render();
  choose(selected);
  // Tick on the second boundary so every clock on the page flips together.
  setTimeout(function () { tick(); setInterval(tick, 1000); }, 1000 - Date.now() % 1000 + 5);

  // ----- Effects: nav, 3D header tilt, tilting list cards -----
  var nav = $('nav');
  function stick() { nav.classList.toggle('stuck', window.scrollY > 120); }
  window.addEventListener('scroll', stick, { passive: true }); stick();

  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var hot = null;
  function calm() { if (hot) { hot.style.setProperty('--tx', '0deg'); hot.style.setProperty('--ty', '0deg'); hot = null; } }
  if (!reduce && window.matchMedia && matchMedia('(hover: hover)').matches) {
    list.addEventListener('pointermove', function (e) {
      var row = e.target.closest && e.target.closest('.row');
      if (row !== hot) calm();
      if (!row) return;
      hot = row;
      var b = row.getBoundingClientRect(), x = (e.clientX - b.left) / b.width, y = (e.clientY - b.top) / b.height;
      row.style.setProperty('--ty', ((x - .5) * 10).toFixed(2) + 'deg');
      row.style.setProperty('--tx', ((.5 - y) * 12).toFixed(2) + 'deg');
      row.style.setProperty('--mx', (x * 100).toFixed(1) + '%');
      row.style.setProperty('--my', (y * 100).toFixed(1) + '%');
    });
    list.addEventListener('pointerleave', calm);
  }
  if (reduce) return;

  // Pointer, device tilt, or a slow idle drift steer the 3D header.
  var top = $('top');
  var tx = 0, ty = 0, cx = 0, cy = 0, lastInput = -1e9, onScreen = true;
  function clamp(v) { return Math.max(-1, Math.min(1, v)); }
  window.addEventListener('pointermove', function (e) {
    if (e.pointerType === 'touch') return;
    tx = clamp((e.clientX / window.innerWidth - .5) * 2);
    ty = clamp((e.clientY / window.innerHeight - .5) * 2);
    lastInput = performance.now();
  }, { passive: true });
  window.addEventListener('deviceorientation', function (e) {
    if (e.gamma == null || e.beta == null) return;
    tx = clamp(e.gamma / 28); ty = clamp((e.beta - 50) / 28);
    lastInput = performance.now();
  }, { passive: true });
  if ('IntersectionObserver' in window) new IntersectionObserver(function (en) { onScreen = en[0].isIntersecting; }).observe(top);
  function frame(now) {
    if (onScreen) {
      var gx = tx, gy = ty;
      if (now - lastInput > 2500) { gx = Math.sin(now / 3600) * .55; gy = Math.cos(now / 4700) * .4; }
      var nx = cx + (gx - cx) * .05, ny = cy + (gy - cy) * .05;
      if (Math.abs(nx - cx) > .0004 || Math.abs(ny - cy) > .0004) {
        cx = nx; cy = ny;
        top.style.setProperty('--px', cx.toFixed(4));
        top.style.setProperty('--py', cy.toFixed(4));
      }
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
