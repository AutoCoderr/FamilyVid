function comment_deleted(res) {
    if (res.status === "success") {
        const idOfElemToDelete = "comment_" + res.id;
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