document.addEventListener("DOMContentLoaded", function() {
  // 加载头部
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
  
  // 加载底部
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

  // 任务列表交互逻辑
  const refreshBtn = document.getElementById('refresh-btn');
  const statusFilter = document.getElementById('status-filter');
  const searchInput = document.getElementById('search-input');
  let taskRows = document.querySelectorAll('.task-table tbody tr');
  
  // 刷新功能
  refreshBtn.addEventListener('click', function() {
    // 添加旋转动画
    const icon = refreshBtn.querySelector('i');
    icon.style.animation = 'spin 1s linear';
  
    // 模拟刷新数据（实际应该从API获取）
    setTimeout(() => {
      icon.style.animation = '';
      // 重新获取表格行（刷新后可能需要重新获取）
      taskRows = document.querySelectorAll('.task-table tbody tr');
      // 重新应用筛选
      applyFilters();
      // 这里可以添加实际的数据刷新逻辑
      console.log('刷新任务列表');
      // 可以重新加载数据或重新渲染表格
      alert('任务列表已刷新！');
    }, 1000);
  });
  
  // 筛选和搜索功能
  function applyFilters() {
    const statusValue = statusFilter.value;
    const searchValue = searchInput.value.trim().toLowerCase();
    
    taskRows.forEach(row => {
      // 新的表格结构：创建时间(0)、任务名称(1)、工具名称(2)、工具描述(3)、状态(4)、tokens(5)
      const statusBadge = row.cells[4].querySelector('.status-badge');
      if (!statusBadge) return;
      
      const rowStatus = statusBadge.textContent.trim();
      let statusMatch = true;
      let searchMatch = true;
      
      // 状态筛选
      if (statusValue !== 'all') {
        const statusMap = {
          'completed': '已完成',
          'processing': '进行中',
          'failed': '失败'
        };
        statusMatch = rowStatus === statusMap[statusValue];
      }
      
      // 搜索功能：支持按工具名搜索
      if (searchValue) {
        const taskName = row.cells[1].textContent.trim().toLowerCase();
        const toolName = row.cells[2].textContent.trim().toLowerCase();
        // 支持按任务名或工具名搜索
        searchMatch = taskName.includes(searchValue) || toolName.includes(searchValue);
      }
      
      row.style.display = (statusMatch && searchMatch) ? '' : 'none';
    });
  }
  
  statusFilter.addEventListener('change', applyFilters);
  searchInput.addEventListener('input', applyFilters);
});