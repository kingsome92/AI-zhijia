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

  // 页面功能实现
  const applyFiltersBtn = document.getElementById('apply-filters');
  const generateReportBtn = document.getElementById('generate-report');
  const exportDataBtn = document.getElementById('export-data');
  const refreshDataBtn = document.getElementById('refresh-data');
  
  // 应用筛选按钮点击事件
  applyFiltersBtn.addEventListener('click', function() {
    const resourceType = document.getElementById('resource-type').value;
    const timeRange = document.getElementById('time-range').value;
    const agentFilter = document.getElementById('agent-filter').value;
    
    // 这里应该是实际的筛选逻辑，这里只是模拟
    console.log('应用筛选:', { resourceType, timeRange, agentFilter });
    
    // 显示加载状态
    applyFiltersBtn.innerHTML = '<i class="bi bi-hourglass"></i> 筛选中...';
    applyFiltersBtn.disabled = true;
    
    // 模拟API调用延迟
    setTimeout(() => {
      // 恢复按钮状态
      applyFiltersBtn.innerHTML = '<i class="bi bi-check-circle"></i> 应用筛选';
      applyFiltersBtn.disabled = false;
      
      // 显示成功提示
      showToast('筛选条件已应用', 'success');
    }, 1500);
  });
  
  // 生成报告按钮点击事件
  generateReportBtn.addEventListener('click', function() {
    // 显示加载状态
    generateReportBtn.innerHTML = '<i class="bi bi-hourglass"></i> 生成中...';
    generateReportBtn.disabled = true;
    
    // 模拟生成报告延迟
    setTimeout(() => {
      // 恢复按钮状态
      generateReportBtn.innerHTML = '<i class="bi bi-file-earmark-bar-graph"></i> 生成报告';
      generateReportBtn.disabled = false;
      
      // 显示成功提示
      showToast('报告已生成并下载', 'success');
      
      // 模拟下载
      const link = document.createElement('a');
      link.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent('资源使用报告 - ' + new Date().toLocaleDateString());
      link.download = '资源报告_' + new Date().toISOString().slice(0, 10) + '.txt';
      link.click();
    }, 2000);
  });
  
  // 导出数据按钮点击事件
  exportDataBtn.addEventListener('click', function() {
    // 显示加载状态
    exportDataBtn.innerHTML = '<i class="bi bi-hourglass"></i> 导出中...';
    exportDataBtn.disabled = true;
    
    // 模拟导出延迟
    setTimeout(() => {
      // 恢复按钮状态
      exportDataBtn.innerHTML = '<i class="bi bi-download"></i> 导出数据';
      exportDataBtn.disabled = false;
      
      // 显示成功提示
      showToast('数据已导出为CSV文件', 'success');
      
      // 模拟下载CSV
      const csvContent = "智能体,资源类型,使用量,占比,峰值时间,状态\n" +
        "聊天机器人,CPU,32%,32%,2023-06-15 14:30,正常\n" +
        "自然语言处理,内存,18GB,45%,2023-06-16 09:15,警告\n" +
        "计算机视觉,存储,420GB,68%,2023-06-14 16:45,临界\n" +
        "推荐系统,网络,1.5TB,28%,2023-06-13 11:20,正常\n" +
        "聊天机器人,内存,12GB,30%,2023-06-16 10:30,正常";
      
      const link = document.createElement('a');
      link.href = 'data:text/csv;charset=utf-8,' + encodeURIComponent(csvContent);
      link.download = '资源数据_' + new Date().toISOString().slice(0, 10) + '.csv';
      link.click();
    }, 1500);
  });
  
  // 刷新数据按钮点击事件
  refreshDataBtn.addEventListener('click', function() {
    // 显示加载状态
    refreshDataBtn.innerHTML = '<i class="bi bi-hourglass"></i> 刷新中...';
    refreshDataBtn.disabled = true;
    
    // 模拟刷新延迟
    setTimeout(() => {
      // 恢复按钮状态
      refreshDataBtn.innerHTML = '<i class="bi bi-arrow-clockwise"></i> 刷新';
      refreshDataBtn.disabled = false;
      
      // 显示成功提示
      showToast('数据已刷新', 'success');
    }, 1000);
  });
  
  // 显示Toast提示
  function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <i class="bi ${type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'}"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // 显示动画
    setTimeout(() => {
      toast.classList.add('show');
    }, 10);
    
    // 3秒后自动消失
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }
  
  // 添加CSS样式到head
  const style = document.createElement('style');
  style.textContent = `
    .toast {
      position: fixed;
      bottom: 20px;
      right: 20px;
      padding: 12px 16px;
      border-radius: var(--radius);
      background-color: var(--card-bg);
      box-shadow: var(--shadow);
      display: flex;
      align-items: center;
      gap: 10px;
      opacity: 0;
      transform: translateY(20px);
      transition: all 0.3s ease;
      z-index: 1000;
    }
    
    .toast.show {
      opacity: 1;
      transform: translateY(0);
    }
    
    .toast-success {
      border-left: 4px solid var(--success-color);
    }
    
    .toast-error {
      border-left: 4px solid var(--danger-color);
    }
    
    .toast i {
      font-size: 18px;
    }
    
    .toast-success i {
      color: var(--success-color);
    }
    
    .toast-error i {
      color: var(--danger-color);
    }
  `;
  document.head.appendChild(style);
  
  // 表格行点击效果
  const tableRows = document.querySelectorAll('tbody tr');
  tableRows.forEach(row => {
    row.addEventListener('click', function(e) {
      // 如果不是点击了按钮或链接
      if (!e.target.closest('button') && !e.target.closest('a')) {
        this.classList.toggle('active');
      }
    });
  });
  
  // 分页按钮点击事件
  const paginationBtns = document.querySelectorAll('.pagination .btn:not(.icon)');
  paginationBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // 移除所有active类
      paginationBtns.forEach(b => b.classList.remove('active'));
      
      // 为当前按钮添加active类
      if (!this.classList.contains('ellipsis')) {
        this.classList.add('active');
      }
      
      // 这里应该是实际的翻页逻辑，这里只是模拟
      console.log('切换到页码:', this.textContent);
    });
  });
});