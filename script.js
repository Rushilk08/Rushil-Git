// ==============================
// Registry System
// ==============================

// Load records from localStorage
let records = [];

try {
    records = JSON.parse(
        localStorage.getItem("registryRecords")
    ) || [];
} catch (error) {
    records = [];
    localStorage.removeItem("registryRecords");
}


// ==============================
// DOM Elements
// ==============================

const recordForm = document.getElementById("recordForm");
const editId = document.getElementById("editId");

const nameInput = document.getElementById("name");
const registryIdInput = document.getElementById("registryId");
const emailInput = document.getElementById("email");
const phoneInput = document.getElementById("phone");
const categoryInput = document.getElementById("category");

const submitButton = document.getElementById("submitButton");
const cancelButton = document.getElementById("cancelButton");
const formMessage = document.getElementById("formMessage");

const searchInput = document.getElementById("searchInput");
const filterCategory = document.getElementById("filterCategory");

const recordsList = document.getElementById("recordsList");
const recordCount = document.getElementById("recordCount");


// ==============================
// Save Records
// ==============================

function saveRecords() {
    localStorage.setItem(
        "registryRecords",
        JSON.stringify(records)
    );
}


// ==============================
// Generate Unique ID
// ==============================

function generateId() {
    return Date.now().toString();
}


// ==============================
// Escape HTML
// ==============================

function escapeHTML(value) {
    const div = document.createElement("div");
    div.textContent = value ?? "";
    return div.innerHTML;
}


// ==============================
// Show Message
// ==============================

function showMessage(message) {
    formMessage.textContent = message;

    setTimeout(() => {
        formMessage.textContent = "";
    }, 3000);
}


// ==============================
// Reset Form
// ==============================

function resetForm() {
    recordForm.reset();

    editId.value = "";

    submitButton.textContent = "Add Record";

    cancelButton.hidden = true;
}


// ==============================
// Render Records
// ==============================

function renderRecords() {

    const searchText = searchInput.value
        .trim()
        .toLowerCase();

    const selectedCategory = filterCategory.value;

    const filteredRecords = records.filter(record => {

        const matchesSearch =
            record.name.toLowerCase().includes(searchText) ||
            record.registryId.toLowerCase().includes(searchText) ||
            record.email.toLowerCase().includes(searchText) ||
            record.phone.toLowerCase().includes(searchText) ||
            record.category.toLowerCase().includes(searchText);

        const matchesCategory =
            selectedCategory === "All" ||
            record.category === selectedCategory;

        return matchesSearch && matchesCategory;
    });


    recordCount.textContent = filteredRecords.length;


    if (filteredRecords.length === 0) {

        recordsList.innerHTML = `
            <div class="empty">
                No records found.
            </div>
        `;

        return;
    }


    recordsList.innerHTML = filteredRecords
        .map(record => {

            return `
                <div class="record">

                    <div class="record-info">

                        <div class="record-name">
                            ${escapeHTML(record.name)}
                        </div>

                        <div class="record-details">
                            ID: ${escapeHTML(record.registryId)}
                            ${record.email
                                ? ` · ${escapeHTML(record.email)}`
                                : ""
                            }
                            ${record.phone
                                ? ` · ${escapeHTML(record.phone)}`
                                : ""
                            }

                            <span class="badge">
                                ${escapeHTML(record.category)}
                            </span>
                        </div>

                    </div>


                    <div class="record-actions">

                        <button
                            type="button"
                            class="btn secondary"
                            onclick="editRecord('${record.id}')"
                        >
                            Edit
                        </button>

                        <button
                            type="button"
                            class="btn secondary delete"
                            onclick="deleteRecord('${record.id}')"
                        >
                            Delete
                        </button>

                    </div>

                </div>
            `;
        })
        .join("");
}


// ==============================
// Add / Update Record
// ==============================

recordForm.addEventListener("submit", function (event) {

    event.preventDefault();


    const name = nameInput.value.trim();
    const registryId = registryIdInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const category = categoryInput.value;


    // Basic validation
    if (!name || !registryId) {
        showMessage("Name and Registry ID are required.");
        return;
    }


    // Check if editing
    if (editId.value) {

        const recordIndex = records.findIndex(
            record => record.id === editId.value
        );


        if (recordIndex !== -1) {

            records[recordIndex] = {
                id: editId.value,
                name: name,
                registryId: registryId,
                email: email,
                phone: phone,
                category: category
            };

            saveRecords();

            renderRecords();

            resetForm();

            showMessage("Record updated successfully.");

            return;
        }
    }


    // Check duplicate Registry ID
    const duplicate = records.some(
        record =>
            record.registryId.toLowerCase() ===
            registryId.toLowerCase()
    );


    if (duplicate) {
        showMessage("Registry ID already exists.");
        return;
    }


    // Create new record
    const newRecord = {

        id: generateId(),

        name: name,

        registryId: registryId,

        email: email,

        phone: phone,

        category: category
    };


    records.push(newRecord);


    // Save permanently
    saveRecords();


    // Update screen
    renderRecords();


    // Clear form
    resetForm();


    showMessage("Record added successfully.");
});


// ==============================
// Edit Record
// ==============================

function editRecord(id) {

    const record = records.find(
        item => item.id === id
    );


    if (!record) {
        return;
    }


    editId.value = record.id;

    nameInput.value = record.name;

    registryIdInput.value = record.registryId;

    emailInput.value = record.email;

    phoneInput.value = record.phone;

    categoryInput.value = record.category;


    submitButton.textContent = "Update Record";

    cancelButton.hidden = false;


    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


// ==============================
// Delete Record
// ==============================

function deleteRecord(id) {

    const record = records.find(
        item => item.id === id
    );


    if (!record) {
        return;
    }


    const confirmed = confirm(
        `Delete "${record.name}"?`
    );


    if (!confirmed) {
        return;
    }


    records = records.filter(
        item => item.id !== id
    );


    saveRecords();

    renderRecords();

    showMessage("Record deleted successfully.");
}


// ==============================
// Cancel Edit
// ==============================

cancelButton.addEventListener("click", function () {

    resetForm();

    showMessage("Edit cancelled.");
});


// ==============================
// Search
// ==============================

searchInput.addEventListener(
    "input",
    renderRecords
);


// ==============================
// Category Filter
// ==============================

filterCategory.addEventListener(
    "change",
    renderRecords
);


// ==============================
// Initial Display
// ==============================

renderRecords();
