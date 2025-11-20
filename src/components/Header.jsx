import React, { useState, useEffect } from 'react';

const Header = ({ mode, setMode }) => {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleModeChange = (newMode) => {
    setMode(newMode);
    if (window.gtag) {
      window.gtag('event', 'tab_press', {
        event_category: 'navigation',
        event_label: newMode
      });
    }
  };

  // Helper to get active classes for title options
  const getTitleOptionClass = (optionMode) => {
    const baseClass = "cursor-pointer transition-all duration-300 p-2 rounded-lg hover:-translate-y-0.5";
    const isActive = mode === optionMode;

    let activeColorClass = "";
    if (isActive) {
      if (optionMode === 'academic') activeColorClass = "text-[#4a90e2] bg-[#4a90e2]/10";
      else if (optionMode === 'engineer') activeColorClass = "text-emerald-500 bg-emerald-500/10"; // Using emerald for engineer to match battery view
      else if (optionMode === 'developer') activeColorClass = "text-[#9c27b0] bg-[#9c27b0]/10";
    } else {
      activeColorClass = "opacity-40 scale-90 hover:opacity-60";
      if (mode === 'developer' || mode === 'engineer') activeColorClass += " text-white/70";
      else activeColorClass += " text-slate-700";
    }

    return `${baseClass} ${activeColorClass}`;
  };

  // Helper to get title text size classes
  const getTitleClass = (optionMode) => {
    const isActive = mode === optionMode;
    return `font-extrabold leading-tight transition-all duration-300 ${isActive ? 'text-4xl md:text-6xl' : 'text-3xl md:text-5xl'}`;
  };

  // Helper for floating selector classes
  const getSelectorClass = (optionMode) => {
    const baseClass = "floating-tab-button";
    const isActive = mode === optionMode;

    let classes = baseClass;

    if (isActive) {
      if (optionMode === 'academic') classes += ' bg-[#4a90e2] text-white shadow-lg';
      else if (optionMode === 'engineer') classes += ' bg-emerald-500 text-white shadow-lg';
      else if (optionMode === 'developer') classes += ' bg-[#9c27b0] text-white shadow-lg';
    } else {
      const hoverBg = (mode === 'developer' || mode === 'engineer') ? 'hover:bg-slate-700' : 'hover:bg-slate-200';
      const textColor = (mode === 'developer' || mode === 'engineer') ? 'text-slate-300' : 'text-slate-600';
      classes += ` ${textColor} ${hoverBg}`;
    }

    return classes;
  };

  return (
    <section className="flex flex-col items-center justify-center pt-5 pb-8 px-4 text-center mb-2.5">
      <div className={`text-3xl md:text-4xl font-bold mb-1 opacity-80 transition-colors duration-300 ${mode === 'academic' ? 'text-slate-800' : 'text-slate-100'}`}>I'm</div>

      <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-4">
        {/* Academic Option */}
        <div
          className={getTitleOptionClass('academic')}
          onClick={() => handleModeChange('academic')}
        >
          <div className={getTitleClass('academic')}>Ph.D. Candidate</div>
        </div>

        <div className="max-md:hidden text-4xl md:text-5xl font-light text-slate-400 select-none mx-2">/</div>

        {/* Engineer Option (Middle) */}
        <div
          className={getTitleOptionClass('engineer')}
          onClick={() => handleModeChange('engineer')}
        >
          <div className={getTitleClass('engineer')}>Battery Engineer</div>
        </div>

        <div className="max-md:hidden text-4xl md:text-5xl font-light text-slate-400 select-none mx-2">/</div>

        {/* Developer Option */}
        <div
          className={getTitleOptionClass('developer')}
          onClick={() => handleModeChange('developer')}
        >
          <div className={getTitleClass('developer')}>iOS Developer</div>
        </div>
      </div>

      <div className={`text-base md:text-lg font-normal mt-4 opacity-80 transition-opacity duration-200 h-6 ${mode === 'academic' ? 'text-slate-600' : 'text-slate-300'}`}>
        {mode === 'academic' ? "Atoms go brrrrr" : mode === 'engineer' ? " " : "Yep, native apps only"}
      </div>

      {/* Floating Selector */}
      <div
        className={`fixed left-1/2 -translate-x-1/2 backdrop-blur-md shadow-xl rounded-full flex z-50 transition-all duration-300 ${mode === 'academic' ? 'bg-white/95 border-slate-200' : 'bg-slate-900/95 border-slate-700'} border ${isScrolled ? 'top-5 opacity-100' : '-top-24 opacity-0 pointer-events-none'}`}
        style={{ padding: '8px' }}
      >
        <div
          className={getSelectorClass('academic')}
          onClick={() => handleModeChange('academic')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModeChange('academic')}
        >
          🔬 Academic
        </div>

        <div
          className={getSelectorClass('engineer')}
          onClick={() => handleModeChange('engineer')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModeChange('engineer')}
        >
          🔋 Engineer
        </div>

        <div
          className={getSelectorClass('developer')}
          onClick={() => handleModeChange('developer')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && handleModeChange('developer')}
        >
          👨‍💻 Developer
        </div>
      </div>
    </section>
  );
};

export default Header;
