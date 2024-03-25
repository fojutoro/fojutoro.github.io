let canvasWidth;
let canvasHeight;

let resolution = 2500;
let spacing = 15;

let xRange = 50;
let yRange = 50;

var functions = []

let func_id = 0

const urlParams = new URLSearchParams(window.location.search);

if(urlParams.get('uuid') != null){
    let req = {
        "type": "get_post",
        "post_uuid": urlParams.get('uuid')
    }
    send_req(req).then((resp) => {
        resp.data.forEach((data_func) => {
            let func = document.createElement("div");
            data = [parser(data_func[2]), ...data_func.slice(3, 5), func_id]
            functions.push(data)
            func.style.backgroundColor = data[1]
            func.className = "function";
            func.id = func_id
            let fn = document.createElement("p");
            if (color == "#ffffff"){
                fn.style.color = "black";
            }
            let expression = data[0].toString().slice(31).trim().split("\n")[0];
            fn.innerHTML = expression;
            func.appendChild(fn);
            document.getElementById("sidebar").appendChild(func);
            func_id += 1
        })
    })
    let a = document.createElement("a")
    a.className = "publish-button"
    a.onclick = likePost
    let img = document.createElement('img');
    img.src = "../static/icons/like.png"
    a.appendChild(img)
    document.getElementById("sidebar").appendChild(a);
}

var created = false;

let color = "#ffffff";
let stroke_size = 3

let centerPoint = {
    x: 0,
    y: 0
}

let mouseInit = {
    x: 0,
    y: 0,
    centerX: centerPoint.x,
    centerY: centerPoint.y
}

let color_picker = document.getElementById('color-picker');

color_picker.addEventListener("input", (event)=>{
    color = color_picker.value;
});

let stroke_input = document.getElementById("size-input");

stroke_input.addEventListener("input", (event)=>{
    stroke_size = stroke_input.value;
});

let input_elem = document.getElementById("func-input-0");

var user_fn;

input_elem.oninput = (e) => {
    user_fn = parser(input_elem.value)
};

function removeFunc(e) {
    let funcId = e.srcElement.parentNode.parentNode.id
    let indexToRemove = functions.findIndex(func => func[3] == funcId);
    if (indexToRemove !== -1) {
        functions.splice(indexToRemove, 1);
        let functionDiv = document.getElementById(funcId);
        functionDiv.parentNode.removeChild(functionDiv);
    }
    if(functions.length == 0){
        created = false;
        document.getElementsByClassName("publish-button")[0].remove();
    }
}


function add_function(){
    if(user_fn){
        let func = document.createElement("div");
        functions.push([user_fn, color, stroke_size, func_id]);
        func.style.backgroundColor = color
        func.className = "function";
        let fn = document.createElement("p");
        let trash = document.createElement("a");
        let icon = document.createElement("img");
        func.id = func_id
        trash.onclick = removeFunc;
        icon.src = "../static/icons/trash.png"
        trash.appendChild(icon);
        if (color == "#ffffff"){
            trash.style.filter = "invert(1)";
            fn.style.color = "black";
        }
        let expression = user_fn.toString().slice(31).trim().split("\n")[0];
        fn.innerHTML = expression;
        func.appendChild(fn);
        func.appendChild(trash);
        document.getElementById("sidebar").appendChild(func);


        user_fn = false;
        color = "#ffffff";
        stroke_size = 3;

        input_elem.value = "";
        color_picker.value = "#ffffff";
        stroke_input.value = "";
        func_id += 1
        if(!created && urlParams.get('uuid') == null){
            let button = document.createElement("a");
            button.id = "upload";
            button.onclick = upload_screen;
            let img = document.createElement("img");
            button.appendChild(img);
            img.src = "../static/icons/upload.png";
            button.style.bottom = "-100px";
            document.getElementById("sidebar").appendChild(button);
            button.className = "publish-button"
            let pos = -100
            let counter = 1;
            let animation = setInterval(() => {
                button.style.bottom = pos + 'px'
                if(pos > 15){
                    clearInterval(animation);
                }
                pos += 1 * counter
                counter += 0.12
            }, 10);
            publish_element = true
            created = true
        }
    }
};

function close_window(){
    document.getElementById("publish").remove();
}

function stringify_functions(functions){
    let output = [];
    functions.forEach((func) => {
        output.push([func[0].toString().slice(31).trim().split("\n")[0], func[1], func[2], func[3]])
    });
    return output
}


function try_upload(){
    add_function()
    let title = document.getElementById("title").value;
    let comment = document.getElementById("comment").value;
    let thumbnail = document.getElementById("thumbnail");

    const request = {
        type: "upload",
        title: title,
        comment: comment,
        functions: stringify_functions(functions)
    };

    if(thumbnail.files.length == 1){
        request['thumbnail'] = thumbnail.files[0];
    }
    send_req(request);
    close_window();
}

function upload_screen(){
    let container = document.createElement("div");
    container.id = "publish";
    container.innerHTML = `
    <input type="button" onclick="" value="x" id="close">
    <div class="">
        <label for="Title">Title:</label>
        <input type="text" id="title" name="title" minlength="2" maxlength="30" required>
    </div>
        
    <div class="">
        <label for="comment">Comment</label>
        <textarea name="comment" id="comment" cols="30" rows="5"></textarea>
    </div>
    
    <div class="">
        <label for="thumbnail">Thumbnail:</label>
        <input type="file" id="thumbnail" accept=".png,.jpg,.jpeg"name="thumbnail">
    </div>

    <a><button id="upload" type="button">Upload</button></a>
    `
    document.getElementsByTagName('main')[0].insertBefore(container, document.getElementsByTagName('main')[0].firstChild)
    document.getElementById("upload").onclick = try_upload;
    document.getElementById("close").onclick = close
}

function xInput(val){   
  let pixel = val * canvasWidth;
  let delta = pixel - centerPoint.x;
  return xRange * delta / canvasWidth;
}

// TODO: Resize canvas based on window size
function setup(){
    createCanvas(windowWidth, windowHeight);
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
    centerPoint.x = canvasWidth / 2;
    centerPoint.y = canvasHeight / 2;
}

function mousePressed(){
    mouseInit.x = mouseX;
    mouseInit.y = mouseY;
    mouseInit.centerX = centerPoint.x;
    mouseInit.centerY = centerPoint.y;
    xRange = Math.round(xRange);
    yRange = Math.round(yRange);
}

function keyPressed(){
    if(keyCode == 107 || (keyCode == 187 && keyIsDown(16))){
        if (xRange > 6.25){
            xRange /= 1.15;
            yRange /= 1.15;
        }
    }
    else if(keyCode == 189 || keyCode == 109){
        xRange *= 1.15;
        yRange *= 1.15;
    }
}

function mouseWheel(e){
    if(Math.sign(e.delta) < 0){
        if (xRange > 6.25){
            xRange /= 1.15;
            yRange /= 1.15;
        }
    }
    else{
        xRange *= 1.05;
        yRange *= 1.05;
    }
}

function draw(){
    background(30, 30, 30);
    noFill();

    // X, Y OSw
    stroke(60);
    strokeWeight(1);
    line(centerPoint.x, windowHeight, centerPoint.x, 0);
    line(0, centerPoint.y, windowWidth, centerPoint.y);

    if(user_fn){
        stroke(color);
        strokeWeight(stroke_size);
        for(let i = 0; i < resolution; i++){
            let x0 = xInput(i / resolution);
            let x1 = xInput((i+1) / resolution);
            line(
                i * canvasWidth / resolution,
                centerPoint.y - (canvasHeight / yRange) * user_fn(x0),
                (i+1) * canvasWidth / resolution,
                centerPoint.y - (canvasHeight / yRange) * user_fn(x1)
            );
        }
    }
    if(functions.length > 0){
        functions.forEach((data) => {
            stroke(data[1]);
            strokeWeight(data[2]);
            for(let i = 0; i < resolution; i++){
                let x0 = xInput(i / resolution);
                let x1 = xInput((i+1) / resolution);
                line(
                    i * canvasWidth / resolution,
                    centerPoint.y - (canvasHeight / yRange) * data[0](x0),
                    (i+1) * canvasWidth / resolution,
                    centerPoint.y - (canvasHeight / yRange) * data[0](x1),
                );
            }
        })
    }

    // dragging the graph around
    if(mouseIsPressed && document.activeElement !== input_elem){
        centerPoint.x = mouseInit.centerX + mouseX - mouseInit.x;
        centerPoint.y = mouseInit.centerY + mouseY - mouseInit.y;
    }
}