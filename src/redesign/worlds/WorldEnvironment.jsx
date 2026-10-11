import React, { useEffect, useRef, useState } from 'react';
import { byId, itemById } from './data';
import { GAME_AREAS, gameAreaById } from './world-layout';
import { createEnvironment } from './environment';
import {trackOnce} from '../../site/analytics';

const FALLBACK_LABELS = Object.fromEntries(GAME_AREAS.map(area=>[area.id,area.fallback]));

export default function WorldEnvironment({ art, selection, onSelect, onMiss, onInteract, onViewReset, resetKey = 0, inspecting = false, paused = false }) {
  const canvas = useRef(null);
  const host = useRef(null);
  const environment = useRef(null);
  const callbacks = useRef({ onSelect, onMiss, selection, onInteract, onViewReset });
  const savedView = useRef(null);
  const [layout, setLayout] = useState({ regions:FALLBACK_LABELS, objects:[] });
  const [hovered, setHovered] = useState(null);
  const [unavailable, setUnavailable] = useState(false);

  useEffect(() => { callbacks.current = { onSelect, onMiss, selection, onInteract, onViewReset }; }, [onSelect, onMiss, selection, onInteract, onViewReset]);

  useEffect(() => {
    let world;
    let errorFrame;
    let ready=false;
    const started=performance.now();
    try {
      world = createEnvironment(canvas.current, {
        art, surface:host.current, view:savedView.current,
        onSelect: (id) => callbacks.current.onSelect(id),
        onMiss: () => callbacks.current.onMiss?.(),
        onHover: setHovered,
        onLayout: setLayout,
        onInteract: () => callbacks.current.onInteract?.(),
        onViewReset: () => callbacks.current.onViewReset?.(),
      });
      environment.current = world;
      const initial = callbacks.current.selection;
      world.select(initial.startsWith('item:') ? itemById[initial.slice(5)]?.found : initial, true);
    } catch (error) {
      console.error('Could not create the world scene:', error);
      trackOnce('world_error','initialization',{error_kind:'webgl_init'});
      errorFrame = requestAnimationFrame(() => setUnavailable(true));
    }
    const observer = new ResizeObserver(([entry]) => {
      world?.resize(entry.contentRect.width, entry.contentRect.height);
      if(world&&!ready){ready=true;trackOnce('world_ready','first-render',{load_ms:Math.round(performance.now()-started)});}
    });
    observer.observe(host.current);
    return () => {
      cancelAnimationFrame(errorFrame);
      observer.disconnect();
      savedView.current = world?.getView() ?? null;
      world?.dispose();
      environment.current = null;
    };
  }, [art]);

  useEffect(() => {
    const target = selection.startsWith('item:') ? itemById[selection.slice(5)]?.found : selection;
    environment.current?.select(target);
  }, [selection, art]);

  useEffect(() => { environment.current?.pause(paused); }, [paused,art]);
  useEffect(() => { environment.current?.inspect(inspecting); }, [inspecting, art]);
  useEffect(() => { if (resetKey) environment.current?.resetView(); }, [resetKey]);

  return <div ref={host} className="world-environment" data-renderer={art}>
    <canvas ref={canvas} className="world-canvas" tabIndex={0} aria-label="Rui’s island. Drag or use arrow keys to rotate. Scroll, pinch, or use plus and minus to zoom. Home resets the view. Click a place or object to explore, or Tab to discover places." role="img" />
    {layout.objects.map(target => <button key={target.id} hidden={target.hidden} className={`world-accessible-target ${target.id.startsWith('@') ? 'world-prop-target' : ''}`} style={{left:`${target.x}%`,top:`${target.y}%`}} aria-label={target.title} onClick={() => onSelect(target.id)} onFocus={() => setHovered(target)} onBlur={() => setHovered(null)} onMouseEnter={() => setHovered(target)} onMouseLeave={() => setHovered(null)} />)}
    {GAME_AREAS.map(area => <button key={area.id} hidden={layout.regions[area.id]?.hidden} className="world-accessible-target world-region-target" style={{left:`${(layout.regions[area.id] ?? area.fallback).x}%`,top:`${(layout.regions[area.id] ?? area.fallback).y}%`}} onClick={() => onSelect(`biome:${area.id}`)} aria-label={`${area.name}: ${area.plain}`}><span>{area.name}</span></button>)}
    {hovered && !unavailable ? <div className="world-object-label" style={{left:`${Math.min(80,Math.max(20,hovered.x))}%`,top:`${Math.max(8,hovered.y)}%`}}>{hovered.title}{hovered.location ? <small>{hovered.location}</small> : null}</div> : null}
    {unavailable ? <div className="world-unavailable"><p>The interactive map needs WebGL.</p><a href="/">Read the 2D portfolio</a><small>Choose an area to explore its projects.</small>{GAME_AREAS.map(area => <button key={area.id} onClick={() => onSelect(`biome:${area.id}`)}>{area.plain}</button>)}</div> : null}
    <span className="world-selection" aria-live="polite">{byId[selection]?.roleLabel ?? byId[selection]?.title ?? gameAreaById[selection.replace('biome:','')]?.plain ?? ''}</span>
  </div>;
}
