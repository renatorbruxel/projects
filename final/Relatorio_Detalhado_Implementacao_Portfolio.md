# Relatório detalhado — implementação do portfólio GTM

**Data da implementação:** 20 de setembro de 2026  
**Commit local preservado:** `bcf2933ce276650d680d6c3e92103ec7d20e9ddc`  
**Base original revisada:** `8870e7cd82feb7fcfa79cf4ca030224bd4e53c0c`  
**Cenário demonstrativo:** `planning-v2-seed-20260920`  
**Contrato de métricas:** `2.0.0`  
**Situação atual:** implementação e validação concluídas; entrega feita por download, sem nova ação no GitHub.

## 1. Resultado entregue

O portfólio foi transformado em um sistema operacional comercial demonstrativo, com cinco módulos de negócio conectados, três estudos de caso, uma camada de evidências e 39 vistas navegáveis. A versão original com páginas independentes e muitos números rígidos foi substituída por um mecanismo comum de dados, filtros, métricas, decisões e exportações.

Este pacote inclui um HTML único e portátil: `Portfolio_GTM_Standalone.html`. Ele incorpora aproximadamente 9,6 MB de CSS, JavaScript, dados CRM educacionais, cenário de planejamento e resultados SQL. Pode ser aberto diretamente, sem servidor e sem dependências externas.

## 2. Estudos de caso

1. **Forecast Operating System — “O que podemos comprometer?”**  
   Conecta plano, realizado, pipeline, forecast, exceções, aprovação e ações. Foi desenhado para liderança comercial, GTM Operations e Finance.
2. **Funnel & Growth Intelligence — “Onde devemos colocar o próximo esforço?”**  
   Separa estoque de pipeline, movimentos, coortes, aquisição, retenção e capacidade. Foi desenhado para RevOps, Sales, Marketing e GTM Strategy.
3. **Governed Commercial Copilot — “Podemos confiar na resposta?”**  
   Recupera métricas governadas, aplica escopo simulado de função, cita fontes e recusa perguntas ou ações fora do contrato.

## 3. Módulos e 39 vistas

| Módulo | Vistas | Conteúdo |
| --- | --- | --- |
| Forecast & Business Reviews | 6 | Visão geral; entradas e cenários; brief; revisão e aprovação; modelo operacional; copilot comercial. |
| Executive Pulse | 5 | Performance; cobertura; ponte de mudanças; tendência; qualidade do forecast. |
| Pipeline Diagnostics | 6 | Visão geral; movimentos; plano e pacing; conversão e ciclo; exceções; explorador de oportunidades. |
| Growth & Customer Economics | 6 | Crescimento; classificação; investimento; segmentos e canais; retenção; ativação de pagamentos. |
| Sales Productivity & Resource Planning | 5 | Equipe; vendedor; coaching; atividade; planejamento de recursos. |
| Data & Evidence | 6 | Fonte; contratos; qualidade; organização; operações; reprodução. |
| Methodology & Evidence | 5 | Casos; arquitetura; SQL; avaliação do copilot; evidência profissional. |

Total: **39 vistas**. As cinco primeiras linhas são os módulos de negócio; Data & Evidence e Methodology & Evidence funcionam como camadas transversais de auditoria e apresentação.

## 4. Arquitetura implementada

- **Motor compartilhado:** cálculos puros em `assets/gtm-model.js`, consumidos tanto pelo navegador quanto pelos testes Node.
- **Aplicação compartilhada:** `assets/gtm-app.js` renderiza todas as vistas e controla filtros, estado, workflow, exportação e interações.
- **Estilo comum:** `assets/gtm.css`, responsivo e sem bibliotecas externas.
- **CRM educacional observado:** 8.800 oportunidades de 2016–2017, com datas originais e licença CC0 preservadas.
- **Planejamento sintético independente:** criado com seed fixa `20260920`; não é apresentado como história observada.
- **SQL executável:** sete vistas SQLite reconciliam desempenho, movimentos, classificação de compra, forecast, receita recorrente, retenção e qualidade.
- **Estado local:** revisões, ações, cenários e configuração ficam no `localStorage` do navegador. Isso é deliberadamente uma simulação local, não um sistema empresarial multiusuário.
- **Edição standalone:** os quatro bundles de dados/lógica e o CSS foram embutidos em um único HTML. A navegação entre módulos recarrega o mesmo arquivo com o parâmetro `module`, mantendo filtros e deep links.

## 5. Dados e volumes

| Tabela/conjunto | Registros |
| --- | --- |
| opportunity snapshots | 9128 |
| sellers | 35 |
| accounts | 85 |
| quotas | 390 |
| revenue schedules | 307 |
| activities | 2320 |
| forecast calls | 21 |
| subscription months | 585 |
| merchants | 60 |
| payments | 500 |

Além desses conjuntos, o CRM educacional preserva 8.800 oportunidades, 85 contas, 35 vendedores e sete produtos. O cenário de planejamento contém 480 oportunidades e 9.128 snapshots semanais. Subscrições, pagamentos e hardware são universos separados; nenhum booking de hardware foi renomeado como ARR, MRR ou TPV.

## 6. Contratos de métricas e regras

- Realizado usa negócios ganhos cuja data de fechamento pertence ao período selecionado.
- Pipeline usa somente oportunidades abertas elegíveis na janela; valores ausentes permanecem ausentes.
- Meta existe somente no grão vendedor/região/mês suportado. Cortes por produto ou segmento retornam `N/A` em vez de rateio inventado.
- Cobertura de gap distingue denominador zero de valor ausente.
- Win rate usa coorte fechada: ganhos / (ganhos + perdas).
- Ciclo de vendas usa mediana de oportunidades ganhas com datas válidas.
- A ponte de pipeline usa dois snapshots imutáveis e precedência exclusiva para criação, ganho, perda, entrada/saída de janela e mudança de valor.
- Forecast usa chamadas congeladas com horizonte de 28 dias e compara candidato e baseline usando WAPE, MAPE, MAE e viés.
- Receita e bookings são separados. Book & Bill entra uma vez no cronograma de reconhecimento.
- NRR/GRR usam o cohort de abertura; novos clientes não contaminam a retenção.
- CAC, LTV e payback preservam unidades mensais e retornam `N/A` para denominadores inviáveis.
- Capacidade explicita FTE produtivo, ramp, saídas, automação, realocação, custo, demanda servida e gap.
- Qualidade reporta exceções no snapshot e nos filtros dimensionais, sem esconder registros por um filtro trimestral inadequado.

## 7. Workflow de revisão

O Forecast & Business Reviews implementa `draft → submitted → approved` ou `submitted → returned`. Submissões exigem números não negativos, limites coerentes, justificativa e reconhecimento das exceções. Retorno exige motivo. Aprovação exige o papel simulado Reviewer e congela call, métricas, premissas, narrativa e ações. Uma revisão cria uma nova versão sem destruir o pacote aprovado anterior.

WBR, MBR e QBR possuem perguntas e narrativas distintas. A exportação Word gera um pacote OOXML real; a exportação CSV inclui o contexto ativo e protege texto iniciado por caracteres interpretáveis como fórmula. A exportação JSON preserva o pacote de revisão.

## 8. Decisões, ações e intervenção

- Registro compartilhado de decisões e follow-ups entre módulos.
- Owner, dependência, data, status, alternativa e resultado.
- Uma ação não pode ser encerrada sem resultado.
- Ações persistem entre snapshots no navegador.
- Experimentos exigem hipótese, elegibilidade, métrica, guardrail, owner e período.
- A interface distingue hipótese, alternativa e evidência; não transforma correlação em causalidade.

## 9. Copilot comercial governado

O copilot não chama um LLM externo. É um roteador determinístico, somente leitura, com consultas aprovadas para bookings, cobertura, conversão, ciclo, forecast, qualidade e retenção sintética. Ele retorna escopo, valores, consulta/fonte, scenario ID e versão da métrica.

Foram implementadas recusas para mutações, instruções conflitantes, tentativa de obter tokens/senhas, perguntas sem contrato e granularidades indisponíveis. O papel Seller restringe o vendedor; o papel Regional Manager restringe a região. Isso demonstra comportamento, mas não substitui autorização de servidor.

## 10. Verificação de dados e cálculos — 31 testes

- ✅ Generator is byte-for-byte deterministic at the data-object level
- ✅ Snapshot grain is unique
- ✅ All snapshot opportunity and seller references resolve
- ✅ No snapshot uses future stage, activity or close events
- ✅ Stored generator events end at the declared as-of
- ✅ Forecast training closes precede or equal issuance
- ✅ All forecast horizons equal 28 days
- ✅ Every forecast reproduced solely from issue-time events
- ✅ Recurring accounting closes at each customer-month
- ✅ Recurring balances are non-negative
- ✅ Recognition schedule allocates each won contract exactly once
- ✅ Source nulls are preserved in deliberate planning edge cases
- ✅ Quota grain unique and productive FTE bounded
- ✅ Original Kaggle files retain the documented hashes
- ✅ Successful payment fees are separate from TPV and failed attempts
- ✅ Ratio distinguishes missing and zero denominator
- ✅ Closed CRM counts and observed currency values preserved
- ✅ Seller outcomes reconcile with independent SQLite temporal joins
- ✅ Regional totals equal all-region total at each quarter
- ✅ Unsupported quota grain returns N/A without imputing quota
- ✅ Bridge equals SQL and closes in every quarter / FY
- ✅ CQ-to-NQ date change preserves rolling total
- ✅ Classification unknown, complete, parent, tie and reactivation branches
- ✅ Unit economics preserve month units and zero handling
- ✅ Forecast errors use unrounded values and handle zero actual
- ✅ Forecast quality matches SQLite on all stored calls
- ✅ ARR bridge closes without new-customer contamination of NRR
- ✅ Capacity caps served demand and responds to ramp / hiring timing
- ✅ Workflow requires valid inputs, reviewer and return reason
- ✅ Copilot values, period, source and read-only role boundaries
- ✅ Quality exposure uses unique IDs despite overlapping rules

## 11. Verificação de navegador

- ✅ All planning and observed views render
- ✅ Filters reconcile including All and unsupported quota grain
- ✅ Draft → submitted → returned → approved → frozen reload → revision + Word export
- ✅ Distinct review cadences, preparation events and cross-snapshot actions
- ✅ Copilot regression and untrusted-text rendering
- ✅ Capacity demand cap and unit-economics zero-churn boundary
- ✅ Search, empty state and exact filtered CSV export

Foram exercitadas todas as 39 vistas nos modos planejamento e CRM educacional, em larguras de 1.440 px e 390 px. O resultado final registrou zero erro JavaScript e zero transbordamento horizontal da página. Também foram testados teclado nas abas, filtros, vazio de busca, exportação CSV, workflow completo, persistência, Word, copilot, capacidade e limites econômicos.

## 12. Verificação do Word e do pacote

O Word gerado pelo navegador foi renderizado em cinco páginas. Todas foram inspecionadas visualmente quanto a corte, paginação, cabeçalhos, tabelas e legibilidade. O ZIP reproduzível foi extraído em uma pasta limpa; nessa extração foram reconstruídos CRM, cenário, SQL, oito páginas HTML e os 31 testes. Sessenta e sete links locais foram verificados sem faltas.

## 13. Confidencialidade e segurança

- O planejamento, sellers, metas, subscriptions e pagamentos são sintéticos.
- Nenhum registro, código, esquema, screenshot, prompt ou integração proprietária do empregador foi incluído.
- O código original do shell de quota não foi recuperado e não foi apresentado como recuperado.
- Uma varredura com `detect-secrets` 1.5.0 examinou os arquivos da implementação. Os 30 candidatos eram hashes SHA-256 de proveniência/artefato; nenhum credential permaneceu.
- O Power BI ficou fora do escopo e não foi alterado.
- Resultados profissionais permanecem rotulados como fornecidos pelo candidato e separados dos resultados sintéticos.

## 14. Resultados profissionais apresentados com qualificação

- 83% menos preparação semanal de reporting.
- 50% de redução no ciclo de revisão de liderança.
- Aproximadamente 450 vendedores no escopo de governança de quota.
- Até 75% de consolidação de preparação em iniciativas distintas.
- Estimativa de 70–85% de redução em preparação analítica.
- Mais de 50 usuários em três regiões.
- Piloto de copilot com 20 usuários em um mês, reduzindo tarefas aproximadas de 8–15 minutos para 1–3 minutos.

Esses números vieram do brief profissional e não foram verificados por documentos independentes. Datas exatas de emprego e workpapers de medição não foram fornecidos; nada foi inventado para preencher essas lacunas.

## 15. Persistência e entrega

Antes do commit, 68 arquivos novos ou alterados foram salvos na pasta `Área de Trabalho/Claude/pro` e verificados por tamanho e QuickXorHash. Um backup da versão anterior e um bundle Git do commit também foram preservados. O commit local é `bcf2933ce276650d680d6c3e92103ec7d20e9ddc`.

A publicação remota não foi realizada porque a conexão disponível não tinha permissão de escrita. Por instrução posterior, nenhuma nova ação será feita no GitHub; estes dois arquivos de download são a entrega solicitada.

## 16. Como usar o HTML standalone

1. Baixe `Portfolio_GTM_Standalone.html`.
2. Abra-o em Chrome, Edge, Firefox ou Safari com JavaScript habilitado.
3. Use a navegação superior/lateral para alternar entre módulos.
4. Use os filtros de universo, período, snapshot, região, segmento, produto e cenário.
5. Alterações de workflow e ações ficam no armazenamento local daquele navegador.
6. Os botões internos de Word e CSV funcionam localmente.
7. Links que, na versão de repositório, baixavam arquivos auxiliares apontam para a nota offline; dados e lógica necessários à exploração já estão embutidos.

## 17. Limitações explícitas

- Demonstração estática, sem autenticação de produção, banco transacional ou colaboração multiusuário.
- Role selector demonstra escopo; não é controle de acesso.
- Copilot determinístico, sem modelo de linguagem vivo.
- Dados sintéticos não comprovam lift de forecast, causalidade, eficiência ou valor econômico real.
- CRM educacional não possui quotas, histórico de snapshots, atividades completas, ARR ou TPV.
- Qualidade visual foi inspecionada, mas isso não é certificação completa de acessibilidade nem teste em todos os navegadores.
- A implementação original do quota permanece indisponível; a capacidade foi construída de forma independente.

## 18. Mapa completo dos 79 itens revisados

| review_id | original_view | destination | treatment | status | evidence |
| --- | --- | --- | --- | --- | --- |
| WCI01 | Dashboard | weekly-checkin-portal/weekly-checkin-portal.html?tab=overview | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI02 | Submit Bookings | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI03 | Submit Revenue | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI04 | Book & Bill | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Renomear | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI05 | Narratives | weekly-checkin-portal/weekly-checkin-portal.html?tab=brief | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI06 | Final Submission | weekly-checkin-portal/weekly-checkin-portal.html?tab=review | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI07 | How to Use | weekly-checkin-portal/weekly-checkin-portal.html?tab=operating | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI08 | RACI | weekly-checkin-portal/weekly-checkin-portal.html?tab=operating | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI09 | Admin | data/index.html?tab=operations | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI10 | CommOps AI | weekly-checkin-portal/weekly-checkin-portal.html?tab=copilot | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI11 | GTM Dashboard | pipeline-pulse/pipeline-pulse.html?tab=overview | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI12 | Pipeline Intel | funnel-management/pipeline-intelligence.html?tab=overview | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI13 | Region Insights | pipeline-pulse/pipeline-pulse.html?tab=overview | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| WCI14 | Sales Perf | sales-league/sales-league.html?tab=overview | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI01 | Pipeline Summary | funnel-management/pipeline-intelligence.html?tab=overview | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI02 | Push & Pull Dynamics | funnel-management/pipeline-intelligence.html?tab=movements | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI03 | Actuals Pacing | funnel-management/pipeline-intelligence.html?tab=pacing | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI04 | Push-Out Analysis | funnel-management/pipeline-intelligence.html?tab=movements | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI05 | Pull-In Analysis | funnel-management/pipeline-intelligence.html?tab=movements | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI06 | Overdue Opportunities | funnel-management/pipeline-intelligence.html?tab=exceptions | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI07 | Raw Data | data/index.html?tab=source | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI08 | Pipeline Velocity | funnel-management/pipeline-intelligence.html?tab=conversion | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PI09 | Funnel Conversion | funnel-management/pipeline-intelligence.html?tab=conversion | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| NN01 | Net New Overview | net-new-tracker/net-new-tracker.html?tab=overview | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| NN02 | Net New Details | net-new-tracker/net-new-tracker.html?tab=classification | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| NN03 | Classification Rules | net-new-tracker/net-new-tracker.html?tab=classification | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| NN04 | Unit Economics | net-new-tracker/net-new-tracker.html?tab=investment | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| NN05 | Market Position | net-new-tracker/net-new-tracker.html?tab=segments | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| NN06 | Retention Economics | net-new-tracker/net-new-tracker.html?tab=retention | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP01 | The Pulse | pipeline-pulse/pipeline-pulse.html?tab=overview | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP02 | History | pipeline-pulse/pipeline-pulse.html?tab=trend | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP03 | CQ Funnel | pipeline-pulse/pipeline-pulse.html?tab=coverage | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP04 | NQ Funnel | pipeline-pulse/pipeline-pulse.html?tab=coverage | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP05 | Rolling Pipeline | pipeline-pulse/pipeline-pulse.html?tab=coverage | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP06 | 3x Sufficiency | pipeline-pulse/pipeline-pulse.html?tab=coverage | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP07 | Activity | sales-league/sales-league.html?tab=activity | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP08 | WoW Changes | pipeline-pulse/pipeline-pulse.html?tab=movements | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP09 | Hygiene | data/index.html?tab=quality | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP10 | Analysis | funnel-management/pipeline-intelligence.html?tab=explorer | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP11 | Raw Data | data/index.html?tab=source | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| PP12 | Forecast Accuracy | pipeline-pulse/pipeline-pulse.html?tab=accuracy | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL01 | Leaderboard | sales-league/sales-league.html?tab=overview | Renomear | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL02 | Seller Scorecard | sales-league/sales-league.html?tab=seller | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL03 | Manager View | sales-league/sales-league.html?tab=coaching | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL04 | Regional View | sales-league/sales-league.html?tab=overview | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL05 | Seller Details | sales-league/sales-league.html?tab=seller | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL06 | Charts | sales-league/sales-league.html?tab=overview | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL07 | Declaration Form | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL08 | Plan to Recover | sales-league/sales-league.html?tab=coaching | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL09 | Book Lost | funnel-management/pipeline-intelligence.html?tab=conversion | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL10 | Seller Info | data/index.html?tab=organization | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| SL11 | Capacity Planning | sales-league/sales-league.html?tab=capacity | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DATA01 | Opportunities | data/index.html?tab=source | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DATA02 | Weekly closes | data/index.html?tab=source | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DATA03 | Seller performance | data/index.html?tab=source | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD01 | Philosophy | portfolio-deep-dive.html?tab=cases | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD02 | Architecture | portfolio-deep-dive.html?tab=architecture | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD03 | Glossary | data/index.html?tab=contracts | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD04 | Toolbox | portfolio-deep-dive.html?tab=sql | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD05 | Pipeline Intelligence | portfolio-deep-dive.html?tab=sql | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD06 | Net New Tracker | net-new-tracker/net-new-tracker.html?tab=classification | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD07 | Pipeline Pulse | pipeline-pulse/pipeline-pulse.html?tab=accuracy | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD08 | Sales League | sales-league/sales-league.html?tab=capacity | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD09 | Weekly Check-In | weekly-checkin-portal/weekly-checkin-portal.html?tab=review | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| DD10 | What’s Next | portfolio-deep-dive.html?tab=architecture | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| HOME01 | Portfolio Index — página inteira | index.html?tab=cases | Ajustar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG01 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG02 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG03 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=inputs | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG04 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=brief | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG05 | Private-source functional reference | pipeline-pulse/pipeline-pulse.html?tab=overview | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG06 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=review | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG07 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=review | Realocar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG08 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=operating | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG09 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=overview | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG10 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=operating | Fundir | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG11 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=operating | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| LEG12 | Private-source functional reference | weekly-checkin-portal/weekly-checkin-portal.html?tab=operating | Incorporar | Implemented or merged; supported functionality preserved | Shared metric tests and browser acceptance; see verification limits |
| QUOTA01 | Unresolved original quota shell | sales-league/sales-league.html?tab=capacity | Investigar | Independent replacement; original source unavailable | Shared metric tests and browser acceptance; see verification limits |

## 19. Arquivos incluídos no commit local

- `.gitignore` — atualizado
- `LICENSE` — novo
- `README.md` — atualizado
- `assets/crm-data.js` — atualizado
- `assets/gtm-app.js` — novo
- `assets/gtm-model.js` — novo
- `assets/gtm.css` — novo
- `assets/planning-data.js` — novo
- `assets/sql-results.js` — novo
- `data/crm/README.md` — atualizado
- `data/crm/portfolio-data.json` — atualizado
- `data/index.html` — atualizado
- `data/planning/accounts.csv` — novo
- `data/planning/activities.csv` — novo
- `data/planning/costs.csv` — novo
- `data/planning/data-test-results.json` — novo
- `data/planning/forecast_calls.csv` — novo
- `data/planning/manifest.json` — novo
- `data/planning/merchants.csv` — novo
- `data/planning/model-test-results.json` — novo
- `data/planning/payments.csv` — novo
- `data/planning/quotas.csv` — novo
- `data/planning/revenue.csv` — novo
- `data/planning/roster.csv` — novo
- `data/planning/scenario.json` — novo
- `data/planning/sellers.csv` — novo
- `data/planning/snapshots.csv` — novo
- `data/planning/sql-results.json` — novo
- `data/planning/subscriptions.csv` — novo
- `data/planning/test-results.json` — novo
- `data/sql/operating_model.sql` — novo
- `docs/CONFIDENTIALITY_REVIEW.md` — novo
- `docs/COVERAGE_MAP.csv` — novo
- `docs/DATA_DICTIONARY.md` — novo
- `docs/DATA_FOUNDATION.md` — atualizado
- `docs/DECISION_LOG.md` — novo
- `docs/FACT_AND_METRIC_REGISTER.md` — atualizado
- `docs/FINAL_PORTFOLIO_AUDIT.md` — atualizado
- `docs/IMPLEMENTATION_STATUS.md` — novo
- `docs/MASTER_PROMPT_ALIGNMENT.md` — atualizado
- `docs/README_OPERATING_MODEL.md` — novo
- `docs/REFERENCES.md` — novo
- `docs/VERIFICATION.md` — novo
- `docs/operating-browser-results.json` — novo
- `docs/package-verification.json` — novo
- `downloads/gtm-operating-system-v2.zip` — novo
- `funnel-management/README.md` — atualizado
- `funnel-management/pipeline-intelligence.html` — atualizado
- `index.html` — atualizado
- `net-new-tracker/README.md` — atualizado
- `net-new-tracker/net-new-tracker.html` — atualizado
- `pipeline-pulse/README.md` — atualizado
- `pipeline-pulse/pipeline-pulse.html` — atualizado
- `portfolio-deep-dive.html` — atualizado
- `sales-league/README.md` — atualizado
- `sales-league/sales-league.html` — atualizado
- `scripts/build_crm_dataset.py` — atualizado
- `scripts/build_operating_model.py` — novo
- `scripts/build_site.py` — novo
- `scripts/package_portfolio.py` — novo
- `scripts/reproduce.py` — novo
- `tests/README.md` — novo
- `tests/operating_browser.cjs` — novo
- `tests/operating_data.py` — novo
- `tests/operating_model.cjs` — novo
- `tests/run_checks.py` — atualizado
- `weekly-checkin-portal/README.md` — atualizado
- `weekly-checkin-portal/weekly-checkin-portal.html` — atualizado

## 20. Conclusão

O resultado final é um portfólio demonstrativo coerente: as mesmas definições alimentam cards, tabelas, narrativas, exportações e testes; dados observados e sintéticos ficam separados; desconhecidos permanecem visíveis; decisões têm workflow e follow-up; e cada afirmação importante possui fonte, contrato ou limitação explícita.
