// Física IV · ISPS 6005 — comportamiento general del sitio
(function () {
  // Menú en celulares
  var btn = document.querySelector('.menu-btn');
  var nav = document.querySelector('nav.principal');
  if (btn && nav) {
    btn.addEventListener('click', function () {
      var abierto = nav.classList.toggle('abierto');
      btn.setAttribute('aria-expanded', abierto ? 'true' : 'false');
    });
  }

  // Fórmulas con KaTeX ($...$ en línea y $$...$$ en bloque)
  function renderMath() {
    if (window.renderMathInElement) {
      renderMathInElement(document.body, {
        delimiters: [
          { left: '$$', right: '$$', display: true },
          { left: '\\[', right: '\\]', display: true },
          { left: '$', right: '$', display: false },
          { left: '\\(', right: '\\)', display: false }
        ],
        throwOnError: false,
        ignoredTags: ['script', 'noscript', 'style', 'textarea', 'pre', 'code', 'input']
      });
    }
  }
  window.renderMath = renderMath;
  if (document.readyState !== 'loading') renderMath();
  else document.addEventListener('DOMContentLoaded', renderMath);

  // Videos de YouTube livianos: se carga el reproductor solo al hacer clic
  document.querySelectorAll('.video .marco[data-yt]').forEach(function (marco) {
    var id = marco.getAttribute('data-yt');
    marco.style.backgroundImage = 'url(https://i.ytimg.com/vi/' + id + '/hqdefault.jpg)';
    function cargar() {
      if (marco.querySelector('iframe')) return;
      var f = document.createElement('iframe');
      f.src = 'https://www.youtube-nocookie.com/embed/' + id + '?autoplay=1&rel=0';
      f.title = marco.getAttribute('aria-label') || 'Video';
      f.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture';
      f.allowFullscreen = true;
      marco.innerHTML = '';
      marco.appendChild(f);
    }
    marco.addEventListener('click', cargar);
    marco.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); cargar(); } });
  });

  // Simulaciones PhET: se cargan dentro de la página solo cuando el estudiante lo pide
  document.querySelectorAll('[data-sim-src]').forEach(function (b) {
    b.addEventListener('click', function () {
      var caja = b.closest('.sim').querySelector('.ventana');
      caja.innerHTML = '';
      var f = document.createElement('iframe');
      f.src = b.getAttribute('data-sim-src');
      f.title = 'Simulación';
      f.allowFullscreen = true;
      caja.appendChild(f);
      b.disabled = true;
    });
  });
})();
