var host = window.location.hostname;
var API_URL = (host === '' || host === 'localhost' || host === '127.0.0.1')
    ? 'http://localhost:8888/CasaNanquim/api'
    : 'http://' + host + ':8888/CasaNanquim/api';

// ===== LOGIN =====
function verificarLogin() {
    var id   = localStorage.getItem('tatuadorId');
    var nome = localStorage.getItem('tatuadorNome');
    if (!id) { window.location.href = 'login-tatuador.html'; return false; }
    document.getElementById('userName').textContent = nome || 'Tatuador';
    return true;
}

// ===== MODAIS =====
function abrirModal(id)  { document.getElementById(id).classList.add('ativo'); }
function fecharModal(id) { document.getElementById(id).classList.remove('ativo'); }
document.querySelectorAll('.modal-overlay').forEach(function(el) {
    el.addEventListener('click', function(e) { if (e.target === el) fecharModal(el.id); });
});

// Abre pop-up de sucesso se veio da página de reserva
(function() {
    var p = new URLSearchParams(window.location.search);
    if (p.get('reserva') === 'sucesso') {
        abrirModal('modalSucesso');
        history.replaceState({}, '', window.location.pathname);
    }
})();

// ===== CARREGAR SOLICITAÇÕES =====
function carregarSolicitacoes() {
    fetch(API_URL + '/tatuador/solicitacoes', { credentials: 'include' })
    .then(function(r) {
        if (r.status === 401 || r.status === 403) {
            localStorage.removeItem('tatuadorId');
            localStorage.removeItem('tatuadorNome');
            window.location.href = 'login-tatuador.html';
            return null;
        }
        return r.json();
    })
    .then(function(lista) {
        if (!lista) return;
        renderSolicitacoes(lista);
        renderStats(lista);
    })
    .catch(function(err) {
        var av = document.getElementById('avisoErro');
        av.style.display = 'block';
        av.textContent = 'Erro ao carregar. Verifique se o Tomcat está rodando.';
        document.getElementById('solicitacoesBody').innerHTML =
            '<tr class="row-empty"><td colspan="9">Falha ao conectar com o servidor.</td></tr>';
        console.error(err);
    });
}

function diffHorasAteData(dataStr) {
    if (!dataStr) return -1;
    var p = dataStr.split('-');
    var dataReserva = new Date(p[0], p[1]-1, p[2]);
    dataReserva.setHours(0,0,0,0);
    var hoje = new Date(); hoje.setHours(0,0,0,0);
    return (dataReserva - hoje) / (1000 * 60 * 60);
}

function renderSolicitacoes(lista) {
    var tbody = document.getElementById('solicitacoesBody');
    if (!lista || lista.length === 0) {
        tbody.innerHTML = '<tr class="row-empty"><td colspan="9">Nenhuma solicitação encontrada. Clique em "+ Nova Reserva"!</td></tr>';
        return;
    }
    var badgeMap = {
        PENDENTE:   'badge-pendente',
        CONFIRMADO: 'badge-confirmado',
        CANCELADO:  'badge-cancelado',
        CONCLUIDO:  'badge-concluido'
    };

    tbody.innerHTML = lista.map(function(s) {
        var badgeClass = badgeMap[s.status] || 'badge-pendente';
        var horas      = diffHorasAteData(s.dataSolicitacao);
        var ativa      = s.status !== 'CANCELADO' && s.status !== 'CONCLUIDO';
        var dentro48   = horas < 48;

        var btnAlterar  = '';
        var btnCancelar = '';

        if (ativa) {
            if (!dentro48) {
                btnAlterar = '<button class="btn-acao btn-alterar" onclick="abrirModalAlterar(' + s.id + ',\'' + s.dataSolicitacao + '\',\'' + s.horarioInicio + '\',\'' + s.periodoEscolhido + '\')">' +
                    '<i class="fas fa-calendar-alt"></i> Alterar data</button>';
            } else {
                btnAlterar = '<button class="btn-acao btn-alterar" disabled title="Alteração deve ser feita com 48h de antecedência">' +
                    '<i class="fas fa-calendar-alt"></i> Alterar data</button>';
            }
            if (!dentro48) {
                btnCancelar = '<button class="btn-acao btn-cancelar-res" onclick="confirmarCancelamento(' + s.id + ')">' +
                    '<i class="fas fa-times"></i> Cancelar</button>';
            } else {
                btnCancelar = '<button class="btn-acao btn-cancelar-res" disabled title="Cancelamento deve ser feito com 48h de antecedência">' +
                    '<i class="fas fa-times"></i> Cancelar</button>';
            }
        }

        var acoes = (btnAlterar || btnCancelar)
            ? ('<div style="display:flex;gap:6px;flex-wrap:wrap;">' + btnAlterar + btnCancelar + '</div>')
            : '<span style="color:#555;font-size:12px;">—</span>';

        return '<tr>' +
            '<td style="color:#888;">' + s.id + '</td>' +
            '<td>' + (s.dataSolicitacao || '-') + '</td>' +
            '<td>' + (s.horarioInicio  || '-') + '</td>' +
            '<td>' + (s.horarioFim     || '-') + '</td>' +
            '<td>' + (s.periodoEscolhido || '-') + '</td>' +
            '<td>R$ ' + (s.valor || 0).toFixed(2) + '</td>' +
            '<td><span class="badge ' + badgeClass + '">' + (s.status || 'PENDENTE') + '</span></td>' +
            '<td style="color:#888;font-size:0.82rem;">' + (s.observacao ? s.observacao.substring(0,28) + '...' : '-') + '</td>' +
            '<td>' + acoes + '</td>' +
        '</tr>';
    }).join('');
}

function renderStats(lista) {
    document.getElementById('totalSolicitacoes').textContent    = lista.length;
    document.getElementById('solicitacoesPendentes').textContent = lista.filter(function(s){ return s.status === 'PENDENTE'; }).length;
    document.getElementById('solicitacoesAprovadas').textContent = lista.filter(function(s){ return s.status === 'CONFIRMADO' || s.status === 'CONCLUIDO'; }).length;
}

// ===== CANCELAR =====
var idParaCancelar = null;
function confirmarCancelamento(id) { idParaCancelar = id; abrirModal('modalCancelar'); }
document.getElementById('btnConfirmarCancelamento').addEventListener('click', function() {
    if (!idParaCancelar) return;
    var btn = this; btn.disabled = true; btn.textContent = 'Cancelando...';
    fetch(API_URL + '/tatuador/cancelar/' + idParaCancelar, {
        method: 'PUT', headers: {'Content-Type':'application/json'},
        credentials: 'include', body: JSON.stringify({status:'CANCELADO'})
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
        fecharModal('modalCancelar');
        if (res.success) carregarSolicitacoes();
        else alert('Erro ao cancelar: ' + (res.error || 'tente novamente.'));
    })
    .catch(function(){ fecharModal('modalCancelar'); alert('Erro ao conectar com o servidor.'); })
    .finally(function(){ btn.disabled = false; btn.textContent = 'Confirmar cancelamento'; idParaCancelar = null; });
});

// ===== ALTERAR DATA =====
var reservaParaAlterar = null;

function abrirModalAlterar(id, dataAtual, horarioAtual, periodo) {
    reservaParaAlterar = { id: id, periodo: periodo };
    var amanha = new Date(); amanha.setDate(amanha.getDate() + 1);
    var minData = amanha.getFullYear() + '-' +
        String(amanha.getMonth()+1).padStart(2,'0') + '-' +
        String(amanha.getDate()).padStart(2,'0');
    var novaDataInput = document.getElementById('novaData');
    novaDataInput.min   = minData;
    novaDataInput.value = '';
    document.getElementById('novoHorario').innerHTML = '<option value="">Selecione uma data primeiro</option>';
    document.getElementById('novoHorarioFim').value  = '';
    document.getElementById('infoNovoFim').textContent = '';
    abrirModal('modalAlterar');
}

document.getElementById('novaData').addEventListener('change', function() {
    var data = this.value;
    if (!data) return;
    fetch(API_URL + '/horarios-disponiveis-espaco?data=' + data)
    .then(function(r){ return r.json(); })
    .then(function(ocupados){
        var todos  = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
        var livres = todos.filter(function(h){ return !ocupados.includes(h); });
        var sel    = document.getElementById('novoHorario');
        if (livres.length > 0) {
            sel.innerHTML = '<option value="">Selecione...</option>' +
                livres.map(function(h){ return '<option value="'+h+'">'+h+'</option>'; }).join('');
        } else {
            sel.innerHTML = '<option value="">Sem horários disponíveis nesta data</option>';
        }
        document.getElementById('novoHorarioFim').value = '';
        document.getElementById('infoNovoFim').textContent = '';
    })
    .catch(function(e){ console.error(e); });
});

document.getElementById('novoHorario').addEventListener('change', function() {
    var inicio = this.value;
    if (!inicio || !reservaParaAlterar) return;
    var duracao = 0;
    if (reservaParaAlterar.periodo === '2_HORAS')      duracao = 2;
    else if (reservaParaAlterar.periodo === 'MEIO_PERIODO') duracao = 4;
    else if (reservaParaAlterar.periodo === 'DIA_INTEIRO')  duracao = 8;
    if (!duracao) return;
    var h = parseInt(inicio.split(':')[0]);
    var m = inicio.split(':')[1];
    var fimH = h + duracao;
    if (fimH > 20) {
        alert('Este horário ultrapassa o limite de funcionamento (20:00). Escolha outro.');
        this.value = '';
        document.getElementById('novoHorarioFim').value = '';
        return;
    }
    var fim = String(fimH).padStart(2,'0') + ':' + m;
    document.getElementById('novoHorarioFim').value = fim;
    document.getElementById('infoNovoFim').textContent = 'Calculado automaticamente (+' + duracao + 'h)';
});

document.getElementById('btnConfirmarAlteracao').addEventListener('click', function() {
    var novaData   = document.getElementById('novaData').value;
    var novoInicio = document.getElementById('novoHorario').value;
    var novoFim    = document.getElementById('novoHorarioFim').value;
    if (!novaData || !novoInicio || !novoFim) {
        alert('Selecione a nova data e o horário de início.');
        return;
    }
    var btn = this; btn.disabled = true; btn.textContent = 'Salvando...';
    fetch(API_URL + '/tatuador/alterar-data/' + reservaParaAlterar.id, {
        method: 'PUT',
        headers: {'Content-Type':'application/json'},
        credentials: 'include',
        body: JSON.stringify({ dataSolicitacao: novaData, horarioInicio: novoInicio, horarioFim: novoFim })
    })
    .then(function(r){ return r.json(); })
    .then(function(res){
        fecharModal('modalAlterar');
        if (res.success) carregarSolicitacoes();
        else alert('Erro ao alterar: ' + (res.error || 'tente novamente.'));
    })
    .catch(function(){ fecharModal('modalAlterar'); alert('Erro ao conectar com o servidor.'); })
    .finally(function(){ btn.disabled = false; btn.textContent = 'Confirmar alteração'; reservaParaAlterar = null; });
});

// ===== LOGOUT =====
function logout() {
    fetch(API_URL + '/logout', { method: 'POST', credentials: 'include' }).catch(function(){});
    localStorage.removeItem('tatuadorId');
    localStorage.removeItem('tatuadorNome');
    window.location.href = 'index.html';
}

if (verificarLogin()) carregarSolicitacoes();