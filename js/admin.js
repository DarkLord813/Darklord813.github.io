// Complete admin.js - Admin Dashboard Functionality with Sharing
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication
    checkAdminAuth();
    
    // Setup admin dashboard functionality
    setupAdminDashboard();
    
    // Add share styles
    addShareStyles();
});

// Check if admin is authenticated
function checkAdminAuth() {
    const isAuthenticated = localStorage.getItem('adminAuthenticated');
    const loginTime = localStorage.getItem('adminLoginTime');
    
    if (!isAuthenticated || isAuthenticated !== 'true' || !loginTime) {
        window.location.href = 'login.html';
        return;
    }
    
    // Check session timeout (8 hours)
    const loginDate = new Date(loginTime);
    const now = new Date();
    const hoursDiff = (now - loginDate) / (1000 * 60 * 60);
    
    if (hoursDiff > 8) {
        logout();
        return;
    }
    
    // Update admin info display
    const adminName = localStorage.getItem('adminUsername') || 'Admin';
    document.getElementById('adminName').textContent = adminName;
    
    // Format and display login time
    const loginTimeFormatted = loginDate.toLocaleString();
    document.getElementById('loginTime').textContent = `Logged in: ${loginTimeFormatted}`;
    
    // Update security section
    document.getElementById('securityUsername').textContent = adminName;
    document.getElementById('securityLoginTime').textContent = loginTimeFormatted;
    
    // Calculate expiry time (8 hours from login)
    const expiryDate = new Date(loginDate.getTime() + (8 * 60 * 60 * 1000));
    document.getElementById('securityExpiryTime').textContent = expiryDate.toLocaleString();
}

// Setup all admin dashboard functionality
function setupAdminDashboard() {
    // Setup sidebar navigation
    setupSidebar();
    
    // Setup game form
    setupGameForm();
    
    // Setup platform filters
    setupPlatformFilters();
    
    // Setup security buttons
    setupSecurityButtons();
    
    // Setup share functionality
    setupShareButtons();
    
    // Load initial data
    loadGames();
    loadUploadedImages();
    loadStats();
    loadSecurityInfo();
    
    // Setup logout button
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
    // Setup view games button
    document.getElementById('viewGames')?.addEventListener('click', function(e) {
        e.preventDefault();
        showSection('manageGames');
        document.querySelector('.admin-sidebar li.active')?.classList.remove('active');
        document.querySelector('.admin-sidebar li:nth-child(2)')?.classList.add('active');
    });
    
    // Log admin access
    logActivity('Admin panel accessed');
}

// Setup sidebar navigation
function setupSidebar() {
    const sidebarLinks = document.querySelectorAll('.admin-sidebar a');
    
    sidebarLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all
            sidebarLinks.forEach(l => {
                l.parentElement.classList.remove('active');
            });
            
            // Add active to clicked
            this.parentElement.classList.add('active');
            
            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            showSection(targetId);
            
            // Log activity
            logActivity(`Switched to ${targetId} section`);
        });
    });
}

// Show specific admin section
function showSection(sectionId) {
    // Hide all sections
    document.querySelectorAll('.admin-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show target section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Load specific data for section
        switch(sectionId) {
            case 'manageGames':
                loadGames();
                break;
            case 'uploadedImages':
                loadUploadedImages();
                break;
            case 'stats':
                loadStats();
                break;
            case 'security':
                loadSecurityInfo();
                break;
        }
    }
}

// Setup game form functionality
function setupGameForm() {
    const form = document.getElementById('gameForm');
    const imageInput = document.getElementById('gameImage');
    const addLinkBtn = document.getElementById('addLink');
    const previewContainer = document.getElementById('imagePreview');
    const previewImage = document.getElementById('previewImage');
    const fileName = document.querySelector('.file-name');
    
    if (!form) return;
    
    // Image preview functionality
    if (imageInput) {
        imageInput.addEventListener('change', function() {
            const file = this.files[0];
            
            if (file) {
                // Validate file size (max 2MB)
                if (file.size > 2 * 1024 * 1024) {
                    showAdminMessage('Image size must be less than 2MB', 'error');
                    this.value = '';
                    return;
                }
                
                // Validate file type
                if (!file.type.match('image.*')) {
                    showAdminMessage('Please select an image file (JPEG, PNG, etc.)', 'error');
                    this.value = '';
                    return;
                }
                
                // Show file name
                if (fileName) {
                    fileName.textContent = file.name + ` (${Math.round(file.size / 1024)}KB)`;
                }
                
                // Preview image
                const reader = new FileReader();
                reader.onload = function(e) {
                    if (previewImage) {
                        previewImage.src = e.target.result;
                        previewImage.style.display = 'block';
                        previewContainer.querySelector('span').style.display = 'none';
                    }
                };
                reader.readAsDataURL(file);
            }
        });
    }
    
    // Add download link button
    if (addLinkBtn) {
        addLinkBtn.addEventListener('click', function() {
            addDownloadLinkField();
        });
    }
    
    // Remove download link functionality
    document.getElementById('downloadLinks').addEventListener('click', function(e) {
        if (e.target.closest('.remove-link')) {
            const linkDiv = e.target.closest('.download-link');
            if (document.querySelectorAll('.download-link').length > 1) {
                linkDiv.remove();
            } else {
                showAdminMessage('At least one download link is required', 'error');
            }
        }
    });
    
    // Form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Check if editing existing game
        const isEditing = form.dataset.editId;
        if (isEditing) {
            updateGame(parseInt(isEditing));
        } else {
            saveGame();
        }
    });
    
    // Form reset
    form.addEventListener('reset', function() {
        // Clear edit mode
        delete form.dataset.editId;
        
        // Reset submit button
        const submitBtn = form.querySelector('button[type="submit"]');
        if (submitBtn) {
            submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Game';
        }
        
        // Clear preview
        if (previewImage) {
            previewImage.src = '';
            previewImage.style.display = 'none';
            previewContainer.querySelector('span').style.display = 'block';
        }
        
        if (fileName) {
            fileName.textContent = 'No file chosen';
        }
        
        // Reset download links to one
        const downloadLinks = document.getElementById('downloadLinks');
        while (downloadLinks.children.length > 1) {
            downloadLinks.lastChild.remove();
        }
        
        // Reset first link
        const firstLink = downloadLinks.querySelector('.download-link');
        if (firstLink) {
            firstLink.querySelector('.link-platform').value = 'Google Play';
            firstLink.querySelector('.link-url').value = '';
        }
        
        showAdminMessage('Form reset successfully', 'info');
    });
}

// Add new download link field
function addDownloadLinkField() {
    const downloadLinks = document.getElementById('downloadLinks');
    
    const newLink = document.createElement('div');
    newLink.className = 'download-link';
    newLink.innerHTML = `
        <select class="link-platform">
            <option value="Google Play">Google Play</option>
            <option value="Direct">Direct Download</option>
            <option value="MediaFire">MediaFire</option>
            <option value="Mega">MEGA</option>
            <option value="Other">Other</option>
        </select>
        <input type="url" class="link-url" placeholder="https://..." required>
        <button type="button" class="remove-link"><i class="fas fa-times"></i></button>
    `;
    
    downloadLinks.appendChild(newLink);
}

// Save new game
async function saveGame() {
    // Validate form
    if (!validateGameForm()) {
        return;
    }
    
    try {
        // Get form values
        const gameName = document.getElementById('gameName').value.trim();
        const gameVersion = document.getElementById('gameVersion').value.trim();
        const gameGenre = document.getElementById('gameGenre').value;
        const gameSize = document.getElementById('gameSize').value.trim();
        const gameDescription = document.getElementById('gameDescription').value.trim();
        const modInfo = document.getElementById('modInfo').value.trim();
        
        // Get selected platform
        const selectedPlatform = document.querySelector('input[name="platform"]:checked');
        const platform = selectedPlatform ? selectedPlatform.value : 'Android';
        
        // Get image data
        const imageInput = document.getElementById('gameImage');
        let imageData = '';
        
        if (imageInput.files.length > 0) {
            imageData = await convertImageToBase64(imageInput.files[0]);
        } else {
            // Use placeholder image
            imageData = 'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=' + encodeURIComponent(gameName);
        }
        
        // Get download links
        const downloadLinks = [];
        document.querySelectorAll('.download-link').forEach(link => {
            const platformSelect = link.querySelector('.link-platform');
            const urlInput = link.querySelector('.link-url');
            
            if (urlInput.value.trim()) {
                downloadLinks.push({
                    platform: platformSelect.value,
                    url: urlInput.value.trim()
                });
            }
        });
        
        // Validate at least one download link
        if (downloadLinks.length === 0) {
            showAdminMessage('Please add at least one download link', 'error');
            return;
        }
        
        // Create game object
        const game = {
            id: Date.now(), // Unique ID
            name: gameName,
            version: gameVersion || '1.0.0',
            genre: gameGenre,
            platform: platform,
            size: gameSize,
            description: gameDescription,
            modInfo: modInfo,
            image: imageData,
            downloadLinks: downloadLinks,
            dateAdded: new Date().toISOString(),
            downloads: 0,
            rating: 0,
            votes: 0,
            ratingDistribution: [0, 0, 0, 0, 0],
            views: 0
        };
        
        // Save to localStorage
        const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
        games.push(game);
        localStorage.setItem('pspgamers_games', JSON.stringify(games));
        
        // Show success message
        showAdminMessage(`"${gameName}" added successfully!`, 'success');
        
        // Log activity
        logActivity(`Added new game: ${gameName}`);
        
        // Reset form
        document.getElementById('gameForm').reset();
        
        // Reload data
        loadGames();
        loadUploadedImages();
        loadStats();
        
        // Switch to manage games section
        showSection('manageGames');
        document.querySelector('.admin-sidebar li.active')?.classList.remove('active');
        document.querySelector('.admin-sidebar li:nth-child(2)')?.classList.add('active');
        
    } catch (error) {
        showAdminMessage('Error saving game: ' + error.message, 'error');
    }
}

// Update existing game
async function updateGame(gameId) {
    if (!validateGameForm()) {
        return;
    }
    
    try {
        // Get form values
        const gameName = document.getElementById('gameName').value.trim();
        const gameVersion = document.getElementById('gameVersion').value.trim();
        const gameGenre = document.getElementById('gameGenre').value;
        const gameSize = document.getElementById('gameSize').value.trim();
        const gameDescription = document.getElementById('gameDescription').value.trim();
        const modInfo = document.getElementById('modInfo').value.trim();
        
        // Get selected platform
        const selectedPlatform = document.querySelector('input[name="platform"]:checked');
        const platform = selectedPlatform ? selectedPlatform.value : 'Android';
        
        // Get image data
        const imageInput = document.getElementById('gameImage');
        let imageData = '';
        
        if (imageInput.files.length > 0) {
            // New image uploaded
            imageData = await convertImageToBase64(imageInput.files[0]);
        } else {
            // Keep existing image
            const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
            const existingGame = games.find(g => g.id === gameId);
            imageData = existingGame ? existingGame.image : 
                'https://via.placeholder.com/300x200/4A90E2/FFFFFF?text=' + encodeURIComponent(gameName);
        }
        
        // Get download links
        const downloadLinks = [];
        document.querySelectorAll('.download-link').forEach(link => {
            const platformSelect = link.querySelector('.link-platform');
            const urlInput = link.querySelector('.link-url');
            
            if (urlInput.value.trim()) {
                downloadLinks.push({
                    platform: platformSelect.value,
                    url: urlInput.value.trim()
                });
            }
        });
        
        // Validate at least one download link
        if (downloadLinks.length === 0) {
            showAdminMessage('Please add at least one download link', 'error');
            return;
        }
        
        // Update game in localStorage
        const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
        const gameIndex = games.findIndex(g => g.id === gameId);
        
        if (gameIndex !== -1) {
            // Keep existing stats
            const existingGame = games[gameIndex];
            
            games[gameIndex] = {
                ...existingGame,
                name: gameName,
                version: gameVersion || '1.0.0',
                genre: gameGenre,
                platform: platform,
                size: gameSize,
                description: gameDescription,
                modInfo: modInfo,
                image: imageData,
                downloadLinks: downloadLinks,
                lastUpdated: new Date().toISOString()
            };
            
            localStorage.setItem('pspgamers_games', JSON.stringify(games));
            
            // Show success message
            showAdminMessage(`"${gameName}" updated successfully!`, 'success');
            
            // Log activity
            logActivity(`Updated game: ${gameName}`);
            
            // Clear edit mode
            const form = document.getElementById('gameForm');
            delete form.dataset.editId;
            
            // Reset submit button
            const submitBtn = form.querySelector('button[type="submit"]');
            if (submitBtn) {
                submitBtn.innerHTML = '<i class="fas fa-save"></i> Save Game';
            }
            
            // Reset form
            form.reset();
            
            // Reload data
            loadGames();
            loadUploadedImages();
            loadStats();
            
            // Switch to manage games section
            showSection('manageGames');
            document.querySelector('.admin-sidebar li.active')?.classList.remove('active');
            document.querySelector('.admin-sidebar li:nth-child(2)')?.classList.add('active');
        } else {
            showAdminMessage('Game not found!', 'error');
        }
        
    } catch (error) {
        showAdminMessage('Error updating game: ' + error.message, 'error');
    }
}

// Convert image to base64 with compression
function convertImageToBase64(file) {
    return new Promise((resolve, reject) => {
        // Validate file size (max 2MB)
        if (file.size > 2 * 1024 * 1024) {
            reject(new Error('Image must be less than 2MB'));
            return;
        }
        
        // Validate file type
        if (!file.type.match('image.*')) {
            reject(new Error('File must be an image (JPEG, PNG, etc.)'));
            return;
        }
        
        const reader = new FileReader();
        
        reader.onload = function(e) {
            // Compress image if it's too large
            const img = new Image();
            img.onload = function() {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // Set maximum dimensions for storage
                const MAX_WIDTH = 800;
                const MAX_HEIGHT = 600;
                let width = img.width;
                let height = img.height;
                
                // Calculate new dimensions while maintaining aspect ratio
                if (width > height) {
                    if (width > MAX_WIDTH) {
                        height *= MAX_WIDTH / width;
                        width = MAX_WIDTH;
                    }
                } else {
                    if (height > MAX_HEIGHT) {
                        width *= MAX_HEIGHT / height;
                        height = MAX_HEIGHT;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);
                
                // Convert to base64 with compression for storage
                const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
                resolve(compressedBase64);
            };
            
            img.onerror = function() {
                reject(new Error('Error loading image'));
            };
            
            img.src = e.target.result;
        };
        
        reader.onerror = function(error) {
            reject(new Error('Error reading file'));
        };
        
        reader.readAsDataURL(file);
    });
}

// Validate game form
function validateGameForm() {
    const requiredFields = [
        { id: 'gameName', name: 'Game Name' },
        { id: 'gameGenre', name: 'Genre' },
        { id: 'gameSize', name: 'Size' },
        { id: 'modInfo', name: 'MOD Info' },
        { id: 'gameImage', name: 'Game Image' }
    ];
    
    // Check required fields
    for (const field of requiredFields) {
        const element = document.getElementById(field.id);
        if (!element.value.trim() && field.id !== 'gameImage') {
            showAdminMessage(`${field.name} is required`, 'error');
            element.focus();
            return false;
        }
    }
    
    // Check image (special handling)
    const imageInput = document.getElementById('gameImage');
    const isEditing = document.getElementById('gameForm').dataset.editId;
    
    if (!imageInput.files.length && !isEditing) {
        showAdminMessage('Please select a game image', 'error');
        return false;
    }
    
    return true;
}

// Setup platform filters
function setupPlatformFilters() {
    document.querySelectorAll('.platform-filter').forEach(button => {
        button.addEventListener('click', function() {
            // Update active state
            document.querySelectorAll('.platform-filter').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            const platform = this.getAttribute('data-platform');
            
            // Filter games list
            if (document.getElementById('adminGamesList')) {
                filterAdminGames(platform);
            }
            
            // Filter images grid
            if (document.getElementById('uploadedImagesGrid')) {
                filterImages(platform);
            }
        });
    });
}

// Load games into admin panel
function loadGames() {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const gamesList = document.getElementById('adminGamesList');
    
    if (!gamesList) return;
    
    if (games.length === 0) {
        gamesList.innerHTML = `
            <div class="no-games">
                <i class="fas fa-gamepad fa-3x"></i>
                <h3>No Games Added Yet</h3>
                <p>Add your first game using the form!</p>
            </div>
        `;
        return;
    }
    
    // Create platform badge HTML
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
            <span class="platform-badge ${colors[platformName]}">
                <i class="${icons[platformName]}"></i> ${platformName}
            </span>
        `;
    }
    
    // Generate game cards
    gamesList.innerHTML = games.map(game => `
        <div class="admin-game-item" data-id="${game.id}" data-platform="${game.platform || 'Android'}">
            <img src="${game.image}" alt="${game.name}" class="admin-game-img" 
                 onerror="this.src='https://via.placeholder.com/100x100/4A90E2/FFFFFF?text=IMG'">
            <div class="admin-game-info">
                <h4>${game.name}</h4>
                <div class="admin-game-meta">
                    ${getPlatformBadge(game.platform || 'Android')}
                    <span><i class="fas fa-tags"></i> ${game.genre}</span>
                    <span><i class="fas fa-hdd"></i> ${game.size}</span>
                    <span><i class="fas fa-download"></i> ${game.downloads || 0} downloads</span>
                    <span><i class="fas fa-eye"></i> ${game.views || 0} views</span>
                    ${game.rating ? `<span><i class="fas fa-star"></i> ${game.rating.toFixed(1)}/5</span>` : ''}
                </div>
                <p class="admin-game-desc">${game.modInfo || 'No MOD info available'}</p>
                <p class="admin-game-date">
                    Added: ${new Date(game.dateAdded).toLocaleDateString()}
                    ${game.lastUpdated ? `<br>Updated: ${new Date(game.lastUpdated).toLocaleDateString()}` : ''}
                </p>
            </div>
            <div class="admin-game-actions">
                <button class="btn-share" onclick="showShareOptions(${game.id})" title="Share Game">
                    <i class="fas fa-share-alt"></i> Share
                </button>
                <button class="btn-edit" onclick="editGame(${game.id})">
                    <i class="fas fa-edit"></i> Edit
                </button>
                <button class="btn-delete" onclick="deleteGame(${game.id})">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        </div>
    `).reverse().join(''); // Show newest first
}

// Filter games by platform
function filterAdminGames(platform) {
    const gameItems = document.querySelectorAll('.admin-game-item');
    
    gameItems.forEach(item => {
        const itemPlatform = item.getAttribute('data-platform');
        
        if (platform === 'all' || itemPlatform === platform) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Load uploaded images
function loadUploadedImages() {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const imagesGrid = document.getElementById('uploadedImagesGrid');
    
    if (!imagesGrid) return;
    
    if (games.length === 0) {
        imagesGrid.innerHTML = '<p class="no-images">No images uploaded yet.</p>';
        return;
    }
    
    imagesGrid.innerHTML = games.map(game => `
        <div class="uploaded-image" data-platform="${game.platform || 'Android'}">
            <img src="${game.image}" alt="${game.name}" 
                 onerror="this.src='https://via.placeholder.com/180x180/4A90E2/FFFFFF?text=IMG'">
            <div class="image-info">
                <strong>${game.name}</strong><br>
                ${game.size} • ${game.genre}
            </div>
            <div class="platform-preview ${(game.platform || 'Android').toLowerCase()}">
                ${game.platform || 'Android'}
            </div>
        </div>
    `).reverse().join(''); // Show newest first
}

// Filter images by platform
function filterImages(platform) {
    const images = document.querySelectorAll('.uploaded-image');
    
    images.forEach(img => {
        const imgPlatform = img.getAttribute('data-platform');
        
        if (platform === 'all' || imgPlatform === platform) {
            img.style.display = 'block';
        } else {
            img.style.display = 'none';
        }
    });
}

// Load statistics
function loadStats() {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    
    // Update basic stats
    document.getElementById('totalGames').textContent = games.length;
    
    const totalDownloads = games.reduce((sum, game) => sum + (game.downloads || 0), 0);
    document.getElementById('totalDownloads').textContent = totalDownloads.toLocaleString();
    
    document.getElementById('totalImages').textContent = games.length;
    
    if (games.length > 0) {
        const latestGame = games.reduce((latest, game) => {
            const gameDate = new Date(game.dateAdded);
            const latestDate = new Date(latest.dateAdded);
            return gameDate > latestDate ? game : latest;
        });
        const date = new Date(latestGame.dateAdded);
        document.getElementById('lastUpdated').textContent = date.toLocaleDateString();
    } else {
        document.getElementById('lastUpdated').textContent = '-';
    }
    
    // Load platform statistics
    loadPlatformStats(games);
}

// Load platform-specific statistics
function loadPlatformStats(games) {
    const platformChart = document.getElementById('platformChart');
    if (!platformChart) return;
    
    // Count games by platform
    const platformCounts = {
        'Android': 0,
        'PC': 0,
        'PSP': 0,
        'PS2': 0
    };
    
    // Count downloads by platform
    const platformDownloads = {
        'Android': 0,
        'PC': 0,
        'PSP': 0,
        'PS2': 0
    };
    
    // Count views by platform
    const platformViews = {
        'Android': 0,
        'PC': 0,
        'PSP': 0,
        'PS2': 0
    };
    
    games.forEach(game => {
        const platform = game.platform || 'Android';
        if (platformCounts[platform] !== undefined) {
            platformCounts[platform]++;
            platformDownloads[platform] += (game.downloads || 0);
            platformViews[platform] += (game.views || 0);
        }
    });
    
    const platformIcons = {
        'Android': 'fab fa-android',
        'PC': 'fas fa-desktop',
        'PSP': 'fas fa-gamepad',
        'PS2': 'fas fa-gamepad'
    };
    
    const platformColors = {
        'Android': '#FF0000',
        'PC': '#007BFF',
        'PSP': '#FFD700',
        'PS2': '#800080'
    };
    
    platformChart.innerHTML = Object.entries(platformCounts)
        .filter(([_, count]) => count > 0)
        .map(([platform, count]) => `
            <div class="platform-stat-item">
                <div class="platform-stat-icon ${platform.toLowerCase()}" 
                     style="background: ${platformColors[platform]}">
                    <i class="${platformIcons[platform]}"></i>
                </div>
                <div class="platform-stat-info">
                    <h4>${platform}</h4>
                    <p class="platform-stat-count">${count} game${count !== 1 ? 's' : ''}</p>
                    <p class="platform-stat-downloads">${platformDownloads[platform].toLocaleString()} downloads</p>
                    <p class="platform-stat-views">${platformViews[platform].toLocaleString()} views</p>
                </div>
            </div>
        `).join('');
}

// Edit game
function editGame(gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
        showAdminMessage('Game not found!', 'error');
        return;
    }
    
    // Populate form with game data
    document.getElementById('gameName').value = game.name;
    document.getElementById('gameVersion').value = game.version || '';
    document.getElementById('gameGenre').value = game.genre;
    document.getElementById('gameSize').value = game.size;
    document.getElementById('gameDescription').value = game.description || '';
    document.getElementById('modInfo').value = game.modInfo || '';
    
    // Set platform
    const platform = game.platform || 'Android';
    document.getElementById(`platform-${platform.toLowerCase()}`).checked = true;
    
    // Set image preview
    const previewImage = document.getElementById('previewImage');
    const fileName = document.querySelector('.file-name');
    if (previewImage) {
        previewImage.src = game.image;
        previewImage.style.display = 'block';
        document.getElementById('imagePreview').querySelector('span').style.display = 'none';
    }
    if (fileName) {
        fileName.textContent = 'Current image - select new image to replace';
    }
    
    // Clear and set download links
    const downloadLinksContainer = document.getElementById('downloadLinks');
    downloadLinksContainer.innerHTML = '';
    
    if (game.downloadLinks && game.downloadLinks.length > 0) {
        game.downloadLinks.forEach((link, index) => {
            const linkDiv = document.createElement('div');
            linkDiv.className = 'download-link';
            linkDiv.innerHTML = `
                <select class="link-platform">
                    <option value="Google Play" ${link.platform === 'Google Play' ? 'selected' : ''}>Google Play</option>
                    <option value="Direct" ${link.platform === 'Direct' ? 'selected' : ''}>Direct Download</option>
                    <option value="MediaFire" ${link.platform === 'MediaFire' ? 'selected' : ''}>MediaFire</option>
                    <option value="Mega" ${link.platform === 'Mega' ? 'selected' : ''}>MEGA</option>
                    <option value="Other" ${link.platform === 'Other' ? 'selected' : ''}>Other</option>
                </select>
                <input type="url" class="link-url" placeholder="https://..." value="${link.url || ''}" required>
                <button type="button" class="remove-link"><i class="fas fa-times"></i></button>
            `;
            downloadLinksContainer.appendChild(linkDiv);
        });
    } else {
        // Add one empty link
        addDownloadLinkField();
    }
    
    // Change form to update mode
    const form = document.getElementById('gameForm');
    form.dataset.editId = gameId;
    
    // Change submit button text
    const submitBtn = form.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.innerHTML = '<i class="fas fa-save"></i> Update Game';
    }
    
    // Switch to add game section
    showSection('addGame');
    document.querySelector('.admin-sidebar li.active')?.classList.remove('active');
    document.querySelector('.admin-sidebar li:nth-child(1)')?.classList.add('active');
    
    showAdminMessage(`Editing game: ${game.name}`, 'info');
    logActivity(`Started editing game: ${game.name}`);
}

// Delete game
function deleteGame(gameId) {
    if (!confirm('Are you sure you want to delete this game? This action cannot be undone.')) {
        return;
    }
    
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const gameIndex = games.findIndex(g => g.id === gameId);
    
    if (gameIndex !== -1) {
        const gameName = games[gameIndex].name;
        games.splice(gameIndex, 1);
        localStorage.setItem('pspgamers_games', JSON.stringify(games));
        
        // Also remove any share links for this game
        const shareLinks = JSON.parse(localStorage.getItem('pspgamers_shareLinks') || '{}');
        Object.keys(shareLinks).forEach(key => {
            if (shareLinks[key].gameId === gameId) {
                delete shareLinks[key];
            }
        });
        localStorage.setItem('pspgamers_shareLinks', JSON.stringify(shareLinks));
        
        showAdminMessage(`"${gameName}" deleted successfully!`, 'success');
        logActivity(`Deleted game: ${gameName}`);
        
        // Reload data
        loadGames();
        loadUploadedImages();
        loadStats();
    } else {
        showAdminMessage('Game not found!', 'error');
    }
}

// Setup share buttons
function setupShareButtons() {
    // Share functionality is handled by showShareOptions function
}

// Show share options modal
function showShareOptions(gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === gameId);
    
    if (!game) {
        showAdminMessage('Game not found!', 'error');
        return;
    }
    
    // Generate share link
    const shareInfo = generateGameShareLink(gameId);
    const directLink = `${window.location.origin || 'https://darklord813.github.io'}/game.html?id=${gameId}`;
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'share-modal-overlay';
    modal.innerHTML = `
        <div class="share-modal">
            <div class="share-modal-header">
                <h3><i class="fas fa-share-alt"></i> Share "${game.name}"</h3>
                <button class="close-modal"><i class="fas fa-times"></i></button>
            </div>
            <div class="share-modal-body">
                <!-- Direct Link -->
                <div class="share-option">
                    <h4><i class="fas fa-link"></i> Direct Link</h4>
                    <div class="link-container">
                        <input type="text" readonly value="${directLink}" id="directLink">
                        <button class="copy-btn" onclick="copyToClipboard('directLink')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <small>Permanent link to this game</small>
                </div>
                
                <!-- Share Link -->
                <div class="share-option">
                    <h4><i class="fas fa-share-square"></i> Share Link (30 days)</h4>
                    <div class="link-container">
                        <input type="text" readonly value="${shareInfo.url}" id="shareLink">
                        <button class="copy-btn" onclick="copyToClipboard('shareLink')">
                            <i class="fas fa-copy"></i> Copy
                        </button>
                    </div>
                    <small>Share Code: <code>${shareInfo.code}</code> | Expires: ${new Date(shareInfo.expires).toLocaleDateString()}</small>
                </div>
                
                <!-- Quick Share -->
                <div class="quick-share">
                    <h4><i class="fas fa-rocket"></i> Quick Share</h4>
                    <div class="share-buttons">
                        <button class="share-btn whatsapp" onclick="quickShare('whatsapp', ${gameId})">
                            <i class="fab fa-whatsapp"></i> WhatsApp
                        </button>
                        <button class="share-btn telegram" onclick="quickShare('telegram', ${gameId})">
                            <i class="fab fa-telegram"></i> Telegram
                        </button>
                        <button class="share-btn facebook" onclick="quickShare('facebook', ${gameId})">
                            <i class="fab fa-facebook"></i> Facebook
                        </button>
                    </div>
                </div>
                
                <!-- QR Code -->
                <div class="qr-section">
                    <h4><i class="fas fa-qrcode"></i> QR Code</h4>
                    <div id="qrcode"></div>
                    <button class="btn-secondary" onclick="downloadQRCode('${shareInfo.url}', '${game.name}')">
                        <i class="fas fa-download"></i> Download QR
                    </button>
                </div>
            </div>
            <div class="share-modal-footer">
                <button class="btn-primary" onclick="closeShareModal()">
                    <i class="fas fa-check"></i> Done
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Close modal handlers
    modal.querySelector('.close-modal').addEventListener('click', closeShareModal);
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            closeShareModal();
        }
    });
    
    // Generate QR Code
    generateQRCode(shareInfo.url, 'qrcode');
    
    // Log activity
    logActivity(`Generated share link for: ${game.name}`);
}

// Generate QR Code
function generateQRCode(text, elementId) {
    // Simple QR code generation using Google Charts API
    const qrSize = 150;
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${qrSize}x${qrSize}&chl=${encodeURIComponent(text)}`;
    
    const qrElement = document.getElementById(elementId);
    if (qrElement) {
        qrElement.innerHTML = `<img src="${qrUrl}" alt="QR Code" style="width: ${qrSize}px; height: ${qrSize}px;">`;
    }
}

// Download QR Code
function downloadQRCode(url, gameName) {
    const qrSize = 300;
    const qrUrl = `https://chart.googleapis.com/chart?cht=qr&chs=${qrSize}x${qrSize}&chl=${encodeURIComponent(url)}`;
    
    // Create temporary link
    const link = document.createElement('a');
    link.href = qrUrl;
    link.download = `pspgamers-qr-${gameName.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showAdminMessage('QR Code downloaded!', 'success');
}

// Quick share to social media
function quickShare(platform, gameId) {
    const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
    const game = games.find(g => g.id === gameId);
    
    if (!game) return;
    
    const shareInfo = generateGameShareLink(gameId);
    const message = `🎮 Check out "${game.name}" on PSP GAMERS!\n\n📱 Platform: ${game.platform}\n📦 Size: ${game.size}\n⭐ MOD: ${game.modInfo}\n\nDownload now: ${shareInfo.url}`;
    
    let shareUrl = '';
    
    switch(platform) {
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
            break;
        case 'telegram':
            shareUrl = `https://t.me/share/url?url=${encodeURIComponent(shareInfo.url)}&text=${encodeURIComponent(message)}`;
            break;
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareInfo.url)}`;
            break;
        default:
            return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    showAdminMessage(`Shared to ${platform} successfully!`, 'success');
    logActivity(`Shared game to ${platform}: ${game.name}`);
}

// Copy to clipboard
function copyToClipboard(elementId) {
    const element = document.getElementById(elementId);
    if (element) {
        element.select();
        element.setSelectionRange(0, 99999); // For mobile devices
        
        navigator.clipboard.writeText(element.value)
            .then(() => {
                showAdminMessage('Link copied to clipboard!', 'success');
            })
            .catch(err => {
                console.error('Failed to copy: ', err);
                // Fallback for older browsers
                document.execCommand('copy');
                showAdminMessage('Link copied!', 'success');
            });
    }
}

// Close share modal
function closeShareModal() {
    const modal = document.querySelector('.share-modal-overlay');
    if (modal) {
        modal.remove();
    }
}

// Generate game share link
function generateGameShareLink(gameId) {
    // Generate unique share code
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 10);
    const shareCode = `psp_${gameId}_${timestamp}_${random}`;
    
    // Create share data
    const shareData = {
        code: shareCode,
        gameId: gameId,
        created: new Date().toISOString(),
        expires: new Date(timestamp + 30 * 24 * 60 * 60 * 1000).toISOString(), // 30 days
        views: 0
    };
    
    // Save to localStorage
    let shareLinks = JSON.parse(localStorage.getItem('pspgamers_shareLinks') || '{}');
    shareLinks[shareCode] = shareData;
    localStorage.setItem('pspgamers_shareLinks', JSON.stringify(shareLinks));
    
    // Generate URL
    const baseUrl = window.location.origin || 'https://darklord813.github.io';
    const shareUrl = `${baseUrl}/game.html?share=${shareCode}`;
    
    return {
        code: shareCode,
        url: shareUrl,
        expires: shareData.expires,
        directUrl: `${baseUrl}/game.html?id=${gameId}`
    };
}

// Setup security section
function setupSecurityButtons() {
    // Clear cache button
    document.getElementById('clearCache')?.addEventListener('click', function() {
        if (confirm('Clear all cached data? This will remove:\n• All games\n• All ratings\n• User preferences\n• Share links\n\nThis action cannot be undone!')) {
            localStorage.removeItem('pspgamers_games');
            localStorage.removeItem('pspgamers_ratings');
            localStorage.removeItem('pspgamers_userId');
            localStorage.removeItem('pspgamers_theme');
            localStorage.removeItem('pspgamers_shareLinks');
            localStorage.removeItem('pspgamers_gameViews');
            localStorage.removeItem('pspgamers_shareAccess');
            localStorage.removeItem('pspgamers_platformDownloads');
            
            showAdminMessage('All cache cleared successfully!', 'success');
            logActivity('Cleared all cache');
            
            // Reload
            loadGames();
            loadUploadedImages();
            loadStats();
        }
    });
    
    // Force logout button
    document.getElementById('forceLogout')?.addEventListener('click', function() {
        if (confirm('Logout from all devices? This will end your current session immediately.')) {
            logout();
        }
    });
}

// Load security information
function loadSecurityInfo() {
    // Get user info
    const adminName = localStorage.getItem('adminUsername') || 'Admin';
    const loginTime = localStorage.getItem('adminLoginTime');
    const loginDate = new Date(loginTime);
    
    // Update security info
    document.getElementById('securityUsername').textContent = adminName;
    document.getElementById('securityLoginTime').textContent = loginDate.toLocaleString();
    
    // Calculate expiry time (8 hours from login)
    const expiryDate = new Date(loginDate.getTime() + (8 * 60 * 60 * 1000));
    document.getElementById('securityExpiryTime').textContent = expiryDate.toLocaleString();
    
    // Get IP address
    fetch('https://api.ipify.org?format=json')
        .then(response => response.json())
        .then(data => {
            document.getElementById('securityIP').textContent = data.ip;
        })
        .catch(() => {
            document.getElementById('securityIP').textContent = 'Unable to fetch';
        });
}

// Log activity
function logActivity(action) {
    const activityLog = document.getElementById('activityLog');
    const securityLog = document.getElementById('securityLog');
    const timestamp = new Date().toLocaleTimeString();
    
    const logEntry = `<p><strong>${timestamp}:</strong> ${action}</p>`;
    
    if (activityLog) {
        // Add to activity log
        if (activityLog.innerHTML.includes('No recent activity')) {
            activityLog.innerHTML = logEntry;
        } else {
            activityLog.innerHTML = logEntry + activityLog.innerHTML;
        }
        
        // Keep only last 10 entries
        const entries = activityLog.querySelectorAll('p');
        if (entries.length > 10) {
            entries[entries.length - 1].remove();
        }
    }
    
    // Show in security log briefly
    if (securityLog) {
        securityLog.innerHTML = `${timestamp}: ${action}`;
        securityLog.style.display = 'block';
        setTimeout(() => {
            securityLog.style.display = 'none';
        }, 3000);
    }
}

// Show admin message
function showAdminMessage(message, type = 'info') {
    const messageDiv = document.getElementById('adminMessage');
    if (!messageDiv) return;
    
    // Set message
    messageDiv.textContent = message;
    messageDiv.className = `admin-message ${type}`;
    
    // Auto-hide after 5 seconds
    setTimeout(() => {
        if (messageDiv.textContent === message) {
            messageDiv.textContent = '';
            messageDiv.className = 'admin-message';
        }
    }, 5000);
}

// Add share styles
function addShareStyles() {
    if (!document.getElementById('share-styles')) {
        const style = document.createElement('style');
        style.id = 'share-styles';
        style.textContent = `
            .share-modal-overlay {
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                align-items: center;
                justify-content: center;
                z-index: 10000;
                backdrop-filter: blur(5px);
            }
            
            .share-modal {
                background: white;
                border-radius: 20px;
                width: 90%;
                max-width: 500px;
                max-height: 90vh;
                overflow-y: auto;
                box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                animation: modalSlideIn 0.3s ease;
            }
            
            @keyframes modalSlideIn {
                from { transform: translateY(-50px); opacity: 0; }
                to { transform: translateY(0); opacity: 1; }
            }
            
            .share-modal-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px 25px;
                border-bottom: 2px solid #f0f0f0;
            }
            
            .share-modal-header h3 {
                margin: 0;
                font-size: 20px;
                color: #333;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .close-modal {
                background: none;
                border: none;
                font-size: 20px;
                color: #666;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                width: 40px;
                height: 40px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .close-modal:hover {
                background: #f0f0f0;
                color: #333;
            }
            
            .share-modal-body {
                padding: 25px;
            }
            
            .share-option {
                margin-bottom: 25px;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
                border-left: 4px solid #667eea;
            }
            
            .share-option h4 {
                margin: 0 0 15px 0;
                color: #333;
                display: flex;
                align-items: center;
                gap: 10px;
            }
            
            .link-container {
                display: flex;
                gap: 10px;
                margin-bottom: 10px;
            }
            
            .link-container input {
                flex: 1;
                padding: 12px 15px;
                border: 2px solid #e0e0e0;
                border-radius: 10px;
                font-family: monospace;
                font-size: 14px;
                background: white;
                color: #333;
            }
            
            .link-container input:read-only {
                cursor: text;
            }
            
            .copy-btn {
                background: #4CAF50;
                color: white;
                border: none;
                padding: 0 20px;
                border-radius: 10px;
                cursor: pointer;
                font-weight: 600;
                display: flex;
                align-items: center;
                gap: 8px;
                transition: all 0.3s;
            }
            
            .copy-btn:hover {
                background: #45a049;
                transform: translateY(-2px);
            }
            
            .quick-share {
                margin: 30px 0;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
            }
            
            .quick-share h4 {
                margin: 0 0 20px 0;
                color: #333;
            }
            
            .share-buttons {
                display: flex;
                gap: 15px;
                flex-wrap: wrap;
            }
            
            .share-btn {
                flex: 1;
                padding: 15px;
                border: none;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                transition: all 0.3s;
                min-width: 120px;
            }
            
            .share-btn.whatsapp { background: #25D366; }
            .share-btn.telegram { background: #0088cc; }
            .share-btn.facebook { background: #1877F2; }
            .share-btn.copy { background: #6c757d; }
            
            .share-btn:hover {
                transform: translateY(-3px);
                box-shadow: 0 8px 20px rgba(0,0,0,0.2);
            }
            
            .qr-section {
                text-align: center;
                padding: 20px;
                background: #f8f9fa;
                border-radius: 15px;
                margin-top: 20px;
            }
            
            .qr-section h4 {
                margin: 0 0 20px 0;
                color: #333;
            }
            
            .share-modal-footer {
                padding: 20px 25px;
                border-top: 2px solid #f0f0f0;
                text-align: right;
            }
            
            .admin-game-actions .btn-share {
                background: #17a2b8;
                color: white;
                padding: 10px 20px;
                border-radius: 10px;
                border: none;
                cursor: pointer;
                display: flex;
                align-items: center;
                gap: 8px;
                font-weight: 500;
                transition: all 0.3s;
            }
            
            .admin-game-actions .btn-share:hover {
                background: #138496;
                transform: translateY(-2px);
                box-shadow: 0 5px 15px rgba(23, 162, 184, 0.3);
            }
            
            .admin-game-actions {
                display: flex;
                gap: 12px;
            }
            
            .admin-game-date {
                font-size: 12px;
                color: #666;
                margin-top: 10px;
            }
            
            .platform-stat-downloads,
            .platform-stat-views {
                font-size: 12px;
                color: #666;
                margin: 2px 0;
            }
        `;
        document.head.appendChild(style);
    }
}

// Logout function
function logout() {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminUsername');
    localStorage.removeItem('adminLoginTime');
    window.location.href = 'login.html';
}

// Make functions available globally
window.editGame = editGame;
window.deleteGame = deleteGame;
window.showShareOptions = showShareOptions;
window.copyToClipboard = copyToClipboard;
window.quickShare = quickShare;
window.closeShareModal = closeShareModal;
window.downloadQRCode = downloadQRCode;
window.logout = logout;
