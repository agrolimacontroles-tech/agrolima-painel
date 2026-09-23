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
  origem text default 'manual',      -- 'manual' | 'auto_maquina' | 'auto_lima_bank' (lançamentos gerados pelo sistema)
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
  observacao text
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
create table sal_formulas (
  id serial primary key,
  produto text not null,              -- 'Sal de Transição', 'Adensado Águas', ...
  insumo text not null,
  quantidade_por_lote numeric not null,
  unidade text not null                -- 'kg' | 'saco' | '%'
);

alter table sal_formulas disable row level security;

create table sal_producoes (
  id bigserial primary key,
  data date not null,
  produto text not null,
  lote_kg numeric not null,
  custo_total numeric,
  observacao text
);

alter table sal_producoes disable row level security;

create table sal_producao_insumos (
  id bigserial primary key,
  producao_id bigint not null references sal_producoes(id),
  insumo text not null,
  quantidade_usada numeric not null,
  custo numeric
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
  id serial primary key,
  insumo text not null unique,
  quantidade_atual numeric not null default 0
);

alter table sal_estoque_insumos disable row level security;

create table sal_estoque_movimentos (
  id bigserial primary key,
  insumo text not null,
  tipo text not null,                 -- 'entrada' | 'saida'
  quantidade numeric not null,
  data date not null,
  observacao text
);

alter table sal_estoque_movimentos disable row level security;

-- ============================================================
-- ESTOQUE DE VACINAS / INSUMOS VETERINÁRIOS
-- ============================================================
create table estoque_vacinas (
  id serial primary key,
  produto text not null unique,
  quantidade_atual numeric not null default 0
);

alter table estoque_vacinas disable row level security;

create table estoque_vacinas_movimentos (
  id bigserial primary key,
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

create table funcionario_atividades (
  id bigserial primary key,
  funcionario_id int not null references funcionarios(id),
  data date not null,
  atividades_programadas text,
  atividades_realizadas text,
  unique (funcionario_id, data)
);

alter table funcionario_atividades disable row level security;
