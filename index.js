// index.js
// Backend server con Express.js e Supabase.

// Importa le librerie necessarie
import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";

// Inizializza Express e configura il server
const app = express();
const port = 3000;

// Middleware per il parsing del body JSON
app.use(express.json());
// Middleware per servire i file statici dalla cartella 'public'
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Setta EJS come motore di template
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Configura il client Supabase
const supabaseUrl =
    process.env.SUPABASE_URL || "https://csuvcrhiuuhdmkzeulrw.supabase.co";
const supabaseKey =
    process.env.SUPABASE_KEY ||
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXZjcmhpdXVoZG1remV1bHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMzNDAsImV4cCI6MjA2OTcwOTM0MH0.UrefA07uBtGe5pz4_K4-4YuvLLKCS1Pe7KX0naHqSCI";
const supabase = createClient(supabaseUrl, supabaseKey);

// --- API Endpoints ---

// Endpoint per ottenere tutti gli studi
app.get("/api/studies", async (req, res) => {
    const { data, error } = await supabase.from("studies").select("*");

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// Endpoint per salvare un nuovo studio
app.post("/api/studies", async (req, res) => {
    const newStudy = { ...req.body, id: uuidv4() };
    const { data, error } = await supabase.from("studies").insert([newStudy]);

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(201).json(data);
});

// Endpoint per aggiornare uno studio esistente
app.put("/api/studies/:id", async (req, res) => {
    const { id } = req.params;
    const updatedStudy = req.body;
    const { data, error } = await supabase
        .from("studies")
        .update(updatedStudy)
        .eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// Endpoint per eliminare uno studio
app.delete("/api/studies/:id", async (req, res) => {
    const { id } = req.params;
    const { error } = await supabase.from("studies").delete().eq("id", id);

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.status(204).end();
});

// Endpoint per cercare studi in base ai criteri del paziente
app.post("/api/search", async (req, res) => {
    const {
        clinical_area,
        specific_area,
        treatment_setting,
        patient_treatment_line,
    } = req.body;

    let query = supabase.from("studies").select("*");

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

    if (error) {
        return res.status(500).json({ error: error.message });
    }
    res.json(data);
});

// --- Pagine EJS ---

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

// Pagina di ricerca per paziente
app.get("/patient", (req, res) => {
    res.render("patient", {
        page: "patient",
        clinicalAreas,
        treatmentSettings,
    });
});

// Pagina di gestione degli studi
app.get("/trial", (req, res) => {
    res.render("trial", {
        page: "trial",
        clinicalAreas,
        treatmentSettings,
    });
});

// Reindirizzamento alla pagina paziente di default
app.get("/", (req, res) => {
    res.redirect("/patient");
});

// Avvia il server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
