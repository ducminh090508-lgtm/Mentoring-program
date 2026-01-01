// Educational Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Initialize the dashboard
    initializeNavigation();
    initializeCalendar();
    initializeProgressAnimations();
    initializeInteractivity();
});

// Navigation functionality
function initializeNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    const pages = document.querySelectorAll('.page-content');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all nav links
            navLinks.forEach(navLink => navLink.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Hide all pages
            pages.forEach(page => page.style.display = 'none');
            
            // Show the selected page
            const targetPage = this.getAttribute('data-page');
            const targetPageElement = document.getElementById(targetPage + '-page');
            if (targetPageElement) {
                targetPageElement.style.display = 'block';
            }
        });
    });
}

// Calendar functionality
function initializeCalendar() {
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    const calendarGrid = document.querySelector('.calendar-grid');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    const months = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    function renderCalendar() {
        // Clear existing calendar days
        const existingDays = calendarGrid.querySelectorAll('.calendar-day');
        existingDays.forEach(day => day.remove());
        
        // Update month display
        currentMonthElement.textContent = `${months[currentMonth]} ${currentYear}`;
        
        // Get first day of month and number of days
        const firstDay = new Date(currentYear, currentMonth, 1).getDay();
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        const today = new Date();
        
        // Add empty cells for days before the first day of the month
        for (let i = 0; i < firstDay; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day disabled';
            calendarGrid.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            
            // Highlight today
            if (currentYear === today.getFullYear() && 
                currentMonth === today.getMonth() && 
                day === today.getDate()) {
                dayElement.classList.add('today');
            }
            
            // Add click event
            dayElement.addEventListener('click', function() {
                // Remove selected class from all days
                calendarGrid.querySelectorAll('.calendar-day').forEach(d => {
                    d.classList.remove('selected');
                });
                // Add selected class to clicked day
                this.classList.add('selected');
            });
            
            calendarGrid.appendChild(dayElement);
        }
    }
    
    // Event listeners for navigation buttons
    prevMonthBtn.addEventListener('click', function() {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', function() {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Initial render
    renderCalendar();
}

// Progress animations
function initializeProgressAnimations() {
    const progressBars = document.querySelectorAll('.progress-indicator');
    
    // Animate progress bars on page load
    setTimeout(() => {
        progressBars.forEach(bar => {
            const width = bar.style.width;
            bar.style.width = '0%';
            bar.style.transition = 'width 1s ease-in-out';
            setTimeout(() => {
                bar.style.width = width;
            }, 100);
        });
    }, 500);
}

// Interactive features
function initializeInteractivity() {
    // Continue button interactions
    const continueButtons = document.querySelectorAll('.continue-btn');
    continueButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Simulate course continuation
            showNotification('Continuing lesson...', 'success');
            
            // Add some visual feedback
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Card hover effects
    const cards = document.querySelectorAll('.card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-4px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Sidebar button interactions
    const sidebarButtons = document.querySelectorAll('.icon-button');
    sidebarButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active state from all buttons
            sidebarButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active state to clicked button
            this.classList.add('active');
            
            // Add visual feedback
            this.style.transform = 'scale(0.9)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
        });
    });
    
    // Notification icon interaction
    const notificationIcon = document.querySelector('.notification-icon');
    if (notificationIcon) {
        notificationIcon.addEventListener('click', function() {
            showNotificationPanel();
        });
    }
    
    // User avatar interaction
    const userAvatar = document.querySelector('.user-avatar');
    if (userAvatar) {
        userAvatar.addEventListener('click', function() {
            showUserMenu();
        });
    }
    
    // Deadline item interactions
    const deadlineItems = document.querySelectorAll('.deadline-item');
    deadlineItems.forEach(item => {
        item.addEventListener('click', function() {
            showDeadlineDetails(this);
        });
    });
    
    // Submission item interactions
    const submissionItems = document.querySelectorAll('.submission-item');
    submissionItems.forEach(item => {
        item.addEventListener('click', function() {
            showSubmissionDetails(this);
        });
    });
}

// Utility functions
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : 'info-circle'}"></i>
        <span>${message}</span>
    `;
    
    // Style the notification
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? 'var(--status-active)' : 'var(--secondary-accent)'};
        color: var(--text-on-accent);
        padding: var(--padding-medium);
        border-radius: var(--radius-medium);
        box-shadow: var(--shadow-medium);
        display: flex;
        align-items: center;
        gap: var(--gap-small);
        z-index: 1000;
        animation: slideIn 0.3s ease-out;
    `;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-in';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

function showNotificationPanel() {
    // Create a simple notification panel
    const panel = document.createElement('div');
    panel.className = 'notification-panel';
    panel.innerHTML = `
        <div class="notification-panel-content">
            <h3>Notifications</h3>
            <div class="notification-list">
                <div class="notification-item">
                    <i class="fas fa-clock"></i>
                    <div>
                        <h4>Assignment Due Soon</h4>
                        <p>JavaScript Project due in 2 days</p>
                    </div>
                </div>
                <div class="notification-item">
                    <i class="fas fa-star"></i>
                    <div>
                        <h4>New Course Available</h4>
                        <p>Advanced React Patterns is now available</p>
                    </div>
                </div>
                <div class="notification-item">
                    <i class="fas fa-trophy"></i>
                    <div>
                        <h4>Achievement Unlocked</h4>
                        <p>You've completed 10 lessons this week!</p>
                    </div>
                </div>
            </div>
            <button class="close-panel" onclick="this.parentElement.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    // Style the panel
    panel.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        width: 320px;
        background: var(--primary-background);
        border-radius: var(--radius-large);
        box-shadow: var(--shadow-medium);
        z-index: 1000;
        animation: fadeIn 0.3s ease-out;
    `;
    
    document.body.appendChild(panel);
    
    // Close panel when clicking outside
    setTimeout(() => {
        document.addEventListener('click', function closePanel(e) {
            if (!panel.contains(e.target)) {
                panel.remove();
                document.removeEventListener('click', closePanel);
            }
        });
    }, 100);
}

function showUserMenu() {
    showNotification('User menu functionality would be implemented here', 'info');
}

function showDeadlineDetails(deadlineElement) {
    const title = deadlineElement.querySelector('h4').textContent;
    showNotification(`Deadline details for: ${title}`, 'info');
}

function showSubmissionDetails(submissionElement) {
    const title = submissionElement.querySelector('h4').textContent;
    showNotification(`Submission details for: ${title}`, 'info');
}

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
    
    .notification-panel-content {
        padding: var(--padding-medium);
        position: relative;
    }
    
    .notification-panel h3 {
        font-size: var(--h3-size);
        font-weight: var(--h3-weight);
        color: var(--text-headings);
        margin-bottom: var(--gap-medium);
    }
    
    .notification-list {
        display: flex;
        flex-direction: column;
        gap: var(--gap-medium);
    }
    
    .notification-item {
        display: flex;
        align-items: flex-start;
        gap: var(--gap-medium);
        padding: var(--padding-small);
        border-radius: var(--radius-medium);
        background-color: var(--primary-surface);
    }
    
    .notification-item i {
        font-size: 16px;
        color: var(--status-active);
        margin-top: 2px;
    }
    
    .notification-item h4 {
        font-size: var(--body-medium-size);
        font-weight: var(--body-small-weight);
        color: var(--text-headings);
        margin-bottom: 2px;
    }
    
    .notification-item p {
        font-size: var(--body-small-size);
        color: var(--text-body);
    }
    
    .close-panel {
        position: absolute;
        top: var(--padding-medium);
        right: var(--padding-medium);
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-subtle);
        font-size: 16px;
    }
    
    .close-panel:hover {
        color: var(--text-headings);
    }
    
    .icon-button.active {
        background-color: var(--secondary-accent);
        transform: translateY(-2px);
    }
`;
document.head.appendChild(style);

// Initialize dynamic data updates
function updateDashboardData() {
    // Simulate real-time updates
    updateProgressMetrics();
    updateActivityStats();
    updateNotificationCount();
}

function updateProgressMetrics() {
    // Simulate progress updates
    const progressBars = document.querySelectorAll('.progress-indicator');
    progressBars.forEach(bar => {
        const currentWidth = parseInt(bar.style.width);
        if (currentWidth < 100 && Math.random() > 0.95) {
            const newWidth = Math.min(currentWidth + 1, 100);
            bar.style.width = `${newWidth}%`;
        }
    });
}

function updateActivityStats() {
    // Update session time
    const timeElement = document.querySelector('.analytics-stats .stat-value');
    if (timeElement && timeElement.textContent.includes('h')) {
        const currentTime = timeElement.textContent;
        // This would typically come from a real-time API
    }
}

function updateNotificationCount() {
    const badge = document.querySelector('.notification-badge');
    if (badge && Math.random() > 0.99) {
        const currentCount = parseInt(badge.textContent);
        badge.textContent = currentCount + 1;
    }
}

// Update dashboard every 30 seconds
setInterval(updateDashboardData, 30000);

// Performance optimization: Lazy load images
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading if supported
if ('IntersectionObserver' in window) {
    lazyLoadImages();
}

// Add keyboard navigation
document.addEventListener('keydown', function(e) {
    // ESC key to close modals/panels
    if (e.key === 'Escape') {
        const panels = document.querySelectorAll('.notification-panel');
        panels.forEach(panel => panel.remove());
    }
    
    // Arrow keys for navigation
    if (e.altKey) {
        const navLinks = document.querySelectorAll('.nav-link');
        const activeIndex = Array.from(navLinks).findIndex(link => link.classList.contains('active'));
        
        if (e.key === 'ArrowLeft' && activeIndex > 0) {
            navLinks[activeIndex - 1].click();
        } else if (e.key === 'ArrowRight' && activeIndex < navLinks.length - 1) {
            navLinks[activeIndex + 1].click();
        }
    }
});

console.log('Educational Dashboard initialized successfully!');
