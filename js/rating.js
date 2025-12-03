// Rating System for Games
class RatingSystem {
    constructor() {
        this.selectedRating = 0;
        this.currentGameId = null;
        this.init();
    }
    
    init() {
        this.setupStarHover();
        this.setupVoteSubmission();
        this.loadUserRatings();
        this.updateGameRatings();
    }
    
    setupStarHover() {
        const stars = document.querySelectorAll('.voting-star');
        
        stars.forEach(star => {
            star.addEventListener('mouseenter', (e) => {
                const value = parseInt(e.target.getAttribute('data-value'));
                this.highlightStars(value);
            });
            
            star.addEventListener('click', (e) => {
                const value = parseInt(e.target.getAttribute('data-value'));
                this.selectRating(value);
            });
        });
        
        // Reset stars when mouse leaves voting area
        const votingArea = document.getElementById('votingStars');
        if (votingArea) {
            votingArea.addEventListener('mouseleave', () => {
                this.highlightStars(this.selectedRating);
            });
        }
    }
    
    highlightStars(value) {
        const stars = document.querySelectorAll('.voting-star');
        stars.forEach(star => {
            const starValue = parseInt(star.getAttribute('data-value'));
            if (starValue <= value) {
                star.classList.add('selected');
                star.classList.remove('fa-regular');
                star.classList.add('fa-solid');
            } else {
                star.classList.remove('selected');
                star.classList.remove('fa-solid');
                star.classList.add('fa-regular');
            }
        });
    }
    
    selectRating(value) {
        this.selectedRating = value;
        this.highlightStars(value);
        
        // Enable submit button
        const submitBtn = document.getElementById('submitVote');
        if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Submit ${value} Star${value > 1 ? 's' : ''}`;
        }
        
        // Update user rating display
        const userRatingSpan = document.getElementById('userRating');
        if (userRatingSpan) {
            userRatingSpan.textContent = `${value} Star${value > 1 ? 's' : ''}`;
            userRatingSpan.style.color = '#FFD700';
            userRatingSpan.style.fontWeight = '600';
        }
    }
    
    setupVoteSubmission() {
        const submitBtn = document.getElementById('submitVote');
        if (submitBtn) {
            submitBtn.addEventListener('click', () => {
                if (this.selectedRating > 0) {
                    this.submitVote(this.selectedRating);
                }
            });
        }
    }
    
    submitVote(rating) {
        // Get current game ID
        const gameId = this.currentGameId || 'featured_vpn';
        
        // Get existing ratings
        let ratings = JSON.parse(localStorage.getItem('pspgamers_ratings') || '{}');
        
        if (!ratings[gameId]) {
            ratings[gameId] = {
                total: 0,
                sum: 0,
                votes: [],
                distribution: [0, 0, 0, 0, 0]
            };
        }
        
        // Check if user already voted
        const userId = this.getUserId();
        const existingVoteIndex = ratings[gameId].votes.findIndex(v => v.userId === userId);
        
        if (existingVoteIndex !== -1) {
            // Update existing vote
            const oldRating = ratings[gameId].votes[existingVoteIndex].rating;
            ratings[gameId].votes[existingVoteIndex].rating = rating;
            ratings[gameId].votes[existingVoteIndex].date = new Date().toISOString();
            
            // Update distribution
            ratings[gameId].distribution[5 - oldRating]--;
            ratings[gameId].distribution[5 - rating]++;
            
            // Update sum
            ratings[gameId].sum = ratings[gameId].sum - oldRating + rating;
            
            showNotification(`Updated your rating to ${rating} stars!`, 'success');
        } else {
            // Add new vote
            ratings[gameId].votes.push({
                userId: userId,
                rating: rating,
                date: new Date().toISOString()
            });
            
            // Update distribution
            ratings[gameId].distribution[5 - rating]++;
            
            // Update totals
            ratings[gameId].total++;
            ratings[gameId].sum += rating;
            
            showNotification(`Thanks for your ${rating} star rating!`, 'success');
        }
        
        // Save to localStorage
        localStorage.setItem('pspgamers_ratings', JSON.stringify(ratings));
        
        // Update display
        this.updateRatingDisplay(gameId);
        
        // Disable submit button after voting
        const submitBtn = document.getElementById('submitVote');
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.innerHTML = `<i class="fas fa-check"></i> Vote Submitted`;
            
            // Reset after 2 seconds
            setTimeout(() => {
                submitBtn.innerHTML = `<i class="fas fa-paper-plane"></i> Submit Rating`;
            }, 2000);
        }
        
        // Update all game ratings
        this.updateGameRatings();
    }
    
    getUserId() {
        // Generate a simple user ID based on browser fingerprint
        let userId = localStorage.getItem('pspgamers_userId');
        if (!userId) {
            userId = 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('pspgamers_userId', userId);
        }
        return userId;
    }
    
    loadUserRatings() {
        const userId = this.getUserId();
        const ratings = JSON.parse(localStorage.getItem('pspgamers_ratings') || '{}');
        
        // Check if user has rated the current game
        const gameId = this.currentGameId || 'featured_vpn';
        if (ratings[gameId]) {
            const userVote = ratings[gameId].votes.find(v => v.userId === userId);
            if (userVote) {
                this.selectedRating = userVote.rating;
                this.highlightStars(userVote.rating);
                
                const userRatingSpan = document.getElementById('userRating');
                if (userRatingSpan) {
                    userRatingSpan.textContent = `${userVote.rating} Star${userVote.rating > 1 ? 's' : ''}`;
                    userRatingSpan.style.color = '#FFD700';
                    userRatingSpan.style.fontWeight = '600';
                }
            }
        }
        
        // Update display
        this.updateRatingDisplay(gameId);
    }
    
    updateRatingDisplay(gameId) {
        const ratings = JSON.parse(localStorage.getItem('pspgamers_ratings') || '{}');
        const gameRatings = ratings[gameId];
        
        if (!gameRatings) return;
        
        // Calculate average
        const average = gameRatings.total > 0 ? gameRatings.sum / gameRatings.total : 0;
        
        // Update average rating display
        const avgRatingEl = document.querySelector('.average-rating');
        if (avgRatingEl) {
            avgRatingEl.textContent = average.toFixed(1);
        }
        
        // Update stars display
        this.updateStarDisplay(average);
        
        // Update vote count
        const totalVotesEl = document.getElementById('totalVotes');
        if (totalVotesEl) {
            totalVotesEl.textContent = gameRatings.total;
        }
    }
    
    updateStarDisplay(average) {
        const starsContainer = document.querySelector('.stars');
        if (!starsContainer) return;
        
        // Clear existing stars
        starsContainer.innerHTML = '';
        
        // Add full stars
        const fullStars = Math.floor(average);
        for (let i = 0; i < fullStars; i++) {
            const star = document.createElement('i');
            star.className = 'fas fa-star';
            starsContainer.appendChild(star);
        }
        
        // Add half star if needed
        if (average % 1 >= 0.25) {
            const halfStar = document.createElement('i');
            halfStar.className = 'fas fa-star-half-alt';
            starsContainer.appendChild(halfStar);
        }
        
        // Add empty stars
        const remainingStars = 5 - Math.ceil(average);
        for (let i = 0; i < remainingStars; i++) {
            const star = document.createElement('i');
            star.className = 'far fa-star';
            starsContainer.appendChild(star);
        }
    }
    
    updateGameRatings() {
        // Update ratings for all displayed games
        const ratings = JSON.parse(localStorage.getItem('pspgamers_ratings') || '{}');
        const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
        
        // Update each game's rating in localStorage
        games.forEach(game => {
            const gameRatings = ratings[game.id] || { total: 0, sum: 0, votes: [], distribution: [0, 0, 0, 0, 0] };
            const average = gameRatings.total > 0 ? gameRatings.sum / gameRatings.total : 0;
            
            // Update game object
            game.rating = average;
            game.votes = gameRatings.total;
            game.ratingDistribution = gameRatings.distribution;
        });
        
        // Save updated games
        localStorage.setItem('pspgamers_games', JSON.stringify(games));
        
        // Update displayed games
        this.updateDisplayedGameRatings();
    }
    
    updateDisplayedGameRatings() {
        const gameItems = document.querySelectorAll('.game-item');
        const games = JSON.parse(localStorage.getItem('pspgamers_games') || '[]');
        
        gameItems.forEach(item => {
            const gameId = parseInt(item.querySelector('.game-item-download')?.getAttribute('data-game-id'));
            const game = games.find(g => g.id === gameId);
            
            if (game) {
                const ratingContainer = item.querySelector('.game-rating-mini');
                if (ratingContainer) {
                    ratingContainer.querySelector('.stars').innerHTML = getStarRating(game.rating || 0);
                    ratingContainer.querySelector('.mini-rating-text').textContent = 
                        `${(game.rating || 0).toFixed(1)}/5 (${game.votes || 0})`;
                }
            }
        });
    }
}

// Helper function to generate star HTML
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
    for (let i = 0; i <remaining; i++) {
        stars += '<i class="far fa-star"></i>';
    }
    
    return stars;
}

// Notification function for rating.js
function showNotification(message, type = 'info') {
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
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#f44336' : '#2196F3'};
        color: white;
        padding: 15px 25px;
        border-radius: 15px;
        display: flex;
        align-items: center;
        gap: 15px;
        z-index: 10000;
        box-shadow: 0 8px 25px rgba(0,0,0,0.2);
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.animation = 'slideOut 0.3s ease forwards';
        setTimeout(() => notification.remove(), 300);
    });
    
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOut 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Initialize rating system when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.ratingSystem = new RatingSystem();
});
