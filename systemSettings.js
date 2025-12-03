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
  
  // 标签页切换功能
  const tabButtons = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  
  tabButtons.forEach(button => {
    button.addEventListener('click', () => {
      // 移除所有活动状态
      tabButtons.forEach(btn => btn.classList.remove('active'));
      tabContents.forEach(content => content.classList.remove('active'));
      
      // 添加当前活动状态
      button.classList.add('active');
      const tabId = button.getAttribute('data-tab');
      document.getElementById(tabId).classList.add('active');
    });
  });
  
  // 添加管理员模态框功能
  const addAdminBtn = document.getElementById('add-admin-btn');
  const addAdminModal = document.getElementById('add-admin-modal');
  const closeModalBtns = document.querySelectorAll('.close-btn');
  const confirmAddBtn = document.getElementById('confirm-add-btn');
  
  addAdminBtn.addEventListener('click', () => {
    addAdminModal.classList.add('active');
  });
  
  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      addAdminModal.classList.remove('active');
    });
  });
  
  // 点击模态框外部关闭
  addAdminModal.addEventListener('click', (e) => {
    if (e.target === addAdminModal) {
      addAdminModal.classList.remove('active');
    }
  });
  
  // 确认添加管理员
  confirmAddBtn.addEventListener('click', () => {
    const form = document.getElementById('add-admin-form');
    const password = document.getElementById('admin-password').value;
    const confirmPassword = document.getElementById('admin-confirm-password').value;
    
    if (password !== confirmPassword) {
      alert('两次输入的密码不一致！');
      return;
    }
    
    if (form.checkValidity()) {
      // 这里应该是实际的添加逻辑，这里只是模拟
      alert('管理员添加成功！');
      addAdminModal.classList.remove('active');
      form.reset();
    } else {
      alert('请填写所有必填字段！');
    }
  });
  
  // 删除管理员确认
  const deleteButtons = document.querySelectorAll('.delete-btn');
  
  deleteButtons.forEach(button => {
    button.addEventListener('click', (e) => {
      e.stopPropagation();
      const row = button.closest('tr');
      const username = row.querySelector('td:first-child').textContent;
      
      if (confirm(`确定要删除管理员 "${username}" 吗？此操作不可撤销。`)) {
        // 这里应该是实际的删除逻辑，这里只是模拟
        row.remove();
        alert(`管理员 "${username}" 已删除`);
      }
    });
  });
  
  // 系统参数表单提交
  const systemParamsForm = document.querySelector('.system-params-form');
  
  systemParamsForm.addEventListener('submit', (e) => {
    e.preventDefault();
    // 这里应该是实际的保存逻辑，这里只是模拟
    alert('系统参数已保存！');
  });
  
  // 表格行点击效果
  const tableRows = document.querySelectorAll('.admin-table tbody tr');
  
  tableRows.forEach(row => {
    row.addEventListener('click', (e) => {
      // 如果不是点击了按钮，则高亮行
      if (!e.target.closest('button')) {
        tableRows.forEach(r => r.classList.remove('selected'));
        row.classList.add('selected');
      }
    });
  });
});