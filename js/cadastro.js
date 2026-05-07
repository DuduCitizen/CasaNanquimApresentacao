// JS original — 100% preservado (incluindo correções)
var host = window.location.hostname;
var API_URL = (host === "" || host === "localhost" || host === "127.0.0.1")
    ? "http://localhost:8888/CasaNanquim/api"
    : "http://" + host + ":8888/CasaNanquim/api";

document.getElementById('cadastroForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const nome             = document.getElementById('nome').value.trim();
    const email            = document.getElementById('email').value.trim();
    const telefone         = document.getElementById('telefone').value.trim();
    const senha            = document.getElementById('senha').value;
    const confirmarSenha   = document.getElementById('confirmarSenha').value;
    const instagram        = document.getElementById('instagram').value.trim();
    const especialidade    = document.getElementById('especialidade').value.trim();

    const errorDiv         = document.getElementById('errorMessage');
    const successDiv       = document.getElementById('successMessage');
    const btnCadastrar     = document.getElementById('btnCadastrar');

    errorDiv.style.display   = 'none';
    successDiv.style.display = 'none';

    if (senha !== confirmarSenha) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ As senhas não coincidem!';
        return;
    }

    if (senha.length < 6) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ A senha deve ter pelo menos 6 caracteres!';
        return;
    }

    btnCadastrar.disabled = true;
    btnCadastrar.innerHTML = '<i class="fas fa-circle-notch fa-spin" style="font-size:.7rem;margin-right:7px;"></i> Cadastrando...';

    try {
        const response = await fetch(`${API_URL}/cadastrar`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nome, email, senha, telefone, instagram, especialidade })
        });

        const result = await response.json();

        if (result.success) {
            successDiv.style.display = 'block';
            successDiv.textContent = '✅ Cadastro realizado com sucesso! Redirecionando para o login...';
            setTimeout(() => {
                window.location.href = 'login-tatuador.html';
            }, 2000);
        } else {
            errorDiv.style.display = 'block';
            errorDiv.textContent = '❌ ' + (result.error || 'Erro ao cadastrar. Tente novamente!');
        }
    } catch (error) {
        errorDiv.style.display = 'block';
        errorDiv.textContent = '❌ Erro ao conectar com o servidor. Verifique se o Tomcat está rodando.';
        console.error('Erro:', error);
    } finally {
        btnCadastrar.disabled = false;
        btnCadastrar.innerHTML = '<i class="fas fa-user-plus" style="font-size:.7rem;margin-right:7px;"></i> Cadastrar';
    }
});