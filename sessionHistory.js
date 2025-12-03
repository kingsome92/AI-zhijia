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
  
  // 模拟会话数据
  const sessions = [
    {
      id: "sess001",
      title: "关于产品功能的咨询",
      preview: "用户询问了产品的定价策略和功能比较...",
      user: "张三",
      userId: "user123",
      userAccount: "zhangsan@example.com",
      time: "2023-06-15 14:45",
      type: "text",
      startTime: "2023-06-15 14:30:22",
      endTime: "2023-06-15 14:45:10",
      violation: null, // 无违禁
      violationContent: null,
      messages: [
        {
          sender: "user",
          time: "14:30:22",
          content: "你好，我想了解一下你们产品的定价策略"
        },
        {
          sender: "ai",
          time: "14:31:05",
          content: "您好！感谢您的咨询。我们产品提供三种定价方案：基础版每月99元，专业版每月199元，企业版需要定制报价。您需要了解哪个版本的详细信息呢？"
        },
        {
          sender: "user",
          time: "14:33:18",
          content: "专业版和企业版有什么区别？"
        },
        {
          sender: "ai",
          time: "14:35:42",
          content: "专业版适合中小型企业，包含所有基础功能，支持最多50个用户。企业版则提供无限用户、专属服务器、高级安全功能和24/7专属技术支持。如果您需要更详细的功能对比，我可以发送一份详细的对比表给您。"
        }
      ],
      serviceCalls: [
        {
          time: "2023-06-15 14:31:05",
          serviceName: "产品信息查询服务",
          result: "成功",
          returnType: "text",
          returnContent: "返回了三种定价方案的详细信息",
          fileUrl: null
        },
        {
          time: "2023-06-15 14:35:42",
          serviceName: "功能对比服务",
          result: "成功",
          returnType: "file",
          returnContent: "功能对比表.pdf",
          fileUrl: "https://via.placeholder.com/800x600/3a86ff/ffffff?text=功能对比表.pdf"
        }
      ]
    },
    {
      id: "sess002",
      title: "技术支持请求",
      preview: "用户报告了一个登录问题，请求技术支持...",
      user: "李四",
      userId: "user456",
      userAccount: "lisi@example.com",
      time: "2023-06-14 09:30",
      type: "text",
      startTime: "2023-06-14 09:15:10",
      endTime: "2023-06-14 09:30:45",
      violation: {
        hasViolation: true,
        violations: [
          {
            content: "包含敏感词汇",
            position: "消息2",
            highlightedText: "密码"
          }
        ]
      },
      violationContent: "会话中包含敏感词汇：密码",
      messages: [
        {
          sender: "user",
          time: "09:15:10",
          content: "我无法登录我的账户，一直显示密码错误"
        },
        {
          sender: "ai",
          time: "09:16:22",
          content: "很抱歉听到您遇到登录问题。为了帮助您解决这个问题，请问您是否尝试过使用'忘记密码'功能重置密码？"
        },
        {
          sender: "user",
          time: "09:18:05",
          content: "是的，我重置了密码，但还是无法登录"
        },
        {
          sender: "ai",
          time: "09:20:15",
          content: "明白了。为了进一步排查问题，请您提供以下信息：1. 您使用的浏览器和版本 2. 是否在其他设备上尝试登录 3. 收到的具体错误信息（如果有）。同时，我们的技术团队已经收到通知，会尽快与您联系。"
        }
      ],
      serviceCalls: [
        {
          time: "2023-06-14 09:16:22",
          serviceName: "技术支持服务",
          result: "成功",
          returnType: "text",
          returnContent: "提供了密码重置建议",
          fileUrl: null
        }
      ]
    },
    {
      id: "sess003",
      title: "文件上传问题",
      preview: "用户上传PDF文件时遇到错误...",
      user: "王五",
      userId: "user789",
      userAccount: "wangwu@example.com",
      time: "2023-06-13 16:20",
      type: "file",
      startTime: "2023-06-13 16:10:05",
      endTime: "2023-06-13 16:20:30",
      violation: null,
      violationContent: null,
      messages: [
        {
          sender: "user",
          time: "16:10:05",
          content: "我尝试上传一个PDF文件，但系统一直显示'文件格式不支持'"
        },
        {
          sender: "ai",
          time: "16:11:20",
          content: "感谢您的反馈。我们支持PDF文件上传，但文件大小限制为10MB。请问您的文件大小是多少？另外，您可以尝试将文件另存为其他名称再上传试试。"
        },
        {
          sender: "user",
          time: "16:13:45",
          content: "文件只有5MB，我尝试重命名后还是不行"
        },
        {
          sender: "ai",
          time: "16:15:10",
          content: "我检查了系统日志，发现可能是文件编码问题。建议您尝试将PDF导出为新的文件再上传。如果问题仍然存在，您可以将文件发送至support@example.com，我们会手动为您处理。"
        }
      ],
      serviceCalls: [
        {
          time: "2023-06-13 16:11:20",
          serviceName: "文件验证服务",
          result: "成功",
          returnType: "text",
          returnContent: "文件格式验证通过",
          fileUrl: null
        },
        {
          time: "2023-06-13 16:15:10",
          serviceName: "系统日志查询服务",
          result: "成功",
          returnType: "text",
          returnContent: "查询到文件编码问题",
          fileUrl: null
        },
        {
          time: "2023-06-13 16:18:30",
          serviceName: "错误截图生成服务",
          result: "成功",
          returnType: "image",
          returnContent: "错误截图.png",
          fileUrl: "https://via.placeholder.com/800x600/dc3545/ffffff?text=错误截图"
        }
      ]
    },
    {
      id: "sess004",
      title: "语音输入测试",
      preview: "用户测试语音输入功能...",
      user: "赵六",
      userId: "user101",
      userAccount: "zhaoliu@example.com",
      time: "2023-06-12 11:05",
      type: "voice",
      startTime: "2023-06-12 10:50:15",
      endTime: "2023-06-12 11:05:40",
      violation: null,
      violationContent: null,
      messages: [
        {
          sender: "user",
          time: "10:50:15",
          content: "[语音消息] 测试语音输入功能"
        },
        {
          sender: "ai",
          time: "10:51:30",
          content: "已收到您的语音消息，内容为：'测试语音输入功能'。语音识别准确度如何？您对结果满意吗？"
        },
        {
          sender: "user",
          time: "10:53:22",
          content: "[语音消息] 识别很准确，但响应有点慢"
        },
        {
          sender: "ai",
          time: "10:55:05",
          content: "感谢您的反馈。我们正在优化语音处理速度，预计下个版本会有明显改善。您还有其他问题或建议吗？"
        }
      ],
      serviceCalls: [
        {
          time: "2023-06-12 10:51:30",
          serviceName: "语音识别服务",
          result: "成功",
          returnType: "text",
          returnContent: "识别结果：测试语音输入功能",
          fileUrl: null
        },
        {
          time: "2023-06-12 10:53:22",
          serviceName: "语音识别服务",
          result: "成功",
          returnType: "text",
          returnContent: "识别结果：识别很准确，但响应有点慢",
          fileUrl: null
        }
      ]
    }
  ];
  
  function setActiveTab(targetId) {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabPanels = document.querySelectorAll('.tab-panel');
    
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tabTarget === targetId);
    });
    
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === targetId);
    });
  }
  
  // 渲染会话列表
  const sessionList = document.querySelector('.session-list');
  
  function renderSessionList(filteredSessions = sessions) {
    sessionList.innerHTML = '';
    
    filteredSessions.forEach(session => {
      const sessionItem = document.createElement('div');
      sessionItem.className = 'session-item';
      sessionItem.dataset.id = session.id;
      
      const violationDisplay = session.violation && session.violation.hasViolation 
        ? `<span class="violation-badge" data-id="${session.id}">违禁</span>` 
        : '';
      
      sessionItem.innerHTML = `
        <div class="session-info">
          <div class="session-title">${session.title}</div>
          <div class="session-preview">${session.preview}</div>
        </div>
        <div class="session-user">${session.user}</div>
        <div class="session-time">${session.time}</div>
        <div class="session-type">${session.type === 'text' ? '文本对话' : session.type === 'voice' ? '语音对话' : '文件处理'}</div>
        <div class="session-violation">${violationDisplay}</div>
        <div class="session-actions">
          <button class="action-btn detail" title="查看详情" data-id="${session.id}">
            <i class="bi bi-eye"></i>
          </button>
          <button class="action-btn export" title="导出会话" data-id="${session.id}">
            <i class="bi bi-download"></i>
          </button>
        </div>
      `;
      
      sessionList.appendChild(sessionItem);
    });
    
    // 添加详情按钮事件
    document.querySelectorAll('.action-btn.detail').forEach(btn => {
      btn.addEventListener('click', function() {
        const sessionId = this.dataset.id;
        showSessionDetail(sessionId);
      });
    });
    
    // 添加导出按钮事件
    document.querySelectorAll('.action-btn.export').forEach(btn => {
      btn.addEventListener('click', function() {
        const sessionId = this.dataset.id;
        exportSession(sessionId);
      });
    });
    
    // 添加违禁标签点击事件
    document.querySelectorAll('.violation-badge').forEach(badge => {
      badge.addEventListener('click', function() {
        const sessionId = this.dataset.id;
        showViolationDetail(sessionId);
      });
    });
  }
  
  // 显示会话详情
  function showSessionDetail(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // 填充基本信息
    document.getElementById('detail-user-id').textContent = session.userId;
    document.getElementById('detail-username').textContent = session.user;
    document.getElementById('detail-start-time').textContent = session.startTime;
    document.getElementById('detail-end-time').textContent = session.endTime;
    document.getElementById('detail-type').textContent = 
      session.type === 'text' ? '文本对话' : session.type === 'voice' ? '语音对话' : '文件处理';
    
    // 填充对话内容（支持违禁内容高亮）
    const conversationContent = document.getElementById('conversation-content');
    conversationContent.innerHTML = '';
    
    session.messages.forEach(msg => {
      const messageDiv = document.createElement('div');
      messageDiv.className = `message ${msg.sender}`;
      
      let content = msg.content;
      // 如果有违禁内容，高亮显示
      if (session.violation && session.violation.hasViolation) {
        session.violation.violations.forEach(violation => {
          if (violation.highlightedText && content.includes(violation.highlightedText)) {
            content = content.replace(
              new RegExp(violation.highlightedText, 'g'),
              `<span class="violation-highlight">${violation.highlightedText}</span>`
            );
          }
        });
      }
      
      messageDiv.innerHTML = `
        <div class="message-header">
          <div class="message-avatar">${msg.sender === 'user' ? 'U' : 'AI'}</div>
          <div class="message-time">${msg.time}</div>
        </div>
        <div class="message-content">${content}</div>
      `;
      
      conversationContent.appendChild(messageDiv);
    });
    
    // 填充服务调用记录
    const serviceCallsContent = document.getElementById('service-calls-content');
    serviceCallsContent.innerHTML = '';
    
    if (session.serviceCalls && session.serviceCalls.length > 0) {
      session.serviceCalls.forEach(serviceCall => {
        const serviceCallDiv = document.createElement('div');
        serviceCallDiv.className = 'service-call-item';
        
        const returnTypeIcon = serviceCall.returnType === 'file' 
          ? '<i class="bi bi-file-earmark"></i>' 
          : serviceCall.returnType === 'image' 
          ? '<i class="bi bi-image"></i>' 
          : '<i class="bi bi-text-left"></i>';
        
        const resultClass = serviceCall.result === '成功' ? 'success' : 'failed';
        const fileActions = (serviceCall.returnType === 'file' || serviceCall.returnType === 'image') && serviceCall.fileUrl
          ? `<button class="view-file-btn" data-url="${serviceCall.fileUrl}" data-type="${serviceCall.returnType}" data-name="${serviceCall.returnContent}">
               <i class="bi bi-eye"></i> 查看
             </button>
             <button class="export-file-btn" data-url="${serviceCall.fileUrl}" data-name="${serviceCall.returnContent}">
               <i class="bi bi-download"></i> 导出
             </button>`
          : '';
        
        serviceCallDiv.innerHTML = `
          <div class="service-call-header">
            <div class="service-call-time">${serviceCall.time}</div>
            <div class="service-call-name">${serviceCall.serviceName}</div>
            <div class="service-call-result ${resultClass}">${serviceCall.result}</div>
          </div>
          <div class="service-call-body">
            <div class="service-call-return">
              <span class="return-type-icon">${returnTypeIcon}</span>
              <span class="return-type">${serviceCall.returnType === 'file' ? '文件' : serviceCall.returnType === 'image' ? '图片' : '文本'}</span>
              <span class="return-content">${serviceCall.returnContent}</span>
            </div>
            ${fileActions ? `<div class="service-call-actions">${fileActions}</div>` : ''}
          </div>
        `;
        
        serviceCallsContent.appendChild(serviceCallDiv);
      });
      
      // 添加文件查看和导出按钮事件
      document.querySelectorAll('.view-file-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const fileUrl = this.dataset.url;
          const fileType = this.dataset.type;
          const fileName = this.dataset.name;
          showFileViewer(fileUrl, fileType, fileName);
        });
      });
      
      document.querySelectorAll('.export-file-btn').forEach(btn => {
        btn.addEventListener('click', function() {
          const fileUrl = this.dataset.url;
          const fileName = this.dataset.name;
          exportFile(fileUrl, fileName);
        });
      });
    } else {
      serviceCallsContent.innerHTML = '<div class="no-service-calls">暂无服务调用记录</div>';
    }
    
    // 每次打开时默认展示对话内容
    setActiveTab('conversation-tab');
    
    // 显示模态框
    const modal = document.getElementById('session-detail-modal');
    modal.style.display = 'flex';
    
    // 导出当前会话按钮
    document.querySelector('.export-session-btn').addEventListener('click', () => {
      exportSession(sessionId);
    });
  }
  
  // 导出会话
  function exportSession(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session) return;
    
    // 构建导出内容
    let exportContent = `会话ID: ${session.id}\n`;
    exportContent += `用户: ${session.user} (${session.userId})\n`;
    exportContent += `开始时间: ${session.startTime}\n`;
    exportContent += `结束时间: ${session.endTime}\n`;
    exportContent += `会话类型: ${session.type === 'text' ? '文本对话' : session.type === 'voice' ? '语音对话' : '文件处理'}\n\n`;
    exportContent += `=== 对话内容 ===\n\n`;
    
    session.messages.forEach(msg => {
      exportContent += `[${msg.time}] ${msg.sender === 'user' ? '用户' : 'AI助手'}: ${msg.content}\n`;
    });
    
    // 创建Blob对象
    const blob = new Blob([exportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    
    // 创建下载链接
    const a = document.createElement('a');
    a.href = url;
    a.download = `会话记录_${session.id}_${session.user}.txt`;
    document.body.appendChild(a);
    a.click();
    
    // 清理
    setTimeout(() => {
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }, 0);
    
    // 显示成功提示
    alert(`会话记录已导出为: ${a.download}`);
  }
  
  // 显示违禁内容详情
  function showViolationDetail(sessionId) {
    const session = sessions.find(s => s.id === sessionId);
    if (!session || !session.violation || !session.violation.hasViolation) return;
    
    const violationContent = document.getElementById('violation-detail-content');
    violationContent.innerHTML = '';
    
    if (session.violation.violations && session.violation.violations.length > 0) {
      session.violation.violations.forEach((violation, index) => {
        const violationItem = document.createElement('div');
        violationItem.className = 'violation-item';
        violationItem.innerHTML = `
          <div class="violation-item-header">
            <span class="violation-index">违禁项 ${index + 1}</span>
            <span class="violation-position">位置: ${violation.position}</span>
          </div>
          <div class="violation-item-content">
            <div class="violation-label">违禁内容:</div>
            <div class="violation-text">${violation.content}</div>
          </div>
          <div class="violation-item-content">
            <div class="violation-label">高亮文本:</div>
            <div class="violation-text highlighted">${violation.highlightedText}</div>
          </div>
        `;
        violationContent.appendChild(violationItem);
      });
    } else {
      violationContent.innerHTML = `<div class="violation-text">${session.violationContent || '违禁内容详情'}</div>`;
    }
    
    const modal = document.getElementById('violation-modal');
    modal.style.display = 'flex';
  }
  
  // 显示文件/图片查看器
  function showFileViewer(fileUrl, fileType, fileName) {
    const viewerContent = document.getElementById('file-viewer-content');
    const viewerTitle = document.getElementById('file-viewer-title');
    const exportBtn = document.getElementById('export-file-btn');
    
    viewerTitle.textContent = fileName || '文件查看';
    exportBtn.style.display = 'block';
    exportBtn.dataset.url = fileUrl;
    exportBtn.dataset.name = fileName;
    
    if (fileType === 'image') {
      viewerContent.innerHTML = `<img src="${fileUrl}" alt="${fileName}" class="viewer-image" style="max-width: 100%; height: auto;">`;
    } else {
      viewerContent.innerHTML = `
        <div class="file-preview">
          <i class="bi bi-file-earmark" style="font-size: 3rem; color: var(--gray-400);"></i>
          <p>${fileName}</p>
          <p class="file-url">文件地址: <a href="${fileUrl}" target="_blank">${fileUrl}</a></p>
        </div>
      `;
    }
    
    const modal = document.getElementById('file-viewer-modal');
    modal.style.display = 'flex';
  }
  
  // 导出文件
  function exportFile(fileUrl, fileName) {
    // 创建下载链接
    const a = document.createElement('a');
    a.href = fileUrl;
    a.download = fileName || 'download';
    a.target = '_blank';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    
    alert(`文件 ${fileName} 导出成功`);
  }
  
  // 筛选会话
  function filterSessions() {
    const userAccountFilter = document.getElementById('user-account-filter').value.trim();
    const dateFilter = document.getElementById('date-filter').value;
    const typeFilter = document.getElementById('type-filter').value;
    
    let filtered = [...sessions];
    
    // 用户账号筛选（支持模糊匹配）
    if (userAccountFilter) {
      filtered = filtered.filter(s => 
        (s.userAccount && s.userAccount.toLowerCase().includes(userAccountFilter.toLowerCase())) ||
        (s.userId && s.userId.toLowerCase().includes(userAccountFilter.toLowerCase())) ||
        (s.user && s.user.includes(userAccountFilter))
      );
    }
    
    // 类型筛选
    if (typeFilter) {
      filtered = filtered.filter(s => s.type === typeFilter);
    }
    
    // 时间筛选 (简化处理，实际应用中需要更复杂的日期比较)
    if (dateFilter === 'today') {
      filtered = filtered.filter(s => s.time.includes('2023-06-15'));
    } else if (dateFilter === 'week') {
      // 假设本周是6月12日到6月18日
      filtered = filtered.filter(s => {
        const date = new Date(s.time.split(' ')[0]);
        return date >= new Date('2023-06-12') && date <= new Date('2023-06-18');
      });
    } else if (dateFilter === 'month') {
      filtered = filtered.filter(s => s.time.includes('2023-06'));
    }
    
    renderSessionList(filtered);
  }
  
  // 初始化页面
  renderSessionList();
  
  // 详情tab事件绑定
  document.querySelectorAll('.tab-btn').forEach(button => {
    button.addEventListener('click', function() {
      setActiveTab(this.dataset.tabTarget);
    });
  });
  
  // 添加筛选按钮事件
  document.querySelector('.search-btn').addEventListener('click', filterSessions);
  
  // 添加导出所有按钮事件
  document.querySelector('.export-btn').addEventListener('click', () => {
    // 简单实现：导出第一个会话
    if (sessions.length > 0) {
      exportSession(sessions[0].id);
    } else {
      alert('没有可导出的会话记录');
    }
  });
  
  // 模态框关闭事件
  document.querySelectorAll('.close-modal, .close-modal-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      // 关闭所有模态框
      document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
      });
    });
  });
  
  // 点击模态框外部关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        this.style.display = 'none';
      }
    });
  });
  
  // 文件查看器中的导出按钮
  document.getElementById('export-file-btn').addEventListener('click', function() {
    const fileUrl = this.dataset.url;
    const fileName = this.dataset.name;
    exportFile(fileUrl, fileName);
  });
  
  // 分页按钮事件
  document.querySelectorAll('.pagination-btn:not(:disabled)').forEach(btn => {
    btn.addEventListener('click', function() {
      if (this.classList.contains('active')) return;
      
      document.querySelector('.pagination-btn.active').classList.remove('active');
      this.classList.add('active');
      
      // 在实际应用中，这里应该加载对应页面的数据
      // 这里我们只是模拟重新渲染当前数据
      renderSessionList();
    });
  });
});