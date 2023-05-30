let familySlug,sectionSlug,mediaSlug;

window.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".media_rotate_form button");
    for (const button of buttons) {
        button.addEventListener("click", function (e) {
            e.preventDefault()
            const data = JSON.stringify({
                type: this.value,
                csrf_token: this.parentNode.csrf_token.value
            })
            fetch('/family/'+familySlug+'/sections/'+sectionSlug+'/medias/'+mediaSlug+'/rotate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': data.length
                },
                body: data
            })
                .then(res => res.json())
                .then(json => {
                    if (json.status === "failed") {
                        let errorsUl = document.querySelector(".media_rotate_form errors");
                        for (const error of json.errors) {
                            const li = document.createElement("li");
                            li.innerText = error;
                            errorsUl.appendChild(li);
                        }
                    } else {
                        const image = document.querySelector(".image_rotate_show");
                        image.src = image.src+"?timestamp="+(new Date().getTime());
                    }
                });
        })
    }
})

