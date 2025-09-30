let allFranchiseeData = [];

document.addEventListener("DOMContentLoaded", function () {
    loadDistricts();

    document.getElementById("districtDropdown").addEventListener("change", function () {
        const districtId = this.value;

        if (districtId === "clear") {
            this.selectedIndex = 0;
            document.getElementById("tehsilDropdown").innerHTML = `
                        <option value="clear">Select Tehsil</option>
                    `;
            return;
        }

        loadTehsils(districtId);
    });

    document.getElementById("tehsilDropdown").addEventListener("change", function () {
        if (this.value === "clear") {
            this.selectedIndex = 0;
        }
    });
});

function loadDistricts() {
    fetch('/Home/GetDistricts')
        .then(res => res.json())
        .then(data => {
            const districtSelect = document.getElementById("districtDropdown");
            districtSelect.innerHTML = `
                            <option value="clear">Select District</option>
                        `;
            data.forEach(d => {
                districtSelect.innerHTML += `<option value="${d.value}">${d.label}</option>`;
            });
        });
}

function loadTehsils(districtId) {
    fetch(`/Home/GetTehsils?districtId=${districtId}`)
        .then(res => res.json())
        .then(data => {
            const tehsilSelect = document.getElementById("tehsilDropdown");
            tehsilSelect.innerHTML = `
                            <option value="clear">Select Tehsil</option>
                        `;
            data.forEach(t => {
                tehsilSelect.innerHTML += `<option value="${t.value}">${t.label}</option>`;
            });
        });
}

function searchOffices() {
    const districtId = document.getElementById("districtDropdown").value;
    const tehsilId = document.getElementById("tehsilDropdown").value;

    if (!districtId || districtId === "clear") {
        document.getElementById("franchiseeCardsContainer").style.display = "none";;
        document.getElementById("cardPagination").style.display = "none";
        document.getElementById("cardCountSummary").style.display = "none";

        // Let DOM update before alert
        requestAnimationFrame(() => {
            setTimeout(() => {
                alert("Please select a District.");
            }, 0);
        });
        return;
    }

    fetch(`/Home/GetFranchiseeOffices?districtId=${districtId}&tehsilId=${tehsilId}`)
        .then(res => res.json())
        .then(data => {
            if (!data || data.length === 0) {
                document.getElementById("franchiseeCardsContainer").style.display = "none";
                document.getElementById("cardPagination").style.display = "none";
                document.getElementById("cardCountSummary").style.display = "none";
                // Let DOM update before alert
                requestAnimationFrame(() => {
                    setTimeout(() => {
                        alert("No offices found.");
                    }, 0);
                });
                return;
            }

            allFranchiseeData = data; // Store full data
            renderPaginatedCards(allFranchiseeData);
            document.getElementById("franchiseeCardsContainer").style.display = "flex";
            document.getElementById("franchiseeCardsContainer").scrollIntoView({ behavior: "smooth", block: "start" });
            document.getElementById("cardPagination").style.display = "flex";

        })
        .catch(err => {
            console.error("Error fetching offices:", err);
            document.getElementById("franchiseeCardsContainer").style.display = "none";
            document.getElementById("cardPagination").style.display = "none";
            document.getElementById("cardCountSummary").style.display = "none";
            // Let DOM update before alert
            requestAnimationFrame(() => {
                setTimeout(() => {
                    alert("No offices found.");
                }, 0);
            });
        });
}

function showFranchiseeModal(office) {
    const services = office.activeServices.join(", ");
    document.getElementById("modalBodyContent").innerHTML = `
                    <p><strong>Name:</strong> ${office.name}</p>
                    <p><strong>Email:</strong> ${office.email}</p>
                    <p><strong>Contact:</strong> ${office.phoneNo}</p>
                    <p><strong>District:</strong> ${office.district}</p>
                    <p><strong>Tehsil:</strong> ${office.tehsil}</p>
                    <p><strong>Address:</strong>📍 ${office.address}</p>
                    <p><strong>Active Services:</strong> ${services}</p>
                `;
    const modal = new bootstrap.Modal(document.getElementById('franchiseeModal'));
    modal.show();
}

function renderPaginatedCards(data) {
    const cardsPerPage = 15;
    const container = document.getElementById("franchiseeCardsContainer");
    const pagination = document.getElementById("cardPagination");

    let currentPage = 1;
    const totalPages = Math.ceil(data.length / cardsPerPage);

    function renderPage(page) {
        container.innerHTML = "";
        const start = (page - 1) * cardsPerPage;
        const end = Math.min(start + cardsPerPage, data.length);
        const pageData = data.slice(start, end);

        // Render cards
        pageData.forEach((office, index) => {
            const card = document.createElement("div");
            card.className = "col-12 col-sm-6 col-md-4 franchisee-card";
            card.innerHTML = `
                            <div class="franchisee-name">${office.name}</div>
                            <div class="franchisee-address">📍 ${office.address}</div>
                            <div class="text-end mt-3">
                                <a href="#" class="details-link">Details</a>
                            </div>
                        `;
            card.querySelector(".details-link").addEventListener("click", function (e) {
                e.preventDefault();
                showFranchiseeModal(office);
            });
            container.appendChild(card);
            setTimeout(() => card.classList.add("show"), index * 50);
        });

        // Update count summary
        const summary = document.getElementById("cardCountSummary");
        summary.innerText = `Showing ${start + 1} – ${end} out of ${data.length}`;
        summary.style.display = "block";
    }


    function renderPagination() {
        pagination.innerHTML = "";

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement("li");
            li.className = "page-item" + (i === currentPage ? " active" : "");
            li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
            li.addEventListener("click", function (e) {
                e.preventDefault();
                currentPage = i;
                renderPage(currentPage);
                renderPagination();
                container.scrollIntoView({ behavior: "smooth", block: "start" });
            });
            pagination.appendChild(li);
        }
    }

    renderPage(currentPage);
    renderPagination();
}

function filterCardsByName() {
    const query = document.getElementById("nameSearchInput").value.trim().toLowerCase();
    const filtered = allFranchiseeData.filter(item =>
        item.name.toLowerCase().includes(query)
    );

    renderPaginatedCards(filtered);
}


//     fetch(`/Home/GetFranchiseeOffices?districtId=${districtId}&tehsilId=${tehsilId}`)
//         .then(res => res.json())
//         .then(data => {
//             const container = document.getElementById("officeTableContainer");
//             const tbody = document.querySelector("#officeTable tbody");
//             tbody.innerHTML = "";

//             if (!data || data.length === 0) {
//                 container.style.display = "none";
//                 alert("No offices found for selected District and Tehsil.");
//                 return;
//             }

//             renderPaginatedTable(data);

//             container.style.display = "block";

//             document.getElementById("officeTableContainer").style.display = "block";
//             document.getElementById("officeTableContainer").scrollIntoView({
//                 behavior: "smooth",
//                 block: "start"
//             });


//         })
//         .catch(err => {
//             console.error("Error fetching offices:", err);
//             const container = document.getElementById("officeTableContainer");
//         container.style.display = "none";

//         // Let DOM update before alert
//         requestAnimationFrame(() => {
//             setTimeout(() => {
//             alert("No office records found.");
//             }, 0);
//         });
//         });
// }

// function renderPaginatedTable(data) {
//     const rowsPerPage = 10;
//     const tableBody = document.querySelector("#officeTable tbody");
//     const pagination = document.getElementById("pagination");

//     let currentPage = 1;
//     const totalPages = Math.ceil(data.length / rowsPerPage);

//     function renderPage(page) {
//         tableBody.innerHTML = "";
//         const start = (page - 1) * rowsPerPage;
//         const end = start + rowsPerPage;
//         const pageData = data.slice(start, end);

//         pageData.forEach((office, index) => {
//             const services = office.activeServices.join(", ");
//             const mapIcon = `<span style="cursor:pointer;">📍</span>`;
//             tableBody.innerHTML += `
//                 <tr>
//                     <td>${start + index + 1}</td>
//                     <td>${office.name}</td>
//                     <td>${office.email}</td>
//                     <td>${office.phoneNo}</td>
//                     <td>${office.address}</td>
//                     <td>${services}</td>
//                     <td>${mapIcon}</td>
//                 </tr>
//             `;
//         });
//     }

//     function renderPagination() {
//         pagination.innerHTML = "";
//         for (let i = 1; i <= totalPages; i++) {
//             const li = document.createElement("li");
//             li.className = "page-item" + (i === currentPage ? " active" : "");
//             li.innerHTML = `<a class="page-link" href="#">${i}</a>`;
//             li.addEventListener("click", function (e) {
//                 e.preventDefault();
//                 currentPage = i;
//                 renderPage(currentPage);
//                 renderPagination();
//             });
//             pagination.appendChild(li);
//         }
//     }

//     renderPage(currentPage);
//     renderPagination();
// }