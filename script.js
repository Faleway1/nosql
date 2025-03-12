document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("address-form");
    const addressList = document.getElementById("addresses-list");
    const fieldSelection = document.querySelectorAll("#field-selection input");
    const limitSelect = document.getElementById("limit");
    const sortFieldSelect = document.getElementById("sortField");
    const sortOrderSelect = document.getElementById("sortOrder");
    const prevPageBtn = document.getElementById("prev-page");
    const nextPageBtn = document.getElementById("next-page");
    const pageInfo = document.getElementById("page-info");

    const API_URL = "http://localhost:3000/addresses";
    let page = 1;

    const getSelectedFields = () => {
        return Array.from(fieldSelection)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value)
            .join(",");
    };

    const loadAddresses = async () => {
        const limit = limitSelect.value;
        const sortField = sortFieldSelect.value;
        const sortOrder = sortOrderSelect.value;
        const fields = getSelectedFields();

        const response = await fetch(`${API_URL}?page=${page}&limit=${limit}&sortField=${sortField}&sortOrder=${sortOrder}&fields=${fields}`);
        const data = await response.json();
        addressList.innerHTML = "";

        document.getElementById("table-header").innerHTML = `<th>Actions</th>` + fields.split(",").map(field => `<th>${field}</th>`).join("");

        data.addresses.forEach(address => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>
                    <button onclick="editAddress('${address._id}')">Modifier</button>
                    <button onclick="deleteAddress('${address._id}')">Supprimer</button>
                </td>
                ${fields.split(",").map(field => `<td>${address[field] || ""}</td>`).join("")}
            `;
            addressList.appendChild(row);
        });

        pageInfo.textContent = `Page ${data.page} / ${Math.ceil(data.total / limit)}`;
        prevPageBtn.disabled = page <= 1;
        nextPageBtn.disabled = page >= Math.ceil(data.total / limit);
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const address = {
            numero: document.getElementById("numero").value,
            voie_nom: document.getElementById("voie_nom").value,
            code_postal: document.getElementById("code_postal").value,
            commune_nom: document.getElementById("ville").value,
            lat: document.getElementById("latitude").value,
            long: document.getElementById("longitude").value,
            date_der_maj: document.getElementById("date_der_maj").value
        };

        await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(address)
        });

        form.reset();
        loadAddresses();
    });

    window.deleteAddress = async (id) => {
        if (confirm("Voulez-vous vraiment supprimer cette adresse ?")) {
            await fetch(`${API_URL}/${id}`, { method: "DELETE" });
            loadAddresses();
        }
    };

    window.editAddress = (id) => {
        window.location.href = `edit.html?id=${id}`;
    };

    prevPageBtn.addEventListener("click", () => {
        if (page > 1) {
            page--;
            loadAddresses();
        }
    });

    nextPageBtn.addEventListener("click", () => {
        page++;
        loadAddresses();
    });

    fieldSelection.forEach(checkbox => checkbox.addEventListener("change", loadAddresses));
    limitSelect.addEventListener("change", () => { page = 1; loadAddresses(); });
    sortFieldSelect.addEventListener("change", loadAddresses);
    sortOrderSelect.addEventListener("change", loadAddresses);

    loadAddresses();
});