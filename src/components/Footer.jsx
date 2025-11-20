import React from 'react';

const Footer = ({ mode }) => {
    const isDeveloper = mode === 'developer';
    const year = new Date().getFullYear();

    const contactInfo = isDeveloper ? {
        email: 'dev [at] 1sec.plus',
        address: '📬 PO Box 1015, Ames, Iowa, 50014'
    } : {
        email: '[my first name last name no spaces] [at] [my school domain]',
        address: '📍 Iowa State University'

    };

    return (
        <footer id="contact" className="site-footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-info">
                        <h3>Contact Me</h3>
                        <ul className="contact-list">
                            <li>📧 <span id="email-display">{contactInfo.email}</span></li>
                            <li><span id="address-display">{contactInfo.address}</span></li>
                        </ul>
                    </div>
                    <div className="footer-social">
                        <h3>Connect</h3>
                        <div className="social-links">
                            <a href="https://www.linkedin.com/in/zrzrv5" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
                                <i className="fab fa-linkedin"></i>
                            </a>
                            <a href="https://scholar.google.com/citations?user=p27FiGAAAAAJ" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="Google Scholar">
                                <i className="fas fa-graduation-cap"></i>
                            </a>
                            <a href="https://github.com/zrzrv5" className="social-link" target="_blank" rel="noopener noreferrer" aria-label="GitHub">
                                <i className="fab fa-github"></i>
                            </a>
                        </div>
                    </div>
                </div>
                <div className="copyright">
                    &copy; <span id="year">{year}</span> 1sec.plus All Rights Reserved.
                </div>
            </div>
        </footer>
    );
};

export default Footer;
