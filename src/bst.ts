//@ts-check

export class BinarySearchTree {

    arr: InstanceType<typeof BinarySearchTree.TreeElement>[];
    connections: InstanceType<typeof BinarySearchTree.Connection>[];
    s: number;
    width: number;

    constructor() {
        this.arr = [];
        this.connections = [];
        this.s = 0;
        this.width = 90;
    }

    get size() {
        return this.s;
    }

    set size(s) {
        this.s = s;
    }

    inOrder(root: number): number[] {
        let returnArr : number[] = [];
        let nodes = this.arr;
        if (nodes[root * 2 + 1]) {
            returnArr = this.inOrder(root * 2 + 1);
        }
        returnArr.push(nodes[root].key);

        if (nodes[root * 2 + 2])
            returnArr = [...returnArr, ...this.inOrder(root * 2 + 2)];

        return returnArr;
    }

    preOrder(root: number): number[] {
        let returnArr = [];
        let nodes = this.arr;

        returnArr.push(nodes[root].key);

        if (nodes[root * 2 + 1]) {
            returnArr = [...returnArr, ...this.preOrder(root * 2 + 1)];
        }


        if (nodes[root * 2 + 2])
            returnArr = [...returnArr, ...this.preOrder(root * 2 + 2)];

        return returnArr;
    }

    postOrder(root:number) : number[] {
        let nodes = this.arr;
        let returnArr: number[] = [];
        if (nodes[root * 2 + 1])
            returnArr = [...this.postOrder(root * 2 + 1)];

        if (nodes[root * 2 + 2])
            returnArr = [...returnArr, ...this.postOrder(root * 2 + 2)];

        returnArr.push(nodes[root].key);

        return returnArr;
    }

    addNew(e:InstanceType<typeof BinarySearchTree.TreeElement>) {
        e.dom.classList.add('no-animation');
        if (this.rankOf(e.key) > -1) {
            return false;
        }
        else {
            if (this.arr.length == 0) {
                const xCenter = 50 - e.diameter / 2;
                e.translate(`${xCenter}vw`, `1vh`, true);
                this.arr.push(e);
                e.dom.title = "Rank: 0";
                e.removeClass("transform");
            }
            else {
                //let max= (2 ** (2+Math.floor(Math.log2(this.arr.length)))); //where the exponent corresponds to the depth
                let rank = 0;
                let nodes = this.arr;
                while (this.arr[rank]) {
                    if (e.key < this.arr[rank].key) {
                        rank = rank * 2 + 1;
                    }
                    else {
                        rank = rank * 2 + 2;
                    }
                }
                let parentRank = Math.floor((rank - 1) / 2);
                let parent = nodes[parentRank];
                let translateInfo: { x: string; y: string } = {
                    x: "",
                    y: ""
                };
                let depth = Math.floor(Math.log2(rank + 1));
                let offset = (98) / 2 ** (depth + 1);
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
                this.arr[rank] = e;
                //console.log(`${e} and ${parent}`)
                //console.log(`${rank} and ${parentRank}`)
                this.connectTransform(rank, parentRank);
                e.removeClass("transform");

            }
            e.opac(1, false);
            return ++this.size;
        }
    }

    async addNewTransform(e: InstanceType<typeof BinarySearchTree.TreeElement>) {
        e.dom.classList.add("transform");
        e.dom.offsetHeight; //important for reflow
        return new Promise(async (resolve, reject) => {
            if (this.rankOf(e.key) > -1) {
                reject(`'${e.key}' is already in the tree. No duplicates allowed`);
            }
            else {
                console.log(`addNew Promise Opened`);
                if (this.arr.length == 0) {
                    const xCenter = 50 - e.diameter / 2;
                    await e.translate(`${xCenter}vw`, `1vh`, true);
                    //await e.translate(`${(e.diameter/2 + this.width)/2}vw`, `1vh`, true);
                    await e.opac(1, true);
                    this.arr.push(e);
                    e.dom.title = "Rank: 0";
                    e.removeClass("transform");
                }
                else {
                    //let max= (2 ** (2+Math.floor(Math.log2(this.arr.length)))); //where the exponent corresponds to the depth
                    let rank = 0;
                    await e.translate((50 + (this.arr[0].diameter)) + "vw", `1vh`, true);
                    await e.opac(1, true);
                    await e.borderCol("orange", true);
                    await this.compareTransform(e, rank);
                }
                console.log(`addNew Promise Resolved`);
                console.clear();
                resolve(++this.size);
            }
        });
    }

    async compareTransform(e:InstanceType<typeof BinarySearchTree.TreeElement>, rank: number) {
        return new Promise(async (resolve) => {
            console.log(`compare Promise Opened`);
            let pointer = this.arr[rank];
            pointer.borderColor = "orange";
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
            await e.comparat.opac(1, true).then(
                async function () {
                    await e.comparat.opac(0, true).then(() => {
                        e.comparat.inner = "";
                        e.comparator.removeClass(["bef", "aft"]);
                    });
                }

            );

            await pointer.borderCol("rgb(37, 201, 37)", true);
            if (this.arr[rank] == undefined) {
                this.arr[rank] = e;
                await this.assign(e, rank);
            }
            else {
                //console.log(`Going to prepareNextCompare(${rank})`);
                await this.prepareNextCompare(e, rank);
            }
            console.log(`compare Promise Resolved`);
            resolve(true);
        });
    };

    async prepareNextCompare(e : InstanceType<typeof BinarySearchTree.TreeElement>, rank: number) {
        return new Promise(async (resolve) => {
            console.log(`prepareNextCompare Promise opened`);
            let parent = this.arr[rank];
            //let parentX = parseInt(parent.xTransform);
            let coordinates : {x: string, y: string} = {
                x: "",
                y: ""
            };
            if (parent.xTransform > 50)
                coordinates.x = parent.xTransform - 2 * e.diameter + "vw";
            else {
                coordinates.x = parent.xTransform + 2 * e.diameter + "vw";
            }
            coordinates.y = parent.yTransform + "vh";
            await e.translate(coordinates.x, coordinates.y, true);
            //await pause(); //for debugging purposes 
            await this.compareTransform(e, rank);
            console.log(`prepareNextCompare Promise Resolved`);
            resolve(true);

        });
    }

    async assign(e: InstanceType<typeof BinarySearchTree.TreeElement>, rank: number) {
        return new Promise(async (resolve) => {
            console.log(`assign Promise Opened`);
            let nodes = this.arr;
            //console.log(`Inside Move function. Trying to move ${e.key} to rank ${rank}`)
            let depth = Math.floor(Math.log2(rank + 1));
            let parentRank = Math.floor((rank - 1) / 2);
            let parent = nodes[parentRank];
            let translateInfo : {x: string, y: string} = {
                x: "",
                y: ""
            };
            let offset = (98) / 2 ** (depth + 1);
            if (parent.key > e.key) {
                translateInfo.x = parent.xTransform - offset + "vw";
            }
            else {
                translateInfo.x = parent.xTransform + offset + "vw";
            }
            translateInfo.y = parent.yTransform + Math.sin(Math.PI / 4) * 10 + "vh";
            await e.translate(translateInfo.x, translateInfo.y, true);
            await e.borderCol("rgb(37, 201, 37)", true);
            e.dom.title = `Rank: ${rank}`;
            await this.connectTransform(rank, parentRank);

            e.removeClass("transform");
            console.log(`assign Promise Resolved`);
            resolve(true);
        });
    }

    async connectTransform(rank: number, parentRank: number) {
        console.log(`connectTransform Promise Opened`);
        return new Promise((resolve) => {
            let e = this.arr[rank];
            let parent = this.arr[parentRank];
            this.connections.push(new BinarySearchTree.Connection(e, parent));
            console.log(`connectTransform Promise Resolved`);
            resolve(true);
        });
    }

    async removeKey(key: number) : Promise<Boolean | String>{
        return new Promise((resolve) =>{
            let rank = this.rankOf(key);
            if(rank > -1){
                if(this.arr[rank*2+1]){
                    //resolve("Hardest case scenario");
                }
                else{
                    //resolve("Easiest case scenario");
                }
            }
            else{
                resolve(`The key '${key}' is not in the binary search Tree`);
            }
        });
        
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
                this.arr[0].dom.remove();
            }
        }
        this.connections = [];
        this.arr = [];
        this.size = 0;
    }

    rankOf(key:number) : number{
        let rank = 0;
        let max = (2 ** (2 + Math.floor(Math.log2(this.arr.length)))); //where the exponent corresponds to the depth
        while (rank < max) {
            try {
                if (key == this.arr[rank].key) {
                    return rank;
                }
                else {
                    if (key < this.arr[rank].key) {
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

    async trasversal(root: number, mode: string) : Promise<number[]> {
        let nodes = this.arr;
        let trasverse = [];
        let arrow = document.createElement("span");
        arrow.classList.add("trasverser");
        arrow.innerHTML = "↑";
        document.body.append(arrow);
        arrow.offsetHeight; //reflow stuff
        //let output = document.getTreeElementById("output");
        let original = root;

        let setupTrasversal = function (root: number) { //sets all the children to red (unvisited)
            if (nodes[root * 2 + 1])
                setupTrasversal(root * 2 + 1);
            nodes[root].borderColor = 'red';

            if (nodes[root * 2 + 2])
                setupTrasversal(root * 2 + 2);
            return;
        }
        setupTrasversal(root);


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
        const diameterVw = nodes[0].diameter;
        const diameterPx = diameterVw * vwToPx;
        const arrowWidthPx = arrow.getBoundingClientRect().width;
        const arrowOffsetVw = (arrowWidthPx / window.innerWidth) * 50;
        //const arrowOffsetVw = 0.75;     

        return new Promise(async (resolve, reject) => {
            switch (mode) {
                case "in-order":
                    let inOrder = async function (root: number) {
                        let target = nodes[root];
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });

                        await nodes[root].borderCol("orange", true); //visited but not added into the return value

                        let returnArr: number[] = [];

                        if (nodes[root * 2 + 1]) {
                            await inOrder(root * 2 + 1).then(function (result) {
                                returnArr = result;
                            });
                        }
                        await nodes[root].borderCol("rgb(37, 201, 37)", true);

                        returnArr.push(nodes[root].key);

                        if (nodes[root * 2 + 2]) {
                            await inOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }

                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit

                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes[Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes[Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            });
                        }

                        return returnArr;
                    }

                    inOrder(root).then(function (result) { //call the function and handle the result
                        //trasverse = result;

                        arrow.ontransitionend = async function () {
                            arrow.ontransitionend = null;
                            arrow.remove();
                        };
                        arrow.style.opacity = (0).toString();
                        resolve(result);
                    });


                    break;

                case "pre-order":
                    let preOrder = async function (root:number) {
                        let target = nodes[root];
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh

                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                            //arrow.style.transform = `translate(${target.xTransform + diameterVw/2 - 1.5}vw, ${target.yTransform + diameter}vh)`;
                        });

                        await nodes[root].borderCol("orange", true); //visited but not added into the return value
                        await nodes[root].borderCol("rgb(37, 201, 37)", true);
                        let returnArr = [nodes[root].key];
                        if (nodes[root * 2 + 1]) {
                            await preOrder(root * 2 + 1).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if (nodes[root * 2 + 2]) {
                            await preOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit

                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes[Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes[Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            });
                        }

                        return returnArr;
                    }
                    preOrder(root).then(function (result) { //call the function and handle the result
                        //trasverse = result;

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
                        let target = nodes[root];
                        const centerXvw = target.xTransform + diameterVw / 2;
                        const bottomYvh = target.yTransform + (diameterPx / vhToPx); // convert px to vh
                        await waitTransition(arrow, () => {
                            arrow.style.transform = `translate(${centerXvw - arrowOffsetVw}vw, ${bottomYvh}vh)`;
                        });
                        await nodes[root].borderCol("orange", true); //visited but not added into the return value
                        if (nodes[root * 2 + 1]) {
                            await postOrder(root * 2 + 1).then(function (result) {
                                returnArr = [...result];
                            });
                        }
                        if (nodes[root * 2 + 2]) {
                            await postOrder(root * 2 + 2).then(function (result) {
                                returnArr = [...returnArr, ...result];
                            });
                        }
                        await nodes[root].borderCol("rgb(37, 201, 37)", true);
                        returnArr.push(nodes[root].key);

                        if (root > original) { //this is needed for the arrow to go back to the parent that called this instance of the stack
                            //this is to emphasize that the parent will call another instance in case there is a right child to visit
                            await waitTransition(arrow, () => {
                                arrow.style.transform = `translate(${nodes[Math.floor((root - 1) / 2)].xTransform + diameterVw / 2 - arrowOffsetVw}vw, ${nodes[Math.floor((root - 1) / 2)].yTransform + (diameterPx / vhToPx)}vh)`;
                            });
                        }

                        return returnArr;
                    }

                    postOrder(root).then(function (result) { //call the function and handle the result
                        //trasverse = result;

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

    onResize() {
        this.connections.forEach((line) => {
            line.draw(false);
        });
    }

    static Connection = class {
        dom: HTMLDivElement;
        child: InstanceType<typeof BinarySearchTree.TreeElement>;
        parent: InstanceType<typeof BinarySearchTree.TreeElement>;
        l!: string;
        constructor(child: InstanceType<typeof BinarySearchTree.TreeElement>, parent: InstanceType<typeof BinarySearchTree.TreeElement>) {
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
            let offsetXpx = (parent.diameter * (window.innerWidth / 100)) / 2;
            let offsetYpx = (parent.diameter * (window.innerHeight / 100)) / 2;
            let x = 100 * (parentXpx + offsetXpx) / window.innerWidth;
            let y = 100 * (parentYpx + offsetYpx) / window.innerHeight;
            const baseLengthPx = 100; // Matches your CSS .line width
            const scale = lengthInPx / baseLengthPx;
            if (appendToBody) {
                this.transform = `translate(${x}vw, ${y}vh) rotate(${angle}rad) scaleX(${0})`;
                document.body.append(this.dom);
            }
            this.dom.offsetHeight; //force reflow
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
        dom: HTMLDivElement;
        comparator: InstanceType<typeof BinarySearchTree.TreeElement.Comparator>;
    
        constructor(key: number) {
            this.key = key;
            this.dom = document.createElement("div");
            this.dom.classList.add("TreeElement");
            this.dom.innerHTML = key.toString();
            this.dom.style.backgroundColor = "#FFFFFF";
            this.dom.style.zIndex = (1).toString();
            this.opacity = 0;
            this.comparator = new BinarySearchTree.TreeElement.Comparator();
            this.dom.append(this.comparator.dom);
            document.body.append(this.dom);
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
    
        opac =  (value: number, synchronous:boolean) => { //for some weird reason js does not like a function whose name is opacity... maybe dom.style.opacity conflict?
            //let e = this ;
            return new Promise( (resolve) => {
                this.opacity = value;
                if (synchronous) {
                    this.dom.ontransitionend = function (e) {
                        this.ontransitionend = null;
                        resolve(e);
                    }
                }
                else
                    resolve(true);
            });
        }
    
        translate = (x:string, y:string, synchronous:boolean) => {
            //let e = this;
            this.dom.offsetHeight; //important for reflow
            return new Promise((resolve) => {
                this.transform = `translate(${x}, ${y})`;
                if (synchronous) {
                    this.dom.ontransitionend = function (e) {
                        this.ontransitionend = null;
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
                this.borderColor = `${value}`;
                if (synchronous) {
                    this.dom.ontransitionend = function (e) {
                        this.ontransitionend = null;
                        resolve(e);
                    }
                }
                else
                    resolve(true);
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