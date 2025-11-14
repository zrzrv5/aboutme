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
    if (!publicationsContainer) {
        console.warn('Publications container not found');
        return;
    }
    
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
                    <a href="${pub.link}" target="_blank" class="view-paper-link">View Paper</a>
                </div>
            ` : '';
            
            pubElement.innerHTML = `
                ${imageHTML}
                <div class="publication-content">
                    <h3><a href="${pub.link}" target="_blank">${pub.title}</a></h3>
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
        
    } catch (error) {
        console.error('Error loading publications:', error);
        publicationsContainer.innerHTML = '<p class="error-message">Could not load publications. Please try again later.</p>';
    }
}

// Patents loader
function loadPatents(limit = 2) {
    const patentsContainer = document.getElementById('patents-container');
    if (!patentsContainer) return;
    
    const patentItems = patentsContainer.querySelectorAll('.achievement-item');
    const loadMoreButton = document.getElementById('load-more-patents');
    if (!loadMoreButton) return;
    
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
}

// Load academic content from academic.html
async function loadAcademicContent() {
    const academicSection = document.querySelector('.academic-section');
    if (!academicSection) return;
    
    try {
        const response = await fetch('academic.html');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const html = await response.text();
        academicSection.innerHTML = html;
    } catch (error) {
        console.error('Error loading academic content:', error);
        academicSection.innerHTML = '<p class="error-message">Could not load academic content. Please try again later.</p>';
    }
}

// Load developer content from developer.html
async function loadDeveloperContent() {
    const developerSection = document.querySelector('.developer-section');
    if (!developerSection) return;
    
    try {
        const response = await fetch('developer.html');
        if (!response.ok) {
            throw new Error(`HTTP error: ${response.status}`);
        }
        const html = await response.text();
        developerSection.innerHTML = html;
    } catch (error) {
        console.error('Error loading developer content:', error);
        developerSection.innerHTML = '<p class="error-message">Could not load developer content. Please try again later.</p>';
    }
}

// Initialize everything when the document is ready
document.addEventListener('DOMContentLoaded', async function() {
    // Load content from separate files first
    await Promise.all([
        loadAcademicContent(),
        loadDeveloperContent()
    ]);
    
    // Initialize titles (mode switching)
    initTitles();
    
    // Set current year in footer
    const yearElement = document.getElementById('year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
    
    // Set up publications button (using event delegation since content is loaded dynamically)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'load-more-publications') {
            const button = e.target;
            if (button.textContent === 'Show Less') {
                loadPublications(4); // Show first 4 publications
            } else {
                loadPublications(100); // Show all publications
            }
        }
    });
    
    // Initial load of publications - show 4 by default
    loadPublications(4);
    
    // Initialize patents display (using event delegation)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'load-more-patents') {
            const patentItems = document.querySelectorAll('.achievement-item');
            const currentLimit = document.querySelectorAll('.achievement-item:not(.hidden)').length;
            
            if (currentLimit >= patentItems.length) {
                loadPatents(2); // Collapse back to 2 items
            } else {
                loadPatents(patentItems.length); // Show all items
            }
        }
    });
    
    // Initialize patents display
    loadPatents(2);
}); 