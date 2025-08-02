function trialApp() {
  const supabase = supabaseJs.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_KEY,
  );

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

    //**********************************
    // Metodi
    //**********************************

    async fetchStudies() {
      let { data, error } = await supabase
        .from("studies")
        .select("*")
        .eq("removed", false)
        .order("inserted_at", { ascending: false });
      if (!error) this.studies = data;
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
      // 1) inserisci in studies
      let { data: st, error: e1 } = await supabase
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
      if (e1) return alert(e1.message);

      const id = st.id;
      // 2) aree
      await supabase
        .from("study_areas")
        .insert(this.form.areas.map((a) => ({ study_id: id, area: a })));
      // 3) specifics (se ce ne sono)
      if (this.form.specifics.length)
        await supabase
          .from("study_specific_areas")
          .insert(
            this.form.specifics.map((s) => ({
              study_id: id,
              specific_area: s,
            })),
          );
      // 4) domande
      if (this.form.questions.length)
        await supabase.from("study_questions").insert(
          this.form.questions.map((q) => ({
            study_id: id,
            question_text: q.text,
            inclusion: q.inclusion,
          })),
        );

      this.closeForm();
      this.fetchStudies();
    },

    viewStudy(id) {
      // qui puoi aprire un dettaglio con le domande etc.
      alert("Implementa dettaglio view per " + id);
    },

    init() {
      // esponi env a client
      window.SUPABASE_URL = `${import.meta.env.SUPABASE_URL}`;
      window.SUPABASE_KEY = `${import.meta.env.SUPABASE_KEY}`;
      this.fetchStudies();
    },
  };
}
document.addEventListener("alpine:init", () => {
  Alpine.data("trialApp", trialApp);
});
