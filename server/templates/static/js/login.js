var input = document.getElementById("password");

input.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault();
        handleLogin()
    }
});

function handleLogin(){
    const email = document.getElementById("email"); // TODO: Handle email pattern
    const password = document.getElementById("password");
    const request = {
        type: "login",
        email: validateEmail(email.value),
        password: processPassword(password.value)
    };
    send_req(request).then((resp) => {
        let json_resp = JSON.parse(resp)
        if(json_resp["status"] == "SUCCESS"){
            if(json_resp["redirect"] != undefined){
                window.location.href = json_resp.redirect
            }
        } else {
            alert(json_resp["reason"])
        }
    })
}