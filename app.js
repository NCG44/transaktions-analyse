// Set current date on load
document.getElementById('date').valueAsDate = new Date();

// Global variables
let currentSection = 1;
const totalSections = 7;
const EUR_TO_DKK = 7.44;
const PURCHASE_PRICE = 143000;

// Section management
function showSection(sectionNumber) {
    // Hide current section
    document.getElementById(`section-${currentSection}`).classList.remove('active');
    
    // Show new section
    currentSection = sectionNumber;
    const newSection = document.getElementById(`section-${currentSection}`);
    newSection.classList.add('active');
    
    // Smooth scroll to section
    setTimeout(() => {
        newSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, 100);
    
    // Initialize chart if needed
    if (sectionNumber === 7) {
        setTimeout(() => {
            initLineChart();
        }, 500);
    }
}

// Enable name input listener for first section
document.getElementById('name').addEventListener('input', function() {
    const nameInput = this.value.trim();
    const nextBtn = document.getElementById('btn-1');
    
    if (nameInput !== '') {
        nextBtn.style.display = 'block';
    } else {
        nextBtn.style.display = 'none';
    }
});

// Next button listeners
document.getElementById('btn-1').addEventListener('click', () => showSection(2));
document.getElementById('btn-2').addEventListener('click', () => showSection(3));
document.getElementById('btn-3').addEventListener('click', () => showSection(4));
document.getElementById('btn-4').addEventListener('click', () => showSection(5));
document.getElementById('btn-5').addEventListener('click', () => showSection(6));
document.getElementById('btn-6').addEventListener('click', () => showSection(7));

// Animate number counting
function animateNumber(elementId, targetValue, suffix = ' EUR', duration = 1000) {
    const element = document.getElementById(elementId);
    const startValue = 0;
    const increment = targetValue / (duration / 16); // 60 FPS
    let currentValue = startValue;
    
    element.classList.add('count-animation');
    
    const timer = setInterval(() => {
        currentValue += increment;
        if (currentValue >= targetValue) {
            currentValue = targetValue;
            clearInterval(timer);
            setTimeout(() => {
                element.classList.remove('count-animation');
            }, 100);
        }
        
        // Update display
        const displayValue = Math.round(currentValue);
        const baseText = element.innerHTML.split(':')[0];
        element.innerHTML = `${baseText}: ${displayValue.toLocaleString('da-DK')}${suffix}`;
    }, 16);
}

// Main calculation function
function updateCalculations() {
    const prisPrNat = parseFloat(document.getElementById('prisPrNat').value) || 0;
    const lejedeNaetter = parseFloat(document.getElementById('lejedeNaetter').value) || 0;
    const diskonteringsfaktor = parseFloat(document.getElementById('diskonto').value) || 0;
    
    // Calculate brutto lejeindtægter
    const bruttoLejeindtaegter = prisPrNat * lejedeNaetter;
    
    if (bruttoLejeindtaegter > 0) {
        animateNumber('brutto', bruttoLejeindtaegter);
        document.getElementById('btn-2').style.display = 'block';
    }
    
    // Calculate costs
    const udlejningsselskab = bruttoLejeindtaegter * 0.20;
    const vedligeholdelse = 660;
    const totalOmkostninger = udlejningsselskab + vedligeholdelse;
    
    if (udlejningsselskab > 0) {
        animateNumber('udlejning', udlejningsselskab);
        animateNumber('totalCost', totalOmkostninger);
        
        // Update cost percentage
        if (bruttoLejeindtaegter > 0) {
            const costPercentage = Math.round((totalOmkostninger / bruttoLejeindtaegter) * 100);
            document.querySelector('.cost-message').textContent = 
                `Omkostninger er ${costPercentage}% af din omsætning`;
        }
        
        // Draw pie chart
        drawPieChart(bruttoLejeindtaegter, totalOmkostninger);
        document.getElementById('btn-3').style.display = 'block';
    }
    
    // Calculate net income
    const nettoIndkomst = bruttoLejeindtaegter - totalOmkostninger;
    
    if (nettoIndkomst > 0) {
        animateNumber('netto', nettoIndkomst);
        document.getElementById('btn-4').style.display = 'block';
    }
    
    // Calculate exit strategy
    if (diskonteringsfaktor > 0 && nettoIndkomst > 0) {
        const projekteretExitPris = nettoIndkomst / (diskonteringsfaktor / 100);
        animateNumber('exitPrice', projekteretExitPris);
        
        const vaerdiforoegelse = projekteretExitPris - PURCHASE_PRICE;
        animateNumber('delta', vaerdiforoegelse);
        
        // Add DKK conversion
        setTimeout(() => {
            document.getElementById('deltaDKK').textContent = 
                `(${(vaerdiforoegelse * EUR_TO_DKK).toLocaleString('da-DK')} DKK)`;
        }, 1000);
        
        document.getElementById('btn-5').style.display = 'block';
        
        // Calculate accumulated return
        const cashflow3Aar = nettoIndkomst * 3;
        animateNumber('cash3', cashflow3Aar);
        
        setTimeout(() => {
            document.getElementById('cash3DKK').textContent = 
                `(${(cashflow3Aar * EUR_TO_DKK).toLocaleString('da-DK')} DKK)`;
        }, 1000);
        
        const totaltAfkast = cashflow3Aar + vaerdiforoegelse;
        animateNumber('totalReturn', totaltAfkast);
        
        setTimeout(() => {
            document.getElementById('totalReturnDKK').textContent = 
                `(${(totaltAfkast * EUR_TO_DKK).toLocaleString('da-DK')} DKK)`;
        }, 1000);
        
        document.getElementById('btn-6').style.display = 'block';
    }
}

// Pie chart function
function drawPieChart(revenue, costs) {
    const canvas = document.getElementById('pieChart');
    const ctx = canvas.getContext('2d');
    
    // Destroy existing chart if it exists
    if (window.pieChartInstance) {
        window.pieChartInstance.destroy();
    }
    
    const profit = revenue - costs;
    const data = {
        labels: ['Profit', 'Udlejningsselskab', 'Vedligeholdelse'],
        datasets: [{
            data: [profit, costs * 0.909, 660], // Split costs proportionally
            backgroundColor: ['#32CD32', '#09B5DA', '#0C3C60'],
            borderWidth: 2,
            borderColor: '#333'
        }]
    };
    
    window.pieChartInstance = new Chart(ctx, {
        type: 'pie',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        color: 'white',
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            animation: {
                animateRotate: true,
                duration: 2000
            }
        }
    });
}

// Line chart function
function initLineChart() {
    const canvas = document.getElementById('lineChart');
    const ctx = canvas.getContext('2d');
    
    // Get net income value
    const nettoText = document.getElementById('netto').textContent;
    const nettoValue = parseFloat(nettoText.replace(/[^0-9.-]+/g, '')) || 0;
    
    const data = {
        labels: ['År 1', 'År 2', 'År 3'],
        datasets: [{
            label: 'Akkumuleret Lejeindtægt (EUR)',
            data: [nettoValue, nettoValue * 2, nettoValue * 3],
            borderColor: '#32CD32',
            backgroundColor: 'rgba(50, 205, 50, 0.1)',
            borderWidth: 3,
            fill: true,
            tension: 0.4,
            pointBackgroundColor: '#32CD32',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
        }]
    };
    
    new Chart(ctx, {
        type: 'line',
        data: data,
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    labels: {
                        color: 'white',
                        font: {
                            size: 14
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        color: 'white',
                        callback: function(value) {
                            return value.toLocaleString('da-DK') + ' EUR';
                        }
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                },
                x: {
                    ticks: {
                        color: 'white'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeInOutQuart'
            },
            elements: {
                point: {
                    hoverRadius: 8
                }
            }
        }
    });
}

// Add event listeners for calculations
document.getElementById('prisPrNat').addEventListener('input', updateCalculations);
document.getElementById('lejedeNaetter').addEventListener('input', updateCalculations);
document.getElementById('diskonto').addEventListener('input', updateCalculations);

// Initialize calculations
updateCalculations();
