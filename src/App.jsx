import { useState, useRef, useEffect, useCallback } from "react";
import Node from "./Node";

export default function App() {
  const canvasRef = useRef(null);
  const rightPanelRef = useRef(null);

  /* ================= INITIAL WORKFLOW ================= */
  const initialWorkflow = {
    rootId: "start",
    nodes: {
      start: { id: "start", type: "start", label: "Start", children: [], notes: "" }
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
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [workflowName, setWorkflowName] = useState("My Workflow");
  const [showRightPanel, setShowRightPanel] = useState(false);

  /* ================= HELPERS ================= */
  const setWorkflow = useCallback((newWorkflow) => {
    setHistory(h => ({
      past: [...h.past, h.present],
      present: newWorkflow,
      future: []
    }));
  }, []);

 const addNode = useCallback((parentId, type, branchIndex = null) => {
  const id = crypto.randomUUID();
  const prev = history.present;
  const parent = prev.nodes[parentId];

  const newNode = { id, type, label: "...", children: [], notes: "" };

  let updatedParent = { ...parent };

  if (parent.type === "branch") {
    // Ensure branch always has two slots
    const children = [...(parent.children || [null, null])];
    const index = branchIndex ?? children.findIndex(c => c === null);
    if (index !== -1) children[index] = id;
    updatedParent.children = children;
  } else {
    updatedParent.children = [id];
  }

  // If the new node is a branch, initialize its children array
  if (type === "branch") newNode.children = [null, null];

  setWorkflow({
    ...prev,
    nodes: {
      ...prev.nodes,
      [id]: newNode,
      [parentId]: updatedParent
    }
  });
}, [history.present, setWorkflow]);


  const updateLabel = useCallback((id, label) => {
    const prev = history.present;
    setWorkflow({
      ...prev,
      nodes: {
        ...prev.nodes,
        [id]: { ...prev.nodes[id], label }
      }
    });
  }, [history.present, setWorkflow]);

  const updateNotes = useCallback((id, notes) => {
    const prev = history.present;
    setWorkflow({
      ...prev,
      nodes: {
        ...prev.nodes,
        [id]: { ...prev.nodes[id], notes }
      }
    });
  }, [history.present, setWorkflow]);

  const deleteNode = useCallback((id) => {
    if (!id || id === history.present.rootId) return;
    const prev = history.present;
    const nodes = { ...prev.nodes };

    const parent = Object.values(nodes).find(n =>
      n.children?.includes(id)
    );

    if (parent) {
      parent.children = parent.children.filter(c => c !== id);
    }

    delete nodes[id];
    setSelectedNodeId(null);
    setWorkflow({ ...prev, nodes });
  }, [history.present, setWorkflow]);

  const undo = useCallback(() => {
    setHistory(h => {
      if (!h.past.length) return h;
      return {
        past: h.past.slice(0, -1),
        present: h.past[h.past.length - 1],
        future: [h.present, ...h.future]
      };
    });
  }, []);

  const redo = useCallback(() => {
    setHistory(h => {
      if (!h.future.length) return h;
      return {
        past: [...h.past, h.present],
        present: h.future[0],
        future: h.future.slice(1)
      };
    });
  }, []);

  /* ================= KEYBOARD ================= */
  useEffect(() => {
    function onKeyDown(e) {
      if (!selectedNodeId) return;
      if (e.key === "Delete") deleteNode(selectedNodeId);

      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        undo();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "y") {
        e.preventDefault();
        redo();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [selectedNodeId, deleteNode, undo, redo]);

  /* ================= PAN & ZOOM ================= */
  function onMouseDown(e) {
    if (e.button !== 1) return;
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

  function onWheel(e) {
    e.preventDefault();
    setScale(prev =>
      Math.min(2, Math.max(0.5, prev - e.deltaY * 0.001))
    );
  }

  /* ================= SCROLL RIGHT PANEL ================= */
  const scrollRightPanel = (direction) => {
    if (!rightPanelRef.current) return;
    const panel = rightPanelRef.current;
    const scrollAmount = 80;
    panel.scrollBy({ top: direction === "up" ? -scrollAmount : scrollAmount, behavior: "smooth" });
  };

  /* ================= VALIDATION ================= */
  function validateWorkflow(workflow) {
    const warnings = [];
    if (!Object.values(workflow.nodes).some(n => n.type === "end")) {
      warnings.push("Workflow has no End node");
    }
    Object.values(workflow.nodes).forEach(n => {
      if (n.type === "branch" && (!n.children || n.children.filter(Boolean).length < 2)) {
        warnings.push("This workflow has an incomplete branch");
      }
    });
    return warnings;
  }

  /* ================= RENDER ================= */
  return (
    <div className="app-container">
      {/* Floating Workflow Name */}
      <div className="floating-name">{workflowName}</div>

      {/* Right Panel Toggle Button */}
      <button className="right-panel-toggle" onClick={() => setShowRightPanel(prev => !prev)}>
        ⚙
      </button>

      {/* Canvas */}
      <div
        ref={canvasRef}
        className="canvas"
        onWheel={onWheel}
        onMouseDown={onMouseDown}
        onClick={() => { setMenu(null); setSelectedNodeId(null); }}
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
  updateNotes={updateNotes}
  setMenu={setMenu}
  canvasRef={canvasRef}
  selectedNodeId={selectedNodeId}
  setSelectedNodeId={setSelectedNodeId}
        />

        {menu && (
          <div className="context-menu" style={{ top: menu.y, left: menu.x }}>
            <button onClick={() => addNode(menu.nodeId, "action")}>Add Action</button>
            <button onClick={() => addNode(menu.nodeId, "branch")}>Add Branch</button>
            <button onClick={() => deleteNode(menu.nodeId)}>Delete</button>
          </div>
        )}
      </div>

      {/* Right Panel */}
      <div className={`right-panel-floating ${showRightPanel ? "open" : ""}`} ref={rightPanelRef}>
        <h3>Workflow Settings</h3>

        {/* File Name */}
        <label className="field">
          File name
          <input
            value={workflowName}
            onChange={e => setWorkflowName(e.target.value)}
            placeholder="Enter workflow name"
          />
        </label>

        {/* Undo / Redo */}
        <div className="panel-actions">
          <button onClick={undo} title="Ctrl + Z">Undo</button>
          <button onClick={redo} title="Ctrl + Y">Redo</button>
        </div>

        {/* Export Button */}
        <button
          className="export"
          style={{ marginTop: "10px" }}
          onClick={() => {
            const data =
              "data:text/json;charset=utf-8," +
              encodeURIComponent(JSON.stringify({ name: workflowName, workflow: history.present }, null, 2));
            const a = document.createElement("a");
            a.href = data;
            a.download = `${workflowName || "workflow"}.json`;
            a.click();
          }}
        >
          Export Workflow
        </button>

        {/* About Section */}
        <div className="about">
          <h4>📘 About This Workflow Builder</h4>
          <p>This tool lets you visually design workflows with actions, branches, and end nodes. Each node can contain labels and notes.</p>

          <h5>🛠 How to Use</h5>
          <ol>
            <li>Click a node to select it. Selected nodes are highlighted.</li>
            <li>Right-click for Add Action, Add Branch, or Delete.</li>
            <li>Click the 📝 icon to toggle a notes section.</li>
            <li>Drag nodes to reposition them.</li>
            <li>Use Undo / Redo for changes.</li>
            <li>Click Export Workflow to download JSON.</li>
          </ol>

          <h5>💡 Tips</h5>
          <ul>
            <li>Keep branch nodes complete with True/False paths.</li>
            <li>Use descriptive labels and notes for clarity.</li>
            <li>Pan with middle mouse button; zoom with wheel.</li>
          </ul>
        </div>

        {/* Warnings */}
        <div className="panel-warnings">
          {validateWorkflow(history.present).map(w => (
            <div key={w} className="warning">⚠ {w}</div>
          ))}
        </div>

        {/* Scroll Buttons */}
        <div className="scroll-buttons">
          <button onClick={() => scrollRightPanel("up")} className="scroll-up">▲</button>
          <button onClick={() => scrollRightPanel("down")} className="scroll-down">▼</button>
        </div>
      </div>
    </div>
  );
}
