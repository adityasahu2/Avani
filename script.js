document.addEventListener("DOMContentLoaded", function () {
    const themeToggle = document.querySelector(".theme-toggle");
    const body = document.body;
    const charts = {};
    const chartConfigs = [
        { id: "air-quality", label: "Air Quality Over Time", unit: "AQI", data: [10, 4, 30, 20, 25, 40] },
        { id: "soil-moisture", label: "Soil Moisture Over Time", unit: "Moisture", data: [20, 30, 45, 35, 25, 40] },
        { id: "temperature", label: "Temperature Over Time", unit: "°C", data: [30, 20, 25, 20, 15, 10] },
        { id: "humidity", label: "Humidity Over Time", unit: "%", data: [15, 10, 35, 25, 20, 40] },
        { id: "soil", label: "Soil Data", unit: "", multiData: [
            { label: "Soil Data 1", data: [10, 20, 15, 30, 25, 40], color: "red" },
            { label: "Soil Data 2", data: [5, 15, 10, 25, 20, 35], color: "blue" },
            { label: "Soil Data 3", data: [8, 18, 12, 28, 22, 38], color: "green" }
        ]}
    ];
    


    async function fetchSensorData(sensorType) {
        try {
            const response = await fetch("soildata.json"); // Fetch JSON file
            if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
            const data = await response.json(); // Parse JSON data
    
            if (!data.messages || !Array.isArray(data.messages)) {
                throw new Error("Invalid JSON structure: 'messages' array is missing");
            }
    
            // Extract relevant sensor data from each message
            return data.messages.map(msg => msg.payload[sensorType]).filter(value => value !== undefined);
        } catch (error) {
            console.error(`Error fetching ${sensorType} data:`, error);
            return [];
        }
    }
    
    async function updateChart(sensorType, chartId) {
        const sensorData = await fetchSensorData(sensorType);
        if (sensorData.length === 0) {
            console.warn(`No valid ${sensorType} data found.`);
            return;
        }
    
        let index = 0;
    
        setInterval(() => {
            const chart = charts[chartId];
            if (chart && index < sensorData.length) {
                chart.data.datasets[0].data.shift(); // Remove first element
                chart.data.datasets[0].data.push(sensorData[index]); // Add new data point
                chart.update(); // Refresh the chart
                index = (index + 1) % sensorData.length; // Loop when reaching the end
            } else {
                console.warn(`Chart ${chartId} not initialized or no data available.`);
            }
        }, 1000);
    }
    
    // Call functions to update charts for both Air Quality and Soil Moisture
    updateChart("airQuality", "air-quality");
    updateChart("soilMoisture", "soil-moisture");
    updateChart("temperature", "temperature");
    updateChart("humidity", "humidity");
    
    

    function getColors() {
        return body.classList.contains("light-mode") ?
            { labelColor: "#1e293b", gridColor: "rgba(0, 0, 0, 0.2)" } :
            { labelColor: "#f1f5f9", gridColor: "rgba(255, 255, 255, 0.2)" };
    }

    function createChart(id, label, unit, data, multiData = null) {
        const ctx = document.getElementById(id)?.getContext("2d");
        if (!ctx) return;
        return new Chart(ctx, {
            type: "line",
            data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
                datasets: multiData || [{ label, data, borderColor: "green", backgroundColor: "rgba(0, 255, 0, 0.2)", borderWidth: 2, fill: true, tension: 0.3 }]
            },
            options: {
                responsive: true,
                plugins: { legend: { labels: { color: getColors().labelColor, font: { size: 14 } } } },
                scales: {
                    x: { ticks: { color: getColors().labelColor }, title: { display: true, text: "Months", color: getColors().labelColor }, grid: { color: getColors().gridColor } },
                    y: { ticks: { color: getColors().labelColor }, title: { display: true, text: unit, color: getColors().labelColor }, grid: { color: getColors().gridColor } }
                }
            }
        });
    }

    chartConfigs.forEach(({ id, label, unit, data, multiData }) => {
        charts[id] = createChart(id, label, unit, data, multiData?.map(d => ({ ...d, borderWidth: 2, fill: false })));
    });

    themeToggle.addEventListener("click", () => {
        body.classList.toggle("light-mode");
        const updatedColors = getColors();
        Object.values(charts).forEach(chart => {
            if (chart) {
                chart.options.plugins.legend.labels.color = updatedColors.labelColor;
                chart.options.scales.x.ticks.color = updatedColors.labelColor;
                chart.options.scales.x.title.color = updatedColors.labelColor;
                chart.options.scales.y.ticks.color = updatedColors.labelColor;
                chart.options.scales.y.title.color = updatedColors.labelColor;
                chart.options.scales.x.grid.color = updatedColors.gridColor;
                chart.options.scales.y.grid.color = updatedColors.gridColor;
                chart.update();
            }
        });
        updatePlaceholderColor();
    });

    // Logo toggle
    const darkLogo = document.getElementById('dark-mode-logo');
    const lightLogo = document.getElementById('light-mode-logo');
    themeToggle.addEventListener("click", () => {
        [darkLogo.style.display, lightLogo.style.display] = body.classList.contains("light-mode") ? ["none", "block"] : ["block", "none"];
    });

    // Section toggle
    const sections = document.querySelectorAll("section");
    function showSection(id) {
        sections.forEach(sec => sec.style.display = "none");
        document.getElementById(id).style.display = "block";
    }
    ["about", "sensor", "report", "contact"].forEach(id => document.getElementById(id)?.addEventListener("click", () => showSection(`${id}-section`)));
    showSection("about-section");

    // Hover effect
    document.querySelectorAll(".description").forEach(desc => {
        desc.addEventListener("mousemove", (e) => {
            const rect = desc.getBoundingClientRect();
            const [x, y] = [e.clientX - rect.left, e.clientY - rect.top];
            desc.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(74, 222, 128, 0.1), rgba(74, 222, 128, 0.05) 40%)`;
        });
        desc.addEventListener("mouseleave", () => desc.style.background = "rgba(74, 222, 128, 0.05)");
    });

    function updatePlaceholderColor() {
        const placeholderColor = getColors().labelColor;
        document.querySelectorAll(".form-control").forEach(input => {
            input.style.setProperty("--placeholder-color", placeholderColor);
        });
    }

    updatePlaceholderColor();

    // Add CSS to change placeholder color
    const style = document.createElement("style");
    style.innerHTML = `
        .form-control::placeholder {
            color: var(--placeholder-color, #1e293b);
            transition: color 0.3s ease;
        }
        .form-control{
        color:var(--placeholder-color, #1e293b)}
    `;
    document.head.appendChild(style);

    // Contact Form
    document.getElementById('contactForm').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const button = e.target.querySelector('.submit-btn');
        const spinner = button.querySelector('.spinner');
        const btnText = button.querySelector('.btn-text');
        const successMessage = document.querySelector('.success-message');
        
        button.disabled = true;
        spinner.style.display = 'block';
        btnText.textContent = 'Sending...';
        
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        successMessage.style.display = 'block';
        e.target.reset();
        
        button.disabled = false;
        spinner.style.display = 'none';
        btnText.textContent = 'Send Message';
        
        setTimeout(() => {
            successMessage.style.display = 'none';
        }, 3000);
    });
});