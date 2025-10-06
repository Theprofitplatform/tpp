/**
 * Mobile-First Design Blog Post Charts
 * Chart.js implementations for visual data representations
 *
 * Dependencies: Chart.js v3.x or later
 * Usage: Include this script after Chart.js library
 */

// Utility: Initialize chart when DOM is ready and canvas exists
function initChartWhenReady(canvasId, chartInitFn) {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      const canvas = document.getElementById(canvasId);
      if (canvas) chartInitFn(canvas);
    });
  } else {
    const canvas = document.getElementById(canvasId);
    if (canvas) chartInitFn(canvas);
  }
}

// Chart 1: Sydney Mobile Usage Statistics
initChartWhenReady('sydneyMobileStats', (canvas) => {
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: [
        'Sydney consumers using\nmobile as primary gateway',
        'Local searches happening\non mobile devices',
        'Peak mobile traffic\n(Surry Hills/Newtown)'
      ],
      datasets: [{
        label: 'Percentage',
        data: [87, 70, 85],
        backgroundColor: [
          'rgba(99, 102, 241, 0.8)',
          'rgba(139, 92, 246, 0.8)',
          'rgba(168, 85, 247, 0.8)'
        ],
        borderColor: [
          'rgba(99, 102, 241, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(168, 85, 247, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Sydney Mobile Usage Statistics 2025',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return context.parsed.x + '% of users';
            }
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        y: {
          grid: {
            display: false
          }
        }
      }
    }
  });
});

// Chart 2: Manly Café Conversion Rate Improvement
initChartWhenReady('conversionImprovement', (canvas) => {
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Before Mobile-First\nRedesign', 'After Mobile-First\nRedesign'],
      datasets: [{
        label: 'Conversion Rate',
        data: [1.2, 4.7],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Manly Café Mobile Conversion Rate Improvement',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Conversion Rate: ' + context.parsed.y + '%';
            },
            afterLabel: function(context) {
              if (context.dataIndex === 1) {
                return [
                  '',
                  '292% improvement',
                  '+$18,000/month revenue'
                ];
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
});

// Chart 3: Pyrmont Restaurant Booking Increase
initChartWhenReady('bookingIncrease', (canvas) => {
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['Before Redesign', 'After Mobile-First\nRedesign'],
      datasets: [{
        label: 'Online Reservations',
        data: [100, 440],
        fill: true,
        backgroundColor: 'rgba(34, 197, 94, 0.2)',
        borderColor: 'rgba(34, 197, 94, 1)',
        borderWidth: 3,
        pointRadius: 8,
        pointBackgroundColor: 'rgba(34, 197, 94, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointHoverRadius: 10,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: '340% Increase in Mobile Reservations',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Reservations: ' + context.parsed.y + ' (indexed)';
            },
            afterLabel: function(context) {
              if (context.dataIndex === 1) {
                return '+340% improvement';
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 500,
          ticks: {
            callback: function(value) {
              return value;
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
});

// Chart 4: Mobile vs Desktop Conversion Rates (e-commerce case study)
initChartWhenReady('mobileDesktopConversion', (canvas) => {
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Mobile (Before)', 'Mobile (After)', 'Desktop'],
      datasets: [{
        label: 'Conversion Rate',
        data: [0.8, 4.2, 3.8],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)'
        ],
        borderColor: [
          'rgba(239, 68, 68, 1)',
          'rgba(34, 197, 94, 1)',
          'rgba(59, 130, 246, 1)'
        ],
        borderWidth: 2,
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Mosman E-commerce Conversion Rates',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Conversion Rate: ' + context.parsed.y + '%';
            },
            afterLabel: function(context) {
              if (context.dataIndex === 1) {
                return [
                  '',
                  '425% improvement',
                  'Now exceeds desktop!'
                ];
              }
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 5,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          grid: {
            display: false
          }
        }
      }
    }
  });
});

// Chart 5: Page Speed Impact on Bounce Rate
initChartWhenReady('pageSpeedBounce', (canvas) => {
  const ctx = canvas.getContext('2d');

  new Chart(ctx, {
    type: 'line',
    data: {
      labels: ['1s', '2s', '3s', '4s', '5s', '6s'],
      datasets: [{
        label: 'Bounce Rate',
        data: [20, 32, 53, 68, 78, 85],
        fill: true,
        backgroundColor: 'rgba(239, 68, 68, 0.2)',
        borderColor: 'rgba(239, 68, 68, 1)',
        borderWidth: 3,
        pointRadius: 6,
        pointBackgroundColor: 'rgba(239, 68, 68, 1)',
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        tension: 0.4
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        title: {
          display: true,
          text: 'Mobile Page Speed vs Bounce Rate',
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: {
            top: 10,
            bottom: 20
          }
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return 'Bounce Rate: ' + context.parsed.y + '%';
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
          ticks: {
            callback: function(value) {
              return value + '%';
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.05)'
          }
        },
        x: {
          title: {
            display: true,
            text: 'Page Load Time'
          },
          grid: {
            display: false
          }
        }
      }
    }
  });
});

// Responsive chart sizing based on screen width
window.addEventListener('resize', () => {
  // Charts will auto-resize if responsive: true
  // This is a placeholder for any custom responsive behavior
});

console.log('Mobile-First Design charts initialized');
