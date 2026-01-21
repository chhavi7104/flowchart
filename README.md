# workflow_builder_UI-emitrr
# Workflow Builder UI

This project is a simple visual workflow builder built using **React functional components and hooks**.  
The goal was to design and implement an interactive UI that allows users to create and manage a workflow made up of different types of steps, **without relying on any external workflow or diagram libraries**.

This assignment focuses on how complex UI state can be modeled and managed in a clean and scalable way using core React concepts.

## documentation link 
*https://docs.google.com/document/d/1EBooJf5z4wCeoOjkfa914ZGdFwGRuDJL/edit?usp=sharing&ouid=107116551354340855231&rtpof=true&sd=true*

---

## Live Demo & Source Code

- **Live Demo:**
- Vercel CLI 50.1.3
- 🔍  Inspect: *(https://vercel.com/chhavis-projects-77b45af6/workflow-builder-ui-emitrr/Dr1Vim19qaCgrPnuapR2t7CCHFCP)*
- ✅  Production: *(https://workflow-builder-ui-emitrr-dr91hp5dg-chhavis-projects-77b45af6.vercel.app)*
- 🔗  Aliased: *(https://workflow-builder-ui-emitrr.vercel.app)* 

- **Source Code:** *((https://github.com/chhavi7104/workflow_builder_UI-emitrr))*

---

## Technologies Used

- React (with Hooks)
- JavaScript
- Plain CSS
- SVG (for drawing connections)

---

## Constraints Followed

- No UI libraries (Material UI, Chakra, etc.)
- No diagramming or workflow libraries
- No animation libraries

---

## What the Application Does

- Displays a workflow canvas that starts with a single **Start** node
- Allows users to add different types of nodes:
  - **Action** – a single step in the flow
  - **Branch** – a conditional step with multiple paths
  - **End** – the final step of the workflow
- Shows clear visual connections between nodes
- Organizes nodes in a readable tree-style layout
- Allows editing node titles directly in the UI

---

## Features Implemented

### Core Functionality

- Add nodes after any valid step
- Delete nodes while keeping the workflow connected
- Edit node labels inline
- Visual connectors between parent and child nodes
- Different visual styles for each node type
- Rounded cards with gradient backgrounds

### Additional Enhancements

- Drag and reposition nodes on the canvas
- Zoom in and out using the mouse wheel
- Pan the canvas to explore larger workflows
- Undo and redo workflow changes
- Right-click context menu for quick node actions
- Save button that outputs the workflow structure to the console
- Hover effects and small icons to improve clarity

---

## Data Structure

The workflow is stored as a **tree-like JavaScript object**.  
Each node contains its own metadata and references to its children.


### Component Structure
```bash
  src/
    ├── App.jsx        // Manages workflow state and canvas behavior
    ├── Node.jsx       // Renders individual nodes and handles interactions
    ├── Connector.jsx // Draws SVG connections between nodes
    ├── styles.css    // Styling and visual effects
    └── main.jsx      // Application entry point
```

### Component Responsibilities

 ###App.jsx
- Handles the overall workflow state
- Manages zoom, pan, and undo/redo logic

 ### Node.jsx
- Recursive component that renders a node and its children
- Handles drag, edit, delete, and context menu actions

### Connector.jsx

- Responsible for drawing curved SVG lines between nodes

### Design Approach

- The workflow is treated as a tree rather than a graph to keep the logic simple and predictable

- SVG was chosen for drawing connections because it integrates well with React and performs efficiently

- Drag and zoom interactions were implemented using native browser events to avoid external dependencies

- The UI design is intentionally minimal and focused on clarity rather than heavy animations


## Running the Project Locally
```bash
npm install
npm run dev
```
#### Final Notes

This project was a good exercise in building a non-trivial interactive UI using only core frontend tools.
It demonstrates how recursive rendering, structured state management, and user interactions can be handled effectively in React without relying on external libraries.
