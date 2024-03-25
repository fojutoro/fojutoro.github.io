function send_req(request){
    return fetch('/', {
        method: "POST",
        body: JSON.stringify(request),
        headers: {
            "Content-type": "application/json; charset=UTF-8"
        }
    })
    .then((response) => response.json())
    .then((json_data) => {
        if(json_data.status == "ERROR"){
            alert(json_data.reason)
        } else {
            return json_data
        }
    });
}

function setCookie(cname, cvalue, exdays) {
    const d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    let expires = "expires="+ d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function likePost(){
    const urlParams = new URLSearchParams(window.location.search);
    let post_uuid = urlParams.get('uuid');
    let req = {
        "type": "like",
        "uuid": post_uuid
    }
    send_req(req);
}

function getCookie(cname) {
    let name = cname + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for(let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == ' ') {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
}

function processPassword(password){
    return password
}

function validateEmail(email){
    return email;
}

function validateUsername(username){
    return username;
}
