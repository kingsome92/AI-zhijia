document.addEventListener('DOMContentLoaded', function() {
  // 获取当前页面路径
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  
  // 高亮当前页面对应的底部链接
  const footerLinks = document.querySelectorAll('.footer-link');
  footerLinks.forEach(link => {
    const linkPath = link.getAttribute('href').split('/').pop();
    if (linkPath === currentPath) {
      link.classList.add('active');
      link.style.color = '#4a90e2';
    }
  });
  
  // 为社交媒体图标添加悬停效果
  const socialIcons = document.querySelectorAll('.social-icon');
  socialIcons.forEach(icon => {
    icon.addEventListener('mouseenter', function() {
      this.querySelector('img').style.transform = 'scale(1.1)';
    });
    
    icon.addEventListener('mouseleave', function() {
      this.querySelector('img').style.transform = 'scale(1)';
    });
  });
  
  // 平滑滚动到页面顶部
  const backToTop = document.createElement('div');
  backToTop.className = 'back-to-top';
  backToTop.innerHTML = '↑';
  backToTop.style.display = 'none';
  backToTop.style.position = 'fixed';
  backToTop.style.bottom = '20px';
  backToTop.style.right = '20px';
  backToTop.style.width = '50px';
  backToTop.style.height = '50px';
  backToTop.style.backgroundColor = '#4a90e2';
  backToTop.style.color = 'white';
  backToTop.style.borderRadius = '50%';
  backToTop.style.display = 'flex';
  backToTop.style.alignItems = 'center';
  backToTop.style.justifyContent = 'center';
  backToTop.style.cursor = 'pointer';
  backToTop.style.boxShadow = '0 2px 10px rgba(0,0,0,0.2)';
  backToTop.style.transition = 'all 0.3s ease';
  backToTop.style.zIndex = '1000';
  
  backToTop.addEventListener('mouseenter', function() {
    this.style.backgroundColor = '#3a7bc8';
    this.style.transform = 'translateY(-3px)';
  });
  
  backToTop.addEventListener('mouseleave', function() {
    this.style.backgroundColor = '#4a90e2';
    this.style.transform = 'translateY(0)';
  });
  
  backToTop.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
  
  document.body.appendChild(backToTop);
  
  // 显示/隐藏返回顶部按钮
  window.addEventListener('scroll', function() {
    if (window.pageYOffset > 300) {
      backToTop.style.display = 'flex';
    } else {
      backToTop.style.display = 'none';
    }
  });
});