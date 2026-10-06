# -*- coding: utf-8 -*-
"""GEO: deixa o site legivel para as IAs que respondem pergunta (ChatGPT,
Gemini, Perplexity), alem do Google.

Pedido do Evan em 06/10/2026: um agente de GEO dentro do Marketing. Faz duas
coisas, e as duas saem do que JA esta escrito no site, sem inventar frase:

1. Em cada artigo do blog, um bloco FAQPage (JSON-LD) em que a pergunta e o
   titulo do artigo e a resposta e a primeira secao dele ("A resposta
   direta"). Titulos de secao que ja sao pergunta entram tambem. O texto da
   resposta e o mesmo que o leitor ve na pagina, que e a regra do Google para
   dado estruturado.
2. O arquivo llms.txt na raiz: um resumo do site em texto puro, com as
   paginas principais e os artigos, montado a partir do sitemap e do titulo e
   da descricao de cada pagina.

Uso: python _rotina/geo-site.py   (idempotente, pode rodar de novo)
Rodar sempre depois de publicar artigo novo.
"""
import html
import io
import json
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.normpath(os.path.join(AQUI, '..'))   # no repo publico o site e a raiz
DOMINIO = 'https://whconstrutora.com.br'
MARCA_FAQ = '<!-- geo: faq -->'
RESPOSTA_MAX = 700      # caracteres; resposta longa demais a IA corta de qualquer jeito


def ler(caminho):
    with io.open(caminho, 'r', encoding='utf-8', newline='') as f:
        return f.read()


def gravar(caminho, texto):
    with io.open(caminho, 'w', encoding='utf-8', newline='') as f:
        f.write(texto)


def limpo(trecho):
    """Tira as tags e junta os espacos. O que sobra e o texto que o leitor ve."""
    sem = re.sub(r'<(script|style)[\s\S]*?</\1>', ' ', trecho)
    sem = re.sub(r'<[^>]+>', ' ', sem)
    junto = re.sub(r'\s+', ' ', html.unescape(sem)).strip()
    return re.sub(r' ([.,;:!?])', r'\1', junto)   # sobra de frase que tinha link


def corta(texto):
    """Corta no fim de uma frase, nunca no meio."""
    if len(texto) <= RESPOSTA_MAX:
        return texto
    pedaco = texto[:RESPOSTA_MAX]
    fim = max(pedaco.rfind('. '), pedaco.rfind('? '), pedaco.rfind('! '))
    return pedaco[:fim + 1] if fim > 200 else pedaco.rstrip() + '...'


COMECO_DE_PERGUNTA = ('como ', 'quanto ', 'quanta ', 'qual ', 'quais ', 'o que ', 'por que ',
                      'quando ', 'onde ', 'quem ', 'dá para ', 'da para ', 'preciso ')


def vira_pergunta(titulo):
    """Devolve o titulo como pergunta, ou None se ele nao for uma."""
    t = titulo.strip()
    if '?' in t:
        return t[:t.index('?') + 1]
    if t.lower().startswith(COMECO_DE_PERGUNTA):
        return t.rstrip('.') + '?'
    return None


def secoes(corpo):
    """[(titulo da secao, texto dos paragrafos ate a proxima secao)]"""
    partes = re.split(r'<h2[^>]*>([\s\S]*?)</h2>', corpo)
    saida = []
    for i in range(1, len(partes) - 1, 2):
        paragrafos = re.findall(r'<p[^>]*>([\s\S]*?)</p>', partes[i + 1])
        texto = ' '.join(limpo(p) for p in paragrafos).strip()
        if texto:
            saida.append((limpo(partes[i]), texto))
    return saida


def faq_do_artigo(pagina):
    h1 = re.search(r'<h1[^>]*>([\s\S]*?)</h1>', pagina)
    corpo = re.search(r'<main class="article-body">([\s\S]*?)</main>', pagina)
    if not h1 or not corpo:
        return []
    sec = secoes(corpo.group(1))
    if not sec:
        return []
    pares = []
    pergunta = vira_pergunta(limpo(h1.group(1)))
    if pergunta:
        pares.append((pergunta, corta(sec[0][1])))
    for titulo, texto in sec[1:]:
        if titulo.endswith('?') and len(pares) < 5:
            pares.append((titulo, corta(texto)))
    return pares


def bloco_faq(pares):
    dado = {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        'mainEntity': [
            {'@type': 'Question', 'name': p,
             'acceptedAnswer': {'@type': 'Answer', 'text': r}}
            for p, r in pares
        ],
    }
    return ('  ' + MARCA_FAQ + '\n  <script type="application/ld+json">\n' +
            json.dumps(dado, ensure_ascii=False, indent=2) + '\n  </script>\n')


def aplica_faq():
    feitos, sem_pergunta = [], []
    pasta = os.path.join(SITE, 'blog')
    for nome in sorted(os.listdir(pasta)):
        if not nome.endswith('.html') or nome == 'index.html':
            continue
        caminho = os.path.join(pasta, nome)
        pagina = ler(caminho)
        nl = '\r\n' if '\r\n' in pagina else '\n'
        texto = pagina.replace('\r\n', '\n')
        # tira o bloco antigo, para rodar de novo dar o mesmo resultado
        texto = re.sub(r'  ' + re.escape(MARCA_FAQ) + r'\n  <script type="application/ld\+json">[\s\S]*?</script>\n', '', texto)
        pares = faq_do_artigo(texto)
        if not pares:
            sem_pergunta.append(nome)
        else:
            texto = texto.replace('</head>', bloco_faq(pares) + '</head>', 1)
            feitos.append((nome, len(pares)))
        novo = texto.replace('\n', nl) if nl != '\n' else texto
        if novo != pagina:
            gravar(caminho, novo)
    return feitos, sem_pergunta


def meta(pagina, nome):
    m = re.search(r'<meta\s+name="' + nome + r'"\s+content="([^"]*)"', pagina)
    return html.unescape(m.group(1)).strip() if m else ''


def titulo_de(pagina):
    m = re.search(r'<title>([\s\S]*?)</title>', pagina)
    t = html.unescape(m.group(1)).strip() if m else ''
    return re.split(r'\s[|·]\s', t)[0].strip()


def monta_llms():
    sitemap = ler(os.path.join(SITE, 'sitemap.xml'))
    enderecos = re.findall(r'<loc>\s*' + re.escape(DOMINIO) + r'/([^<\s]*)\s*</loc>', sitemap)
    paginas, modelos, artigos = [], [], []
    for rel in enderecos:
        caminho = os.path.join(SITE, rel.replace('/', os.sep))
        if not os.path.isfile(caminho):
            continue
        pagina = ler(caminho)
        linha = '- [' + titulo_de(pagina) + '](' + DOMINIO + '/' + rel + ')'
        desc = meta(pagina, 'description')
        if desc:
            linha += ': ' + desc
        if rel.startswith('blog/') and rel != 'blog/index.html':
            artigos.append(linha)
        elif rel.startswith('modelos/'):
            modelos.append(linha)
        else:
            paginas.append(linha)
    casa = ler(os.path.join(SITE, 'construtora.html'))
    linhas = [
        '# Wood House Construtora',
        '',
        '> ' + meta(casa, 'description'),
        '',
        'Site oficial: ' + DOMINIO + '/construtora.html',
        'Contato: (47) 3091-0877, também pelo WhatsApp neste número.',
        '',
        '## Páginas principais',
        '',
    ] + paginas
    if modelos:
        linhas += ['', '## Modelos de casa', ''] + modelos
    if artigos:
        linhas += ['', '## Guias e artigos', ''] + artigos
    linhas += ['']
    gravar(os.path.join(SITE, 'llms.txt'), '\n'.join(linhas))
    return len(paginas), len(modelos), len(artigos)


if __name__ == '__main__':
    feitos, sem = aplica_faq()
    for nome, n in feitos:
        print('faq  %d pergunta(s)  %s' % (n, nome))
    for nome in sem:
        print('faq  sem pergunta    %s  (titulo nao e pergunta)' % nome)
    print('llms.txt: %d paginas, %d modelos, %d artigos' % monta_llms())
