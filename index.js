// index.js
// Questo è il file principale del server Express. Gestisce le rotte e la logica del backend.

// Importa i moduli necessari usando la sintassi ES Module
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createClient } from "@supabase/supabase-js";
import expressLayouts from "express-ejs-layouts";

// Questa parte è necessaria per replicare la variabile __dirname nei moduli ES
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 3000;

// Middleware per analizzare le richieste JSON e URL-encoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Imposta EJS come motore di template e configura i layout
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(expressLayouts);

// Serve i file statici dalla cartella 'public'
app.use(express.static(path.join(__dirname, "public")));

// Configura la connessione a Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Log di avviso se le chiavi non sono configurate
if (!supabaseUrl || !supabaseKey) {
  console.error(
    "ERRORE: Le variabili d'ambiente SUPABASE_URL e/o SUPABASE_KEY non sono definite. Assicurati di configurarle su Replit.",
  );
} else {
  console.log("Connessione a Supabase stabilita.");
}

// Rotte per le pagine
app.get("/", (req, res) => {
  res.redirect("/patient");
});

app.get("/patient", (req, res) => {
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
    res.render("patient", {
      clinicalAreas,
      treatmentSettings,
      page: "patient",
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
    res.render("trial", { clinicalAreas, treatmentSettings, page: "trial" });
  } catch (error) {
    console.error("Errore durante il rendering della pagina trial:", error);
    res.status(500).send("Si è verificato un errore interno.");
  }
});

// Rotta API per creare un nuovo studio
app.post("/api/studies", async (req, res) => {
  const newStudy = req.body;
  try {
    const { data, error } = await supabase
      .from("studies")
      .insert([newStudy])
      .select();
    if (error) throw error;
    res.status(201).json({ success: true, study: data[0] });
  } catch (error) {
    console.error("Errore durante l'inserimento dello studio:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rotta API per recuperare tutti gli studi (o filtrati per area)
app.get("/api/studies", async (req, res) => {
  try {
    let query = supabase.from("studies").select("*").eq("is_active", true);
    const { data, error } = await query;
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Errore durante il recupero degli studi:", error);
    res.status(500).json({ error: error.message });
  }
});

// Rotta API per rimuovere uno studio (imposta is_active a false)
app.delete("/api/studies/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const { data, error } = await supabase
      .from("studies")
      .update({ is_active: false })
      .eq("id", id)
      .select();
    if (error) throw error;
    res.status(200).json({ success: true, study: data[0] });
  } catch (error) {
    console.error("Errore durante la rimozione dello studio:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Rotta API per la ricerca di studi per un paziente
app.post("/api/search", async (req, res) => {
  const {
    clinical_area,
    specific_area,
    treatment_setting,
    patient_treatment_line,
  } = req.body;
  try {
    let query = supabase
      .from("studies")
      .select("*")
      .eq("is_active", true)
      .contains("clinical_areas", [clinical_area]);

    // Filtro per setting del trattamento
    if (treatment_setting) {
      query = query.eq("treatment_setting", treatment_setting);
    }

    const { data, error } = await query;
    if (error) throw error;

    // Filtro aggiuntivo in memoria per la specifica area e la linea di trattamento
    const filteredData = data.filter((study) => {
      const specificAreaMatch =
        !specific_area ||
        (study.specific_clinical_areas &&
          study.specific_clinical_areas.includes(specific_area));
      const treatmentLineMatch =
        treatment_setting !== "Metastatico" ||
        (patient_treatment_line >= study.min_treatment_line &&
          patient_treatment_line <= study.max_treatment_line);
      return specificAreaMatch && treatmentLineMatch;
    });

    res.json(filteredData);
  } catch (error) {
    console.error("Errore durante la ricerca degli studi:", error);
    res.status(500).json({ error: error.message });
  }
});

// Avvia il server
app.listen(port, () => {
  console.log(`Server in ascolto sulla porta ${port}`);
});
