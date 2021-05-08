let search = "";

let sortBy = "date"; // 'date' or 'name'
let toDisplay = "all" // 'all', 'video', or 'picture'
let sort = "ASC"; // 'ASC' or 'DESC'

let familySlug;
let sectionSlug;

let globalSearch;

function searchMedias() {
    const data = {search,sortBy,toDisplay,sort};
    let url;
    if (globalSearch) {
        if (familySlug) {
            url = "/family/"+familySlug+"/sections/global/search";
        } else {
            url = "/global/search";
        }
    } else {
        url = "/family/"+familySlug+"/sections/"+sectionSlug+"/medias/search"
    }
    return fetch(url, {
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
            const imgType = document.createElement("img");
            imgType.title = media.type === "video" ? "Vidéo" : "Photo";
            imgType.src = media.type === "video" ? "/images/clap.png" : "/images/picture.png";
            tdType.appendChild(imgType);
            tr.appendChild(tdType);

            if (globalSearch) {
                if (familySlug === undefined) {
                    const tdFamily = document.createElement("td");
                    const linkFamily = document.createElement("a");

                    linkFamily.href = "/family/" + media.familySlug + "/sections/";
                    linkFamily.innerText = media.familyName;
                    tdFamily.appendChild(linkFamily);
                    tr.appendChild(tdFamily);
                }

                const tdSection = document.createElement("td");
                const linkSection = document.createElement("a");

                if (familySlug) {
                    linkSection.href = "/family/" + familySlug + "/sections/" + media.sectionSlug + "/medias/";
                } else {
                    linkSection.href = "/family" + media.familySlug + "/sections/" + media.sectionSlug + "/medias/"
                }
                linkSection.innerText = media.sectionName;
                tdSection.appendChild(linkSection);
                tr.appendChild(tdSection);
            }

            const tdButtons = document.createElement("td");

            const viewButton = document.createElement("a");

            viewButton.classList.add("btn");
            viewButton.href = "/family/"+familySlug+"/sections/"+(globalSearch ? media.sectionSlug : sectionSlug)+"/medias/"+media.slug+"/view";
            viewButton.innerText = "Voir";

            tdButtons.appendChild(viewButton);

            const editButton = document.createElement("a");

            editButton.classList.add("btn");
            editButton.href = "/family/"+familySlug+"/sections/"+(globalSearch ? media.sectionSlug : sectionSlug)+"/medias/"+media.slug+"/edit/";
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
    if (document.getElementById("input_search") == null) return;

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
