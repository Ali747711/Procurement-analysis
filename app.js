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
        months[month].avgLeadTime = average(months[month].leadTimes);
        months[month].del
