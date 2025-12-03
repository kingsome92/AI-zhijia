document.addEventListener('DOMContentLoaded', function() {
  // 搜索功能
  const searchInput = document.querySelector('.search-input');
  const searchButton = document.querySelector('.search-button');
  
  searchButton.addEventListener('click', function() {
    performSearch();
  });
  
  searchInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
      performSearch();
    }
  });
  
  function performSearch() {
    const query = searchInput.value.trim();
    if (query) {
      // 在实际应用中，这里会执行搜索逻辑或导航到搜索结果页
      console.log('执行搜索:', query);
      alert(`正在搜索: ${query}`);
    }
  }
  
  // 用户菜单交互
  const userProfile = document.querySelector('.user-profile');
  const logoutButton = document.querySelector('.logout-button');
  
  logoutButton.addEventListener('click', function(e) {
    e.stopPropagation();
    // 在实际应用中，这里会处理退出登录逻辑
    console.log('用户退出登录');
    alert('您已退出登录');
  });
  
  // 下拉菜单点击事件委托
  document.addEventListener('click', function(e) {
    // 关闭所有打开的下拉菜单
    const openDropdowns = document.querySelectorAll('.dropdown-menu');
    openDropdowns.forEach(dropdown => {
      if (!dropdown.contains(e.target) && !dropdown.previousElementSibling.contains(e.target)) {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(8px)';
      }
    });
    
    // 处理当前点击的下拉菜单
    if (e.target.closest('.dropdown')) {
      const dropdown = e.target.closest('.dropdown').querySelector('.dropdown-menu');
      const isVisible = dropdown.style.visibility === 'visible';
      
      // 关闭所有其他下拉菜单
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        if (menu !== dropdown) {
          menu.style.opacity = '0';
          menu.style.visibility = 'hidden';
          menu.style.transform = 'translateY(8px)';
        }
      });
      
      // 切换当前下拉菜单
      if (isVisible) {
        dropdown.style.opacity = '0';
        dropdown.style.visibility = 'hidden';
        dropdown.style.transform = 'translateY(8px)';
      } else {
        dropdown.style.opacity = '1';
        dropdown.style.visibility = 'visible';
        dropdown.style.transform = 'translateY(0)';
      }
    }
  });
  
  // 移动端菜单切换（如果需要）
  function initMobileMenu() {
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.innerHTML = '☰';
    
    const headerContainer = document.querySelector('.header-container');
    headerContainer.insertBefore(mobileMenuButton, headerContainer.firstChild);
    
    mobileMenuButton.addEventListener('click', function() {
      const mainNav = document.querySelector('.main-nav');
      if (mainNav.style.display === 'block') {
        mainNav.style.display = 'none';
      } else {
        mainNav.style.display = 'block';
      }
    });
  }
  
  // 检测屏幕宽度，决定是否初始化移动菜单
  if (window.innerWidth <= 992) {
    initMobileMenu();
  }
  
  // 响应式调整
  window.addEventListener('resize', function() {
    if (window.innerWidth > 992) {
      const mainNav = document.querySelector('.main-nav');
      if (mainNav) {
        mainNav.style.display = '';
      }
      
      const mobileMenuButton = document.querySelector('.mobile-menu-button');
      if (mobileMenuButton) {
        mobileMenuButton.remove();
      }
    } else {
      if (!document.querySelector('.mobile-menu-button')) {
        initMobileMenu();
      }
    }
  });
});