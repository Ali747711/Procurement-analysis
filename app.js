// ======= Global Variables =======
let procurementData = [];
let selectedSupplier = null;
let chartInstances = {};
let comparisonSuppliers = [];

// ======= DOM Elements =======
document.addEventListener('DOMContentLoaded', function() {
    // Attach event listeners
    document.getElementById('csvFileInput').addEventListener('change', handleFileUpload);
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
    document.getElementById('homeBtn').addEventListener('click', showHomePage);
    document.getElementById('compareBtn').addEventListener('click', compareSuppliers);
    document.getElementById('generateForecast').addEventListener('click', generateForecast);
    
    // Update file name display when selecting a file
    document.getElementById('csvFileInput').addEventListener('change', function() {
        const fileName = this.files[0] ? this.files[0].name : 'No file selected';
        document.getElementById('fileName').textContent = fileName;
    });
    
    // Attach event listeners to supplier dropdown options
    const supplierLinks = document.querySelectorAll('.dropdown-content a');
    supplierLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            selectedSupplier = this.getAttribute('data-supplier');
            analyzeSupplier(selectedSupplier);
        });
    });
    
    // Initialize cursor follower
    initCursorFollower();
});

// ======= Cursor Follower =======
function initCursorFollower() {
    const follower = document.querySelector('.cursor-follower');
    
    document.addEventListener('mousemove', (e) => {
        const x = e.clientX;
        const y = e.clientY;
        
        follower.style.left = x + 'px';
        follower.style.top = y + 'px';
    });
    
    document.addEventListener('mousedown', () => {
        follower.style.transform = 'translate(-50%, -50%) scale(0.8)';
    });
    
    document.addEventListener('mouseup', () => {
        follower.style.transform = 'translate(-50%, -50%) scale(1)';
    });
    
    // Special effect when hovering over buttons
    document.querySelectorAll('button, .file-upload-label, .dropdown-content a').forEach(element => {
        element.addEventListener('mouseenter', () => {
            follower.style.width = '60px';
            follower.style.height = '60px';
            follower.style.backgroundColor = 'rgba(255, 126, 103, 0.2)';
            follower.style.borderColor = 'var(--accent-color)';
        });
        
        element.addEventListener('mouseleave', () => {
            follower.style.width = '40px';
            follower.style.height = '40px';
            follower.style.backgroundColor = 'rgba(74, 111, 165, 0.3)';
            follower.style.borderColor = 'var(--primary-color)';
        });
    });
}

// ======= Theme Toggle =======
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('themeToggle');
    
    body.classList.toggle('dark-mode');
    
    if (body.classList.contains('dark-mode')) {
        themeBtn.innerHTML = '<i class="fas fa-sun"></i> Light Mode';
    } else {
        themeBtn.innerHTML = '<i class="fas fa-moon"></i> Dark Mode';
    }
    
    // Update charts if they exist
    updateChartsTheme();
}

function updateChartsTheme() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f8f9fa' : '#343a40';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Update each chart instance if it exists
    Object.values(chartInstances).forEach(chart => {
        if (chart) {
            chart.options.scales.x.grid.color = gridColor;
            chart.options.scales.x.ticks.color = textColor;
            chart.options.scales.y.grid.color = gridColor;
            chart.options.scales.y.ticks.color = textColor;
            chart.options.plugins.legend.labels.color = textColor;
            chart.update();
        }
    });
}

// ======= Navigation Functions =======
function showHomePage() {
    // Hide all sections except upload
    document.getElementById('summary-section').classList.add('hidden');
    document.getElementById('supplier-analysis').classList.add('hidden');
    document.getElementById('insights-section').classList.add('hidden');
    document.getElementById('forecast-section').classList.add('hidden');
    document.getElementById('comparison-section').classList.add('hidden');
    
    // Show upload section
    document.getElementById('upload-section').classList.remove('hidden');
}

function showAnalysisPage() {
    // Hide upload section
    document.getElementById('upload-section').classList.add('hidden');
    
    // Show analysis sections
    document.getElementById('summary-section').classList.remove('hidden');
    document.getElementById('supplier-analysis').classList.remove('hidden');
    document.getElementById('insights-section').classList.remove('hidden');
    document.getElementById('forecast-section').classList.remove('hidden');
    
    // Hide comparison section
    document.getElementById('comparison-section').classList.add('hidden');
}

function showComparisonPage() {
    // Hide upload section
    document.getElementById('upload-section').classList.add('hidden');
    
    // Hide individual supplier sections
    document.getElementById('supplier-analysis').classList.add('hidden');
    document.getElementById('forecast-section').classList.add('hidden');
    
    // Show summary and insights
    document.getElementById('summary-section').classList.remove('hidden');
    document.getElementById('insights-section').classList.remove('hidden');
    
    // Show comparison section
    document.getElementById('comparison-section').classList.remove('hidden');
}

// ======= File Upload & Data Processing =======
function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // Use PapaParse to parse CSV
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            if (results.data && results.data.length > 0) {
                procurementData = preprocessData(results.data);
                
                // Calculate and display overall metrics
                calculateOverallMetrics(procurementData);
                
                // Show analysis page
                showAnalysisPage();
                
                // If a supplier was previously selected, analyze it again
                if (selectedSupplier) {
                    analyzeSupplier(selectedSupplier);
                }
            }
        },
        error: function(error) {
            console.error("Error parsing CSV:", error);
            alert("Error parsing CSV file. Please check the format and try again.");
        }
    });
}

function preprocessData(data) {
    // Validate and clean data
    return data.filter(row => {
        // Ensure all required fields are present
        return row.Order_ID && 
               row.Supplier && 
               row.Order_Date && 
               row.Expected_Delivery_Date && 
               row.Actual_Delivery_Date;
    }).map(row => {
        // Convert dates to Date objects
        const orderDate = new Date(row.Order_Date);
        const expectedDate = new Date(row.Expected_Delivery_Date);
        const actualDate = new Date(row.Actual_Delivery_Date);
        
        // Calculate lead time (in days)
        const expectedLeadTime = Math.round((expectedDate - orderDate) / (1000 * 60 * 60 * 24));
        const actualLeadTime = Math.round((actualDate - orderDate) / (1000 * 60 * 60 * 24));
        
        // Calculate delay (in days)
        const delay = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));
        
        // Add derived fields to the data
        return {
            ...row,
            OrderDate: orderDate,
            ExpectedDeliveryDate: expectedDate,
            ActualDeliveryDate: actualDate,
            ExpectedLeadTime: expectedLeadTime,
            ActualLeadTime: actualLeadTime,
            Delay: delay > 0 ? delay : 0,
            Month: orderDate.getMonth() + 1, // 1-12
            Year: orderDate.getFullYear(),
            IsDelayed: delay > 0
        };
    });
}

// ======= Metrics Calculation =======
function calculateOverallMetrics(data) {
    // Calculate average lead time
    const avgLeadTime = data.reduce((sum, row) => sum + row.ActualLeadTime, 0) / data.length;
    
    // Calculate delay rate
    const delayedOrders = data.filter(row => row.IsDelayed).length;
    const delayRate = (delayedOrders / data.length) * 100;
    
    // Calculate bullwhip ratio
    const supplierData = {};
    
    // Group by supplier and month
    data.forEach(row => {
        const key = `${row.Supplier}-${row.Year}-${row.Month}`;
        if (!supplierData[key]) {
            supplierData[key] = {
                Supplier: row.Supplier,
                Year: row.Year,
                Month: row.Month,
                CustomerDemand: [],
                OrderQuantity: []
            };
        }
        
        supplierData[key].CustomerDemand.push(row.Customer_Demand);
        supplierData[key].OrderQuantity.push(row.Order_Quantity);
    });
    
    // Calculate variability for each supplier-month
    const variabilityRatios = [];
    
    Object.values(supplierData).forEach(group => {
        if (group.CustomerDemand.length > 1 && group.OrderQuantity.length > 1) {
            // Calculate coefficient of variation for demand and order quantity
            const demandCV = calculateCV(group.CustomerDemand);
            const orderCV = calculateCV(group.OrderQuantity);
            
            if (demandCV > 0) {
                variabilityRatios.push(orderCV / demandCV);
            }
        }
    });
    
    // Calculate overall bullwhip ratio (average of all ratios)
    const bullwhipRatio = variabilityRatios.length > 0 ? 
        variabilityRatios.reduce((sum, ratio) => sum + ratio, 0) / variabilityRatios.length : 
        0;
    
    // Calculate variability index (standard deviation of lead times)
    const leadTimes = data.map(row => row.ActualLeadTime);
    const variabilityIndex = calculateStandardDeviation(leadTimes);
    
    // Update the UI with the calculated metrics
    document.getElementById('avgLeadTime').textContent = avgLeadTime.toFixed(1) + ' days';
    document.getElementById('delayRate').textContent = delayRate.toFixed(1) + '%';
    document.getElementById('bullwhipRatio').textContent = bullwhipRatio.toFixed(2);
    document.getElementById('variabilityIndex').textContent = variabilityIndex.toFixed(2);
    
    // Calculate and display insights
    calculateInsights(data);
}

function calculateCV(array) {
    const mean = array.reduce((sum, val) => sum + val, 0) / array.length;
    const stdDev = calculateStandardDeviation(array);
    return mean !== 0 ? stdDev / mean : 0;
}

function calculateStandardDeviation(array) {
    const n = array.length;
    const mean = array.reduce((sum, val) => sum + val, 0) / n;
    const variance = array.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
    return Math.sqrt(variance);
}

function calculateInsights(data) {
    // ===== Simple Questions =====
    // 1. Which supplier has the highest average lead time?
    const supplierLeadTimes = {};
    data.forEach(row => {
        if (!supplierLeadTimes[row.Supplier]) {
            supplierLeadTimes[row.Supplier] = { sum: 0, count: 0 };
        }
        supplierLeadTimes[row.Supplier].sum += row.ActualLeadTime;
        supplierLeadTimes[row.Supplier].count += 1;
    });
    
    let highestLeadTimeSupplier = '';
    let highestLeadTime = 0;
    
    Object.entries(supplierLeadTimes).forEach(([supplier, data]) => {
        const avgLeadTime = data.sum / data.count;
        if (avgLeadTime > highestLeadTime) {
            highestLeadTime = avgLeadTime;
            highestLeadTimeSupplier = supplier;
        }
    });
    
    // 2. What transportation mode has the lowest average lead time?
    const transportLeadTimes = {};
    data.forEach(row => {
        if (!transportLeadTimes[row.Transportation_Mode]) {
            transportLeadTimes[row.Transportation_Mode] = { sum: 0, count: 0 };
        }
        transportLeadTimes[row.Transportation_Mode].sum += row.ActualLeadTime;
        transportLeadTimes[row.Transportation_Mode].count += 1;
    });
    
    let lowestLeadTimeTransport = '';
    let lowestLeadTime = Infinity;
    
    Object.entries(transportLeadTimes).forEach(([transport, data]) => {
        const avgLeadTime = data.sum / data.count;
        if (avgLeadTime < lowestLeadTime) {
            lowestLeadTime = avgLeadTime;
            lowestLeadTimeTransport = transport;
        }
    });
    
    // 3. Which month shows the highest average delays in delivery?
    const monthlyDelays = {};
    data.forEach(row => {
        const month = row.OrderDate.toLocaleString('default', { month: 'long' });
        if (!monthlyDelays[month]) {
            monthlyDelays[month] = { sum: 0, count: 0 };
        }
        monthlyDelays[month].sum += row.Delay;
        monthlyDelays[month].count += 1;
    });
    
    let highestDelayMonth = '';
    let highestDelay = 0;
    
    Object.entries(monthlyDelays).forEach(([month, data]) => {
        const avgDelay = data.sum / data.count;
        if (avgDelay > highestDelay) {
            highestDelay = avgDelay;
            highestDelayMonth = month;
        }
    });
    
    // 4. What type of disruption causes the longest average delay?
    const disruptionDelays = {};
    data.forEach(row => {
        if (!row.Disruption_Type || row.Disruption_Type === "None") return;
        
        if (!disruptionDelays[row.Disruption_Type]) {
            disruptionDelays[row.Disruption_Type] = { sum: 0, count: 0 };
        }
        disruptionDelays[row.Disruption_Type].sum += row.Delay;
        disruptionDelays[row.Disruption_Type].count += 1;
    });
    
    let longestDisruptionType = '';
    let longestDisruptionDelay = 0;
    
    Object.entries(disruptionDelays).forEach(([disruption, data]) => {
        const avgDelay = data.sum / data.count;
        if (avgDelay > longestDisruptionDelay) {
            longestDisruptionDelay = avgDelay;
            longestDisruptionType = disruption;
        }
    });
    
    // 5. Which product category has the shortest average lead time?
    const categoryLeadTimes = {};
    data.forEach(row => {
        if (!categoryLeadTimes[row.Product_Category]) {
            categoryLeadTimes[row.Product_Category] = { sum: 0, count: 0 };
        }
        categoryLeadTimes[row.Product_Category].sum += row.ActualLeadTime;
        categoryLeadTimes[row.Product_Category].count += 1;
    });
    
    let shortestLeadTimeCategory = '';
    let shortestLeadTime = Infinity;
    
    Object.entries(categoryLeadTimes).forEach(([category, data]) => {
        const avgLeadTime = data.sum / data.count;
        if (avgLeadTime < shortestLeadTime) {
            shortestLeadTime = avgLeadTime;
            shortestLeadTimeCategory = category;
        }
    });
    
    // Update Simple Insights in UI
    document.querySelector('#highest-lead-time span').textContent = 
        `${highestLeadTimeSupplier} (${highestLeadTime.toFixed(1)} days)`;
        
    document.querySelector('#lowest-lead-time-transport span').textContent = 
        `${lowestLeadTimeTransport} (${lowestLeadTime.toFixed(1)} days)`;
        
    document.querySelector('#highest-delay-month span').textContent = 
        `${highestDelayMonth} (${highestDelay.toFixed(1)} days)`;
        
    document.querySelector('#longest-disruption span').textContent = 
        `${longestDisruptionType} (${longestDisruptionDelay.toFixed(1)} days)`;
        
    document.querySelector('#shortest-category span').textContent = 
        `${shortestLeadTimeCategory} (${shortestLeadTime.toFixed(1)} days)`;
    
    // ===== Complex Questions =====
    // 1. Which transportation mode contributes most to delays?
    const transportDelayContribution = {};
    const totalDelays = data.reduce((sum, row) => sum + row.Delay, 0);
    
    data.forEach(row => {
        if (!transportDelayContribution[row.Transportation_Mode]) {
            transportDelayContribution[row.Transportation_Mode] = 0;
        }
        transportDelayContribution[row.Transportation_Mode] += row.Delay;
    });
    
    let highestDelayContribution = 0;
    let highestDelayTransport = '';
    
    Object.entries(transportDelayContribution).forEach(([transport, delaySum]) => {
        const contribution = delaySum / totalDelays * 100;
        if (contribution > highestDelayContribution) {
            highestDelayContribution = contribution;
            highestDelayTransport = transport;
        }
    });
    
    // 2. Are there seasonal patterns affecting lead times?
    const monthlyLeadTimes = {};
    data.forEach(row => {
        const month = row.OrderDate.toLocaleString('default', { month: 'long' });
        if (!monthlyLeadTimes[month]) {
            monthlyLeadTimes[month] = [];
        }
        monthlyLeadTimes[month].push(row.ActualLeadTime);
    });
    
    // Calculate variance of monthly lead times
    const monthlyVariance = {};
    Object.entries(monthlyLeadTimes).forEach(([month, leadTimes]) => {
        monthlyVariance[month] = calculateStandardDeviation(leadTimes);
    });
    
    // Determine if there's a seasonal pattern (high variance between months)
    const seasonalPatternDetected = calculateStandardDeviation(Object.values(monthlyVariance)) > 2;
    const seasonalPattern = seasonalPatternDetected ? 
        "Strong seasonal patterns detected" : 
        "No significant seasonal patterns detected";
    
    // 3. Does customer demand vs. order quantity show amplified variability (Bullwhip Effect)?
    const supplierMonthlyData = {};
    
    data.forEach(row => {
        const key = `${row.Supplier}-${row.Year}-${row.Month}`;
        if (!supplierMonthlyData[key]) {
            supplierMonthlyData[key] = {
                CustomerDemand: [],
                OrderQuantity: []
            };
        }
        
        supplierMonthlyData[key].CustomerDemand.push(row.Customer_Demand);
        supplierMonthlyData[key].OrderQuantity.push(row.Order_Quantity);
    });
    
    const bullwhipEffects = [];
    
    Object.values(supplierMonthlyData).forEach(group => {
        if (group.CustomerDemand.length > 1 && group.OrderQuantity.length > 1) {
            const demandCV = calculateCV(group.CustomerDemand);
            const orderCV = calculateCV(group.OrderQuantity);
            
            if (demandCV > 0) {
                bullwhipEffects.push(orderCV / demandCV);
            }
        }
    });
    
    const avgBullwhipEffect = bullwhipEffects.length > 0 ?
        bullwhipEffects.reduce((sum, ratio) => sum + ratio, 0) / bullwhipEffects.length :
        0;
    
    const bullwhipPresence = avgBullwhipEffect > 1.2 ? 
        `Strong (${avgBullwhipEffect.toFixed(2)})` : 
        avgBullwhipEffect > 1.0 ? 
            `Moderate (${avgBullwhipEffect.toFixed(2)})` : 
            `Minimal (${avgBullwhipEffect.toFixed(2)})`;
    
    // 4. How does increased variability in order quantity correlate with lead time variability?
    const supplierVariabilityData = {};
    
    data.forEach(row => {
        if (!supplierVariabilityData[row.Supplier]) {
            supplierVariabilityData[row.Supplier] = {
                OrderQuantities: [],
                LeadTimes: []
            };
        }
        
        supplierVariabilityData[row.Supplier].OrderQuantities.push(row.Order_Quantity);
        supplierVariabilityData[row.Supplier].LeadTimes.push(row.ActualLeadTime);
    });
    
    const correlations = [];
    
    Object.values(supplierVariabilityData).forEach(group => {
        if (group.OrderQuantities.length > 2 && group.LeadTimes.length > 2) {
            const orderCV = calculateCV(group.OrderQuantities);
            const leadTimeCV = calculateCV(group.LeadTimes);
            
            // Simplified correlation measure
            correlations.push(Math.abs(orderCV - leadTimeCV) < 0.1);
        }
    });
    
    const correlationStrength = correlations.filter(Boolean).length / correlations.length;
    let correlationResult = "";
    
    if (correlationStrength > 0.7) {
        correlationResult = "Strong positive correlation";
    } else if (correlationStrength > 0.4) {
        correlationResult = "Moderate correlation";
    } else {
        correlationResult = "Weak correlation";
    }
    
    // Update Complex Insights in UI
    document.querySelector('#delay-transport span').textContent = 
        `${highestDelayTransport} (${highestDelayContribution.toFixed(1)}%)`;
        
    document.querySelector('#seasonal-patterns span').textContent = seasonalPattern;
    document.querySelector('#bullwhip-indicator span').textContent = bullwhipPresence;
    document.querySelector('#variability-correlation span').textContent = correlationResult;
}

// ======= Supplier Analysis =======
function analyzeSupplier(supplier) {
    selectedSupplier = supplier;
    
    // Filter data for selected supplier
    const supplierData = procurementData.filter(row => row.Supplier === supplier);
    
    if (supplierData.length === 0) {
        alert(`No data found for supplier: ${supplier}`);
        return;
    }
    
    // Update supplier title
    document.getElementById('supplier-title').innerHTML = `<i class="fas fa-industry"></i> ${supplier} Analysis`;
    
    // Show analysis page
    showAnalysisPage();
    
    // Generate visualizations
    generateLeadTimeChart(supplierData);
    generateDisruptionChart(supplierData);
    generateTransportChart(supplierData);
    generateBullwhipChart(supplierData);
    
    // Update forecast section
    document.getElementById('forecastPeriods').value = 3;
    generateForecast();
}

// ======= Chart Generation =======
function generateLeadTimeChart(data) {
    // Sort data by date
    data.sort((a, b) => a.OrderDate - b.OrderDate);
    
    // Group data by month
    const monthlyData = {};
    
    data.forEach(row => {
        const monthYear = `${row.OrderDate.toLocaleString('default', { month: 'short' })} ${row.Year}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                leadTimes: [],
                delays: []
            };
        }
        
        monthlyData[monthYear].leadTimes.push(row.ActualLeadTime);
        monthlyData[monthYear].delays.push(row.Delay);
    });
    
    // Calculate averages for each month
    const labels = [];
    const leadTimeData = [];
    const delayData = [];
    
    Object.entries(monthlyData).forEach(([monthYear, values]) => {
        labels.push(monthYear);
        
        const avgLeadTime = values.leadTimes.reduce((sum, val) => sum + val, 0) / values.leadTimes.length;
        leadTimeData.push(avgLeadTime);
        
        const avgDelay = values.delays.reduce((sum, val) => sum + val, 0) / values.delays.length;
        delayData.push(avgDelay);
    });
    
    // Create the chart
    const ctx = document.getElementById('leadTimeChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.leadTime) {
        chartInstances.leadTime.destroy();
    }
    
    // Set chart colors based on current theme
    const isDarkMode = document.body.classList.contains('dark-mode');
    const textColor = isDarkMode ? '#f8f9fa' : '#343a40';
    const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    chartInstances.leadTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Lead Time (days)',
                    data: leadTimeData,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Average Delay (days)',
                    data: delayData,
                    borderColor: '#ff7e67',
                    backgroundColor: 'rgba(255, 126, 103, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: textColor
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            },
            scales: {
                x: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    }
                },
                y: {
                    grid: {
                        color: gridColor
                    },
                    ticks: {
                        color: textColor
                    },
                    beginAtZero: true
                }
            }
        }
    });
