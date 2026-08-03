// index.js
import express from "express";
import dotenv from "dotenv";
import pkg from "pg";
import rateLimit from "express-rate-limit";
import expressLayouts from "express-ejs-layouts";
import path from "path";
import { fileURLToPath } from "url";
import { PDFDocument } from "pdf-lib";
import sharp from "sharp";

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

async function initDbSchema() {
  try {
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS study_code VARCHAR(255) UNIQUE;
    `);
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS internal_notes TEXT;
    `);
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS pi_contacts TEXT;
    `);
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS protocol_pdf TEXT;
    `);
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS study_schema TEXT;
    `);
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS study_schema_mime VARCHAR(100);
    `);
    await pool.query(`
      ALTER TABLE studies 
      ADD COLUMN IF NOT EXISTS extra_files JSONB DEFAULT '[]'::jsonb;
    `);
    console.log("✅ Schema database verificato con successo.");
  } catch (error) {
    console.error("❌ Errore durante la verifica dello schema database:", error);
  }
}
initDbSchema();

/* -------------------- Autenticazione modifiche (server-side) --------------
 * La password non è più verificata solo nel browser (bypassabile da
 * chiunque ispezioni il JS o chiami le API direttamente). Ogni richiesta
 * che CREA/MODIFICA/CANCELLA dati deve includere l'header
 * "x-edit-password" con il valore corretto, verificato qui sul server.
 * La password si imposta come variabile d'ambiente EDIT_PASSWORD
 * (su Coolify: Environment Variables), MAI nel codice.
 */
const EDIT_PASSWORD = process.env.EDIT_PASSWORD || null;

// Limite tentativi: la password è unica e condivisa, quindi senza un
// limite qualcuno potrebbe provarla a forza bruta chiamando le API
// direttamente. Max 20 tentativi ogni 15 minuti per indirizzo IP.
const editAuthLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: "Troppi tentativi. Riprova tra qualche minuto." },
});

function requireEditAuth(req, res, next) {
  if (!EDIT_PASSWORD) {
    console.error(
      "EDIT_PASSWORD non configurata: tutte le operazioni di modifica sono bloccate per sicurezza.",
    );
    return res.status(503).json({
      error:
        "Modifica non disponibile: password di modifica non configurata sul server.",
    });
  }
  const provided = req.get("x-edit-password");
  if (provided !== EDIT_PASSWORD) {
    return res.status(403).json({ error: "Password non valida." });
  }
  next();
}

/* -------------------- Whitelist valori enum (validazione server-side) --------------
 * Il frontend valida già questi campi, ma un client "onesto" non è l'unico
 * modo di raggiungere le API: chiunque può chiamarle direttamente. Questi
 * controlli sono una seconda linea di difesa lato server.
 */
const ALLOWED_CLINICAL_AREAS = [
  "Mammella",
  "Polmone",
  "Gastro-Intestinale",
  "Ginecologico",
  "Prostata e Vie Urinarie",
  "Melanoma e Cute",
  "Testa-Collo",
  "Fase 1",
  "Altro",
];
const ALLOWED_TREATMENT_SETTINGS = ["Metastatico", "Adiuvante", "Neo-adiuvante"];
const ALLOWED_EVENT_TYPES = [
  "oncological_visit",
  "blood_test",
  "radiology",
  "therapy",
  "custom",
];

/* -------------------- Middleware -------------------- */
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json({ limit: '50mb' }));

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

/* -------------------- API AUTH -------------------- */
app.post("/api/verify-password", editAuthLimiter, requireEditAuth, (_req, res) => {
  res.json({ ok: true });
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

app.post("/api/studies", editAuthLimiter, requireEditAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { arms, events, study_code, ...studyData } = req.body;

    // Validazione server-side
    if (!toStrOrNull(studyData.title)) {
      client.release();
      return res.status(400).json({ error: "Il titolo dello studio è obbligatorio." });
    }

    // Controllo unicità study_code (se inserito)
    const cleanCode = study_code && study_code.trim() !== '' ? study_code.trim() : null;
    if (cleanCode) {
      const checkCode = await client.query(
        'SELECT id FROM studies WHERE LOWER(study_code) = LOWER($1) AND id != $2',
        [cleanCode, studyData.id || 0]
      );
      if (checkCode.rows.length > 0) {
        client.release();
        return res.status(400).json({ 
          error: `Il codice studio "${cleanCode}" è già in uso su un altro studio.` 
        });
      }
    }

    if (
      studyData.clinical_areas !== undefined &&
      (!Array.isArray(studyData.clinical_areas) ||
        !studyData.clinical_areas.every((a) => ALLOWED_CLINICAL_AREAS.includes(a)))
    ) {
      client.release();
      return res.status(400).json({ error: "clinical_areas contiene valori non validi." });
    }
    if (
      studyData.treatment_setting !== undefined &&
      studyData.treatment_setting !== null &&
      studyData.treatment_setting !== "" &&
      !ALLOWED_TREATMENT_SETTINGS.includes(studyData.treatment_setting)
    ) {
      client.release();
      return res.status(400).json({ error: "treatment_setting non valido." });
    }

    await client.query("BEGIN");

    // Processamento e compressione file all'inserimento
    let protocolPdfData = studyData.protocol_pdf;
    if (protocolPdfData) {
      protocolPdfData = await compressPdf(protocolPdfData);
    }

    let extraFilesData = studyData.extra_files || [];
    if (Array.isArray(extraFilesData) && extraFilesData.length > 0) {
      for (let i = 0; i < extraFilesData.length; i++) {
        let f = extraFilesData[i];
        if (f.data && f.mime) {
          if (f.mime.startsWith("image/")) {
            const comp = await compressExtraImage(f.data, f.mime);
            f.data = comp.data;
            f.mime = comp.mime;
          } else if (f.mime === "application/pdf") {
            f.data = await compressPdf(f.data);
          }
        }
      }
    }

    // Prepara i dati inclusi study_code
    const fullData = { 
      ...studyData, 
      study_code: cleanCode, 
      protocol_pdf: protocolPdfData || null,
      extra_files: extraFilesData
    };
    const columns = Object.keys(fullData);
    const values = columns.map((c) =>
      (c === "criteria" || c === "extra_files") ? JSON.stringify(fullData[c] ?? []) : fullData[c],
    );
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(", ");

    const insertStudySQL = columns.length
      ? `INSERT INTO studies (${columns.join(", ")}) VALUES (${placeholders}) RETURNING *`
      : `INSERT INTO studies DEFAULT VALUES RETURNING *`;

    const { rows } = await client.query(insertStudySQL, values);
    const study = rows[0];

    // Se sono stati inviati bracci → inseriscili
    if (Array.isArray(arms) && arms.length > 0) {
      for (let i = 0; i < arms.length; i++) {
        const a = arms[i];
        await client.query(
          `INSERT INTO study_arms (study_id, arm_code, arm_label, sort_order) VALUES ($1, $2, $3, $4)`,
          [study.id, a.arm_code, a.arm_label, i + 1],
        );
      }
    }

    // Se sono stati inviati eventi (import JSON) → inseriscili in study_events
    if (Array.isArray(events) && events.length > 0) {
      for (const ev of events) {
        const sanitized = sanitizeEvent(ev, study.id);
        const evCols = Object.keys(sanitized);
        const evVals = evCols.map(c => sanitized[c]);
        const evPlaceholders = evCols.map((_, i) => `$${i + 1}`).join(", ");
        await client.query(
          `INSERT INTO study_events (${evCols.join(", ")}) VALUES (${evPlaceholders})`,
          evVals,
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

app.delete("/api/studies/:id", editAuthLimiter, requireEditAuth, async (req, res) => {
  try {
    await pool.query("DELETE FROM studies WHERE id = $1", [req.params.id]);
    res.sendStatus(204);
  } catch (error) {
    console.error("Errore DELETE /api/studies:", error);
    res.status(500).send("Errore eliminazione studio");
  }
});

// Leggi uno studio
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

// PATCH: aggiorna solo le settimane per ciclo o altri campi dello studio se ESISTE
app.patch("/api/studies/:id", editAuthLimiter, requireEditAuth, async (req, res) => {
  try {
    const id = req.params.id;

    const cycle_weeks = toIntOrNull(req.body.cycle_weeks);
    const total_weeks = toIntOrNull(req.body.total_weeks);
    const cost_center = toStrOrNull(req.body.cost_center);
    const study_code = toStrOrNull(req.body.study_code);
    const internal_notes = toStrOrNull(req.body.internal_notes);
    const pi_contacts = toStrOrNull(req.body.pi_contacts);

    const bodyHasCycle = Object.prototype.hasOwnProperty.call(req.body, "cycle_weeks");
    const bodyHasTotal = Object.prototype.hasOwnProperty.call(req.body, "total_weeks");
    const bodyHasCostCenter = Object.prototype.hasOwnProperty.call(req.body, "cost_center");
    const bodyHasCode = Object.prototype.hasOwnProperty.call(req.body, "study_code");
    const bodyHasNotes = Object.prototype.hasOwnProperty.call(req.body, "internal_notes");
    const bodyHasContacts = Object.prototype.hasOwnProperty.call(req.body, "pi_contacts");

    if (!bodyHasCycle && !bodyHasTotal && !bodyHasCostCenter && !bodyHasCode && !bodyHasNotes && !bodyHasContacts) {
      return res.status(400).json({ error: "Niente da aggiornare" });
    }

    // validazioni
    if (
      bodyHasCycle && cycle_weeks !== null &&
      (!Number.isInteger(cycle_weeks) || cycle_weeks < 1 || cycle_weeks > 12)
    ) {
      return res.status(400).json({ error: "cycle_weeks non valido" });
    }
    if (
      bodyHasTotal && total_weeks !== null &&
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

    // 2) verifica duplicato codice
    if (bodyHasCode && study_code) {
      const dupCheck = await pool.query(
        "SELECT id FROM studies WHERE LOWER(study_code) = LOWER($1) AND id <> $2",
        [study_code, id]
      );
      if (dupCheck.rows.length > 0) {
        return res.status(400).json({ error: "Codice studio già esistente." });
      }
    }

    // 3) update solo dei campi presenti nella richiesta originale
    const patch = {};
    if (bodyHasCycle) patch.cycle_weeks = cycle_weeks;
    if (bodyHasTotal) patch.total_weeks = total_weeks;
    if (bodyHasCostCenter) patch.cost_center = cost_center;
    if (bodyHasCode) patch.study_code = study_code;
    if (bodyHasNotes) patch.internal_notes = internal_notes;
    if (bodyHasContacts) patch.pi_contacts = pi_contacts;

    const setCols = Object.keys(patch);
    const setClause = setCols
      .map((col, i) => `${col} = $${i + 1}`)
      .join(", ");
    const values = setCols.map((col) => patch[col]);

    const { rows } = await pool.query(
      `UPDATE studies SET ${setClause} WHERE id = $${setCols.length + 1} RETURNING *`,
      [...values, id],
    );

    return res.status(200).json(rows[0]);
  } catch (e) {
    console.error("PATCH /api/studies/:id exception:", e);
    if (e.code === "23505") {
      return res.status(400).json({ error: "Codice studio già esistente." });
    }
    return res.status(500).json({ error: "Errore interno" });
  }
});

// PUT: aggiorna interamente lo studio se ESISTE
app.put("/api/studies/:id", editAuthLimiter, requireEditAuth, async (req, res) => {
  const client = await pool.connect();
  try {
    const id = req.params.id;
    const { arms, ...studyData } = req.body;

    // 1) verifica esistenza
    const existing = await client.query("SELECT id FROM studies WHERE id = $1", [id]);
    if (existing.rows.length === 0) {
      client.release();
      return res.status(404).json({ error: "Studio non trovato" });
    }

    // 2) validazioni
    if (studyData.title !== undefined && !toStrOrNull(studyData.title)) {
      client.release();
      return res.status(400).json({ error: "Il titolo dello studio è obbligatorio." });
    }

    const study_code = toStrOrNull(studyData.study_code);
    if (study_code) {
      const dupCheck = await client.query(
        "SELECT id FROM studies WHERE LOWER(study_code) = LOWER($1) AND id <> $2",
        [study_code, id]
      );
      if (dupCheck.rows.length > 0) {
        client.release();
        return res.status(400).json({ error: "Codice studio già esistente." });
      }
    }

    await client.query("BEGIN");

    // 3) update
    const columns = Object.keys(studyData);
    if (columns.length > 0) {
      const setClause = columns
        .map((col, i) => `${col} = $${i + 1}`)
        .join(", ");
      const values = columns.map((c) =>
        c === "criteria" ? JSON.stringify(studyData[c] ?? []) : studyData[c]
      );
      await client.query(
        `UPDATE studies SET ${setClause} WHERE id = $${columns.length + 1}`,
        [...values, id]
      );
    }

    // 4) bracci
    if (Array.isArray(arms)) {
      await client.query("DELETE FROM study_arms WHERE study_id = $1", [id]);
      for (let i = 0; i < arms.length; i++) {
        const a = arms[i];
        await client.query(
          `INSERT INTO study_arms (study_id, arm_code, arm_label, sort_order) VALUES ($1, $2, $3, $4)`,
          [id, a.arm_code, a.arm_label, i + 1]
        );
      }
    }

    await client.query("COMMIT");

    const { rows } = await client.query("SELECT * FROM studies WHERE id = $1", [id]);
    res.json(rows[0]);
  } catch (e) {
    await client.query("ROLLBACK");
    console.error("PUT /api/studies/:id exception:", e);
    if (e.code === "23505") {
      return res.status(400).json({ error: "Codice studio già esistente." });
    }
    res.status(500).send("Errore aggiornamento studio");
  } finally {
    client.release();
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

app.post("/api/timeline/:studyId", editAuthLimiter, requireEditAuth, async (req, res) => {
  try {
    if (!ALLOWED_EVENT_TYPES.includes(req.body.event_type)) {
      return res.status(400).json({ error: "event_type non valido." });
    }
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

app.patch("/api/timeline/:eventId", editAuthLimiter, requireEditAuth, async (req, res) => {
  try {
    const eventId = req.params.eventId;

    if (
      req.body.event_type !== undefined &&
      !ALLOWED_EVENT_TYPES.includes(req.body.event_type)
    ) {
      return res.status(400).json({ error: "event_type non valido." });
    }

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

app.delete("/api/timeline/:eventId", editAuthLimiter, requireEditAuth, async (req, res) => {
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

app.post("/api/timeline-overrides/:studyId", editAuthLimiter, requireEditAuth, async (req, res) => {
  try {
    const studyId = req.params.studyId;

    const event_id = req.body.event_id;
    const day_index = toIntOrNull(req.body.day_index);

    if (!event_id) return res.status(400).json({ error: "event_id mancante" });
    if (!Number.isInteger(day_index) || day_index < 0) {
      return res.status(400).json({ error: "day_index non valido" });
    }

    const patch = {
      study_id: studyId,
      event_id,
      day_index,
      billing: toBillingOrNull(req.body.billing),
      title: toStrOrNull(req.body.title),
      notes: toStrOrNull(req.body.notes),
      indications: toStrOrNull(req.body.indications),
    };

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

app.delete("/api/timeline-overrides/:overrideId", editAuthLimiter, requireEditAuth, async (req, res) => {
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

/* -------------------- API FILES -------------------- */

/**
 * Comprime un PDF usando pdf-lib: carica, ricostruisce con object streams
 * (compressione struttura ~20-40%) e restituisce il buffer ottimizzato.
 */
async function compressPdf(base64data) {
  try {
    const pure = base64data.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(pure, "base64");
    const pdfDoc = await PDFDocument.load(buf, { ignoreEncryption: true });
    const compressed = await pdfDoc.save({ useObjectStreams: true, addDefaultPage: false });
    return "data:application/pdf;base64," + Buffer.from(compressed).toString("base64");
  } catch (e) {
    console.warn("PDF compress fallback (originale conservato):", e.message);
    return base64data; // fallback: file originale
  }
}

/**
 * Comprime un'immagine extra allegato con sharp:
 * - JPEG/WebP: qualità 82, nessun resize
 * - PNG: compressione lossless livello 9
 * - PDF: lasciato invariato
 */
async function compressExtraImage(base64data, mimeType) {
  if (!mimeType || mimeType === "application/pdf") return { data: base64data, mime: mimeType };
  try {
    const pure = base64data.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(pure, "base64");
    let outBuf, outMime;
    if (mimeType === "image/png") {
      outBuf = await sharp(buf).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer();
      outMime = "image/png";
    } else {
      // JPEG, WebP, altri: converti in JPEG qualità 82
      outBuf = await sharp(buf).jpeg({ quality: 82, progressive: true, mozjpeg: true }).toBuffer();
      outMime = "image/jpeg";
    }
    // Usa il risultato solo se è effettivamente più piccolo
    if (outBuf.length < buf.length) {
      return { data: "data:" + outMime + ";base64," + outBuf.toString("base64"), mime: outMime };
    }
    return { data: base64data, mime: mimeType };
  } catch (e) {
    console.warn("Image compress fallback:", e.message);
    return { data: base64data, mime: mimeType };
  }
}

/* PATCH /api/studies/:id/files
 * Body JSON: { field: "protocol_pdf"|"study_schema"|"extra_files", data: "<base64>", mime: "...", name: "...", action: "add"|"remove", index: N }
 * Autenticato con x-edit-password.
 */
app.patch("/api/studies/:id/files", editAuthLimiter, requireEditAuth, async (req, res) => {
  try {
    const id = req.params.id;
    const { field, data, mime, name, action, index } = req.body;

    const existing = await pool.query("SELECT id, extra_files FROM studies WHERE id = $1", [id]);
    if (existing.rows.length === 0) return res.status(404).json({ error: "Studio non trovato" });

    if (field === "protocol_pdf") {
      // Comprimi PDF server-side
      const compressedData = data ? await compressPdf(data) : null;
      await pool.query("UPDATE studies SET protocol_pdf = $1 WHERE id = $2", [compressedData, id]);
    } else if (field === "study_schema") {
      // Studio schema: invariato (nessuna compressione)
      await pool.query("UPDATE studies SET study_schema = $1, study_schema_mime = $2 WHERE id = $3", [data || null, mime || null, id]);
    } else if (field === "extra_files") {
      let extras = existing.rows[0].extra_files || [];
      if (!Array.isArray(extras)) extras = [];

      if (action === "remove") {
        extras.splice(index, 1);
      } else {
        if (extras.length >= 4) return res.status(400).json({ error: "Massimo 4 file extra consentiti." });
        // Comprimi immagini extra, PDF invariati
        let finalData = data;
        let finalMime = mime || "application/octet-stream";
        if (data && mime && mime.startsWith("image/")) {
          const result = await compressExtraImage(data, mime);
          finalData = result.data;
          finalMime = result.mime;
        } else if (data && mime === "application/pdf") {
          finalData = await compressPdf(data);
        }
        extras.push({ name: name || "file", mime: finalMime, data: finalData });
      }
      await pool.query("UPDATE studies SET extra_files = $1 WHERE id = $2", [JSON.stringify(extras), id]);
    } else {
      return res.status(400).json({ error: "Campo file non valido." });
    }

    const updated = await pool.query("SELECT id, protocol_pdf, study_schema, study_schema_mime, extra_files FROM studies WHERE id = $1", [id]);
    const row = updated.rows[0];
    res.json({
      id: row.id,
      has_protocol_pdf: !!row.protocol_pdf,
      has_study_schema: !!row.study_schema,
      study_schema_mime: row.study_schema_mime,
      extra_files_meta: (row.extra_files || []).map((f, i) => ({ index: i, name: f.name, mime: f.mime }))
    });
  } catch (e) {
    console.error("PATCH /api/studies/:id/files exception:", e);
    res.status(500).json({ error: "Errore interno" });
  }
});

/* GET /api/studies/:id/file/:field  → scarica un file
 * field: protocol_pdf | study_schema | extra_N (N = indice 0-based)
 */
app.get("/api/studies/:id/file/:field", async (req, res) => {
  try {
    const id = req.params.id;
    const field = req.params.field;

    const { rows } = await pool.query(
      "SELECT protocol_pdf, study_schema, study_schema_mime, extra_files FROM studies WHERE id = $1", [id]
    );
    if (rows.length === 0) return res.status(404).send("Studio non trovato");
    const row = rows[0];

    let base64data, mime, filename;

    if (field === "protocol_pdf") {
      if (!row.protocol_pdf) return res.status(404).send("File non trovato");
      base64data = row.protocol_pdf;
      mime = "application/pdf";
      filename = `protocollo_${id}.pdf`;
    } else if (field === "study_schema") {
      if (!row.study_schema) return res.status(404).send("File non trovato");
      base64data = row.study_schema;
      mime = row.study_schema_mime || "application/pdf";
      filename = `study_schema_${id}.${mime.includes("pdf") ? "pdf" : "png"}`;
    } else if (field.startsWith("extra_")) {
      const idx = parseInt(field.split("_")[1], 10);
      const extras = row.extra_files || [];
      if (!extras[idx]) return res.status(404).send("File non trovato");
      base64data = extras[idx].data;
      mime = extras[idx].mime || "application/octet-stream";
      filename = extras[idx].name || `allegato_${idx}`;
    } else {
      return res.status(400).send("Campo non valido");
    }

    // Rimuovi prefisso data URL se presente
    const pureBase64 = base64data.replace(/^data:[^;]+;base64,/, "");
    const buf = Buffer.from(pureBase64, "base64");

    res.set("Content-Type", mime);
    const disposition = (field === "study_schema") ? "inline" : "attachment";
    res.set("Content-Disposition", `${disposition}; filename="${filename}"`);
    res.send(buf);
  } catch (e) {
    console.error("GET /api/studies/:id/file/:field exception:", e);
    res.status(500).send("Errore interno");
  }
});

/* GET /api/studies/:id/files-meta → metadata (senza dati binari) */
app.get("/api/studies/:id/files-meta", async (req, res) => {
  try {
    const { rows } = await pool.query(
      "SELECT id, protocol_pdf, study_schema, study_schema_mime, extra_files FROM studies WHERE id = $1",
      [req.params.id]
    );
    if (rows.length === 0) return res.status(404).json({ error: "Studio non trovato" });
    const row = rows[0];
    res.json({
      id: row.id,
      has_protocol_pdf: !!row.protocol_pdf,
      has_study_schema: !!row.study_schema,
      study_schema_mime: row.study_schema_mime,
      extra_files_meta: (row.extra_files || []).map((f, i) => ({ index: i, name: f.name, mime: f.mime }))
    });
  } catch (e) {
    res.status(500).json({ error: "Errore interno" });
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
