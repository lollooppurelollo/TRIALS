import express from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Carica le variabili d'ambiente dal file .env
// Nota: su Render, le variabili d'ambiente verranno lette dalla configurazione del servizio
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Configurazione di Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Configura EJS come motore di template
app.set("view engine", "ejs");
app.set("views", "./views");

// Middleware per servire i file statici e per il parsing del body JSON
app.use(express.static("public"));
app.use(express.json());

// Rotta principale per la pagina del paziente
app.get("/", async (req, res) => {
  res.render("patient");
});

// Rotta per la pagina di gestione dei trial (per il medico)
app.get("/trials", (req, res) => {
  res.render("trial");
});

// API per ottenere tutti gli studi
app.get("/api/studies", async (req, res) => {
  try {
    const { data, error } = await supabase.from("studies").select("*");
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error("Errore nel recupero degli studi:", error.message);
    res.status(500).json({ error: "Errore nel recupero degli studi" });
  }
});

// API per creare un nuovo studio
app.post("/api/studies", async (req, res) => {
  try {
    const {
      title,
      subtitle,
      treatment_setting,
      min_treatment_line,
      max_treatment_line,
      clinical_areas,
      specific_clinical_areas,
      criteria,
    } = req.body;
    const { data, error } = await supabase
      .from("studies")
      .insert([
        {
          title,
          subtitle,
          treatment_setting,
          min_treatment_line,
          max_treatment_line,
          clinical_areas,
          specific_clinical_areas,
          criteria,
        },
      ])
      .select();

    if (error) throw error;
    res.status(201).json(data[0]);
  } catch (error) {
    console.error("Errore nella creazione dello studio:", error.message);
    res.status(500).json({ error: "Errore nella creazione dello studio" });
  }
});

// API per eliminare uno studio
app.delete("/api/studies/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase.from("studies").delete().eq("id", id);
    if (error) throw error;
    res.status(200).json({ message: "Studio eliminato con successo" });
  } catch (error) {
    console.error("Errore nell'eliminazione dello studio:", error.message);
    res.status(500).json({ error: "Errore nell'eliminazione dello studio" });
  }
});

app.listen(port, () => {
  console.log(`Server in ascolto su http://localhost:${port}`);
});
