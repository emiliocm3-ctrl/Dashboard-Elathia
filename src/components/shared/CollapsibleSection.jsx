import React, { useState } from "react";
import "./shared.css";

export default function CollapsibleSection({ title, defaultOpen = false, children }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className={`collapsible ${open ? "collapsible--open" : ""}`}>
      <button
        className="collapsible__toggle"
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="collapsible__title">{title}</span>
        <span className="collapsible__arrow">{open ? "▲" : "▼"}</span>
      </button>
      {open && <div className="collapsible__body">{children}</div>}
    </div>
  );
}
