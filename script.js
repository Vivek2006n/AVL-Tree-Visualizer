//AVL TREE LOGIC
class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.height = 1;
    }
}

class AVLTree {
    constructor() {
        this.root = null;
    }

    getHeight(node) {
        return node ? node.height : 0;
    }

    getBalance(node) {
        return node ? this.getHeight(node.left) - this.getHeight(node.right) : 0;
    }

    rightRotate(y) {
        const x = y.left;
        const T2 = x.right;


        x.right = y;
        y.left = T2;


        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;
        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;

        return x;
    }

    leftRotate(x) {
        const y = x.right;
        const T2 = y.left;


        y.left = x;
        x.right = T2;


        x.height = Math.max(this.getHeight(x.left), this.getHeight(x.right)) + 1;
        y.height = Math.max(this.getHeight(y.left), this.getHeight(y.right)) + 1;

        return y;
    }

    insertNode(node, value) {
        if (!node) return new Node(value);
        if (value < node.value) {
            node.left = this.insertNode(node.left, value);
        } else if (value > node.value) {
            node.right = this.insertNode(node.right, value);
        } else {
            console.log(`Duplicate value "${value}" not allowed in AVL Tree.`);
            return node; // Return unchanged node if duplicate is found
        }

        // Update height 
        node.height = 1 + Math.max(this.getHeight(node.left), this.getHeight(node.right));

        // Get balance factor
        const balance = this.getBalance(node);

        if (balance > 1 && value < node.left.value) return this.rightRotate(node);  // LL Case
        if (balance < -1 && value > node.right.value) return this.leftRotate(node); // RR Case
        if (balance > 1 && value > node.left.value) {                               // LR Case
            node.left = this.leftRotate(node.left);
            return this.rightRotate(node);
        }
        if (balance < -1 && value < node.right.value) {                             // RL Case
            node.right = this.rightRotate(node.right);
            return this.leftRotate(node);
        }

        return node;
    }

    insert(value) {
        this.root = this.insertNode(this.root, value);
    }

    toJSON() {
        return this._nodeToJSON(this.root);
    }

    _nodeToJSON(node) {
        if (!node) return null;
        let json = {
            name: node.value.toString(),
            balance: this.getBalance(node),
            height: node.height
        };
        json.children = [];
        if (node.left) json.children.push(this._nodeToJSON(node.left));
        if (node.right) json.children.push(this._nodeToJSON(node.right));
        if (json.children.length === 0) delete json.children;
        return json;
    }
}


//VISUALIZATION WITH D3 
const avl = new AVLTree();
const svg = d3.select("svg");
const width = +svg.attr("width");
const height = +svg.attr("height");

const treeLayout = d3.tree().size([width - 80, height - 80]);

const tooltip = d3.select("#tooltip");


let g = svg.select("g");
if (g.empty()) {
    g = svg.append("g").attr("transform", "translate(40,40)");
}

function update(source) {
    let root = d3.hierarchy(source);
    treeLayout(root);


    const t = d3.transition().duration(750);


    const nodes = g.selectAll(".node")
        .data(root.descendants(), d => d.data.name + "_" + d.depth);


    const nodeEnter = nodes.enter().append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x},${d.y})`)
        .on("mouseover", (event, d) => {
            tooltip.transition().duration(200).style("opacity", 0.9);
            tooltip.html("Balance Factor: " + d.data.balance)
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mousemove", (event) => {
            tooltip.style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", () => {
            tooltip.transition().duration(200).style("opacity", 0);
        });

    nodeEnter.append("circle")
        .attr("r", 20);

    nodeEnter.append("text")
        .attr("dy", 5)
        .attr("text-anchor", "middle")
        .text(d => d.data.name);


    const nodeUpdate = nodeEnter.merge(nodes);
    nodeUpdate.transition(t)
        .attr("transform", d => `translate(${d.x},${d.y})`);


    nodes.exit().remove();


    const links = g.selectAll(".link")
        .data(root.links(), d => d.source.data.name + "_" + d.target.data.name);


    const linkEnter = links.enter().append("path")
        .attr("class", "link")
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );


    linkEnter.merge(links)
        .transition(t)
        .attr("d", d3.linkVertical()
            .x(d => d.x)
            .y(d => d.y)
        );

    links.exit().remove();
}

//USER INTERACTION 
document.getElementById("insertBtn").addEventListener("click", function () {
    const input = document.getElementById("numberInput");
    const value = parseInt(input.value);
    if (!isNaN(value)) {
        avl.insert(value);
        update(avl.toJSON());
        input.value = "";
    }
});

document.getElementById("numberInput").addEventListener("keypress", function (e) {
    if (e.key === "Enter") {
        document.getElementById("insertBtn").click();
    }
});
