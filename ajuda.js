// ============================================================
// Agro Lima Painel — explicações (ajuda ao passar o mouse)
// Passar o mouse (ou tocar) em campos, colunas, botões, siglas e nomes de empresa mostra o que significam
// e o que lançar ali. O botão "Explicações" na barra de cima liga/desliga tudo.
// Para incluir um termo novo: acrescente em TERMOS (texto exato, minúsculo) ou, se o significado muda de
// tela pra tela, em POR_PAGINA[nome-do-arquivo-sem-.html][texto].
// ============================================================
(function () {
  if (window.AGROLIMA_AJUDA) return;

  // ---------- o que cada empresa faz (também alimenta a página Guia do Sistema) ----------
  const EMPRESAS_DESC = {
    'terras': {
      nome: 'Terras',
      resumo: 'Dona das fazendas. Cuida da terra e do pasto e aluga o pasto para as outras empresas do grupo colocarem o gado.',
      detalhes: [
        'Receita principal: "pasto" (cobrança pelo uso das fazendas). Outras receitas: venda de terra, carvão, juros/rendimentos.',
        'Despesas típicas: funcionários, herbicida, manutenção de cercas, pastos, cochos e bebedouros, curral, rede de água, impostos, cartório.',
        'Investimentos típicos: cercas, pastos, compra de terra, casa/construção, usina solar, infraestrutura.',
        'Tela própria: Terras (cadastro das fazendas, ocupação e faturamento por pasto).',
        'Dívidas ligadas a ela: BNB, SICOOB, Bradesco e o financiamento BB de reforma de cercas.'
      ]
    },
    'top boi': {
      nome: 'Top Boi',
      resumo: 'Pecuária de corte: compra bezerros e garrotes, engorda e vende o boi gordo.',
      detalhes: [
        'Receitas: venda de garrotes e de bois. Investimentos: compra de bezerros, garrotes e bois, frete e comissão do gado.',
        'Despesas típicas: pasto (aluguel pago a Terras), vaqueiro, sal, medicamentos e vacinas, combustível, manutenção, tropa.',
        'Tem sistema próprio de controle do rebanho, o CurralDigital (abre em outro site, pelo menu Top Boi > Painel).',
        'Maior parte das dívidas bancárias do grupo (BB), incluindo a cédula que juntou 5 financiamentos em 2025.'
      ]
    },
    'top vacas': {
      nome: 'Top Vacas',
      resumo: 'Criação com vacas matrizes: reprodução, nascimento e recria dos bezerros. Não é gado leiteiro.',
      detalhes: [
        'Controle do rebanho na tela Top Vacas: inseminação/cobertura, diagnóstico de gestação, parto, bezerras, sanidade (vacinas) e nutrição.',
        'Investimentos típicos: compra de vacas, frete, comissão, adiantamentos a outras empresas e empréstimos.',
        'O Painel avisa os partos previstos (inseminação + 283 dias) e os manejos sanitários atrasados.'
      ]
    },
    'confinamento': {
      nome: 'Confinamento',
      resumo: 'Engorda de gado confinado: o gado fica no cocho (comedouro) recebendo volumoso e suplementação até o ponto de venda.',
      detalhes: [
        'Controle na tela Confinamento: lotes/currais, entrada e saída de gado no cocho e estoque de volumoso (silagem etc.).',
        'Despesas típicas: irrigação (adubo, mão de obra, máquinas, defensivos, manutenção, sementes), suplementação, silagem, manutenção do confinamento.',
        'Dívida ligada a ela: financiamento SICREDI.'
      ]
    },
    'máquinas': {
      nome: 'Máquinas',
      resumo: 'Empresa dos tratores e equipamentos. Trabalha para as outras empresas do grupo e cobra pelas horas de uso.',
      detalhes: [
        'Controle na tela Máquinas: uso diário (horímetro), abastecimento, manutenção e faturamento do mês por empresa atendida.',
        'Custos típicos por máquina: funcionário, horas, combustível, peças e serviços (tratores e carregadeira, grade, roçadeira, implementos).',
        'O Painel avisa quando uma manutenção está perto ou atrasada.'
      ]
    },
    'fábrica de sal': {
      nome: 'Fábrica de Sal',
      resumo: 'Fabrica o sal mineral/suplemento que o gado das fazendas consome e vende às empresas do grupo.',
      detalhes: [
        'Controle na tela Fábrica de Sal: fórmulas (receitas do sal), produção, consumo por fazenda e por manga, vendas e estoque de insumos.',
        'Insumos típicos: soja, DDG, ureia, calcário e outros ingredientes comprados para a fórmula.',
        'A produção dá baixa automática no estoque dos insumos usados.'
      ]
    },
    'pontual e lima agro transportes': {
      nome: 'Pontual e Lima Agro Transportes',
      resumo: 'Transportadora do grupo: faz fretes de gado e cargas, com caminhão próprio.',
      detalhes: [
        'Controle na tela Fretes: um cadastro por viagem (minuta, cliente, trajeto, KM, valor).',
        'Receitas: recebimento de frete (de clientes e de empresas do grupo). Despesas: combustível, pedágios, impostos, manutenção do caminhão, tarifas bancárias.'
      ]
    },
    'lima bank': {
      nome: 'Lima Bank',
      resumo: 'Tesouraria interna do grupo. Quando uma empresa precisa de dinheiro e outra tem sobra, o Lima Bank faz o empréstimo entre elas.',
      detalhes: [
        'Nas planilhas originais cada movimento é lançado nos dois lados: na empresa e no Lima Bank. Por isso, somando todas as empresas, essas transferências entram duas vezes.',
        'Também registra o dinheiro que entra e sai de bancos externos (SICOOB, SICREDI e outros).',
        'Exemplo mais comum: Terras empresta para o Top Boi comprar gado e recebe de volta quando ele vende.'
      ]
    }
  };

  // ---------- siglas e termos do campo (aparecem sublinhados no texto) ----------
  const SIGLAS = {
    'BB': 'Banco do Brasil.',
    'BNB': 'Banco do Nordeste do Brasil.',
    'SICREDI': 'Cooperativa de crédito (banco cooperativo).',
    'SICOOB': 'Cooperativa de crédito (banco cooperativo).',
    'PRONAF': 'Programa Nacional de Fortalecimento da Agricultura Familiar: crédito rural com juros reduzidos.',
    'GTA': 'Guia de Trânsito Animal: documento obrigatório para transportar gado, emitido com uma taxa.',
    'IA': 'Inseminação artificial.',
    'B19': 'Vacina contra brucelose, aplicada em bezerras jovens por veterinário cadastrado.',
    'a.a.': 'Ao ano (taxa de juros anual).',
    'ha': 'Hectare: medida de área (1 ha = 10 mil m²).',
    'KM': 'Quilômetros rodados.',
    'CPF': 'Cadastro de Pessoa Física.',
    'DDG': 'Grãos secos de destilaria: subproduto do milho usado como ingrediente de ração e sal mineral.',
    'CEMIG': 'Companhia de energia elétrica de Minas Gerais (conta de luz).',
    'LIMABANK': 'Tesouraria interna do grupo (Lima Bank).'
  };

  // ---------- conceitos (só para a página Guia) ----------
  const CONCEITOS = [
    ['Plano de contas', 'Lista de categorias (contas) de cada empresa onde cada lançamento é classificado. Cada conta tem um número: despesas de 1 a 99, investimentos de 101 a 199 e receitas de 201 a 299 (pró-labore usa a faixa dos 300). Cada empresa tem o seu, vindo das planilhas FINANCEIRO.'],
    ['Lançamento', 'Uma linha de dinheiro que entrou ou saiu: data, histórico (o que foi), conta, valor e, se tiver, fornecedor ou comprador. Tudo que aparece no Fluxo de Caixa e nos totais vem dos lançamentos.'],
    ['Despesa', 'Gasto do dia a dia para manter a operação: salário, combustível, pasto, remédio, manutenção.'],
    ['Investimento', 'Gasto que vira patrimônio (compra de gado, terra, cerca, máquina) e também movimentos de capital, como empréstimos e aplicações entre empresas e bancos.'],
    ['Receita', 'Dinheiro que entra: venda de gado, aluguel de pasto, frete recebido, horas de máquina faturadas.'],
    ['Saldo do mês', 'Receitas menos despesas e investimentos do mês.'],
    ['Realizado x Previsto', 'No Fluxo de Caixa, "realizado" é o que já foi lançado; "previsto" é o que ainda vai sair (contas a pagar e parcelas de financiamento) nos meses futuros.'],
    ['Consolidado', 'Todas as empresas somadas. Cuidado: transferências pelo Lima Bank aparecem nas duas pontas e entram duas vezes na soma.'],
    ['Saldo devedor', 'Soma das parcelas que ainda faltam pagar de um financiamento. Como as parcelas já incluem os juros, esse valor fica maior que o valor contratado.'],
    ['Conta fixa', 'Conta que se repete todo mês (luz, internet, folha). Cadastrada uma vez, o botão "Gerar contas do mês" cria as contas daquele mês sem duplicar.'],
    ['Folha de pagamento', 'Salário + acréscimos − adiantamentos já dados = líquido. O sistema soma a folha de cada empresa e gera uma conta a pagar única.'],
    ['Horímetro', 'Contador de horas de trabalho da máquina (como o hodômetro do carro, mas em horas). É a base da manutenção e do faturamento das máquinas.'],
    ['Cocho', 'Comedouro do gado. "Gado no cocho" = quantas cabeças estão em confinamento sendo alimentadas.'],
    ['Volumoso', 'Alimento fibroso do gado: silagem, capim, cana, feno.'],
    ['Manga', 'Divisão de pasto/curral onde um grupo de animais fica. Usada no controle de consumo de sal.'],
    ['Arroba (@)', 'Unidade de peso do boi: 15 kg de carcaça. O preço do boi gordo é cotado por arroba.'],
    ['Cria, recria e engorda', 'Cria: bezerros até a desmama. Recria: crescimento depois da desmama. Engorda: fase final até o ponto de venda.'],
    ['Carência', 'Dias que o animal precisa esperar depois de um remédio antes de ser abatido ou vendido para carne.'],
    ['Pró-labore', 'Retirada mensal dos sócios como remuneração pelo trabalho na empresa.'],
    ['Minuta', 'Ficha/documento de uma viagem de frete. No sistema, o cadastro da viagem é o principal; a minuta é só a versão impressa.']
  ];

  // ---------- termos gerais (texto exato, minúsculo) ----------
  const TERMOS = {
    // menu
    'administrativo': 'Telas comuns a todas as empresas, com os dados misturados: Painel, Rotina, Lançamentos, Funcionários, Contas a pagar, Todas Dívidas e o Fluxo Consolidado.',
    'empresas': 'Cada empresa do grupo tem o seu quadrado com o que é só dela: fluxo de caixa, dívidas, estoque e a tela própria quando existe.',
    'painel': 'Resumo de tudo que precisa de atenção hoje e nos próximos 30 dias, mais o saldo do mês de cada empresa.',
    'rotina': 'Checklist do que a secretária faz todo dia, semana e mês. Clique no passo para abrir a tela onde ele é preenchido.',
    'lançamentos': 'Onde se lança cada entrada e saída de dinheiro de cada empresa. Alimenta o Fluxo de Caixa.',
    'funcionários': 'Cadastro, dias trabalhados, programação semanal, férias, adiantamentos e folha de pagamento.',
    'contas a pagar': 'Boletos e contas de cada empresa com vencimento. Ao marcar como paga, gera o lançamento no Fluxo de Caixa.',
    'todas dívidas': 'Parcelas de financiamento de todas as empresas juntas, por ordem de vencimento.',
    'fluxo consolidado': 'Fluxo de caixa de todas as empresas somadas, mês a mês.',
    'calculadora': 'Simula se compensa vender o gado agora ou segurar mais alguns dias engordando.',
    'guia do sistema': 'Explica o que cada empresa faz, as siglas, o plano de contas e como os dados entram no sistema.',
    'fluxo de caixa': 'Mês a mês: o que entrou, o que saiu e o saldo acumulado, com os meses futuros previstos.',
    'dívidas': 'Financiamentos bancários e as parcelas até a quitação.',
    'estoque': 'Estoque de vacinas e produtos veterinários.',

    // genéricos de formulário
    'data': 'Dia em que o fato aconteceu.',
    'valor': 'Valor em reais (R$). Pode usar ponto ou vírgula para os centavos.',
    'valor total': 'Valor final em reais (R$) do lançamento ou do contrato.',
    'observação': 'Campo livre para qualquer detalhe que ajude a lembrar depois. Não é obrigatório.',
    'empresa': 'Empresa do grupo à qual este registro pertence. É por ela que aparece nos relatórios.',
    'descrição': 'Texto curto dizendo do que se trata.',
    'quantidade': 'Quantas unidades (cabeças, kg, litros...).',
    'nome': 'Nome pelo qual o item será encontrado nas listas.',
    'unidade': 'Como o item é medido: kg, litro, saco, tonelada...',
    'status': 'Situação atual do registro.',
    'tipo': 'Classificação do registro.',
    'banco': 'Banco ou cooperativa de crédito que concedeu o dinheiro.',
    'fazenda': 'Fazenda ou propriedade a que se refere.',
    'lote': 'Grupo de animais (ou curral) que ficam juntos.',
    'produto': 'Nome do produto.',
    'insumo': 'Ingrediente ou material usado na produção ou na alimentação.',
    'movimento': 'Tipo de movimentação do estoque ou do dinheiro.',
    'categoria': 'Fase de vida do animal (bezerra, novilha, vaca, touro...).',
    'brinco': 'Número de identificação preso na orelha do animal.',
    'raça': 'Raça ou cruzamento do animal.',
    'idade': 'Idade calculada pela data de nascimento.',
    'peso': 'Peso do animal em kg.',
    'situação': 'Situação reprodutiva (prenhe, vazia, inseminada...) ou situação do registro.',
    'sexo': 'F = fêmea, M = macho.',
    'detalhe': 'Informação extra sobre o evento.',
    'ocupante': 'Quem está usando a fazenda: normalmente outra empresa do grupo (ex.: Top Boi).',

    // botões comuns
    'cadastrar': 'Salva o cadastro novo.',
    'registrar': 'Salva o registro e atualiza as telas.',
    'salvar': 'Grava as informações digitadas.',
    'limpar': 'Apaga o que foi digitado no formulário.',
    'adicionar': 'Inclui na lista.',
    'ver parcelas': 'Abre a lista de parcelas desse financiamento, com vencimento, valor e se já foi paga.',
    'encerrar': 'Marca a ocupação como terminada a partir de hoje.',
    'demitir': 'Marca o funcionário como desligado. O histórico fica guardado.',
    'editar': 'Abre os dados do funcionário no formulário de cima para você alterar nome, cargo, empresa, admissão ou salário.',
    'salvar alterações': 'Grava as mudanças feitas no cadastro. O histórico (dias, férias, adiantamentos) não é alterado.',
    'cancelar edição': 'Desiste da alteração e volta o formulário para o modo de novo cadastro.',
    'reativar': 'Traz de volta o funcionário ou item que estava desativado.'
  };

  // ---------- explicações que mudam conforme a tela ----------
  const POR_PAGINA = {
    painel: {
      'atenção hoje': 'Tudo que já venceu ou vence hoje: contas, parcelas de financiamento, manutenção de máquina atrasada, partos previstos e vacinas atrasadas do Top Vacas. Clique numa linha para abrir a tela correspondente.',
      'atenção — próximos 30 dias': 'O que vai vencer nos próximos 30 dias. Serve para se programar antes de virar atraso.',
      'saldo do mês por empresa': 'Despesas, receitas e saldo de cada empresa no mês atual, a partir dos lançamentos.',
      'próximos vencimentos (30 dias)': 'Contas a pagar e parcelas de financiamento que vencem nos próximos 30 dias (e as já vencidas e não pagas).',
      'saídas do mês (todas empresas)': 'Despesas + investimentos lançados no mês, de todas as empresas.',
      'entradas do mês (todas empresas)': 'Receitas lançadas no mês, de todas as empresas.',
      'saldo do mês': 'Entradas menos saídas do mês, de todas as empresas.',
      'a vencer em 30 dias': 'Soma das contas a pagar e parcelas de financiamento pendentes até daqui a 30 dias.',
      'despesas': 'Total de despesas e investimentos do mês da empresa.',
      'receitas': 'Total de receitas do mês da empresa.',
      'saldo': 'Receitas menos despesas do mês da empresa.',
      'vencimento': 'Data em que a conta ou parcela vence.'
    },
    lancamentos: {
      'novo lançamento': 'Cada linha de dinheiro que entrou ou saiu (extrato, nota ou recibo). O sistema guarda cada lançamento inteiro, não só o total, e soma por categoria na hora de mostrar o Painel, o Fluxo de Caixa e a lista do mês.',
      'empresa': 'Empresa dona do dinheiro: quem pagou (despesa) ou quem recebeu (receita).',
      'data': 'Dia em que o dinheiro entrou ou saiu (a data do pagamento, não a da compra).',
      'tipo': 'Despesa = gasto do dia a dia. Investimento = vira patrimônio ou é empréstimo/aplicação. Receita = dinheiro que entrou. Troque o tipo para ver as contas certas.',
      'conta': 'É a categoria do lançamento, no plano de contas da empresa (ex.: 10 — banco). É por ela que o sistema entende o gasto: se escolher a conta errada, o valor vai para a categoria errada, mesmo com o valor certo. Só aparecem as contas da empresa e do tipo escolhidos.',
      'histórico': 'Descrição do que foi: "Tarifa BB", "Frete de gado", "Pagamento João".',
      'quantidade': 'Quantas unidades foram compradas ou vendidas. Opcional; se preencher junto com o valor unitário, o valor total é calculado.',
      'valor unitário': 'Preço de uma unidade. Opcional.',
      'valor total': 'Quanto saiu ou entrou no total, em reais. Este é o valor que conta nos relatórios.',
      'fornecedor / comprador': 'Para quem foi pago (despesa) ou de quem veio o dinheiro (receita).',
      'salvar lançamento': 'Grava o lançamento. Ele entra nas somas da categoria escolhida e passa a contar no Fluxo de Caixa e no Painel.',
      'lançamentos do mês': 'Lista do mês escolhido. Abre sozinho no último mês que tem lançamento.',
      'tipo|th': 'Despesa, investimento ou receita.',
      'despesas': 'Soma das despesas do mês.',
      'investimentos': 'Soma dos investimentos do mês (compra de gado, terra, empréstimos...).',
      'receitas': 'Soma das receitas do mês.',
      'saldo do mês': 'Receitas menos despesas e investimentos.',
      'valor': 'Valor do lançamento em reais.'
    },
    contaspagar: {
      'contas do mês': 'Contas cadastradas, com vencimento e se já foram pagas.',
      'contas fixas': 'Contas que se repetem todo mês (luz, internet, folha). Cadastre uma vez e gere por mês.',
      'nova conta': 'Cadastra um boleto ou conta a pagar.',
      'conta (plano de contas)': 'Categoria de despesa da empresa. Obrigatória: é ela que será usada no lançamento quando a conta for paga.',
      'prestador': 'Quem vai receber: fornecedor, banco ou prestador de serviço.',
      'vencimento': 'Data limite de pagamento.',
      'valor': 'Valor a pagar em reais.',
      'forma de pagamento': 'Boleto, Pix, transferência, cartão...',
      'dados da conta / código de barras': 'Código de barras do boleto, linha digitável ou dados bancários para pagar.',
      'dados da conta / chave pix': 'Chave Pix ou dados bancários do prestador, para facilitar o pagamento todo mês.',
      'motivo': 'Para que serve a conta (ex.: energia da sede, salário de março).',
      'dia de vencimento': 'Dia do mês em que vence (de 1 a 31). Em meses mais curtos usa o último dia.',
      'valor (deixe em branco se variar todo mês)': 'Valor fixo mensal. Se variar (como a conta de luz), deixe vazio e digite quando a conta chegar.',
      'mês': 'Mês para o qual gerar as contas fixas.',
      'gerar contas desse mês': 'Cria uma conta a pagar para cada conta fixa ativa naquele mês. Pode clicar mais de uma vez: não duplica.',
      'salvar conta': 'Grava a conta a pagar.',
      'salvar conta fixa': 'Grava a conta fixa para ser gerada todo mês.',
      'status': 'Pendente ou paga. Ao marcar como paga, o sistema cria o lançamento no Fluxo de Caixa.',
      'dia': 'Dia do mês em que a conta fixa vence.'
    },
    dividas: {
      'novo financiamento': 'Cadastra um empréstimo com parcelas fixas (tabela Price). Para cronogramas irregulares, avise quem mantém o sistema.',
      'empresa': 'Empresa que tomou o empréstimo e vai pagar as parcelas.',
      'banco': 'Instituição que concedeu o crédito: BB, BNB, SICREDI, SICOOB...',
      'data da contratação': 'Dia em que o contrato foi assinado.',
      'valor total': 'Valor emprestado (principal). Se for editar um valor existente, use o lápis ao lado do valor.',
      'taxa de juros (% ao ano)': 'Juros do contrato, em % ao ano. Usada para calcular a parcela.',
      'número de parcelas': 'Em quantas parcelas será pago.',
      'vencimento da 1ª parcela': 'Data da primeira parcela. As demais vêm mês a mês.',
      'descrição': 'Para que serve o empréstimo (ex.: financiamento de trator, custeio).',
      'salvar financiamento e gerar parcelas': 'Grava o financiamento e cria todas as parcelas.',
      'taxa a.a.': 'Juros do contrato em % ao ano.',
      'parcela': 'Valor da próxima parcela a pagar.',
      'saldo devedor': 'Soma das parcelas que faltam pagar. Inclui juros, por isso pode ser maior que o valor contratado.',
      '#': 'Número da parcela.',
      'vencimento': 'Data em que a parcela vence.',
      'valor': 'Valor da parcela (principal + juros). Use o lápis para corrigir, com confirmação.',
      'status': 'Pendente ou paga. Ao pagar, informe a data no formato 22/10/2026.'
    },
    todasdividas: {
      'saldo devedor total': 'Soma das parcelas pendentes de todos os financiamentos de todas as empresas (inclui juros).',
      'vencido e não pago': 'Parcelas com data anterior a hoje que ainda não foram marcadas como pagas. Pode incluir parcelas já pagas na prática, mas não marcadas aqui.',
      'parcelas pendentes': 'Quantidade de parcelas que ainda faltam pagar.',
      'vencimento': 'Data da parcela. Em vermelho: já venceu e não foi marcada como paga.',
      '#': 'Número da parcela dentro do financiamento.',
      'descrição': 'Descrição do financiamento ao qual a parcela pertence.',
      'valor': 'Valor da parcela. O lápis permite corrigir, com confirmação.',
      'status': 'Pendente, atrasada ou paga.'
    },
    fluxocaixa: {
      'saldo inicial (ponto de partida do acumulado)': 'Dinheiro que a empresa tinha quando o controle começou. O saldo acumulado dos meses parte desse valor.',
      'valor': 'Saldo em reais na data de referência.',
      'data de referência': 'Dia a que corresponde esse saldo inicial.',
      'mês': 'Mês analisado. Os 3 passados mostram o realizado e os 12 seguintes mostram o previsto.',
      'receitas': 'Dinheiro que entrou no mês.',
      'despesas + investimentos': 'Tudo que saiu no mês, já lançado. Passe o mouse no valor para ver quanto é despesa e quanto é investimento.',
      'saídas previstas (a pagar/parcelas)': 'Contas a pagar e parcelas de financiamento ainda não pagas, nos meses futuros.',
      'saldo do mês': 'Receitas menos todas as saídas do mês.',
      'saldo acumulado': 'Saldo inicial somado aos saldos de todos os meses até este.',
      'saldo acumulado (mês atual)': 'Quanto deve ter em caixa hoje, segundo os lançamentos.',
      'menor saldo projetado (próx. 12 meses)': 'O pior saldo acumulado previsto nos próximos 12 meses. Se for negativo, falta dinheiro.',
      'mês mais apertado': 'Mês em que o saldo acumulado previsto fica mais baixo.',
      'salvar': 'Grava o saldo inicial desta empresa.'
    },
    fretes: {
      'nova viagem': 'Cada viagem de frete é um cadastro. A minuta impressa é só a versão em papel dele.',
      'nº da minuta': 'Número do documento da viagem.',
      'empresa': 'Empresa transportadora que fez o frete (normalmente a Pontual e Lima).',
      'cliente': 'Quem contratou o frete.',
      'cpf': 'CPF do cliente.',
      'telefone': 'Telefone para contato.',
      'forma de pagamento': 'Como o cliente vai pagar: Pix, dinheiro, boleto...',
      'data de embarque': 'Dia em que a carga saiu.',
      'data de entrega': 'Dia em que a carga chegou.',
      'cidade de coleta': 'Onde a carga foi buscada.',
      'cidade de entrega': 'Para onde a carga foi levada.',
      'km inicial': 'Quilometragem do caminhão ao sair.',
      'km final': 'Quilometragem do caminhão ao chegar.',
      'valor por km': 'Quanto se cobra por quilômetro rodado.',
      'adicionais (pedágio etc.)': 'Extras cobrados do cliente: pedágio, balsa, diária.',
      'valor total': 'Valor final da viagem (KM rodados × valor por KM + adicionais).',
      'salvar viagem': 'Grava a viagem.',
      'minuta': 'Número do documento da viagem.',
      'trajeto': 'Cidade de coleta e cidade de entrega.',
      'status': 'Situação do pagamento da viagem.'
    },
    funcionarios: {
      'funcionários': 'Cadastro das pessoas que trabalham no grupo, com a empresa de cada uma e o salário base.',
      'dias trabalhados': 'Marca por dia se cada funcionário trabalhou, faltou, folgou, estava de férias etc.',
      'programação semanal': 'O que foi programado e o que foi realizado por dia, por funcionário.',
      'férias': 'Controle dos períodos de férias.',
      'folha de pagamento': 'Cálculo mensal por funcionário: salário, acréscimos, adiantamentos descontados, líquido e quanto já foi pago.',
      'novo funcionário': 'Cadastra uma pessoa nova.',
      'nome': 'Nome completo do funcionário.',
      'cargo': 'Função: vaqueiro, tratorista, motorista, secretária...',
      'empresa / fazenda': 'Empresa do grupo em que ele trabalha. Define em qual cartão da folha aparece.',
      'data de admissão': 'Dia em que começou a trabalhar.',
      'salário': 'Salário base mensal em reais. Entra pré-preenchido na folha e pode ser ajustado mês a mês.',
      'funcionário': 'Escolha o funcionário.',
      'período aquisitivo — início': 'Começo dos 12 meses de trabalho que dão direito às férias.',
      'período aquisitivo — fim': 'Fim desses 12 meses.',
      'início do gozo': 'Primeiro dia em que o funcionário vai tirar as férias.',
      'fim do gozo': 'Último dia das férias.',
      'dias': 'Quantos dias de férias (normalmente 30).',
      'data': 'Dia em que o adiantamento foi dado.',
      'valor': 'Valor do adiantamento em reais.',
      'descrição': 'Motivo do adiantamento (ex.: adiantamento de salário, vale).',
      'programada': 'O que estava planejado para o dia.',
      'realizada': 'O que de fato foi feito no dia.',
      'registrar férias': 'Grava o período de férias.',
      'registrar adiantamento': 'Grava o adiantamento. Ele será descontado automaticamente na próxima folha.',
      'acréscimo': 'Valor a somar no salário do mês (hora extra, comissão, gratificação).',
      'horas': 'Horas trabalhadas, só para registro (não entram no cálculo do líquido).',
      'descontos (adiant.)': 'Adiantamentos pendentes que serão descontados nesta folha. Vem preenchido sozinho.',
      'líquido': 'O que o funcionário recebe: salário + acréscimo − descontos.',
      'valor pago': 'Quanto já foi pago neste mês (ex.: a primeira parte).',
      'restante': 'Líquido menos o que já foi pago.',
      'marcar descontado': 'Marca o adiantamento como já descontado, sem esperar a folha.',
      'gerar conta a pagar': 'Soma o líquido salvo da empresa e cria uma conta a pagar única. Quando for paga, o lançamento entra no Fluxo de Caixa.',
      'situação': 'Adiantamento: pendente (ainda não descontado) ou descontado.',
      'status': 'Ativo, de férias, afastado ou demitido.'
    },
    limabank: {
      'novo movimento': 'Registra dinheiro que passou pelo Lima Bank: empréstimo entre empresas ou movimento com banco externo.',
      'direção': 'Quem deu o dinheiro e quem recebeu: Lima Bank emprestou para empresa, empresa devolveu, recebido de banco externo ou pago para banco externo.',
      'empresa': 'Empresa que recebeu ou devolveu o dinheiro.',
      'banco externo': 'Banco de fora do grupo (SICOOB, SICREDI...) quando o movimento é com banco.',
      'valor': 'Valor do movimento em reais.',
      'situação por empresa': 'Quanto cada empresa já recebeu do Lima Bank, quanto devolveu e quanto ainda deve (ou tem a receber).',
      'recebeu do lima bank': 'Total emprestado a esta empresa.',
      'devolveu ao lima bank': 'Total devolvido por esta empresa.',
      'situação': 'Devendo ao Lima Bank ou com saldo a receber.',
      'de': 'Quem enviou o dinheiro.',
      'para': 'Quem recebeu o dinheiro.',
      'salvar movimento': 'Grava o movimento no controle do Lima Bank. Atenção: ele não cria lançamento nas empresas; para aparecer no Fluxo de Caixa de cada uma, lance também em Lançamentos.'
    },
    maquinas: {
      'uso diário': 'Horas que cada máquina trabalhou por dia e para qual empresa. Alimenta o faturamento do mês por empresa (não cria lançamento sozinho).',
      'abastecimento': 'Combustível colocado em cada máquina.',
      'manutenção': 'Revisões e consertos, com a hora da próxima.',
      'relatório': 'Receita e custos por máquina.',
      'cadastrar máquina': 'Cadastra um trator, carregadeira ou implemento.',
      'nome': 'Nome ou modelo da máquina (ex.: trator A750).',
      'tipo': 'Trator, carregadeira, caminhão, implemento...',
      'máquina': 'Qual máquina.',
      'empresa beneficiada': 'Empresa para quem o serviço foi feito. É ela quem será cobrada pelas horas.',
      'data': 'Dia do serviço.',
      'responsável': 'Operador ou motorista da máquina no dia.',
      'serviço': 'O que foi feito (gradagem, plantio, transporte de silagem...).',
      'horímetro inicial': 'Leitura do contador de horas ao começar.',
      'horímetro final': 'Leitura do contador de horas ao terminar. A diferença são as horas trabalhadas.',
      'valor da hora (r$)': 'Preço cobrado por hora de trabalho. Horas × valor = valor a faturar.',
      'quantidade (litros)': 'Litros de combustível colocados.',
      'valor pago (r$)': 'Quanto custou o abastecimento.',
      'observação': 'Detalhe livre.',
      'data da manutenção': 'Dia em que a manutenção foi feita.',
      'horímetro na hora da manutenção': 'Leitura do contador de horas no dia da manutenção.',
      'serviço realizado': 'O que foi trocado ou consertado (óleo, filtros, correia...).',
      'prazo (horas)': 'De quantas em quantas horas essa manutenção deve se repetir.',
      'horímetro da próxima manutenção': 'Horímetro em que a próxima deve ser feita. O Painel avisa quando está perto ou passou.',
      'valor da manutenção (r$)': 'Quanto custou a manutenção.',
      'valor a faturar': 'Horas usadas × valor da hora: o que a Máquinas deve cobrar daquela empresa.',
      'horas usadas': 'Total de horas de trabalho no mês para a empresa.',
      'receita do mês': 'Total faturado pelas máquinas no mês.',
      'abastecimento do mês': 'Gasto com combustível no mês.',
      'manutenção do mês': 'Gasto com manutenção no mês.',
      'saldo do mês': 'Receita menos abastecimento e manutenção.',
      'próxima em': 'Horímetro previsto da próxima manutenção.',
      'litros': 'Litros de combustível.',
      'horímetro': 'Leitura do contador de horas.',
      'horas': 'Horas trabalhadas.',
      'valor': 'Valor em reais.'
    },
    fabricasal: {
      'fórmulas': 'Receitas do sal: quais insumos e quantas quilos de cada entram em cada produto.',
      'produção': 'Lotes de sal fabricados. Cada produção desconta automaticamente os insumos do estoque.',
      'consumo por fazenda (r$)': 'Quanto cada fazenda consumiu de sal, em kg e em reais.',
      'consumo por manga': 'Acompanhamento do cocho: quanto de sal foi fornecido e sobrou em cada manga, e o consumo por cabeça por dia.',
      'vendas': 'Sal vendido para empresas do grupo.',
      'estoque de insumos': 'Quanto resta de cada ingrediente (soja, DDG, ureia, calcário...).',
      'nome da fórmula': 'Nome ou número da fórmula (ex.: Fórmula 1). Na produção você escolhe só o nome e ela já traz os insumos.',
      'produto': 'Sal produzido por essa fórmula (ex.: sal mineral, proteinado).',
      'insumos dessa fórmula': 'Ingredientes e quantidade de cada um para um lote da fórmula.',
      'fórmula': 'Fórmula usada. Ao escolher, os insumos aparecem preenchidos.',
      'data': 'Dia do registro.',
      'lote (kg)': 'Quantos kg de sal foram produzidos.',
      'custo total': 'Quanto custou produzir o lote.',
      'insumos usados': 'Ingredientes consumidos. Podem ser ajustados; o estoque é descontado pelo que estiver aqui.',
      'fazenda que consumiu': 'Fazenda que recebeu o sal.',
      'quantidade (kg)': 'Quilos de sal.',
      'valor': 'Valor em reais.',
      'fazenda': 'Fazenda do consumo.',
      'manga / curral': 'Divisão onde o gado está recebendo o sal.',
      'qtde. de cabeças na manga': 'Quantos animais estão naquela manga.',
      'quantidade fornecida (kg)': 'Quilos de sal colocados no cocho.',
      'resíduo de cocho (kg)': 'Quilos que sobraram no cocho. Consumo = fornecido − resíduo.',
      'empresa compradora': 'Empresa do grupo que comprou o sal.',
      'insumo': 'Ingrediente.',
      'nome': 'Nome do insumo.',
      'unidade': 'Como o insumo é medido (kg, saco...).',
      'tipo': 'Entrada (compra) ou saída (uso) do estoque.',
      'intervalo': 'Dias desde o registro anterior da mesma manga.',
      'consumo (kg/cab./dia)': 'Quanto cada cabeça consumiu por dia: (fornecido − resíduo) ÷ (dias × cabeças).',
      'quantidade atual': 'Quanto há em estoque agora.',
      'custo': 'Custo do lote.',
      'cabeças': 'Número de animais.',
      'fornecido (kg)': 'Sal colocado no cocho.',
      'resíduo (kg)': 'Sobra no cocho.',
      'adicionar insumo': 'Inclui mais uma linha de ingrediente na fórmula/produção.',
      'salvar fórmula': 'Grava a fórmula com seus insumos.',
      'salvar produção': 'Grava a produção e desconta os insumos do estoque.',
      'registrar consumo': 'Grava o consumo de sal.',
      'salvar venda': 'Grava a venda.'
    },
    estoque: {
      'novo movimento': 'Entrada ou saída de vacinas e produtos veterinários.',
      'empresa': 'Empresa dona do estoque.',
      'produto': 'Nome da vacina ou medicamento.',
      'tipo': 'Entrada (chegou/comprou) ou saída (usou).',
      'quantidade': 'Quantas doses ou frascos.',
      'estoque atual': 'Saldo atual de cada produto.',
      'quantidade atual': 'Quanto há em estoque agora.',
      'movimentos': 'Histórico de todas as entradas e saídas.'
    },
    terras: {
      'lista de fazendas': 'Todas as fazendas cadastradas, com área e capacidade.',
      'cadastrar fazenda': 'Cadastra uma fazenda nova.',
      'ocupação': 'Quem está usando cada fazenda e quanto da capacidade está ocupado.',
      'faturamento por pasto': 'Cobrança do pasto por fazenda. Cada lançamento gera uma receita real no Fluxo de Caixa.',
      'nome da fazenda': 'Nome da fazenda.',
      'proprietário': 'Dono da propriedade.',
      'atividade exercida': 'O que se faz nela (cria, recria, engorda...).',
      'capacidade (animais)': 'Quantas cabeças a fazenda comporta. É a base do cálculo de % ocupado.',
      'área total (ha)': 'Tamanho total em hectares.',
      'área produtiva (ha)': 'Área realmente usada para pasto ou lavoura, sem mata, estrada, sede.',
      'município': 'Município onde fica.',
      'estado': 'Sigla do estado (MG, GO...).',
      'ocupante': 'Quem usa a fazenda (ex.: Top Boi, Confinamento).',
      'quantidade de cabeças': 'Quantos animais estão na fazenda.',
      'data de início': 'Dia em que o ocupante começou a usar.',
      'valor mensal (pasto)': 'Valor combinado por mês pelo pasto. Opcional.',
      'ocupação (opcional)': 'Se a cobrança é de uma ocupação cadastrada, escolha aqui para ficar ligada a ela.',
      'valor': 'Valor cobrado em reais.',
      'registrar ocupação': 'Grava a ocupação.',
      'registrar (gera lançamento de receita)': 'Grava o faturamento e já lança a receita "pasto" de Terras no Fluxo de Caixa.',
      'ocupação atual': 'Cabeças ocupando agora (ocupações sem data de fim).',
      '% ocupado': 'Ocupação atual ÷ capacidade. Amarelo a partir de 80%, vermelho em 100%.',
      'capacidade': 'Quantas cabeças a fazenda comporta.',
      'total faturado': 'Soma de tudo que foi cobrado dessa fazenda.',
      'fim': 'Dia em que a ocupação terminou. "Ativa" = ainda ocupando.',
      'total faturado (histórico)': 'Soma de todos os faturamentos de pasto já lançados.',
      'atividade': 'O que se faz na fazenda.',
      'início': 'Dia em que começou.',
      'cabeças': 'Número de animais.',
      'valor mensal': 'Valor mensal combinado pelo pasto.'
    },
    topvacas: {
      'painel': 'Resumo do rebanho: quantos animais, partos previstos e vacinas atrasadas.',
      'rebanho': 'Lista de todos os animais ativos e cadastro de animal novo.',
      'bezerras': 'Acompanhamento das crias: colostro, vacina B19 e desmama.',
      'reprodução': 'Inseminação, diagnóstico, parto e aborto. Cada evento atualiza a situação da vaca sozinho.',
      'sanidade': 'Protocolo de vacinas e manejos e tratamentos individuais.',
      'nutrição': 'Estoque de insumos e a dieta de cada lote.',
      'brinco': 'Número do brinco do animal. Não pode repetir.',
      'sexo': 'F = fêmea, M = macho.',
      'categoria': 'Bezerra/bezerro (até desmamar), novilha (jovem que ainda não pariu), vaca ou touro.',
      'mãe': 'Vaca que deu à luz este animal, se estiver cadastrada.',
      'pai': 'Touro ou código do sêmen. No parto, vem do touro da última inseminação.',
      'lote': 'Grupo de manejo: cria, recria, reprodução, engorda.',
      'peso (kg)': 'Peso em kg.',
      'animal (fêmea)': 'Fêmea que passou pelo evento.',
      'tipo': 'Inseminação, monta natural, diagnóstico positivo ou negativo, cio observado, parto ou aborto.',
      'touro / sêmen': 'Touro ou palheta usada na inseminação ou monta.',
      'detalhe': 'Informação extra do evento.',
      'brinco da cria': 'Só no parto: número do brinco do bezerro. Se preencher, a cria é cadastrada sozinha.',
      'sexo da cria': 'Fêmea (vira bezerra) ou macho (vira bezerro).',
      'peso ao nascer (kg)': 'Peso do bezerro ao nascer.',
      'animal': 'Animal que recebeu o tratamento.',
      'doença': 'O que foi tratado.',
      'medicamento': 'Remédio aplicado.',
      'data início': 'Primeiro dia do tratamento.',
      'dias de aplicação': 'Quantos dias durou a aplicação.',
      'carência (carne, dias)': 'Dias de espera depois do tratamento antes de poder vender o animal para abate.',
      'preço': 'Preço por unidade do insumo.',
      'valor unitário': 'Preço por unidade nesta compra.',
      'kg/cabeça/dia': 'Quantos kg desse insumo cada animal do lote come por dia.',
      'colostro': 'Se a cria mamou o primeiro leite (colostro), que dá as defesas.',
      'vacina b19': 'Data da vacina contra brucelose.',
      'desmama': 'Data em que a cria deixou de mamar.',
      'última ia': 'Data da última inseminação ou cobertura.',
      'touro': 'Touro ou sêmen da última cobertura.',
      'parto previsto': 'Última inseminação + 283 dias, só para vacas prenhes.',
      'previsão': 'Data prevista do parto.',
      'atraso': 'Quantos dias passou da frequência do manejo.',
      'última aplicação': 'Data da última vez que o manejo foi feito.',
      'frequência': 'De quantos em quantos dias o manejo se repete.',
      'liberação': 'Data a partir da qual o animal pode ser vendido para abate (início + dias + carência).',
      'aplicar hoje': 'Marca o manejo como feito hoje.',
      'marcar': 'Marca a data de hoje.',
      'desmamar': 'Marca a desmama de hoje.',
      'definir': 'Grava a quantidade da dieta para o lote e o insumo.',
      'estoque': 'Quanto há do insumo agora.',
      'animais ativos': 'Animais que ainda estão no rebanho.'
    },
    confinamento: {
      'lotes': 'Cadastro dos lotes/currais. Cadastre uma vez e use sempre que entrar gado.',
      'gado no cocho': 'Entrada e saída de gado, com o total que está no cocho agora.',
      'volumoso': 'Produção, consumo e estoque de silagem e outros volumosos.',
      'nome do lote': 'Nome do lote ou curral (ex.: Lote 01, Curral A).',
      'observação': 'Detalhe livre.',
      'lote': 'Lote ou curral que recebeu o gado.',
      'data de entrada': 'Dia em que o gado entrou.',
      'quantidade (cabeças)': 'Quantos animais entraram.',
      'peso médio de entrada (kg)': 'Peso médio dos animais ao entrar.',
      'nome': 'Nome do tipo de volumoso (ex.: silagem de milho).',
      'unidade': 'Como o volumoso é medido (kg, tonelada).',
      'tipo de volumoso': 'Qual volumoso.',
      'movimento': 'Produção (entra no estoque), consumo (sai) ou ajuste (corrige o saldo para o valor digitado).',
      'quantidade': 'Quanto foi produzido, consumido ou o novo saldo (no ajuste).',
      'saída': 'Registra que parte desse gado saiu (venda, frigorífico, transferência). O sistema desconta do cocho.',
      'gado no cocho agora': 'Cabeças que entraram menos as que já saíram.',
      'entradas ativas': 'Entradas que ainda têm gado.',
      'total já entrou': 'Total de cabeças que já entraram.',
      'total já saiu': 'Total de cabeças que já saíram.',
      'cabeças entrada': 'Quantos animais entraram nessa entrada.',
      'peso médio entrada': 'Peso médio na entrada.',
      'no cocho agora': 'Cabeças dessa entrada que ainda estão no confinamento.',
      'peso médio': 'Peso médio na saída.',
      'destino': 'Para onde o gado foi (venda, frigorífico...).',
      'estoque atual': 'Quanto há de cada volumoso agora.',
      'entrada': 'Data da entrada.'
    },
    calculadora: {
      'simulação': 'Compara vender o lote hoje com segurar mais alguns dias engordando.',
      'empresa': 'Empresa dona do lote. Usa o ganho de peso e o custo cadastrados para ela.',
      'categoria do animal': 'Tipo de animal (boi, vaca, garrote...), para escolher o custo diário certo.',
      'peso atual (kg)': 'Peso vivo médio hoje.',
      'preço da arroba hoje (r$)': 'Preço de uma arroba (15 kg de carcaça) hoje.',
      'dias adicionais de engorda a simular': 'Por quantos dias a mais você pensa em segurar o lote.',
      'custo diário por cabeça (r$)': 'Quanto custa alimentar e manter um animal por dia.',
      'calcular': 'Faz a simulação e mostra qual opção rende mais.',
      'parâmetros por empresa': 'Dados de base que a calculadora usa: ganho de peso e custo diário de cada empresa.',
      'mês início': 'Primeiro mês do período em que o ganho vale.',
      'mês fim': 'Último mês do período.',
      'gramas por dia': 'Ganho de peso esperado por animal por dia, em gramas (g/dia).',
      'g/dia': 'Gramas de ganho de peso por dia.',
      'categoria': 'Tipo de animal.',
      'custo/dia/cabeça': 'Custo diário por animal em reais.',
      'vigente desde': 'A partir de quando esse custo vale.',
      'vender agora': 'Valor que o lote rende se for vendido hoje.',
      'adicionar período': 'Inclui um período de ganho de peso.',
      'adicionar': 'Inclui na lista.'
    },
    rotina: {
      'rotina': 'Checklist da secretária: diário, semanal, mensal e conforme demanda. Marque cada passo ao concluir.'
    }
  };


  // ---------- complementos: títulos de cartões e itens que faltavam ----------
  const EXTRAS = {
    'bezerra': 'Fêmea recém-nascida até a desmama e um pouco depois.',
    'bezerro': 'Macho recém-nascido até a desmama e um pouco depois.',
    'novilha': 'Fêmea jovem que ainda não pariu.',
    'vaca': 'Fêmea adulta que já pariu.',
    'touro': 'Macho reprodutor.',
    'todos': 'Mostra tudo, sem filtro.',
    'histórico': 'Lista do que já foi registrado, do mais recente para o mais antigo.',
    'movimentos': 'Histórico de todas as entradas, saídas e ajustes.',
    'estoque atual': 'Quanto há de cada item agora.',
    'início': 'Data em que começou.',
    'grupo': 'Grupo de animais a que se aplica.',
    'manejo': 'Vacina, exame ou cuidado de rotina do rebanho.',
    'nascimento': 'Data de nascimento.',
    'data de nascimento': 'Dia em que o animal nasceu. Usada para calcular a idade.',
    'município/uf': 'Município e estado onde fica.',
    'área total': 'Tamanho total em hectares (ha).',
    'área produtiva': 'Área realmente usada, sem mata, estrada e sede.',
    'fornecedor/comprador': 'Para quem foi pago (despesa) ou de quem veio o dinheiro (receita).',
    'rotina diária': 'O que fazer todos os dias.',
    'rotina semanal': 'O que fazer uma vez por semana.',
    'rotina mensal': 'O que fazer uma vez por mês, normalmente no começo do mês.',
    'conforme demandas': 'Tarefas que só são feitas quando surge a necessidade.',
    'semana': 'Semana do mês (sempre termina no domingo).',
    'admissão': 'Data em que o funcionário começou a trabalhar.',
    'lançamento do dia': 'Marca a situação de cada funcionário no dia escolhido (trabalhou, faltou, folga...).',
    'grade do mês': 'Visão do mês inteiro, dia a dia, de todos os funcionários.',
    'ver grade do mês inteiro': 'Abre a grade do mês com todos os funcionários.',
    'ver mês inteiro': 'Abre o mês inteiro desse funcionário.',
    'nova férias': 'Registra um período de férias.',
    'período aquisitivo': '12 meses de trabalho que dão direito às férias.',
    'gozo': 'Período em que o funcionário realmente tira as férias.',
    'novo adiantamento': 'Registra dinheiro dado antes do dia de pagamento. Será descontado na folha.',
    'adiantamentos': 'Adiantamentos de salário: pendente até ser descontado na folha.',
    'contas cadastradas': 'Contas do mês escolhido, com vencimento e status.',
    'nova conta fixa': 'Cadastra uma conta que se repete todo mês.',
    'gerar contas do mês': 'Cria as contas a pagar do mês a partir das contas fixas.',
    'contas fixas cadastradas': 'Lista das contas fixas. Dá para pausar uma sem apagar.',
    'todas as dívidas': 'Parcelas de financiamento de todas as empresas, por ordem de vencimento.',
    'calculadora — vender agora ou engordar mais?': 'Compara o valor de vender hoje com o de segurar o lote mais alguns dias.',
    'detalhe da simulação': 'Passo a passo da conta: peso final, valor do boi e custo do período.',
    'ganho de peso esperado por período (g/dia)': 'Quanto cada animal costuma ganhar por dia em cada época do ano.',
    'custo diário por categoria (r$/cabeça/dia)': 'Quanto custa manter um animal por dia, por tipo de animal.',
    'custo/dia': 'Custo diário por animal em reais.',
    'explicações na tela': 'Como ligar e desligar as explicações.',
    'o que cada empresa faz': 'Resumo de cada empresa do grupo.',
    'como os dados entram e o que alimenta o quê': 'De onde vem cada número do sistema e quais telas geram lançamentos sozinhas.',
    'termos do dia a dia': 'Significado das palavras mais usadas no sistema.',
    'siglas': 'Significado das siglas que aparecem nas telas.',
    'sigla': 'Abreviação usada nas telas.',
    'significado': 'O que a sigla quer dizer.',
    'identificação': 'Dados básicos da fazenda.',
    'localização': 'Onde a fazenda fica.',
    'ocupação por fazenda': 'Quanto da capacidade de cada fazenda está ocupado hoje.',
    'nova ocupação': 'Registra quem passou a usar uma fazenda.',
    'ocupações': 'Todas as ocupações, ativas e encerradas.',
    'novo faturamento de pasto': 'Lança a cobrança do pasto de uma fazenda. Gera a receita em Lançamentos.',
    'faturamento por fazenda': 'Quanto já foi cobrado de cada fazenda.',
    'partos previstos (próximos 60 dias)': 'Vacas prenhes cujo parto previsto (inseminação + 283 dias) está chegando.',
    'manejos sanitários atrasados': 'Vacinas e manejos que passaram da frequência.',
    'novo animal': 'Cadastra um animal do rebanho.',
    'rebanho ativo': 'Animais que ainda estão no rebanho. Use o botão de saída para dar baixa.',
    'novo evento reprodutivo': 'Registra inseminação, diagnóstico, parto ou aborto. A situação da vaca é atualizada sozinha.',
    'colostro ok': 'Marque se a cria mamou o primeiro leite (colostro) logo ao nascer.',
    'situação reprodutiva do rebanho': 'Situação atual de cada fêmea: vazia, inseminada, prenhe, pós-parto.',
    'histórico de eventos': 'Todos os eventos já registrados, dos mais recentes aos mais antigos.',
    'manejos sanitários (protocolo do rebanho)': 'Calendário de vacinas e manejos do rebanho, com a frequência de cada um.',
    'novo tratamento individual': 'Registra remédio dado a um animal, com a carência antes de poder vender.',
    'tratamentos registrados': 'Tratamentos já feitos, com a data de liberação.',
    'novo insumo': 'Cadastra um alimento ou produto de estoque.',
    'estoque de insumos': 'Quanto há de cada insumo agora.',
    'movimento de estoque': 'Entrada, saída ou ajuste de um item do estoque.',
    'dieta por lote': 'Quanto de cada insumo cada animal do lote come por dia.',
    'kg/cab/dia': 'Quilos por cabeça por dia.',
    'cadastrar lote': 'Cadastra um lote ou curral novo, para ser escolhido nas entradas.',
    'lotes cadastrados': 'Lotes/currais disponíveis. Dá para renomear e pausar.',
    'nova entrada de gado': 'Registra gado que entrou no confinamento em um lote.',
    'registrar entrada': 'Grava a entrada de gado no lote escolhido.',
    'entradas em confinamento': 'Cada entrada de gado e quantas cabeças dela ainda estão no cocho.',
    'histórico de saídas': 'Gado que já saiu, com data, peso e destino.',
    'cadastrar tipo de volumoso': 'Cadastra um tipo de volumoso (silagem de milho, cana...).',
    'estoque de volumoso': 'Quanto há de cada volumoso agora.',
    'lançar produção / consumo': 'Registra volumoso produzido (entra no estoque) ou consumido (sai).',
    'novo uso': 'Registra as horas que uma máquina trabalhou.',
    'salvar uso': 'Grava o uso e calcula as horas e o valor a faturar.',
    'faturamento do mês por empresa': 'Quanto a Máquinas deve cobrar de cada empresa pelas horas do mês.',
    'histórico de uso': 'Todos os usos registrados.',
    'novo abastecimento': 'Registra combustível colocado em uma máquina.',
    'salvar abastecimento': 'Grava o abastecimento.',
    'histórico de abastecimento': 'Todos os abastecimentos registrados.',
    'nova manutenção': 'Registra uma manutenção e a hora da próxima.',
    'salvar manutenção': 'Grava a manutenção. O Painel avisa quando a próxima chegar perto.',
    'histórico de manutenção': 'Todas as manutenções registradas.',
    'relatório por máquina': 'Receita e custos de cada máquina no mês.',
    'receita x custos por máquina': 'Compara o que cada máquina faturou com o que custou em combustível e manutenção.',
    'nova fórmula': 'Cria uma fórmula (receita) de sal com seus insumos.',
    'nova produção': 'Registra um lote de sal produzido. Os insumos são descontados do estoque.',
    'novo consumo de sal por fazenda': 'Registra quanto sal cada fazenda consumiu.',
    'novo registro de cocho': 'Registra o sal fornecido e a sobra no cocho de uma manga.',
    'histórico por manga': 'Evolução do consumo de sal em cada manga.',
    'manga': 'Divisão de pasto/curral onde um grupo de animais fica.',
    'nova venda': 'Registra sal vendido a uma empresa do grupo.',
    'cadastrar insumo': 'Cadastra um ingrediente do sal.',
    'viagens': 'Todas as viagens de frete cadastradas.',
    'histórico de movimentos': 'Todos os movimentos do Lima Bank.',
    'dívidas / financiamentos': 'Financiamentos bancários e a projeção das parcelas até a quitação.',
    'financiamentos cadastrados': 'Lista dos empréstimos. O lápis ao lado do valor corrige, com confirmação.',
    'estoque de vacinas / insumos veterinários': 'Entradas e saídas de vacinas e medicamentos.',
    'fretes': 'Transporte de cargas e gado feito pela Pontual e Lima.'
  };
  Object.entries(EXTRAS).forEach(([k, v]) => { if (!TERMOS[k]) TERMOS[k] = v; });

  // ---------- menu das empresas (itens dentro de cada quadrado) ----------
  const MENU_EMPRESA = {
    'painel': 'Abre o CurralDigital, sistema próprio do Top Boi (rebanho, compras, vendas), em uma nova aba.',
    'fluxo de caixa': 'Entradas e saídas mês a mês só desta empresa.',
    'dívidas': 'Financiamentos e parcelas só desta empresa.',
    'estoque': 'Estoque de vacinas e produtos veterinários desta empresa (na Fábrica de Sal, o estoque de insumos).',
    'terras': 'Cadastro das fazendas, ocupação e faturamento por pasto.',
    'top vacas': 'Controle do rebanho de matrizes: reprodução, bezerras, sanidade e nutrição.',
    'confinamento': 'Lotes, gado no cocho e volumoso.',
    'máquinas': 'Uso diário, abastecimento, manutenção e faturamento das máquinas.',
    'fábrica de sal': 'Fórmulas, produção, consumo, vendas e estoque de insumos do sal.',
    'fretes': 'Cadastro das viagens de frete.',
    'lima bank': 'Empréstimos entre empresas e movimentos com bancos externos.'
  };

  const PADROES = [
    [/^mês de /, 'Mês de referência.'],
    [/^mês inteiro —/, 'Mês inteiro desse funcionário, dia a dia.'],
    [/^parcelas —/, 'Parcelas do financiamento escolhido. O lápis corrige o valor e o botão verde marca como paga.']
  ];

  // ---------- estado ----------
  window.AGROLIMA_AJUDA = { EMPRESAS_DESC, SIGLAS, CONCEITOS, TERMOS, POR_PAGINA, MENU_EMPRESA };

  const pagina = (location.pathname.split('/').pop() || '').replace('.html', '');

  function norm(t) {
    return (t || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/\s*\*$/, '').replace(/\s+\d+$/, '');
  }

  function buscar(texto, extra) {
    const k = norm(texto);
    if (!k) return null;
    if (extra && extra[k]) return extra[k];
    const pg = POR_PAGINA[pagina];
    if (pg && pg[k]) return pg[k];
    if (TERMOS[k]) return TERMOS[k];
    const p = PADROES.find(([re]) => re.test(k));
    return p ? p[1] : null;
  }

  function textoProprio(el) {
    const ctrl = n => n.nodeType === 1 && ['INPUT', 'SELECT', 'TEXTAREA'].includes(n.tagName);
    return [...el.childNodes].filter(n => !ctrl(n)).map(n => n.textContent).join('');
  }

  function empresaPorTexto(t) {
    return EMPRESAS_DESC[norm(t)] || null;
  }

  function marcar(el, tip) {
    if (!tip) return;
    el.classList.add('termo');
    el.dataset.tip = tip;
  }

  function tipEmpresa(d) {
    return d.resumo + ' ' + d.detalhes.slice(0, 2).join(' ') + ' (Veja o Guia do Sistema para o resto.)';
  }

  function marcarTudo(raiz) {
    if (!raiz) return;
    raiz.querySelectorAll('.sgroup-toggle').forEach(el => {
      if (el.dataset.termoOk) return; el.dataset.termoOk = '1';
      const d = empresaPorTexto(el.getAttribute('title') || el.textContent);
      if (d) marcar(el, tipEmpresa(d));
    });
    raiz.querySelectorAll('.sgroup-children .sitem').forEach(el => {
      if (el.dataset.termoOk) return; el.dataset.termoOk = '1';
      marcar(el, MENU_EMPRESA[norm(el.textContent)] || null);
    });
    raiz.querySelectorAll('.snav > .sitem, .snav-label').forEach(el => {
      if (el.dataset.termoOk) return; el.dataset.termoOk = '1';
      marcar(el, buscar(el.textContent));
    });
    raiz.querySelectorAll('.pagetitle, .cardh, .stbtn, th, .mlabel, .btn, .badge, .fgroup > label, form label').forEach(el => {
      if (el.dataset.termoOk) return; el.dataset.termoOk = '1';
      const texto = el.matches('label') ? textoProprio(el) : el.textContent;
      let tip = buscar(texto);
      if (!tip) { const d = empresaPorTexto(texto); if (d) tip = tipEmpresa(d); }
      marcar(el, tip);
    });
    raiz.querySelectorAll('td').forEach(el => {
      if (el.dataset.termoOk) return; el.dataset.termoOk = '1';
      if (el.children.length > 0 && !el.querySelector('b')) return;
      const d = empresaPorTexto(el.textContent);
      if (d) marcar(el, tipEmpresa(d));
    });
  }

  // siglas dentro do texto
  const chaves = Object.keys(SIGLAS).sort((a, b) => b.length - a.length).map(k => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const reSigla = new RegExp('(?<![A-Za-zÀ-ÿ0-9])(' + chaves.join('|') + ')(?![A-Za-zÀ-ÿ0-9])', 'g');
  const IGNORAR = new Set(['SCRIPT', 'STYLE', 'INPUT', 'TEXTAREA', 'SELECT', 'OPTION', 'ABBR', 'TITLE']);

  function marcarSiglas(raiz) {
    if (!raiz) return;
    const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, {
      acceptNode(n) {
        const p = n.parentNode;
        if (!p || IGNORAR.has(p.nodeName) || (p.closest && p.closest('.sig-tip, abbr.sig, .topbar, [contenteditable]'))) return NodeFilter.FILTER_REJECT;
        reSigla.lastIndex = 0;
        return reSigla.test(n.nodeValue) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nos = []; while (w.nextNode()) nos.push(w.currentNode);
    nos.forEach(n => {
      const txt = n.nodeValue, frag = document.createDocumentFragment(); let i = 0;
      reSigla.lastIndex = 0;
      txt.replace(reSigla, (m, g, pos) => {
        if (pos > i) frag.appendChild(document.createTextNode(txt.slice(i, pos)));
        const ab = document.createElement('abbr'); ab.className = 'sig'; ab.dataset.tip = SIGLAS[m]; ab.textContent = m; frag.appendChild(ab);
        i = pos + m.length; return m;
      });
      if (i < txt.length) frag.appendChild(document.createTextNode(txt.slice(i)));
      n.parentNode.replaceChild(frag, n);
    });
  }

  // ---------- caixinha de explicação ----------
  let tip;
  function mostrar(el, titulo) {
    if (!window.explicacoesLigadas || !window.explicacoesLigadas()) return;
    if (!tip) { tip = document.createElement('div'); tip.className = 'sig-tip'; tip.setAttribute('role', 'tooltip'); document.body.appendChild(tip); }
    tip.textContent = '';
    if (titulo) { const b = document.createElement('b'); b.textContent = titulo; tip.appendChild(b); tip.appendChild(document.createTextNode(' ')); }
    tip.appendChild(document.createTextNode(el.dataset.tip));
    tip.hidden = false;
    const r = el.getBoundingClientRect(), t = tip.getBoundingClientRect();
    let x = Math.min(Math.max(8, r.left + r.width / 2 - t.width / 2), innerWidth - t.width - 8);
    let y = r.bottom + 8;
    if (y + t.height > innerHeight - 8) y = r.top - t.height - 8;
    tip.style.left = x + 'px'; tip.style.top = Math.max(8, y) + 'px';
  }
  function esconder() { if (tip) tip.hidden = true; }

  document.addEventListener('mouseover', e => {
    if (!e.target.closest) return;
    const a = e.target.closest('abbr.sig');
    if (a) { mostrar(a, a.textContent); return; }
    const t = e.target.closest('.termo');
    if (t) {
      const rot = t.textContent.replace(/\s+/g, ' ').trim();
      mostrar(t, rot.length <= 40 ? rot : '');
    }
  });
  document.addEventListener('mouseout', e => {
    if (e.target.closest && (e.target.closest('abbr.sig') || e.target.closest('.termo'))) esconder();
  });
  document.addEventListener('click', e => {
    const a = e.target.closest && e.target.closest('abbr.sig');
    if (a) mostrar(a, a.textContent); else esconder();
  });
  addEventListener('scroll', esconder, true);
  document.addEventListener('pointerdown', esconder, true);

  let pendente = false;
  function varrer() {
    pendente = false;
    marcarTudo(document.body);
    marcarSiglas(document.getElementById('mainContent') || document.body);
  }
  new MutationObserver(() => {
    if (pendente) return; pendente = true;
    setTimeout(varrer, 40);
  }).observe(document.documentElement, { childList: true, subtree: true });
  varrer();
})();
