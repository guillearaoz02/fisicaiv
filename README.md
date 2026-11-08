# Física IV · ISPS N.º 6005 — sitio de estudio

Sitio web de la materia Física IV (Profesorado de Educación Secundaria en Física, ISPS N.º 6005, Salta).
Docente: Lic. Guillermo Aráoz.

## Contenido

| Página | Archivo |
|---|---|
| Inicio (con la aclaración sobre Giancoli, Eisberg y la teoría de la cátedra) | `index.html` |
| Reglamento | `reglamento.html` |
| Programa 2026 (con el Eje 0 · Ondas y cuerpo negro en el Eje 2) | `programa.html` |
| Teoría: índice + 7 ejes con laboratorios, simulaciones PhET y videos | `teoria.html`, `teoria-0-ondas.html` … `teoria-6-fisica-nuclear.html` |
| Ejercitación práctica (TP 0 a TP 5 + guía del seminario) | `ejercitacion.html` |
| Ejercicios resueltos | `resueltos.html` |
| Preparar el final | `final.html` |
| Banco de comentarios (muro + devoluciones) | `comentarios.html` |

## Publicar en Netlify

### Opción A · Rápida (arrastrar y soltar)
1. Entrá a https://app.netlify.com/drop (con tu cuenta de Netlify).
2. Arrastrá la carpeta **`dist`** (o la carpeta descomprimida de `fisica4-sitio-netlify.zip`).
3. Listo: Netlify te da una dirección `https://algo.netlify.app`. Podés cambiarle el nombre en *Site configuration → Change site name*.

Con esta opción todo funciona **excepto el muro público**: los mensajes del formulario llegan al panel de Netlify
(pestaña *Forms*; activá *Enable form detection* la primera vez) y, si querés, a tu mail (*Forms → Form notifications*).

### Opción B · Completa (con muro público de comentarios)
El muro guarda los mensajes con una función de Netlify, que solo se activa si el sitio se publica desde GitHub o con la CLI.
1. Subí **toda esta carpeta** (no solo `dist`) a un repositorio de GitHub.
2. En Netlify: *Add new project → Import an existing project → GitHub* → elegí el repositorio → *Deploy*. El archivo `netlify.toml` ya tiene toda la configuración.
3. En *Site configuration → Environment variables* creá `ADMIN_KEY` con una clave secreta y volvé a publicar (*Deploys → Trigger deploy*).
4. En la página del muro, el enlace “Acceso docente” pide esa clave y te habilita los botones para responder y borrar.

Cada vez que se actualice el repositorio, Netlify vuelve a publicar solo.

## Editar el contenido
- Las páginas están en `src/pages/*.html` (contenido) y se arman con `python3 build.py`, que genera `dist/`.
- Las fórmulas se escriben en LaTeX entre `$...$` (en línea) o `$$...$$` (destacadas). Se muestran con KaTeX, incluido en `assets/katex`.
- Atajos en las páginas:
  - Video de YouTube: `<x-video id="ID_DEL_VIDEO" t="Título" c="Canal"></x-video>`
  - Simulación PhET: `<x-sim slug="wave-on-a-string" t="Título" html5="1">Descripción</x-sim>` (`html5="1"` permite cargarla dentro de la página).
  - Recurso externo: `<x-ext href="https://..." t="Título" c="Fuente">Descripción</x-ext>`
- Estilos: `assets/css/estilo.css` (colores rojo y blanco al comienzo del archivo).
- Laboratorios interactivos: `assets/js/laboratorios.js`. Muro: `assets/js/muro.js` y `netlify/functions/comentarios.mjs`.
