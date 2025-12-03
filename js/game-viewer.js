// Game Viewer for shared links
document.addEventListener('DOMContentLoaded', function() {
    // Check URL parameters
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
});

function checkAdminStatus() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    if (isAuthenticated === 'true') {
        document.getElementById('adminLink').style.display = 'block';
        document.getElementById('adminLink').href = 'admin.html';
    }
}

function loadGameById(gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === gameId);
    
    if (game) {
        displayGame(game);
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
        showNotFound();
        return;
    }
    
    // Check if share link expired
    const expires = new Date(shareData.expires);
    if (new Date() > expires) {
        showNotFound('This share link has expired.');
        delete shareLinks[shareCode];
        localStorage.setItem('pspgamers_shareLinks', JSON.stringify(shareLinks));
        return;
    }
    
    // Load the game
    loadGameById(shareData.gameId);
    
    // Track share access
    trackShareAccess(shareCode);
}

function displayGame(game) {
    const gameContent = document.getElementById('gameContent');
    
    // Generate platform badge
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
            <span class="platform-badge-large ${colors[platformName]}">
                <i class="${icons[platformName]}"></i> ${platformName}
            </span>
        `;
    }
    
    // Generate star rating
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
    
    // Generate download links HTML
    function getDownloadLinks(links) {
        if (!links || links.length === 0) return '<p>No download links available.</p>';
        
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
    
    // Create game display HTML
    gameContent.innerHTML = `
        <div class="game-display">
            <!-- Game Image -->
            <div class="game-image-top">
                <img src="${game.image}" alt="${game.name}" 
                     onerror="this.src='https://via.placeholder.com/800x400/4A90E2/FFFFFF?text=Game+Image'">
                <div class="platform-overlay">
                    ${getPlatformBadge(game.platform)}
                </div>
            </div>
            
            <!-- Game Details -->
            <div class="game-details-section">
                <div class="game-header">
                    <h1>${game.name}</h1>
                    <div class="game-meta">
                        <span><i class="fas fa-tags"></i> ${game.genre}</span>
                        <span><i class="fas fa-hdd"></i> ${game.size}</span>
                        ${game.version ? `<span><i class="fas fa-code-branch"></i> ${game.version}</span>` : ''}
                        <span><i class="fas fa-download"></i> ${game.downloads || 0} downloads</span>
                    </div>
                    <div class="stars">
                        ${getStarRating(game.rating || 0)}
                        <span class="rating-text">${(game.rating || 0).toFixed(1)}/5 (${game.votes || 0} votes)</span>
                    </div>
                </div>
                
                <div class="game-description">
                    ${game.description || 'No description available.'}
                </div>
                
                <div class="mod-badge">${game.modInfo}</div>
                
                <!-- Download Links Section -->
                <div class="download-links-section">
                    <h2><i class="fas fa-download"></i> Download Links</h2>
                    <p>Click any link below to download:</p>
                    <div class="links-grid">
                        ${getDownloadLinks(game.downloadLinks)}
                    </div>
                </div>
                
                <!-- Share Section -->
                <div class="share-section">
                    <h3><i class="fas fa-share-alt"></i> Share This Game</h3>
                    <div class="share-buttons">
                        <button class="share-btn whatsapp" onclick="shareToWhatsApp('${game.name}')">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="share-btn telegram" onclick="shareToTelegram('${game.name}')">
                            <i class="fab fa-telegram"></i> Telegram
                        </button>
                        <button class="share-btn copy" onclick="copyGameLink(${game.id})">
                            <i class="fas fa-copy"></i> Copy Link
                        </button>
                    </div>
                </div>
                
                <!-- Rating Section -->
                <div class="voting-section">
                    <h2><i class="fas fa-star"></i> Rate This Game</h2>
                    <div class="voting-stars" id="votingStars">
                        <i class="fas fa-star voting-star" data-value="5"></i>
                        <i class="fas fa-star voting-star" data-value="4"></i>
                        <i class="fas fa-star voting-star" data-value="3"></i>
                        <i class="fas fa-star voting-star" data-value="2"></i>
                        <i class="fas fa-star voting-star" data-value="1"></i>
                    </div>
                    <button class="vote-button" id="submitVote">
                        <i class="fas fa-paper-plane"></i> Submit Rating
                    </button>
                </div>
            </div>
        </div>
        
        <!-- Back Button -->
        <div style="text-align: center; margin: 40px 0;">
            <a href="games.html" class="btn-primary">
                <i class="fas fa-arrow-left"></i> Back to All Games
            </a>
        </div>
    `;
    
    // Initialize rating system
    if (window.ratingSystem) {
        window.ratingSystem.currentGameId = game.id;
        window.ratingSystem.init();
    } else {
        // Load rating system
        const ratingScript = document.createElement('script');
        ratingScript.src = 'js/rating.js';
        document.body.appendChild(ratingScript);
    }
}

function updatePageTitle(gameName) {
    document.title = `${gameName} - 𝕻𝕾𝕻 𝕲𝕬𝕸𝕰𝕽𝕾™`;
}

function showNotFound(message = 'Game not found') {
    document.getElementById('gameContent').style.display = 'none';
    document.getElementById('notFound').style.display = 'block';
    
    if (message) {
        document.querySelector('#notFound p').textContent = message;
    }
}

function trackGameView(gameId) {
    // Track view in localStorage
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

// Share functions
function shareToWhatsApp(gameName) {
    const url = window.location.href;
    const text = `Check out ${gameName} on PSP GAMERS! ${url}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
}

function shareToTelegram(gameName) {
    const url = window.location.href;
    const text = `Check out ${gameName} on PSP GAMERS! ${url}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
}

function copyGameLink(gameId) {
    const url = `${window.location.origin || 'https://darklord813.github.io'}/game.html?id=${gameId}`;
    
    navigator.clipboard.writeText(url)
        .then(() => {
            alert('Game link copied to clipboard!');
        })
        .catch(err => {
            console.error('Failed to copy: ', err);
            prompt('Copy this link:', url);
        });
}

// Track downloads
function trackDownload(gameId, platform) {
    // Update download count
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex !== -1) {
        games[gameIndex].downloads = (games[gameIndex].downloads || 0) + 1;
        localStorage.setItem('pspgamers_games', JSON.stringify(games));
        
        // Track platform downloads
        let platformDownloads = JSON.parse(localStorage.getItem('pspgamers_platformDownloads') || '{}');
        platformDownloads[platform] = (platformDownloads[platform] || 0) + 1;
        localStorage.setItem('pspgamers_platformDownloads', JSON.stringify(platformDownloads));
    }
    
    // Log download
    console.log(`Download started: Game ID ${gameId} from ${platform}`);
}

// Make functions available globally
window.trackDownload = trackDownload;
window.shareToWhatsApp = shareToWhatsApp;
window.shareToTelegram = shareToTelegram;
window.copyGameLink = copyGameLink;
