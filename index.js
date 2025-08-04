// index.js
// Questo è il file principale del server Express. Gestisce le rotte e la logica del backend.

// Importa i moduli necessari usando la sintassi ES Module
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import fs from "fs"; // Importa il modulo 'fs' per la gestione del file system
import expressLayouts from "express-ejs-layouts"; // Importa il middleware per i layout di EJS

// Questa parte è necessaria per replicare la variabile __dirname nei moduli ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware per analizzare le richieste JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Imposta EJS come motore di template
// IMPORTANTE: Assicurati che tutti i tuoi file .ejs (es. patient.ejs) si trovino in una cartella chiamata "views"
app.set("view engine", "ejs");
// Imposta il middleware per i layout di EJS
app.use(expressLayouts);
app.set("views", [
  path.join(__dirname, "views"),
  path.join(__dirname, "views/patient"),
  path.join(__dirname, "views/Patient"),
]);

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, "public")));

// Configura la connessione a Supabase
// Render inietterà queste variabili d'ambiente automaticamente
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Log di avviso se le chiavi non sono configurate
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "ERRORE: Le variabili d'ambiente SUPABASE_URL e/o SUPABASE_KEY non sono definite. Assicurati di configurarle su Replit o Render.",
  );
} else {
  console.log("Connessione a Supabase stabilita.");
}

// Rotte per le pagine
app.get("/", (req, res) => {
  res.redirect("/patient");
});

app.get("/patient", async (req, res) => {
  try {
    // Passa i dati necessari per i menu a tendina
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
    res.render("patient", {
      clinicalAreas,
      treatmentSettings,
      studies: null,
      isSearch: false,
      layout: "layout",
    });
  } catch (error) {
    console.error("Errore durante il rendering della pagina patient:", error);
    res.status(500).send("Si è verificato un errore interno.");
  }
});

app.get("/trial", async (req, res) => {
  try {
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
    res.render("trial", {
      clinicalAreas,
      treatmentSettings,
      studies: [],
      editingStudy: null,
      layout: "layout",
    });
  } catch (error) {
    console.error("Errore durante il rendering della pagina trial:", error);
    res.status(500).send("Si è verificato un errore interno.");
  }
});

// Rotta API per creare un nuovo studio
app.post("/api/studies", async (req, res) => {
  const newStudy = req.body;
  const { data, error } = await supabase
    .from("studies")
    .insert([newStudy])
    .select();
  if (error) {
    console.error("Errore durante l'inserimento dello studio:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
  res.status(201).json({ success: true, study: data[0] });
});

// Rotta API per recuperare tutti gli studi (o filtrati per area)
app.get("/api/studies", async (req, res) => {
  const { clinical_area, specific_area } = req.query;
  let query = supabase.from("studies").select("*").eq("is_active", true);

  if (clinical_area) {
    query = query.contains("clinical_areas", [clinical_area]);
  }

  const { data, error } = await query;
  if (error) {
    console.error("Errore durante il recupero degli studi:", error);
    return res.status(500).json({ error: error.message });
  }

  // Filtro aggiuntivo in memoria per la specifica area, poiché Supabase non supporta `contains` su un array di stringhe JSONB nidificato
  const filteredData = data.filter((study) => {
    if (specific_area && study.specific_clinical_areas) {
      return study.specific_clinical_areas.includes(specific_area);
    }
    return true;
  });

  res.json(filteredData);
});

// Rotta API per rimuovere uno studio (imposta is_active a false)
app.delete("/api/studies/:id", async (req, res) => {
  const { id } = req.params;
  const { data, error } = await supabase
    .from("studies")
    .update({ is_active: false })
    .eq("id", id)
    .select();
  if (error) {
    console.error("Errore durante la rimozione dello studio:", error);
    return res.status(500).json({ success: false, error: error.message });
  }
  res.status(200).json({ success: true, study: data[0] });
});

// Rotta API per la ricerca di studi per un paziente
app.post("/api/search", async (req, res) => {
  const {
    clinical_area,
    specific_area,
    treatment_setting,
    patient_treatment_line,
  } = req.body;

  let query = supabase
    .from("studies")
    .select("*")
    .eq("is_active", true)
    .contains("clinical_areas", [clinical_area])
    .eq("treatment_setting", treatment_setting);

  const { data, error } = await query;
  if (error) {
    console.error("Errore durante la ricerca degli studi:", error);
    return res.status(500).json({ error: error.message });
  }

  // Filtro aggiuntivo in memoria
  const filteredData = data.filter((study) => {
    // Filtro per Specifica Area Clinica
    const specificAreaMatch =
      !specific_area ||
      (study.specific_clinical_areas &&
        study.specific_clinical_areas.includes(specific_area));

    // Filtro per Linea di Trattamento se il setting è Metastatico
    const treatmentLineMatch =
      treatment_setting !== "Metastatico" ||
      (patient_treatment_line >= study.min_treatment_line &&
        patient_treatment_line <= study.max_treatment_line);

    return specificAreaMatch && treatmentLineMatch;
  });

  res.json(filteredData);
});

// Nuova rotta di debug per controllare i file nella cartella views
app.get("/debug-views", (req, res) => {
  const viewsPath = path.join(__dirname, "views");
  fs.readdir(viewsPath, (err, files) => {
    if (err) {
      return res
        .status(500)
        .send(`Errore durante la lettura della cartella views: ${err.message}`);
    }
    res.send(`File trovati nella cartella views: <br>${files.join("<br>")}`);
  });
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
