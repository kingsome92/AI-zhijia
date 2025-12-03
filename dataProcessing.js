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
  
  // 自定义日期范围显示/隐藏
  const dateRangeSelect = document.getElementById('date-range');
  const customDateGroup = document.querySelector('.custom-date');
  
  dateRangeSelect.addEventListener('change', function() {
    if (this.value === 'custom') {
      customDateGroup.style.display = 'flex';
    } else {
      customDateGroup.style.display = 'none';
    }
  });
  
  // 全选/取消全选
  const selectAllCheckbox = document.getElementById('select-all');
  const dataCheckboxes = document.querySelectorAll('.data-checkbox');
  
  selectAllCheckbox.addEventListener('change', function() {
    dataCheckboxes.forEach(checkbox => {
      checkbox.checked = this.checked;
    });
  });
  
  // 数据预览功能
  const viewButtons = document.querySelectorAll('.btn-view');
  const previewModal = document.getElementById('preview-modal');
  const closePreview = document.getElementById('close-preview');
  
  viewButtons.forEach(button => {
    button.addEventListener('click', function() {
      const row = this.closest('tr');
      const cells = row.querySelectorAll('td');
      
      // 填充预览数据
      document.getElementById('preview-id').textContent = cells[1].textContent;
      document.getElementById('preview-user').textContent = cells[3].textContent;
      document.getElementById('preview-time').textContent = cells[4].textContent;
      document.getElementById('preview-type').textContent = cells[2].querySelector('.badge').textContent;
      
      // 根据数据类型显示不同内容
      const previewContent = document.getElementById('preview-content');
      if (cells[2].querySelector('.badge').textContent === '文本') {
        previewContent.innerHTML = `<p>${cells[5].textContent}</p>`;
      } else {
        previewContent.innerHTML = `
          <div style="text-align: center; padding: 2rem;">
            <i class="bi bi-file-earmark" style="font-size: 3rem; color: var(--gray-400);"></i>
            <p style="margin-top: 1rem;">预览文件: ${cells[5].textContent}</p>
          </div>
        `;
      }
      
      // 显示模态框
      previewModal.style.display = 'flex';
    });
  });
  
  // 关闭预览
  closePreview.addEventListener('click', function() {
    previewModal.style.display = 'none';
  });
  
  // 点击模态框外部关闭
  previewModal.addEventListener('click', function(e) {
    if (e.target === previewModal) {
      previewModal.style.display = 'none';
    }
  });
  
  // 批量操作
  const exportSelectedBtn = document.getElementById('export-selected');
  const deleteSelectedBtn = document.getElementById('delete-selected');
  
  exportSelectedBtn.addEventListener('click', function() {
    const selectedRows = Array.from(dataCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.closest('tr'));
    
    if (selectedRows.length === 0) {
      alert('请至少选择一条数据');
      return;
    }
    
    const ids = selectedRows.map(row => row.querySelector('td:nth-child(2)').textContent);
    alert(`准备导出选中的数据: ${ids.join(', ')}`);
    // 这里可以添加实际的导出逻辑
  });
  
  deleteSelectedBtn.addEventListener('click', function() {
    const selectedRows = Array.from(dataCheckboxes)
      .filter(checkbox => checkbox.checked)
      .map(checkbox => checkbox.closest('tr'));
    
    if (selectedRows.length === 0) {
      alert('请至少选择一条数据');
      return;
    }
    
    if (confirm(`确定要删除选中的 ${selectedRows.length} 条数据吗？`)) {
      selectedRows.forEach(row => {
        row.style.opacity = '0.5';
        row.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
        // 实际应用中这里应该发送删除请求到服务器
      });
    }
  });
  
  // 预览中的删除按钮
  document.getElementById('delete-preview').addEventListener('click', function() {
    const id = document.getElementById('preview-id').textContent;
    if (confirm(`确定要删除数据 ${id} 吗？`)) {
      // 实际应用中这里应该发送删除请求到服务器
      const row = document.querySelector(`td:contains(${id})`).closest('tr');
      if (row) {
        row.style.opacity = '0.5';
        row.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
      }
      previewModal.style.display = 'none';
    }
  });
  
  // 预览中的下载按钮
  document.getElementById('download-preview').addEventListener('click', function() {
    const id = document.getElementById('preview-id').textContent;
    alert(`准备下载数据 ${id}`);
    // 实际应用中这里应该触发下载
  });
  
  // 应用筛选
  document.getElementById('apply-filters').addEventListener('click', function() {
    const dataType = document.getElementById('data-type').value;
    const dateRange = document.getElementById('date-range').value;
    let startDate, endDate;
    
    if (dateRange === 'custom') {
      startDate = document.getElementById('start-date').value;
      endDate = document.getElementById('end-date').value;
      
      if (!startDate || !endDate) {
        alert('请选择完整的日期范围');
        return;
      }
    }
    
    // 这里可以添加实际的筛选逻辑
    alert(`应用筛选: 数据类型=${dataType}, 时间范围=${dateRange}${dateRange === 'custom' ? `, 开始=${startDate}, 结束=${endDate}` : ''}`);
  });
});