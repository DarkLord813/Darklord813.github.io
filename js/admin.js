* {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body {
    font-family: 'Poppins', sans-serif;
    line-height: 1.6;
    color: #333;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    min-height: 100vh;
}

.container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

/* Header */
header {
    background: rgba(255, 255, 255, 0.95);
    box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
    position: sticky;
    top: 0;
    z-index: 1000;
    backdrop-filter: blur(10px);
}

header .container {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 20px;
}

.logo {
    font-size: 28px;
    font-weight: 700;
    color: #667eea;
    display: flex;
    align-items: center;
    gap: 10px;
}

.logo span {
    color: #764ba2;
}

nav ul {
    display: flex;
    list-style: none;
    gap: 25px;
}

nav a {
    text-decoration: none;
    color: #555;
    font-weight: 500;
    font-size: 16px;
    transition: color 0.3s;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 15px;
    border-radius: 50px;
}

nav a:hover {
    color: #667eea;
    background: rgba(102, 126, 234, 0.1);
}

nav a.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.admin-btn {
    background: linear-gradient(135deg, #FF5722 0%, #FF9800 100%);
    color: white !important;
    padding: 10px 20px !important;
}

.admin-btn:hover {
    background: linear-gradient(135deg, #E64A19 0%, #F57C00 100%);
    transform: translateY(-2px);
}

/* Hero Section */
.hero {
    text-align: center;
    padding: 60px 20px;
    background: linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%);
    border-radius: 20px;
    margin: 30px 0;
    backdrop-filter: blur(10px);
}

.hero h2 {
    font-size: 36px;
    margin-bottom: 20px;
    color: #333;
}

.hero p {
    font-size: 18px;
    color: #666;
    max-width: 600px;
    margin: 0 auto 30px;
}

.btn-primary {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    padding: 15px 30px;
    border-radius: 50px;
    text-decoration: none;
    font-weight: 600;
    font-size: 18px;
    transition: all 0.3s;
    box-shadow: 0 5px 15px rgba(76, 175, 80, 0.3);
}

.btn-primary:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 25px rgba(76, 175, 80, 0.4);
}

/* Game Display - Image at Top */
.game-display {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
    margin: 40px 0;
    transition: transform 0.3s;
}

.game-display:hover {
    transform: translateY(-5px);
}

/* Game Image - Large at Top */
.game-image-top {
    width: 100%;
    height: 350px;
    overflow: hidden;
    position: relative;
}

.game-image-top img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.game-display:hover .game-image-top img {
    transform: scale(1.05);
}

/* Platform Overlay on Image */
.platform-overlay {
    position: absolute;
    top: 20px;
    left: 20px;
    z-index: 2;
}

.platform-badge-large {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    border-radius: 25px;
    font-weight: 600;
    font-size: 14px;
    color: white;
    backdrop-filter: blur(10px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.2);
}

.platform-badge-large.android {
    background: linear-gradient(135deg, rgba(255, 0, 0, 0.9) 0%, rgba(139, 0, 0, 0.9) 100%);
}

.platform-badge-large.pc {
    background: linear-gradient(135deg, rgba(0, 123, 255, 0.9) 0%, rgba(0, 86, 179, 0.9) 100%);
}

.platform-badge-large.psp {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.9) 0%, rgba(184, 134, 11, 0.9) 100%);
    color: #000;
}

.platform-badge-large.ps2 {
    background: linear-gradient(135deg, rgba(128, 0, 128, 0.9) 0%, rgba(75, 0, 130, 0.9) 100%);
}

/* Game Details Section */
.game-details-section {
    padding: 30px;
}

.game-header {
    margin-bottom: 25px;
}

.game-header h2 {
    font-size: 32px;
    color: #333;
    margin-bottom: 10px;
}

.game-meta {
    display: flex;
    gap: 20px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

.game-meta span {
    background: #f8f9fa;
    padding: 8px 15px;
    border-radius: 20px;
    font-size: 14px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 8px;
}

.game-meta i {
    color: #667eea;
}

/* Star Ratings - Gold */
.stars {
    color: #FFD700;
    font-size: 24px;
    margin: 15px 0;
    display: flex;
    gap: 3px;
}

.stars i {
    transition: all 0.3s;
}

.stars .fa-star-half-alt {
    color: #FFD700;
}

/* Game Description */
.game-description {
    color: #666;
    line-height: 1.8;
    margin: 20px 0;
    padding: 20px;
    background: #f8f9fa;
    border-radius: 15px;
    border-left: 4px solid #667eea;
}

/* MOD Badge */
.mod-badge {
    display: inline-block;
    background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
    color: #333;
    padding: 12px 25px;
    border-radius: 25px;
    font-weight: 600;
    margin: 20px 0;
    font-size: 16px;
    animation: pulse 2s infinite;
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.3);
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
}

/* Download Section */
.download-section {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 30px;
    margin: 30px 0;
    padding: 30px;
    background: #f8f9fa;
    border-radius: 20px;
    align-items: center;
}

.platform, .rating {
    display: flex;
    flex-direction: column;
    justify-content: center;
}

.platform h3, .rating {
    display: flex;
    align-items: center;
    gap: 10px;
    color: #333;
    margin-bottom: 10px;
}

.platform-name {
    font-size: 20px;
    font-weight: 600;
    color: #667eea;
}

.rating-text {
    color: #666;
    font-weight: 500;
    background: white;
    padding: 8px 15px;
    border-radius: 20px;
    box-shadow: 0 3px 10px rgba(0,0,0,0.1);
}

.download-btn {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    padding: 18px 35px;
    font-size: 18px;
    font-weight: 600;
    border-radius: 15px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12px;
    transition: all 0.3s;
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
    width: 100%;
}

.download-btn:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(76, 175, 80, 0.4);
}

.download-btn:active {
    transform: translateY(-1px);
}

/* Voting Section */
.voting-section {
    text-align: center;
    padding: 40px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 20px;
    margin: 40px 0;
    border: 2px solid rgba(255, 215, 0, 0.2);
}

.voting-section h2 {
    font-size: 28px;
    margin-bottom: 20px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.voting-stars {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin: 25px 0;
    direction: rtl;
}

.voting-star {
    font-size: 48px;
    color: #e0e0e0;
    cursor: pointer;
    transition: all 0.3s;
}

.voting-star:hover,
.voting-star:hover ~ .voting-star {
    color: #FFD700;
}

.voting-star.selected {
    color: #FFD700;
}

.vote-button {
    background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
    color: white;
    border: none;
    padding: 15px 40px;
    border-radius: 50px;
    font-size: 18px;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s;
    margin-top: 20px;
    box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
}

.vote-button:hover {
    transform: translateY(-3px);
    box-shadow: 0 12px 25px rgba(76, 175, 80, 0.4);
}

.vote-button:disabled {
    background: #cccccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
}

.vote-count {
    font-size: 16px;
    color: #666;
    margin-top: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.vote-count i {
    color: #4CAF50;
}

.current-rating {
    margin: 25px 0;
}

.average-rating {
    font-size: 48px;
    font-weight: 700;
    color: #FFD700;
    text-shadow: 2px 2px 8px rgba(0,0,0,0.15);
    margin-bottom: 10px;
}

/* Social Icons - Spread Out */
.social-section {
    text-align: center;
    padding: 50px 30px;
    background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
    border-radius: 20px;
    margin: 50px 0;
}

.social-section h2 {
    font-size: 32px;
    margin-bottom: 15px;
    color: #333;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
}

.social-section p {
    color: #666;
    font-size: 18px;
    margin-bottom: 40px;
    max-width: 600px;
    margin-left: auto;
    margin-right: auto;
}

.social-icons {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 30px;
    margin-top: 30px;
}

.social-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 20px;
    padding: 35px 25px;
    background: white;
    border-radius: 25px;
    text-decoration: none;
    color: white;
    transition: all 0.3s;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    position: relative;
    overflow: hidden;
}

.social-icon::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 6px;
    background: rgba(255, 255, 255, 0.4);
}

.social-icon i {
    font-size: 56px;
    margin-bottom: 15px;
    transition: transform 0.3s;
}

.social-icon span {
    font-weight: 700;
    font-size: 18px;
    text-align: center;
}

.social-icon small {
    font-size: 14px;
    opacity: 0.9;
}

.social-icon:hover {
    transform: translateY(-12px) scale(1.04);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.social-icon:hover i {
    transform: scale(1.25);
}

/* Social icon colors */
.social-icon.youtube {
    background: linear-gradient(135deg, #FF0000, #CC0000);
}

.social-icon.telegram {
    background: linear-gradient(135deg, #0088cc, #006699);
}

.social-icon.instagram {
    background: linear-gradient(45deg, #405DE6, #5851DB, #833AB4, #C13584, #E1306C, #FD1D1D);
}

.social-icon.tiktok {
    background: linear-gradient(135deg, #000000, #333333, #69C9D0, #EE1D52);
    background-size: 300% 300%;
    animation: gradient 3s ease infinite;
}

@keyframes gradient {
    0% { background-position: 0% 50%; }
    50% { background-position: 100% 50%; }
    100% { background-position: 0% 50%; }
}

/* Games Grid for Homepage */
.games-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 30px;
    margin: 40px 0;
}

.game-item {
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 10px 25px rgba(0,0,0,0.1);
    transition: all 0.3s;
    display: flex;
    flex-direction: column;
}

.game-item:hover {
    transform: translateY(-10px);
    box-shadow: 0 20px 40px rgba(0,0,0,0.2);
}

.game-item-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    transition: transform 0.5s;
}

.game-item:hover .game-item-img {
    transform: scale(1.05);
}

.game-item-info {
    padding: 25px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
}

.game-item-title {
    font-size: 20px;
    font-weight: 700;
    margin-bottom: 15px;
    color: #333;
    line-height: 1.4;
}

.game-item-meta {
    display: flex;
    gap: 15px;
    margin-bottom: 15px;
    flex-wrap: wrap;
}

/* Platform Tags */
.game-platform-tag {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    padding: 6px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
}

.game-platform-tag.android {
    background: linear-gradient(135deg, #FF0000 0%, #8B0000 100%);
    color: white;
}

.game-platform-tag.pc {
    background: linear-gradient(135deg, #007BFF 0%, #0056B3 100%);
    color: white;
}

.game-platform-tag.psp {
    background: linear-gradient(135deg, #FFD700 0%, #B8860B 100%);
    color: #000;
}

.game-platform-tag.ps2 {
    background: linear-gradient(135deg, #800080 0%, #4B0082 100%);
    color: white;
}

.game-item-meta span {
    background: #f8f9fa;
    padding: 6px 12px;
    border-radius: 15px;
    font-size: 13px;
    color: #666;
    display: flex;
    align-items: center;
    gap: 6px;
}

/* Mini Rating in Game Cards */
.game-rating-mini {
    margin: 15px 0;
    display: flex;
    align-items: center;
    gap: 15px;
}

.game-rating-mini .stars {
    font-size: 16px;
    margin: 0;
}

.mini-rating-text {
    font-size: 14px;
    color: #666;
    font-weight: 600;
    background: #f8f9fa;
    padding: 5px 12px;
    border-radius: 15px;
}

.game-item-desc {
    color: #666;
    font-size: 14px;
    line-height: 1.6;
    margin-bottom: 20px;
    flex-grow: 1;
}

.game-item-download {
    background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%);
    color: white;
    border: none;
    padding: 14px 25px;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    transition: all 0.3s;
    margin-top: auto;
}

.game-item-download:hover {
    background: linear-gradient(135deg, #1976D2 0%, #1565C0 100%);
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(33, 150, 243, 0.3);
}

/* Games Page Header */
.games-header {
    margin: 40px 0;
}

.games-header h1 {
    font-size: 36px;
    color: #333;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 15px;
}

.search-filter {
    display: flex;
    gap: 20px;
    margin: 20px 0;
    flex-wrap: wrap;
    background: white;
    padding: 25px;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.search-box {
    flex: 1;
    min-width: 250px;
    position: relative;
}

.search-box i {
    position: absolute;
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
    color: #667eea;
    font-size: 18px;
}

.search-box input {
    width: 100%;
    padding: 16px 20px 16px 55px;
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    font-size: 16px;
    transition: border-color 0.3s;
}

.search-box input:focus {
    outline: none;
    border-color: #667eea;
}

.genre-filter, .platform-filter {
    padding: 16px 20px;
    border: 2px solid #e0e0e0;
    border-radius: 15px;
    font-size: 16px;
    min-width: 180px;
    background: white;
    color: #333;
    cursor: pointer;
    transition: all 0.3s;
}

.genre-filter:focus, .platform-filter:focus {
    outline: none;
    border-color: #667eea;
}

/* No Games Message */
.no-games {
    text-align: center;
    padding: 60px 20px;
    background: white;
    border-radius: 20px;
    margin: 40px 0;
}

.no-games i {
    color: #667eea;
    margin-bottom: 20px;
}

.no-games h3 {
    font-size: 24px;
    color: #333;
    margin-bottom: 15px;
}

.no-games p {
    color: #666;
    font-size: 18px;
    margin-bottom: 30px;
}

/* Footer */
footer {
    background: rgba(0, 0, 0, 0.9);
    color: white;
    text-align: center;
    padding: 40px 20px;
    margin-top: 60px;
}

footer p {
    margin-bottom: 15px;
}

.disclaimer {
    font-size: 14px;
    color: #aaa;
    max-width: 800px;
    margin: 0 auto 25px;
    line-height: 1.6;
}

.footer-links {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-top: 25px;
    flex-wrap: wrap;
}

.footer-links a {
    color: #aaa;
    text-decoration: none;
    transition: color 0.3s;
    font-size: 15px;
}

.footer-links a:hover {
    color: white;
}

/* Star animations */
@keyframes starGlow {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.2); opacity: 0.8; }
}

.stars i:nth-child(1) { animation: starGlow 3s infinite 0.1s; }
.stars i:nth-child(2) { animation: starGlow 3s infinite 0.3s; }
.stars i:nth-child(3) { animation: starGlow 3s infinite 0.5s; }
.stars i:nth-child(4) { animation: starGlow 3s infinite 0.7s; }
.stars i:nth-child(5) { animation: starGlow 3s infinite 0.9s; }

/* Rating Breakdown */
.rating-breakdown-section {
    margin: 40px 0;
    padding: 30px;
    background: white;
    border-radius: 20px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.1);
}

.rating-breakdown-section h3 {
    font-size: 24px;
    margin-bottom: 25px;
    color: #333;
    display: flex;
    align-items: center;
    gap: 10px;
}

.rating-breakdown {
    display: flex;
    flex-direction: column;
    gap: 12px;
    max-width: 500px;
}

.rating-bar {
    display: flex;
    align-items: center;
    gap: 15px;
}

.rating-stars {
    font-size: 16px;
    color: #FFD700;
    width: 100px;
}

.rating-progress {
    flex: 1;
    height: 10px;
    background: #e0e0e0;
    border-radius: 5px;
    overflow: hidden;
}

.rating-fill {
    height: 100%;
    background: linear-gradient(90deg, #FFD700 0%, #FFA500 100%);
    border-radius: 5px;
    transition: width 1s ease;
}

.rating-percent {
    font-size: 16px;
    color: #666;
    width: 50px;
    text-align: right;
    font-weight: 600;
}

/* Featured Game */
.featured-game {
    margin: 50px 0;
}

.featured-game h2 {
    font-size: 32px;
    color: #333;
    margin-bottom: 30px;
    display: flex;
    align-items: center;
    gap: 15px;
}

/* Theme Toggle Button */
.theme-toggle {
    position: fixed;
    bottom: 30px;
    right: 30px;
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border: none;
    cursor: pointer;
    z-index: 1000;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    transition: all 0.3s;
}

.theme-toggle:hover {
    transform: scale(1.1) rotate(15deg);
    box-shadow: 0 12px 30px rgba(0,0,0,0.3);
}

/* Dark Theme */
.dark-theme {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%) !important;
    color: #ffffff !important;
}

.dark-theme main {
    background: #2d2d44 !important;
    color: #ffffff !important;
}

.dark-theme .game-display,
.dark-theme .game-item,
.dark-theme .search-filter,
.dark-theme .no-games,
.dark-theme .rating-breakdown-section,
.dark-theme .social-icon,
.dark-theme .download-section,
.dark-theme .voting-section,
.dark-theme .social-section {
    background: #3a3a5d !important;
    color: #ffffff !important;
}

.dark-theme .game-header h2,
.dark-theme .game-item-title,
.dark-theme h1, 
.dark-theme h2, 
.dark-theme h3,
.dark-theme .games-header h1,
.dark-theme .featured-game h2,
.dark-theme .social-section h2,
.dark-theme .voting-section h2 {
    color: #ffffff !important;
}

.dark-theme .game-meta span,
.dark-theme .game-description,
.dark-theme .mini-rating-text,
.dark-theme .rating-text,
.dark-theme .vote-count,
.dark-theme .social-section p {
    color: #cccccc !important;
    background: #2d2d44 !important;
}

.dark-theme .game-description {
    border-left-color: #667eea;
}

.dark-theme .search-box input,
.dark-theme .genre-filter,
.dark-theme .platform-filter {
    background: #2d2d44;
    color: #ffffff;
    border-color: #4a4a6d;
}

.dark-theme .search-box i {
    color: #667eea;
}

/* Responsive Design */
@media (max-width: 1024px) {
    .social-icons {
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 25px;
    }
    
    .game-image-top {
        height: 300px;
    }
}

@media (max-width: 768px) {
    header .container {
        flex-direction: column;
        gap: 15px;
    }
    
    nav ul {
        flex-wrap: wrap;
        justify-content: center;
        gap: 10px;
    }
    
    .game-display {
        margin: 20px 0;
    }
    
    .game-image-top {
        height: 250px;
    }
    
    .social-icons {
        grid-template-columns: repeat(2, 1fr);
        gap: 20px;
    }
    
    .social-icon {
        padding: 25px 15px;
    }
    
    .social-icon i {
        font-size: 42px;
    }
    
    .games-grid {
        grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
        gap: 20px;
    }
    
    .search-filter {
        flex-direction: column;
    }
    
    .search-box, .genre-filter, .platform-filter {
        width: 100%;
    }
    
    .download-section {
        grid-template-columns: 1fr;
        gap: 20px;
    }
    
    .voting-star {
        font-size: 36px;
    }
}

@media (max-width: 480px) {
    .social-icons {
        grid-template-columns: 1fr;
        max-width: 300px;
        margin-left: auto;
        margin-right: auto;
    }
    
    .game-image-top {
        height: 200px;
    }
    
    .game-header h2 {
        font-size: 24px;
    }
    
    .game-meta {
        flex-direction: column;
        align-items: flex-start;
        gap: 10px;
    }
    
    .voting-star {
        font-size: 32px;
    }
    
    .social-icon i {
        font-size: 36px;
    }
    
    .social-icon span {
        font-size: 16px;
    }
    
    .footer-links {
        flex-direction: column;
        gap: 15px;
    }
}

/* Featured Game Card */
.featured-game .game-card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
}

.featured-game .game-image {
    width: 100%;
    height: 250px;
    overflow: hidden;
}

.featured-game .game-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s;
}

.featured-game .game-card:hover .game-image img {
    transform: scale(1.05);
}

.featured-game .game-details {
    padding: 30px;
}

.featured-game .game-details h3 {
    font-size: 28px;
    margin-bottom: 15px;
    color: #333;
}

.featured-game .stars {
    font-size: 20px;
    margin: 15px 0;
}

/* Notification */
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    background: #4CAF50;
    color: white;
    padding: 15px 25px;
    border-radius: 15px;
    display: flex;
    align-items: center;
    gap: 15px;
    z-index: 10000;
    box-shadow: 0 8px 25px rgba(0,0,0,0.2);
    animation: slideIn 0.3s ease;
}

.notification.error {
    background: #f44336;
}

.notification.info {
    background: #2196F3;
}

.notification-close {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    font-size: 20px;
    margin-left: 10px;
}

@keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
}
