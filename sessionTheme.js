// 定义 AI Conversation Web Component
class AIConversation extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.setAttribute('role', 'conversation');
  }
}
customElements.define('ai-conversation', AIConversation);

// 定义 AI Message Web Component
class AIMessage extends HTMLElement {
  constructor() {
    super();
  }

  static get observedAttributes() {
    return ['role'];
  }

  connectedCallback() {
    this.setAttribute('role', this.getAttribute('role') || 'assistant');
  }
}
customElements.define('ai-message', AIMessage);

// 定义 AI Prompt Input Web Component
class AIPromptInput extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.addEventListener('submit', (e) => {
      e.preventDefault();
      const input = this.querySelector('textarea');
      if (input && input.value.trim()) {
        this.dispatchEvent(new CustomEvent('message-send', {
          detail: { message: input.value.trim() },
          bubbles: true
        }));
      }
    });
  }
}
customElements.define('ai-prompt-input', AIPromptInput);

document.addEventListener("DOMContentLoaded", function() {
  // 加载头部（添加错误处理，避免阻塞主代码执行）
  fetch("header.html")
    .then(function(response) { 
      if (!response.ok) throw new Error('Header not found');
      return response.text(); 
    })
    .then(function(html) {
      const headerContainer = document.getElementById("header-container");
      if (headerContainer) {
        headerContainer.innerHTML = html;
        // 加载头部CSS
        var headerCSS = document.createElement("link");
        headerCSS.rel = "stylesheet";
        headerCSS.href = "header.css";
        document.head.appendChild(headerCSS);
      }
    })
    .catch(function(error) {
      console.warn('Header加载失败，继续执行:', error);
      // 即使加载失败也继续执行主代码
    });
  
  // 加载底部（添加错误处理，避免阻塞主代码执行）
  fetch("footer.html")
    .then(function(response) { 
      if (!response.ok) throw new Error('Footer not found');
      return response.text(); 
    })
    .then(function(html) {
      const footerContainer = document.getElementById("footer-container");
      if (footerContainer) {
        footerContainer.innerHTML = html;
        // 加载底部CSS
        var footerCSS = document.createElement("link");
        footerCSS.rel = "stylesheet";
        footerCSS.href = "footer.css";
        document.head.appendChild(footerCSS);
      }
    })
    .catch(function(error) {
      console.warn('Footer加载失败，继续执行:', error);
      // 即使加载失败也继续执行主代码
    });

  // 二级标签页切换
  const tabButtons = document.querySelectorAll('.tab-button');
  const tabPanels = document.querySelectorAll('.tab-panel');

  function activateTab(targetId) {
    tabButtons.forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === targetId);
    });
    tabPanels.forEach(panel => {
      panel.classList.toggle('active', panel.id === `tab-${targetId}`);
    });
  }

  tabButtons.forEach(button => {
    button.addEventListener('click', function() {
      if (this.classList.contains('active')) {
        return;
      }
      activateTab(this.dataset.tab);
    });
  });

  // 模板数据存储
  let templates = {
    'default': {
      name: '默认配置',
      sessionLimit: 10,
      sessionDuration: 30,
      historyRetention: 30,
      features: {
        fileUpload: true,
        voiceInput: false,
        multiLanguage: true,
        contextMemory: true
      },
      attributes: {
        assistantName: '智加助手',
        assistantPersona: '企业知识库顾问',
        conversationTone: 'professional',
        themeColor: '#3a86ff',
        openingMessage: '您好，我是您的智能助手，可以为您提供帮助。',
        inputPlaceholder: '请描述您的问题...'
      }
    },
    'minimal': {
      name: '最小功能集',
      sessionLimit: 5,
      sessionDuration: 15,
      historyRetention: 7,
      features: {
        fileUpload: false,
        voiceInput: false,
        multiLanguage: false,
        contextMemory: false
      },
      attributes: {
        assistantName: '简单助手',
        assistantPersona: '基础对话助手',
        conversationTone: 'professional',
        themeColor: '#6c757d',
        openingMessage: '您好，有什么可以帮您的吗？',
        inputPlaceholder: '请输入...'
      }
    },
    'full': {
      name: '完整功能集',
      sessionLimit: 20,
      sessionDuration: 60,
      historyRetention: 90,
      features: {
        fileUpload: true,
        voiceInput: true,
        multiLanguage: true,
        contextMemory: true
      },
      attributes: {
        assistantName: '全能助手',
        assistantPersona: '多功能智能助手',
        conversationTone: 'friendly',
        themeColor: '#28a745',
        openingMessage: '您好！我是您的全能智能助手，支持文件上传、语音输入等多种功能，随时为您服务！',
        inputPlaceholder: '您可以输入文字、上传文件或使用语音输入...'
      }
    },
    'custom1': {
      name: '客服质检模板',
      sessionLimit: 15,
      sessionDuration: 45,
      historyRetention: 60,
      features: {
        fileUpload: true,
        voiceInput: false,
        multiLanguage: false,
        contextMemory: true
      },
      attributes: {
        assistantName: '客服助手',
        assistantPersona: '专业客服质检助手',
        conversationTone: 'professional',
        themeColor: '#17a2b8',
        openingMessage: '您好，我是客服质检助手，可以帮助您进行服务质量检查。',
        inputPlaceholder: '请输入您的问题或上传相关文件...'
      }
    },
    'custom2': {
      name: '学习助理模板',
      sessionLimit: 10,
      sessionDuration: 30,
      historyRetention: 30,
      features: {
        fileUpload: true,
        voiceInput: true,
        multiLanguage: true,
        contextMemory: true
      },
      attributes: {
        assistantName: '学习助手',
        assistantPersona: '智能学习辅导助手',
        conversationTone: 'friendly',
        themeColor: '#ffc107',
        openingMessage: '你好！我是你的学习助手，可以帮助你解答问题、整理笔记，让学习更高效！',
        inputPlaceholder: '有什么学习问题需要帮助吗？'
      }
    }
  };
  
  // 当前选中的模板ID
  let currentTemplateId = 'default';
  
  // 加载模板配置到表单
  function loadTemplateConfig(templateId) {
    const template = templates[templateId];
    if (!template) return;
    
    currentTemplateId = templateId;
    
    // 加载基本配置
    document.getElementById('sessionLimit').value = template.sessionLimit;
    document.getElementById('sessionDuration').value = template.sessionDuration;
    document.getElementById('historyRetention').value = template.historyRetention;
    
    // 加载功能配置
    Object.keys(template.features).forEach(feature => {
      const checkbox = document.querySelector(`input[data-feature="${feature}"]`);
      if (checkbox) {
        checkbox.checked = template.features[feature];
      }
    });
    
    // 加载会话属性
    if (template.attributes) {
      document.getElementById('assistantName').value = template.attributes.assistantName || '';
      document.getElementById('assistantPersona').value = template.attributes.assistantPersona || '';
      document.getElementById('conversationTone').value = template.attributes.conversationTone || 'professional';
      document.getElementById('themeColor').value = template.attributes.themeColor || '#3a86ff';
      document.getElementById('themeColorValue').textContent = (template.attributes.themeColor || '#3a86ff').toUpperCase();
      document.getElementById('openingMessage').value = template.attributes.openingMessage || '';
      document.getElementById('inputPlaceholder').value = template.attributes.inputPlaceholder || '';
    }
    
    // 更新预览（延迟一下确保DOM已更新）
    setTimeout(() => {
      updatePreview();
    }, 100);
  }
  
  // 保存当前配置到模板
  function saveCurrentConfigToTemplate(templateId) {
    const template = templates[templateId];
    if (!template) return;
    
    // 保存基本配置
    template.sessionLimit = parseInt(document.getElementById('sessionLimit').value);
    template.sessionDuration = parseInt(document.getElementById('sessionDuration').value);
    template.historyRetention = parseInt(document.getElementById('historyRetention').value);
    
    // 保存功能配置
    Object.keys(template.features).forEach(feature => {
      const checkbox = document.querySelector(`input[data-feature="${feature}"]`);
      if (checkbox) {
        template.features[feature] = checkbox.checked;
      }
    });
    
    // 保存会话属性
    template.attributes = {
      assistantName: document.getElementById('assistantName').value,
      assistantPersona: document.getElementById('assistantPersona').value,
      conversationTone: document.getElementById('conversationTone').value,
      themeColor: document.getElementById('themeColor').value,
      openingMessage: document.getElementById('openingMessage').value,
      inputPlaceholder: document.getElementById('inputPlaceholder').value
    };
  }
  
  // 模板选择变化事件
  document.getElementById('template').addEventListener('change', function() {
    const selectedTemplate = this.value;
    if (selectedTemplate && templates[selectedTemplate]) {
      loadTemplateConfig(selectedTemplate);
      showAlert(`已切换到 ${templates[selectedTemplate].name} 模板`, 'success');
    }
  });
  
  // 应用模板按钮事件
  document.getElementById('applyTemplate').addEventListener('click', function() {
    const templateSelect = document.getElementById('template');
    const selectedTemplate = templateSelect.value;
    
    if (!selectedTemplate) {
      showAlert('请选择一个模板', 'warning');
      return;
    }
    
    loadTemplateConfig(selectedTemplate);
    showAlert(`已应用 ${templates[selectedTemplate].name} 模板`, 'success');
  });

  // 新增模板按钮事件
  document.getElementById('addTemplate').addEventListener('click', function() {
    openModal(document.getElementById('addTemplateModal'));
  });
  
  // 确认新增模板
  document.getElementById('confirmAddTemplate').addEventListener('click', function() {
    const templateName = document.getElementById('newTemplateName').value.trim();
    const templateDescription = document.getElementById('newTemplateDescription').value.trim();
    const baseTemplate = document.getElementById('newTemplateBase').value;
    
    if (!templateName) {
      showAlert('请输入模板名称', 'warning');
      return;
    }
    
    // 检查模板名称是否已存在
    const existingTemplate = Object.values(templates).find(t => t.name === templateName);
    if (existingTemplate) {
      showAlert('模板名称已存在，请使用其他名称', 'warning');
      return;
    }
    
    // 生成新的模板ID
    const newTemplateId = 'template_' + Date.now();
    
    // 如果选择了基础模板，则复制其配置
    let newTemplate;
    if (baseTemplate && templates[baseTemplate]) {
      newTemplate = JSON.parse(JSON.stringify(templates[baseTemplate]));
      newTemplate.name = templateName;
      newTemplate.description = templateDescription;
    } else {
      // 创建空白模板
      newTemplate = {
        name: templateName,
        description: templateDescription,
        sessionLimit: 10,
        sessionDuration: 30,
        historyRetention: 30,
        features: {
          fileUpload: false,
          voiceInput: false,
          multiLanguage: false,
          contextMemory: false
        },
        attributes: {
          assistantName: '',
          assistantPersona: '',
          conversationTone: 'professional',
          themeColor: '#3a86ff',
          openingMessage: '',
          inputPlaceholder: ''
        }
      };
    }
    
    // 添加到模板列表
    templates[newTemplateId] = newTemplate;
    
    // 添加到下拉选择框
    const templateSelect = document.getElementById('template');
    const option = document.createElement('option');
    option.value = newTemplateId;
    option.textContent = templateName;
    templateSelect.appendChild(option);
    
    // 选中新创建的模板
    templateSelect.value = newTemplateId;
    loadTemplateConfig(newTemplateId);
    
    // 清空表单
    document.getElementById('newTemplateName').value = '';
    document.getElementById('newTemplateDescription').value = '';
    document.getElementById('newTemplateBase').value = '';
    
    closeModal(document.getElementById('addTemplateModal'));
    showAlert(`模板 "${templateName}" 已创建`, 'success');
  });
  
  // 取消新增模板
  document.getElementById('cancelAddTemplate').addEventListener('click', function() {
    document.getElementById('newTemplateName').value = '';
    document.getElementById('newTemplateDescription').value = '';
    document.getElementById('newTemplateBase').value = '';
    closeModal(document.getElementById('addTemplateModal'));
  });
  
  // 保存为模板按钮事件
  document.getElementById('saveTemplate').addEventListener('click', function() {
    const templateSelect = document.getElementById('template');
    const selectedTemplate = templateSelect.value;
    
    if (!selectedTemplate) {
      showAlert('请先选择一个模板', 'warning');
      return;
    }
    
    // 保存当前配置到选中的模板
    saveCurrentConfigToTemplate(selectedTemplate);
    showAlert(`模板 "${templates[selectedTemplate].name}" 已保存`, 'success');
  });

  // 更新预览功能 - 使用AI Elements风格的聊天窗口
  function updatePreview() {
    try {
      const previewContainer = document.getElementById('aiChatPreview');
      if (!previewContainer) {
        console.warn('预览容器未找到: aiChatPreview，等待DOM加载...');
        // 如果容器不存在，延迟重试
        setTimeout(() => {
          const retryContainer = document.getElementById('aiChatPreview');
          if (retryContainer) {
            updatePreview();
          }
        }, 500);
        return;
      }
      
      // 获取当前配置（添加安全检查）
      const assistantNameEl = document.getElementById('assistantName');
      const assistantPersonaEl = document.getElementById('assistantPersona');
      const conversationToneEl = document.getElementById('conversationTone');
      const themeColorEl = document.getElementById('themeColor');
      const openingMessageEl = document.getElementById('openingMessage');
      const inputPlaceholderEl = document.getElementById('inputPlaceholder');
      
      const assistantName = assistantNameEl ? assistantNameEl.value : '智能助手';
      const assistantPersona = assistantPersonaEl ? assistantPersonaEl.value : '';
      const conversationTone = conversationToneEl ? conversationToneEl.value : 'professional';
      const themeColor = themeColorEl ? themeColorEl.value : '#3a86ff';
      const openingMessage = openingMessageEl ? openingMessageEl.value : '您好，我是您的智能助手。';
      const inputPlaceholder = inputPlaceholderEl ? inputPlaceholderEl.value : '请描述您的问题...';
      
      // 清空预览容器
      previewContainer.innerHTML = '';
    
      // 创建 AI Elements conversation 组件结构（与 demo 一致）
      const conversationElement = document.createElement('ai-conversation');
      conversationElement.id = 'previewConversation';
      
      // 创建消息内容区域
      const conversationContent = document.createElement('div');
      conversationContent.className = 'conversation-content';
      
      // 添加开场消息
      const openingMsg = document.createElement('ai-message');
      openingMsg.setAttribute('role', 'assistant');
      openingMsg.innerHTML = `
        <div class="message assistant">
          <div class="message-avatar">AI</div>
          <div>
            <div class="message-content">${escapeHtml(openingMessage)}</div>
            <div class="message-time">刚刚</div>
          </div>
        </div>
      `;
      conversationContent.appendChild(openingMsg);
      
      // 添加用户消息示例
      const userMsg = document.createElement('ai-message');
      userMsg.setAttribute('role', 'user');
      userMsg.innerHTML = `
        <div class="message user">
          <div class="message-avatar">U</div>
          <div>
            <div class="message-content">请帮我介绍一下这个功能</div>
            <div class="message-time">1分钟前</div>
          </div>
        </div>
      `;
      conversationContent.appendChild(userMsg);
      
      // 添加助手回复消息
      const assistantReply = document.createElement('ai-message');
      assistantReply.setAttribute('role', 'assistant');
      assistantReply.innerHTML = `
        <div class="message assistant">
          <div class="message-avatar">AI</div>
          <div>
            <div class="message-content">
              <div style="margin-bottom: 0.5rem;">这个功能主要包括以下几个方面：</div>
              <ul style="margin: 0.5rem 0; padding-left: 1.25rem; list-style-type: disc;">
                <li style="margin-bottom: 0.375rem;">模板管理：创建和管理多个会话模板</li>
                <li style="margin-bottom: 0.375rem;">实时预览：查看配置效果</li>
                <li style="margin-bottom: 0.375rem;">自定义配置：灵活调整各项参数</li>
              </ul>
            </div>
            <div class="message-time">1分钟前</div>
          </div>
        </div>
      `;
      conversationContent.appendChild(assistantReply);
      
      // 创建输入组件
      const promptInput = document.createElement('ai-prompt-input');
      
      // 获取功能开关状态
      const fileUploadEnabled = document.querySelector('[data-feature="fileUpload"]')?.checked || false;
      const voiceInputEnabled = document.querySelector('[data-feature="voiceInput"]')?.checked || false;
      const multiLanguageEnabled = document.querySelector('[data-feature="multiLanguage"]')?.checked || false;
      
      // 构建快捷功能按钮
      const quickActions = [];
      if (fileUploadEnabled) {
        quickActions.push({
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>',
          label: '+文件'
        });
      }
      if (voiceInputEnabled) {
        quickActions.push({
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg>',
          label: '语音输入'
        });
      }
      if (multiLanguageEnabled) {
        quickActions.push({
          icon: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>',
          label: '语言切换'
        });
      }
      
      // 构建输入区域 HTML
      const quickActionsHTML = quickActions.length > 0 ? `
        <div class="quick-actions">
          ${quickActions.map(action => `
            <button class="quick-action-btn" title="${action.label}">
              ${action.icon}
              ${action.label}
            </button>
          `).join('')}
          <button class="quick-action-btn more-btn" title="更多">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="5" r="1.5"></circle>
              <circle cx="12" cy="12" r="1.5"></circle>
              <circle cx="12" cy="19" r="1.5"></circle>
            </svg>
          </button>
        </div>
      ` : '';
      
      promptInput.innerHTML = `
        <div class="prompt-input-container">
          <div class="prompt-input-wrapper">
            <textarea 
              class="prompt-input" 
              placeholder="${escapeHtml(inputPlaceholder)}" 
              rows="1"
              readonly
            ></textarea>
          </div>
          <button class="send-button" type="button" title="发送">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
          <button class="add-button" type="button" title="更多选项">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>
        </div>
        ${quickActionsHTML}
      `;
      
      // 应用主题色到发送按钮
      const sendButton = promptInput.querySelector('.send-button');
      if (sendButton) {
        sendButton.style.background = `linear-gradient(135deg, ${themeColor} 0%, ${adjustColor(themeColor, -20)} 100%)`;
        sendButton.style.boxShadow = `0 2px 8px ${themeColor}4d`;
      }
      
      // 应用主题色到助手头像
      const assistantAvatars = conversationContent.querySelectorAll('.message.assistant .message-avatar');
      assistantAvatars.forEach(avatar => {
        avatar.style.background = `linear-gradient(135deg, ${themeColor} 0%, ${adjustColor(themeColor, -20)} 100%)`;
      });
      
      // 应用主题色到用户消息
      const userMessages = conversationContent.querySelectorAll('.message.user .message-content');
      userMessages.forEach(msg => {
        msg.style.background = `linear-gradient(135deg, ${themeColor} 0%, ${adjustColor(themeColor, -20)} 100%)`;
      });
      
      // 组装组件
      conversationElement.appendChild(conversationContent);
      conversationElement.appendChild(promptInput);
      
      previewContainer.appendChild(conversationElement);
      
      // 应用主题色到CSS变量
      previewContainer.style.setProperty('--theme-color', themeColor);
      
      // 确保预览容器可见
      const previewPanel = previewContainer.closest('.preview-panel');
      if (previewPanel) {
        previewPanel.style.display = 'block';
      }
      
      console.log('预览已更新，使用 AI Elements 样式');
    } catch (error) {
      console.error('更新预览时出错:', error);
      // 即使出错也尝试显示一个基本的预览
      const errorContainer = document.getElementById('aiChatPreview');
      if (errorContainer) {
        errorContainer.innerHTML = '<div style="padding: 2rem; text-align: center; color: #6b7280;">预览加载中...</div>';
      }
    }
  }
  
  // 辅助函数：调整颜色亮度
  function adjustColor(color, amount) {
    const usePound = color[0] === '#';
    const col = usePound ? color.slice(1) : color;
    const num = parseInt(col, 16);
    let r = (num >> 16) + amount;
    let g = (num >> 8 & 0x00FF) + amount;
    let b = (num & 0x0000FF) + amount;
    r = r > 255 ? 255 : r < 0 ? 0 : r;
    g = g > 255 ? 255 : g < 0 ? 0 : g;
    b = b > 255 ? 255 : b < 0 ? 0 : b;
    return (usePound ? '#' : '') + (r << 16 | g << 8 | b).toString(16).padStart(6, '0');
  }
  
  // 刷新预览按钮
  document.getElementById('refreshPreview').addEventListener('click', function() {
    updatePreview();
    showAlert('预览已刷新', 'success');
  });
  
  // 监听所有配置变化，自动更新预览
  const configInputs = [
    'assistantName', 'assistantPersona', 'conversationTone', 
    'themeColor', 'openingMessage', 'inputPlaceholder'
  ];
  
  configInputs.forEach(inputId => {
    const input = document.getElementById(inputId);
    if (input) {
      input.addEventListener('input', function() {
        if (inputId === 'themeColor') {
          document.getElementById('themeColorValue').textContent = this.value.toUpperCase();
        }
        updatePreview();
      });
      input.addEventListener('change', function() {
        if (inputId === 'themeColor') {
          document.getElementById('themeColorValue').textContent = this.value.toUpperCase();
        }
        updatePreview();
        // 保存到当前模板
        if (currentTemplateId) {
          saveCurrentConfigToTemplate(currentTemplateId);
        }
      });
    }
  });
  
  // 监听功能开关变化，自动更新预览
  const featureToggles = document.querySelectorAll('input[data-feature]');
  featureToggles.forEach(toggle => {
    toggle.addEventListener('change', function() {
      // 保存到当前模板
      if (currentTemplateId) {
        saveCurrentConfigToTemplate(currentTemplateId);
      }
      // 更新预览以显示新的功能按钮
      updatePreview();
    });
  });
  
  // 重置按钮事件
  document.getElementById('resetBtn').addEventListener('click', function() {
    if (confirm('确定要重置当前模板配置吗？')) {
      if (currentTemplateId && templates[currentTemplateId]) {
        loadTemplateConfig(currentTemplateId);
        showAlert('配置已重置为模板默认值', 'info');
      } else {
        document.getElementById('sessionLimit').value = 10;
        document.getElementById('sessionDuration').value = 30;
        document.getElementById('historyRetention').value = 30;
        setAllToggles(true);
        showAlert('配置已重置为默认值', 'info');
      }
    }
  });

  // 保存配置按钮事件
  document.getElementById('saveBtn').addEventListener('click', function() {
    // 保存当前配置到模板
    if (currentTemplateId) {
      saveCurrentConfigToTemplate(currentTemplateId);
    }
    
    // 在实际应用中，这里应该将配置保存到服务器
    showAlert('配置已保存', 'success');
  });

  // 辅助函数：设置所有开关状态
  function setAllToggles(state) {
    const toggles = document.querySelectorAll('.toggle-switch input');
    toggles.forEach(toggle => {
      toggle.checked = state;
    });
  }

  // 辅助函数：显示提示消息
  function showAlert(message, type) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    alert.style.position = 'fixed';
    alert.style.top = '20px';
    alert.style.right = '20px';
    alert.style.padding = '10px 20px';
    alert.style.borderRadius = '4px';
    alert.style.boxShadow = '0 2px 10px rgba(0,0,0,0.1)';
    alert.style.zIndex = '1000';
    alert.style.animation = 'fadeIn 0.3s';
    
    if (type === 'success') {
      alert.style.backgroundColor = '#d4edda';
      alert.style.color = '#155724';
      alert.style.border = '1px solid #c3e6cb';
    } else if (type === 'warning') {
      alert.style.backgroundColor = '#fff3cd';
      alert.style.color = '#856404';
      alert.style.border = '1px solid #ffeeba';
    } else if (type === 'info') {
      alert.style.backgroundColor = '#d1ecf1';
      alert.style.color = '#0c5460';
      alert.style.border = '1px solid #bee5eb';
    }
    
    document.body.appendChild(alert);
    
    setTimeout(() => {
      alert.style.animation = 'fadeOut 0.3s';
      setTimeout(() => {
        document.body.removeChild(alert);
      }, 300);
    }, 3000);
  }

  // ========== 模板在线编辑功能 ==========
  const templateEditorModal = document.getElementById('templateEditorModal');
  const editTemplateBtn = document.getElementById('editTemplate');
  const templateEditor = document.getElementById('templateEditor');
  const saveTemplateContentBtn = document.getElementById('saveTemplateContent');
  const previewTemplateBtn = document.getElementById('previewTemplate');
  
  // 打开模板编辑器
  editTemplateBtn.addEventListener('click', function() {
    const templateSelect = document.getElementById('template');
    const selectedTemplate = templateSelect.value;
    
    if (!selectedTemplate) {
      showAlert('请先选择一个模板', 'warning');
      return;
    }
    
    // 加载模板内容（示例）
    const templateContent = getTemplateContent(selectedTemplate);
    document.getElementById('templateName').value = templateSelect.options[templateSelect.selectedIndex].text;
    templateEditor.value = templateContent;
    
    openModal(templateEditorModal);
  });
  
  // 保存模板内容
  saveTemplateContentBtn.addEventListener('click', function() {
    const templateName = document.getElementById('templateName').value.trim();
    const templateContent = templateEditor.value.trim();
    
    if (!templateName) {
      showAlert('请输入模板名称', 'warning');
      return;
    }
    
    if (!templateContent) {
      showAlert('模板内容不能为空', 'warning');
      return;
    }
    
    // 在实际应用中，这里应该将模板保存到服务器
    saveTemplateToServer(templateName, templateContent);
    showAlert('模板已保存', 'success');
    closeModal(templateEditorModal);
  });
  
  // 预览模板
  previewTemplateBtn.addEventListener('click', function() {
    const templateContent = templateEditor.value;
    if (!templateContent.trim()) {
      showAlert('模板内容为空，无法预览', 'warning');
      return;
    }
    
    // 在新窗口中预览
    const previewWindow = window.open('', '_blank');
    previewWindow.document.write(`
      <html>
        <head>
          <title>模板预览</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            pre { background: #f5f5f5; padding: 15px; border-radius: 5px; }
          </style>
        </head>
        <body>
          <h2>模板预览</h2>
          <pre>${escapeHtml(templateContent)}</pre>
        </body>
      </html>
    `);
  });
  
  // 获取模板内容（示例数据）
  function getTemplateContent(templateId) {
    const templates = {
      'default': JSON.stringify({
        sessionLimit: 10,
        sessionDuration: 30,
        historyRetention: 30,
        features: {
          fileUpload: true,
          voiceInput: false,
          multiLanguage: true,
          contextMemory: true
        }
      }, null, 2),
      'minimal': JSON.stringify({
        sessionLimit: 5,
        sessionDuration: 15,
        historyRetention: 7,
        features: {
          fileUpload: false,
          voiceInput: false,
          multiLanguage: false,
          contextMemory: false
        }
      }, null, 2),
      'full': JSON.stringify({
        sessionLimit: 20,
        sessionDuration: 60,
        historyRetention: 90,
        features: {
          fileUpload: true,
          voiceInput: true,
          multiLanguage: true,
          contextMemory: true
        }
      }, null, 2)
    };
    return templates[templateId] || '';
  }
  
  // 保存模板到服务器（示例）
  function saveTemplateToServer(name, content) {
    // 实际应用中应该调用API
    console.log('保存模板:', name, content);
  }
  
  // ========== 违禁词词库管理功能 ==========
  // 违禁词数据存储（实际应用中应从服务器获取）
  let forbiddenWords = [
    { id: 1, word: '示例违禁词1', category: 'violence', addTime: '2024-01-15 10:30:00', remark: '' },
    { id: 2, word: '示例违禁词2', category: 'pornography', addTime: '2024-01-15 11:00:00', remark: '' },
    { id: 3, word: '示例违禁词3', category: 'politics', addTime: '2024-01-15 12:00:00', remark: '' }
  ];
  
  let currentPage = 1;
  const itemsPerPage = 10;
  let filteredWords = [...forbiddenWords];
  let selectedWordIds = new Set();
  
  // 初始化违禁词列表
  function initForbiddenWords() {
    renderWordsTable();
    updatePagination();
  }
  
  // 渲染违禁词表格
  function renderWordsTable() {
    const tbody = document.getElementById('wordsTableBody');
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const pageWords = filteredWords.slice(startIndex, endIndex);
    
    tbody.innerHTML = '';
    
    if (pageWords.length === 0) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; padding: 2rem; color: var(--gray-500);">暂无违禁词数据</td></tr>';
      return;
    }
    
    pageWords.forEach((word, index) => {
      const tr = document.createElement('tr');
      const categoryNames = {
        'violence': '暴力',
        'pornography': '色情',
        'politics': '政治',
        'advertising': '广告',
        'other': '其他'
      };
      
      tr.innerHTML = `
        <td>
          <input type="checkbox" class="word-checkbox" data-id="${word.id}">
        </td>
        <td>${startIndex + index + 1}</td>
        <td><strong>${escapeHtml(word.word)}</strong></td>
        <td><span class="category-badge category-${word.category}">${categoryNames[word.category] || '其他'}</span></td>
        <td>${word.addTime}</td>
        <td>
          <div class="word-actions">
            <button class="btn btn-secondary btn-sm edit-word-btn" data-id="${word.id}">
              <i class="bi bi-pencil"></i> 编辑
            </button>
            <button class="btn btn-danger btn-sm delete-word-btn" data-id="${word.id}">
              <i class="bi bi-trash"></i> 删除
            </button>
          </div>
        </td>
      `;
      
      tbody.appendChild(tr);
    });
    
    // 绑定事件
    bindWordEvents();
  }
  
  // 绑定违禁词相关事件
  function bindWordEvents() {
    // 全选/取消全选
    const selectAllCheckbox = document.getElementById('selectAllWords');
    const wordCheckboxes = document.querySelectorAll('.word-checkbox');
    
    selectAllCheckbox.addEventListener('change', function() {
      wordCheckboxes.forEach(cb => {
        cb.checked = this.checked;
        if (this.checked) {
          selectedWordIds.add(parseInt(cb.dataset.id));
        } else {
          selectedWordIds.delete(parseInt(cb.dataset.id));
        }
      });
    });
    
    // 单个选择
    wordCheckboxes.forEach(cb => {
      cb.addEventListener('change', function() {
        const id = parseInt(this.dataset.id);
        if (this.checked) {
          selectedWordIds.add(id);
        } else {
          selectedWordIds.delete(id);
          selectAllCheckbox.checked = false;
        }
      });
    });
    
    // 编辑按钮
    document.querySelectorAll('.edit-word-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        editWord(id);
      });
    });
    
    // 删除按钮
    document.querySelectorAll('.delete-word-btn').forEach(btn => {
      btn.addEventListener('click', function() {
        const id = parseInt(this.dataset.id);
        deleteWord(id);
      });
    });
  }
  
  // 添加违禁词
  document.getElementById('addWordBtn').addEventListener('click', function() {
    openAddWordModal();
  });
  
  // 打开添加违禁词模态框
  function openAddWordModal(wordId = null) {
    const modal = document.getElementById('wordModal');
    const title = document.getElementById('wordModalTitle');
    const wordInput = document.getElementById('wordInput');
    const wordCategory = document.getElementById('wordCategory');
    const wordRemark = document.getElementById('wordRemark');
    
    if (wordId) {
      // 编辑模式
      const word = forbiddenWords.find(w => w.id === wordId);
      if (word) {
        title.innerHTML = '<i class="bi bi-pencil-square"></i> 编辑违禁词';
        wordInput.value = word.word;
        wordCategory.value = word.category;
        wordRemark.value = word.remark || '';
        wordInput.dataset.editId = wordId;
      }
    } else {
      // 添加模式
      title.innerHTML = '<i class="bi bi-plus-circle"></i> 添加违禁词';
      wordInput.value = '';
      wordCategory.value = 'other';
      wordRemark.value = '';
      delete wordInput.dataset.editId;
    }
    
    openModal(modal);
  }
  
  // 编辑违禁词
  function editWord(id) {
    openAddWordModal(id);
  }
  
  // 删除违禁词
  function deleteWord(id) {
    if (confirm('确定要删除这个违禁词吗？')) {
      forbiddenWords = forbiddenWords.filter(w => w.id !== id);
      selectedWordIds.delete(id);
      applyFilters();
      showAlert('违禁词已删除', 'success');
    }
  }
  
  // 保存违禁词
  document.getElementById('saveWordBtn').addEventListener('click', function() {
    const wordInput = document.getElementById('wordInput');
    const wordCategory = document.getElementById('wordCategory');
    const wordRemark = document.getElementById('wordRemark');
    const words = wordInput.value.trim().split('\n').filter(w => w.trim());
    
    if (words.length === 0) {
      showAlert('请输入违禁词', 'warning');
      return;
    }
    
    const editId = wordInput.dataset.editId;
    
    if (editId) {
      // 编辑模式
      const word = forbiddenWords.find(w => w.id === parseInt(editId));
      if (word) {
        word.word = words[0];
        word.category = wordCategory.value;
        word.remark = wordRemark.value.trim();
        showAlert('违禁词已更新', 'success');
      }
    } else {
      // 添加模式
      const maxId = forbiddenWords.length > 0 ? Math.max(...forbiddenWords.map(w => w.id)) : 0;
      const now = new Date().toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }).replace(/\//g, '-');
      
      words.forEach((word, index) => {
        forbiddenWords.push({
          id: maxId + index + 1,
          word: word.trim(),
          category: wordCategory.value,
          addTime: now,
          remark: wordRemark.value.trim()
        });
      });
      
      showAlert(`已添加 ${words.length} 个违禁词`, 'success');
    }
    
    closeModal(document.getElementById('wordModal'));
    applyFilters();
  });
  
  // 取消添加/编辑
  document.getElementById('cancelWordBtn').addEventListener('click', function() {
    closeModal(document.getElementById('wordModal'));
  });
  
  // 批量导入
  document.getElementById('importWordsBtn').addEventListener('click', function() {
    openModal(document.getElementById('importModal'));
  });
  
  // 切换导入方式
  document.querySelectorAll('input[name="importType"]').forEach(radio => {
    radio.addEventListener('change', function() {
      const textArea = document.getElementById('textImportArea');
      const fileArea = document.getElementById('fileImportArea');
      
      if (this.value === 'text') {
        textArea.style.display = 'block';
        fileArea.style.display = 'none';
      } else {
        textArea.style.display = 'none';
        fileArea.style.display = 'block';
      }
    });
  });
  
  // 确认导入
  document.getElementById('confirmImportBtn').addEventListener('click', function() {
    const importType = document.querySelector('input[name="importType"]:checked').value;
    const category = document.getElementById('importCategory').value;
    let words = [];
    
    if (importType === 'text') {
      const text = document.getElementById('importText').value.trim();
      if (!text) {
        showAlert('请输入要导入的违禁词', 'warning');
        return;
      }
      words = text.split('\n').filter(w => w.trim());
    } else {
      const fileInput = document.getElementById('importFile');
      if (!fileInput.files.length) {
        showAlert('请选择要导入的文件', 'warning');
        return;
      }
      
      const file = fileInput.files[0];
      const reader = new FileReader();
      
      reader.onload = function(e) {
        const content = e.target.result;
        words = content.split('\n').filter(w => w.trim());
        importWords(words, category);
      };
      
      reader.readAsText(file);
      return;
    }
    
    importWords(words, category);
  });
  
  // 导入违禁词
  function importWords(words, category) {
    if (words.length === 0) {
      showAlert('没有有效的违禁词', 'warning');
      return;
    }
    
    const maxId = forbiddenWords.length > 0 ? Math.max(...forbiddenWords.map(w => w.id)) : 0;
    const now = new Date().toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    }).replace(/\//g, '-');
    
    let addedCount = 0;
    words.forEach((word, index) => {
      const wordText = word.trim();
      if (wordText && !forbiddenWords.some(w => w.word === wordText)) {
        forbiddenWords.push({
          id: maxId + index + addedCount + 1,
          word: wordText,
          category: category,
          addTime: now,
          remark: ''
        });
        addedCount++;
      }
    });
    
    closeModal(document.getElementById('importModal'));
    document.getElementById('importText').value = '';
    document.getElementById('importFile').value = '';
    applyFilters();
    showAlert(`成功导入 ${addedCount} 个违禁词`, 'success');
  }
  
  // 取消导入
  document.getElementById('cancelImportBtn').addEventListener('click', function() {
    closeModal(document.getElementById('importModal'));
  });
  
  // 批量导出
  document.getElementById('exportWordsBtn').addEventListener('click', function() {
    const wordsToExport = filteredWords.length > 0 ? filteredWords : forbiddenWords;
    
    if (wordsToExport.length === 0) {
      showAlert('没有可导出的违禁词', 'warning');
      return;
    }
    
    const content = wordsToExport.map(w => w.word).join('\n');
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `违禁词库_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showAlert(`已导出 ${wordsToExport.length} 个违禁词`, 'success');
  });
  
  // 清空词库
  document.getElementById('clearWordsBtn').addEventListener('click', function() {
    if (confirm('确定要清空所有违禁词吗？此操作不可恢复！')) {
      forbiddenWords = [];
      selectedWordIds.clear();
      applyFilters();
      showAlert('词库已清空', 'info');
    }
  });
  
  // 搜索违禁词
  document.getElementById('wordSearch').addEventListener('input', function() {
    applyFilters();
  });
  
  // 分类筛选
  document.getElementById('showCategoryFilter').addEventListener('change', function() {
    const categoryFilter = document.getElementById('categoryFilter');
    categoryFilter.disabled = !this.checked;
    if (!this.checked) {
      categoryFilter.value = '';
    }
    applyFilters();
  });
  
  document.getElementById('categoryFilter').addEventListener('change', function() {
    applyFilters();
  });
  
  // 应用筛选
  function applyFilters() {
    const searchText = document.getElementById('wordSearch').value.toLowerCase().trim();
    const categoryFilter = document.getElementById('categoryFilter');
    const useCategoryFilter = document.getElementById('showCategoryFilter').checked;
    const selectedCategory = useCategoryFilter ? categoryFilter.value : '';
    
    filteredWords = forbiddenWords.filter(word => {
      const matchSearch = !searchText || word.word.toLowerCase().includes(searchText);
      const matchCategory = !selectedCategory || word.category === selectedCategory;
      return matchSearch && matchCategory;
    });
    
    currentPage = 1;
    renderWordsTable();
    updatePagination();
  }
  
  // 更新分页
  function updatePagination() {
    const totalWords = filteredWords.length;
    const totalPages = Math.ceil(totalWords / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage + 1;
    const endIndex = Math.min(currentPage * itemsPerPage, totalWords);
    
    document.getElementById('totalWords').textContent = totalWords;
    document.getElementById('currentPageStart').textContent = totalWords > 0 ? startIndex : 0;
    document.getElementById('currentPageEnd').textContent = endIndex;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage >= totalPages;
    
    // 更新页码
    const pageNumbers = document.getElementById('pageNumbers');
    pageNumbers.innerHTML = '';
    
    const maxPages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPages / 2));
    let endPage = Math.min(totalPages, startPage + maxPages - 1);
    
    if (endPage - startPage < maxPages - 1) {
      startPage = Math.max(1, endPage - maxPages + 1);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = 'page-number';
      if (i === currentPage) {
        pageBtn.classList.add('active');
      }
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => {
        currentPage = i;
        renderWordsTable();
        updatePagination();
      });
      pageNumbers.appendChild(pageBtn);
    }
  }
  
  // 上一页
  document.getElementById('prevPage').addEventListener('click', function() {
    if (currentPage > 1) {
      currentPage--;
      renderWordsTable();
      updatePagination();
    }
  });
  
  // 下一页
  document.getElementById('nextPage').addEventListener('click', function() {
    const totalPages = Math.ceil(filteredWords.length / itemsPerPage);
    if (currentPage < totalPages) {
      currentPage++;
      renderWordsTable();
      updatePagination();
    }
  });
  
  // ========== 违禁词处理策略 ==========
  const strategyRadios = document.querySelectorAll('input[name="forbiddenWordStrategy"]');
  strategyRadios.forEach(radio => {
    radio.addEventListener('change', function() {
      const strategy = this.value;
      // 在实际应用中，这里应该将策略保存到服务器
      console.log('违禁词处理策略已更改为:', strategy === 'replace' ? '替换处理' : '拒绝处理');
      showAlert('处理策略已更新', 'success');
    });
  });
  
  // ========== 模态框通用功能 ==========
  function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
  
  function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }
  
  // 关闭按钮事件
  document.querySelectorAll('.modal-close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      const modal = this.closest('.modal');
      closeModal(modal);
    });
  });
  
  // 点击模态框外部关闭
  document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', function(e) {
      if (e.target === this) {
        closeModal(this);
      }
    });
  });
  
  // ESC键关闭模态框
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(modal => {
        closeModal(modal);
      });
    }
  });
  
  // ========== 工具函数 ==========
  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
  
  // 初始化违禁词管理
  initForbiddenWords();
  
  // 初始化模板配置
  try {
    loadTemplateConfig('default');
    
    // 显示模板配置区域
    const templateConfigArea = document.getElementById('templateConfigArea');
    if (templateConfigArea) {
      templateConfigArea.style.display = 'block';
    }
    
    // 确保预览在初始化后更新（延迟确保DOM已完全加载）
    setTimeout(() => {
      try {
        updatePreview();
        console.log('预览初始化完成');
      } catch (error) {
        console.error('预览初始化失败:', error);
      }
    }, 500);
  } catch (error) {
    console.error('模板配置初始化失败:', error);
  }
  
  // 添加CSS动画
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
    .category-badge {
      display: inline-block;
      padding: 0.25rem 0.5rem;
      border-radius: 0.25rem;
      font-size: 0.875rem;
      font-weight: 500;
    }
    .category-violence { background-color: #fee; color: #c33; }
    .category-pornography { background-color: #fef; color: #c3c; }
    .category-politics { background-color: #ffe; color: #cc3; }
    .category-advertising { background-color: #eff; color: #3cc; }
    .category-other { background-color: #eee; color: #666; }
    .btn-sm {
      padding: 0.25rem 0.5rem;
      font-size: 0.875rem;
    }
  `;
  document.head.appendChild(style);
});