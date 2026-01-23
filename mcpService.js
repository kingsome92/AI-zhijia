document.addEventListener('DOMContentLoaded', () => {
  // 注意：header 和 footer 已经直接嵌入在 mcpService.html 中，不需要动态加载
  // loadSharedComponents(); // 已注释，避免替换已嵌入的 header，导致 header.js 事件绑定失效

  const agentListEl = document.getElementById('agent-list');
  const agentSearchInput = document.getElementById('agent-search');
  const createAgentBtn = document.getElementById('create-agent-btn');
  const agentFormContainer = document.getElementById('agent-form-container');
  const configContainer = document.getElementById('config-container');
  const emptyStateEl = document.getElementById('empty-state');
  const formTitleEl = document.getElementById('form-title');
  const cancelEditBtn = document.getElementById('cancel-edit-btn');
  const saveAgentBtn = document.getElementById('save-agent-btn');
  const saveConfigBtn = document.getElementById('save-config-btn');
  const testConfigBtn = document.getElementById('test-config-btn');
  const formatBtn = document.getElementById('format-btn');
  const minifyBtn = document.getElementById('minify-btn');
  const validateBtn = document.getElementById('validate-btn');
  const jsonEditor = document.getElementById('json-editor');
  const templateDropdown = document.getElementById('templateDropdown');
  const templateMenu = templateDropdown ? templateDropdown.parentElement.querySelector('.dropdown-menu') : null;
  const templateItems = document.querySelectorAll('.dropdown-item[data-template]');
  const importTemplateBtn = document.getElementById('import-template');
  const exportTemplateBtn = document.getElementById('export-template');
  const statusMessage = document.getElementById('status-message');
  const agentNameInput = document.getElementById('agent-name');
  const agentDescriptionInput = document.getElementById('agent-description');
  const agentVersionInput = document.getElementById('agent-version');
  const agentStatusSelect = document.getElementById('agent-status');
  const agentTagsInput = document.getElementById('agent-tags');
  const callTypeApiRadio = document.getElementById('call-type-api');
  const callTypeMcpRadio = document.getElementById('call-type-mcp');
  const deleteModal = document.getElementById('delete-modal');
  const closeDeleteModalBtn = document.getElementById('close-delete-modal');
  const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
  const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
  const deleteAgentNameEl = document.getElementById('delete-agent-name');
  const integrationSection = document.getElementById('integration-section');
  const mcpIntegrationCard = document.getElementById('mcp-integration-card');
  const apiIntegrationCard = document.getElementById('api-integration-card');
  const mcpUrlEl = document.getElementById('mcp-url');
  const mcpTypeEl = document.getElementById('mcp-type');
  const mcpHeadersEl = document.getElementById('mcp-headers');
  const mcpSnippetEl = document.getElementById('mcp-snippet');
  const apiAuthEl = document.getElementById('api-auth');
  const apiInputTableBody = document.querySelector('#api-input-table tbody');
  const apiOutputTableBody = document.querySelector('#api-output-table tbody');

  // 模板数据
  const templates = {
    default: {
      name: '默认模板',
      content: `{
  "service": {
    "name": "MCP Agent",
    "version": "1.0.0",
    "description": "默认智能体服务描述",
    "endpoints": [
      {
        "name": "predict",
        "url": "/api/v1/predict",
        "method": "POST",
        "timeout": 5000
      }
    ],
    "settings": {
      "cacheEnabled": true,
      "maxConnections": 100,
      "logLevel": "info"
    }
  }
}`
    },
    minimal: {
      name: '最小化模板',
      content: `{
  "service": {
    "name": "MCP Agent",
    "version": "1.0.0"
  }
}`
    },
    advanced: {
      name: '高级模板',
      content: `{
  "service": {
    "name": "MCP Agent",
    "version": "1.0.0",
    "description": "高级智能体配置示例",
    "endpoints": [
      {
        "name": "predict",
        "url": "/api/v1/predict",
        "method": "POST",
        "timeout": 5000,
        "rateLimit": {
          "requests": 100,
          "interval": "1m"
        }
      },
      {
        "name": "feedback",
        "url": "/api/v1/feedback",
        "method": "POST",
        "timeout": 3000
      }
    ],
    "settings": {
      "cacheEnabled": true,
      "cacheTTL": 3600,
      "maxConnections": 200,
      "logLevel": "debug",
      "monitoring": {
        "enabled": true,
        "interval": 60
      }
    }
  }
}`
    }
  };

  const baseInputParams = [
    { name: 'duihua', type: 'String', required: true, description: '用户对话输入的内容' },
    { name: 'tixing', type: 'String', required: true, description: '变式题型' },
    { name: 'shuliang', type: 'String', required: false, description: '变式题数量' },
    { name: 'nandu', type: 'String', required: false, description: '变式题目的难度' }
  ];

  const baseOutputParams = [
    { name: 'content', type: 'String', description: '返回的文本内容，可直接展示' }
  ];

  // ========== 工具数据（localStorage持久化，供“应用管理”模块复用） ==========
  const TOOL_STORAGE_KEY = 'mcpTools';

  function loadToolsFromStorage() {
    try {
      const raw = localStorage.getItem(TOOL_STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return null;
      return parsed;
    } catch (e) {
      console.warn('读取工具缓存失败，使用示例数据:', e);
      return null;
    }
  }

  function persistTools() {
    try {
      localStorage.setItem(TOOL_STORAGE_KEY, JSON.stringify(agents));
    } catch (e) {
      console.warn('保存工具缓存失败:', e);
    }
  }

  // 示例工具数据（首次进入会写入localStorage）
  const defaultAgents = [
    {
      id: 'agt-001',
      name: '客服助理',
      description: '面向客服场景的对话式智能体，支持多轮对话和FAQ检索。',
      version: '1.2.0',
      status: 'active',
      tags: ['客服', '对话', 'FAQ'],
      callType: 'api',
      updatedAt: '2025-02-16 10:12',
      config: templates.advanced.content,
      integration: buildIntegrationProfile('客服助理')
    },
    {
      id: 'agt-002',
      name: '数据分析助手',
      description: '聚焦报表分析与数据洞察的智能体，可接入BI系统。',
      version: '2.0.1',
      status: 'inactive',
      tags: ['数据', '报表'],
      callType: 'mcp',
      updatedAt: '2025-01-30 09:45',
      config: templates.default.content,
      integration: buildIntegrationProfile('数据分析助手')
    },
    {
      id: 'agt-003',
      name: '知识库检索机器人',
      description: '提供知识库搜索与精准引用，适合内部知识文档查询。',
      version: '0.9.5',
      status: 'active',
      tags: ['搜索', '知识库'],
      callType: 'api',
      updatedAt: '2025-02-01 14:30',
      config: templates.minimal.content,
      integration: buildIntegrationProfile('知识库检索机器人')
    }
  ];

  let agents = loadToolsFromStorage() || defaultAgents;
  persistTools();

  let selectedAgentId = null;
  let currentEditingId = null;
  let agentDraftConfig = templates.default.content;
  let agentToDeleteId = null;

  init();

  function init() {
    renderAgentList();
    bindEvents();

    if (agents.length > 0) {
      selectAgent(agents[0].id);
    } else {
      showEmptyState();
    }
  }

  function loadSharedComponents() {
    fetch('header.html')
      .then((response) => response.text())
      .then((html) => {
        document.getElementById('header-container').innerHTML = html;
        const headerCSS = document.createElement('link');
        headerCSS.rel = 'stylesheet';
        headerCSS.href = 'header.css';
        document.head.appendChild(headerCSS);
      });

    fetch('footer.html')
      .then((response) => response.text())
      .then((html) => {
        document.getElementById('footer-container').innerHTML = html;
        const footerCSS = document.createElement('link');
        footerCSS.rel = 'stylesheet';
        footerCSS.href = 'footer.css';
        document.head.appendChild(footerCSS);
      });
  }

  function bindEvents() {
    createAgentBtn.addEventListener('click', startCreateAgent);
    cancelEditBtn.addEventListener('click', resetDetailPanel);
    saveAgentBtn.addEventListener('click', handleSaveAgent);
    saveConfigBtn.addEventListener('click', handleSaveConfig);
    testConfigBtn.addEventListener('click', handleTestConfig);
    agentSearchInput.addEventListener('input', (e) => renderAgentList(e.target.value));
    agentListEl.addEventListener('click', handleAgentListClick);
    jsonEditor.addEventListener('input', () => {
      agentDraftConfig = jsonEditor.value;
    });

    formatBtn.addEventListener('click', () => {
      jsonEditor.value = formatJSON(jsonEditor.value);
      agentDraftConfig = jsonEditor.value;
      updateStatus('JSON已格式化', 'success');
    });

    minifyBtn.addEventListener('click', () => {
      jsonEditor.value = minifyJSON(jsonEditor.value);
      agentDraftConfig = jsonEditor.value;
      updateStatus('JSON已压缩', 'success');
    });

    validateBtn.addEventListener('click', () => {
      if (validateJSON(jsonEditor.value)) {
        updateStatus('JSON验证通过', 'success');
      } else {
        updateStatus('JSON验证失败: 格式不正确', 'error');
      }
    });

    templateDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
      templateMenu?.classList.toggle('show');
    });

    templateItems.forEach((item) => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const templateName = e.target.getAttribute('data-template');
        jsonEditor.value = formatJSON(templates[templateName].content);
        agentDraftConfig = jsonEditor.value;
        updateStatus(`已加载模板: ${templates[templateName].name}`, 'success');
      });
    });

    // 调用方式切换事件（集成信息已注释，暂时不需要）
    // callTypeApiRadio.addEventListener('change', updateIntegrationDisplay);
    // callTypeMcpRadio.addEventListener('change', updateIntegrationDisplay);
    
    // 工具名称输入事件，实时更新集成信息（集成信息已注释，暂时不需要）
    // agentNameInput.addEventListener('input', updateIntegrationDisplay);

    document.addEventListener('click', (e) => {
      if (!e.target.closest('.dropdown')) {
        templateMenu?.classList.remove('show');
      }

      const copyBtn = e.target.closest('.copy-btn');
      if (copyBtn) {
        handleCopy(copyBtn);
      }
    });

    importTemplateBtn.addEventListener('click', handleImportTemplate);
    exportTemplateBtn.addEventListener('click', handleExportTemplate);

    closeDeleteModalBtn.addEventListener('click', closeDeleteModal);
    cancelDeleteBtn.addEventListener('click', closeDeleteModal);
    confirmDeleteBtn.addEventListener('click', confirmDelete);
  }

  function renderAgentList(keyword = '') {
    const searchKey = keyword.trim().toLowerCase();
    const filteredAgents = agents.filter((agent) => {
      if (!searchKey) return true;
      const haystack = [
        agent.name,
        agent.description,
        agent.tags.join(',')
      ].join(' ').toLowerCase();
      return haystack.includes(searchKey);
    });

    agentListEl.innerHTML = '';

    if (filteredAgents.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'agent-list-empty';
      emptyEl.innerHTML = '<i class="bi bi-inboxes"></i><p>暂无匹配的智能体</p>';
      agentListEl.appendChild(emptyEl);
      return;
    }

    filteredAgents.forEach((agent) => {
      const item = document.createElement('div');
      item.className = `agent-item ${agent.id === selectedAgentId ? 'active' : ''}`;
      item.dataset.agentId = agent.id;
      const callTypeTag = agent.callType === 'mcp' ? '<mcp>' : '<api>';
      item.innerHTML = `
        <div class="agent-item-header">
          <h4 class="agent-item-name">${agent.name} <span class="call-type-badge">${callTypeTag}</span></h4>
          <div class="agent-item-actions">
            <button class="btn-icon" data-action="edit" title="编辑"><i class="bi bi-pencil"></i></button>
            <button class="btn-icon" data-action="delete" title="删除"><i class="bi bi-trash"></i></button>
          </div>
        </div>
        <div class="agent-item-meta">
          <span class="meta-item"><i class="bi bi-hash"></i>${agent.version}</span>
          <span class="meta-item"><i class="bi bi-clock-history"></i>${agent.updatedAt}</span>
          <span class="status-badge ${agent.status}">
            <i class="bi ${agent.status === 'active' ? 'bi-check-circle' : 'bi-pause-circle'}"></i>
            ${agent.status === 'active' ? '启用' : '禁用'}
          </span>
        </div>
        <p class="agent-item-description">${agent.description}</p>
        <div class="agent-item-footer">
          <div class="agent-item-tags">
            ${agent.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
          </div>
        </div>
      `;
      agentListEl.appendChild(item);
    });
  }

  function handleAgentListClick(event) {
    const actionBtn = event.target.closest('[data-action]');
    const listItem = event.target.closest('.agent-item');
    if (!listItem) return;

    const agentId = listItem.dataset.agentId;

    if (actionBtn) {
      event.stopPropagation();
      const action = actionBtn.getAttribute('data-action');
      if (action === 'delete') {
        openDeleteModal(agentId);
      } else {
        selectAgent(agentId);
      }
      return;
    }

    selectAgent(agentId);
  }

  function selectAgent(agentId) {
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) return;

    selectedAgentId = agentId;
    currentEditingId = agentId;
    agentDraftConfig = agent.config;

    populateForm(agent);
    jsonEditor.value = formatJSON(agent.config);
    showDetailPanel();
    // 集成信息已注释，不再需要显示
    // renderIntegrationInfo(agent);
    renderAgentList(agentSearchInput.value);
    updateStatus(`已加载智能体: ${agent.name}`, 'info');
  }

  function populateForm(agent) {
    formTitleEl.textContent = `编辑智能体：${agent.name}`;
    agentNameInput.value = agent.name;
    agentDescriptionInput.value = agent.description || '';
    agentVersionInput.value = agent.version || '1.0.0';
    agentStatusSelect.value = agent.status || 'active';
    agentTagsInput.value = (agent.tags || []).join(', ');
    // 设置调用方式
    if (agent.callType === 'mcp') {
      callTypeMcpRadio.checked = true;
    } else {
      callTypeApiRadio.checked = true;
    }
    // 集成信息已注释，不再需要更新显示
    // updateIntegrationDisplay();
  }

  function startCreateAgent() {
    selectedAgentId = null;
    currentEditingId = null;
    agentDraftConfig = templates.default.content;
    jsonEditor.value = formatJSON(agentDraftConfig);
    formTitleEl.textContent = '创建智能体';

    agentNameInput.value = '';
    agentDescriptionInput.value = '';
    agentVersionInput.value = '1.0.0';
    agentStatusSelect.value = 'active';
    agentTagsInput.value = '';
    callTypeApiRadio.checked = true;
    callTypeMcpRadio.checked = false;

    showDetailPanel();
    updateStatus('开始创建智能体', 'info');
    renderAgentList(agentSearchInput.value);
    // 集成信息已注释，不再需要更新显示
    // updateIntegrationDisplay();
  }

  function showDetailPanel() {
    emptyStateEl.style.display = 'none';
    agentFormContainer.style.display = 'block';
    configContainer.style.display = 'flex'; // JSON配置编辑器始终显示
  }

  function showEmptyState() {
    emptyStateEl.style.display = 'flex';
    agentFormContainer.style.display = 'none';
    configContainer.style.display = 'none';
    // 集成信息已注释，不再需要调用
    // renderIntegrationInfo(null);
  }

  function resetDetailPanel() {
    selectedAgentId = null;
    currentEditingId = null;
    agentDraftConfig = templates.default.content;
    jsonEditor.value = '';
    showEmptyState();
    renderAgentList(agentSearchInput.value);
    updateStatus('已取消编辑', 'info');
    // 集成信息已注释，不再需要操作
    // integrationSection.style.display = 'none';
  }

  function handleSaveAgent() {
    const name = agentNameInput.value.trim();
    if (!name) {
      updateStatus('智能体名称不能为空', 'error');
      agentNameInput.focus();
      return;
    }

    if (!validateJSON(agentDraftConfig)) {
      updateStatus('JSON配置无效，无法保存', 'error');
      return;
    }

    const callType = callTypeMcpRadio.checked ? 'mcp' : 'api';
    const payload = {
      name,
      description: agentDescriptionInput.value.trim(),
      version: agentVersionInput.value.trim() || '1.0.0',
      status: agentStatusSelect.value,
      tags: parseTags(agentTagsInput.value),
      callType: callType,
      config: formatJSON(agentDraftConfig),
      updatedAt: new Date().toISOString().slice(0, 16).replace('T', ' ')
    };

    if (currentEditingId) {
      agents = agents.map((agent) =>
        agent.id === currentEditingId ? { ...agent, ...payload } : agent
      );
      persistTools();
      updateStatus('工具信息已更新', 'success');
      selectAgent(currentEditingId);
    } else {
      const newAgent = {
        id: generateAgentId(),
        ...payload,
        integration: buildIntegrationProfile(name)
      };
      agents.unshift(newAgent);
      persistTools();
      updateStatus('工具创建成功', 'success');
      renderAgentList(agentSearchInput.value);
      selectAgent(newAgent.id);
    }
  }

  function handleSaveConfig() {
    if (!validateJSON(jsonEditor.value)) {
      updateStatus('无法保存: JSON格式不正确', 'error');
      return;
    }

    agentDraftConfig = formatJSON(jsonEditor.value);
    jsonEditor.value = agentDraftConfig;

    if (currentEditingId) {
      agents = agents.map((agent) =>
        agent.id === currentEditingId ? { ...agent, config: agentDraftConfig } : agent
      );
      persistTools();
      updateStatus('配置已保存', 'success');
    } else {
      updateStatus('配置草稿已保存，创建完成后将自动绑定', 'info');
    }
  }

  function handleTestConfig() {
    if (!validateJSON(jsonEditor.value)) {
      updateStatus('无法测试: JSON格式不正确', 'error');
      return;
    }

    updateStatus('正在测试配置...', 'info');
    setTimeout(() => {
      updateStatus('配置测试成功，响应正常', 'success');
    }, 1200);
  }

  function handleImportTemplate(event) {
    event.preventDefault();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (loadEvent) => {
        try {
          const content = loadEvent.target.result;
          JSON.parse(content);
          jsonEditor.value = formatJSON(content);
          agentDraftConfig = jsonEditor.value;
          updateStatus('模板导入成功', 'success');
        } catch (error) {
          updateStatus('导入失败: 文件不是有效的JSON', 'error');
        }
      };
      reader.readAsText(file);
    };

    input.click();
  }

  function handleExportTemplate(event) {
    event.preventDefault();
    if (!validateJSON(jsonEditor.value)) {
      updateStatus('无法导出: JSON格式不正确', 'error');
      return;
    }

    const blob = new Blob([jsonEditor.value], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'mcp-agent-config.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    updateStatus('配置已导出', 'success');
  }

  function openDeleteModal(agentId) {
    const agent = agents.find((item) => item.id === agentId);
    if (!agent) return;
    agentToDeleteId = agentId;
    deleteAgentNameEl.textContent = agent.name;
    deleteModal.style.display = 'flex';
  }

  // 集成信息显示功能已注释，暂时不需要
  /*
  function updateIntegrationDisplay() {
    if (!integrationSection) return;
    
    const callType = callTypeMcpRadio.checked ? 'mcp' : 'api';
    const agentName = agentNameInput.value.trim();
    
    // 只有在编辑或创建工具时才显示集成信息
    if (currentEditingId || agentName) {
      integrationSection.style.display = 'grid';
      
      if (callType === 'mcp') {
        mcpIntegrationCard.style.display = 'block';
        apiIntegrationCard.style.display = 'none';
        
        // 如果有选中的工具，显示其MCP信息；否则显示默认信息
        if (currentEditingId) {
          const agent = agents.find(a => a.id === currentEditingId);
          if (agent && agent.integration) {
            const { mcp = {} } = agent.integration;
            setCodeField(mcpUrlEl, mcp.url);
            if (mcpTypeEl) {
              mcpTypeEl.textContent = mcp.type || 'streamableHttp';
            }
            renderHeaderList(mcpHeadersEl, mcp.headers);
            if (mcpSnippetEl) {
              mcpSnippetEl.textContent = mcp.snippet || buildSnippetText(mcp.url, mcp.type);
            }
          }
        } else if (agentName) {
          // 创建新工具时，根据工具名称生成默认MCP信息
          const integration = buildIntegrationProfile(agentName);
          const { mcp = {} } = integration;
          setCodeField(mcpUrlEl, mcp.url);
          if (mcpTypeEl) {
            mcpTypeEl.textContent = mcp.type || 'streamableHttp';
          }
          renderHeaderList(mcpHeadersEl, mcp.headers);
          if (mcpSnippetEl) {
            mcpSnippetEl.textContent = mcp.snippet || buildSnippetText(mcp.url, mcp.type);
          }
        }
      } else {
        mcpIntegrationCard.style.display = 'none';
        apiIntegrationCard.style.display = 'block';
        
        // 如果有选中的工具，显示其API信息；否则显示默认信息
        if (currentEditingId) {
          const agent = agents.find(a => a.id === currentEditingId);
          if (agent && agent.integration) {
            const { api = {} } = agent.integration;
            setCodeField(apiAuthEl, api.auth);
            renderParamTable(apiInputTableBody, api.inputs, true);
            renderParamTable(apiOutputTableBody, api.outputs, false);
          }
        } else if (agentName) {
          // 创建新工具时，显示默认API信息
          const integration = buildIntegrationProfile(agentName);
          const { api = {} } = integration;
          setCodeField(apiAuthEl, api.auth);
          renderParamTable(apiInputTableBody, api.inputs, true);
          renderParamTable(apiOutputTableBody, api.outputs, false);
        }
      }
    } else {
      integrationSection.style.display = 'none';
    }
  }

  function renderIntegrationInfo(agent) {
    if (!integrationSection) return;

    if (!agent || !agent.integration) {
      integrationSection.style.display = 'none';
      return;
    }

    const callType = agent.callType || 'api';
    integrationSection.style.display = 'grid';

    if (callType === 'mcp') {
      mcpIntegrationCard.style.display = 'block';
      apiIntegrationCard.style.display = 'none';
      const { mcp = {} } = agent.integration;
    setCodeField(mcpUrlEl, mcp.url);
    if (mcpTypeEl) {
      mcpTypeEl.textContent = mcp.type || 'streamableHttp';
    }
    renderHeaderList(mcpHeadersEl, mcp.headers);
    if (mcpSnippetEl) {
      mcpSnippetEl.textContent = mcp.snippet || buildSnippetText(mcp.url, mcp.type);
    }
    } else {
      mcpIntegrationCard.style.display = 'none';
      apiIntegrationCard.style.display = 'block';
      const { api = {} } = agent.integration;
    setCodeField(apiAuthEl, api.auth);
    renderParamTable(apiInputTableBody, api.inputs, true);
    renderParamTable(apiOutputTableBody, api.outputs, false);
  }
  }
  */

  function closeDeleteModal() {
    deleteModal.style.display = 'none';
    agentToDeleteId = null;
  }

  function confirmDelete() {
    if (!agentToDeleteId) return;
    agents = agents.filter((agent) => agent.id !== agentToDeleteId);
    persistTools();

    if (selectedAgentId === agentToDeleteId) {
      resetDetailPanel();
      if (agents.length > 0) {
        selectAgent(agents[0].id);
      }
    }

    renderAgentList(agentSearchInput.value);
        updateStatus('工具已删除', 'success');
    closeDeleteModal();
  }

  function parseTags(tagString = '') {
    return tagString
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  function generateAgentId() {
    return `agt-${Date.now()}`;
  }

  function handleCopy(copyBtn) {
    const targetId = copyBtn.dataset.target;
    if (!targetId) return;
    const targetEl = document.getElementById(targetId);
    if (!targetEl) {
      updateStatus('未找到可复制的内容', 'warning');
      return;
    }
    const text = targetEl.dataset.value || targetEl.textContent.trim();
    if (!text) {
      updateStatus('暂无可复制内容', 'warning');
      return;
    }

    copyTextToClipboard(text)
      .then(() => updateStatus('内容已复制', 'success'))
      .catch(() => updateStatus('复制失败，请手动选择', 'error'));
  }

  function setCodeField(el, value) {
    if (!el) return;
    const text = value || '';
    el.textContent = text || '—';
    el.dataset.value = text;
  }

  function renderHeaderList(listEl, headers = []) {
    if (!listEl) return;
    if (!headers.length) {
      listEl.innerHTML = '<li class="empty">暂无鉴权头</li>';
      return;
    }
    listEl.innerHTML = headers
      .map((item) => `<li><span>${item.key}:</span><code>${item.value}</code></li>`)
      .join('');
  }

  function renderParamTable(tbody, params = [], includeRequiredColumn = false) {
    if (!tbody) return;
    if (!params.length) {
      const colspan = includeRequiredColumn ? 4 : 3;
      tbody.innerHTML = `<tr><td class="empty-row" colspan="${colspan}">暂无配置</td></tr>`;
      return;
    }

    tbody.innerHTML = params
      .map((item) => {
        if (includeRequiredColumn) {
          return `
            <tr>
              <td>${item.name}</td>
              <td>${item.type}</td>
              <td>${item.required ? '<span class="required">是</span>' : '<span class="optional">否</span>'}</td>
              <td>${item.description || '-'}</td>
            </tr>
          `;
        }
        return `
          <tr>
            <td>${item.name}</td>
            <td>${item.type}</td>
            <td>${item.description || '-'}</td>
          </tr>
        `;
      })
      .join('');
  }

  function buildIntegrationProfile(name = 'default-tool') {
    const slug = slugify(name) || 'default-tool';
    const url = `http://appbuilder.baidu.com/v2/tools/components/${slug}/version/1/mcp`;
    return {
      mcp: {
        url,
        type: 'streamableHttp',
        headers: [{ key: 'Authorization', value: 'Bearer <YOUR_API_KEY>' }],
        snippet: buildSnippetText(url, 'streamableHttp')
      },
      api: {
        auth: 'Authorization: Bearer <YOUR_API_KEY>',
        inputs: cloneParamList(baseInputParams),
        outputs: cloneParamList(baseOutputParams)
      }
    };
  }

  function buildSnippetText(url, type = 'streamableHttp') {
    return `{
  "mcpServers": {
    "FaTi": {
      "url": "${url || 'http://appbuilder.baidu.com/v2/tools/components/default-tool/version/1/mcp'}",
      "type": "${type}",
      "headers": {
        "Authorization": "Bearer <YOUR_API_KEY>"
      }
    }
  }
}`;
  }

  function cloneParamList(list = []) {
    return list.map((item) => ({ ...item }));
  }

  function slugify(str = '') {
    return str
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');
  }

  function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise((resolve, reject) => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      textarea.style.position = 'fixed';
      textarea.style.opacity = '0';
      document.body.appendChild(textarea);
      textarea.focus();
      textarea.select();
      try {
        const successful = document.execCommand('copy');
        document.body.removeChild(textarea);
        successful ? resolve() : reject();
      } catch (err) {
        document.body.removeChild(textarea);
        reject(err);
      }
    });
  }

  function formatJSON(jsonString) {
    try {
      const jsonObj = JSON.parse(jsonString);
      return JSON.stringify(jsonObj, null, 2);
    } catch (e) {
      return jsonString;
    }
  }

  function minifyJSON(jsonString) {
    try {
      const jsonObj = JSON.parse(jsonString);
      return JSON.stringify(jsonObj);
    } catch (e) {
      return jsonString;
    }
  }

  function validateJSON(jsonString) {
    try {
      JSON.parse(jsonString);
      return true;
    } catch (e) {
      return false;
    }
  }

  function updateStatus(message, type = 'info') {
    if (!statusMessage) return;
    const iconClass = {
      info: 'bi-info-circle',
      success: 'bi-check-circle',
      warning: 'bi-exclamation-triangle',
      error: 'bi-x-circle'
    }[type];

    const colorMap = {
      info: 'var(--info-color)',
      success: 'var(--success-color)',
      warning: 'var(--warning-color)',
      error: 'var(--danger-color)'
    };

    statusMessage.innerHTML = `<i class="bi ${iconClass}"></i> ${message}`;
    statusMessage.style.color = colorMap[type];
  }
});