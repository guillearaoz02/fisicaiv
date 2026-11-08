// Física IV · ISPS 6005 — laboratorios interactivos propios (sin dependencias)
(function () {
  var ROJO = '#b3121f', ROJO2 = '#e8b7bb', GRIS = '#5c5f66', TINTA = '#1f1f24';
  var hc = 1239.84; // eV·nm

  function $(sel, raiz) { return (raiz || document).querySelector(sel); }
  function fmt(x, d) {
    if (!isFinite(x)) return '—';
    var a = Math.abs(x);
    if (a !== 0 && (a < 1e-3 || a >= 1e5)) {
      var e = Math.floor(Math.log10(a)), m = x / Math.pow(10, e);
      return m.toFixed(d === undefined ? 2 : d).replace('.', ',') + '×10' + sup(e);
    }
    return x.toFixed(d === undefined ? 3 : d).replace('.', ',');
  }
  function sup(n) { var m = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' }; return String(n).split('').map(function (c) { return m[c]; }).join(''); }
  function lienzo(c) {
    var r = window.devicePixelRatio || 1, w = c.clientWidth, h = c.clientHeight || Math.round(w * 0.42);
    c.width = w * r; c.height = h * r; var x = c.getContext('2d'); x.setTransform(r, 0, 0, r, 0, 0);
    return { x: x, w: w, h: h };
  }
  function ejes(g, m, txtX, txtY) {
    var x = g.x; x.strokeStyle = '#c9ccd2'; x.lineWidth = 1; x.beginPath();
    x.moveTo(m, 8); x.lineTo(m, g.h - m); x.lineTo(g.w - 8, g.h - m); x.stroke();
    x.fillStyle = GRIS; x.font = '12px system-ui,sans-serif';
    if (txtX) { x.textAlign = 'right'; x.fillText(txtX, g.w - 10, g.h - m - 6); }
    if (txtY) { x.textAlign = 'left'; x.fillText(txtY, m + 6, 18); }
  }
  function dato(el, html) { el.innerHTML = html; }
  function onInputs(raiz, fn) { raiz.querySelectorAll('input,select').forEach(function (i) { i.addEventListener('input', fn); }); window.addEventListener('resize', fn); fn(); }
  function colorLambda(l) { // aproximación de color visible (nm)
    var r = 0, g = 0, b = 0;
    if (l >= 380 && l < 440) { r = -(l - 440) / 60; b = 1; } else if (l < 490) { g = (l - 440) / 50; b = 1; } else if (l < 510) { g = 1; b = -(l - 510) / 20; } else if (l < 580) { r = (l - 510) / 70; g = 1; } else if (l < 645) { r = 1; g = -(l - 645) / 65; } else if (l <= 750) { r = 1; } else return null;
    var f = l < 420 ? 0.3 + 0.7 * (l - 380) / 40 : l > 700 ? 0.3 + 0.7 * (750 - l) / 50 : 1;
    return 'rgb(' + Math.round(255 * r * f) + ',' + Math.round(255 * g * f) + ',' + Math.round(255 * b * f) + ')';
  }
  function region(l) { // l en nm
    if (l < 0.01) return 'rayos gamma'; if (l < 10) return 'rayos X'; if (l < 380) return 'ultravioleta'; if (l <= 750) return 'visible'; if (l < 1e6) return 'infrarrojo'; return 'microondas / radio';
  }

  // 0) Ondas estacionarias
  var lab0 = $('#lab-estacionarias');
  if (lab0) {
    var t0 = 0, raf0;
    function dib0() {
      var tipo = $('[name=tipo]', lab0).value, n = +$('[name=n]', lab0).value, L = +$('[name=L]', lab0).value, v = +$('[name=v]', lab0).value;
      $('.n-val', lab0).textContent = n;
      var lam, f, k;
      if (tipo === 'cuerda' || tipo === 'abierto') { lam = 2 * L / n; f = n * v / (2 * L); }
      else { lam = 4 * L / (2 * n - 1); f = (2 * n - 1) * v / (4 * L); }
      k = 2 * Math.PI / lam;
      dato($('.salida', lab0),
        '<div class="dato"><small>Armónico</small><b>' + (tipo === 'cerrado' ? (2 * n - 1) + '.º (solo impares)' : n + '.º') + '</b></div>' +
        '<div class="dato"><small>Longitud de onda λ</small><b>' + fmt(lam, 3) + ' m</b></div>' +
        '<div class="dato"><small>Frecuencia f</small><b>' + fmt(f, 1) + ' Hz</b></div>' +
        '<div class="dato"><small>Nodos (incluye extremos fijos)</small><b>' + (tipo === 'cuerda' ? n + 1 : tipo === 'abierto' ? n : n) + '</b></div>');
      var g = lienzo($('canvas', lab0)), x = g.x, m = 24, W = g.w - 2 * m, H = g.h, y0 = H / 2, A = H * 0.36;
      x.clearRect(0, 0, g.w, H);
      x.strokeStyle = '#d0d3d8'; x.beginPath(); x.moveTo(m, y0); x.lineTo(m + W, y0); x.stroke();
      function forma(xx) { // amplitud espacial
        if (tipo === 'cuerda') return Math.sin(k * xx);
        if (tipo === 'abierto') return Math.cos(k * xx); // desplazamiento: vientres en extremos abiertos
        return Math.sin(k * xx); // cerrado en x=0 (nodo), abierto en x=L (vientre)
      }
      x.strokeStyle = ROJO2; x.lineWidth = 1.5; [1, -1].forEach(function (s) { x.beginPath(); for (var i = 0; i <= 300; i++) { var xx = i / 300 * L; var yy = y0 - s * A * forma(xx); i ? x.lineTo(m + i / 300 * W, yy) : x.moveTo(m, yy); } x.stroke(); });
      var c = Math.cos(2 * Math.PI * t0);
      x.strokeStyle = ROJO; x.lineWidth = 3; x.beginPath(); for (var i = 0; i <= 300; i++) { var xx = i / 300 * L; var yy = y0 - A * forma(xx) * c; i ? x.lineTo(m + i / 300 * W, yy) : x.moveTo(m, yy); } x.stroke();
      x.fillStyle = TINTA; x.font = '12px system-ui'; x.textAlign = 'center';
      x.fillText(tipo === 'cuerda' ? 'extremo fijo' : tipo === 'abierto' ? 'abierto' : 'cerrado', m + 10, H - 6);
      x.fillText(tipo === 'cuerda' ? 'extremo fijo' : 'abierto', m + W - 10, H - 6);
      if (tipo !== 'cuerda') { x.fillStyle = GRIS; x.textAlign = 'left'; x.fillText('Gráfica: desplazamiento longitudinal del aire u(x)', m, 14); }
    }
    function anima0() { t0 += 0.012; dib0(); raf0 = requestAnimationFrame(anima0); }
    onInputs(lab0, dib0); anima0();
  }

  // 1) Relatividad
  var lab1 = $('#lab-relatividad');
  if (lab1) {
    onInputs(lab1, function () {
      var b = +$('[name=beta]', lab1).value / 1000, t0 = +$('[name=t0]', lab1).value, L0 = +$('[name=L0]', lab1).value;
      var g = 1 / Math.sqrt(1 - b * b);
      $('.b-val', lab1).textContent = b.toFixed(3).replace('.', ',');
      dato($('.salida', lab1),
        '<div class="dato"><small>Factor γ</small><b>' + fmt(g, 4) + '</b></div>' +
        '<div class="dato"><small>Tiempo medido en el lab Δt = γΔt₀</small><b>' + fmt(g * t0, 3) + ' μs</b></div>' +
        '<div class="dato"><small>Longitud medida L = L₀/γ</small><b>' + fmt(L0 / g, 3) + ' m</b></div>' +
        '<div class="dato"><small>K / (mc²) = γ − 1</small><b>' + fmt(g - 1, 4) + '</b></div>' +
        '<div class="dato"><small>K clásica / K relativista</small><b>' + fmt(0.5 * b * b / (g - 1 || 1e-12), 3) + '</b></div>');
      var c = lienzo($('canvas', lab1)), x = c.x, m = 34; x.clearRect(0, 0, c.w, c.h); ejes(c, m, 'v/c', 'γ');
      var W = c.w - m - 10, H = c.h - m - 10, gmax = 8;
      x.strokeStyle = ROJO; x.lineWidth = 2.5; x.beginPath();
      for (var i = 0; i <= 400; i++) { var bb = i / 400 * 0.992, gg = 1 / Math.sqrt(1 - bb * bb); var px = m + bb * W, py = c.h - m - (gg - 1) / (gmax - 1) * H; i ? x.lineTo(px, py) : x.moveTo(px, py); }
      x.stroke();
      var px = m + b * W, py = c.h - m - Math.min(g - 1, gmax - 1) / (gmax - 1) * H;
      x.fillStyle = TINTA; x.beginPath(); x.arc(px, py, 5, 0, 7); x.fill();
      x.font = '12px system-ui'; x.fillStyle = GRIS; x.textAlign = 'center';
      [0, .2, .4, .6, .8, 1].forEach(function (t) { x.fillText(String(t).replace('.', ','), m + t * W, c.h - m + 16); });
      x.textAlign = 'right'; [2, 4, 6, 8].forEach(function (gg) { var yy = c.h - m - (gg - 1) / (gmax - 1) * H; x.fillText(gg, m - 6, yy + 4); x.strokeStyle = '#eef0f3'; x.beginPath(); x.moveTo(m, yy); x.lineTo(c.w - 10, yy); x.stroke(); });
    });
  }

  // 2) Cuerpo negro (ley de Planck)
  var lab2 = $('#lab-cuerponegro');
  if (lab2) {
    onInputs(lab2, function () {
      var T = +$('[name=T]', lab2).value, comparar = $('[name=sol]', lab2).checked;
      $('.T-val', lab2).textContent = T;
      var h = 6.626e-34, c = 2.998e8, k = 1.381e-23;
      function I(lnm, TT) { var l = lnm * 1e-9; return 2 * h * c * c / Math.pow(l, 5) / (Math.exp(h * c / (l * k * TT)) - 1); }
      var lmax = 2.898e-3 / T * 1e9;
      dato($('.salida', lab2),
        '<div class="dato"><small>λ máx (Wien)</small><b>' + fmt(lmax, 0) + ' nm</b></div>' +
        '<div class="dato"><small>Región del pico</small><b>' + region(lmax) + '</b></div>' +
        '<div class="dato"><small>Potencia por unidad de área σT⁴</small><b>' + fmt(5.67e-8 * Math.pow(T, 4), 2) + ' W/m²</b></div>');
      var g = lienzo($('canvas', lab2)), x = g.x, m = 30; x.clearRect(0, 0, g.w, g.h);
      var W = g.w - m - 26, H = g.h - m - 14, lfin = 3000;
      for (var l = 380; l <= 750; l += 2) { var col = colorLambda(l); if (col) { x.fillStyle = col; x.globalAlpha = .22; x.fillRect(m + l / lfin * W, 8, 2 / lfin * W + 1, H); } }
      x.globalAlpha = 1; ejes(g, m, 'λ (nm)', 'Intensidad espectral (escala relativa)');
      var Tref = comparar ? Math.max(T, 5800) : T, ymax = I(2.898e-3 / Tref * 1e9, Tref);
      function curva(TT, color, ancho) { x.strokeStyle = color; x.lineWidth = ancho; x.beginPath(); for (var i = 1; i <= 500; i++) { var ll = i / 500 * lfin, yy = g.h - m - I(ll, TT) / ymax * H; yy = Math.max(yy, 4); i > 1 ? x.lineTo(m + ll / lfin * W, yy) : x.moveTo(m + ll / lfin * W, yy); } x.stroke(); }
      if (comparar) curva(5800, '#9aa0a6', 1.5);
      curva(T, ROJO, 2.8);
      x.fillStyle = GRIS; x.font = '12px system-ui'; x.textAlign = 'center';
      [0, 500, 1000, 1500, 2000, 2500, 3000].forEach(function (t) { x.fillText(t, m + t / lfin * W, g.h - m + 16); });
    });
  }

  // 3) Espectro del hidrógeno (Bohr)
  var lab3 = $('#lab-hidrogeno');
  if (lab3) {
    onInputs(lab3, function () {
      var ni = +$('[name=ni]', lab3).value, nf = +$('[name=nf]', lab3).value, Z = +$('[name=Z]', lab3).value;
      var aviso = $('.aviso-lab', lab3);
      if (ni === nf) { aviso.textContent = 'Elegí niveles distintos.'; return; }
      aviso.textContent = '';
      var Ei = -13.6 * Z * Z / (ni * ni), Ef = -13.6 * Z * Z / (nf * nf), dE = Ei - Ef, l = hc / Math.abs(dE);
      var series = { 1: 'Lyman', 2: 'Balmer', 3: 'Paschen', 4: 'Brackett', 5: 'Pfund' };
      var bajo = Math.min(ni, nf);
      dato($('.salida', lab3),
        '<div class="dato"><small>Proceso</small><b>' + (dE > 0 ? 'emisión' : 'absorción') + '</b></div>' +
        '<div class="dato"><small>Energía del fotón</small><b>' + fmt(Math.abs(dE), 3) + ' eV</b></div>' +
        '<div class="dato"><small>Longitud de onda</small><b>' + fmt(l, 1) + ' nm</b></div>' +
        '<div class="dato"><small>Región · serie</small><b>' + region(l) + ' · ' + (series[bajo] || '—') + '</b></div>');
      var g = lienzo($('canvas', lab3)), x = g.x; x.clearRect(0, 0, g.w, g.h);
      // diagrama de niveles a la izquierda
      var izq = Math.min(260, g.w * 0.42), H = g.h - 20, m = 10;
      // escala: E=0 arriba, E1 abajo
      function y(E) { return 10 + (E / (-13.6 * Z * Z)) * (H - 14); }
      x.font = '12px system-ui'; x.textAlign = 'left';
      for (var n = 1; n <= 7; n++) { var E = -13.6 * Z * Z / (n * n), yy = y(E); x.strokeStyle = (n === ni || n === nf) ? ROJO : '#c9ccd2'; x.lineWidth = (n === ni || n === nf) ? 2.5 : 1; x.beginPath(); x.moveTo(40, yy); x.lineTo(izq - 70, yy); x.stroke(); x.fillStyle = GRIS; var sel = (n === ni || n === nf); if (n <= 3 || sel) { var dy = (sel && n > 3 && n === Math.max(ni, nf) && Math.min(ni, nf) > 3) ? -8 : 4; x.fillStyle = sel ? ROJO : GRIS; x.fillText('n=' + n + '  ' + fmt(E, 2) + ' eV', izq - 66, yy + dy); } }
      x.strokeStyle = TINTA; x.lineWidth = 2; var ya = y(Ei), yb = y(Ef); x.beginPath(); x.moveTo(110, ya); x.lineTo(110, yb); x.stroke();
      x.beginPath(); var dir = yb > ya ? 1 : -1; x.moveTo(110, yb); x.lineTo(104, yb - 9 * dir); x.lineTo(116, yb - 9 * dir); x.closePath(); x.fillStyle = TINTA; x.fill();
      // banda del espectro visible con la línea
      var x0 = izq + 10, W = g.w - x0 - 10, yb0 = g.h / 2 - 20;
      for (var ll = 380; ll <= 750; ll++) { x.fillStyle = colorLambda(ll); x.globalAlpha = .35; x.fillRect(x0 + (ll - 380) / 370 * W, yb0, W / 370 + 1, 40); }
      x.globalAlpha = 1; x.fillStyle = GRIS; x.textAlign = 'center';
      [400, 500, 600, 700].forEach(function (t) { x.fillText(t + ' nm', x0 + (t - 380) / 370 * W, yb0 + 56); });
      if (l >= 380 && l <= 750) { x.fillStyle = colorLambda(l) || TINTA; x.fillRect(x0 + (l - 380) / 370 * W - 2, yb0 - 6, 4, 52); }
      else { x.fillStyle = TINTA; x.fillText('La línea cae fuera del visible (' + region(l) + ')', x0 + W / 2, yb0 - 12); }
    });
  }

  // 4) Partícula en una caja rígida
  var lab4 = $('#lab-caja');
  if (lab4) {
    onInputs(lab4, function () {
      var n = +$('[name=n]', lab4).value, L = +$('[name=L]', lab4).value, part = $('[name=part]', lab4).value;
      var mc2 = part === 'e' ? 0.511e6 : 938.27e6;
      $('.n-val', lab4).textContent = n;
      var E1 = hc * hc / (8 * mc2 * L * L), En = n * n * E1;
      var trans = n > 1 ? hc / (En - E1) : NaN;
      dato($('.salida', lab4),
        '<div class="dato"><small>E₁</small><b>' + fmt(E1, 4) + ' eV</b></div>' +
        '<div class="dato"><small>Eₙ = n²E₁</small><b>' + fmt(En, 4) + ' eV</b></div>' +
        '<div class="dato"><small>Nodos internos de ψₙ</small><b>' + (n - 1) + '</b></div>' +
        '<div class="dato"><small>Fotón n → 1</small><b>' + (n > 1 ? fmt(trans, 1) + ' nm (' + region(trans) + ')' : '—') + '</b></div>');
      var g = lienzo($('canvas', lab4)), x = g.x, m = 30, W = g.w - 2 * m, H = g.h; x.clearRect(0, 0, g.w, H);
      var y1 = H * 0.3, y2 = H * 0.78, A1 = H * 0.2, A2 = H * 0.36;
      x.fillStyle = '#eef0f3'; x.fillRect(0, 0, m, H); x.fillRect(m + W, 0, m, H);
      x.strokeStyle = TINTA; x.lineWidth = 2; x.beginPath(); x.moveTo(m, 0); x.lineTo(m, H); x.moveTo(m + W, 0); x.lineTo(m + W, H); x.stroke();
      x.strokeStyle = '#d0d3d8'; x.lineWidth = 1; x.beginPath(); x.moveTo(m, y1); x.lineTo(m + W, y1); x.moveTo(m, y2); x.lineTo(m + W, y2); x.stroke();
      x.strokeStyle = ROJO; x.lineWidth = 2.5; x.beginPath();
      for (var i = 0; i <= 400; i++) { var s = Math.sin(n * Math.PI * i / 400), px = m + i / 400 * W; i ? x.lineTo(px, y1 - A1 * s) : x.moveTo(px, y1); } x.stroke();
      x.fillStyle = 'rgba(179,18,31,.18)'; x.strokeStyle = ROJO; x.beginPath(); x.moveTo(m, y2);
      for (var j = 0; j <= 400; j++) { var s2 = Math.pow(Math.sin(n * Math.PI * j / 400), 2); x.lineTo(m + j / 400 * W, y2 - A2 * s2); } x.lineTo(m + W, y2); x.closePath(); x.fill(); x.stroke();
      x.fillStyle = GRIS; x.font = '12px system-ui'; x.textAlign = 'left'; x.fillText('ψₙ(x)', m + 6, 16); x.fillText('|ψₙ|² (densidad de probabilidad)', m + 6, y2 - A2 - 6);
      x.textAlign = 'center'; x.fillText('x = 0', m, H - 4); x.fillText('x = L', m + W, H - 4);
    });
  }

  // 5) Efecto túnel
  var lab5 = $('#lab-tunel');
  if (lab5) {
    onInputs(lab5, function () {
      var E = +$('[name=E]', lab5).value, U = +$('[name=U]', lab5).value, L = +$('[name=L]', lab5).value, part = $('[name=part]', lab5).value;
      var mc2 = part === 'e' ? 0.511e6 : 938.27e6, out = $('.salida', lab5);
      if (E >= U) { dato(out, '<div class="dato"><small>Atención</small><b>E ≥ U₀: la partícula pasa por arriba (la aproximación T ≈ e^(−2GL) no corresponde).</b></div>'); return; }
      var G = Math.sqrt(2 * mc2 * (U - E)) / 197.33, T = Math.exp(-2 * G * L), T2 = Math.exp(-4 * G * L);
      dato(out,
        '<div class="dato"><small>G</small><b>' + fmt(G, 3) + ' nm⁻¹</b></div>' +
        '<div class="dato"><small>2GL</small><b>' + fmt(2 * G * L, 3) + '</b></div>' +
        '<div class="dato"><small>Transmisión T ≈ e^(−2GL)</small><b>' + fmt(T, 2) + '</b></div>' +
        '<div class="dato"><small>Si el ancho se duplica</small><b>' + fmt(T2, 2) + ' (≈ T²)</b></div>');
      var g = lienzo($('canvas', lab5)), x = g.x, H = g.h, W = g.w; x.clearRect(0, 0, W, H);
      var a = W * 0.42, b = a + Math.min(W * 0.3, Math.max(14, L / 2 * W * 0.3)), base = H - 20, esc = (H - 40) / Math.max(U * 1.25, 0.1);
      x.fillStyle = '#eef0f3'; x.fillRect(a, base - U * esc, b - a, U * esc); x.strokeStyle = TINTA; x.strokeRect(a, base - U * esc, b - a, U * esc);
      x.strokeStyle = '#9aa0a6'; x.setLineDash([5, 4]); x.beginPath(); x.moveTo(0, base - E * esc); x.lineTo(W, base - E * esc); x.stroke(); x.setLineDash([]);
      var yE = base - E * esc, amp = Math.min(30, (H - 40) * 0.18), k = 0.12;
      x.strokeStyle = ROJO; x.lineWidth = 2.2; x.beginPath();
      for (var px = 0; px <= W; px++) {
        var yy;
        if (px < a) yy = yE - amp * Math.sin(k * (px - a) + Math.PI / 3);
        else if (px <= b) { var dec = Math.exp(-(px - a) / (b - a) * G * L); yy = yE - amp * Math.sin(Math.PI / 3) * dec; }
        else { var at = amp * Math.sin(Math.PI / 3) * Math.exp(-G * L); yy = yE - Math.max(at, 0.6) * Math.sin(k * (px - b) + Math.PI / 2); }
        px ? x.lineTo(px, yy) : x.moveTo(px, yy);
      } x.stroke();
      x.fillStyle = GRIS; x.font = '12px system-ui'; x.textAlign = 'left'; x.fillText('E = ' + E + ' eV', 6, yE - amp - 6); x.fillText('U₀ = ' + U + ' eV', a + 4, base - U * esc - 6);
    });
  }

  // 6) Configuración electrónica (regla de Madelung + excepciones comunes)
  var lab6 = $('#lab-config');
  if (lab6) {
    var simb = 'H He Li Be B C N O F Ne Na Mg Al Si P S Cl Ar K Ca Sc Ti V Cr Mn Fe Co Ni Cu Zn Ga Ge As Se Br Kr Rb Sr Y Zr Nb Mo Tc Ru Rh Pd Ag Cd In Sn Sb Te I Xe'.split(' ');
    var orden = [[1, 0], [2, 0], [2, 1], [3, 0], [3, 1], [4, 0], [3, 2], [4, 1], [5, 0], [4, 2], [5, 1]];
    var letra = 'spdf', exc = { 24: [[3, 2, 5], [4, 0, 1]], 29: [[3, 2, 10], [4, 0, 1]], 41: [[4, 2, 4], [5, 0, 1]], 42: [[4, 2, 5], [5, 0, 1]], 44: [[4, 2, 7], [5, 0, 1]], 45: [[4, 2, 8], [5, 0, 1]], 46: [[4, 2, 10], [5, 0, 0]], 47: [[4, 2, 10], [5, 0, 1]] };
    onInputs(lab6, function () {
      var Z = Math.max(1, Math.min(54, Math.round(+$('[name=Z]', lab6).value || 1)));
      var occ = [], rest = Z;
      orden.forEach(function (o) { var cap = 2 * (2 * o[1] + 1), q = Math.min(cap, rest); occ.push([o[0], o[1], q]); rest -= q; });
      if (exc[Z]) exc[Z].forEach(function (e) { occ.forEach(function (o) { if (o[0] === e[0] && o[1] === e[1]) o[2] = e[2]; }); });
      occ = occ.filter(function (o) { return o[2] > 0; });
      var txt = occ.map(function (o) { return o[0] + letra[o[1]] + '<sup>' + o[2] + '</sup>'; }).join(' ');
      // último electrón agregado según el orden de llenado
      var ult = occ[occ.length - 1], l = ult[1], q = ult[2], cap = 2 * (2 * l + 1), mitad = cap / 2;
      var ml = q <= mitad ? (l - (q - 1)) : (l - (q - mitad - 1)), ms = q <= mitad ? '+1/2' : '−1/2';
      dato($('.salida', lab6),
        '<div class="dato" style="grid-column:1/-1"><small>' + simb[Z - 1] + ' (Z = ' + Z + ')' + (exc[Z] ? ' · excepción a la regla de llenado' : '') + '</small><b>' + txt + '</b></div>' +
        '<div class="dato"><small>Último subnivel ocupado</small><b>' + ult[0] + letra[l] + ' (' + q + ' de ' + cap + ')</b></div>' +
        '<div class="dato"><small>Números cuánticos (n, l, mₗ, mₛ) del último electrón (convención de Hund)</small><b>(' + ult[0] + ', ' + l + ', ' + ml + ', ' + ms + ')</b></div>');
    });
  }

  // 7) Decaimiento radiactivo
  var lab7 = $('#lab-decaimiento');
  if (lab7) {
    var nucleos = [], t = 0, hist = [], corriendo = false, raf7;
    function reiniciar() {
      var N0 = +$('[name=N0]', lab7).value; nucleos = []; for (var i = 0; i < N0; i++) nucleos.push(1); t = 0; hist = [[0, N0]]; dibujar();
    }
    function paso() {
      var Th = +$('[name=Th]', lab7).value, dt = Th / 40, p = 1 - Math.pow(0.5, dt / Th), N = 0;
      for (var i = 0; i < nucleos.length; i++) { if (nucleos[i] && Math.random() < p) nucleos[i] = 0; N += nucleos[i]; }
      t += dt; hist.push([t, N]); dibujar();
      if (t < 5 * Th && corriendo) raf7 = setTimeout(paso, 45); else { corriendo = false; $('.btn-iniciar', lab7).textContent = 'Iniciar'; }
    }
    function dibujar() {
      var Th = +$('[name=Th]', lab7).value, N0 = nucleos.length, N = hist[hist.length - 1][1];
      $('.salida', lab7).innerHTML = '<div class="dato"><small>Tiempo</small><b>' + fmt(t, 1) + ' s = ' + fmt(t / Th, 2) + ' T½</b></div><div class="dato"><small>Núcleos sin decaer</small><b>' + N + ' de ' + N0 + '</b></div><div class="dato"><small>Predicción N₀e^(−λt)</small><b>' + fmt(N0 * Math.pow(0.5, t / Th), 1) + '</b></div>';
      var g = lienzo($('canvas', lab7)), x = g.x; x.clearRect(0, 0, g.w, g.h);
      var lado = Math.min(g.h - 10, g.w * 0.4), cols = Math.ceil(Math.sqrt(N0)), cel = lado / cols;
      for (var i = 0; i < N0; i++) { x.fillStyle = nucleos[i] ? ROJO : '#d7dade'; x.beginPath(); x.arc(5 + (i % cols + .5) * cel, 5 + (Math.floor(i / cols) + .5) * cel, cel * 0.38, 0, 7); x.fill(); }
      var x0 = lado + 40, W = g.w - x0 - 10, H = g.h - 40;
      x.strokeStyle = '#c9ccd2'; x.beginPath(); x.moveTo(x0, 6); x.lineTo(x0, 6 + H); x.lineTo(x0 + W, 6 + H); x.stroke();
      x.strokeStyle = '#9aa0a6'; x.setLineDash([4, 4]); x.beginPath(); for (var k = 0; k <= 100; k++) { var tt = k / 100 * 5 * Th, yy = 6 + H - Math.pow(.5, tt / Th) * H; k ? x.lineTo(x0 + k / 100 * W, yy) : x.moveTo(x0, yy); } x.stroke(); x.setLineDash([]);
      x.strokeStyle = ROJO; x.lineWidth = 2.2; x.beginPath(); hist.forEach(function (p, j) { var px = x0 + p[0] / (5 * Th) * W, py = 6 + H - p[1] / N0 * H; j ? x.lineTo(px, py) : x.moveTo(px, py); }); x.stroke(); x.lineWidth = 1;
      x.fillStyle = GRIS; x.font = '12px system-ui'; x.textAlign = 'center'; for (var s = 0; s <= 5; s++) x.fillText(s + ' T½', x0 + s / 5 * W, g.h - 14);
    }
    $('.btn-iniciar', lab7).addEventListener('click', function () {
      if (corriendo) { corriendo = false; clearTimeout(raf7); this.textContent = 'Seguir'; return; }
      var Th = +$('[name=Th]', lab7).value; if (t >= 5 * Th) reiniciar();
      corriendo = true; this.textContent = 'Pausa'; paso();
    });
    $('.btn-reiniciar', lab7).addEventListener('click', function () { corriendo = false; clearTimeout(raf7); $('.btn-iniciar', lab7).textContent = 'Iniciar'; reiniciar(); });
    lab7.querySelectorAll('input').forEach(function (i) { i.addEventListener('change', function () { corriendo = false; clearTimeout(raf7); $('.btn-iniciar', lab7).textContent = 'Iniciar'; reiniciar(); }); });
    window.addEventListener('resize', dibujar);
    reiniciar();
  }
})();
