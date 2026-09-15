// =====================================
// Registry System
// =====================================

// Load saved records from the browser.
// If there are no saved records, start with an empty array.
let records = JSON.parse(
    localStorage.getItem("registryRecords")
) || [];


// =====================================
// DOM Elements
// =====================================

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


// =====================================
// Save Records
// =====================================

function saveRecords() {

    localStorage.setItem(
        "registryRecords",
        JSON.stringify(records)
    );
}


// =====================================
// Display Records
// =====================================

function renderRecords() {

    const searchText =
        searchInput.value
            .trim()
            .toLowerCase();

    const selectedCategory =
        filterCategory.value;


    const filteredRecords =
        records.filter(record => {

            const matchesSearch =

                record.name
                    .toLowerCase()
                    .includes(searchText)

                ||

                record.registryId
                    .toLowerCase()
                    .includes(searchText)

                ||

                record.email
                    .toLowerCase()
                    .includes(searchText)

                ||

                record.phone
                    .toLowerCase()
                    .includes(searchText)

                ||

                record.category
                    .toLowerCase()
                    .includes(searchText);


            const matchesCategory =

                selectedCategory === "All"

                ||

                record.category ===
                    selectedCategory;


            return (
                matchesSearch &&
                matchesCategory
            );
        });


    // Update total record count
    recordCount.textContent =
        records.length;


    // No records
    if (filteredRecords.length === 0) {

        recordsList.innerHTML = `
            <div class="empty">
                No records found.
            </div>
        `;

        return;
    }


    // Display records
    recordsList.innerHTML =
        filteredRecords.map(record => {

            return `

                <div class="record">

                    <div class="record-info">

                        <div class="record-name">

                            ${escapeHTML(record.name)}

                            <span class="badge">
                                ${escapeHTML(record.category)}
                            </span>

                        </div>


                        <div class="record-details">

                            ID:
                            ${escapeHTML(record.registryId)}

                            &nbsp; • &nbsp;

                            ${escapeHTML(
                                record.email ||
                                "No email"
                            )}

                            &nbsp; • &nbsp;

                            ${escapeHTML(
                                record.phone ||
                                "No phone"
                            )}

                        </div>

                    </div>


                    <div class="record-actions">

                        <button
                            class="btn secondary"
                            data-action="edit"
                            data-id="${record.id}"
                        >
                            Edit
                        </button>


                        <button
                            class="btn secondary delete"
                            data-action="delete"
                            data-id="${record.id}"
                        >
                            Delete
                        </button>

                    </div>

                </div>

            `;

        }).join("");
}


// =====================================
// Add / Update Record
// =====================================

recordForm.addEventListener(
    "submit",
    function(event) {

        event.preventDefault();


        const name =
            nameInput.value.trim();

        const registryId =
            registryIdInput.value.trim();

        const email =
            emailInput.value.trim();

        const phone =
            phoneInput.value.trim();

        const category =
            categoryInput.value;


        // Check required fields
        if (!name || !registryId) {

            showMessage(
                "Name and Registry ID are required."
            );

            return;
        }


        // Check duplicate Registry ID
        const duplicate =
            records.some(record => {

                return (

                    record.registryId
                        .toLowerCase() ===
                    registryId.toLowerCase()

                    &&

                    record.id !==
                        editId.value

                );

            });


        if (duplicate) {

            showMessage(
                "That Registry ID already exists."
            );

            return;
        }


        // =================================
        // Update existing record
        // =================================

        if (editId.value) {

            const record =
                records.find(
                    r => r.id === editId.value
                );


            if (record) {

                record.name =
                    name;

                record.registryId =
                    registryId;

                record.email =
                    email;

                record.phone =
                    phone;

                record.category =
                    category;
            }


            showMessage(
                "Record updated successfully."
            );

        }


        // =================================
        // Add new record
        // =================================

        else {

            const newRecord = {

                id:
                    Date.now().toString(),

                name:
                    name,

                registryId:
                    registryId,

                email:
                    email,

                phone:
                    phone,

                category:
                    category
            };


            records.push(newRecord);


            showMessage(
                "Record added successfully."
            );
        }


        // Save to browser
        saveRecords();


        // Refresh display
        renderRecords();


        // Clear form
        resetForm();
    }
);


// =====================================
// Edit / Delete Buttons
// =====================================

recordsList.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest("button");


        if (!button) {
            return;
        }


        const action =
            button.dataset.action;

        const id =
            button.dataset.id;


        if (action === "edit") {

            editRecord(id);
        }


        if (action === "delete") {

            deleteRecord(id);
        }
    }
);


// =====================================
// Edit Record
// =====================================

function editRecord(id) {

    const record =
        records.find(
            r => r.id === id
        );


    if (!record) {
        return;
    }


    editId.value =
        record.id;

    nameInput.value =
        record.name;

    registryIdInput.value =
        record.registryId;

    emailInput.value =
        record.email;

    phoneInput.value =
        record.phone;

    categoryInput.value =
        record.category;


    submitButton.textContent =
        "Update Record";

    cancelButton.hidden =
        false;


    nameInput.focus();
}


// =====================================
// Delete Record
// =====================================

function deleteRecord(id) {

    const record =
        records.find(
            r => r.id === id
        );


    if (!record) {
        return;
    }


    const confirmed =
        confirm(
            `Delete ${record.name}?`
        );


    if (!confirmed) {
        return;
    }


    records =
        records.filter(
            r => r.id !== id
        );


    // Save updated records
    saveRecords();


    // Refresh page data
    renderRecords();


    showMessage(
        "Record deleted."
    );
}


// =====================================
// Cancel Editing
// =====================================

cancelButton.addEventListener(
    "click",
    function() {

        resetForm();
    }
);


// =====================================
// Reset Form
// =====================================

function resetForm() {

    recordForm.reset();

    editId.value = "";

    submitButton.textContent =
        "Add Record";

    cancelButton.hidden =
        true;
}


// =====================================
// Search
// =====================================

searchInput.addEventListener(
    "input",
    function() {

        renderRecords();
    }
);


// =====================================
// Category Filter
// =====================================

filterCategory.addEventListener(
    "change",
    function() {

        renderRecords();
    }
);


// =====================================
// Message
// =====================================

function showMessage(message) {

    formMessage.textContent =
        message;


    setTimeout(
        function() {

            formMessage.textContent =
                "";

        },
        3000
    );
}


// =====================================
// Security
// =====================================

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


// =====================================
// Start Application
// =====================================

renderRecords();
