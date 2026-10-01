// ============================================================
// Agro Lima Painel — Sidebar / navegação compartilhada
// ============================================================

(function aplicarTemaSalvo() {
  const temaSalvo = localStorage.getItem('agrolima-painel-tema') || 'dark';
  document.documentElement.setAttribute('data-theme', temaSalvo);
})();

// "Administrativo" — comum, misturado entre todas as empresas
const MENU_ADMINISTRATIVO = [
  { page: 'painel',      label: 'Painel',        icon: 'ti-layout-dashboard' },
  { page: 'rotina',      label: 'Rotina',        icon: 'ti-checklist' },
  { page: 'lancamentos', label: 'Lançamentos',   icon: 'ti-cash-banknote' },
  { page: 'funcionarios', label: 'Funcionários', icon: 'ti-users' },
  { page: 'contaspagar', label: 'Contas a pagar', icon: 'ti-file-invoice' },
  { page: 'todasdividas', label: 'Todas Dívidas', icon: 'ti-percentage' },
  { page: 'fluxocaixa',  label: 'Fluxo Consolidado', icon: 'ti-chart-line', href: () => 'fluxocaixa.html' },
  { page: 'calculadora', label: 'Calculadora',   icon: 'ti-calculator' },
];

// Itens que aparecem dentro de cada "quadrado" de empresa — cada um sabe montar seu próprio link filtrado.
// Os "cd*" são o sistema real do Top Boi (CurralDigital, https://topboi.vercel.app — domínio/Supabase separados).
const ITEM_DEFS_EMPRESA = {
  terras:     { page: 'terras',    label: 'Terras',        icon: 'ti-map-2', href: () => 'terras.html' },
  topvacas:   { page: 'topvacas',  label: 'Top Vacas',     icon: 'ti-tag', href: () => 'topvacas.html' },
  confinamento: { page: 'confinamento', label: 'Confinamento', icon: 'ti-building-warehouse', href: () => 'confinamento.html' },
  maquinas:   { page: 'maquinas',   label: 'Máquinas',      icon: 'ti-tractor', href: () => 'maquinas.html' },
  fabricasal: { page: 'fabricasal', label: 'Fábrica de Sal', icon: 'ti-flask',   href: () => 'fabricasal.html' },
  limabank:   { page: 'limabank',   label: 'Lima Bank',     icon: 'ti-building-bank', href: () => 'limabank.html' },
  fretes:     { page: 'fretes',     label: 'Fretes',        icon: 'ti-truck', href: () => 'fretes.html' },
  fluxocaixa: { page: 'fluxocaixa', label: 'Fluxo de Caixa', icon: 'ti-chart-line', href: id => `fluxocaixa.html?empresa=${id}` },
  dividas:    { page: 'dividas',    label: 'Dívidas',       icon: 'ti-percentage', href: id => `dividas.html?empresa=${id}` },
  estoque:    { page: 'estoque',    label: 'Estoque',       icon: 'ti-package', href: id => `estoque.html?empresa=${id}` },
  estoqueFabricaSal: { page: 'fabricasal', label: 'Estoque', icon: 'ti-package', href: () => 'fabricasal.html?aba=estoque' },
  cdPainel:     { label: 'Painel', icon: 'ti-layout-dashboard', external: true, href: () => 'https://topboi.vercel.app/painel.html' },
};

// Um "quadrado" por empresa — id real da tabela `empresas` (fixo, não muda)
const GRUPOS_EMPRESA = [
  { empresaId: 1, nome: 'Terras',                         itens: ['terras', 'fluxocaixa', 'dividas'] },
  { empresaId: 2, nome: 'Top Boi',                         itens: ['cdPainel', 'fluxocaixa', 'dividas', 'estoque'] },
  { empresaId: 3, nome: 'Top Vacas',                       itens: ['topvacas', 'fluxocaixa', 'dividas', 'estoque'] },
  { empresaId: 4, nome: 'Confinamento',                    itens: ['confinamento', 'fluxocaixa', 'dividas', 'estoque'] },
  { empresaId: 5, nome: 'Máquinas',                        itens: ['maquinas', 'fluxocaixa', 'dividas'] },
  { empresaId: 6, nome: 'Fábrica de Sal',                  itens: ['fabricasal', 'fluxocaixa', 'dividas', 'estoqueFabricaSal'] },
  { empresaId: 7, nome: 'Pontual e Lima Agro Transportes', nomeExibicao: 'Pontual e Lima<br>Agro Transporte', itens: ['fretes', 'fluxocaixa', 'dividas'] },
  { empresaId: 8, nome: 'Lima Bank',                       itens: ['limabank', 'fluxocaixa', 'dividas'] },
];

function iconeHtml(def) {
  return def.img ? `<img src="${def.img}" class="sitem-icon-img" width="18" height="15">` : `<i class="ti ${def.icon}"></i>`;
}

function itemAdministrativoHtml(item, activePage) {
  const href = item.href ? item.href() : `${item.page}.html`;
  const query = href.includes('?') ? href.slice(href.indexOf('?')) : '';
  const ativo = item.page === activePage && location.search === query;
  return `
    <button class="sitem ${ativo ? 'active' : ''}" title="${item.label}" onclick="location.href='${href}'">
      ${iconeHtml(item)}<span>${item.label}</span>
    </button>
  `;
}

function itemEmpresaHtml(key, empresaId, activePage) {
  const def = ITEM_DEFS_EMPRESA[key];
  const href = def.href(empresaId);
  const query = href.includes('?') ? href.slice(href.indexOf('?')) : '';
  const ativo = !def.external && def.page === activePage && location.search === query;
  const acao = def.external ? `window.open('${href}', '_blank')` : `location.href='${href}'`;
  return `
    <button class="sitem ${ativo ? 'active' : ''}" title="${def.label}" onclick="${acao}">
      ${iconeHtml(def)}<span>${def.label}</span>${def.external ? '<i class="ti ti-external-link schevron" style="opacity:.6"></i>' : ''}
    </button>
  `;
}

function grupoDeveAbrir(grupo, activePage, empresaUrlId) {
  for (const k of grupo.itens) {
    const def = ITEM_DEFS_EMPRESA[k];
    if (def.external || ['fluxocaixa', 'dividas', 'estoque', 'estoqueFabricaSal'].includes(k)) continue;
    if (def.page === activePage && !location.search) return true;
  }
  if (['fluxocaixa', 'dividas', 'estoque'].includes(activePage) && empresaUrlId && Number(empresaUrlId) === grupo.empresaId) return true;
  if (activePage === 'fabricasal' && grupo.empresaId === 6 && location.search.includes('aba=estoque')) return true;
  return false;
}

function grupoEmpresaHtml(grupo, activePage, empresaUrlId) {
  const chaveAberto = `agrolima-painel-grupo-${grupo.empresaId}`;
  const salvo = localStorage.getItem(chaveAberto);
  const aberto = salvo !== null ? salvo === '1' : grupoDeveAbrir(grupo, activePage, empresaUrlId);
  const itensHtml = grupo.itens.map(k => itemEmpresaHtml(k, grupo.empresaId, activePage)).join('');
  return `
    <button class="sitem sgroup-toggle ${aberto ? 'open' : ''}" id="sgrupo-btn-${grupo.empresaId}" title="${grupo.nome}" onclick="toggleGrupoEmpresa(${grupo.empresaId})">
      <i class="ti ti-building"></i><span>${grupo.nomeExibicao || grupo.nome}</span><i class="ti ti-chevron-right schevron"></i>
    </button>
    <div class="sgroup-children" id="sgrupo-${grupo.empresaId}" style="${aberto ? '' : 'display:none'}">${itensHtml}</div>
  `;
}

function toggleGrupoEmpresa(empresaId) {
  const el = document.getElementById(`sgrupo-${empresaId}`);
  const btn = document.getElementById(`sgrupo-btn-${empresaId}`);
  const abrindo = el.style.display === 'none';
  el.style.display = abrindo ? '' : 'none';
  btn.classList.toggle('open', abrindo);
  localStorage.setItem(`agrolima-painel-grupo-${empresaId}`, abrindo ? '1' : '0');
}

function renderTopbarSidebar(activePage) {
  const empresaUrlId = new URLSearchParams(location.search).get('empresa');

  const administrativoHtml = MENU_ADMINISTRATIVO.map(item => itemAdministrativoHtml(item, activePage)).join('');
  const gruposHtml = GRUPOS_EMPRESA.map(g => grupoEmpresaHtml(g, activePage, empresaUrlId)).join('');

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
        <div class="snav">
          <div class="snav-label">Administrativo</div>
          ${administrativoHtml}
          <div class="snav-label">Empresas</div>
          ${gruposHtml}
        </div>
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
