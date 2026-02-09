/**
 * 用户端 H5 公共脚本
 * 登录态检查、路由跳转等
 */
(function() {
  'use strict';

  function isLoggedIn() {
    return !!sessionStorage.getItem('user_logged_in');
  }

  function redirectToLogin() {
    if (!isLoggedIn() && !window.location.pathname.includes('login.html')) {
      var base = window.location.pathname.replace(/\/[^/]+$/, '/');
      window.location.href = base + 'login.html';
    }
  }

  // 门户页由 portal.html 内联脚本自行检查
  // 此文件可用于后续扩展公共逻辑
})();
