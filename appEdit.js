document.addEventListener('DOMContentLoaded', () => {
  const APP_STORAGE_KEY = 'applications';
  const TEMPLATE_STORAGE_KEY = 'sessionTemplates';
  const MODEL_STORAGE_KEY = 'models';
  const TOOL_STORAGE_KEY = 'mcpTools';

  const params = new URLSearchParams(window.location.search);
  const appId = params.get('id');

  const els = {
    breadcrumbName: document.getElementById('breadcrumbName'),
    pageTitle: document.getElementById('pageTitle'),
    backBtn: document.getElementById('backBtn'),
    saveBtn: document.getElementById('saveBtn'),
    publishBtn: document.getElementById('publishBtn'),
    generateKeyBtn: document.getElementById('generateKeyBtn'),
    copyKeyBtn: document.getElementById('copyKeyBtn'),

    appName: document.getElementById('appName'),
    appDesc: document.getElementById('appDesc'),
    templateSelect: document.getElementById('templateSelect'),
    modelSelect: document.getElementById('modelSelect'),
    promptText: document.getElementById('promptText'),
    toolsGrid: document.getElementById('toolsGrid'),
    refreshToolsBtn: document.getElementById('refreshToolsBtn'),

    dbEnabled: document.getElementById('dbEnabled'),
    dbType: document.getElementById('dbType'),
    dbHost: document.getElementById('dbHost'),
    dbPort: document.getElementById('dbPort'),
    dbName: document.getElementById('dbName'),
    dbUser: document.getElementById('dbUser'),
    dbPass: document.getElementById('dbPass'),
    dbSchemaHint: document.getElementById('dbSchemaHint'),

    statusText: document.getElementById('statusText'),
    appKeyText: document.getElementById('appKeyText'),
    updatedAtText: document.getElementById('updatedAtText'),
    publishedAtText: document.getElementById('publishedAtText'),

    toast: document.getElementById('toast')
  };

  let app = getAppOrFallback();

  bindEvents();
  hydrateSelectors();
  hydrateForm();
  renderMeta();

  function getAppOrFallback() {
    const apps = loadApps();
    const found = apps.find((a) => a.id === appId);
    if (found) return normalizeApp(found);
    // 无id或找不到：回列表
    if (!appId) {
      window.location.href = 'appManagement.html';
      return normalizeApp({});
    }
    // 找不到：创建一个占位并写回（避免白屏）
    const fallback = normalizeApp({
      id: appId,
      name: '未命名应用',
      description: '',
      status: 'draft'
    });
    apps.unshift(fallback);
    saveApps(apps);
    return fallback;
  }

  function normalizeApp(raw) {
    const now = new Date().toISOString();
    return {
      id: raw.id || `app-${Date.now()}`,
      name: raw.name || '',
      description: raw.description || '',
      status: raw.status || 'draft',
      createdAt: raw.createdAt || now,
      updatedAt: raw.updatedAt || now,
      sessionTemplateId: raw.sessionTemplateId || 'default',
      modelId: raw.modelId ?? null,
      prompt: raw.prompt || '',
      variables: Array.isArray(raw.variables) ? raw.variables : [],
      toolIds: Array.isArray(raw.toolIds) ? raw.toolIds : [],
      db: {
        enabled: !!raw.db?.enabled,
        type: raw.db?.type || 'mysql',
        host: raw.db?.host || '',
        port: raw.db?.port || '',
        database: raw.db?.database || '',
        username: raw.db?.username || '',
        password: raw.db?.password || '',
        schemaHint: raw.db?.schemaHint || '',
        fieldDictionary: Array.isArray(raw.db?.fieldDictionary) ? raw.db.fieldDictionary : []
      },
      appKey: raw.appKey || null,
      publishedAt: raw.publishedAt || null
    };
  }

  function loadApps() {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveApps(apps) {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(apps));
  }

  function updateApp(partial) {
    app = normalizeApp({ ...app, ...partial });
    const apps = loadApps();
    const idx = apps.findIndex((a) => a.id === app.id);
    if (idx >= 0) apps[idx] = app;
    else apps.unshift(app);
    saveApps(apps);
  }

  function bindEvents() {
    els.backBtn.addEventListener('click', () => (window.location.href = 'appManagement.html'));
    els.saveBtn.addEventListener('click', () => {
      if (!validateRequired()) return;
      persistFromForm({ touchUpdatedAt: true });
      showToast('已保存', 'success');
    });
    els.publishBtn.addEventListener('click', () => {
      if (!validateRequired()) return;
      persistFromForm({ touchUpdatedAt: true });
      publishOrUpdate();
    });
    els.generateKeyBtn.addEventListener('click', () => {
      const ok = confirm('确定要生成/重置应用密钥吗？旧密钥将失效。');
      if (!ok) return;
      updateApp({
        appKey: generateAppKey(),
        updatedAt: new Date().toISOString()
      });
      renderMeta();
      showToast('密钥已生成', 'success');
    });
    els.copyKeyBtn.addEventListener('click', async () => {
      const key = app.appKey || '';
      if (!key) return showToast('暂无密钥可复制', 'info');
      try {
        await copyText(key);
        showToast('已复制', 'success');
      } catch {
        showToast('复制失败，请手动选择复制', 'info');
      }
    });

    els.refreshToolsBtn.addEventListener('click', () => {
      renderTools();
      showToast('工具列表已刷新', 'success');
    });

    els.dbEnabled.addEventListener('change', () => {
      toggleDbInputs(els.dbEnabled.checked);
      const manageFieldDictBtn = document.getElementById('manageFieldDictBtn');
      const testDbConnectionBtn = document.getElementById('testDbConnectionBtn');
      const selectFieldsBtn = document.getElementById('selectFieldsBtn');
      const display = els.dbEnabled.checked ? 'inline-flex' : 'none';
      if (manageFieldDictBtn) manageFieldDictBtn.style.display = display;
      if (testDbConnectionBtn) testDbConnectionBtn.style.display = display;
      if (selectFieldsBtn) selectFieldsBtn.style.display = display;
    });

    // 数据库连接测试
    const testDbConnectionBtn = document.getElementById('testDbConnectionBtn');
    if (testDbConnectionBtn) {
      testDbConnectionBtn.addEventListener('click', testDatabaseConnection);
    }

    // 选择表字段
    const selectFieldsBtn = document.getElementById('selectFieldsBtn');
    const selectFieldsModal = document.getElementById('selectFieldsModal');
    if (selectFieldsBtn) {
      selectFieldsBtn.addEventListener('click', () => openSelectFieldsModal());
    }

    // 变量管理相关事件
    const manageVariablesBtn = document.getElementById('manageVariablesBtn');
    const useTemplateBtn = document.getElementById('useTemplateBtn');
    const insertVariableBtn = document.getElementById('insertVariableBtn');
    const variableModal = document.getElementById('variableModal');
    const promptTemplateModal = document.getElementById('promptTemplateModal');
    
    if (manageVariablesBtn) {
      manageVariablesBtn.addEventListener('click', () => openModal(variableModal));
    }
    if (useTemplateBtn) {
      useTemplateBtn.addEventListener('click', () => openPromptTemplateModal());
    }
    if (insertVariableBtn) {
      insertVariableBtn.addEventListener('click', () => showVariableInsertMenu());
    }

    // 字段字典管理
    const manageFieldDictBtn = document.getElementById('manageFieldDictBtn');
    const fieldDictModal = document.getElementById('fieldDictModal');
    if (manageFieldDictBtn) {
      manageFieldDictBtn.addEventListener('click', () => openModal(fieldDictModal));
      manageFieldDictBtn.style.display = els.dbEnabled.checked ? 'inline-flex' : 'none';
    }

    // Prompt 智能提示：输入 {{ 时自动提示
    if (els.promptText) {
      els.promptText.addEventListener('input', handlePromptInput);
      els.promptText.addEventListener('keydown', handlePromptKeydown);
    }

    // 变量管理模态框事件
    initVariableModalEvents();
    // 字段字典模态框事件
    initFieldDictModalEvents();
  }

  function validateRequired() {
    const name = els.appName.value.trim();
    if (!name) {
      els.appName.focus();
      showToast('请填写应用名称', 'info');
      return false;
    }
    return true;
  }

  function hydrateSelectors() {
    // 模板
    const templates = loadObject(TEMPLATE_STORAGE_KEY) || {};
    els.templateSelect.innerHTML = '';
    const templateKeys = Object.keys(templates);
    if (templateKeys.length === 0) {
      els.templateSelect.innerHTML = `<option value="default">默认配置</option>`;
    } else {
      templateKeys.forEach((id) => {
        const name = templates[id]?.name || id;
        const opt = document.createElement('option');
        opt.value = id;
        opt.textContent = name;
        els.templateSelect.appendChild(opt);
      });
    }

    // 模型（只显示启用的优先）
    const models = loadArray(MODEL_STORAGE_KEY);
    els.modelSelect.innerHTML = '';
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = '— 请选择大模型 —';
    els.modelSelect.appendChild(placeholder);

    const enabled = models.filter((m) => m.enabled !== false);
    const disabled = models.filter((m) => m.enabled === false);
    [...enabled, ...disabled].forEach((m) => {
      const opt = document.createElement('option');
      opt.value = String(m.id);
      opt.textContent = `${m.name || '未命名'}（${m.version || '-'}）${m.enabled === false ? ' - 已禁用' : ''}`;
      els.modelSelect.appendChild(opt);
    });

    renderTools();
  }

  function hydrateForm() {
    els.appName.value = app.name || '';
    els.appDesc.value = app.description || '';
    els.promptText.value = app.prompt || '';

    els.templateSelect.value = app.sessionTemplateId || 'default';
    els.modelSelect.value = app.modelId ? String(app.modelId) : '';

    els.dbEnabled.checked = !!app.db?.enabled;
    els.dbType.value = app.db?.type || 'mysql';
    els.dbHost.value = app.db?.host || '';
    els.dbPort.value = app.db?.port || '';
    els.dbName.value = app.db?.database || '';
    els.dbUser.value = app.db?.username || '';
    els.dbPass.value = app.db?.password || '';
    els.dbSchemaHint.value = app.db?.schemaHint || '';
    toggleDbInputs(els.dbEnabled.checked);

    // 确保变量和字段字典数据存在
    if (!app.variables) app.variables = [];
    if (!app.db) app.db = {};
    if (!app.db.fieldDictionary) app.db.fieldDictionary = [];

    // 显示/隐藏数据库相关按钮
    const manageFieldDictBtn = document.getElementById('manageFieldDictBtn');
    const testDbConnectionBtn = document.getElementById('testDbConnectionBtn');
    const selectFieldsBtn = document.getElementById('selectFieldsBtn');
    const display = els.dbEnabled.checked ? 'inline-flex' : 'none';
    if (manageFieldDictBtn) manageFieldDictBtn.style.display = display;
    if (testDbConnectionBtn) testDbConnectionBtn.style.display = display;
    if (selectFieldsBtn) selectFieldsBtn.style.display = display;

    const title = app.name ? `应用编辑：${app.name}` : '应用编辑';
    document.title = title;
    els.pageTitle.textContent = title;
    els.breadcrumbName.textContent = app.name || '应用编辑';
  }

  function persistFromForm({ touchUpdatedAt }) {
    const toolIds = Array.from(els.toolsGrid.querySelectorAll('input[type="checkbox"][data-tool-id]'))
      .filter((cb) => cb.checked)
      .map((cb) => cb.getAttribute('data-tool-id'));

    const modelIdRaw = els.modelSelect.value;
    const modelId = modelIdRaw ? (Number.isNaN(Number(modelIdRaw)) ? modelIdRaw : Number(modelIdRaw)) : null;

    const next = {
      name: els.appName.value.trim(),
      description: els.appDesc.value.trim(),
      sessionTemplateId: els.templateSelect.value || 'default',
      modelId,
      prompt: els.promptText.value,
      variables: app.variables || [],
      toolIds,
      db: {
        enabled: els.dbEnabled.checked,
        type: els.dbType.value,
        host: els.dbHost.value.trim(),
        port: els.dbPort.value.trim(),
        database: els.dbName.value.trim(),
        username: els.dbUser.value.trim(),
        password: els.dbPass.value,
        schemaHint: els.dbSchemaHint.value,
        fieldDictionary: app.db?.fieldDictionary || []
      }
    };
    if (touchUpdatedAt) next.updatedAt = new Date().toISOString();
    updateApp(next);
    renderMeta();
  }

  function publishOrUpdate() {
    if (!app.appKey) {
      app.appKey = generateAppKey();
    }
    const now = new Date().toISOString();
    updateApp({
      status: 'published',
      appKey: app.appKey,
      publishedAt: now,
      updatedAt: now
    });
    renderMeta();
    showToast('已发布/更新', 'success');
  }

  function renderMeta() {
    els.statusText.textContent = app.status === 'published' ? '已发布' : '草稿';
    els.appKeyText.textContent = app.appKey || '-';
    els.updatedAtText.textContent = formatTime(app.updatedAt);
    els.publishedAtText.textContent = formatTime(app.publishedAt);
    els.copyKeyBtn.disabled = !app.appKey;
  }

  function renderTools() {
    const tools = loadArray(TOOL_STORAGE_KEY);
    if (tools.length === 0) {
      els.toolsGrid.innerHTML = `
        <div style="grid-column: 1 / -1; color: var(--gray-600); padding: 0.75rem;">
          暂无工具，请先到 <a href="mcpService.html">工具管理</a> 添加工具。
        </div>
      `;
      return;
    }

    const selected = new Set(app.toolIds || []);
    els.toolsGrid.innerHTML = tools
      .map((t) => {
        const id = String(t.id);
        const checked = selected.has(id) ? 'checked' : '';
        const status = t.status === 'active' ? '启用' : '禁用';
        const callType = t.callType === 'mcp' ? 'MCP' : 'API';
        return `
          <div class="tool-item">
            <input type="checkbox" data-tool-id="${escapeAttr(id)}" ${checked}>
            <div>
              <div class="tool-title">${escapeHtml(t.name || '-')}</div>
              <div class="tool-desc">${escapeHtml(t.description || '—')}</div>
              <div class="tool-meta">${callType} · ${status} · v${escapeHtml(t.version || '1.0.0')}</div>
            </div>
          </div>
        `;
      })
      .join('');
  }

  function toggleDbInputs(enabled) {
    const ids = ['dbType','dbHost','dbPort','dbName','dbUser','dbPass','dbSchemaHint'];
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.disabled = !enabled;
    });
  }

  function loadArray(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function loadObject(key) {
    try {
      const raw = localStorage.getItem(key);
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed && typeof parsed === 'object' ? parsed : null;
    } catch {
      return null;
    }
  }

  function generateAppKey() {
    const rand = () => Math.random().toString(36).slice(2, 10);
    return `ak_${rand()}_${rand()}_${rand()}`.toUpperCase();
  }

  function formatTime(iso) {
    if (!iso) return '-';
    try {
      const d = new Date(iso);
      if (Number.isNaN(d.getTime())) return '-';
      return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).replaceAll('/', '-');
    } catch {
      return '-';
    }
  }

  function showToast(message, type = 'info') {
    const iconMap = {
      success: 'bi-check-circle-fill',
      info: 'bi-info-circle-fill',
      error: 'bi-x-circle-fill'
    };
    const icon = iconMap[type] || iconMap.info;
    els.toast.innerHTML = `<i class="bi ${icon}"></i><span>${escapeHtml(message)}</span>`;
    els.toast.style.display = 'flex';
    clearTimeout(showToast._t);
    showToast._t = setTimeout(() => {
      els.toast.style.display = 'none';
    }, 2600);
  }

  async function copyText(text) {
    if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.focus();
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    if (!ok) throw new Error('copy failed');
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;');
  }

  // ========== 变量管理功能 ==========
  let currentEditingVariableIndex = -1;

  function initVariableModalEvents() {
    const addVariableBtn = document.getElementById('addVariableBtn');
    const saveVariableBtn = document.getElementById('saveVariableBtn');
    const importVariablesBtn = document.getElementById('importVariablesBtn');
    const exportVariablesBtn = document.getElementById('exportVariablesBtn');
    const variableEditModal = document.getElementById('variableEditModal');

    if (addVariableBtn) {
      addVariableBtn.addEventListener('click', () => {
        currentEditingVariableIndex = -1;
        resetVariableEditForm();
        document.getElementById('variableEditTitle').innerHTML = '<i class="bi bi-plus-circle"></i> 添加变量';
        openModal(variableEditModal);
      });
    }

    if (saveVariableBtn) {
      saveVariableBtn.addEventListener('click', saveVariable);
    }

    if (importVariablesBtn) {
      importVariablesBtn.addEventListener('click', importVariables);
    }

    if (exportVariablesBtn) {
      exportVariablesBtn.addEventListener('click', exportVariables);
    }

    // 打开变量管理模态框时渲染列表
    const variableModal = document.getElementById('variableModal');
    if (variableModal) {
      const observer = new MutationObserver((mutations) => {
        if (variableModal.classList.contains('show')) {
          renderVariablesList();
        }
      });
      observer.observe(variableModal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function renderVariablesList() {
    const listEl = document.getElementById('variablesList');
    if (!listEl) return;

    const variables = app.variables || [];
    if (variables.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray-600);">暂无变量，点击"添加变量"开始配置</div>';
      return;
    }

    listEl.innerHTML = variables.map((v, idx) => `
      <div class="variable-item" style="border: 1px solid var(--gray-200); border-radius: 0.5rem; padding: 0.75rem; margin-bottom: 0.5rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="flex: 1;">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
            <code style="background: var(--gray-100); padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-weight: 600;">{{${v.name}}}</code>
            <span style="font-weight: 600;">${escapeHtml(v.label || v.name)}</span>
            <span style="color: var(--gray-600); font-size: 0.85rem;">(${getVariableTypeLabel(v.type)})</span>
          </div>
          ${v.description ? `<div style="color: var(--gray-600); font-size: 0.85rem; margin-top: 0.25rem;">${escapeHtml(v.description)}</div>` : ''}
          ${v.defaultValue ? `<div style="color: var(--gray-600); font-size: 0.8rem; margin-top: 0.25rem;">默认值: ${escapeHtml(v.defaultValue)}</div>` : ''}
        </div>
        <div style="display: flex; gap: 0.5rem;">
          <button class="btn btn-secondary btn-sm" onclick="editVariable(${idx})">
            <i class="bi bi-pencil"></i> 编辑
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteVariable(${idx})">
            <i class="bi bi-trash"></i> 删除
          </button>
        </div>
      </div>
    `).join('');
  }

  window.editVariable = function(idx) {
    currentEditingVariableIndex = idx;
    const v = app.variables[idx];
    document.getElementById('variableEditTitle').innerHTML = '<i class="bi bi-pencil-square"></i> 编辑变量';
    document.getElementById('varName').value = v.name || '';
    document.getElementById('varLabel').value = v.label || '';
    document.getElementById('varType').value = v.type || 'text';
    document.getElementById('varDefault').value = v.defaultValue || '';
    document.getElementById('varDescription').value = v.description || '';
    document.getElementById('varName').disabled = true; // 编辑时不允许修改变量名
    openModal(document.getElementById('variableEditModal'));
  };

  window.deleteVariable = function(idx) {
    if (!confirm('确定要删除这个变量吗？')) return;
    app.variables.splice(idx, 1);
    updateApp({ variables: app.variables });
    renderVariablesList();
    showToast('变量已删除', 'success');
  };

  function saveVariable() {
    const name = document.getElementById('varName').value.trim();
    const label = document.getElementById('varLabel').value.trim();
    const type = document.getElementById('varType').value;
    const defaultValue = document.getElementById('varDefault').value.trim();
    const description = document.getElementById('varDescription').value.trim();

    if (!name) {
      showToast('请输入变量名', 'info');
      document.getElementById('varName').focus();
      return;
    }

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name)) {
      showToast('变量名格式不正确，只能包含字母、数字和下划线，且不能以数字开头', 'info');
      return;
    }

    const variable = { name, label, type, defaultValue, description };

    if (currentEditingVariableIndex >= 0) {
      app.variables[currentEditingVariableIndex] = variable;
    } else {
      // 检查是否已存在
      if (app.variables.some(v => v.name === name)) {
        showToast('变量名已存在', 'info');
        return;
      }
      app.variables.push(variable);
    }

    updateApp({ variables: app.variables });
    closeModal(document.getElementById('variableEditModal'));
    renderVariablesList();
    showToast('变量已保存', 'success');
  }

  function resetVariableEditForm() {
    document.getElementById('varName').value = '';
    document.getElementById('varLabel').value = '';
    document.getElementById('varType').value = 'text';
    document.getElementById('varDefault').value = '';
    document.getElementById('varDescription').value = '';
    document.getElementById('varName').disabled = false;
  }

  function getVariableTypeLabel(type) {
    const map = { text: '文本', number: '数字', date: '日期', select: '选项' };
    return map[type] || type;
  }

  function importVariables() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const data = JSON.parse(ev.target.result);
          if (Array.isArray(data)) {
            app.variables = [...(app.variables || []), ...data];
            updateApp({ variables: app.variables });
            renderVariablesList();
            showToast(`已导入 ${data.length} 个变量`, 'success');
          } else {
            showToast('文件格式不正确', 'info');
          }
        } catch (err) {
          showToast('导入失败：' + err.message, 'info');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function exportVariables() {
    const variables = app.variables || [];
    if (variables.length === 0) {
      showToast('暂无变量可导出', 'info');
      return;
    }
    const blob = new Blob([JSON.stringify(variables, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `variables_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('变量已导出', 'success');
  }

  function showVariableInsertMenu() {
    const variables = app.variables || [];
    if (variables.length === 0) {
      showToast('请先添加变量', 'info');
      return;
    }

    // 简单的选择菜单（可以后续优化为下拉菜单）
    const varName = prompt('选择要插入的变量：\n' + variables.map((v, i) => `${i + 1}. {{${v.name}}} - ${v.label || v.name}`).join('\n') + '\n\n请输入变量名或序号：');
    if (!varName) return;

    let selectedVar = null;
    if (/^\d+$/.test(varName)) {
      const idx = parseInt(varName) - 1;
      if (idx >= 0 && idx < variables.length) {
        selectedVar = variables[idx];
      }
    } else {
      selectedVar = variables.find(v => v.name === varName);
    }

    if (selectedVar) {
      insertTextAtCursor(els.promptText, `{{${selectedVar.name}}}`);
    } else {
      showToast('未找到变量', 'info');
    }
  }

  // ========== Prompt 模板功能 ==========
  const promptTemplates = {
    dataAnalysis: {
      name: '数据分析助手',
      description: '适用于数据查询、分析和报表生成场景',
      content: `你是一个专业的数据分析助手，擅长：
1. 理解用户的数据查询需求
2. 生成准确的SQL查询语句
3. 分析查询结果并提供洞察
4. 生成清晰的数据报表

约束：
- 只能查询允许的数据库字段
- 禁止查询敏感信息
- 查询结果需要格式化展示

工具使用：
- 优先使用数据查询工具获取数据
- 使用数据分析工具进行统计计算
- 使用图表生成工具可视化数据`
    },
    questionGeneration: {
      name: '题目生成助手',
      description: '适用于教学题目、练习题的生成场景',
      content: `你是一个专业的教学题目生成助手，擅长：
1. 根据知识点生成相应难度的题目
2. 生成题目的解析和答案
3. 生成配套的图形和图表

约束：
- 题目难度要符合教学大纲要求
- 题目表述要清晰准确
- 答案要详细完整

工具使用：
- 使用内容生成工具创建题目
- 使用图形生成工具创建配图
- 使用格式化工具整理输出`
    },
    teachingAssistant: {
      name: '教学助手',
      description: '综合教学场景，支持多种教学任务',
      content: `你是一个全能的教学助手，可以帮助教师完成：
1. 教案编写和课程设计
2. 学生作业批改和反馈
3. 教学数据分析
4. 教学资源整理

工作方式：
- 根据用户需求，智能选择合适的工具
- 可以执行多个任务并整合结果
- 提供清晰、专业的输出

约束：
- 遵守教学规范
- 保护学生隐私
- 输出内容要准确可靠`
    }
  };

  function openPromptTemplateModal() {
    const modal = document.getElementById('promptTemplateModal');
    const grid = document.getElementById('templateGrid');
    if (!grid) return;

    grid.innerHTML = Object.entries(promptTemplates).map(([key, tpl]) => `
      <div class="template-card" style="border: 1px solid var(--gray-200); border-radius: 0.75rem; padding: 1rem; cursor: pointer; transition: var(--transition);" onclick="applyPromptTemplate('${key}')">
        <h4 style="margin: 0 0 0.5rem 0; color: var(--dark-color);">${escapeHtml(tpl.name)}</h4>
        <p style="color: var(--gray-600); font-size: 0.9rem; margin: 0 0 0.75rem 0;">${escapeHtml(tpl.description)}</p>
        <button class="btn btn-primary btn-sm">使用此模板</button>
      </div>
    `).join('');

    openModal(modal);
  }

  window.applyPromptTemplate = function(key) {
    const tpl = promptTemplates[key];
    if (!tpl) return;

    if (els.promptText.value.trim() && !confirm('当前 Prompt 将被替换，确定继续吗？')) {
      return;
    }

    els.promptText.value = tpl.content;
    closeModal(document.getElementById('promptTemplateModal'));
    showToast(`已应用模板：${tpl.name}`, 'success');
  };

  // ========== Prompt 智能提示 ==========
  let variableSuggestionsVisible = false;
  let suggestionMenu = null;

  function handlePromptInput(e) {
    const text = e.target.value;
    const cursorPos = e.target.selectionStart;
    const textBeforeCursor = text.substring(0, cursorPos);
    
    // 检测是否输入了 {{
    const lastOpen = textBeforeCursor.lastIndexOf('{{');
    if (lastOpen >= 0 && textBeforeCursor.indexOf('}}', lastOpen) === -1) {
      showVariableSuggestions(e.target, cursorPos);
    } else {
      hideVariableSuggestions();
    }
  }

  function handlePromptKeydown(e) {
    if (e.key === 'Escape') {
      hideVariableSuggestions();
    }
  }

  function showVariableSuggestions(textarea, cursorPos) {
    const variables = app.variables || [];
    if (variables.length === 0) return;

    hideVariableSuggestions();

    const rect = textarea.getBoundingClientRect();
    suggestionMenu = document.createElement('div');
    suggestionMenu.className = 'variable-suggestions';
    suggestionMenu.style.cssText = `
      position: absolute;
      background: white;
      border: 1px solid var(--gray-200);
      border-radius: 0.5rem;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      max-height: 200px;
      overflow-y: auto;
      z-index: 10000;
      padding: 0.5rem 0;
    `;

    variables.forEach((v, idx) => {
      const item = document.createElement('div');
      item.style.cssText = 'padding: 0.5rem 1rem; cursor: pointer; transition: background 0.2s;';
      item.innerHTML = `<code style="color: var(--primary-color);">{{${v.name}}}</code> <span style="margin-left: 0.5rem;">${escapeHtml(v.label || v.name)}</span>`;
      item.onmouseenter = () => item.style.background = 'var(--gray-100)';
      item.onmouseleave = () => item.style.background = '';
      item.onclick = () => {
        const text = textarea.value;
        const before = text.substring(0, cursorPos);
        const after = text.substring(cursorPos);
        const lastOpen = before.lastIndexOf('{{');
        textarea.value = text.substring(0, lastOpen) + `{{${v.name}}}` + after;
        textarea.focus();
        textarea.setSelectionRange(lastOpen + `{{${v.name}}}`.length, lastOpen + `{{${v.name}}}`.length);
        hideVariableSuggestions();
      };
      suggestionMenu.appendChild(item);
    });

    document.body.appendChild(suggestionMenu);
    suggestionMenu.style.left = rect.left + 'px';
    suggestionMenu.style.top = (rect.bottom + 4) + 'px';
    suggestionMenu.style.minWidth = (rect.width) + 'px';
    variableSuggestionsVisible = true;
  }

  function hideVariableSuggestions() {
    if (suggestionMenu) {
      suggestionMenu.remove();
      suggestionMenu = null;
      variableSuggestionsVisible = false;
    }
  }

  // ========== 数据库连接和表字段选择 ==========
  let dbTables = [];
  let selectedFields = new Map(); // Map<tableName, Set<fieldName>>
  let currentSelectedTable = null;

  // 模拟数据库表数据（实际应用中应该从真实数据库获取）
  const mockDatabaseTables = {
    '客户满意度调查数据': [
      { name: '回收时间', type: 'datetime', description: '数据回收时间' },
      { name: '性别', type: 'varchar(10)', description: '客户性别' },
      { name: '年龄', type: 'int', description: '客户年龄' },
      { name: '手机号', type: 'varchar(20)', description: '客户手机号码' },
      { name: '地区', type: 'varchar(50)', description: '客户所在地区' },
      { name: '收入范围', type: 'varchar(20)', description: '客户收入范围' },
      { name: '学历', type: 'varchar(20)', description: '客户学历背景' },
      { name: '职业类别', type: 'varchar(50)', description: '客户职业类别' }
    ],
    '学生成绩表': [
      { name: 'student_id', type: 'int', description: '学生ID' },
      { name: 'name', type: 'varchar(50)', description: '学生姓名' },
      { name: 'class', type: 'varchar(20)', description: '班级' },
      { name: 'math_score', type: 'decimal(5,2)', description: '数学成绩' },
      { name: 'english_score', type: 'decimal(5,2)', description: '英语成绩' },
      { name: 'chinese_score', type: 'decimal(5,2)', description: '语文成绩' },
      { name: 'total_score', type: 'decimal(5,2)', description: '总分' },
      { name: 'exam_date', type: 'date', description: '考试日期' }
    ],
    '教师信息表': [
      { name: 'teacher_id', type: 'int', description: '教师ID' },
      { name: 'name', type: 'varchar(50)', description: '教师姓名' },
      { name: 'subject', type: 'varchar(30)', description: '任教科目' },
      { name: 'grade', type: 'varchar(20)', description: '任教年级' },
      { name: 'experience', type: 'int', description: '教龄（年）' },
      { name: 'phone', type: 'varchar(20)', description: '联系电话' }
    ]
  };

  function testDatabaseConnection() {
    const host = els.dbHost.value.trim();
    const port = els.dbPort.value.trim();
    const database = els.dbName.value.trim();
    const username = els.dbUser.value.trim();
    const password = els.dbPass.value;

    // 如果未填写完整信息，使用模拟数据模式
    if (!host || !port || !database || !username) {
      const useMock = confirm('检测到未填写完整的数据库连接信息。\n\n是否使用模拟数据进行演示？\n（实际应用中需要填写真实的数据库连接信息）');
      if (!useMock) {
        showToast('请填写完整的数据库连接信息', 'info');
        return;
      }
      // 使用模拟数据模式
      showToast('已切换到模拟数据模式（仅用于演示）', 'info');
      loadDatabaseTables();
      const btn = document.getElementById('testDbConnectionBtn');
      if (btn) {
        btn.innerHTML = '<i class="bi bi-info-circle"></i> 模拟模式';
        btn.style.background = 'var(--info-color)';
      }
      return;
    }

    const btn = document.getElementById('testDbConnectionBtn');
    if (btn) {
      btn.disabled = true;
      btn.innerHTML = '<i class="bi bi-hourglass"></i> 测试中...';
    }

    // 模拟连接测试（实际应用中应该调用后端API）
    setTimeout(() => {
      showToast('数据库连接成功！', 'success');
      if (btn) {
        btn.disabled = false;
        btn.innerHTML = '<i class="bi bi-check-circle"></i> 连接成功';
        btn.style.background = 'var(--success-color)';
      }
      // 加载表列表
      loadDatabaseTables();
    }, 1500);
  }

  function loadDatabaseTables() {
    // 模拟从数据库获取表列表（实际应用中应该调用后端API）
    dbTables = Object.keys(mockDatabaseTables);
    showToast(`已加载 ${dbTables.length} 个数据表`, 'success');
  }

  function openSelectFieldsModal() {
    // 如果没有加载表列表，先加载（使用模拟数据）
    if (dbTables.length === 0) {
      // 检查是否有数据库连接信息，如果没有则直接使用模拟数据
      const hasDbInfo = els.dbHost.value.trim() && els.dbName.value.trim();
      if (!hasDbInfo) {
        showToast('使用模拟数据模式（仅用于演示）', 'info');
      }
      loadDatabaseTables();
    }

    // 加载已选中的字段（从字段字典中恢复）
    loadSelectedFieldsFromDictionary();

    // 渲染表列表和字段列表
    renderTableList();
    renderFieldList();

    // 绑定搜索事件
    const searchInput = document.getElementById('fieldSearchInput');
    if (searchInput) {
      searchInput.value = '';
      searchInput.oninput = handleFieldSearch;
    }

    // 绑定保存按钮
    const saveBtn = document.getElementById('saveSelectedFieldsBtn');
    if (saveBtn) {
      saveBtn.onclick = saveSelectedFields;
    }

    openModal(document.getElementById('selectFieldsModal'));
  }

  function loadSelectedFieldsFromDictionary() {
    selectedFields.clear();
    const dict = app.db?.fieldDictionary || [];
    dict.forEach(field => {
      if (!selectedFields.has(field.table)) {
        selectedFields.set(field.table, new Set());
      }
      selectedFields.get(field.table).add(field.field);
    });
  }

  function renderTableList() {
    const container = document.getElementById('tableListContainer');
    if (!container) return;

    if (dbTables.length === 0) {
      container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray-600);">暂无数据表</div>';
      return;
    }

    container.innerHTML = dbTables.map(tableName => `
      <div class="table-item ${currentSelectedTable === tableName ? 'active' : ''}" 
           onclick="selectTable('${escapeAttr(tableName)}')">
        <i class="bi bi-stack table-item-icon"></i>
        <span class="table-item-name">${escapeHtml(tableName)}</span>
      </div>
    `).join('');
  }

  window.selectTable = function(tableName) {
    currentSelectedTable = tableName;
    renderTableList();
    renderFieldList();
  };

  function renderFieldList() {
    const container = document.getElementById('fieldListContainer');
    const countEl = document.getElementById('selectedFieldsCount');
    if (!container) return;

    if (!currentSelectedTable) {
      container.innerHTML = '<div style="text-align: center; padding: 2rem; color: var(--gray-600);">请从左侧选择一个数据表</div>';
      if (countEl) countEl.textContent = '已选择 0 个字段';
      return;
    }

    const fields = mockDatabaseTables[currentSelectedTable] || [];
    const tableSelectedFields = selectedFields.get(currentSelectedTable) || new Set();
    const allSelected = fields.length > 0 && fields.every(f => tableSelectedFields.has(f.name));

    let html = `
      <div class="field-group">
        <div class="field-group-header">
          <div class="field-group-title">
            <i class="bi bi-stack"></i>
            <span>${escapeHtml(currentSelectedTable)}</span>
          </div>
          <div class="field-group-actions">
            <label style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; font-size: 0.9rem;">
              <input type="checkbox" ${allSelected ? 'checked' : ''} 
                     onchange="toggleAllFields('${escapeAttr(currentSelectedTable)}', this.checked)">
              <span>全选字段</span>
            </label>
          </div>
        </div>
        <div class="field-list">
    `;

    fields.forEach(field => {
      const isSelected = tableSelectedFields.has(field.name);
      html += `
        <div class="field-item">
          <input type="checkbox" ${isSelected ? 'checked' : ''} 
                 onchange="toggleField('${escapeAttr(currentSelectedTable)}', '${escapeAttr(field.name)}', this.checked)"
                 id="field_${escapeAttr(currentSelectedTable)}_${escapeAttr(field.name)}">
          <label class="field-item-label" for="field_${escapeAttr(currentSelectedTable)}_${escapeAttr(field.name)}">
            <span class="field-item-name">${escapeHtml(field.name)}</span>
            <span class="field-item-type">${escapeHtml(field.type)}</span>
          </label>
        </div>
      `;
    });

    html += '</div></div>';

    // 显示其他已选表的字段（只读显示）
    selectedFields.forEach((fieldSet, tableName) => {
      if (tableName === currentSelectedTable) return;
      const otherFields = mockDatabaseTables[tableName] || [];
      if (fieldSet.size > 0) {
        html += `
          <div class="field-group" style="opacity: 0.7;">
            <div class="field-group-header">
              <div class="field-group-title">
                <i class="bi bi-stack"></i>
                <span>${escapeHtml(tableName)}</span>
              </div>
              <span style="font-size: 0.85rem; color: var(--gray-600);">已选 ${fieldSet.size} 个字段</span>
            </div>
          </div>
        `;
      }
    });

    container.innerHTML = html;

    // 更新选中数量
    const totalCount = Array.from(selectedFields.values()).reduce((sum, set) => sum + set.size, 0);
    if (countEl) countEl.textContent = `已选择 ${totalCount} 个字段`;
  }

  window.toggleField = function(tableName, fieldName, checked) {
    if (!selectedFields.has(tableName)) {
      selectedFields.set(tableName, new Set());
    }
    if (checked) {
      selectedFields.get(tableName).add(fieldName);
    } else {
      selectedFields.get(tableName).delete(fieldName);
      if (selectedFields.get(tableName).size === 0) {
        selectedFields.delete(tableName);
      }
    }
    renderFieldList();
  };

  window.toggleAllFields = function(tableName, checked) {
    const fields = mockDatabaseTables[tableName] || [];
    if (!selectedFields.has(tableName)) {
      selectedFields.set(tableName, new Set());
    }
    if (checked) {
      fields.forEach(f => selectedFields.get(tableName).add(f.name));
    } else {
      selectedFields.get(tableName).clear();
      selectedFields.delete(tableName);
    }
    renderFieldList();
  };

  function handleFieldSearch(e) {
    const keyword = e.target.value.toLowerCase().trim();
    // 简单的搜索过滤（可以后续优化）
    if (keyword) {
      // 过滤表列表
      const tableItems = document.querySelectorAll('.table-item');
      tableItems.forEach(item => {
        const tableName = item.textContent.toLowerCase();
        item.style.display = tableName.includes(keyword) ? '' : 'none';
      });

      // 过滤字段列表
      const fieldItems = document.querySelectorAll('.field-item');
      fieldItems.forEach(item => {
        const fieldName = item.textContent.toLowerCase();
        item.style.display = fieldName.includes(keyword) ? '' : 'none';
      });
    } else {
      document.querySelectorAll('.table-item, .field-item').forEach(el => {
        el.style.display = '';
      });
    }
  }

  function saveSelectedFields() {
    const fieldDictionary = [];
    
    selectedFields.forEach((fieldSet, tableName) => {
      const fields = mockDatabaseTables[tableName] || [];
      fieldSet.forEach(fieldName => {
        const fieldInfo = fields.find(f => f.name === fieldName);
        if (fieldInfo) {
          // 检查是否已存在（避免重复）
          const exists = app.db?.fieldDictionary?.some(f => f.table === tableName && f.field === fieldName);
          if (!exists) {
            fieldDictionary.push({
              table: tableName,
              field: fieldName,
              alias: fieldName, // 默认别名就是字段名
              type: fieldInfo.type,
              description: fieldInfo.description || '',
              queryable: true
            });
          } else {
            // 如果已存在，保留原有配置
            const existing = app.db.fieldDictionary.find(f => f.table === tableName && f.field === fieldName);
            if (existing) fieldDictionary.push(existing);
          }
        }
      });
    });

    // 合并到现有字段字典（保留手动添加的字段）
    const existingDict = app.db?.fieldDictionary || [];
    const existingKeys = new Set(existingDict.map(f => `${f.table}.${f.field}`));
    const newFields = fieldDictionary.filter(f => !existingKeys.has(`${f.table}.${f.field}`));
    
    app.db.fieldDictionary = [...existingDict, ...newFields];
    updateApp({ db: app.db });

    closeModal(document.getElementById('selectFieldsModal'));
    showToast(`已保存 ${fieldDictionary.length} 个字段到字段字典`, 'success');
  }

  // ========== 字段字典管理功能 ==========
  let currentEditingFieldIndex = -1;

  function initFieldDictModalEvents() {
    const addFieldBtn = document.getElementById('addFieldBtn');
    const saveFieldBtn = document.getElementById('saveFieldBtn');
    const importFieldsBtn = document.getElementById('importFieldsBtn');
    const exportFieldsBtn = document.getElementById('exportFieldsBtn');
    const fieldEditModal = document.getElementById('fieldEditModal');
    const fieldTableName = document.getElementById('fieldTableName');

    if (addFieldBtn) {
      addFieldBtn.addEventListener('click', () => {
        currentEditingFieldIndex = -1;
        resetFieldEditForm();
        document.getElementById('fieldEditTitle').innerHTML = '<i class="bi bi-plus-circle"></i> 添加字段';
        // 如果已填写表名，自动填充
        if (fieldTableName && fieldTableName.value.trim()) {
          document.getElementById('fieldTable').value = fieldTableName.value.trim();
        }
        openModal(fieldEditModal);
      });
    }

    if (saveFieldBtn) {
      saveFieldBtn.addEventListener('click', saveField);
    }

    if (importFieldsBtn) {
      importFieldsBtn.addEventListener('click', importFields);
    }

    if (exportFieldsBtn) {
      exportFieldsBtn.addEventListener('click', exportFields);
    }

    // 打开字段字典模态框时渲染列表
    const fieldDictModal = document.getElementById('fieldDictModal');
    if (fieldDictModal) {
      const observer = new MutationObserver((mutations) => {
        if (fieldDictModal.classList.contains('show')) {
          renderFieldsList();
        }
      });
      observer.observe(fieldDictModal, { attributes: true, attributeFilter: ['class'] });
    }
  }

  function renderFieldsList() {
    const tbody = document.getElementById('fieldsTableBody');
    if (!tbody) return;

    const fields = app.db?.fieldDictionary || [];
    if (fields.length === 0) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 2rem; color: var(--gray-600);">暂无字段，点击"添加字段"开始配置</td></tr>';
      return;
    }

    tbody.innerHTML = fields.map((f, idx) => `
      <tr>
        <td>${escapeHtml(f.table || '-')}</td>
        <td><code>${escapeHtml(f.field || '-')}</code></td>
        <td>${escapeHtml(f.alias || '-')}</td>
        <td>${escapeHtml(f.type || '-')}</td>
        <td>${escapeHtml(f.description || '-')}</td>
        <td>${f.queryable !== false ? '<span style="color: var(--success-color);">✓</span>' : '<span style="color: var(--danger-color);">✗</span>'}</td>
        <td>
          <button class="btn btn-secondary btn-sm" onclick="editField(${idx})">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-danger btn-sm" onclick="deleteField(${idx})" style="margin-left: 0.25rem;">
            <i class="bi bi-trash"></i>
          </button>
        </td>
      </tr>
    `).join('');
  }

  window.editField = function(idx) {
    currentEditingFieldIndex = idx;
    const f = app.db.fieldDictionary[idx];
    document.getElementById('fieldEditTitle').innerHTML = '<i class="bi bi-pencil-square"></i> 编辑字段';
    document.getElementById('fieldTable').value = f.table || '';
    document.getElementById('fieldName').value = f.field || '';
    document.getElementById('fieldAlias').value = f.alias || '';
    document.getElementById('fieldType').value = f.type || 'text';
    document.getElementById('fieldDesc').value = f.description || '';
    document.getElementById('fieldQueryable').checked = f.queryable !== false;
    openModal(document.getElementById('fieldEditModal'));
  };

  window.deleteField = function(idx) {
    if (!confirm('确定要删除这个字段吗？')) return;
    app.db.fieldDictionary.splice(idx, 1);
    updateApp({ db: app.db });
    renderFieldsList();
    showToast('字段已删除', 'success');
  };

  function saveField() {
    const table = document.getElementById('fieldTable').value.trim();
    const field = document.getElementById('fieldName').value.trim();
    const alias = document.getElementById('fieldAlias').value.trim();
    const type = document.getElementById('fieldType').value;
    const description = document.getElementById('fieldDesc').value.trim();
    const queryable = document.getElementById('fieldQueryable').checked;

    if (!table || !field) {
      showToast('请填写表名和字段名', 'info');
      return;
    }

    const fieldData = { table, field, alias, type, description, queryable };

    if (!app.db.fieldDictionary) {
      app.db.fieldDictionary = [];
    }

    if (currentEditingFieldIndex >= 0) {
      app.db.fieldDictionary[currentEditingFieldIndex] = fieldData;
    } else {
      app.db.fieldDictionary.push(fieldData);
    }

    updateApp({ db: app.db });
    closeModal(document.getElementById('fieldEditModal'));
    renderFieldsList();
    showToast('字段已保存', 'success');
  }

  function resetFieldEditForm() {
    document.getElementById('fieldTable').value = '';
    document.getElementById('fieldName').value = '';
    document.getElementById('fieldAlias').value = '';
    document.getElementById('fieldType').value = 'text';
    document.getElementById('fieldDesc').value = '';
    document.getElementById('fieldQueryable').checked = true;
  }

  function importFields() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json,.csv';
    input.onchange = (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          let data;
          if (file.name.endsWith('.csv')) {
            // 简单的CSV解析（可以后续优化）
            const lines = ev.target.result.split('\n');
            data = lines.slice(1).filter(l => l.trim()).map(line => {
              const [table, field, alias, type, description, queryable] = line.split(',').map(s => s.trim());
              return { table, field, alias, type, description, queryable: queryable !== 'false' };
            });
          } else {
            data = JSON.parse(ev.target.result);
          }
          if (Array.isArray(data)) {
            if (!app.db.fieldDictionary) app.db.fieldDictionary = [];
            app.db.fieldDictionary = [...app.db.fieldDictionary, ...data];
            updateApp({ db: app.db });
            renderFieldsList();
            showToast(`已导入 ${data.length} 个字段`, 'success');
          } else {
            showToast('文件格式不正确', 'info');
          }
        } catch (err) {
          showToast('导入失败：' + err.message, 'info');
        }
      };
      reader.readAsText(file);
    };
    input.click();
  }

  function exportFields() {
    const fields = app.db?.fieldDictionary || [];
    if (fields.length === 0) {
      showToast('暂无字段可导出', 'info');
      return;
    }
    const blob = new Blob([JSON.stringify(fields, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `field_dictionary_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('字段字典已导出', 'success');
  }

  // ========== 工具函数 ==========
  function insertTextAtCursor(textarea, text) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const before = textarea.value.substring(0, start);
    const after = textarea.value.substring(end);
    textarea.value = before + text + after;
    textarea.focus();
    textarea.setSelectionRange(start + text.length, start + text.length);
  }

  function openModal(modal) {
    if (!modal) return;
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.classList.remove('show');
    document.body.style.overflow = '';
  }

  // 模态框关闭事件
  document.addEventListener('click', (e) => {
    const closeBtn = e.target.closest('[data-close]');
    if (closeBtn) {
      const modalId = closeBtn.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) closeModal(modal);
    }
    if (e.target.classList?.contains('modal') && e.target.classList.contains('show')) {
      closeModal(e.target);
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal.show').forEach(m => closeModal(m));
      hideVariableSuggestions();
    }
  });
});

