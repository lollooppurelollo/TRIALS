import express from "express";
import { createClient } from "@supabase/supabase-js";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

dotenv.config();

// Configurazione di Supabase
// Per utilizzare questo codice, devi configurare le tue variabili d'ambiente SUPABASE_URL e SUPABASE_KEY
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error(
        "Errore: le variabili d'ambiente SUPABASE_URL e SUPABASE_KEY non sono definite.",
    );
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const app = express();
const port = process.env.PORT || 3000;

// Configurazione di EJS e middleware
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));
app.use(express.json());

// Dati che verranno utilizzati per il rendering delle pagine EJS
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
const specificClinicalAreasMap = {
    Mammella: ["HER2 positive", "Luminali", "TNBC"],
    Polmone: ["NSCLC", "SCLC", "Mesotelioma"],
    "Gastro-Intestinale": [
        "Esofago",
        "Stomaco",
        "Colon",
        "Retto",
        "Ano",
        "Vie biliari",
        "Pancreas",
        "Fegato",
    ],
    "Prostata e Vie Urinarie": [
        "Prostata",
        "Rene",
        "Vescica",
        "Altre vie Urinarie",
    ],
    Ginecologico: ["Endometrio", "Ovaio", "Cervice", "Vulva", "Altri"],
    "Melanoma e Cute": ["Melanoma", "SCC", "Basalioma"],
};
const treatmentSettings = ["Metastatico", "Adiuvante", "Neo-adiuvante"];
const patientTreatmentLines = []; // Questo array non è più necessario, ma lo lascio per coerenza

// Rotte per il rendering delle pagine EJS
app.get("/patient", (req, res) => {
    res.render("patient", {
        page: "patient",
        clinicalAreas: clinicalAreas,
        specificClinicalAreasMap: specificClinicalAreasMap,
        treatmentSettings: treatmentSettings,
        patientTreatmentLines: patientTreatmentLines,
    });
});

app.get("/trial", (req, res) => {
    res.render("trial", {
        page: "trial",
        clinicalAreas: clinicalAreas,
        specificClinicalAreasMap: specificClinicalAreasMap,
        treatmentSettings: treatmentSettings,
    });
});

app.get("/", (req, res) => {
    res.redirect("/patient");
});

// Rotte API per la gestione degli studi
// GET: Ottiene tutti gli studi
app.get("/api/studies", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("trials")
            .select("*")
            .order("created_at", { ascending: false });

        if (error) {
            console.error("Errore Supabase nel recupero degli studi:", error);
            return res.status(500).json({ error: "Errore interno del server" });
        }
        res.status(200).json(data);
    } catch (error) {
        console.error("Errore generico nel recupero degli studi:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// POST: Aggiunge un nuovo studio
app.post("/api/studies", async (req, res) => {
    try {
        const { data, error } = await supabase
            .from("trials")
            .insert(req.body)
            .select();

        if (error) {
            console.error(
                "Errore Supabase nel salvataggio dello studio:",
                error,
            );
            return res.status(500).json({ error: "Errore interno del server" });
        }
        res.status(201).json(data[0]);
    } catch (error) {
        console.error("Errore generico nel salvataggio dello studio:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// DELETE: Rimuove uno studio
app.delete("/api/studies/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { error } = await supabase.from("trials").delete().eq("id", id);

        if (error) {
            console.error(
                "Errore Supabase nella rimozione dello studio:",
                error,
            );
            return res.status(500).json({ error: "Errore interno del server" });
        }
        res.status(204).send();
    } catch (error) {
        console.error("Errore generico nella rimozione dello studio:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// POST: Cerca studi in base ai criteri del paziente
app.post("/api/search", async (req, res) => {
    try {
        const patientCriteria = req.body;
        console.log("Criteri di ricerca paziente ricevuti:", patientCriteria);

        const { data: allStudies, error } = await supabase
            .from("trials")
            .select("*");

        if (error) {
            console.error(
                "Errore Supabase durante la ricerca degli studi:",
                error,
            );
            return res.status(500).json({ error: "Errore interno del server" });
        }

        const matchingStudies = allStudies.filter((study) => {
            // Criteri di ricerca obbligatori
            const areaMatch = study.clinical_areas.includes(
                patientCriteria.clinical_area,
            );
            const settingMatch =
                study.treatment_setting === patientCriteria.treatment_setting;

            // Criterio di ricerca opzionale per l'area specifica
            const specificAreaMatch =
                !patientCriteria.specific_clinical_area ||
                patientCriteria.specific_clinical_area === "" ||
                study.specific_clinical_areas.includes(
                    patientCriteria.specific_clinical_area,
                );

            // Criterio di ricerca per la linea di trattamento (solo per pazienti metastatici)
            let treatmentLineMatch = true;
            if (patientCriteria.treatment_setting === "Metastatico") {
                const patientTreatmentLine =
                    patientCriteria.patient_treatment_line;
                const minLine = study.min_treatment_line;
                const maxLine = study.max_treatment_line;

                console.log(
                    `Confronto studio "${study.title}": Linea paziente ${patientTreatmentLine} vs Min ${minLine} / Max ${maxLine}`,
                );

                if (minLine !== null && maxLine !== null) {
                    treatmentLineMatch =
                        patientTreatmentLine >= minLine &&
                        patientTreatmentLine <= maxLine;
                } else if (minLine !== null) {
                    treatmentLineMatch = patientTreatmentLine >= minLine;
                } else if (maxLine !== null) {
                    treatmentLineMatch = patientTreatmentLine <= maxLine;
                } else {
                    treatmentLineMatch = true; // Se lo studio non ha linee di trattamento, corrisponde sempre
                }
            }

            return (
                areaMatch &&
                specificAreaMatch &&
                settingMatch &&
                treatmentLineMatch
            );
        });

        res.status(200).json(matchingStudies);
    } catch (error) {
        console.error("Errore generico durante la ricerca degli studi:", error);
        res.status(500).json({ error: "Errore interno del server" });
    }
});

// Gestione degli errori 404 per le rotte API, in modo che restituiscano JSON
app.use((req, res, next) => {
    // Se la richiesta è per un endpoint API che non esiste, restituisci un errore JSON
    if (req.path.startsWith("/api")) {
        return res.status(404).json({ error: "Endpoint API non trovato." });
    }
    // Altrimenti, continua con la gestione predefinita di Express
    next();
});

app.listen(port, () => {
    console.log(`Server in ascolto sulla porta ${port}`);
});
