// index.js
import express from "express";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import expressLayouts from "express-ejs-layouts";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Connessione Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY,
);

// Middleware
app.set("view engine", "ejs");
app.use(expressLayouts);
app.use(express.static("public"));
app.use(express.json());

// Rotte pagine
app.get("/", (req, res) => res.render("patient"));
app.get("/trial", (req, res) => res.render("trial"));
app.get("/trials", (req, res) => res.render("trial"));
app.get("/timeline", (req, res) => {
  const studyId = req.query.study_id;
  res.render("timeline", { studyId });
});

// Helpers
function toIntOrNull(v) {
  if (v === undefined || v === null || v === "") return null;
  const n = parseInt(v, 10);
  return Number.isNaN(n) ? null : n;
}
function toBool(v) {
  return v === true || v === "true" || v === 1 || v === "1";
}
function sanitizeEvent(body, studyId) {
  const one_shot = toBool(body.one_shot);

  return {
    study_id: studyId,
    event_type: body.event_type || "custom",
    title: (body.title ?? "").trim() || null,
    notes: (body.notes ?? "").trim() || null,
    indications: (body.indications ?? "").trim() || null,
    one_shot,
    at_week: one_shot ? toIntOrNull(body.at_week) : null,
    repeat_every_days: !one_shot ? toIntOrNull(body.repeat_every_days) : null,
    start_week: !one_shot ? toIntOrNull(body.start_week) : null,
    stop_week: !one_shot ? toIntOrNull(body.stop_week) : null,
    window_days: toIntOrNull(body.window_days),
  };
}

// API Studies
app.get("/api/studies", async (_req, res) => {
  const { data, error } = await supabase
    .from("studies")
    .select("*")
    .order("id");
  if (error) {
    console.error("Errore GET /api/studies:", error);
    return res.status(500).send("Errore recupero studi");
  }
  res.json(data);
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
  res.json(data[0]);
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

// API Timeline
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
  res.json(data);
});

app.post("/api/timeline/:studyId", async (req, res) => {
  const event = sanitizeEvent(req.body, req.params.studyId);
  const { data, error } = await supabase
    .from("study_events")
    .insert([event])
    .select();
  if (error) {
    console.error("Errore POST /api/timeline:", error);
    return res.status(500).send("Errore creazione evento");
  }
  res.json(data[0]);
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

// Avvio server
app.listen(PORT, () => {
  console.log(`✅ Server avviato su http://localhost:${PORT}`);
});
