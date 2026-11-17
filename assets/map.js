/* Interactive world map: every country coloured by unlock time, labelled with a live countdown. */
(function () {
  'use strict';
  var G = window.GTA6;
  var $ = function (id) { return document.getElementById(id); };
  var card = $('mapcard'), overlay = $('overlay'), tip = $('tip');
  if (!G || !window.d3 || !window.topojson || !window.WORLD) {
    $('mapLoading').textContent = 'The map could not load. The full list is below.';
    return;
  }

  // ----- Projection: Mercator from 80°N to 57°S, 1000 units wide -----
  var W = 1000;
  var proj = d3.geoMercator().scale(W / (2 * Math.PI)).translate([W / 2, 0]);
  var yTop = proj([0, 80])[1], yBot = proj([0, -57])[1];
  proj.translate([W / 2, -yTop]);
  var H0 = yBot - yTop;
  proj.clipExtent([[0, 0], [W, H0]]);
  var path = d3.geoPath(proj);

  // Label positions for countries whose biggest landmass centre looks wrong.
  var ANCHOR = {
    US: [-98.5, 39.5], CA: [-103, 57], RU: [97, 63], NO: [9.5, 61.5], FR: [2.4, 46.6], VN: [106.3, 16.6],
    MY: [102.2, 4.2], HR: [15.9, 45.5], ID: [113.5, -1], GB: [-1.8, 53], CL: [-71, -33], IT: [12.5, 42.8],
    JP: [138.5, 36.5], NZ: [172.5, -41.5], PH: [122, 13], KI: [173, 1.4], FJ: [178, -17.8], GR: [22, 39.5],
    DK: [9.2, 56], CN: [103.5, 36.5], IN: [79, 22], BR: [-52, -10], AU: [134, -25]
  };
  // Places that are too small for the map data: shown as dots.
  var EXTRA = { TV: [179.2, -8.5] };

  var COLORS = d3.interpolateRgbBasis(['#ffd98a', '#ff9a62', '#ff6aa0', '#e050c8', '#8a52ea', '#4d6bf0']);

  var feats = topojson.feature(WORLD, WORLD.objects.countries).features;
  var countries = {}, clist = [];

  function polys(geom) {
    return geom.type === 'Polygon' ? [geom.coordinates] : geom.type === 'MultiPolygon' ? geom.coordinates : [];
  }
  feats.forEach(function (f) {
    var cc = f.id || '';
    var c = countries[cc];
    if (!c || !cc) {
      c = { cc: cc, place: cc ? G.byCountry[cc] || null : null, feats: [], area: 0, big: 0, anchor: null, bounds: null };
      if (cc) countries[cc] = c;
      clist.push(c);
    }
    c.feats.push(f);
    c.area += path.area(f);
    polys(f.geometry).forEach(function (p) {
      var g = { type: 'Polygon', coordinates: p }, a = path.area(g);
      if (a > c.big) { c.big = a; c.anchor = path.centroid(g); c.bounds = path.bounds(g); }
    });
  });
  Object.keys(EXTRA).forEach(function (cc) {
    if (countries[cc] || !G.byCountry[cc]) return;
    var pt = proj(EXTRA[cc]);
    var c = { cc: cc, place: G.byCountry[cc], feats: [], area: 0, big: 0, anchor: pt, bounds: [pt, pt] };
    countries[cc] = c; clist.push(c);
  });
  clist.forEach(function (c) {
    if (ANCHOR[c.cc]) c.anchor = proj(ANCHOR[c.cc]);
    if (!c.anchor || isNaN(c.anchor[0])) c.anchor = c.bounds ? [(c.bounds[0][0] + c.bounds[1][0]) / 2, (c.bounds[0][1] + c.bounds[1][1]) / 2] : [0, 0];
    c.size = Math.sqrt(c.area);
  });

  var timed = clist.filter(function (c) { return c.place; });
  var tMin = d3.min(timed, function (c) { return c.place.at; }), tMax = d3.max(timed, function (c) { return c.place.at; });
  function colorFor(at) { return COLORS(tMax > tMin ? (at - tMin) / (tMax - tMin) : 0); }

  // ----- SVG -----
  var svg = d3.select('#world');
  var gz = svg.append('g');
  var gb = gz.append('g');
  gb.append('path').attr('class', 'grat').attr('d', path(d3.geoGraticule().step([15, 15])()));
  var shadow = gb.append('path').attr('class', 'landshadow')
    .attr('d', path(topojson.merge(WORLD, WORLD.objects.countries.geometries)));
  var gc = gb.append('g');

  clist.forEach(function (c) {
    c.els = c.feats.map(function (f) {
      var el = gc.append('path').attr('d', path(f)).attr('class', 'c' + (c.place ? '' : ' none')).node();
      if (c.place) el.setAttribute('fill', colorFor(c.place.at));
      el.__c = c;
      return el;
    });
  });

  // ----- Labels and dots (HTML overlay, constant screen size) -----
  var cands = [];
  function makeLabel(place, kind, c, x, y) {
    var el = document.createElement('div');
    el.className = 'lab ' + kind;
    var b = document.createElement('b'), s = document.createElement('span');
    b.textContent = kind === 'zone' ? place.city : place.name;
    el.append(b, s);
    el.addEventListener('click', function (e) { e.stopPropagation(); pick(place); });
    overlay.append(el);
    var o = { el: el, time: s, place: place, kind: kind, c: c, x: x, y: y, w: 80, h: 36, on: false };
    cands.push(o);
    return o;
  }
  var bySize = timed.slice().sort(function (a, b) { return b.area - a.area; });
  bySize.forEach(function (c, i) {
    c.label = makeLabel(c.place, i < 24 ? 'big' : 'small', c, c.anchor[0], c.anchor[1]);
    if (c.size < 9) {
      var d = document.createElement('div');
      d.className = 'dot';
      d.style.setProperty('--c', colorFor(c.place.at));
      d.addEventListener('click', function (e) { e.stopPropagation(); pick(c.place); });
      d.addEventListener('pointerenter', function (e) { showTip(c.place, e); });
      d.addEventListener('pointerleave', hideTip);
      overlay.append(d);
      c.dot = d;
    }
  });
  G.places.forEach(function (p) {
    var c = countries[p.cc];
    if (!p.pin || !c || c.place === p) return;
    var pt = proj(p.pin);
    p.zoneLabel = makeLabel(p, 'zone', c, pt[0], pt[1]);
  });

  function measure() {
    cands.forEach(function (o) { o.w = o.el.offsetWidth || o.w; o.h = o.el.offsetHeight || o.h; });
    schedule();
  }

  // ----- Zoom and pan -----
  var T = d3.zoomIdentity, cw = 1, ch = 1, sc = 1, Hv = H0, oy = 0;
  var zoom = d3.zoom().scaleExtent([1, 60]).clickDistance(6).on('zoom', zoomed);

  function layout() {
    cw = card.clientWidth || 1; ch = card.clientHeight || 1;
    sc = cw / W; Hv = W * ch / cw;
    oy = Math.max(0, (Hv - H0) / 2);
    svg.attr('viewBox', [0, 0, W, Hv].join(' '));
    gb.attr('transform', 'translate(0,' + oy + ')');
    zoom.extent([[0, 0], [W, Hv]]).translateExtent([[0, oy], [W, oy + H0]]);
  }
  function constrain(t) {
    return zoom.constrain()(t, [[0, 0], [W, Hv]], [[0, oy], [W, oy + H0]]);
  }
  function viewOn(x, y, k) {
    return constrain(d3.zoomIdentity.translate(W / 2, Hv / 2).scale(k).translate(-x, -(y + oy)));
  }
  function zoomed(e) {
    T = e.transform;
    gz.attr('transform', T);
    shadow.attr('transform', 'translate(0,' + (3.5 / (T.k * sc)).toFixed(3) + ')');
    if (e.sourceEvent) { hideTip(); $('hint').classList.add('gone'); }
    schedule();
  }

  // Fit a place: zoom so its landmass fills a good part of the view.
  function targetFor(p) {
    var c = countries[p.cc];
    if (!c) return null;
    var b = c.bounds || [c.anchor, c.anchor];
    var dx = Math.max(b[1][0] - b[0][0], 2), dy = Math.max(b[1][1] - b[0][1], 2);
    var k = Math.min(14, Math.max(2.2, .5 / Math.max(dx / W, dy / Hv)));
    var pt = c.anchor;
    if (p.zoneLabel) { pt = [p.zoneLabel.x, p.zoneLabel.y]; k = Math.max(k, 4.5); }
    return viewOn(pt[0], pt[1], k);
  }
  function focus(p) {
    var t = p && targetFor(p);
    if (!t) return;
    svg.interrupt().transition().duration(1100).ease(d3.easeCubicInOut).call(zoom.transform, t);
  }
  function pick(p) {
    if (!p) return;
    G.choose(p);
    focus(p);
  }
  G.focus = focus;

  function homeView() {
    var fill = Hv / H0;
    if (fill > 1.25) { // tall phone screen: fill the height, centred on the visitor
      var c = countries[G.home.cc] || countries[(G.selected() || {}).cc];
      return viewOn(c ? c.anchor[0] : W / 2, c ? c.anchor[1] : H0 / 2, fill * .95);
    }
    return constrain(d3.zoomIdentity);
  }

  // ----- Label placement: biggest countries first, skip anything that would overlap -----
  var raf = 0;
  function schedule() { if (!raf) raf = requestAnimationFrame(placeAll); }
  function placeAll() {
    raf = 0;
    var k = T.k, placed = [];
    var sel = G.selected(), home = G.home;
    var order = [];
    cands.forEach(function (o) {
      o.pinned = o.place === sel || (o.place === home && o.kind !== 'zone');
      if (o.pinned) order.push(o);
    });
    cands.forEach(function (o) { if (!o.pinned) order.push(o); });

    for (var i = 0; i < order.length; i++) {
      var o = order[i];
      var sx = sc * (T.x + k * o.x), sy = sc * (T.y + k * (o.y + oy));
      var show = sx > -40 && sx < cw + 40 && sy > -20 && sy < ch + 20;
      if (show && !o.pinned) {
        if (o.kind === 'zone') show = k >= 3;
        else show = o.c.size * k * sc >= (o.kind === 'big' ? 30 : 24);
      }
      if (show) {
        var l = sx - o.w / 2 - 2, t = sy - o.h / 2 - 1, r = sx + o.w / 2 + 2, b = sy + o.h / 2 + 1;
        for (var j = 0; j < placed.length && !o.pinned; j++) {
          var p = placed[j];
          if (l < p[2] && r > p[0] && t < p[3] && b > p[1]) { show = false; break; }
        }
        if (show) {
          placed.push([l, t, r, b]);
          o.el.style.transform = 'translate3d(' + (sx - o.w / 2).toFixed(1) + 'px,' + (sy - o.h / 2).toFixed(1) + 'px,0)';
        }
      }
      if (show !== o.on) { o.on = show; o.el.classList.toggle('on', show); }
    }

    // Dots for places that are specks at this zoom.
    for (var n = 0; n < timed.length; n++) {
      var c = timed[n];
      if (!c.dot) continue;
      var dx = sc * (T.x + k * c.anchor[0]), dy = sc * (T.y + k * (c.anchor[1] + oy));
      var vis = c.size * k * sc < 6 && dx > -12 && dx < cw + 12 && dy > -12 && dy < ch + 12;
      if (vis) c.dot.style.transform = 'translate3d(' + dx.toFixed(1) + 'px,' + dy.toFixed(1) + 'px,0)';
      if (vis !== c.dotOn) { c.dotOn = vis; c.dot.classList.toggle('on', vis); }
    }
  }

  // ----- Hover card -----
  var tipPlace = null;
  function showTip(p, e) {
    if (e.pointerType === 'touch' || e.buttons) return;
    tipPlace = p;
    var nm = document.createElement('strong');
    nm.textContent = G.flag(p.cc) + ' ' + (p.city && p.zoneLabel ? p.label : p.name);
    var local = document.createElement('em');
    local.textContent = G.fmtIn(p.tz, p.at) + ' local';
    var mine = document.createElement('em');
    mine.textContent = G.fmtIn(undefined, p.at) + ' your time';
    var t = document.createElement('span');
    t.className = 't';
    tip.replaceChildren(nm, local, mine, t);
    updateTip();
    moveTip(e);
    tip.classList.add('on');
  }
  function noDataTip(e) {
    if (e.pointerType === 'touch' || e.buttons) return;
    tipPlace = null;
    var nm = document.createElement('strong'); nm.textContent = 'No local release data';
    tip.replaceChildren(nm);
    moveTip(e); tip.classList.add('on');
  }
  function updateTip() {
    if (!tipPlace) return;
    var t = tip.querySelector('.t'), ms = tipPlace.at - Date.now();
    t.textContent = G.clockStr(ms);
    t.classList.toggle('out', ms <= 0);
  }
  function moveTip(e) {
    var b = card.getBoundingClientRect();
    var x = e.clientX - b.left + 16, y = e.clientY - b.top + 16;
    var w = tip.offsetWidth || 200, h = tip.offsetHeight || 90;
    if (x + w > cw - 8) x = e.clientX - b.left - w - 16;
    if (y + h > ch - 8) y = e.clientY - b.top - h - 16;
    tip.style.transform = 'translate3d(' + Math.max(8, x) + 'px,' + Math.max(8, y) + 'px,0)';
  }
  function hideTip() { tip.classList.remove('on'); tipPlace = null; }

  gc.on('pointerover', function (e) {
    var c = e.target.__c;
    if (!c) return;
    c.place ? showTip(c.place, e) : noDataTip(e);
  }).on('pointermove', function (e) { if (tip.classList.contains('on')) moveTip(e); })
    .on('pointerout', function (e) { if (!e.relatedTarget || !e.relatedTarget.__c) hideTip(); })
    .on('click', function (e) { var c = e.target.__c; if (c && c.place) pick(c.place); });

  // ----- Controls -----
  $('zin').addEventListener('click', function () { svg.transition().duration(350).call(zoom.scaleBy, 1.8); });
  $('zout').addEventListener('click', function () { svg.transition().duration(350).call(zoom.scaleBy, 1 / 1.8); });
  $('zworld').addEventListener('click', function () { svg.transition().duration(900).call(zoom.transform, constrain(d3.zoomIdentity)); });
  $('zme').addEventListener('click', function () { G.choose(G.home); focus(G.home); });
  $('chip').addEventListener('click', function () { focus(G.selected()); });

  // ----- Keep colours, labels and the chip in step with the clock -----
  var outShown = -1;
  function refresh() {
    var now = Date.now(), out = 0;
    for (var i = 0; i < cands.length; i++) {
      var o = cands[i], ms = o.place.at - now;
      o.time.textContent = G.clockStr(ms);
      var isOut = ms <= 0;
      if (isOut !== o.out) { o.out = isOut; o.el.classList.toggle('out', isOut); }
    }
    timed.forEach(function (c) {
      var isOut = c.place.at <= now;
      if (isOut) out++;
      if (isOut !== c.out) {
        c.out = isOut;
        c.els.forEach(function (el) { el.classList.toggle('out', isOut); });
        if (c.dot) c.dot.classList.toggle('out', isOut);
      }
    });
    if (out !== outShown) { outShown = out; $('outCount').textContent = out + ' of ' + timed.length; }
    var s = G.selected();
    $('chipTime').textContent = G.clockStr(s.at - now);
    updateTip();
  }
  function markSelection() {
    var s = G.selected();
    clist.forEach(function (c) {
      var isSel = !!c.place && s.cc === c.cc, isHome = !!c.place && G.home.cc === c.cc;
      c.els.forEach(function (el) { el.classList.toggle('sel', isSel); el.classList.toggle('home', isHome && !isSel); });
      if (c.dot) c.dot.classList.toggle('sel', isSel);
    });
    cands.forEach(function (o) { o.el.classList.toggle('sel', o.place === s); });
    $('chipFlag').textContent = G.flag(s.cc);
    $('chipName').textContent = s.custom ? 'Your time zone' : s.label;
    refresh();
    schedule();
  }
  G.on(function (type) { type === 'select' ? markSelection() : refresh(); });

  // ----- Go -----
  layout();
  svg.call(zoom);
  svg.call(zoom.transform, homeView());
  markSelection();
  $('mapLoading').remove();
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measure);
  measure();
  if ('ResizeObserver' in window) {
    var lastW = cw, lastH = ch;
    new ResizeObserver(function () {
      if (card.clientWidth === lastW && card.clientHeight === lastH) return;
      lastW = card.clientWidth; lastH = card.clientHeight;
      layout();
      svg.call(zoom.transform, constrain(T));
    }).observe(card);
  }
})();
