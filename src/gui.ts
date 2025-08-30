import { BinarySearchTree } from "./bst.js";

let debconsole = document.getElementById("console");
let cursor = document.getElementById("cursor");
let command = document.getElementById("text");
let displayed = true;
let focused = true;
let previousCommands: string[] = [];
let point = 0;
let animationSpeed = 1;
let animation = false;


function sleep(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function pause() {
    console.log("Pause called");
    return new Promise(resolve => {
        document.body.onkeyup = (e) => {
            if (e.key === "Enter") {
                resolve(true);
                document.body.onkeyup = null;
                console.log("Pause resolved");
            }
        };
    });
}

function awaitInput() {
    return new Promise(resolve => {
        let onKeyHandler = function (e: { key: string; }) {
            if (e.key == "ArrowRight") {
                document.removeEventListener('keydown', onKeyHandler);
                resolve(true);
            }
        }
        document.addEventListener('keydown', onKeyHandler);
    });
}

var binarysearchT = new BinarySearchTree();
(window as any).binarysearchT = binarysearchT;

let resizeTimeout: string | number | NodeJS.Timeout | undefined;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        binarysearchT.onResize();
    }, 200); // only trigger after 200ms of no further resize events
});

let type = async function (e: { key: string; preventDefault: () => void; }) {
    if (focused) {
        switch (e.key) {
            case "Backspace":
                command!.innerHTML = command!.innerHTML.substring(0, command!.innerHTML.length - 1);
                break;

            default:
                if (!(e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "Alt" || e.key == "Shift" || e.key == "CapsLock" || e.key == "Control" || e.key == "Meta"))
                    command!.innerHTML = command!.innerHTML + e.key;
                else {
                    e.preventDefault();
                }
                break;

            case "ArrowUp":
                //console.log(point);
                e.preventDefault(); //to avoid scrolling with the arrows in the console
                if (previousCommands.length > 0) {
                    if (point > 0)
                        point--;
                    command!.innerHTML = previousCommands[point];
                }
                break;



            case "ArrowDown":
                //console.log(point);
                e.preventDefault(); //to avoid scrolling with the arrows in the console
                if (previousCommands.length > point) {
                    point++;
                    command!.innerHTML = point < previousCommands.length ? previousCommands[point] : "";
                }

                break;


            case "Enter":
                let consoleOutput = document.getElementById("console-content");
                cursor!.remove();
                previousCommands.push(command!.innerHTML);
                point = previousCommands.length;
                command!.id = "";
                console.log(command!.innerHTML.replaceAll(" ", ",").split(","));
                try{
                    command!.innerHTML += "<br><br>" + await exec(command!.innerHTML.replaceAll(" ", ",").split(",")).then((returnVal) => { return returnVal });
                }
                catch(e){
                    command!.innerHTML += `<br><br>${e}`;
                }
                let newLine = document.createElement("p");
                newLine.innerHTML = "<b>guest@gchelossi: </b><span id=\'text\'></span>";
                consoleOutput!.append(newLine);
                command = document.getElementById("text");
                (consoleOutput!.lastChild as Element).append(cursor!);
                consoleOutput!.scrollTo(0, consoleOutput!.scrollHeight);
                break;
        }
    }
}

let exec = async function (...parameters: any[]) {
    return new Promise(async function (resolve, reject) {
        let returnval: string | number[] = "Command succesfully executed";
        let params = parameters[0];
        //console.log(parameters);
        switch (params[0]) {
            case 'insert':
                if (params[1] == "full") {
                    let arr = [25, 10, 40, 5, 15, 30, 50, 3, 7, 13, 20, 27, 35, 45, 55, 1, 4, 6, 8, 11, 14, 17, 24, 26, 29, 33, 37, 43, 47, 53, 60];
                    let insertFull = function () {
                        return new Promise(async function (res) {
                            returnval = `Succesfully inserted ${arr} into the binary search tree`;
                            for (let i = 0; i < arr.length; i++) {
                                if (animation)
                                    await binarysearchT.addNewTransform(new BinarySearchTree.TreeElement(arr[i]));
                                else
                                    binarysearchT.addNew(new BinarySearchTree.TreeElement(arr[i]));
                            }
                            res(true);
                        });
                    };
                    await insertFull();
                }
                else {
                    if (params.length > 2) {
                        let vals = params.map(function (e: string) {
                            return parseInt(e);
                        }).filter((v: number) => {
                            if (!isNaN(v)) {
                                return v;
                            }
                        });
                        await (async function () {
                            returnval = `Succesfully inserted ${vals} into the binary search tree`;
                            for (let i = 0; i < vals.length; i++) {
                                try {
                                    if (animation)
                                        await binarysearchT.addNewTransform(new BinarySearchTree.TreeElement(vals[i]));
                                    else {
                                        binarysearchT.addNew(new BinarySearchTree.TreeElement(vals[i]));
                                    }
                                }
                                catch (e) {
                                    let index = -1;
                                    if (typeof e === "string") {
                                        index = vals.indexOf(parseInt(e.substring(1)));
                                    }
                                    vals.splice(index, 1);
                                    //console.log(vals);
                                    alert(e);
                                    i--;
                                    if (vals.length > 0)
                                        returnval = `Succesfully inserted ${vals} into the binary search tree`;
                                    else
                                        returnval = `None of the values have been inserted`;
                                }
                            }
                        })();
                    }
                    else {
                        await (async function () {
                            try {
                                if (animation)
                                    await binarysearchT.addNewTransform(new BinarySearchTree.TreeElement(parseInt(params[1])));
                                else
                                    binarysearchT.addNew(new BinarySearchTree.TreeElement(parseInt(params[1])));
                                returnval = `Succesfully inserted ${params[1]} into the binary search tree`;
                            }
                            catch (e) {
                                returnval = String(e);
                            }
                        })();
                    }
                }


                break;

            case 'equivalent':
                if (binarysearchT.size > 0)
                    returnval = "insert " + binarysearchT.arr!.map((v: { key: any; } | undefined) => {
                        if (v != undefined) {
                            return v.key;
                        }

                    }).filter((v: any) => { if (v) return v }).toString();
                else
                    returnval = "The tree is empty";
                break;

            case 'help':
                returnval = "'insert [value]' inserts a key into the binary tree <br> \
                'delete [value]' deletes (if exists) a key from the binary tree<br> \
                'rank [value] returns the rank of a given value.'<br> \
                'show' will show the array representing the data structure: \t-array (?boolean:show empty slots)<br> \
                'clear' clears the console (it gets too messy sometimes)<br> \
                'credits' to show the credits of the developer who made this site";
                break;

            case 'credits':
                returnval = "Thank you for visiting my website! I hope this visual representation of these data structures are to your liking<br>\
                if you have any questions do not hesitate to e-mail me at <a href='mailto:gc.consulting22@gmail.com'>gc.consulting22@gmail.com</a>";
                break;

            case 'clear':
                document.getElementById("console-content")!.innerHTML = "";
                break;

            case 'remove': 
                let element = parseInt(params[1]);
                if(isNaN(element)){
                    reject("The passed parameter is not a number.");
                }
                else{
                    try{
                        await binarysearchT.removeKey(element);
                        resolve(`The key '${params[1]}' has been deleted.`);
                    }
                    catch(e){
                        reject(e);
                    }
                }
            break;
            case 'ls':
            case 'pwd':
            case 'chmod':
            case 'su':
            case 'cd':
            case 'echo':
                returnval = "You know, this is not really a linux terminal although I made it look like one :)";
                break;

            case "reset":
                binarysearchT.reset();
                break;

            case "rank":
                let rank = binarysearchT.rankOf(params[1]);
                if (rank == -1) {
                    returnval = `The value '${params[1]}' is not in the tree`;
                }
                else {
                    returnval = `The value '${params[1]}' is at rank ${rank}`;
                }
                break;

            case "set":
                switch (params[1]) {
                    case "animation":
                        if (params[2] == "speed") {
                            let speed = parseInt(params[3]);
                            if (isNaN(speed) || (speed < 1 || speed > 10)) {
                                returnval = "The animation speed must be an integer between 1 and 10";
                            }
                            else {
                                const style = document.createElement('style');
                                let oldStyle = document.head.getElementsByTagName('style')[0];
                                if (oldStyle) {
                                    oldStyle.remove();
                                }
                                let seconds = 1 / speed;
                                let diameter = new BinarySearchTree.TreeElement(0).diameter;
                                style.innerHTML = `
                                    .TreeElement{
                                        cursor: help;
                                        position: absolute;
                                        display: flex;
                                        align-items: center;
                                        justify-content: center;
                                        top:0;
                                        left:0;
                                        opacity: 0;
                                        height: ${diameter}vw;
                                        width: ${diameter}vw;
                                        border-radius: 50%;
                                        background-color: white!important;
                                        font-weight: bolder;
                                        font-size: 2.5vh;
                                        border: 2px solid rgb(37, 201, 37);
                                        transition: border ${seconds}s, opacity ${seconds}s!important;
                                    }

                                    .TreeElement.transform{
                                        transition: border ${seconds}s, opacity ${seconds}s, transform ${seconds}s ease-in-out!important;
                                    }


                                    .trasverser{
                                        position: absolute;
                                        font-size: 3vw;
                                        top:0;
                                        left: 0;
                                        opacity: 0;
                                        transition: opacity ${seconds / 2}s, transform ${seconds}s;
                                        z-index: 3;
                                    }

                                    .comparator{
                                        position: absolute;
                                        display: block;
                                        opacity: 0;
                                        height: 2vh;
                                        width: 2vh;
                                        font-size: 2vh;
                                        transition: opacity ${seconds}s;
                                        margin:0;
                                    }

                                    .line {
                                        position: absolute;
                                        height: 2px;
                                        width: 100px; /* fixed base width */
                                        background-color: black;
                                        transform-origin: 0 0;
                                        transition: transform ${seconds}s ease-in-out, opacity ${seconds}s;
                                        will-change: transform;
                                    }

                                    .comparatorTransform{
                                        position: absolute;
                                        opacity: 0;
                                        transition: opacity ${seconds}s;
                                    } `;
                                document.head.appendChild(style);
                                animationSpeed = speed;
                                returnval = `The animation speed has been now set to ${speed}x`;
                            }
                        }
                        else {
                            if (params[2] == "off") {
                                animation = false;
                                let noAnimationElements = [...document.getElementsByClassName("TreeElement")];
                                    noAnimationElements.forEach((e) => {
                                        //console.log(typeof(e));
                                        e.classList.add("no-animation");
                                        (e as HTMLElement).offsetHeight;
                                    });
                                returnval = `Animations have been turned off.`;
                            }
                            else {
                                if (params[2] == "on") {
                                    animation = true;
                                    let noAnimationElements = [...document.getElementsByClassName("no-animation")];
                                    noAnimationElements.forEach((e) => {
                                        //console.log(typeof(e));
                                        e.classList.remove("no-animation");
                                        (e as HTMLElement).offsetHeight;
                                    });
                                    returnval = `Animations have been turned on.`;
                                }
                                else {
                                    returnval = `Invalid animation parameter ${params[2]}`;
                                }
                            }
                        }

                        break;

                    case "help":
                        returnval = `'set speed ([1-10])' sets the animation speed`;
                        break;

                    default:
                        returnval = `The passed parameter is not valid`;
                        break;

                }
                break;

            case "show":
                switch (params[1]) {
                    case "array":
                        if (binarysearchT.arr!.length) {
                            if (params[2] == 'true') {
                                let s = "[";
                                for (let i = 0; i < binarysearchT.arr!.length; i++) {
                                    let val = binarysearchT.arr![i] == undefined ? '<span style="color: grey">[empty]</span>' : binarysearchT.arr![i].key;
                                    s += `<span style='color: orange'>${i}</span>: ${val}${(i < binarysearchT.arr!.length - 1) ? ", " : "]"}`;
                                };
                                s += "<br>Where the <span style='color: orange'>rank</span> is orange";
                                returnval = s;
                            }
                            else {
                                let s = "[";
                                binarysearchT.arr!.forEach((val: { key: any; }, index: number, arr: string | any[]) => {
                                    s += `<span style='color: orange'>${index}</span>: ${val.key}${(index < arr.length - 1) ? ", " : "]"}`;
                                });
                                s += "<br>Where the <span style='color: orange'>rank</span> is orange";
                                returnval = s;
                            }
                        }
                        else {
                            returnval = "The array is empty.";
                        }

                        break;

                    case "help":
                        returnval = "'show' has the following options:<br>\t-array (?boolean:show empty slots): shows the array representation of the binary search tree";
                        break;

                    default:
                        returnval = `'show' command has an invalid parameter. try 'show help' for help`;
                        break;
                }
                break;
            case "fill-random":
                (async function () {
                    if(animation){
                        await binarysearchT.addNewTransform(new BinarySearchTree.TreeElement(50)); //since it is going to be randomized between 0 and 99, I want the root to be exactly the median
                        for (let i = 0; i < 20; i++) {
                            let random = Math.floor(Math.random() * 100);
                            if (binarysearchT.rankOf(random) == -1)
                                await binarysearchT.addNewTransform(new BinarySearchTree.TreeElement(random));
                        }
                    }
                    else{
                        await binarysearchT.addNew(new BinarySearchTree.TreeElement(50)); //since it is going to be randomized between 0 and 99, I want the root to be exactly the median
                        for (let i = 0; i < 20; i++) {
                            let random = Math.floor(Math.random() * 100);
                            if (binarysearchT.rankOf(random) == -1)
                                await binarysearchT.addNew(new BinarySearchTree.TreeElement(random));
                        }
                    }
                    
                })();

                break;

            case "trasverse":
                let trasverseType = params[1].toLowerCase();
                if (binarysearchT.size > 0) {
                    switch (trasverseType) {
                        case "in-order":
                        case "inorder":
                            if (params[2]) { //if the trasversal starts from a certain key
                                if (animation)
                                    returnval = await binarysearchT.trasversal(parseInt(params[2]), "in-order");
                                else
                                    returnval = binarysearchT.inOrder(parseInt(params[2]));
                            }
                            else {
                                if (animation)
                                    returnval = await binarysearchT.trasversal(0, "in-order");
                                else
                                    returnval = binarysearchT.inOrder(0);

                            }
                            returnval = "In-order Trasversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                            break;
                        case "pre-order":
                        case "preorder":
                            if (params[2]) { //if the trasversal starts from a certain key
                                if (animation)
                                    returnval = await binarysearchT.trasversal(parseInt(params[2]), "pre-order");
                                else
                                    returnval = binarysearchT.preOrder(parseInt(params[2]));
                            }
                            else {
                                if (animation)
                                    returnval = await binarysearchT.trasversal(0, "pre-order");
                                else
                                    returnval = binarysearchT.preOrder(0);
                            }
                            returnval = "Pre-order Trasversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                            break;

                        case "post-order":
                        case "postorder":
                            if (params[2]) { //if the trasversal starts from a certain key
                                if (animation)
                                    returnval = await binarysearchT.trasversal(parseInt(params[2]), "post-order");
                                else
                                    returnval = binarysearchT.postOrder(parseInt(params[2]));
                            }
                            else {
                                if (animation)
                                    returnval = await binarysearchT.trasversal(0, "post-order");
                                else
                                    returnval = binarysearchT.postOrder(0);
                            }
                            returnval = "Post-order Trasversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                            break;

                        default:
                            returnval = `The parameter given '${params[1]}' is not a valid trasversal mode.`;
                            break;

                    }
                }
                else {
                    returnval = `The binary search tree is empty. Cannot trasverse it`;
                }
                break;

            default:
                returnval = `Command '${params[0]}' is not a recognized command. Type 'help' for all the available commands`;
                break;
        }

        resolve(returnval);
    });
}



document.addEventListener("DOMContentLoaded", function() { 
    //exec(["insert", "full"]); //run the command 'insert full' at the beginning
    //exec(["insert",15,5,10,8,9,7,13,14,11]); left side of the tree
    //exec(["insert", 15,20, 17, 21, 16, 18]); right side of the tree
    //exec(["insert", 15,20, 17, 21, 16, 18, 19, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99]);
    //exec(["insert", 10,9,8]);
    //exec(["insert", "full"]);
    exec(["insert", 5, 3,1,4]);
    exec(["set", "animation", "on"]);
});

let focus = function () {
    focused = true;
    cursorAnimation();
}

let leave = function () {
    focused = false;
}

let paste = async function (e: { preventDefault: () => void; }) {
    e.preventDefault();
    let clip = await navigator.clipboard.readText();
    cursor!.remove();
    let text = document.getElementById("text");
    text!.innerHTML += clip;
    text!.parentElement!.append(cursor!);
    debconsole!.scrollTo(0, debconsole!.scrollHeight);
    focused = true;
}


setInterval(function () {
    cursorAnimation();
}, 1000);

let cursorAnimation = function () {

    if (focused) {
        if (displayed) {
            cursor!.style.color = "black";
        }
        else {
            cursor!.style.color = "white";
        }
        displayed = !displayed;
    }
    else {
        if (displayed) {
            cursor!.style.color = "black";
            displayed = false;
        }
    }

}
let consoleHeight = debconsole!.offsetHeight;

let minimize = function () {
    let output = document.getElementById("console-content");
    let bar = document.getElementById("console-bar");

    output!.style.display = "none";
    bar!.style.bottom = "0";
}

let maximize = function () {
    let output = document.getElementById("console-content");
    let bar = document.getElementById("console-bar");

    output!.style.display = "block";
    bar!.style.bottom = consoleHeight.toString();

}

function resizeConsole() {
    let output = document.getElementById("console-content");
    document.body.style.cursor = "ns-resize";
    if (output!.style.display == "none") { //resize even when minimized
        output!.style.display = "block";
        output!.style.height = (0).toString();
    }

    document.onmousemove = function (e) {
        if (e.clientY > 30) {
            consoleHeight = window.innerHeight - e.clientY;
            output!.style.height = consoleHeight - 29 + "px";
        }

    }

    document.onmouseup = function () {
        document.body.style.cursor = "default";
        document.onmousemove = null; //so it does not call these functions unless the user clicks again on the resizer
        document.onmouseup = null;
    }
};


//All event listeners
//The document catches the event and sets to false, unless the terminal overrides it with its listeners (capture vs target)
document.addEventListener("click", leave, true);
document.addEventListener("focus", leave, true);
debconsole!.addEventListener("click", focus);
debconsole!.addEventListener("focus", focus);
debconsole!.addEventListener("contextmenu", paste);
document.addEventListener("keydown", type);
document.getElementsByClassName("console-dot yellow")[0].addEventListener("click", minimize);
document.getElementsByClassName("console-dot green")[0].addEventListener("click", maximize);
document.getElementById("resizer")!.addEventListener("mousedown", resizeConsole);