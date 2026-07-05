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
    //console.log("Pause called");
    return new Promise(resolve => {
        document.body.onkeyup = (e) => {
            if (e.key === "Enter") {
                resolve(true);
                document.body.onkeyup = null;
                //console.log("Pause resolved");
            }
        };
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
                //console.log(`Animation off!`);
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

                    }).filter((v: any) => { if (v) return v }).toString();
                else
                    returnval = "The tree is empty";
                break;

            case "help":
            returnval = `
                <div style="line-height: 1.45">
                    <h2>Binary Search Tree Visualizer — Help</h2>

                    <p>
                        This project visualizes a <b>Binary Search Tree</b> using an
                        <b>array-based representation</b>. Each node has a rank/index:
                        for a node at rank <code>i</code>, its left child is stored at
                        <code>2*i + 1</code> and its right child at <code>2*i + 2</code>.
                    </p>

                    <p>
                        The visualizer supports regular BST operations, AVL self-balancing mode,
                        animated insertion/search/removal, manual step-by-step animation,
                        traversal animations, empty-node display, and direct inspection of the
                        underlying array.
                    </p>

                    <hr>

                    <h3>Insertion Commands</h3>

                    <p>
                        <code>insert [value]</code><br>
                        Inserts a single integer key into the tree.
                    </p>

                    <p>
                        Example:<br>
                        <code>insert 42</code>
                    </p>

                    <p>
                        <code>insert [v1] [v2] [v3] ...</code><br>
                        Inserts multiple keys in the given order.
                    </p>

                    <p>
                        Example:<br>
                        <code>insert 50 30 70 20 40 60 80</code>
                    </p>

                    <p>
                        <code>insert full</code><br>
                        Clears the current tree and inserts a predefined full test tree.
                        This is useful for quickly generating a large example.
                    </p>

                    <p>
                        <code>insert random</code><br>
                        Inserts 20 unique random keys between 0 and 99.
                        The median value is inserted first so the initial root is centered.
                    </p>

                    <p>
                        <code>insert random [max]</code><br>
                        Inserts 20 unique random keys between 0 and <code>max</code>.
                    </p>

                    <p>
                        <code>insert random [min] [max]</code><br>
                        Inserts 20 unique random keys between <code>min</code> and <code>max</code>.
                    </p>

                    <p>
                        <code>insert random [min] [max] [count]</code><br>
                        Inserts <code>count</code> unique random keys between
                        <code>min</code> and <code>max</code>.
                    </p>

                    <p>
                        Examples:<br>
                        <code>insert random</code><br>
                        <code>insert random 200</code><br>
                        <code>insert random 10 80</code><br>
                        <code>insert random 10 80 30</code>
                    </p>

                    <hr>

                    <h3>Removal Command</h3>

                    <p>
                        <code>remove [value]</code><br>
                        Removes a key from the tree if it exists.
                        The visualizer handles standard BST deletion cases:
                        leaf deletion, deletion of a node with one child, deletion of a node
                        with two children, and AVL rebalancing when AVL mode is enabled.
                    </p>

                    <p>
                        Example:<br>
                        <code>remove 42</code>
                    </p>

                    <hr>

                    <h3>Search Command</h3>

                    <p>
                        <code>search [value]</code><br>
                        Searches for a key and returns its rank in the array representation.
                        If animations are enabled, the search path is highlighted visually.
                    </p>

                    <p>
                        Example:<br>
                        <code>search 30</code>
                    </p>

                    <hr>

                    <h3>Traversal Commands</h3>

                    <p>
                        <code>traverse in-order</code><br>
                        Traverses the tree in sorted order: left subtree, root, right subtree.
                    </p>

                    <p>
                        <code>traverse pre-order</code><br>
                        Traverses the tree as: root, left subtree, right subtree.
                    </p>

                    <p>
                        <code>traverse post-order</code><br>
                        Traverses the tree as: left subtree, right subtree, root.
                    </p>

                    <p>
                        You can also provide a starting rank/key parameter depending on the current implementation:
                    </p>

                    <p>
                        Examples:<br>
                        <code>traverse in-order</code><br>
                        <code>traverse pre-order</code><br>
                        <code>traverse post-order</code>
                    </p>

                    <hr>

                    <h3>AVL Mode</h3>

                    <p>
                        <code>set avl on</code><br>
                        Activates AVL mode. Future insertions and removals will automatically
                        rebalance the tree when necessary.
                    </p>

                    <p>
                        If the tree already contains nodes, enabling AVL mode converts the current
                        tree into an AVL-balanced version by reinserting the existing keys under AVL rules.
                    </p>

                    <p>
                        <code>set avl off</code><br>
                        Deactivates AVL mode. Future insertions behave like a regular,
                        non-self-balancing BST.
                    </p>

                    <p>
                        Examples:<br>
                        <code>set avl on</code><br>
                        <code>set avl off</code>
                    </p>

                    <hr>

                    <h3>Animation Controls</h3>

                    <p>
                        <code>set animation on</code><br>
                        Enables automatic animations.
                    </p>

                    <p>
                        <code>set animation off</code><br>
                        Disables animations. Operations execute immediately.
                    </p>

                    <p>
                        <code>set animation manual</code><br>
                        Enables step-by-step mode. The visualizer pauses during animations
                        and waits for a manual resume/next command.
                    </p>

                    <p>
                        <code>set animation speed [1-5]</code><br>
                        Sets the animation speed. Higher values are faster.
                    </p>

                    <p>
                        Examples:<br>
                        <code>set animation on</code><br>
                        <code>set animation off</code><br>
                        <code>set animation manual</code><br>
                        <code>set animation speed 3</code>
                    </p>

                    <hr>

                    <h3>Manual Animation Controls</h3>

                    <p>
                        <code>pause</code><br>
                        Pauses the animation system.
                    </p>

                    <p>
                        <code>play</code><br>
                        Resumes the animation system.
                    </p>

                    <p>
                        In manual animation mode, the visualizer pauses between animation steps.
                        The next-step action is controlled through the animation toggle button in the interface,
                        not through a user-entered console command.
                    </p>

                    

                    <hr>

                    <h3>Display Commands</h3>

                    <p>
                        <code>show array</code><br>
                        Displays the internal array representation of the tree, showing only
                        initialized real nodes.
                    </p>

                    <p>
                        <code>show array true</code><br>
                        Displays the full array representation, including empty slots.
                        Ranks are shown in <span style="color: orange">orange</span>.
                    </p>

                    <p>
                        <code>show empty on</code><br>
                        Displays uninitialized child positions as visual empty nodes.
                        This helps show where future insertions would go.
                    </p>

                    <p>
                        <code>show empty off</code><br>
                        Hides the visual empty nodes.
                    </p>

                    <p>
                        <code>show help</code><br>
                        Shows help for the <code>show</code> command.
                    </p>

                    <p>
                        Examples:<br>
                        <code>show array</code><br>
                        <code>show array true</code><br>
                        <code>show empty on</code><br>
                        <code>show empty off</code>
                    </p>

                    <hr>

                    <h3>Utility Commands</h3>

                    <p>
                        <code>equivalent</code><br>
                        Returns an equivalent <code>insert ...</code> command containing
                        the keys currently stored in the tree. This is useful for reproducing
                        the same tree later.
                    </p>

                    <p>
                        <code>reset</code><br>
                        Clears the tree and removes all nodes and connections.
                    </p>

                    <p>
                        <code>clear</code><br>
                        Clears the command console output.
                    </p>

                    <p>
                        <code>credits</code><br>
                        Shows developer credits and contact information.
                    </p>

                    <hr>

                    <h3>Fake Shell Commands</h3>

                    <p>
                        The console visually resembles a terminal, but it is not a real Linux shell.
                        Commands such as <code>ls</code>, <code>pwd</code>, <code>cd</code>,
                        <code>chmod</code>, <code>su</code>, <code>echo</code>, and
                        <code>exit</code> are intentionally handled as jokes/placeholders.
                    </p>

                    <hr>

                    <h3>Quick Start Examples</h3>

                    <p>
                        Build a regular BST:<br>
                        <code>set avl off</code><br>
                        <code>insert 50 30 70 20 40 60 80</code>
                    </p>

                    <p>
                        Build an AVL tree:<br>
                        <code>set avl on</code><br>
                        <code>insert 50 30 70 20 40 60 80</code>
                    </p>

                    <p>
                        Generate a random AVL tree:<br>
                        <code>set avl on</code><br>
                        <code>insert random 0 100 25</code>
                    </p>

                    <p>
                        Inspect the array representation:<br>
                        <code>show array true</code>
                    </p>

                    <p>
                        Traverse the tree:<br>
                        <code>traverse in-order</code>
                    </p>

                    <p>
                        Use manual animation:<br>
                        <code>set animation manual</code><br>
                        <code>insert 30 20 10</code><br>
                        Then use the animation toggle button to advance through the operation step by step.
                    </p>
                </div>
            `;
            break;

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
                        Created by <b>Gabriel. Chelossi</b>.
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
                                /*const style = document.createElement('style');
                                let oldStyle = document.head.getElementsByTagName('style')[0];
                                if (oldStyle) {
                                    oldStyle.remove();
                                }*/
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
                                //console.log(`Animation are being turned off`);
                                animation = false;
                                const radiobtn = document.getElementById("Off") as HTMLInputElement;
                                radiobtn.checked = true;
                                binarysearchT.paused = false;
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
                                if (params[2] == "on" || params[2] == "manual") {
                                    //console.log(`Animation are being turned on`);
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
                            
                            //const elements = Array.from(document.getElementsByClassName("TreeElement"));
                            //const emptyNodes : boolean = (document.getElementById("empty") as HTMLInputElement).checked?true:false;
                            if(params[2] == "on") {
                                
                                binarysearchT.avlStatus = true;
                                avlCheckbox.checked = true;
                                returnval = "AVL mode activated";
                                //if a tree is already inserted, and non balanced, I want to map all the keys to their
                                //respective ranks as if the insertion had started as an AVL tree.
                                if(binarysearchT.size>0){
                                    const paused = binarysearchT.paused;
                                    if(paused)  binarysearchT.paused = false;
                                    if(emptyNodes) await binarysearchT.toggleEmptyNodes(false);
                                    const equivalent = binarysearchT.arr
                                    .map(v => v?.key)
                                    .filter((v): v is number => v !== undefined);
                                    //console.log(equivalent);
                                    binarysearchT.reset();
                                    if(animation) await exec(["set", "animation", "off"]);
                                    await exec(["insert", ...equivalent.map(Number)]);
                                    if(animation) await exec(["set", "animation", "on"]);
                                    if(emptyNodes) await binarysearchT.toggleEmptyNodes();
                                    if(paused)  {
                                        binarysearchT.paused = true;
                                        await exec(["set", "animation", "manual"]);
                                    }

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
                            returnval = `
                                <div style="padding: 0.75rem; border-left: 4px solid grey;">
                                    <b>Array Representation</b><br>
                                    The array is currently empty.
                                </div>
                            `;
                            break;
                        }

                        const showEmptySlots = params[2] === "true";

                        const rows: string[] = [];
                        let realNodeCount = 0;

                        for (let i = 0; i < arr.length; i++) {
                            const node = arr[i];
                            const isRealNode = node && Number.isInteger(node.key);

                            if (isRealNode) {
                                realNodeCount++;
                            }

                            if (!showEmptySlots && !isRealNode) {
                                continue;
                            }

                            const valueCell = isRealNode
                                ? `<span style="font-weight: bold;">${node.key}</span>`
                                : `<span style="color: grey; font-style: italic;">[empty]</span>`;

                            const typeCell = isRealNode
                                ? `<span style="color: rgb(37, 201, 37);">node</span>`
                                : `<span style="color: grey;">empty slot</span>`;

                            rows.push(`
                                <tr>
                                    <td style="padding: 0.35rem 0.6rem; color: orange; font-weight: bold; text-align: center;">
                                        ${i}
                                    </td>
                                    <td style="padding: 0.35rem 0.6rem; text-align: center;">
                                        ${valueCell}
                                    </td>
                                    <td style="padding: 0.35rem 0.6rem; text-align: center;">
                                        ${typeCell}
                                    </td>
                                    <td style="padding: 0.35rem 0.6rem; text-align: center; color: grey;">
                                        ${2 * i + 1}
                                    </td>
                                    <td style="padding: 0.35rem 0.6rem; text-align: center; color: grey;">
                                        ${2 * i + 2}
                                    </td>
                                </tr>
                            `);
                        }

                        if (!rows.length) {
                            returnval = `
                                <div style="padding: 0.75rem; border-left: 4px solid grey;">
                                    <b>Array Representation</b><br>
                                    No real nodes are currently stored in the array.
                                </div>
                            `;
                            break;
                        }

                        returnval = `
                            <div style="line-height: 1.45;">
                                <h3 style="margin-bottom: 0.4rem;">Array Representation</h3>

                                <p style="margin: 0.25rem 0 0.75rem 0;">
                                    <b>Mode:</b> ${showEmptySlots ? "Full array with empty slots" : "Real nodes only"}<br>
                                    <b>Real nodes:</b> ${realNodeCount}<br>
                                    <b>Array length:</b> ${arr.length}
                                </p>

                                <table style="
                                    border-collapse: collapse;
                                    margin-top: 0.5rem;
                                    font-family: monospace;
                                    min-width: 420px;
                                ">
                                    <thead>
                                        <tr style="border-bottom: 1px solid grey;">
                                            <th style="padding: 0.35rem 0.6rem; color: orange;">Rank</th>
                                            <th style="padding: 0.35rem 0.6rem;">Key</th>
                                            <th style="padding: 0.35rem 0.6rem;">Type</th>
                                            <th style="padding: 0.35rem 0.6rem;">Left child</th>
                                            <th style="padding: 0.35rem 0.6rem;">Right child</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        ${rows.join("")}
                                    </tbody>
                                </table>

                                <p style="margin-top: 0.75rem; color: grey;">
                                    Formula: for a node at rank <code>i</code>, left child = <code>2*i + 1</code>,
                                    right child = <code>2*i + 2</code>.
                                    Ranks are shown in <span style="color: orange;">orange</span>.
                                </p>
                            </div>
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
    function assertAVL(label: string = "") {
        const arr = binarysearchT.arr;
        const seenKeys = new Set<number>();
        const seenRanks = new Set<number>();

        function isRealNode(n: any): boolean {
            return Boolean(n) && Number.isInteger(n.key);
        }

        function walk(
            rank: number,
            min: number = -Infinity,
            max: number = Infinity,
            depth: number = 0
        ): { height: number; maxDepth: number; count: number } {
            const node = arr[rank];

            if (!isRealNode(node)) {
                return {
                    height: 0,
                    maxDepth: depth - 1,
                    count: 0
                };
            }

            const key = node.key;

            if (seenKeys.has(key)) {
                throw new Error(`${label}: duplicate key ${key}`);
            }

            if (!(key > min && key < max)) {
                throw new Error(
                    `${label}: BST violation at rank ${rank}, key=${key}, bounds=(${min}, ${max})`
                );
            }

            seenKeys.add(key);
            seenRanks.add(rank);

            const leftRank = rank * 2 + 1;
            const rightRank = rank * 2 + 2;

            const left = walk(leftRank, min, key, depth + 1);
            const right = walk(rightRank, key, max, depth + 1);

            const balanceDifference = Math.abs(left.height - right.height);

            if (balanceDifference > 1) {
                throw new Error(
                    `${label}: AVL violation at key=${key}, rank=${rank}, leftHeight=${left.height}, rightHeight=${right.height}`
                );
            }

            if (node.leftWeight !== left.height || node.rightWeight !== right.height) {
                throw new Error(
                    `${label}: wrong weights at key=${key}, rank=${rank}. ` +
                    `Expected leftWeight=${left.height}, rightWeight=${right.height}, ` +
                    `got leftWeight=${node.leftWeight}, rightWeight=${node.rightWeight}`
                );
            }

            return {
                height: 1 + Math.max(left.height, right.height),
                maxDepth: Math.max(depth, left.maxDepth, right.maxDepth),
                count: 1 + left.count + right.count
            };
        }

        const result = walk(0);

        for (let i = 0; i < arr.length; i++) {
            const node = arr[i];

            if (isRealNode(node) && !seenRanks.has(i)) {
                throw new Error(
                    `${label}: unreachable node at rank ${i}, key=${node.key}`
                );
            }
        }

        return {
            nodes: result.count,
            height: result.height,
            maxDepth: result.maxDepth
        };
    }
    const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    async function resetTree() {
        while (binarysearchT.size > 0) {
            await exec(["remove", binarysearchT.arr[0].key]);
            await sleep(1);
        }
    }

    async function insertMany(values: number[]) {
        for (const value of values) {
            await exec(["insert", value]);
            await sleep(1);
            assertAVL(`after insert ${value}`);
        }
    }

    async function removeMany(values: number[]) {
        for (const value of values) {
            await exec(["remove", value]);
            await sleep(1);
            assertAVL(`after remove ${value}`);
        }
    }

    async function runAVLCase(
        name: string,
        inserts: number[],
        removes: number[] = [],
        animation: "on" | "off" = "off"
    ) {
        console.log(`\n=== TEST: ${name} ===`);

        await exec(["set", "animation", animation]);
        await exec(["set", "avl", "on"]);

        await resetTree();
        await insertMany(inserts);
        await removeMany(removes);

        const stats = assertAVL(name);
        console.log(`PASS: ${name}`, stats);
    }

    function shuffle<T>(arr: T[]): T[] {
        const copy = [...arr];

        for (let i = copy.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [copy[i], copy[j]] = [copy[j], copy[i]];
        }

        return copy;
    }

    async function randomMixedAVLTest(size: number = 500) {
        console.log(`=== RANDOM MIXED AVL TEST: ${size} ===`);

        await exec(["set", "animation", "off"]);
        await exec(["set", "avl", "on"]);
        await resetTree();

        const values = shuffle(Array.from({ length: size }, (_, i) => i));

        for (const value of values) {
            await exec(["insert", value]);
            await sleep(1);
            assertAVL(`random insert ${value}`);
        }

        const deleteOrder = shuffle(values);

        for (const value of deleteOrder) {
            await exec(["remove", value]);
            await sleep(1);
            assertAVL(`random delete ${value}`);
        }

        console.log(`PASS: random mixed AVL test ${size}`);
    }
    
    await exec(["set", "animation", "off"]);
    await exec(["set", "animation", "speed", 1]);
    //await randomMixedAVLTest(500);
    //await randomMixedAVLTest(1000);
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

document.getElementById("reset")!.addEventListener("click", function(){
    command!.innerHTML = `reset`;
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
    /*alert("This feature has not been completed yet.");
    el.checked = false;*/
    
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