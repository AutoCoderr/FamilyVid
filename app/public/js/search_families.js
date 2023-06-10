function searchFamilies(search) {
    const body = JSON.stringify({search});
    fetch("/family/search", {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': body.length
        },
        body
    })
        .then(res => res.json())
        .then(showFamilies);
}

function showFamilies(families) {
    const tbody = document.getElementsByTagName("tbody")[0];
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }
    if (families.length > 0) {
        for (const family of families) {
            const tr = document.createElement("tr");

            const tdName = document.createElement("td");
            tdName.innerText = family.name;

            const tdMembers = document.createElement("td");
            tdMembers.innerText = family.nbmembers + " membres";

            const tdButton = document.createElement("td");
            const a = document.createElement("a");
            a.classList.add("btn");
            a.href = "/family/" + family.slug + "/members";
            a.innerText = "Voir";

            tdButton.appendChild(a);

            tr.appendChild(tdName);
            tr.appendChild(tdMembers);
            tr.appendChild(tdButton);

            tbody.appendChild(tr);
        }
    } else {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.innerText = "Aucune famille trouvée";

        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

window.addEventListener("DOMContentLoaded", (_) => {
    document.getElementById("family-search").focus();
    document.getElementById("family-search").addEventListener("input", function() {
       if (this.value === "") {
           const tbody = document.getElementsByTagName("tbody")[0];
           while (tbody.firstChild) {
               tbody.removeChild(tbody.firstChild);
           }
           const tr = document.createElement("tr");
           const td = document.createElement("td");
           td.innerText = "Faites une recherche";

           tr.appendChild(td);
           tbody.appendChild(tr);
       } else {
           searchFamilies(this.value);
       }
    });
})
