//@ts-check

//reverted instance

export class BinarySearchTree {
    
    arr: (InstanceType<typeof BinarySearchTree.TreeElement>)[] | undefined;
    connections: InstanceType<typeof BinarySearchTree.Connection>[];
    s: number;
    width: number;
    avl: boolean;

    constructor() {
        this.arr = [];
        this.connections = [];
        this.s = 0;
        this.width = 85;
        this.avl = false;
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
        if (nodes![root * 2 + 1]) {
            returnArr = this.inOrder(root * 2 + 1);
        }
        if(returnRanks) returnArr.push(root);
        else returnArr.push(nodes![root].key);
        if(removing)
            return returnArr;

        if (nodes![root * 2 + 2])
            returnArr = [...returnArr, ...this.inOrder(root * 2 + 2)];

        return returnArr;
    }

    preOrder(root: number = 0): number[] {
        let returnArr = [];
        let nodes = this.arr;

        returnArr.push(nodes![root].key);

        if (nodes![root * 2 + 1]) {
            returnArr = [...returnArr, ...this.preOrder(root * 2 + 1)];
        }


        if (nodes![root * 2 + 2])
            returnArr = [...returnArr, ...this.preOrder(root * 2 + 2)];

        return returnArr;
    }

    postOrder(root: number = 0) : number[] {
        let nodes = this.arr;
        let returnArr: number[] = [];
        if (nodes![root * 2 + 1])
            returnArr = [...this.postOrder(root * 2 + 1)];

        if (nodes![root * 2 + 2])
            returnArr = [...returnArr, ...this.postOrder(root * 2 + 2)];

        returnArr.push(nodes![root].key);

        return returnArr;
}

    async updateAVL(childRank: number): Promise<void> {
    // start from the parent of the changed node
        let i = Math.floor((childRank - 1) / 2);
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
                await node.updateBalance(); // e.g., node.balance = rh - lh; may also add rotation triggers
            }
            catch(e){
                await this.balanceAVL(i, childRank);
                return; //Remove this once the implementation of this.balanceAVL is done
            }
            // climb
            i = Math.floor((i - 1) / 2);
        }
        return;
    }

    async balanceAVL(zRank: number, wRank:number, afterInsertion = true){
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
        const ranks = await this.traversal(zRank, "AVL") as number[]; //the traversal returns x y and z in in-order traversal
        const elements = ranks.map(rank => {return nodes![rank]});
        const lines = this.connections.filter((line) => { if (line) { return elements.includes(line.parent) || elements.includes(line.child); } });
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
        let t0: number[] = this.inOrder(rankA*2+1, false, true); // because of in-order traversal, b and c will never be the a's left child
        let t1: number[] = !(nodes[rankA*2+2] == b || nodes[rankA*2+2] == c) ? this.inOrder(rankA*2+2, false, true): this.inOrder(rankB*2+1, false, true); //if a does not have t1 as a child, then b will always have it as its left child*/
        let t2: number[] = nodes[rankB*2+2] != c ? this.inOrder(rankB*2+2, false, true):  this.inOrder(rankC*2+1, false, true); // if b's right child is not c (no need to check if it is not a, due to the in-order traversal), then t2 is b's right child, else it will always be c's left child
        let t3: number[] = this.inOrder(rankC*2+2, false, true); // because of in-order traversal, t3 will always be c's right child

        /*if(!(nodes[rankA*2+2] == b || nodes[rankA*2+2] == c)) // if a right child is neither b or c
            t1 = this.inOrder(rankA*2+2, false, true);
        else t1 = this.inOrder(rankB*2+1, false, true); //if a does not have t1 as a child, then b will always have it as its left child*/
        /*if(nodes[rankB*2+2] != c) // if a right child is not c (no need to check if it is not a, due to the in-order traversal)
            t2 = this.inOrder(rankB*2+2, false, true);
        else t2 = this.inOrder(rankC*2+1, false, true);*/
        
        console.log(`T0: ${t0}, T1: ${t1}, T2: ${t2}, T3: ${t3}`);
    }

    async addNew(e:InstanceType<typeof BinarySearchTree.TreeElement>) {
        e.dom.classList.add('no-animation');
        //console.log(`Adding new element ${e.key} with no amination`);
        if (this.rankOf(e.key) > -1) {
            document.removeChild(e.dom);
            return false;
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
                while (this.arr![rank]) {
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
                    e.addClass("smaller");
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
                this.arr![rank] = e;
                this.connectTransform(rank, parentRank, false);
                //console.log(`Calling updateAVLFromRank from addNew`);
                this.updateAVL(rank);
                e.removeClass("transform");

            }
            if(this.avlStatus){
                e.dom.classList.add("active");
            }
            e.opac(1, false);
            return ++this.size;
        }
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
                    await e.opac(1, true);
                    this.arr!.push(e);
                    e.removeClass("transform");
                }
                else {
                    //let max= (2 ** (2+Math.floor(Math.log2(this.arr!.length)))); //where the exponent corresponds to the depth
                    let rank = 0;
                    await e.translate((50 + (this.arr![0].diameter)) + "vw", `2vh`, true, false);
                    await e.opac(1, true);
                    await e.borderCol("orange", true);
                    await this.compareTransform(e, rank);
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
                await sleep(1000);
            }).then(async () => {
                await e.comparat.opac(0, true);
                e.comparat.inner = "";
                e.comparat.removeClass(["bef", "aft"]);
            });

            await pointer.borderCol("rgb(37, 201, 37)", true);
            if (this.arr![rank] == undefined) {
                this.arr![rank] = e;
                await this.assign(e, rank);
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
                e.addClass("smaller");
            //await e.translate((50 + (this.arr![0].diameter)) + "vw", `1vh`, true);
            coordinates.x = (parent.xTransform+e.diameter/2) + e.diameter + "vw";
            coordinates.y = parent.yTransform + "vh";
            await e.translate(coordinates.x, coordinates.y, true, false);
            //await pause(); //for debugging purposes 
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
            //console.log(`Inside Move function. Trying to move key '${e.key}' to rank ${rank}`)
            e.dom.title = `Rank: ${rank}`;
            let depth = Math.floor(Math.log2(rank + 1));
            if(depth>3){
                e.addClass("smaller");
            }
            else
                e.removeClass("smaller"); //in case it is getting shifted up
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
            
            await e.translate(translateInfo.x, translateInfo.y, true, true);
            await e.borderCol("rgb(37, 201, 37)", true);
            if(avl)
                e.addClass("active");
            if(!reassign){
                await this.connectTransform(rank, parentRank, animation);
            }
            // console.log(`assign Promise Resolved`);
            //AVL Weight Calculation
            this.updateAVL(rank);
            resolve(true);
        });
    }

    async connectTransform(rank: number, parentRank: number, animation: boolean = true) {
        // console.log(`connectTransform Promise Opened`);
        return new Promise((resolve) => {
            let e = this.arr![rank];
            let parent = this.arr![parentRank];
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
                        await this.removeKey(result[0], animation); 
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

                    if(comingFromLeft) {
                        parent.leftWeight = 0
                    }
                    else{
                        parent.rightWeight = 0
                    }

                    parent.updateBalance();

                    if(!(this.arr![parentRank*2+1] || this.arr![parentRank*2+2])){ //parent has become a leaf node
                        this.updateAVL(rank);
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
        let max = (2 ** (2 + Math.floor(Math.log2(this.arr!.length)))); //where the exponent corresponds to the depth
        while (rank < max) {
            try {
                if (key == this.arr![rank].key) {
                    return rank;
                }
                else {
                    if (key < this.arr![rank].key) {
                        rank = rank * 2 + 1;
                    }
                    else {
                        rank = rank * 2 + 2;
                    }
                }
            }
            catch (e) {
                return -1;
            };
        }
        return -1;
    }

    search(key: number): Promise<number> {
        return new Promise(async (resolve, reject) => {
            let rank = 0;
            let nodes = this.arr;
            while(nodes![rank]){
                if(rank>0){
                    const line = this.connections.find((c) => { if(c) return c.child.key == nodes![rank].key});
                    await line!.changeColor("rgb(71, 173, 199)", true);
                }
                nodes![rank].backgroundCol(`rgb(131 255 255)`, false);
                await nodes![rank].borderCol("rgb(71, 173, 199)", true);
                let leftKey = nodes![rank*2+1];
                let rightKey = nodes![rank*2+2];
                if(leftKey && key < nodes![rank].key){
                    rank = rank*2+1;
                }
                else{
                    if(rightKey && key > nodes![rank].key){
                        rank = rank*2+2;
                    }
                    else{
                        if(key == nodes![rank].key){
                            resolve(rank);
                        }
                        else{
                            reject(new Error(`The key '${key}' is not in the binary search Tree`));
                        }
                        rank = -1;
                        const resetElements = nodes?.filter((n) => {if(n) return n.dom.style.borderColor == "rgb(71, 173, 199)";});
                        const resetLines = this.connections.filter((c) => {if(c) return c.dom.style.backgroundColor == "rgb(71, 173, 199)";});
                        console.log(resetElements, resetLines);
                        resetElements?.forEach((n) => {
                            n.borderCol("rgb(37, 201, 37)", false);
                            n.backgroundCol("white", false);
                        });
                        resetLines?.forEach((c) => {
                            c.changeColor("black", false);
                        });

                    }
                }
            }
            
            
        });
    }

    async traversal(root: number, mode: string, removing: boolean = false) : Promise<number[]|boolean> {
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

        return new Promise<number[]|boolean>(async (resolve) => {
            switch (mode) {
                case "in-order":
                    const inOrder = async function (root: number) {
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });
                        await nodes![root].borderCol("orange", true); //visited but not added into the return value

                        let returnArr: number[] = [];

                        if (nodes![root * 2 + 1]) {
                            await inOrder(root * 2 + 1).then(function (result) {
                                returnArr = result;
                            });
                        }
                        
                        await nodes![root].borderCol("rgb(37, 201, 37)", !removing);

                        returnArr.push(nodes![root].key);

                        if(removing){
                            return returnArr;
                        }

                        if (nodes![root * 2 + 2]) {
                            await inOrder(root * 2 + 2).then(function (result) {
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

                    if(removing){ //find the first key in an in-order traversal after the key we want to delete
                        inOrder(root*2+2).then(async function (result) { //call the function and handle the result
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
                    let preOrder = async function (root:number) {
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                            //arrow.style.transform = `translate(${target.xTransform + diameterVw/2 - 1.5}vw, ${target.yTransform + diameter}vh)`;
                        });

                        await nodes![root].borderCol("orange", true); //visited but not added into the return value
                        await nodes![root].borderCol("rgb(37, 201, 37)", true);
                        let returnArr = [nodes![root].key];
                        if (nodes![root * 2 + 1]) {
                            await preOrder(root * 2 + 1).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if (nodes![root * 2 + 2]) {
                            await preOrder(root * 2 + 2).then(function (result) {
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
                    let postOrder = async function (root:number) {
                        let returnArr: number[] = [];
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });
                        await nodes![root].borderCol("orange", true); //visited but not added into the return value
                        if (nodes![root * 2 + 1]) {
                            await postOrder(root * 2 + 1).then(function (result) {
                                returnArr = [...result];
                            });
                        }
                        if (nodes![root * 2 + 2]) {
                            await postOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        await nodes![root].borderCol("rgb(37, 201, 37)", true);
                        returnArr.push(nodes![root].key);

                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit
                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes![Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes![Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            });
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
                    const AVL = async function (root: number) {
                        let target = nodes![root];
                        const diameterVw = nodes![root].diameter;
                        const diameterPx = diameterVw * vwToPx;
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh
                        let returnArr:number[] = [];
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });

                        await nodes![root].borderCol("orange", true); //visited but not added into the return value
                        if (nodes![root * 2 + 1]) {
                            await AVL(root * 2 + 1).then(function (result) {
                                returnArr = result;
                            });
                        }
                        
                        await nodes![root].borderCol("rgb(37, 201, 37)", !removing);

                        //returnArr.push(nodes![root].key);
                        if(nodes![root].label != "" && nodes![root].label != "w"){
                            nodes![root].label = `${nodes![root].label} = ${labels.pop()}`;
                            returnArr.push(root);
                        }

                        if (nodes![root * 2 + 2]) {
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

        updateBalance(){
            return new Promise(async (resolve, reject) => {
                this.balance = this.leftWeight - this.rightWeight;
                if(Math.abs(this.balance)>1){
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