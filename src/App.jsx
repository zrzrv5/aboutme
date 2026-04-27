import React, { useCallback, useEffect, useState } from 'react';
import Header from './components/Header';
import Footer from './components/Footer';
import AcademicView from './components/AcademicView';
import DeveloperView from './components/DeveloperView';
import BatteryExplorer from './components/BatteryExplorer';

const MODE_CONFIG = {
  academic: {
    path: '/academic/',
    section: 'academic',
    title: 'Academic | Rui Zhou Battery Materials Research',
  },
  engineer: {
    path: '/industry/',
    section: 'industry',
    title: 'Industry | Rui Zhou Battery R&D And Simulation',
  },
  developer: {
    path: '/developer/',
    section: 'developer',
    title: 'Developer | Rui Zhou iOS Apps And Scientific Tools',
  },
};

const ROUTE_TO_MODE = Object.fromEntries(
  Object.entries(MODE_CONFIG).map(([mode, config]) => [config.path, mode]),
);

const normalizePath = (pathname) => {
  if (pathname === '/') return '/';
  return pathname.endsWith('/') ? pathname : `${pathname}/`;
};

const getModeFromPath = () => ROUTE_TO_MODE[normalizePath(window.location.pathname)] ?? 'academic';

function App() {
  const [mode, setMode] = useState(getModeFromPath);

  const handleModeChange = useCallback((newMode) => {
    const config = MODE_CONFIG[newMode];
    if (!config) return;

    if (window.gtag) {
      window.gtag('event', 'portfolio_section_select', {
        event_category: 'navigation',
        section_id: config.section,
        event_label: config.section,
      });
    }

    setMode(newMode);

    if (normalizePath(window.location.pathname) !== config.path) {
      window.history.pushState({ portfolioMode: newMode }, '', config.path);
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }, []);

  useEffect(() => {
    const handlePopState = () => {
      setMode(getModeFromPath());
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

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
    const config = MODE_CONFIG[mode];
    if (!config) return;

    document.title = config.title;

    if (window.gtag) {
      window.gtag('event', 'page_view', {
        page_title: config.title,
        page_location: window.location.href,
        page_path: window.location.pathname,
        portfolio_section: config.section,
      });
    }
  }, [mode]);

  useEffect(() => {
    const handleLinkClick = (event) => {
      const anchor = event.target.closest('a');
      if (!anchor || !window.gtag || !anchor.href) return;

      const url = new URL(anchor.href, window.location.href);
      const linkText = (anchor.innerText || anchor.textContent || '').trim();
      const isDownload = anchor.hasAttribute('download') || url.pathname.toLowerCase().endsWith('.pdf');
      const isOutbound = url.origin !== window.location.origin;

      if (isDownload) {
        window.gtag('event', 'file_download', {
          event_category: 'engagement',
          file_name: anchor.getAttribute('download') || url.pathname.split('/').pop(),
          link_url: url.href,
          link_text: linkText,
        });
      } else if (isOutbound) {
        window.gtag('event', 'outbound_link_click', {
          event_category: 'engagement',
          link_domain: url.hostname,
          link_url: url.href,
          link_text: linkText,
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

      <Header mode={mode} setMode={handleModeChange} />

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
