import { useState, useRef } from "react";
import Node from "./Node";

export default function App() {
  const canvasRef = useRef(null);

  // SAFELY parse localStorage
  let savedWorkflow = null;
  try {
    savedWorkflow = JSON.parse(localStorage.getItem("workflow") || "null");
  } catch  {
    savedWorkflow = null;
  }

  const initialWorkflow = savedWorkflow || {
    rootId: "start",
    nodes: {
      start: { id: "start", type: "start", label: "Start", children: [] }
    }
  };

  const [history, setHistory] = useState({
    past: [],
    present: initialWorkflow,
    future: []
  });

  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [menu, setMenu] = useState(null);

  function setWorkflow(newWorkflow) {
    setHistory(h => ({
      past: [...h.past, h.present],
      present: newWorkflow,
      future: []
    }));
  }

  // PAN
  function onMouseDown(e) {
    if (e.button !== 1) return; // middle button only
    let startX = e.clientX;
    let startY = e.clientY;

    function move(ev) {
      setOffset(prev => ({
        x: prev.x + ev.clientX - startX,
        y: prev.y + ev.clientY - startY
      }));
      startX = ev.clientX;
      startY = ev.clientY;
    }

    function up() {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }

    window.addEventListener("mousemove", move);
    window.addEventListener("mouseup", up);
  }

  // ZOOM
  function onWheel(e) {
    e.preventDefault();
    setScale(prev => Math.min(2, Math.max(0.5, prev - e.deltaY * 0.001)));
  }

  // ADD NODE
  function addNode(parentId, type, branchIndex = null) {
    const id = crypto.randomUUID();
    const prev = history.present;
    const parent = prev.nodes[parentId];

    const newNode = {
      id,
      type,
      label: "...",
      children: [],
      position: { x: 0, y: 0 }
    };

    let updatedParent = { ...parent };

    if (parent.type === "branch") {
      const updatedChildren = parent.children ? [...parent.children] : [null, null];
      if (branchIndex !== null) updatedChildren[branchIndex] = id;
      else {
        const emptyIndex = updatedChildren.findIndex(c => c === null);
        if (emptyIndex !== -1) updatedChildren[emptyIndex] = id;
        else updatedChildren.push(id);
      }
      updatedParent.children = updatedChildren;
    } else {
      updatedParent.children = [id];
    }

    const updatedWorkflow = {
      ...prev,
      nodes: {
        ...prev.nodes,
        [id]: newNode,
        [parentId]: updatedParent
      }
    };

    setWorkflow(updatedWorkflow);
  }

  // UPDATE LABEL
  function updateLabel(id, label) {
    const prev = history.present;
    const updatedWorkflow = {
      ...prev,
      nodes: {
        ...prev.nodes,
        [id]: { ...prev.nodes[id], label }
      }
    };
    setWorkflow(updatedWorkflow);
  }

  // DELETE NODE
  function deleteNode(id) {
    const prev = history.present;
    const nodes = { ...prev.nodes };
    const target = nodes[id];
    const parent = Object.values(nodes).find(n => n.children?.includes(id));
    if (parent) {
      parent.children = parent.children.flatMap(child =>
        child === id ? target.children || [] : child
      );
    }
    delete nodes[id];
    setWorkflow({ ...prev, nodes });
  }

  return (
    <div
      ref={canvasRef}
      className="canvas"
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onClick={() => setMenu(null)}
      style={{
        transform: `translate(${offset.x}px, ${offset.y}px) scale(${scale})`,
        transformOrigin: "0 0"
      }}
    >
      <Node
        nodeId={history.present.rootId}
        nodes={history.present.nodes}
        addNode={addNode}
        deleteNode={deleteNode}
        updateLabel={updateLabel}
        setMenu={setMenu}
        canvasRef={canvasRef}
      />

      {menu && (
        <div
          className="context-menu"
          style={{ top: `${menu.y}px`, left: `${menu.x}px` }}
          onClick={e => e.stopPropagation()}
        >
          <button onClick={() => { addNode(menu.nodeId, "action"); setMenu(null); }}>Add Action</button>
          <button onClick={() => { addNode(menu.nodeId, "branch"); setMenu(null); }}>Add Branch</button>
          <button onClick={() => { deleteNode(menu.nodeId); setMenu(null); }}>Delete</button>
        </div>
      )}

      <div className="controls">
        <button
          onClick={() =>
            setHistory(h => {
              if (!h.past.length) return h;
              const previous = h.past[h.past.length - 1];
              return {
                past: h.past.slice(0, -1),
                present: previous,
                future: [h.present, ...h.future]
              };
            })
          }
        >
          Undo
        </button>
        <button
          onClick={() =>
            setHistory(h => {
              if (!h.future.length) return h;
              return {
                past: [...h.past, h.present],
                present: h.future[0],
                future: h.future.slice(1)
              };
            })
          }
        >
          Redo
        </button>
        <button className="save"
          onClick={() => {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(history.present, null, 2));
            const dlAnchor = document.createElement("a");
            dlAnchor.setAttribute("href", dataStr);
            dlAnchor.setAttribute("download", "workflow.json");
            document.body.appendChild(dlAnchor);
            dlAnchor.click();
            dlAnchor.remove();
          }}
        >
          Save Workflow
        </button>
      </div>
    </div>
  );
}
