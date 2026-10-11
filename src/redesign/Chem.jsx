import React from 'react';

// Renders chemical formulas with real subscripts: "Na2B12H12" -> Na<sub>2</sub>B<sub>12</sub>H<sub>12</sub>.
const UNI = { '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9' };

export default function Chem({ children }) {
  const text = String(children).replace(/[₀-₉]/g, (c) => UNI[c]);
  const parts = text.split(/(\b(?:[A-Z][a-z]?\d+){2,}\b)/g);
  return parts.map((part, i) =>
    i % 2 ? (
      <span key={i}>
        {part.split(/(\d+)/).map((t, j) => (j % 2 ? <sub key={j}>{t}</sub> : t))}
      </span>
    ) : (
      part
    ),
  );
}
