import Connector from "./Connector"; // FIXED: match filename

export default function Node({
  nodeId,
  nodes,
  addNode,
  deleteNode,
  updateLabel,
  setMenu,
  canvasRef
}) {
  const node = nodes[nodeId];
  if (!node) return null;

  return (
    <div className="node-wrapper">
      <div
        className={`node ${node.type}`}
        data-node-id={node.id}
        onContextMenu={e => {
          e.preventDefault();
          e.stopPropagation();
          setMenu?.({ x: e.clientX, y: e.clientY, nodeId: node.id });
        }}
      >
        <span className="node-icon">
          {node.type === "start" && "▶"}
          {node.type === "action" && "⚡"}
          {node.type === "branch" && "◆"}
          {node.type === "end" && "■"}
        </span>

        <div
          className="node-label"
          contentEditable
          suppressContentEditableWarning
          onBlur={e => updateLabel(node.id, e.target.innerText)}
        >
          {node.label}
        </div>

        <div className="buttons">
          {node.type !== "end" && node.type !== "branch" && (
            <>
              <button onClick={() => addNode(node.id, "action")}>＋</button>
              <button onClick={() => addNode(node.id, "branch")}>◇</button>
              <button onClick={() => addNode(node.id, "end")}>■</button>
            </>
          )}
          {node.type !== "start" && (
            <button className="delete" onClick={() => deleteNode(node.id)}>✕</button>
          )}
        </div>
      </div>

      {/* CONNECTORS */}
      {node.children?.map(childId => 
        childId ? <Connector key={childId} fromId={node.id} toId={childId} canvasRef={canvasRef} /> : null
      )}

      {/* BRANCH CHILDREN */}
      {node.type === "branch" && (
        <div className="branch-container">
          {["True", "False"].map((label, index) => {
            const childId = node.children?.[index] ?? null;
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
                  />
                ) : (
                  <button className="add-branch" onClick={() => addNode(node.id, "action", index)}>
                    + Add Step
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* LINEAR CHILD (non-branch) */}
      {node.type !== "branch" && node.children?.[0] && (
        <Node
          nodeId={node.children[0]}
          nodes={nodes}
          addNode={addNode}
          deleteNode={deleteNode}
          updateLabel={updateLabel}
          setMenu={setMenu}
          canvasRef={canvasRef}
        />
      )}
    </div>
  );
}
