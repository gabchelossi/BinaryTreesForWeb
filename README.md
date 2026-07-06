# BinaryTreesForWeb

A browser-based **Binary Search Tree (BST) and AVL Tree visualizer** built with **HTML, CSS, and TypeScript**.

This project lets users interactively insert, remove, search, traverse, inspect, and rebalance tree structures while seeing how the tree is represented internally. It is designed as an educational tool for understanding Binary Search Trees, array-backed tree representations, AVL balancing, and the space-cost difference between balanced and unbalanced trees.

---

## Table of Contents

- [Project Overview](#project-overview)
- [What This Project Demonstrates](#what-this-project-demonstrates)
- [Core Features](#core-features)
- [Binary Search Tree Representation](#binary-search-tree-representation)
- [AVL Tree Mode](#avl-tree-mode)
- [Animation System](#animation-system)
- [Control Panel](#control-panel)
- [Terminal / Command Interface](#terminal--command-interface)
- [Available Commands](#available-commands)
  - [Insertion](#insertion)
  - [Removal](#removal)
  - [Search](#search)
  - [Traversal](#traversal)
  - [AVL Commands](#avl-commands)
  - [Animation Commands](#animation-commands)
  - [Display Commands](#display-commands)
  - [Utility Commands](#utility-commands)
- [Example Workflows](#example-workflows)
- [Technical Notes](#technical-notes)
- [Project Structure](#project-structure)
- [Running the Project Locally](#running-the-project-locally)
- [Educational Purpose](#educational-purpose)
- [Known Design Choices](#known-design-choices)
- [Credits](#credits)

---

## Project Overview

**BinaryTreesForWeb** is an interactive web application that visualizes Binary Search Trees and AVL Trees.

It was built to make tree-based abstract data types easier to understand by showing both:

1. the **visual tree structure**, and  
2. the **underlying array representation** used internally by the program.

Unlike many BST visualizers that use only pointer-style node references, this project intentionally represents the tree using an array. This is useful because it makes the space inefficiency of unbalanced Binary Search Trees highly visible.

For a node stored at rank/index `i`:

```text
left child  = 2*i + 1
right child = 2*i + 2
parent      = floor((i - 1) / 2)
```

This representation is simple, but it can become very inefficient when the tree is badly unbalanced. AVL mode addresses that by automatically rotating and rebalancing the tree.

---

## What This Project Demonstrates

This visualizer demonstrates:

- standard Binary Search Tree insertion;
- standard Binary Search Tree deletion;
- search path visualization;
- in-order, pre-order, and post-order traversals;
- array-backed tree indexing;
- sparse array behavior for unbalanced trees;
- AVL height/balance metadata;
- AVL rotations;
- insertion-induced rebalancing;
- deletion-induced rebalancing;
- automatic and manual animation modes;
- empty-node visualization;
- command-line style interaction through a custom terminal.

The application is meant to be used as a learning and debugging tool for data structures.

---

## Core Features

### Binary Search Tree Operations

The project supports the main BST operations:

- insert one or more keys;
- remove keys;
- search for keys;
- traverse the tree;
- reset the tree;
- inspect the internal array.

### AVL Tree Operations

AVL mode can be toggled on and off.

When AVL mode is enabled, the tree automatically keeps itself balanced after insertions and removals. The visualizer supports the standard AVL rotation cases:

- LL rotation;
- RR rotation;
- LR rotation;
- RL rotation.

### Interactive Visualization

Nodes and connections are rendered directly in the browser. Operations can be animated so that users can observe how keys move through the structure.

### Terminal-Like Command Interface

The application includes a custom terminal interface. Users can type commands such as:

```text
insert 50 30 70
search 30
remove 50
traverse in-order
set avl on
show array true
```

The terminal is not a real shell; it is a custom command parser for interacting with the visualizer.

---

## Binary Search Tree Representation

The tree is represented using an array.

The root is stored at rank `0`.

For any node at rank `i`:

```text
left child  = 2*i + 1
right child = 2*i + 2
```

Example:

```text
insert 15 10 20
```

Produces:

```text
rank 0: 15
rank 1: 10
rank 2: 20
```

A more unbalanced insertion sequence such as:

```text
insert 1 2 3 4 5
```

creates a right-heavy tree. In array form, the ranks grow quickly:

```text
rank 0: 1
rank 2: 2
rank 6: 3
rank 14: 4
rank 30: 5
```

This is one of the main educational goals of the project: to show why unbalanced BSTs can become inefficient, especially when represented with array-style indexing.

---

## AVL Tree Mode

AVL mode can be enabled with:

```text
set avl on
```

and disabled with:

```text
set avl off
```

An AVL Tree is a self-balancing Binary Search Tree. For every node, the height difference between the left and right subtrees must remain within an acceptable range.

This project tracks AVL-related metadata on nodes, including subtree height information and balance information. When an operation causes imbalance, the visualizer performs rotations to restore balance.

### AVL Rotations

The visualizer supports:

| Rotation Case | Description |
|---|---|
| LL | Left-left imbalance |
| RR | Right-right imbalance |
| LR | Left-right imbalance |
| RL | Right-left imbalance |

AVL mode is useful for comparing:

- how a regular BST behaves with sorted or nearly sorted input;
- how an AVL tree keeps the height logarithmic through rotations.

---

## Animation System

The visualizer supports multiple animation modes.

### Automatic Animation

```text
set animation on
```

Operations are animated automatically.

### Animation Off

```text
set animation off
```

Operations execute immediately without visual animation.

### Manual / Step-by-Step Animation

```text
set animation manual
```

Operations pause between animation steps. The next-step action is controlled through the visual interface button, not through a user-entered command.

### Animation Speed

```text
set animation speed 1
set animation speed 2
set animation speed 3
set animation speed 4
set animation speed 5
```

The speed must be an integer between `1` and `5`.

Higher values make the animation faster.

---

## Control Panel

The control panel provides a graphical interface for common actions.

It includes:

- a key input field;
- Add, Delete, and Search buttons;
- traversal controls;
- animation mode radio buttons;
- AVL toggle;
- empty-node toggle;
- animation speed slider;
- reset button;
- terminal output area.

The project can be used either through the buttons or through terminal commands.

---

## Terminal / Command Interface

The terminal accepts commands in a shell-like format.

Example:

```text
guest@gchelossi-dev.com: insert 50 30 70
```

The command parser interprets the first word as the command name and the remaining words as parameters.

Example:

```text
insert 50 30 70
```

Command:

```text
insert
```

Parameters:

```text
50 30 70
```

---

## Available Commands

### Insertion

#### Insert a single key

```text
insert [value]
```

Example:

```text
insert 42
```

Inserts `42` into the tree.

---

#### Insert multiple keys

```text
insert [v1] [v2] [v3] ...
```

Example:

```text
insert 50 30 70 20 40 60 80
```

Keys are inserted in the order given.

---

#### Insert a predefined full test tree

```text
insert full
```

Clears the current tree and inserts a predefined test tree. This is useful for quickly generating a larger example.

---

#### Insert random keys

```text
insert random
```

Inserts 20 unique random keys between `0` and `99`.

The median of the range is inserted first so the initial root is centered.

---

#### Insert random keys with maximum value

```text
insert random [max]
```

Example:

```text
insert random 200
```

Inserts 20 unique random keys between `0` and `200`.

---

#### Insert random keys with minimum and maximum values

```text
insert random [min] [max]
```

Example:

```text
insert random 10 80
```

Inserts 20 unique random keys between `10` and `80`.

---

#### Insert a specific number of random keys

```text
insert random [min] [max] [count]
```

Example:

```text
insert random 10 80 30
```

Inserts 30 unique random keys between `10` and `80`.

The requested count cannot be larger than the size of the range.

---

### Removal

```text
remove [value]
```

Example:

```text
remove 42
```

Removes the key if it exists.

The removal implementation handles standard BST deletion cases:

- deleting a leaf;
- deleting a node with one child;
- deleting a node with two children;
- deleting the root.

When AVL mode is active, removal may also trigger AVL rebalancing.

---

### Search

```text
search [value]
```

Example:

```text
search 30
```

Searches for the key and returns its rank in the internal array representation.

If animations are enabled, the search path is highlighted visually.

---

### Traversal

The visualizer supports three traversal modes.

#### In-order traversal

```text
traverse in-order
```

or:

```text
traverse inorder
```

Visits nodes in sorted order:

```text
left subtree -> root -> right subtree
```

---

#### Pre-order traversal

```text
traverse pre-order
```

or:

```text
traverse preorder
```

Visits nodes in this order:

```text
root -> left subtree -> right subtree
```

---

#### Post-order traversal

```text
traverse post-order
```

or:

```text
traverse postorder
```

Visits nodes in this order:

```text
left subtree -> right subtree -> root
```

---

### AVL Commands

#### Enable AVL mode

```text
set avl on
```

Activates AVL mode.

Future insertions and removals automatically rebalance the tree.

If the current tree already contains nodes, enabling AVL mode rebuilds the tree using AVL insertion rules.

---

#### Disable AVL mode

```text
set avl off
```

Disables AVL mode.

Future insertions behave like a regular Binary Search Tree.

---

### Animation Commands

#### Enable automatic animation

```text
set animation on
```

Operations are animated automatically.

---

#### Disable animation

```text
set animation off
```

Operations execute immediately.

---

#### Enable manual animation

```text
set animation manual
```

Enables step-by-step animation mode.

In this mode, the visualizer pauses between important animation steps. The user advances through the operation using the animation control button in the interface.

---

#### Set animation speed

```text
set animation speed [1-5]
```

Example:

```text
set animation speed 3
```

Sets the animation speed. The speed must be an integer between `1` and `5`.

---

#### Pause animation

```text
pause
```

Pauses the animation system.

---

#### Resume animation

```text
play
```

Resumes the animation system.

---

### Display Commands

#### Show the internal array

```text
show array
```

Displays the internal array representation of the tree, showing only real initialized nodes.

---

#### Show the full internal array

```text
show array true
```

Displays the full internal array, including empty slots.

Ranks are shown alongside keys. This is useful for seeing how sparse the array becomes when the tree is unbalanced.

---

#### Show empty visual nodes

```text
show empty on
```

Displays uninitialized child positions as visual empty nodes.

This helps users see where future insertions would be placed.

---

#### Hide empty visual nodes

```text
show empty off
```

Hides the empty visual nodes.

---

#### Show command-specific display help

```text
show help
```

Displays help for the `show` command.

---

### Utility Commands

#### Get an equivalent insertion command

```text
equivalent
```

Returns an `insert ...` command containing the currently stored keys.

This can be useful for reproducing the current tree.

---

#### Reset the tree

```text
reset
```

Clears the tree and removes all nodes and connections.

---

#### Clear the terminal output

```text
clear
```

Clears the terminal output.

---

#### Show credits

```text
credits
```

Displays developer contact information.

---

#### General help

```text
help
```

Displays help information inside the terminal.

---

### Fake Shell Commands

The terminal resembles a Linux shell, but it is not a real shell.

The following commands are intentionally handled as placeholders/jokes:

```text
ls
pwd
chmod
su
cd
echo
exit
```

They do not interact with the operating system.

---

## Example Workflows

### Build a regular BST

```text
set avl off
insert 50 30 70 20 40 60 80
show array true
traverse in-order
```

---

### Build an AVL Tree

```text
set avl on
insert 50 30 70 20 40 60 80
show array
```

---

### Compare unbalanced BST behavior

```text
set avl off
insert 1 2 3 4 5 6 7 8 9
show array true
```

This demonstrates how a regular BST can become highly unbalanced.

---

### Compare AVL behavior

```text
reset
set avl on
insert 1 2 3 4 5 6 7 8 9
show array true
```

This demonstrates how AVL mode keeps the tree balanced.

---

### Use random input

```text
reset
set avl on
insert random 0 100 25
traverse in-order
```

---

### Use manual animation

```text
set animation manual
insert 30 20 10
```

Then use the animation control button in the interface to advance through the operation step by step.

---

## Technical Notes

### Frontend Stack

This project uses:

- HTML;
- CSS;
- TypeScript;
- browser DOM manipulation;
- CSS transitions;
- custom command parsing;
- SVG/DOM-based visual connections.

### Array-Backed Tree Storage

The internal structure uses an array rather than a pointer-based object tree.

This makes it easy to expose the rank/index of each node, but it also highlights the space cost of unbalanced trees.

### Empty Nodes

Empty nodes are visual placeholders for uninitialized array positions.

They are not real keys. They are used only to show possible future insertion positions.

### Sparse Arrays

Because the tree is represented as an array, deleting nodes and inserting unbalanced sequences can leave empty positions. The visualizer exposes this behavior through:

```text
show array true
```

and:

```text
show empty on
```

---

## Project Structure

A simplified project structure:

```text
BinaryTreesForWeb/
├── public/
│   ├── index.html
│   ├── styles/
│   │   └── main.css
│   └── js/
│       └── gui.js
├── src/
│   └── TypeScript source files
├── tsconfig.json
├── README.md
└── LICENSE
```

The `public` directory contains the files served by the browser. The `src` directory contains the TypeScript source code.

---

## Running the Project Locally

This is a frontend web project. It can be run with any static file server.

One simple option is Python's built-in HTTP server:

```bash
python -m http.server 8000
```

Then open:

```text
http://127.0.0.1:8000/public/
```

If you modify the TypeScript source files, compile them before refreshing the browser.

Depending on your local setup, this may be done with:

```bash
npx tsc
```

or with your configured TypeScript build command.

---

## Educational Purpose

This project is mainly intended for students learning:

- Binary Search Trees;
- AVL Trees;
- recursion;
- tree traversal;
- array-based tree indexing;
- algorithm visualization;
- time complexity;
- space complexity;
- DOM animation;
- TypeScript-based frontend programming.

The visual representation is especially useful for understanding why balancing matters. A normal BST can degrade toward a linked-list-like shape, while an AVL Tree keeps operations closer to logarithmic height.

---

## Known Design Choices

### Array Representation Is Intentional

Most real-world BST implementations use object references or pointers. This project intentionally uses an array representation to make rank positions and space usage visible.

### Terminal Is Custom

The terminal is a custom interface inside the webpage. It is not a real Linux shell.

### AVL Conversion Rebuilds the Tree

When AVL mode is activated on an existing tree, the visualizer rebuilds the tree from the existing keys using AVL insertion behavior.

### Empty Nodes Are Visual Aids

Empty nodes help explain where future insertions would go. They are not part of the logical key set of the tree.

---

## Credits

Created by **G. Chelossi**.

For questions, feedback, suggestions, or bug reports:

- Email: [contact@gchelossi-dev.com](mailto:contact@gchelossi-dev.com)
- Website: [https://gchelossi-dev.com](https://gchelossi-dev.com)

---

## License

See the repository's `LICENSE` file for licensing information.
