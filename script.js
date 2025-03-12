document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("address-form");
    const addressList = document.getElementById("addresses-list");

    const API_URL = "http://localhost:3000/addresses";

    const loadAddresses = async () => {
        const response = await fetch(API_URL);
        const data = await response.json();
        addressList.innerHTML = "";
        data.addresses.forEach(address => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${address.numero || ""}</td>
                <td>${address.voie_nom || ""}</td>
                <td>${address.code_postal || ""}</td>
                <td>${address.ville || ""}</td>
                <td>${address.pays || ""}</td>
                <td>${address.latitude || ""}</td>
                <td>${address.longitude || ""}</td>
                <td>${address.date_der_maj ? new Date(address.date_der_maj).toLocaleDateString() : ""}</td>
                <td><button onclick="deleteAddress('${address._id}')">Supprimer</button></td>
            `;
            addressList.appendChild(row);
        });
    };

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const address = {
            numero: document.getElementById("numero").value,
            voie_nom: document.getElementById("voie_nom").value,
            code_postal: document.getElementById("code_postal").value,
            ville: document.getElementById("ville").value,
            pays: document.getElementById("pays").value,
            latitude: document.getElementById("latitude").value,
            longitude: document.getElementById("longitude").value,
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
        await fetch(`${API_URL}/${id}`, { method: "DELETE" });
        loadAddresses();
    };

    loadAddresses();
});