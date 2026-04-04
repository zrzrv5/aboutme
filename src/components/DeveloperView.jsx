import React from 'react';

/* ── Seeded PRNG (deterministic per-item) ─────────────────────── */
function mulberry32(seed) {
    let s = seed | 0;
    return () => {
        s = (s + 0x6d2b79f5) | 0;
        let t = Math.imul(s ^ (s >>> 15), 1 | s);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
}

/* ── Generate a single hand-drawn scratch path ────────────────── */
function generateScratchPath(rng, w, yCenter, opts = {}) {
    const {
        segments = 6,        // number of line segments
        yJitter = 4,         // max vertical wobble per point
        xShorten = 0.06,     // fraction to inset start/end
    } = opts;

    const x0 = w * (xShorten * (0.5 + rng()));
    const x1 = w * (1 - xShorten * (0.5 + rng()));
    const step = (x1 - x0) / segments;

    const pts = [];
    for (let i = 0; i <= segments; i++) {
        const x = x0 + step * i;
        const y = yCenter + (rng() - 0.5) * 2 * yJitter;
        pts.push([x, y]);
    }

    // Build a smooth-ish path through all points using quadratic beziers
    let d = `M ${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
    for (let i = 1; i < pts.length - 1; i++) {
        const cpX = pts[i][0];
        const cpY = pts[i][1];
        const endX = (pts[i][0] + pts[i + 1][0]) / 2;
        const endY = (pts[i][1] + pts[i + 1][1]) / 2;
        d += ` Q ${cpX.toFixed(1)} ${cpY.toFixed(1)} ${endX.toFixed(1)} ${endY.toFixed(1)}`;
    }
    // last segment straight to end
    const last = pts[pts.length - 1];
    d += ` L ${last[0].toFixed(1)} ${last[1].toFixed(1)}`;
    return d;
}

/* ── ScratchMark SVG overlay ─────────────────────────────────── */
const ScratchMark = ({ seed, delay = '0s', strokes = 2, className = '' }) => {
    const rng = mulberry32(seed);
    const h = 20;   // viewBox height
    const w = 120;  // viewBox width — stretched to 100% via CSS

    const paths = [];
    for (let i = 0; i < strokes; i++) {
        const yCenter = h * (0.35 + 0.3 * i / Math.max(strokes - 1, 1)) + (rng() - 0.5) * 4;
        const strokeWidth = 1.6 + rng() * 1.1;
        const d = generateScratchPath(rng, w, yCenter, {
            segments: 5 + Math.floor(rng() * 4),
            yJitter: 2.5 + rng() * 3,
            xShorten: 0.02 + rng() * 0.06,
        });
        const animDelay = `calc(${delay} + ${(i * 0.12).toFixed(2)}s)`;
        paths.push(
            <path
                key={i}
                className="scratch-stroke"
                d={d}
                strokeWidth={strokeWidth}
                style={{ animationDelay: animDelay }}
            />
        );
    }

    return (
        <svg
            className={`scratch-svg ${className}`}
            viewBox={`0 0 ${w} ${h}`}
            preserveAspectRatio="none"
            aria-hidden="true"
        >
            {paths}
        </svg>
    );
};

/* ── Title Scribble SVG (big messy cross-out) ────────────────── */
const TitleScribble = () => {
    const rng = mulberry32(42);
    const w = 540, h = 100;
    const strokeCount = 3;
    const paths = [];

    for (let i = 0; i < strokeCount; i++) {
        const center = h * 0.5;
        const offset = (i - (strokeCount - 1) / 2) * 14;
        const yCenter = center + offset + (rng() - 0.5) * 4;
        const strokeWidth = 2.2 + rng() * 2.0;
        const d = generateScratchPath(rng, w, yCenter, {
            segments: 7 + Math.floor(rng() * 5),
            yJitter: 3 + rng() * 3.5,
            xShorten: 0.01 + rng() * 0.04,
        });
        paths.push(
            <path
                key={i}
                className="scribble-path"
                d={d}
                strokeWidth={strokeWidth}
                style={{ animationDelay: `${(i * 0.14).toFixed(2)}s` }}
            />
        );
    }

    return (
        <span className="scribble-overlay" aria-hidden="true">
            <svg className="scribble-svg" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
                {paths}
            </svg>
        </span>
    );
};

const DeveloperView = () => {
    return (
        <div className="developer-section content-section">
            <section className="apps-section">
                <h2 className="section-title">Released Apps</h2>
                <div className="apps-container">

                    {/* NAIIVE */}
                    <div className="app-card">
                        <div className="app-image">
                            <img src="/images/naiive/naiive_me_banner.png"
                                srcSet="/images/naiive/naiive_me_banner-2.png 300w,
                          /images/naiive/naiive_me_banner-1.png 600w,
                          /images/naiive/naiive_me_banner.png 1200w"
                                sizes="(max-width: 600px) 300px,
                          (max-width: 1200px) 600px,
                          1200px"
                                alt="NAIIVE Banner" />
                            <span className="app-badge badge-downloads">Beta</span>
                            <span className="app-badge badge-year" style={{ top: '45px' }}>2026</span>
                        </div>
                        <div className="app-details">
                            <h3>NAIIVE</h3>
                            <p>An experimental scientific visualization tool combining spatial rendering with a node-based editor.</p>
                            <div className="dev-comment">
                                <span className="dev-comment-tag">Dev Note</span>
                                <p>Still a work in progress! Recommded TestFlight for the best experience.🚧</p>
                            </div>
                            <div className="app-links">
                                <a href="https://apps.apple.com/us/app/naiive/id6758065886" className="app-link-appstore">
                                    <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on the App Store" />
                                </a>
                                <a href="https://testflight.apple.com/join/VrYnN9nE" className="app-link app-link-product">Join TestFlight</a>
                                <a href="https://github.com/zrzrv5/NAIIVE" className="app-link app-link-product">GitHub</a>
                            </div>
                        </div>
                    </div>

                    {/* TotK Companion */}
                    <div className="app-card">
                        <div className="app-image">
                            <img src="/images/totk/banner_large.png"
                                srcSet="/images/totk/banner_small.png 300w,
                          /images/totk/banner_medium.png 600w,
                          /images/totk/banner_large.png 1200w"
                                sizes="(max-width: 600px) 300px,
                          (max-width: 1200px) 600px,
                          1200px"
                                alt="TotK Companion Banner" />
                            <span className="app-badge badge-downloads">10K+ </span>
                            <span className="app-badge badge-paid" style={{ top: '45px' }}>Paid App</span>
                            <span className="app-badge badge-year" style={{ top: '80px' }}>2023</span>
                        </div>
                        <div className="app-details">
                            <h3>TotK Companion</h3>
                            <p>A companion app for Tears of the Kingdom, featuring shrines, collectibles, and cloud syncing.
                                It reached #2 in the US App Store (and #1 in other regions) after launch.</p>
                            <div className="dev-comment">
                                <span className="dev-comment-tag">Dev Note</span>
                                <p>Vibe-coding before it's cool.</p>
                                <p>
                                    An experiment in rapid dev using generative AI tools (chatGPT, Midjourney) for coding, i18n, and asset creation.
                                </p>
                                <p>Built in just two days!</p>
                            </div>
                            <div className="app-links">
                                <a href="https://apps.apple.com/us/app/tears-of-the-kingdom-companion/id6448892536" className="app-link-appstore">
                                    <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on the App Store" />
                                </a>
                                <a href="#" className="app-link app-link-product">Product Page</a>
                            </div>
                        </div>
                    </div>

                    {/* AmiiBot */}
                    <div className="app-card">
                        <div className="app-image">
                            <img src="/images/amiibot/old@3x.png"
                                srcSet="/images/amiibot/old.png 300w,
                          /images/amiibot/old@2x.png 600w,
                          /images/amiibot/old@3x.png 1200w"
                                sizes="(max-width: 600px) 300px,
                          (max-width: 1200px) 600px,
                          1200px"
                                alt="Amiibot Old Banner" />
                            <span className="app-badge badge-downloads">10K+ </span>
                            <span className="app-badge badge-paid" style={{ top: '45px' }}>Paid App</span>
                            <span className="app-badge badge-year" style={{ top: '80px' }}>2020</span>
                        </div>
                        <div className="app-details">
                            <h3>AmiiBot</h3>
                            <p>Track your Amiibo collection. Supports NFC scanning and writing.</p>
                            <p> <br /></p>
                            <div className="dev-comment">
                                <span className="dev-comment-tag">Dev Note</span>
                                <p> <br /></p>
                                <p>A 2020 pandemic project to kill some time that unexpectedly went viral.</p>
                                <p> <br /></p>
                            </div>
                            <div className="app-links">
                                <a href="https://apps.apple.com/us/app/amiibot/id1514835611" className="app-link-appstore">
                                    <img src="https://developer.apple.com/app-store/marketing/guidelines/images/badge-download-on-the-app-store.svg" alt="Download on the App Store" />
                                </a>
                                <a href="#" className="app-link app-link-product">Product Page</a>
                            </div>
                        </div>
                    </div>

                    {/* L!NG */}
                    <div className="app-card">
                        <div className="app-image">
                            <img src="/images/mytimetable/app@3x.png"
                                srcSet="/images/mytimetable/app.png 300w,
                          /images/mytimetable/app@2x.png 600w,
                          /images/mytimetable/app@3x.png 1200w"
                                sizes="(max-width: 600px) 300px,
                          (max-width: 1200px) 600px,
                          1200px"
                                alt="Amiibot Old Banner" />
                            <span className="app-badge badge-downloads">1K~5K</span>
                            <span className="app-badge badge-deprecated" style={{ top: '45px' }}>In-App Purchase</span>
                            <span className="app-badge badge-year" style={{ top: '80px' }}>2017</span>
                        </div>
                        <div className="app-details">
                            <h3>L!NG</h3>
                            <p>An open and customizable timetable app optimized for Apple Watch. My first app released on the App Store.</p>
                            <div className="dev-comment">
                                <span className="dev-comment-tag">RANT</span>
                                <p>Bring back Time Travel on Apple Watch!!!</p>
                            </div>
                            <div className="app-links">
                                <a href="https://apps.apple.com/us/app/l-ng/id1164016936" className="app-link app-link-deprecated">No Longer Available</a>
                            </div>
                        </div>
                    </div>

                </div>
            </section>

            <section className="skills-section">
                <div className="skills-title-wrap">
                    <h2 className="section-title crossed-out">
                        <span className="scratch-target">Technical Skills</span>
                        <TitleScribble />
                    </h2>
                    <span className="handwritten-note">mostly Vibe-coding Now 😬</span>
                </div>

                <div className="skills-container">
                    <div className="skill-category skill-category-replaced" style={{ '--card-delay': '0.15s' }}>
                        <h3 className="skill-title-rewrite">
                            <span className="skill-title-old">
                                iOS Development
                                <ScratchMark seed={101} delay="calc(var(--card-delay) + 0.36s)" strokes={2} />
                            </span>
                            <span className="skill-title-new">Vibe-code now</span>
                        </h3>
                        <div className="skill-list">
                            {['Swift', 'Metal', 'Core Data', 'CloudKit', 'CoreNFC', 'VisionOS', 'MapKit'].map((skill, i) => (
                                <span className="skill-item" key={skill} style={{ '--tag-seq': `${(i * 0.07).toFixed(2)}s` }}>
                                    {skill}
                                    <ScratchMark className="tag-scratch" seed={200 + i} delay={`calc(var(--card-delay) + 0.64s + ${(i * 0.07).toFixed(2)}s)`} strokes={2} />
                                </span>
                            ))}
                        </div>
                        <span className="skill-replacement-note">Codex + Claude Opus</span>
                    </div>
                    <div className="skill-category skill-category-replaced" style={{ '--card-delay': '0.4s' }}>
                        <h3 className="skill-title-rewrite">
                            <span className="skill-title-old">
                                Languages
                                <ScratchMark seed={301} delay="calc(var(--card-delay) + 0.36s)" strokes={2} />
                            </span>
                            <span className="skill-title-new">Vibe-code now</span>
                        </h3>
                        <div className="skill-list">
                            {['Python', 'Swift', 'C', 'MATLAB'].map((skill, i) => (
                                <span className="skill-item" key={skill} style={{ '--tag-seq': `${(i * 0.07).toFixed(2)}s` }}>
                                    {skill}
                                    <ScratchMark className="tag-scratch" seed={400 + i} delay={`calc(var(--card-delay) + 0.64s + ${(i * 0.07).toFixed(2)}s)`} strokes={2} />
                                </span>
                            ))}
                        </div>
                        <span className="skill-replacement-note">markdown is all you needed</span>
                    </div>

                    <div className="skill-category skill-category-replaced" style={{ '--card-delay': '0.65s' }}>
                        <h3 className="skill-title-rewrite">
                            <span className="skill-title-old">
                                Tools
                                <ScratchMark seed={501} delay="calc(var(--card-delay) + 0.36s)" strokes={2} />
                            </span>
                            <span className="skill-title-new">Vibe-code now</span>
                        </h3>
                        <div className="skill-list">
                            {['Xcode', 'Figma', 'Sketch', 'Git', 'TestFlight', 'Fastlane', 'CI/CD', 'Linux'].map((skill, i) => (
                                <span className="skill-item" key={skill} style={{ '--tag-seq': `${(i * 0.07).toFixed(2)}s` }}>
                                    {skill}
                                    <ScratchMark className="tag-scratch" seed={600 + i} delay={`calc(var(--card-delay) + 0.64s + ${(i * 0.07).toFixed(2)}s)`} strokes={2} />
                                </span>
                            ))}
                        </div>
                        <span className="skill-replacement-note">🦞</span>
                    </div>

                </div>
            </section>

            <section className="projects-section">
                <h2 className="section-title">Ongoing Projects</h2>
                <p className="section-subtitle">Where I explore the latest tech and learn new things...</p>
                <div className="projects-container">

                    <div className="project-card">
                        <h3>Gas MinMax</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Vibe Coding</strong> </span>
                            <span className="tech">MapKit</span>
                            <span className="tech">Swift</span>
                            <span className="tech">SwiftData</span>
                            <span className="tech">SwiftUI</span>
                        </div>
                        <p>⛽️ Ever wonder if you should go to Costco, which has lower prices but is farther away, or Sam's Club, which isn't the cheapest but is closer? This app can find nearby Costco and Sam's Club gas prices and compare them.</p>
                        <div className="project-links">
                            <a href="https://testflight.apple.com/join/g1fW16zk" className="project-link">Try it on TestFlight!</a>
                        </div>
                    </div>


                    <div className="project-card">
                        <h3>LaneLoaf</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Vibe Coding</strong> </span>
                            <span className="tech">MapKit</span>
                            <span className="tech">Swift</span>
                            {/* <span className="tech">Python</span> */}
                        </div>
                        <p>🛣️ Turn dashcam footages into trip logs</p>
                        <div className="project-links">
                            <a href="https://laneloaf.1sec.plus" className="project-link">Product Page</a>
                        </div>
                    </div>

                    <div className="project-card">
                        <h3>Unreleased Project #2</h3>
                        <div className="tech-stack">
                            <span className="tech">Core Bluetooth</span>
                            <span className="tech">Swift</span>
                        </div>
                        <p>📸 Remote shutter control for Fujifilm cameras (and possibly more brands!) on Apple Watch.</p>
                        <div className="project-links">
                            <a href="#" className="project-link">Demo Video</a>
                        </div>
                    </div>
                    <div className="project-card">
                        <h3>Quick TrajView</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Slop Coding</strong> </span>
                            <span className="tech">Three.js</span>
                            <span className="tech">Python</span>
                        </div>
                        <p>🧑‍🔬 viewing atom simulation trajectories directly in VS Code Server! A vibe-coding project that glue Three.js and dpdata python package.</p>
                        <div className="project-links">
                            <a href="https://github.com/zrzrv5/QuickTrajView-vscode" className="project-link">GitHub</a>
                        </div>
                    </div>

                    <div className="project-card">
                        <h3>S.L.O.P</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Slop Coding</strong> </span>
                            <span className="tech">AI Agent</span>
                            {/* <span className="tech">Markdown</span> */}
                        </div>
                        <p> hpc + skills.md </p>
                        {/* <div className="project-links">
                            <a href="https://github.com/zrzrv5/SLOP" className="project-link">GitHub</a>
                        </div> */}
                    </div>

                </div>
            </section>

            <div className="downloads-section">
                {/* <a href="#" className="button">Visit 1sec.plus</a> */}
            </div>
        </div>
    );
};

export default DeveloperView;
