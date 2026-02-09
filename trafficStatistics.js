document.addEventListener("DOMContentLoaded", function() {
  // 加载头部和底部
  fetch("header.html")
    .then(function(response) { return response.text(); })
    .then(function(html) {
      document.getElementById("header-container").innerHTML = html;
      var headerCSS = document.createElement("link");
      headerCSS.rel = "stylesheet";
      headerCSS.href = "header.css";
      document.head.appendChild(headerCSS);
    });
  
  fetch("footer.html")
    .then(function(response) { return response.text(); })
    .then(function(html) {
      document.getElementById("footer-container").innerHTML = html;
      var footerCSS = document.createElement("link");
      footerCSS.rel = "stylesheet";
      footerCSS.href = "footer.css";
      document.head.appendChild(footerCSS);
    });

  // 二级导航切换
  const subNavButtons = document.querySelectorAll('.subnav-btn');
  const usageSections = document.querySelectorAll('.usage-section');
  const defaultSectionId = 'overview-section';

  function activateSection(targetId, options = {}) {
    const section = document.getElementById(targetId);
    if (!section) {
      return;
    }

    subNavButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.target === targetId);
    });

    usageSections.forEach(sec => {
      sec.classList.toggle('active', sec.id === targetId);
    });

    // 切换到用量概况时，确保图表已初始化
    if (targetId === 'overview-section' && typeof Chart !== 'undefined') {
      setTimeout(() => {
        if (!callsChart || !tokensChart) {
          initCharts();
        }
      }, 100);
    }

    if (!options.skipHashUpdate) {
      history.replaceState(null, '', `#${targetId}`);
    }
  }

  subNavButtons.forEach(btn => {
    btn.addEventListener('click', () => activateSection(btn.dataset.target));
  });

  const hashTarget = location.hash ? location.hash.substring(1) : '';
  if (hashTarget && document.getElementById(hashTarget)) {
    activateSection(hashTarget, { skipHashUpdate: true });
  } else {
    activateSection(defaultSectionId, { skipHashUpdate: true });
  }

  window.addEventListener('hashchange', () => {
    const target = location.hash ? location.hash.substring(1) : '';
    if (target && document.getElementById(target)) {
      activateSection(target, { skipHashUpdate: true });
    }
  });

  // 时间范围选择器交互
  const timeRangeSelect = document.getElementById('time-range');
  const customRangeGroup = document.getElementById('custom-range-group');
  
  timeRangeSelect.addEventListener('change', function() {
    customRangeGroup.style.display = this.value === 'custom' ? 'flex' : 'none';
    // 时间范围改变时更新图表
    if (typeof Chart !== 'undefined') {
      setTimeout(() => initCharts(), 100);
    }
  });

  // 图表实例
  let callsChart = null;
  let tokensChart = null;

  // 更新统计卡片
  function updateStatsCards(callsData, tokensData) {
    const totalCalls = callsData.reduce((sum, val) => sum + val, 0);
    const totalTokens = tokensData.reduce((sum, val) => sum + val, 0);
    
    const callsValueEl = document.querySelector('.stat-card .stat-value');
    const tokensValueEl = document.querySelectorAll('.stat-card .stat-value')[1];
    
    if (callsValueEl) {
      callsValueEl.innerHTML = totalCalls.toLocaleString() + ' <span></span>';
    }
    if (tokensValueEl) {
      tokensValueEl.innerHTML = totalTokens.toFixed(2) + ' <span>百万tokens</span>';
    }
  }

  // 生成模拟数据
  function generateChartData(timeRange) {
    const today = new Date();
    let labels = [];
    let callsData = [];
    let tokensData = [];
    let days = 7;

    if (timeRange === 'today') {
      days = 1;
      // 今日按小时 - 模拟一天的使用模式（上午低，下午高，晚上中等）
      for (let i = 23; i >= 0; i--) {
        const d = new Date(today);
        d.setHours(d.getHours() - i);
        const hour = d.getHours();
        labels.push(String(hour).padStart(2, '0') + ':00');
        
        // 模拟一天的使用曲线：早上低，中午开始上升，下午高峰，晚上下降
        const hourFactor = hour < 6 ? 0.3 : hour < 9 ? 0.5 : hour < 12 ? 0.7 : hour < 18 ? 1.2 : hour < 22 ? 0.9 : 0.6;
        const baseCalls = 300;
        const variance = Math.random() * 200 - 100;
        callsData.push(Math.max(50, Math.floor(baseCalls * hourFactor + variance)));
        
        const baseTokens = 0.4;
        tokensData.push(parseFloat(Math.max(0.1, (baseTokens * hourFactor + (Math.random() * 0.2 - 0.1)).toFixed(2))));
      }
    } else if (timeRange === 'week') {
      days = 7;
      // 一周数据 - 工作日高，周末稍低
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        const dayOfWeek = d.getDay();
        labels.push(month + '-' + day);
        
        // 工作日（1-5）较高，周末（0,6）较低
        const weekdayFactor = (dayOfWeek >= 1 && dayOfWeek <= 5) ? 1.0 : 0.7;
        const trend = 1 + (days - 1 - i) * 0.05; // 轻微上升趋势
        const baseCalls = 10000;
        callsData.push(Math.floor(baseCalls * weekdayFactor * trend + Math.random() * 3000 - 1500));
        
        const baseTokens = 3.0;
        tokensData.push(parseFloat((baseTokens * weekdayFactor * trend + Math.random() * 1.0 - 0.5).toFixed(2)));
      }
    } else if (timeRange === 'month') {
      days = 30;
      // 一个月数据 - 有周期性波动和整体上升趋势
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        labels.push(month + '-' + day);
        
        // 周期性波动（每周） + 上升趋势
        const weekCycle = Math.sin((days - 1 - i) * 2 * Math.PI / 7) * 0.3;
        const trend = 1 + (days - 1 - i) * 0.02;
        const baseCalls = 18000;
        callsData.push(Math.floor(baseCalls * (1 + weekCycle) * trend + Math.random() * 4000 - 2000));
        
        const baseTokens = 5.5;
        tokensData.push(parseFloat((baseTokens * (1 + weekCycle) * trend + Math.random() * 2.0 - 1.0).toFixed(2)));
      }
    } else if (timeRange === 'quarter') {
      days = 90;
      // 按周显示 - 季度数据，有明显增长趋势
      for (let i = 12; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i * 7);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        labels.push(month + '-' + day);
        
        // 季度增长趋势
        const trend = 1 + (12 - i) * 0.08;
        const cycle = Math.sin(i * 0.5) * 0.2;
        const baseCalls = 45000;
        callsData.push(Math.floor(baseCalls * (1 + cycle) * trend + Math.random() * 8000 - 4000));
        
        const baseTokens = 18;
        tokensData.push(parseFloat((baseTokens * (1 + cycle) * trend + Math.random() * 4 - 2).toFixed(2)));
      }
    } else if (timeRange === 'year') {
      days = 365;
      // 按月显示 - 年度数据，有季节性波动
      for (let i = 11; i >= 0; i--) {
        const d = new Date(today);
        d.setMonth(d.getMonth() - i);
        labels.push(String(d.getMonth() + 1) + '月');
        
        // 季节性波动（模拟业务增长和季节性）
        const seasonal = Math.sin(i * Math.PI / 6) * 0.25; // 季节性波动
        const trend = 1 + (11 - i) * 0.12; // 年度增长趋势
        const baseCalls = 180000;
        callsData.push(Math.floor(baseCalls * (1 + seasonal) * trend + Math.random() * 30000 - 15000));
        
        const baseTokens = 60;
        tokensData.push(parseFloat((baseTokens * (1 + seasonal) * trend + Math.random() * 12 - 6).toFixed(2)));
      }
    } else {
      // custom 或其他情况，默认7天
      days = 7;
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        labels.push(month + '-' + day);
        
        const weekdayFactor = (d.getDay() >= 1 && d.getDay() <= 5) ? 1.0 : 0.7;
        const baseCalls = 10000;
        callsData.push(Math.floor(baseCalls * weekdayFactor + Math.random() * 3000 - 1500));
        
        const baseTokens = 3.0;
        tokensData.push(parseFloat((baseTokens * weekdayFactor + Math.random() * 1.0 - 0.5).toFixed(2)));
      }
    }

    return { labels, callsData, tokensData };
  }

  // 初始化图表
  function initCharts() {
    const timeRange = timeRangeSelect.value;
    const { labels, callsData, tokensData } = generateChartData(timeRange);
    
    // 更新统计卡片
    updateStatsCards(callsData, tokensData);

    // 销毁旧图表
    if (callsChart) callsChart.destroy();
    if (tokensChart) tokensChart.destroy();

    // 调用次数趋势图
    const callsCtx = document.getElementById('calls-trend-chart');
    if (callsCtx) {
      callsChart = new Chart(callsCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '调用次数',
            data: callsData,
            borderColor: '#3a86ff',
            backgroundColor: 'rgba(58, 134, 255, 0.1)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#3a86ff',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                label: function(context) {
                  return '调用次数: ' + context.parsed.y.toLocaleString();
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 11 },
                callback: function(value) {
                  return value.toLocaleString();
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              ticks: {
                font: { size: 11 }
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    }

    // 调用量趋势图
    const tokensCtx = document.getElementById('tokens-trend-chart');
    if (tokensCtx) {
      tokensChart = new Chart(tokensCtx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [{
            label: '调用量（百万tokens）',
            data: tokensData,
            borderColor: '#28a745',
            backgroundColor: 'rgba(40, 167, 69, 0.15)',
            borderWidth: 2,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            pointBackgroundColor: '#28a745',
            pointBorderColor: '#ffffff',
            pointBorderWidth: 2
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
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              padding: 12,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                label: function(context) {
                  return '调用量: ' + context.parsed.y + ' 百万tokens';
                }
              }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                font: { size: 11 },
                callback: function(value) {
                  return value + ' 百万';
                }
              },
              grid: {
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              ticks: {
                font: { size: 11 }
              },
              grid: {
                display: false
              }
            }
          }
        }
      });
    }
  }

  document.getElementById('apply-filter').addEventListener('click', function() {
    const timeRange = timeRangeSelect.value;
    if (timeRange === 'custom') {
      const startDate = document.getElementById('start-date').value;
      const endDate = document.getElementById('end-date').value;
      if (!startDate || !endDate) {
        alert('请选择完整的日期范围');
        return;
      }
      if (new Date(startDate) > new Date(endDate)) {
        alert('开始日期不能晚于结束日期');
        return;
      }
    }

    this.innerHTML = '<i class="bi bi-funnel-fill"></i> 筛选中...';
    this.disabled = true;
    
    // 更新图表
    setTimeout(() => {
      initCharts();
      this.innerHTML = '<i class="bi bi-funnel"></i> 应用筛选';
      this.disabled = false;
    }, 300);
  });

  document.getElementById('reset-filter').addEventListener('click', function() {
    timeRangeSelect.value = 'week';
    document.getElementById('user-filter').value = 'all';
    document.getElementById('start-date').value = '';
    document.getElementById('end-date').value = '';
    customRangeGroup.style.display = 'none';
  });

  // 图表操作
  document.getElementById('download-chart').addEventListener('click', function() {
    if (callsChart) {
      const url = callsChart.toBase64Image();
      const link = document.createElement('a');
      link.download = '调用次数趋势图.png';
      link.href = url;
      link.click();
    } else {
      alert('图表未加载，请稍候再试');
    }
  });

  document.getElementById('download-pie-chart').addEventListener('click', function() {
    if (tokensChart) {
      const url = tokensChart.toBase64Image();
      const link = document.createElement('a');
      link.download = '调用量趋势图.png';
      link.href = url;
      link.click();
    } else {
      alert('图表未加载，请稍候再试');
    }
  });

  // 用量清单查询
  const usageRecords = [
    { id: 'rVebsAA', datetime: '2025-11-27T16:14:21', user: '张三', account: '13800138001', level: '1', levelLabel: '1', accountType: 'enterprise', accountTypeLabel: 'VIP', transaction: 'consume', tokens: -5.03, balance: 1100 },
    { id: 'blEhxDv', datetime: '2025-11-27T14:14:21', user: '张三', account: '13800138001', level: '3', levelLabel: '3', accountType: 'personal', accountTypeLabel: '普通', transaction: 'consume', tokens: -5.03, balance: 1100 },
    { id: 'B8cRNVmc', datetime: '2025-11-26T23:29:20', user: '张三', account: '13800138001', level: '2', levelLabel: '2', accountType: 'trialAccount', accountTypeLabel: '试用', transaction: 'consume', tokens: -5.03, balance: 1100 },
    { id: 'mO6eXnOj', datetime: '2025-11-26T17:44:23', user: '李四', account: '13800138002', level: '1', levelLabel: '1', accountType: 'enterprise', accountTypeLabel: 'VIP', transaction: 'recharge', tokens: 8.50, balance: 2300 },
    { id: 'E6kOCTml', datetime: '2025-11-26T15:09:23', user: '李四', account: '13800138002', level: '1', levelLabel: '1', accountType: 'personal', accountTypeLabel: '普通', transaction: 'consume', tokens: -3.20, balance: 2291.5 },
    { id: 'Zmsx20dn', datetime: '2025-11-25T11:59:20', user: '王五', account: '13800138003', level: '3', levelLabel: '3', accountType: 'trialAccount', accountTypeLabel: '试用', transaction: 'consume', tokens: -1.25, balance: 320 },
    { id: 'B5OH3UF3', datetime: '2025-11-24T18:22:10', user: '赵六', account: '13800138004', level: '1', levelLabel: '1', accountType: 'enterprise', accountTypeLabel: 'VIP', transaction: 'consume', tokens: -6.80, balance: 980.2 },
    { id: '8kMqbnj5', datetime: '2025-11-24T16:29:22', user: '赵六', account: '13800138004', level: '2', levelLabel: '2', accountType: 'personal', accountTypeLabel: '普通', transaction: 'consume', tokens: -5.03, balance: 973.4 },
    { id: 'cP9vd8w1', datetime: '2025-11-23T09:15:03', user: '赵六', account: '13800138004', level: '2', levelLabel: '2', accountType: 'trialAccount', accountTypeLabel: '试用', transaction: 'recharge', tokens: 3.40, balance: 987.1 },
    { id: 'wx98Lsaa', datetime: '2025-11-22T21:45:33', user: '钱七', account: '13800138005', level: '1', levelLabel: '1', accountType: 'enterprise', accountTypeLabel: 'VIP', transaction: 'consume', tokens: -2.22, balance: 1500 }
  ];

  const usageTableBody = document.getElementById('usage-table-body');
  const usageEmptyState = document.getElementById('usage-empty-state');
  const usagePageIndicator = document.getElementById('usage-page-indicator');
  const usageTotalIndicator = document.getElementById('usage-total-indicator');
  const paginationContainer = document.getElementById('usage-pagination');
  const usageForm = document.getElementById('usage-list-form');
  const keywordInput = document.getElementById('keyword');
  const levelFilter = document.getElementById('user-type-filter-list');
  const accountTypeFilter = document.getElementById('account-type-filter');
  const transactionFilter = document.getElementById('transaction-filter');
  const startDateInput = document.getElementById('list-start-date');
  const endDateInput = document.getElementById('list-end-date');

  const PAGE_SIZE = 6;
  let filteredRecords = [...usageRecords];
  let currentPage = 1;
  let totalPages = 1;

  function formatDateTime(value) {
    return value.replace('T', ' ');
  }

  function formatTokens(value) {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(2)}`;
  }

  function applyUsageFilters() {
    const keyword = keywordInput.value.trim().toLowerCase();
    const levelValue = levelFilter.value;
    const accountValue = accountTypeFilter.value;
    const transactionValue = transactionFilter.value;
    const startDate = startDateInput.value ? new Date(`${startDateInput.value}T00:00:00`) : null;
    const endDate = endDateInput.value ? new Date(`${endDateInput.value}T23:59:59`) : null;

    filteredRecords = usageRecords.filter(record => {
      const matchKeyword = !keyword ||
        record.user.toLowerCase().includes(keyword) ||
        record.account.includes(keyword) ||
        record.id.toLowerCase().includes(keyword);
      const matchLevel = levelValue === 'all' || record.level === levelValue;
      const matchAccount = accountValue === 'all' || record.accountType === accountValue;
      const matchTransaction = transactionValue === 'all' || record.transaction === transactionValue;
      const recordDate = new Date(record.datetime);
      const matchStart = !startDate || recordDate >= startDate;
      const matchEnd = !endDate || recordDate <= endDate;
      return matchKeyword && matchLevel && matchAccount && matchTransaction && matchStart && matchEnd;
    });

    renderUsageTable(1);
  }

  function renderUsageTable(page = 1) {
    const totalRecords = filteredRecords.length;
    totalPages = Math.max(1, Math.ceil(totalRecords / PAGE_SIZE));
    currentPage = Math.min(Math.max(page, 1), totalPages);
    const start = (currentPage - 1) * PAGE_SIZE;
    const pageData = filteredRecords.slice(start, start + PAGE_SIZE);

    if (pageData.length === 0) {
      usageTableBody.innerHTML = '';
      usageEmptyState.style.display = 'block';
    } else {
      usageEmptyState.style.display = 'none';
      usageTableBody.innerHTML = pageData.map(record => `
        <tr>
          <td>${record.id}</td>
          <td>${formatDateTime(record.datetime)}</td>
          <td>${record.user}</td>
          <td>${record.account}</td>
          <td><span class="badge ${record.level}">${record.levelLabel}</span></td>
          <td>${record.accountTypeLabel}</td>
          <td><span class="transaction-badge ${record.transaction}">${record.transaction === 'consume' ? '消费' : '充入'}</span></td>
          <td><span class="token-amount ${record.tokens >= 0 ? 'positive' : 'negative'}">${formatTokens(record.tokens)}</span></td>
          <td>${record.balance.toFixed(2)}</td>
        </tr>
      `).join('');
    }

    usagePageIndicator.textContent = totalRecords ? `第 ${currentPage} 页` : '第 0 页';
    usageTotalIndicator.textContent = `共 ${totalRecords} 条记录`;
    updatePaginationButtons(totalRecords);
  }

  function updatePaginationButtons(totalRecords) {
    const prevBtn = paginationContainer.querySelector('[data-direction="prev"]');
    const nextBtn = paginationContainer.querySelector('[data-direction="next"]');
    const disableAll = totalRecords === 0;

    prevBtn.disabled = disableAll || currentPage === 1;
    nextBtn.disabled = disableAll || currentPage === totalPages;
  }

  usageForm.addEventListener('submit', function(event) {
    event.preventDefault();
    applyUsageFilters();
  });

  document.getElementById('list-reset').addEventListener('click', function() {
    usageForm.reset();
    levelFilter.value = 'all';
    accountTypeFilter.value = 'all';
    transactionFilter.value = 'all';
    applyUsageFilters();
  });

  paginationContainer.addEventListener('click', function(event) {
    const btn = event.target.closest('.pagination-btn');
    if (!btn || btn.disabled) {
      return;
    }
    if (btn.dataset.direction === 'prev' && currentPage > 1) {
      renderUsageTable(currentPage - 1);
    }
    if (btn.dataset.direction === 'next' && currentPage < totalPages) {
      renderUsageTable(currentPage + 1);
    }
  });

  document.getElementById('usage-export').addEventListener('click', function() {
    alert('已根据当前筛选条件导出用量清单');
  });

  document.getElementById('usage-download').addEventListener('click', function() {
    alert('开始下载用量清单报表');
  });

  renderUsageTable();

  // 初始化图表
  if (typeof Chart !== 'undefined') {
    setTimeout(() => {
      initCharts();
    }, 300);
  } else {
    // 如果 Chart.js 未加载，等待后重试
    let retryCount = 0;
    const retryTimer = setInterval(() => {
      retryCount++;
      if (typeof Chart !== 'undefined') {
        clearInterval(retryTimer);
        initCharts();
      } else if (retryCount > 20) {
        clearInterval(retryTimer);
        console.error('Chart.js 加载失败');
      }
    }, 100);
  }
});