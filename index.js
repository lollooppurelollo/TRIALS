// index.js
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- Supabase -------------------- */
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY, // service_role in ambiente server
);

/* -------------------- Middleware -------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

/* -------------------- Helpers -------------------- */
function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}
function toBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}

/** Normalizza il payload che arriva dal form della timeline (solo campi “a giorni”). */
function sanitizeEvent(body, studyId) {
  const one_shot = toBool(body.one_shot);

  return {
    study_id: studyId,
    event_type: body.event_type || "custom",
    title: (body.title ?? "").trim() || null,
    notes: (body.notes ?? "").trim() || null,
    indications: (body.indications ?? "").trim() || null,

    one_shot,

    // campi a giorni
    at_day: one_shot ? toIntOrNull(body.at_day) : null,
    repeat_every_days: !one_shot ? toIntOrNull(body.repeat_every_days) : null,
    start_day: !one_shot ? toIntOrNull(body.start_day) : null,
    stop_day: !one_shot ? toIntOrNull(body.stop_day) : null,

    // finestre (nuove) + compat legacy
    window_before_days: toIntOrNull(body.window_before_days),
    window_after_days: toIntOrNull(body.window_after_days),
    window_days: toIntOrNull(body.window_days), // legacy; il nuovo form lo manda null
  };
}

/* -------------------- Pagine (EJS) -------------------- */
app.get("/", (_req, res) => res.render("patient"));
app.get("/trial", (_req, res) => res.render("trial"));
app.get("/trials", (_req, res) => res.render("trial"));
app.get("/timeline", (req, res) => {
  const studyId = req.query.study_id || "";
  res.render("timeline", { studyId });
});

/* -------------------- API STUDIES -------------------- */
app.get("/api/studies", async (_req, res) => {
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Errore GET /api/studies:", error);
    return res.status(500).send("Errore recupero studi");
  }
  res.json(data || []);
});

app.post("/api/studies", async (req, res) => {
  const { data, error } = await supabase
    .from("studies")
    .insert([req.body])
    .select();

  if (error) {
    console.error("Errore POST /api/studies:", error);
    return res.status(500).send("Errore creazione studio");
  }
  res.json(data?.[0] || null);
});

app.delete("/api/studies/:id", async (req, res) => {
  const { error } = await supabase
    .from("studies")
    .delete()
    .eq("id", req.params.id);

  if (error) {
    console.error("Errore DELETE /api/studies:", error);
    return res.status(500).send("Errore eliminazione studio");
  }
  res.sendStatus(204);
});

// Leggi uno studio (serve cycle_weeks). Se non esiste → 404 (gestito dal frontend)
app.get("/api/studies/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .eq("id", req.params.id)
    .single();

  if (error) {
    // PGRST116 = no rows returned (PostgREST/Supabase)
    if (error.code === "PGRST116") return res.status(404).send("Not found");
    console.error("Errore GET /api/studies/:id:", error);
    return res.status(500).send("Errore recupero studio");
  }
  res.json(data || null);
});

// Assicurati in alto nel file: app.use(express.json()); (una sola volta)

// PATCH: aggiorna solo le settimane per ciclo se lo studio ESISTE
app.patch("/api/studies/:id", async (req, res) => {
  try {
    const id = req.params.id;

    // usa la tua helper se esiste, altrimenti parseInt
    const cycle_weeks =
      typeof toIntOrNull === "function"
        ? toIntOrNull(req.body.cycle_weeks)
        : Number.parseInt(req.body.cycle_weeks, 10);

    // validazione (range 1–12, modifica se vuoi)
    if (!Number.isInteger(cycle_weeks) || cycle_weeks < 1 || cycle_weeks > 12) {
      return res.status(400).json({ error: "cycle_weeks non valido" });
    }

    // 1) verifica che lo studio esista
    const { data: existing, error: selErr } = await supabase
      .from("studies")
      .select("id")
      .eq("id", id)
      .single();

    if (selErr || !existing) {
      return res.status(404).json({ error: "Studio non trovato" });
    }

    // 2) UPDATE pulito (niente upsert → evita errore su title NOT NULL)
    const { error: updErr } = await supabase
      .from("studies")
      .update({ cycle_weeks })
      .eq("id", id);

    if (updErr) {
      console.error("Supabase UPDATE error:", updErr);
      return res.status(400).json({ error: updErr.message });
    }

    return res.status(200).json({ ok: true, cycle_weeks });
  } catch (e) {
    console.error("PATCH /api/studies/:id exception:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
});

/* -------------------- API TIMELINE -------------------- */
app.get("/api/timeline/:studyId", async (req, res) => {
  const { data, error } = await supabase
    .from("study_events")
    .select("*")
    .eq("study_id", req.params.studyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Errore GET /api/timeline:", error);
    return res.status(500).send("Errore recupero eventi");
  }
  res.json(data || []);
});

app.post("/api/timeline/:studyId", async (req, res) => {
  const event = sanitizeEvent(req.body, req.params.studyId);

  const { data, error } = await supabase
    .from("study_events")
    .insert([event])
    .select();

  if (error) {
    console.error("Errore POST /api/timeline:", {
      message: error.message,
      details: error.details,
      hint: error.hint,
      code: error.code,
      payload: event,
    });
    return res.status(500).send("Errore creazione evento");
  }
  res.json(data?.[0] || null);
});

app.delete("/api/timeline/:eventId", async (req, res) => {
  const { error } = await supabase
    .from("study_events")
    .delete()
    .eq("id", req.params.eventId);

  if (error) {
    console.error("Errore DELETE /api/timeline:", error);
    return res.status(500).send("Errore eliminazione evento");
  }
  res.sendStatus(204);
});

/* -------------------- Health & diagnostica -------------------- */
app.get("/health", (_req, res) => res.json({ ok: true }));

app.get("/__routes", (_req, res) => {
  const routes = [];
  app._router.stack.forEach((m) => {
    if (m.route && m.route.path) {
      const methods = Object.keys(m.route.methods).join(",").toUpperCase();
      routes.push(`${methods}  ${m.route.path}`);
    }
  });
  res.type("text").send(routes.sort().join("\n"));
});

/* -------------------- Start -------------------- */
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
  console.log(
    "Rotte disponibili (GET): /, /trial, /trials, /timeline?study_id=..., /health",
  );
});
