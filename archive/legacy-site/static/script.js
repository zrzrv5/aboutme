// Telemetry helper function
function trackEvent(category, action, label, value) {
    if (typeof gtag !== 'undefined') {
        gtag('event', action, {
            'event_category': category,
            'event_label': label,
            'value': value
        });
    }
}

// Handle the titles and mode switching
function initTitles() {
    const academicOption = document.querySelector('.academic-option');
    const developerOption = document.querySelector('.developer-option');
    const floatingSelector = document.getElementById('floating-mode-selector');
    const academicSelector = document.querySelector('.academic-selector');
    const developerSelector = document.querySelector('.developer-selector');
    const subtitle = document.querySelector('.subtitle-text');
    
    // Contact information configuration
    const academicContact = {
        email: {
            user: '[my first name last name no spaces]',
            // domain: 'iastate.edu'
            domain: '[my school domain]'
        },
        address: '📍 Iowa State University'
    };
    
    const developerContact = {
        email: {
            user: 'dev',
            domain: '1sec.plus'
        },
        address: '📬 PO Box 1015, Ames, Iowa, 50014'
    };
    
    function updateContactDisplay(isAcademic) {
        const emailDisplay = document.getElementById('email-display');
        const addressDisplay = document.getElementById('address-display');
        
        if (isAcademic) {
            emailDisplay.textContent = `${academicContact.email.user} [at] ${academicContact.email.domain}`;
            addressDisplay.textContent = academicContact.address;
        } else {
            emailDisplay.textContent = `${developerContact.email.user} [at] ${developerContact.email.domain}`;
            addressDisplay.textContent = developerContact.address;
        }
    }
    
    function switchToAcademic() {
        document.body.classList.remove('night-mode');
        academicOption.classList.add('active');
        developerOption.classList.remove('active');
        academicSelector.classList.add('active');
        developerSelector.classList.remove('active');
        subtitle.textContent = "Atoms go brrrrr";
        subtitle.classList.add('active');
        updateContactDisplay(true);
        
        // Show academic background, hide developer background
        document.querySelector('.academic-background').style.opacity = '0.5';
        document.querySelector('.developer-background').style.opacity = '0';
        
        // Track telemetry
        trackEvent('mode_switch', 'click', 'academic');
    }
    
    function switchToDeveloper() {
        document.body.classList.add('night-mode');
        developerOption.classList.add('active');
        academicOption.classList.remove('active');
        developerSelector.classList.add('active');
        academicSelector.classList.remove('active');
        subtitle.textContent = "Yep, native apps only";
        subtitle.classList.add('active');
        updateContactDisplay(false);
        
        // Hide academic background, show developer background
        document.querySelector('.academic-background').style.opacity = '0';
        document.querySelector('.developer-background').style.opacity = '0.25';
        
        // Track telemetry
        trackEvent('mode_switch', 'click', 'developer');
    }
    
    // Set initial state based on body class
    if (document.body.classList.contains('night-mode')) {
        switchToDeveloper();
    } else {
        switchToAcademic();
    }
    
    // Add click handlers
    academicOption.addEventListener('click', switchToAcademic);
    developerOption.addEventListener('click', switchToDeveloper);
    academicSelector.addEventListener('click', switchToAcademic);
    developerSelector.addEventListener('click', switchToDeveloper);
    
    // Handle floating selector visibility
    let lastScrollTop = 0;
    window.addEventListener('scroll', () => {
        const st = window.pageYOffset || document.documentElement.scrollTop;
        if (st > lastScrollTop && st > 200) {
            floatingSelector.classList.add('visible');
        } else if (st < 200) {
            floatingSelector.classList.remove('visible');
        }
        lastScrollTop = st <= 0 ? 0 : st;
    });
}

// Publications loader
async function loadPublications(limit = 4) {
    console.log("Loading publications with limit:", limit);
    const publicationsContainer = document.getElementById('publications-container');
    const loadMoreButton = document.getElementById('load-more-publications');
    const googleScholarButton = document.querySelector('.google-scholar-button');
    
    // Clear existing content
    publicationsContainer.innerHTML = '';
    
    try {
        const response = await fetch('publications.json');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        
        const publicationsData = await response.json();
        console.log(`Loaded ${publicationsData.length} publications from JSON`);
        
        // Show items based on the limit
        const itemsToShow = Math.min(limit, publicationsData.length);
        console.log(`Showing ${itemsToShow} of ${publicationsData.length} publications`);
        
        for (let i = 0; i < itemsToShow; i++) {
            const pub = publicationsData[i];
            
            const pubElement = document.createElement('div');
            pubElement.className = 'publication-item';
            
            // Process authors list
            const maxAuthors = 5;
            let authors = pub.authors.split(', ');
            let processedAuthors = authors;
            
            if (authors.length > maxAuthors) {
                const yourName = 'Rui Zhou';
                const yourIndex = authors.findIndex(author => author === yourName);
                
                if (yourIndex !== -1) {
                    if (yourIndex === 0) {
                        processedAuthors = [authors[0], '...', authors[authors.length - 1]];
                    } else if (yourIndex === authors.length - 1) {
                        processedAuthors = [authors[0], '...', authors[authors.length - 1]];
                    } else {
                        processedAuthors = [authors[0], '...', authors[yourIndex], '...', authors[authors.length - 1]];
                    }
                } else {
                    processedAuthors = [authors[0], '...', authors[authors.length - 1]];
                }
            }
            
            const formattedAuthors = processedAuthors.map(author => 
                author === 'Rui Zhou' ? `<strong>${author}</strong>` : author
            ).join(', ');
            
            // Handle different image types with responsive images
            let imageHTML = '';
            if (pub.coverImage || pub.abstractImage) {
                const imageSource = pub.coverImage || pub.abstractImage;
                const imageClass = pub.coverImage ? "publication-cover-image" : "publication-abstract-image";
                
                // Check if image exists and handle error gracefully with onerror attribute
                imageHTML = `
                    <div class="${imageClass}">
                        <img 
                            src="${imageSource.medium}"
                            alt="Figure for ${pub.title}"
                            loading="lazy"
                            onerror="this.style.display='none'; this.parentElement.style.display='none';">
                    </div>
                `;
            }
            
            // Create the abstract section with inline view paper button
            const abstractHTML = pub.abstract ? `
                <div class="abstract-wrapper">
                    <p class="publication-abstract">${pub.abstract}</p>
                    <a href="${pub.link}" target="_blank" class="view-paper-link" data-telemetry-label="${pub.title}">View Paper</a>
                </div>
            ` : '';
            
            pubElement.innerHTML = `
                ${imageHTML}
                <div class="publication-content">
                    <h3><a href="${pub.link}" target="_blank" class="publication-title-link" data-telemetry-label="${pub.title}">${pub.title}</a></h3>
                    <div class="authors">${formattedAuthors}</div>
                    <div class="journal">${pub.journal}, ${pub.year}</div>
                    ${abstractHTML}
                </div>
            `;
            
            publicationsContainer.appendChild(pubElement);
        }
        
        // Update the button text and visibility
        if (itemsToShow >= publicationsData.length) {
            loadMoreButton.textContent = 'Show Less';
            googleScholarButton.style.display = 'flex';
        } else {
            loadMoreButton.textContent = 'Show More Publications';
            googleScholarButton.style.display = 'none';
        }
        
        // Track telemetry for publication load/expand
        trackEvent('publication', 'load', `showing_${itemsToShow}_of_${publicationsData.length}`, itemsToShow);
        
    } catch (error) {
        console.error('Error loading publications:', error);
        publicationsContainer.innerHTML = '<p class="error-message">Could not load publications. Please try again later.</p>';
    }
}

// Patents loader
function loadPatents(limit = 2) {
    const patentsContainer = document.getElementById('patents-container');
    const patentItems = patentsContainer.querySelectorAll('.achievement-item');
    const loadMoreButton = document.getElementById('load-more-patents');
    
    // Show/hide items based on limit
    patentItems.forEach((item, index) => {
        if (index < limit) {
            item.classList.remove('hidden');
        } else {
            item.classList.add('hidden');
        }
    });
    
    // Update button text and visibility
    if (limit >= patentItems.length) {
        loadMoreButton.textContent = 'Show Less';
    } else {
        loadMoreButton.textContent = 'Show More Patents';
    }
    
    // Track telemetry for patent load/expand
    trackEvent('publication', 'load', `patents_showing_${limit}_of_${patentItems.length}`, limit);
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', function() {
    // Initialize titles
    initTitles();
    
    // Set up publications button
    const loadMoreButton = document.getElementById('load-more-publications');
    if (loadMoreButton) {
        loadMoreButton.addEventListener('click', function() {
            if (this.textContent === 'Show Less') {
                trackEvent('button', 'click', 'show_less_publications');
                loadPublications(4); // Show first 4 publications
            } else {
                trackEvent('button', 'click', 'show_more_publications');
                loadPublications(100); // Show all publications
            }
        });
    }
    
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Initial load of publications - show 4 by default
    loadPublications(4);
    
    // Initialize patents display
    const loadMorePatentsButton = document.getElementById('load-more-patents');
    if (loadMorePatentsButton) {
        loadMorePatentsButton.addEventListener('click', function() {
            const patentItems = document.querySelectorAll('.achievement-item');
            const currentLimit = document.querySelectorAll('.achievement-item:not(.hidden)').length;
            
            if (currentLimit >= patentItems.length) {
                trackEvent('button', 'click', 'show_less_patents');
                loadPatents(2); // Collapse back to 2 items
            } else {
                trackEvent('button', 'click', 'show_more_patents');
                loadPatents(patentItems.length); // Show all items
            }
        });
    }
    
    // Initialize patents display
    loadPatents(2);
    
    // Track external links using event delegation
    document.addEventListener('click', function(e) {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || href === '#' || href.startsWith('#')) return;
        
        // Determine link type
        let linkType = 'external';
        let label = href;
        
        // Check for specific link types
        if (href.includes('apps.apple.com')) {
            linkType = 'app_store';
            // Try to get app name from parent context
            const appCard = link.closest('.app-card');
            if (appCard) {
                const appTitle = appCard.querySelector('h3');
                label = appTitle ? appTitle.textContent : 'app_store_link';
            } else {
                label = 'app_store_link';
            }
        } else if (href.includes('scholar.google.com')) {
            linkType = 'social';
            label = 'google_scholar';
        } else if (href.includes('linkedin.com')) {
            linkType = 'social';
            label = 'linkedin';
        } else if (href.includes('github.com')) {
            linkType = 'social';
            label = 'github';
        } else if (href.includes('testflight.apple.com')) {
            linkType = 'testflight';
            label = 'testflight_link';
        } else if (href.includes('x.com') || href.includes('twitter.com')) {
            linkType = 'social';
            label = 'twitter';
        } else if (link.classList.contains('view-paper-link')) {
            linkType = 'publication';
            label = link.getAttribute('data-telemetry-label') || 'publication_link';
        } else if (link.classList.contains('publication-title-link')) {
            linkType = 'publication';
            label = link.getAttribute('data-telemetry-label') || 'publication_title';
        } else if (link.classList.contains('project-link')) {
            linkType = 'project';
            const projectCard = link.closest('.project-card');
            if (projectCard) {
                const projectTitle = projectCard.querySelector('h3');
                label = projectTitle ? projectTitle.textContent : 'project_link';
            } else {
                label = 'project_link';
            }
        } else if (link.classList.contains('app-link-product')) {
            linkType = 'app';
            const appCard = link.closest('.app-card');
            if (appCard) {
                const appTitle = appCard.querySelector('h3');
                label = appTitle ? `${appTitle.textContent}_product_page` : 'app_product_page';
            } else {
                label = 'app_product_page';
            }
        } else if (link.classList.contains('google-scholar-button')) {
            linkType = 'social';
            label = 'google_scholar_button';
        }
        
        // Track the link click
        trackEvent('link', 'click', label);
    });
}); 