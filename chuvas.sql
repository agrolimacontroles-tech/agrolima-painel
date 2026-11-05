-- ============================================================
-- REGISTRO DE CHUVAS — um registro por fazenda por dia (mm)
-- ============================================================
create table if not exists chuva_fazendas (
  id serial primary key,
  nome text not null unique,
  ordem int not null default 0,
  ativa boolean not null default true
);
alter table chuva_fazendas disable row level security;

create table if not exists chuvas (
  id bigserial primary key,
  fazenda_id int not null references chuva_fazendas(id),
  data date not null,
  mm numeric(6,1) not null check (mm > 0),
  observacao text,
  criado_em timestamptz not null default now(),
  unique (fazenda_id, data)
);
alter table chuvas disable row level security;
create index if not exists chuvas_data_idx on chuvas (data);

insert into chuva_fazendas (nome, ordem) values ('Cipó', 1), ('Buriti', 2), ('Canaã', 3)
on conflict (nome) do nothing;
