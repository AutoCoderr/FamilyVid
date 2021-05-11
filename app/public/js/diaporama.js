let sectionsByFamily = {};
let familieNamesById = {};
let sectionNameById = {};

let currentFamilyId = null;
let currentSectionId = null;
let order = "chronologic";
let toLoop = true;
let delay = 3;

let currentMedia = null;
let currentMediaIndex = null;
let medias = null;

let loopInterval = null;

let playing = false;

function downloadMediasList() {
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

function diapo() {
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

    playing = true;
    setTimeout(() => {
        diapoLoop();
        loopInterval = setInterval(diapoLoop, delay*1000);
    }, currentMedia == null ? 0 : delay*1000);
}

function diapoLoop() {
    currentMedia = medias[currentMediaIndex];
    displayCurrentMedia();
    if (order === "random") {
        let newMediaIndex = rand(0,medias.length-1);
        while (newMediaIndex === currentMediaIndex) {
            newMediaIndex = rand(0,medias.length-1);
        }
        currentMediaIndex = newMediaIndex;
    } else {
        if (currentMediaIndex < medias.length-1) {
            currentMediaIndex += 1;
        } else if (toLoop) {
            currentMediaIndex = 0;
        } else {
            document.getElementById("play_stop_button").click();
        }
    }
}

function displayCurrentMedia() {
    let imageContainer = document.getElementById("image");
    imageContainer.style.display = "block";

    const h2Title = imageContainer.querySelector("h2");
    h2Title.innerText = currentMedia.name;

    const path = imageContainer.querySelector(".path");

    const familySpan = path.querySelector(".family");
    familySpan.title = "Famille "+currentMedia.familyName;
    familySpan.href = "/family/"+currentMedia.familySlug+"/sections"
    familySpan.innerText = currentMedia.familyName;

    const sectionSpan = path.querySelector(".section");
    sectionSpan.title = "Rubrique "+currentMedia.sectionName;
    sectionSpan.href = "/family/"+currentMedia.familySlug+"/sections/"+currentMedia.sectionSlug+"/medias";
    sectionSpan.innerText = currentMedia.sectionName;

    const dateSpan = imageContainer.querySelector(".date");
    dateSpan.innerText = currentMedia.date;

    const media_link = imageContainer.querySelector(".media_link");
    media_link.href = "/family/"+currentMedia.familySlug+"/sections/"+currentMedia.sectionSlug+"/medias/"+currentMedia.slug+"/view";

    const img = imageContainer.querySelector("img");
    img.src = "/family/"+currentMedia.familySlug+"/sections/"+currentMedia.sectionSlug+"/medias/"+currentMedia.slug;
}

function displayPrevNextButtons() {
    document.getElementById("btn_prev").style.display = "inline-block";
    document.getElementById("btn_next").style.display = "inline-block";
}

function hidePrevNextButtons() {
    document.getElementById("btn_prev").style.display = "none";
    document.getElementById("btn_next").style.display = "none";
}

async function getMedias() {
    const res = await downloadMediasList();
    if (res.status === "success") {
        if (order === "chronologic") {
            displayPrevNextButtons();
        }
        medias = res.pictures;
        document.getElementById("error").innerText = "";
        return true;
    }
    medias = null;
    hidePrevNextButtons();
    document.getElementById("error").innerText = res.error;
    return false;
}

window.addEventListener("DOMContentLoaded", (event) => {
    getMedias();

    document.getElementById("play_stop_button").addEventListener("click", async function() {
        if (!playing && medias != null) {
            hidePrevNextButtons();
            playing = true;
            this.querySelector("img").src = "/images/pause.png";
            diapo();
        } else if (playing) {
            if (order === "chronologic") {
                displayPrevNextButtons();
            }
            playing = false;
            clearInterval(loopInterval);
            this.querySelector("img").src = "/images/play.png";
        }
    });

    document.getElementById("btn_prev").addEventListener("click", function () {
        if (order !== "chronologic" || playing) return;
        if (currentMedia == null) {
            currentMediaIndex = 0;
        } else {
            currentMediaIndex = (currentMediaIndex === 0 || currentMediaIndex == null) ? medias.length - 1 : currentMediaIndex - 1;
        }
        currentMedia = medias[currentMediaIndex];
        displayCurrentMedia();
    });

    document.getElementById("btn_next").addEventListener("click", function () {
        if (order !== "chronologic" || playing) return;
        if (currentMedia == null) {
            currentMediaIndex = 0;
        } else {
            currentMediaIndex = currentMediaIndex === medias.length - 1 ? 0 : currentMediaIndex + 1;
        }
        currentMedia = medias[currentMediaIndex];
        displayCurrentMedia();
    });

    document.getElementById("diapo_order").addEventListener("change", function () {
        order = this.value;
        if (order === "chronologic" && medias != null && !playing) {
            displayPrevNextButtons();
        } else {
            hidePrevNextButtons();
        }
    });

    document.getElementById("to_loop").addEventListener("click", function () {
       toLoop = this.checked;
    });

    document.getElementById("delay").addEventListener("change", function() {
        delay = parseInt(this.value);
    });

    document.getElementById("section").addEventListener("change", function () {
        if (currentMedia != null) {
            currentMedia = null;
            document.getElementById("image").style.display = "none";
        }
        if (playing) document.getElementById("play_stop_button").click();
        currentSectionId = this.value !== "0" ? parseInt(this.value) : null;
        getMedias();

        if (currentSectionId != null) {
            document.querySelector("h1").innerText = "Diaporama sur la rubrique "+sectionNameById[currentSectionId];
        } else {
            document.querySelector("h1").innerText = "Diaporama sur la famille "+familieNamesById[parseInt(document.getElementById("family").value)];
        }
    });

    document.getElementById("family").addEventListener("change", function () {
        if (currentMedia != null) {
            currentMedia = null;
            document.getElementById("image").style.display = "none";
        }
        if (playing) document.getElementById("play_stop_button").click();
        currentFamilyId = this.value !== "0" ? parseInt(this.value): null;
        currentSectionId = null;
        getMedias();

        const sectionSelect = document.getElementById("section");
        while (sectionSelect.firstChild) {
            sectionSelect.removeChild(sectionSelect.firstChild);
        }

        if (this.value !== "0") {
            document.querySelector("h1").innerText = "Diaporama sur la famille "+familieNamesById[currentFamilyId];
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
            document.querySelector("h1").innerText = "Diaporama sur toutes les photos";
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