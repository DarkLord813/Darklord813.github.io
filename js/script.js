// Main Website Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Check if we're on game.html page
    if (window.location.pathname.includes('game.html')) {
        handleGamePage();
    } else {
        // Load games on homepage
        loadRecentGames();
        
        // Load all games on games page
        if (window.location.pathname.includes('games.html')) {
            loadAllGames();
            setupSearchFilter();
        }
        
        // Initialize other functionalities
        initDownloadButtons();
        initSocialIcons();
        initNavigation();
        initThemeToggle();
        initRatingSystem();
    }
    
    // Setup game clicks
    setupGameClicks();
    
    // Add full screen styles
    addFullScreenStyles();
});

// Handle game.html page
function handleGamePage() {
    // Get URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = urlParams.get('id');
    const shareCode = urlParams.get('share');
    
    // Show admin link if logged in
    checkAdminStatus();
    
    if (gameId) {
        // Direct game ID access
        loadGameById(parseInt(gameId));
    } else if (shareCode) {
        // Shared link access
        loadGameByShareCode(shareCode);
    } else {
        showNotFound();
    }
}

function checkAdminStatus() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
        const adminLink = document.getElementById('adminLink');
        if (adminLink) {
            adminLink.style.display = 'block';
            adminLink.href = 'admin.html';
        }
    }
}

function loadGameById(gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === gameId);
    
    if (game) {
        displayGamePage(game);
        updatePageTitle(game.name);
        trackGameView(gameId);
    } else {
        showNotFound();
    }
}

function loadGameByShareCode(shareCode) {
    // Check share links
    const shareLinks = JSON.parse(localStorage.getItem('pspgamers_shareLinks') || '{}');
    const shareData = shareLinks[shareCode];
    
    if (!shareData) {
        showNotFound('Invalid share link. The link may have expired or been deleted.');
        return;
    }
    
    // Check if share link expired
    const expires = new Date(shareData.expires);
    if (new Date() > expires) {
        showNotFound('This share link has expired. Please request a new link.');
        delete shareLinks[shareCode];
        localStorage.setItem('pspgamers_shareLinks', JSON.stringify(shareLinks));
        return;
    }
    
    // Check if game still exists
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === shareData.gameId);
    
    if (!game) {
        showNotFound('The game associated with this link no longer exists.');
        // Clean up invalid share link
        delete shareLinks[shareCode];
        localStorage.setItem('pspgamers_shareLinks', JSON.stringify(shareLinks));
        return;
    }
    
    // Load the game
    displayGamePage(game);
    updatePageTitle(game.name);
    trackGameView(shareData.gameId);
    
    // Update share access count
    shareData.views = (shareData.views || 0) + 1;
    shareData.lastAccessed = new Date().toISOString();
    shareLinks[shareCode] = shareData;
    localStorage.setItem('pspgamers_shareLinks', JSON.stringify(shareLinks));
    
    // Track share access
    trackShareAccess(shareCode);
}

function displayGamePage(game) {
    const gameContent = document.getElementById('gameContent');
    if (!gameContent) return;
    
    gameContent.innerHTML = createGameDisplay(game);
    
    // Initialize rating system
    if (window.ratingSystem) {
        window.ratingSystem.currentGameId = game.id;
        window.ratingSystem.updateRatingDisplay(game.id);
        window.ratingSystem.loadUserRatings();
    } else {
        // Load rating system
        const ratingScript = document.createElement('script');
        ratingScript.src = 'js/rating.js';
        document.body.appendChild(ratingScript);
    }
    
    // Initialize download buttons
    initDownloadButtons();
}

function createGameDisplay(game) {
    // Platform badge for top of image
    function getPlatformBadgeLarge(platform) {
        const icons = {
            'Android': 'fab fa-android',
            'PC': 'fas fa-desktop',
            'PSP': 'fas fa-gamepad',
            'PS2': 'fas fa-gamepad'
        };
        
        const colors = {
            'Android': 'android',
            'PC': 'pc',
            'PSP': 'psp',
            'PS2': 'ps2'
        };
        
        const platformName = platform || 'Android';
        
        return `
            <span class="platform-badge-large ${colors[platformName]}">
                <i class="${icons[platformName]}"></i> ${platformName}
            </span>
        `;
    }
    
    // Get star rating HTML
    function getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.25;
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        const remaining = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remaining; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    // Generate download links HTML
    function getDownloadLinks(links) {
        if (!links || links.length === 0) return '';
        
        return links.map(link => `
            <a href="${link.url}" target="_blank" class="download-link-item" 
               onclick="trackDownload(${game.id}, '${link.platform}')">
                <i class="fas fa-external-link-alt"></i>
                <div class="link-info">
                    <strong>${link.platform}</strong>
                    <small>Click to download</small>
                </div>
            </a>
        `).join('');
    }
    
    return `
        <div class="game-display">
            <!-- Game Image at Top -->
            <div class="game-image-top">
                <img src="${game.image}" alt="${game.name}" 
                     onerror="this.src='https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Game+Image'">
                <div class="platform-overlay">
                    ${getPlatformBadgeLarge(game.platform)}
                </div>
            </div>
            
            <!-- Game Details -->
            <div class="game-details-section">
                <div class="game-header">
                    <h2>${game.name}</h2>
                    <div class="game-meta">
                        <span><i class="fas fa-tags"></i> ${game.genre}</span>
                        <span><i class="fas fa-hdd"></i> ${game.size}</span>
                        ${game.version ? `<span><i class="fas fa-code-branch"></i> ${game.version}</span>` : ''}
                    </div>
                    <div class="stars">
                        ${getStarRating(game.rating || 0)}
                    </div>
                </div>
                
                <div class="game-description">
                    ${game.description || 'No description available.'}
                </div>
                
                <div class="mod-badge">${game.modInfo}</div>
                
                <!-- Download Section -->
                <div class="download-section">
                    <div class="platform">
                        <h3><i class="fab fa-google-play"></i> Available On</h3>
                        <p class="platform-name">${game.platform || 'Android'}</p>
                    </div>
                    
                    <div class="rating">
                        <div class="stars">
                            ${getStarRating(game.rating || 0)}
                        </div>
                        <p class="rating-text">${(game.rating || 0).toFixed(1)}/5 (${game.votes || 0} votes)</p>
                    </div>

                    <button class="download-btn" data-game-id="${game.id}">
                        <i class="fas fa-download"></i> Download Now (${game.size})
                    </button>
                </div>
                
                <!-- Download Links -->
                <div class="download-links">
                    <h3><i class="fas fa-link"></i> Download Links</h3>
                    <div class="links-grid">
                        ${getDownloadLinks(game.downloadLinks || [])}
                    </div>
                </div>
                
                <!-- Voting Section -->
                <div class="voting-section">
                    <h2><i class="fas fa-star"></i> Rate This Game</h2>
                    <p>Help others by rating this game</p>
                    
                    <div class="voting-stars" id="votingStars">
                        <i class="fas fa-star voting-star" data-value="5"></i>
                        <i class="fas fa-star voting-star" data-value="4"></i>
                        <i class="fas fa-star voting-star" data-value="3"></i>
                        <i class="fas fa-star voting-star" data-value="2"></i>
                        <i class="fas fa-star voting-star" data-value="1"></i>
                    </div>
                    
                    <div class="current-rating" id="currentRating">
                        <div class="average-rating">${(game.rating || 0).toFixed(1)}</div>
                        <div class="stars">
                            ${getStarRating(game.rating || 0)}
                        </div>
                        <p class="vote-count"><i class="fas fa-users"></i> <span id="totalVotes">${game.votes || 0}</span> votes</p>
                    </div>
                    
                    <button class="vote-button" id="submitVote" disabled>
                        <i class="fas fa-paper-plane"></i> Submit Rating
                    </button>
                    
                    <div class="vote-count">
                        <i class="fas fa-info-circle"></i> Your rating: <span id="userRating">Not rated yet</span>
                    </div>
                </div>
            </div>
        </div>
        
        <!-- Back to Games Button -->
        <div style="text-align: center; margin: 40px 0;">
            <a href="games.html" class="btn-primary">
                <i class="fas fa-arrow-left"></i> Back to All Games
            </a>
        </div>
    `;
}

function updatePageTitle(gameName) {
    document.title = `${gameName} - 𝕻𝕾𝕻 𝕲𝕬𝕸𝕰𝕽𝕾™`;
}

function showNotFound(message = 'Game not found') {
    const gameContent = document.getElementById('gameContent');
    const notFound = document.getElementById('notFound');
    
    if (gameContent) gameContent.style.display = 'none';
    if (notFound) {
        notFound.style.display = 'block';
        if (message) {
            const p = notFound.querySelector('p');
            if (p) p.textContent = message;
        }
    }
}

function trackGameView(gameId) {
    // Update game views in games array
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex !== -1) {
        games[gameIndex].views = (games[gameIndex].views || 0) + 1;
        localStorage.setItem('pspgamers_games', JSON.stringify(games));
    }
    
    // Track in views log
    let gameViews = JSON.parse(localStorage.getItem('pspgamers_gameViews') || '{}');
    gameViews[gameId] = (gameViews[gameId] || 0) + 1;
    localStorage.setItem('pspgamers_gameViews', JSON.stringify(gameViews));
}

function trackShareAccess(shareCode) {
    // Track share access
    let shareAccess = JSON.parse(localStorage.getItem('pspgamers_shareAccess') || '{}');
    shareAccess[shareCode] = (shareAccess[shareCode] || 0) + 1;
    localStorage.setItem('pspgamers_shareAccess', JSON.stringify(shareAccess));
}

// Load recent games on homepage
function loadRecentGames() {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const recentGamesContainer = document.getElementById('recentGames');
    
    if (!recentGamesContainer) return;
    
    // Get 4 most recent games
    const recentGames = games.slice(-4).reverse();
    
    if (recentGames.length === 0) {
        recentGamesContainer.innerHTML = `
            <div class="no-games">
                <i class="fas fa-gamepad fa-3x"></i>
                <h3>No Games Yet</h3>
                <p>Check back later for new games!</p>
                <a href="login.html" class="btn-primary" style="margin-top: 20px;">
                    <i class="fas fa-user-shield"></i> Admin Login
                </a>
            </div>
        `;
        return;
    }
    
    recentGamesContainer.innerHTML = recentGames.map(game => createGameCard(game)).join('');
    
    // Add event listeners to new download buttons
    initDownloadButtons();
}

function loadAllGames() {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const gamesGrid = document.getElementById('gamesGrid');
    const noGamesDiv = document.getElementById('noGames');
    
    if (!gamesGrid) return;
    
    if (games.length === 0) {
        gamesGrid.innerHTML = '';
        if (noGamesDiv) noGamesDiv.style.display = 'block';
        return;
    }
    
    // Sort by newest first
    const sortedGames = [...games].reverse();
    
    gamesGrid.innerHTML = sortedGames.map(game => createGameCard(game)).join('');
    if (noGamesDiv) noGamesDiv.style.display = 'none';
    
    // Add event listeners
    initDownloadButtons();
}

function createGameCard(game) {
    // Platform badge with appropriate colors
    function getPlatformBadge(platform) {
        const icons = {
            'Android': 'fab fa-android',
            'PC': 'fas fa-desktop',
            'PSP': 'fas fa-gamepad',
            'PS2': 'fas fa-gamepad'
        };
        
        const colors = {
            'Android': 'android',
            'PC': 'pc',
            'PSP': 'psp',
            'PS2': 'ps2'
        };
        
        const platformName = platform || 'Android';
        
        return `
            <span class="game-platform-tag ${colors[platformName]}">
                <i class="${icons[platformName]}"></i> ${platformName}
            </span>
        `;
    }
    
    // Get star rating HTML
    function getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.25;
        
        // Full stars
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        // Half star
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        // Empty stars
        const remaining = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remaining; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    return `
        <div class="game-item" data-genre="${game.genre}" data-platform="${game.platform || 'Android'}">
            <!-- View More Button -->
            <button class="view-more-btn" title="View Details" onclick="viewGameFullScreen(${game.id})">
                <i class="fas fa-expand-alt"></i>
            </button>
            
            <!-- Click Instruction -->
            <div class="game-card-instruction">
                Click button to view full details
            </div>
            
            <img src="${game.image}" alt="${game.name}" class="game-item-img"
                 onclick="viewGameFullScreen(${game.id})">
            <div class="game-item-info">
                <h3 class="game-item-title" onclick="viewGameFullScreen(${game.id})" style="cursor: pointer;">${game.name}</h3>
                <div class="game-item-meta">
                    ${getPlatformBadge(game.platform)}
                    <span><i class="fas fa-tags"></i> ${game.genre}</span>
                    <span><i class="fas fa-hdd"></i> ${game.size}</span>
                    <span><i class="fas fa-eye"></i> ${game.views || 0}</span>
                </div>
                
                <!-- Rating Section -->
                <div class="game-rating-mini">
                    <div class="stars">
                        ${getStarRating(game.rating || 0)}
                    </div>
                    <span class="mini-rating-text">
                        ${(game.rating || 0).toFixed(1)}/5 (${game.votes || 0})
                    </span>
                </div>
                
                <p class="game-item-desc">${game.modInfo}</p>
                <div class="game-item-buttons">
                    <button class="game-item-download" data-game-id="${game.id}">
                        <i class="fas fa-download"></i> Download
                    </button>
                    <button class="game-item-share" onclick="shareGameFullscreen(${game.id})">
                        <i class="fas fa-share-alt"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function setupSearchFilter() {
    const searchInput = document.getElementById('searchGames');
    const genreFilter = document.getElementById('genreFilter');
    const platformFilter = document.getElementById('platformFilter');
    
    if (searchInput) {
        searchInput.addEventListener('input', filterGames);
    }
    
    if (genreFilter) {
        genreFilter.addEventListener('change', filterGames);
    }
    
    if (platformFilter) {
        platformFilter.addEventListener('change', filterGames);
    }
}

function filterGames() {
    const searchTerm = document.getElementById('searchGames')?.value.toLowerCase() || '';
    const selectedGenre = document.getElementById('genreFilter')?.value || '';
    const selectedPlatform = document.getElementById('platformFilter')?.value || '';
    const gameItems = document.querySelectorAll('.game-item');
    
    let visibleCount = 0;
    
    gameItems.forEach(item => {
        const gameName = item.querySelector('.game-item-title').textContent.toLowerCase();
        const gameGenre = item.getAttribute('data-genre');
        const gamePlatform = item.getAttribute('data-platform');
        
        const matchesSearch = gameName.includes(searchTerm);
        const matchesGenre = !selectedGenre || gameGenre === selectedGenre;
        const matchesPlatform = !selectedPlatform || gamePlatform === selectedPlatform;
        
        if (matchesSearch && matchesGenre && matchesPlatform) {
            item.style.display = 'block';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // Show/hide no games message
    const noGamesDiv = document.getElementById('noGames');
    if (noGamesDiv) {
        noGamesDiv.style.display = visibleCount === 0 ? 'block' : 'none';
    }
}

function initDownloadButtons() {
    document.querySelectorAll('.download-btn, .game-item-download').forEach(button => {
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent triggering parent clicks
            const gameId = this.getAttribute('data-game-id');
            if (gameId) {
                downloadGame(gameId);
            }
        });
    });
}

function downloadGame(gameId) {
    // Find the game
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id == gameId);
    
    if (!game) {
        showNotification('Game not found!', 'error');
        return;
    }
    
    // Update download count
    game.downloads = (game.downloads || 0) + 1;
    localStorage.setItem('pspgamers_games', JSON.stringify(games));
    
    // Show download options
    if (game.downloadLinks && game.downloadLinks.length > 0) {
        if (game.downloadLinks.length === 1) {
            // Direct download if only one link
            window.open(game.downloadLinks[0].url, '_blank');
            showNotification(`Downloading ${game.name}...`, 'success');
        } else {
            // Show link selection if multiple links
            showDownloadOptions(game);
        }
    } else {
        showNotification('No download links available!', 'error');
    }
}

function showDownloadOptions(game) {
    const options = game.downloadLinks.map(link => 
        `<option value="${link.url}">${link.platform}</option>`
    ).join('');
    
    const select = document.createElement('select');
    select.className = 'download-select';
    select.innerHTML = `<option value="">Select download source</option>${options}`;
    
    select.style.cssText = `
        padding: 12px 20px;
        border: 2px solid #667eea;
        border-radius: 10px;
        font-size: 16px;
        background: white;
        color: #333;
        width: 300px;
        max-width: 90vw;
        cursor: pointer;
        box-shadow: 0 5px 20px rgba(0,0,0,0.1);
    `;
    
    const container = document.createElement('div');
    container.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        padding: 30px;
        border-radius: 20px;
        box-shadow: 0 20px 60px rgba(0,0,0,0.3);
        z-index: 10000;
        text-align: center;
        min-width: 350px;
        max-width: 90vw;
    `;
    
    const title = document.createElement('h3');
    title.textContent = `Download ${game.name}`;
    title.style.cssText = `
        margin-bottom: 20px;
        color: #333;
        font-size: 20px;
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.innerHTML = '<i class="fas fa-times"></i>';
    closeBtn.style.cssText = `
        position: absolute;
        top: 15px;
        right: 15px;
        background: none;
        border: none;
        font-size: 20px;
        color: #666;
        cursor: pointer;
    `;
    
    container.appendChild(closeBtn);
    container.appendChild(title);
    container.appendChild(select);
    
    const overlay = document.createElement('div');
    overlay.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 9999;
        backdrop-filter: blur(5px);
    `;
    
    document.body.appendChild(overlay);
    document.body.appendChild(container);
    
    // Close on overlay click
    overlay.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(container);
    });
    
    // Close on button click
    closeBtn.addEventListener('click', () => {
        document.body.removeChild(overlay);
        document.body.removeChild(container);
    });
    
    // Handle selection
    select.addEventListener('change', function() {
        if (this.value) {
            window.open(this.value, '_blank');
            showNotification(`Downloading from ${this.options[this.selectedIndex].text}...`, 'success');
            document.body.removeChild(overlay);
            document.body.removeChild(container);
        }
    });
    
    // Auto-focus select
    setTimeout(() => select.focus(), 100);
}

function initSocialIcons() {
    // Social icons already have links in HTML
    // Add hover effects
    document.querySelectorAll('.social-icon').forEach(icon => {
        icon.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-12px) scale(1.04)';
        });
        
        icon.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
        });
    });
}

function initNavigation() {
    // Smooth scroll for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href === '#') {
                e.preventDefault();
                window.scrollTo({ top: 0, behavior: 'smooth' });
            } else if (href.startsWith('#')) {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            }
        });
    });
}

function initThemeToggle() {
    // Create theme toggle button
    const themeToggle = document.createElement('button');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
    themeToggle.title = 'Toggle Dark Mode';
    
    // Check saved theme
    const savedTheme = localStorage.getItem('pspgamers_theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
    }
    
    themeToggle.addEventListener('click', function() {
        document.body.classList.toggle('dark-theme');
        
        if (document.body.classList.contains('dark-theme')) {
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
            localStorage.setItem('pspgamers_theme', 'dark');
        } else {
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
            localStorage.setItem('pspgamers_theme', 'light');
        }
    });
    
    document.body.appendChild(themeToggle);
}

function initRatingSystem() {
    // Load rating system if needed
    if (document.getElementById('votingStars')) {
        // Load rating.js if not already loaded
        if (!window.ratingSystem) {
            const ratingScript = document.createElement('script');
            ratingScript.src = 'js/rating.js';
            document.body.appendChild(ratingScript);
        }
    }
}

function showNotification(message, type = 'info') {
    // Remove existing notification
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();
    
    // Create notification
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icons = {
        'success': 'check-circle',
        'error': 'exclamation-circle',
        'info': 'info-circle'
    };
    
    notification.innerHTML = `
        <i class="fas fa-${icons[type] || 'info-circle'}"></i>
        <span>${message}</span>
        <button class="notification-close"><i class="fas fa-times"></i></button>
    `;
    
    document.body.appendChild(notification);
    
    // Close button
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 300);
    });
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Setup game clicks
function setupGameClicks() {
    // Handle game card clicks
    document.addEventListener('click', function(e) {
        // Check if clicked on game card title or image
        if (e.target.classList.contains('game-item-title') || 
            e.target.classList.contains('game-item-img')) {
            const gameCard = e.target.closest('.game-item');
            if (gameCard) {
                const gameId = gameCard.querySelector('.game-item-download')?.getAttribute('data-game-id');
                if (gameId) {
                    e.preventDefault();
                    viewGameFullScreen(gameId);
                }
            }
        }
    });
}

// View game in full screen
function viewGameFullScreen(gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id == gameId);
    
    if (!game) {
        showNotification('Game not found!', 'error');
        return;
    }
    
    // Create full screen overlay
    const overlay = document.createElement('div');
    overlay.className = 'game-fullscreen-overlay';
    overlay.innerHTML = createFullScreenGameHTML(game);
    
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden'; // Prevent scrolling
    
    // Initialize rating system for this game
    if (window.ratingSystem) {
        window.ratingSystem.currentGameId = gameId;
        window.ratingSystem.updateRatingDisplay(gameId);
        window.ratingSystem.loadUserRatings();
    }
    
    // Initialize full screen rating
    initFullScreenRating();
    
    // Add close functionality
    overlay.addEventListener('click', function(e) {
        if (e.target === overlay || e.target.closest('.close-fullscreen')) {
            closeFullScreenGame();
        }
    });
    
    // Add keyboard close (ESC)
    document.addEventListener('keydown', function closeOnEsc(e) {
        if (e.key === 'Escape') {
            closeFullScreenGame();
            document.removeEventListener('keydown', closeOnEsc);
        }
    });
    
    // Track view
    trackGameView(gameId);
}

// Create full screen game HTML
function createFullScreenGameHTML(game) {
    function getPlatformBadge(platform) {
        const icons = {
            'Android': 'fab fa-android',
            'PC': 'fas fa-desktop',
            'PSP': 'fas fa-gamepad',
            'PS2': 'fas fa-gamepad'
        };
        
        const colors = {
            'Android': 'android',
            'PC': 'pc',
            'PSP': 'psp',
            'PS2': 'ps2'
        };
        
        return `
            <span class="platform-badge-large ${colors[platform]}">
                <i class="${icons[platform]}"></i> ${platform}
            </span>
        `;
    }
    
    function getStarRating(rating) {
        let stars = '';
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 >= 0.25;
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt"></i>';
        }
        
        const remaining = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < remaining; i++) {
            stars += '<i class="far fa-star"></i>';
        }
        
        return stars;
    }
    
    function getDownloadLinks(links) {
        if (!links || links.length === 0) return '';
        
        return links.map(link => `
            <a href="${link.url}" target="_blank" class="download-link-item"
               onclick="trackDownload(${game.id}, '${link.platform}')">
                <i class="fas fa-external-link-alt"></i>
                <div class="link-info">
                    <strong>${link.platform}</strong>
                    <small>Click to download</small>
                </div>
            </a>
        `).join('');
    }
    
    return `
        <div class="game-fullscreen">
            <button class="close-fullscreen">
                <i class="fas fa-times"></i>
            </button>
            
            <div class="game-fullscreen-content">
                <!-- Left Column: Game Image & Details -->
                <div class="game-fullscreen-left">
                    <div class="game-fullscreen-image">
                        <img src="${game.image}" alt="${game.name}"
                             onerror="this.src='https://via.placeholder.com/800x600/4A90E2/FFFFFF?text=Game+Image'">
                    </div>
                    
                    <div class="game-fullscreen-meta">
                        <div class="meta-item">
                            <i class="fas fa-tags"></i>
                            <span>${game.genre}</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-hdd"></i>
                            <span>${game.size}</span>
                        </div>
                        ${game.version ? `
                        <div class="meta-item">
                            <i class="fas fa-code-branch"></i>
                            <span>v${game.version}</span>
                        </div>` : ''}
                        <div class="meta-item">
                            <i class="fas fa-download"></i>
                            <span>${game.downloads || 0} downloads</span>
                        </div>
                        <div class="meta-item">
                            <i class="fas fa-eye"></i>
                            <span>${game.views || 0} views</span>
                        </div>
                    </div>
                    
                    <div class="mod-badge-large">${game.modInfo}</div>
                </div>
                
                <!-- Right Column: Game Info & Actions -->
                <div class="game-fullscreen-right">
                    <div class="game-fullscreen-header">
                        ${getPlatformBadge(game.platform || 'Android')}
                        <h1>${game.name}</h1>
                    </div>
                    
                    <div class="game-description-full">
                        <h3><i class="fas fa-info-circle"></i> Description</h3>
                        <p>${game.description || 'No description available.'}</p>
                    </div>
                    
                    <!-- Rating Section -->
                    <div class="rating-section-full">
                        <div class="rating-header">
                            <h3><i class="fas fa-star"></i> Game Rating</h3>
                            <div class="current-rating-full">
                                <span class="rating-number">${(game.rating || 0).toFixed(1)}</span>
                                <div class="stars-large">
                                    ${getStarRating(game.rating || 0)}
                                </div>
                                <span class="rating-count">${game.votes || 0} votes</span>
                            </div>
                        </div>
                        
                        <!-- Voting Interface -->
                        <div class="voting-interface">
                            <h4>Rate this game:</h4>
                            <div class="voting-stars-large" id="fullscreenVotingStars">
                                <i class="fas fa-star voting-star-large" data-value="5"></i>
                                <i class="fas fa-star voting-star-large" data-value="4"></i>
                                <i class="fas fa-star voting-star-large" data-value="3"></i>
                                <i class="fas fa-star voting-star-large" data-value="2"></i>
                                <i class="fas fa-star voting-star-large" data-value="1"></i>
                            </div>
                            <div class="vote-feedback">
                                <span id="voteText">Not rated yet</span>
                            </div>
                            <button class="submit-vote-btn" id="submitVoteFullscreen">
                                <i class="fas fa-paper-plane"></i> Submit Rating
                            </button>
                        </div>
                    </div>
                    
                    <!-- Download Section -->
                    <div class="download-section-full">
                        <h3><i class="fas fa-download"></i> Download Links</h3>
                        <div class="download-links-grid">
                            ${getDownloadLinks(game.downloadLinks)}
                        </div>
                    </div>
                    
                    <!-- Action Buttons -->
                    <div class="action-buttons">
                        <button class="action-btn share-btn" onclick="shareGameFullscreen(${game.id})">
                            <i class="fas fa-share-alt"></i> Share
                        </button>
                        <a href="game.html?id=${game.id}" class="action-btn permanent-btn" target="_blank">
                            <i class="fas fa-link"></i> Get Link
                        </a>
                        <button class="action-btn close-btn" onclick="closeFullScreenGame()">
                            <i class="fas fa-times"></i> Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Close full screen game
function closeFullScreenGame() {
    const overlay = document.querySelector('.game-fullscreen-overlay');
    if (overlay) {
        overlay.remove();
        document.body.style.overflow = 'auto';
    }
}

// Share game from full screen
function shareGameFullscreen(gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id == gameId);
    
    if (!game) return;
    
    const shareUrl = `${window.location.origin || window.location.href.replace('/game.html', '')}/game.html?id=${gameId}`;
    
    if (navigator.share) {
        // Use Web Share API if available
        navigator.share({
            title: `${game.name} - PSP GAMERS`,
            text: `🎮 Check out "${game.name}" on PSP GAMERS!`,
            url: shareUrl
        });
    } else {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(shareUrl)
            .then(() => {
                showNotification('Link copied to clipboard!', 'success');
            })
            .catch(() => {
                prompt('Copy this link:', shareUrl);
            });
    }
}

// Initialize full screen rating system
function initFullScreenRating() {
    const votingStars = document.getElementById('fullscreenVotingStars');
    const submitBtn = document.getElementById('submitVoteFullscreen');
    const voteText = document.getElementById('voteText');
    
    if (!votingStars || !submitBtn) return;
    
    let selectedRating = 0;
    
    // Star hover effects
    const stars = votingStars.querySelectorAll('.voting-star-large');
    stars.forEach(star => {
        star.addEventListener('mouseenter', function() {
            const value = parseInt(this.dataset.value);
            highlightStars(value);
        });
        
        star.addEventListener('click', function() {
            const value = parseInt(this.dataset.value);
            selectedRating = value;
            highlightStars(value);
            
            // Update vote text
            if (voteText) {
                voteText.textContent = `${value} star${value > 1 ? 's' : ''} selected`;
                voteText.style.color = '#FFD700';
                voteText.style.fontWeight = '600';
            }
            
            // Enable submit button
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Submit ${value} Star${value > 1 ? 's' : ''}`;
        });
    });
    
    // Reset stars when mouse leaves
    votingStars.addEventListener('mouseleave', function() {
        highlightStars(selectedRating);
    });
    
    // Submit vote
    submitBtn.addEventListener('click', function() {
        if (selectedRating > 0 && window.ratingSystem) {
            window.ratingSystem.submitVote(selectedRating);
            
            // Update UI
            submitBtn.disabled = true;
            submitBtn.innerHTML = '<i class="fas fa-check"></i> Thank You!';
            submitBtn.style.background = '#4CAF50';
            
            // Reset after 2 seconds
            setTimeout(() => {
                submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> Submit Rating';
                submitBtn.style.background = '';
                if (voteText) voteText.textContent = 'Rating submitted!';
            }, 2000);
        }
    });
    
    function highlightStars(value) {
        stars.forEach(star => {
            const starValue = parseInt(star.dataset.value);
            if (starValue <= value) {
                star.classList.add('selected');
                star.style.color = '#FFD700';
            } else {
                star.classList.remove('selected');
                star.style.color = '#e0e0e0';
            }
        });
    }
}

// Add full screen styles
function addFullScreenStyles() {
    if (!document.getElementById('fullscreen-styles')) {
        const style = document.createElement('style');
        style.id = 'fullscreen-styles';
        style.textContent = `
            /* Full Screen Game View */
            .game-fullscreen-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.95);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 20px;
                backdrop-filter: blur(10px);
                animation: fadeIn 0.3s ease;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; }
                to { opacity: 1; }
            }
            
            .game-fullscreen {
                background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
                border-radius: 25px;
                width: 100%;
                max-width: 1200px;
                max-height: 90vh;
                overflow-y: auto;
                position: relative;
                box-shadow: 0 30px 80px rgba(0,0,0,0.5);
                border: 1px solid rgba(255,255,255,0.1);
                animation: slideUp 0.4s ease;
            }
            
            @keyframes slideUp {
                from { transform: translateY(50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .close-fullscreen {
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255,255,255,0.1);
                border: none;
                width: 50px;
                height: 50px;
                border-radius: 50%;
                color: white;
                font-size: 24px;
                cursor: pointer;
                z-index: 10;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s;
                backdrop-filter: blur(5px);
            }
            
            .close-fullscreen:hover {
                background: rgba(255,255,255,0.2);
                transform: rotate(90deg);
            }
            
            .game-fullscreen-content {
                display: grid;
                grid-template-columns: 1fr 1.5fr;
                gap: 40px;
                padding: 40px;
                min-height: 80vh;
            }
            
            @media (max-width: 1024px) {
                .game-fullscreen-content {
                    grid-template-columns: 1fr;
                    gap: 30px;
                }
            }
            
            /* Left Column Styles */
            .game-fullscreen-left {
                display: flex;
                flex-direction: column;
                gap: 25px;
            }
            
            .game-fullscreen-image {
                border-radius: 20px;
                overflow: hidden;
                box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            }
            
            .game-fullscreen-image img {
                width: 100%;
                height: 400px;
                object-fit: cover;
                transition: transform 0.5s;
            }
            
            .game-fullscreen-image:hover img {
                transform: scale(1.05);
            }
            
            .game-fullscreen-meta {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 15px;
                background: rgba(255,255,255,0.05);
                padding: 20px;
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .meta-item {
                display: flex;
                align-items: center;
                gap: 12px;
                color: #aaa;
                font-size: 14px;
            }
            
            .meta-item i {
                color: #667eea;
                font-size: 16px;
                width: 20px;
            }
            
            .mod-badge-large {
                background: linear-gradient(135deg, #FFD700 0%, #FFA500 100%);
                color: #000;
                padding: 15px 25px;
                border-radius: 15px;
                font-weight: 700;
                font-size: 18px;
                text-align: center;
                text-transform: uppercase;
                letter-spacing: 1px;
                animation: pulse 2s infinite;
                box-shadow: 0 8px 25px rgba(255, 215, 0, 0.3);
            }
            
            /* Right Column Styles */
            .game-fullscreen-right {
                display: flex;
                flex-direction: column;
                gap: 30px;
                color: white;
            }
            
            .game-fullscreen-header {
                display: flex;
                flex-direction: column;
                gap: 15px;
            }
            
            .game-fullscreen-header h1 {
                font-size: 36px;
                margin: 0;
                color: white;
                line-height: 1.2;
            }
            
            .game-description-full {
                background: rgba(255,255,255,0.05);
                padding: 25px;
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .game-description-full h3 {
                color: #667eea;
                margin-bottom: 15px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 20px;
            }
            
            .game-description-full p {
                color: #ccc;
                line-height: 1.8;
                margin: 0;
            }
            
            /* Rating Section */
            .rating-section-full {
                background: rgba(255,255,255,0.05);
                padding: 25px;
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .rating-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 25px;
            }
            
            .rating-header h3 {
                color: #667eea;
                margin: 0;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 20px;
            }
            
            .current-rating-full {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 5px;
            }
            
            .rating-number {
                font-size: 48px;
                font-weight: 700;
                color: #FFD700;
                text-shadow: 0 0 20px rgba(255, 215, 0, 0.3);
            }
            
            .stars-large {
                font-size: 32px;
                color: #FFD700;
                display: flex;
                gap: 5px;
            }
            
            .rating-count {
                color: #aaa;
                font-size: 14px;
            }
            
            /* Voting Interface */
            .voting-interface {
                background: rgba(0,0,0,0.3);
                padding: 25px;
                border-radius: 15px;
                text-align: center;
            }
            
            .voting-interface h4 {
                color: white;
                margin-bottom: 20px;
                font-size: 18px;
            }
            
            .voting-stars-large {
                display: flex;
                justify-content: center;
                gap: 10px;
                margin-bottom: 20px;
                direction: rtl;
            }
            
            .voting-star-large {
                font-size: 56px;
                color: #e0e0e0;
                cursor: pointer;
                transition: all 0.3s;
            }
            
            .voting-star-large:hover,
            .voting-star-large:hover ~ .voting-star-large {
                color: #FFD700 !important;
                transform: scale(1.2);
            }
            
            .voting-star-large.selected {
                color: #FFD700 !important;
            }
            
            .vote-feedback {
                margin: 20px 0;
                min-height: 30px;
            }
            
            .vote-feedback span {
                color: #FFD700;
                font-weight: 600;
                font-size: 18px;
            }
            
            .submit-vote-btn {
                background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
                color: white;
                border: none;
                padding: 15px 40px;
                border-radius: 12px;
                font-size: 18px;
                font-weight: 600;
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                gap: 12px;
                transition: all 0.3s;
                box-shadow: 0 8px 20px rgba(76, 175, 80, 0.3);
            }
            
            .submit-vote-btn:hover:not(:disabled) {
                transform: translateY(-3px);
                box-shadow: 0 12px 25px rgba(76, 175, 80, 0.4);
            }
            
            .submit-vote-btn:disabled {
                background: #666;
                cursor: not-allowed;
                transform: none;
                box-shadow: none;
            }
            
            /* Download Section */
            .download-section-full {
                background: rgba(255,255,255,0.05);
                padding: 25px;
                border-radius: 15px;
                border: 1px solid rgba(255,255,255,0.1);
            }
            
            .download-section-full h3 {
                color: #667eea;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 10px;
                font-size: 20px;
            }
            
            .download-links-grid {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                gap: 15px;
            }
            
            .download-link-item {
                display: flex;
                align-items: center;
                gap: 15px;
                padding: 20px;
                background: rgba(255,255,255,0.1);
                border-radius: 12px;
                text-decoration: none;
                color: white;
                border: 2px solid transparent;
                transition: all 0.3s;
            }
            
            .download-link-item:hover {
                background: rgba(255,255,255,0.15);
                border-color: #4CAF50;
                transform: translateY(-3px);
            }
            
            .download-link-item i {
                font-size: 24px;
                color: #4CAF50;
            }
            
            /* Action Buttons */
            .action-buttons {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .action-btn {
                flex: 1;
                padding: 18px;
                border: none;
                border-radius: 12px;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s;
                font-size: 16px;
                min-width: 150px;
                text-decoration: none;
                color: white;
            }
            
            .action-btn.share-btn {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }
            
            .action-btn.permanent-btn {
                background: linear-gradient(135deg, #17a2b8 0%, #138496 100%);
            }
            
            .action-btn.close-btn {
                background: linear-gradient(135deg, #6c757d 0%, #495057 100%);
            }
            
            .action-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 25px rgba(0,0,0,0.2);
            }
            
            /* Scrollbar Styling */
            .game-fullscreen::-webkit-scrollbar {
                width: 10px;
            }
            
            .game-fullscreen::-webkit-scrollbar-track {
                background: rgba(255,255,255,0.1);
                border-radius: 10px;
            }
            
            .game-fullscreen::-webkit-scrollbar-thumb {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                border-radius: 10px;
            }
            
            /* Responsive */
            @media (max-width: 768px) {
                .game-fullscreen {
                    max-height: 95vh;
                }
                
                .game-fullscreen-content {
                    padding: 20px;
                    gap: 20px;
                }
                
                .game-fullscreen-image img {
                    height: 300px;
                }
                
                .game-fullscreen-header h1 {
                    font-size: 28px;
                }
                
                .rating-header {
                    flex-direction: column;
                    gap: 15px;
                    text-align: center;
                }
                
                .voting-star-large {
                    font-size: 42px;
                }
                
                .action-buttons {
                    flex-direction: column;
                }
                
                .action-btn {
                    width: 100%;
                }
            }
            
            @media (max-width: 480px) {
                .game-fullscreen-image img {
                    height: 200px;
                }
                
                .game-fullscreen-meta {
                    grid-template-columns: 1fr;
                }
                
                .voting-star-large {
                    font-size: 36px;
                }
                
                .rating-number {
                    font-size: 36px;
                }
                
                .stars-large {
                    font-size: 24px;
                }
            }
        `;
        document.head.appendChild(style);
    }
}

// Track downloads
function trackDownload(gameId, platform) {
    // Update download count in games array
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const gameIndex = games.findIndex(g => g.id == gameId);
    
    if (gameIndex !== -1) {
        games[gameIndex].downloads = (games[gameIndex].downloads || 0) + 1;
        localStorage.setItem('pspgamers_games', JSON.stringify(games));
        
        // Track platform downloads
        let platformDownloads = JSON.parse(localStorage.getItem('pspgamers_platformDownloads') || '{}');
        platformDownloads[platform] = (platformDownloads[platform] || 0) + 1;
        localStorage.setItem('pspgamers_platformDownloads', JSON.stringify(platformDownloads));
    }
}

// Make functions available globally
window.viewGameFullScreen = viewGameFullScreen;
window.closeFullScreenGame = closeFullScreenGame;
window.shareGameFullscreen = shareGameFullscreen;
window.trackDownload = trackDownload;
