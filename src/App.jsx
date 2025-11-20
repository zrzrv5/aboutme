import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AcademicView from './components/AcademicView';
import DeveloperView from './components/DeveloperView';
import BatteryExplorer from './components/BatteryExplorer';

function App() {
  const [mode, setMode] = useState('academic');

  useEffect(() => {
    // Update body class and background for different modes
    if (mode === 'developer') {
      document.body.classList.add('night-mode');
      document.body.classList.remove('engineer-mode');
      document.body.style.backgroundColor = '#121212';
    } else if (mode === 'engineer') {
      document.body.classList.remove('night-mode');
      document.body.classList.add('engineer-mode');
      document.body.style.backgroundColor = '#020617'; // slate-950
    } else {
      document.body.classList.remove('night-mode');
      document.body.classList.remove('engineer-mode');
      document.body.style.backgroundColor = '#f8f9fa';
    }
  }, [mode]);

  useEffect(() => {
    const handleLinkClick = (event) => {
      const anchor = event.target.closest('a');
      if (anchor && window.gtag) {
        window.gtag('event', 'link_click', {
          event_category: 'navigation',
          event_label: anchor.href,
          link_text: anchor.innerText || anchor.textContent
        });
      }
    };

    document.addEventListener('click', handleLinkClick);
    return () => document.removeEventListener('click', handleLinkClick);
  }, []);

  return (
    <>
      <div className="academic-background"></div>
      <div className="developer-background">
        <div className="ocean">
          <div className="wave"></div>
          <div className="wave"></div>
          <div className="wave"></div>
        </div>
      </div>

      <Header mode={mode} setMode={setMode} />

      {/* Engineer mode renders outside the container structure */}
      {mode === 'engineer' ? (
        <BatteryExplorer />
      ) : (
        <div className="main-content">
          <div className="container">
            <div className="view-container">
              <div className={`view-content ${mode === 'academic' ? 'active' : 'inactive'}`}>
                <AcademicView />
              </div>
              <div className={`view-content ${mode === 'developer' ? 'active' : 'inactive'}`}>
                <DeveloperView />
              </div>
            </div>
          </div>
        </div>
      )}

      <Footer mode={mode} />
    </>
  );
}

export default App;
