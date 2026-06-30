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

**Front-end** (publicado no GitHub Pages):
- **HTML5** — estrutura das páginas
- **CSS3** — estilo visual e responsividade
- **JavaScript** — interatividade e formulários
- **Font Awesome** — ícones
- **Google Fonts** (Cormorant Garamond, DM Sans) — tipografia

**Back-end**:
- **Java**
- **MySQL** (banco de dados)

> ⚠️ **Aviso sobre o ambiente publicado:** o GitHub Pages hospeda apenas arquivos estáticos (HTML/CSS/JS) e **não tem suporte para rodar aplicações em Java nem bancos de dados MySQL**. Por isso, o back-end deste projeto **não está hospedado** e, consequentemente, **a parte funcional do sistema (login real, persistência de reservas, regras de negócio) não funciona na versão publicada** — apenas a interface (front-end) está disponível online. Para testar o sistema completo, é necessário rodar o back-end localmente (veja a seção abaixo).

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

### Back-end (funcionalidades reais)
Para que login, reservas e demais funcionalidades funcionem de verdade, é necessário também rodar o back-end em **Java**, conectado a um banco **MySQL**, localmente ou em algum serviço de hospedagem compatível (já que o GitHub Pages não suporta isso).

## 🌐 Deploy

O **front-end** está publicado via **GitHub Pages**:
👉 https://duducitizen.github.io/CasaNanquimApresentacao/

⚠️ Por limitação do GitHub Pages (que não roda Java/MySQL), o **back-end não está hospedado**. A versão publicada mostra apenas a interface visual do site — as funcionalidades que dependem do back-end ainda não estão ativas online.

## 📄 Licença

Este projeto está sob a licença **MIT**. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

<div align="center">

Feito com 🖤 para a Casa Nanquim

</div>
