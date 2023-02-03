let familySlug;

function searchSections(search) {
    const data = {search};
    return fetch("/family/"+familySlug+"/sections/search", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function generateSectionList(sections) {
    const ul = document.getElementById("section_list");
    while (ul.firstChild) {
        ul.removeChild(ul.firstChild);
    }

    if (sections.length > 0) {
        for (const section of sections) {
            const li = document.createElement("li");

            const spanName = document.createElement("span");
            spanName.innerText = section.name;
            li.appendChild(spanName);

            const showButton = document.createElement("a");
            showButton.classList.add("btn");
            showButton.href = "/family/"+familySlug+"/sections/"+section.slug+"/medias/";
            showButton.innerText = "Voir";
            li.appendChild(showButton);

            const editButton = document.createElement("a");
            editButton.classList.add("btn");
            editButton.href = "/family/"+familySlug+"/sections/"+section.slug+"/edit/";
            editButton.innerText = "Modifier";
            li.appendChild(editButton);

            ul.appendChild(li);
        }
    } else {
        const li = document.createElement("li");
        li.innerText = "Aucune rubrique n'a été trouvée";
        ul.appendChild(li);
    }
}

window.addEventListener("DOMContentLoaded", (event) => {
    if (document.getElementById("input_search") == null) return;
    document.getElementById("input_search").addEventListener("input", async function() {
        generateSectionList(await searchSections(this.value));
    });
});
