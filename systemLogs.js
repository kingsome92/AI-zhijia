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

  // 模拟日志数据
  const mockLogs = [
    { time: "2023-06-15 09:30:22", admin: "admin1", type: "login", content: "用户登录系统", ip: "192.168.1.100" },
    { time: "2023-06-15 10:15:45", admin: "admin2", type: "config", content: "修改了系统参数", ip: "192.168.1.101" },
    { time: "2023-06-15 11:22:10", admin: "admin1", type: "delete", content: "删除了用户数据", ip: "192.168.1.100" },
    { time: "2023-06-15 14:05:33", admin: "admin3", type: "create", content: "创建了新任务", ip: "192.168.1.102" },
    { time: "2023-06-16 08:45:12", admin: "admin2", type: "config", content: "更新了API配置", ip: "192.168.1.101" },
    { time: "2023-06-16 10:30:55", admin: "admin1", type: "login", content: "用户登录系统", ip: "192.168.1.100" },
    { time: "2023-06-16 13:15:20", admin: "admin3", type: "delete", content: "删除了会话记录", ip: "192.168.1.102" },
    { time: "2023-06-17 09:10:45", admin: "admin2", type: "create", content: "创建了新用户", ip: "192.168.1.101" },
  ];

  // 分页变量
  let currentPage = 1;
  const logsPerPage = 5;
  let filteredLogs = [...mockLogs];

  // DOM元素
  const logsBody = document.getElementById("logs-body");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const searchBtn = document.getElementById("search-btn");
  const exportBtn = document.getElementById("export-btn");
  const logTypeSelect = document.getElementById("log-type");
  const adminFilterSelect = document.getElementById("admin-filter");
  const startDateInput = document.getElementById("start-date");
  const endDateInput = document.getElementById("end-date");

  // 设置默认日期范围（最近7天）
  const today = new Date();
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(today.getDate() - 7);
  
  startDateInput.valueAsDate = sevenDaysAgo;
  endDateInput.valueAsDate = today;

  // 渲染日志表格
  function renderLogs() {
    const startIndex = (currentPage - 1) * logsPerPage;
    const endIndex = startIndex + logsPerPage;
    const paginatedLogs = filteredLogs.slice(startIndex, endIndex);
    
    logsBody.innerHTML = "";
    
    paginatedLogs.forEach(log => {
      const row = document.createElement("tr");
      
      // 根据操作类型设置样式
      let typeClass = "";
      if (log.type === "login") typeClass = "login-log";
      else if (log.type === "delete") typeClass = "delete-log";
      else if (log.type === "create") typeClass = "create-log";
      
      row.innerHTML = `
        <td>${log.time}</td>
        <td>${log.admin}</td>
        <td><span class="log-type ${typeClass}">${getTypeLabel(log.type)}</span></td>
        <td>${log.content}</td>
        <td>${log.ip}</td>
      `;
      
      logsBody.appendChild(row);
    });
    
    updatePagination();
  }

  // 更新分页信息
  function updatePagination() {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    pageInfo.textContent = `${currentPage}/${totalPages}`;
    
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // 获取操作类型标签
  function getTypeLabel(type) {
    const labels = {
      login: "登录",
      config: "配置",
      delete: "删除",
      create: "创建"
    };
    return labels[type] || type;
  }

  // 筛选日志
  function filterLogs() {
    const typeFilter = logTypeSelect.value;
    const adminFilter = adminFilterSelect.value;
    const startDate = startDateInput.value;
    const endDate = endDateInput.value;
    
    filteredLogs = mockLogs.filter(log => {
      // 过滤操作类型
      if (typeFilter !== "all" && log.type !== typeFilter) return false;
      
      // 过滤操作人
      if (adminFilter !== "all" && log.admin !== adminFilter) return false;
      
      // 过滤日期范围
      const logDate = new Date(log.time);
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59); // 包含结束日期的全天
      
      if (logDate < start || logDate > end) return false;
      
      return true;
    });
    
    currentPage = 1;
    renderLogs();
  }

  // 导出日志
  function exportLogs() {
    if (filteredLogs.length === 0) {
      alert("没有可导出的日志数据");
      return;
    }
    
    // 模拟导出操作
    alert(`正在导出 ${filteredLogs.length} 条日志数据...`);
    
    // 实际应用中这里应该是生成CSV或Excel文件
    console.log("导出日志:", filteredLogs);
  }

  // 事件监听
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderLogs();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredLogs.length / logsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderLogs();
    }
  });

  searchBtn.addEventListener("click", filterLogs);
  exportBtn.addEventListener("click", exportLogs);

  // 初始渲染
  filterLogs();
});