function comment_deleted(res,form) {
    if (res.status === "success") {
        const idOfElemToDelete = "comment_" + form.comment.value;
        const firstLi = document.querySelector("#comments li");
        if (firstLi.id === idOfElemToDelete) {
            const firstCommentHr = document.querySelector("#comments li hr");
            firstCommentHr.remove();
        }

        const comment_li = document.getElementById(idOfElemToDelete);
        comment_li.remove();
    } else {
        throw new Error(res.errors.join("\n-----------------\n"));
    }
}

function beforeEdit(form) {
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
    console.log({str});
    return str;
}