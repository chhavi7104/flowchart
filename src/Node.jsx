import { useState } from "react";
import Connector from "./Connector";

export default function Node({
  nodeId,
  nodes,
  addNode,
  deleteNode,
  updateLabel,
  setMenu,
  canvasRef,
  selectedNodeId,
  setSelectedNodeId
}) {
  const [showNotes, setShowNotes] = useState(false);
  const node = nodes[nodeId];
  if (!node) return null;

  return (
    <div className="node-wrapper">
      <div
        className={`node ${node.type} ${selectedNodeId === node.id ? "selected" : ""}`}
        data-node-id={node.id}
        onClick={(e) => { 
          e.stopPropagation();
          setSelectedNodeId(node.id);
        }}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
          setMenu?.({ x: e.clientX, y: e.clientY, nodeId: node.id });
        }}
      >
        {/* Node Icon */}
        <span className="node-icon">
          {node.type === "start" && "▶"}
          {node.type === "action" && "⚡"}
          {node.type === "branch" && "◆"}
          {node.type === "end" && "■"}
        </span>

        {/* Node Label */}
        <div
          className="node-label"
          contentEditable
          suppressContentEditableWarning
          onBlur={e => updateLabel(node.id, e.target.innerText, "label")}
        >
          {node.label}
        </div>

        {/* Node Buttons */}
        <div className="buttons">
          {/* Add Nodes */}
          {node.type !== "end" && node.type !== "branch" && (
            <>
              <button
                className="add-action"
                title="Add Action Node"
                onClick={() => addNode(node.id, "action")}
              >＋</button>

              <button
                className="add-branch"
                title="Add Branch Node"
                onClick={() => addNode(node.id, "branch")}
              >◇</button>

              <button
                className="add-end"
                title="Add End Node"
                onClick={() => addNode(node.id, "end")}
              >■</button>
            </>
          )}

          {/* Delete Button */}
          {node.type !== "start" && (
            <button
              className="delete"
              title="Delete Node"
              onClick={() => deleteNode(node.id)}
            >✕</button>
          )}

          {/* Notes Toggle */}
          <button
            className={`notes-toggle ${showNotes ? "active" : ""}`}
            title="Toggle Notes"
            onClick={() => setShowNotes(prev => !prev)}
          >📝</button>
        </div>

        {/* Notes Section */}
        {showNotes && (
          <textarea
            className="node-notes"
            placeholder="Add notes..."
            value={node.notes || ""}
            onChange={(e) => updateLabel(node.id, e.target.value, "notes")}
          />
        )}
      </div>

      {/* Connectors to Children */}
      {node.children?.map(childId => 
        childId ? <Connector key={childId} fromId={node.id} toId={childId} canvasRef={canvasRef} /> : null
      )}

      {/* Branch Nodes */}
      {node.type === "branch" && (
  <div className="branch-container">
    {["True", "False"].map((label, index) => {
      const childId = node.children?.[index] ?? null; // ensures null if undefined
      return (
        <div key={label} className="branch">
          <span className="branch-label">{label}</span>
          {childId ? (
            <Node
              nodeId={childId}
              nodes={nodes}
              addNode={addNode}
              deleteNode={deleteNode}
              updateLabel={updateLabel}
              setMenu={setMenu}
              canvasRef={canvasRef}
              selectedNodeId={selectedNodeId}
              setSelectedNodeId={setSelectedNodeId}
            />
          ) : (
            <button
              className="add-branch"
              onClick={() => addNode(node.id, "action", index)}
            >
              + Add Step
            </button>
          )}
        </div>
      );
    })}
  </div>
)}


      {/* Single Child for Non-Branch Nodes */}
      {node.type !== "branch" && node.children?.[0] && (
        <Node
          nodeId={node.children[0]}
          nodes={nodes}
          addNode={addNode}
          deleteNode={deleteNode}
          updateLabel={updateLabel}
          setMenu={setMenu}
          canvasRef={canvasRef}
          selectedNodeId={selectedNodeId}
          setSelectedNodeId={setSelectedNodeId}
        />
      )}
    </div>
  );
}
