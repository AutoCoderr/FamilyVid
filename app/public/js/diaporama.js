let sectionsByFamily = {};
let currentFamilyId = null;
let currentSectionId = null;
let order = "chronologic";

let currentMedia = null;
let currentMediaIndex = null;
let medias = [];

function getMedias() {
    const data = {};
    if (currentSectionId != null) data.sectionId = currentSectionId;
    if (currentFamilyId != null) data.familyId = currentFamilyId;
    return fetch("/diaporama/search", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        body: JSON.stringify(data)
    }).then(res => res.json());
}

function diapo(pictures) {
    medias = pictures;
    if (order === "random") {
        currentMediaIndex = rand(0,medias.length-1);
        if (currentMedia != null) {
            while (currentMedia.id === medias[currentMediaIndex].id) {
                currentMediaIndex = rand(0,medias.length-1);
            }
        }
    } else {
        currentMediaIndex = 0;
        if (currentMedia != null) {
            for (let i=0;i<medias.length;i++) {
                if (medias[i].id === currentMedia.id) {
                    currentMediaIndex = i < medias.length-1 ? i+1 : 0;
                }
            }
        }
    }
    console.log({medias, currentMediaIndex, currentMedia});
}

window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("play_stop_button").addEventListener("click", async function() {
        const res = await getMedias();
        if (res.status === "success") {
            diapo(res.pictures);
        } else {
            document.getElementById("error").innerText = res.error;
        }
    });

    document.getElementById("diapo_order").addEventListener("change", function () {
        order = this.value;
    });

    document.getElementById("section").addEventListener("change", function () {
        if (currentMedia != null) {
            currentMedia = null;
            document.querySelector("#image img").remove();
        }
        currentSectionId = this.value !== "0" ? parseInt(this.value) : null;
    });

    document.getElementById("family").addEventListener("change", function () {
        if (currentMedia != null) {
            currentMedia = null;
            document.querySelector("#image img").remove();
        }
        currentFamilyId = parseInt(this.value);
        currentSectionId = null;

        const sectionSelect = document.getElementById("section");
        while (sectionSelect.firstChild) {
            sectionSelect.removeChild(sectionSelect.firstChild);
        }

        if (this.value !== "0") {
            const sections = sectionsByFamily[parseInt(this.value)];
            if (sections.length > 0) {
                const option = document.createElement("option");
                option.value = "0";
                option.innerText = "Toutes les rubriques";
                sectionSelect.appendChild(option);
                for (const section of sections) {
                    const option = document.createElement("option");
                    option.value = section.id;
                    option.innerText = section.name;
                    sectionSelect.appendChild(option);
                }
            } else {
                const option = document.createElement("option");
                option.value = "0";
                option.innerText = "Aucune rubrique";
                sectionSelect.appendChild(option);
            }
        } else {
            const option = document.createElement("option");
            option.value = "0";
            option.innerText = "Choisissez d'abord une famille";
            sectionSelect.appendChild(option);
        }
    });
});

function rand(a,b) {
    return a+Math.floor(Math.random()*(b-a+1));
}