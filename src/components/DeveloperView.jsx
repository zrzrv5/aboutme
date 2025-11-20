import React from 'react';

const DeveloperView = () => {
    return (
        <div className="developer-section content-section">
            <section className="apps-section">
                <h2 className="section-title">Released Apps</h2>
                <div className="apps-container">

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
                <h2 className="section-title crossed-out">Technical Skills</h2>
                <span className="handwritten-note"> mostly Vibe-coding Now 😬</span>
                <div className="skills-container">
                    <div className="skill-category">
                        <h3>iOS Development</h3>
                        <div className="skill-list">
                            <span className="skill-item">Swift</span>
                            <span className="skill-item">Metal</span>
                            <span className="skill-item">Core Data</span>
                            <span className="skill-item">CloudKit</span>
                            <span className="skill-item">CoreNFC</span>
                            <span className="skill-item">VisionOS</span>
                            <span className="skill-item">MapKit</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Languages</h3>
                        <div className="skill-list">
                            <span className="skill-item">Python</span>
                            <span className="skill-item">Swift</span>
                            <span className="skill-item">C</span>
                            <span className="skill-item">MATLAB</span>
                        </div>
                    </div>

                    <div className="skill-category">
                        <h3>Tools</h3>
                        <div className="skill-list">
                            <span className="skill-item">Xcode</span>
                            <span className="skill-item">Figma</span>
                            <span className="skill-item">Sketch</span>
                            <span className="skill-item">Git</span>
                            <span className="skill-item">TestFlight</span>
                            <span className="skill-item">Fastlane</span>
                            <span className="skill-item">CI/CD</span>
                            <span className="skill-item">Linux</span>
                        </div>
                    </div>
                    <div className="skill-category">
                        <h3>Vibe-coding Tools</h3>
                        <div className="skill-list">
                            <span className="skill-item">Cursor</span>
                            <span className="skill-item">Antigravity</span>
                            <span className="skill-item">Kiro</span>
                            <span className="skill-item">Copilot</span>
                            <span className="skill-item">Claude Code</span>
                        </div>
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
                        <h3>Unreleased Project #0</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Metal</strong></span>
                            <span className="tech">visionOS</span>
                            <span className="tech">Swift</span>
                        </div>
                        <p>🥽 Low-code atomistic visualization & analysis. Learning GPU Programming!</p>
                        <div className="project-links">
                            <a href="https://x.com/i/status/1840661711428231455" className="project-link">Demo#1 (Renderer & Parser)</a>
                            <a href="https://x.com/i/status/1920641257212154303" className="project-link">Demo#2 (Animated)</a>
                            <a href="https://x.com/i/status/1834096587875791282" className="project-link">Demo#3 (Spatial Rendering on Vision Pro)</a>
                        </div>
                    </div>

                    <div className="project-card">
                        <h3>Unreleased Project #1</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Vibe Coding</strong> </span>
                            <span className="tech">MapKit</span>
                            <span className="tech">Swift</span>
                            <span className="tech">Python</span>
                        </div>
                        <p>🛣️ Car Trajectory Player: merges dashcam videos and extracts GPS trajectories.</p>
                        <div className="project-links">
                            <a href="https://x.com/ZRZRV5/status/1791689586193653907/photo/1" className="project-link">Screenshot</a>
                        </div>
                    </div>

                    <div className="project-card">
                        <h3>Unreleased Project #2</h3>
                        <div className="tech-stack">
                            <span className="tech">Core Bluetooth</span>
                            <span className="tech">Swift</span>
                        </div>
                        <p>📸 Remote shutter control for Fujifilm cameras (and possibly more brands!).</p>
                        <div className="project-links">
                            <a href="#" className="project-link">Demo Video</a>
                        </div>
                    </div>
                    <div className="project-card">
                        <h3>Quick TrajView</h3>
                        <div className="tech-stack">
                            <span className="tech"><strong>Vibe Coding</strong> </span>
                            <span className="tech">Three.js</span>
                            <span className="tech">Python</span>
                        </div>
                        <p>🧑‍🔬 viewing atom simulation trajectories directly in VS Code Server! A vibe-coding project that glue Three.js and dpdata python package.</p>
                        <div className="project-links">
                            <a href="https://github.com/zrzrv5/QuickTrajView-vscode" className="project-link">GitHub</a>
                        </div>
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
