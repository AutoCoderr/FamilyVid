let firstname;
let lastname;

function comment_deleted(res,form) {
    if (res.status === "success") {
        const commentsContainer = document.getElementById("comments");

        if (commentsContainer.getElementsByTagName("li").length === 1) {

            commentsContainer.remove();
            const h2 = document.createElement("h2");
            h2.innerText = "Il n'y a aucun commentaire";
            document.getElementById("comment_container").appendChild(h2);

        } else {

            const idOfElemToDelete = "comment_" + form.comment.value;
            const firstLi = document.querySelector("#comments li");
            if (firstLi.id === idOfElemToDelete) {
                const firstCommentHr = document.querySelector("#comments li hr");
                firstCommentHr.remove();
            }

            const comment_li = document.getElementById(idOfElemToDelete);
            comment_li.remove();
        }
    } else {
        throw new Error(res.errors.join("\n-----------------\n"));
    }
}

function comment_created(res,form) {
    if (res.status === "success") {

        if (document.getElementById("comments") == null) {
            document.getElementsByTagName("h2")[1].remove();

            const commentsUl = document.createElement("ul");
            commentsUl.setAttribute("id", "comments")

            document.getElementById("comment_container").appendChild(commentsUl);
        }

        const firstComment = document.querySelector("#comments li");
        if (firstComment != null) {
            firstComment.prepend(document.createElement("hr"));
        }

        const date = new Date();
        const currentDateText =
            addMissingZero(date.getDate())+ "/" + addMissingZero(date.getMonth() + 1) + "/" + date.getFullYear() + " " +
            addMissingZero(date.getHours()) + ":" + addMissingZero(date.getMinutes()) + ":" + addMissingZero(date.getSeconds());

        let container = document.getElementById("comment_prototype");
        container = container.cloneNode(true);
        container.setAttribute("id", "comment_" + res.id);

        container.querySelector(".author_name").innerText = firstname + " " + lastname;
        container.querySelector(".comment_date").innerText = currentDateText;
        container.querySelector('.edit_button').addEventListener("click", () => {
            displayEdit(res.id);
        });

        const formDelete = container.querySelector(".delete-comment-form");
        formDelete.setAttribute("id", "form_delete_comment_" + res.id);
        formDelete.comment.value = res.id;
        formDelete.actionName.value = "delete_comment_"+res.id;

        form_listener(formDelete, comment_deleted,null,"Voulez vous vraiment supprimer ce commentaire?");

        container.querySelector('.body').innerText = form.content.value;

        const formEdit = container.querySelector(".edit-comment-form");
        formEdit.setAttribute("id", "form_edit_comment_" + res.id);
        formEdit.comment.value = res.id;
        formEdit.actionName.value = "edit_comment_"+res.id;

        form_listener(formEdit, comment_edited, can_edit);

        document.getElementById("comments").prepend(container);

        form.content.value = "";
    } else {
        throw new Error(res.errors.join("\n-----------------\n"));
    }
}

function can_create(form) {
    return form.content.value !== "";
}

function comment_edited(res,form) {
    if (res.status === "success") {
        const id = form.comment.value,
            commentBody =  document.querySelector("#comment_"+id+" .body"),
            commentInfos =  document.querySelector("#comment_"+id+" .header .infos");

        if (commentInfos.innerText.length >= 10 && commentInfos.innerText.substring(commentInfos.innerText.length-10,commentInfos.innerText.length) !== " (modifié)") {
            commentInfos.innerText += " (modifié)";
        }
        commentBody.innerText = form.content.value;

        form.style.display = "none";
        commentBody.style.display = "block";
    } else {
        throw new Error(res.errors.join("\n-----------------\n"));
    }
}

function can_edit(form) {
    const id = form.comment.value,
        commentBody =  document.querySelector("#comment_"+id+" .body"),
        textAreaValue = form.content.value;

    if (trim(commentBody.innerText) === textAreaValue) {
        form.style.display = "none";
        commentBody.style.display = "block";
        return false;
    }
    return true;
}

function displayEdit(id) {
    const form = document.querySelector("#comment_"+id+" .edit-comment-form"),
        commentBody =  document.querySelector("#comment_"+id+" .body");

    if (form.style.display === "block") {
        form.style.display = "none";
        commentBody.style.display = "block";
    } else {
        form.style.display = "block";
        commentBody.style.display = "none";

        form.querySelector("textarea").value = trim(commentBody.innerText);
    }
}

function trim(str) {
    let i=0;
    while(str[i] === " " || str[i] === "\t" || str[i] === "\n") {
        i += 1;
    }
    str = str.substring(i,str.length);

    i = str.length-1;
    while(str[i] === " " || str[i] === "\t" || str[i] === "\n") {
        i -= 1;
    }

    str = str.substring(0,i+1);
    return str;
}

function addMissingZero(num, nb = 2) {
    if (typeof(num) == "number") {
        num = num.toString();
    }
    while(num.length < nb) {
        num = '0'+num;
    }
    return num;
}