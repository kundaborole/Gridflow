// GridFlow AI - Frontend Dashboard Controller

const API_BASE = "http://127.0.0.1:8000/api";
let currentHour = 132; // Default start index (Jan 6, 12:00 PM - nice sunny mid-week data)
let isPlaying = false;
let playInterval = null;

// Chart references
let forecastChart = null;
let demandBreakdownChart = null;
let costChart = null;
let batteryTrendChart = null;
let sustainabilityCostChart = null;

// SPA view states
let activeView = "dashboard";
let lastReceivedData = null;

// Demo variables
let demoInterval = null;
const demoSteps = [6, 10, 18, 21];
let demoStepIdx = 0;

// DOM Elements
const timeSlider = document.getElementById("time-slider");
const sliderTooltip = document.getElementById("slider-percentage");
const displayTimestamp = document.getElementById("display-timestamp");
const btnPrev = document.getElementById("btn-prev");
const btnPlay = document.getElementById("btn-play");
const btnNext = document.getElementById("btn-next");
const btnRunDemo = document.getElementById("btn-run-demo");

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
    fetchLiveWeather();
    updateDashboard();
    
    // Event listeners
    timeSlider.addEventListener("input", handleSliderChange);
    btnPrev.addEventListener("click", stepPrev);
    btnNext.addEventListener("click", stepNext);
    btnPlay.addEventListener("click", togglePlay);
    if(btnRunDemo) btnRunDemo.addEventListener("click", runDemoScenario);
    
    // Routing Listeners
    document.querySelectorAll(".nav-item, .nav-link").forEach(elem => {
        elem.addEventListener("click", (e) => {
            e.preventDefault();
            const view = elem.getAttribute("data-view");
            if (view) switchView(view);
        });
    });
    
    // Sidebar Hamburger toggle
    const hamburgerBtn = document.getElementById("hamburger-btn");
    const sidebar = document.getElementById("sidebar");
    if (hamburgerBtn && sidebar) {
        hamburgerBtn.addEventListener("click", () => {
            sidebar.classList.toggle("collapsed");
        });
    }
    
    // Mobile Hamburger Overlay toggle
    const mobileHamburgerBtn = document.getElementById("mobile-hamburger-btn");
    if (mobileHamburgerBtn && sidebar) {
        mobileHamburgerBtn.addEventListener("click", () => {
            sidebar.classList.toggle("mobile-open");
        });
    }
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
async function fetchLiveWeather() {
    try {
        const response = await fetch(`${API_BASE}/live-weather`);
        if (response.ok) {
            const data = await response.json();
            document.getElementById("live-location").innerText = data.location || "--";
            document.getElementById("live-temp").innerText = `${data.temperature.toFixed(1)} °C`;
            document.getElementById("live-clouds").innerText = `${data.cloud_cover}%`;
            document.getElementById("live-conditions").innerText = data.conditions || "--";
            
            // Update Gemini Insight
            const insightElem = document.getElementById("gemini-weather-text");
            if (insightElem && data.cloud_cover !== undefined) {
                const penalty = Math.round(data.cloud_cover * 0.8); // mock dynamic penalty calc
                insightElem.innerHTML = `<i class="fa-solid fa-satellite"></i> Current cloud cover may reduce future solar generation by ${penalty}%. GridFlow can ingest live weather signals to improve future forecasting.`;
            }
        }
    } catch (err) {
        console.error("Failed to fetch live weather:", err);
        // Fallback UI
        document.getElementById("live-location").innerText = "San Francisco, US (Fallback)";
        document.getElementById("live-temp").innerText = "18.5 °C";
        document.getElementById("live-clouds").innerText = "45%";
        document.getElementById("live-conditions").innerText = "Scattered Clouds";
    }
}

async function updateDashboard() {
    try {
        console.log("Fetching hour:", currentHour);
        const response = await fetch(`${API_BASE}/status?hour=${currentHour}&_t=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error("API status response failed");
        
        const data = await response.json();
        lastReceivedData = data;
        
        // Update slider value
        timeSlider.value = currentHour;
        sliderTooltip.innerText = `Hour ${currentHour} / ${timeSlider.max}`;
        
        // Render Telemetry
        renderTelemetry(data);
        
        // Render Charts
        renderForecastChart(data.forecast);
        renderDemandBreakdownChart(data.current_state);
        if (data.sustainability) {
            renderCostChart(data.sustainability);
        }
        
        // Render view-specific elements and charts
        renderViewSpecifics(data);
        
        // Update status indicators
        updateStatusIndicators(data);
        
    } catch (err) {
        console.error("Dashboard update error:", err);
        // Fallback for demo
        document.getElementById("grid-status-text").innerText = "API Offline - Fallback Mode";
        document.getElementById("grid-status-icon").className = "fa-solid fa-circle-exclamation";
        document.getElementById("grid-status-banner").className = "status-banner critical";
        
        setOfflineIndicators();
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
    valTariffRate.innerText = `₹${bal.tariff_rate.toFixed(2)}`;
    
    // Sustainability outcomes
    const valBlackouts = document.getElementById("val-blackouts");
    if(valBlackouts) valBlackouts.innerText = sust.blackouts_prevented || 0;
    
    const valCo2 = document.getElementById("val-co2");
    if(valCo2) valCo2.innerText = sust.cumulative_co2_kg ? sust.cumulative_co2_kg.toFixed(1) : "0.0";
    
    const valSavings = document.getElementById("val-savings");
    if(valSavings) valSavings.innerText = sust.cumulative_savings_usd ? `₹${sust.cumulative_savings_usd.toFixed(0)}` : "₹0";
    
    // Before / After Battery Impact
    const batBeforeElem = document.getElementById("val-battery-before");
    const batAfterElem = document.getElementById("val-battery-after");
    const batDiffElem = document.getElementById("val-battery-diff");
    
    if (batBeforeElem && data.before) {
        const bPct = (data.before.battery_level / 500.0) * 100;
        const aPct = (data.after.battery_level / 500.0) * 100;
        batBeforeElem.innerText = `${bPct.toFixed(1)}%`;
        batAfterElem.innerText = `${aPct.toFixed(1)}%`;
        
        const diff = aPct - bPct;
        batDiffElem.innerText = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
        batDiffElem.style.color = diff >= 0 ? "#34d399" : "#f87171";
    }
    
    // Gemini AI Advisor Card Update
    const recAction = document.getElementById("gemini-rec-action");
    const recReason = document.getElementById("gemini-rec-reason");
    const recBenefit = document.getElementById("gemini-rec-benefit");
    const recConfidence = document.getElementById("gemini-confidence");
    const recSource = document.getElementById("gemini-source");
    
    if (bal.recommendations && bal.recommendations.length > 0) {
        const primaryRec = typeof bal.recommendations[0] === 'string' ? { action: "INFO", reason: bal.recommendations[0], expectedBenefit: "System operating normally.", confidence: "Medium", source: "Heuristic" } : bal.recommendations[0];
        if (recAction) recAction.innerText = primaryRec.recommendation || primaryRec.action || "MONITORING";
        if (recReason) recReason.innerText = primaryRec.reason || "Analyzing patterns.";
        if (recBenefit) recBenefit.innerText = primaryRec.expectedBenefit || "Optimizing grid.";
        if (recConfidence) recConfidence.innerText = `Confidence: ${primaryRec.confidence || "High"}`;
        
        if (recSource) {
            const src = primaryRec.source || "Heuristic";
            recSource.innerText = `Source: ${src}`;
            if (src.toLowerCase() === "gemini") {
                recSource.className = "badge premium";
            } else {
                recSource.className = "badge orange";
            }
        }
    }
    
    // Update Timeline List
    const timelineList = document.getElementById("timeline-list");
    if (timelineList && data.decision_history) {
        timelineList.innerHTML = "";
        [...data.decision_history].reverse().slice(0, 5).forEach(hist => {
            const li = document.createElement("li");
            li.innerHTML = `<span class="t-hour">${String(hist.hour).padStart(2, '0')}:00</span> <span class="t-action">${hist.action}</span>`;
            timelineList.appendChild(li);
        });
    }

    // Update Status Banner
    const statusBanner = document.getElementById("grid-status-banner");
    const statusText = document.getElementById("grid-status-text");
    const statusIcon = document.getElementById("grid-status-icon");
    if (statusBanner) {
        const hasCritical = data.risks && data.risks.some(r => r.level === 'critical');
        const hasWarning = data.risks && data.risks.some(r => r.level === 'warning');
        
        if (hasCritical) {
            statusBanner.className = "status-banner critical";
            statusText.innerText = "Battery Critical / Risk Detected";
            statusIcon.className = "fa-solid fa-triangle-exclamation";
        } else if (hasWarning) {
            statusBanner.className = "status-banner warning";
            statusText.innerText = "Demand Spike Detected / Warning";
            statusIcon.className = "fa-solid fa-bell";
        } else {
            statusBanner.className = "status-banner stable";
            if (bal.load_shedding > 0) {
                statusText.innerText = "Blackout Prevented via Shedding";
            } else {
                statusText.innerText = "Grid Stable";
            }
            statusIcon.className = "fa-solid fa-circle-check";
        }
    }
    
    // AI Recommendations
    if (recommendationsList) {
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
    }
    
    // System Risks / Alert log
    if (risksList) {
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
}

// Render Forecast Chart using Chart.js
function renderForecastChart(forecastData) {
    const labels = forecastData.map(f => `${f.hour}:00`);
    const demandData = forecastData.map(f => f.predicted_demand);
    const solarData = forecastData.map(f => f.predicted_solar);
    
    const ctxElem = document.getElementById("forecastChart");
    if (!ctxElem) return;
    
    if (forecastChart) {
        forecastChart.destroy();
    }
    
    const ctx = ctxElem.getContext("2d");
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

// Render Demand Breakdown Chart
function renderDemandBreakdownChart(row) {
    const labels = ["Residential", "Commercial", "School", "Hospital"];
    const data = [
        row.residential_demand,
        row.commercial_demand,
        row.school_demand,
        row.hospital_demand
    ];
    
    const ctxElem = document.getElementById("demandBreakdownChart");
    if (!ctxElem) return;

    if (demandBreakdownChart) {
        demandBreakdownChart.destroy();
    }
    
    const ctx = ctxElem.getContext("2d");
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

// Render Cost Chart
function renderCostChart(sust) {
    const labels = ["Without GridFlow", "With GridFlow"];
    const baseCost = sust.baseline_cost_usd || 0;
    const actualCost = sust.actual_cost_usd || 0;
    const data = [baseCost, actualCost];
    
    const ctxElem = document.getElementById("costChart");
    if (!ctxElem) return;

    if (costChart) {
        costChart.destroy();
    }
    
    costChart = new Chart(ctxElem.getContext("2d"), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Cost (₹)',
                data: data,
                backgroundColor: ['rgba(248, 113, 113, 0.8)', 'rgba(52, 211, 153, 0.8)'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#9ca3af', font: { size: 10 } },
                    beginAtZero: true
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#f3f4f6' }
                }
            }
        }
    });
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
        }, 2500);
    } else {
        btnPlay.innerHTML = `<i class="fa-solid fa-play"></i>`;
        btnPlay.classList.remove("playing");
        clearInterval(playInterval);
    }
}

function runDemoScenario() {
    if (demoInterval) {
        clearInterval(demoInterval);
        demoInterval = null;
        btnRunDemo.innerText = "🚀 Run Demo Scenario";
        return;
    }
    
    demoStepIdx = 0;
    btnRunDemo.innerText = "⏹ Stop Demo";
    
    const advanceDemo = () => {
        if (demoStepIdx >= demoSteps.length) {
            clearInterval(demoInterval);
            demoInterval = null;
            btnRunDemo.innerText = "✅ Demo Complete";
            setTimeout(() => { btnRunDemo.innerText = "🚀 Run Demo Scenario"; }, 3000);
            return;
        }
        currentHour = demoSteps[demoStepIdx];
        updateDashboard();
        demoStepIdx++;
    };
    
    // trigger first immediately
    advanceDemo();
    // then every 4 seconds
    demoInterval = setInterval(advanceDemo, 4000);
}

// View switching routing logic
function switchView(viewName) {
    activeView = viewName;
    
    // Hide all views
    document.querySelectorAll(".view-section").forEach(sec => {
        sec.style.display = "none";
        sec.classList.remove("active");
    });
    
    // Show selected view
    const targetSec = document.getElementById("view-" + viewName);
    if (targetSec) {
        targetSec.style.display = "block";
        targetSec.classList.add("active");
    }
    
    // Update active states
    document.querySelectorAll(".nav-item").forEach(item => {
        if (item.getAttribute("data-view") === viewName) {
            item.classList.add("active");
        } else {
            item.classList.remove("active");
        }
    });
    
    document.querySelectorAll(".nav-link").forEach(link => {
        if (link.getAttribute("data-view") === viewName) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
    
    // Close mobile overlay
    const sidebar = document.getElementById("sidebar");
    if (sidebar) {
        sidebar.classList.remove("mobile-open");
    }
    
    // Re-render charts or elements for newly loaded view
    if (lastReceivedData) {
        renderViewSpecifics(lastReceivedData);
    }
}

// Render values specifically inside Storage, Sustainability, and Engine views
function renderViewSpecifics(data) {
    if (!data) return;
    
    const cur = data.current_state;
    const bal = data.balancing;
    const sust = data.sustainability;
    
    // --- STORAGE VIEW ---
    const storageValBattery = document.getElementById("storage-val-battery");
    if (storageValBattery) storageValBattery.innerText = cur.battery_level.toFixed(2);
    
    const storageValBatteryPct = document.getElementById("storage-val-battery-pct");
    const socPct = (cur.battery_level / 500.0) * 100.0;
    if (storageValBatteryPct) storageValBatteryPct.innerText = `${socPct.toFixed(1)}%`;
    
    const storageBatteryFill = document.getElementById("storage-battery-fill");
    if (storageBatteryFill) {
        storageBatteryFill.style.width = `${socPct}%`;
        if (bal.battery_action === "CHARGE" || bal.battery_action === "GRID_CHARGE") {
            storageBatteryFill.style.backgroundColor = "var(--neon-green)";
        } else if (bal.battery_action === "DISCHARGE") {
            storageBatteryFill.style.backgroundColor = "var(--neon-orange)";
        } else {
            storageBatteryFill.style.backgroundColor = "var(--neon-blue)";
        }
    }
    
    const storageValBatteryAction = document.getElementById("storage-val-battery-action");
    if (storageValBatteryAction) {
        storageValBatteryAction.innerText = bal.battery_action;
        storageValBatteryAction.className = "status-badge";
        if (bal.battery_action === "CHARGE" || bal.battery_action === "GRID_CHARGE") {
            storageValBatteryAction.classList.add("green");
        } else if (bal.battery_action === "DISCHARGE") {
            storageValBatteryAction.classList.add("orange");
        } else {
            storageValBatteryAction.classList.add("blue");
        }
    }
    
    const storageValRate = document.getElementById("storage-val-rate");
    if (storageValRate) {
        storageValRate.innerText = bal.battery_rate.toFixed(2);
    }
    
    // Battery impact cards
    const storageBatBefore = document.getElementById("storage-val-battery-before");
    const storageBatAfter = document.getElementById("storage-val-battery-after");
    const storageBatDiff = document.getElementById("storage-val-battery-diff");
    if (storageBatBefore && data.before) {
        const bPct = (data.before.battery_level / 500.0) * 100;
        const aPct = (data.after.battery_level / 500.0) * 100;
        storageBatBefore.innerText = `${bPct.toFixed(1)}%`;
        storageBatAfter.innerText = `${aPct.toFixed(1)}%`;
        const diff = aPct - bPct;
        storageBatDiff.innerText = diff > 0 ? `+${diff.toFixed(1)}%` : `${diff.toFixed(1)}%`;
        storageBatDiff.style.color = diff >= 0 ? "#34d399" : "#f87171";
    }
    
    // Battery trend chart
    if (activeView === "storage") {
        renderBatteryTrendChart(socPct);
    }
    
    // --- SUSTAINABILITY VIEW ---
    const sustValCo2 = document.getElementById("sust-val-co2");
    if (sustValCo2) sustValCo2.innerText = sust.cumulative_co2_kg ? sust.cumulative_co2_kg.toFixed(1) : "0.0";
    
    const sustValBlackouts = document.getElementById("sust-val-blackouts");
    if (sustValBlackouts) sustValBlackouts.innerText = sust.blackouts_prevented || 0;
    
    const sustValSavings = document.getElementById("sust-val-savings");
    if (sustValSavings) sustValSavings.innerText = sust.cumulative_savings_usd ? `₹${sust.cumulative_savings_usd.toFixed(0)}` : "₹0";
    
    const sustValSsr = document.getElementById("sust-val-ssr");
    if (sustValSsr) {
        const renewablePower = Math.min(cur.solar_generation, cur.total_demand) + (bal.battery_action === "DISCHARGE" ? bal.battery_rate : 0);
        const ssr = cur.total_demand > 0 ? (renewablePower / cur.total_demand) * 100 : 100;
        sustValSsr.innerText = Math.max(0, Math.min(100, ssr)).toFixed(1);
    }
    
    if (activeView === "sustainability") {
        renderSustainabilityCostChart(sust);
    }
    
    // --- ENGINE CONFIG VIEW ---
    updateEngineConfigBadges(data);
}

// Engine diagnostics badge status helper
function updateEngineConfigBadges(data) {
    const isGeminiActive = data.balancing.recommendations && data.balancing.recommendations.some(r => r.source && r.source.toLowerCase() === "gemini");
    const isWeatherLive = document.getElementById("live-location").innerText.indexOf("Fallback") === -1;
    
    const predictionBadge = document.getElementById("status-engine-prediction");
    const riskBadge = document.getElementById("status-engine-risk");
    const balancingBadge = document.getElementById("status-engine-balancing");
    const simulationBadge = document.getElementById("status-engine-simulation");
    const geminiBadge = document.getElementById("status-engine-gemini");
    const weatherBadge = document.getElementById("status-engine-weather");
    const apiBadge = document.getElementById("status-engine-api");
    
    if (predictionBadge) { predictionBadge.innerText = "🟢 ONLINE"; predictionBadge.className = "status-badge green"; }
    if (riskBadge) { riskBadge.innerText = "🟢 ONLINE"; riskBadge.className = "status-badge green"; }
    if (balancingBadge) { balancingBadge.innerText = "🟢 ONLINE"; balancingBadge.className = "status-badge green"; }
    if (simulationBadge) { simulationBadge.innerText = "🟢 ONLINE"; simulationBadge.className = "status-badge green"; }
    if (geminiBadge) {
        if (isGeminiActive) { geminiBadge.innerText = "🟢 ONLINE"; geminiBadge.className = "status-badge green"; }
        else { geminiBadge.innerText = "🟡 FALLBACK"; geminiBadge.className = "status-badge orange"; }
    }
    if (weatherBadge) {
        if (isWeatherLive) { weatherBadge.innerText = "🟢 ONLINE"; weatherBadge.className = "status-badge green"; }
        else { weatherBadge.innerText = "🟡 FALLBACK"; weatherBadge.className = "status-badge orange"; }
    }
    if (apiBadge) { apiBadge.innerText = "🟢 ONLINE"; apiBadge.className = "status-badge green"; }
}

// Sticky Top Navbar status update indicators
function updateStatusIndicators(data) {
    const isGeminiActive = data.balancing.recommendations && data.balancing.recommendations.some(r => r.source && r.source.toLowerCase() === "gemini");
    const isWeatherLive = document.getElementById("live-location").innerText.indexOf("Fallback") === -1;
    
    const indicatorApi = document.getElementById("indicator-api");
    const indicatorGemini = document.getElementById("indicator-gemini");
    const indicatorWeather = document.getElementById("indicator-weather");
    
    const sidebarApiDot = document.getElementById("sidebar-api-dot");
    const sidebarApiText = document.getElementById("sidebar-api-text");
    
    if (indicatorApi) {
        indicatorApi.innerHTML = `<span class="dot"></span> API Connected`;
        indicatorApi.className = "status-indicator online";
    }
    if (sidebarApiDot) sidebarApiDot.className = "status-dot green";
    if (sidebarApiText) sidebarApiText.innerText = "API Connected";
    
    if (indicatorGemini) {
        if (isGeminiActive) {
            indicatorGemini.innerHTML = `<i class="fa-solid fa-robot"></i> Gemini Active`;
            indicatorGemini.className = "status-indicator online";
        } else {
            indicatorGemini.innerHTML = `<i class="fa-solid fa-robot"></i> Gemini Fallback`;
            indicatorGemini.className = "status-indicator fallback";
        }
    }
    
    if (indicatorWeather) {
        if (isWeatherLive) {
            indicatorWeather.innerHTML = `<i class="fa-solid fa-cloud"></i> Weather Live`;
            indicatorWeather.className = "status-indicator online";
        } else {
            indicatorWeather.innerHTML = `<i class="fa-solid fa-cloud-sun"></i> Weather Fallback`;
            indicatorWeather.className = "status-indicator fallback";
        }
    }
}

// Handle Gateway/Core disconnection fallbacks
function setOfflineIndicators() {
    const indicatorApi = document.getElementById("indicator-api");
    const indicatorGemini = document.getElementById("indicator-gemini");
    const indicatorWeather = document.getElementById("indicator-weather");
    const sidebarApiDot = document.getElementById("sidebar-api-dot");
    const sidebarApiText = document.getElementById("sidebar-api-text");
    
    if (indicatorApi) {
        indicatorApi.innerHTML = `<span class="dot" style="background-color: var(--neon-red); box-shadow: 0 0 6px var(--neon-red);"></span> API Offline`;
        indicatorApi.className = "status-indicator offline";
    }
    if (sidebarApiDot) sidebarApiDot.className = "status-dot red";
    if (sidebarApiText) sidebarApiText.innerText = "API Offline";
    
    if (indicatorGemini) {
        indicatorGemini.innerHTML = `<i class="fa-solid fa-robot"></i> Gemini Offline`;
        indicatorGemini.className = "status-indicator offline";
    }
    if (indicatorWeather) {
        indicatorWeather.innerHTML = `<i class="fa-solid fa-cloud"></i> Weather Offline`;
        indicatorWeather.className = "status-indicator offline";
    }
}

// Render dynamic battery trend
function renderBatteryTrendChart(currentSoC) {
    const ctxElem = document.getElementById("batteryTrendChart");
    if (!ctxElem) return;
    
    const labels = [];
    const dataPoints = [];
    for (let i = 24; i >= 0; i--) {
        const hourLabel = (currentHour - i + 24) % 24;
        labels.push(`${hourLabel}:00`);
        const noise = Math.sin(i * 0.4) * 15;
        const mockValue = Math.max(10, Math.min(95, currentSoC + noise));
        dataPoints.push(mockValue);
    }

    if (batteryTrendChart) {
        batteryTrendChart.destroy();
    }
    
    const ctx = ctxElem.getContext("2d");
    batteryTrendChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Battery State of Charge (%)',
                data: dataPoints,
                borderColor: '#00ff9d',
                backgroundColor: 'rgba(0, 255, 157, 0.05)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: { min: 0, max: 100, grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9ca3af', font: { size: 10 } } },
                x: { grid: { color: 'rgba(255,255,255,0.04)' }, ticks: { color: '#9ca3af', font: { size: 10 } } }
            }
        }
    });
}

// Render dynamic sustainability cost comparison chart
function renderSustainabilityCostChart(sust) {
    const labels = ["Without GridFlow", "With GridFlow"];
    const baseCost = sust.baseline_cost_usd || 0;
    const actualCost = sust.actual_cost_usd || 0;
    const data = [baseCost, actualCost];
    
    const ctxElem = document.getElementById("sustainabilityCostChart");
    if (!ctxElem) return;

    if (sustainabilityCostChart) {
        sustainabilityCostChart.destroy();
    }
    
    sustainabilityCostChart = new Chart(ctxElem.getContext("2d"), {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Cumulative Cost (₹)',
                data: data,
                backgroundColor: ['rgba(248, 113, 113, 0.8)', 'rgba(52, 211, 153, 0.8)'],
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                y: {
                    grid: { color: 'rgba(255, 255, 255, 0.04)' },
                    ticks: { color: '#9ca3af', font: { size: 10 } },
                    beginAtZero: true
                },
                x: {
                    grid: { display: false },
                    ticks: { color: '#f3f4f6' }
                }
            }
        }
    });
}
