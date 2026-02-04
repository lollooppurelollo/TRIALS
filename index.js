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
function toBillingOrNull(v) {
  const s = String(v ?? "")
    .trim()
    .toUpperCase();
  if (s === "SSN") return "SSN";
  if (s === "SP") return "SP";
  return null;
}
function toStrOrNull(v) {
  const s = String(v ?? "").trim();
  return s.length ? s : null;
}

/** Normalizza il payload che arriva dal form della timeline (solo campi “a giorni”). */
function sanitizeEvent(body, studyId) {
  const one_shot = toBool(body.one_shot);

  return {
    study_id: studyId,
    event_type: body.event_type || "custom",
    title: toStrOrNull(body.title),
    notes: toStrOrNull(body.notes),
    indications: toStrOrNull(body.indications),

    billing: toBillingOrNull(body.billing),

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

    const cycle_weeks = toIntOrNull(req.body.cycle_weeks);
    const total_weeks = toIntOrNull(req.body.total_weeks);

    // deve arrivare almeno uno dei due
    if (cycle_weeks === null && total_weeks === null) {
      return res.status(400).json({ error: "Niente da aggiornare" });
    }

    // validazioni
    if (
      cycle_weeks !== null &&
      (!Number.isInteger(cycle_weeks) || cycle_weeks < 1 || cycle_weeks > 12)
    ) {
      return res.status(400).json({ error: "cycle_weeks non valido" });
    }
    if (
      total_weeks !== null &&
      (!Number.isInteger(total_weeks) || total_weeks < 4 || total_weeks > 104)
    ) {
      return res.status(400).json({ error: "total_weeks non valido" });
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

    // 2) update solo dei campi presenti
    const patch = {};
    if (cycle_weeks !== null) patch.cycle_weeks = cycle_weeks;
    if (total_weeks !== null) patch.total_weeks = total_weeks;

    const { data, error: updErr } = await supabase
      .from("studies")
      .update(patch)
      .eq("id", id)
      .select("cycle_weeks,total_weeks")
      .single();

    if (updErr) {
      console.error("Supabase UPDATE error:", updErr);
      return res.status(400).json({ error: updErr.message });
    }

    // ritorna i valori aggiornati
    return res.status(200).json(data);
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
// PATCH: aggiorna un evento esistente (niente più DELETE+POST)
app.patch("/api/timeline/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;

    // Costruiamo patch solo con campi permessi
    const patch = {
      event_type: req.body.event_type ?? undefined,
      title: toStrOrNull(req.body.title),
      notes: toStrOrNull(req.body.notes),
      indications: toStrOrNull(req.body.indications),
      billing: toBillingOrNull(req.body.billing),

      one_shot:
        req.body.one_shot != null ? toBool(req.body.one_shot) : undefined,

      at_day:
        req.body.at_day != null ? toIntOrNull(req.body.at_day) : undefined,
      repeat_every_days:
        req.body.repeat_every_days != null
          ? toIntOrNull(req.body.repeat_every_days)
          : undefined,
      start_day:
        req.body.start_day != null
          ? toIntOrNull(req.body.start_day)
          : undefined,
      stop_day:
        req.body.stop_day != null ? toIntOrNull(req.body.stop_day) : undefined,

      window_before_days:
        req.body.window_before_days != null
          ? toIntOrNull(req.body.window_before_days)
          : undefined,
      window_after_days:
        req.body.window_after_days != null
          ? toIntOrNull(req.body.window_after_days)
          : undefined,
      window_days:
        req.body.window_days != null
          ? toIntOrNull(req.body.window_days)
          : undefined,
    };

    // Rimuovi undefined (Supabase update non deve riceverli)
    Object.keys(patch).forEach(
      (k) => patch[k] === undefined && delete patch[k],
    );

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "Niente da aggiornare" });
    }

    const { data, error } = await supabase
      .from("study_events")
      .update(patch)
      .eq("id", eventId)
      .select("*")
      .single();

    if (error) {
      console.error("Errore PATCH /api/timeline/:eventId:", error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json(data);
  } catch (e) {
    console.error("PATCH /api/timeline/:eventId exception:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
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

/* -------------------- API TIMELINE OVERRIDES -------------------- */

// Lista override per studio
app.get("/api/timeline-overrides/:studyId", async (req, res) => {
  const { data, error } = await supabase
    .from("study_event_overrides")
    .select("*")
    .eq("study_id", req.params.studyId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Errore GET /api/timeline-overrides:", error);
    return res.status(500).send("Errore recupero overrides");
  }
  res.json(data || []);
});

// Crea o aggiorna override per (event_id, day_index)
app.post("/api/timeline-overrides/:studyId", async (req, res) => {
  try {
    const studyId = req.params.studyId;

    const event_id = req.body.event_id;
    const day_index = toIntOrNull(req.body.day_index);

    if (!event_id) return res.status(400).json({ error: "event_id mancante" });
    if (!Number.isInteger(day_index) || day_index < 0) {
      return res.status(400).json({ error: "day_index non valido" });
    }

    // campi overridabili: tutti opzionali
    const patch = {
      study_id: studyId,
      event_id,
      day_index,
      billing: toBillingOrNull(req.body.billing),
      title: toStrOrNull(req.body.title),
      notes: toStrOrNull(req.body.notes),
      indications: toStrOrNull(req.body.indications),
    };

    // Se tutti null (nessun override reale) → meglio rifiutare
    const hasSomething =
      patch.billing !== null ||
      patch.title !== null ||
      patch.notes !== null ||
      patch.indications !== null;

    if (!hasSomething) {
      return res
        .status(400)
        .json({ error: "Override vuoto: niente da salvare" });
    }

    // UPSERT su (event_id, day_index)
    const { data, error } = await supabase
      .from("study_event_overrides")
      .upsert([patch], { onConflict: "event_id,day_index" })
      .select("*")
      .single();

    if (error) {
      console.error("Errore POST /api/timeline-overrides:", error);
      return res.status(400).json({ error: error.message });
    }

    res.status(200).json(data);
  } catch (e) {
    console.error("POST /api/timeline-overrides exception:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
});

// Cancella override per id
app.delete("/api/timeline-overrides/:overrideId", async (req, res) => {
  const { error } = await supabase
    .from("study_event_overrides")
    .delete()
    .eq("id", req.params.overrideId);

  if (error) {
    console.error("Errore DELETE /api/timeline-overrides:", error);
    return res.status(500).send("Errore eliminazione override");
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
