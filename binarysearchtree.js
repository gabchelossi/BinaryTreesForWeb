//document.addEventListener('DOMContentLoaded', main, false);
let debconsole = document.getElementById("console");
let cursor = document.getElementById("cursor");
let command = document.getElementById("text");
let displayed = true;
let focused = true;
let previousCommands = [];
let point = 0;
let animationSpeed = 1;

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function pause() {
    console.log("Pause called");
    return new Promise(resolve => {
        document.body.onkeyup = (e) => {
            if (e.key === "Enter") {
                resolve();
                document.body.onkeyup = null;
                console.log("Pause resolved");
            }
        };
    });
}

function awaitInput(){
    return new Promise(resolve => {
        let onKeyHandler = function(e){
            if(e.key == "ArrowRight"){
                document.removeEventListener('keydown', onKeyHandler);
                resolve();
            }   
        }
        document.addEventListener('keydown', onKeyHandler);
    });
}

class binarySearchTree{
    constructor(){
        this.arr = [];
        this.connections = [];
        this.s = 0;
        this.width = 90;
    }

    get size(){
        return this.s;
    }

    set size(s){
        this.s = s;
    }

    inOrder(root){
        let returnArr = [];
        let nodes = this.arr;
        if(nodes[root*2+1]){
            returnArr = this.inOrder(root*2+1);
        }
        returnArr.push(nodes[root].key);

        if(nodes[root*2+2])
            returnArr = [...returnArr, ...this.inOrder(root*2+2)];
        
        return returnArr;
    }

    preOrder(root){
        let returnArr = [];
        let nodes = this.arr;
        
        returnArr.push(nodes[root].key);

        if(nodes[root*2+1]){
            returnArr = [...returnArr, ...this.preOrder(root*2+1)];
        }
        

        if(nodes[root*2+2])
            returnArr = [...returnArr, ...this.preOrder(root*2+2)];
        
        return returnArr;
    }

    postOrder(root){
        let nodes = this.arr;
        let returnArr = [];
        if(nodes[root*2+1])
            returnArr = [...this.postOrder(root*2+1)];
        
        if(nodes[root*2+2])
            returnArr = [...returnArr, ...this.postOrder(root*2+2)];

        returnArr.push(nodes[root].key);        

        return returnArr;
    }

    addNew(e){
        e.dom.classList.add('no-animation');
        if(binarysearchT.rankOf(e.key) > -1){
            return false;
        }
        else{
            if(binarysearchT.arr.length == 0){
                e.translate(`${(e.diameter/2+binarysearchT.width)/2}vw`, `1vh`);
                binarysearchT.arr.push(e);
                e.dom.title = "Rank: 0";
            }
            else{
                //let max= (2 ** (2+Math.floor(Math.log2(this.arr.length)))); //where the exponent corresponds to the depth
                let rank = 0;
                let nodes = this.arr;
                while(binarysearchT.arr[rank]){
                    if(e.key < binarysearchT.arr[rank]){
                        rank = rank*2+1;
                    }
                    else{
                        rank = rank*2+2;
                    }
                }
                let parentRank = Math.floor((rank-1)/2);
                let parent = nodes[parentRank];
                let translateInfo = {};
                let depth = Math.floor(Math.log2(rank+1));
                let offset = (98)/2**(depth+1);
                if(parent.key > e.key){
                    translateInfo.x = parent.xTransform - offset + "vw";
                }
                else{
                    translateInfo.x = parent.xTransform + offset + "vw";
                }
                translateInfo.y = parent.yTransform + Math.sin(Math.PI/4)*10+"vh";
                e.translate(translateInfo.x, translateInfo.y);
                e.borderCol("rgb(37, 201, 37)");
                e.dom.title = `Rank: ${rank}`;
                binarysearchT.arr[rank] = e; 
                //console.log(`${e} and ${parent}`)
                //console.log(`${rank} and ${parentRank}`)
                binarysearchT.connectTransform(rank, parentRank);
                e.removeClass("transform");
                
            }
            e.opac(1);
            return true;
        }
    }

    async addNewTransform(e){
        e.dom.classList.add("transform");
        e.dom.offsetHeight; //important for reflow
        return new Promise(async function(resolve, reject){
            if(binarysearchT.rankOf(e.key) > -1){
                reject(`'${e.key}' is already in the tree. No duplicates allowed`);
            }
            else{
                console.log(`addNew Promise Opened`);
                if(binarysearchT.arr.length == 0){
                    const xCenter = 50 - e.diameter/2;
                    await e.translate(`${xCenter}vw`, `1vh`, true);
                    //await e.translate(`${(e.diameter/2 + binarysearchT.width)/2}vw`, `1vh`, true);
                    await e.opac(1, true);
                    binarysearchT.arr.push(e);
                    e.dom.title = "Rank: 0";
                    e.removeClass("transform");
                }
                else{
                    //let max= (2 ** (2+Math.floor(Math.log2(this.arr.length)))); //where the exponent corresponds to the depth
                    let rank = 0;
                    await e.translate((50 + (binarysearchT.arr[0].diameter)) + "vw", `1vh`, true);
                    await e.opac(1, true);    
                    await e.borderCol("orange", true);        
                    await binarysearchT.compareTransform(e, rank);
                }
                console.log(`addNew Promise Resolved`);
                console.clear();
                resolve(++binarysearchT.size);
            }
        });
    }

    async compareTransform(e, rank){
        return new Promise(async function(resolve){
            console.log(`compare Promise Opened`);
            let pointer = binarysearchT.arr[rank];
            pointer.borderColor = "orange";
            let aft = false;
            if(e.xTransform < pointer.xTransform){
                
                e.comparator.addClass("aft");
                aft = true;
            }
            else{
                e.comparator.addClass("bef");
            }

            if(pointer.key < e.key){
                if(aft){
                    e.comparat.inner = ">";
                }
                else
                    e.comparat.inner = "<";
                rank = (rank*2)+2; //right child
            }
            else{
                if(aft){
                    e.comparat.inner = "<";
                }
                else
                    e.comparat.inner = ">";
                rank = (rank*2)+1; //left child
            }
            await e.comparat.opac(1, true).then(
                    async function(){
                        await e.comparat.opac(0, true).then(() => { 
                            e.comparat.inner = ""; 
                            e.comparator.removeClass(["bef", "aft"]);
                    });
                }
                
            );
            
            await pointer.borderCol("rgb(37, 201, 37)", true);
            if(binarysearchT.arr[rank] == undefined){
                binarysearchT.arr[rank] = e;
                await binarysearchT.assign(e, rank);
            }
            else{
                //console.log(`Going to prepareNextCompare(${rank})`);
                await binarysearchT.prepareNextCompare(e, rank);
            }
            console.log(`compare Promise Resolved`);
            resolve();
        }); 
    };

    async prepareNextCompare(e, rank){
        return new Promise(async function(resolve) {
            console.log(`prepareNextCompare Promise opened`);
            let parent= binarysearchT.arr[rank];
            //let parentX = parseInt(parent.xTransform);
            let coordinates = {}
            if(parent.xTransform>50)
                coordinates.x = parent.xTransform - 2* e.diameter + "vw";
            else{
                coordinates.x = parent.xTransform + 2* e.diameter  + "vw";
            }
            coordinates.y = parent.yTransform + "vh";
            await e.translate(coordinates.x, coordinates.y, true);
            //await pause(); //for debugging purposes 
            await binarysearchT.compareTransform(e, rank);
            console.log(`prepareNextCompare Promise Resolved`);
            resolve();
            
        });
    }

    async assign(e, rank){
        return new Promise(async function(resolve){
            console.log(`assign Promise Opened`);
            let nodes = binarysearchT.arr;
            //console.log(`Inside Move function. Trying to move ${e.key} to rank ${rank}`)
            let depth = Math.floor(Math.log2(rank+1));
            let parentRank = Math.floor((rank-1)/2);
            let parent = nodes[parentRank];
            let translateInfo = {};
            let offset = (98)/2**(depth+1);
            if(parent.key > e.key){
                translateInfo.x = parent.xTransform - offset + "vw";
            }
            else{
                translateInfo.x = parent.xTransform + offset + "vw";
            }
            translateInfo.y = parent.yTransform + Math.sin(Math.PI/4)*10+"vh";
            await e.translate(translateInfo.x, translateInfo.y, true);
            await e.borderCol("rgb(37, 201, 37)", true);
            e.dom.title = `Rank: ${rank}`;
            await binarysearchT.connectTransform(rank, parentRank);
            
            e.removeClass("transform");
            console.log(`assign Promise Resolved`);
            resolve();
        });        
    }
    
    async connectTransform(rank, parentRank){
        console.log(`connectTransform Promise Opened`);
        return new Promise(function(resolve){
            let e = binarysearchT.arr[rank];
            let parent = binarysearchT.arr[parentRank];
            binarysearchT.connections.push(new Connection(e, parent));
            console.log(`connectTransform Promise Resolved`);
            resolve();
        });
    }






    // async remove(key){
    //     let rank = this.rankOf(key);
    //     let nodes = this.arr;
    //     if(rank == -1){
    //         console.log("The key is not in the binary search tree.")
    //     }
    //     else{
    //         let removing = nodes[rank];
    //         removing.dom.classList.add("transition");
    //         await new Promise(function(resolve){
    //             removing.dom.ontransitionend = function(e){
    //                 this.ontransitionend = null;
    //                 resolve(e);
    //             }
    //             removing.borderColor = 'red';
    //         });
    //         removing.dom.remove();

    //         if(!(nodes[rank*2+1] && nodes[rank*2+2])){ //the case where the desired element to be deleted has one 'dead child'
                
    //             /*let preOrderShiftDown = async function(root, relativeDepth){ //insert 15,10,11,9,7,8,6,5,4,3,2,1 it does not move 8 when removing 9
    //                 console.log(`Function called on key ${nodes[root].key}`); //insert 20,10,8,9,5,6,7,3,4,2
    //                 let parentRank = (relativeDepth>0?Math.floor(root/2):Math.floor((root-1)/2));//insert 50,37,88,17,47,85,89,13,26,46,48,72,18,45,54,74,61,82,57,62,71
    //                 //await awaitInput();
    //                 nodes[root].dom.classList.add("transition");
    //                 nodes[root].dom.ontransitionend = function(){
    //                     this.ontransitionend = null;
    //                     this.classList.remove("transition");
    //                 }
    //                 let line = document.getElementById(`${Math.floor((root-1)/2)}-${root}`);
    //                 line.classList.add("transition");
    //                 line.ontransitionend = function(){
    //                     line.ontransitionend = null;
    //                     line.remove();
    //                 }
    //                 line.style.width = 0;
    //                 line.style.height = 0;
    //                 console.log(`Moving key ${nodes[root].key} from rank ${root} to ${parentRank}`);
    //                 await awaitInput();
    //                 binarysearchT.move(nodes[root], parentRank);
    //                 //console.log(`Parent's key :${nodes[parentRank].key} at rank ${parentRank}. Child's key ${nodes[root].key} at rank ${root}`);
    //                 nodes[parentRank] = nodes[root];
    //                 await(sleep(500));
    //                 await awaitInput();

    //                 delete(nodes[root]);
    //                 //await awaitInput();
    //                 if(nodes[(root*2+1)]){
    //                     preOrderShiftDown(root*2+1,relativeDepth+1);
    //                 }
                        
    //                 //await awaitInput();
    //                 if(nodes[root*2+2]){
    //                     preOrderShiftDown(root*2+2, relativeDepth+1);
    //                 }
    //                 return;
    //             }
    //             preOrderShiftDown(nodes[rank*2+1]?rank*2+1:rank*2+2, 0)*/

    //             let simplePreOrderShiftDown = function(root){ //DONT TOUCH THIS, THIS IS FOR REFERENCE AND DEBUGGING OK?
    //                 console.log(`Function called on key ${nodes[root].key}`);
    //                 let parentRank = Math.floor(root/2);
    //                 nodes[parentRank] = nodes[root];
    //                 console.log(`Moving key ${nodes[root].key} from rank ${root} to ${parentRank}`);
    //                 delete(nodes[root]);

    //                 if(nodes[(root*2+1)]){
    //                     simplePreOrderShiftDown(root*2+1);
    //                 }
                        

    //                 if(nodes[root*2+2]){
    //                     simplePreOrderShiftDown(root*2+2);
    //                 }
    //                 return;
    //             }
    //             let subtreeSize = this.inOrder(nodes[rank*2+1]?rank*2+1:rank*2+2).length;
    //             console.log(`Size of the subtree is ${subtreeSize}`);
    //             let i = nodes[rank*2+1]?rank*2+1:rank*2+2;
    //             simplePreOrderShiftDown(nodes[rank*2+1]?rank*2+1:rank*2+2);


    //         }
    //         else{
    //             let firstAfterKey = function(root){ //in order trasversal to find the first element just after the key we are deleting
    //                 let returnVal = null;
    //                 if(nodes[root*2+1]){ 
    //                     returnVal = firstAfterKey(root*2+1);
    //                 }

    //                 if(!nodes[root*2+1]){
    //                     return nodes[root];
    //                 }

    //                 if(nodes[root*2+2] && !nodes[root*2+1] && !returnVal)
    //                     returnVal = firstAfterKey(root*2+2);                
    //                 return returnVal;

    //             }
    //             let replacingKey = firstAfterKey(rank*2+2); //start checking right away from the right child
    //             console.log(`The key that needs to replace '${nodes[rank].key}' is '${firstAfterKey(rank*2+2).key}'`);
    //         }
    //     }
        
    //     for(let i = 0; i<this.arr.length; i++){
    //         if(nodes[i] != null)
    //             console.log("At index ", i, " there is key ", nodes[i].key);
    //     }
    //     this.size--;
    // }

    // show(){
    //     this.arr.forEach((val, index) => {
    //         console.log(`At index ${index}: ` + val.key);
    //     });
    // }

    reset(){
        if(this.connections.length > 0)
            this.connections.forEach((connection) => {
                connection.parent.dom.remove();
                connection.child.dom.remove();
                connection.dom.remove();
                //delete (connection);
            });
        else{
            if(this.size == 1){
                this.arr[0].dom.remove();
            }
        }
        this.connections = [];
        this.arr = [];
        this.size = 0;
    }

    rankOf(key){
        let rank = 0;
        let max= (2 ** (2+Math.floor(Math.log2(this.arr.length)))); //where the exponent corresponds to the depth
        while(rank<max){
            try{
                if(key == this.arr[rank].key){
                    return rank;
                }
                else{
                    if(key < this.arr[rank].key){
                        rank = rank*2 +1;
                    }
                    else{
                        rank = rank*2 +2;
                    }
                }
            }
            catch(e){
                return -1;
            };
        }
    }

    async trasversal(root, mode){
        let nodes = binarysearchT.arr;
        let trasverse = [];
        let arrow = document.createElement("span");
        arrow.classList.add("trasverser");
        arrow.innerHTML = "↑";
        document.body.append(arrow);
        arrow.offsetHeight; //reflow stuff
        //let output = document.getElementById("output");
        let original = root;
        
        let setupTrasversal = function(root){ //sets all the children to red (unvisited)
            if(nodes[root*2+1])
                setupTrasversal(root*2+1);
            nodes[root].borderColor = 'red';

            if(nodes[root*2+2])
                setupTrasversal(root*2+2);
            return;
        }
        setupTrasversal(root);
        

        let waitTransition = async function(dom, fn){ //first class function
            return new Promise((resolve) => {
                dom.ontransitionend = function(e){
                    dom.ontransitionend = null;
                    resolve(e);
                }
                fn(); //the style/transition that needs to be run
            });
        };

        await waitTransition(arrow, () => {
            arrow.style.opacity = 1;
        });
        
        return new Promise(async function(resolve, reject){
            switch(mode){
                case "in-order":
                    //output.innerHTML = "In-order trasversal: []";
                    let inOrder = async function(root){
                        let diameter = nodes[root].diameter;
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${nodes[root].xTransform + diameter/2 - 1.5}vw, ${nodes[root].yTransform + diameter}vh)`;
                        });

                        await nodes[root].borderCol("orange", true); //visited but not added into the return value

                        let returnArr = [];
                        
                        if(nodes[root*2+1]){
                            await inOrder(root*2+1).then(function(result){
                                returnArr = result;
                            });
                        }
                        await nodes[root].borderCol("rgb(37, 201, 37)", true);

                        returnArr.push(nodes[root].key);

                        if(nodes[root*2+2]){
                            await inOrder(root*2+2).then(function(result){
                                returnArr = [...returnArr, ...result];
                            });
                        }

                        if(root > original){ //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit
                            
                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes[Math.floor((root-1)/2)].xTransform + diameter/2 - 1.5}vw, ${nodes[Math.floor((root-1)/2)].yTransform + diameter}vh)`;
                            });
                        }
                        
                        return returnArr;
                    }

                    inOrder(root).then(function(result){ //call the function and handle the result
                        trasverse = result;
                        
                        arrow.ontransitionend = async function(){
                            this.ontransitionend = null;
                            this.remove();
                        };
                        arrow.style.opacity = 0;
                        resolve(result);
                    });

                    
                break;

                case "pre-order":
                    let preOrder = async function(root){
                        let diameter = nodes[root].diameter;
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${nodes[root].xTransform + diameter/2 - 1.5}vw, ${nodes[root].yTransform + diameter}vh)`;
                        });
                        await nodes[root].borderCol("orange", true); //visited but not added into the return value
                        await nodes[root].borderCol("rgb(37, 201, 37)", true);
                        let returnArr = [nodes[root].key];
                        if(nodes[root*2+1]){
                            await preOrder(root*2+1).then(function(result){
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if(nodes[root*2+2]){
                            await preOrder(root*2+2).then(function(result){
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if(root > original){ //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit
                            
                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes[Math.floor((root-1)/2)].xTransform + diameter/2 - 1.5}vw, ${nodes[Math.floor((root-1)/2)].yTransform + diameter}vh)`;
                            });
                        }
                        
                        return returnArr;
                    }
                    preOrder(root).then(function(result){ //call the function and handle the result
                        trasverse = result;
                        
                        arrow.ontransitionend = async function(){
                            this.ontransitionend = null;
                            this.remove();
                        };
                        arrow.style.opacity = 0;
                        resolve(result);
                    });
                break;

                case "post-order":
                    let postOrder = async function(root){
                        let diameter = nodes[root].diameter;
                        let returnArr = [];
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${nodes[root].xTransform + diameter/2 - 1.5}vw, ${nodes[root].yTransform + diameter}vh)`;
                        });
                        await nodes[root].borderCol("orange", true); //visited but not added into the return value
                        if(nodes[root*2+1]){
                            await postOrder(root*2+1).then(function(result){
                                returnArr = [...result];
                            });
                        }
                        if(nodes[root*2+2]){
                            await postOrder(root*2+2).then(function(result){
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        await nodes[root].borderCol("rgb(37, 201, 37)", true);
                        returnArr.push(nodes[root].key);

                        if(root > original){ //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit
                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes[Math.floor((root-1)/2)].xTransform + diameter/2 - 1.5}vw, ${nodes[Math.floor((root-1)/2)].yTransform + diameter}vh)`;
                            });
                        }

                        return returnArr;
                    }

                    postOrder(root).then(function(result){ //call the function and handle the result
                        trasverse = result;
                        
                        arrow.ontransitionend = async function(){
                            this.ontransitionend = null;
                            this.remove();
                        };
                        arrow.style.opacity = 0;
                        resolve(result);
                    });
                break;
            }
        });
        
    }

    onResize(){
        binarysearchT.connections.forEach((line) => {
            line.draw();
        });
    }

}

class Connection{
    

    constructor(child, parent){
        this.dom = document.createElement("div");
        this.dom.classList.add("line");
        console.log(`${child} and ${parent}`)
        this.dom.id = `${parent.dom.title.slice(6)}-${child.dom.title.slice(6)}`;
        this.child = child;
        this.parent = parent;
        this.draw(true);
        this.dom.ontransitionend = () => { //so when the window is resized it does not get weird animations
            this.dom.style.transition = "transform 0s";
            this.dom.ontransitionend = null;
            //console.log(`removing animation triggered`);
        };
    }

    draw(appendToBody){
        this.transform = ``;
        let parent = this.parent;
        let child = this.child;
        let parentXpx = (parent.xTransform) * (window.innerWidth / 100);
        let parentYpx = (parent.yTransform) * (window.innerHeight / 100);
        let childXpx = (child.xTransform) * (window.innerWidth / 100);
        let childYpx = (child.yTransform) * (window.innerHeight / 100);
        let dx = childXpx - parentXpx;
        let dy = childYpx - parentYpx;
        let angle = Math.atan2(dy, dx);
        let lengthInPx = Math.sqrt(dx ** 2 + dy ** 2);
        this.l = lengthInPx + "px";
        let offsetXpx = (parent.diameter * (window.innerWidth / 100))/2;
        let offsetYpx = (parent.diameter * (window.innerHeight / 100))/2;
        let x = 100*(parentXpx + offsetXpx)/window.innerWidth;
        let y = 100*(parentYpx + offsetYpx)/window.innerHeight;
        const baseLengthPx = 100; // Matches your CSS .line width
        const scale = lengthInPx / baseLengthPx;
        if(appendToBody){
            this.transform = `translate(${x}vw, ${y}vh) rotate(${angle}rad) scaleX(${0})`;
            document.body.append(this.dom);
        }
        this.dom.offsetHeight; //force reflow
        requestAnimationFrame(() => {
            this.transform = `translate(${x}vw, ${y}vh) rotate(${angle}rad) scaleX(${scale})`;
        });
    }

    set transform(value){
        this.dom.style.transform = value;
    }

    get transform(){
        return this.dom.style.transform;
    }

    set length(length){
        this.l = length;
    }

    get length(){
        return this.l;
    }

}

class Comparator{
    constructor(){
        this.dom = document.createElement("span");
        this.dom.classList.add("comparatorTransform");
    }

    addClass(Class){
        this.dom.classList.add(Class);
    }

    removeClass(...Class) {
        this.dom.classList.remove(...Class.flat());
    }

    get classes(){
        return this.dom.className;
    }

    set inner(value){
        this.dom.innerHTML = value;
    }

    async opac(value, synchronous){
        let comparator = this.dom;
        return new Promise(function(resolve){
            if(synchronous){
                comparator.ontransitionend = function(e){
                    this.ontransitionend = null;
                    resolve(e);
                }
            }
            else{
                resolve();
            }
            comparator.style.opacity = value;
        });

    }
}

class Element{

    constructor(key){
        this.key = key;
        this.dom = document.createElement("div");
        this.dom.classList.add("element");
        this.dom.innerHTML = key;
        this.dom.style.backgroundColor = "#FFFFFF";
        this.dom.style.zIndex = 1;
        this.opacity = 0;
        this.comparator = new Comparator();
        this.dom.append(this.comparator.dom);
        document.body.append(this.dom);
    }


    get xTransform(){
        let transform = this.transform;
        return parseFloat(transform.match(/\d+(\.\d+)?/g)[0]);
    }

    get yTransform(){
        let transform = this.transform;
        return parseFloat(transform.match(/\d+(\.\d+)?/g)[1]);
    }

    get diameter(){ //the diameter is based on the width of the screen
        const vw = parseFloat(window.innerWidth / 100);
        const computed = parseFloat(window.getComputedStyle(this.dom).width);
        return (computed/vw);
    }

    get comparat(){
        return this.comparator;
    }

    opac = function(value, synchronous){ //for some weird reason js does not like a function whose name is opacity... maybe dom.style.opacity conflict?
        let e = this;
        return new Promise(function(resolve){
            e.opacity = value;
            if(synchronous){
                e.dom.ontransitionend = function(e){
                    this.ontransitionend = null;
                    resolve(e);
                }
            }
            else
                resolve();
        });
    }

    translate = function(x, y, synchronous){
        let e  = this;
        e.dom.offsetHeight; //important for reflow
        return new Promise(function(resolve){
            e.transform = `translate(${x}, ${y})`;
            if(synchronous){
                e.dom.ontransitionend = function(e){
                    this.ontransitionend = null;
                    resolve(e);
                }
            }
            else
                resolve();
        });
    }

    borderCol = function(value, synchronous){
        let e  = this;
        e.dom.offsetHeight; //important for reflow
        return new Promise(function(resolve){
            e.borderColor = `${value}`;
            if(synchronous){
                e.dom.ontransitionend = function(e){
                    this.ontransitionend = null;
                    resolve(e);
                }
            }
            else
                resolve();
        });
    }

    addClass = function(...classes){
        this.dom.classList.add(classes);
    }

    removeClass = function(...classes){
        this.dom.classList.remove(classes);
    }

    set opacity(o){                             //and yes I tried to rename this with something else, still same problem :/
        this.dom.style.opacity = parseInt(o);
    }

    set borderColor(b){
        this.dom.style.borderColor = `${b}`;
    }

    set transform(transform){
        this.dom.style.transform = transform;
    }

    get transform(){
        return this.dom.style.transform;
    }
}

var binarysearchT = new binarySearchTree();

let resizeTimeout;

window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        binarysearchT.onResize();
    }, 200); // only trigger after 200ms of no further resize events
});

let type = async function(e){
    if(focused){
        switch(e.key){
            case "Backspace":
                command.innerHTML = command.innerHTML.substring(0, command.innerHTML.length-1);
            break;

            default:
                if(!(e.key == "ArrowLeft" || e.key == "ArrowRight" || e.key == "Alt" || e.key == "Shift" || e.key == "CapsLock" || e.key == "Control" || e.key == "Meta"))
                    command.innerHTML = command.innerHTML + e.key;
                else{
                    e.preventDefault();
                }
            break;

            case "ArrowUp":
                //console.log(point);
                e.preventDefault(); //to avoid scrolling with the arrows in the console
                if(previousCommands.length>0){
                    if(point > 0)
                        point--;
                    command.innerHTML = previousCommands[point];
                }
            break;
            


            case "ArrowDown":
                //console.log(point);
                e.preventDefault(); //to avoid scrolling with the arrows in the console
                if(previousCommands.length>point){
                    point++;
                    command.innerHTML = point<previousCommands.length?previousCommands[point]:"";
                }
                
            break;
            

            case "Enter":
                let consoleOutput = document.getElementById("console-content");
                cursor.remove();
                previousCommands.push(command.innerHTML);
                point = previousCommands.length;
                command.id="";
                command.innerHTML += "<br><br>" + await exec(command.innerHTML.replaceAll(" ", ",").split(",")).then((returnVal) => {return returnVal});
                let newLine = document.createElement("p");
                newLine.innerHTML = "<b>guest@gchelossi: </b><span id=\'text\'></span>";
                consoleOutput.append(newLine);
                command = document.getElementById("text");  
                consoleOutput.lastChild.append(cursor);
                consoleOutput.scrollTo(0, consoleOutput.scrollHeight);
            break;
        }
    }
}

let exec = async function(...parameters){
    return new Promise(async function(resolve, reject){
        let returnval = "Command succesfully executed";
        let params = parameters[0];
        //console.log(parameters);
        switch(params[0]){
            case 'insert':
                if(params[1] == "full"){
                    let arr = [25,10,40,5,15,30,50,3,7,13,20,27,35,45,55,1,4,6,8,11,14,17,24,26,29,33,37,43,47,53,60];
                    let insertFull = function(){
                        return new Promise(async function(res){
                            returnval = `Succesfully inserted ${arr} into the binary search tree`;
                            for(let i=0; i<arr.length; i++){
                                await binarysearchT.addNewTransform(new Element(arr[i]));
                            }
                            res();
                        });
                    };
                    await insertFull();
                }
                else{
                    if(params.length>2){
                        let vals = params.map(function(e){ 
                            return parseInt(e);
                        }).filter(v => {
                            if(!isNaN(v)){
                                return v;
                            }
                        });
                        await (async function(){
                            returnval = `Succesfully inserted ${vals} into the binary search tree`;
                            for(let i=0; i<vals.length; i++){
                                try{
                                    await binarysearchT.addNewTransform(new Element(vals[i]));  
                                }
                                catch(e){
                                    let index = vals.indexOf(parseInt(e.substring(1)));
                                    vals.splice(index,1);
                                    //console.log(vals);
                                    alert(e);
                                    i--;
                                    if(vals.length>0)
                                        returnval = `Succesfully inserted ${vals} into the binary search tree`;
                                    else
                                        returnval = `None of the values have been inserted`;
                                }                  
                            }
                        })();
                    }
                    else{
                        await (async function(){
                            try{
                                await binarysearchT.addNewTransform(new Element(parseInt(params[1])));
                                returnval = `Succesfully inserted ${params[1]} into the binary search tree`;
                            }
                            catch(e){
                                returnval = e;
                            }
                        })();
                    }
                }
                
                
            break;

            case 'equivalent':
                if(binarysearchT.size > 0)
                    returnval = "insert " + binarysearchT.arr.map(v => {
                        if(v != undefined){
                            return v.key;
                        }
                            
                    }).filter(v => {if(v) return v}).toString();
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
                document.getElementById("console-content").innerHTML = "";
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
                if(rank == -1){
                    returnval = `The value '${params[1]}' is not in the tree`;
                }
                else{
                    returnval = `The value '${params[1]}' is at rank ${rank}`;
                }
            break;

            case "set":
                switch(params[1]){
                    case "speed":
                        let speed = parseInt(params[2]);
                        if(isNaN(speed) || (speed < 1 || speed > 10)){
                            returnval = "The animation speed must be an integer between 1 and 10";
                        }
                        else{
                            const style = document.createElement('style');
                            let oldStyle = document.head.getElementsByTagName('style')[0];
                            if (oldStyle) {
                                oldStyle.remove();
}
                            let seconds = 1/speed;
                            let diameter = new Element(0).diameter;
                            style.innerHTML = `
                                .element{
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
                                    transition: border ${seconds}s, opacity ${seconds}s;
                                }

                                .element.transform{
                                    transition: border ${seconds}s, opacity ${seconds}s, transform ${seconds}s ease-in-out;
                                }


                                .trasverser{
                                    position: absolute;
                                    font-size: 3vw;
                                    top:0;
                                    left: 0;
                                    opacity: 0;
                                    transition: opacity ${seconds/2}s, transform ${seconds}s;
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
                                    transition: transform ${seconds}s ease-out;
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
                switch(params[1]){
                    case "array":
                        if(binarysearchT.arr.length){
                            if(params[2] == 'true'){
                                let s = "[";
                                for(i =0; i<binarysearchT.arr.length; i++){
                                    let val = binarysearchT.arr[i] == undefined?'<span style="color: grey">[empty]</span>': binarysearchT.arr[i].key;
                                    s += `<span style='color: orange'>${i}</span>: ${val}${(i < binarysearchT.arr.length-1)?", ":"]"}`;
                                };
                                s+="<br>Where the <span style='color: orange'>rank</span> is orange";
                                returnval = s;                  
                            }
                            else{
                                let s = "[";
                                binarysearchT.arr.forEach((val, index, arr) => {
                                    s += `<span style='color: orange'>${index}</span>: ${val.key}${(index < arr.length-1)?", ":"]"}`;
                                });
                                s+="<br>Where the <span style='color: orange'>rank</span> is orange";
                                returnval = s;
                            }
                        }
                        else{
                            returnval="The array is empty.";
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
                (async function(){
                    await binarysearchT.addNewTransform(new Element(50)); //since it is going to be randomized between 0 and 99, I want the root to be exactly the median
                    for(let i =0; i<20; i++){
                            let random = Math.floor(Math.random()*100);
                            if(binarysearchT.rankOf(random) == -1)
                                await binarysearchT.addNewTransform(new Element(random));
                        }
                })();
                
            break;

            case "trasverse":
                let trasverseType = params[1].toLowerCase();
                if(binarysearchT.size > 0){
                    switch(trasverseType){
                        case "in-order":
                        case "inorder":
                            if(params[2]){ //if the trasversal starts from a certain key
                                returnval = await binarysearchT.trasversal(parseInt(params[2]), "in-order");
                            }
                            else{
                                returnval = await binarysearchT.trasversal(0, "in-order");
                            }
                            returnval = "In-order Trasversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                        break;
                        case "pre-order":
                        case "preorder":
                            if(params[2]){ //if the trasversal starts from a certain key
                                returnval = await binarysearchT.trasversal(parseInt(params[2]), "pre-order");
                            }
                            else{
                                returnval = await binarysearchT.trasversal(0, "pre-order");
                            }
                            returnval = "Pre-order Trasversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                        break;
                        
                        case "post-order":
                        case "postorder":
                            if(params[2]){ //if the trasversal starts from a certain key
                                returnval = await binarysearchT.trasversal(parseInt(params[2]), "post-order");
                            }
                            else{
                                returnval = await binarysearchT.trasversal(0, "post-order");
                            }
                            returnval = "Post-order Trasversal: [" + returnval.toString().replaceAll(",", ", ") + "]";
                        break;

                        default:
                            returnval = `The parameter given '${params[1]}' is not a valid trasversal mode.`;
                        break;

                    }
                }
                else{
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

let focus = function(){
    focused = true;
    cursorAnimation();
}

let leave = function(){
    focused = false;
}

let paste = async function(e){
    e.preventDefault();
    let clip = await navigator.clipboard.readText();
    cursor.remove();
    let text = document.getElementById("text");
    text.innerHTML += clip;
    text.parentElement.append(cursor);
    debconsole.scrollTo(0, debconsole.scrollHeight);
    focused = true;
}


setInterval(function () {
    cursorAnimation();
}, 1000);

cursorAnimation = function(){

    if(focused){
        if(displayed){
            cursor.style.color= "black";
        }
        else{
            cursor.style.color= "white";
        }
        displayed = !displayed;
    }
    else{
        if(displayed){
            cursor.style.color= "black";
            displayed = false;
        }
    }
    
}
let consoleHeight = debconsole.offsetHeight;

let minimize = function(){
    let output = document.getElementById("console-content");
    let bar  = document.getElementById("console-bar");
    
    output.style.display = "none";
    bar.style.bottom = "0";
}

let maximize = function(){
    let output = document.getElementById("console-content");
    let bar  = document.getElementById("console-bar");

    output.style.display = "block";
    bar.style.bottom = consoleHeight;

}

function resizeConsole() {
    let output = document.getElementById("console-content");
    document.body.style.cursor = "ns-resize";
    if(output.style.display == "none"){ //resize even when minimized
        output.style.display = "block";
        output.style.height = 0;
    }
    
    document.onmousemove = function(e){
        if(e.clientY > 30){
            consoleHeight = window.innerHeight - e.clientY;
            output.style.height = consoleHeight - 29 + "px";
        }
        
    }

    document.onmouseup = function(){
        document.body.style.cursor = "default";
        document.onmousemove = null; //so it does not call these functions unless the user clicks again on the resizer
        document.onmouseup = null;
    }
};


//All event listeners
//The document catches the event and sets to false, unless the terminal overrides it with its listeners (capture vs target)
document.addEventListener("click", leave, true);
document.addEventListener("focus", leave, true);
debconsole.addEventListener("click", focus);
debconsole.addEventListener("focus", focus);
debconsole.addEventListener("contextmenu", paste);
document.addEventListener("keydown", type);
document.getElementsByClassName("console-dot yellow")[0].addEventListener("click", minimize);
document.getElementsByClassName("console-dot green")[0].addEventListener("click", maximize);
document.getElementById("resizer").addEventListener("mousedown", resizeConsole);