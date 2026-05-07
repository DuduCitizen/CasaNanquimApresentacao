// JS original — 100% preservado
var host = window.location.hostname;
var API_URL;
if (host === '' || host === 'localhost' || host === '127.0.0.1') {
    API_URL = 'http://localhost:8888/CasaNanquim/api';
} else {
    API_URL = 'http://' + host + ':8888/CasaNanquim/api';
}

document.getElementById('loginForm').addEventListener('submit', function(e) {
    e.preventDefault();

    var email    = document.getElementById('email').value.trim();
    var senha    = document.getElementById('senha').value;
    var errorDiv = document.getElementById('errorMessage');
    var btnLogin = document.getElementById('btnLogin');

    errorDiv.style.display = 'none';
    btnLogin.disabled = true;
    btnLogin.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size:.7rem;margin-right:6px;"></i> Entrando...';

    fetch(API_URL + '/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email, senha: senha })
    })
    .then(function(response) { return response.json(); })
    .then(function(result) {
        if (result.success) {
            localStorage.setItem('tatuadorId',   result.tatuadorId);
            localStorage.setItem('tatuadorNome', result.tatuadorNome);
            window.location.href = 'dashboard-tatuador.html';
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = 'Email ou senha inválidos!';
        }
    })
    .catch(function(error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = 'Erro de conexão. Abra via: http://' + (host || 'IP-DO-SERVIDOR') + ':8888/CasaNanquim/login-tatuador.html';
        console.error('API_URL:', API_URL, 'Erro:', error);
    })
    .finally(function() {
        btnLogin.disabled = false;
        btnLogin.innerHTML = '<i class="fas fa-arrow-right" style="font-size:.7rem;margin-right:6px;"></i> Entrar';
    });
});