-- ============================================================
-- OPERADORES DE MÁQUINA
-- O valor_hora de uso_maquina é o que a empresa Máquinas cobra das outras (R$ 120/h, já inclui
-- o custo do operador). O operador recebe uma produção por hora trabalhada (R$ 10/h) que sai
-- desses 120 -- vira despesa da máquina no relatório de lucro.
-- ============================================================
create table if not exists operadores (
  id serial primary key,
  nome text not null unique,
  valor_hora numeric not null default 10,   -- produção por hora trabalhada (pré-preenche o lançamento)
  ativo boolean not null default true
);
alter table operadores disable row level security;

alter table uso_maquina add column if not exists operador_id int references operadores(id);
alter table uso_maquina add column if not exists valor_hora_operador numeric not null default 10;  -- valor combinado na data do lançamento

-- Migração (feita em 2026-11-05): todos os lançamentos antigos tinham valor_hora = 10, ou seja, o
-- valor do operador digitado no campo do valor da máquina. Backup antes de corrigir.
-- create table uso_maquina_bkp_20261105 as select * from uso_maquina;  (feito; mantido p/ conferência)
-- insert into operadores(nome) select distinct initcap(lower(trim(responsavel))) from uso_maquina where coalesce(trim(responsavel),'') <> '';
-- update uso_maquina u set operador_id = o.id from operadores o where lower(trim(u.responsavel)) = lower(o.nome);
-- update uso_maquina set valor_hora = 120 where valor_hora = 10;
