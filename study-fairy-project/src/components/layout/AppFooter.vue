<template>
  <footer class="app-footer">
    <div class="footer-content">
      <p>&copy; 2026 Study Fairy. All rights reserved.</p>
      <div class="links">
        <a href="#">이용약관</a>
        <a href="#">개인정보처리방침</a>
        <a href="#">고객센터</a>
      </div>
    </div>
  </footer>
</template>

<style scoped>
.app-footer {
  padding: 2rem;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 0.875rem;
  border-top: 1px solid #e2e8f0;
}

.footer-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.links {
  display: flex;
  gap: 1.5rem;
}

.links a {
  color: #475569;
  text-decoration: none;
  transition: color 0.2s;
}

.links a:hover {
  color: #0f172a;
  text-decoration: underline;
}
</style>
