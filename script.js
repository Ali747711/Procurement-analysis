// DOM Elements
const themeToggle = document.getElementById('theme-toggle');
const fileInput = document.getElementById('file-input');
const fileName = document.getElementById('file-name');
const analyzeBtn = document.getElementById('analyze-btn');
const loader = document.getElementById('loader');
const uploadSection = document.getElementById('upload-section');
const resultsContainer = document.getElementById('results-container');
const metricsGrid = document.getElementById('metrics-grid');
const dashboard = document.getElementById('dashboard');
const answersContainer = document.getElementById('answers-container');
const cursorFollower = document.querySelector('.cursor-follower');

// Supplier buttons
const homeBtn = document.getElementById('home-btn');
const alphaBtn = document.getElementById('alpha-btn');
const betaBtn = document.getElementById('beta-btn');
const gammaBtn = document.getElementById('gamma-btn');
const compareBtn = document.getElementById('compare-btn');
const forecastBtn = document.getElementById('forecast-btn');

// Modal elements
const forecastModal = document.getElementById('forecast-modal');
const closeModalBtn = document.querySelector('.close');
const generateForecastBtn = document.getElementById('generate-forecast');

// Global variables
let procurementData = [];
let currentSupplier = '';
let charts = [];

// Background animation - Create bubbles
function createBubbles() {
    const backgroundAnimation = document.querySelector('.background-animation');
    for (let i = 0; i < 15; i++) {
        const bubble = document.createElement('div');
        bubble.classList.add('bubble');
        
        // Random properties
        const size = Math.random() * 100 + 50;
        const posX = Math.random() * 100;
        const delay = Math.random() * 8;
        const duration = Math.random() * 10 + 8;
        
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${posX}%`;
        bubble.style.bottom = '-100px';
        bubble.style.animationDelay = `${delay}s`;
        bubble.style.animationDuration = `${duration}s`;
        
        backgroundAnimation.appendChild(bubble);
    }
}

// Initialize bubbles
createBubbles();

// Cursor follower
document.addEventListener('mousemove', (e) => {
    cursorFollower.style.left = e.clientX + 'px';
    cursorFollower.style.top = e.clientY + 'px';
});

// Theme toggle
themeToggle.addEventListener('change', () => {
    document.body.classList.toggle('dark-mode');
    
    // Update the charts for theme consistency
    if (charts.length > 0) {
        charts.forEach(chart => updateChartTheme(chart));
    }
});

// Update chart theme based on current mode
function updateChartTheme(chart) {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f0f0f0' : '#333';
    
    chart.options.scales.x.ticks.color = textColor;
    chart.options.scales.y.ticks.color = textColor;
    chart.options.plugins.legend.labels.color = textColor;
    chart.options.plugins.title.color = textColor;
    chart.update();
}

// File input handling
fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
        fileName.textContent = file.name;
        analyzeBtn.style.display = 'inline-block';
    } else {
        fileName.textContent = 'No file chosen';
        analyzeBtn.style.display = 'none';
    }
});

// Home button
homeBtn.addEventListener('click', () => {
    uploadSection.style.display = 'block';
    resultsContainer.style.display = 'none';
    resetSupplierButtons();
});

// Supplier buttons
alphaBtn.addEventListener('click', () => {
    setActiveSupplier('Alpha Supplies', alphaBtn);
});

betaBtn.addEventListener('click', () => {
    setActiveSupplier('BetaTech', betaBtn);
});

gammaBtn.addEventListener('click', () => {
    setActiveSupplier('GammaCorp', gammaBtn);
});

// Compare button
compareBtn.addEventListener('click', () => {
    resetSupplierButtons();
    compareBtn.classList.add('active');
    currentSupplier = 'compare';
    
    if (procurementData.length > 0) {
        generateComparativeAnalysis();
    }
});

// Forecast modal
forecastBtn.addEventListener('click', () => {
    forecastModal.style.display = 'block';
});

closeModalBtn.addEventListener('click', () => {
    forecastModal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === forecastModal) {
        forecastModal.style.display = 'none';
    }
});

generateForecastBtn.addEventListener('click', () => {
    const supplier = document.getElementById('forecast-supplier').value;
    const horizon = parseInt(document.getElementById('forecast-horizon').value);
    
    generateForecast(supplier, horizon);
});

// Set active supplier
function setActiveSupplier(supplier, button) {
    resetSupplierButtons();
    button.classList.add('active');
    currentSupplier = supplier;
    
    if (procurementData.length > 0) {
        analyzeSupplierData(supplier);
    }
}

// Reset supplier buttons
function resetSupplierButtons() {
    const supplierButtons = document.querySelectorAll('.supplier-btn');
    supplierButtons.forEach(btn => btn.classList.remove('active'));
    compareBtn.classList.remove('active');
}

// Analyze button
analyzeBtn.addEventListener('click', () => {
    const file = fileInput.files[0];
    if (file) {
        loader.style.display = 'block';
        parseCSV(file);
    }
});

// Parse CSV
function parseCSV(file) {
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        complete: function(results) {
            procurementData = results.data.filter(row => Object.values(row).some(val => val !== null));
            
            // Clean and prepare data
            procurementData = procurementData.map(row => {
                // Convert dates to Date objects
                if (row.Order_Date) row.Order_Date = new Date(row.Order_Date);
                if (row.Expected_Delivery_Date) row.Expected_Delivery_Date = new Date(row.Expected_Delivery_Date);
                if (row.Actual_Delivery_Date) row.Actual_Delivery_Date = new Date(row.Actual_Delivery_Date);
                
                // Calculate lead time and delay
                if (row.Actual_Delivery_Date && row.Order_Date) {
                    row.Lead_Time = Math.floor((row.Actual_Delivery_Date - row.Order_Date) / (1000 * 60 * 60 * 24));
                }
                
                if (row.Actual_Delivery_Date && row.Expected_Delivery_Date) {
                    row.Delay = Math.floor((row.Actual_Delivery_Date - row.Expected_Delivery_Date) / (1000 * 60 * 60 * 24));
                    if (row.Delay < 0) row.Delay = 0; // No negative delays
                }
                
                return row;
            });
            
            // Default to first supplier
            if (procurementData.length > 0) {
                // Get first supplier from data, or default to Alpha Supplies
                let firstSupplier = 'Alpha Supplies';
                const suppliers = [...new Set(procurementData.map(row => row.Supplier))];
                if (suppliers.length > 0) {
                    firstSupplier = suppliers[0];
                }
                
                // Set the active supplier
                if (firstSupplier === 'Alpha Supplies') {
                    setActiveSupplier(firstSupplier, alphaBtn);
                } else if (firstSupplier === 'BetaTech') {
                    setActiveSupplier(firstSupplier, betaBtn);
                } else if (firstSupplier === 'GammaCorp') {
                    setActiveSupplier(firstSupplier, gammaBtn);
                } else {
                    setActiveSupplier(firstSupplier, alphaBtn);
                }
                
                // Display results container
                uploadSection.style.display = 'none';
                resultsContainer.style.display = 'block';
            }
            
            loader.style.display = 'none';
        }
    });
}

// Analyze data for a specific supplier
function analyzeSupplierData(supplier) {
    // Clear previous content
    metricsGrid.innerHTML = '';
    dashboard.innerHTML = '';
    answersContainer.innerHTML = '<h2>Analysis Results</h2>';
    
    // Filter data for the selected supplier
    const supplierData = procurementData.filter(row => row.Supplier === supplier);
    
    if (supplierData.length === 0) {
        dashboard.innerHTML = `<div class="chart-card"><h3>No data available for ${supplier}</h3></div>`;
        return;
    }
    
    // Generate metrics
    generateMetrics(supplierData);
    
    // Generate charts
    generateLeadTimeChart(supplierData);
    generateTransportModeChart(supplierData);
    generateMonthlyDelayChart(supplierData);
    generateDisruptionChart(supplierData);
    generateProductCategoryChart(supplierData);
    generateBullwhipEffectChart(supplierData);
    
    // Answer questions
    answerQuestions(supplierData, supplier);
}

// Generate comparative analysis between suppliers
function generateComparativeAnalysis() {
    // Clear previous content
    metricsGrid.innerHTML = '';
    dashboard.innerHTML = '';
    answersContainer.innerHTML = '<h2>Comparative Analysis Results</h2>';
    
    // Get unique suppliers
    const suppliers = [...new Set(procurementData.map(row => row.Supplier))];
    
    // Generate comparative charts
    generateComparisonLeadTimeChart(suppliers);
    generateComparisonDeliveryChart(suppliers);
    generateComparisonBullwhipChart(suppliers);
    generateComparisonDisruptionChart(suppliers);
    
    // Answer comparative questions
    answerComparativeQuestions(suppliers);
}

// Calculate average for a specific field
function calculateAverage(data, field) {
    if (data.length === 0) return 0;
    
    const validValues = data
        .map(item => item[field])
        .filter(value => value !== undefined && value !== null && !isNaN(value));
    
    if (validValues.length === 0) return 0;
    
    const sum = validValues.reduce((acc, val) => acc + val, 0);
    return sum / validValues.length;
}

// Calculate standard deviation for a specific field
function calculateStdDev(data, field) {
    if (data.length <= 1) return 0;
    
    const validValues = data
        .map(item => item[field])
        .filter(value => value !== undefined && value !== null && !isNaN(value));
    
    if (validValues.length <= 1) return 0;
    
    const avg = validValues.reduce((acc, val) => acc + val, 0) / validValues.length;
    const squareDiffs = validValues.map(value => Math.pow(value - avg, 2));
    const avgSquareDiff = squareDiffs.reduce((acc, val) => acc + val, 0) / squareDiffs.length;
    
    return Math.sqrt(avgSquareDiff);
}

// Group data by month
function groupByMonth(data) {
    const monthlyData = {};
    
    data.forEach(item => {
        if (item.Order_Date) {
            const date = item.Order_Date;
            const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
            
            if (!monthlyData[monthYear]) {
                monthlyData[monthYear] = [];
            }
            
            monthlyData[monthYear].push(item);
        }
    });
    
    return monthlyData;
}

// Generate metrics for supplier
function generateMetrics(data) {
    // Calculate metrics
    const avgLeadTime = calculateAverage(data, 'Lead_Time');
    const avgDelay = calculateAverage(data, 'Delay');
    const onTimeDelivery = (data.filter(row => row.Delay <= 0).length / data.length) * 100;
    const totalOrders = data.length;
    
    // Create metrics cards
    const metricsHTML = `
        <div class="metric-card">
            <h4>Average Lead Time</h4>
            <div class="metric-value">${avgLeadTime.toFixed(1)} days</div>
        </div>
        <div class="metric-card">
            <h4>Average Delay</h4>
            <div class="metric-value">${avgDelay.toFixed(1)} days</div>
        </div>
        <div class="metric-card">
            <h4>On-Time Delivery</h4>
            <div class="metric-value">${onTimeDelivery.toFixed(1)}%</div>
        </div>
        <div class="metric-card">
            <h4>Total Orders</h4>
            <div class="metric-value">${totalOrders}</div>
        </div>
    `;
    
    metricsGrid.innerHTML = metricsHTML;
}

// Lead Time Chart
function generateLeadTimeChart(data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Lead Time Analysis</h3><canvas id="leadTimeChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    // Group by month
    const monthlyData = groupByMonth(data);
    const months = Object.keys(monthlyData).sort();
    
    const leadTimes = months.map(month => calculateAverage(monthlyData[month], 'Lead_Time'));
    const delays = months.map(month => calculateAverage(monthlyData[month], 'Delay'));
    
    const ctx = document.getElementById('leadTimeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Average Lead Time',
                    data: leadTimes,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Average Delay',
                    data: delays,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Lead Time and Delays'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Transportation Mode Chart
function generateTransportModeChart(data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Transportation Mode Analysis</h3><canvas id="transportChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    // Group by transportation mode
    const transportModes = [...new Set(data.map(item => item.Transportation_Mode))];
    const leadTimesByMode = transportModes.map(mode => {
        const modeData = data.filter(item => item.Transportation_Mode === mode);
        return calculateAverage(modeData, 'Lead_Time');
    });
    
    const delaysByMode = transportModes.map(mode => {
        const modeData = data.filter(item => item.Transportation_Mode === mode);
        return calculateAverage(modeData, 'Delay');
    });
    
    const ctx = document.getElementById('transportChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: transportModes,
            datasets: [
                {
                    label: 'Average Lead Time',
                    data: leadTimesByMode,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderWidth: 1
                },
                {
                    label: 'Average Delay',
                    data: delaysByMode,
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Lead Time by Transportation Mode'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Monthly Delay Chart
function generateMonthlyDelayChart(data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Monthly Delay Analysis</h3><canvas id="monthlyDelayChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    // Group by month
    const monthlyData = groupByMonth(data);
    const months = Object.keys(monthlyData).sort();
    
    const avgDelays = months.map(month => calculateAverage(monthlyData[month], 'Delay'));
    const orderCounts = months.map(month => monthlyData[month].length);
    
    const ctx = document.getElementById('monthlyDelayChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Average Delay',
                    data: avgDelays,
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderWidth: 1,
                    yAxisID: 'y'
                },
                {
                    label: 'Number of Orders',
                    data: orderCounts,
                    type: 'line',
                    borderColor: '#4a6fa5',
                    borderWidth: 2,
                    fill: false,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Monthly Delays and Order Volume'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Average Delay (Days)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    grid: {
                        drawOnChartArea: false
                    },
                    title: {
                        display: true,
                        text: 'Number of Orders'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Disruption Chart
function generateDisruptionChart(data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Disruption Type Analysis</h3><canvas id="disruptionChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    // Group by disruption type
    const disruptionTypes = [...new Set(data.map(item => item.Disruption_Type))];
    const delaysByDisruption = disruptionTypes.map(type => {
        const typeData = data.filter(item => item.Disruption_Type === type);
        return calculateAverage(typeData, 'Delay');
    });
    
    const leadTimesByDisruption = disruptionTypes.map(type => {
        const typeData = data.filter(item => item.Disruption_Type === type);
        return calculateAverage(typeData, 'Lead_Time');
    });
    
    const ctx = document.getElementById('disruptionChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: disruptionTypes,
            datasets: [
                {
                    label: 'Average Lead Time',
                    data: leadTimesByDisruption,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderWidth: 1
                },
                {
                    label: 'Average Delay',
                    data: delaysByDisruption,
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Impact of Disruption Types'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Product Category Chart
function generateProductCategoryChart(data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Product Category Analysis</h3><canvas id="categoryChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    // Group by product category
    const categories = [...new Set(data.map(item => item.Product_Category))];
    const leadTimesByCategory = categories.map(category => {
        const categoryData = data.filter(item => item.Product_Category === category);
        return calculateAverage(categoryData, 'Lead_Time');
    });
    
    const ctx = document.getElementById('categoryChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Average Lead Time',
                    data: leadTimesByCategory,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Lead Time by Product Category'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Bullwhip Effect Chart
function generateBullwhipEffectChart(data) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Bullwhip Effect Analysis</h3><canvas id="bullwhipChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    // Group by month
    const monthlyData = groupByMonth(data);
    const months = Object.keys(monthlyData).sort();
    
    const customerDemand = months.map(month => {
        const monthData = monthlyData[month];
        return calculateAverage(monthData, 'Customer_Demand');
    });
    
    const orderQuantity = months.map(month => {
        const monthData = monthlyData[month];
        return calculateAverage(monthData, 'Order_Quantity');
    });
    
    // Calculate coefficient of variation for demand and orders
    const demandVariation = calculateStdDev(data, 'Customer_Demand') / calculateAverage(data, 'Customer_Demand');
    const orderVariation = calculateStdDev(data, 'Order_Quantity') / calculateAverage(data, 'Order_Quantity');
    const bullwhipRatio = orderVariation / demandVariation;
    
    const ctx = document.getElementById('bullwhipChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [
                {
                    label: 'Average Customer Demand',
                    data: customerDemand,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Average Order Quantity',
                    data: orderQuantity,
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `Bullwhip Effect (Ratio: ${bullwhipRatio.toFixed(2)})`
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Quantity'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Comparative Charts
function generateComparisonLeadTimeChart(suppliers) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Lead Time Comparison</h3><canvas id="comparisonLeadTimeChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    const leadTimes = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        return calculateAverage(supplierData, 'Lead_Time');
    });
    
    const delays = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        return calculateAverage(supplierData, 'Delay');
    });
    
    const ctx = document.getElementById('comparisonLeadTimeChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: suppliers,
            datasets: [
                {
                    label: 'Average Lead Time',
                    data: leadTimes,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderWidth: 1
                },
                {
                    label: 'Average Delay',
                    data: delays,
                    backgroundColor: 'rgba(255, 107, 107, 0.7)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Lead Time Comparison by Supplier'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

function generateComparisonDeliveryChart(suppliers) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>On-Time Delivery Comparison</h3><canvas id="comparisonDeliveryChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    const onTimePercentages = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        return (supplierData.filter(row => row.Delay <= 0).length / supplierData.length) * 100;
    });
    
    const ctx = document.getElementById('comparisonDeliveryChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: suppliers,
            datasets: [
                {
                    label: 'On-Time Delivery Percentage',
                    data: onTimePercentages,
                    backgroundColor: 'rgba(76, 175, 80, 0.7)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'On-Time Delivery Performance'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Percentage (%)'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

function generateComparisonBullwhipChart(suppliers) {
    const chartCard = document.createElement('div');
    chartCard.className = 'chart-card';
    chartCard.innerHTML = '<h3>Bullwhip Effect Comparison</h3><canvas id="comparisonBullwhipChart"></canvas>';
    dashboard.appendChild(chartCard);
    
    const bullwhipRatios = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        
        const demandVariation = calculateStdDev(supplierData, 'Customer_Demand') / calculateAverage(supplierData, 'Customer_Demand');
        const orderVariation = calculateStdDev(supplierData, 'Order_Quantity') / calculateAverage(supplierData, 'Order_Quantity');
        
        return demandVariation > 0 ? orderVariation / demandVariation : 0;
    });
    
    const ctx = document.getElementById('comparisonBullwhipChart').getContext('2d');
    const chart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: suppliers,
            datasets: [
                {
                    label: 'Bullwhip Ratio',
                    data: bullwhipRatios,
                    backgroundColor: 'rgba(156, 39, 176, 0.7)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: 'Bullwhip Effect Comparison'
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Bullwhip Ratio: ${context.raw.toFixed(2)}`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Ratio'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);

// Answer questions for a specific supplier
function answerQuestions(data, supplier) {
    answersContainer.innerHTML = `
        <h2>Analysis Results for ${supplier}</h2>
        <div id="simple-questions">
            <h3>Simple Questions</h3>
            <div class="question">
                <h4>1. Which supplier has the highest average lead time?</h4>
                <div class="answer" id="answer-1"></div>
            </div>
            <div class="question">
                <h4>2. What transportation mode has the lowest average lead time?</h4>
                <div class="answer" id="answer-2"></div>
            </div>
            <div class="question">
                <h4>3. Which month shows the highest average delays in delivery?</h4>
                <div class="answer" id="answer-3"></div>
            </div>
            <div class="question">
                <h4>4. What type of disruption leads to the longest average delay?</h4>
                <div class="answer" id="answer-4"></div>
            </div>
            <div class="question">
                <h4>5. Which product category experiences the shortest average lead time?</h4>
                <div class="answer" id="answer-5"></div>
            </div>
        </div>
        <div id="complex-questions">
            <h3>Complex Questions</h3>
            <div class="question">
                <h4>1. Which mode of transportation contributes most significantly to delays?</h4>
                <div class="answer" id="answer-complex-1"></div>
            </div>
            <div class="question">
                <h4>2. Are there seasonal patterns affecting lead times?</h4>
                <div class="answer" id="answer-complex-2"></div>
            </div>
            <div class="question">
                <h4>3. Compare monthly customer demand vs. order quantities. Do you observe amplified variability (Bullwhip Effect)?</h4>
                <div class="answer" id="answer-complex-3"></div>
            </div>
            <div class="question">
                <h4>4. How does increased variability in order quantities correlate with increased variability in lead times?</h4>
                <div class="answer" id="answer-complex-4"></div>
            </div>
        </div>
    `;
    
    // Answer simple questions
    answerSimpleQuestions();
    
    // Answer complex questions for the specific supplier
    answerComplexQuestionsForSupplier(data, supplier);
}

// Answer comparative questions
function answerComparativeQuestions(suppliers) {
    answersContainer.innerHTML = `
        <h2>Comparative Analysis Results</h2>
        <div id="simple-questions">
            <h3>Simple Questions</h3>
            <div class="question">
                <h4>1. Which supplier has the highest average lead time?</h4>
                <div class="answer" id="answer-1"></div>
            </div>
            <div class="question">
                <h4>2. What transportation mode has the lowest average lead time?</h4>
                <div class="answer" id="answer-2"></div>
            </div>
            <div class="question">
                <h4>3. Which month shows the highest average delays in delivery?</h4>
                <div class="answer" id="answer-3"></div>
            </div>
            <div class="question">
                <h4>4. What type of disruption leads to the longest average delay?</h4>
                <div class="answer" id="answer-4"></div>
            </div>
            <div class="question">
                <h4>5. Which product category experiences the shortest average lead time?</h4>
                <div class="answer" id="answer-5"></div>
            </div>
        </div>
        <div id="complex-questions">
            <h3>Complex Questions</h3>
            <div class="question">
                <h4>1. Which mode of transportation contributes most significantly to delays?</h4>
                <div class="answer" id="answer-complex-1"></div>
            </div>
            <div class="question">
                <h4>2. Are there seasonal patterns affecting lead times?</h4>
                <div class="answer" id="answer-complex-2"></div>
            </div>
            <div class="question">
                <h4>3. Compare monthly customer demand vs. order quantities. Do you observe amplified variability (Bullwhip Effect)?</h4>
                <div class="answer" id="answer-complex-3"></div>
            </div>
            <div class="question">
                <h4>4. How does increased variability in order quantities correlate with increased variability in lead times?</h4>
                <div class="answer" id="answer-complex-4"></div>
            </div>
            <div class="question">
                <h4>5. Which supplier demonstrates the most efficient procurement process?</h4>
                <div class="answer" id="answer-complex-5"></div>
            </div>
        </div>
    `;
    
    // Answer simple questions
    answerSimpleQuestions();
    
    // Answer complex questions for comparison
    answerComplexQuestionsForComparison(suppliers);
}

// Answer simple questions
function answerSimpleQuestions() {
    // Question 1: Which supplier has the highest average lead time?
    const suppliers = [...new Set(procurementData.map(row => row.Supplier))];
    const supplierLeadTimes = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        return {
            supplier: supplier,
            leadTime: calculateAverage(supplierData, 'Lead_Time')
        };
    });
    
    supplierLeadTimes.sort((a, b) => b.leadTime - a.leadTime);
    document.getElementById('answer-1').textContent = `${supplierLeadTimes[0].supplier} has the highest average lead time of ${supplierLeadTimes[0].leadTime.toFixed(1)} days.`;
    
    // Question 2: What transportation mode has the lowest average lead time?
    const transportModes = [...new Set(procurementData.map(row => row.Transportation_Mode))];
    const transportLeadTimes = transportModes.map(mode => {
        const modeData = procurementData.filter(row => row.Transportation_Mode === mode);
        return {
            mode: mode,
            leadTime: calculateAverage(modeData, 'Lead_Time')
        };
    });
    
    transportLeadTimes.sort((a, b) => a.leadTime - b.leadTime);
    document.getElementById('answer-2').textContent = `${transportLeadTimes[0].mode} has the lowest average lead time of ${transportLeadTimes[0].leadTime.toFixed(1)} days.`;
    
    // Question 3: Which month shows the highest average delays in delivery?
    const monthlyData = groupByMonth(procurementData);
    const monthlyDelays = Object.entries(monthlyData).map(([month, data]) => {
        return {
            month: month,
            delay: calculateAverage(data, 'Delay')
        };
    });
    
    monthlyDelays.sort((a, b) => b.delay - a.delay);
    document.getElementById('answer-3').textContent = `${monthlyDelays[0].month} shows the highest average delay of ${monthlyDelays[0].delay.toFixed(1)} days.`;
    
    // Question 4: What type of disruption leads to the longest average delay?
    const disruptionTypes = [...new Set(procurementData.map(row => row.Disruption_Type))];
    const disruptionDelays = disruptionTypes.map(type => {
        const typeData = procurementData.filter(row => row.Disruption_Type === type);
        return {
            type: type,
            delay: calculateAverage(typeData, 'Delay')
        };
    });
    
    disruptionDelays.sort((a, b) => b.delay - a.delay);
    document.getElementById('answer-4').textContent = `${disruptionDelays[0].type} disruptions lead to the longest average delay of ${disruptionDelays[0].delay.toFixed(1)} days.`;
    
    // Question 5: Which product category experiences the shortest average lead time?
    const categories = [...new Set(procurementData.map(row => row.Product_Category))];
    const categoryLeadTimes = categories.map(category => {
        const categoryData = procurementData.filter(row => row.Product_Category === category);
        return {
            category: category,
            leadTime: calculateAverage(categoryData, 'Lead_Time')
        };
    });
    
    categoryLeadTimes.sort((a, b) => a.leadTime - b.leadTime);
    document.getElementById('answer-5').textContent = `${categoryLeadTimes[0].category} experiences the shortest average lead time of ${categoryLeadTimes[0].leadTime.toFixed(1)} days.`;
}

// Answer complex questions for a specific supplier
function answerComplexQuestionsForSupplier(data, supplier) {
    // Question 1: Which mode of transportation contributes most significantly to delays?
    const transportModes = [...new Set(data.map(row => row.Transportation_Mode))];
    const transportDelays = transportModes.map(mode => {
        const modeData = data.filter(row => row.Transportation_Mode === mode);
        return {
            mode: mode,
            delay: calculateAverage(modeData, 'Delay'),
            count: modeData.length
        };
    });
    
    transportDelays.sort((a, b) => b.delay - a.delay);
    document.getElementById('answer-complex-1').textContent = `For ${supplier}, ${transportDelays[0].mode} contributes most significantly to delays with an average delay of ${transportDelays[0].delay.toFixed(1)} days (based on ${transportDelays[0].count} orders).`;
    
    // Question 2: Are there seasonal patterns affecting lead times?
    const monthlyData = groupByMonth(data);
    const months = Object.keys(monthlyData).sort();
    
    const leadTimesByMonth = months.map(month => {
        return {
            month: month,
            leadTime: calculateAverage(monthlyData[month], 'Lead_Time')
        };
    });
    
    // Check for patterns (simplified)
    let seasonalPattern = 'No clear seasonal pattern detected.';
    
    if (months.length >= 6) {
        // Basic detection of trends
        const firstHalf = leadTimesByMonth.slice(0, Math.floor(leadTimesByMonth.length / 2));
        const secondHalf = leadTimesByMonth.slice(Math.floor(leadTimesByMonth.length / 2));
        
        const firstHalfAvg = firstHalf.reduce((sum, item) => sum + item.leadTime, 0) / firstHalf.length;
        const secondHalfAvg = secondHalf.reduce((sum, item) => sum + item.leadTime, 0) / secondHalf.length;
        
        const difference = Math.abs(firstHalfAvg - secondHalfAvg);
        
        if (difference > 5) {
            seasonalPattern = firstHalfAvg > secondHalfAvg 
                ? 'Lead times appear to decrease in the later months.' 
                : 'Lead times appear to increase in the later months.';
        }
    }
    
    document.getElementById('answer-complex-2').textContent = `${seasonalPattern} The months with the highest lead times are ${leadTimesByMonth.sort((a, b) => b.leadTime - a.leadTime).slice(0, 2).map(item => item.month).join(' and ')}.`;
    
    // Question 3: Bullwhip Effect
    const monthlyDemand = months.map(month => calculateAverage(monthlyData[month], 'Customer_Demand'));
    const monthlyOrders = months.map(month => calculateAverage(monthlyData[month], 'Order_Quantity'));
    
    // Calculate coefficient of variation for demand and orders
    const demandVariation = calculateStdDev(data, 'Customer_Demand') / calculateAverage(data, 'Customer_Demand');
    const orderVariation = calculateStdDev(data, 'Order_Quantity') / calculateAverage(data, 'Order_Quantity');
    const bullwhipRatio = orderVariation / demandVariation;
    
    let bullwhipAnalysis = '';
    if (bullwhipRatio > 1.2) {
        bullwhipAnalysis = `Strong bullwhip effect detected with a ratio of ${bullwhipRatio.toFixed(2)}. Order quantities show significantly more variability than customer demand.`;
    } else if (bullwhipRatio > 1) {
        bullwhipAnalysis = `Moderate bullwhip effect detected with a ratio of ${bullwhipRatio.toFixed(2)}. Order quantities show slightly more variability than customer demand.`;
    } else {
        bullwhipAnalysis = `No significant bullwhip effect detected (ratio: ${bullwhipRatio.toFixed(2)}). Order quantities do not amplify the variability in customer demand.`;
    }
    
    document.getElementById('answer-complex-3').textContent = bullwhipAnalysis;
    
    // Question 4: Correlation between order quantity variability and lead time variability
    const orderQtyStdDev = calculateStdDev(data, 'Order_Quantity');
    const leadTimeStdDev = calculateStdDev(data, 'Lead_Time');
    
    // Group by month for a more detailed analysis
    const orderQtyVariationByMonth = months.map(month => calculateStdDev(monthlyData[month], 'Order_Quantity'));
    const leadTimeVariationByMonth = months.map(month => calculateStdDev(monthlyData[month], 'Lead_Time'));
    
    // Simple correlation check (not a true correlation coefficient)
    let orderLeadTimeCorrelation = 'No strong correlation detected.';
    
    // Count how many times they move in the same direction
    let sameDirection = 0;
    for (let i = 1; i < months.length; i++) {
        const orderChange = orderQtyVariationByMonth[i] - orderQtyVariationByMonth[i-1];
        const leadTimeChange = leadTimeVariationByMonth[i] - leadTimeVariationByMonth[i-1];
        
        if ((orderChange > 0 && leadTimeChange > 0) || (orderChange < 0 && leadTimeChange < 0)) {
            sameDirection++;
        }
    }
    
    const correlationPercentage = (sameDirection / (months.length - 1)) * 100;
    
    if (correlationPercentage > 70) {
        orderLeadTimeCorrelation = `Strong correlation detected. In ${correlationPercentage.toFixed(0)}% of cases, increased order quantity variability correlates with increased lead time variability.`;
    } else if (correlationPercentage > 50) {
        orderLeadTimeCorrelation = `Moderate correlation detected. In ${correlationPercentage.toFixed(0)}% of cases, order quantity variability and lead time variability move in the same direction.`;
    }
    
    document.getElementById('answer-complex-4').textContent = orderLeadTimeCorrelation;
}

// Answer complex questions for comparison between suppliers
function answerComplexQuestionsForComparison(suppliers) {
    // Question 1: Which mode of transportation contributes most significantly to delays?
    const transportModes = [...new Set(procurementData.map(row => row.Transportation_Mode))];
    const transportDelays = transportModes.map(mode => {
        const modeData = procurementData.filter(row => row.Transportation_Mode === mode);
        return {
            mode: mode,
            delay: calculateAverage(modeData, 'Delay'),
            count: modeData.length
        };
    });
    
    transportDelays.sort((a, b) => b.delay - a.delay);
    
    // Additional supplier-specific analysis
    const supplierTransportDelays = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        const worstMode = [...new Set(supplierData.map(row => row.Transportation_Mode))]
            .map(mode => {
                const modeData = supplierData.filter(row => row.Transportation_Mode === mode);
                return {
                    mode: mode,
                    delay: calculateAverage(modeData, 'Delay')
                };
            })
            .sort((a, b) => b.delay - a.delay)[0];
            
        return {
            supplier: supplier,
            worstMode: worstMode
        };
    });
    
    document.getElementById('answer-complex-1').innerHTML = `
        Overall, ${transportDelays[0].mode} contributes most significantly to delays with an average delay of ${transportDelays[0].delay.toFixed(1)} days.<br><br>
        Supplier breakdown:<br>
        ${supplierTransportDelays.map(item => `- ${item.supplier}: ${item.worstMode.mode} (${item.worstMode.delay.toFixed(1)} days delay)`).join('<br>')}
    `;
    
    // Question 2: Are there seasonal patterns affecting lead times?
    const monthlyData = groupByMonth(procurementData);
    const months = Object.keys(monthlyData).sort();
    
    const leadTimesByMonth = months.map(month => {
        return {
            month: month,
            leadTime: calculateAverage(monthlyData[month], 'Lead_Time')
        };
    });
    
    // Supplier-specific seasonal patterns
    const supplierSeasonalPatterns = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        const supplierMonthlyData = groupByMonth(supplierData);
        
        // Find the month with highest lead time
        const worstMonth = Object.entries(supplierMonthlyData)
            .map(([month, data]) => ({
                month: month,
                leadTime: calculateAverage(data, 'Lead_Time')
            }))
            .sort((a, b) => b.leadTime - a.leadTime)[0];
            
        return {
            supplier: supplier,
            worstMonth: worstMonth
        };
    });
    
    document.getElementById('answer-complex-2').innerHTML = `
        The months with the highest overall lead times are ${leadTimesByMonth.sort((a, b) => b.leadTime - a.leadTime).slice(0, 2).map(item => item.month).join(' and ')}.<br><br>
        Supplier breakdown for worst months:<br>
        ${supplierSeasonalPatterns.map(item => `- ${item.supplier}: ${item.worstMonth?.month || 'N/A'} (${item.worstMonth?.leadTime.toFixed(1) || 'N/A'} days lead time)`).join('<br>')}
    `;
    
    // Question 3: Bullwhip Effect Comparison
    const bullwhipAnalysis = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        
        const demandVariation = calculateStdDev(supplierData, 'Customer_Demand') / calculateAverage(supplierData, 'Customer_Demand');
        const orderVariation = calculateStdDev(supplierData, 'Order_Quantity') / calculateAverage(supplierData, 'Order_Quantity');
        const bullwhipRatio = demandVariation > 0 ? orderVariation / demandVariation : 0;
        
        return {
            supplier: supplier,
            ratio: bullwhipRatio
        };
    });
    
    bullwhipAnalysis.sort((a, b) => b.ratio - a.ratio);
    
    document.getElementById('answer-complex-3').innerHTML = `
        ${bullwhipAnalysis[0].supplier} shows the strongest bullwhip effect with a ratio of ${bullwhipAnalysis[0].ratio.toFixed(2)}.<br><br>
        Bullwhip effect comparison:<br>
        ${bullwhipAnalysis.map(item => `- ${item.supplier}: Ratio ${item.ratio.toFixed(2)} (${item.ratio > 1.2 ? 'Strong' : item.ratio > 1 ? 'Moderate' : 'Minimal'} effect)`).join('<br>')}
    `;
    
    // Question 4: Correlation between order quantity variability and lead time variability
    const correlationAnalysis = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        const supplierMonthlyData = groupByMonth(supplierData);
        const supplierMonths = Object.keys(supplierMonthlyData).sort();
        
        const orderQtyVariationByMonth = supplierMonths.map(month => calculateStdDev(supplierMonthlyData[month], 'Order_Quantity'));
        const leadTimeVariationByMonth = supplierMonths.map(month => calculateStdDev(supplierMonthlyData[month], 'Lead_Time'));
        
        // Count how many times they move in the same direction
        let sameDirection = 0;
        for (let i = 1; i < supplierMonths.length; i++) {
            const orderChange = orderQtyVariationByMonth[i] - orderQtyVariationByMonth[i-1];
            const leadTimeChange = leadTimeVariationByMonth[i] - leadTimeVariationByMonth[i-1];
            
            if ((orderChange > 0 && leadTimeChange > 0) || (orderChange < 0 && leadTimeChange < 0)) {
                sameDirection++;
            }
        }
        
        const correlationPercentage = supplierMonths.length > 1 ? (sameDirection / (supplierMonths.length - 1)) * 100 : 0;
        
        return {
            supplier: supplier,
            correlation: correlationPercentage
        };
    });
    
    correlationAnalysis.sort((a, b) => b.correlation - a.correlation);
    
    document.getElementById('answer-complex-4').innerHTML = `
        ${correlationAnalysis[0].supplier} shows the strongest correlation between order quantity variability and lead time variability (${correlationAnalysis[0].correlation.toFixed(0)}%).<br><br>
        Correlation comparison:<br>
        ${correlationAnalysis.map(item => `- ${item.supplier}: ${item.correlation.toFixed(0)}% correlation (${item.correlation > 70 ? 'Strong' : item.correlation > 50 ? 'Moderate' : 'Weak'})`).join('<br>')}
    `;
    
    // Question 5: Which supplier demonstrates the most efficient procurement process?
    const efficiencyAnalysis = suppliers.map(supplier => {
        const supplierData = procurementData.filter(row => row.Supplier === supplier);
        
        const avgLeadTime = calculateAverage(supplierData, 'Lead_Time');
        const avgDelay = calculateAverage(supplierData, 'Delay');
        const onTimePercentage = (supplierData.filter(row => row.Delay <= 0).length / supplierData.length) * 100;
        const bullwhipRatio = bullwhipAnalysis.find(item => item.supplier === supplier).ratio;
        
        // Create a simple efficiency score (lower is better)
        const efficiencyScore = avgLeadTime + avgDelay * 2 + (100 - onTimePercentage) * 0.5 + bullwhipRatio * 10;
        
        return {
            supplier: supplier,
            score: efficiencyScore,
            avgLeadTime: avgLeadTime,
            avgDelay: avgDelay,
            onTimePercentage: onTimePercentage,
            bullwhipRatio: bullwhipRatio
        };
    });
    
    efficiencyAnalysis.sort((a, b) => a.score - b.score);
    
    document.getElementById('answer-complex-5').innerHTML = `
        ${efficiencyAnalysis[0].supplier} demonstrates the most efficient procurement process overall, with the best balance of lead time (${efficiencyAnalysis[0].avgLeadTime.toFixed(1)} days), delays (${efficiencyAnalysis[0].avgDelay.toFixed(1)} days), on-time delivery (${efficiencyAnalysis[0].onTimePercentage.toFixed(1)}%), and supply chain stability (bullwhip ratio: ${efficiencyAnalysis[0].bullwhipRatio.toFixed(2)}).<br><br>
        Efficiency comparison:<br>
        ${efficiencyAnalysis.map((item, index) => `${index + 1}. ${item.supplier}: Lead time ${item.avgLeadTime.toFixed(1)} days, Delay ${item.avgDelay.toFixed(1)} days, On-time ${item.onTimePercentage.toFixed(1)}%`).join('<br>')}
    `;
}

// Generate forecast
function generateForecast(supplier, horizon) {
    const forecastResults = document.getElementById('forecast-results');
    forecastResults.innerHTML = '<div class="loader" style="display: block;"></div>';
    
    // Filter data for the selected supplier
    const supplierData = procurementData.filter(row => row.Supplier === supplier);
    
    if (supplierData.length === 0) {
        forecastResults.innerHTML = `<p>No data available for ${supplier}.</p>`;
        return;
    }
    
    // Group by month
    const monthlyData = groupByMonth(supplierData);
    const months = Object.keys(monthlyData).sort();
    
    // Get the lead times and order quantities for each month
    const leadTimes = months.map(month => calculateAverage(monthlyData[month], 'Lead_Time'));
    const orderQuantities = months.map(month => calculateAverage(monthlyData[month], 'Order_Quantity'));
    const delays = months.map(month => calculateAverage(monthlyData[month], 'Delay'));
    
    // Simple forecasting using moving average (last 3 months)
    const forecastedLeadTimes = [];
    const forecastedOrderQuantities = [];
    const forecastedDelays = [];
    
    // Create last 3 months to use for first forecast
    let lastThreeLeadTimes = leadTimes.slice(-3);
    let lastThreeOrderQuantities = orderQuantities.slice(-3);
    let lastThreeDelays = delays.slice(-3);
    
    // Generate forecasts for the requested horizon
    for (let i = 0; i < horizon; i++) {
        // Calculate moving averages
        const avgLeadTime = lastThreeLeadTimes.reduce((sum, val) => sum + val, 0) / lastThreeLeadTimes.length;
        const avgOrderQty = lastThreeOrderQuantities.reduce((sum, val) => sum + val, 0) / lastThreeOrderQuantities.length;
        const avgDelay = lastThreeDelays.reduce((sum, val) => sum + val, 0) / lastThreeDelays.length;
        
        // Add some random variation to make it more realistic (±10%)
        const leadTimeVariation = avgLeadTime * (0.9 + Math.random() * 0.2);
        const orderQtyVariation = avgOrderQty * (0.9 + Math.random() * 0.2);
        const delayVariation = avgDelay * (0.9 + Math.random() * 0.2);
        
        // Add forecasts to array
        forecastedLeadTimes.push(leadTimeVariation);
        forecastedOrderQuantities.push(orderQtyVariation);
        forecastedDelays.push(delayVariation);
        
        // Update last three values for next iteration
        lastThreeLeadTimes.shift();
        lastThreeLeadTimes.push(leadTimeVariation);
        
        lastThreeOrderQuantities.shift();
        lastThreeOrderQuantities.push(orderQtyVariation);
        
        lastThreeDelays.shift();
        lastThreeDelays.push(delayVariation);
    }
    
    // Generate forecast months
    const forecastMonths = [];
    let lastMonth = months[months.length - 1];
    for (let i = 0; i < horizon; i++) {
        // Parse year and month from last month
        const [year, month] = lastMonth.split('-').map(num => parseInt(num));
        
        // Calculate next month
        let nextMonth, nextYear;
        if (month === 12) {
            nextMonth = 1;
            nextYear = year + 1;
        } else {
            nextMonth = month + 1;
            nextYear = year;
        }
        
        // Format next month as YYYY-MM
        const nextMonthFormatted = `${nextYear}-${String(nextMonth).padStart(2, '0')}`;
        forecastMonths.push(nextMonthFormatted);
        
        // Update last month for next iteration
        lastMonth = nextMonthFormatted;
    }
    
    // Create forecast chart
    forecastResults.innerHTML = `
        <h3>Forecast for ${supplier} (Next ${horizon} months)</h3>
        <canvas id="forecastChart"></canvas>
        <div style="margin-top: 20px;">
            <h4>Forecast Data</h4>
            <table style="width: 100%; border-collapse: collapse; margin-top: 10px;">
                <thead>
                    <tr>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Month</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Lead Time</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Delay</th>
                        <th style="border: 1px solid #ddd; padding: 8px; text-align: left;">Order Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${forecastMonths.map((month, index) => `
                        <tr>
                            <td style="border: 1px solid #ddd; padding: 8px;">${month}</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${forecastedLeadTimes[index].toFixed(1)} days</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${forecastedDelays[index].toFixed(1)} days</td>
                            <td style="border: 1px solid #ddd; padding: 8px;">${forecastedOrderQuantities[index].toFixed(0)} units</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `;
    
    // Create chart
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Combine historical and forecast data
    const allMonths = [...months, ...forecastMonths];
    const allLeadTimes = [...leadTimes, ...forecastedLeadTimes];
    const allDelays = [...delays, ...forecastedDelays];
    
    // Find the index where forecast starts
    const forecastStartIndex = months.length;
    
    const chart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allMonths,
            datasets: [
                {
                    label: 'Historical Lead Time',
                    data: leadTimes.map((value, index) => ({
                        x: months[index],
                        y: value
                    })),
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Forecasted Lead Time',
                    data: forecastedLeadTimes.map((value, index) => ({
                        x: forecastMonths[index],
                        y: value
                    })),
                    borderColor: '#4a6fa5',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Historical Delay',
                    data: delays.map((value, index) => ({
                        x: months[index],
                        y: value
                    })),
                    borderColor: '#ff6b6b',
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Forecasted Delay',
                    data: forecastedDelays.map((value, index) => ({
                        x: forecastMonths[index],
                        y: value
                    })),
                    borderColor: '#ff6b6b',
                    borderDash: [5, 5],
                    backgroundColor: 'rgba(255, 107, 107, 0.1)',
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                },
                title: {
                    display: true,
                    text: `${supplier} - Lead Time and Delay Forecast`
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: months[months.length - 1],
                            xMax: months[months.length - 1],
                            borderColor: 'grey',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                content: 'Forecast Start',
                                enabled: true
                            }
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Days'
                    }
                }
            }
        }
    });
    
    charts.push(chart);
    updateChartTheme(chart);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    // Set default active supplier
    alphaBtn.classList.add('active');
    currentSupplier = 'Alpha Supplies';
    
    // Create background animation
    createBubbles();
});
