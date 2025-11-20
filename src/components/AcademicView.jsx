import React, { useState, useEffect } from 'react';

const AcademicView = () => {
    const [publications, setPublications] = useState([]);
    const [visiblePublications, setVisiblePublications] = useState(4);
    const [visiblePatents, setVisiblePatents] = useState(2);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/publications.json')
            .then(response => response.json())
            .then(data => {
                setPublications(data);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading publications:', error);
                setLoading(false);
            });
    }, []);

    const handleLoadMorePublications = () => {
        if (visiblePublications >= publications.length) {
            setVisiblePublications(4);
        } else {
            setVisiblePublications(publications.length);
        }
    };

    const handleLoadMorePatents = () => {
        // Hardcoded patent count for now as they are static in the HTML
        const totalPatents = 4;
        if (visiblePatents >= totalPatents) {
            setVisiblePatents(2);
        } else {
            setVisiblePatents(totalPatents);
        }
    };

    const formatAuthors = (authorsString) => {
        const authors = authorsString.split(', ');
        const maxAuthors = 5;
        let processedAuthors = authors;

        if (authors.length > maxAuthors) {
            const yourName = 'Rui Zhou';
            const yourIndex = authors.findIndex(author => author === yourName);

            if (yourIndex !== -1) {
                if (yourIndex === 0 || yourIndex === authors.length - 1) {
                    processedAuthors = [authors[0], '...', authors[authors.length - 1]];
                } else {
                    processedAuthors = [authors[0], '...', authors[yourIndex], '...', authors[authors.length - 1]];
                }
            } else {
                processedAuthors = [authors[0], '...', authors[authors.length - 1]];
            }
        }

        return processedAuthors.map((author, index) => (
            <span key={index}>
                {author === 'Rui Zhou' ? <strong>{author}</strong> : author}
                {index < processedAuthors.length - 1 ? ', ' : ''}
            </span>
        ));
    };

    return (
        <div className="academic-section content-section">
            <section className="research-interests">
                <h2 className="section-title">Research Areas</h2>
                <div className="research-item">
                    <h3> 🧮 Computational Materials</h3>
                    <div className="meta">
                        <span>MD</span>
                        <span>DFT</span>
                        <span>ML-FF</span>
                        <span>MC</span>
                        <span>DEM</span>
                    </div>
                    <p>Multiscale computational modeling of materials using density functional theory (DFT), machine learning force fields (ML-FF), and discrete element methods (DEM), spanning from the atomic scale to the mesoscale.</p>
                </div>
                <div className="research-item">
                    <h3>🔋 Battery Materials</h3>
                    <div className="meta">
                        <span>SSE</span>
                        <span>NCM</span>
                        <span>LFMP</span>
                    </div>
                    <p>Currently working on solid-state electrolytes. Previously focused on improving the stability and energy density of cathode materials like NCM and LFP/LFMP. </p>
                </div>
                <div className="research-item">
                    <h3>💡 Semiconductor Materials</h3>
                    <div className="meta">
                        <span>ZnS</span>
                        <span>CdTe</span>
                        <span>Si</span>
                    </div>
                    <p>Investigating of ZnS and CdTe semiconductors using machine learning force fields. Studying the mechanical properties, electronic structures, and photoplasticity of these materials in ground and excited states. </p>
                </div>
            </section>

            <section className="publications">
                <h2 className="section-title">Publications</h2>
                <div id="publications-container">
                    {loading ? (
                        <p>Loading publications...</p>
                    ) : (
                        publications.slice(0, visiblePublications).map((pub, index) => (
                            <div key={index} className="publication-item">
                                {(pub.coverImage || pub.abstractImage) && (
                                    <div className={pub.coverImage ? "publication-cover-image" : "publication-abstract-image"}>
                                        <img
                                            src={(pub.coverImage || pub.abstractImage).medium}
                                            alt={`Figure for ${pub.title}`}
                                            loading="lazy"
                                            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.style.display = 'none'; }}
                                        />
                                    </div>
                                )}
                                <div className="publication-content">
                                    <h3>
                                        <a href={pub.link} target="_blank" rel="noopener noreferrer" className="publication-title-link">
                                            {pub.title}
                                        </a>
                                    </h3>
                                    <div className="authors">{formatAuthors(pub.authors)}</div>
                                    <div className="journal">{pub.journal}, {pub.year}</div>
                                    {pub.abstract && (
                                        <div className="abstract-wrapper">
                                            <p className="publication-abstract">{pub.abstract}</p>
                                            <a href={pub.link} target="_blank" rel="noopener noreferrer" className="view-paper-link">View Paper</a>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
                <div className="publications-control">
                    <div className="publications-buttons">
                        <button onClick={handleLoadMorePublications} className="button">
                            {visiblePublications >= publications.length ? 'Show Less' : 'Show More Publications'}
                        </button>
                        {visiblePublications >= publications.length && (
                            <a href="https://scholar.google.com/citations?user=p27FiGAAAAAJ" target="_blank" rel="noopener noreferrer" className="button google-scholar-button">
                                <span>Visit Google Scholar</span>
                            </a>
                        )}
                    </div>
                </div>
            </section>

            <section className="education">
                <h2 className="section-title">Education & Work Experience</h2>
                <div className="timeline">
                    <div className="timeline-item left">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-date">Jan 2023 - Present</div>
                            <div className="timeline-title">Ph.D. in Materials Science and Engineering</div>
                            <div className="timeline-institution">Iowa State University</div>
                            <div className="timeline-tags">
                                <span className="tag">ML-FF</span>
                                <span className="tag">DFT</span>
                                <span className="tag">Solid-state Electrolytes</span>
                            </div>
                        </div>
                    </div>

                    <div className="timeline-item right">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-date">Dec 2020 - Dec 2022</div>
                            <div className="timeline-title">Simulation Engineer</div>
                            <div className="timeline-institution">Sunwoda Electric Vehicle Battery Co., Ltd.</div>
                            <div className="timeline-tags">
                                <span className="tag">DEM</span>
                                <span className="tag">ML-FF</span>
                                <span className="tag">Intelligent Battery R&D</span>
                                <span className="tag">NCM</span>
                                <span className="tag">LFP</span>
                                <span className="tag">LMFP</span>
                            </div>
                        </div>
                    </div>

                    <div className="timeline-break">
                        <div className="timeline-break-content">
                            <span className="timeline-break-text">😷 COVID-19 ⏸️</span>
                        </div>
                    </div>

                    <div className="timeline-item left">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-date">Aug 2018 - Jan 2020</div>
                            <div className="timeline-title">M.S. in Materials Science and Engineering</div>
                            <div className="timeline-institution">Washington University in St. Louis</div>
                            <div className="timeline-tags">
                                <span className="tag">MD</span>
                                <span className="tag">CFD</span>
                                <span className="tag">Thin-film Silicon</span>
                                <span className="tag">Microfluidics</span>
                                <span className="tag">Microfabrication</span>
                                <span className="tag">Lithography</span>
                            </div>
                        </div>
                    </div>

                    <div className="timeline-item right">
                        <div className="timeline-dot"></div>
                        <div className="timeline-content">
                            <div className="timeline-date">Aug 2014 - Jun 2018</div>
                            <div className="timeline-title">B.S. in Materials Science and Engineering</div>
                            <div className="timeline-institution">Changchun University of Science and Technology</div>
                            <div className="timeline-tags">
                                <span className="tag">Carbon Nanotube Synthesis</span>
                                <span className="tag">LIB Anode Materials</span>
                                <span className="tag">Electrochemical Analysis</span>
                                <span className="tag">Electrospinning</span>
                                <span className="tag">High-Tempreature-High-Pressure</span>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="patents">
                <h2 className="section-title">Patents</h2>
                <div id="patents-container">
                    <div className={`achievement-item ${visiblePatents < 1 ? 'hidden' : ''}`}>
                        <h3>Ternary material and preparation method thereof, lithium ion battery and power utilization equipment</h3>
                        <div className="meta">
                            <span><i>📝</i>CN114744187B (Granted, June 2022)</span>
                        </div>
                        <p>A novel ternary cathode material with optimized stability coefficient that enhances structural integrity during charging cycles, improving battery performance and energy density for advanced power applications.(Summarized by AI🤖)</p>
                    </div>
                    <div className={`achievement-item ${visiblePatents < 2 ? 'hidden' : ''}`}>
                        <h3>Method, system, equipment and storage medium for optimizing particle size of material particles</h3>
                        <div className="meta">
                            <span><i>📝</i>CN114169233A (Granted, Nov 2021)</span>
                        </div>
                        <p>An effective computational approach for determining optimal particle size distributions in battery materials, reducing development time and costs while improving battery density and performance.(Summarized by AI🤖)</p>
                    </div>
                    {visiblePatents >= 3 && (
                        <>
                            <div className="achievement-item">
                                <h3>Simulation optimization design method, system, equipment and medium for battery material mixing proportion</h3>
                                <div className="meta">
                                    <span><i>📝</i>CN115579085A (Pending, Oct 2022)</span>
                                </div>
                                <p>A practical simulation method for optimizing battery material blending proportions, resulting in enhanced compaction density and improved energy density for next-generation battery systems.(Summarized by AI🤖)</p>
                            </div>
                            <div className="achievement-item">
                                <h3>Parameter identification method, system, device and medium for secondary battery physical model</h3>
                                <div className="meta">
                                    <span><i>📝</i>CN115392123A (Granted, Aug 2022)</span>
                                </div>
                                <p>A reliable framework for identifying critical parameters in battery physical models, enabling accurate characterization of performance across operating conditions to improve efficiency, lifespan, and safety in energy storage applications.(Summarized by AI🤖)</p>
                            </div>
                        </>
                    )}
                </div>
                <div className="patents-control">
                    <button onClick={handleLoadMorePatents} className="button">
                        {visiblePatents >= 4 ? 'Show Less' : 'Show More Patents'}
                    </button>
                </div>
            </section>

            <div className="downloads-section">
                <a href="/ZHOU_Rui_CV_2025.pdf" download="ZHOU_Rui_CV_2025.pdf" className="button">Download Academic CV</a>
            </div>
        </div>
    );
};

export default AcademicView;
