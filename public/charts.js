/**
 * Advanced Charts Module
 * Provides additional chart types, sparklines, and chart enhancements
 */

const Charts = (() => {
    const chartInstances = {};

    // Color palette matching design system
    const colors = {
        primary: '#14b8a6',
        primaryLight: '#5eead4',
        primaryDark: '#0f9488',
        success: '#10b981',
        error: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
        purple: '#8b5cf6',
        pink: '#ec4899',
        orange: '#f97316',
        gray: '#6b7280'
    };

    /**
     * Create a doughnut chart (similar to pie but with center hole)
     */
    function createDoughnutChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        // Destroy existing chart
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: true,
            cutout: '60%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 15,
                        font: {
                            size: 12,
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8,
                    titleFont: { size: 14, weight: 'bold' },
                    bodyFont: { size: 13 }
                }
            },
            animation: {
                animateRotate: true,
                animateScale: true,
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };

        const config = {
            type: 'doughnut',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        chartInstances[canvasId] = new Chart(canvas, config);
        return chartInstances[canvasId];
    }

    /**
     * Create a bar chart for comparisons
     */
    function createBarChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };

        const config = {
            type: 'bar',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        chartInstances[canvasId] = new Chart(canvas, config);
        return chartInstances[canvasId];
    }

    /**
     * Create a line chart for trends over time
     */
    function createLineChart(canvasId, data, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 12,
                    cornerRadius: 8
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: "'Inter', sans-serif"
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 1000,
                easing: 'easeOutQuart'
            }
        };

        const config = {
            type: 'line',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        chartInstances[canvasId] = new Chart(canvas, config);
        return chartInstances[canvasId];
    }

    /**
     * Create a sparkline (mini line chart)
     */
    function createSparkline(canvasId, dataPoints, options = {}) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return null;

        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
        }

        const isPositive = dataPoints[dataPoints.length - 1] >= dataPoints[0];
        const color = isPositive ? colors.success : colors.error;

        const data = {
            labels: dataPoints.map((_, i) => i),
            datasets: [{
                data: dataPoints,
                borderColor: color,
                backgroundColor: `${color}20`,
                fill: true,
                tension: 0.4,
                borderWidth: 2,
                pointRadius: 0,
                pointHoverRadius: 4,
                pointHoverBackgroundColor: color,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2
            }]
        };

        const defaultOptions = {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    enabled: options.showTooltip !== false,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    padding: 8,
                    cornerRadius: 4,
                    displayColors: false,
                    callbacks: {
                        title: () => '',
                        label: (context) => `Value: ${context.parsed.y}`
                    }
                }
            },
            scales: {
                x: { display: false },
                y: { display: false }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            },
            animation: {
                duration: 800,
                easing: 'easeOutQuart'
            }
        };

        const config = {
            type: 'line',
            data: data,
            options: { ...defaultOptions, ...options }
        };

        chartInstances[canvasId] = new Chart(canvas, config);
        return chartInstances[canvasId];
    }

    /**
     * Create animated number counter
     */
    function animateNumber(element, target, duration = 1000, decimals = 0) {
        if (!element) return;

        const start = 0;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Easing function (easeOutQuart)
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = start + (target - start) * eased;
            
            element.textContent = current.toFixed(decimals);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                element.textContent = target.toFixed(decimals);
            }
        }

        requestAnimationFrame(update);
    }

    /**
     * Create sample weekly trend chart
     */
    function createWeeklyTrendChart(canvasId, weekData) {
        const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        
        const data = {
            labels: labels,
            datasets: [{
                label: 'Check-ins',
                data: weekData,
                backgroundColor: `${colors.primary}40`,
                borderColor: colors.primary,
                borderWidth: 2,
                borderRadius: 6,
                hoverBackgroundColor: colors.primary
            }]
        };

        return createBarChart(canvasId, data);
    }

    /**
     * Create monthly growth line chart
     */
    function createMonthlyGrowthChart(canvasId, monthlyData) {
        const data = {
            labels: monthlyData.map(d => d.month),
            datasets: [{
                label: 'Total Members',
                data: monthlyData.map(d => d.count),
                borderColor: colors.primary,
                backgroundColor: `${colors.primary}20`,
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 4,
                pointBackgroundColor: colors.primary,
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 6
            }]
        };

        return createLineChart(canvasId, data);
    }

    /**
     * Destroy a specific chart
     */
    function destroyChart(canvasId) {
        if (chartInstances[canvasId]) {
            chartInstances[canvasId].destroy();
            delete chartInstances[canvasId];
        }
    }

    /**
     * Destroy all charts
     */
    function destroyAllCharts() {
        Object.keys(chartInstances).forEach(id => {
            chartInstances[id].destroy();
        });
        chartInstances = {};
    }

    // Public API
    return {
        colors,
        createDoughnutChart,
        createBarChart,
        createLineChart,
        createSparkline,
        animateNumber,
        createWeeklyTrendChart,
        createMonthlyGrowthChart,
        destroyChart,
        destroyAllCharts
    };
})();

// Make available globally
window.Charts = Charts;
