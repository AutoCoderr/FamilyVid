let familySlug;
let userId;
let userIsMember;

function searchUsers(search) {
    const data = {search};
    return fetch("/family/"+familySlug+"/members/search", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': data.length
        },
        body: JSON.stringify(data)
    }).then(response => response.json());
}

function generateUserList(users) {
    const tbody = document.getElementsByTagName("tbody")[0];
    while (tbody.firstChild) {
        tbody.removeChild(tbody.firstChild);
    }

    if (users.length > 0) {
        for (const user of users) {
            const tr = document.createElement("tr");

            const tdFirstname = document.createElement("td");
            tdFirstname.innerText = user.firstname;
            tr.appendChild(tdFirstname);

            const tdLastname = document.createElement("td");
            tdLastname.innerText = user.lastname;
            tr.appendChild(tdLastname);

            if (userIsMember) {
                const tdEmail = document.createElement("td");
                tdEmail.innerText = user.email + (userId === user.id ? " (vous)" : "");
                tr.appendChild(tdEmail);
            }

            const tdButtons = document.createElement("td");
            const seeFamiliesButton = document.createElement("a");
            seeFamiliesButton.classList.add("btn")
            if (userId === user.id) {
                seeFamiliesButton.href = "/family/list/";
                seeFamiliesButton.innerText = "Voir mes familles (" + user.nbfamilies + ")";
            } else {
                seeFamiliesButton.href = "/family/list/" + user.id;
                seeFamiliesButton.innerText = "Voir ses familles (" + user.nbfamilies + ")";
            }

            tdButtons.appendChild(seeFamiliesButton);

            if (!userIsMember) {
                const joinFamilyButton = document.createElement("a");
                joinFamilyButton.classList.add("btn");
                joinFamilyButton.addEventListener("click", () => {
                    displayDemandForm('family-demand-'+user.id);
                });
                joinFamilyButton.innerText = "Demander à rejoindre";

                tdButtons.appendChild(joinFamilyButton);

                const formDemand = document.getElementById("form-demand-prototype").cloneNode(true);
                formDemand.setAttribute('id', 'family-demand-'+user.id);
                formDemand.classList.add("family-form");

                const form = formDemand.querySelector("form");
                form.user.value = user.id;

                tdButtons.appendChild(formDemand);
            }

            tr.appendChild(tdButtons);

            tbody.appendChild(tr);
        }
    } else {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = 4;
        td.innerText = "Aucun utilisateur trouvé";
        tr.appendChild(td);
        tbody.appendChild(tr);
    }
}


window.addEventListener("DOMContentLoaded", (event) => {
    document.getElementById("input_search").focus();
    document.getElementById("input_search").addEventListener("input", async function() {
        generateUserList(await searchUsers(this.value));
    });
});
