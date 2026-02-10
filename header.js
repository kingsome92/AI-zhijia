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
    // 如果点击的是下拉菜单项，直接跳转，不处理下拉菜单的显示/隐藏
    if (e.target.closest('.dropdown-item')) {
      // 关闭所有下拉菜单
      document.querySelectorAll('.dropdown-menu').forEach(menu => {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(8px)';
      });
      return;
    }
    
    // 如果点击的是下拉菜单的触发链接（.nav-link），阻止默认行为并切换下拉菜单
    const navLink = e.target.closest('.nav-link');
    if (navLink) {
      const href = navLink.getAttribute('href');
      if (href === '#' || href === null) {
        e.preventDefault();
        e.stopPropagation();
        const dropdown = navLink.closest('.dropdown');
        if (dropdown) {
          const dropdownMenu = dropdown.querySelector('.dropdown-menu');
          if (dropdownMenu) {
            // 检查当前是否可见（通过内联样式或计算样式）
            const computedStyle = window.getComputedStyle(dropdownMenu);
            const isVisible = dropdownMenu.style.visibility === 'visible' || 
                             dropdownMenu.style.opacity === '1' ||
                             (dropdownMenu.style.visibility !== 'hidden' && 
                              computedStyle.visibility === 'visible' && 
                              computedStyle.opacity !== '0');
            
            // 关闭所有其他下拉菜单
            document.querySelectorAll('.dropdown-menu').forEach(menu => {
              if (menu !== dropdownMenu) {
                menu.style.opacity = '0';
                menu.style.visibility = 'hidden';
                menu.style.transform = 'translateY(8px)';
              }
            });
            
            // 切换当前下拉菜单
            if (isVisible) {
              dropdownMenu.style.opacity = '0';
              dropdownMenu.style.visibility = 'hidden';
              dropdownMenu.style.transform = 'translateY(8px)';
            } else {
              dropdownMenu.style.opacity = '1';
              dropdownMenu.style.visibility = 'visible';
              dropdownMenu.style.transform = 'translateY(0)';
            }
          }
        }
        return;
      }
    }
    
    // 如果点击的是下拉菜单本身，不关闭
    if (e.target.closest('.dropdown-menu')) {
      return;
    }
    
    // 点击其他地方时，关闭所有下拉菜单
    document.querySelectorAll('.dropdown-menu').forEach(menu => {
      menu.style.opacity = '0';
      menu.style.visibility = 'hidden';
      menu.style.transform = 'translateY(8px)';
    });
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
