// Main Website Functionality
document.addEventListener('DOMContentLoaded', function() {
    // Load games on homepage
    loadRecentGames();
    
    // Load all games on games page
    if (window.location.pathname.includes('games.html')) {
        loadAllGames();
        setupSearchFilter();
    }
    
    // Load game details if on game page
    if (window.location.pathname.includes('game.html')) {
        loadGameDetails();
    }
    
    // Initialize other functionalities
    initDownloadButtons();
    initSocialIcons();
    initNavigation();
    initThemeToggle();
    initRatingSystem();
});

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
        noGamesDiv.style.display = 'block';
        return;
    }
    
    // Sort by newest first
    const sortedGames = [...games].reverse();
    
    gamesGrid.innerHTML = sortedGames.map(game => createGameCard(game)).join('');
    noGamesDiv.style.display = 'none';
    
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
            <img src="${game.image}" alt="${game.name}" class="game-item-img">
            <div class="game-item-info">
                <h3 class="game-item-title">${game.name}</h3>
                <div class="game-item-meta">
                    ${getPlatformBadge(game.platform)}
                    <span><i class="fas fa-tags"></i> ${game.genre}</span>
                    <span><i class="fas fa-hdd"></i> ${game.size}</span>
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
                <button class="game-item-download" data-game-id="${game.id}">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        </div>
    `;
}

function loadGameDetails() {
    // Get game ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const gameId = parseInt(urlParams.get('id'));
    
    if (!gameId) {
        window.location.href = 'games.html';
        return;
    }
    
    // Find the game
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
        window.location.href = 'games.html';
        return;
    }
    
    // Update page title
    document.title = `${game.name} - PSP Gamers`;
    
    // Create game display
    const main = document.querySelector('main');
    if (main) {
        main.innerHTML = createGameDisplay(game);
        
        // Initialize download button for this game
        initDownloadButtons();
        
        // Initialize rating system for this game
        if (window.ratingSystem) {
            window.ratingSystem.currentGameId = gameId;
            window.ratingSystem.updateRatingDisplay(gameId);
            window.ratingSystem.loadUserRatings();
        }
    }
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
            <a href="${link.url}" target="_blank" class="download-link-item">
                <i class="fas fa-external-link-alt"></i>
                <span>Download from ${link.platform}</span>
            </a>
        `).join('');
    }
    
    return `
        <div class="game-display">
            <!-- Game Image at Top -->
            <div class="game-image-top">
                <img src="${game.image}" alt="${game.name}">
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
                        <span><i class="fas fa-code-branch"></i> ${game.version || '1.0.0'}</span>
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
                        <p class="platform-name">Multiple Platforms</p>
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
        button.addEventListener('click', function() {
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

// Add CSS for notifications
const style = document.createElement('style');
style.textContent = `
    .download-links {
        margin: 30px 0;
        padding: 25px;
        background: #f8f9fa;
        border-radius: 15px;
    }
    
    .download-links h3 {
        font-size: 20px;
        margin-bottom: 20px;
        color: #333;
        display: flex;
        align-items: center;
        gap: 10px;
    }
    
    .links-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 15px;
    }
    
    .download-link-item {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 15px 20px;
        background: white;
        border-radius: 10px;
        text-decoration: none;
        color: #333;
        border: 2px solid #e0e0e0;
        transition: all 0.3s;
    }
    
    .download-link-item:hover {
        border-color: #667eea;
        transform: translateY(-3px);
        box-shadow: 0 5px 15px rgba(102, 126, 234, 0.2);
        color: #667eea;
    }
    
    .download-link-item i {
        color: #667eea;
    }
    
    .download-select {
        display: block;
        margin: 0 auto;
    }
`;
document.head.appendChild(style);
