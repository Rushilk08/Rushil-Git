let records = JSON.parse(
    localStorage.getItem("registryRecords") || "[]"
);

const form = document.getElementById("recordForm");
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


function saveRecords() {
    localStorage.setItem(
        "registryRecords",
        JSON.stringify(records)
    );
}


function showMessage(message) {
    formMessage.textContent = message;

    setTimeout(function () {
        formMessage.textContent = "";
    }, 3000);
}


function renderRecords() {

    const search = searchInput.value.toLowerCase().trim();
    const category = filterCategory.value;

    const filtered = records.filter(function (record) {

        const matchesSearch =
            record.name.toLowerCase().includes(search) ||
            record.registryId.toLowerCase().includes(search) ||
            record.email.toLowerCase().includes(search) ||
            record.phone.toLowerCase().includes(search);

        const matchesCategory =
            category === "All" ||
            record.category === category;

        return matchesSearch && matchesCategory;
    });


    recordCount.textContent = filtered.length;


    if (filtered.length === 0) {

        recordsList.innerHTML =
            "<p>No records found.</p>";

        return;
    }


    recordsList.innerHTML = "";


    filtered.forEach(function (record) {

        const div = document.createElement("div");

        div.className = "record";


        div.innerHTML = `
            <div class="record-info">

                <div class="record-name">
                    ${record.name}
                    <span class="badge">
                        ${record.category}
                    </span>
                </div>

                <div class="record-details">
                    ID: ${record.registryId}
                    &nbsp; • &nbsp;
                    ${record.email || "No email"}
                    &nbsp; • &nbsp;
                    ${record.phone || "No phone"}
                </div>

            </div>

            <div class="record-actions">

                <button
                    class="btn secondary"
                    data-edit="${record.id}"
                >
                    Edit
                </button>

                <button
                    class="btn secondary delete"
                    data-delete="${record.id}"
                >
                    Delete
                </button>

            </div>
        `;


        recordsList.appendChild(div);
    });
}


form.addEventListener("submit", function (event) {

    event.preventDefault();


    const name = nameInput.value.trim();
    const registryId = registryIdInput.value.trim();
    const email = emailInput.value.trim();
    const phone = phoneInput.value.trim();
    const category = categoryInput.value;


    if (!name || !registryId) {

        showMessage(
            "Name and Registry ID are required."
        );

        return;
    }


    if (editId.value) {

        const index = records.findIndex(function (record) {
            return record.id === editId.value;
        });


        if (index !== -1) {

            records[index].name = name;
            records[index].registryId = registryId;
            records[index].email = email;
            records[index].phone = phone;
            records[index].category = category;

            saveRecords();
            renderRecords();

            form.reset();
            editId.value = "";

            submitButton.textContent = "Add Record";
            cancelButton.hidden = true;

            showMessage("Record updated.");

            return;
        }
    }


    const duplicate = records.some(function (record) {

        return record.registryId.toLowerCase() ===
            registryId.toLowerCase();

    });


    if (duplicate) {

        showMessage(
            "Registry ID already exists."
        );

        return;
    }


    const newRecord = {

        id: Date.now().toString(),

        name: name,

        registryId: registryId,

        email: email,

        phone: phone,

        category: category
    };


    records.push(newRecord);

    saveRecords();

    renderRecords();

    form.reset();

    showMessage("Record added successfully.");
});


cancelButton.addEventListener("click", function () {

    form.reset();

    editId.value = "";

    submitButton.textContent = "Add Record";

    cancelButton.hidden = true;
});


recordsList.addEventListener("click", function (event) {

    const editButton =
        event.target.closest("[data-edit]");

    const deleteButton =
        event.target.closest("[data-delete]");


    if (editButton) {

        const id = editButton.dataset.edit;

        const record = records.find(function (item) {
            return item.id === id;
        });


        if (!record) return;


        editId.value = record.id;

        nameInput.value = record.name;
        registryIdInput.value = record.registryId;
        emailInput.value = record.email;
        phoneInput.value = record.phone;
        categoryInput.value = record.category;

        submitButton.textContent = "Update Record";

        cancelButton.hidden = false;
    }


    if (deleteButton) {

        const id = deleteButton.dataset.delete;


        if (!confirm("Delete this record?")) {
            return;
        }


        records = records.filter(function (record) {
            return record.id !== id;
        });


        saveRecords();

        renderRecords();

        showMessage("Record deleted.");
    }

});


searchInput.addEventListener(
    "input",
    renderRecords
);


filterCategory.addEventListener(
    "change",
    renderRecords
);


renderRecords();
