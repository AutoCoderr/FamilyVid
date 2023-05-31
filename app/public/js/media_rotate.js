let familySlug,sectionSlug,mediaSlug;
let loading = false;

window.addEventListener("DOMContentLoaded", () => {
    const buttons = document.querySelectorAll(".media_rotate_form button");
    for (const button of buttons) {
        button.addEventListener("click", function (e) {
            e.preventDefault();
            if (loading)
                return;
            for(const button of buttons) {
                button.classList.add('grayed');
            }
            const data = JSON.stringify({
                type: this.value,
                csrf_token: this.parentNode.csrf_token.value
            })
            loading = true;
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
                    loading = false;
                    for(const button of buttons) {
                        button.classList.remove('grayed');
                    }
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

