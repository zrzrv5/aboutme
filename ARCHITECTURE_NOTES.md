# Current portfolio architecture

## Two views, shared facts

`App` owns the error boundary. `WorldsSite` owns routing and view transitions. Margins is available in the initial bundle; the Three.js island and GLB loader load only on demand. Dates, institutions, contact links, app status and patent grant records are shared through `content.js`. The game adds narrative descriptions in `worlds/data.js`; skills use the same experiences without displaying game levels in Margins.

## First paint

The build renders the same `App` tree used by the browser for portfolio routes. A `data-ssr="portfolio"` marker selects `hydrateRoot`, with the embedded publication list and the same initial route. Browser URL focus and saved preferences are applied after hydration. Handwritten notes remain readable without JavaScript. The world and recovery pages have lightweight static fallbacks and use client rendering.

Fonts are local WOFF2 files with retained OFL licenses. Only the primary Latin text face is preloaded on portfolio routes. Screenshots use lazy WebP previews with a higher-resolution source for dense screens; full images also open in a native dialog on demand. The social preview is a real JPEG with a matching filename.

## Island rendering

`environment.js` assembles the low-poly scene; campus, workplace, project and terrain modules hold the geometry. `batch-world.js` batches static geometry while retaining independent picking and animation roots. `world-camera.js` separates taps from drag/pinch gestures and preserves camera changes across dialogue resizing.

Frames are capped at 30 FPS when idle and 60 FPS during interaction. Hidden pages and menus pause the animation loop. Resize and late model/texture completion force a frame, independently of the frame-rate gate. Coarse-pointer devices use a 1024 shadow map and a DPR cap of 2, bounded by a two-million-pixel drawing buffer; other devices use 1536 and 1.5. These are budgets, not measured performance guarantees. The opt-in development profiler reports actual scene allocations and draw calls.

Two projected region labels orient visitors at overview scale. Clicking one focuses that region; zooming in reveals Academic, Work, Apps & utilities, Visualization and ML & AI. Separate enter/exit thresholds prevent label flicker, and screen-space placement avoids overlapping labels or menu controls. Individual object labels appear on hover/focus. Native dialogs provide Escape and focus containment for screenshots and the menu; the 2D page has a skip link and text-first skill histories. Reading position is selected from visible entries without writing scroll activity into browser history.

## Validation

Run lint, unit tests and the production build. Check hydration with notes on/off, direct links, Back/Forward, keyboard traversal, screenshots, no-JavaScript output, and first-frame rendering with animation callbacks suspended. Test coarse-pointer sizing separately from real-device performance. An iPhone viewport in a desktop browser is not an iPhone GPU or Safari measurement.

Historical components and original assets are retained in `archive/` for reference. The directory is neither a production import nor a deployment input.
