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
let awaiting: boolean = false;

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

export var binarysearchT = new BinarySearchTree();
(window as any).binarysearchT = binarysearchT;

let resizeTimeout: ReturnType<typeof setTimeout> | undefined;

window.addEventListener('resize', () => {
    if (resizeTimeout !== undefined) {
        clearTimeout(resizeTimeout);
    }
    resizeTimeout = setTimeout(() => {
        binarysearchT.onResize(animation);
    }, 200); // only trigger after 200ms of no further resize events
});

const type = async function (e: { key: string; preventDefault: () => void; }) {
    //console.log(focused);
    if (focused) {
        switch (e.key) {
            case "Backspace":
                command!.innerHTML = command!.innerHTML.substring(0, command!.innerHTML.length - 1);
                break;

            default: //NEEDS OPTIMIZING
                if (!( e.key == "PageDown" || e.key == "PageUp" || e.key == "NumLock" || e.key == "Delete" || e.key == "Home" || e.key == "Insert" || e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "Alt" || e.key == "Shift" || e.key == "CapsLock" || e.key == "Control" || e.key == "Meta")){
                    //console.log(e.key);
                    //command!.innerHTML = command!.innerHTML + e.key;
                    let char = e.key.toString();
                    const re = new RegExp("^[A-Za-z0-9]$");
                    re.exec(char);
                    command!.innerHTML = command!.innerHTML + char;
                }
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
                
                parseCommand();
                break;
        }
    }
    if(e.key == "ArrowRight"){
        if(binarysearchT.paused && awaiting){
            command!.innerHTML = `next`;
            parseCommand(document.getElementById("toggle-animation-button"));
        }
        e.preventDefault();
    }
}

const parseCommand = async function (caller:HTMLElement|null=null) {
    let next = false;
    if(caller && caller.id == "toggle-animation-button"){
        next = true;
    }
    else{
        awaiting = true;
    }
    if(!next){
        let consoleOutput = document.getElementById("console-content");
        cursor!.remove();
        previousCommands.push(command!.innerHTML);
        point = previousCommands.length;
        command!.id = "";
        //console.log(command!.innerHTML.replaceAll(" ", ",").split(","));
        let allInputs = Array.from(document.getElementsByTagName('input'));
        allInputs.forEach((i)=>{
            if(binarysearchT.paused && i.id == "toggle-animation-button"){
                 i.disabled = false;
            }
            else i.disabled = true;
        });
        try{
            const parsedCommand = await exec(command!.innerHTML.replaceAll(" ", ",").split(",")).then((returnVal) => { return returnVal });
            if(parsedCommand != "go next"){ //awaiting for a command to return its promise. This is in case a user presses next before executing anything
                command!.innerHTML += "<br><br>" + parsedCommand;
            }
            else{
                awaiting = false;
            }
        }
        catch(e){
            command!.innerHTML += `<br><br>${e}`;
        }
        allInputs.forEach((i) => {
            if(animation){
                //console.log(`Animation on!`);
                if(!binarysearchT.paused && i.id == "toggle-animation-button") i.disabled = true;
                else{
                    i.disabled = false;
                }
            }
            else{
                console.log(`Animation off!`);
                if(i.id == "speed" || i.id == "toggle-animation-button") i.disabled = true;
                else{
                    i.disabled = false;
                }
            }
        });
        let newLine = document.createElement("p");
        newLine.innerHTML = "<b>guest@gchelossi: </b><span id=\'text\'></span>";
        consoleOutput!.append(newLine);
        command = document.getElementById("text");
        (consoleOutput!.lastChild as Element).append(cursor!);
        debconsole!.scrollTo(0, consoleOutput!.scrollHeight);
        awaiting = false;
    }
    else{
        //console.log(previousCommands);
        if(awaiting){
            await exec(["next"]);
            command!.innerHTML = previousCommands[previousCommands.length-1];
        }
        else {
            command!.innerHTML = ``;
            alert("No operations are running at the moment");
        }
        
    }
    
}

const exec = async function (...parameters: any[]) {
    return new Promise(async function (resolve, reject) {
        let returnval: string | number[] = "Command succesfully executed";
        let params = parameters[0];
        //console.log(parameters);
        const emptyNodes : boolean = (document.getElementById("empty") as HTMLInputElement).checked?true:false;
        switch (params[0]) {
            case 'insert':
                
                if (params[1] == "full") {
                    let arr = [25, 10, 40, 5, 15, 30, 50, 3, 7, 13, 20, 27, 35, 45, 55, 1, 4, 6, 8, 11, 14, 17, 24, 26, 29, 33, 37, 43, 47, 53, 60];
                    const insertFull = function () {
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
                    if(emptyNodes) binarysearchT.toggleEmptyNodes(); //in case you are using this command in a non-empty binary tree
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
                                    if(emptyNodes) binarysearchT.toggleEmptyNodes();
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
                                    if (vals.length > 0){
                                        returnval = `Succesfully inserted ${vals} into the binary search tree`;
                                    }
                                    else returnval = `None of the values have been inserted`;
                                }
                            }
                        })();
                        
                    }
                    else {
                        if(!Number.isInteger(Number.parseFloat(params[1]))){
                            reject(`The passed parameter is not an integer.`);
                        }
                        else{
                            if(binarysearchT.rankOf(parseInt(params[1]))>-1){
                                reject(`The key '${parseInt(params[1])}' is already present in the tree.`);
                            }
                            else{
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
                                if(emptyNodes) binarysearchT.toggleEmptyNodes();
                            }
                            
                        }
                        
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
                'search [value] returns the rank of a given value.'<br> \
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
                    if(emptyNodes) await binarysearchT.toggleEmptyNodes(false);
                    try{
                        await binarysearchT.removeKey(element, animation);
                        if(animation){
                            await sleep(1000/animationSpeed);
                        }
                        if(emptyNodes) await binarysearchT.toggleEmptyNodes();
                        
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
                returnval = "You know, this is not really a linux shell although I made it look like one :)";
                break;

            case "reset":
                binarysearchT.reset();
                break;

            case "search":
                if(animation){
                    try{
                        const rankAt = await binarysearchT.search(params[1]);
                        returnval = `The key '${params[1]}' is found at rank ${rankAt}`;
                    }
                    catch(e){
                        returnval = `The key '${params[1]}' is not present in the Binary Search Tree`;
                    }
                }
                else{
                    const rank = binarysearchT.rankOf(params[1]);
                    if (rank == -1) {
                        returnval = `The value '${params[1]}' is not in the tree`;
                    }
                    else {
                        returnval = `The value '${params[1]}' is at rank ${rank}`;
                    }
                }
                break;
                
            case "set":
                switch (params[1]) {
                    case "animation":
                        if (params[2] == "speed") {
                            const speed = parseInt(params[3]);
                            if (isNaN(speed) || (speed < 1 || speed > 5)) {
                                returnval = "The animation speed must be an integer between 1 and 5";
                            }
                            else {
                                /*const style = document.createElement('style');
                                let oldStyle = document.head.getElementsByTagName('style')[0];
                                if (oldStyle) {
                                    oldStyle.remove();
                                }*/
                               let style = document.getElementById("dynamic-animation-style") as HTMLStyleElement | null;
                                if (!style) {
                                    style = document.createElement("style");
                                    style.id = "dynamic-animation-style";
                                    document.head.appendChild(style);
                                }
                                let seconds = 1 / speed;
                                const temp = new BinarySearchTree.TreeElement(0);
                                const diameter = temp.diameter;
                                temp.dom.remove();
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
                                        background-color: white;
                                        font-weight: bolder;
                                        font-size: 2.5vh;
                                        border: 2px solid rgb(37, 201, 37);
                                        transition: border ${seconds}s, opacity ${seconds}s, background-color ${seconds}s;
                                    }

                                    .TreeElement.transform{
                                        transition: border ${seconds}s, opacity ${seconds}s, background-color ${seconds}s, transform ${seconds}s ease-in-out, width ${seconds}s, height ${seconds}s, font-size ${seconds}s;
                                    }


                                    .traverser{
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
                                        transition: background-color ${seconds*2}s;
                                        transform-origin: 0 0;
                                    }

                                    .line.transform{
                                        transition: transform ${seconds}s ease-in-out, opacity ${seconds}s, background-color ${seconds}s;
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
                                console.log(`Animation are being turned off`);
                                animation = false;
                                const radiobtn = document.getElementById("Off") as HTMLInputElement;
                                radiobtn.checked = true;
                                
                                /*const pauseButton = document.getElementById("pause-button") as HTMLInputElement;
                                const nextButton = document.getElementById("next-button") as HTMLInputElement;
                                
                                pauseButton.disabled = true;
                                nextButton.disabled = true;*/

                                
                                let noAnimationElements = [...document.getElementsByClassName("TreeElement")];
                                noAnimationElements.forEach((e) => {
                                    //console.log(typeof(e));
                                    e.classList.add("no-animation");
                                    (e as HTMLElement).offsetHeight;
                                });
                                let lines = [...document.getElementsByClassName("line")];
                                lines.forEach((e) => {
                                    //console.log(typeof(e));
                                    e.classList.remove("transform");
                                    (e as HTMLElement).offsetHeight;
                                });
                                returnval = `Animations have been turned off.`;
                            }
                            else {
                                if (params[2] == "on") {
                                    console.log(`Animation are being turned on`);
                                    animation = true;
                                    const radiobtn = document.getElementById("Automatic") as HTMLInputElement;
                                    radiobtn.checked = true;
                                    const speedBar = document.getElementById("speed") as HTMLInputElement;
                                    speedBar.disabled = false;

                                    const toggleButton = document.getElementById("toggle-animation-button") as HTMLInputElement;
                                    toggleButton.disabled = true;
                                    const noAnimationElements = [...document.getElementsByClassName("no-animation")];
                                    binarysearchT.paused = false;
                                    noAnimationElements.forEach((e) => {
                                        //console.log(typeof(e));
                                        e.classList.remove("no-animation");
                                        (e as HTMLElement).offsetHeight;
                                    });
                                    returnval = `Animations have been turned on.`;
                                }
                                else {
                                    if(params[2] == "manual"){
                                        animation = true;
                                        binarysearchT.paused = true;
                                        returnval = `Step-by-step animation has been turned on.`;
                                    }
                                    else returnval = `Invalid animation parameter ${params[2]}`;
                                }
                            }
                        }
                    break;

                    case "help":
                        returnval = `'set speed ([1-10])' sets the animation speed`;
                        break;

                    case "avl":
                        const avlCheckbox = document.getElementById("AVL") as HTMLInputElement;
                        if((params[2] != "on" && params[2] != "off") || !params[2]){
                            returnval = "Wrong use of 'set avl' command. Type 'help' for instructions";
                        }
                        else{
                            
                            //const elements = Array.from(document.getElementsByClassName("TreeElement"));

                            if(params[2] == "on") {
                                binarysearchT.avlStatus = true;
                                avlCheckbox.checked = true;
                                returnval = "AVL mode activated";
                            }
                            else {
                                binarysearchT.avlStatus = false;
                                avlCheckbox.checked = false;
                                returnval = "AVL mode deactivated";
                            }
                        }
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
                                    let val = binarysearchT.arr![i] || Number.isInteger(binarysearchT.arr![i].key) == undefined ? '<span style="color: grey">[empty]</span>' : binarysearchT.arr![i].key;
                                    s += `<span style='color: orange'>${i}</span>: ${val}${(i < binarysearchT.arr!.length - 1) ? ", " : "]"}`;
                                };
                                s += "<br>Where the <span style='color: orange'>rank</span> is orange";
                                returnval = s;
                            }
                            else {
                                let s = "[";
                                binarysearchT.arr!.forEach((val: { key: number; }, index: number, arr: string | any[]) => {
                                    if(Number.isInteger(val.key))
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
                    
                    case "empty":
                        if(params[2]){
                            if(params[2] == "on"){
                                binarysearchT.toggleEmptyNodes();
                                returnval = `All unitialized nodes are now shown.`;
                            }
                            else{
                                if(params[2] == "off"){
                                    binarysearchT.toggleEmptyNodes(false);
                                    returnval = `All unitialized nodes have been hidden.`;
                                }
                                else{
                                    returnval = `The parameter ${params[2]} is not valid. Please type 'help empty' for instructions`;
                                }
                            }
                        }
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
                (document.getElementById("empty") as HTMLInputElement).checked?binarysearchT.toggleEmptyNodes():binarysearchT.toggleEmptyNodes(false);


                break;

            case "traverse":
                let traverseType: string = params[1].toLowerCase();
                if(!params[1]){
                    returnval = `You must specify a traversal mode. Try 'in-order', 'pre-order' or 'post-order'`;
                    break;
                }
                if (binarysearchT.size > 0) {
                    switch (traverseType) {
                        case "in-order":
                        case "inorder":
                            if (params[2]) { //if the traversal starts from a certain key
                                if (animation)
                                    returnval = await binarysearchT.traversal(parseInt(params[2]), "in-order");
                                else
                                    returnval = binarysearchT.inOrder(parseInt(params[2]));
                            }
                            else {
                                if (animation)
                                    returnval = await binarysearchT.traversal(0, "in-order");
                                else
                                    returnval = binarysearchT.inOrder(0);

                            }
                            returnval = "In-order traversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                            break;
                        case "pre-order":
                        case "preorder":
                            if (params[2]) { //if the traversal starts from a certain key
                                if (animation)
                                    returnval = await binarysearchT.traversal(parseInt(params[2]), "pre-order");
                                else
                                    returnval = binarysearchT.preOrder(parseInt(params[2]));
                            }
                            else {
                                if (animation)
                                    returnval = await binarysearchT.traversal(0, "pre-order");
                                else
                                    returnval = binarysearchT.preOrder(0);
                            }
                            returnval = "Pre-order traversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                            break;

                        case "post-order":
                        case "postorder":
                            if (params[2]) { //if the traversal starts from a certain key
                                if (animation)
                                    returnval = await binarysearchT.traversal(parseInt(params[2]), "post-order");
                                else
                                    returnval = binarysearchT.postOrder(parseInt(params[2]));
                            }
                            else {
                                if (animation)
                                    returnval = await binarysearchT.traversal(0, "post-order");
                                else
                                    returnval = binarysearchT.postOrder(0);
                            }
                            returnval = "Post-order traversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                            break;

                        default:
                            returnval = `The parameter given '${params[1]}' is not a valid traversal mode.`;
                            break;

                    }
                }
                else {
                    returnval = `The binary search tree is empty. Cannot traverse it`;
                }
                break;

            case "play":
                binarysearchT.paused = false;
                const ev = new Event("play");
                document.dispatchEvent(ev);
                returnval = "Animation are resumed.";
            break;

            case "pause":
                binarysearchT.paused = true;
                returnval = "Animation are paused.";
            break;

            case "next":
                const goNext = new Event("play");
                document.dispatchEvent(goNext);
                returnval = "go next";
            break;

            default:
                returnval = `Command '${params[0]}' is not a recognized command. Type 'help' for all the available commands`;
                break;
        }

        resolve(returnval);
    });
}



document.addEventListener("DOMContentLoaded",async function() {
    //await exec(["insert", 44,17,78,32,50,88,48,62]); //this is the balanced tree before the insertion of 49
    
    
    //insert 44,17,51,10,32,48,78,5,15,27,35,49,62,88,7,13,16,20,28,33,40
    //await exec(["insert", 44,17,51,32,48,78,49,62,88]); //this is the balanced tree after the insertion of 49
    await exec(["insert", 10,5,15, 1, 7]); //this is the balanced tree after the insertion of 49
    //await exec(["insert", 44,17,51,10,32,48,78,5,15,27,35,49,62,88,7,13,16,20,28,33,40, 2]); //more complex subtrees
    
    await exec(["set", "animation", "on"]);
    await exec(["set", "avl", "on"]);
    await exec(["set", "animation", "speed", 5]);
    //await exec(["insert", 49]); //this is the balanced tree before the insertion of 49
});

const focus = function () {
    focused = true;
    cursorAnimation();
}

const leave = function () {
    focused = false;
}

const paste = async function (e: { preventDefault: () => void; }) {
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

const cursorAnimation = function () {

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
//let consoleHeight = debconsole!.offsetHeight;



//All event listeners
//The document catches the event and sets to false, unless the terminal overrides it with its listeners (capture vs target)
document.getElementById("add-button")!.addEventListener("click", function(){ 
    let input = (document.getElementsByTagName("input")[0] as HTMLInputElement);
    command!.innerHTML = `insert ${input.value}`;
    input.value = ``;
    parseCommand();
});
document.getElementById("delete-button")!.addEventListener("click", function(){ 

    let input = (document.getElementsByTagName("input")[0] as HTMLInputElement);
    command!.innerHTML = `remove ${input.value}`;
    input.value = ``;
    parseCommand();
});
document.getElementById("search-button")!.addEventListener("click", function(){ 
    let input = (document.getElementsByTagName("input")[0] as HTMLInputElement);
    command!.innerHTML = `search ${input.value}`;
    input.value = ``;
    parseCommand();
});
document.getElementById("traverse-button")!.addEventListener("click", function(){
    const selectedRadio = document.querySelector('input[name="trasversalselection"]:checked') as HTMLInputElement;
    command!.innerHTML = `traverse ${selectedRadio?.value}`;
    parseCommand();
});

document.querySelectorAll('input[name="animationselection"]')
    .forEach((element) => {
        const el = element as HTMLInputElement ;
        el.addEventListener("click", () => {
            //console.log(element.value);
            command!.innerHTML = `set animation ${el.value.toLowerCase()}`;
            parseCommand();
        });
    });

document.getElementById("speed")!.addEventListener("mouseup", function () {
    const parsed = this as HTMLInputElement;
    command!.innerHTML = `set animation speed ${parsed.value}`;
    document.getElementById("labelspeed")!.innerHTML = `x${parsed.value} Speed`;
    parseCommand();
});

document.getElementById("AVL")!.addEventListener("change", function () {
    const el = this as HTMLInputElement;
    if (el.checked) {
        command!.innerHTML = `set avl on`;
    } else {
        command!.innerHTML = `set avl off`;
    }

    parseCommand();
});

document.getElementById("empty")!.addEventListener("change", function(){
    const el = this as HTMLInputElement;
    if (el.checked) {
        command!.innerHTML = `show empty on`;
    } else {
        command!.innerHTML = `show empty off`;
    }

    parseCommand();
});

document.getElementById("toggle-animation-button")?.addEventListener("click", function(){
    command!.innerHTML = `next`;
    parseCommand(this);
});



document.addEventListener("click", function () { focused = false; }, true);
document.addEventListener("click", leave, true);
document.addEventListener("focus", leave, true);
debconsole!.addEventListener("click", focus);
debconsole!.addEventListener("focus", focus);
debconsole!.addEventListener("contextmenu", paste);
document.addEventListener("keydown", type);
//document.getElementsByClassName("console-dot yellow")[0].addEventListener("click", minimize);
//document.getElementsByClassName("console-dot green")[0].addEventListener("click", maximize);
//document.getElementById("resizer")!.addEventListener("mousedown", resizeConsole);