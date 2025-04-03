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
    
    // Show only the upload section initially
    showHomePage();
    
    // Add debug functionality only in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' || window.location.hostname === '') {
        addDebugButton();
        console.log("Debug mode enabled on localhost");
    }
    
    // Test file input functionality
    console.log("Adding file input test");
    document.getElementById('csvFileInput').addEventListener('change', function() {
        console.log("Direct file input change event");
        console.log("File selected via direct event:", this.files[0] ? this.files[0].name : "No file");
    });
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
    console.log("File upload handler triggered");
    
    const file = event.target.files[0];
    console.log("File selected:", file);
    
    if (!file) {
        console.log("No file selected");
        return;
    }
    
    console.log("File name:", file.name);
    console.log("File type:", file.type);
    console.log("File size:", file.size, "bytes");
    
    // Use PapaParse to parse CSV
    console.log("Starting PapaParse processing");
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log("PapaParse complete");
            console.log("Data rows:", results.data.length);
            console.log("First row sample:", results.data[0]);
            
            if (results.data && results.data.length > 0) {
                console.log("Processing data...");
                procurementData = preprocessData(results.data);
                console.log("Data preprocessed, row count:", procurementData.length);
                
                // Calculate and display overall metrics
                calculateOverallMetrics(procurementData);
                
                // Show analysis page
                showAnalysisPage();
                
                // If a supplier was previously selected, analyze it again
                if (selectedSupplier) {
                    analyzeSupplier(selectedSupplier);
                } else {
                    // Default to first supplier
                    const suppliers = [...new Set(procurementData.map(row => row.Supplier))];
                    if (suppliers.length > 0) {
                        analyzeSupplier(suppliers[0]);
                    }
                }
            } else {
                console.error("No data found in CSV, or data structure is invalid");
                console.log("Raw results:", results);
                alert("No valid data found in the CSV file. Please check the format and try again.");
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
        
        // Validate dates
        if (isNaN(orderDate) || isNaN(expectedDate) || isNaN(actualDate)) {
            console.warn("Invalid date found in row:", row);
            return null;
        }
        
        // Calculate lead time (in days)
        const expectedLeadTime = Math.round((expectedDate - orderDate) / (1000 * 60 * 60 * 24));
        const actualLeadTime = Math.round((actualDate - orderDate) / (1000 * 60 * 60 * 24));
        
        // Calculate delay (in days)
        const delay = Math.round((actualDate - expectedDate) / (1000 * 60 * 60 * 24));
        
        // Ensure numeric values
        const customerDemand = parseFloat(row.Customer_Demand) || 0;
        const orderQuantity = parseFloat(row.Order_Quantity) || 0;
        
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
            IsDelayed: delay > 0,
            Customer_Demand: customerDemand,
            Order_Quantity: orderQuantity
        };
    }).filter(row => row !== null); // Remove any rows with invalid dates
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
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    const themeGridColor = themeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
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
                        color: themeTextColor
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
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    }
                },
                y: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true
                }
            }
        }
    });
}
function generateDisruptionChart(data) {
    // Group by disruption type
    const disruptionData = {};
    
    data.forEach(row => {
        // Handle null or "None" disruptions
        const disruptionType = row.Disruption_Type || "None";
        
        if (!disruptionData[disruptionType]) {
            disruptionData[disruptionType] = {
                count: 0,
                totalDelay: 0
            };
        }
        
        disruptionData[disruptionType].count++;
        disruptionData[disruptionType].totalDelay += row.Delay;
    });
    
    // Prepare data for chart
    const labels = Object.keys(disruptionData);
    const counts = labels.map(label => disruptionData[label].count);
    const avgDelays = labels.map(label => 
        disruptionData[label].count > 0 ? 
        disruptionData[label].totalDelay / disruptionData[label].count : 0
    );
    
    // Create color array
    const backgroundColors = [
        'rgba(74, 111, 165, 0.7)',
        'rgba(255, 126, 103, 0.7)',
        'rgba(104, 137, 187, 0.7)',
        'rgba(255, 180, 162, 0.7)',
        'rgba(53, 79, 118, 0.7)'
    ];
    
    // Create the chart
    const ctx = document.getElementById('disruptionChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.disruption) {
        chartInstances.disruption.destroy();
    }
    
    // Set chart colors based on current theme
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    
    // Create new chart
    chartInstances.disruption = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: labels,
            datasets: [{
                data: counts,
                backgroundColor: backgroundColors.slice(0, labels.length),
                borderColor: themeIsDarkMode ? '#1e1e1e' : '#ffffff',
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        color: themeTextColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.raw || 0;
                            const percentage = Math.round((value / data.length) * 100);
                            const avgDelay = avgDelays[context.dataIndex].toFixed(1);
                            return `${label}: ${value} (${percentage}%) - Avg Delay: ${avgDelay} days`;
                        }
                    }
                }
            }
        }
    });
}

function generateTransportChart(data) {
    // Group by transportation mode
    const transportData = {};
    
    data.forEach(row => {
        if (!transportData[row.Transportation_Mode]) {
            transportData[row.Transportation_Mode] = {
                count: 0,
                totalLeadTime: 0,
                totalDelay: 0
            };
        }
        
        transportData[row.Transportation_Mode].count++;
        transportData[row.Transportation_Mode].totalLeadTime += row.ActualLeadTime;
        transportData[row.Transportation_Mode].totalDelay += row.Delay;
    });
    
    // Prepare data for chart
    const labels = Object.keys(transportData);
    const avgLeadTimes = labels.map(label => 
        transportData[label].totalLeadTime / transportData[label].count
    );
    const avgDelays = labels.map(label => 
        transportData[label].totalDelay / transportData[label].count
    );
    
    // Create the chart
    const ctx = document.getElementById('transportChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.transport) {
        chartInstances.transport.destroy();
    }
    
    // Set chart colors based on current theme
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    const themeGridColor = themeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    chartInstances.transport = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Lead Time (days)',
                    data: avgLeadTimes,
                    backgroundColor: 'rgba(74, 111, 165, 0.7)',
                    borderColor: 'rgba(74, 111, 165, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Average Delay (days)',
                    data: avgDelays,
                    backgroundColor: 'rgba(255, 126, 103, 0.7)',
                    borderColor: 'rgba(255, 126, 103, 1)',
                    borderWidth: 1
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
                        color: themeTextColor
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    }
                },
                y: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function generateBullwhipChart(data) {
    // Sort data by date
    data.sort((a, b) => a.OrderDate - b.OrderDate);
    
    // Group by month
    const monthlyData = {};
    
    data.forEach(row => {
        const monthYear = `${row.OrderDate.toLocaleString('default', { month: 'short' })} ${row.Year}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                customerDemand: [],
                orderQuantity: []
            };
        }
        
        monthlyData[monthYear].customerDemand.push(row.Customer_Demand);
        monthlyData[monthYear].orderQuantity.push(row.Order_Quantity);
    });
    
    // Calculate averages and variances
    const labels = [];
    const avgDemand = [];
    const avgOrder = [];
    const demandVariability = [];
    const orderVariability = [];
    
    Object.entries(monthlyData).forEach(([monthYear, values]) => {
        labels.push(monthYear);
        
        // Calculate averages
        const avgDemandValue = values.customerDemand.reduce((sum, val) => sum + val, 0) / values.customerDemand.length;
        const avgOrderValue = values.orderQuantity.reduce((sum, val) => sum + val, 0) / values.orderQuantity.length;
        
        avgDemand.push(avgDemandValue);
        avgOrder.push(avgOrderValue);
        
        // Calculate coefficient of variation (CV)
        const demandCV = calculateCV(values.customerDemand);
        const orderCV = calculateCV(values.orderQuantity);
        
        demandVariability.push(demandCV);
        orderVariability.push(orderCV);
    });
    
    // Create the chart
    const ctx = document.getElementById('bullwhipChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.bullwhip) {
        chartInstances.bullwhip.destroy();
    }
    
    // Set chart colors based on current theme
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    const themeGridColor = themeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    chartInstances.bullwhip = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Order Quantity Variability',
                    data: orderVariability,
                    borderColor: '#ff7e67',
                    backgroundColor: 'rgba(255, 126, 103, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Customer Demand Variability',
                    data: demandVariability,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    yAxisID: 'y',
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Bullwhip Ratio',
                    data: orderVariability.map((orderVar, i) => 
                        demandVariability[i] > 0 ? orderVar / demandVariability[i] : 0
                    ),
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    yAxisID: 'y1',
                    tension: 0.3,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: themeTextColor
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.datasetIndex === 2) {
                                label += context.parsed.y.toFixed(2) + ' (ratio)';
                            } else {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: 'Variability (CV)',
                        color: themeTextColor
                    },
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Bullwhip Ratio',
                        color: themeTextColor
                    },
                    grid: {
                        drawOnChartArea: false,
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true
                }
            }
        }
    });
}

function generateForecast() {
    if (!selectedSupplier || !procurementData.length) return;
    
    // Get the number of periods to forecast
    const periods = parseInt(document.getElementById('forecastPeriods').value) || 3;
    
    // Filter data for selected supplier
    const supplierData = procurementData.filter(row => row.Supplier === selectedSupplier);
    
    // Sort data by date
    supplierData.sort((a, b) => a.OrderDate - b.OrderDate);
    
    // Extract lead times by month
    const monthlyLeadTimes = {};
    
    supplierData.forEach(row => {
        const monthYear = `${row.OrderDate.toLocaleString('default', { month: 'short' })} ${row.Year}`;
        
        if (!monthlyLeadTimes[monthYear]) {
            monthlyLeadTimes[monthYear] = [];
        }
        
        monthlyLeadTimes[monthYear].push(row.ActualLeadTime);
    });
    
    // Calculate average lead time for each month
    const labels = [];
    const leadTimeData = [];
    
    Object.entries(monthlyLeadTimes).forEach(([monthYear, leadTimes]) => {
        labels.push(monthYear);
        const avgLeadTime = leadTimes.reduce((sum, val) => sum + val, 0) / leadTimes.length;
        leadTimeData.push(avgLeadTime);
    });
    
    // Calculate forecast using simple exponential smoothing
    const alpha = 0.3; // Smoothing factor
    let forecast = [];
    let lastActual = leadTimeData[leadTimeData.length - 1];
    let lastForecast = lastActual;
    
    // Calculate forecast for future periods
    for (let i = 0; i < periods; i++) {
        // Simple exponential smoothing formula: Ft+1 = α * Yt + (1 - α) * Ft
        const nextForecast = alpha * lastActual + (1 - alpha) * lastForecast;
        forecast.push(nextForecast);
        lastForecast = nextForecast;
    }
    
    // Calculate confidence interval (simple approach)
    const stdDev = calculateStandardDeviation(leadTimeData);
    const confidenceIntervalLower = forecast.map(val => val - 1.96 * stdDev);
    const confidenceIntervalUpper = forecast.map(val => val + 1.96 * stdDev);
    
    // Create future period labels
    const lastDate = new Date(supplierData[supplierData.length - 1].OrderDate);
    const futureLabels = [];
    
    for (let i = 1; i <= periods; i++) {
        const futureDate = new Date(lastDate);
        futureDate.setMonth(lastDate.getMonth() + i);
        futureLabels.push(futureDate.toLocaleString('default', { month: 'short' }) + ' ' + futureDate.getFullYear());
    }
    
    // Combine historical and forecast data
    const combinedLabels = [...labels, ...futureLabels];
    const combinedData = [...leadTimeData, ...forecast];
    
    // Determine forecast metrics
    const futureLT = forecast[forecast.length - 1].toFixed(1);
    
    const confidenceInterval = `${confidenceIntervalLower[forecast.length - 1].toFixed(1)} - ${confidenceIntervalUpper[forecast.length - 1].toFixed(1)} days`;
    
    // Determine trend direction
    const trendDirection = forecast[forecast.length - 1] > leadTimeData[leadTimeData.length - 1] ? 
        "Increasing ↑" : forecast[forecast.length - 1] < leadTimeData[leadTimeData.length - 1] ? 
        "Decreasing ↓" : "Stable →";
    
    // Update forecast metrics
    document.getElementById('futureLeadTime').textContent = `${futureLT} days`;
    document.getElementById('confidenceInterval').textContent = confidenceInterval;
    document.getElementById('trendDirection').textContent = trendDirection;
    
    // Create the chart
    const ctx = document.getElementById('forecastChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.forecast) {
        chartInstances.forecast.destroy();
    }
    
    // Set chart colors based on current theme
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    const themeGridColor = themeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    chartInstances.forecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: combinedLabels,
            datasets: [
                {
                    label: 'Historical Lead Time',
                    data: [...leadTimeData, ...Array(periods).fill(null)],
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Forecast Lead Time',
                    data: [...Array(labels.length).fill(null), ...forecast],
                    borderColor: '#28a745',
                    backgroundColor: 'rgba(40, 167, 69, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Upper Confidence Interval',
                    data: [...Array(labels.length).fill(null), ...confidenceIntervalUpper],
                    borderColor: 'rgba(40, 167, 69, 0.5)',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [3, 3],
                    tension: 0.3,
                    fill: false
                },
                {
                    label: 'Lower Confidence Interval',
                    data: [...Array(labels.length).fill(null), ...confidenceIntervalLower],
                    borderColor: 'rgba(40, 167, 69, 0.5)',
                    backgroundColor: 'transparent',
                    borderWidth: 1,
                    borderDash: [3, 3],
                    tension: 0.3,
                    fill: false
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
                        color: themeTextColor
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
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    }
                },
                y: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)',
                        color: themeTextColor
                    }
                }
            }
        }
    });
}

function compareSuppliers() {
    if (!procurementData.length) {
        alert("Please upload data first!");
        return;
    }
    
    // Get unique suppliers
    const suppliers = [...new Set(procurementData.map(row => row.Supplier))];
    
    // Need at least 2 suppliers to compare
    if (suppliers.length < 2) {
        alert("Need at least 2 suppliers to compare!");
        return;
    }
    
    // Randomly select 2 suppliers (or use the selected supplier and one random)
    let supplier1, supplier2;
    
    if (selectedSupplier && suppliers.includes(selectedSupplier)) {
        supplier1 = selectedSupplier;
        
        // Filter out the selected supplier for the second choice
        const otherSuppliers = suppliers.filter(s => s !== selectedSupplier);
        supplier2 = otherSuppliers[Math.floor(Math.random() * otherSuppliers.length)];
    } else {
        // Randomly pick 2 suppliers
        supplier1 = suppliers[Math.floor(Math.random() * suppliers.length)];
        
        let otherSuppliers = suppliers.filter(s => s !== supplier1);
        supplier2 = otherSuppliers[Math.floor(Math.random() * otherSuppliers.length)];
    }
    
    comparisonSuppliers = [supplier1, supplier2];
    
    // Filter data for selected suppliers
    const supplier1Data = procurementData.filter(row => row.Supplier === supplier1);
    const supplier2Data = procurementData.filter(row => row.Supplier === supplier2);
    
    // Show comparison page
    showComparisonPage();
    
    // Generate comparison metrics
    generateComparisonMetrics(supplier1, supplier1Data, supplier2, supplier2Data);
    
    // Generate comparison charts
    generateLeadTimeComparisonChart(supplier1, supplier1Data, supplier2, supplier2Data);
    generateBullwhipComparisonChart(supplier1, supplier1Data, supplier2, supplier2Data);
}

function generateComparisonMetrics(supplier1, supplier1Data, supplier2, supplier2Data) {
    // Calculate metrics for each supplier
    const supplier1Metrics = calculateSupplierMetrics(supplier1Data);
    const supplier2Metrics = calculateSupplierMetrics(supplier2Data);
    
    // Build HTML for comparison
    const comparisonHTML = `
        <div class="comparison-supplier">
            <h3>${supplier1}</h3>
            <div class="comparison-metric">
                <span>Average Lead Time:</span>
                <span>${supplier1Metrics.avgLeadTime.toFixed(1)} days</span>
            </div>
            <div class="comparison-metric">
                <span>Delay Rate:</span>
                <span>${supplier1Metrics.delayRate.toFixed(1)}%</span>
            </div>
            <div class="comparison-metric">
                <span>Bullwhip Ratio:</span>
                <span>${supplier1Metrics.bullwhipRatio.toFixed(2)}</span>
            </div>
            <div class="comparison-metric">
                <span>Variability Index:</span>
                <span>${supplier1Metrics.variabilityIndex.toFixed(2)}</span>
            </div>
        </div>
        <div class="comparison-supplier">
            <h3>${supplier2}</h3>
            <div class="comparison-metric">
                <span>Average Lead Time:</span>
                <span>${supplier2Metrics.avgLeadTime.toFixed(1)} days</span>
            </div>
            <div class="comparison-metric">
                <span>Delay Rate:</span>
                <span>${supplier2Metrics.delayRate.toFixed(1)}%</span>
            </div>
            <div class="comparison-metric">
                <span>Bullwhip Ratio:</span>
                <span>${supplier2Metrics.bullwhipRatio.toFixed(2)}</span>
            </div>
            <div class="comparison-metric">
                <span>Variability Index:</span>
                <span>${supplier2Metrics.variabilityIndex.toFixed(2)}</span>
            </div>
        </div>
    `;
    
    // Update the UI
    document.getElementById('comparison-suppliers').innerHTML = comparisonHTML;
}

function calculateSupplierMetrics(data) {
    // Calculate average lead time
    const avgLeadTime = data.reduce((sum, row) => sum + row.ActualLeadTime, 0) / data.length;
    
    // Calculate delay rate
    const delayedOrders = data.filter(row => row.IsDelayed).length;
    const delayRate = (delayedOrders / data.length) * 100;
    
    // Calculate bullwhip ratio
    const monthlyData = {};
    
    // Group by month
    data.forEach(row => {
        const monthYear = `${row.Year}-${row.Month}`;
        
        if (!monthlyData[monthYear]) {
            monthlyData[monthYear] = {
                customerDemand: [],
                orderQuantity: []
            };
        }
        
        monthlyData[monthYear].customerDemand.push(row.Customer_Demand);
        monthlyData[monthYear].orderQuantity.push(row.Order_Quantity);
    });
    
    // Calculate coefficient of variation for each month
    const ratios = [];
    
    Object.values(monthlyData).forEach(month => {
        if (month.customerDemand.length > 1 && month.orderQuantity.length > 1) {
            const demandCV = calculateCV(month.customerDemand);
            const orderCV = calculateCV(month.orderQuantity);
            
            if (demandCV > 0) {
                ratios.push(orderCV / demandCV);
            }
        }
    });
    
    // Average bullwhip ratio
    const bullwhipRatio = ratios.length > 0 ? 
        ratios.reduce((sum, ratio) => sum + ratio, 0) / ratios.length : 0;
    
    // Calculate variability index
    const variabilityIndex = calculateStandardDeviation(data.map(row => row.ActualLeadTime));
    
    return {
        avgLeadTime,
        delayRate,
        bullwhipRatio,
        variabilityIndex
    };
}

function generateLeadTimeComparisonChart(supplier1, supplier1Data, supplier2, supplier2Data) {
    // Sort data by date
    supplier1Data.sort((a, b) => a.OrderDate - b.OrderDate);
    supplier2Data.sort((a, b) => a.OrderDate - b.OrderDate);
    
    // Group by month
    const supplier1Monthly = groupByMonth(supplier1Data);
    const supplier2Monthly = groupByMonth(supplier2Data);
    
    // Prepare chart data
    const allMonths = new Set([...Object.keys(supplier1Monthly), ...Object.keys(supplier2Monthly)]);
    const sortedMonths = Array.from(allMonths).sort();
    
    const supplier1LeadTimes = sortedMonths.map(month => {
        if (supplier1Monthly[month]) {
            const avgLeadTime = supplier1Monthly[month].leadTimes.reduce((sum, val) => sum + val, 0) / 
                              supplier1Monthly[month].leadTimes.length;
            return avgLeadTime;
        }
        return null;
    });
    
    const supplier2LeadTimes = sortedMonths.map(month => {
        if (supplier2Monthly[month]) {
            const avgLeadTime = supplier2Monthly[month].leadTimes.reduce((sum, val) => sum + val, 0) / 
                              supplier2Monthly[month].leadTimes.length;
            return avgLeadTime;
        }
        return null;
    });
    
    // Create the chart
    const ctx = document.getElementById('comparisonLeadTimeChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.comparisonLeadTime) {
        chartInstances.comparisonLeadTime.destroy();
    }
    
    // Set chart colors based on current theme
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    const themeGridColor = themeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    chartInstances.comparisonLeadTime = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [
                {
                    label: supplier1,
                    data: supplier1LeadTimes,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: supplier2,
                    data: supplier2LeadTimes,
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
                        color: themeTextColor
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
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    }
                },
                y: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)',
                        color: themeTextColor
                    }
                }
            }
        }
    });
}

function groupByMonth(data) {
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
    
    return monthlyData;
}

function generateBullwhipComparisonChart(supplier1, supplier1Data, supplier2, supplier2Data) {
    // Sort data by date
    supplier1Data.sort((a, b) => a.OrderDate - b.OrderDate);
    supplier2Data.sort((a, b) => a.OrderDate - b.OrderDate);
    
    // Group data by month
    const supplier1Monthly = {};
    const supplier2Monthly = {};
    
    supplier1Data.forEach(row => {
        const monthYear = `${row.OrderDate.toLocaleString('default', { month: 'short' })} ${row.Year}`;
        
        if (!supplier1Monthly[monthYear]) {
            supplier1Monthly[monthYear] = {
                customerDemand: [],
                orderQuantity: []
            };
        }
        
        supplier1Monthly[monthYear].customerDemand.push(row.Customer_Demand);
        supplier1Monthly[monthYear].orderQuantity.push(row.Order_Quantity);
    });
    
    supplier2Data.forEach(row => {
        const monthYear = `${row.OrderDate.toLocaleString('default', { month: 'short' })} ${row.Year}`;
        
        if (!supplier2Monthly[monthYear]) {
            supplier2Monthly[monthYear] = {
                customerDemand: [],
                orderQuantity: []
            };
        }
        
        supplier2Monthly[monthYear].customerDemand.push(row.Customer_Demand);
        supplier2Monthly[monthYear].orderQuantity.push(row.Order_Quantity);
    });
    
    // Calculate bullwhip ratios
    const allMonths = new Set([...Object.keys(supplier1Monthly), ...Object.keys(supplier2Monthly)]);
    const sortedMonths = Array.from(allMonths).sort();
    
    const supplier1Ratios = sortedMonths.map(month => {
        if (supplier1Monthly[month] && supplier1Monthly[month].customerDemand.length > 1) {
            const demandCV = calculateCV(supplier1Monthly[month].customerDemand);
            const orderCV = calculateCV(supplier1Monthly[month].orderQuantity);
            
            return demandCV > 0 ? orderCV / demandCV : null;
        }
        return null;
    });
    
    const supplier2Ratios = sortedMonths.map(month => {
        if (supplier2Monthly[month] && supplier2Monthly[month].customerDemand.length > 1) {
            const demandCV = calculateCV(supplier2Monthly[month].customerDemand);
            const orderCV = calculateCV(supplier2Monthly[month].orderQuantity);
            
            return demandCV > 0 ? orderCV / demandCV : null;
        }
        return null;
    });
    
    // Create the chart
    const ctx = document.getElementById('comparisonBullwhipChart').getContext('2d');
    
    // Destroy previous chart instance if it exists
    if (chartInstances.comparisonBullwhip) {
        chartInstances.comparisonBullwhip.destroy();
    }
    
    // Set chart colors based on current theme
    const themeIsDarkMode = document.body.classList.contains('dark-mode');
    const themeTextColor = themeIsDarkMode ? '#f8f9fa' : '#343a40';
    const themeGridColor = themeIsDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
    
    // Create new chart
    chartInstances.comparisonBullwhip = new Chart(ctx, {
        type: 'line',
        data: {
            labels: sortedMonths,
            datasets: [
                {
                    label: supplier1,
                    data: supplier1Ratios,
                    borderColor: '#4a6fa5',
                    backgroundColor: 'rgba(74, 111, 165, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: supplier2,
                    data: supplier2Ratios,
                    borderColor: '#ff7e67',
                    backgroundColor: 'rgba(255, 126, 103, 0.1)',
                    borderWidth: 2,
                    tension: 0.3,
                    fill: true
                },
                {
                    label: 'Bullwhip Threshold',
                    data: Array(sortedMonths.length).fill(1),
                    borderColor: '#28a745',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false,
                    pointRadius: 0
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
                        color: themeTextColor
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) {
                                label += ': ';
                            }
                            if (context.parsed.y !== null) {
                                label += context.parsed.y.toFixed(2);
                            }
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    }
                },
                y: {
                    grid: {
                        color: themeGridColor
                    },
                    ticks: {
                        color: themeTextColor
                    },
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Bullwhip Ratio',
                        color: themeTextColor
                    }
                }
            }
        }
    });
}

// ======= Debug Functions =======
// Enable this to use sample data for testing
function loadSampleData() {
    // Sample data format matching your CSV structure
    const sampleData = [
        {
            "Order_ID": "ORD001",
            "Supplier": "GammaCorp",
            "Order_Date": "2024-01-05",
            "Expected_Delivery_Date": "2024-01-15",
            "Actual_Delivery_Date": "2024-01-18",
            "Product_Category": "Electronics",
            "Transportation_Mode": "Air",
            "Supplier_Location": "Asia",
            "Disruption_Type": "Weather",
            "Customer_Demand": 100,
            "Order_Quantity": 120
        },
        {
            "Order_ID": "ORD002",
            "Supplier": "GammaCorp",
            "Order_Date": "2024-01-12",
            "Expected_Delivery_Date": "2024-01-22",
            "Actual_Delivery_Date": "2024-01-25",
            "Product_Category": "Electronics",
            "Transportation_Mode": "Air",
            "Supplier_Location": "Asia",
            "Disruption_Type": "None",
            "Customer_Demand": 110,
            "Order_Quantity": 130
        },
        {
            "Order_ID": "ORD011",
            "Supplier": "Alpha Supplies",
            "Order_Date": "2024-01-03",
            "Expected_Delivery_Date": "2024-01-10",
            "Actual_Delivery_Date": "2024-01-12",
            "Product_Category": "Raw Materials",
            "Transportation_Mode": "Rail",
            "Supplier_Location": "Europe",
            "Disruption_Type": "None",
            "Customer_Demand": 200,
            "Order_Quantity": 220
        },
        {
            "Order_ID": "ORD021",
            "Supplier": "BetaTech",
            "Order_Date": "2024-01-07",
            "Expected_Delivery_Date": "2024-01-22",
            "Actual_Delivery_Date": "2024-01-28",
            "Product_Category": "Machinery",
            "Transportation_Mode": "Sea",
            "Supplier_Location": "North America",
            "Disruption_Type": "Customs",
            "Customer_Demand": 150,
            "Order_Quantity": 180
        }
    ];
    
    // Process the sample data
    procurementData = preprocessData(sampleData);
    console.log("Sample data loaded:", procurementData);
    
    // Calculate and display overall metrics
    calculateOverallMetrics(procurementData);
    
    // Show analysis page
    showAnalysisPage();
    
    // Analyze the first supplier
    const firstSupplier = procurementData[0].Supplier;
    analyzeSupplier(firstSupplier);
    
    console.log("Sample data loaded successfully!");
}

// Add a debug button to the HTML
function addDebugButton() {
    const debugButton = document.createElement('button');
    debugButton.textContent = 'Load Sample Data (Debug)';
    debugButton.classList.add('debug-button');
    debugButton.addEventListener('click', loadSampleData);
    
    const uploadSection = document.getElementById('upload-section');
    uploadSection.appendChild(debugButton);
    
    // Add debug button styles
    const style = document.createElement('style');
    style.textContent = `
        .debug-button {
            background-color: #ffcc00;
            color: #333;
            border: none;
            padding: 10px 15px;
            margin-top: 20px;
            border-radius: 4px;
            cursor: pointer;
            display: block;
            width: 100%;
            max-width: 250px;
            font-weight: bold;
        }
        
        .debug-button:hover {
            background-color: #e6b800;
        }
    `;
    document.head.appendChild(style);
}
