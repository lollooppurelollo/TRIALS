// Mappa delle aree cliniche specifiche
const specificAreasMap = {
    Mammella: [
        "Carcinoma in situ",
        "Carcinoma duttale invasivo",
        "Carcinoma lobulare invasivo",
    ],
    Polmone: ["NSCLC", "SCLC", "Mesotelioma"],
    "Gastro-Intestinale": [
        "Colon-retto",
        "Stomaco",
        "Pancreas",
        "Epatocarcinoma",
    ],
    Ginecologico: ["Ovarico", "Cervice", "Endometrio"],
    "Prostata e Vie Urinarie": ["Prostata", "Rene", "Vescica"],
    "Melanoma e Cute": [
        "Melanoma",
        "Carcinoma basocellulare",
        "Carcinoma spinocellulare",
    ],
    "Testa-Collo": ["Laringe", "Faringe", "Tiroide"],
    "Fase 1": [],
    Altro: [],
};

// Selettori degli elementi del DOM
const patientNav = document.getElementById("patientNav");
const trialsNav = document.getElementById("trialsNav");
const patientView = document.getElementById("patient-view");
const trialsView = document.getElementById("trials-view");

const searchForm = document.getElementById("searchForm");
const patientClinicalArea = document.getElementById("clinicalArea");
const patientSpecificClinicalAreaContainer = document.getElementById(
    "specificClinicalAreaContainer",
);
const patientSpecificClinicalAreas = document.getElementById(
    "specificClinicalAreas",
);
const patientTreatmentSetting = document.getElementById("treatmentSetting");
const patientTreatmentLineContainer = document.getElementById(
    "treatmentLineContainer",
);
const patientTreatmentLineInput = document.getElementById(
    "patientTreatmentLine",
);
const patientTrialList = document.querySelector("#searchResults #trialList");

const studyForm = document.getElementById("studyForm");
const studyTitleInput = document.getElementById("studyTitle");
const studySubtitleInput = document.getElementById("studySubtitle");
const studyClinicalAreasSelect = document.getElementById("studyClinicalAreas");
const studySpecificClinicalAreaContainer = document.getElementById(
    "studySpecificClinicalAreaContainer",
);
const studySpecificClinicalAreasSelect = document.getElementById(
    "studySpecificClinicalAreas",
);
const studyTreatmentSettingSelect = document.getElementById(
    "studyTreatmentSetting",
);
const studyTreatmentLineContainer = document.getElementById(
    "studyTreatmentLineContainer",
);
const minTreatmentLineInput = document.getElementById("minTreatmentLine");
const maxTreatmentLineInput = document.getElementById("maxTreatmentLine");
const addCriteriaBtn = document.getElementById("addCriteriaBtn");
const criteriaList = document.getElementById("criteriaList");
const trialsTrialList = document.querySelector(
    "#trialListSection #trialList_TrialsPage",
);
const trialFilterForm = document.getElementById("trialFilterForm");
const filterClinicalAreaSelect = document.getElementById("filterClinicalArea");
const filterSpecificClinicalAreaContainer = document.getElementById(
    "filterSpecificClinicalAreaContainer",
);
const filterSpecificClinicalAreasSelect = document.getElementById(
    "filterSpecificClinicalAreas",
);
const filterTreatmentSettingSelect = document.getElementById(
    "filterTreatmentSetting",
);

const studyDetailModal = document.getElementById("studyDetailModal");
const modalTitle = document.getElementById("modalTitle");
const modalSubtitle = document.getElementById("modalSubtitle");
const modalClinicalAreas = document.getElementById("modalClinicalAreas");
const modalSpecificClinicalAreas = document.getElementById(
    "modalSpecificClinicalAreas",
);
const modalTreatmentSetting = document.getElementById("modalTreatmentSetting");
const modalTreatmentLineContainer = document.getElementById(
    "modalTreatmentLineContainer",
);
const modalTreatmentLine = document.getElementById("modalTreatmentLine");
const criteriaContainer = document.getElementById("criteriaContainer");
const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
const eligibilityResultDiv = document.getElementById("eligibilityResultDiv");
const closeModalBtn = document.getElementById("closeModalBtn");

let allStudies = [];

// Funzione per la navigazione
function setActiveView(viewId) {
    patientView.classList.add("hidden");
    trialsView.classList.add("hidden");
    document.getElementById(viewId).classList.remove("hidden");

    patientNav.classList.remove("text-sage", "text-dark-sage");
    trialsNav.classList.remove("text-sage", "text-dark-sage");

    if (viewId === "patient-view") {
        patientNav.querySelector("i").classList.add("text-dark-sage");
        patientNav.querySelector("span").classList.add("text-dark-sage");
        trialsNav.querySelector("i").classList.remove("text-dark-sage");
        trialsNav.querySelector("span").classList.remove("text-dark-sage");
        patientNav.classList.add("active-nav-item");
        trialsNav.classList.remove("active-nav-item");
        loadStudiesForPatient();
    } else {
        trialsNav.querySelector("i").classList.add("text-dark-sage");
        trialsNav.querySelector("span").classList.add("text-dark-sage");
        patientNav.querySelector("i").classList.remove("text-dark-sage");
        patientNav.querySelector("span").classList.remove("text-dark-sage");
        trialsNav.classList.add("active-nav-item");
        patientNav.classList.remove("active-nav-item");
        loadStudiesForTrials();
    }
}

// Funzione per mostrare e nascondere il modale
function showModal(study, isPatientView = false) {
    modalTitle.textContent = study.title;
    modalSubtitle.textContent = study.subtitle;
    modalClinicalAreas.textContent = study.clinical_areas.join(", ");
    modalSpecificClinicalAreas.textContent =
        study.specific_clinical_areas.join(", ");
    modalTreatmentSetting.textContent = study.treatment_setting;
    criteriaContainer.innerHTML = "";

    if (study.min_treatment_line && study.max_treatment_line) {
        modalTreatmentLineContainer.classList.remove("hidden");
        modalTreatmentLine.textContent = `${study.min_treatment_line} - ${study.max_treatment_line}`;
    } else {
        modalTreatmentLineContainer.classList.add("hidden");
    }

    // Genera l'HTML per i criteri nel modale
    study.criteria.forEach((criteria) => {
        const criteriaDiv = document.createElement("div");
        criteriaDiv.classList.add(
            "flex",
            "items-center",
            "space-x-2",
            "bg-gray-100",
            "p-3",
            "rounded-lg",
        );
        criteriaDiv.innerHTML = `
            <div class="flex-grow text-gray-700">${criteria.text}</div>
            ${
                isPatientView
                    ? `
            <label for="criteria-toggle-${criteria.id}" class="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" id="criteria-toggle-${criteria.id}" value="" class="criteria-toggle sr-only peer">
                <div class="w-11 h-6 bg-red-500 rounded-full peer peer-focus:ring-2 peer-focus:ring-red-300 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sage"></div>
            </label>
            <span class="text-sm font-medium text-gray-700 w-16 text-right" data-eligibility="inclusion">Incluso</span>
            `
                    : ""
            }
        `;
        criteriaContainer.appendChild(criteriaDiv);
    });

    if (isPatientView) {
        checkEligibilityBtn.classList.remove("hidden");
        eligibilityResultDiv.classList.add("hidden");
    } else {
        checkEligibilityBtn.classList.add("hidden");
        eligibilityResultDiv.classList.add("hidden");
    }

    // Aggiunto questo stile per correggere il problema di visualizzazione su desktop
    studyDetailModal.querySelector("div").style.maxWidth = "50%";
    studyDetailModal.querySelector("div").style.margin = "2rem auto";
    studyDetailModal.querySelector("div").style.maxHeight = "90vh";
    studyDetailModal.querySelector(".modal-content").style.overflowY = "auto";

    studyDetailModal.classList.remove("hidden");
}

function closeModal() {
    studyDetailModal.classList.add("hidden");
}

// Funzione per popolare le aree cliniche specifiche
function populateSpecificAreas(selectElement, areas) {
    selectElement.innerHTML =
        '<option value="" disabled selected>Seleziona un\'area specifica (opzionale)</option>';
    areas.forEach((area) => {
        const option = document.createElement("option");
        option.value = area;
        option.textContent = area;
        selectElement.appendChild(option);
    });
}

// Funzione per popolare le aree cliniche specifiche nel filtro dei trial
function populateSpecificAreasFilter(selectElement, areas) {
    selectElement.innerHTML = '<option value="">Tutte le Specifiche</option>';
    areas.forEach((area) => {
        const option = document.createElement("option");
        option.value = area;
        option.textContent = area;
        selectElement.appendChild(option);
    });
}

// Gestore per il cambio dell'area clinica (pagina paziente)
patientClinicalArea.addEventListener("change", (e) => {
    const selectedArea = e.target.value;
    if (selectedArea in specificAreasMap) {
        const areas = specificAreasMap[selectedArea];
        if (areas.length > 0) {
            populateSpecificAreas(patientSpecificClinicalAreas, areas);
            patientSpecificClinicalAreaContainer.classList.remove("hidden");
        } else {
            patientSpecificClinicalAreaContainer.classList.add("hidden");
        }
    }
});

// Gestore per il cambio del setting di trattamento (pagina paziente)
patientTreatmentSetting.addEventListener("change", (e) => {
    if (e.target.value === "Metastatico") {
        patientTreatmentLineContainer.classList.remove("hidden");
    } else {
        patientTreatmentLineContainer.classList.add("hidden");
    }
});

// Gestore per il cambio dell'area clinica (pagina trial)
studyClinicalAreasSelect.addEventListener("change", (e) => {
    const selectedAreas = Array.from(e.target.selectedOptions).map(
        (option) => option.value,
    );
    const specificAreas = new Set();
    selectedAreas.forEach((area) => {
        if (specificAreasMap[area]) {
            specificAreasMap[area].forEach((sa) => specificAreas.add(sa));
        }
    });

    if (specificAreas.size > 0) {
        studySpecificClinicalAreasSelect.innerHTML = "";
        specificAreas.forEach((area) => {
            const option = document.createElement("option");
            option.value = area;
            option.textContent = area;
            studySpecificClinicalAreasSelect.appendChild(option);
        });
        studySpecificClinicalAreaContainer.classList.remove("hidden");
    } else {
        studySpecificClinicalAreaContainer.classList.add("hidden");
    }
});

// Gestore per il cambio del setting di trattamento (pagina trial)
studyTreatmentSettingSelect.addEventListener("change", (e) => {
    if (e.target.value === "Metastatico") {
        studyTreatmentLineContainer.classList.remove("hidden");
    } else {
        studyTreatmentLineContainer.classList.add("hidden");
    }
});

// Gestore per il cambio dell'area clinica nel filtro dei trial
filterClinicalAreaSelect.addEventListener("change", (e) => {
    const selectedArea = e.target.value;
    if (
        selectedArea in specificAreasMap &&
        specificAreasMap[selectedArea].length > 0
    ) {
        populateSpecificAreasFilter(
            filterSpecificClinicalAreasSelect,
            specificAreasMap[selectedArea],
        );
        filterSpecificClinicalAreaContainer.classList.remove("hidden");
    } else {
        filterSpecificClinicalAreaContainer.classList.add("hidden");
    }
    filterAndRenderTrials();
});

// Gestore per il cambio del setting di trattamento nel filtro dei trial
filterTreatmentSettingSelect.addEventListener("change", () => {
    filterAndRenderTrials();
});

// Funzione per aggiungere un nuovo criterio nel form dei trials
function addCriteriaInput(criteria = "", type = "inclusion") {
    const criteriaId = `criteria-${Date.now()}`;
    const criteriaDiv = document.createElement("div");
    criteriaDiv.classList.add(
        "flex",
        "items-center",
        "space-x-2",
        "criteria-item",
    );
    criteriaDiv.innerHTML = `
        <div class="flex-grow">
            <input type="text" id="${criteriaId}" value="${criteria}" class="p-2 w-full border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-light-sage" placeholder="Descrivi il criterio" required>
        </div>
        <div class="flex-shrink-0">
            <button type="button" class="type-toggle-btn px-3 py-2 rounded-lg text-white font-medium ${type === "inclusion" ? "bg-sage" : "bg-red-500"}">
                ${type === "inclusion" ? "Inclusione" : "Esclusione"}
            </button>
        </div>
        <div class="flex-shrink-0">
            <button type="button" class="remove-criteria-btn text-gray-500 hover:text-red-500">
                <i class="fas fa-times-circle"></i>
            </button>
        </div>
    `;
    criteriaList.appendChild(criteriaDiv);

    // Gestore per il toggle del tipo di criterio
    const typeToggleBtn = criteriaDiv.querySelector(".type-toggle-btn");
    typeToggleBtn.addEventListener("click", () => {
        const isInclusion = typeToggleBtn.textContent.trim() === "Inclusione";
        if (isInclusion) {
            typeToggleBtn.textContent = "Esclusione";
            typeToggleBtn.classList.remove("bg-sage");
            typeToggleBtn.classList.add("bg-red-500");
        } else {
            typeToggleBtn.textContent = "Inclusione";
            typeToggleBtn.classList.remove("bg-red-500");
            typeToggleBtn.classList.add("bg-sage");
        }
    });

    // Gestore per la rimozione del criterio
    const removeBtn = criteriaDiv.querySelector(".remove-criteria-btn");
    removeBtn.addEventListener("click", () => {
        criteriaDiv.remove();
    });
}

// Listener per il pulsante "Aggiungi Criterio"
addCriteriaBtn.addEventListener("click", () => {
    addCriteriaInput();
});

// Funzione per caricare gli studi dalla API
async function fetchStudies() {
    try {
        const response = await fetch("/api/studies");
        if (!response.ok) throw new Error("Network response was not ok.");
        const studies = await response.json();
        allStudies = studies;
    } catch (error) {
        console.error("Errore nel recupero degli studi:", error);
        allStudies = [];
    }
}

// Funzione per renderizzare la lista degli studi
function renderTrialList(studies, targetId) {
    const targetElement = document.getElementById(targetId);
    if (!targetElement) {
        console.error(`Element with ID '${targetId}' not found.`);
        return;
    }
    targetElement.innerHTML = "";
    if (studies.length === 0) {
        targetElement.innerHTML = `<p class="text-gray-500 italic">Nessuno studio trovato.</p>`;
        return;
    }
    studies.forEach((study) => {
        const card = document.createElement("div");
        card.classList.add(
            "bg-white",
            "p-6",
            "rounded-xl",
            "shadow-md",
            "flex",
            "flex-col",
            "md:flex-row",
            "justify-between",
            "items-center",
            "cursor-pointer",
            "hover:shadow-lg",
            "transition-shadow",
        );
        card.innerHTML = `
            <div>
                <h3 class="text-xl font-bold text-dark-gray">${study.title}</h3>
                <p class="text-gray-600">${study.subtitle}</p>
                <p class="text-sm text-gray-500">Area Clinica: ${study.clinical_areas.join(", ")}</p>
                <p class="text-sm text-gray-500">Setting: ${study.treatment_setting}</p>
            </div>
            ${
                targetId === "trialList_TrialsPage"
                    ? `
            <div class="mt-4 md:mt-0">
                <button class="delete-study-btn bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition-colors" data-id="${study.id}">
                    <i class="fas fa-trash"></i> Elimina
                </button>
            </div>
            `
                    : ""
            }
        `;
        card.addEventListener("click", (e) => {
            // Evita che il click sul pulsante di eliminazione apra il modale
            if (e.target.closest(".delete-study-btn")) {
                return;
            }
            const isPatientView = targetId === "trialList";
            showModal(study, isPatientView);
        });

        // Aggiungi il listener per il pulsante di eliminazione
        if (targetId === "trialList_TrialsPage") {
            const deleteBtn = card.querySelector(".delete-study-btn");
            deleteBtn.addEventListener("click", async (e) => {
                e.stopPropagation(); // Previene l'apertura del modale
                const studyId = e.target.closest("button").dataset.id;
                await deleteStudy(studyId);
            });
        }

        targetElement.appendChild(card);
    });
}

// Funzione per filtrare e renderizzare gli studi nella pagina dei trial
function filterAndRenderTrials() {
    const filterArea = filterClinicalAreaSelect.value;
    const filterSpecificArea = filterSpecificClinicalAreasSelect.value;
    const filterSetting = filterTreatmentSettingSelect.value;

    const filteredStudies = allStudies.filter((study) => {
        const areaMatch =
            !filterArea || study.clinical_areas.includes(filterArea);
        const specificAreaMatch =
            !filterSpecificArea ||
            study.specific_clinical_areas.includes(filterSpecificArea);
        const settingMatch =
            !filterSetting || study.treatment_setting === filterSetting;
        return areaMatch && specificAreaMatch && settingMatch;
    });

    renderTrialList(filteredStudies, "trialList_TrialsPage");
}

// Funzione per caricare gli studi nella vista "Paziente"
async function loadStudiesForPatient() {
    await fetchStudies();
    patientTrialList.innerHTML = "";
}

// Funzione per caricare gli studi nella vista "Trial"
async function loadStudiesForTrials() {
    await fetchStudies();
    filterAndRenderTrials();
}

// Listener per la sottomissione del form di ricerca (pagina paziente)
searchForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const patientArea = patientClinicalArea.value;
    const patientSpecificArea = patientSpecificClinicalAreas.value;
    const patientSetting = patientTreatmentSetting.value;
    const patientLine = patientTreatmentLineInput.value
        ? parseInt(patientTreatmentLineInput.value)
        : null;

    const compatibleStudies = allStudies.filter((study) => {
        const areaMatch = study.clinical_areas.includes(patientArea);
        const specificAreaMatch =
            !patientSpecificArea ||
            study.specific_clinical_areas.includes(patientSpecificArea);
        const settingMatch = study.treatment_setting === patientSetting;

        let lineMatch = true;
        if (patientSetting === "Metastatico" && patientLine !== null) {
            lineMatch =
                patientLine >= study.min_treatment_line &&
                patientLine <= study.max_treatment_line;
        }

        return areaMatch && specificAreaMatch && settingMatch && lineMatch;
    });

    renderTrialList(compatibleStudies, "trialList");
});

// Listener per il pulsante "Controlla eleggibilità" nel modale
checkEligibilityBtn.addEventListener("click", () => {
    const criteriaToggles = document.querySelectorAll(".criteria-toggle");
    let isEligible = true;

    criteriaToggles.forEach((toggle) => {
        const parentSpan = toggle.nextElementSibling.nextElementSibling;
        const isInclusionCriteria =
            parentSpan.dataset.eligibility === "inclusion";
        const isChecked = toggle.checked;

        if (isInclusionCriteria && !isChecked) {
            isEligible = false;
        }
        if (!isInclusionCriteria && isChecked) {
            isEligible = false;
        }
    });

    eligibilityResultDiv.classList.remove("hidden");
    if (isEligible) {
        eligibilityResultDiv.textContent =
            "Eleggibilità verificata. Sei idoneo per questo studio!";
        eligibilityResultDiv.classList.remove("text-red-500");
        eligibilityResultDiv.classList.add("text-green-500");
    } else {
        eligibilityResultDiv.textContent =
            "Non sei idoneo per questo studio in base ai criteri inseriti.";
        eligibilityResultDiv.classList.remove("text-green-500");
        eligibilityResultDiv.classList.add("text-red-500");
    }
});

// Listener per la sottomissione del form di aggiunta studio (pagina trial)
studyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const criteria = [];
    document
        .querySelectorAll("#criteriaList .criteria-item")
        .forEach((item) => {
            const text = item.querySelector('input[type="text"]').value;
            const type =
                item.querySelector(".type-toggle-btn").textContent.trim() ===
                "Inclusione"
                    ? "inclusion"
                    : "exclusion";
            if (text) {
                criteria.push({ text, type });
            }
        });

    const newStudy = {
        title: studyTitleInput.value,
        subtitle: studySubtitleInput.value,
        clinical_areas: Array.from(
            studyClinicalAreasSelect.selectedOptions,
        ).map((opt) => opt.value),
        specific_clinical_areas: Array.from(
            studySpecificClinicalAreasSelect.selectedOptions,
        ).map((opt) => opt.value),
        treatment_setting: studyTreatmentSettingSelect.value,
        min_treatment_line: minTreatmentLineInput.value
            ? parseInt(minTreatmentLineInput.value)
            : null,
        max_treatment_line: maxTreatmentLineInput.value
            ? parseInt(maxTreatmentLineInput.value)
            : null,
        criteria: criteria,
    };

    try {
        const response = await fetch("/api/studies", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(newStudy),
        });
        if (!response.ok)
            throw new Error("Errore nel salvataggio dello studio.");

        // Svuota il form dopo il salvataggio
        studyForm.reset();
        criteriaList.innerHTML = "";
        studySpecificClinicalAreaContainer.classList.add("hidden");
        studyTreatmentLineContainer.classList.add("hidden");

        // Ricarica la lista degli studi
        loadStudiesForTrials();
    } catch (error) {
        console.error("Errore nel salvataggio dello studio:", error);
    }
});

// Funzione per eliminare uno studio
async function deleteStudy(id) {
    if (confirm("Sei sicuro di voler eliminare questo studio?")) {
        try {
            const response = await fetch(`/api/studies/${id}`, {
                method: "DELETE",
            });
            if (!response.ok)
                throw new Error("Errore nell'eliminazione dello studio.");

            // Ricarica la lista degli studi
            loadStudiesForTrials();
        } catch (error) {
            console.error("Errore nell'eliminazione dello studio:", error);
        }
    }
}

// Listener per la chiusura del modale
closeModalBtn.addEventListener("click", closeModal);

// Inizializzazione
document.addEventListener("DOMContentLoaded", () => {
    // Gestione della navigazione iniziale
    patientNav.addEventListener("click", () => setActiveView("patient-view"));
    trialsNav.addEventListener("click", () => setActiveView("trials-view"));
    setActiveView("patient-view");
});

// Chiamata iniziale per caricare i dati
loadStudiesForPatient();
