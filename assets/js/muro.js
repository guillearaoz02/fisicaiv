// Muro de dudas y comentarios — Física IV · ISPS 6005
(function () {
  var API = '/api/comentarios';
  var lista = document.getElementById('muro-lista');
  var estado = document.getElementById('muro-estado');
  var form = document.getElementById('muro-form');
  if (!lista || !form) return;
  var EJES = { general: 'General', '0': 'Eje 0 · Ondas', '1': 'Eje 1 · Relatividad', '2': 'Eje 2 · Fotones y Bohr', '3': 'Eje 3 · Ondas de materia', '4': 'Eje 4 · Mecánica cuántica', '5': 'Eje 5 · Átomos', '6': 'Eje 6 · Nuclear', final: 'Examen final' };
  var TIPOS = { duda: 'Duda', comentario: 'Comentario', aporte: 'Aporte / recurso' };
  var datos = [], filtro = 'todos', modoRespaldo = false;
  var clave = sessionStorage.getItem('muro-docente') || '';

  function el(tag, cls, txt) { var e = document.createElement(tag); if (cls) e.className = cls; if (txt !== undefined) e.textContent = txt; return e; }
  function fecha(iso) { try { return new Date(iso).toLocaleString('es-AR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch (e) { return iso; } }

  function pintar() {
    lista.innerHTML = '';
    var visibles = datos.filter(function (c) { return filtro === 'todos' || c.eje === filtro || (filtro === 'sin' && !c.respuesta && c.tipo === 'duda'); });
    if (!visibles.length) { lista.appendChild(el('p', 'estado', 'Todavía no hay mensajes en esta categoría. ¡Escribí el primero!')); return; }
    visibles.forEach(function (c) {
      var art = el('article', 'comentario');
      var meta = el('div', 'meta');
      meta.appendChild(el('strong', '', c.nombre));
      meta.appendChild(el('span', 'etiqueta', TIPOS[c.tipo] || c.tipo));
      meta.appendChild(el('span', 'etiqueta gris', EJES[c.eje] || c.eje));
      meta.appendChild(el('span', '', fecha(c.fecha)));
      art.appendChild(meta);
      art.appendChild(el('div', 'texto', c.texto));
      if (c.respuesta) {
        var r = el('div', 'respuesta'); r.appendChild(el('b', '', 'Respuesta del docente: ')); r.appendChild(document.createTextNode(c.respuesta)); art.appendChild(r);
      }
      if (clave) {
        var adm = el('div', 'admin');
        var bR = el('button', 'btn claro', c.respuesta ? 'Editar respuesta' : 'Responder');
        bR.onclick = function () { var t = prompt('Respuesta para ' + c.nombre + ':', c.respuesta || ''); if (t === null) return; enviar('PATCH', { id: c.id, respuesta: t }); };
        var bB = el('button', 'btn claro', 'Borrar');
        bB.onclick = function () { if (confirm('¿Borrar este mensaje?')) enviar('DELETE', null, '?id=' + encodeURIComponent(c.id)); };
        adm.appendChild(bR); adm.appendChild(bB); art.appendChild(adm);
      }
      lista.appendChild(art);
    });
    if (window.renderMath) window.renderMath();
  }

  function enviar(metodo, cuerpo, qs) {
    return fetch(API + (qs || ''), { method: metodo, headers: { 'content-type': 'application/json', 'x-admin-key': clave }, body: cuerpo ? JSON.stringify(cuerpo) : undefined })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'Error'); return j; }); })
      .then(cargar).catch(function (e) { alert(e.message); });
  }

  function respaldo() {
    modoRespaldo = true;
    estado.textContent = 'El muro público no está disponible en este momento. Igual podés enviar tu mensaje: le llega directamente al docente.';
    lista.innerHTML = '';
  }

  function cargar() {
    estado.textContent = 'Cargando mensajes…';
    return fetch(API, { headers: { accept: 'application/json' } })
      .then(function (r) { if (!r.ok || (r.headers.get('content-type') || '').indexOf('json') < 0) throw new Error('sin API'); return r.json(); })
      .then(function (j) { datos = j; estado.textContent = datos.length + ' mensaje' + (datos.length === 1 ? '' : 's') + ' en el muro.'; pintar(); })
      .catch(respaldo);
  }

  document.querySelectorAll('.filtros .chip').forEach(function (b) {
    b.addEventListener('click', function () {
      document.querySelectorAll('.filtros .chip').forEach(function (x) { x.classList.remove('activo'); });
      b.classList.add('activo'); filtro = b.getAttribute('data-f'); pintar();
    });
  });

  form.addEventListener('submit', function (ev) {
    ev.preventDefault();
    var fd = new FormData(form), boton = form.querySelector('button[type=submit]');
    boton.disabled = true;
    var fin = function () { boton.disabled = false; };
    if (modoRespaldo) { // Netlify Forms: el mensaje llega al panel del sitio y al mail del docente
      fd.set('form-name', 'muro-respaldo');
      fetch('/', { method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body: new URLSearchParams(fd).toString() })
        .then(function () { form.reset(); estado.textContent = '¡Gracias! Tu mensaje le llegó al docente.'; }).catch(function () { alert('No se pudo enviar. Probá más tarde.'); }).finally(fin);
      return;
    }
    var cuerpo = { nombre: fd.get('nombre'), eje: fd.get('eje'), tipo: fd.get('tipo'), texto: fd.get('texto'), sitio: fd.get('sitio') };
    fetch(API, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(cuerpo) })
      .then(function (r) { return r.json().then(function (j) { if (!r.ok) throw new Error(j.error || 'No se pudo publicar.'); return j; }); })
      .then(function () { form.querySelector('[name=texto]').value = ''; return cargar(); })
      .catch(function (e) { alert(e.message); }).finally(fin);
  });

  var acceso = document.getElementById('muro-acceso');
  if (acceso) acceso.addEventListener('click', function (e) {
    e.preventDefault();
    if (clave) { clave = ''; sessionStorage.removeItem('muro-docente'); acceso.textContent = 'Acceso docente'; pintar(); return; }
    var k = prompt('Clave docente:'); if (!k) return;
    fetch(API + '?verificar=1', { headers: { 'x-admin-key': k } }).then(function (r) {
      if (!r.ok) throw new Error('Clave incorrecta');
      clave = k; sessionStorage.setItem('muro-docente', k); acceso.textContent = 'Salir del modo docente'; pintar();
    }).catch(function (e) { alert(e.message); });
  });
  if (clave && acceso) acceso.textContent = 'Salir del modo docente';

  cargar();
})();
