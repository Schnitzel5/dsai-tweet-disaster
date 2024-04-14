const wrapper = document.querySelector(".wrapper"),
    editableInput = wrapper.querySelector(".editable"),
    readonlyInput = wrapper.querySelector(".readonly"),
    placeholder = wrapper.querySelector(".placeholder"),
    counter = wrapper.querySelector(".counter"),
    button = wrapper.querySelector("button");

editableInput.onfocus = () => {
    placeholder.style.color = "#c5ccd3";
}
editableInput.onblur = () => {
    placeholder.style.color = "#98a5b1";
}

editableInput.onkeyup = (e) => {
    let element = e.target;
    validated(element);
}
editableInput.onkeypress = (e) => {
    let element = e.target;
    validated(element);
    placeholder.style.display = "none";
}

function validated(element) {
    let text;
    let maxLength = 100;
    let currentlength = element.innerText.length;

    if (currentlength <= 0) {
        placeholder.style.display = "block";
        counter.style.display = "none";
        button.classList.remove("active");
    } else {
        placeholder.style.display = "none";
        counter.style.display = "block";
        button.classList.add("active");
    }

    counter.innerText = maxLength - currentlength;

    if (currentlength > maxLength) {
        let overText = element.innerText.substr(maxLength); //extracting over texts
        overText = `<span class="highlight">${overText}</span>`; //creating new span and passing over texts
        text = element.innerText.substr(0, maxLength) + overText; //passing overText value in textTag variable
        readonlyInput.style.zIndex = "1";
        counter.style.color = "#e0245e";
        button.classList.remove("active");
    } else {
        readonlyInput.style.zIndex = "-1";
        counter.style.color = "#333";
    }
    readonlyInput.innerHTML = text; //replacing innerHTML of readonly div with textTag value
}

function submitTweet() {
    const content = document.getElementById("tweet-content")?.innerText;
    const payload = JSON.stringify({
        content: content
    });
    console.log(payload);
    fetch("/submit", {
        method: "POST",
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        },
        body: payload
    }).then(value => {
        if (value.status === 200) {
            value.text()
                .then(result => {
                    console.log(result);
                    if (Number(result) === 0) {
                        showAlertSuccess("Kein Disaster :)");
                    } else {
                        showAlertError("Disaster Tweet erkannt!");
                    }
                })
                .catch(reason => console.error(reason));
        } else {
            showAlertError("Disaster Tweet erkannt!");
        }
    }).catch(reason => console.error(reason));
}

function showAlertError(reason) {
    const alertState = document.getElementById("alert-state");
    alertState.innerHTML = `
    <div class="alert alert-important alert-danger alert-dismissible" role="alert">
        <div class="d-flex">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24"
                     viewBox="0 0 24 24" stroke-width="2" stroke="gray" fill="none" stroke-linecap="round"
                     stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                    <path d="M12 8v4"></path>
                    <path d="M12 16h.01"></path>
                </svg>
            </div>
            <div>
                ${reason}
            </div>
        </div>
        <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
    </div>
    `;
}

function showAlertSuccess(reason) {
    const alertState = document.getElementById("alert-state");
    alertState.innerHTML = `
    <div class="alert alert-important alert-success alert-dismissible" role="alert">
        <div class="d-flex">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" class="icon alert-icon" width="24" height="24"
                     viewBox="0 0 24 24" stroke-width="2" stroke="gray" fill="none" stroke-linecap="round"
                     stroke-linejoin="round">
                    <path stroke="none" d="M0 0h24v24H0z" fill="none"></path>
                    <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0"></path>
                    <path d="M12 8v4"></path>
                    <path d="M12 16h.01"></path>
                </svg>
            </div>
            <div>
                ${reason}
            </div>
        </div>
        <a class="btn-close" data-bs-dismiss="alert" aria-label="close"></a>
    </div>
    `;
}
