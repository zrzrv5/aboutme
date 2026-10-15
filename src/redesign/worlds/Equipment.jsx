import React from 'react';

// One illustrated item set, drawn as a single sheet so every item shares the
// same outline, palette and light, then sliced into 256 px WebP files.
export default function Equipment({ id }) {
  return <img className="atlas-equipment" src={`/game/items/${id}.webp`} width="256" height="256" alt="" aria-hidden="true" decoding="async" draggable="false"/>;
}
