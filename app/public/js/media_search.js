let search = "";

let sortBy = "date"; // 'date' or 'name'
let toDisplay = "all" // 'all', 'video', or 'picture'
let sort = "ASC"; // 'ASC' or 'DESC'

let familyId;
let sectionId;

let globalSearch;

function searchMedias() {
    const data = {search,sortBy,toDisplay,sort};
    return fetch(globalSearch ? "/family/"+familyId+"/sections/global/search" : "/family/"+familyId+"/sections/"+sectionId+"/search", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function generateMediaList(medias) {
    let tbody = document.getElementsByTagName("tbody")[0];
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (medias.length > 0) {
        for (const media of medias) {
            const tr = document.createElement("tr");

            const tdName = document.createElement("td");
            tdName.innerText = media.name;
            tr.appendChild(tdName);

            const tdDate = document.createElement("td");
            tdDate.innerText = media.date;
            tr.appendChild(tdDate);

            const tdType = document.createElement("td");
            tdType.innerText = media.type === "video" ? "Vidéo" : "Photo";
            tr.appendChild(tdType);

            if (globalSearch) {
                const tdSection = document.createElement("td");
                const linkSection = document.createElement("a");

                linkSection.href = "/family/"+familyId+"/sections/"+media.sectionId+"/";
                linkSection.innerText = media.sectionName;
                tdSection.appendChild(linkSection);
                tr.appendChild(tdSection);
            }

            const tdButtons = document.createElement("td");
            const editButton = document.createElement("a");

            editButton.classList.add("btn");
            editButton.href = "/family/"+familyId+"/sections/"+sectionId+"/edit/"+media.id;
            editButton.innerText = "Modifier";

            tdButtons.appendChild(editButton);
            tr.appendChild(tdButtons);

            tbody.appendChild(tr);
        }
    } else {
        const tr = document.createElement("tr");
        const td = document.createElement("td");

        td.colSpan = globalSearch ? 5 : 4;
        td.innerText = "Aucun média n'a été trouvé";

        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
   document.getElementById("sortBy_filter").addEventListener("change", async function() {
       sortBy = this.value;
       generateMediaList(await searchMedias());
   });
   document.getElementById("toDisplay_filter").addEventListener("change",async function() {
       toDisplay = this.value;
       generateMediaList(await searchMedias());
   });
   document.getElementById("sort_filter").addEventListener("change", async function() {
       sort = this.value;
       generateMediaList(await searchMedias());
   });
   document.getElementById("input_search").addEventListener("input", async function() {
       search = this.value;
       generateMediaList(await searchMedias());
   });
});