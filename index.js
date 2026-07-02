// index.js
import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const { Pool } = pkg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

/* -------------------- PostgreSQL -------------------- */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

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

/** Normalizza il payload che arriva dal form della timeline (solo campi "a giorni"). */
function sanitizeEvent(body, studyId) {
  const one_shot = toBool(body.one_shot);

  // arm_codes: se non arriva nulla → ALL
  let arm_codes = ["ALL"];
  if (Array.isArray(body.arm_codes) && body.arm_codes.length > 0) {
    arm_codes = body.arm_codes;
  }

  return {
    study_id: studyId,
    event_type: body.event_type || "custom",
    title: toStrOrNull(body.title),
    notes: toStrOrNull(body.notes),
    indications: toStrOrNull(body.indications),

    billing: toBillingOrNull(body.billing),

    arm_codes,

    one_shot,

    at_day: one_shot ? toIntOrNull(body.at_day) : null,
    repeat_every_days: !one_shot ? toIntOrNull(body.repeat_every_days) : null,
    start_day: !one_shot ? toIntOrNull(body.start_day) : null,
    stop_day: !one_shot ? toIntOrNull(body.stop_day) : null,

    window_before_days: toIntOrNull(body.window_before_days),
    window_after_days: toIntOrNull(body.window_after_days),
    window_days: toIntOrNull(body.window_days),
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
  try {
    const { rows } = await pool.query(
      "SELECT * FROM studies ORDER BY created_at ASC",
    );
    res.json(rows || []);
  } catch (error) {
    console.error("Errore GET /api/studies:", error);
    res.status(500).send("Errore recupero studi");
  }
});

app.post("/api/studies", async (req, res) => {
  const client = await pool.connect();
  try {
    const { arms, ...studyData } = req.body;

    await client.query("BEGIN");

    // 1) Crea studio
    const columns = Object.keys(studyData);
    const values = Object.values(studyData);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const insertStudySQL = columns.length
      ? `INSERT INTO studies (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`
      : `INSERT INTO studies DEFAULT VALUES RETURNING *`;

    const { rows } = await client.query(insertStudySQL, values);
    const study = rows[0];

    // 2) Se sono stati inviati bracci → inseriscili
    if (Array.isArray(arms) && arms.length > 0) {
      for (let i = 0; i < arms.length; i++) {
        const a = arms[i];
        await client.query(
          `INSERT INTO study_arms (study_id, arm_code, arm_label, sort_order) VALUES ($1, $2, $3, $4)`,
          [study.id, a.arm_code, a.arm_label, i + 1],
        );
      }
    }

    await client.query("COMMIT");
    res.json(study);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("POST /api/studies exception:", e);
    res.status(500).send("Errore creazione studio");
  } finally {
    client.release();
  }
});

app.delete("/api/studies/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM studies WHERE id = $1", [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Errore DELETE /api/studies:", error);
    res.status(500).send("Errore eliminazione studio");
  }
});

// Leggi uno studio (serve cycle_weeks). Se non esiste → 404 (gestito dal frontend)
app.get("/api/studies/:id", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM studies WHERE id = $1", [
      req.params.id,
    ]);
    if (rows.length === 0) return res.status(404).send("Not found");
    res.json(rows[0]);
  } catch (error) {
    console.error("Errore GET /api/studies/:id:", error);
    res.status(500).send("Errore recupero studio");
  }
});

// Lista bracci di uno studio
app.get("/api/studies/:id/arms", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM study_arms WHERE study_id = $1 ORDER BY sort_order ASC",
      [req.params.id],
    );
    res.json(rows || []);
  } catch (error) {
    console.error("Errore GET /api/studies/:id/arms:", error);
    res.status(500).send("Errore recupero bracci");
  }
});

// PATCH: aggiorna solo le settimane per ciclo se lo studio ESISTE
app.patch("/api/studies/:id", async (req, res) => {
  try {
    const id = req.params.id;

    const cycle_weeks = toIntOrNull(req.body.cycle_weeks);
    const total_weeks = toIntOrNull(req.body.total_weeks);
    const cost_center = toStrOrNull(req.body.cost_center);
    // deve arrivare almeno uno dei due
    if (cycle_weeks === null && total_weeks === null && cost_center === null) {
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
    const existing = await pool.query("SELECT id FROM studies WHERE id = $1", [
      id,
    ]);
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: "Studio non trovato" });
    }

    // 2) update solo dei campi presenti
    const patch = {};
    if (cycle_weeks !== null) patch.cycle_weeks = cycle_weeks;
    if (total_weeks !== null) patch.total_weeks = total_weeks;
    if (cost_center !== null) patch.cost_center = cost_center;

    const setCols = Object.keys(patch);
    const setClause = setCols
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");
    const values = setCols.map((col) => patch[col]);

    const { rows } = await pool.query(
      `UPDATE studies SET ${setClause} WHERE id = $${setCols.length + 1} RETURNING cycle_weeks, total_weeks, cost_center`,
      [...values, id],
    );

    return res.status(200).json(rows[0]);
  } catch (e) {
    console.error("PATCH /api/studies/:id exception:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
});

/* -------------------- API TIMELINE -------------------- */
app.get("/api/timeline/:studyId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM study_events WHERE study_id = $1 ORDER BY created_at ASC",
      [req.params.studyId],
    );
    res.json(rows || []);
  } catch (error) {
    console.error("Errore GET /api/timeline:", error);
    res.status(500).send("Errore recupero eventi");
  }
});

app.post("/api/timeline/:studyId", async (req, res) => {
  try {
    const event = sanitizeEvent(req.body, req.params.studyId);
    const columns = Object.keys(event);
    const values = columns.map((c) =>
      c === "arm_codes" ? event[c] : event[c],
    );
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const { rows } = await pool.query(
      `INSERT INTO study_events (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`,
      values,
    );

    res.json(rows[0] || null);
  } catch (error) {
    console.error("Errore POST /api/timeline:", error);
    res.status(500).send("Errore creazione evento");
  }
});

// PATCH: aggiorna un evento esistente (niente più DELETE+POST)
app.patch("/api/timeline/:eventId", async (req, res) => {
  try {
    const eventId = req.params.eventId;

    const rawPatch = {
      event_type: req.body.event_type ?? undefined,
      title: toStrOrNull(req.body.title),
      notes: toStrOrNull(req.body.notes),
      indications: toStrOrNull(req.body.indications),
      billing: toBillingOrNull(req.body.billing),

      arm_codes:
        Array.isArray(req.body.arm_codes) && req.body.arm_codes.length > 0
          ? req.body.arm_codes
          : undefined,

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

    // Rimuovi undefined
    const patch = {};
    Object.keys(rawPatch).forEach((k) => {
      if (rawPatch[k] !== undefined) patch[k] = rawPatch[k];
    });

    if (Object.keys(patch).length === 0) {
      return res.status(400).json({ error: "Niente da aggiornare" });
    }

    const setCols = Object.keys(patch);
    const setClause = setCols
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");
    const values = setCols.map((col) => patch[col]);

    const { rows } = await pool.query(
      `UPDATE study_events SET ${setClause} WHERE id = $${setCols.length + 1} RETURNING *`,
      [...values, eventId],
    );

    if (rows.length === 0) {
      return res.status(404).json({ error: "Evento non trovato" });
    }

    return res.status(200).json(rows[0]);
  } catch (e) {
    console.error("PATCH /api/timeline/:eventId exception:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
});

app.delete("/api/timeline/:eventId", async (req, res) => {
  try {
    await pool.query("DELETE FROM study_events WHERE id = $1", [
      req.params.eventId,
    ]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Errore DELETE /api/timeline:", error);
    res.status(500).send("Errore eliminazione evento");
  }
});

/* -------------------- API TIMELINE OVERRIDES -------------------- */

// Lista override per studio
app.get("/api/timeline-overrides/:studyId", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT * FROM study_event_overrides WHERE study_id = $1 ORDER BY created_at ASC",
      [req.params.studyId],
    );
    res.json(rows || []);
  } catch (error) {
    console.error("Errore GET /api/timeline-overrides:", error);
    res.status(500).send("Errore recupero overrides");
  }
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

    // UPSERT su (event_id, day_index) - richiede un vincolo UNIQUE su quelle colonne
    const columns = Object.keys(patch);
    const values = Object.values(patch);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");
    const updateSet = columns
      .filter((c) => c !== "event_id" && c !== "day_index")
      .map((c) => `${c} = EXCLUDED.${c}`)
      .join(", ");

    const { rows } = await pool.query(
      `INSERT INTO study_event_overrides (${columns.join(", ")})
       VALUES (${placeholders})
       ON CONFLICT (event_id, day_index)
       DO UPDATE SET ${updateSet}
       RETURNING *`,
      values,
    );

    res.status(200).json(rows[0]);
  } catch (e) {
    console.error("POST /api/timeline-overrides exception:", e);
    return res.status(500).json({ error: "Errore interno" });
  }
});

// Cancella override per id
app.delete("/api/timeline-overrides/:overrideId", async (req, res) => {
  try {
    await pool.query("DELETE FROM study_event_overrides WHERE id = $1", [
      req.params.overrideId,
    ]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Errore DELETE /api/timeline-overrides:", error);
    res.status(500).send("Errore eliminazione override");
  }
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
