// GridFlow AI - Frontend Dashboard Controller

const API_BASE = "http://127.0.0.1:8000/api";
let currentHour = 132; // Default start index (Jan 6, 12:00 PM - nice sunny mid-week data)
let isPlaying = false;
let playInterval = null;

// Chart references
let forecastChart = null;
let demandBreakdownChart = null;

// DOM Elements
const timeSlider = document.getElementById("time-slider");
const sliderTooltip = document.getElementById("slider-percentage");
const displayTimestamp = document.getElementById("display-timestamp");
const btnPrev = document.getElementById("btn-prev");
const btnPlay = document.getElementById("btn-play");
const btnNext = document.getElementById("btn-next");

// Metric fields
const valSolar = document.getElementById("val-solar");
const valClouds = document.getElementById("val-clouds");
const valDemand = document.getElementById("val-demand");
const valTemp = document.getElementById("val-temp");
const valBattery = document.getElementById("val-battery");
const valBatteryPct = document.getElementById("val-battery-pct");
const batteryFill = document.getElementById("battery-fill");
const valBatteryAction = document.getElementById("val-battery-action");
const valGrid = document.getElementById("val-grid");
const valTariffZone = document.getElementById("val-tariff-zone");
const valTariffRate = document.getElementById("val-tariff-rate");

// Secondary metrics
const valCo2 = document.getElementById("val-co2");
const valSavings = document.getElementById("val-savings");
const valSufficiency = document.getElementById("val-sufficiency");
const valShedding = document.getElementById("val-shedding");

// Recommendation and Risk list
const recommendationsList = document.getElementById("recommendations-list");
const risksList = document.getElementById("risks-list");

// Initialize application
window.addEventListener("DOMContentLoaded", () => {
    fetchConfig();
    updateDashboard();
    
    // Event listeners
    timeSlider.addEventListener("input", handleSliderChange);
    btnPrev.addEventListener("click", stepPrev);
    btnNext.addEventListener("click", stepNext);
    btnPlay.addEventListener("click", togglePlay);
});

// Fetch configuration from API
async function fetchConfig() {
    try {
        const response = await fetch(`${API_BASE}/config`);
        if (response.ok) {
            const config = await response.json();
            timeSlider.max = config.total_records - 1;
        }
    } catch (err) {
        console.error("Failed to fetch grid config:", err);
    }
}

// Fetch and update dashboard metrics
async function updateDashboard() {
    try {
        console.log("Fetching hour:", currentHour);
        const response = await fetch(`${API_BASE}/status?hour=${currentHour}&_t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("API status response failed");
        
        const data = await response.json();
        
        // Update slider value
        timeSlider.value = currentHour;
        sliderTooltip.innerText = `Hour ${currentHour} / ${timeSlider.max}`;
        
        // Render Telemetry
        renderTelemetry(data);
        
        // Render Charts
        renderForecastChart(data.forecast);
        renderDemandBreakdownChart(data.current_state);
        
    } catch (err) {
        console.error("Dashboard update error:", err);
        // If API fails, show offline status warning
        risksList.innerHTML = `<li class="critical-risk"><i class="fa-solid fa-circle-exclamation"></i> Backend API Connection Offline. Ensure FastAPI is running on port 8000.</li>`;
    }
}

// Render values into elements
function renderTelemetry(data) {
    const cur = data.current_state;
    const bal = data.balancing;
    const sust = data.sustainability;
    
    // Header
    displayTimestamp.innerText = cur.timestamp;
    
    // Solar & Weather
    valSolar.innerText = cur.solar_generation.toFixed(2);
    valClouds.innerText = `${(cur.cloud_cover * 100).toFixed(0)}%`;
    
    // Demand & Temp
    valDemand.innerText = cur.total_demand.toFixed(2);
    valTemp.innerText = `${cur.temperature.toFixed(1)}°C`;
    
    // Battery SoC (Capacity: 500 kWh)
    valBattery.innerText = cur.battery_level.toFixed(2);
    const socPct = (cur.battery_level / 500.0) * 100.0;
    valBatteryPct.innerText = `${socPct.toFixed(1)}%`;
    batteryFill.style.width = `${socPct}%`;
    
    // Set battery action classes
    valBatteryAction.innerText = bal.battery_action;
    valBatteryAction.className = "status-badge";
    if (bal.battery_action === "CHARGE" || bal.battery_action === "GRID_CHARGE") {
        valBatteryAction.classList.add("green");
        batteryFill.style.backgroundColor = "var(--neon-green)";
    } else if (bal.battery_action === "DISCHARGE") {
        valBatteryAction.classList.add("orange");
        batteryFill.style.backgroundColor = "var(--neon-orange)";
    } else {
        valBatteryAction.classList.add("blue");
        batteryFill.style.backgroundColor = "var(--neon-blue)";
    }
    
    // Grid Net Balance
    const netExchange = bal.grid_import - bal.grid_export;
    valGrid.innerText = netExchange.toFixed(2);
    if (netExchange > 0) {
        valGrid.style.color = "var(--neon-orange)";
    } else if (netExchange < 0) {
        valGrid.style.color = "var(--neon-green)";
    } else {
        valGrid.style.color = "var(--text-primary)";
    }
    
    valTariffZone.innerText = bal.tariff_zone;
    valTariffRate.innerText = `$${bal.tariff_rate.toFixed(2)}`;
    
    // Sustainability outcomes
    valCo2.innerText = sust.co2_offset_kg.toFixed(1);
    valSavings.innerText = `$${sust.cost_savings_usd.toFixed(2)}`;
    valSufficiency.innerText = `${sust.self_sufficiency_ratio.toFixed(1)}%`;
    valShedding.innerText = bal.load_shedding.toFixed(2);
    
    if (bal.load_shedding > 0) {
        valShedding.style.color = "var(--neon-red)";
    } else {
        valShedding.style.color = "var(--text-secondary)";
    }
    
    // AI Recommendations
    recommendationsList.innerHTML = "";
    if (bal.recommendations && bal.recommendations.length > 0) {
        bal.recommendations.forEach(rec => {
            const li = document.createElement("li");
            li.innerHTML = `<i class="fa-solid fa-chevron-right"></i> ${rec}`;
            recommendationsList.appendChild(li);
        });
    } else {
        recommendationsList.innerHTML = `<li><i class="fa-solid fa-circle-check"></i> Grid balanced correctly. No actionable overrides needed.</li>`;
    }
    
    // System Risks / Alert log
    risksList.innerHTML = "";
    if (data.risks && data.risks.length > 0) {
        data.risks.forEach(risk => {
            const li = document.createElement("li");
            if (risk.level === "critical") {
                li.className = "critical-risk";
                li.innerHTML = `<i class="fa-solid fa-circle-exclamation"></i> <strong>CRITICAL:</strong> ${risk.message}`;
            } else if (risk.level === "warning") {
                li.className = "warning-risk";
                li.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> <strong>WARNING:</strong> ${risk.message}`;
            } else if (risk.level === "info") {
                li.className = "info-risk";
                li.innerHTML = `<i class="fa-solid fa-circle-info"></i> ${risk.message}`;
            } else {
                li.className = "normal-risk";
                li.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--neon-green);"></i> ${risk.message}`;
            }
            risksList.appendChild(li);
        });
    }
}

// Render Forecast Chart using Chart.js
function renderForecastChart(forecastData) {
    const labels = forecastData.map(f => `${f.hour}:00`);
    const demandData = forecastData.map(f => f.predicted_demand);
    const solarData = forecastData.map(f => f.predicted_solar);
    
    if (forecastChart) {
        forecastChart.data.labels = labels;
        forecastChart.data.datasets[0].data = demandData;
        forecastChart.data.datasets[1].data = solarData;
        forecastChart.update('none'); // silent update without animation transitions for performance during replay
    } else {
        const ctx = document.getElementById("forecastChart").getContext("2d");
        forecastChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [
                    {
                        label: 'Predicted Demand (kW)',
                        data: demandData,
                        borderColor: '#c084fc',
                        backgroundColor: 'rgba(192, 132, 252, 0.05)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 1,
                        pointHoverRadius: 5
                    },
                    {
                        label: 'Predicted Solar (kW)',
                        data: solarData,
                        borderColor: '#00d9ff',
                        backgroundColor: 'rgba(0, 217, 255, 0.05)',
                        borderWidth: 3,
                        fill: true,
                        tension: 0.35,
                        pointRadius: 1,
                        pointHoverRadius: 5
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
                            color: '#f3f4f6',
                            font: { family: 'Outfit', size: 12 }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#9ca3af', font: { size: 10 } }
                    },
                    y: {
                        grid: { color: 'rgba(255, 255, 255, 0.04)' },
                        ticks: { color: '#9ca3af', font: { size: 10 } }
                    }
                }
            }
        });
    }
}

// Render Demand Breakdown Chart
function renderDemandBreakdownChart(row) {
    const labels = ["Residential", "Commercial", "School", "Hospital"];
    const data = [
        row.residential_demand,
        row.commercial_demand,
        row.school_demand,
        row.hospital_demand
    ];
    
    if (demandBreakdownChart) {
        demandBreakdownChart.data.datasets[0].data = data;
        demandBreakdownChart.update('none');
    } else {
        const ctx = document.getElementById("demandBreakdownChart").getContext("2d");
        demandBreakdownChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [
                    {
                        data: data,
                        backgroundColor: [
                            'rgba(192, 132, 252, 0.75)',  // purple
                            'rgba(255, 157, 0, 0.75)',    // orange
                            'rgba(0, 217, 255, 0.75)',    // blue
                            'rgba(0, 255, 157, 0.75)'     // green
                        ],
                        borderColor: '#0a0d16',
                        borderWidth: 2
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: '#f3f4f6',
                            font: { family: 'Outfit', size: 11 }
                        }
                    }
                },
                cutout: '65%'
            }
        });
    }
}

// UI Event Handlers
function handleSliderChange(e) {
    currentHour = parseInt(e.target.value);
    console.log("Hour Changed:", currentHour);
    updateDashboard();
}

function stepNext() {
    const maxVal = parseInt(timeSlider.max);
    currentHour = (currentHour + 1) % (maxVal + 1);
    updateDashboard();
}

function stepPrev() {
    const maxVal = parseInt(timeSlider.max);
    currentHour = currentHour - 1;
    if (currentHour < 0) currentHour = maxVal;
    updateDashboard();
}

function togglePlay() {
    isPlaying = !isPlaying;
    if (isPlaying) {
        btnPlay.innerHTML = `<i class="fa-solid fa-pause"></i>`;
        btnPlay.classList.add("playing");
        playInterval = setInterval(() => {
            stepNext();
        }, 1500);
    } else {
        btnPlay.innerHTML = `<i class="fa-solid fa-play"></i>`;
        btnPlay.classList.remove("playing");
        clearInterval(playInterval);
    }
}
