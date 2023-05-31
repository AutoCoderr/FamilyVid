let loading = false;

function addForm() {
    const nbForm = document.querySelectorAll("#forms form").length;
    const newForm = document.querySelector("#form-prototype").cloneNode(true);
    newForm.removeAttribute('id');
    newForm.style.display = "";

    if (nbForm > 0) {
        const buttonRemove = document.createElement("a");
        buttonRemove.classList.add('btn');
        buttonRemove.innerText = "Retirer";
        buttonRemove.addEventListener("click", () => {
            if (loading)
                return;
            if (!confirm("Voulez vous vraiment retirer ce fichier?"))
                return;

            newForm.remove();
            let i = 1;
            for (const div of document.querySelectorAll("#forms div")) {
                div.querySelector("h2").innerText = "Fichier N°" + i;
                i++;
            }
        })
        newForm.prepend(buttonRemove);
    }

    const h2 = document.createElement('h2');
    h2.innerText = "Fichier N°" + (nbForm + 1);
    newForm.prepend(h2);

    if (nbForm > 0)
        newForm.prepend(document.createElement('hr'));

    document.querySelector("#forms").appendChild(newForm);
}

function greyAllButtons() {
    for (const div of document.querySelectorAll("#forms div")) {
        const a = div.querySelector("a");
        if (a)
            a.classList.add("grayed");
    }
    document.querySelector("#more_file_button").classList.add("grayed");
    document.querySelector("#validate_upload_button").classList.add("grayed");
}

function unGreyAllButtons() {
    for (const div of document.querySelectorAll("#forms div")) {
        const a = div.querySelector("a");
        if (a)
            a.classList.remove("grayed");
    }
    document.querySelector("#more_file_button").classList.remove("grayed");
    document.querySelector("#validate_upload_button").classList.remove("grayed");
}

window.addEventListener("DOMContentLoaded", () => {
    document.querySelector("#form-prototype form input[type='submit']").remove();
    addForm();

    document.getElementById("more_file_button").addEventListener("click", addForm);

    document.getElementById("validate_upload_button").addEventListener("click", () => {
        const forms = [...document.querySelectorAll("#forms form")];
        if (loading || forms.length === 0)
            return;
        loading = true;
        greyAllButtons();
        Promise.all(
            forms.map(form =>
                fetch(form.action, {
                    method: form.method,
                    body: new FormData(form)
                })
            )
        )
            .then(responses => Promise.all(responses.map(res => res.json())))
            .then(responses => forms.map((form, index) => {
                loading = false;
                unGreyAllButtons();
                const res = responses[index];
                if (res.status === "failed") {
                    let ul = form.parentNode.querySelector("ul");
                    if (ul)
                        ul.remove();
                    ul = document.createElement("ul");
                    for (const error of res.errors) {
                        const li = document.createElement("li");
                        li.style.color = "red";
                        li.innerText = error;
                        ul.appendChild(li);
                    }
                    form.parentNode.appendChild(ul)
                } else {
                    const p = document.createElement("p");
                    p.style.color = "green";
                    p.innerText = "Fichier N°"+(index+1)+" envoyé avec succès!!";
                    document.getElementById("forms").appendChild(p);
                    form.parentNode.remove();
                    [...document.querySelectorAll("#forms div")].map((div,index) => {
                        const hr = div.querySelector("hr");
                        if (index === 0 && hr)
                            hr.remove();
                    });
                }
            }));
    });
});
