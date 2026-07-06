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
    if (focused) {
        switch (e.key) {
            case "Backspace":
                command!.innerHTML = command!.innerHTML.substring(0, command!.innerHTML.length - 1);
                break;

            default:
                if(e.key.length == 1){ //it means it is just a simple key and not win/pageup/pagedown et cetera special keys
                    let char = e.key.toString();
                    command!.innerHTML = command!.innerHTML + char;
                }
                else {
                    e.preventDefault();
                }
                break;

            case "ArrowUp":
                e.preventDefault(); //to avoid scrolling with the arrows in the console
                if (previousCommands.length > 0) {
                    if (point > 0)
                        point--;
                    command!.innerHTML = previousCommands[point];
                }
                break;



            case "ArrowDown":
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
                if(!binarysearchT.paused && i.id == "toggle-animation-button") i.disabled = true;
                else{
                    i.disabled = false;
                }
            }
            else{
                if(i.id == "speed" || i.id == "toggle-animation-button") i.disabled = true;
                else{
                    i.disabled = false;
                }
            }
        });
        let newLine = document.createElement("p");
        newLine.innerHTML = "<b>guest@gchelossi-dev.com: </b><span id=\'text\'></span>";
        consoleOutput!.append(newLine);
        command = document.getElementById("text");
        (consoleOutput!.lastChild as Element).append(cursor!);
        debconsole!.scrollTo(0, consoleOutput!.scrollHeight);
        awaiting = false;
    }
    else{
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
        const emptyNodes : boolean = (document.getElementById("empty") as HTMLInputElement).checked?true:false;
        switch (params[0]) {
            case 'insert':
                if(emptyNodes) await binarysearchT.toggleEmptyNodes(false); 
                if (params[1] == "full") {
                    binarysearchT.reset();
                    let arr = [25, 10, 40, 5, 15, 30, 50, 3, 7, 13, 20, 27, 35, 45, 55, 1, 4, 6, 8, 11, 14, 17, 24, 26, 29, 33, 37, 43, 47, 53, 60];
                    const insertFull = function () {
                        return new Promise(async function (res) {
                            returnval = `Succesfully inserted ${arr} into the binary search tree`;
                            for (let i = 0; i < arr.length; i++) {
                                if (animation)
                                    await binarysearchT.addNewTransform(new BinarySearchTree.TreeElement(arr[i]));
                                else
                                    await binarysearchT.addNew(new BinarySearchTree.TreeElement(arr[i]));
                            }
                            res(true);
                        });
                    };
                    await insertFull();
                }
                else{
                    if (params[1] === "random") {
                        const parseInteger = (value: string | undefined): number | null => {
                            if (value === undefined) return null;

                            const n = Number(value);
                            return Number.isInteger(n) ? n : null;
                        };

                        let min = 0;
                        let max = 99;
                        let count = 20;

                        const p2 = parseInteger(params[2]);
                        const p3 = parseInteger(params[3]);
                        const p4 = parseInteger(params[4]);

                        if (params[2] !== undefined && p2 === null) {
                            reject(`Invalid max value: '${params[2]}'`);
                            break;
                        }

                        if (params[3] !== undefined && p3 === null) {
                            reject(`Invalid max value: '${params[3]}'`);
                            break;
                        }

                        if (params[4] !== undefined && p4 === null) {
                            reject(`Invalid count value: '${params[4]}'`);
                            break;
                        }

                        if (p2 !== null && p3 === null) {
                            // insert random <max>
                            max = p2;
                        } else if (p2 !== null && p3 !== null) {
                            // insert random <min> <max>
                            min = p2;
                            max = p3;
                        }

                        if (p4 !== null) {
                            count = p4;
                        }

                        if (min > max) {
                            reject(`Minimum value cannot be greater than maximum value.`);
                            break;
                        }

                        if (count <= 0) {
                            reject(`Count must be greater than 0.`);
                            break;
                        }

                        const rangeSize = max - min + 1;

                        if (count > rangeSize) {
                            reject(`Cannot insert ${count} unique keys from range [${min}, ${max}]. Maximum possible is ${rangeSize}.`);
                            break;
                        }

                        const insertOne = async (value: number) => {
                            const element = new BinarySearchTree.TreeElement(value);

                            if (animation) {
                                await binarysearchT.addNewTransform(element);
                            } else {
                                await binarysearchT.addNew(element);
                            }
                        };

                        const shuffle = (arr: number[]): number[] => {
                            for (let i = arr.length - 1; i > 0; i--) {
                                const j = Math.floor(Math.random() * (i + 1));
                                [arr[i], arr[j]] = [arr[j], arr[i]];
                            }

                            return arr;
                        };

                        await (async function () {
                            const median = Math.floor((min + max) / 2);

                            const values: number[] = [];

                            // Put median first so the initial root is centered.
                            values.push(median);

                            const candidates: number[] = [];

                            for (let n = min; n <= max; n++) {
                                if (n !== median) {
                                    candidates.push(n);
                                }
                            }

                            shuffle(candidates);

                            values.push(...candidates.slice(0, count - 1));


                            for (const value of values) {
                                if (binarysearchT.rankOf(value) === -1) {
                                    await insertOne(value);
                                }
                            }

                            returnval = `Successfully inserted ${values} into the binary search tree`;
                        })();
                    }
                    else {
                        if (params.length > 2) {
                            let vals = params
                                .map((e: string) => parseInt(e, 10))
                                .filter((v: number) => !isNaN(v));

                            returnval = `Successfully inserted ${vals} into the binary search tree`;

                            // If empty-node mode is active, remove placeholders before inserting

                            for (let i = 0; i < vals.length; i++) {
                                try {
                                    const element = new BinarySearchTree.TreeElement(vals[i]);

                                    if (animation) {
                                        await binarysearchT.addNewTransform(element);
                                    } else {
                                        await binarysearchT.addNew(element);
                                    }
                                } catch (e) {
                                    let index = -1;

                                    if (typeof e === "string") {
                                        index = vals.indexOf(parseInt(e.substring(1), 10));
                                    }

                                    if (index > -1) {
                                        vals.splice(index, 1);
                                        i--;
                                    }

                                    alert(e);

                                    if (vals.length > 0) {
                                        returnval = `Successfully inserted ${vals} into the binary search tree`;
                                    } else {
                                        returnval = `None of the values have been inserted`;
                                    }
                                }
                            }
                            
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
                                                await binarysearchT.addNew(new BinarySearchTree.TreeElement(parseInt(params[1])));
                                            returnval = `Succesfully inserted ${params[1]} into the binary search tree`;
                                        }
                                        catch (e) {
                                            returnval = String(e);
                                        }
                                    })();
                                }
                                
                            }
                            
                        }
                    }
                }
                
                if(emptyNodes) await binarysearchT.toggleEmptyNodes(true); 

                break;

            case 'equivalent':
                if (binarysearchT.size > 0)
                    returnval = "insert " + binarysearchT.arr!.map((v: { key: any; } | undefined) => {
                        if (v != undefined) {
                            return v.key;
                        }

                    }).filter((v: any) => { 
                        if (v && parseInt(v) == v) 
                            return v 
                    }).toString();
                else
                    returnval = "The tree is empty";
                break;

            case "help": {
                const helpWindow = window.open("./help.html", "_blank");

                returnval = helpWindow
                    ? `
                        <div style="line-height: 1.5;">
                            <h2>Help</h2>

                            <p>
                                The full command documentation has been opened in a new tab.
                            </p>

                            <p>
                                <a href="./help.html" target="_blank" style="font-weight: bold; color: cyan;">
                                    Open Command Help Page
                                </a>
                            </p>
                        </div>
                    `
                    : `
                        <div style="line-height: 1.5;">
                            <h2>Help</h2>

                            <p>
                                The browser blocked the help page popup.
                            </p>

                            <p>
                                <a href="./help.html" target="_blank" style="font-weight: bold; color: cyan;">
                                    Click here to open the full command documentation.
                                </a>
                            </p>
                        </div>
                    `;

                break;
            }

            case "credits":
            returnval = `
                <div style="line-height: 1.5;">
                    <h2>Credits</h2>

                    <p>
                        Thank you for checking out this project.
                        This visualizer was designed to make Binary Search Trees and AVL Trees
                        easier to understand through interactive animations and direct inspection
                        of the underlying array representation.
                    </p>

                    <p>
                        Features include insertion, removal, search, traversal, empty-node display,
                        AVL balancing, rotations, animation controls, and step-by-step execution.
                    </p>

                    <p>
                        Created by <b>Gabriele Chelossi</b>.
                    </p>

                    <p>
                        Contact:
                        <a href="mailto:contact@gchelossi-dev.com">
                            contact@gchelossi-dev.com
                        </a>
                    </p>

                    <p>
                        Website:
                        <a href="https://gchelossi-dev.com" target="_blank">
                            https://gchelossi-dev.com
                        </a>
                    </p>
                </div>
            `;
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
                        
                        
                        resolve(`The key '${params[1]}' has been deleted.`);
                    }
                    catch(e){
                        reject(e);
                    }
                    finally{
                        if(emptyNodes) await binarysearchT.toggleEmptyNodes();
                    }
                }
            break;
            case 'ls':
            case 'pwd':
            case 'chmod':
            case 'su':
            case 'cd':
            case 'echo':
            case `exit`:
                returnval = "You know, this is not a real linux shell although I made it look like one ☺";
                break;

            case "reset":
                binarysearchT.reset();
                returnval = `The Binary Search Tree has been reset.`;
                break;

            case "search":
                if(Boolean(params[1]) && parseInt(params[1]) == params[1]){ //js weird stuff. Just making sure that the passed value is an integer and since it is a string if it is a float it will not pass the condition
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
                }
                else returnval = `The key is not a valid integer value`;
                
                break;
                
            case "set":
                switch (params[1]) {
                    case "animation":
                        if (params[2] == "speed") {
                            let speed = parseInt(params[3]);
                            const debug = params[4] == "coco"? true:false;
                            if (!debug && (isNaN(speed) || (speed < 1 || speed > 5))) {
                                returnval = "The animation speed must be an integer between 1 and 5";
                            }
                            else {
                               speed = speed*5;
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
                                returnval = `The animation speed has been now set to ${speed/5}x`;
                            }
                        }
                        else {
                            if (params[2] == "off") {
                                animation = false;
                                const radiobtn = document.getElementById("Off") as HTMLInputElement;
                                radiobtn.checked = true;
                                binarysearchT.paused = false;
                                
                                let noAnimationElements = [...document.getElementsByClassName("TreeElement")];
                                noAnimationElements.forEach((e) => {
                                    e.classList.add("no-animation");
                                    (e as HTMLElement).offsetHeight;
                                });
                                let lines = [...document.getElementsByClassName("line")];
                                lines.forEach((e) => {
                                    e.classList.remove("transform");
                                    (e as HTMLElement).offsetHeight;
                                });
                                returnval = `Animations have been turned off.`;
                            }
                            else {
                                if (params[2] == "on" || params[2] == "manual") {
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
                                        e.classList.remove("no-animation");
                                        (e as HTMLElement).offsetHeight;
                                    });
                                    returnval = `Animations have been turned on.`;
                                    if(params[2] == "manual"){
                                        binarysearchT.paused = true;
                                        toggleButton.disabled = false;
                                        radiobtn.checked = false;
                                        const pausedBtn = document.getElementById("Manual") as HTMLInputElement;
                                        pausedBtn.checked = true;
                                        returnval = `Step-by-step animation has been turned on.`;
                                    }
                                }
                                else {
                                    returnval = `Invalid animation parameter ${params[2]}`;
                                }
                            }
                        }
                    break;

                    case "help":
                        returnval = `'set speed ([1-5])' sets the animation speed`;
                        break;

                    case "avl":
                        const avlCheckbox = document.getElementById("AVL") as HTMLInputElement;
                        if((params[2] != "on" && params[2] != "off") || !params[2]){
                            returnval = "Wrong use of 'set avl' command. Type 'help' for instructions";
                        }
                        else{
                            
                            if(params[2] == "on") {
                                
                                binarysearchT.avlStatus = true;
                                avlCheckbox.checked = true;
                                returnval = "AVL mode activated";
                                //if a tree is already inserted, and non balanced, I want to map all the keys to their
                                //respective ranks as if the insertion had started as an AVL tree.
                                if(binarysearchT.size>0){
                                    const paused = binarysearchT.paused;
                                    let automaticIsOn: boolean = (document.getElementById("Automatic") as HTMLInputElement).checked;
                                    if(paused)  binarysearchT.paused = false;
                                    if(emptyNodes) await binarysearchT.toggleEmptyNodes(false);
                                    const equivalent = binarysearchT.arr
                                    .map(v => v?.key)
                                    .filter((v): v is number => v !== undefined);
                                    binarysearchT.reset();
                                    if(animation) await exec(["set", "animation", "off"]);
                                    await exec(["insert", ...equivalent.map(Number)]);
                                    if(animation) await exec(["set", "animation", "on"]);
                                    if(emptyNodes) await binarysearchT.toggleEmptyNodes();
                                    if(paused)  {
                                        binarysearchT.paused = true;
                                        await exec(["set", "animation", "manual"]);
                                    }
                                    else if(automaticIsOn) await exec(["set", "animation", "on"]);

                                }
                                
                                
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
                    case "array": {
                        const arr = binarysearchT.arr ?? [];

                        if (!arr.length) {
                            returnval = "The array is empty.";
                            break;
                        }

                        const showEmptySlots = params[2]?.toLowerCase() === "true";

                        let realNodeCount = 0;

                        for (let i = 0; i < arr.length; i++) {
                            const node = arr[i];

                            if (node && Number.isInteger(node.key)) {
                                realNodeCount++;
                            }
                        }

                        const rows: {
                            rank: number;
                            state: "used" | "placeholder" | "unused";
                            key: number | null;
                            rawKey: number | null;
                            depth: number;
                            parentRank: number | null;
                            leftRank: number;
                            rightRank: number;
                        }[] = [];

                        for (let index = 0; index < arr.length; index++) {
                            const node = arr[index];

                            const isRealNode = Boolean(node && Number.isInteger(node.key));
                            const isVisualPlaceholder = Boolean(node && !Number.isInteger(node.key));

                            let state: "used" | "placeholder" | "unused";

                            if (isRealNode) {
                                state = "used";
                            } else if (isVisualPlaceholder) {
                                state = "placeholder";
                            } else {
                                state = "unused";
                            }

                            if (!showEmptySlots && state !== "used") {
                                continue;
                            }

                            rows.push({
                                rank: index,
                                state,
                                key: isRealNode ? node!.key : null,
                                rawKey: node ? node.key : null,
                                depth: Math.floor(Math.log2(index + 1)),
                                parentRank: index === 0 ? null : Math.floor((index - 1) / 2),
                                leftRank: 2 * index + 1,
                                rightRank: 2 * index + 2
                            });
                        }

                        console.log("Array view payload:", {
                            showEmptySlots,
                            arrayLength: arr.length,
                            realNodeCount,
                            rowsLength: rows.length
                        });

                        const id =
                            typeof crypto !== "undefined" && "randomUUID" in crypto
                                ? crypto.randomUUID()
                                : String(Date.now());

                        const payload = {
                            temporary: true,
                            showEmptySlots,
                            generatedAt: new Date().toLocaleString(),
                            arrayLength: arr.length,
                            realNodeCount,
                            rows
                        };

                        localStorage.setItem(`bst-array-view:${id}`, JSON.stringify(payload));

                        const opened = window.open(`./array.html?id=${id}`, "_blank");

                        returnval = opened
                            ? "Opened the array representation in a new page."
                            : `
                                The browser blocked the popup.
                                <br>
                                <a href="./array.html?id=${id}" target="_blank" style="color: cyan; font-weight: bold;">
                                    Click here to open the array representation.
                                </a>
                            `;

                        break;
                    }

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
    await exec(["set", "animation", "off"]);
    await exec(["set", "animation", "speed", 1]);
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

document.getElementById("reset")!.addEventListener("click", function(){
    command!.innerHTML = `reset`;
    parseCommand();
});

document.querySelectorAll('input[name="animationselection"]')
    .forEach((element) => {
        const el = element as HTMLInputElement ;
        el.addEventListener("click", () => {
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