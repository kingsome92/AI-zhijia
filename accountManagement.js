document.addEventListener("DOMContentLoaded", function() {
  // 加载公共组件
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

  // 模拟数据
  const mockRecords = [
    { id: "AC1001", name: "admin", operation: "create", time: "2023-05-15 09:30", operator: "系统", status: "active" },
    { id: "AC1002", name: "user1", operation: "disable", time: "2023-05-16 14:15", operator: "admin", status: "disabled" },
    { id: "AC1003", name: "user2", operation: "delete", time: "2023-05-17 11:20", operator: "admin", status: "deleted" },
    { id: "AC1004", name: "user3", operation: "enable", time: "2023-05-18 16:45", operator: "admin", status: "active" },
    { id: "AC1005", name: "user4", operation: "disable", time: "2023-05-19 10:10", operator: "admin", status: "disabled" },
    { id: "AC1006", name: "user5", operation: "create", time: "2023-05-20 13:25", operator: "admin", status: "active" },
    { id: "AC1007", name: "user6", operation: "delete", time: "2023-05-21 15:30", operator: "admin", status: "deleted" },
    { id: "AC1008", name: "user7", operation: "enable", time: "2023-05-22 09:15", operator: "admin", status: "active" }
  ];

  // DOM元素
  const recordsBody = document.getElementById("records-body");
  const operationTypeSelect = document.getElementById("operation-type");
  const timeRangeSelect = document.getElementById("time-range");
  const customDateGroup = document.querySelector(".custom-date");
  const searchBtn = document.getElementById("search-btn");
  const resetBtn = document.getElementById("reset-btn");
  const exportBtn = document.getElementById("export-btn");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const restoreModal = document.getElementById("restore-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const cancelRestoreBtn = document.getElementById("cancel-restore");
  const confirmRestoreBtn = document.getElementById("confirm-restore");
  const modalAccountId = document.getElementById("modal-account-id");
  const modalAccountName = document.getElementById("modal-account-name");
  const modalOperationType = document.getElementById("modal-operation-type");

  // 分页变量
  let currentPage = 1;
  const recordsPerPage = 5;
  let filteredRecords = [...mockRecords];

  // 初始化表格
  function renderTable(records, page) {
    recordsBody.innerHTML = "";
    
    const startIndex = (page - 1) * recordsPerPage;
    const endIndex = Math.min(startIndex + recordsPerPage, records.length);
    
    for (let i = startIndex; i < endIndex; i++) {
      const record = records[i];
      const row = document.createElement("tr");
      
      let statusClass = "";
      if (record.status === "active") statusClass = "status-active";
      else if (record.status === "disabled") statusClass = "status-disabled";
      else if (record.status === "deleted") statusClass = "status-deleted";
      
      row.innerHTML = `
        <td>${record.id}</td>
        <td>${record.name}</td>
        <td>${getOperationText(record.operation)}</td>
        <td>${record.time}</td>
        <td>${record.operator}</td>
        <td><span class="status-badge ${statusClass}">${getStatusText(record.status)}</span></td>
        <td>
          ${record.status !== "active" ? `<button class="action-btn restore-btn" data-id="${record.id}" data-name="${record.name}" data-operation="${record.operation}">
            <i class="bi bi-arrow-counterclockwise"></i> 恢复
          </button>` : ''}
          <button class="action-btn details-btn">
            <i class="bi bi-eye"></i> 详情
          </button>
        </td>
      `;
      
      recordsBody.appendChild(row);
    }
    
    // 更新分页信息
    const totalPages = Math.ceil(records.length / recordsPerPage);
    pageInfo.textContent = `${page}/${totalPages}`;
    
    // 更新分页按钮状态
    prevPageBtn.disabled = page === 1;
    nextPageBtn.disabled = page === totalPages || totalPages === 0;
  }

  // 获取操作类型文本
  function getOperationText(operation) {
    const operations = {
      "create": "创建账号",
      "delete": "删除账号",
      "disable": "禁用账号",
      "enable": "启用账号"
    };
    return operations[operation] || operation;
  }

  // 获取状态文本
  function getStatusText(status) {
    const statuses = {
      "active": "活跃",
      "disabled": "已禁用",
      "deleted": "已删除"
    };
    return statuses[status] || status;
  }

  // 筛选记录
  function filterRecords() {
    const operationType = operationTypeSelect.value;
    const timeRange = timeRangeSelect.value;
    
    filteredRecords = mockRecords.filter(record => {
      // 操作类型筛选
      if (operationType !== "all" && record.operation !== operationType) {
        return false;
      }
      
      // 时间范围筛选 (简化处理，实际应用中需要更精确的时间比较)
      if (timeRange === "today") {
        // 模拟今天的数据
        return ["AC1001", "AC1002", "AC1006"].includes(record.id);
      } else if (timeRange === "week") {
        // 模拟本周的数据
        return ["AC1001", "AC1002", "AC1003", "AC1004", "AC1005", "AC1006"].includes(record.id);
      } else if (timeRange === "month") {
        return true; // 模拟所有数据都是本月的
      }
      
      return true;
    });
    
    currentPage = 1;
    renderTable(filteredRecords, currentPage);
  }

  // 重置筛选
  function resetFilters() {
    operationTypeSelect.value = "all";
    timeRangeSelect.value = "today";
    customDateGroup.style.display = "none";
    document.getElementById("start-date").value = "";
    document.getElementById("end-date").value = "";
    filterRecords();
  }

  // 导出记录
  function exportRecords() {
    alert("记录导出功能将在实际应用中实现");
    // 实际应用中这里会生成CSV或Excel文件
  }

  // 显示恢复模态框
  function showRestoreModal(accountId, accountName, operationType) {
    modalAccountId.textContent = accountId;
    modalAccountName.textContent = accountName;
    modalOperationType.textContent = getOperationText(operationType);
    restoreModal.classList.add("show");
  }

  // 隐藏恢复模态框
  function hideRestoreModal() {
    restoreModal.classList.remove("show");
  }

  // 恢复账号
  function restoreAccount(accountId) {
    // 在实际应用中，这里会调用API恢复账号
    alert(`账号 ${accountId} 已恢复`);
    hideRestoreModal();
    
    // 更新模拟数据中的状态
    const record = mockRecords.find(r => r.id === accountId);
    if (record) {
      record.status = "active";
      record.operation = "enable";
      record.time = new Date().toISOString().replace("T", " ").substring(0, 16);
      record.operator = "admin";
    }
    
    filterRecords();
  }

  // 事件监听器
  timeRangeSelect.addEventListener("change", function() {
    customDateGroup.style.display = this.value === "custom" ? "flex" : "none";
  });

  searchBtn.addEventListener("click", filterRecords);
  resetBtn.addEventListener("click", resetFilters);
  exportBtn.addEventListener("click", exportRecords);

  prevPageBtn.addEventListener("click", function() {
    if (currentPage > 1) {
      currentPage--;
      renderTable(filteredRecords, currentPage);
    }
  });

  nextPageBtn.addEventListener("click", function() {
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderTable(filteredRecords, currentPage);
    }
  });

  // 使用事件委托处理动态生成的恢复按钮
  recordsBody.addEventListener("click", function(e) {
    if (e.target.closest(".restore-btn")) {
      const btn = e.target.closest(".restore-btn");
      const accountId = btn.dataset.id;
      const accountName = btn.dataset.name;
      const operationType = btn.dataset.operation;
      showRestoreModal(accountId, accountName, operationType);
    }
  });

  closeModalBtn.addEventListener("click", hideRestoreModal);
  cancelRestoreBtn.addEventListener("click", hideRestoreModal);
  confirmRestoreBtn.addEventListener("click", function() {
    restoreAccount(modalAccountId.textContent);
  });

  // 点击模态框外部关闭
  restoreModal.addEventListener("click", function(e) {
    if (e.target === restoreModal) {
      hideRestoreModal();
    }
  });

  // 初始化
  resetFilters();
});