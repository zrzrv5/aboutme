import React, { useState, useEffect, useRef } from 'react';
import { Zap, Battery, Layers, Activity, ArrowDown, Microscope, Box, Grip, Sliders, BarChart3, Linkedin, Download } from 'lucide-react';

const SECTION_IDS = ['intro', 'cathode', 'electrolyte', 'anode', 'atom', 'particle', 'wireframe', 'contact'];

const BatteryExplorer = () => {
    const [scrollProgress, setScrollProgress] = useState(0);
    const [activeSection, setActiveSection] = useState('intro');

    // Refs for IntersectionObserver
    const sectionRefs = useRef({});

    // --- STABLE RANDOM SHAPES ---
    // Generate these once on mount so they don't change/shake during scroll re-renders
    const [particleShapes] = useState(() => {
        const generateShape = () => ({
            borderRadius: `${40 + Math.random() * 20}% ${50 + Math.random() * 20}% ${40 + Math.random() * 20}% ${30 + Math.random() * 20}% / ${50 + Math.random() * 20}% ${30 + Math.random() * 20}% ${60 + Math.random() * 20}% ${40 + Math.random() * 20}%`
        });
        return {
            top: Array.from({ length: 5 }).map(generateShape),
            middle: Array.from({ length: 4 }).map(generateShape),
            bottom: Array.from({ length: 5 }).map(generateShape)
        };
    });

    // --- TEMPLATE DATA CONFIGURATION ---
    const contentData = {
        cathode: {
            visualLabel: "Cathode",
            cardTitle: "Cathode Materials",
            cardBody: "I worked on cathode materials including lithium nickel cobalt manganese (NCM), lithium iron phosphate (LFP), and lithium iron manganese phosphate (LFMP) for lithium-ion batteries.\n I investigated the effects of different doping elements and particle mixing to identify potential candidates for higher energy density, improved high-voltage stability, and better low-temperature performance.",
            cardTags: ["NCM", "LFP", "LFMP"]
        },
        electrolyte: {
            cardTitle: "Solid State Electrolyte",
            cardBody: "At Iowa State University, I mainly study solid electrolyte materials for lithium and sodium batteries. My research includes glassy and crystalline materials, including sulfide-based, hydride-based, and oxyhalide-based materials. I investigate their mechanical properties, ionic transportation mechanisms, phase transitions, etc.",
            cardTags: ["Li-Si-P-S", "Na-C-B-H"]
        },
        anode: {
            visualLabel: "Anode",
            cardTitle: "Anode Materials & SEI ",
            cardBody: "Beyond solid electrolyte materials themselves, my current research also focuses on the interphases they form against metal anodes.\n\nDuring my undergraduate years, I also carried out hands-on experiments on the synthesis of carbon-based anode materials through electrospinning and High-Tempreature-High-Pressure methods. I performed characterizations such as XRD and evaluated performance by assembling half-cells.", cardTags: ["Li Metal", "Graphite"]
        },
        atom: {
            cardTitle: "Atomic Level (Å)",
            cardBody: "I mostly studied batteries at atomic scale through DFT and MD simulations, gaining atomic insights into ion transport and interfacial phenomena.",
            cardDetail: "First-principles modeling"
        },
        particle: {
            cardTitle: "Particle Scale (µm)",
            cardBody: "The second-most time I spent is on modeling at the particle level using Discrete Element Methods (DEM). \nDuring my time at Sunwoda, I built the workflow to model the electrode structure with particles of different size distributions and calendaring pressures. \nThis workflow was then integrated into a custom-developed optimization workflow to find the optimal size and pressure allowing for best energy density and rate performance.",
            cardDetail: "DEM & Process Optimization"
        },
        wireframe: {
            cardTitle: "Parameter Identification",
            cardBody: "Physics-based simulation mostly relies on a good parameter set, which typically depends on manual parameter tuning by engineers. I integrated optimization algorithms with simulation software like COMSOL to automate this process, reducing time and increasing the accuracy of simulations on electrochemical models (P2D) and thermal models.",
            cardTags: ["PyBaMM", "COMSOL", "ANSYS Fluent", "Blackbox Optimization"]
        },
        wireframe2: {
            cardTitle: "Data-Driven Models",
            cardBody: "Although physics-based simulations are great, sometimes data-driven models can provide preliminary predictions and summarize trends more efficiently.",
            cardDetail: "Machine Learning"
        },
        casing: {
            visualLabel: ""
        }
    };

    useEffect(() => {
        let ticking = false;

        const updateScrollStates = () => {
            const doc = document.documentElement;
            const totalScroll = doc.scrollTop;
            const windowHeight = doc.scrollHeight - doc.clientHeight;
            const scroll = windowHeight === 0 ? 0 : totalScroll / windowHeight;
            setScrollProgress(Math.min(Math.max(scroll, 0), 1));

            const viewportCenter = window.innerHeight / 2;
            let closestSection = SECTION_IDS[0];
            let smallestDistance = Infinity;

            SECTION_IDS.forEach((id) => {
                const element = sectionRefs.current[id];
                if (!element) return;

                const rect = element.getBoundingClientRect();
                const sectionCenter = rect.top + rect.height / 2;
                const distance = Math.abs(sectionCenter - viewportCenter);

                if (distance < smallestDistance) {
                    smallestDistance = distance;
                    closestSection = id;
                }
            });

            setActiveSection((prev) => (prev === closestSection ? prev : closestSection));
        };

        const handleScroll = () => {
            if (ticking) return;
            ticking = true;

            window.requestAnimationFrame(() => {
                updateScrollStates();
                ticking = false;
            });
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);
        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, []);

    // --- Animation Calculations ---

    const phase1Duration = 0.55;
    const p1Progress = Math.min(scrollProgress / phase1Duration, 1);
    const separationCurve = Math.sin(p1Progress * Math.PI);
    const separationMax = 220;
    const separation = separationCurve * separationMax;

    const cathodeX = -separation;
    const anodeX = separation;
    const electrolyteScale = 1 + (separationCurve * 0.5);

    // Visibility Toggles - Using display:none for Safari performance
    let batteryOpacity = 1;
    let showBattery = true;
    if (activeSection === 'atom') {
        batteryOpacity = 0.02;
        showBattery = true; // Keep visible but very faded
    } else if (activeSection === 'particle') {
        batteryOpacity = 0.1;
        showBattery = true;
    } else if (activeSection === 'contact') {
        batteryOpacity = 0.3;
        showBattery = true;
    }

    const isWireframe = activeSection === 'wireframe' || activeSection === 'contact';
    const showAtoms = activeSection === 'atom';
    const showParticles = activeSection === 'particle';

    // Scale transform
    let sceneScale = 0.8;
    if (activeSection === 'intro') sceneScale = 0.8;
    else if (activeSection === 'cathode' || activeSection === 'electrolyte' || activeSection === 'anode') sceneScale = 0.9;
    else if (activeSection === 'atom') sceneScale = 2.5;
    else if (activeSection === 'particle') sceneScale = 1.5;
    else if (activeSection === 'wireframe') sceneScale = 0.9;
    else if (activeSection === 'contact') sceneScale = 0.8; // Pull back slightly for contact

    const scaleTransitionStyle = { transition: 'transform 1s cubic-bezier(0.25, 0.46, 0.45, 0.94)' };

    // Intro Opacity Calculation - Fades out quickly (by 10% scroll)
    const introOpacity = Math.max(1 - scrollProgress * 10, 0);

    return (
        <div className="battery-explorer-wrapper min-h-[450vh] bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white pb-20">

            {/* --- INTRO HERO OVERLAY --- */}
            <div
                className="fixed inset-0 z-40 flex flex-col items-center justify-center pointer-events-none select-none overflow-hidden"
                style={{ opacity: introOpacity, display: introOpacity <= 0 ? 'none' : 'flex' }}
            >
                {/* Huge Background Text */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center">
                    <h1 className="text-[8vw] leading-[0.9] font-black text-slate-800/30 tracking-tight uppercase blur-sm" style={{ textAlign: 'center' }}>
                        mechanism<br />
                        energy density<br />
                        rate performance<br />
                        cycle life
                    </h1>
                </div>

                {/* Foreground Text */}
                <div className="relative z-10 flex flex-col items-center mt-[10vh] space-y-4 px-4">
                    <div className="flex items-center gap-4">
                        <div className="h-[2px] w-12 bg-indigo-500"></div>
                        <span className="text-indigo-400 font-mono tracking-[0.5em] text-xs uppercase">Battery R&D</span>
                        <div className="h-[2px] w-12 bg-indigo-500"></div>
                    </div>
                    <div className="w-full max-w-4xl flex flex-col items-center">
                        <h2 className="text-5xl md:text-7xl font-black text-white tracking-tight uppercase drop-shadow-2xl leading-none" style={{ textAlign: 'center', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.1em' }}>
                            <span>Design</span>
                            <span>Manufacturing</span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-br from-white via-slate-400 to-slate-600">Optimization</span>
                        </h2>
                    </div>
                </div>

                {/* Scroll Hint */}
                <div className="absolute bottom-12 flex flex-col items-center gap-4 animate-pulse">
                    <div className="h-16 w-[1px] bg-gradient-to-b from-indigo-500/0 via-indigo-500 to-indigo-500/0"></div>
                    <div className="flex flex-col items-center gap-2">
                        <ArrowDown className="w-6 h-6 text-slate-500" />
                        <span className="text-[10px] font-bold tracking-[0.4em] text-slate-500 uppercase">find out more</span>
                    </div>
                </div>
            </div>

            {/* --- Fixed 3D Viewer Area --- */}
            <div className="fixed top-0 left-0 w-full h-screen flex items-center justify-center overflow-hidden pointer-events-none z-10 perspective-container">

                {/* 3D Scene Root */}
                <div
                    className="relative w-[600px] h-40 ease-out"
                    style={{
                        transformStyle: 'preserve-3d',
                        transform: `rotateX(10deg) rotateY(-10deg) scale(${sceneScale})`,
                        ...scaleTransitionStyle
                    }}
                >

                    {/* --- MACRO BATTERY GROUP --- */}
                    <div className="absolute inset-0 transition-opacity duration-700" style={{ opacity: batteryOpacity }}>

                        {/* CATHODE (Left) */}
                        <div
                            className={`absolute top-0 left-0 w-[45%] h-full z-20 ${isWireframe ? 'wireframe-mode origin-right animate-optimize-width-left' : ''}`}
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: `translateX(${cathodeX}px)`,
                                willChange: 'transform'
                            }}
                        >
                            {/* Tab - Animated in Wireframe */}
                            <div
                                className={`absolute -top-8 left-8 w-12 h-10 bg-gradient-to-b from-slate-300 to-slate-400 border-x border-t border-white/50 rounded-t-md shadow-lg ${isWireframe ? 'bg-none border-indigo-500 border-2 text-indigo-500 animate-optimize-tab' : ''}`}
                                style={{ transform: 'translateZ(-1px)' }}
                            >
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs pb-2 text-slate-600">+</div>
                            </div>

                            {/* Body - Synchronized Height Animation */}
                            <div className={`w-full h-full rounded-l-md bg-gradient-to-r from-indigo-800 to-indigo-600 border-y border-l border-indigo-400/50 flex items-center justify-center relative overflow-hidden shadow-xl ${isWireframe ? 'bg-none border-2 border-indigo-500/80 shadow-[0_0_15px_rgba(99,102,241,0.5)] animate-optimize-height' : ''}`}>
                                {!isWireframe && <div className="absolute inset-0 bg-indigo-400/10 animate-pulse"></div>}
                                <span className={`font-bold text-4xl z-10 select-none uppercase tracking-wide ${isWireframe ? 'text-indigo-500' : 'text-indigo-200/50'}`} style={{ textAlign: 'center' }}>
                                    {contentData.cathode.visualLabel}
                                </span>
                            </div>
                        </div>

                        {/* ELECTROLYTE (Middle) */}
                        <div
                            className={`absolute top-0 left-1/2 w-[10%] h-full z-10 ${isWireframe ? 'wireframe-mode' : ''}`}
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: `translateX(-50%) scaleX(${electrolyteScale})`,
                                willChange: 'transform'
                            }}
                        >
                            {/* Body - Synchronized Height Animation */}
                            <div className={`w-full h-full bg-gradient-to-r from-yellow-200 via-yellow-100 to-yellow-200 opacity-90 border-y border-white/30 relative shadow-[0_0_30px_rgba(253,224,71,0.2)] ${isWireframe ? 'bg-none opacity-100 border-2 border-yellow-400 border-dashed shadow-none animate-optimize-height' : ''}`}>
                                {!isWireframe && <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_25%,rgba(255,255,255,0.8)_50%,transparent_75%)] bg-[length:100%_200%] animate-flow"></div>}
                            </div>
                        </div>

                        {/* ANODE (Right) */}
                        <div
                            className={`absolute top-0 right-0 w-[45%] h-full z-20 ${isWireframe ? 'wireframe-mode origin-left animate-optimize-width-right' : ''}`}
                            style={{
                                transformStyle: 'preserve-3d',
                                transform: `translateX(${anodeX}px)`,
                                willChange: 'transform'
                            }}
                        >
                            {/* Tab - Animated in Wireframe */}
                            <div
                                className={`absolute -top-8 right-8 w-12 h-10 bg-gradient-to-b from-orange-300 to-orange-400 border-x border-t border-white/50 rounded-t-md shadow-lg ${isWireframe ? 'bg-none border-emerald-500 border-2 text-emerald-500 animate-optimize-tab' : ''}`}
                                style={{ transform: 'translateZ(-1px)' }}
                            >
                                <div className="w-full h-full flex items-center justify-center font-bold text-xs pb-2 text-orange-900">-</div>
                            </div>

                            {/* Body - Synchronized Height Animation */}
                            <div className={`w-full h-full rounded-r-md bg-gradient-to-l from-slate-700 to-slate-600 border-y border-r border-slate-500/50 flex items-center justify-center relative overflow-hidden shadow-xl ${isWireframe ? 'bg-none border-2 border-emerald-500/80 shadow-[0_0_15px_rgba(16,185,129,0.5)] animate-optimize-height' : ''}`}>
                                <span className={`font-bold text-4xl z-10 select-none uppercase tracking-wide ${isWireframe ? 'text-emerald-500' : 'text-emerald-400/30'}`} style={{ textAlign: 'center' }}>
                                    {contentData.anode.visualLabel}
                                </span>
                            </div>
                        </div>

                        {/* Casing Ghost (Only visible in Phase 1) */}
                        {!isWireframe && (
                            <div
                                className="absolute inset-0 rounded-lg border border-slate-400/20 pointer-events-none transition-opacity duration-300 z-30"
                                style={{ opacity: Math.max(1 - separationCurve * 4, 0) }}
                            >
                                <div className="absolute inset-0 bg-gradient-to-b from-white/5 via-transparent to-white/5 rounded-lg backdrop-blur-[1px]"></div>
                            </div>
                        )}
                    </div>


                    {/* --- ATOM SCALE GROUP --- */}
                    {showAtoms && (
                        <div
                            className="absolute inset-0 flex flex-wrap items-center justify-center gap-4 animate-fade-in-scale"
                            style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
                        >
                            {Array.from({ length: 12 }).map((_, i) => (
                                <div key={i} className="w-16 h-16 rounded-full bg-indigo-500 shadow-[0_0_30px_rgba(99,102,241,0.8)] animate-pulse relative">
                                    <div className="absolute inset-0 border-2 border-white/30 rounded-full animate-ping opacity-20"></div>
                                    <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-indigo-100">Li+</div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* --- PARTICLE SCALE GROUP --- */}
                    {/* Added translate-x-10 to move grains slightly right as requested */}
                    {showParticles && (
                        <div
                            className="absolute inset-0 flex flex-col items-center justify-center gap-4 p-4 translate-x-10 animate-fade-in-scale"
                            style={{ transformStyle: 'preserve-3d', willChange: 'transform, opacity' }}
                        >
                        {/* Top Row (Smaller, Irregular) */}
                        <div className="flex gap-3 scale-75 opacity-80">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={`top-${i}`}
                                    className="w-12 h-12 bg-slate-700 border border-slate-500 shadow-lg flex items-center justify-center"
                                    style={particleShapes.top[i]}
                                ></div>
                            ))}
                        </div>

                        {/* Middle Row (Normal, Irregular) */}
                        <div className="flex gap-3">
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div
                                    key={`mid-${i}`}
                                    className="w-14 h-14 bg-slate-600 border border-slate-400 shadow-xl flex items-center justify-center"
                                    style={particleShapes.middle[i]}
                                >
                                    {/* Changed text to D50 */}
                                    <span className="text-[8px] text-slate-400 font-bold">D50</span>
                                </div>
                            ))}
                        </div>

                        {/* Bottom Row (Larger, Irregular) */}
                        <div className="flex gap-3 scale-110">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <div
                                    key={`bot-${i}`}
                                    className="w-12 h-12 bg-slate-700 border border-slate-500 shadow-lg flex items-center justify-center"
                                    style={particleShapes.bottom[i]}
                                ></div>
                            ))}
                        </div>
                        </div>
                    )}

                </div>
            </div>


            {/* --- CONTENT SCROLL SECTIONS --- */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 pointer-events-none">

                {/* Intro Section */}
                <section
                    id="intro"
                    ref={el => sectionRefs.current['intro'] = el}
                    className="h-[60vh] flex flex-col items-center justify-center text-center pt-20"
                >
                </section>

                {/* Phase 1 Sections */}
                <section
                    id="cathode"
                    ref={el => sectionRefs.current['cathode'] = el}
                    className="h-[60vh] flex flex-col items-end justify-center pr-6 md:pr-10 lg:pr-16"
                >
                    <div className={`transition-all duration-700 transform ${activeSection === 'cathode' ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-20'}`}>
                        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border-r-4 border-indigo-500 max-w-md shadow-2xl pointer-events-auto text-right">
                            <div className="flex items-center justify-end gap-3 mb-4 text-indigo-400">
                                <h2 className="text-2xl font-bold text-white">{contentData.cathode.cardTitle}</h2>
                                <Zap className="w-6 h-6" />
                            </div>
                            <p className="text-slate-300 leading-relaxed">{contentData.cathode.cardBody}</p>
                            {contentData.cathode.cardDetail && (
                                <div className="mt-4 text-sm text-indigo-200 bg-indigo-900/30 p-3 rounded">{contentData.cathode.cardDetail}</div>
                            )}
                            {contentData.cathode.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                                    {contentData.cathode.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section
                    id="electrolyte"
                    ref={el => sectionRefs.current['electrolyte'] = el}
                    className="h-[60vh] flex flex-col items-center justify-center"
                >
                    <div className={`transition-all duration-700 transform ${activeSection === 'electrolyte' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border-l-4 border-yellow-400 max-w-md shadow-2xl pointer-events-auto text-left mx-auto">
                            <div className="flex items-center gap-3 mb-4 text-yellow-400">
                                <Activity className="w-6 h-6" />
                                <h2 className="text-2xl font-bold text-white">{contentData.electrolyte.cardTitle}</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{contentData.electrolyte.cardBody}</p>
                            {contentData.electrolyte.cardDetail && (
                                <div className="mt-4 text-sm text-yellow-200 bg-yellow-900/30 p-3 rounded">{contentData.electrolyte.cardDetail}</div>
                            )}
                            {contentData.electrolyte.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                                    {contentData.electrolyte.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-yellow-500/30 text-yellow-200 rounded-full border border-yellow-400/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section
                    id="anode"
                    ref={el => sectionRefs.current['anode'] = el}
                    className="h-[60vh] flex flex-col items-start justify-center pl-6 md:pl-16 lg:pl-32"
                >
                    <div className={`transition-all duration-700 transform ${activeSection === 'anode' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                        <div className="bg-slate-900/80 backdrop-blur-md p-8 rounded-3xl border-l-4 border-emerald-500 max-w-md shadow-2xl pointer-events-auto text-left">
                            <div className="flex items-center gap-3 mb-4 text-emerald-400">
                                <Layers className="w-6 h-6" />
                                <h2 className="text-2xl font-bold text-white">{contentData.anode.cardTitle}</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed">{contentData.anode.cardBody}</p>
                            {contentData.anode.cardDetail && (
                                <div className="mt-4 text-sm text-emerald-200 bg-emerald-900/30 p-3 rounded">{contentData.anode.cardDetail}</div>
                            )}
                            {contentData.anode.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                                    {contentData.anode.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Phase 2 Sections */}
                <section
                    id="atom"
                    ref={el => sectionRefs.current['atom'] = el}
                    className="h-[60vh] flex flex-col items-center justify-center"
                >
                    <div className={`transition-all duration-700 transform ${activeSection === 'atom' ? 'opacity-100 scale-100' : 'opacity-0 scale-90'}`}>
                        <div className="bg-indigo-950/90 backdrop-blur-md p-8 rounded-3xl border-l-4 border-indigo-500 max-w-md shadow-[0_0_50px_rgba(79,70,229,0.3)] pointer-events-auto text-left mx-auto">
                            <div className="flex items-center gap-3 mb-4 text-indigo-300">
                                <Microscope className="w-6 h-6" />
                                <h2 className="text-2xl font-bold text-white">{contentData.atom.cardTitle}</h2>
                            </div>
                            <p className="text-indigo-200 leading-relaxed text-sm">{contentData.atom.cardBody}</p>
                            {contentData.atom.cardDetail && (
                                <div className="mt-4 text-xs text-indigo-300 font-mono uppercase tracking-wider">{contentData.atom.cardDetail}</div>
                            )}
                            {contentData.atom.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                                    {contentData.atom.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                <section
                    id="particle"
                    ref={el => sectionRefs.current['particle'] = el}
                    className="h-[60vh] flex flex-col items-start justify-center pl-6 md:pl-16 lg:pl-32 pt-16"
                >
                    <div className={`transition-all duration-700 transform ${activeSection === 'particle' ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-20'}`}>
                        <div className="bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl border-l-4 border-slate-400 max-w-md shadow-2xl pointer-events-auto w-full">
                            <div className="flex items-center gap-3 mb-4 text-slate-300">
                                <Box className="w-6 h-6" />
                                <h2 className="text-2xl font-bold text-white">{contentData.particle.cardTitle}</h2>
                            </div>
                            <p className="text-slate-400 leading-relaxed text-sm mb-4">{contentData.particle.cardBody}</p>

                            {/* --- New Visualization Graphs --- */}
                            <div className="mt-6 flex gap-4 w-full">
                                {/* Graph 1: Gaussian - Particle Size Dist */}
                                <div className="flex-1 bg-slate-900/50 p-3 rounded-lg border border-slate-600">
                                    <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase flex items-center gap-2">
                                        <Activity className="w-3 h-3" /> Particle Size Dist.
                                    </div>
                                    <div className="relative h-16 w-full flex items-end overflow-hidden">
                                        <svg viewBox="0 0 100 60" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                                            <line x1="0" y1="60" x2="100" y2="60" stroke="#475569" strokeWidth="1" />
                                            {/* Bell curve shape - animated with CSS class 'animate-dist-curve' */}
                                            <path
                                                d="M0,60 C30,60 35,5 50,5 C65,5 70,60 100,60"
                                                fill="rgba(99, 102, 241, 0.2)"
                                                stroke="#818cf8"
                                                strokeWidth="2"
                                                className="animate-dist-curve origin-bottom"
                                            />
                                        </svg>
                                        <div className="absolute bottom-0 w-full text-center translate-y-4 text-[8px] text-slate-500">Particle Size (µm)</div>
                                    </div>
                                </div>

                                {/* Graph 2: Bar Plot - Properties */}
                                <div className="w-1/3 bg-slate-900/50 p-3 rounded-lg border border-slate-600 flex flex-col justify-between">
                                    <div className="text-[10px] text-slate-400 mb-2 font-bold uppercase text-center flex items-center justify-center gap-1">
                                        <BarChart3 className="w-3 h-3" /> Properties
                                    </div>
                                    <div className="flex items-end justify-around h-16 gap-1 pb-1">
                                        {/* Density Bar - Animated */}
                                        <div className="flex flex-col items-center gap-1 w-1/2 h-full justify-end">
                                            <div className="w-full bg-indigo-500 rounded-t-sm relative group hover:bg-indigo-400 transition-colors animate-density-bar"></div>
                                            <span className="text-[8px] text-slate-500">Density</span>
                                        </div>
                                        {/* Porosity Bar - Animated (Inverse) */}
                                        <div className="flex flex-col items-center gap-1 w-1/2 h-full justify-end">
                                            <div className="w-full bg-indigo-300/30 border border-indigo-300 rounded-t-sm group hover:bg-indigo-300/50 transition-colors animate-porosity-bar"></div>
                                            <span className="text-[8px] text-slate-500">Porosity</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {contentData.particle.cardDetail && (
                                <div className="mt-4 text-xs text-slate-400 font-mono text-center">{contentData.particle.cardDetail}</div>
                            )}
                            {contentData.particle.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                                    {contentData.particle.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-slate-600/50 text-slate-300 rounded-full border border-slate-500/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}

                        </div>
                    </div>
                </section>

                {/* Cell Wireframe Section - Two Cards */}
                <section
                    id="wireframe"
                    ref={el => sectionRefs.current['wireframe'] = el}
                    className="h-[60vh] flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 px-6 md:px-16 lg:px-32 pt-16"
                >
                    {/* Card 1 - Left side */}
                    <div className={`w-full lg:w-auto transition-all duration-700 delay-100 transform ${activeSection === 'wireframe' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                        <div className="w-full bg-slate-900/90 backdrop-blur-md p-6 rounded-xl border-l-4 border-indigo-500 max-w-xl lg:max-w-sm shadow-[0_0_30px_rgba(99,102,241,0.2)] pointer-events-auto text-left mx-auto">
                            <div className="flex items-center gap-3 mb-4 text-indigo-500">
                                <Grip className="w-5 h-5" />
                                <h2 className="text-xl font-bold text-white">{contentData.wireframe.cardTitle}</h2>
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm">{contentData.wireframe.cardBody}</p>
                            {contentData.wireframe.cardDetail && (
                                <div className="mt-4 text-xs text-indigo-300 font-mono">{contentData.wireframe.cardDetail}</div>
                            )}
                            {contentData.wireframe.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-start">
                                    {contentData.wireframe.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-indigo-500/30 text-indigo-200 rounded-full border border-indigo-400/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Card 2 - Right side */}
                    <div className={`w-full lg:w-auto transition-all duration-700 delay-300 transform ${activeSection === 'wireframe' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                        <div className="w-full bg-slate-900/90 backdrop-blur-md p-6 rounded-xl border-r-4 border-emerald-500 max-w-xl lg:max-w-sm shadow-[0_0_30px_rgba(16,185,129,0.2)] pointer-events-auto text-right mx-auto">
                            <div className="flex items-center justify-end gap-3 mb-4 text-emerald-500">
                                <h2 className="text-xl font-bold text-white">{contentData.wireframe2.cardTitle}</h2>
                                <Sliders className="w-5 h-5" />
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm">{contentData.wireframe2.cardBody}</p>
                            {contentData.wireframe2.cardDetail && (
                                <div className="mt-4 text-xs text-emerald-400 font-mono uppercase tracking-wider animate-pulse">
                                    {contentData.wireframe2.cardDetail}
                                </div>
                            )}
                            {contentData.wireframe2.cardTags && (
                                <div className="mt-4 flex flex-wrap gap-2 justify-end">
                                    {contentData.wireframe2.cardTags.map((tag, idx) => (
                                        <span key={idx} className="text-xs px-3 py-1 bg-emerald-500/30 text-emerald-200 rounded-full border border-emerald-400/50">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </section>

                {/* Contact/Opportunities Section */}
                <section
                    id="contact"
                    ref={el => sectionRefs.current['contact'] = el}
                    className="h-[60vh] flex flex-col items-center justify-center pointer-events-auto relative z-30"
                >
                    <div className={`transition-all duration-1000 transform ${activeSection === 'contact' ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-20'}`}>
                        <div className="bg-slate-900/80 backdrop-blur-xl p-8 sm:p-12 rounded-2xl border border-slate-700 shadow-2xl text-center max-w-2xl mx-auto pointer-events-auto w-full">
                            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full mx-auto mb-6 flex items-center justify-center shadow-lg">
                                <Battery className="w-8 h-8 text-white animate-pulse" />
                            </div>
                            <h2 className="text-3xl font-bold text-white mb-2">Looking for Opportunities</h2>
                            <p className="text-slate-400 mb-6 text-lg">
                                Seeking Internship / Full-time Roles<br />
                                <span className="text-indigo-400 font-semibold">Expected Graduation: 2026 - 2027</span>
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center w-full">
                                <a
                                    href="https://www.linkedin.com/in/zrzrv5"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 sm:flex-initial"
                                >
                                    <button className="w-full group bg-[#0077b5] hover:bg-[#006396] text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105 whitespace-nowrap text-sm sm:text-base">
                                        <Linkedin className="w-5 h-5 flex-shrink-0" />
                                        Message me on LinkedIn
                                    </button>
                                </a>
                                <a
                                    href="/ZHOU_Rui_Resume_2025.pdf"
                                    download="ZHOU_Rui_Resume_2025.pdf"
                                    className="flex-1 sm:flex-initial"
                                >
                                    <button className="w-full group bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-full font-semibold transition-all flex items-center justify-center gap-2 shadow-lg hover:scale-105 whitespace-nowrap text-sm sm:text-base">
                                        <Download className="w-5 h-5 flex-shrink-0" />
                                        Download Resume
                                    </button>
                                </a>
                            </div>
                        </div>
                    </div>
                </section>

            </div>
            <style>{`
        .perspective-container {
          perspective: 1200px;
        }
        @keyframes flow {
          0% { background-position: 0 0; }
          100% { background-position: 0 40px; }
        }
        .animate-flow {
          animation: flow 1.5s linear infinite;
        }
        .wireframe-mode {
          backface-visibility: visible;
        }
        
        /* Safari-optimized fade-in animation */
        @keyframes fade-in-scale {
          0% { 
            opacity: 0;
            transform: scale(0.8);
          }
          100% { 
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
          transform-origin: center center;
        }
        
        /* --- Optimization Animations (Connected Constraints) --- */
        
        @keyframes optimize-height {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(1.15); }
        }
        .animate-optimize-height {
          animation: optimize-height 4s ease-in-out infinite;
        }

        @keyframes optimize-width-left {
          0%, 100% { transform: scaleX(1) translateX(0); }
          50% { transform: scaleX(1.1) translateX(0); }
        }
        .animate-optimize-width-left {
          animation: optimize-width-left 5s ease-in-out infinite;
        }

        @keyframes optimize-width-right {
          0%, 100% { transform: scaleX(1) translateX(0); }
          50% { transform: scaleX(1.15) translateX(0); }
        }
        .animate-optimize-width-right {
          animation: optimize-width-right 5s ease-in-out infinite;
          animation-delay: 0.5s;
        }

        /* Tabs: Move position and resize slightly, sync Y with height expansion */
        @keyframes optimize-tab {
          0%, 100% { 
            transform: translateZ(-1px) translateX(0) translateY(0); 
            width: 3rem; 
          }
          50% { 
            transform: translateZ(-1px) translateX(10px) translateY(-0.75rem); 
            width: 2.5rem; 
          }
        }
        .animate-optimize-tab {
          animation: optimize-tab 4s ease-in-out infinite; /* Synced with height */
        }

        /* --- Graph Animations --- */

        @keyframes dist-shift {
          0%, 100% { transform: translateX(0px) scaleX(1); }
          50% { transform: translateX(10px) scaleX(0.8); }
        }
        .animate-dist-curve {
          animation: dist-shift 4s ease-in-out infinite;
        }

        @keyframes density-cycle {
          0%, 100% { height: 80%; }
          50% { height: 40%; }
        }
        .animate-density-bar {
          animation: density-cycle 4s ease-in-out infinite;
        }

        @keyframes porosity-cycle {
          0%, 100% { height: 20%; }
          50% { height: 60%; }
        }
        .animate-porosity-bar {
          animation: porosity-cycle 4s ease-in-out infinite;
        }

        ::-webkit-scrollbar {
          width: 10px;
        }
        ::-webkit-scrollbar-track {
          background: #020617;
        }
        ::-webkit-scrollbar-thumb {
          background: #3730a3;
          border-radius: 5px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #4f46e5;
        }
      `}</style>
        </div>
    );
};

export default BatteryExplorer;
