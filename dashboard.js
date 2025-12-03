document.addEventListener("DOMContentLoaded", function() {
  // 加载公共组件
  fetch("header.html")
    .then(function(response) { return response.text(); })
    .then(function(html) {
      document.getElementById("header-container").innerHTML = html;
      // 加载头部CSS
      var headerCSS = document.createElement("link");
      headerCSS.rel = "stylesheet";
      headerCSS.href = "header.css";
      document.head.appendChild(headerCSS);
    });
  
  fetch("footer.html")
    .then(function(response) { return response.text(); })
    .then(function(html) {
      document.getElementById("footer-container").innerHTML = html;
      // 加载底部CSS
      var footerCSS = document.createElement("link");
      footerCSS.rel = "stylesheet";
      footerCSS.href = "footer.css";
      document.head.appendChild(footerCSS);
    });

  // 初始化图表
  initCharts();
  
  // 时间范围选择器事件
  document.getElementById('time-range').addEventListener('change', function() {
    // 这里可以添加AJAX请求来获取不同时间范围的数据
    console.log('时间范围已更改为:', this.value);
    // 重新渲染图表
    initCharts();
  });
});

function initCharts() {
  // 用户增长趋势图表
  const userGrowthCtx = document.getElementById('userGrowthChart').getContext('2d');
  const userGrowthChart = new Chart(userGrowthCtx, {
    type: 'line',
    data: {
      labels: ['1月', '2月', '3月', '4月', '5月', '6月', '7月'],
      datasets: [{
        label: '用户数量',
        data: [850, 920, 1020, 1100, 1150, 1200, 1248],
        borderColor: '#1976d2',
        backgroundColor: 'rgba(25, 118, 210, 0.1)',
        borderWidth: 2,
        tension: 0.4,
        fill: true
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false
        },
        tooltip: {
          mode: 'index',
          intersect: false
        }
      },
      scales: {
        y: {
          beginAtZero: false,
          grid: {
            drawBorder: false
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

  // 流量使用分布图表
  const trafficDistributionCtx = document.getElementById('trafficDistributionChart').getContext('2d');
  const trafficDistributionChart = new Chart(trafficDistributionCtx, {
    type: 'doughnut',
    data: {
      labels: ['文本数据', '图像数据', '音频数据', '视频数据', '其他'],
      datasets: [{
        data: [35, 25, 20, 15, 5],
        backgroundColor: [
          '#1976d2',
          '#388e3c',
          '#ffa000',
          '#8e24aa',
          '#757575'
        ],
        borderWidth: 0
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right'
        },
        tooltip: {
          callbacks: {
            label: function(context) {
              return `${context.label}: ${context.raw}%`;
            }
          }
        }
      },
      cutout: '70%'
    }
  });
}