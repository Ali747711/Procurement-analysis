// Add some sample data for demonstration purposes
const sampleData = [
    {
        Order_ID: "ORD001",
        Supplier: "SupplierA",
        Order_Date: "2023-01-05",
        Expected_Delivery_Date: "2023-01-15",
        Actual_Delivery_Date: "2023-01-18",
        Product_Category: "Electronics",
        Transportation_Mode: "Air",
        Supplier_Location: "Asia",
        Disruption_Type: "Weather",
        Customer_Demand: 85,
        Order_Quantity: 500
    },
    {
        Order_ID: "ORD002",
        Supplier: "SupplierB",
        Order_Date: "2023-01-10",
        Expected_Delivery_Date: "2023-02-10",
        Actual_Delivery_Date: "2023-02-15",
        Product_Category: "Raw Materials",
        Transportation_Mode: "Sea",
        Supplier_Location: "Europe",
        Disruption_Type: "Port Congestion",
        Customer_Demand: 70,
        Order_Quantity: 1500
    },
    {
        Order_ID: "ORD003",
        Supplier: "SupplierC",
        Order_Date: "2023-01-15",
        Expected_Delivery_Date: "2023-02-05",
        Actual_Delivery_Date: "2023-02-03",
        Product_Category: "Chemicals",
        Transportation_Mode: "Rail",
        Supplier_Location: "North America",
        Disruption_Type: "None",
        Customer_Demand: 45,
        Order_Quantity: 800
    },
    {
        Order_ID: "ORD004",
        Supplier: "SupplierA",
        Order_Date: "2023-01-20",
        Expected_Delivery_Date: "2023-01-27",
        Actual_Delivery_Date: "2023-01-28",
        Product_Category: "Electronics",
        Transportation_Mode: "Air",
        Supplier_Location: "Asia",
        Disruption_Type: "None",
        Customer_Demand: 90,
        Order_Quantity: 300
    },
    {
        Order_ID: "ORD005",
        Supplier: "SupplierD",
        Order_Date: "2023-02-01",
        Expected_Delivery_Date: "2023-02-08",
        Actual_Delivery_Date: "2023-02-08",
        Product_Category: "Furniture",
        Transportation_Mode: "Truck",
        Supplier_Location: "North America",
        Disruption_Type: "None",
        Customer_Demand: 60,
        Order_Quantity: 200
    },
    {
        Order_ID: "ORD006",
        Supplier: "SupplierB",
        Order_Date: "2023-02-05",
        Expected_Delivery_Date: "2023-03-05",
        Actual_Delivery_Date: "2023-03-15",
        Product_Category: "Raw Materials",
        Transportation_Mode: "Sea",
        Supplier_Location: "Europe",
        Disruption_Type: "Port Congestion",
        Customer_Demand: 75,
        Order_Quantity: 1800
    },
    {
        Order_ID: "ORD007",
        Supplier: "SupplierC",
        Order_Date: "2023-02-10",
        Expected_Delivery_Date: "2023-03-02",
        Actual_Delivery_Date: "2023-03-01",
        Product_Category: "Chemicals",
        Transportation_Mode: "Rail",
        Supplier_Location: "North America",
        Disruption_Type: "None",
        Customer_Demand: 50,
        Order_Quantity: 900
    },
    {
        Order_ID: "ORD008",
        Supplier: "SupplierE",
        Order_Date: "2023-02-15",
        Expected_Delivery_Date: "2023-02-25",
        Actual_Delivery_Date: "2023-03-05",
        Product_Category: "Automotive",
        Transportation_Mode: "Truck",
        Supplier_Location: "Europe",
        Disruption_Type: "Labor Strike",
        Customer_Demand: 80,
        Order_Quantity: 150
    },
    {
        Order_ID: "ORD009",
        Supplier: "SupplierA",
        Order_Date: "2023-03-01",
        Expected_Delivery_Date: "2023-03-11",
        Actual_Delivery_Date: "2023-03-13",
        Product_Category: "Electronics",
        Transportation_Mode: "Air",
        Supplier_Location: "Asia",
        Disruption_Type: "Customs Delay",
        Customer_Demand: 95,
        Order_Quantity: 600
    },
    {
        Order_ID: "ORD010",
        Supplier: "SupplierF",
        Order_Date: "2023-03-05",
        Expected_Delivery_Date: "2023-03-15",
        Actual_Delivery_Date: "2023-03-25",
        Product_Category: "Perishables",
        Transportation_Mode: "Air",
        Supplier_Location: "South America",
        Disruption_Type: "Weather",
        Customer_Demand: 70,
        Order_Quantity: 400
    }
];

// Global variables to store data and charts
let rawData = [];
let processedData = {};
let companies = [];
let charts = {};

// DOM elements
const fileInput = document.getElementById('csv-file');
const fileNameDisplay = document.getElementById('file-name');
const companySelector = document.getElementById('company-selector');
const companySelect = document.getElementById('company-select');
const analyticsSection = document.getElementById('analytics-section');
const keyMetricsContainer = document.getElementById('key-metrics');
const benchmarkSection = document.getElementById('benchmark-section');
const loader = document.getElementById('loader');
const exportButtons = document.getElementById('export-buttons');

// Add event listeners
fileInput.addEventListener('change', handleFileUpload);
companySelect.addEventListener('change', updateAnalytics);
document.getElementById('export-image').addEventListener('click', exportAsImage);
document.getElementById('export-csv').addEventListener('click', exportAnalysisCSV);
document.getElementById('demo-data-btn').addEventListener('click', loadDemoData);
document.getElementById('analyze-btn').addEventListener('click', startAnalysis);

// Function to start analysis
function startAnalysis() {
    // Check if there is data to analyze
    if (!rawData || rawData.length === 0) {
        alert('Please upload a CSV file or load demo data first.');
        return;
    }
    
    loader.style.display = 'block';
    
    // Add a slight delay to show the loader animation
    setTimeout(() => {
        try {
            // Process data and show analytics
            processData();
            showAnalytics();
            
            // Show relevant UI elements
            companySelector.style.display = 'block';
            analyticsSection.style.display = 'block';
            benchmarkSection.style.display = 'block';
            exportButtons.style.display = 'block';
            
            // Scroll to analytics
            analyticsSection.scrollIntoView({ behavior: 'smooth' });
        } catch (error) {
            console.error('Error during analysis:', error);
            alert('An error occurred during analysis. Please check the console for details.');
        } finally {
            loader.style.display = 'none';
        }
    }, 500);
}

// Handle file upload
function handleFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        alert('Please upload a CSV file. The file you selected is not a CSV.');
        return;
    }
    
    fileNameDisplay.textContent = `Selected file: ${file.name}`;
    
    // Parse CSV file
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            console.log('Parsed data:', results);
            
            // Handle errors in parsing
            if (results.errors && results.errors.length > 0) {
                console.warn('CSV parsing had errors:', results.errors);
                if (results.errors.length > 5) {
                    alert(`Warning: Found ${results.errors.length} errors while parsing the CSV. Data may be incomplete.`);
                }
            }
            
            rawData = results.data.filter(row => 
                row && 
                typeof row === 'object' && 
                Object.keys(row).length > 0);
            
            if (rawData.length === 0) {
                alert('No valid data found in the CSV file. Please ensure your CSV has valid data rows.');
                return;
            }
            
            // Extract company data if it exists
            if (rawData[0].Company) {
                companies = [...new Set(rawData.map(row => row.Company))];
                populateCompanyDropdown();
            }
            
            // Show alert that data is ready for analysis
            alert('CSV data loaded successfully! Click "Start Analysis" to process the data.');
        },
        error: function(error) {
            console.error('Error parsing CSV:', error);
            alert('Error parsing the CSV file. Please check the format.');
        }
    });
}

// Function to load demo data
function loadDemoData() {
    // Use the sample data defined at the top of the script
    rawData = sampleData;
    
    // Extract unique company if it exists
    if (rawData[0].Company) {
        companies = [...new Set(rawData.map(row => row.Company))];
        populateCompanyDropdown();
    }
    
    // Display confirmation
    fileNameDisplay.textContent = 'Using demo data';
    
    // Show alert that data is ready for analysis
    alert('Demo data loaded successfully! Click "Start Analysis" to process the data.');
}

// Populate company dropdown
function populateCompanyDropdown() {
    // Clear previous options except the first one
    while (companySelect.options.length > 1) {
        companySelect.remove(1);
    }
    
    // Add company options
    companies.forEach(company => {
        const option = document.createElement('option');
        option.value = company;
        option.textContent = company;
        companySelect.appendChild(option);
    });
}

// Process data for analysis
function processData() {
    const selectedCompany = companySelect.value;
    let filteredData = rawData.filter(row => 
        row && 
        typeof row === 'object' && 
        row.Order_Date && 
        row.Actual_Delivery_Date);
    
    // Calculate lead time and delay for each row
    filteredData.forEach(row => {
        // Calculate lead time as the difference between actual delivery and order date
        try {
            const orderDate = new Date(row.Order_Date);
            const deliveryDate = new Date(row.Actual_Delivery_Date);
            row.LeadTimeDays = Math.round((deliveryDate - orderDate) / (1000 * 60 * 60 * 24));
            
            // Calculate delay as the difference between actual and expected delivery
            const expectedDate = new Date(row.Expected_Delivery_Date);
            row.DelayDays = Math.round((deliveryDate - expectedDate) / (1000 * 60 * 60 * 24));
            
            // Check if there was a delay
            row.IsDelayed = row.DelayDays > 0;
        } catch (e) {
            console.error('Error calculating dates for row:', row);
        }
    });
    
    // Filter out rows with invalid dates
    filteredData = filteredData.filter(row => 
        !isNaN(row.LeadTimeDays) && 
        row.LeadTimeDays >= 0 && 
        !isNaN(row.DelayDays));
    
    // Filter by selected company if not "all"
    if (selectedCompany !== 'all') {
        filteredData = filteredData.filter(row => row.Company === selectedCompany);
    }
    
    // Process supplier data
    const supplierData = processSupplierData(filteredData);
    
    // Process transportation data
    const transportationData = processTransportationData(filteredData);
    
    // Process monthly trends
    const trendsData = processTrendsData(filteredData);
    
    // Process disruption data
    const disruptionData = processDisruptionData(filteredData);
    
    // Process category data
    const categoryData = processCategoryData(filteredData);
    
    // Process correlation data
    const correlationData = processCorrelationData(filteredData);
    
    // Process benchmark data
    const benchmarkData = processBenchmarkData();
    
    // Store processed data
    processedData = {
        supplierData,
        transportationData,
        trendsData,
        disruptionData,
        categoryData,
        correlationData,
        benchmarkData,
        keyMetrics: calculateKeyMetrics(filteredData, supplierData, transportationData, disruptionData, categoryData)
    };
}

// Process supplier data
function processSupplierData(data) {
    const suppliers = {};
    
    // Group by supplier
    data.forEach(row => {
        if (!row.Supplier) return;
        
        if (!suppliers[row.Supplier]) {
            suppliers[row.Supplier] = {
                leadTimes: [],
                delays: 0,
                totalOrders: 0,
                locations: new Set()
            };
        }
        
        suppliers[row.Supplier].leadTimes.push(row.LeadTimeDays);
        suppliers[row.Supplier].totalOrders++;
        
        // Count delays (when actual delivery is later than expected)
        if (row.IsDelayed) {
            suppliers[row.Supplier].delays++;
        }
        
        // Track supplier locations
        if (row.Supplier_Location) {
            suppliers[row.Supplier].locations.add(row.Supplier_Location);
        }
    });
    
    // Calculate averages and variations
    Object.keys(suppliers).forEach(supplier => {
        const leadTimes = suppliers[supplier].leadTimes;
        suppliers[supplier].avgLeadTime = average(leadTimes);
        suppliers[supplier].variation = standardDeviation(leadTimes);
        suppliers[supplier].delayFrequency = suppliers[supplier].delays / suppliers[supplier].totalOrders;
        
        // Convert Set to Array for locations
        suppliers[supplier].locations = Array.from(suppliers[supplier].locations);
    });
    
    return suppliers;
}

// Process transportation data
function processTransportationData(data) {
    const transportModes = {};
    
    // Group by transportation mode
    data.forEach(row => {
        if (!row.Transportation_Mode) return;
        
        if (!transportModes[row.Transportation_Mode]) {
            transportModes[row.Transportation_Mode] = {
                leadTimes: [],
                delays: 0,
                totalShipments: 0,
                byLocation: {}
            };
        }
        
        transportModes[row.Transportation_Mode].leadTimes.push(row.LeadTimeDays);
        transportModes[row.Transportation_Mode].totalShipments++;
        
        // Count delays
        if (row.IsDelayed) {
            transportModes[row.Transportation_Mode].delays++;
        }
        
        // Track by supplier location
        if (row.Supplier_Location) {
            if (!transportModes[row.Transportation_Mode].byLocation[row.Supplier_Location]) {
                transportModes[row.Transportation_Mode].byLocation[row.Supplier_Location] = {
                    leadTimes: [],
                    count: 0
                };
            }
            
            transportModes[row.Transportation_Mode].byLocation[row.Supplier_Location].leadTimes.push(row.LeadTimeDays);
            transportModes[row.Transportation_Mode].byLocation[row.Supplier_Location].count++;
        }
    });
    
    // Calculate averages and delay frequencies
    Object.keys(transportModes).forEach(mode => {
        transportModes[mode].avgLeadTime = average(transportModes[mode].leadTimes);
        transportModes[mode].delayFrequency = transportModes[mode].delays / transportModes[mode].totalShipments;
        
        // Calculate averages by location
        Object.keys(transportModes[mode].byLocation).forEach(location => {
            transportModes[mode].byLocation[location].avgLeadTime = 
                average(transportModes[mode].byLocation[location].leadTimes);
        });
    });
    
    return transportModes;
}

// Process monthly trends data
function processTrendsData(data) {
    const months = {};
    
    // Group by month
    data.forEach(row => {
        if (!row.Order_Date) return;
        
        // Extract month from date (assuming date format is MM/DD/YYYY or YYYY-MM-DD)
        let date;
        try {
            date = new Date(row.Order_Date);
            if (isNaN(date.getTime())) return; // Skip invalid dates
        } catch (e) {
            return; // Skip invalid dates
        }
        
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        
        if (!months[monthKey]) {
            months[monthKey] = {
                leadTimes: [],
                delays: 0,
                totalOrders: 0,
                orderQuantities: [],
                customerDemands: []
            };
        }
        
        months[monthKey].leadTimes.push(row.LeadTimeDays);
        months[monthKey].totalOrders++;
        
        // Count delays
        if (row.IsDelayed) {
            months[monthKey].delays++;
        }
        
        // Track order quantities and customer demands
        if (row.Order_Quantity) {
            months[monthKey].orderQuantities.push(row.Order_Quantity);
        }
        
        if (row.Customer_Demand) {
            months[monthKey].customerDemands.push(row.Customer_Demand);
        }
    });
    
    // Calculate averages and delay percentages
    Object.keys(months).forEach(month => {
        // Process monthly trends data (continuing from where we left off)
        months[month].avgLeadTime = average(months[month].leadTimes);
        months[month].delayPercentage = (months[month].delays / months[month].totalOrders) * 100;
        months[month].avgOrderQuantity = average(months[month].orderQuantities);
        months[month].avgCustomerDemand = average(months[month].customerDemands);
    });
    
    // Sort by month
    const sortedMonths = Object.keys(months).sort();
    
    return {
        months: sortedMonths,
        avgLeadTimes: sortedMonths.map(month => months[month].avgLeadTime),
        delayPercentages: sortedMonths.map(month => months[month].delayPercentage),
        avgOrderQuantities: sortedMonths.map(month => months[month].avgOrderQuantity),
        avgCustomerDemands: sortedMonths.map(month => months[month].avgCustomerDemand)
    };
}

// Process disruption data
function processDisruptionData(data) {
    const disruptions = {};
    
    // Group by disruption type
    data.forEach(row => {
        if (!row.Disruption_Type || row.Disruption_Type === 'None') return;
        
        if (!disruptions[row.Disruption_Type]) {
            disruptions[row.Disruption_Type] = {
                leadTimes: [],
                delayDays: [],
                count: 0,
                bySupplier: {},
                byTransportMode: {}
            };
        }
        
        disruptions[row.Disruption_Type].leadTimes.push(row.LeadTimeDays);
        disruptions[row.Disruption_Type].delayDays.push(row.DelayDays);
        disruptions[row.Disruption_Type].count++;
        
        // Track by supplier
        if (row.Supplier) {
            if (!disruptions[row.Disruption_Type].bySupplier[row.Supplier]) {
                disruptions[row.Disruption_Type].bySupplier[row.Supplier] = 0;
            }
            disruptions[row.Disruption_Type].bySupplier[row.Supplier]++;
        }
        
        // Track by transportation mode
        if (row.Transportation_Mode) {
            if (!disruptions[row.Disruption_Type].byTransportMode[row.Transportation_Mode]) {
                disruptions[row.Disruption_Type].byTransportMode[row.Transportation_Mode] = 0;
            }
            disruptions[row.Disruption_Type].byTransportMode[row.Transportation_Mode]++;
        }
    });
    
    // Calculate average lead times and delay days
    Object.keys(disruptions).forEach(type => {
        disruptions[type].avgLeadTime = average(disruptions[type].leadTimes);
        disruptions[type].avgDelayDays = average(disruptions[type].delayDays);
        
        // Find most affected supplier and transport mode
        disruptions[type].mostAffectedSupplier = Object.entries(disruptions[type].bySupplier)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
            
        disruptions[type].mostAffectedTransportMode = Object.entries(disruptions[type].byTransportMode)
            .sort((a, b) => b[1] - a[1])[0]?.[0] || 'Unknown';
    });
    
    return disruptions;
}

// Process category data
function processCategoryData(data) {
    const categories = {};
    
    // Group by product category
    data.forEach(row => {
        if (!row.Product_Category) return;
        
        if (!categories[row.Product_Category]) {
            categories[row.Product_Category] = {
                leadTimes: [],
                delays: 0,
                totalOrders: 0,
                orderQuantities: [],
                bySupplier: {}
            };
        }
        
        categories[row.Product_Category].leadTimes.push(row.LeadTimeDays);
        categories[row.Product_Category].totalOrders++;
        
        // Count delays
        if (row.IsDelayed) {
            categories[row.Product_Category].delays++;
        }
        
        // Track order quantities
        if (row.Order_Quantity) {
            categories[row.Product_Category].orderQuantities.push(row.Order_Quantity);
        }
        
        // Track by supplier
        if (row.Supplier) {
            if (!categories[row.Product_Category].bySupplier[row.Supplier]) {
                categories[row.Product_Category].bySupplier[row.Supplier] = {
                    leadTimes: [],
                    count: 0
                };
            }
            
            categories[row.Product_Category].bySupplier[row.Supplier].leadTimes.push(row.LeadTimeDays);
            categories[row.Product_Category].bySupplier[row.Supplier].count++;
        }
    });
    
    // Calculate average lead times, delay percentages, and best supplier for each category
    Object.keys(categories).forEach(category => {
        categories[category].avgLeadTime = average(categories[category].leadTimes);
        categories[category].delayPercentage = (categories[category].delays / categories[category].totalOrders) * 100;
        categories[category].avgOrderQuantity = average(categories[category].orderQuantities);
        
        // Find best supplier (lowest average lead time)
        let bestSupplier = null;
        let bestLeadTime = Infinity;
        
        Object.entries(categories[category].bySupplier).forEach(([supplier, data]) => {
            if (data.leadTimes.length >= 3) { // Only consider suppliers with enough data
                const avgLeadTime = average(data.leadTimes);
                if (avgLeadTime < bestLeadTime) {
                    bestLeadTime = avgLeadTime;
                    bestSupplier = supplier;
                }
            }
        });
        
        categories[category].bestSupplier = bestSupplier;
        categories[category].bestLeadTime = bestLeadTime !== Infinity ? bestLeadTime : null;
    });
    
    return categories;
}

// Process correlation data
function processCorrelationData(data) {
    // Analyze different correlation pairs
    
    // 1. Order Quantity vs Lead Time
    const quantityLeadTime = analyzeCorrelation(
        data,
        'Order_Quantity',
        'LeadTimeDays',
        'Order Quantity vs Lead Time'
    );
    
    // 2. Customer Demand vs Lead Time
    const demandLeadTime = analyzeCorrelation(
        data,
        'Customer_Demand',
        'LeadTimeDays',
        'Customer Demand vs Lead Time'
    );
    
    // 3. Order Quantity vs Delay Days
    const quantityDelay = analyzeCorrelation(
        data,
        'Order_Quantity',
        'DelayDays',
        'Order Quantity vs Delay'
    );
    
    return {
        quantityLeadTime,
        demandLeadTime,
        quantityDelay,
        // Use the primary correlation for backward compatibility
        orderQuantities: quantityLeadTime.xValues,
        leadTimes: quantityLeadTime.yValues,
        correlation: quantityLeadTime.correlation
    };
}

// Helper function to analyze correlation between two variables
function analyzeCorrelation(data, xField, yField, label) {
    // Filter out rows with missing data
    const validData = data.filter(row => 
        row[xField] !== undefined && 
        row[xField] !== null &&
        !isNaN(row[xField]) &&
        row[yField] !== undefined && 
        row[yField] !== null &&
        !isNaN(row[yField]));
    
    // Extract values
    const xValues = validData.map(row => row[xField]);
    const yValues = validData.map(row => row[yField]);
    
    // Calculate correlation coefficient
    const correlation = calculateCorrelation(xValues, yValues);
    
    return {
        xField,
        yField,
        label,
        xValues,
        yValues,
        correlation
    };
}

// Process benchmark data
function processBenchmarkData() {
    if (companies.length <= 1) return null;
    
    const companyLeadTimes = {};
    
    // Calculate average lead time for each company
    companies.forEach(company => {
        const companyData = rawData.filter(row => row.Company === company);
        const leadTimes = companyData.map(row => row.LeadTimeDays);
        companyLeadTimes[company] = average(leadTimes);
    });
    
    // Calculate industry average
    const industryAvg = average(Object.values(companyLeadTimes));
    
    return {
        companyLeadTimes,
        industryAvg
    };
}

// Calculate key metrics
function calculateKeyMetrics(data, supplierData, transportationData, disruptionData, categoryData) {
    // Find supplier with highest and lowest lead time
    let highestSupplier = null;
    let lowestSupplier = null;
    let highestLeadTime = -Infinity;
    let lowestLeadTime = Infinity;
    
    Object.entries(supplierData).forEach(([supplier, info]) => {
        if (info.avgLeadTime > highestLeadTime) {
            highestLeadTime = info.avgLeadTime;
            highestSupplier = supplier;
        }
        if (info.avgLeadTime < lowestLeadTime) {
            lowestLeadTime = info.avgLeadTime;
            lowestSupplier = supplier;
        }
    });
    
    // Find most consistent supplier (least variation)
    let mostConsistentSupplier = null;
    let lowestVariation = Infinity;
    
    Object.entries(supplierData).forEach(([supplier, info]) => {
        if (info.variation < lowestVariation && info.leadTimes.length >= 3) {
            lowestVariation = info.variation;
            mostConsistentSupplier = supplier;
        }
    });
    
    // Find supplier with highest delay frequency
    let highestDelaySupplier = null;
    let highestDelayFreq = -Infinity;
    
    Object.entries(supplierData).forEach(([supplier, info]) => {
        if (info.delayFrequency > highestDelayFreq) {
            highestDelayFreq = info.delayFrequency;
            highestDelaySupplier = supplier;
        }
    });
    
    // Find fastest and slowest transportation mode
    let fastestMode = null;
    let slowestMode = null;
    let fastestTime = Infinity;
    let slowestTime = -Infinity;
    
    Object.entries(transportationData).forEach(([mode, info]) => {
        if (info.avgLeadTime < fastestTime) {
            fastestTime = info.avgLeadTime;
            fastestMode = mode;
        }
        if (info.avgLeadTime > slowestTime) {
            slowestTime = info.avgLeadTime;
            slowestMode = mode;
        }
    });
    
    // Find transportation mode with highest delay frequency
    let highestDelayMode = null;
    let highestModeDelayFreq = -Infinity;
    
    Object.entries(transportationData).forEach(([mode, info]) => {
        if (info.delayFrequency > highestModeDelayFreq) {
            highestModeDelayFreq = info.delayFrequency;
            highestDelayMode = mode;
        }
    });
    
    // Find product category with shortest and longest lead times
    let shortestCategory = null;
    let longestCategory = null;
    let shortestTime = Infinity;
    let longestTime = -Infinity;
    
    Object.entries(categoryData).forEach(([category, info]) => {
        if (info.avgLeadTime < shortestTime) {
            shortestTime = info.avgLeadTime;
            shortestCategory = category;
        }
        if (info.avgLeadTime > longestTime) {
            longestTime = info.avgLeadTime;
            longestCategory = category;
        }
    });
    
    // Find disruption causing longest delays
    let worstDisruption = null;
    let longestDisruptionDelay = -Infinity;
    
    Object.entries(disruptionData).forEach(([type, info]) => {
        if (info.avgLeadTime > longestDisruptionDelay) {
            longestDisruptionDelay = info.avgLeadTime;
            worstDisruption = type;
        }
    });
    
    // Calculate average lead time and delay
    const allLeadTimes = data.map(row => row.LeadTimeDays);
    const avgLeadTime = average(allLeadTimes);
    
    const allDelays = data.map(row => row.DelayDays).filter(d => d !== undefined && d !== null);
    const avgDelay = average(allDelays);
    
    const onTimeDeliveries = data.filter(row => !row.IsDelayed).length;
    const onTimePercentage = (onTimeDeliveries / data.length) * 100;
    
    return {
        highestSupplier,
        highestLeadTime: highestLeadTime ? highestLeadTime.toFixed(1) : 'N/A',
        lowestSupplier,
        lowestLeadTime: lowestLeadTime !== Infinity ? lowestLeadTime.toFixed(1) : 'N/A',
        mostConsistentSupplier,
        highestDelaySupplier,
        highestDelayFreq: highestDelayFreq ? (highestDelayFreq * 100).toFixed(1) + '%' : 'N/A',
        fastestMode,
        fastestTime: fastestTime !== Infinity ? fastestTime.toFixed(1) : 'N/A',
        slowestMode,
        slowestTime: slowestTime ? slowestTime.toFixed(1) : 'N/A',
        highestDelayMode,
        shortestCategory,
        shortestTime: shortestTime !== Infinity ? shortestTime.toFixed(1) : 'N/A',
        longestCategory,
        longestTime: longestTime ? longestTime.toFixed(1) : 'N/A',
        avgLeadTime: avgLeadTime ? avgLeadTime.toFixed(1) : 'N/A',
        avgDelay: avgDelay ? avgDelay.toFixed(1) : 'N/A',
        onTimePercentage: onTimePercentage ? onTimePercentage.toFixed(1) + '%' : 'N/A',
        worstDisruption
    };
}

// Show analytics
function showAnalytics() {
    displayKeyMetrics();
    createCharts();
}

// Update analytics based on company selection
function updateAnalytics() {
    // Destroy existing charts
    Object.values(charts).forEach(chart => {
        if (chart) chart.destroy();
    });
    
    // Process data and update visualizations
    try {
        processData();
        displayKeyMetrics();
        createCharts();
    } catch (error) {
        console.error('Error updating analytics:', error);
        alert('An error occurred while updating the visualizations. Please check the console for details.');
    }
    
    // Show/hide benchmark section
    if (companySelect.value !== 'all' && companies.length > 1) {
        benchmarkSection.style.display = 'block';
    } else {
        benchmarkSection.style.display = 'none';
    }
}

// Display key metrics
function displayKeyMetrics() {
    const metrics = processedData.keyMetrics;
    keyMetricsContainer.innerHTML = '';
    
    // Create metric cards
    createMetricCard('Average Lead Time', `${metrics.avgLeadTime} days`);
    createMetricCard('On-Time Delivery', metrics.onTimePercentage);
    createMetricCard('Average Delay', `${metrics.avgDelay} days`);
    createMetricCard('Best Supplier', `${metrics.lowestSupplier} (${metrics.lowestLeadTime} days)`);
    createMetricCard('Most Consistent Supplier', metrics.mostConsistentSupplier);
    createMetricCard('Fastest Transportation', `${metrics.fastestMode} (${metrics.fastestTime} days)`);
    
    if (metrics.worstDisruption) {
        createMetricCard('Most Impactful Disruption', metrics.worstDisruption);
    }
    
    createMetricCard('Best Product Category', `${metrics.shortestCategory} (${metrics.shortestTime} days)`);
    
    // Add correlation metric if available
    if (processedData.correlationData && processedData.correlationData.quantityLeadTime) {
        const correlation = processedData.correlationData.quantityLeadTime.correlation;
        let correlationDesc = 'No correlation';
        
        if (correlation > 0.7) correlationDesc = 'Strong positive';
        else if (correlation > 0.4) correlationDesc = 'Moderate positive';
        else if (correlation > 0.1) correlationDesc = 'Weak positive';
        else if (correlation < -0.7) correlationDesc = 'Strong negative';
        else if (correlation < -0.4) correlationDesc = 'Moderate negative';
        else if (correlation < -0.1) correlationDesc = 'Weak negative';
        
        createMetricCard('Order Quantity & Lead Time', `${correlationDesc} (${correlation.toFixed(2)})`);
    }
}

// Create metric card
function createMetricCard(title, value) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'metric-title';
    titleElement.textContent = title;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'metric-value';
    valueElement.textContent = value;
    
    card.appendChild(titleElement);
    card.appendChild(valueElement);
    keyMetricsContainer.appendChild(card);
}

// Create charts
function createCharts() {
    createSupplierChart();
    createTransportationChart();
    createTrendChart();
    createDisruptionChart();
    createCategoryChart();
    createCorrelationChart();
    createLocationChart();
    createPredictionChart();
    
    if (companySelect.value !== 'all' && companies.length > 1) {
        createBenchmarkChart();
    }
}

// Create supplier chart
function createSupplierChart() {
    const ctx = document.getElementById('supplier-chart').getContext('2d');
    const suppliers = Object.keys(processedData.supplierData);
    const leadTimes = suppliers.map(supplier => processedData.supplierData[supplier].avgLeadTime);
    const variations = suppliers.map(supplier => processedData.supplierData[supplier].variation);
    
    // Sort data by lead time
    const indices = leadTimes.map((_, i) => i);
    indices.sort((a, b) => leadTimes[a] - leadTimes[b]);
    
    const sortedSuppliers = indices.map(i => suppliers[i]);
    const sortedLeadTimes = indices.map(i => leadTimes[i]);
    const sortedVariations = indices.map(i => variations[i]);
    
    // Generate colors from blue (good) to red (bad)
    const leadTimeColors = sortedLeadTimes.map((time, i) => {
        const normalizedValue = i / (sortedLeadTimes.length - 1);
        return `rgba(${Math.round(normalizedValue * 255)}, ${Math.round((1 - normalizedValue) * 100)}, ${Math.round((1 - normalizedValue) * 255)}, 0.7)`;
    });
    
    // Create chart
    charts.supplier = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedSuppliers,
            datasets: [
                {
                    label: 'Average Lead Time (days)',
                    data: sortedLeadTimes,
                    backgroundColor: leadTimeColors,
                    borderColor: leadTimeColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                },
                {
                    label: 'Variation (Standard Deviation)',
                    data: sortedVariations,
                    type: 'line',
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)',
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Variation (SD)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                },
                x: {
                    ticks: {
                        autoSkip: true,
                        maxRotation: 45,
                        minRotation: 45
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const supplier = context.label;
                            const supplierData = processedData.supplierData[supplier];
                            let result = `Delay Frequency: ${(supplierData.delayFrequency * 100).toFixed(1)}%`;
                            
                            // Add location information if available
                            if (supplierData.locations && supplierData.locations.length > 0) {
                                result += `\nLocation: ${supplierData.locations.join(', ')}`;
                            }
                            
                            return result;
                        }
                    }
                }
            }
        }
    });
}

// Create transportation chart
function createTransportationChart() {
    const ctx = document.getElementById('transportation-chart').getContext('2d');
    const modes = Object.keys(processedData.transportationData);
    const leadTimes = modes.map(mode => processedData.transportationData[mode].avgLeadTime);
    const delayFreqs = modes.map(mode => processedData.transportationData[mode].delayFrequency * 100);
    
    // Generate colors
    const barColors = modes.map((_, i) => {
        const hue = 200 + (i * 30) % 160;
        return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
    
    // Create chart
    charts.transportation = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: modes,
            datasets: [
                {
                    label: 'Average Lead Time (days)',
                    data: leadTimes,
                    backgroundColor: barColors,
                    borderColor: barColors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                },
                {
                    label: 'Delay Frequency (%)',
                    data: delayFreqs,
                    type: 'line',
                    fill: false,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    pointBackgroundColor: 'rgba(255, 159, 64, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 159, 64, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Delay Frequency (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            }
        }
    });
}

// Create trend chart
function createTrendChart() {
    const ctx = document.getElementById('trend-chart').getContext('2d');
    const trendsData = processedData.trendsData;
    
    // Format month labels (YYYY-MM to MMM YYYY)
    const formattedMonths = trendsData.months.map(month => {
        const parts = month.split('-');
        const date = new Date(parts[0], parts[1] - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Create chart
    charts.trend = new Chart(ctx, {
        type: 'line',
        data: {
            labels: formattedMonths,
            datasets: [
                {
                    label: 'Average Lead Time (days)',
                    data: trendsData.avgLeadTimes,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true
                },
                {
                    label: 'Delay Percentage (%)',
                    data: trendsData.delayPercentages,
                    borderColor: 'rgba(153, 102, 255, 1)',
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Delay Percentage (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterTitle: function(context) {
                            const index = context[0].dataIndex;
                            const orderQuantity = trendsData.avgOrderQuantities[index];
                            const customerDemand = trendsData.avgCustomerDemands[index];
                            
                            let result = '';
                            if (orderQuantity) {
                                result += `\nAvg Order Quantity: ${orderQuantity.toFixed(0)}`;
                            }
                            if (customerDemand) {
                                result += `\nAvg Customer Demand: ${customerDemand.toFixed(0)}`;
                            }
                            
                            return result;
                        }
                    }
                }
            }
        }
    });
}

// Create disruption chart
function createDisruptionChart() {
    const ctx = document.getElementById('disruption-chart').getContext('2d');
    const disruptions = processedData.disruptionData;
    const types = Object.keys(disruptions);
    
    if (types.length === 0) {
        // No disruption data, display a message
        const container = document.getElementById('disruption-chart').parentNode;
        container.innerHTML = '<h3 class="chart-title">Disruption Impact Analysis</h3><div style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; color: #888;">No disruption data available</div>';
        return;
    }
    
    const avgLeadTimes = types.map(type => disruptions[type].avgLeadTime);
    const avgDelays = types.map(type => disruptions[type].avgDelayDays || 0);
    const counts = types.map(type => disruptions[type].count);
    
    // Sort data by average delay
    const indices = avgDelays.map((_, i) => i);
    indices.sort((a, b) => avgDelays[b] - avgDelays[a]);
    
    const sortedTypes = indices.map(i => types[i]);
    const sortedLeadTimes = indices.map(i => avgLeadTimes[i]);
    const sortedDelays = indices.map(i => avgDelays[i]);
    const sortedCounts = indices.map(i => counts[i]);
    
    // Generate colors from red (bad) to yellow (warning)
    const colors = sortedDelays.map((_, i) => {
        const normalizedValue = i / (sortedDelays.length - 1);
        return `rgba(255, ${Math.round(normalizedValue * 255)}, 0, 0.7)`;
    });
    
    // Create chart
    charts.disruption = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedTypes,
            datasets: [
                {
                    label: 'Average Delay (days)',
                    data: sortedDelays,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                },
                {
                    label: 'Frequency',
                    data: sortedCounts,
                    type: 'line',
                    fill: false,
                    backgroundColor: 'rgba(54, 162, 235, 0.7)',
                    borderColor: 'rgba(54, 162, 235, 1)',
                    pointRadius: 5,
                    pointHoverRadius: 7,
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Average Delay (days)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Frequency'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const type = context.label;
                            const disruption = disruptions[type];
                            let result = `Lead Time: ${disruption.avgLeadTime.toFixed(1)} days`;
                            
                            if (disruption.mostAffectedSupplier) {
                                result += `\nMost Affected Supplier: ${disruption.mostAffectedSupplier}`;
                            }
                            
                            if (disruption.mostAffectedTransportMode) {
                                result += `\nMost Affected Transport: ${disruption.mostAffectedTransportMode}`;
                            }
                            
                            return result;
                        }
                    }
                }
            }
        }
    });
}

// Create category chart
function createCategoryChart() {
    const ctx = document.getElementById('category-chart').getContext('2d');
    const categories = processedData.categoryData;
    const categoryNames = Object.keys(categories);
    const avgLeadTimes = categoryNames.map(cat => categories[cat].avgLeadTime);
    
    // Sort data by lead time
    const indices = avgLeadTimes.map((_, i) => i);
    indices.sort((a, b) => avgLeadTimes[a] - avgLeadTimes[b]);
    
    const sortedCategories = indices.map(i => categoryNames[i]);
    const sortedLeadTimes = indices.map(i => avgLeadTimes[i]);
    
    // Generate colors
    const colors = sortedLeadTimes.map((_, i) => {
        const hue = 120 + (i * 200 / sortedLeadTimes.length);
        return `hsla(${hue}, 70%, 60%, 0.7)`;
    });
    
    // Create chart
    charts.category = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedCategories,
            datasets: [{
                label: 'Average Lead Time (days)',
                data: sortedLeadTimes,
                backgroundColor: colors,
                borderColor: colors.map(color => color.replace('0.7', '1')),
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            indexAxis: 'y',
            scales: {
                x: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                }
            }
        }
    });
}

// Create correlation chart
function createCorrelationChart() {
    const ctx = document.getElementById('correlation-chart').getContext('2d');
    const correlationData = processedData.correlationData;
    
    // Get primary correlation data
    const primaryCorrelation = correlationData.quantityLeadTime;
    
    // Create chart
    charts.correlation = new Chart(ctx, {
        type: 'scatter',
        data: {
            datasets: [{
                label: primaryCorrelation.label,
                data: primaryCorrelation.xValues.map((qty, i) => ({
                    x: qty,
                    y: primaryCorrelation.yValues[i]
                })),
                backgroundColor: 'rgba(54, 162, 235, 0.5)',
                borderColor: 'rgba(54, 162, 235, 1)',
                pointRadius: 6,
                pointHoverRadius: 8
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Order Quantity'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `Quantity: ${context.parsed.x}, Lead Time: ${context.parsed.y} days`;
                        },
                        afterFooter: function() {
                            return `Correlation: ${primaryCorrelation.correlation.toFixed(2)}`;
                        }
                    }
                }
            }
        }
    });
    
    // Add correlation selector
    const selectorContainer = document.createElement('div');
    selectorContainer.style.textAlign = 'center';
    selectorContainer.style.marginTop = '10px';
    
    const selector = document.createElement('select');
    selector.id = 'correlation-selector';
    selector.classList.add('correlation-selector');
    
    // Add options
    const options = [
        { value: 'quantityLeadTime', text: 'Order Quantity vs Lead Time' },
        { value: 'demandLeadTime', text: 'Customer Demand vs Lead Time' },
        { value: 'quantityDelay', text: 'Order Quantity vs Delay' }
    ];
    
    options.forEach(option => {
        const optElement = document.createElement('option');
        optElement.value = option.value;
        optElement.textContent = option.text;
        selector.appendChild(optElement);
    });
    
    selectorContainer.appendChild(selector);
    
    // Add to DOM
    const chartContainer = document.getElementById('correlation-chart').parentNode;
    chartContainer.appendChild(selectorContainer);
    
    // Add event listener
    selector.addEventListener('change', function() {
        const selectedCorrelation = correlationData[this.value];
        
        // Update chart data
        charts.correlation.data.datasets[0].label = selectedCorrelation.label;
        charts.correlation.data.datasets[0].data = selectedCorrelation.xValues.map((x, i) => ({
            x: x,
            y: selectedCorrelation.yValues[i]
        }));
        
        // Update x-axis label
        charts.correlation.options.scales.x.title.text = selectedCorrelation.xField === 'Order_Quantity' ? 
            'Order Quantity' : 'Customer Demand';
        
        // Update y-axis label
        charts.correlation.options.scales.y.title.text = selectedCorrelation.yField === 'LeadTimeDays' ? 
            'Lead Time (days)' : 'Delay (days)';
        
        // Update tooltip
        charts.correlation.options.plugins.tooltip.callbacks.label = function(context) {
            const xLabel = selectedCorrelation.xField === 'Order_Quantity' ? 'Quantity' : 'Demand';
            const yLabel = selectedCorrelation.yField === 'LeadTimeDays' ? 'Lead Time' : 'Delay';
            return `${xLabel}: ${context.parsed.x}, ${yLabel}: ${context.parsed.y} days`;
        };
        
        // Update correlation in footer
        charts.correlation.options.plugins.tooltip.callbacks.afterFooter = function() {
            return `Correlation: ${selectedCorrelation.correlation.toFixed(2)}`;
        };
        
        charts.correlation.update();
    });
}

// Create location chart
function createLocationChart() {
    const ctx = document.getElementById('location-chart').getContext('2d');
    
    // Extract supplier location data
    const locationData = {};
    
    // Process for each supplier
    Object.entries(processedData.supplierData).forEach(([supplier, data]) => {
        if (data.locations && data.locations.length > 0) {
            data.locations.forEach(location => {
                if (!locationData[location]) {
                    locationData[location] = {
                        leadTimes: [],
                        delays: 0,
                        totalOrders: 0,
                        suppliers: new Set()
                    };
                }
                
                locationData[location].leadTimes.push(...data.leadTimes);
                locationData[location].suppliers.add(supplier);
            });
        }
    });
    
    // Also process raw data for locations
    rawData.forEach(row => {
        if (row.Supplier_Location) {
            if (!locationData[row.Supplier_Location]) {
                locationData[row.Supplier_Location] = {
                    leadTimes: [],
                    delays: 0,
                    totalOrders: 0,
                    suppliers: new Set()
                };
            }
            
            if (row.LeadTimeDays !== undefined) {
                locationData[row.Supplier_Location].totalOrders++;
            }
            
            if (row.IsDelayed) {
                locationData[row.Supplier_Location].delays++;
            }
            
            if (row.Supplier) {
                locationData[row.Supplier_Location].suppliers.add(row.Supplier);
            }
        }
    });
    
    // Calculate averages
    Object.keys(locationData).forEach(location => {
        locationData[location].avgLeadTime = average(locationData[location].leadTimes);
        locationData[location].delayPercentage = 
            locationData[location].totalOrders > 0 ? 
            (locationData[location].delays / locationData[location].totalOrders) * 100 : 0;
        locationData[location].supplierCount = locationData[location].suppliers.size;
    });
    
    // Prepare chart data
    const locations = Object.keys(locationData);
    
    if (locations.length === 0) {
        // No location data, display a message
        const container = document.getElementById('location-chart').parentNode;
        container.innerHTML = '<h3 class="chart-title">Supplier Location Analysis</h3><div style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; color: #888;">No location data available</div>';
        return;
    }
    
    const avgLeadTimes = locations.map(loc => locationData[loc].avgLeadTime);
    const delayPercentages = locations.map(loc => locationData[loc].delayPercentage);
    const supplierCounts = locations.map(loc => locationData[loc].supplierCount);
    
    // Sort by lead time
    const indices = avgLeadTimes.map((_, i) => i);
    indices.sort((a, b) => avgLeadTimes[a] - avgLeadTimes[b]);
    
    const sortedLocations = indices.map(i => locations[i]);
    const sortedLeadTimes = indices.map(i => avgLeadTimes[i]);
    const sortedDelayPercentages = indices.map(i => delayPercentages[i]);
    const sortedSupplierCounts = indices.map(i => supplierCounts[i]);
    
    // Generate location colors (using geographic-ish colors)
    const locationColors = {
        'Asia': 'rgba(255, 99, 132, 0.7)',
        'Europe': 'rgba(54, 162, 235, 0.7)',
        'North America': 'rgba(255, 206, 86, 0.7)',
        'South America': 'rgba(75, 192, 192, 0.7)',
        'Africa': 'rgba(153, 102, 255, 0.7)',
        'Australia': 'rgba(255, 159, 64, 0.7)'
    };
    
    const colors = sortedLocations.map(loc => {
        return locationColors[loc] || `hsl(${Math.random() * 360}, 70%, 60%, 0.7)`;
    });
    
    // Create chart
    charts.location = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: sortedLocations,
            datasets: [
                {
                    label: 'Average Lead Time (days)',
                    data: sortedLeadTimes,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('0.7', '1')),
                    borderWidth: 1
                },
                {
                    label: 'Delay Percentage (%)',
                    data: sortedDelayPercentages,
                    type: 'line',
                    fill: false,
                    borderColor: 'rgba(255, 99, 132, 1)',
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    yAxisID: 'y1'
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                },
                y1: {
                    position: 'right',
                    beginAtZero: true,
                    max: 100,
                    title: {
                        display: true,
                        text: 'Delay Percentage (%)'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterLabel: function(context) {
                            const location = context.label;
                            return [
                                `Supplier Count: ${locationData[location].supplierCount}`,
                                `Order Count: ${locationData[location].totalOrders}`
                            ];
                        }
                    }
                }
            }
        }
    });
}

// Create benchmark chart
function createBenchmarkChart() {
    const benchmarkData = processedData.benchmarkData;
    if (!benchmarkData) return;
    
    const ctx = document.getElementById('benchmark-chart').getContext('2d');
    const selectedCompany = companySelect.value;
    
    // Get all companies and their lead times
    const companyNames = Object.keys(benchmarkData.companyLeadTimes);
    const leadTimes = companyNames.map(company => benchmarkData.companyLeadTimes[company]);
    
    // Generate colors (highlight selected company)
    const colors = companyNames.map(company => 
        company === selectedCompany ? 'rgba(255, 99, 132, 0.7)' : 'rgba(54, 162, 235, 0.7)'
    );
    
    const borderColors = companyNames.map(company => 
        company === selectedCompany ? 'rgba(255, 99, 132, 1)' : 'rgba(54, 162, 235, 1)'
    );
    
    // Create chart
    charts.benchmark = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: companyNames,
            datasets: [{
                label: 'Average Lead Time (days)',
                data: leadTimes,
                backgroundColor: colors,
                borderColor: borderColors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                }
            },
            plugins: {
                tooltip: {
                    callbacks: {
                        afterFooter: function() {
                            return `Industry Average: ${benchmarkData.industryAvg.toFixed(1)}`;
                        }
                    }
                }
            }
        }
    });
}

// Create prediction chart
function createPredictionChart() {
    const ctx = document.getElementById('prediction-chart').getContext('2d');
    
    // Get trend data for predictions
    const trendsData = processedData.trendsData;
    if (trendsData.months.length < 3) {
        // Not enough data for prediction
        const container = document.getElementById('prediction-chart').parentNode;
        container.innerHTML = '<h3 class="chart-title">Predictive Lead Time Analysis</h3><div style="height: 100%; display: flex; align-items: center; justify-content: center; text-align: center; color: #888;">Need at least 3 months of data for predictions</div>';
        return;
    }
    
    // Get the last few months of data
    const months = trendsData.months.slice(-6);
    const leadTimes = trendsData.avgLeadTimes.slice(-6);
    
    // Simple linear regression to predict next 3 months
    const xValues = Array.from({ length: months.length }, (_, i) => i);
    const yValues = leadTimes;
    
    // Calculate slope and intercept
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 3 months
    const futureMonths = [];
    const predictedValues = [];
    
    for (let i = 1; i <= 3; i++) {
        // Predict the next month
        const lastDate = new Date(months[months.length - 1]);
        const nextMonth = new Date(lastDate);
        nextMonth.setMonth(nextMonth.getMonth() + i);
        futureMonths.push(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
        
        // Predict the lead time
        const nextX = xValues[xValues.length - 1] + i;
        const predictedY = slope * nextX + intercept;
        predictedValues.push(predictedY);
    }
    
    // Format all months for display
    const allMonthsFormatted = [...months, ...futureMonths].map(month => {
        const parts = month.split('-');
        const date = new Date(parts[0], parts[1] - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Create chart
    charts.prediction = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allMonthsFormatted,
            datasets: [
                {
                    label: 'Historical Lead Time',
                    data: leadTimes,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                },
                {
                    label: 'Predicted Lead Time',
                    data: [...Array(months.length - 1).fill(null), leadTimes[leadTimes.length - 1], ...predictedValues],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderDash: [5, 5],
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const idx = context[0].dataIndex;
                            const datasetIdx = context[0].datasetIndex;
                            
                            if (datasetIdx === 1 && idx >= months.length - 1) {
                                const isPrediction = idx >= months.length;
                                return isPrediction 
                                    ? `Prediction: ${allMonthsFormatted[idx]}`
                                    : allMonthsFormatted[idx];
                            }
                            
                            return allMonthsFormatted[idx];
                        },
                        label: function(context) {
                            return `Lead Time: ${context.raw.toFixed(1)} days`;
                        },
                        footer: function(context) {
                            const idx = context[0].dataIndex;
                            const datasetIdx = context[0].datasetIndex;
                            
                            if (datasetIdx === 1 && idx >= months.length) {
                                return 'Note: This is a predictive estimate based on historical trends';
                            }
                            return '';
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: false,
                    title: {
                        display: true,
                        text: 'Lead Time (days)'
                    }
                }
            }
        }
    });
}

// Export as image
function exportAsImage() {
    // Alert for demo purposes since html2canvas is not included
    alert('Export functionality would save the analysis as an image in a real implementation.');
    
    // In a real implementation with html2canvas library:
    // html2canvas(document.querySelector('.analytics-section')).then(canvas => {
    //     const link = document.createElement('a');
    //     link.download = 'procurement-analysis.png';
    //     link.href = canvas.toDataURL('image/png');
    //     link.click();
    // });
}

// Export analysis as CSV
function exportAnalysisCSV() {
    const metrics = processedData.keyMetrics;
    const data = [
        ['Metric', 'Value'],
        ['Average Lead Time', metrics.avgLeadTime + ' days'],
        ['On-Time Delivery', metrics.onTimePercentage],
        ['Average Delay', metrics.avgDelay + ' days'],
        ['Best Supplier', metrics.lowestSupplier],
        ['Best Supplier Lead Time', metrics.lowestLeadTime + ' days'],
        ['Worst Supplier', metrics.highestSupplier],
        ['Worst Supplier Lead Time', metrics.highestLeadTime + ' days'],
        ['Most Consistent Supplier', metrics.mostConsistentSupplier],
        ['Supplier with Most Delays', metrics.highestDelaySupplier],
        ['Delay Frequency', metrics.highestDelayFreq],
        ['Fastest Transportation Mode', metrics.fastestMode],
        ['Fastest Mode Lead Time', metrics.fastestTime + ' days'],
        ['Slowest Transportation Mode', metrics.slowestMode],
        ['Slowest Mode Lead Time', metrics.slowestTime + ' days']
    ];
    
    // Add disruption data if available
    if (metrics.worstDisruption) {
        data.push(['Most Impactful Disruption', metrics.worstDisruption]);
    }
    
    // Add category data
    data.push(
        ['Category with Shortest Lead Time', metrics.shortestCategory],
        ['Shortest Category Lead Time', metrics.shortestTime + ' days'],
        ['Category with Longest Lead Time', metrics.longestCategory],
        ['Longest Category Lead Time', metrics.longestTime + ' days']
    );
    
    // Add correlation data if available
    if (processedData.correlationData) {
        if (processedData.correlationData.quantityLeadTime) {
            data.push(['Order Quantity & Lead Time Correlation', 
                processedData.correlationData.quantityLeadTime.correlation.toFixed(2)]);
        }
        
        if (processedData.correlationData.demandLeadTime) {
            data.push(['Customer Demand & Lead Time Correlation', 
                processedData.correlationData.demandLeadTime.correlation.toFixed(2)]);
        }
        
        if (processedData.correlationData.quantityDelay) {
            data.push(['Order Quantity & Delay Correlation', 
                processedData.correlationData.quantityDelay.correlation.toFixed(2)]);
        }
    }
    
    const csv = Papa.unparse(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'procurement-analysis.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Helper functions

// Calculate average of an array
function average(arr) {
    if (!arr || arr.length === 0) return 0;
    
    // Filter out non-numeric values
    const validNumbers = arr.filter(val => 
        val !== null && 
        val !== undefined && 
        !isNaN(val) &&
        typeof val === 'number'
    );
    
    if (validNumbers.length === 0) return 0;
    return validNumbers.reduce((sum, val) => sum + val, 0) / validNumbers.length;
}

// Calculate standard deviation
function standardDeviation(arr) {
    if (!arr || arr.length <= 1) return 0;
    
    // Filter out non-numeric values
    const validNumbers = arr.filter(val => 
        val !== null && 
        val !== undefined && 
        !isNaN(val) &&
        typeof val === 'number'
    );
    
    if (validNumbers.length <= 1) return 0;
    
    const avg = average(validNumbers);
    const squareDiffs = validNumbers.map(value => {
        const diff = value - avg;
        return diff * diff;
    });
    
    const avgSquareDiff = average(squareDiffs);
    return Math.sqrt(avgSquareDiff);
}

// Calculate correlation coefficient
function calculateCorrelation(x, y) {
    if (x.length !== y.length || x.length === 0) return 0;
    
    // Filter out pairs where either value is not a number
    const pairs = x.map((value, i) => [value, y[i]])
        .filter(pair => 
            pair[0] !== null && 
            pair[0] !== undefined && 
            !isNaN(pair[0]) &&
            pair[1] !== null && 
            pair[1] !== undefined && 
            !isNaN(pair[1])
        );
        
    if (pairs.length === 0) return 0;
    
    const validX = pairs.map(pair => pair[0]);
    const validY = pairs.map(pair => pair[1]);
    
    const n = validX.length;
    const xAvg = average(validX);
    const yAvg = average(validY);
    
    let numerator = 0;
    let xDenominator = 0;
    let yDenominator = 0;
    
    for (let i = 0; i < n; i++) {
        const xDiff = validX[i] - xAvg;
        const yDiff = validY[i] - yAvg;
        
        numerator += xDiff * yDiff;
        xDenominator += xDiff * xDiff;
        yDenominator += yDiff * yDiff;
    }
    
    if (xDenominator === 0 || yDenominator === 0) return 0;
    
    return numerator / Math.sqrt(xDenominator * yDenominator);
}

// Custom color scheme - Darker theme
document.documentElement.style.setProperty('--primary-color', '#3a4cd3');
document.documentElement.style.setProperty('--secondary-color', '#282f8b');
document.documentElement.style.setProperty('--accent-color', '#3a78de');
document.documentElement.style.setProperty('--bg-color', '#1f2128');
document.documentElement.style.setProperty('--text-color', '#e6e8f0');
document.documentElement.style.setProperty('--card-bg', '#2a2d39');
document.documentElement.style.setProperty('--shadow', '0 4px 6px rgba(0, 0, 0, 0.3)');

// Add animated background
function setupAnimatedBackground() {
    const header = document.querySelector('header');
    const canvas = document.createElement('canvas');
    canvas.id = 'background-animation';
    canvas.style.position = 'absolute';
    canvas.style.top = '0';
    canvas.style.left = '0';
    canvas.style.width = '100%';
    canvas.style.height = '100%';
    canvas.style.zIndex = '-1';
    document.body.appendChild(canvas);
    
    const ctx = canvas.getContext('2d');
    let particles = [];
    
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
    
    function Particle(x, y, size, speed, color) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.speed = speed;
        this.color = color;
        this.direction = Math.random() * Math.PI * 2;
        
        this.update = function() {
            this.x += Math.cos(this.direction) * this.speed;
            this.y += Math.sin(this.direction) * this.speed;
            
            if (this.x < 0 || this.x > canvas.width) {
                this.direction = Math.PI - this.direction;
            }
            if (this.y < 0 || this.y > canvas.height) {
                this.direction = -this.direction;
            }
        };
        
        this.draw = function() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        };
    }
    
    function createParticles() {
        particles = [];
        const particleCount = Math.min(50, Math.floor(window.innerWidth / 20));
        
        for (let i = 0; i < particleCount; i++) {
            const size = Math.random() * 2 + 1;
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const speed = Math.random() * 0.5 + 0.1;
            const color = `rgba(255, 255, 255, ${Math.random() * 0.2 + 0.1})`;
            
            particles.push(new Particle(x, y, size, speed, color));
        }
    }
    
    function connectParticles() {
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 150) {
                    const opacity = 1 - (distance / 150);
                    ctx.beginPath();
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        connectParticles();
        
        requestAnimationFrame(animate);
    }
    
    createParticles();
    animate();
}

// Add home button and update header with your info
function addHeaderElements() {
    const header = document.querySelector('header');
    const studentInfo = document.createElement('p');
    studentInfo.className = 'student-info';
    studentInfo.innerHTML = 'Created by: Nabiev Azamat | Student ID: 2217423';
    studentInfo.style.fontSize = '0.9rem';
    studentInfo.style.marginTop = '5px';
    header.appendChild(studentInfo);
    
    // Create home button
    const homeBtn = document.createElement('button');
    homeBtn.id = 'home-btn';
    homeBtn.className = 'export-btn';
    homeBtn.innerHTML = '<i class="fas fa-home"></i> Home';
    homeBtn.style.position = 'absolute';
    homeBtn.style.top = '20px';
    homeBtn.style.left = '20px';
    document.body.appendChild(homeBtn);
    
    // Add event listener to home button
    homeBtn.addEventListener('click', () => {
        // Hide analytics section and show upload section
        analyticsSection.style.display = 'none';
        document.querySelector('.upload-section').scrollIntoView({ behavior: 'smooth' });
    });
}

// Add footer
function addFooter() {
    const footer = document.createElement('footer');
    footer.innerHTML = `
        <div class="footer-content">
            <div class="footer-section">
                <h3>Procurement Lead Time Analysis Tool</h3>
                <p>A comprehensive tool for analyzing procurement data and gaining valuable insights.</p>
            </div>
            <div class="footer-section">
                <h3>Features</h3>
                <ul>
                    <li>Lead Time Analysis</li>
                    <li>Supplier Performance</li>
                    <li>Transportation Mode Efficiency</li>
                    <li>Disruption Impact</li>
                    <li>Predictive Analytics</li>
                </ul>
            </div>
            <div class="footer-section">
                <h3>Created By</h3>
                <p>Nabiev Azamat</p>
                <p>Student ID: 2217423</p>
            </div>
        </div>
        <div class="footer-bottom">
            <p>&copy; ${new Date().getFullYear()} Procurement Analysis Tool. All Rights Reserved.</p>
        </div>
    `;
    
    const footerStyle = document.createElement('style');
    footerStyle.textContent = `
        footer {
            background-color: var(--card-bg);
            color: var(--text-color);
            padding: 30px 0;
            margin-top: 50px;
            box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
        }
        
        .footer-content {
            display: flex;
            flex-wrap: wrap;
            justify-content: space-around;
            max-width: 1200px;
            margin: 0 auto;
            padding: 0 20px;
        }
        
        .footer-section {
            flex: 1;
            margin: 10px;
            min-width: 250px;
        }
        
        .footer-section h3 {
            color: var(--accent-color);
            margin-bottom: 15px;
            position: relative;
            padding-bottom: 8px;
        }
        
        .footer-section h3:after {
            content: '';
            position: absolute;
            left: 0;
            bottom: 0;
            width: 40px;
            height: 2px;
            background-color: var(--accent-color);
        }
        
        .footer-section ul {
            list-style: none;
            padding: 0;
        }
        
        .footer-section ul li {
            margin-bottom: 8px;
            position: relative;
            padding-left: 15px;
        }
        
        .footer-section ul li:before {
            content: '›';
            position: absolute;
            left: 0;
            color: var(--accent-color);
        }
        
        .footer-bottom {
            text-align: center;
            padding-top: 20px;
            margin-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
    `;
    
    document.head.appendChild(footerStyle);
    document.body.appendChild(footer);
}

// Enhance key metrics display with icons
function displayKeyMetrics() {
    const metrics = processedData.keyMetrics;
    keyMetricsContainer.innerHTML = '';
    
    // Define metrics with icons
    const metricsData = [
        { title: 'Average Lead Time', value: `${metrics.avgLeadTime} days`, icon: 'fa-clock' },
        { title: 'On-Time Delivery', value: metrics.onTimePercentage, icon: 'fa-check-circle' },
        { title: 'Average Delay', value: `${metrics.avgDelay} days`, icon: 'fa-exclamation-triangle' },
        { title: 'Best Supplier', value: `${metrics.lowestSupplier} (${metrics.lowestLeadTime} days)`, icon: 'fa-award' },
        { title: 'Most Consistent Supplier', value: metrics.mostConsistentSupplier, icon: 'fa-balance-scale' },
        { title: 'Fastest Transportation', value: `${metrics.fastestMode} (${metrics.fastestTime} days)`, icon: 'fa-truck-loading' }
    ];
    
    // Add disruption if available
    if (metrics.worstDisruption) {
        metricsData.push({ 
            title: 'Most Impactful Disruption', 
            value: metrics.worstDisruption, 
            icon: 'fa-bolt' 
        });
    }
    
    // Add best product category
    metricsData.push({ 
        title: 'Best Product Category', 
        value: `${metrics.shortestCategory} (${metrics.shortestTime} days)`, 
        icon: 'fa-box' 
    });
    
    // Add correlation if available
    if (processedData.correlationData && processedData.correlationData.quantityLeadTime) {
        const correlation = processedData.correlationData.quantityLeadTime.correlation;
        let correlationDesc = 'No correlation';
        
        if (correlation > 0.7) correlationDesc = 'Strong positive';
        else if (correlation > 0.4) correlationDesc = 'Moderate positive';
        else if (correlation > 0.1) correlationDesc = 'Weak positive';
        else if (correlation < -0.7) correlationDesc = 'Strong negative';
        else if (correlation < -0.4) correlationDesc = 'Moderate negative';
        else if (correlation < -0.1) correlationDesc = 'Weak negative';
        
        metricsData.push({ 
            title: 'Order Quantity & Lead Time', 
            value: `${correlationDesc} (${correlation.toFixed(2)})`, 
            icon: 'fa-chart-line' 
        });
    }
    
    // Create metric cards with icons
    metricsData.forEach(metric => {
        createMetricCardWithIcon(metric.title, metric.value, metric.icon);
    });
}

// Create enhanced metric card with icon
function createMetricCardWithIcon(title, value, iconClass) {
    const card = document.createElement('div');
    card.className = 'metric-card';
    
    const iconElement = document.createElement('div');
    iconElement.className = 'metric-icon';
    iconElement.innerHTML = `<i class="fas ${iconClass}"></i>`;
    
    const contentWrapper = document.createElement('div');
    contentWrapper.className = 'metric-content';
    
    const titleElement = document.createElement('div');
    titleElement.className = 'metric-title';
    titleElement.textContent = title;
    
    const valueElement = document.createElement('div');
    valueElement.className = 'metric-value';
    valueElement.textContent = value;
    
    contentWrapper.appendChild(titleElement);
    contentWrapper.appendChild(valueElement);
    
    card.appendChild(iconElement);
    card.appendChild(contentWrapper);
    
    keyMetricsContainer.appendChild(card);
    
    // Add styles for the new card layout
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .metric-card {
            display: flex;
            align-items: center;
            gap: 15px;
            background-color: var(--card-bg);
            padding: 20px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            text-align: left;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            border-left: 4px solid var(--accent-color);
        }
        
        .metric-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
        }
        
        .metric-icon {
            font-size: 1.8rem;
            color: var(--accent-color);
            width: 40px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: rgba(72, 149, 239, 0.1);
            border-radius: 50%;
            padding: 10px;
        }
        
        .metric-content {
            flex: 1;
        }
        
        .metric-title {
            font-size: 1rem;
            color: var(--text-color);
            margin-bottom: 8px;
            opacity: 0.8;
        }
        
        .metric-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--accent-color);
        }
    `;
    
    document.head.appendChild(styleElement);
}

// Add comprehensive forecasting section
function addForecastingSection() {
    // Create forecasting section
    const forecastSection = document.createElement('div');
    forecastSection.className = 'forecast-section';
    forecastSection.innerHTML = `
        <h2>Comprehensive Forecast Analysis</h2>
        <p>Predictive analytics based on historical data patterns</p>
        
        <div class="forecast-metrics">
            <div class="forecast-card" id="lead-time-forecast">
                <h3>Lead Time Forecast</h3>
                <div class="forecast-chart-container">
                    <canvas id="lead-time-forecast-chart"></canvas>
                </div>
            </div>
            
            <div class="forecast-card" id="supplier-performance-forecast">
                <h3>Supplier Performance Forecast</h3>
                <div class="forecast-chart-container">
                    <canvas id="supplier-forecast-chart"></canvas>
                </div>
            </div>
            
            <div class="forecast-card" id="on-time-delivery-forecast">
                <h3>On-Time Delivery Forecast</h3>
                <div class="forecast-chart-container">
                    <canvas id="delivery-forecast-chart"></canvas>
                </div>
            </div>
        </div>
    `;
    
    // Add style for forecast section
    const forecastStyle = document.createElement('style');
    forecastStyle.textContent = `
        .forecast-section {
            background-color: var(--card-bg);
            padding: 30px;
            border-radius: 10px;
            box-shadow: var(--shadow);
            margin: 40px 0;
        }
        
        .forecast-section h2 {
            color: var(--accent-color);
            margin-bottom: 10px;
        }
        
        .forecast-section p {
            margin-bottom: 20px;
            opacity: 0.8;
        }
        
        .forecast-metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 20px;
        }
        
        .forecast-card {
            background-color: rgba(255, 255, 255, 0.05);
            border-radius: 8px;
            padding: 20px;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
        }
        
        .forecast-card h3 {
            font-size: 1.2rem;
            margin-bottom: 15px;
            color: var(--accent-color);
            text-align: center;
        }
        
        .forecast-chart-container {
            height: 300px;
        }
    `;
    
    document.head.appendChild(forecastStyle);
    
    // Insert before footer
    const footer = document.querySelector('footer') || document.body;
    document.body.insertBefore(forecastSection, footer);
    
    // Function to generate forecasts
    return forecastSection;
}

// Create forecast charts
function createForecastCharts() {
    // Lead Time Forecast
    const leadTimeCtx = document.getElementById('lead-time-forecast-chart').getContext('2d');
    const trendsData = processedData.trendsData;
    
    if (trendsData.months.length < 3) {
        document.getElementById('lead-time-forecast').innerHTML = 
            '<h3>Lead Time Forecast</h3><div class="no-data-message">Need at least 3 months of data for forecasting</div>';
        return;
    }
    
    // Get historical data
    const months = trendsData.months.slice(-6);
    const leadTimes = trendsData.avgLeadTimes.slice(-6);
    
    // Simple linear regression for forecasting
    const xValues = Array.from({ length: months.length }, (_, i) => i);
    const yValues = leadTimes;
    
    // Calculate slope and intercept
    const n = xValues.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((a, b, i) => a + b * yValues[i], 0);
    const sumXX = xValues.reduce((a, b) => a + b * b, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    // Predict next 6 months
    const futureMonths = [];
    const predictedLeadTimes = [];
    
    for (let i = 1; i <= 6; i++) {
        const lastDate = new Date(months[months.length - 1]);
        const nextMonth = new Date(lastDate);
        nextMonth.setMonth(nextMonth.getMonth() + i);
        futureMonths.push(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
        
        const nextX = xValues[xValues.length - 1] + i;
        const predictedY = slope * nextX + intercept;
        predictedLeadTimes.push(predictedY);
    }
    
    // Format all months for display
    const allMonthsFormatted = [...months, ...futureMonths].map(month => {
        const parts = month.split('-');
        const date = new Date(parts[0], parts[1] - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Create chart
    charts.leadTimeForecast = new Chart(leadTimeCtx, {
        type: 'line',
        data: {
            labels: allMonthsFormatted,
            datasets: [
                {
                    label: 'Historical Lead Time',
                    data: leadTimes,
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    fill: true
                },
                {
                    label: 'Forecasted Lead Time',
                    data: [...Array(months.length - 1).fill(null), leadTimes[leadTimes.length - 1], ...predictedLeadTimes],
                    borderColor: 'rgba(255, 99, 132, 1)',
                    borderDash: [5, 5],
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const idx = context[0].dataIndex;
                            const datasetIdx = context[0].datasetIndex;
                            
                            if (datasetIdx === 1 && idx >= months.length - 1) {
                                const isPrediction = idx >= months.length;
                                return isPrediction 
                                    ? `Forecast: ${allMonthsFormatted[idx]}`
                                    : allMonthsFormatted[idx];
                            }
                            
                            return allMonthsFormatted[idx];
                        },
                        label: function(context) {
                            return `Lead Time: ${context.raw.toFixed(1)} days`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    title: {
                        display: true,
                        text: 'Lead Time (days)',
                        color: 'rgba(255, 255, 255, 0.9)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
    
    // Create Supplier Performance Forecast
    createSupplierForecast();
    
    // Create On-Time Delivery Forecast
    createDeliveryForecast(slope, intercept);
}

// Create supplier performance forecast
function createSupplierForecast() {
    const ctx = document.getElementById('supplier-forecast-chart').getContext('2d');
    const supplierData = processedData.supplierData;
    const suppliers = Object.keys(supplierData).slice(0, 5); // Top 5 suppliers
    
    if (suppliers.length === 0) {
        document.getElementById('supplier-performance-forecast').innerHTML = 
            '<h3>Supplier Performance Forecast</h3><div class="no-data-message">No supplier data available</div>';
        return;
    }
    
    // Calculate current and forecasted performance (simulated improvement)
    const currentPerformance = suppliers.map(supplier => 100 - (supplierData[supplier].delayFrequency * 100));
    const forecastedPerformance = currentPerformance.map(perf => {
        // Simulate performance improvement (capped at 98%)
        const improvement = Math.random() * 5 + 2; // 2-7% improvement
        return Math.min(98, perf + improvement);
    });
    
    // Create chart
    charts.supplierForecast = new Chart(ctx, {
        type: 'radar',
        data: {
            labels: suppliers,
            datasets: [
                {
                    label: 'Current Performance (%)',
                    data: currentPerformance,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    pointBackgroundColor: 'rgba(75, 192, 192, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(75, 192, 192, 1)'
                },
                {
                    label: 'Forecasted Performance (%)',
                    data: forecastedPerformance,
                    backgroundColor: 'rgba(255, 99, 132, 0.2)',
                    borderColor: 'rgba(255, 99, 132, 1)',
                    pointBackgroundColor: 'rgba(255, 99, 132, 1)',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: 'rgba(255, 99, 132, 1)'
                }
            ]
        },
        options: {
            elements: {
                line: {
                    borderWidth: 3
                }
            },
            scales: {
                r: {
                    angleLines: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    grid: {
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    pointLabels: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    ticks: {
                        backdropColor: 'transparent',
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// Create on-time delivery forecast
function createDeliveryForecast(leadTimeSlope, leadTimeIntercept) {
    const ctx = document.getElementById('delivery-forecast-chart').getContext('2d');
    const trendsData = processedData.trendsData;
    
    if (trendsData.months.length < 3) {
        document.getElementById('on-time-delivery-forecast').innerHTML = 
            '<h3>On-Time Delivery Forecast</h3><div class="no-data-message">Need at least 3 months of data for forecasting</div>';
        return;
    }
    
    // Get historical data
    const months = trendsData.months.slice(-6);
    const onTimeRates = trendsData.months.slice(-6).map((month, i) => {
        return 100 - trendsData.delayPercentages[trendsData.months.indexOf(month)];
    });
    
    // Forecasting based on lead time slope (inverse relationship)
    const futureMonths = [];
    const predictedOnTimeRates = [];
    
    for (let i = 1; i <= 6; i++) {
        const lastDate = new Date(months[months.length - 1]);
        const nextMonth = new Date(lastDate);
        nextMonth.setMonth(nextMonth.getMonth() + i);
        futureMonths.push(`${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, '0')}`);
        
        // Negative correlation with lead time
        const currentRate = onTimeRates[onTimeRates.length - 1];
        // If lead time decreasing (negative slope), on-time rate increases
        const rateChange = -leadTimeSlope * 5; // Inverse relationship
        let predictedRate = currentRate + (rateChange * i);
        
        // Cap between 0-100%
        predictedRate = Math.min(100, Math.max(0, predictedRate));
        predictedOnTimeRates.push(predictedRate);
    }
    
    // Format all months for display
    const allMonthsFormatted = [...months, ...futureMonths].map(month => {
        const parts = month.split('-');
        const date = new Date(parts[0], parts[1] - 1, 1);
        return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
    });
    
    // Create chart
    charts.deliveryForecast = new Chart(ctx, {
        type: 'line',
        data: {
            labels: allMonthsFormatted,
            datasets: [
                {
                    label: 'Historical On-Time Rate (%)',
                    data: onTimeRates,
                    borderColor: 'rgba(255, 159, 64, 1)',
                    backgroundColor: 'rgba(255, 159, 64, 0.2)',
                    fill: true
                },
                {
                    label: 'Forecasted On-Time Rate (%)',
                    data: [...Array(months.length - 1).fill(null), onTimeRates[onTimeRates.length - 1], ...predictedOnTimeRates],
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderDash: [5, 5],
                    pointStyle: 'circle',
                    pointRadius: 5,
                    pointHoverRadius: 8,
                    fill: false
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                tooltip: {
                    callbacks: {
                        title: function(context) {
                            const idx = context[0].dataIndex;
                            const datasetIdx = context[0].datasetIndex;
                            
                            if (datasetIdx === 1 && idx >= months.length - 1) {
                                const isPrediction = idx >= months.length;
                                return isPrediction 
                                    ? `Forecast: ${allMonthsFormatted[idx]}`
                                    : allMonthsFormatted[idx];
                            }
                            
                            return allMonthsFormatted[idx];
                        },
                        label: function(context) {
                            return `On-Time Rate: ${context.raw.toFixed(1)}%`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    min: 0,
                    max: 100,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    },
                    title: {
                        display: true,
                        text: 'On-Time Delivery Rate (%)',
                        color: 'rgba(255, 255, 255, 0.9)'
                    }
                },
                x: {
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)'
                    },
                    ticks: {
                        color: 'rgba(255, 255, 255, 0.7)'
                    }
                }
            }
        }
    });
}

// Fix company dropdown functionality
function enhanceCompanyDropdown() {
    // Add event listener to monitor parsed data
    document.addEventListener('dataLoaded', function() {
        // Extract unique companies from the data
        const companyField = findCompanyField(rawData[0]);
        
        if (companyField) {
            companies = [...new Set(rawData.map(row => row[companyField]))].filter(Boolean);
            populateCompanyDropdown();
            
            // Display company count
            if (companies.length > 0) {
                const companyCount = document.createElement('div');
                companyCount.className = 'company-count';
                companyCount.textContent = `${companies.length} companies detected`;
                companyCount.style.marginTop = '10px';
                companyCount.style.fontSize = '0.9rem';
                companyCount.style.color = 'var(--accent-color)';
                companySelector.appendChild(companyCount);
            }
        }
    });
}

// Find the company field name in the data
function findCompanyField(row) {
    if (!row) return null;
    
    // Look for common company field names
    const possibleFields = ['Company', 'company', 'Company_Name', 'CompanyName', 'Organization', 'Org', 'Business'];
    
    for (const field of possibleFields) {
        if (row[field] !== undefined) return field;
    }
    
    // If no standard field found, look for any field with "company" in it
    const companyField = Object.keys(row).find(key => 
        key.toLowerCase().includes('company') || 
        key.toLowerCase().includes('organization') ||
        key.toLowerCase().includes('business')
    );
    
    return companyField || null;
}

// Enhance the data processing to extract more insights
function enhanceDataProcessing() {
    // Add event listeners for the data processing flow
    document.addEventListener('dataProcessed', function() {
        // Add data quality metrics
        addDataQualityMetrics();
        
        // Update UI based on data quality
        updateUIBasedOnDataQuality();
    });
}

// Add data quality metrics
function addDataQualityMetrics() {
    if (!processedData || !rawData || rawData.length === 0) return;
    
    // Calculate data completeness
    const requiredFields = [
        'Order_Date', 'Expected_Delivery_Date', 'Actual_Delivery_Date', 
        'Supplier', 'Product_Category', 'Transportation_Mode'
    ];
    
    let totalFields = 0;
    let completeFields = 0;
    
    rawData.forEach(row => {
        requiredFields.forEach(field => {
            if (row[field] !== undefined && row[field] !== null && row[field] !== '') {
                completeFields++;
            }
            totalFields++;
        });
    });
    
    const completenessRate = (completeFields / totalFields) * 100;
    
    // Add data quality section
    if (!processedData.dataQuality) {
        processedData.dataQuality = {};
    }
    
    processedData.dataQuality.completenessRate = completenessRate;
    processedData.dataQuality.rowCount = rawData.length;
    processedData.dataQuality.validRowCount = rawData.filter(row => 
        row.Order_Date && row.Actual_Delivery_Date
    ).length;
}

// Update UI based on data quality
function updateUIBasedOnDataQuality() {
    if (!processedData.dataQuality) return;
    
    const quality = processedData.dataQuality;
    
    // Add data quality indicator
    const qualityIndicator = document.createElement('div');
    qualityIndicator.className = 'data-quality-indicator';
    
    let qualityLevel = 'high';
    let qualityColor = '#4CAF50';
    
    if (quality.completenessRate < 80) {
        qualityLevel = 'medium';
        qualityColor = '#FFC107';
    }
    
    if (quality.completenessRate < 60) {
        qualityLevel = 'low';
        qualityColor = '#F44336';
    }
    
    qualityIndicator.innerHTML = `
        <div class="quality-badge" style="background-color: ${qualityColor}">
            ${qualityLevel.toUpperCase()} QUALITY
        </div>
        <div class="quality-info">
            <div>Data Completeness: ${quality.completenessRate.toFixed(1)}%</div>
            <div>Total Rows: ${quality.rowCount}</div>
            <div>Valid Rows: ${quality.validRowCount}</div>
        </div>
    `;
    
    // Add styles
    const qualityStyle = document.createElement('style');
    qualityStyle.textContent = `
        .data-quality-indicator {
            display: flex;
            align-items: center;
            gap: 15px;
            margin-top: 20px;
            background-color: rgba(255, 255, 255, 0.05);
            padding: 15px;
            border-radius: 8px;
        }
        
        .quality-badge {
            padding: 5px 10px;
            border-radius: 4px;
            font-weight: bold;
            font-size: 0.8rem;
            white-space: nowrap;
        }
        
        .quality-info {
            font-size: 0.9rem;
            opacity: 0.9;
        }
    `;
    
    document.head.appendChild(qualityStyle);
    
    // Add to analytics section
    const insertPoint = document.querySelector('.insights-summary');
    if (insertPoint) {
        insertPoint.appendChild(qualityIndicator);
    }
}

// Initialize all enhancements
function initEnhancements() {
    // Setup dark theme and animated background after DOM content loaded
    document.addEventListener('DOMContentLoaded', function() {
        // Apply dark theme
        document.documentElement.style.setProperty('--primary-color', '#3a4cd3');
        document.documentElement.style.setProperty('--secondary-color', '#282f8b');
        document.documentElement.style.setProperty('--accent-color', '#3a78de');
        document.documentElement.style.setProperty('--bg-color', '#1f2128');
        document.documentElement.style.setProperty('--text-color', '#e6e8f0');
        document.documentElement.style.setProperty('--card-bg', '#2a2d39');
        document.documentElement.style.setProperty('--shadow', '0 4px 6px rgba(0, 0, 0, 0.3)');
        
        // Add animated background
        setupAnimatedBackground();
        
        // Add header elements (name & student ID)
        addHeaderElements();
        
        // Add footer
        addFooter();
        
        // Enhance company dropdown
        enhanceCompanyDropdown();
        
        // Enhance data processing
        enhanceDataProcessing();
        
        // Update event handlers
        updateEventHandlers();
    });
}

// Update event handlers
function updateEventHandlers() {
    // Override showAnalytics function
    const originalShowAnalytics = showAnalytics;
    showAnalytics = function() {
        originalShowAnalytics();
        
        // Create forecasting section
        const forecastSection = addForecastingSection();
        
        // Create forecast charts
        createForecastCharts();
        
        // Dispatch event when data is processed
        document.dispatchEvent(new Event('dataProcessed'));
    };
    
    // Override handle file upload
    const originalHandleFileUpload = handleFileUpload;
    handleFileUpload = function(e) {
        originalHandleFileUpload(e);
        
        // Dispatch event when data is loaded
        document.dispatchEvent(new Event('dataLoaded'));
    };
    
    // Override load demo data
    const originalLoadDemoData = loadDemoData;
    loadDemoData = function() {
        originalLoadDemoData();
        
        // Dispatch event when data is loaded
        document.dispatchEvent(new Event('dataLoaded'));
    };
}

// Call the initialization function
initEnhancements();

// Additional chart customization for dark theme
Chart.defaults.color = 'rgba(255, 255, 255, 0.7)';
Chart.defaults.borderColor = 'rgba(255, 255, 255, 0.1)';
Chart.defaults.scale.grid.color = 'rgba(255, 255, 255, 0.05)';
