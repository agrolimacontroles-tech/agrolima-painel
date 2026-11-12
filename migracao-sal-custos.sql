-- Custo da produção de sal/ração: peso e preço do saco por insumo (valor atual do cadastro)
-- e o custo de cada insumo no momento da produção (histórico não muda quando o preço muda).
alter table sal_insumos add column if not exists kg_por_saco numeric;
alter table sal_insumos add column if not exists preco_saco numeric;
alter table sal_producao_insumos add column if not exists custo numeric;
