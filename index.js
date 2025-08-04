// index.js
// Backend server con Express.js e Supabase.

import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import crypto from "crypto";
import expressLayouts from "express-ejs-layouts";

const app = express();
const port = process.env.PORT || 3000;

// Configurazione dei middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configurazione di EJS come motore di template
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);

// Configurazione del client Supabase (utilizza variabili d'ambiente per Render)
const supabaseUrl =
    process.env.SUPABASE_URL || "https://csuvcrhiuuhdmkzeulrw.supabase.co";
const supabaseKey =
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXZjcmhpdXVoZG1remV1bHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMzNDAsImV4cCI6MjA2OTcwOTM0MH0.UrefA07uBtGe5pz4_K4-4YuvLLKCS1Pe7KX0naHqSCI";
const supabase = createClient(supabaseUrl, supabaseKey);

// Dati di esempio per i dropdown
const clinicalAreas = [
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
const treatmentSettings = ["Metastatico", "Adiuvante", "Neo-adiuvante"];

// Rotte per le pagine EJS
app.get("/", (req, res) => res.redirect("/patient"));
app.get("/patient", (req, res) =>
    res.render("patient", {
        page: "patient",
        clinicalAreas,
        treatmentSettings,
    }),
);
app.get("/trial", (req, res) =>
    res.render("trial", { page: "trial", clinicalAreas, treatmentSettings }),
);

// --- API Endpoints ---
// Recupera tutti gli studi attivi
app.get("/api/studies", async (req, res) => {
    const { data, error } = await supabase
        .from("studies")
        .select("*")
        .eq("is_active", true);
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Aggiunge un nuovo studio
app.post("/api/studies", async (req, res) => {
    const newStudy = { ...req.body, id: crypto.randomUUID(), is_active: true };
    const { data, error } = await supabase
        .from("studies")
        .insert([newStudy])
        .select();
    if (error) return res.status(500).json({ error: error.message });
    res.status(201).json(data[0]);
});

// "Elimina" uno studio (imposta is_active a false)
app.delete("/api/studies/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase
        .from("studies")
        .update({ is_active: false })
        .eq("id", id);
    if (error) return res.status(500).json({ error: error.message });
    res.status(204).end();
});

// Rotta per la ricerca degli studi
app.post("/api/search", async (req, res) => {
    const {
        clinical_area,
        specific_area,
        treatment_setting,
        patient_treatment_line,
    } = req.body;

    let query = supabase.from("studies").select("*").eq("is_active", true);

    if (clinical_area) {
        query = query.contains("clinical_areas", [clinical_area]);
    }
    if (specific_area && specific_area !== "Qualsiasi") {
        query = query.contains("specific_clinical_areas", [specific_area]);
    }
    if (treatment_setting) {
        query = query.eq("treatment_setting", treatment_setting);
    }
    if (treatment_setting === "Metastatico" && patient_treatment_line) {
        query = query.gte("min_treatment_line", patient_treatment_line);
        query = query.lte("max_treatment_line", patient_treatment_line);
    }

    const { data, error } = await query;
    if (error) return res.status(500).json({ error: error.message });
    res.json(data);
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server in ascolto su http://localhost:${port}`);
});
