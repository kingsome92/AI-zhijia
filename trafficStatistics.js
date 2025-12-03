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
  });

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
    setTimeout(() => {
      this.innerHTML = '<i class="bi bi-funnel"></i> 应用筛选';
      this.disabled = false;
      alert('筛选条件已应用');
    }, 800);
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
    alert('调用次数趋势图表已开始下载');
  });

  document.getElementById('download-pie-chart').addEventListener('click', function() {
    alert('调用量趋势图表已开始下载');
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
});