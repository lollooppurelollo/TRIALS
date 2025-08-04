// public/js/client.js
// Questo script gestisce tutta la logica di interazione lato client.

document.addEventListener("DOMContentLoaded", () => {
    // Definizione delle aree cliniche per i dropdown dinamici
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

    // Modal di conferma/avviso
    const genericModal = document.getElementById("genericModal");
    const genericModalContent = document.getElementById("genericModalContent");
    const genericCloseBtn = document.getElementById("genericCloseBtn");
    const confirmBtn = document.getElementById("confirmBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const okBtn = document.getElementById("okBtn");

    function showModal(message, type, callback) {
        genericModalContent.innerHTML = `<p>${message}</p>`;
        genericModal.classList.remove("hidden");

        confirmBtn.classList.add("hidden");
        cancelBtn.classList.add("hidden");
        okBtn.classList.add("hidden");

        if (type === "confirm") {
            confirmBtn.classList.remove("hidden");
            cancelBtn.classList.remove("hidden");
            confirmBtn.onclick = () => {
                genericModal.classList.add("hidden");
                callback(true);
            };
            cancelBtn.onclick = () => {
                genericModal.classList.add("hidden");
                callback(false);
            };
        } else {
            // 'alert'
            okBtn.classList.remove("hidden");
            okBtn.onclick = () => {
                genericModal.classList.add("hidden");
                if (callback) callback();
            };
        }
        genericCloseBtn.onclick = () => {
            genericModal.classList.add("hidden");
            if (callback) callback(false);
        };
    }

    // --- Logica per la pagina 'Paziente' ---
    const patientSearchForm = document.getElementById("patientSearchForm");
    const patientClinicalAreaSelect = document.getElementById("clinicalArea");
    const patientTreatmentSettingSelect =
        document.getElementById("treatmentSetting");
    const specificAreaContainer = document.getElementById(
        "specificAreaContainer",
    );
    const specificClinicalAreaSelect = document.getElementById(
        "specificClinicalArea",
    );
    const treatmentLineContainer = document.getElementById(
        "treatmentLineContainer",
    );
    const searchResultsDiv = document.getElementById("searchResults");
    const studyDetailModal = document.getElementById("studyDetailModal");
    const modalTitle = document.getElementById("modalTitle");
    const modalSubtitle = document.getElementById("modalSubtitle");
    const criteriaContainer = document.getElementById("criteriaContainer");
    const checkEligibilityBtn = document.getElementById("checkEligibilityBtn");
    const eligibilityResultDiv = document.getElementById("eligibilityResult");
    const closeModalBtn = document.querySelector(
        "#studyDetailModal .close-button",
    );

    if (patientClinicalAreaSelect) {
        patientClinicalAreaSelect.addEventListener("change", (e) => {
            updateSpecificAreasDropdown(
                e.target.value,
                specificClinicalAreaSelect,
                specificAreaContainer,
            );
        });

        patientTreatmentSettingSelect.addEventListener("change", (e) => {
            if (e.target.value === "Metastatico") {
                treatmentLineContainer.classList.remove("hidden");
            } else {
                treatmentLineContainer.classList.add("hidden");
            }
        });

        patientSearchForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(patientSearchForm);
            const data = Object.fromEntries(formData.entries());

            data.patient_treatment_line =
                parseInt(data.patient_treatment_line, 10) || null;

            searchResultsDiv.innerHTML =
                '<div class="text-center text-gray-500">Ricerca in corso...</div>';

            try {
                const response = await fetch("/api/search", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(data),
                });
                const studies = await response.json();

                if (studies.length === 0) {
                    searchResultsDiv.innerHTML =
                        '<div class="card p-4 text-center">Nessuno studio trovato per i criteri selezionati.</div>';
                } else {
                    searchResultsDiv.innerHTML = studies
                        .map(
                            (study) => `
                        <div class="study-card" data-study-id="${study.id}">
                            <h3 class="text-lg font-semibold">${study.title}</h3>
                            <p class="text-secondary-text">${study.subtitle}</p>
                        </div>
                    `,
                        )
                        .join("");

                    document.querySelectorAll(".study-card").forEach((card) => {
                        card.addEventListener("click", () =>
                            showStudyDetails(card.dataset.studyId, studies),
                        );
                    });
                }
            } catch (error) {
                console.error("Errore durante la ricerca:", error);
                showModal(
                    "Si è verificato un errore durante la ricerca.",
                    "alert",
                );
            }
        });
    }

    // --- Logica per la pagina 'Trial' ---
    const studyForm = document.getElementById("studyForm");
    const studyClinicalAreasSelect =
        document.getElementById("studyClinicalAreas");
    const studySpecificAreaContainer = document.getElementById(
        "studySpecificAreaContainer",
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
    const criteriaListDiv = document.getElementById("criteriaList");
    const addCriteriaBtn = document.getElementById("addCriteriaBtn");
    const trialListDiv = document.getElementById("trialList");

    if (studyClinicalAreasSelect) {
        studyClinicalAreasSelect.addEventListener("change", () => {
            const selectedAreas = Array.from(
                studyClinicalAreasSelect.selectedOptions,
            ).map((option) => option.value);
            updateSpecificAreasDropdownMultiple(
                selectedAreas,
                studySpecificClinicalAreasSelect,
                studySpecificAreaContainer,
            );
        });

        studyTreatmentSettingSelect.addEventListener("change", (e) => {
            if (e.target.value === "Metastatico") {
                studyTreatmentLineContainer.classList.remove("hidden");
            } else {
                studyTreatmentLineContainer.classList.add("hidden");
            }
        });

        if (addCriteriaBtn) {
            addCriteriaBtn.addEventListener("click", addCriteriaRow);
        }

        studyForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const formData = new FormData(studyForm);
            const data = {
                title: formData.get("title"),
                subtitle: formData.get("subtitle"),
                clinical_areas: Array.from(
                    studyClinicalAreasSelect.selectedOptions,
                ).map((option) => option.value),
                specific_clinical_areas: Array.from(
                    studySpecificClinicalAreasSelect.selectedOptions,
                ).map((option) => option.value),
                treatment_setting: formData.get("treatment_setting"),
                min_treatment_line:
                    parseInt(formData.get("min_treatment_line"), 10) || null,
                max_treatment_line:
                    parseInt(formData.get("max_treatment_line"), 10) || null,
                criteria: getCriteriaData(),
            };

            const response = await fetch("/api/studies", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                showModal("Studio salvato con successo!", "alert", () => {
                    studyForm.reset();
                    studySpecificAreaContainer.classList.add("hidden");
                    studyTreatmentLineContainer.classList.add("hidden");
                    resetCriteriaList();
                    fetchAndRenderTrials();
                });
            } else {
                showModal(
                    "Errore durante il salvataggio dello studio.",
                    "alert",
                );
            }
        });

        fetchAndRenderTrials();
    }

    // --- Funzioni comuni ---

    function getCriteriaData() {
        const criteriaItems =
            criteriaListDiv.querySelectorAll(".criteria-item");
        return Array.from(criteriaItems).map((item) => ({
            text: item.querySelector(".criteria-input").value,
            type: item.querySelector(".criteria-type").value,
            prefers:
                item.querySelector(".criteria-type").value === "inclusion"
                    ? "yes"
                    : "no",
        }));
    }

    function addCriteriaRow() {
        const row = document.createElement("div");
        row.className = "criteria-item flex items-center space-x-2";
        row.innerHTML = `
            <input type="text" class="criteria-input form-input flex-grow" placeholder="Inserisci un criterio">
            <select class="criteria-type form-select w-32">
                <option value="inclusion">Inclusione</option>
                <option value="exclusion">Esclusione</option>
            </select>
            <button type="button" class="remove-criteria-btn text-red-500 hover:text-red-700">
                <i class="fas fa-trash-alt"></i>
            </button>
        `;
        criteriaListDiv.appendChild(row);
        row.querySelector(".remove-criteria-btn").addEventListener(
            "click",
            (e) => e.target.closest(".criteria-item").remove(),
        );
    }

    function resetCriteriaList() {
        criteriaListDiv.innerHTML = `<div class="criteria-item flex items-center space-x-2">
            <input type="text" class="criteria-input form-input flex-grow" placeholder="Inserisci un criterio di inclusione">
            <select class="criteria-type form-select w-32">
                <option value="inclusion" selected>Inclusione</option>
                <option value="exclusion">Esclusione</option>
            </select>
            <button type="button" class="remove-criteria-btn text-red-500 hover:text-red-700">
                <i class="fas fa-trash-alt"></i>
            </button>
        </div>`;
    }

    async function fetchAndRenderTrials() {
        const response = await fetch("/api/studies");
        const studies = await response.json();

        const studiesBySetting = studies.reduce((acc, study) => {
            const setting = study.treatment_setting;
            if (!acc[setting]) {
                acc[setting] = [];
            }
            acc[setting].push(study);
            return acc;
        }, {});

        trialListDiv.innerHTML = "";
        if (studies.length === 0) {
            trialListDiv.innerHTML =
                '<p class="text-center text-gray-500">Nessuno studio attivo trovato.</p>';
            return;
        }

        for (const setting in studiesBySetting) {
            trialListDiv.innerHTML += `
                <div class="mb-6">
                    <h3 class="text-lg font-bold mb-2">${setting}</h3>
                    <div class="space-y-4">
                        ${studiesBySetting[setting]
                            .map(
                                (study) => `
                            <div class="study-card" data-study-id="${study.id}">
                                <h4 class="font-semibold">${study.title}</h4>
                                <p class="text-secondary-text">${study.subtitle}</p>
                                <div class="mt-2 text-right">
                                    <button class="btn btn-danger btn-sm remove-study-btn" data-id="${study.id}">
                                        <i class="fas fa-trash-alt"></i>
                                    </button>
                                </div>
                            </div>
                        `,
                            )
                            .join("")}
                    </div>
                </div>
            `;
        }

        document.querySelectorAll(".remove-study-btn").forEach((btn) => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const studyId = btn.dataset.id;
                showModal(
                    "Sei sicuro di voler rimuovere questo studio?",
                    "confirm",
                    async (confirmed) => {
                        if (confirmed) {
                            await fetch(`/api/studies/${studyId}`, {
                                method: "DELETE",
                            });
                            fetchAndRenderTrials();
                        }
                    },
                );
            });
        });

        document.querySelectorAll(".study-card").forEach((card) => {
            card.addEventListener("click", (e) => {
                if (!e.target.closest(".remove-study-btn")) {
                    const studyId = card.dataset.studyId;
                    const study = studies.find((s) => s.id === studyId);
                    showStudyDetails(studyId, [study]);
                }
            });
        });
    }

    function showStudyDetails(studyId, studies) {
        const study = studies.find((s) => s.id === studyId);
        if (!study) return;

        modalTitle.textContent = study.title;
        modalSubtitle.textContent = study.subtitle;
        eligibilityResultDiv.textContent = "";
        criteriaContainer.innerHTML = "";

        study.criteria.forEach((criterion) => {
            const row = document.createElement("div");
            row.className = "flex items-center justify-between mb-2";
            row.innerHTML = `
                <span>${criterion.text}</span>
                <label class="toggle-switch-container">
                    <span class="text-sm">No</span>
                    <span class="toggle-switch">
                        <input type="checkbox" class="criteria-toggle" data-preferred="${criterion.prefers}">
                        <span class="slider"></span>
                    </span>
                    <span class="text-sm">Sì</span>
                </label>
            `;
            const toggleInput = row.querySelector(".criteria-toggle");
            if (criterion.prefers === "yes") {
                toggleInput.checked = true;
            }
            criteriaContainer.appendChild(row);
        });

        studyDetailModal.classList.remove("hidden");

        checkEligibilityBtn.onclick = () => {
            let isEligible = true;
            const toggles =
                criteriaContainer.querySelectorAll(".criteria-toggle");
            toggles.forEach((toggle) => {
                const preferred = toggle.dataset.preferred;
                const currentValue = toggle.checked ? "yes" : "no";
                if (currentValue !== preferred) {
                    isEligible = false;
                }
            });

            if (isEligible) {
                eligibilityResultDiv.textContent =
                    "Paziente eleggibile per lo studio!";
                eligibilityResultDiv.style.color = "#5C7C5A";
            } else {
                eligibilityResultDiv.textContent =
                    "Paziente al momento non eleggibile per lo studio.";
                eligibilityResultDiv.style.color = "#D32F2F";
            }
        };
    }

    closeModalBtn.addEventListener("click", () => {
        studyDetailModal.classList.add("hidden");
    });

    function updateSpecificAreasDropdown(
        selectedArea,
        selectElement,
        container,
    ) {
        const specificAreas = specificClinicalAreasMap[selectedArea] || [];
        selectElement.innerHTML =
            '<option value="" selected>Qualsiasi</option>';
        if (specificAreas.length > 0) {
            specificAreas.forEach((area) => {
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                selectElement.appendChild(option);
            });
            container.classList.remove("hidden");
        } else {
            container.classList.add("hidden");
        }
    }

    function updateSpecificAreasDropdownMultiple(
        selectedAreas,
        selectElement,
        container,
    ) {
        const allSpecificAreas = new Set();
        selectedAreas.forEach((area) => {
            const specificAreas = specificClinicalAreasMap[area];
            if (specificAreas) {
                specificAreas.forEach((sa) => allSpecificAreas.add(sa));
            }
        });

        selectElement.innerHTML = "";
        if (allSpecificAreas.size > 0) {
            Array.from(allSpecificAreas).forEach((area) => {
                const option = document.createElement("option");
                option.value = area;
                option.textContent = area;
                selectElement.appendChild(option);
            });
            container.classList.remove("hidden");
        } else {
            container.classList.add("hidden");
        }
    }
});
