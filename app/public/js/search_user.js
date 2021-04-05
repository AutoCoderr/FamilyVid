let allUser;
let familyId;

function searchUsers(search) {
    const data = {search};
    return fetch(allUser ? "/user/search": "/family/"+familyId+"/members/search", {
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
            tr.appendChild(tdFirstname)

            const tdLastname = document.createElement("td");
            tdLastname.innerText = user.lastname;
            tr.appendChild(tdLastname)

            const tdEmail = document.createElement("td");
            tdEmail.innerText = user.email;
            tr.appendChild(tdEmail)

            if (allUser) {
                const tdButton = document.createElement("td");
                const AButton = document.createElement("a");
                AButton.classList.add("btn")
                AButton.href = "/family/list/" + user.id;
                AButton.innerText = "Voir ses familles (" + user.nbFamily + ")";

                tdButton.appendChild(AButton)
                tr.appendChild(tdButton);
            }

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
    document.getElementById("input_search").addEventListener("input", async function() {
        generateUserList(await searchUsers(this.value));
    });
});