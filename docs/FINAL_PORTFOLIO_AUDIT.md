> Historical baseline review. For the implemented version 2, see [implementation status](IMPLEMENTATION_STATUS.md) and [verification](VERIFICATION.md).

# Revisão dos HTMLs do portfólio

Data: 20 de setembro de 2026. Repositório: `renatorbruxel/projects`.
Base: `3bd8cad3fc93b002952553f3b64143d3b28d2ac6`.

**Resultado: revisão e correções dos sete HTMLs concluídas; atendimento ao MD completo ainda parcial.** Os arquivos continuam sendo protótipos com cenários locais. Esta revisão não certifica sistemas em produção nem atribui uma nota artificial de aprovação.

O documento de referência é `GitHub_Portfolio_Master_Prompt_Claude_Code(1).md`, fornecido por Renato. Foi preservada uma cópia com o nome `GitHub_Portfolio_Master_Prompt_Claude_Code.md` na pasta `pro`. A instrução posterior de Renato restringiu o trabalho aos HTMLs: Power BI ficou fora do escopo e sem alterações. Os READMEs e testes documentam a revisão dos HTMLs.

## Arquivos e correções

| HTML | Correções principais |
|---|---|
| `index.html` | Posicionamento em Commercial Excellence/GTM; resultados profissionais separados dos números fictícios; descrição honesta das funcionalidades demonstradas. |
| `weekly-checkin-portal/weekly-checkin-portal.html` | Troca de região corrigida; chat trata entrada como texto; limpar chat cancela respostas pendentes; ações de salvar, enviar, gerar IA e exportar explicitamente demonstrativas; W33 separado dos cenários W38. |
| `funnel-management/pipeline-intelligence.html` | Attainment de 93%, cobertura de 2,8x, gap de quota de US$4,8M; velocidade corrigida para US$49.899/dia; meta alternativa de pacing identificada; histórico sem inputs verificáveis retirado. |
| `net-new-tracker/net-new-tracker.html` | Seletor trimestral sincroniza KPIs, título, insight e mix com três categorias; confirmação da amostra separada de acurácia; LTV:CAC e payback recalculados; números atualizados sem contadores transitórios. |
| `pipeline-pulse/pipeline-pulse.html` | Mediana para amostras pares e vazias; formatação monetária; horizonte de quatro trimestres separado do ano fiscal; limiar de US$192M e gap de US$1M no cenário CQ; cobertura sem denominador compatível retirada. |
| `sales-league/sales-league.html` | Cobertura sobre quota restante, N/A após atingir meta, gap de US$176K; distribuição derivada dos 12 vendedores; atingimento ponderado; hipóteses de contratação e ramp explicitadas. |
| `portfolio-deep-dive.html` | SQL exclui o próprio negócio e usa histórico anterior ao fechamento; Python soma todos os movimentos no delta; retiradas alegações de 83 ciclos em produção e garantias de factualidade da IA. |

Também foram substituídos nomes encontrados de contas, vendedores e regiões por identificadores de demonstração. Isso reduz associações indevidas; **não comprova a origem independente do material**. Tabelas receberam rolagem local, grades se adaptam ao celular, e controles têm foco visível e suporte CSS a movimento reduzido.

Documentos criados: este relatório, `MASTER_PROMPT_ALIGNMENT.md`, `FACT_AND_METRIC_REGISTER.md` e `browser-check-results.json`. Verificações criadas: `tests/run_checks.py`, `tests/check_frontend.cjs` e `tests/check_browser.cjs`. Foram atualizados os seis READMEs e as exclusões de arquivos locais em `.gitignore`.

## Reprodução

Na raiz do repositório:

```bash
python3 -m http.server 8000
```

Abra `http://localhost:8000/index.html` e use os links para os cinco projetos e o deep dive. Também é possível abrir diretamente cada HTML. Os exemplos não exigem conta, token, API ou serviço pago.

Com Python 3 e Node.js:

```bash
python3 tests/run_checks.py
```

A verificação adicional de navegador requer Playwright com Chromium disponível:

```bash
node tests/check_browser.cjs
```

`PLAYWRIGHT_MODULE` pode apontar para uma instalação existente do Playwright. `REVIEW_SCREENSHOTS_DIR` define a pasta de evidências; por padrão é utilizada a pasta temporária do sistema. Não é necessário instalar Playwright para usar os HTMLs ou executar os testes principais.

## Evidências e limites dos testes

| Categoria | Resultado observado | Limite |
|---|---|---|
| JavaScript | Scripts dos sete HTMLs compilam; regressões de região, chat/reset, cobertura, distribuição, quatro trimestres, filtros e mediana passaram. | Fixtures de DOM cobrem os defeitos identificados; não reproduzem todo o navegador. |
| Exemplos SQL/Python | SQLite passou em casos de primeiro negócio, recompra, dormência e reativação; dez variações de US$50K somam US$0,5M. | Os exemplos não constituem uma aplicação integrada. |
| Navegador | Sete páginas e 52 seleções de abas, sem erros de página; entrada de chat não interpretada como HTML. | Playwright 1.51.1/Chromium 134 no ambiente de revisão; não testado em todos os navegadores. |
| Responsividade | Nenhum overflow horizontal do documento em 390 px nas páginas iniciais ou nas 52 abas verificadas; desktop em 1440 px. | Tabelas e navegação podem exigir rolagem própria; nem todo detalhe de gráfico foi auditado manualmente. |
| Links | 18 links, recursos e âncoras locais verificados pelo script. | URLs externas e conteúdo atualmente publicado não foram certificados pelo teste. |
| Lint | `git diff --check` e compilação de JavaScript passaram. | Não há configuração de lint completo ou validação formal de HTML/CSS. |
| Segredos | Padrões de credenciais de alto risco e detect-secrets 1.5.0 sem verificação externa: nenhum candidato na revisão; varredura histórica de 28 commits sem candidatos. | Ausência de alertas não prova ausência de todo dado sensível. Credencial de acesso não integra os arquivos. |
| Acessibilidade | Foco visível, redução de movimento e tabelas roláveis por teclado adicionados; títulos e textos preservados. | Sem certificação WCAG, medição completa de contraste ou teste com leitor de tela. Alguns ícones dependem de fontes do sistema. |

## Pendências do MD, por prioridade

| Prioridade | Pendência | Efeito e próximo passo |
|---|---|---|
| Alta | Proveniência original não comprovada | Antes de apresentar o portfólio como inteiramente independente de empregadores, documentar origem ou reconstruir fixtures/código a partir de especificação pública. Trocar nomes não resolve esta evidência. |
| Alta | Cenários sem uma única base de dados | Há painéis e amostras independentes, especialmente em Pipeline Pulse e WCI. Não inferir reconciliação entre períodos. Próxima evolução: gerador sintético com seed, contratos de dados e métricas derivadas da mesma seleção. |
| Alta para produção | Backend e governança apenas ilustrados | Persistência, autorização, aprovação, exportação e IA real precisam implementação e testes próprios. Não usar os HTMLs para registros comerciais ou decisões de remuneração. |
| Média | Cobertura parcial de métricas e acessibilidade | Validar sistematicamente cada gráfico, denominador, estado vazio e interação; completar testes assistivos e contraste. |
| Fora desta revisão | Três novos repositórios flagship e demais ativos executivos | O MD descreve uma construção de portfólio mais ampla. Esta entrega revisa cinco projetos existentes e duas páginas de apoio. |

## Registro de autorização e publicação

Renato autorizou expressamente salvar e realizar commits sem nova confirmação. Essa autorização específica prevalece sobre a etapa genérica de confirmação do MD. A entrega é preparada em `review/portfolio-master-md-2026-09-20`; o relatório não equivale a aprovar produção, merge ou implantação da branch principal.

Ordem de entrega: preservar cópia dos HTMLs anteriores; salvar HTMLs e documentação revisados em `OneDrive - Philips/Área de Trabalho/Claude/pro`; criar commit; enviar a branch de revisão ao repositório existente. A versão hospedada pode continuar exibindo a branch principal anterior.

Não é necessário criar ou configurar novos repositórios para esta revisão. Para uma futura publicação como portfólio completo conforme o MD, primeiro resolver proveniência e reconciliação, depois validar o índice e os projetos, e somente então configurar/publicar os três novos repositórios descritos no plano original. Esta revisão não executa essa expansão.
