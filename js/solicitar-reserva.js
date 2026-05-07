// ========== URL DINÂMICA - FUNCIONA EM QUALQUER MÁQUINA ==========
var host = window.location.hostname;
var porta = window.location.port;
var API_URL = 'http://' + host + ':' + porta + '/CasaNanquim/api';

var precos = [];
var selectedPreco = null;
var horariosConfigurados = [];
var horariosOcupados = [];

function verificarLogin() {
    var tatuadorId   = localStorage.getItem('tatuadorId');
    var tatuadorNome = localStorage.getItem('tatuadorNome');
    if (!tatuadorId) { window.location.href = 'login-tatuador.html'; return false; }
    document.getElementById('userName').textContent = tatuadorNome || 'Tatuador';
    return true;
}

function configurarDataMinima() {
    var hoje = new Date();
    var ano  = hoje.getFullYear();
    var mes  = String(hoje.getMonth() + 1).padStart(2, '0');
    var dia  = String(hoje.getDate()).padStart(2, '0');
    document.getElementById('dataReserva').min = ano + '-' + mes + '-' + dia;
}

function carregarPrecos() {
    fetch(API_URL + '/precos-espaco')
    .then(function(r) { return r.json(); })
    .then(function(data) {
        precos = data;
        var html = precos.map(function(p) {
            var periodoLabel = p.periodo === '2_HORAS' ? '2 horas' :
                               p.periodo === 'MEIO_PERIODO' ? 'Meio período' :
                               p.periodo === 'DIA_INTEIRO' ? 'Dia inteiro' : p.periodo;
            return '<div class="preco-card" data-id="' + p.id + '" data-valor="' + p.valor + '" data-periodo="' + p.periodo + '">' +
                '<span class="pc-check"><i class="fas fa-check"></i></span>' +
                '<span class="pc-periodo">' + periodoLabel + '</span>' +
                '<span class="pc-nome">' + (p.descricao || p.periodo) + '</span>' +
                '<span class="pc-valor">R$ ' + p.valor.toFixed(2) + '</span>' +
                '<span class="pc-valor-label">por reserva</span>' +
            '</div>';
        }).join('');
        document.getElementById('precosContainer').innerHTML = html;

        document.querySelectorAll('.preco-card').forEach(function(card) {
            card.addEventListener('click', function() {
                document.querySelectorAll('.preco-card').forEach(function(c) { c.classList.remove('selected'); });
                card.classList.add('selected');
                selectedPreco = {
                    id:      parseInt(card.dataset.id),
                    valor:   parseFloat(card.dataset.valor),
                    periodo: card.dataset.periodo
                };
                document.getElementById('valorTotal').value = 'R$ ' + selectedPreco.valor.toFixed(2);
                calcularHorarioFim();
            });
        });
    })
    .catch(function(e) { console.error('Erro ao carregar preços:', e); });
}

function carregarHorariosConfigurados() {
    return fetch(API_URL + '/configuracoes')
    .then(function(r) { return r.json(); })
    .then(function(config) {
        horariosConfigurados = config.horarios || [];
        if (horariosConfigurados.length === 0) {
            horariosConfigurados = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
        }
        return horariosConfigurados;
    })
    .catch(function(e) {
        console.error('Erro ao carregar horários configurados:', e);
        horariosConfigurados = ['09:00','10:00','11:00','12:00','13:00','14:00','15:00','16:00','17:00','18:00','19:00'];
        return horariosConfigurados;
    });
}

function carregarHorariosOcupados(data) {
    return fetch(API_URL + '/horarios-disponiveis-espaco?data=' + data)
    .then(function(r) { return r.json(); })
    .then(function(ocupados) {
        horariosOcupados = ocupados;
        return horariosOcupados;
    })
    .catch(function(e) {
        console.error('Erro ao carregar horários ocupados:', e);
        horariosOcupados = [];
        return horariosOcupados;
    });
}

function atualizarSelectHorarios() {
    var data = document.getElementById('dataReserva').value;
    var horariosDisponiveis = horariosConfigurados.filter(function(h) {
        return !horariosOcupados.includes(h);
    });

    var hoje    = new Date().toISOString().split('T')[0];
    var isHoje  = (data === hoje);
    if (isHoje) {
        var horaAtual   = new Date().getHours();
        var minutoAtual = new Date().getMinutes();
        horariosDisponiveis = horariosDisponiveis.filter(function(horario) {
            var partes = horario.split(':');
            var hora   = parseInt(partes[0]);
            var minuto = parseInt(partes[1]);
            if (hora > horaAtual) return true;
            if (hora === horaAtual && minuto > minutoAtual) return true;
            return false;
        });
    }

    var sel = document.getElementById('horarioInicio');
    if (horariosDisponiveis.length > 0) {
        sel.innerHTML = '<option value="">Selecione...</option>' +
            horariosDisponiveis.map(function(h) {
                return '<option value="' + h + '">' + h + '</option>';
            }).join('');
    } else {
        sel.innerHTML = '<option value="">Sem horários disponíveis nesta data</option>';
    }
    document.getElementById('horarioFim').innerHTML = '<option value="">Automático</option>';
    document.getElementById('horarioFim').disabled  = true;
    document.getElementById('infoHorarioFim').textContent = '';
}

function carregarHorarios() {
    var data = document.getElementById('dataReserva').value;
    if (!data) return;
    carregarHorariosConfigurados()
    .then(function() { return carregarHorariosOcupados(data); })
    .then(function() { atualizarSelectHorarios(); });
}

function calcularHorarioFim() {
    var inicio = document.getElementById('horarioInicio').value;
    if (!inicio || !selectedPreco) return;

    var duracao = 0;
    if      (selectedPreco.periodo === '2_HORAS')      duracao = 2;
    else if (selectedPreco.periodo === 'MEIO_PERIODO')  duracao = 4;
    else if (selectedPreco.periodo === 'DIA_INTEIRO')   duracao = 8;
    else return;

    var partes  = inicio.split(':');
    var horaFim = parseInt(partes[0]) + duracao;

    if (horaFim > 20) {
        alert('Este horário ultrapassa o limite de funcionamento (20:00). Escolha um horário mais cedo.');
        document.getElementById('horarioInicio').value = '';
        return;
    }

    var fimStr = String(horaFim).padStart(2, '0') + ':' + partes[1];

    var horariosDisponiveis = horariosConfigurados.filter(function(h) {
        return !horariosOcupados.includes(h);
    });
    if (!horariosDisponiveis.includes(fimStr)) {
        alert('O horário de fim (' + fimStr + ') não está disponível. Escolha outro horário de início.');
        document.getElementById('horarioInicio').value = '';
        return;
    }

    var sel = document.getElementById('horarioFim');
    sel.innerHTML = '<option value="' + fimStr + '">' + fimStr + '</option>';
    sel.disabled  = false;
    sel.value     = fimStr;
    document.getElementById('infoHorarioFim').innerHTML =
        '<i class="fas fa-magic"></i> Calculado automaticamente (+' + duracao + 'h)';
}

function showAlertError(msg) {
    document.getElementById('alertMessage').innerHTML =
        '<div class="alert-error">' + msg + '</div>';
    setTimeout(function() {
        document.getElementById('alertMessage').innerHTML = '';
    }, 5000);
}

document.getElementById('dataReserva').addEventListener('change', carregarHorarios);
document.getElementById('horarioInicio').addEventListener('change', calcularHorarioFim);

document.getElementById('btnReservar').addEventListener('click', function() {
    var data      = document.getElementById('dataReserva').value;
    var inicio    = document.getElementById('horarioInicio').value;
    var fim       = document.getElementById('horarioFim').value;
    var observ    = document.getElementById('observacao').value;
    var btn       = document.getElementById('btnReservar');

    if (!data || !inicio || !fim || !selectedPreco) {
        showAlertError('❌ Preencha todos os campos obrigatórios!');
        return;
    }

    btn.disabled     = true;
    btn.innerHTML    = '<i class="fas fa-spinner fa-spin"></i> Enviando...';

    fetch(API_URL + '/solicitar-reserva', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
            dataSolicitacao:  data,
            horarioInicio:    inicio,
            horarioFim:       fim,
            periodoEscolhido: selectedPreco.periodo,
            valor:            selectedPreco.valor,
            observacao:       observ
        })
    })
    .then(function(r) { return r.json(); })
    .then(function(result) {
        if (result.success) {
            document.getElementById('modalSucesso').classList.add('ativo');
        } else {
            showAlertError('❌ ' + (result.error || 'Erro ao solicitar reserva'));
            btn.disabled  = false;
            btn.innerHTML = '<i class="fas fa-paper-plane"></i> Solicitar Reserva';
        }
    })
    .catch(function(error) {
        console.error('Erro:', error);
        showAlertError('❌ Erro ao conectar com o servidor. Verifique se o Tomcat está rodando.');
        btn.disabled  = false;
        btn.innerHTML = '<i class="fas fa-paper-plane"></i> Solicitar Reserva';
    });
});

function logout() {
    localStorage.removeItem('tatuadorId');
    localStorage.removeItem('tatuadorNome');
    window.location.href = 'index.html';
}

if (verificarLogin()) {
    configurarDataMinima();
    carregarPrecos();
}