# Rui Zhou · personal website

The homepage opens the original Margins 2D portfolio; its “Explore in 3D” button opens the island. Two views of the same portfolio: a hand-built 3D island and the original Margins portfolio with handwritten notes. The production entry point no longer contains the design lab or appearance picker.

## Run and verify

Use Node 22 or newer, then `npm ci` and `npm run dev`.

- `npm run lint` — source checks.
- `npm test` — routing, analytics safeguards, geometry, interaction and skill-history regression tests.
- `npm run build` — Vite assets, server-rendered résumé, static entry pages, social metadata, 404, robots and sitemap.
- `npm run preview` — inspect the production output locally.

## Public routes

| Route | Content |
| --- | --- |
| `/` | Margins portfolio, notes switch, research stories, project links and skill histories |
| `/world/` | 3D island, one illustrated appearance |
| `/about/` | Compatible alias for the Margins homepage |
| `/world/?at=isu` | Direct entry to an experience or project |
| `/?at=wustl` | Corresponding portfolio entry |
| `/world/?at=item%3Apython` | A skill's growth route |

The earlier `?v=worlds&w=…&art=…`, `?v=margins`, `/academic/`, `/industry/` and `/developer/` links resolve into the two current views. Browser Back/Forward works across view changes. The 2D page remains readable without JavaScript; the island offers a 2D fallback if WebGL is unavailable.

`src/redesign/` contains the accepted design and the historical exploration sources. Unused variants are retained as source history, but are not imported into the production app or emitted as entry points. `.claude/design-previews/` contains local inspection artifacts, outside the deployed `dist/` directory.

## Content

- `src/redesign/content.js`: source facts and original app descriptions.
- `src/redesign/worlds/data.js`: experience/project details shared by the island and Margins supplements.
- `src/redesign/worlds/skills.js`: user-confirmed skill histories.
- `public/publications.json`: publication source, also embedded in the server-rendered homepage and /about/ alias.
- `public/ZHOU_Rui_CV-2026-Aug.pdf` and `public/ZHOU_Rui_Resume.pdf`: current linked documents; replace links and files together when updating them.
- `src/redesign/worlds/world-layout.js`: placement, scale and campus transforms.

## Analytics

The existing GA4 web stream is retained: **G-BPBV7R290N**. Override it at build time with `VITE_GA_ID` if a new stream is created. This ID is public, not a secret.

Google's script loads only in a production build on **me.1sec.plus**. Localhost and preview hosts never send to GA. Add `?analytics=debug` on a local URL to log the exact event payloads to the browser console without loading Google. The query is removed when normalizing the route, but debug mode remains active for that page session.

| Event | Question it answers / trigger | Parameters beyond `site_view` |
| --- | --- | --- |
| `page_view` | Which view was loaded or reached via navigation? | `page_title`, clean `page_location`, clean `page_referrer` |
| `view_switch` | Do visitors cross between the island and 2D portfolio? | `from_view`, `to_view` |
| `content_open` | Which experience, project, area or journal was opened? | `content_id`, `content_type` |
| `content_section` | Do visitors open papers, patents or skills within an experience? | `content_id`, `section_id` |
| `section_view` | Which portfolio sections reach the viewport? Once per section per page session. | `section_id` |
| `skill_select` | Which skills are explored? | `skill_id` |
| `skill_milestone` | Which stage of a skill history is selected? | `skill_id`, `place_id`, `skill_level`, `status` |
| `contact_click` | Was an email or LinkedIn contact link clicked? | `contact_method` |
| `document_open` | Was the résumé or academic CV link opened? This does not prove a download completed. | `document_id`, `file_extension` |
| `project_link` | Did someone follow an app/project to its website, App Store, TestFlight or GitHub? | `project_id`, `link_kind`, `link_domain` |
| `publication_click` | Which publication link was followed? | `publication_id`, `link_domain` |
| `outbound_click` | Other external destinations, e.g. Scholar or the GitHub profile. | `link_domain` |
| `notes_toggle` | Is the annotated or clean page preferred? | `visible` |
| `world_ready` | Scene construction through first sized frame, excluding the JS download; once per page session. | `load_ms` |
| `world_error` | Did WebGL initialization fail? | `error_kind` |
| `web_vital` | Real-user document performance: LCP/INP in ms, CLS as a score. | `metric_name`, `metric_value`, `metric_rating`, `metric_id`, `entry_view` |

No per-frame events, hover streams, camera coordinates, contact message contents or email addresses are included. Full URL query strings and hashes are not put in event payloads. Only validated `utm_source`, `utm_medium` and `utm_campaign` labels are retained for traffic attribution. Events use an allowlist. Advertising personalization and Google Signals are disabled. The Privacy control persists an opt-out in local storage, and Global Privacy Control is respected.

### GA4 administration required before publishing

These are account settings; a source-code change cannot confirm they have been applied:

1. In the existing web stream's Enhanced Measurement settings, **disable “Page changes based on browser history events.”** This app sends page views only for view transitions; changing a selected object must not generate an automatic extra page view. `send_page_view: false` alone does not disable history tracking.
2. Disable automatic outbound-click and file-download measurement if using this event plan, to keep one intentional set of reports. Automatic session/user engagement remains GA-managed.
3. Register event-scoped custom dimensions as needed: `site_view`, `content_id`, `content_type`, `section_id`, `skill_id`, `place_id`, `status`, `from_view`, `to_view`, `contact_method`, `document_id`, `project_id`, `link_kind`, `metric_name`, `metric_rating`, `error_kind`. Do not register the unique `metric_id` as a dimension.
4. For performance reports, add numeric custom metrics `load_ms` and `metric_value`. Filter `metric_value` by `metric_name` because CLS and timing values have different units. These are document-lifetime metrics; `entry_view` identifies the landing view, rather than attributing the whole metric to a later SPA view.
5. Suggested key events: `contact_click` and `document_open`. Treat app-store/TestFlight link clicks as interest, not installations or signups.
6. After deploying, verify one page view per view change and the event parameters in Realtime/DebugView. Local debug logs verify instrumentation, not receipt by the GA account.

References: [GA4 manual pageviews and history tracking](https://developers.google.com/analytics/devguides/collection/ga4/views), [SPA measurement](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications), [web-vitals](https://github.com/GoogleChrome/web-vitals).

## Deployment

GitHub Actions builds and deploys `dist/` on pushes to `main` or `v2`, or through the existing manual workflow. The old `gh-pages` script has been removed so there is one publishing pipeline. Code changes in this worktree do not publish the site by themselves.

Before publishing, run the checks above, review the production preview, and complete the GA web-stream settings. Domain configuration remains in `public/CNAME`.

### Launch review · 2026-10-11

The current implementation is deployable. Lint, all 28 tests and the production build pass; `npm audit` reports no known advisories. The generated HTML has no missing local links or assets, and the ten checked app, project and thesis destinations return HTTP 200 (this does not guarantee TestFlight enrollment availability). The 2D and 3D Sunwoda views use functional descriptions without internal software names.

Before the public release:

- Downloadable documents refreshed: the August 2026 CV is linked, and the reviewed one-page computational-materials résumé is copied unchanged under the general filename `ZHOU_Rui_Resume.pdf`. Both come from ResumeSlop; original files are preserved.
- Finish the GA4 account settings above, then verify real event delivery on the production domain after deployment.
- Enable HTTP-to-HTTPS redirection at the serving layer. HTTPS works, but the live HTTP URL currently returns 200 without a redirect; the Pages API also reports `https_enforced: false`.
- Commit and publish the accepted work through the deployment workflow. This exploration worktree has not been published. Verify the final domain's homepage, direct `/world/` entry, links and mobile interaction after deployment.

Further performance work can follow the release: the output is about 14.5 MiB in total, mostly inherited images, not the initial page transfer. The 3D JS is loaded on demand (about 202 kB gzip), and the 2D view creates no WebGL canvas. Trim unused public images and measure real-device performance before claiming mobile FPS or memory targets.

## Portfolio editing

The Margins page complements the CV with research questions, project context and links; full employment bullet lists and the full bibliography belong in the PDFs/Scholar. Keep annotations sparse (currently five notes and three ink marks). The toolbar only contains a blue Explore in 3D bookmark and a handwritten notes switch; the notes preference persists locally without moving the text. PDF links remain at the bottom.

Project links are shared with 3D through `src/redesign/worlds/data.js`. App imagery comes from the old public site. The DPMetal LinkedIn post was supplied by the owner. It says “Wrong video attached”, so the link is labeled as a project post rather than a verified demo. Projects without genuine public media or links simply have no link. Do not generate diagrams, sketches or other substitute assets to fill gaps. Do not add private GitHub links as if visitors can access them. The removed SlopCalendar has no entity or 3D object.

`project_link` also records local images and LinkedIn project posts. A project demo is not a `contact_click`; profile links still are. Historical GA view value `resume` is retained for continuity and now denotes the 2D portfolio.

On the 2D page, spell out institution names in headings and skill journeys, with degree/role on a separate line. Keep short school labels confined to the game UI. AmiiBot retains its original pandemic-project margin note.

The Sunwoda copy was cross-checked against the owner’s archived work notes, cathode closeout report, DEM workflow documentation and model-calibration source code. Describe delivered methods and tooling; do not turn project targets, simulated improvements or pending experimental validation into personal measured outcomes. Public copy omits internal software names, internal formulations and unpublished performance figures. Career copy welcomes roles and collaborations broadly, not only materials R&D.
