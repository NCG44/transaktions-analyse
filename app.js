// Norden Capital Group Real Estate Investment Calculator
class RealEstateCalculator {
    constructor() {
        this.data = {};
        this.chart = null;
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeDate();
        this.unlockSection('info-section');
        console.log('Calculator initialized');
    }

    setupEventListeners() {
        // Input field listeners with proper event binding
        const inputs = [
            { id: 'date', event: 'change' },
            { id: 'name', event: 'input' },
            { id: 'price_per_night', event: 'input' },
            { id: 'rental_nights', event: 'input' },
            { id: 'purchase_price', event: 'input' },
            { id: 'discount_factor', event: 'input' }
        ];

        inputs.forEach(({ id, event }) => {
            const element = document.getElementById(id);
            if (element) {
                element.addEventListener(event, (e) => {
                    console.log(`Input changed: ${id} = ${e.target.value}`);
                    this.handleInputChange(e);
                });
            }
        });

        // Sample data button
        const sampleButton = document.getElementById('load-sample');
        if (sampleButton) {
            sampleButton.addEventListener('click', () => {
                this.loadSampleData();
            });
        }

        // Add input animation effects
        const inputElements = document.querySelectorAll('.modern-input');
        inputElements.forEach(input => {
            input.addEventListener('focus', this.handleInputFocus.bind(this));
            input.addEventListener('blur', this.handleInputBlur.bind(this));
        });
    }

    initializeDate() {
        const today = new Date().toISOString().split('T')[0];
        const dateInput = document.getElementById('date');
        if (dateInput) {
            dateInput.value = today;
            this.data.date = today;
        }
    }

    handleInputFocus(e) {
        const wrapper = e.target.closest('.input-wrapper') || e.target.parentElement;
        wrapper.style.transform = 'scale(1.02)';
        wrapper.style.transition = 'transform 0.2s ease';
    }

    handleInputBlur(e) {
        const wrapper = e.target.closest('.input-wrapper') || e.target.parentElement;
        wrapper.style.transform = 'scale(1)';
    }

    handleInputChange(e) {
        const fieldId = e.target.id;
        const value = e.target.value;

        // Store the value in data object
        if (['price_per_night', 'rental_nights', 'purchase_price', 'discount_factor'].includes(fieldId)) {
            this.data[fieldId] = parseFloat(value) || 0;
        } else {
            this.data[fieldId] = value;
        }

        console.log('Data updated:', this.data);
        
        // Trigger calculations and UI updates
        this.updateCalculations();
        this.updateSectionProgress();
        this.checkSectionCompletion();
    }

    updateCalculations() {
        console.log('Updating calculations with data:', this.data);
        
        // Revenue calculations
        if (this.data.price_per_night > 0 && this.data.rental_nights > 0) {
            const grossRental = this.data.price_per_night * this.data.rental_nights;
            console.log('Gross rental calculated:', grossRental);
            
            this.updateResultWithAnimation('gross_rental', grossRental);
            this.data.gross_rental = grossRental;

            // Operating costs calculations
            const managementCost = grossRental * 0.20;
            const maintenanceCost = 660;
            const totalCosts = managementCost + maintenanceCost;
            
            this.updateResultWithAnimation('management_cost', managementCost);
            this.updateResultWithAnimation('total_costs', totalCosts);
            
            this.data.management_cost = managementCost;
            this.data.maintenance_cost = maintenanceCost;
            this.data.total_costs = totalCosts;

            // Net income calculations
            const netIncome = grossRental - totalCosts;
            this.updateResultWithAnimation('net_income', netIncome);
            this.data.net_income = netIncome;

            // Update costs chart
            this.updateCostsChart(grossRental, totalCosts);

            // Annual return calculation (needs purchase price)
            if (this.data.purchase_price && this.data.purchase_price > 0) {
                const annualReturn = (netIncome / this.data.purchase_price) * 100;
                this.updateResultWithAnimation('annual_return', annualReturn, 2);
                this.updateProgressBar('return-progress', Math.min(annualReturn, 15), 15);
            }

            // Exit strategy calculations
            if (this.data.discount_factor && this.data.discount_factor > 0 && netIncome > 0) {
                const exitPrice = netIncome / (this.data.discount_factor / 100);
                this.updateResultWithAnimation('exit_price', exitPrice);
                this.data.exit_price = exitPrice;

                if (this.data.purchase_price && this.data.purchase_price > 0) {
                    const valueIncrease = exitPrice - this.data.purchase_price;
                    this.updateResultWithAnimation('value_increase', valueIncrease);
                    this.data.value_increase = valueIncrease;

                    // Final accumulated return calculations
                    const threeYearCashflow = netIncome * 3;
                    this.updateResultWithAnimation('three_year_cashflow', threeYearCashflow);

                    const totalReturn = threeYearCashflow + valueIncrease;
                    this.updateResultWithAnimation('total_return', totalReturn);
                    
                    if (totalReturn > 0) {
                        setTimeout(() => this.showFinalAchievement(), 1000);
                    }
                }
            }
        }
    }

    updateResultWithAnimation(elementId, value, decimals = 0) {
        const element = document.getElementById(elementId);
        if (!element) {
            console.warn(`Element not found: ${elementId}`);
            return;
        }
        
        const parent = element.parentElement;
        
        // Add updating class for shimmer effect
        parent.classList.add('updating');
        
        // Add slot machine animation
        element.classList.add('slot-animate');
        
        // Animate counter with slot-machine effect
        this.animateCounterWithSlotEffect(element, value, decimals);
        
        setTimeout(() => {
            parent.classList.remove('updating');
            element.classList.remove('slot-animate');
        }, 800);
    }

    animateCounterWithSlotEffect(element, target, decimals = 0) {
        const start = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const duration = 800;
        const startTime = performance.now();
        let lastUpdate = 0;
        
        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Add random number flickering for slot machine effect
            if (progress < 0.7 && currentTime - lastUpdate > 50) {
                const randomValue = Math.random() * target * 2;
                element.textContent = this.formatNumber(randomValue, decimals);
                lastUpdate = currentTime;
            } else if (progress >= 0.7) {
                // Smooth transition to final value
                const easeOut = 1 - Math.pow(1 - ((progress - 0.7) / 0.3), 3);
                const current = start + (target - start) * easeOut;
                element.textContent = this.formatNumber(current, decimals);
            }
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                element.textContent = this.formatNumber(target, decimals);
                // Add success glow effect
                element.style.textShadow = '0 0 10px #00ff88';
                setTimeout(() => {
                    element.style.textShadow = '';
                }, 1000);
            }
        };
        
        requestAnimationFrame(animate);
    }

    formatNumber(num, decimals = 0) {
        if (isNaN(num)) return '0';
        return new Intl.NumberFormat('da-DK', {
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(num);
    }

    updateProgressBar(elementId, value, max) {
        const element = document.getElementById(elementId);
        if (element) {
            const percentage = (value / max) * 100;
            element.style.width = `${Math.min(percentage, 100)}%`;
        }
    }

    updateCostsChart(grossRental, totalCosts) {
        const ctx = document.getElementById('costsChart');
        if (!ctx) return;

        const netIncome = grossRental - totalCosts;
        const costPercentage = ((totalCosts / grossRental) * 100).toFixed(0);
        
        // Update the chart message with actual percentage
        const messageElement = document.querySelector('.chart-message .highlight');
        if (messageElement) {
            messageElement.textContent = `${costPercentage}%`;
        }
        
        if (this.chart) {
            this.chart.destroy();
        }

        this.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Netto Indkomst', 'Omkostninger'],
                datasets: [{
                    data: [netIncome, totalCosts],
                    backgroundColor: ['#00ff88', '#09B5DA'],
                    borderColor: ['#00ff88', '#09B5DA'],
                    borderWidth: 3,
                    hoverBorderWidth: 4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: true,
                cutout: '60%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: '#f5f5f5',
                            font: {
                                size: 14,
                                weight: '500'
                            },
                            padding: 20,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                elements: {
                    arc: {
                        borderRadius: 8
                    }
                },
                animation: {
                    animateRotate: true,
                    duration: 1500,
                    easing: 'easeOutCubic'
                }
            }
        });
    }

    updateSectionProgress() {
        // Info section progress
        const dateValue = this.data.date || '';
        const nameValue = this.data.name || '';
        const infoProgress = (dateValue ? 50 : 0) + (nameValue ? 50 : 0);
        this.updateProgressIndicator('info-section', infoProgress);

        // Revenue section progress
        const priceValue = this.data.price_per_night || 0;
        const nightsValue = this.data.rental_nights || 0;
        const revenueProgress = (priceValue > 0 ? 50 : 0) + (nightsValue > 0 ? 50 : 0);
        this.updateProgressIndicator('revenue-section', revenueProgress);

        // Auto-complete dependent sections
        if (revenueProgress === 100) {
            this.updateProgressIndicator('costs-section', 100);
            this.updateProgressIndicator('income-section', 100);
        }

        // Exit section progress
        const purchaseValue = this.data.purchase_price || 0;
        const discountValue = this.data.discount_factor || 0;
        const exitProgress = (purchaseValue > 0 ? 50 : 0) + (discountValue > 0 ? 50 : 0);
        this.updateProgressIndicator('exit-section', exitProgress);

        // Return section
        if (exitProgress === 100 && revenueProgress === 100) {
            this.updateProgressIndicator('return-section', 100);
        }
    }

    updateProgressIndicator(sectionId, progress) {
        const section = document.getElementById(sectionId);
        if (section) {
            const indicator = section.querySelector('.progress-indicator');
            if (indicator) {
                indicator.setAttribute('data-progress', progress.toString());
            }
        }
    }

    checkSectionCompletion() {
        // Unlock revenue section when info is complete
        if (this.data.date && this.data.name) {
            this.unlockSection('revenue-section');
        }

        // Unlock dependent sections when revenue inputs are complete
        if (this.data.price_per_night > 0 && this.data.rental_nights > 0) {
            this.unlockSection('costs-section');
            this.unlockSection('income-section');
            
            // Auto-unlock exit section after a delay for better UX
            setTimeout(() => {
                this.unlockSection('exit-section');
            }, 1000);
        }

        // Unlock return section when all inputs are complete
        if (this.data.purchase_price > 0 && this.data.discount_factor > 0 && this.data.gross_rental > 0) {
            setTimeout(() => {
                this.unlockSection('return-section');
            }, 1500);
        }
    }

    unlockSection(sectionId) {
        const section = document.getElementById(sectionId);
        if (section && section.classList.contains('locked')) {
            section.classList.remove('locked');
            section.classList.add('unlocking');
            
            setTimeout(() => {
                section.classList.remove('unlocking');
            }, 800);

            // Add scroll into view with smooth animation
            setTimeout(() => {
                section.scrollIntoView({ 
                    behavior: 'smooth', 
                    block: 'center' 
                });
            }, 400);
        }
    }

    showFinalAchievement() {
        const achievement = document.getElementById('final-achievement');
        if (achievement && achievement.classList.contains('hidden')) {
            achievement.classList.remove('hidden');
            
            // Add confetti effect
            this.createConfetti();
            
            // Add celebration sound effect (visual feedback)
            this.addCelebrationEffects();
        }
    }

    addCelebrationEffects() {
        // Add screen flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: radial-gradient(circle, rgba(0,255,136,0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 9998;
            animation: flash 0.5s ease-out;
        `;
        
        document.body.appendChild(flash);
        setTimeout(() => flash.remove(), 500);
        
        // Add CSS for flash animation if not exists
        if (!document.getElementById('flash-style')) {
            const style = document.createElement('style');
            style.id = 'flash-style';
            style.textContent = `
                @keyframes flash {
                    0% { opacity: 0; }
                    50% { opacity: 1; }
                    100% { opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }

    createConfetti() {
        const colors = ['#00ff88', '#09B5DA', '#0C3C60', '#ffffff', '#FFD700'];
        const confettiCount = 60;
        
        for (let i = 0; i < confettiCount; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.cssText = `
                    position: fixed;
                    width: ${Math.random() * 10 + 5}px;
                    height: ${Math.random() * 10 + 5}px;
                    background-color: ${colors[Math.floor(Math.random() * colors.length)]};
                    left: ${Math.random() * window.innerWidth}px;
                    top: -20px;
                    z-index: 9999;
                    border-radius: 50%;
                    pointer-events: none;
                `;
                
                document.body.appendChild(confetti);
                
                // Animate falling with rotation
                const fallDuration = 3000 + Math.random() * 2000;
                const rotation = Math.random() * 720;
                const drift = (Math.random() - 0.5) * 200;
                
                confetti.animate([
                    { 
                        transform: `translateY(0) translateX(0) rotate(0deg)`,
                        opacity: 1 
                    },
                    { 
                        transform: `translateY(${window.innerHeight + 100}px) translateX(${drift}px) rotate(${rotation}deg)`,
                        opacity: 0 
                    }
                ], {
                    duration: fallDuration,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                }).addEventListener('finish', () => {
                    confetti.remove();
                });
            }, i * 50);
        }
    }

    // Public method to populate with sample data for testing
    loadSampleData() {
        const sampleData = {
            price_per_night: 150,
            rental_nights: 146,
            purchase_price: 148000,
            discount_factor: 9
        };
        
        // Fill in name if empty
        const nameInput = document.getElementById('name');
        if (nameInput && !nameInput.value) {
            nameInput.value = 'Test Investor';
            this.data.name = 'Test Investor';
        }
        
        // Fill sample data into inputs
        Object.entries(sampleData).forEach(([key, value]) => {
            const input = document.getElementById(key);
            if (input) {
                input.value = value;
                // Trigger input event to update calculations
                const event = new Event('input', { bubbles: true });
                input.dispatchEvent(event);
            }
        });
        
        // Show success message
        const button = document.getElementById('load-sample');
        if (button) {
            const originalText = button.textContent;
            button.textContent = 'Sample Data Loaded!';
            button.style.background = '#00ff88';
            setTimeout(() => {
                button.textContent = originalText;
                button.style.background = '';
            }, 2000);
        }
    }
}

// Initialize calculator when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.calculator = new RealEstateCalculator();
    
    // Add keyboard shortcut for sample data (Ctrl+L or Cmd+L)
    document.addEventListener('keydown', (e) => {
        if ((e.ctrlKey || e.metaKey) && e.key === 'l') {
            e.preventDefault();
            window.calculator.loadSampleData();
        }
    });
    
    console.log('Real Estate Calculator loaded successfully');
});

// Add smooth scrolling enhancement with intersection observer
document.addEventListener('DOMContentLoaded', () => {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !entry.target.classList.contains('locked')) {
                entry.target.style.animation = 'fadeInUp 0.6s ease forwards';
            }
        });
    }, { threshold: 0.1 });

    // Observe all calc sections
    document.querySelectorAll('.calc-section').forEach(section => {
        observer.observe(section);
    });
});

// Add CSS for scroll animation
const style = document.createElement('style');
style.textContent = `
@keyframes fadeInUp {
    from {
        opacity: 0.7;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}
`;
document.head.appendChild(style);