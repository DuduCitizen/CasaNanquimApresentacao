<div align="center">

# 🖋️ Casa Nanquim

**Estúdio de Tatuagem Feminino — Vila Matilde, São Paulo**

[Ver site no ar](https://duducitizen.github.io/CasaNanquimApresentacao/)

</div>

---

## 📖 Sobre o projeto

Site institucional e sistema de reservas da **Casa Nanquim**, um estúdio de tatuagem voltado para tatuadoras, com espaço disponível para aluguel por hora/período.

O projeto une duas frentes em um só site:

- Uma **página de apresentação** do estúdio para o público (sobre, portfólio, planos de aluguel e localização).
- Um **sistema simples de reservas**, onde tatuadoras cadastradas podem solicitar, acompanhar, alterar e cancelar o uso do espaço.

## ✨ Funcionalidades

### Site público
- Apresentação do estúdio (história, missão, estatísticas)
- Galeria/portfólio de tatuagens com visualização ampliada
- Planos e preços de aluguel do espaço
- Mapa e informações de localização e funcionamento
- Link direto para o Instagram do estúdio

### Área da tatuadora
- Cadastro e login
- Solicitação de reserva com escolha de:
  - Data e horário
  - Período (2h, meio período ou dia inteiro)
- Painel com o histórico de solicitações (pendentes, aprovadas, etc.)
- Cancelamento e alteração de data de reservas já feitas
- Aviso de regras (ex: alterações/cancelamentos com 48h de antecedência)

### Área administrativa
- Login separado para a administração do estúdio
- Painel para gerenciar as solicitações de reserva

## 💰 Planos de aluguel

| Período | Duração | Valor |
|---|---|---|
| 2 Horas | 2h | R$ 80 |
| Meio Período | 4h | R$ 150 |
| Dia Inteiro | 8h | R$ 250 |

> Pagamento feito presencialmente, no dia da reserva (Pix, débito ou crédito).

## 🛠️ Tecnologias utilizadas

- **HTML5** — estrutura das páginas
- **CSS3** — estilo visual e responsividade
- **JavaScript** — interatividade, formulários e lógica das reservas
- **Font Awesome** — ícones
- **Google Fonts** (Cormorant Garamond, DM Sans) — tipografia

Projeto totalmente front-end (estático), sem necessidade de backend dedicado para rodar localmente.

## 📂 Estrutura do projeto

```
CasaNanquimApresentacao/
├── css/                      # Arquivos de estilo
├── js/                       # Scripts (lógica do site)
├── img/                      # Imagens e mídia
├── index.html                # Página inicial / institucional
├── login-tatuador.html       # Login da tatuadora
├── cadastro.html             # Cadastro de nova tatuadora
├── dashboard-tatuador.html   # Painel de reservas da tatuadora
├── solicitar-reserva.html    # Formulário de nova reserva
├── login-admin.html          # Login da administração
├── admin.html                # Painel administrativo
└── LICENSE
```

## 🚀 Como rodar localmente

Como é um projeto estático, basta abrir o `index.html` em um navegador ou usar um servidor local simples:

```bash
# Clone o repositório
git clone https://github.com/DuduCitizen/CasaNanquimApresentacao.git
cd CasaNanquimApresentacao

# Opção 1: abra o index.html direto no navegador

# Opção 2: suba um servidor local (exemplo com Python)
python3 -m http.server 8000
```

Depois acesse `http://localhost:8000` no navegador.

## 🌐 Deploy

O site está publicado via **GitHub Pages**:
👉 https://duducitizen.github.io/CasaNanquimApresentacao/

## 📍 Localização do estúdio

R. José Mascarenhas, 1051 — Vila Matilde, São Paulo — SP, 03515-000
Funcionamento: Segunda a Sábado, 09h às 20h

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 🖤 para a Casa Nanquim

</div>
