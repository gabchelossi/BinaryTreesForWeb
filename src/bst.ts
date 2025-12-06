//@ts-check

import { create } from "domain";
import { truncate } from "fs/promises";

//reverted instance

export class BinarySearchTree {
    
    arr: (InstanceType<typeof BinarySearchTree.TreeElement>)[] | undefined;
    connections: InstanceType<typeof BinarySearchTree.Connection>[];
    s: number;
    width: number;
    avl: boolean;
    paused: boolean;

    constructor() {
        this.arr = [];
        this.connections = [];
        this.s = 0;
        this.width = 85;
        this.avl = false;
        this.paused = false;
    }

    set avlStatus(state:boolean){
        this.avl = state;
        const activeElements = this.arr!.filter((e) => {return Boolean(e)});
        if(state){
            activeElements.forEach((e) => {e.dom.classList.add("active")});
        }
        else{
            activeElements.forEach((e) => {e.dom.classList.remove("active")});
        }
    }

    get avlStatus(){
        return this.avl;
    }

    get size() {
        return this.s;
    }

    set size(s) {
        this.s = s;
        if(this.s == 1){
            this.connections.forEach((c) => {if(c){ c.dom.remove();}});
            this.connections = [];
        }
    }

    trim(): boolean{
        let size = this.size;
        /*if(!this.arr![this.arr!.length-1]){
            console.log(`Truncating the arr`);
        }*/
        let lastIndex, count: number;
        count = 0;
        for(let i = 0; i<this.arr!.length; i++){
            if(this.arr![i]){
                count++;
            }
            if(count == size){
                lastIndex = i;
                i = this.arr!.length; //fancy way of not using break statement
            }
        }
        if(size>0)
            lastIndex!++; //slice goes up to index n-1
        this.arr! = this.arr!.slice(0,lastIndex!);
        return true;
    }

    inOrder(root: number = 0, removing: boolean=false, returnRanks=false): number[] {
        let returnArr : number[] = [];
        let nodes = this.arr;
        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 +1].key)) {
            returnArr = this.inOrder(root * 2 + 1);
        }
        if(returnRanks) returnArr.push(root);
        else returnArr.push(nodes![root].key);
        if(removing)
            return returnArr;

        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 +2].key))
            returnArr = [...returnArr, ...this.inOrder(root * 2 + 2)];

        return returnArr;
    }

    preOrder(root: number = 0): number[] {
        let returnArr = [];
        let nodes = this.arr;

        returnArr.push(nodes![root].key);

        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 + 1].key)) {
            returnArr = [...returnArr, ...this.preOrder(root * 2 + 1)];
        }


        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 + 2].key))
            returnArr = [...returnArr, ...this.preOrder(root * 2 + 2)];

        return returnArr;
    }

    postOrder(root: number = 0) : number[] {
        let nodes = this.arr;
        let returnArr: number[] = [];
        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 +1].key))
            returnArr = [...this.postOrder(root * 2 + 1)];

        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 + 2].key))
            returnArr = [...returnArr, ...this.postOrder(root * 2 + 2)];

        returnArr.push(nodes![root].key);

        return returnArr;
}

    breakPoint(fn: Promise<any>, goNext:boolean = false){
        return new Promise(async (resolve, reject) =>{
            let returnVal: any;
            try{
                returnVal = await fn;
                if (this.paused) {
                    console.log(`PAUSED!`);
                    const handler = () => {
                        resolve(returnVal);
                        document.removeEventListener("play", handler); // remove the SAME function
                    };
                    document.addEventListener("play", handler);
                }
                else {
                    console.log(`Resolving as usual`);
                    resolve(returnVal);
                }
            }
            catch(e){
                reject(e);
            }
            
        });
    }

    async updateAVL(childRank: number): Promise<void> {
    // start from the parent of the changed node
        return new Promise(async (resolve) => {
            let i = Math.floor((childRank - 1) / 2);
            //console.log(`Called updateAVl from rank ${childRank}`);
            while (i >= 0) {
                const node = this.arr![i];
                if (!node) {
                    i = Math.floor((i - 1) / 2);
                    continue;
                }
                const li = i * 2 + 1;
                const ri = i * 2 + 2;
                const left  = this.arr![li];
                const right = this.arr![ri];
                const lh = left ? 1 + Math.max(left.leftWeight  || 0, left.rightWeight  || 0) : 0;
                const rh = right ? 1 + Math.max(right.leftWeight || 0, right.rightWeight || 0) : 0;
                node.leftWeight  = lh;
                node.rightWeight = rh;
                try{
                    await this.breakPoint(node.updateBalance(this.avlStatus)); // e.g., node.balance = rh - lh; may also add rotation triggers
                }
                catch(e){
                    await this.breakPoint(this.balanceAVL(i, childRank));
                    resolve(); //Remove this once the implementation of this.balanceAVL is done
                    return; //remove too
                }
                // climb
                i = Math.floor((i - 1) / 2);
            }
            resolve();
        });

        
    }

    async balanceAVL(zRank: number, wRank:number){
        return new Promise(async (resolve) =>{
            console.log(`Rank where the imbalance happened: ${zRank}. The Child that got inserted is at rank ${wRank}`);
            const depthW = Math.floor(Math.log2(wRank + 1));
            const depthZ = Math.floor(Math.log2(zRank+1));
            let xRank: number;
            let yRank: number;
            let x: InstanceType<typeof BinarySearchTree.TreeElement>;
            let y: InstanceType<typeof BinarySearchTree.TreeElement>;
            let z: InstanceType<typeof BinarySearchTree.TreeElement>;
            let w: InstanceType<typeof BinarySearchTree.TreeElement>;

            const nodes = this.arr!;
            z = nodes[zRank]; //it will always be the 'z' node
            console.log(depthZ, depthW);
            if(depthW-depthZ==2){
                x = nodes[wRank];
                yRank = Math.floor((wRank-1)/2);
                y = nodes[yRank];
            }
            else{
                xRank = Math.floor((wRank-1)/2);
                yRank = Math.floor((xRank-1)/2);
                x = nodes[xRank];
                y = nodes[yRank];
                w = nodes[wRank];
                w.label = "w";
            }
            x.label = "x";
            y.label = "y";
            z.label = "z";
            x.borderCol("red", false);
            y.borderCol("red", false);
            z.borderCol("red", false);
            const z_y_line = this.connections.filter((line) => {
                return line.parent == z && line.child == y;
            })[0];
            const y_x_line = this.connections.filter((line) => {
                return line.parent == y && line.child == x;
            })[0];
            
            const ranks = await this.breakPoint(this.traversal(zRank, "AVL")) as number[]; //the traversal returns x y and z in in-order traversal
            const elements = ranks.map(rank => {return nodes![rank]});
            
            const lines = this.connections.filter((line) => { if (line) { 
                return ((elements.includes(line.parent) || elements.includes(line.child)) && line != z_y_line && line != y_x_line);//TO-DO  //need to keep the lines between a,b,c for the rotation animation 
            } });
            lines.forEach((line)=>{
                line.dom.classList.add("transform");
                line.changeLength('0', false);
            });
            const rankA = ranks[0];
            const rankB = ranks[1];
            const rankC = ranks[2];
            let a = nodes[rankA];
            let b = nodes[rankB];
            let c = nodes[rankC];
            a.addClass("transform");
            b.addClass("transform");
            c.addClass("transform");
            let t0: number[] = this.inOrder(rankA*2+1, false, true); // because of in-order traversal, b and c will never be the a's left child
            let t1: number[] = !(nodes[rankA*2+2] == b || nodes[rankA*2+2] == c) ? this.inOrder(rankA*2+2, false, true): this.inOrder(rankB*2+1, false, true); //if a does not have t1 as a child, then b will always have it as its left child
            let t2: number[] = nodes[rankB*2+2] != c ? this.inOrder(rankB*2+2, false, true):  this.inOrder(rankC*2+1, false, true); // if b's right child is not c (no need to check if it is not a, due to the in-order traversal), then t2 is b's right child, else it will always be c's left child
            let t3: number[] = this.inOrder(rankC*2+2, false, true); // because of in-order traversal, t3 will always be c's right child
            console.log(`T0: ${t0}, T1: ${t1}, T2: ${t2}, T3: ${t3}`);
            
            /*const createSubTreeSVG = function(label:string):HTMLDivElement{
                const t0SVG = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                const t0Poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon')
                const t0Label = document.createElement(`div`);
                t0Label.classList.add("subtreelabel");
                t0SVG.appendChild(t0Poly);
                t0Label.appendChild(t0SVG);
                t0SVG.classList.add("triangle-svg");
                t0Poly.id = "T0";

                t0SVG.setAttribute("viewBox", "0 0 100 100");
                t0Poly.setAttribute("points", "50 0, 0 100, 100 100");
                t0Label.setAttribute("label", label);
                return t0Label;
            }

            const t0Container = createSubTreeSVG("T₀");
            
            const radius = nodes![t0[0]].diameter/2;
            const xCoord = nodes![t0[0]].xTransform;
            const yCoord = nodes![t0[0]].yTransform;
            t0Container.style.transform = `translate(${xCoord-2.75}vw, ${yCoord-6}vh)`;

            /*const t0RootInfo = nodes[t0[0]].dom.getBoundingClientRect();
            const xT0 = t0RootInfo.x;
            const yT0 = t0RootInfo.y;
            console.log(xT0, yT0)
            t0SVG.style.transform = `translate(${xT0}px, ${yT0}px)`;
            
            

            document.body.appendChild(t0Container);*/
            
            const moveDown = function(arr:number[]) {
                return new Promise (async (resolve) => {
                    arr.forEach(async (rank) => {
                        if(nodes[rank]){
                            nodes[rank].addClass("transform");
                            console.log(`Translating rank ${rank} down using params ${nodes[rank].xTransform}, ${nodes[rank].yTransform +20}, true, false`);
                            await nodes[rank].translate(`${nodes[rank].xTransform}vw`, `${nodes[rank].yTransform +20}vh`, true, false);
                        }
                    });
                    resolve(true);
                });
                
            }
            moveDown(t0);
            moveDown(t1);
            moveDown(t2);
            await this.breakPoint(moveDown(t3));
            if(x == b){ //double rotation happening
                console.log(`Double rotation time!`);
                const radius = parseInt(y_x_line.length); // radius of rotation
                y.addClass("doubleRotation");
                x.addClass("doubleRotation");
                let angle = 0; // degrees
                const offsetX = x.xTransform;
                const offsetY = x.yTransform;
                x.dom.style.setProperty('--radius', radius + 'px');
                x.dom.style.setProperty('--offsetX', offsetX + 'vw');
                x.dom.style.setProperty('--offsetY', offsetY + 'vh');
                function animate() {
                    angle = (angle + 1) % 360;             // speed = 1deg per frame
                    x.dom.style.setProperty('--angle', angle + 'deg');
                    if(angle<90)  requestAnimationFrame(animate);
                }
                requestAnimationFrame(animate);

                if(y == a){ //L-R Rotation
                    
                }
                else{ //R-L Rotation

                }
            }
            else{
                if(x == a){ //L-L Rotation

                }
                else{ //R-R Rotation

                }
            }
            /*await c.translate(`${c.xTransform}vw`, `${c.yTransform+20}vh`, true, false);
            await this.assign(b, zRank, true, true, false);
            const temp = nodes[zRank];
            nodes[zRank] = b;
            this.assign(a, zRank*2+1, true, true, false);
            this.assign(c, zRank*2+2, true, true, false);*/
            resolve(true);
        });
            
        
    }

    async addNew(e:InstanceType<typeof BinarySearchTree.TreeElement>):Promise<number> {
        e.dom.classList.add('no-animation');
        //console.log(`Adding new element ${e.key} with no amination`);
        if (this.rankOf(e.key) > -1) {
            document.removeChild(e.dom);
            return this.size;
        }
        else {
            if (this.arr!.length == 0) {
                const xCenter = 50 - e.diameter / 2;
                e.translate(`${xCenter}vw`, `2vh`, true);
                this.arr!.push(e);
                e.dom.title = "Rank: 0";
                e.removeClass("transform");
            }
            else {
                //let max= (2 ** (2+Math.floor(Math.log2(this.arr!.length)))); //where the exponent corresponds to the depth
                let rank = 0;
                let nodes = this.arr;
                while (this.arr![rank] && Number.isInteger(this.arr![rank].key)) {
                    if (e.key < this.arr![rank].key)
                        rank = rank * 2 + 1;
                    else rank = rank * 2 + 2;
                }
                let parentRank = Math.floor((rank - 1) / 2);
                let parent = nodes![parentRank];
                let translateInfo: { x: string; y: string } = {
                    x: "",
                    y: ""
                };
                const depth = Math.floor(Math.log2(rank + 1));
                let offset = (98) / 2 ** (depth + 1);
                if(depth>3){
                    e.addClass("small");
                }
                if(depth==4){
                    offset += Math.sin(Math.PI / 4);
                }
                
                if (parent.key > e.key) {
                    translateInfo.x = parent.xTransform - offset + "vw";
                }
                else {
                    translateInfo.x = parent.xTransform + offset + "vw";
                }
                
                translateInfo.y = parent.yTransform + Math.sin(Math.PI / 4) * 10 + "vh";
                e.translate(translateInfo.x, translateInfo.y, false);
                e.borderCol("rgb(37, 201, 37)", false);
                e.dom.title = `Rank: ${rank}`;
                if(this.arr![rank]){ //placeholder dom (empty node illustration) exists
                    const connection = this.connections.find((c) => c.child == this.arr![rank]);
                    connection!.child = e;
                    this.arr![rank].opac(0, false);
                    this.arr![rank] = e;
                }
                else{
                    this.arr![rank] = e;
                    this.connectTransform(rank, parentRank, false);
                }
                
                //console.log(`Calling updateAVLFromRank from addNew`);
                await this.updateAVL(rank);
                e.removeClass("transform");

            }
            if(this.avlStatus){
                e.dom.classList.add("active");
            }
            e.opac(1, false);
            return ++this.size;
        }
    }

    toggleEmptyNodes(on: boolean = true): Promise<boolean> {
    return new Promise(async (resolve) => {

        const emptyNodes = new Set<number>();

        if (on) {
            // -------------------------------
            // BUILD emptyNodes
            // -------------------------------
            for (let i = 0; i < this.arr!.length; i++) {
                if (!Boolean(this.arr![i])) emptyNodes.add(i);
            }

            const emptyNotOrphan = new Set<number>();
            emptyNodes.forEach(e => {
                const parent = this.arr![Math.floor((e - 1) / 2)];
                if (parent) emptyNotOrphan.add(e);
            });

            const emptyOrphan = emptyNodes.difference(emptyNotOrphan);

            // -------------------------------
            // assignEmptyElement (recursive)
            // -------------------------------
            const assignEmptyElement = async (rank: number) => {
                const parentRank = Math.floor((rank - 1) / 2);
                const parent = this.arr![parentRank];
                const parentKey = parent.key;

                const depth = Math.floor(Math.log2(rank + 1));

                let targetKey =
                    (rank % 2 === 1
                        ? parentKey - 0.5 ** depth
                        : parentKey + 0.5 ** depth);

                const element = new BinarySearchTree.TreeElement(targetKey);
                element.addClass("empty");

                this.assign(element, rank, true, false);
                this.arr![rank] = element;
                element.dom.innerHTML = "X";
                element.opac(1, false);

                const leftChild = rank * 2 + 1;
                const rightChild = rank * 2 + 2;

                if (emptyOrphan.has(leftChild)) assignEmptyElement(leftChild);
                if (emptyOrphan.has(rightChild)) assignEmptyElement(rightChild);

                const newConnection = new BinarySearchTree.Connection(element, parent, false);
                const emptyIndex = this.connections.findIndex(c => !c);
                if (emptyIndex >= 0) {
                    this.connections[emptyIndex] = newConnection;
                } else {
                    this.connections.push(newConnection);
                }
            };

            // -------------------------------
            // START filling empty nodes
            // -------------------------------
            for (const e of emptyNotOrphan) {
                await assignEmptyElement(e);
            }
        }

        else {
            // -------------------------------
            // DELETE EMPTY NODES
            // -------------------------------
            for (let i = 0; i < this.arr!.length; i++) {
                if (!Boolean(this.arr![i]) || !Number.isInteger(this.arr![i].key))
                    emptyNodes.add(i);
            }
            if(emptyNodes.size == 0)
                resolve(false); // this is to communicate the method caller that there were no empty nodes displayed at all.
            else{
                emptyNodes.forEach((index) => {
                const node = this.arr![index];
                if (!node) return;

                const connectionIndex = this.connections!.findIndex(c => {
                    return c && c.child === node;
                });

                if (connectionIndex > -1) {
                    const connection = this.connections![connectionIndex]!;
                    connection.dom.remove();
                    node.dom.remove();

                    delete this.arr![index];
                    delete this.connections![connectionIndex];
                } else {
                    node.dom.remove();
                    delete this.arr![index];
                }
            });
            }
            
        }

        resolve(true);
    });
}

    addNewTransform(e: InstanceType<typeof BinarySearchTree.TreeElement>) {
        e.dom.classList.add("transform");
        e.dom.offsetHeight; //important for reflow
        return new Promise(async (resolve, reject) => {
            if (this.rankOf(e.key) > -1) {
                document.removeChild(e.dom);
                reject(`The key '${e.key}' is already in the tree. No duplicates allowed`);
            }
            else {
                // console.log(`addNew Promise Opened`);
                if (this.arr!.length == 0) {
                    this.assign(e, 0);
                    if(this.avlStatus) e.addClass("active");
                    await this.breakPoint(e.opac(1, true));
                    this.arr!.push(e);
                    e.removeClass("transform");
                }
                else {
                    //let max= (2 ** (2+Math.floor(Math.log2(this.arr!.length)))); //where the exponent corresponds to the depth
                    await e.translate((50 + (this.arr![0].diameter)) + "vw", `2vh`, true, false);
                    await e.opac(1, true);
                    await e.borderCol("orange", true);
                    await this.breakPoint(this.compareTransform(e, 0));
                }
                resolve(++this.size);
            }
        });
    }

    async compareTransform(e:InstanceType<typeof BinarySearchTree.TreeElement>, rank: number) {
        return new Promise(async (resolve) => {
            // console.log(`compare Promise Opened`);
            let pointer = this.arr![rank];
            await pointer.borderCol("orange", true);
            let aft = false;
            if (e.xTransform < pointer.xTransform) {
                e.comparator.addClass("aft");
                aft = true;
            }
            else {
                e.comparator.addClass("bef");
            }

            if (pointer.key < e.key) {
                if (aft) {
                    e.comparat.inner = ">";
                }
                else
                    e.comparat.inner = "<";
                rank = (rank * 2) + 2; //right child
            }
            else {
                if (aft) {
                    e.comparat.inner = "<";
                }
                else
                    e.comparat.inner = ">";
                rank = (rank * 2) + 1; //left child
            }
            await e.comparat.opac(1, true).then(async () => {
                const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
                await this.breakPoint(sleep(1000));
            }).then(async () => {
                await e.comparat.opac(0, true);
                e.comparat.inner = "";
                e.comparat.removeClass(["bef", "aft"]);
            });

            await pointer.borderCol("rgb(37, 201, 37)", true);
            if (this.arr![rank] == undefined || !Number.isInteger(this.arr![rank].key)){
                await this.assign(e, rank);
                this.arr![rank] = e;
                await this.breakPoint(this.updateAVL(rank));
            }
            else {
                //console.log(`Going to prepareNextCompare(${rank})`);
                await this.prepareNextCompare(e, rank);
            }
            // console.log(`compare Promise Resolved`);
            resolve(true);
        });
    };

    async prepareNextCompare(e : InstanceType<typeof BinarySearchTree.TreeElement>, rank: number) {
        return new Promise(async (resolve) => {
            // console.log(`prepareNextCompare Promise opened`);
            let parent = this.arr![rank];
            //let parentX = parseInt(parent.xTransform);
            let coordinates : {x: string, y: string} = {
                x: "",
                y: ""
            };
            const depth = Math.floor(Math.log2(rank + 1));
            if(depth>3)
                e.addClass("small");
            //await e.translate((50 + (this.arr![0].diameter)) + "vw", `1vh`, true);
            coordinates.x = (parent.xTransform+e.diameter/2) + e.diameter + "vw";
            coordinates.y = parent.yTransform + "vh";
            await e.translate(coordinates.x, coordinates.y, true, false);
            //await this.breakPoint(pause()); //for debugging purposes 
            await this.compareTransform(e, rank);
            //console.log(`prepareNextCompare Promise Resolved`);
            resolve(true);

        });
    }

    async assign(e: InstanceType<typeof BinarySearchTree.TreeElement>, rank: number, reassign: boolean = false, animation: boolean = true, avl: boolean = this.avlStatus) {
        return new Promise(async (resolve) => {
            // console.log(`assign Promise Opened`);
            if(animation) {
                e.addClass("transform");
            }
            let nodes = this.arr;
            console.log(`Inside Move function. Trying to move key '${e.key}' to rank ${rank}`)
            e.dom.title = `Rank: ${rank}`;
            let depth = Math.floor(Math.log2(rank + 1));
            if(depth>3){
                e.addClass("small");
            }
            else
                e.removeClass("small"); //in case it is getting shifted up
            let parentRank = Math.floor((rank - 1) / 2);
            let parent = nodes![parentRank];
            let translateInfo : {x: string, y: string} = {
                x: "",
                y: ""
            };
            let offset = (98) / 2 ** (depth + 1);
            if(parentRank >= 0){
                if (parent.key > e.key) {
                    //console.log(`${parent.key} > ${e.key}`);
                    translateInfo.x = parent.xTransform - offset + "vw";
                }
                else {
                    //console.log(`${parent.key} > ${e.key}`);
                    translateInfo.x = parent.xTransform + offset + "vw";
                }
                translateInfo.y = parent.yTransform + Math.sin(Math.PI / 4) * 10 + "vh";
            }
            else{
                translateInfo.x = 50 - e.diameter / 2 + "vw";
                translateInfo.y = "2vh";
            }
            if(nodes![rank] && !Number.isInteger(nodes![rank].key)){
                nodes![rank].opac(0, false);
                this.connections.forEach((c) => {
                    if(c.child == nodes![rank]) c.child = e;
                    if(c.parent == nodes![rank]) c.parent = e; 
                });
            }
            await e.translate(translateInfo.x, translateInfo.y, true, true);
            if(!reassign) await e.borderCol("rgb(37, 201, 37)", true);
            
            if(!(reassign || nodes![rank])){
                await this.connectTransform(e, parentRank, true);
            }
            if(avl)
                e.addClass("active");
            // console.log(`assign Promise Resolved`);
            //AVL Weight Calculation
            
            resolve(true);
        });
    }

    async connectTransform(rank: number|InstanceType<typeof BinarySearchTree.TreeElement>, parentRank: number|InstanceType<typeof BinarySearchTree.TreeElement>, animation: boolean = true) {
        // console.log(`connectTransform Promise Opened`);
        return new Promise((resolve) => {
            let e: InstanceType<typeof BinarySearchTree.TreeElement>;
            if (typeof rank === "number") {
                e = this.arr![rank] as InstanceType<typeof BinarySearchTree.TreeElement>;
            } else {
                e = rank as InstanceType<typeof BinarySearchTree.TreeElement>;
            }
            let parent = this.arr![(parentRank as number)];
            //console.log(`calling connect transform with animation ${animation}`)
            const newConnection = new BinarySearchTree.Connection(e, parent, animation);
            const emptyIndex = this.connections.findIndex((c) => {if(!c) return true});
            if(emptyIndex >= 0){
                this.connections[emptyIndex] = newConnection;
            }
            else{
                this.connections.push(newConnection);
            }
            // console.log(`connectTransform Promise Resolved`);
            resolve(true);
        });
    }

    async removeKey(key: number, animation: boolean = true): Promise<number | string> { 
    return new Promise(async (resolve, reject) => {
        const rank = this.rankOf(key);
        if (rank > -1) {
            if(animation) await this.arr![rank].borderCol("red", animation);
            if (this.arr![rank * 2 + 1] && this.arr![rank * 2 + 2]) {
                //console.log("Hardest case scenario"); //turned out to be the easiest one LOL
                if(animation){
                    await this.traversal(rank, "in-order", true).then(async (result) =>{
                        await this.removeKey(result[0] as number, animation); 
                        this.size++; //to counter the previous instruction side-effect
                        this.arr![rank].key = result[0];
                    });
                }
                else{
                    const match = this.inOrder(rank*2+2, true)[0];
                    //const rankofMatch = this.rankOf(match);
                    await this.removeKey(match, false);
                    this.arr![rank].changeKey(match, true);
                    //this.arr![rank].dom.innerHTML = match.toString();
                    //console.log(`this.removeKey(${match}, false)`);
                    this.size++;
                    this.arr![rank].key = match;
                    
                }
            } 
            else {
                await this.arr![rank].opac(0, animation);
                this.arr![rank].dom.remove(); 
                const parent = this.arr![Math.floor((rank-1)/2)];
                const child = this.arr![rank*2+1]?this.arr![rank*2+1]:this.arr![rank*2+2];
                //console.log(`Removing rank with key: ${this.arr![rank].key}`);
                let removeLineIndex = this.connections.findIndex((c) => {
                    if (c) {
                        if(c.child.key == this.arr![rank].key){
                            return c.child.key == this.arr![rank].key;
                        }
                        
                    }
                });
                if(rank == 0){
                    removeLineIndex = this.connections.findIndex((c) => {if(c) return c.parent.key == this.arr![rank].key});
                }
                //console.log(removeLineIndex, this.connections[removeLineIndex]);
                if(animation && this.connections[removeLineIndex]){
                    this.connections[removeLineIndex].dom.classList.add("transform");
                    //console.log(`Added transform class to line DOM`);
                }
                //console.log(animation);
                if(this.size>1){
                    
                    this.connections[removeLineIndex].changeLength('0', animation, () => { //remove the line that has the removed key as child
                        //console.log(`Inside the first citizen function`);
                        try{
                            //console.log(`Remove Line Index: ${removeLineIndex}`);
                            this.connections[removeLineIndex].dom.remove();
                            delete this.connections[removeLineIndex];
                        }
                        catch(e){
                            console.log(e);
                            console.log(removeLineIndex);
                        }
                        
                    });
                }
                    

                delete this.arr![rank]; //delete it NOW, not after the event is triggered.

                
                if(!(this.arr![rank*2+1] || this.arr![rank*2+2])){ //leaf node
                    const parentRank = Math.floor((rank-1)/2);
                    const parent = this.arr![parentRank];
                    const comingFromLeft = rank%2 == 0?false:true;
                    //console.log(`Removing Leaf Node: Parent is at rank ${Math.floor((rank-1)/2)}`);

                    if(this.size>1){
                        if(comingFromLeft) {
                            parent.leftWeight = 0
                        }
                        else{
                            parent.rightWeight = 0
                        }
                        parent.updateBalance(this.avlStatus);

                        if(!(this.arr![parentRank*2+1] || this.arr![parentRank*2+2])){ //parent has become a leaf node
                            await this.updateAVL(rank);
                        }
                    }
                    

                    
                }
                let shiftUp: Function;
                let leafNodes : number[] = [];
                if(this.arr![rank*2+1]){ //if left child
                    console.log(`Left side version called`);
                    shiftUp = (from: number, to: number)  => {
                        return new Promise(async (resolve) => {
                            const node = this.arr![from];
                            this.arr![to] = node;
                            //console.log(`Calling assign method with animation ${animation}`);
                            this.assign(node, to, true, animation);
                            delete this.arr![from]; //it is not necessarely true that there will be a child that will overrwrite this node
                            const leftChild = this.arr![from*2+1];
                            const rightChild = this.arr![from*2+2];
                            const redrawLine = this.connections.find((c) => { if(c) return c.child.key == node.key});
                            //console.log(`${Math.floor((to-1)/2)}`);
                            if(to> 0 && redrawLine){
                                redrawLine!.parent = this.arr![Math.floor((to-1)/2)];
                                if(animation) {
                                        redrawLine!.dom.classList.add("transform");
                                        redrawLine.dom.ontransitionend = function() {
                                            redrawLine.dom.classList.remove("transform");
                                            redrawLine.dom.ontransitionend = null;
                                        };
                                    }
                            }

                            if(rightChild){
                                await shiftUp!(from*2+2, to*2+2);
                            }
                            if(leftChild){
                                await shiftUp!(from*2+1, to*2+1);
                            }

                            if(!(leftChild || rightChild)){
                                leafNodes.push(to);
                            }

                            if(to>0){
                                redrawLine!.dom.id = `${Math.floor((to-1)/2)}-${to}`;
                                redrawLine!.draw(false);
                            }

                            resolve(true);
                        });
                    }
                    await shiftUp(rank*2+1, rank);
                }
                else{
                    if(this.arr![rank*2+2]){ //if right child
                        shiftUp = (from: number, to: number) => {
                            return new Promise(async (resolve) => {
                                const node = this.arr![from];
                                this.arr![to] = node;
                                delete this.arr![from]; //it is not necessarely true that there will be a child that will overrwrite this node
                                this.assign(node, to, true, animation);
                                const leftChild = this.arr![from*2+1];
                                const rightChild = this.arr![from*2+2];
                                const redrawLine = this.connections.find((c) => { if(c) return c.child.key == node.key});
                                if(to> 0 && redrawLine){
                                    redrawLine!.parent = this.arr![Math.floor((to-1)/2)];
                                    if(animation) {
                                        redrawLine!.dom.classList.add("transform");
                                        redrawLine.dom.ontransitionend = function() {
                                            redrawLine.dom.classList.remove("transform");
                                            redrawLine.dom.ontransitionend = null;
                                        };
                                    }
                                }                               
                                
                                if(leftChild){
                                    await shiftUp!(from*2+1, to*2+1);
                                }
                                if(rightChild){
                                    await shiftUp!(from*2+2, to*2+2);
                                }

                                if(!(leftChild || rightChild)){
                                    leafNodes.push(to);
                                }
                                if(to>0){
                                    redrawLine!.dom.id = `${Math.floor((to-1)/2)}-${to}`;
                                    redrawLine!.draw(false);
                                }
                                    
                                resolve(true);
                            });
                        }
                        //console.log(`Calling ${rank*2+2} to be moved to ${rank}`);
                        await shiftUp(rank*2+2, rank);
                    }
                }
                leafNodes.forEach((index) => {
                    this.updateAVL(index);
                });
                if((this.arr![rank*2+1] || this.arr![rank*2+2])){
                    if(Boolean(parent)){
                        const reassingLineIndex = this.connections.findIndex((c) => {if(c) return c.child.key == child.key});
                        this.connections[reassingLineIndex]!.parent = parent;
                        this.connections[reassingLineIndex].draw(false);
                    }                    
                }
                
            }
            resolve(--this.size);
            this.trim();
        } 
        else {
            reject(`The key '${key}' is not in the binary search Tree`);
        }
        }); // <- this closes the Promise
    }

    reset() {
        if (this.connections.length > 0)
            this.connections.forEach((connection) => {
                connection.parent.dom.remove();
                connection.child.dom.remove();
                connection.dom.remove();
                //delete (connection);
            });
        else {
            if (this.size == 1) {
                this.arr![0].dom.remove();
            }
        }
        this.connections = [];
        this.arr = [];
        this.size = 0;
    }

    rankOf(key:number) : number{
        let rank = 0;
        //const max = (2 ** (2 + Math.floor(Math.log2(this.arr!.length)))); //where the exponent corresponds to the depth
        const nodes = this.arr!;
        while(nodes[rank] && Number.isInteger(nodes[rank].key)){
            const nodeKey = nodes[rank].key;
            if(key < nodeKey)
                rank = rank*2+1;
            else{
                if(key > nodeKey){
                    rank = rank*2+2;
                }
                else return rank;
            }
        }
        return -1;
    }

    search(key: number): Promise<number> {
        return new Promise(async (resolve, reject) => {
            let rank = 0;
            let nodes = this.arr;
            const clean = () => {
                rank = -1;
                const resetElements = nodes?.filter((n) => {if(n) return n.dom.style.borderColor == "rgb(223, 162, 30)";});
                const resetLines = this.connections.filter((c) => {if(c) return c.dom.style.backgroundColor == "rgb(175, 125, 18)";});
                console.log(resetElements, resetLines);
                resetElements?.forEach((n) => {
                    n.borderCol("rgb(37, 201, 37)", false);
                    n.backgroundCol("white", false);
                });
                resetLines?.forEach((c) => {
                    c.changeColor("black", false);
                });
            }
            while(nodes![rank] && Number.isInteger(nodes![rank].key)){
                if(rank>0){
                    const line = this.connections.find((c) => { if(c) return c.child.key == nodes![rank].key});
                    await line!.changeColor("rgb(175, 125, 18)", true);
                }
                nodes![rank].backgroundCol(`rgb(243, 215, 154)`, false);
                await this.breakPoint(nodes![rank].borderCol("rgb(223, 162, 30)", true));
                let left = nodes![rank*2+1];
                let right = nodes![rank*2+2];
                if(left && key < nodes![rank].key){
                    rank = rank*2+1;
                }
                else{
                    if(right && key > nodes![rank].key){
                        rank = rank*2+2;
                    }
                    else{
                        if(key == nodes![rank].key) {
                            resolve(rank);
                            nodes![rank].borderCol("rgba(71, 185, 252, 1)", true);
                            nodes![rank].dom.style.color = "rgba(43, 128, 143, 1)";
                            const result = rank;
                            setTimeout(() => {
                                nodes![result].borderCol("rgb(37, 201, 37)", false);
                                nodes![result].backgroundCol("white", false);
                                nodes![result].dom.style.color = "rgba(0,0,0,1)";
                            }, 5000);
                        }
                        else {
                            reject(new Error(`The key '${key}' is not in the binary search Tree`));
                            //break;
                        }
                        clean();                     
                    }
                }
            }
        });
    }

    async traversal(root: number, mode: string, removing: boolean = false) : Promise<number[]> {
        let nodes = this.arr;
        let traverse = [];
        let arrow = document.createElement("span");
        arrow.classList.add("traverser");
        arrow.innerHTML = "↑";
        document.body.append(arrow);
        arrow.offsetHeight; //reflow stuff
        //let output = document.getTreeElementById("output");
        let original = root;

        let setuptraversal = function (root: number, color: string = 'red') { //sets all the children to red (unvisited)
            if (nodes![root * 2 + 1])
                setuptraversal(root * 2 + 1);
            nodes![root].borderColor = color;

            if (nodes![root * 2 + 2])
                setuptraversal(root * 2 + 2);
            return;
        }
        if(!removing && mode != "AVL") setuptraversal(root);


        let waitTransition = async function (dom : any, fn: Function) { //first class function
            return new Promise((resolve) => {
                dom.ontransitionend = function (e: Event) {
                    dom.ontransitionend = null;
                    resolve(e);
                }
                fn(); //the style/transition that needs to be run
            });
        };

        await waitTransition(arrow, () => {
            arrow.style.opacity = (1).toString();
        });

        const vwToPx = window.innerWidth / 100;
        const vhToPx = window.innerHeight / 100;
        //const diameterVw = nodes![0].diameter;
        //const diameterPx = diameterVw * vwToPx;
        const arrowWidthPx = arrow.getBoundingClientRect().width;
        const arrowOffsetVw = (arrowWidthPx / window.innerWidth) * 50;
        //const arrowOffsetVw = 0.75;     

        return new Promise<number[]>(async (resolve) => {
            switch (mode) {
                case "in-order":
                    const inOrder = async (root: number) => {
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });
                        await this.breakPoint(nodes![root].borderCol("orange", true)); //visited but not added into the return value

                        let returnArr: number[] = [];

                        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 + 1].key)) {
                            await inOrder(root * 2 + 1).then(function (result) {
                                returnArr = result;
                            });
                        }
                        
                        await this.breakPoint(nodes![root].borderCol("rgb(37, 201, 37)", !removing));

                        returnArr.push(nodes![root].key);

                        if(removing){
                            return returnArr;
                        }

                        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 +2].key)) {
                            await inOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }

                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit

                            await this.breakPoint(waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes![Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes![Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            }));
                        }

                        return returnArr;
                    }

                    if(removing){ //find the first key in an in-order traversal after the key we want to delete
                        inOrder(root*2+2).then(async (result) => { //call the function and handle the result
                            //traverse = result;
                            
                            let target = nodes![root];
                            const diameterVw = nodes![root].diameter;
                            const diameterPx = diameterVw * vwToPx;
                            const centerXvw = target.xTransform + diameterVw / 2;
                            const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                            });

                            await waitTransition(arrow, () => {
                                target.changeKey(result[0]);
                                target.borderCol("rgb(37, 201, 37)", false);
                                arrow.style.opacity = (0).toString();
                            }).then(() => {arrow.remove();});
                            
                            //target.key = result[0];
                            //target.dom.innerHTML = result[0].toString();
                            
                            resolve(result);
                        });
                    }
                    else{
                        inOrder(root).then(function (result) { //call the function and handle the result
                            //traverse = result;
    
                            arrow.ontransitionend = async function () {
                                arrow.ontransitionend = null;
                                arrow.remove();
                            };
                            arrow.style.opacity = (0).toString();
                            resolve(result);
                        });
                    }
                    


                    break;

                case "pre-order":
                    const preOrder = async (root:number) => {
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                            //arrow.style.transform = `translate(${target.xTransform + diameterVw/2 - 1.5}vw, ${target.yTransform + diameter}vh)`;
                        });

                        await this.breakPoint(nodes![root].borderCol("orange", true)); //visited but not added into the return value
                        await this.breakPoint(nodes![root].borderCol("rgb(37, 201, 37)", true));
                        let returnArr = [nodes![root].key];
                        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 + 1].key)) {
                            await preOrder(root * 2 + 1).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 + 2].key)) {
                            await preOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit

                            await this.breakPoint(waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes![Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes![Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            }));
                        }

                        return returnArr;
                    }
                    preOrder(root).then(function (result) { //call the function and handle the result
                        //traverse = result;

                        arrow.ontransitionend = async function () {
                            arrow.ontransitionend = null;
                            arrow.remove();
                        };
                        arrow.style.opacity = (0).toString();
                        resolve(result);
                    });
                    break;

                case "post-order":
                    let postOrder = async (root:number) => {
                        let returnArr: number[] = [];
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });
                        await this.breakPoint(nodes![root].borderCol("orange", true)); //visited but not added into the return value
                        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 + 1].key)) {
                            await postOrder(root * 2 + 1).then(function (result) {
                                returnArr = [...result];
                            });
                        }
                        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 + 2].key)) {
                            await postOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        await this.breakPoint(nodes![root].borderCol("rgb(37, 201, 37)", true));
                        returnArr.push(nodes![root].key);

                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit
                            await this.breakPoint(waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes![Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes![Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            }));
                        }

                        return returnArr;
                    }

                    postOrder(root).then(function (result) { //call the function and handle the result
                        //traverse = result;

                        arrow.ontransitionend = async function () {
                            arrow.ontransitionend = null;
                            arrow.remove();
                        };
                        arrow.style.opacity = (0).toString();
                        resolve(result);
                    });
                    break;
                
                case "AVL":
                    const labels = ["c", "b", "a"];
                    const AVL = async (root: number) => {
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh
                        let returnArr:number[] = [];
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });

                        await this.breakPoint(nodes![root].borderCol("orange", true)); //visited but not added into the return value
                        if (nodes![root * 2 + 1] && Number.isInteger(nodes![root * 2 + 1].key)) {
                            await AVL(root * 2 + 1).then(function (result) {
                                returnArr = result;
                            });
                        }
                        
                        //returnArr.push(nodes![root].key);
                        if(nodes![root].label != "" && nodes![root].label != "w"){
                            nodes![root].label = `${nodes![root].label} = ${labels.pop()}`;
                            returnArr.push(root);
                        }
                        await this.breakPoint(nodes![root].borderCol("rgb(37, 201, 37)", !removing));

                        if (nodes![root * 2 + 2] && Number.isInteger(nodes![root * 2 + 2].key)) {
                            await AVL(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }

                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit

                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes![Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes![Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            });
                        }
                        return returnArr;
                    }
                    AVL(root).then(function (result) { //call the function and handle the result
                            //traverse = result;
    
                            arrow.ontransitionend = async function () {
                                arrow.ontransitionend = null;
                                arrow.remove();
                            };
                            arrow.style.opacity = (0).toString();
                            resolve(result);
                        });
                break;
            }
        });

    }

    async onResize() {
        this.connections.forEach((conn) => {
            try{
                if(conn) conn.draw(false);
            }
            catch(e: any){
                console.error(e.toString());
            }
        });
    }

    static Connection = class {
        dom: HTMLDivElement;
        child: InstanceType<typeof BinarySearchTree.TreeElement>;
        parent: InstanceType<typeof BinarySearchTree.TreeElement>;
        l!: string;
        constructor(child: InstanceType<typeof BinarySearchTree.TreeElement>, parent: InstanceType<typeof BinarySearchTree.TreeElement>, animation: boolean = true) {
            this.dom = document.createElement("div");
            this.dom.classList.add("line");
            if(animation){
                //console.log(`Animation if triggered`);
                this.dom.classList.add("transform");
                this.dom.ontransitionend = () => { //so when the window is resized it does not get weird animations
                    //this.dom.style.transition = "transform 0s";
                    this.dom.ontransitionend = null;
                    this.dom.classList.remove("transform");
                    //console.log(`removing animation triggered`);
                };
            }
            //console.log(`${child} and ${parent}`)
            this.dom.id = `${parent.dom.title.slice(6)}-${child.dom.title.slice(6)}`; 
            this.child = child;
            this.parent = parent;
            this.draw(true);
            
        }

        draw(appendToBody: boolean) {
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
            //console.log(child.diameter);
            let offsetXpx = (child.diameter * (window.innerWidth / 100)) / 2;
            let offsetYpx = (child.diameter * (window.innerHeight / 100)) / 2;
            let x = 100 * (parentXpx + offsetXpx) / window.innerWidth;
            let y = 100 * (parentYpx + offsetYpx) / window.innerHeight;
            const baseLengthPx = 100; // Matches your CSS .line width
            const scale = lengthInPx / baseLengthPx;
            if (appendToBody) {
                this.transform = `translate(${x}vw, ${y}vh) rotate(${angle}rad) scaleX(${0})`;
                document.body.append(this.dom);
            }
            
            this.dom.offsetHeight; //force reflow
            //this.transform = `translate(${x}vw, ${y}vh) rotate(${angle}rad) scaleX(${scale})`;
            requestAnimationFrame(() => {
                this.transform = `translate(${x}vw, ${y}vh) rotate(${angle}rad) scaleX(${scale})`;
            });
        }

        set transform(value) {
            this.dom.style.transform = value;
        }

        get transform() {
            return this.dom.style.transform;
        }

        opac = (o:number, synchronous:boolean) => {
            return new Promise((resolve)=> {
                if(synchronous){
                    this.dom.ontransitionend = () =>{
                        this.dom.ontransitionend = null;
                        resolve(true);
                    }
                }
                else{
                    resolve(true);
                }
                this.dom.style.opacity = (o).toString();
            })
            
        }

        changeLength = (length: string, synchronous:boolean, onTransitionEnd:Function|null = () => {}) => {
            this.l = length;
            return new Promise((resolve) => {
                let transformProperty = this.transform.substring(0, this.transform.indexOf("scaleX"));
                transformProperty += ` scaleX(${length})`;
                if(synchronous){
                    this.dom.ontransitionend = () =>{
                        this.dom.ontransitionend = null;
                        onTransitionEnd?.();
                        resolve(true);
                    }
                }
                else{
                    onTransitionEnd?.();
                    resolve(true);
                }
                this.transform = transformProperty;
                this.l = length;
            });
            
        }

        changeColor = (color: string, synchronous:boolean) => {
            return new Promise((resolve) => {
                if(synchronous){
                    this.dom.ontransitionend = () =>{
                        this.dom.ontransitionend = null;
                        resolve(true);
                    }
                }
                else{
                    resolve(true);
                }
                this.dom.style.backgroundColor = color;
            });
        }

        set length(length) {
            this.l = length;
        }

        get length() {
            return this.l;
        }

    }

    // Define the class first
    static TreeElement = class {
        key : number;
        keyContainer: HTMLParagraphElement;
        dom: HTMLDivElement;
        comparator: any;
        leftSpan: HTMLSpanElement;
        rightSpan: HTMLSpanElement;
        upperSpan: HTMLSpanElement;
        bottomSpan: HTMLSpanElement;
        constructor(key: number) {
            this.key = key;
            this.dom = document.createElement("div");
            this.dom.classList.add("TreeElement");
            //this.dom.innerHTML = key.toString();
            this.dom.style.backgroundColor = "#FFFFFF";
            this.dom.style.zIndex = (1).toString(); //this is so cringe
            this.opacity = 0;
            this.comparator = new BinarySearchTree.TreeElement.Comparator();
            this.keyContainer = document.createElement("p");
            this.upperSpan = document.createElement("span");
            this.leftSpan = document.createElement("span");
            this.rightSpan = document.createElement("span");
            this.bottomSpan = document.createElement("span");
            this.upperSpan.classList.add("avl", "top");
            this.leftSpan.classList.add("avl", "left");
            this.rightSpan.classList.add("avl", "right");
            this.bottomSpan.classList.add("avl", "bottom");
            this.rightSpan.setAttribute('data-val', '0');
            this.leftSpan.setAttribute('data-val', '0');
            this.upperSpan.setAttribute('data-val', '0');
            this.bottomSpan.setAttribute('data-val', '');
            this.keyContainer.innerHTML = this.key.toString();
            this.dom.append(this.keyContainer, this.comparator.dom, this.upperSpan, this.leftSpan, this.rightSpan, this.bottomSpan);
            document.body.append(this.dom);
        }

        changeKey(value:number, changeK = false){
            if(changeK)
                this.key = value;
            this.keyContainer.innerHTML = value.toString();
        }

        get label() : string{
            return this.bottomSpan.getAttribute('data-val')!;
        }

        set label(s:string){
            this.bottomSpan.setAttribute('data-val', s);
        }

        get leftWeight() : number{
            return parseInt(this.leftSpan.getAttribute('data-val')!);
        }

        get rightWeight() : number{
            return parseInt(this.rightSpan.getAttribute('data-val')!);
        }

        get balance(): number{
            return parseInt(this.upperSpan.getAttribute('data-val')!);
        }

        set leftWeight(weight: number){
            //console.log(`Setting rightWeight to ${weight}`);
            this.leftSpan.setAttribute('data-val', weight.toString());
        }

        set rightWeight(weight: number){
            //console.log(`Setting rightWeight to ${weight}`);
            this.rightSpan.setAttribute('data-val', weight.toString());
        }

        set balance(balance: number){
            this.upperSpan.setAttribute('data-val', balance.toString());
        }

        updateBalance(avlOn:boolean){
            return new Promise(async (resolve, reject) => {
                this.balance = this.leftWeight - this.rightWeight;
                if(Math.abs(this.balance)>1 && avlOn){
                    reject("The node is not balanced");
                }
                resolve(true);
            });
            
        }
    
        get xTransform() : number {
            let transform = this.transform;
            const matches = transform.match(/\d+(\.\d+)?/g);
            return matches ? parseFloat(matches[0]) : 0;
        }
    
        get yTransform() {
            let transform = this.transform;
            const matches = transform.match(/\d+(\.\d+)?/g);
            return matches ? parseFloat(matches[1]) : 0;
        }
    
        get diameter() { //the diameter is based on the width of the screen
            const vw = (window.innerWidth / 100);
            const computed = parseFloat(window.getComputedStyle(this.dom).width);
            return (computed / vw);
        }
    
        get comparat() {
            return this.comparator;
        }
    
        opac = (value: number, synchronous: boolean) => {
            return new Promise((resolve) => {
                // Force reflow before setting opacity
                if (synchronous) {
                    this.dom.ontransitionend = async (e) => {
                        this.dom.ontransitionend = null;
                        await new Promise((r) => requestAnimationFrame(r)); //essential in case youre calling other animation methods on the element
                        resolve(e);
                    };
                    requestAnimationFrame(()=> {
                        this.opacity = value;
                    })
                    
                } else {
                    this.opacity = value;
                    resolve(true);
                }
            });
        };
    
        translate = (x:string, y:string, synchronous:boolean, finish:boolean = true) => {
            //let e = this;
            this.dom.offsetHeight; //important for reflow
            return new Promise((resolve) => {
                this.transform = `translate(${x}, ${y})`;
                if (synchronous) {
                    this.dom.ontransitionend = async (e) => {
                        this.dom.ontransitionend = null;
                        await new Promise((r) => requestAnimationFrame(r)); //essential in case youre calling other animation methods on the element
                        if(finish) this.removeClass("transform");
                        resolve(e);
                    }
                }
                else
                    resolve(true);
            });
        }
    
        borderCol =(value:string, synchronous:boolean) => {
            this.dom.offsetHeight; //important for reflow
            return new Promise((resolve) => {                
                if (synchronous) {
                    this.dom.ontransitionend = async function (e) {
                        this.ontransitionend = null;
                        await new Promise((r) => requestAnimationFrame(r)); //essential in case youre calling other animation methods on the element
                        resolve(e);
                    }
                    requestAnimationFrame(() => {
                        this.borderColor = `${value}`;
                    });
                }
                else{
                    this.borderColor = `${value}`;
                    resolve(true);
                }
            });
        }

        backgroundCol = (value:string, synchronous:boolean) => {
            this.dom.offsetHeight; //important for reflow
            return new Promise((resolve) => {                
                if (synchronous) {
                    this.dom.ontransitionend = async function (e) {
                        this.ontransitionend = null;
                        await new Promise((r) => requestAnimationFrame(r)); //essential in case youre calling other animation methods on the element
                        resolve(e);
                    }
                    requestAnimationFrame(() => {
                        this.backgroundColor = `${value}`;
                    });
                }
                else{
                    this.backgroundColor = `${value}`;
                    resolve(true);
                }
            });
        }
    
        addClass = (...classes: string[]): void => {
            this.dom.classList.add(...classes);
        }
    
        removeClass =  (...classes: string[]) : void => {
            this.dom.classList.remove(...classes);
        }
    
        set opacity(o: number) {                             //and yes I tried to rename this with something else, still same problem :/
            this.dom.style.opacity = parseInt(o as any as string) as any;
        }
    
        set borderColor(b: string | number) {
            this.dom.style.borderColor = `${b}`;
        }

        set backgroundColor(c: string){
            this.dom.style.backgroundColor = c;
        }
    
        set transform(transform) {
            this.dom.style.transform = transform;
        }
    
        get transform() {
            return this.dom.style.transform;
        }
    
        static Comparator = class TreeElementComparator  {
            dom: HTMLSpanElement;
            constructor() {
                this.dom = document.createElement("span");
                this.dom.classList.add("comparatorTransform");
            }
    
            addClass(Class: string): void {
                this.dom.classList.add(Class);
            }
    
            removeClass(...Class: string[] | string[][]): void {
                this.dom.classList.remove(...(Class.flat() as string[]));
            }
    
            get classes() {
                return this.dom.className;
            }
    
            set inner(value: string) {
                this.dom.innerHTML = value;
            }

            set style(value: string){
                this.dom.style = value;
            }
    
            async opac(value: number, synchronous: boolean): Promise<Boolean> {
                let comparator = this.dom;
                return new Promise((resolve) => {
                    if (synchronous) {
                        comparator.ontransitionend = function (e) {
                            this.ontransitionend = null;
                            resolve(true);
                        }
                    }
                    else {
                        resolve(true);
                    }
                    comparator.style.opacity = value as any;
                });
    
            }
        }        
    };
   
    
    // Assign the class to the static property
}