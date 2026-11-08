// Muro de comentarios de Física IV (Netlify Functions + Netlify Blobs)
// GET    /api/comentarios                 → lista pública (más nuevos primero)
// GET    /api/comentarios?verificar=1     → con cabecera x-admin-key, confirma acceso docente
// POST   /api/comentarios                 → publica un comentario (aparece de inmediato)
// PATCH  /api/comentarios                 → (docente) responde un comentario {id, respuesta}
// DELETE /api/comentarios?id=...          → (docente) borra un comentario
// La clave docente se define en Netlify: Site configuration → Environment variables → ADMIN_KEY
import { getStore } from "@netlify/blobs";

const EJES = ["general", "0", "1", "2", "3", "4", "5", "6", "final"];
const TIPOS = ["duda", "comentario", "aporte"];
const json = (data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8", "cache-control": "no-store" } });

const limpiar = (s, max) => String(s ?? "").replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);

export default async (req, context) => {
  const store = getStore({ name: "muro-fisica4", consistency: "strong" });
  const url = new URL(req.url);
  const claveDocente = Netlify.env.get("ADMIN_KEY") || "";
  const esDocente = claveDocente && req.headers.get("x-admin-key") === claveDocente;

  try {
    if (req.method === "GET") {
      if (url.searchParams.has("verificar")) return json({ docente: Boolean(esDocente) }, esDocente ? 200 : 401);
      const { blobs } = await store.list({ prefix: "c/" });
      const items = (await Promise.all(blobs.map((b) => store.get(b.key, { type: "json" })))).filter(Boolean);
      items.sort((a, b) => (a.fecha < b.fecha ? 1 : -1));
      return json(items.slice(0, 400));
    }

    if (req.method === "POST") {
      const d = await req.json().catch(() => ({}));
      if (d.sitio) return json({ ok: true }); // trampa para robots
      const nombre = limpiar(d.nombre, 60);
      const texto = limpiar(d.texto, 2000);
      const eje = EJES.includes(String(d.eje)) ? String(d.eje) : "general";
      const tipo = TIPOS.includes(d.tipo) ? d.tipo : "comentario";
      if (nombre.length < 2) return json({ error: "Escribí tu nombre." }, 400);
      if (texto.length < 5) return json({ error: "El mensaje es demasiado corto." }, 400);

      // límite simple: un mensaje cada 20 s por dirección IP
      const ip = context.ip || "anon";
      const claveIp = "ip/" + ip.replace(/[^0-9a-fA-F:.]/g, "");
      const ultimo = await store.get(claveIp);
      if (ultimo && Date.now() - Number(ultimo) < 20000) return json({ error: "Esperá unos segundos antes de publicar otro mensaje." }, 429);
      await store.set(claveIp, String(Date.now()));

      const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
      const item = { id, nombre, texto, eje, tipo, fecha: new Date().toISOString(), respuesta: null };
      await store.setJSON("c/" + id, item);
      return json(item, 201);
    }

    if (req.method === "PATCH") {
      if (!esDocente) return json({ error: "Solo el docente puede responder." }, 401);
      const d = await req.json().catch(() => ({}));
      const id = limpiar(d.id, 40);
      const item = await store.get("c/" + id, { type: "json" });
      if (!item) return json({ error: "No existe ese comentario." }, 404);
      item.respuesta = limpiar(d.respuesta, 3000) || null;
      item.fechaRespuesta = item.respuesta ? new Date().toISOString() : null;
      await store.setJSON("c/" + id, item);
      return json(item);
    }

    if (req.method === "DELETE") {
      if (!esDocente) return json({ error: "Solo el docente puede borrar." }, 401);
      const id = limpiar(url.searchParams.get("id"), 40);
      await store.delete("c/" + id);
      return json({ ok: true });
    }

    return json({ error: "Método no permitido" }, 405);
  } catch (err) {
    return json({ error: "Error del servidor", detalle: String(err && err.message || err) }, 500);
  }
};

export const config = { path: "/api/comentarios" };
