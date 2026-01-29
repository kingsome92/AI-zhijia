document.addEventListener('DOMContentLoaded', () => {
  const APP_STORAGE_KEY = 'applications';

  const createAppBtn = document.getElementById('createAppBtn');
  const createAppModal = document.getElementById('createAppModal');
  const deleteAppModal = document.getElementById('deleteAppModal');
  const confirmCreateApp = document.getElementById('confirmCreateApp');
  const confirmDeleteApp = document.getElementById('confirmDeleteApp');
  const appSearch = document.getElementById('appSearch');
  const appTableBody = document.getElementById('appTableBody');
  const emptyState = document.getElementById('emptyState');
  const deleteAppName = document.getElementById('deleteAppName');

  let apps = loadApps();
  let appToDeleteId = null;

  bindEvents();
  renderTable();

  function loadApps() {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  function saveApps() {
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(apps));
  }

  function bindEvents() {
    createAppBtn.addEventListener('click', () => openModal(createAppModal));
    confirmCreateApp.addEventListener('click', handleCreateApp);
    confirmDeleteApp.addEventListener('click', handleDeleteApp);
    appSearch.addEventListener('input', render);

    document.addEventListener('click', (e) => {
      const closeBtn = e.target.closest('[data-close]');
      if (closeBtn) {
        const id = closeBtn.getAttribute('data-close');
        const modal = document.getElementById(id);
        if (modal) closeModal(modal);
      }

      // 点击遮罩关闭
      const modalEl = e.target.classList?.contains('modal-mask') ? e.target.closest('.modal') : null;
      if (modalEl && modalEl.classList.contains('show')) {
        closeModal(modalEl);
      }

      const actionBtn = e.target.closest('[data-action]');
      if (!actionBtn) return;
      const action = actionBtn.getAttribute('data-action');
      const id = actionBtn.getAttribute('data-id');
      if (!id) return;

      if (action === 'edit') {
        window.location.href = `appEdit.html?id=${encodeURIComponent(id)}`;
      }
      if (action === 'delete') {
        const app = apps.find((a) => a.id === id);
        if (!app) return;
        appToDeleteId = id;
        deleteAppName.textContent = app.name || '-';
        openModal(deleteAppModal);
      }
      if (action === 'toggle') {
        toggleStatus(id);
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.show').forEach((m) => closeModal(m));
      }
    });
  }

  function openModal(modal) {
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
  }

  function closeModal(modal) {
    modal.classList.remove('show');
    document.body.style.overflow = '';
    if (modal === createAppModal) {
      document.getElementById('newAppName').value = '';
      document.getElementById('newAppDesc').value = '';
    }
    if (modal === deleteAppModal) {
      appToDeleteId = null;
    }
  }

  function nowISO() {
    return new Date().toISOString();
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

  function handleCreateApp() {
    const name = document.getElementById('newAppName').value.trim();
    const description = document.getElementById('newAppDesc').value.trim();
    if (!name) {
      document.getElementById('newAppName').focus();
      return;
    }

    const id = `app-${Date.now()}`;
    const app = {
      id,
      name,
      description,
      status: 'draft',
      createdAt: nowISO(),
      updatedAt: nowISO(),
      sessionTemplateId: 'default',
      modelId: null,
      prompt: '',
      toolIds: [],
      db: {
        enabled: false,
        type: 'mysql',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        schemaHint: ''
      },
      appKey: null,
      publishedAt: null
    };

    apps.unshift(app);
    saveApps();
    closeModal(createAppModal);
    window.location.href = `appEdit.html?id=${encodeURIComponent(id)}`;
  }

  function handleDeleteApp() {
    if (!appToDeleteId) return;
    apps = apps.filter((a) => a.id !== appToDeleteId);
    saveApps();
    closeModal(deleteAppModal);
    render();
  }

  function toggleStatus(id) {
    const app = apps.find((a) => a.id === id);
    if (!app) return;
    if (app.status === 'published') {
      app.status = 'draft';
      app.publishedAt = null;
    } else {
      app.status = 'published';
      app.publishedAt = nowISO();
      if (!app.appKey) {
        // 发布时默认生成一次密钥
        app.appKey = generateAppKey();
      }
    }
    app.updatedAt = nowISO();
    saveApps();
    render();
  }

  function generateAppKey() {
    // 轻量实现：不依赖加密库，满足原型交互
    const rand = () => Math.random().toString(36).slice(2, 10);
    return `ak_${rand()}_${rand()}`.toUpperCase();
  }

  function render() {
    renderTable();
  }

  function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  function escapeAttr(text) {
    return String(text).replace(/"/g, '&quot;');
  }

  function renderTable() {
    const keyword = appSearch.value.trim().toLowerCase();
    const filtered = apps.filter((a) => {
      if (!keyword) return true;
      const haystack = `${a.name || ''} ${a.description || ''}`.toLowerCase();
      return haystack.includes(keyword);
    });

    if (apps.length === 0) {
      appTableBody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';
    if (filtered.length === 0) {
      appTableBody.innerHTML = `
        <tr>
          <td colspan="6" class="no-data">无匹配结果</td>
        </tr>
      `;
      return;
    }

    appTableBody.innerHTML = filtered
      .map((app, idx) => {
        const isPublished = app.status === 'published';
        const badgeClass = isPublished ? 'status-published' : 'status-draft';
        const badgeText = isPublished ? '已发布' : '草稿';
        const badgeIcon = isPublished ? 'bi-check-circle' : 'bi-pencil-square';
        return `
          <tr>
            <td>${idx + 1}</td>
            <td><strong>${escapeHtml(app.name || '-')}</strong></td>
            <td class="text-secondary">${escapeHtml(app.description || '-')}</td>
            <td>
              <span class="status-badge ${badgeClass}">
                <i class="bi ${badgeIcon}"></i>${badgeText}
              </span>
            </td>
            <td>${formatTime(app.updatedAt)}</td>
            <td>
              <div class="row-actions">
                <button type="button" class="btn btn-link" data-action="edit" data-id="${escapeAttr(app.id)}">
                  <i class="bi bi-pencil"></i> 编辑
                </button>
                <button type="button" class="btn btn-link" data-action="toggle" data-id="${escapeAttr(app.id)}">
                  <i class="bi ${isPublished ? 'bi-arrow-counterclockwise' : 'bi-upload'}"></i>
                  ${isPublished ? '回到草稿' : '快速发布'}
                </button>
                <button type="button" class="btn btn-link btn-link-danger" data-action="delete" data-id="${escapeAttr(app.id)}">
                  <i class="bi bi-trash"></i> 删除
                </button>
              </div>
            </td>
          </tr>
        `;
      })
      .join('');
  }
});

