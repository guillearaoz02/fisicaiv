#!/usr/bin/env python3
"""Arma el sitio estático de Física IV (ISPS 6005) en la carpeta dist/.

Cada página vive en src/pages/*.html con una primera línea de metadatos:
<!--meta titulo="..." activo="teoria" descripcion="..." labs="1" muro="1"-->
Atajos disponibles dentro de las páginas:
  <x-video id="ID_YOUTUBE" t="Título" c="Canal"></x-video>
  <x-sim slug="wave-on-a-string" t="Título" html5="1">Descripción</x-sim>
  <x-ext href="https://..." t="Título" c="Fuente">Descripción</x-ext>
"""
import html, re, shutil
from pathlib import Path

RAIZ = Path(__file__).parent
DIST = RAIZ / "dist"

NAV = [
    ("index", "Inicio"), ("reglamento", "Reglamento"), ("programa", "Programa"),
    ("teoria", "Teoría"), ("ejercitacion", "Ejercitación"), ("resueltos", "Ejercicios resueltos"),
    ("final", "Preparar el final"), ("comentarios", "Banco de comentarios"),
]

LAYOUT = """<!DOCTYPE html>
<html lang="es-AR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{titulo_completo}</title>
<meta name="description" content="{descripcion}">
<meta name="author" content="Lic. Guillermo Aráoz">
<meta property="og:title" content="{titulo_completo}">
<meta property="og:description" content="{descripcion}">
<meta name="theme-color" content="#b3121f">
<link rel="icon" href="/assets/img/logo-isps6005.png">
<link rel="stylesheet" href="/assets/katex/katex.min.css">
<link rel="stylesheet" href="/assets/css/estilo.css">
</head>
<body>
<a class="saltar" href="#contenido">Saltar al contenido</a>
<header class="cabecera">
  <div class="fila">
    <a class="escudo" href="/" aria-label="Inicio"><img src="/assets/img/logo-isps6005.png" alt="Escudo del Instituto Superior del Profesorado de Salta N.º 6005"></a>
    <a class="marca" href="/"><strong>Física IV</strong><span>Profesorado de Educación Secundaria en Física · ISPS N.º 6005 · Docente: Lic. Guillermo Aráoz</span></a>
    <button class="menu-btn" aria-expanded="false" aria-controls="menu">Menú</button>
  </div>
</header>
<nav class="principal" id="menu" aria-label="Secciones">
  <ul>{nav}</ul>
</nav>
<main id="contenido">
{cuerpo}
</main>
<footer>
  <div class="franja"></div>
  <div class="fila">
    <div><strong>Física IV · ISPS N.º 6005</strong><br>Instituto Superior del Profesorado de Salta N.º 6005 · Av. Entre Ríos 1851, Salta.<br>Material de estudio elaborado por el Lic. Guillermo Aráoz para el cursado y la preparación del examen final.</div>
    <div><strong>Contacto</strong><br><a href="mailto:guille.araoz.espoz@gmail.com">guille.araoz.espoz@gmail.com</a><br>Consultas: en clase, por Classroom o a coordinar por mail.</div>
    <div><strong>Base teórica</strong><br>Giancoli, <em>Física para ciencias e ingeniería</em>, con complementos de Eisberg y apuntes de la cátedra.</div>
  </div>
</footer>
<script defer src="/assets/katex/katex.min.js"></script>
<script defer src="/assets/katex/auto-render.min.js"></script>
<script defer src="/assets/js/main.js"></script>
{extra}
</body>
</html>
"""


def video(m):
    a = attrs(m.group(1))
    vid, t, c = a.get("id"), a.get("t", "Video"), a.get("c", "")
    return (f'<div class="video"><div class="marco" data-yt="{vid}" role="button" tabindex="0" aria-label="Reproducir: {html.escape(t)}">'
            f'<button class="play" aria-hidden="true" tabindex="-1"></button></div>'
            f'<div class="texto"><strong>{t}</strong><small>{c} · <a href="https://www.youtube.com/watch?v={vid}" target="_blank" rel="noopener">ver en YouTube</a></small></div></div>')


def sim(m):
    a, desc = attrs(m.group(1)), m.group(2).strip()
    slug, t = a["slug"], a.get("t", a["slug"])
    pagina = f"https://phet.colorado.edu/es/simulations/{slug}"
    if a.get("html5") == "1":
        src = f"https://phet.colorado.edu/sims/html/{slug}/latest/{slug}_all.html?locale=es"
        return (f'<div class="sim"><span class="etiqueta">Simulación PhET</span><strong style="display:block">{t}</strong><p>{desc}</p>'
                f'<div class="ventana"><button class="btn" data-sim-src="{src}">Cargar aquí</button></div>'
                f'<div class="acciones"><a class="btn claro" href="{src}" target="_blank" rel="noopener">Pantalla completa</a></div></div>')
    return (f'<div class="sim"><span class="etiqueta">Simulación PhET</span><strong style="display:block">{t}</strong><p>{desc}</p>'
            f'<div class="acciones"><a class="btn" href="{pagina}" target="_blank" rel="noopener">Abrir en PhET</a></div>'
            f'<p><small>Se abre en el sitio de PhET (Universidad de Colorado) y corre en el navegador.</small></p></div>')


def ext(m):
    a, desc = attrs(m.group(1)), m.group(2).strip()
    return (f'<div class="sim"><span class="etiqueta gris">{a.get("c", "Recurso externo")}</span><strong style="display:block">{a["t"]}</strong><p>{desc}</p>'
            f'<div class="acciones"><a class="btn" href="{a["href"]}" target="_blank" rel="noopener">Abrir</a></div></div>')


def attrs(s):
    return dict(re.findall(r'(\w+)="([^"]*)"', s))


def construir():
    if DIST.exists():
        shutil.rmtree(DIST)
    DIST.mkdir()
    shutil.copytree(RAIZ / "assets", DIST / "assets")
    for archivo in sorted((RAIZ / "src/pages").glob("*.html")):
        texto = archivo.read_text(encoding="utf-8")
        meta_m = re.match(r"<!--meta(.*?)-->\s*", texto, re.S)
        meta = attrs(meta_m.group(1)) if meta_m else {}
        cuerpo = texto[meta_m.end():] if meta_m else texto
        cuerpo = re.sub(r"<x-video([^>]*)></x-video>", video, cuerpo)
        cuerpo = re.sub(r"<x-sim([^>]*)>(.*?)</x-sim>", sim, cuerpo, flags=re.S)
        cuerpo = re.sub(r"<x-ext([^>]*)>(.*?)</x-ext>", ext, cuerpo, flags=re.S)
        activo = meta.get("activo", archivo.stem)
        nav = "".join(
            f'<li><a href="{"/" if k == "index" else "/" + k + ".html"}"{" class=\"activo\" aria-current=\"page\"" if k == activo else ""}>{v}</a></li>'
            for k, v in NAV)
        extra = ""
        if meta.get("labs"):
            extra += '<script defer src="/assets/js/laboratorios.js"></script>\n'
        if meta.get("muro"):
            extra += '<script defer src="/assets/js/muro.js"></script>\n'
        titulo = meta.get("titulo", "Física IV")
        salida = LAYOUT.format(
            titulo_completo=(titulo + " · Física IV · ISPS 6005") if archivo.stem != "index" else "Física IV · ISPS 6005 · Lic. Guillermo Aráoz",
            descripcion=meta.get("descripcion", "Material de estudio de Física IV del Profesorado de Física del ISPS N.º 6005 (Salta)."),
            nav=nav, cuerpo=cuerpo, extra=extra)
        (DIST / archivo.name).write_text(salida, encoding="utf-8")
    # páginas especiales para Netlify
    (DIST / "_headers").write_text("/assets/*\n  Cache-Control: public, max-age=604800\n", encoding="utf-8")
    print("Sitio generado en", DIST)


if __name__ == "__main__":
    construir()
