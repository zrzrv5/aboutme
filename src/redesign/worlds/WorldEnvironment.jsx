import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { byId, itemById } from './data';
import { GAME_AREAS, gameAreaById } from './world-layout';
import { createEnvironment } from './environment';
import {trackOnce} from '../../site/analytics';

export default function WorldEnvironment({ art, selection, onSelect, onMiss, onInteract, onGesture, onMeasure, onViewReset, resetKey = 0, inspecting = false, paused = false }) {
  const canvas = useRef(null);
  const host = useRef(null);
  const environment = useRef(null);
  const callbacks = useRef({ onSelect, onMiss, selection, onInteract, onGesture, onMeasure, onViewReset });
  const savedView = useRef(null);
  const [layout, setLayout] = useState({ labelLevel:'overview',labels:[], objects:[] });
  const [hovered, setHovered] = useState(null);
  const [unavailable, setUnavailable] = useState(false);
  const labelKey = layout.labels.map(label => label.id).join();

  useEffect(() => { callbacks.current = { onSelect, onMiss, selection, onInteract, onGesture, onMeasure, onViewReset }; }, [onSelect, onMiss, selection, onInteract, onGesture, onMeasure, onViewReset]);

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
        onGesture: kind => callbacks.current.onGesture?.(kind),
        onMeasure: report => callbacks.current.onMeasure?.(report),
        onViewReset: () => callbacks.current.onViewReset?.(),
      });
      environment.current = world;
      world.attachLabels(host.current.querySelectorAll('[data-label-id]'));
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

  // The scene positions labels itself, every frame; React only mounts them.
  useLayoutEffect(() => { environment.current?.attachLabels(host.current.querySelectorAll('[data-label-id]')); }, [labelKey, art]);
  useEffect(() => { environment.current?.pause(paused); }, [paused,art]);
  useEffect(() => { environment.current?.inspect(inspecting); }, [inspecting, art]);
  useEffect(() => { if (resetKey) environment.current?.resetView(); }, [resetKey]);

  return <div ref={host} className="world-environment" data-renderer={art} data-label-level={layout.labelLevel}>
    <canvas ref={canvas} className="world-canvas" tabIndex={0} aria-label="Rui’s island. Drag or use arrow keys to rotate. Scroll, pinch, or use plus and minus to zoom. When zoomed in, Shift-drag, right-drag, two fingers or W A S D pan. Home resets the view. Click a place or object to explore, click open ground to send the frog there, or Tab to discover places." role="img" />
    {layout.objects.map(target => <button key={target.id} hidden={target.hidden} className={`world-accessible-target ${target.id.startsWith('@') ? 'world-prop-target' : ''}`} style={{left:`${target.x}%`,top:`${target.y}%`}} aria-label={target.title} onClick={() => onSelect(target.id)} onFocus={() => setHovered(target)} onBlur={() => setHovered(null)} onMouseEnter={() => setHovered(target)} onMouseLeave={() => setHovered(null)} />)}
    {!unavailable&&layout.labels.map(label => <button key={label.id} data-label-id={label.id} className={`world-accessible-target world-region-target world-label-${label.kind}`} onClick={() => {
      if(label.kind==='region'){canvas.current.focus({preventScroll:true});environment.current?.focusRegion(label.id);}
      else onSelect(`biome:${label.id}`);
    }} aria-label={label.kind==='region'?`Zoom into ${label.name}`:`${label.name}: ${label.plain}`}><span>{label.name}</span></button>)}
    {hovered && !unavailable ? <div className="world-object-label" style={{left:`${Math.min(80,Math.max(20,hovered.x))}%`,top:`${Math.max(8,hovered.y)}%`}}>{hovered.title}{hovered.location ? <small>{hovered.location}</small> : null}</div> : null}
    {unavailable ? <div className="world-unavailable"><p>The interactive map needs WebGL.</p><a href="/">Read the 2D portfolio</a><small>Choose an area to explore its projects.</small>{GAME_AREAS.map(area => <button key={area.id} onClick={() => onSelect(`biome:${area.id}`)}>{area.plain}</button>)}</div> : null}
    <span className="world-selection" aria-live="polite">{byId[selection]?.roleLabel ?? byId[selection]?.title ?? gameAreaById[selection.replace('biome:','')]?.plain ?? ''}</span>
  </div>;
}
