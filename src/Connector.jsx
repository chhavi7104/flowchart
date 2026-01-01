import { useEffect, useState, useRef } from "react";

export default function Connector({ fromId, toId, canvasRef, branchIndex }) {
  const [coords, setCoords] = useState(null);
  const [ctrl, setCtrl] = useState({ x: 0, y: 0 });
  const dragging = useRef(false);
  const startMouse = useRef({ x: 0, y: 0 });
  const startCtrl = useRef({ x: 0, y: 0 });

  useEffect(() => {
    function update() {
      if (!canvasRef.current) return;
      const fromEl = document.querySelector(`[data-node-id="${fromId}"]`);
      const toEl = document.querySelector(`[data-node-id="${toId}"]`);
      if (!fromEl || !toEl) return setCoords(null);

      const canvas = canvasRef.current;
      const canvasRect = canvas.getBoundingClientRect();

      const transform = getComputedStyle(canvas).transform;
      let scale = 1, offsetX = 0, offsetY = 0;
      if (transform && transform !== "none") {
        const values = transform.match(/matrix\((.+)\)/)?.[1].split(", ").map(Number);
        if (values && values.length === 6) {
          scale = values[0];
          offsetX = values[4];
          offsetY = values[5];
        }
      }

      const r1 = fromEl.getBoundingClientRect();
      const r2 = toEl.getBoundingClientRect();

      let startX = (r1.left - canvasRect.left - offsetX) / scale + r1.width / 2;
      const startY = (r1.bottom - canvasRect.top - offsetY) / scale;

      if (branchIndex !== undefined) {
        const offset = r1.width / 4;
        startX += branchIndex === 0 ? -offset : offset;
      }

      const endX = (r2.left - canvasRect.left - offsetX) / scale + r2.width / 2;
      const endY = (r2.top - canvasRect.top - offsetY) / scale - 10;

      setCoords({ start: { x: startX, y: startY }, end: { x: endX, y: endY } });
    }

    update();
    window.addEventListener("resize", update);
    window.addEventListener("scroll", update);
    const obs = new MutationObserver(update);
    obs.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("scroll", update);
      obs.disconnect();
    };
  }, [fromId, toId, canvasRef, branchIndex]);

  useEffect(() => {
    function move(e) {
      if (!dragging.current) return;
      const dx = e.clientX - startMouse.current.x;
      const dy = e.clientY - startMouse.current.y;
      setCtrl({ x: startCtrl.current.x + dx, y: startCtrl.current.y + dy });
    }
    function up() {
      dragging.current = false;
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    }
    if (dragging.current) {
      window.addEventListener("mousemove", move);
      window.addEventListener("mouseup", up);
    }
    return () => {
      window.removeEventListener("mousemove", move);
      window.removeEventListener("mouseup", up);
    };
  }, []);

  if (!coords) return null;

  const { start, end } = coords;
  const deltaY = Math.max(20, (end.y - start.y) / 2);
  const c1 = { x: start.x + ctrl.x, y: start.y + deltaY + ctrl.y };
  const c2 = { x: end.x + ctrl.x, y: end.y - deltaY + ctrl.y };
  const d = `M ${start.x} ${start.y} C ${c1.x} ${c1.y}, ${c2.x} ${c2.y}, ${end.x} ${end.y}`;

  const t = 0.5;
  const qx = Math.pow(1 - t, 3) * start.x + 3 * Math.pow(1 - t, 2) * t * c1.x + 3 * (1 - t) * Math.pow(t, 2) * c2.x + Math.pow(t, 3) * end.x;
  const qy = Math.pow(1 - t, 3) * start.y + 3 * Math.pow(1 - t, 2) * t * c1.y + 3 * (1 - t) * Math.pow(t, 2) * c2.y + Math.pow(t, 3) * end.y;

  return (
    <svg style={{ position: "absolute", left: 0, top: 0, width: "100%", height: "100%", pointerEvents: "none" }}>
      <defs>
        <linearGradient id={`grad-${fromId}-${toId}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#6366f1" />
          <stop offset="100%" stopColor="#2563eb" />
        </linearGradient>
        <marker id={`arrow-${fromId}-${toId}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#2563eb" />
        </marker>
      </defs>
      <path
        d={d}
        stroke={`url(#grad-${fromId}-${toId})`}
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        markerEnd={`url(#arrow-${fromId}-${toId})`}
      />
      <circle
        cx={qx}
        cy={qy}
        r={6}
        fill="#fff"
        stroke="#6b7280"
        strokeWidth={1}
        style={{ pointerEvents: "all", cursor: "grab" }}
        onMouseDown={e => {
          e.stopPropagation();
          dragging.current = true;
          startMouse.current = { x: e.clientX, y: e.clientY };
          startCtrl.current = { ...ctrl };
        }}
      />
    </svg>
  );
}
