# Rotina automática de conteúdo e busca

> **Esta cópia vive no repositório PÚBLICO do site** (`wood-house-site`), que é o que o
> GitHub Pages publica. A rotina na nuvem trabalha só aqui, porque o repositório privado
> ainda não está acessível para sessões na nuvem. Neste repositório **o site é a própria
> raiz**: `construtora.html`, `blog/`, `sitemap.xml`. Não existe `saidas/site/`.
> A cópia de referência, que o Evan edita, fica no repositório privado em
> `marketing/blog/`. Quem publicar aqui deve avisar no relatório, para a fonte ser
> sincronizada depois.

Pedido do Evan em 12/09/2026: que o projeto ande sem ele presente. Esta é a lista de
tarefas que a rotina executa a cada disparo, na ordem. Ela roda na nuvem, em sessão
isolada, sem acesso à máquina dele.

**Regra de ouro:** na dúvida sobre um fato, escrever a pergunta em
`PLANO-EDITORIAL.md`, seção "Dúvidas para o Evan", e seguir sem inventar.

## 1. Conferir antes de mexer

Aqui não há dois lados para comparar: este repositório é o site no ar. Antes de editar,
rodar `git pull`, porque o Evan publica daqui também, a partir da máquina dele.

## 2. Saúde do site

- `python _rotina/medicao-site.py` garante Clarity, Pixel e `wh-eventos.js` em toda página
  de tráfego. É idempotente.
- Conferir que o `sitemap.xml` lista todas as páginas publicadas, sem `www` e com `lastmod`.
- Conferir que os links internos dos posts respondem 200.
- Conferir que nenhuma página interna (`vendas.html`, `catalogo-vendedores.html`,
  `modelo.html`) perdeu o `noindex`.

## 3. Ler os números

- **Clarity:** `python scripts/clarity.py 3`. A API só devolve os 3 últimos dias e permite
  **10 consultas por dia**, então uma por rodada, e a resposta crua fica em `dados/clarity/`.
- **Search Console:** quando a conta de serviço estiver criada, ler posição média, cliques
  e consultas por página. Enquanto não existir, pular esta parte e seguir pelo plano.
- O que procurar: página com muita impressão e posição entre 5 e 15 (vale melhorar o texto
  existente antes de escrever um novo), consulta que aparece e não tem artigo, e queda
  brusca de alguma página.

## 4. Corrigir o que achou

Ordem de prioridade: erro que quebra a experiência, depois medição, depois conteúdo antigo
com potencial, depois artigo novo.

## 5. Escrever

- **Tema: primeiro a "Fila do Pesquisador"** do `PLANO-EDITORIAL.md`, que é o bloco entre
  `<!-- PESQUISADOR:INICIO -->` e `<!-- PESQUISADOR:FIM -->`. Ele é escrito pela Central com
  buscas reais do Google, já filtradas para o público da Wood House. Pegar o primeiro `- [ ]`.
  Só quando esse bloco não existir, ou não tiver nenhum `- [ ]`, usar o primeiro da fila de baixo.
- **Como tratar um tema do Pesquisador.** A linha traz uma busca crua (por exemplo "projeto
  sobrado de madeira"). Transformar na pergunta que essa pessoa quer ver respondida e escrever
  o artigo sobre ela. Antes, conferir na tabela "Publicados" se já existe artigo que responde:
  se existir, não escrever outro, marcar a linha com `[-]` e o motivo "já respondido em
  <arquivo>".
- **Ao terminar, marcar a linha, nunca apagar.** Publicou: trocar `[ ]` por `[x]` e pôr o nome
  do arquivo no fim da linha. Não deu para escrever sem ferir regra ou sem inventar número:
  trocar por `[-]`, pôr o motivo no fim da linha e passar para o próximo `- [ ]` na mesma
  rodada. Não reordenar o bloco, não apagar linha e não mexer nas duas marcas: a Central lê
  essas marcações para saber o que virou artigo.
- **Não existe template compartilhado.** Clonar `blog/quanto-custa-casa-madeira-nobre-sc.html`
  e trocar cabeçalho, `<header class="article-hero">` e `<main class="article-body">`.
  Trocar também: title, description, canonical, og:*, e no JSON-LD headline, description,
  datePublished e mainEntityOfPage.
- Tamanho que vem funcionando: 700 a 900 palavras, 6 a 8 seções.
- Seguir as regras do `PLANO-EDITORIAL.md`.

## 6. Registrar

- Card novo no topo de `blog/index.html`.
- Entrada nova em `sitemap.xml`.
- Linha nova na tabela "Publicados" do `PLANO-EDITORIAL.md`, e tema retirado da fila.
- `python _rotina/geo-site.py`, sempre depois de publicar ou editar artigo. Ele recria o
  `llms.txt` da raiz (o resumo do site para as IAs) e o bloco FAQPage de cada artigo. A
  pergunta sai do título e a resposta sai da primeira seção, então **todo artigo novo tem
  título em forma de pergunta e começa com uma seção de resposta direta**, de 2 a 4 frases,
  antes de qualquer contexto. O `llms.txt` entra no mesmo commit.

## 7. Publicar

Commit e push neste repositório. O GitHub Pages publica sozinho em 1 a 2 minutos. Conferir com `curl` que a
URL nova responde 200 e que aparece na lista do blog e no sitemap.

## 8. Relatar

Resumo curto do que mediu, do que corrigiu e do que publicou, com o link.

## Nunca fazer sozinho

- Editar qualquer arquivo fora de `blog/`, `sitemap.xml`, `llms.txt`, `_rotina/` e das páginas de
  conteúdo já citadas.
- Apagar ou alterar `google059c8323d85f2102.html`, que é a verificação do Search Console.
- Mexer em preço, condição de pagamento ou qualquer coisa do Plano Direto.
- Publicar proposta de cliente ou qualquer documento com valor por m².
- Mudar a estrutura da página principal, o catálogo de modelos ou a Central WH.
- Apagar página que já está no ar.
- Falar em nome da empresa em canal externo (Instagram, WhatsApp, Google).

## Ao testar com navegador

Bloquear `clarity.ms` e `facebook.net` nas automações. Em 12/09/2026 os testes entraram nos
números do Clarity e o Evan não soube distinguir visita real de teste.
