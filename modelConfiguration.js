document.addEventListener("DOMContentLoaded", function() {
  // 加载公共组件
  loadCommonComponents();
  
  // 初始化页面功能
  initModelConfiguration();
});

function loadCommonComponents() {
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
}

// 模型数据存储（实际应用中应该从服务器获取）
let models = JSON.parse(localStorage.getItem('models')) || [];
let currentEditId = null;

function initModelConfiguration() {
  // 初始化模型管理功能
  initModelManagement();
  
  // 初始化模态框内的功能
  initModalFunctions();
}

// 初始化模态框内的功能（滑块、测试等）
function initModalFunctions() {
  const modalTestBtn = document.getElementById('modal-test-btn');
  const modalResetConfigBtn = document.getElementById('modal-reset-config-btn');
  
  // 测试按钮点击事件
  if (modalTestBtn) {
    modalTestBtn.addEventListener('click', function() {
      const testPrompt = document.getElementById('modal-test-prompt');
      const testResponse = document.getElementById('modal-test-response');
      
      if (!testPrompt || !testPrompt.value.trim()) {
        showToast('请输入测试提示词', 'error');
        return;
      }
      
      modalTestBtn.disabled = true;
      modalTestBtn.innerHTML = '<i class="bi bi-hourglass"></i> 测试中...';
      
      // 模拟API调用延迟
      setTimeout(() => {
        // 这里是模拟响应，实际应用中应该调用真实的API
        const mockResponses = {
          "gpt-4": "这是GPT-4模型的模拟响应。GPT-4是OpenAI开发的大型语言模型，具有更强的理解和生成能力。",
          "gpt-3.5": "这是GPT-3.5模型的模拟响应。GPT-3.5是OpenAI开发的语言模型，性能优秀且响应迅速。",
          "claude-2": "这是Claude 2模型的模拟响应。Claude 2由Anthropic开发，注重安全性和实用性。",
          "llama-2": "这是Llama 2模型的模拟响应。Llama 2由Meta开发，是一个开源的大型语言模型。"
        };
        
        const modelVersion = document.getElementById('model-version-input');
        const selectedModel = modelVersion ? modelVersion.value : 'gpt-3.5';
        testResponse.value = mockResponses[selectedModel] || "未识别的模型版本";
        
        modalTestBtn.disabled = false;
        modalTestBtn.innerHTML = '<i class="bi bi-play-circle"></i> 测试模型';
      }, 1500);
    });
  }
  
  // 重置配置按钮点击事件
  if (modalResetConfigBtn) {
    modalResetConfigBtn.addEventListener('click', function() {
      if (confirm('确定要恢复默认配置吗？当前修改将丢失。')) {
        resetModalConfigToDefault();
      }
    });
  }
}

// 重置模态框配置为默认值
function resetModalConfigToDefault() {
  const contextLength = document.getElementById('modal-context-length');
  const temperature = document.getElementById('modal-temperature');
  const maxTokens = document.getElementById('modal-max-tokens');
  const topP = document.getElementById('modal-top-p');
  const frequencyPenalty = document.getElementById('modal-frequency-penalty');
  const testPrompt = document.getElementById('modal-test-prompt');
  const testResponse = document.getElementById('modal-test-response');
  
  if (contextLength) {
    contextLength.value = '2048';
    updateRangeValue(contextLength);
    syncRangeToNumberInput(contextLength);
  }
  if (temperature) {
    temperature.value = '0.7';
    updateRangeValue(temperature);
    syncRangeToNumberInput(temperature);
  }
  if (maxTokens) {
    maxTokens.value = '512';
    updateRangeValue(maxTokens);
    syncRangeToNumberInput(maxTokens);
  }
  if (topP) {
    topP.value = '0.9';
    updateRangeValue(topP);
    syncRangeToNumberInput(topP);
  }
  if (frequencyPenalty) {
    frequencyPenalty.value = '0.5';
    updateRangeValue(frequencyPenalty);
  }
  if (testPrompt) testPrompt.value = '';
  if (testResponse) testResponse.value = '';
}

// 更新滑块值显示
function updateRangeValue(input) {
  const valueDisplay = input.nextElementSibling;
  if (valueDisplay && valueDisplay.classList.contains('range-value')) {
    valueDisplay.textContent = input.value;
  }
}

// 初始化模态框内的滑块
function initModalRangeInputs() {
  const modalRangeInputs = document.querySelectorAll('#model-modal input[type="range"]');
  modalRangeInputs.forEach(input => {
    // 初始化显示值
    updateRangeValue(input);
    
    // 滑块值变化时更新显示并同步到数字输入框
    input.addEventListener('input', function() {
      updateRangeValue(this);
      syncRangeToNumberInput(this);
    });
  });
  
  // 同步数字输入框到滑块
  const numberInputs = [
    { number: 'model-context-length', range: 'modal-context-length' },
    { number: 'model-temperature', range: 'modal-temperature' },
    { number: 'model-max-tokens', range: 'modal-max-tokens' },
    { number: 'model-top-p', range: 'modal-top-p' }
  ];
  
  numberInputs.forEach(pair => {
    const numberInput = document.getElementById(pair.number);
    const rangeInput = document.getElementById(pair.range);
    if (numberInput && rangeInput) {
      numberInput.addEventListener('input', function() {
        rangeInput.value = this.value;
        updateRangeValue(rangeInput);
      });
    }
  });
}

// 同步滑块值到对应的数字输入框
function syncRangeToNumberInput(rangeInput) {
  const idMap = {
    'modal-context-length': 'model-context-length',
    'modal-temperature': 'model-temperature',
    'modal-max-tokens': 'model-max-tokens',
    'modal-top-p': 'model-top-p'
  };
  
  const numberInputId = idMap[rangeInput.id];
  if (numberInputId) {
    const numberInput = document.getElementById(numberInputId);
    if (numberInput) {
      numberInput.value = rangeInput.value;
    }
  }
}

// 初始化模型管理功能
function initModelManagement() {
  const addModelBtn = document.getElementById('add-model-btn');
  const modelModal = document.getElementById('model-modal');
  const deleteModal = document.getElementById('delete-modal');
  const modalClose = document.getElementById('modal-close');
  const deleteModalClose = document.getElementById('delete-modal-close');
  const modalCancel = document.getElementById('modal-cancel');
  const deleteCancel = document.getElementById('delete-cancel');
  const deleteConfirm = document.getElementById('delete-confirm');
  const modelForm = document.getElementById('model-form');
  
  // 渲染模型列表
  renderModelList();
  
  // 添加模型按钮
  addModelBtn.addEventListener('click', () => {
    openModelModal();
  });
  
  // 关闭模态框
  modalClose.addEventListener('click', closeModelModal);
  deleteModalClose.addEventListener('click', closeDeleteModal);
  modalCancel.addEventListener('click', closeModelModal);
  deleteCancel.addEventListener('click', closeDeleteModal);
  
  // 点击模态框背景关闭
  modelModal.addEventListener('click', (e) => {
    if (e.target === modelModal) {
      closeModelModal();
    }
  });
  
  deleteModal.addEventListener('click', (e) => {
    if (e.target === deleteModal) {
      closeDeleteModal();
    }
  });
  
  // 表单提交
  modelForm.addEventListener('submit', (e) => {
    e.preventDefault();
    saveModel();
  });
  
  // 删除确认
  deleteConfirm.addEventListener('click', () => {
    const modelId = deleteConfirm.dataset.modelId;
    if (modelId) {
      deleteModel(modelId);
    }
  });
}

// 渲染模型列表
function renderModelList() {
  const container = document.getElementById('model-list-container');
  
  if (models.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <i class="bi bi-inbox" style="font-size: 3rem; color: var(--gray-400);"></i>
        <p style="color: var(--gray-500); margin-top: 1rem;">暂无模型，点击"添加模型"开始添加</p>
      </div>
    `;
    return;
  }
  
  container.innerHTML = models.map(model => `
    <div class="model-item ${!model.enabled ? 'disabled' : ''}" data-id="${model.id}">
      <div class="model-item-header">
        <div class="model-item-info">
          <div class="model-item-title">
            <span class="model-item-name">${escapeHtml(model.name)}</span>
            <span class="model-item-version">v${escapeHtml(model.version)}</span>
            <span class="model-item-badge ${model.enabled ? 'badge-enabled' : 'badge-disabled'}">
              <i class="bi ${model.enabled ? 'bi-check-circle' : 'bi-x-circle'}"></i>
              ${model.enabled ? '已启用' : '已禁用'}
            </span>
          </div>
          ${model.description ? `<p style="color: var(--gray-600); font-size: 0.875rem; margin-top: 0.5rem;">${escapeHtml(model.description)}</p>` : ''}
          <div class="model-item-details">
            <div class="model-detail-item">
              <span class="model-detail-label">提供商</span>
              <span class="model-detail-value">${escapeHtml(getProviderName(model.provider))}</span>
            </div>
            <div class="model-detail-item">
              <span class="model-detail-label">上下文长度</span>
              <span class="model-detail-value">${model.contextLength || 'N/A'}</span>
            </div>
            <div class="model-detail-item">
              <span class="model-detail-label">Temperature</span>
              <span class="model-detail-value">${model.temperature || 'N/A'}</span>
            </div>
            <div class="model-detail-item">
              <span class="model-detail-label">最大输出</span>
              <span class="model-detail-value">${model.maxTokens || 'N/A'}</span>
            </div>
          </div>
        </div>
        <div class="model-item-actions">
          <button class="btn btn-sm ${model.enabled ? 'btn-warning' : 'btn-success'} btn-icon" 
                  onclick="toggleModel('${model.id}')" 
                  title="${model.enabled ? '禁用' : '启用'}">
            <i class="bi ${model.enabled ? 'bi-pause-circle' : 'bi-play-circle'}"></i>
          </button>
          <button class="btn btn-sm btn-info btn-icon" 
                  onclick="editModel('${model.id}')" 
                  title="编辑">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn btn-sm btn-danger btn-icon" 
                  onclick="confirmDelete('${model.id}')" 
                  title="删除">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// 打开添加/编辑模型模态框
function openModelModal(modelId = null) {
  const modal = document.getElementById('model-modal');
  const modalTitle = document.getElementById('modal-title');
  const form = document.getElementById('model-form');
  
  // 处理id类型
  if (modelId !== null) {
    modelId = typeof modelId === 'string' ? parseInt(modelId) : modelId;
  }
  
  currentEditId = modelId;
  
  if (modelId) {
    // 编辑模式
    const model = models.find(m => m.id === modelId);
    if (!model) return;
    
    modalTitle.innerHTML = '<i class="bi bi-pencil"></i> 编辑模型';
    document.getElementById('model-name').value = model.name;
    document.getElementById('model-version-input').value = model.version;
    document.getElementById('model-provider').value = model.provider;
    document.getElementById('model-description').value = model.description || '';
    // 设置数字输入框的值
    document.getElementById('model-context-length').value = model.contextLength || 2048;
    document.getElementById('model-temperature').value = model.temperature || 0.7;
    document.getElementById('model-max-tokens').value = model.maxTokens || 512;
    document.getElementById('model-top-p').value = model.topP || 0.9;
    document.getElementById('model-api-key').value = '';
    document.getElementById('model-endpoint').value = model.endpoint || '';
    document.getElementById('model-enabled').checked = model.enabled !== false;
    
    // 设置模态框内的滑块值（与数字输入框同步）
    const modalContextLength = document.getElementById('modal-context-length');
    const modalTemperature = document.getElementById('modal-temperature');
    const modalMaxTokens = document.getElementById('modal-max-tokens');
    const modalTopP = document.getElementById('modal-top-p');
    const modalFrequencyPenalty = document.getElementById('modal-frequency-penalty');
    
    if (modalContextLength) {
      modalContextLength.value = model.contextLength || 2048;
      updateRangeValue(modalContextLength);
    }
    if (modalTemperature) {
      modalTemperature.value = model.temperature || 0.7;
      updateRangeValue(modalTemperature);
    }
    if (modalMaxTokens) {
      modalMaxTokens.value = model.maxTokens || 512;
      updateRangeValue(modalMaxTokens);
    }
    if (modalTopP) {
      modalTopP.value = model.topP || 0.9;
      updateRangeValue(modalTopP);
    }
    if (modalFrequencyPenalty) {
      modalFrequencyPenalty.value = model.frequencyPenalty || 0.5;
      updateRangeValue(modalFrequencyPenalty);
    }
    
    // 清空测试区域
    const testPrompt = document.getElementById('modal-test-prompt');
    const testResponse = document.getElementById('modal-test-response');
    if (testPrompt) testPrompt.value = '';
    if (testResponse) testResponse.value = '';
  } else {
    // 添加模式
    modalTitle.innerHTML = '<i class="bi bi-plus-circle"></i> 添加模型';
    form.reset();
    // 设置数字输入框的默认值
    document.getElementById('model-context-length').value = 2048;
    document.getElementById('model-temperature').value = 0.7;
    document.getElementById('model-max-tokens').value = 512;
    document.getElementById('model-top-p').value = 0.9;
    document.getElementById('model-enabled').checked = true;
    
    // 重置模态框内的配置为默认值（这会同步滑块和数字输入框）
    resetModalConfigToDefault();
  }
  
  // 初始化模态框内的滑块
  initModalRangeInputs();
  
  modal.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// 关闭模型模态框
function closeModelModal() {
  const modal = document.getElementById('model-modal');
  modal.classList.remove('show');
  document.body.style.overflow = '';
  currentEditId = null;
}

// 保存模型
function saveModel() {
  const name = document.getElementById('model-name').value.trim();
  const version = document.getElementById('model-version-input').value.trim();
  
  if (!name || !version) {
    showToast('请填写模型名称和版本', 'error');
    return;
  }
  
  // 从模态框内的滑块获取配置值
  const modalContextLength = document.getElementById('modal-context-length');
  const modalTemperature = document.getElementById('modal-temperature');
  const modalMaxTokens = document.getElementById('modal-max-tokens');
  const modalTopP = document.getElementById('modal-top-p');
  const modalFrequencyPenalty = document.getElementById('modal-frequency-penalty');
  
  const modelData = {
    name,
    version,
    provider: document.getElementById('model-provider').value,
    description: document.getElementById('model-description').value.trim(),
    contextLength: modalContextLength ? parseInt(modalContextLength.value) : (parseInt(document.getElementById('model-context-length').value) || 2048),
    temperature: modalTemperature ? parseFloat(modalTemperature.value) : (parseFloat(document.getElementById('model-temperature').value) || 0.7),
    maxTokens: modalMaxTokens ? parseInt(modalMaxTokens.value) : (parseInt(document.getElementById('model-max-tokens').value) || 512),
    topP: modalTopP ? parseFloat(modalTopP.value) : (parseFloat(document.getElementById('model-top-p').value) || 0.9),
    frequencyPenalty: modalFrequencyPenalty ? parseFloat(modalFrequencyPenalty.value) : 0.5,
    endpoint: document.getElementById('model-endpoint').value.trim(),
    enabled: document.getElementById('model-enabled').checked
  };
  
  // 如果填写了API Key，保存（实际应用中应该加密）
  const apiKey = document.getElementById('model-api-key').value.trim();
  if (apiKey) {
    modelData.apiKey = apiKey;
  }
  
  if (currentEditId) {
    // 更新模型
    const index = models.findIndex(m => m.id === currentEditId);
    if (index !== -1) {
      // 保留原有的id、createdAt和apiKey（如果新值未提供）
      const existingModel = models[index];
      models[index] = { 
        ...existingModel, 
        ...modelData,
        id: existingModel.id,
        createdAt: existingModel.createdAt
      };
      // 如果未提供新的API Key，保留原有的
      if (!apiKey && existingModel.apiKey) {
        models[index].apiKey = existingModel.apiKey;
      }
      showToast('模型更新成功', 'success');
    }
  } else {
    // 添加新模型
    modelData.id = Date.now();
    modelData.createdAt = new Date().toISOString();
    models.push(modelData);
    showToast('模型添加成功', 'success');
  }
  
  saveModelsToStorage();
  renderModelList();
  closeModelModal();
}

// 编辑模型（暴露到全局作用域）
window.editModel = function(id) {
  const modelId = typeof id === 'string' ? parseInt(id) : id;
  openModelModal(modelId);
};

// 切换启用/禁用状态（暴露到全局作用域）
window.toggleModel = function(id) {
  const modelId = typeof id === 'string' ? parseInt(id) : id;
  const model = models.find(m => m.id === modelId);
  if (!model) return;
  
  model.enabled = !model.enabled;
  saveModelsToStorage();
  renderModelList();
  showToast(`模型已${model.enabled ? '启用' : '禁用'}`, 'success');
};

// 确认删除（暴露到全局作用域）
window.confirmDelete = function(id) {
  const modelId = typeof id === 'string' ? parseInt(id) : id;
  const model = models.find(m => m.id === modelId);
  if (!model) return;
  
  const deleteModal = document.getElementById('delete-modal');
  const deleteModelName = document.getElementById('delete-model-name');
  const deleteConfirm = document.getElementById('delete-confirm');
  
  deleteModelName.textContent = model.name;
  deleteConfirm.dataset.modelId = modelId;
  deleteModal.classList.add('show');
  document.body.style.overflow = 'hidden';
};

// 关闭删除模态框
function closeDeleteModal() {
  const deleteModal = document.getElementById('delete-modal');
  deleteModal.classList.remove('show');
  document.body.style.overflow = '';
}

// 删除模型
function deleteModel(id) {
  const modelId = typeof id === 'string' ? parseInt(id) : id;
  const modelItem = document.querySelector(`.model-item[data-id="${modelId}"]`);
  if (modelItem) {
    modelItem.classList.add('removing');
    setTimeout(() => {
      models = models.filter(m => m.id !== modelId);
      saveModelsToStorage();
      renderModelList();
      closeDeleteModal();
      showToast('模型删除成功', 'success');
    }, 300);
  }
}

// 保存模型到本地存储
function saveModelsToStorage() {
  localStorage.setItem('models', JSON.stringify(models));
}

// 获取提供商名称
function getProviderName(provider) {
  const providerMap = {
    'openai': 'OpenAI',
    'anthropic': 'Anthropic',
    'meta': 'Meta',
    'google': 'Google',
    'other': '其他'
  };
  return providerMap[provider] || provider;
}

// HTML转义
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// 显示Toast提示
function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icons = {
    success: 'bi-check-circle-fill',
    error: 'bi-x-circle-fill',
    info: 'bi-info-circle-fill'
  };
  
  toast.innerHTML = `
    <i class="bi ${icons[type]} toast-icon"></i>
    <span class="toast-message">${escapeHtml(message)}</span>
  `;
  
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.animation = 'slideInRight 0.3s ease-out reverse';
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}