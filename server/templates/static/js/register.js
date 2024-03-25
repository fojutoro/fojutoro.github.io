var input = document.getElementById("password");

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleRegister()
    }
});

function clearInputs(data){
    data.forEach((item) => {
        item.value = ""
    })
}

function handleRegister(){
    const username = document.getElementById("username");
    const email = document.getElementById("email"); // TODO: Handle email pattern
    const password = document.getElementById("password");
    const request = {
        type: "register",
        username: validateUsername(username.value),
        email: validateEmail(email.value),
        password: processPassword(password.value)
    };
    send_req(request).then((resp) => {
        redirect = JSON.parse(resp)['redirect']
        clearInputs([username, email, password])
        window.location.href = redirect
    })
}