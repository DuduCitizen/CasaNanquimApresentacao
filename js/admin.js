// =====================================================
// API URL — detecta IP automaticamente
// =====================================================
var host = window.location.hostname;
var API_URL = (host === '' || host === 'localhost' || host === '127.0.0.1')
    ? 'http://localhost:8888/CasaNanquim/api'
    : 'http://' + host + ':8888/CasaNanquim/api';

// =====================================================
// UTILITÁRIOS
// =====================================================
var avisoTimer = null;
function mostrarAviso(msg, tipo) {
    var div = document.getElementById('aviso');
    div.className = 'aviso ' + (tipo === 'ok' ? 'aviso-ok' : 'aviso-erro');
    div.textContent = msg;
    div.style.display = 'block';
    clearTimeout(avisoTimer);
    avisoTimer = setTimeout(function() { div.style.display = 'none'; }, 4000);
}

function badge(status) {
    var map = { PENDENTE:'badge-pendente', CONFIRMADO:'badge-confirmado', CANCELADO:'badge-cancelado', CONCLUIDO:'badge-concluido' };
    return '<span class="badge ' + (map[status] || 'badge-pendente') + '">' + (status || 'PENDENTE') + '</span>';
}

function apiFetch(url, opts) {
    return fetch(url, opts)
        .then(function(r) {
            var ct = r.headers.get('content-type') || '';
            if (!ct.includes('application/json')) {
                return r.text().then(function(txt) {
                    throw new Error('Servidor retornou HTML (status ' + r.status + '). Verifique se o Tomcat está rodando e o WAR implantado.');
                });
            }
            return r.json();
        });
}

// =====================================================
// LOGIN
// =====================================================
function verificarLogin() {
    if (localStorage.getItem('adminLogado') !== 'true') window.location.href = 'login-admin.html';
}
function logout() { localStorage.removeItem('adminLogado'); window.location.href = 'login-admin.html'; }

// =====================================================
// NAVEGAÇÃO
// =====================================================
var secoes = ['dashboard', 'tatuadores', 'solicitacoes', 'configuracoes'];
function showSection(s) {
    secoes.forEach(function(n) {
        document.getElementById('sec-' + n).style.display = n === s ? 'block' : 'none';
        var nav = document.getElementById('nav-' + n);
        if (nav) nav.className = n === s ? 'active' : '';
    });
    if (s === 'dashboard')     carregarDashboard();
    if (s === 'tatuadores')    carregarTatuadores();
    if (s === 'solicitacoes')  carregarSolicitacoes();
    if (s === 'configuracoes') { carregarConfiguracoes(); carregarPrecos(); }
}

// =====================================================
// DASHBOARD
// =====================================================
function carregarDashboard() {
    Promise.all([
        apiFetch(API_URL + '/admin/tatuadores'),
        apiFetch(API_URL + '/admin/solicitacoes')
    ])
    .then(function(res) {
        var tats = res[0], sols = res[1];
        var pendentes   = sols.filter(function(s){ return s.status === 'PENDENTE'; }).length;
        var faturamento = sols.reduce(function(a, s){ return a + (s.valor || 0); }, 0);
        document.getElementById('statsGrid').innerHTML =
            card_stat(tats.length, 'Tatuadores') +
            card_stat(sols.length, 'Solicitações') +
            card_stat(pendentes, 'Pendentes') +
            card_stat('R$ ' + faturamento.toFixed(2), 'Faturamento Total');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}
function card_stat(n, label) {
    return '<div class="stat-card"><div class="stat-number">' + n + '</div><div class="stat-label">' + label + '</div></div>';
}

// =====================================================
// TATUADORES
// =====================================================
function carregarTatuadores() {
    apiFetch(API_URL + '/admin/tatuadores')
    .then(function(lista) {
        var tb = document.getElementById('tbTatuadores');
        if (!lista.length) {
            tb.innerHTML = '<tr><td colspan="9" style="text-align:center;color:var(--ink-light);padding:32px;">Nenhum tatuador cadastrado.</td></tr>';
            return;
        }
        tb.innerHTML = lista.map(function(t) {
            return '<tr>' +
                '<td>' + t.id + '</td>' +
                '<td>' + (t.nome || '—') + '</td>' +
                '<td>' + (t.email || '—') + '</td>' +
                '<td>' + (t.telefone || '—') + '</td>' +
                '<td>' + (t.instagram || '—') + '</td>' +
                '<td>' + (t.especialidade || '—') + '</td>' +
                '<td>' + (t.contadorSolicitacoes || 0) + '</td>' +
                '<td>' + (t.dataCadastro || '—') + '</td>' +
                '<td>' + (t.ativo ? '✅ Ativo' : '❌ Inativo') + '</td>' +
            '</tr>';
        }).join('');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

// =====================================================
// SOLICITAÇÕES
// =====================================================
var _sols = [];

function carregarSolicitacoes() {
    apiFetch(API_URL + '/admin/solicitacoes')
    .then(function(lista) {
        _sols = lista;
        var tb = document.getElementById('tbSolicitacoes');
        if (!lista.length) {
            tb.innerHTML = '<tr><td colspan="8" style="text-align:center;color:var(--ink-light);padding:32px;">Nenhuma solicitação.</td></tr>';
            return;
        }
        tb.innerHTML = lista.map(function(s) {
            return '<tr>' +
                '<td>' + s.id + '</td>' +
                '<td>' + (s.tatuadorNome || '—') + '</td>' +
                '<td>' + (s.dataSolicitacao || '—') + '</td>' +
                '<td>' + (s.horarioInicio || '—') + ' – ' + (s.horarioFim || '—') + '</td>' +
                '<td>' + (s.periodoEscolhido || '—') + '</td>' +
                '<td>R$ ' + (s.valor || 0).toFixed(2) + '</td>' +
                '<td>' + badge(s.status) + '</td>' +
                '<td style="white-space:nowrap;">' +
                    '<button class="btn btn-analisar" style="margin-right:6px;" onclick="abrirModal(' + s.id + ')"><i class="fas fa-search"></i> Detalhes</button>' +
                    '<button class="btn btn-danger" onclick="deletarDireto(' + s.id + ')"><i class="fas fa-trash"></i> Excluir</button>' +
                '</td>' +
            '</tr>';
        }).join('');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

function deletarDireto(id) {
    if (!confirm('Excluir esta solicitação permanentemente?')) return;
    apiFetch(API_URL + '/admin/solicitacao/' + id, { method: 'DELETE' })
    .then(function(r) {
        if (r.success) { mostrarAviso('Solicitação excluída!', 'ok'); carregarSolicitacoes(); carregarDashboard(); }
        else mostrarAviso('Erro ao excluir: ' + (r.error || ''), 'erro');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

// =====================================================
// MODAL DE DETALHES
// =====================================================
var _idModal = null;

function abrirModal(id) {
    var s = _sols.find(function(x){ return x.id === id; });
    if (!s) return;
    _idModal = id;

    document.getElementById('det-id').textContent     = '#' + s.id;
    document.getElementById('det-nome').textContent   = s.tatuadorNome || '—';
    document.getElementById('det-criado').textContent = s.criadoEm || '—';
    document.getElementById('det-data').textContent   = s.dataSolicitacao || '—';
    document.getElementById('det-inicio').textContent = s.horarioInicio || '—';
    document.getElementById('det-fim').textContent    = s.horarioFim || '—';
    document.getElementById('det-periodo').textContent= s.periodoEscolhido || '—';
    document.getElementById('det-valor').textContent  = 'R$ ' + (s.valor || 0).toFixed(2);
    document.getElementById('det-badge').innerHTML    = badge(s.status);
    document.getElementById('det-obs').textContent    = s.observacao || 'Nenhuma observação informada.';
    document.getElementById('det-select').value       = s.status || 'PENDENTE';

    document.getElementById('modalDet').classList.add('ativo');
    document.body.style.overflow = 'hidden';
}

function fecharModal() {
    document.getElementById('modalDet').classList.remove('ativo');
    document.body.style.overflow = '';
    _idModal = null;
}

document.getElementById('modalDet').addEventListener('click', function(e) {
    if (e.target === this) fecharModal();
});

function salvarStatusModal() {
    if (!_idModal) return;
    var status = document.getElementById('det-select').value;
    apiFetch(API_URL + '/admin/solicitacao/status/' + _idModal, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: status })
    })
    .then(function(r) {
        if (r.success) {
            mostrarAviso('Status atualizado para ' + status + '!', 'ok');
            var s = _sols.find(function(x){ return x.id === _idModal; });
            if (s) s.status = status;
            document.getElementById('det-badge').innerHTML = badge(status);
            carregarSolicitacoes();
            carregarDashboard();
        } else {
            mostrarAviso('Erro ao atualizar status.', 'erro');
        }
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

function excluirDoModal() {
    if (!_idModal) return;
    if (!confirm('Excluir esta solicitação permanentemente?')) return;
    apiFetch(API_URL + '/admin/solicitacao/' + _idModal, { method: 'DELETE' })
    .then(function(r) {
        if (r.success) {
            mostrarAviso('Solicitação excluída!', 'ok');
            fecharModal();
            carregarSolicitacoes();
            carregarDashboard();
        } else {
            mostrarAviso('Erro ao excluir: ' + (r.error || ''), 'erro');
        }
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

// =====================================================
// CONFIGURAÇÕES
// =====================================================
function carregarConfiguracoes() {
    apiFetch(API_URL + '/configuracoes')
    .then(function(config) {
        var h = config.horarios || [];
        document.getElementById('listaHorarios').innerHTML = h.length
            ? h.map(function(v) { return tag_config(v, 'removerHorario'); }).join('')
            : '<p style="color:var(--ink-light);font-size:.8rem;">Nenhum horário cadastrado.</p>';

        var d = config.diasFechados || [];
        document.getElementById('listaDias').innerHTML = d.length
            ? d.map(function(v) { return tag_config(v, 'removerDia'); }).join('')
            : '<p style="color:var(--ink-light);font-size:.8rem;">Nenhum dia fechado.</p>';
    })
    .catch(function(e) {
        document.getElementById('listaHorarios').innerHTML =
            '<p style="color:#c05050;font-size:.8rem;">Erro ao carregar configurações. Verifique o servidor.</p>';
    });
}

function tag_config(val, fn) {
    return '<span class="config-tag">' + val +
        ' <button onclick="' + fn + '(\'' + val + '\')" title="Remover">×</button></span>';
}

function adicionarHorario() {
    var novo = prompt('Digite o horário (ex: 09:00):');
    if (!novo) return;
    novo = novo.trim();
    if (!/^([01][0-9]|2[0-3]):[0-5][0-9]$/.test(novo)) {
        alert('Formato inválido! Use HH:MM (ex: 09:00)');
        return;
    }
    apiFetch(API_URL + '/configuracoes/horario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: novo })
    })
    .then(function(r) {
        if (r.success) { mostrarAviso('Horário ' + novo + ' adicionado!', 'ok'); carregarConfiguracoes(); }
        else mostrarAviso('Erro ao adicionar: ' + (r.error || ''), 'erro');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

function removerHorario(h) {
    if (!confirm('Remover horário ' + h + '?')) return;
    apiFetch(API_URL + '/configuracoes/horario?valor=' + encodeURIComponent(h), { method: 'DELETE' })
    .then(function(r) {
        if (r.success) { mostrarAviso('Horário removido!', 'ok'); carregarConfiguracoes(); }
        else mostrarAviso('Erro ao remover.', 'erro');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

function adicionarDiaFechado() {
    var novo = prompt('Dia fechado (ex: domingo, 2025-12-25):');
    if (!novo) return;
    apiFetch(API_URL + '/configuracoes/dia-fechado', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ valor: novo.trim().toLowerCase() })
    })
    .then(function(r) {
        if (r.success) { mostrarAviso('Dia fechado adicionado!', 'ok'); carregarConfiguracoes(); }
        else mostrarAviso('Erro: ' + (r.error || ''), 'erro');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

function removerDia(d) {
    if (!confirm('Remover "' + d + '"?')) return;
    apiFetch(API_URL + '/configuracoes/dia-fechado?valor=' + encodeURIComponent(d), { method: 'DELETE' })
    .then(function(r) {
        if (r.success) { mostrarAviso('Dia removido!', 'ok'); carregarConfiguracoes(); }
        else mostrarAviso('Erro ao remover.', 'erro');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

// =====================================================
// PREÇOS
// =====================================================
function carregarPrecos() {
    apiFetch(API_URL + '/precos-espaco')
    .then(function(lista) {
        document.getElementById('listaPrecos').innerHTML = lista.map(function(p) {
            return '<div class="preco-edit">' +
                '<strong>' + (p.descricao || p.periodo) + '</strong>' +
                '<input type="number" id="preco_' + p.id + '" value="' + p.valor + '" step="5" min="0">' +
                '<button class="btn btn-salvar" onclick="salvarPreco(' + p.id + ')"><i class="fas fa-save"></i> Salvar</button>' +
            '</div>';
        }).join('');
    })
    .catch(function(e) {
        document.getElementById('listaPrecos').innerHTML =
            '<p style="color:#c05050;font-size:.8rem;">Erro ao carregar preços.</p>';
    });
}

function salvarPreco(id) {
    var input = document.getElementById('preco_' + id);
    var valor = parseFloat(input.value);
    if (isNaN(valor) || valor < 0) { alert('Valor inválido.'); return; }
    apiFetch(API_URL + '/admin/preco-espaco', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: id, valor: valor })
    })
    .then(function(r) {
        if (r.success) mostrarAviso('Preço atualizado!', 'ok');
        else mostrarAviso('Erro ao salvar preço.', 'erro');
    })
    .catch(function(e) { mostrarAviso(e.message, 'erro'); });
}

// =====================================================
// INICIALIZAR
// =====================================================
verificarLogin();
carregarDashboard();

setInterval(function() {
    if (document.getElementById('sec-dashboard').style.display    !== 'none') carregarDashboard();
    if (document.getElementById('sec-solicitacoes').style.display !== 'none') carregarSolicitacoes();
}, 30000);