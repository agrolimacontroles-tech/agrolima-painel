// ============================================================
// Agro Lima Painel — Sidebar / navegação compartilhada
// ============================================================

(function aplicarTemaSalvo() {
  const temaSalvo = localStorage.getItem('agrolima-painel-tema') || 'dark';
  document.documentElement.setAttribute('data-theme', temaSalvo);
})();

const MENU_ITEMS = [
  { page: 'painel',      label: 'Painel',        icon: 'ti-layout-dashboard' },
  { page: 'rotina',      label: 'Rotina',        icon: 'ti-checklist' },
  { page: 'fluxocaixa',  label: 'Fluxo de Caixa', icon: 'ti-chart-line' },
  { page: 'lancamentos', label: 'Lançamentos',   icon: 'ti-cash-banknote' },
  { page: 'funcionarios', label: 'Funcionários', icon: 'ti-users' },
  { page: 'limabank',    label: 'Lima Bank',     icon: 'ti-building-bank' },
  { page: 'contaspagar', label: 'Contas a pagar', icon: 'ti-file-invoice' },
  { page: 'dividas',     label: 'Dívidas',       icon: 'ti-percentage' },
  { page: 'maquinas',    label: 'Máquinas',      icon: 'ti-tractor' },
  { page: 'fretes',      label: 'Fretes',        icon: 'ti-truck' },
  { page: 'fabricasal',  label: 'Fábrica de Sal', icon: 'ti-flask' },
  { page: 'estoque',     label: 'Estoque',       icon: 'ti-package' },
  { page: 'calculadora', label: 'Calculadora',   icon: 'ti-calculator' },
];

function renderTopbarSidebar(activePage) {
  const itemsHtml = MENU_ITEMS.map(item => `
    <button class="sitem ${item.page === activePage ? 'active' : ''}" title="${item.label}" onclick="location.href='${item.page}.html'">
      <i class="ti ${item.icon}"></i><span>${item.label}</span>
    </button>
  `).join('');

  const temaAtual = document.documentElement.getAttribute('data-theme') || 'dark';
  const sidebarColapsado = localStorage.getItem('agrolima-painel-sidebar') === 'collapsed';

  document.body.insertAdjacentHTML('afterbegin', `
    <div class="topbar">
      <button class="menubtn" onclick="toggleSidebar()" title="Minimizar/expandir menu"><i class="ti ti-menu-2"></i></button>
      <img src="logo-agrolima.png" alt="Agrolima" class="brand-logo">
      <div class="brand">Agro Lima Painel</div>
      <div class="spacer"></div>
      <button class="theme-toggle" id="themeToggleBtn" onclick="alternarTema()" title="Alternar tema claro/escuro">
        <i class="ti ${temaAtual === 'light' ? 'ti-moon' : 'ti-sun'}" id="themeToggleIcon"></i>
      </button>
      <div class="user-info">
        <span id="userEmail"></span>
        <button class="logout-btn" onclick="logout()">Sair</button>
      </div>
    </div>
    <div class="body-layout">
      <div class="sidebar ${sidebarColapsado ? 'collapsed' : ''}" id="sidebar">
        <div class="snav">${itemsHtml}</div>
      </div>
      <div class="main" id="mainContent"></div>
    </div>
  `);
}

function alternarTema() {
  const atual = document.documentElement.getAttribute('data-theme') || 'dark';
  const novo = atual === 'light' ? 'dark' : 'light';
  document.documentElement.setAttribute('data-theme', novo);
  localStorage.setItem('agrolima-painel-tema', novo);
  const icone = document.getElementById('themeToggleIcon');
  if (icone) icone.className = `ti ${novo === 'light' ? 'ti-moon' : 'ti-sun'}`;
}

function toggleSidebar() {
  const colapsado = document.getElementById('sidebar').classList.toggle('collapsed');
  localStorage.setItem('agrolima-painel-sidebar', colapsado ? 'collapsed' : 'expanded');
}

async function showUserEmail() {
  const { data: { session } } = await supabaseClient.auth.getSession();
  if (session) {
    document.getElementById('userEmail').textContent = session.user.email;
  }
}

// ============================================================
// Busca paginada — o Supabase limita cada consulta a 1000 linhas
// por padrão. `criarQuery` deve retornar um builder novo (com os
// filtros/ordenação já aplicados) a cada chamada, sem `.range()`.
// ============================================================
async function buscarPaginado(criarQuery) {
  const LOTE = 1000;
  let pagina = 0, todos = [];
  while (true) {
    const { data, error } = await criarQuery().range(pagina * LOTE, pagina * LOTE + LOTE - 1);
    if (error) throw error;
    todos = todos.concat(data || []);
    if (!data || data.length < LOTE) break;
    pagina++;
  }
  return todos;
}

function formatarMoeda(v) {
  return (Number(v) || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
