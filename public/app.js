
// Aspetta che tutti i script siano caricati
function waitForDependencies() {
  return new Promise((resolve) => {
    const checkDependencies = () => {
      if (typeof window.supabase !== 'undefined' && typeof Alpine !== 'undefined') {
        resolve();
      } else {
        setTimeout(checkDependencies, 50);
      }
    };
    checkDependencies();
  });
}

function trialApp() {
  // Configurazione Supabase
  const SUPABASE_URL = "https://csuvcrhiuuhdmkzeulrw.supabase.co";
  const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImNzdXZjcmhpdXVoZG1remV1bHJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQxMzMzNDAsImV4cCI6MjA2OTcwOTM0MH0.UrefA07uBtGe5pz4_K4-4YuvLLKCS1Pe7KX0naHqSCI";
  
  const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

  return {
    view: "trial",
    studies: [],
    showForm: false,
    form: {
      title: "",
      subtitle: "",
      areas: [],
      specifics: [],
      setting: "Metastatico",
      min_line: null,
      max_line: null,
      questions: [],
    },
    areaOptions: [
      "Mammella",
      "Polmone",
      "Gastro-Intestinale",
      "Ginecologico",
      "Prostata e Vie Urinarie",
      "Melanoma e Cute",
      "Testa-Collo",
      "Fase 1",
      "Altro",
    ],
    specificMap: {
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
    },

    async fetchStudies() {
      try {
        let { data, error } = await supabaseClient
          .from("studies")
          .select("*")
          .eq("removed", false)
          .order("inserted_at", { ascending: false });
        if (!error) {
          this.studies = data || [];
        } else {
          console.error("Errore nel caricamento studi:", error);
        }
      } catch (err) {
        console.error("Errore nel caricamento studi:", err);
        this.studies = [];
      }
    },

    openForm() {
      this.showForm = true;
    },
    
    closeForm() {
      this.showForm = false;
      this.resetForm();
    },
    
    resetForm() {
      this.form = {
        title: "",
        subtitle: "",
        areas: [],
        specifics: [],
        setting: "Metastatico",
        min_line: null,
        max_line: null,
        questions: [],
      };
    },
    
    addQuestion() {
      this.form.questions.push({ text: "", inclusion: true });
    },
    
    onSettingChange() {
      if (this.form.setting !== "Metastatico") {
        this.form.min_line = this.form.max_line = null;
      }
    },
    
    getSpecificOptions() {
      return this.form.areas.flatMap((a) => this.specificMap[a] || []);
    },

    async submitStudy() {
      try {
        // 1) inserisci in studies
        let { data: st, error: e1 } = await supabaseClient
          .from("studies")
          .insert({
            title: this.form.title,
            subtitle: this.form.subtitle,
            setting: this.form.setting,
            min_line: this.form.min_line,
            max_line: this.form.max_line,
          })
          .select()
          .single();
        
        if (e1) {
          alert("Errore nel salvataggio: " + e1.message);
          return;
        }

        const id = st.id;
        
        // 2) aree
        if (this.form.areas.length > 0) {
          await supabaseClient
            .from("study_areas")
            .insert(this.form.areas.map((a) => ({ study_id: id, area: a })));
        }
        
        // 3) specifics (se ce ne sono)
        if (this.form.specifics.length > 0) {
          await supabaseClient
            .from("study_specific_areas")
            .insert(
              this.form.specifics.map((s) => ({
                study_id: id,
                specific_area: s,
              })),
            );
        }
        
        // 4) domande
        if (this.form.questions.length > 0) {
          await supabaseClient.from("study_questions").insert(
            this.form.questions.map((q) => ({
              study_id: id,
              question_text: q.text,
              inclusion: q.inclusion,
            })),
          );
        }

        this.closeForm();
        await this.fetchStudies();
      } catch (err) {
        alert("Errore nel salvataggio: " + err.message);
      }
    },

    viewStudy(id) {
      alert("Implementa dettaglio view per " + id);
    },

    async init() {
      await this.fetchStudies();
    },
  };
}

// Inizializza quando tutto è pronto
waitForDependencies().then(() => {
  // Registra il componente Alpine
  Alpine.data('trialApp', trialApp);
  
  // Se Alpine non è ancora inizializzato, lo inizializza
  if (!Alpine.version) {
    Alpine.start();
  }
});
