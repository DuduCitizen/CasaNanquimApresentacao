// JS original — 100% preservado
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const usuario = document.getElementById('usuario').value.trim();
    const senha = document.getElementById('senha').value;
    const errorDiv = document.getElementById('errorMessage');
    errorDiv.style.display = 'none';

    if (usuario === 'admin' && senha === 'admin') {
        localStorage.setItem('adminLogado', 'true');
        window.location.href = 'admin.html';
    } else {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ Usuário ou senha inválidos!';
    }
});