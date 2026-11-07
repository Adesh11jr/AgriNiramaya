
// ==========================================
// AGRINIRAMAYA - FRONTEND JAVASCRIPT
// ==========================================


// 1. COMMON FUNCTIONS

function showMessage(form, message, type = "info") {
    let box = form.querySelector(".form-message");

    if (!box) {
        box = document.createElement("p");
        box.className = "form-message";
        box.setAttribute("role", "status");
        form.appendChild(box);
    }

    box.textContent = message;
    box.style.color = type === "error" ? "#c0392b" : "#245c36";
    box.style.marginTop = "12px";
}


// 2. PASSWORD SHOW / HIDE

function togglePassword(inputId, button) {
    const input = document.getElementById(inputId);

    if (!input) return;

    const showing = input.type === "password";

    input.type = showing ? "text" : "password";
    button.textContent = showing ? "Hide" : "Show";
}


// 3. LOCAL STORAGE FUNCTIONS

function getStoredData(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

function saveStoredData(key, data) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
        return true;
    } catch {
        return false;
    }
}


// 4. PAGE INITIALIZATION

document.addEventListener("DOMContentLoaded", function () {

    // ======================================
    // SIGN UP
    // ======================================

    const signupForm = document.querySelector(
        'form[action="/signup"]'
    );

    if (signupForm) {
        signupForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const password = signupForm.querySelector(
                '[name="password"]'
            );

            const confirmPassword = signupForm.querySelector(
                '[name="confirmPassword"], [name="confirm_password"], [name="confirm-password"]'
            );

            if (!password || !confirmPassword) return;

            if (password.value !== confirmPassword.value) {
                showMessage(
                    signupForm,
                    "Passwords do not match.",
                    "error"
                );
                return;
            }

            showMessage(
                signupForm,
                "Validation successful. Account creation requires backend integration."
            );
        });
    }


    // ======================================
    // LOGIN
    // ======================================

    const loginForm = document.querySelector(
        'form[action="/login"]'
    );

    if (loginForm) {
        loginForm.addEventListener("submit", function (event) {
            event.preventDefault();

            showMessage(
                loginForm,
                "Login validation complete. Backend authentication is pending."
            );
        });
    }


    // ======================================
    // FORGOT PASSWORD
    // ======================================

    const forgotForm = document.querySelector(
        'form[action="/forgot-password"]'
    );

    if (forgotForm) {
        forgotForm.addEventListener("submit", function (event) {
            event.preventDefault();

            showMessage(
                forgotForm,
                "Password reset requires backend and email integration."
            );
        });
    }


    // ======================================
    // FARM MANAGEMENT
    // ======================================

    const farmForm = document.getElementById("farmForm");

    function displayFarmRecords() {
        const container = document.getElementById("farmRecords");

        if (!container) return;

        const farms = getStoredData("agriFarms");

        container.replaceChildren();

        if (farms.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent = "No Farm Records Yet.";
            container.appendChild(emptyMessage);
            return;
        }

        farms.forEach(function (farm) {
            const card = document.createElement("div");
            card.className = "farm-record";

            const heading = document.createElement("h3");
            heading.textContent = farm.name || "Unnamed Farm";

            const location = document.createElement("p");
            location.textContent = "Location: " + (farm.location || "Not provided");

            const crop = document.createElement("p");
            crop.textContent = "Crop: " + (farm.crop || "Not provided");

            const size = document.createElement("p");
            size.textContent = "Farm Size: " + (farm.size || "Not provided");

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.textContent = "Delete";

            deleteButton.addEventListener("click", function () {
                const updatedFarms = getStoredData("agriFarms")
                    .filter(function (item) {
                        return item.id !== farm.id;
                    });

                if (saveStoredData("agriFarms", updatedFarms)) {
                    displayFarmRecords();
                    updateDashboard();
                }
            });

            card.append(heading, location, crop, size, deleteButton);
            container.appendChild(card);
        });
    }

    if (farmForm) {
        farmForm.addEventListener("submit", function (event) {
            event.preventDefault();

            if (!farmForm.reportValidity()) return;

            const formData = new FormData(farmForm);

            const farm = {
                id: Date.now().toString(),
                name: formData.get("farmName") || "",
                location: formData.get("location") || "",
                size: formData.get("farmSize") || "",
                crop: formData.get("cropType") || "",
                variety: formData.get("cropVariety") || "",
                soil: formData.get("soilType") || "",
                irrigation: formData.get("irrigation") || ""
            };

            const farms = getStoredData("agriFarms");
            farms.push(farm);

            if (saveStoredData("agriFarms", farms)) {
                showMessage(farmForm, "Farm details saved in this browser.");
                farmForm.reset();
                displayFarmRecords();
                updateDashboard();
            } else {
                showMessage(
                    farmForm,
                    "Unable to save data in this browser.",
                    "error"
                );
            }
        });
    }

    displayFarmRecords();


    // ======================================
    // DASHBOARD
    // ======================================

    function updateDashboard() {
        const farms = getStoredData("agriFarms");

        const farmCount = document.querySelector(
            '[data-dashboard="farms"]'
        );

        if (farmCount) {
            farmCount.textContent = farms.length;
        }

        const cropCount = document.querySelector(
            '[data-dashboard="crops"]'
        );

        if (cropCount) {
            const crops = new Set(
                farms.map(farm => farm.crop).filter(Boolean)
            );

            cropCount.textContent = crops.size;
        }
    }

    updateDashboard();


    // ======================================
    // DISEASE DETECTION IMAGE PREVIEW
    // ======================================

    const plantInput = document.getElementById("plantImage");

    if (plantInput) {
        plantInput.addEventListener("change", function () {
            const file = plantInput.files[0];

            if (!file) return;

            if (!file.type.startsWith("image/")) {
                showMessage(
                    plantInput.parentElement,
                    "Please select a valid image.",
                    "error"
                );

                plantInput.value = "";
                return;
            }

            const oldPreview = document.getElementById("plantPreview");

            if (oldPreview && oldPreview.dataset.objectUrl) {
                URL.revokeObjectURL(oldPreview.dataset.objectUrl);
            }

            let preview = document.getElementById("plantPreview");

            if (!preview) {
                preview = document.createElement("img");
                preview.id = "plantPreview";
                preview.style.maxWidth = "100%";
                preview.style.maxHeight = "300px";
                preview.style.objectFit = "contain";

                plantInput.parentElement.appendChild(preview);
            }

            const imageURL = URL.createObjectURL(file);

            preview.src = imageURL;
            preview.dataset.objectUrl = imageURL;
            preview.alt = "Selected plant image";
        });
    }


    // ======================================
    // DISEASE ANALYSIS BUTTON
    // ======================================

    const analyseButton = document.getElementById("analyseButton");

    if (analyseButton) {
        analyseButton.addEventListener("click", function () {
            if (!plantInput || !plantInput.files.length) {
                alert("Please upload a plant image first.");
                return;
            }

            alert(
                "Image selected successfully. Disease prediction API integration is pending."
            );
        });
    }


    // ======================================
    // AI AGRICULTURE ASSISTANT
    // ======================================

    const chatForm = document.getElementById("chatForm");

    if (chatForm) {
        chatForm.addEventListener("submit", function (event) {
            event.preventDefault();

            const input = chatForm.querySelector(
                "input, textarea"
            );

            const messages = document.getElementById("chatMessages");

            if (!input || !messages || !input.value.trim()) return;

            const message = document.createElement("div");
            message.className = "chat-message user-message";
            message.textContent = input.value.trim();

            messages.appendChild(message);

            input.value = "";

            const notice = document.createElement("p");
            notice.className = "chat-notice";
            notice.textContent =
                "Your question has been added. AI response integration is pending.";

            messages.appendChild(notice);
        });
    }


    // ======================================
    // CONTACT FORM
    // ======================================

    const contactForm = document.querySelector(
        'form[action="/contact"]'
    );

    if (contactForm) {
        contactForm.addEventListener("submit", function (event) {
            event.preventDefault();

            showMessage(
                contactForm,
                "Your message is ready. Message sending requires backend integration."
            );
        });
    }


    // ======================================
    // HISTORY PAGE
    // ======================================

    const farmHistory = document.getElementById("farmHistory");

    if (farmHistory) {
        const farms = getStoredData("agriFarms");

        farmHistory.textContent = farms.length
            ? farms.length + " farm records available in this browser."
            : "No farm records available yet.";
    }

});
