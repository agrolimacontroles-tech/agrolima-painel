-- Sistema Agro Lima — camada financeira/administrativa
-- Escopo: tudo que NÃO é gado/pesagem (isso já existe no CurralDigital, Top Boi).
-- disable row level security em todas as tabelas (padrão do usuário para bancos novos).

-- ============================================================
-- EMPRESAS
-- ============================================================
create table empresas (
  id serial primary key,
  nome text not null,               -- 'Terras', 'Top Boi', 'Top Vacas', 'Confinamento',
                                     -- 'Máquinas', 'Fábrica de Sal', 'Pontual e Lima Agro Transportes', 'Lima Bank'
  tipo text not null,                -- 'terra' | 'gado' | 'servico' | 'industria' | 'banco'
  tem_rebanho boolean not null default false
);

alter table empresas disable row level security;

-- ============================================================
-- PLANO DE CONTAS + LANÇAMENTOS (substitui as abas Jan-Dez com 200 colunas ocultas)
-- ============================================================
create table contas (
  id serial primary key,
  empresa_id int not null references empresas(id),
  tipo text not null,                -- 'despesa' | 'investimento' | 'receita'
  codigo int not null,
  nome text not null,
  unique (empresa_id, tipo, codigo)
);

alter table contas disable row level security;

create table lancamentos (
  id bigserial primary key,
  empresa_id int not null references empresas(id),
  conta_id int not null references contas(id),
  data date not null,
  historico text,
  quantidade numeric,
  valor_unitario numeric,
  valor_total numeric not null,
  fornecedor_comprador text,
  comprovante_url text,
  observacao text,
  origem text default 'manual',      -- 'manual' | 'auto_maquina' | 'auto_lima_bank' (lançamentos gerados pelo sistema) | 'importado_planilha'
  origem_ref_id bigint,               -- aponta pra uso_maquina.id ou movimentos_lima_bank.id quando origem != manual
  created_at timestamptz not null default now()
);

alter table lancamentos disable row level security;

-- ============================================================
-- LIMA BANK / INTERCOMPANY
-- Um único lançamento reflete nas duas pontas (origem e destino), incluindo bancos externos.
-- ============================================================
create table movimentos_lima_bank (
  id bigserial primary key,
  data date not null,
  empresa_origem_id int references empresas(id),   -- null = veio de banco externo (SICOOB/SICREDI)
  empresa_destino_id int references empresas(id),  -- null = saiu para banco externo
  banco_externo text,                               -- 'SICOOB' | 'SICREDI' | null
  valor numeric not null,
  tipo text not null,                               -- 'emprestimo' | 'pagamento' | 'aporte_externo' | 'saida_externa'
  observacao text,
  created_at timestamptz not null default now()
);

alter table movimentos_lima_bank disable row level security;

-- ============================================================
-- CONTAS A PAGAR
-- ============================================================

-- Registro das contas que se repetem todo mês (mesmo fornecedor, mesmo dia de
-- vencimento) — ex: CEMIG, contabilidade, consórcios. "Gerar contas do mês" em
-- contaspagar.html cria as contas_a_pagar reais do mês a partir daqui.
create table contas_fixas (
  id serial primary key,
  empresa_id int not null references empresas(id),
  prestador text not null,
  forma_pagamento text,
  dados_conta text,
  valor numeric,                -- null = variável, preencher a cada mês na hora de gerar
  motivo text,
  dia_vencimento int not null,  -- 1-31
  ativo boolean not null default true,
  conta_id int references contas(id),  -- plano de contas (despesa) — herdado pelas contas geradas
  observacao text
);

alter table contas_fixas disable row level security;

create table contas_a_pagar (
  id bigserial primary key,
  empresa_id int not null references empresas(id),
  prestador text not null,
  forma_pagamento text,
  dados_conta text,                 -- código de barras / pix / dados bancários
  valor numeric not null,
  motivo text,
  vencimento date not null,
  pago boolean not null default false,
  data_pagamento date,
  observacao text,
  contas_fixas_id int references contas_fixas(id),  -- preenchido quando gerada a partir de uma conta fixa
  conta_id int references contas(id),               -- plano de contas (despesa) — usado pra gerar o lançamento ao pagar
  lancamento_id bigint references lancamentos(id)    -- lançamento criado automaticamente quando marcada como paga
);

alter table contas_a_pagar disable row level security;

-- ============================================================
-- FINANCIAMENTOS / DÍVIDAS BANCÁRIAS (projeção 2026-2035)
-- ============================================================
create table financiamentos (
  id serial primary key,
  empresa_id int not null references empresas(id),
  banco text not null,               -- 'BB' | 'SICREDI' | 'VALTRA'
  descricao text,
  valor_total numeric not null,
  data_contratacao date not null,
  taxa_juros_aa numeric not null,
  numero_parcelas int not null,
  primeira_parcela_data date not null,
  observacao text
);

alter table financiamentos disable row level security;

create table financiamento_parcelas (
  id bigserial primary key,
  financiamento_id int not null references financiamentos(id),
  numero int not null,
  vencimento date not null,
  valor numeric not null,
  pago boolean not null default false,
  data_pagamento date,
  unique (financiamento_id, numero)
);

alter table financiamento_parcelas disable row level security;

-- ============================================================
-- MÁQUINAS (carregadeira, tratores) — uso diário + faturamento automático entre empresas
-- ============================================================
create table maquinas (
  id serial primary key,
  nome text not null,                -- 'Carregadeira', 'Trator 1', ...
  tipo text
);

alter table maquinas disable row level security;

create table uso_maquina (
  id bigserial primary key,
  maquina_id int not null references maquinas(id),
  empresa_beneficiada_id int not null references empresas(id),  -- fazenda que usou o serviço
  data date not null,
  responsavel text,
  servico text,
  horimetro_inicial numeric not null,
  horimetro_final numeric not null,
  horas_trabalhadas numeric generated always as (horimetro_final - horimetro_inicial) stored,
  valor_hora numeric not null default 120,  -- config vigente na data do lançamento
  observacao text
  -- abastecimento_litros, manutencao_descricao, manutencao_valor existiam aqui antes;
  -- viraram as tabelas abastecimento_maquina e manutencao_maquina abaixo (telas próprias).
  -- As colunas antigas continuam na tabela em produção (não puderam ser removidas por
  -- classificador de permissão), mas não são mais lidas/gravadas pelo app.
);

alter table uso_maquina disable row level security;
-- Faturamento mensal (receita Máquinas / despesa da empresa beneficiada) é uma VIEW calculada
-- a partir de uso_maquina, não uma tabela de "acertos" digitada.

create table abastecimento_maquina (
  id bigserial primary key,
  maquina_id int not null references maquinas(id),
  data date not null,
  litros numeric not null,
  valor numeric not null,
  observacao text
);

alter table abastecimento_maquina disable row level security;

create table manutencao_maquina (
  id bigserial primary key,
  maquina_id int not null references maquinas(id),
  data date not null,
  horimetro numeric not null,
  servico_realizado text,
  prazo_horas numeric,        -- de quanto em quanto tempo (em horas) repete essa manutenção
  horimetro_proxima numeric,  -- sugerido = horimetro + prazo_horas, editável
  valor numeric,
  observacao text
);

alter table manutencao_maquina disable row level security;

-- ============================================================
-- ACERTOS DE SAL / PASTO ENTRE FAZENDAS (intercompany fora do Lima Bank)
-- ============================================================
create table acertos_sal_pasto (
  id bigserial primary key,
  data date not null,
  tipo text not null,                -- 'sal' | 'pasto'
  empresa_fornecedora_id int not null references empresas(id),
  empresa_consumidora_id int not null references empresas(id),
  quantidade numeric,
  valor numeric not null,
  observacao text
);

alter table acertos_sal_pasto disable row level security;

-- ============================================================
-- CONSUMO DE SAL POR MANGA — controle zootécnico (não financeiro), replica a planilha
-- "CONSUMO DE SAL - <FAZENDA>" (uma por fazenda: Cipó, Carrapato/Esp.Santo, Gameleira/
-- Buriti, Canaã). Intervalo entre reposições e consumo por cabeça/dia são calculados na
-- tela a partir do histórico, não armazenados.
-- ============================================================
create table sal_consumo_manga (
  id bigserial primary key,
  empresa_id int not null references empresas(id),
  manga text not null,
  data date not null,
  produto text,
  quantidade_lote numeric,           -- cabeças de gado naquela manga
  quantidade_fornecida_kg numeric not null,
  residuo_cocho_kg numeric default 0,
  observacao text
);

alter table sal_consumo_manga disable row level security;

-- ============================================================
-- FRETES (viagens) — um cadastro só, minuta é só a versão impressa dele
-- ============================================================
create table viagens (
  id bigserial primary key,
  numero_minuta text unique,          -- ex: '2026-141'
  empresa_id int not null references empresas(id),  -- Pontual e Lima Agro Transportes
  cliente text not null,
  cpf text,
  telefone text,
  forma_pagamento text,
  data_embarque date,
  data_entrega date,
  cidade_coleta text,
  cidade_entrega text,
  km_inicial numeric,
  km_final numeric,
  km_total numeric generated always as (km_final - km_inicial) stored,
  valor_por_km numeric,
  adicionais numeric default 0,       -- pedágio etc.
  valor_total numeric,
  status text default 'pendente',     -- 'pendente' | 'recebido'
  data_recebimento date,
  observacao text
);

alter table viagens disable row level security;

-- ============================================================
-- FÁBRICA DE SAL (produção)
-- ============================================================

-- Cadastro dos tipos de insumo (Ureia, Calcário, Fubá, ...). Existe pra que Fórmulas,
-- Produção e Estoque sempre se refiram ao MESMO insumo (por id), nunca por texto livre
-- digitado — evita erro de digitação quebrar a baixa automática de estoque.
create table sal_insumos (
  id serial primary key,
  nome text not null unique,
  unidade text
);

alter table sal_insumos disable row level security;

-- Fórmula é uma entidade própria (não agrupada por texto de produto) — "Fórmula 1",
-- "Fórmula 2"... Na Produção você escolhe a fórmula pelo nome e o sistema já mostra
-- e pré-preenche os insumos dela.
create table sal_formulas (
  id serial primary key,
  nome text not null,                 -- 'Fórmula 1', 'Fórmula 2', ...
  produto text not null                -- 'Sal de Transição', 'Adensado Águas', ...
);

alter table sal_formulas disable row level security;

create table sal_formula_itens (
  id bigserial primary key,
  formula_id int not null references sal_formulas(id),
  insumo_id int not null references sal_insumos(id),
  quantidade numeric not null,
  unidade text not null                -- 'kg' | 'saco' | '%'
);

alter table sal_formula_itens disable row level security;

create table sal_producoes (
  id bigserial primary key,
  data date not null,
  produto text not null,
  formula_id int references sal_formulas(id),  -- null = produção avulsa, sem fórmula cadastrada
  lote_kg numeric not null,
  custo_total numeric,
  observacao text
);

alter table sal_producoes disable row level security;

-- Insumos efetivamente usados numa produção (escolhidos por select, não digitados) —
-- ao salvar a produção, cada linha aqui gera uma baixa automática em sal_estoque_movimentos
-- e desconta de sal_estoque_insumos.
create table sal_producao_insumos (
  id bigserial primary key,
  producao_id bigint not null references sal_producoes(id),
  insumo_id int not null references sal_insumos(id),
  quantidade_usada numeric not null
);

alter table sal_producao_insumos disable row level security;

create table sal_vendas (
  id bigserial primary key,
  data date not null,
  produto text not null,
  empresa_compradora_id int not null references empresas(id), -- Carrapato/Buriti/Rio Preto/Cipó -> qual fazenda
  quantidade numeric not null,
  valor numeric not null
);

alter table sal_vendas disable row level security;

create table sal_estoque_insumos (
  insumo_id int primary key references sal_insumos(id),
  quantidade_atual numeric not null default 0
);

alter table sal_estoque_insumos disable row level security;

create table sal_estoque_movimentos (
  id bigserial primary key,
  insumo_id int not null references sal_insumos(id),
  tipo text not null,                 -- 'entrada' | 'saida'
  quantidade numeric not null,
  data date not null,
  producao_id bigint references sal_producoes(id),  -- preenchido quando a saída foi baixa automática de produção
  observacao text
);

alter table sal_estoque_movimentos disable row level security;

-- ============================================================
-- ESTOQUE DE VACINAS / INSUMOS VETERINÁRIOS
-- ============================================================
create table estoque_vacinas (
  id serial primary key,
  empresa_id int references empresas(id),
  produto text not null,
  quantidade_atual numeric not null default 0,
  unique (empresa_id, produto)
);

alter table estoque_vacinas disable row level security;

create table estoque_vacinas_movimentos (
  id bigserial primary key,
  empresa_id int references empresas(id),
  produto text not null,
  tipo text not null,                 -- 'entrada' | 'saida'
  quantidade numeric not null,
  data date not null,
  observacao text
);

alter table estoque_vacinas_movimentos disable row level security;

-- ============================================================
-- CALCULADORA VENDER-VS-ENGORDAR
-- Parâmetros configuráveis; o peso/lote real vem do CurralDigital (integração futura).
-- ============================================================
create table parametros_ganho_peso (
  id serial primary key,
  empresa_id int not null references empresas(id),
  mes_inicio int not null,            -- 1-12
  mes_fim int not null,
  gramas_dia numeric not null
);

alter table parametros_ganho_peso disable row level security;

create table parametros_custo_diario (
  id serial primary key,
  empresa_id int not null references empresas(id),
  categoria text not null,            -- 'garrote' | 'bezerra' | ...
  custo_dia_cabeca numeric not null,
  vigente_desde date not null
);

alter table parametros_custo_diario disable row level security;

-- ============================================================
-- FLUXO DE CAIXA — saldo inicial por empresa (ponto de partida do acumulado)
-- ============================================================
create table saldo_inicial (
  empresa_id int primary key references empresas(id),
  valor numeric not null default 0,
  data_referencia date not null default current_date
);

alter table saldo_inicial disable row level security;

-- ============================================================
-- CHECKLIST DA ROTINA — marcação de "feito" por item, reseta por período
-- (diário = data, semanal = ano-semana ISO, mensal = ano-mês, sob demanda = fixo '')
-- ============================================================
create table checklist_execucoes (
  id bigserial primary key,
  item_id text not null,
  periodo_chave text not null,
  concluido_em timestamptz not null default now(),
  unique (item_id, periodo_chave)
);

alter table checklist_execucoes disable row level security;

-- ============================================================
-- FUNCIONÁRIOS — cadastro, dias trabalhados, férias
-- ============================================================
create table funcionarios (
  id serial primary key,
  nome text not null,
  cargo text,
  empresa_id int references empresas(id),
  data_admissao date not null,
  salario numeric,
  status text not null default 'ativo',   -- 'ativo' | 'ferias' | 'afastado' | 'demitido'
  data_demissao date,
  motivo_demissao text,
  observacao text
);

alter table funcionarios disable row level security;

create table funcionario_dias_trabalhados (
  id bigserial primary key,
  funcionario_id int not null references funcionarios(id),
  data date not null,
  status text not null default 'Trabalhou',  -- Trabalhou | Falta | Férias | Atestado | Licença | Folga |
                                              -- Folga Concedida | Feriado | Extra + | Extra Solicitada |
                                              -- Dia Incompleto | Expediente Normal
  observacao text,
  unique (funcionario_id, data)
);

alter table funcionario_dias_trabalhados disable row level security;

create table funcionario_ferias (
  id bigserial primary key,
  funcionario_id int not null references funcionarios(id),
  periodo_aquisitivo_inicio date not null,
  periodo_aquisitivo_fim date not null,
  data_inicio_gozo date,
  data_fim_gozo date,
  dias int,
  status text not null default 'pendente',  -- 'pendente' | 'agendada' | 'gozada'
  observacao text
);

alter table funcionario_ferias disable row level security;

-- ============================================================
-- TERRAS — cadastro de fazendas (mesmo padrão de campos do CurralDigital)
-- ============================================================
create table terras_fazendas (
  id serial primary key,
  nome text not null,
  proprietario text,
  atividade text,
  capacidade numeric,
  area_total_ha numeric,
  area_produtiva_ha numeric,
  municipio text,
  estado text,
  observacao text
);

alter table terras_fazendas disable row level security;

create table funcionario_adiantamentos (
  id bigserial primary key,
  funcionario_id int not null references funcionarios(id),
  data date not null,
  valor numeric not null,
  descricao text,
  situacao text not null default 'pendente'  -- 'pendente' | 'descontado'
);

alter table funcionario_adiantamentos disable row level security;

create table folha_pagamento (
  id bigserial primary key,
  funcionario_id int not null references funcionarios(id),
  mes_referencia text not null,  -- 'YYYY-MM'
  salario numeric not null default 0,
  acrescimo numeric not null default 0,
  horas numeric,
  descontos numeric not null default 0,   -- soma dos adiantamentos pendentes descontados nesse mês
  valor_liquido numeric not null default 0,
  valor_pago numeric not null default 0,  -- valor já pago (ex: adiantamento de folha)
  restante numeric not null default 0,
  unique (funcionario_id, mes_referencia)
);

alter table folha_pagamento disable row level security;

create table funcionario_atividades (
  id bigserial primary key,
  funcionario_id int not null references funcionarios(id),
  data date not null,
  atividades_programadas text,
  atividades_realizadas text,
  unique (funcionario_id, data)
);

alter table funcionario_atividades disable row level security;
-- ============================================================
-- TOP VACAS — manejo de rebanho (adaptado do OrdenhaDigital, sem nada de leite)
-- ============================================================

create table topvacas_lotes (
  id serial primary key,
  nome text not null unique,
  tipo text not null default 'outro' check (tipo in ('cria','recria','engorda','reproducao','outro')),
  ordem int not null default 0,
  ativo boolean not null default true
);
alter table topvacas_lotes disable row level security;

create table topvacas_touros (
  id serial primary key,
  codigo text not null unique,
  raca text,
  central text,
  sexado boolean not null default false,
  doses int not null default 0,
  preco_dose numeric(10,2) not null default 0,
  ativo boolean not null default true
);
alter table topvacas_touros disable row level security;

create table topvacas_animais (
  id bigserial primary key,
  brinco text not null unique,
  nome text,
  sexo text check (sexo in ('M', 'F')),
  raca text,
  categoria text not null check (categoria in ('Bezerra', 'Bezerro', 'Novilha', 'Vaca', 'Touro')),
  data_nascimento date,
  mae_id bigint references topvacas_animais(id) on delete set null,
  pai text,
  lote_id int references topvacas_lotes(id) on delete set null,
  numero_partos int not null default 0,
  data_ultimo_parto date,
  situacao_reprodutiva text not null default 'Vazia'
    check (situacao_reprodutiva in ('Em recria', 'Apta p/ IA', 'Pós-parto', 'Vazia', 'Inseminada', 'Prenhe')),
  data_ultima_ia date,
  touro_ultima_ia text,
  ias_no_ciclo int not null default 0,
  colostro_ok boolean,
  data_b19 date,
  data_desmama date,
  peso numeric(6,1),
  ativo boolean not null default true,
  data_saida date,
  motivo_saida text,
  observacao text,
  criado_em timestamptz not null default now()
);
create index topvacas_animais_categoria_idx on topvacas_animais(categoria) where ativo;
alter table topvacas_animais disable row level security;

create table topvacas_eventos (
  id bigserial primary key,
  animal_id bigint not null references topvacas_animais(id) on delete cascade,
  data date not null,
  tipo text not null,
  touro_id int references topvacas_touros(id) on delete set null,
  detalhe text,
  criado_em timestamptz not null default now()
);
create index topvacas_eventos_animal_idx on topvacas_eventos(animal_id, data desc);
alter table topvacas_eventos disable row level security;

create table topvacas_tratamentos (
  id bigserial primary key,
  animal_id bigint not null references topvacas_animais(id) on delete cascade,
  doenca text not null,
  medicamento text not null,
  data_inicio date not null,
  dias_aplicacao int not null default 1,
  carencia_carne int not null default 0,
  data_liberacao date generated always as (data_inicio + dias_aplicacao + carencia_carne) stored,
  observacao text,
  criado_em timestamptz not null default now()
);
alter table topvacas_tratamentos disable row level security;

create table topvacas_manejos_sanitarios (
  id serial primary key,
  nome text not null unique,
  grupo text,
  frequencia_dias int not null,
  ativo boolean not null default true
);
alter table topvacas_manejos_sanitarios disable row level security;

create table topvacas_aplicacoes_sanitarias (
  id bigserial primary key,
  manejo_id int not null references topvacas_manejos_sanitarios(id) on delete cascade,
  data date not null,
  observacao text
);
alter table topvacas_aplicacoes_sanitarias disable row level security;

create table topvacas_insumos (
  id serial primary key,
  nome text not null unique,
  unidade text not null default 'kg',
  preco numeric(10,2) not null default 0,
  estoque numeric(12,2) not null default 0,
  ativo boolean not null default true
);
alter table topvacas_insumos disable row level security;

create table topvacas_insumo_movimentos (
  id bigserial primary key,
  insumo_id int not null references topvacas_insumos(id) on delete cascade,
  data date not null,
  tipo text not null check (tipo in ('entrada', 'saida', 'ajuste')),
  quantidade numeric(12,2) not null,
  valor_unitario numeric(10,2),
  observacao text
);
alter table topvacas_insumo_movimentos disable row level security;

create or replace function topvacas_atualiza_estoque_insumo() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.tipo = 'entrada' then
      update topvacas_insumos set estoque = estoque + new.quantidade,
             preco = coalesce(nullif(new.valor_unitario,0), preco) where id = new.insumo_id;
    elsif new.tipo = 'saida' then
      update topvacas_insumos set estoque = estoque - new.quantidade where id = new.insumo_id;
    else
      update topvacas_insumos set estoque = new.quantidade where id = new.insumo_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.tipo = 'entrada' then
      update topvacas_insumos set estoque = estoque - old.quantidade where id = old.insumo_id;
    elsif old.tipo = 'saida' then
      update topvacas_insumos set estoque = estoque + old.quantidade where id = old.insumo_id;
    end if;
    return old;
  end if;
  return null;
end $$;
create trigger trg_topvacas_estoque_insumo after insert or delete on topvacas_insumo_movimentos
  for each row execute function topvacas_atualiza_estoque_insumo();

create table topvacas_dietas (
  id serial primary key,
  lote_id int not null references topvacas_lotes(id) on delete cascade,
  insumo_id int not null references topvacas_insumos(id) on delete cascade,
  kg_cab_dia numeric(8,2) not null,
  unique (lote_id, insumo_id)
);
alter table topvacas_dietas disable row level security;

insert into topvacas_lotes (nome, tipo, ordem) values
  ('Cria', 'cria', 1),
  ('Recria', 'recria', 2),
  ('Reprodução', 'reproducao', 3),
  ('Engorda', 'engorda', 4)
on conflict (nome) do nothing;

insert into topvacas_manejos_sanitarios (nome, grupo, frequencia_dias) values
  ('Raiva', 'Todo o rebanho', 365),
  ('Clostridioses (polivalente)', 'Todo o rebanho', 180),
  ('Leptospirose', 'Vacas e novilhas', 180),
  ('IBR / BVD', 'Vacas e novilhas', 180),
  ('Exame de brucelose e tuberculose', 'Rebanho adulto', 365),
  ('Vermifugação estratégica', 'Novilhas e bezerras', 60),
  ('Controle de carrapato', 'Todo o rebanho', 21)
on conflict (nome) do nothing;

-- ============================================================
-- CONFINAMENTO — lotes de gado no cocho + volumoso (produção/estoque)
-- ============================================================

-- Catálogo de lotes/currais (reutilizável — não é criado um novo a cada entrada de gado)
create table confinamento_lotes (
  id serial primary key,
  nome text not null unique,
  observacao text,
  ativo boolean not null default true
);
alter table confinamento_lotes disable row level security;

create table confinamento_entradas (
  id serial primary key,
  lote_id int not null references confinamento_lotes(id),
  data_entrada date not null,
  quantidade_entrada int not null,
  peso_medio_entrada_kg numeric(6,1),
  observacao text,
  criado_em timestamptz not null default now()
);
alter table confinamento_entradas disable row level security;

create table confinamento_saidas (
  id bigserial primary key,
  entrada_id int not null references confinamento_entradas(id) on delete cascade,
  data date not null,
  quantidade int not null,
  peso_medio_kg numeric(6,1),
  destino text,
  observacao text
);
alter table confinamento_saidas disable row level security;

create table confinamento_volumoso (
  id serial primary key,
  nome text not null unique,
  unidade text not null default 'kg',
  estoque_atual numeric(12,2) not null default 0,
  ativo boolean not null default true
);
alter table confinamento_volumoso disable row level security;

create table confinamento_volumoso_movimentos (
  id bigserial primary key,
  volumoso_id int not null references confinamento_volumoso(id) on delete cascade,
  data date not null,
  tipo text not null check (tipo in ('producao', 'consumo', 'ajuste')),
  quantidade numeric(12,2) not null,
  observacao text
);
alter table confinamento_volumoso_movimentos disable row level security;

create or replace function confinamento_atualiza_estoque_volumoso() returns trigger language plpgsql as $$
begin
  if tg_op = 'INSERT' then
    if new.tipo = 'producao' then
      update confinamento_volumoso set estoque_atual = estoque_atual + new.quantidade where id = new.volumoso_id;
    elsif new.tipo = 'consumo' then
      update confinamento_volumoso set estoque_atual = estoque_atual - new.quantidade where id = new.volumoso_id;
    else
      update confinamento_volumoso set estoque_atual = new.quantidade where id = new.volumoso_id;
    end if;
    return new;
  elsif tg_op = 'DELETE' then
    if old.tipo = 'producao' then
      update confinamento_volumoso set estoque_atual = estoque_atual - old.quantidade where id = old.volumoso_id;
    elsif old.tipo = 'consumo' then
      update confinamento_volumoso set estoque_atual = estoque_atual + old.quantidade where id = old.volumoso_id;
    end if;
    return old;
  end if;
  return null;
end $$;
create trigger trg_confinamento_estoque_volumoso after insert or delete on confinamento_volumoso_movimentos
  for each row execute function confinamento_atualiza_estoque_volumoso();

