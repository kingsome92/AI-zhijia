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

  // 公共字段数据（角色和类型）
  let roles = ["管理员", "教师", "学生"];
  let types = ["VIP", "普通", "试用"];

  // 模拟用户数据
  const mockUsers = [
    { id: 1, username: "张老师", email: "zhang@example.com", phone: "13800138001", level: 5, role: "教师", type: "VIP", source: "后台", registerDate: "2023-01-15 10:30:25", status: "active" },
    { id: 2, username: "李同学", email: "li@example.com", phone: "13800138002", level: 2, role: "学生", type: "普通", source: "系统", registerDate: "2023-02-20 14:15:30", status: "active" },
    { id: 3, username: "王管理员", email: "wang@example.com", phone: "13800138003", level: 10, role: "管理员", type: "VIP", source: "后台", registerDate: "2023-03-10 09:20:15", status: "active" },
    { id: 4, username: "赵同学", email: "zhao@example.com", phone: "13800138004", level: 1, role: "学生", type: "试用", source: "系统", registerDate: "2023-04-05 16:45:50", status: "disabled" },
    { id: 5, username: "钱老师", email: "qian@example.com", phone: "13800138005", level: 7, role: "教师", type: "VIP", source: "后台", registerDate: "2023-05-12 11:30:40", status: "active" },
    { id: 6, username: "孙访客", email: "sun@example.com", phone: "13800138006", level: 0, role: "学生", type: "试用", source: "系统", registerDate: "2023-06-18 13:25:10", status: "active" },
    { id: 7, username: "周同学", email: "zhou@example.com", phone: "13800138007", level: 3, role: "学生", type: "普通", source: "系统", registerDate: "2023-07-22 08:15:20", status: "disabled" },
    { id: 8, username: "吴老师", email: "wu@example.com", phone: "13800138008", level: 6, role: "教师", type: "VIP", source: "后台", registerDate: "2023-08-30 15:40:35", status: "active" },
    { id: 9, username: "郑同学", email: "zheng@example.com", phone: "13800138009", level: 2, role: "学生", type: "普通", source: "系统", registerDate: "2023-09-15 12:50:45", status: "active" },
    { id: 10, username: "冯管理员", email: "feng@example.com", phone: "13800138010", level: 9, role: "管理员", type: "VIP", source: "后台", registerDate: "2023-10-10 10:20:30", status: "active" }
  ];

  // 分页变量
  let currentPage = 1;
  const usersPerPage = 5;
  let filteredUsers = [...mockUsers];

  // DOM元素
  const userTableBody = document.getElementById("user-table-body");
  const searchInput = document.getElementById("search-input");
  const userTypeFilter = document.getElementById("user-type-filter");
  const statusFilter = document.getElementById("status-filter");
  const prevPageBtn = document.getElementById("prev-page");
  const nextPageBtn = document.getElementById("next-page");
  const pageInfo = document.getElementById("page-info");
  const addUserBtn = document.getElementById("add-user-btn");
  const addUserModal = document.getElementById("add-user-modal");
  const closeModalBtn = document.getElementById("close-modal");
  const addUserForm = document.getElementById("add-user-form");
  const selectAllCheckbox = document.getElementById("select-all-checkbox");
  const batchOperations = document.getElementById("batch-operations");
  const selectedCount = document.getElementById("selected-count");
  const manageSettingsBtn = document.getElementById("manage-settings-btn");
  const settingsModal = document.getElementById("settings-modal");
  const closeSettingsModal = document.getElementById("close-settings-modal");
  
  // 选中的用户ID集合
  let selectedUserIds = new Set();

  // 渲染用户表格
  function renderUsers() {
    userTableBody.innerHTML = "";
    
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
    
    if (usersToDisplay.length === 0) {
      userTableBody.innerHTML = `
        <tr>
          <td colspan="12" style="text-align: center; padding: 2rem;">没有找到匹配的用户</td>
        </tr>
      `;
      return;
    }
    
    usersToDisplay.forEach(user => {
      const row = document.createElement("tr");
      const isSelected = selectedUserIds.has(user.id);
      
      // 根据状态设置中文显示和样式
      const statusText = user.status === "active" ? "活跃" : "已禁用";
      const statusClass = user.status === "active" ? "active" : "disabled";
      
      // 来源标签样式
      const sourceClass = user.source === "后台" ? "backend" : "system";
      
      row.innerHTML = `
        <td>
          <input type="checkbox" class="user-checkbox" data-user-id="${user.id}" ${isSelected ? 'checked' : ''}>
        </td>
        <td>${user.id}</td>
        <td>${user.username}</td>
        <td>${user.email}</td>
        <td>${user.phone || '-'}</td>
        <td>${user.level || 0}</td>
        <td>${user.role || '-'}</td>
        <td>${user.type || '-'}</td>
        <td><span class="source-badge ${sourceClass}">${user.source || '系统'}</span></td>
        <td><span class="time-display">${user.registerDate || '-'}</span></td>
        <td><span class="status-badge ${statusClass}">${statusText}</span></td>
        <td>
          <button class="btn" onclick="editUser(${user.id})"><i class="bi bi-pencil"></i> 编辑</button>
          ${user.status === "active" ? 
            `<button class="btn warning" onclick="toggleUserStatus(${user.id}, 'disable')"><i class="bi bi-slash-circle"></i> 禁用</button>` : 
            `<button class="btn success" onclick="toggleUserStatus(${user.id}, 'enable')"><i class="bi bi-check-circle"></i> 启用</button>`}
          <button class="btn danger" onclick="deleteUser(${user.id})"><i class="bi bi-trash"></i> 删除</button>
        </td>
      `;
      
      userTableBody.appendChild(row);
    });
    
    // 绑定复选框事件
    document.querySelectorAll('.user-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', function() {
        const userId = parseInt(this.dataset.userId);
        if (this.checked) {
          selectedUserIds.add(userId);
        } else {
          selectedUserIds.delete(userId);
        }
        updateBatchOperations();
      });
    });
    
    // 更新全选复选框状态
    const allChecked = usersToDisplay.length > 0 && usersToDisplay.every(u => selectedUserIds.has(u.id));
    selectAllCheckbox.checked = allChecked;
    
    // 更新分页信息
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    pageInfo.textContent = `${currentPage}/${totalPages}`;
    
    // 禁用/启用分页按钮
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  // 更新批量操作栏
  function updateBatchOperations() {
    const count = selectedUserIds.size;
    if (count > 0) {
      batchOperations.style.display = 'flex';
      selectedCount.textContent = `已选择 ${count} 个用户`;
    } else {
      batchOperations.style.display = 'none';
    }
  }

  // 更新公共字段下拉选项
  function updatePublicFieldsSelects() {
    const userRoleSelect = document.getElementById("user-role");
    const userTypeSelect = document.getElementById("user-type");
    const batchRoleSelect = document.getElementById("batch-role-select");
    const batchTypeSelect = document.getElementById("batch-type-select");
    
    // 更新角色选项
    userRoleSelect.innerHTML = '<option value="">请选择角色</option>';
    batchRoleSelect.innerHTML = '<option value="">批量设置角色</option>';
    roles.forEach(role => {
      userRoleSelect.innerHTML += `<option value="${role}">${role}</option>`;
      batchRoleSelect.innerHTML += `<option value="${role}">${role}</option>`;
    });
    
    // 更新类型选项
    userTypeSelect.innerHTML = '<option value="">请选择类型</option>';
    batchTypeSelect.innerHTML = '<option value="">批量设置类型</option>';
    types.forEach(type => {
      userTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
      batchTypeSelect.innerHTML += `<option value="${type}">${type}</option>`;
    });
  }

  // 更新公共字段显示
  function updatePublicFieldsDisplay() {
    const rolesList = document.getElementById("roles-list");
    const typesList = document.getElementById("types-list");
    
    rolesList.innerHTML = roles.map(role => `<span class="tag">${role}</span>`).join('');
    typesList.innerHTML = types.map(type => `<span class="tag">${type}</span>`).join('');
  }

  // 过滤用户
  function filterUsers() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedType = userTypeFilter.value;
    const selectedStatus = statusFilter.value;
    
    filteredUsers = mockUsers.filter(user => {
      const matchesSearch = user.username.toLowerCase().includes(searchTerm) || 
                           user.email.toLowerCase().includes(searchTerm) ||
                           (user.phone && user.phone.includes(searchTerm));
      const matchesType = selectedType ? user.type === selectedType : true;
      const matchesStatus = selectedStatus ? user.status === selectedStatus : true;
      
      return matchesSearch && matchesType && matchesStatus;
    });
    
    currentPage = 1;
    renderUsers();
  }

  // 分页控制
  prevPageBtn.addEventListener("click", () => {
    if (currentPage > 1) {
      currentPage--;
      renderUsers();
    }
  });

  nextPageBtn.addEventListener("click", () => {
    const totalPages = Math.ceil(filteredUsers.length / usersPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderUsers();
    }
  });

  // 搜索和筛选事件监听
  searchInput.addEventListener("input", filterUsers);
  userTypeFilter.addEventListener("change", filterUsers);
  statusFilter.addEventListener("change", filterUsers);

  // 模态框控制
  addUserBtn.addEventListener("click", () => {
    addUserModal.classList.add("show");
  });

  closeModalBtn.addEventListener("click", () => {
    addUserModal.classList.remove("show");
  });

  // 点击模态框外部关闭
  window.addEventListener("click", (e) => {
    if (e.target === addUserModal) {
      addUserModal.classList.remove("show");
    }
  });

  // 添加用户表单提交
  addUserForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const username = document.getElementById("username").value;
    const email = document.getElementById("email").value;
    const phone = document.getElementById("phone").value;
    const level = parseInt(document.getElementById("level").value) || 0;
    const userRole = document.getElementById("user-role").value;
    const userType = document.getElementById("user-type").value;
    const password = document.getElementById("password").value;
    
    // 格式化当前时间（精确到时分秒）
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    const formattedDate = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    // 模拟添加用户
    const newUser = {
      id: mockUsers.length + 1,
      username: username,
      email: email,
      phone: phone,
      level: level,
      role: userRole,
      type: userType,
      source: "后台",
      registerDate: formattedDate,
      status: "active"
    };
    
    mockUsers.unshift(newUser);
    filterUsers();
    
    // 重置表单并关闭模态框
    addUserForm.reset();
    document.getElementById("level").value = 0; // 重置级别为默认值
    addUserModal.classList.remove("show");
    
    // 显示成功消息
    alert(`用户 ${username} 已成功添加！`);
  });

  // 全选/取消全选
  selectAllCheckbox.addEventListener("change", function() {
    const startIndex = (currentPage - 1) * usersPerPage;
    const endIndex = startIndex + usersPerPage;
    const usersToDisplay = filteredUsers.slice(startIndex, endIndex);
    
    if (this.checked) {
      usersToDisplay.forEach(user => selectedUserIds.add(user.id));
    } else {
      usersToDisplay.forEach(user => selectedUserIds.delete(user.id));
    }
    
    renderUsers();
    updateBatchOperations();
  });

  // 批量操作
  document.getElementById("batch-role-select").addEventListener("change", function() {
    if (this.value && selectedUserIds.size > 0) {
      if (confirm(`确定要将选中的 ${selectedUserIds.size} 个用户的角色设置为"${this.value}"吗？`)) {
        selectedUserIds.forEach(userId => {
          const user = mockUsers.find(u => u.id === userId);
          if (user) user.role = this.value;
        });
        filterUsers();
        selectedUserIds.clear();
        updateBatchOperations();
        this.value = "";
      }
    }
  });

  document.getElementById("batch-type-select").addEventListener("change", function() {
    if (this.value && selectedUserIds.size > 0) {
      if (confirm(`确定要将选中的 ${selectedUserIds.size} 个用户的类型设置为"${this.value}"吗？`)) {
        selectedUserIds.forEach(userId => {
          const user = mockUsers.find(u => u.id === userId);
          if (user) user.type = this.value;
        });
        filterUsers();
        selectedUserIds.clear();
        updateBatchOperations();
        this.value = "";
      }
    }
  });

  document.getElementById("batch-enable-btn").addEventListener("click", function() {
    if (selectedUserIds.size > 0) {
      if (confirm(`确定要启用选中的 ${selectedUserIds.size} 个用户吗？`)) {
        selectedUserIds.forEach(userId => {
          const user = mockUsers.find(u => u.id === userId);
          if (user) user.status = "active";
        });
        filterUsers();
        selectedUserIds.clear();
        updateBatchOperations();
      }
    }
  });

  document.getElementById("batch-disable-btn").addEventListener("click", function() {
    if (selectedUserIds.size > 0) {
      if (confirm(`确定要禁用选中的 ${selectedUserIds.size} 个用户吗？`)) {
        selectedUserIds.forEach(userId => {
          const user = mockUsers.find(u => u.id === userId);
          if (user) user.status = "disabled";
        });
        filterUsers();
        selectedUserIds.clear();
        updateBatchOperations();
      }
    }
  });

  document.getElementById("batch-delete-btn").addEventListener("click", function() {
    if (selectedUserIds.size > 0) {
      if (confirm(`确定要删除选中的 ${selectedUserIds.size} 个用户吗？此操作不可撤销。`)) {
        selectedUserIds.forEach(userId => {
          const index = mockUsers.findIndex(u => u.id === userId);
          if (index !== -1) {
            mockUsers.splice(index, 1);
          }
        });
        selectedUserIds.clear();
        filterUsers();
        updateBatchOperations();
      }
    }
  });

  document.getElementById("cancel-batch-btn").addEventListener("click", function() {
    selectedUserIds.clear();
    selectAllCheckbox.checked = false;
    updateBatchOperations();
    renderUsers();
  });

  // 用户设定管理
  manageSettingsBtn.addEventListener("click", function() {
    renderSettingsManagement();
    settingsModal.classList.add("show");
  });

  closeSettingsModal.addEventListener("click", function() {
    settingsModal.classList.remove("show");
  });

  document.getElementById("cancel-settings-btn").addEventListener("click", function() {
    settingsModal.classList.remove("show");
  });

  window.addEventListener("click", (e) => {
    if (e.target === settingsModal) {
      settingsModal.classList.remove("show");
    }
  });

  // 渲染设定管理界面
  function renderSettingsManagement() {
    const rolesList = document.getElementById("roles-management-list");
    const typesList = document.getElementById("types-management-list");
    
    rolesList.innerHTML = roles.map(role => `
      <div class="settings-item">
        <span class="settings-item-name">${role}</span>
        <div class="settings-item-actions">
          <button class="btn danger" onclick="removeRole('${role}')">
            <i class="bi bi-trash"></i> 删除
          </button>
        </div>
      </div>
    `).join('');
    
    typesList.innerHTML = types.map(type => `
      <div class="settings-item">
        <span class="settings-item-name">${type}</span>
        <div class="settings-item-actions">
          <button class="btn danger" onclick="removeType('${type}')">
            <i class="bi bi-trash"></i> 删除
          </button>
        </div>
      </div>
    `).join('');
  }

  // 添加角色
  document.getElementById("add-role-btn").addEventListener("click", function() {
    const input = document.getElementById("new-role-input");
    const roleName = input.value.trim();
    if (roleName && !roles.includes(roleName)) {
      roles.push(roleName);
      input.value = "";
      renderSettingsManagement();
      updatePublicFieldsDisplay();
      updatePublicFieldsSelects();
    } else if (roles.includes(roleName)) {
      alert("该角色已存在！");
    }
  });

  // 添加类型
  document.getElementById("add-type-btn").addEventListener("click", function() {
    const input = document.getElementById("new-type-input");
    const typeName = input.value.trim();
    if (typeName && !types.includes(typeName)) {
      types.push(typeName);
      input.value = "";
      renderSettingsManagement();
      updatePublicFieldsDisplay();
      updatePublicFieldsSelects();
    } else if (types.includes(typeName)) {
      alert("该类型已存在！");
    }
  });

  // 删除角色
  window.removeRole = function(roleName) {
    if (confirm(`确定要删除角色"${roleName}"吗？`)) {
      roles = roles.filter(r => r !== roleName);
      renderSettingsManagement();
      updatePublicFieldsDisplay();
      updatePublicFieldsSelects();
    }
  };

  // 删除类型
  window.removeType = function(typeName) {
    if (confirm(`确定要删除类型"${typeName}"吗？`)) {
      types = types.filter(t => t !== typeName);
      renderSettingsManagement();
      updatePublicFieldsDisplay();
      updatePublicFieldsSelects();
    }
  };

  // 初始化渲染
  updatePublicFieldsDisplay();
  updatePublicFieldsSelects();
  renderUsers();

  // 全局函数
  window.editUser = function(id) {
    const user = mockUsers.find(u => u.id === id);
    alert(`正在编辑用户: ${user.username}\nID: ${user.id}\n邮箱: ${user.email}`);
  };

  window.toggleUserStatus = function(id, action) {
    const user = mockUsers.find(u => u.id === id);
    user.status = action === "disable" ? "disabled" : "active";
    filterUsers();
    alert(`用户 ${user.username} 已${action === "disable" ? "禁用" : "启用"}`);
  };

  window.deleteUser = function(id) {
    if (confirm("确定要删除这个用户吗？此操作不可撤销。")) {
      const index = mockUsers.findIndex(u => u.id === id);
      if (index !== -1) {
        const username = mockUsers[index].username;
        mockUsers.splice(index, 1);
        selectedUserIds.delete(id);
        filterUsers();
        updateBatchOperations();
        alert(`用户 ${username} 已删除`);
      }
    }
  };
});