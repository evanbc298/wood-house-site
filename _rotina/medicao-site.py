# -*- coding: utf-8 -*-
"""Garante Clarity + Pixel + wh-eventos.js em todas as paginas do site.

Motivo (12/09/2026): o Clarity estava em 2 paginas de 14 e o Pixel em 10. Quem
entrava direto num modelo, no catalogo do vendedor ou em fornecedores nao era
contado, e a gente decidia campanha com numero torto.

Ficam de fora de proposito:
  index.html          e so um redirect para construtora.html; contar aqui
                      duplicaria a mesma visita
  modelo-artifact.html copia antiga de artifact, nao e pagina de trafego

Uso: python _rotina/medicao-site.py   (idempotente, pode rodar de novo)
"""
import io
import os
import re

AQUI = os.path.dirname(os.path.abspath(__file__))
SITE = os.path.join(AQUI, '..')   # no repo publico o site e a propria raiz
# caminho relativo, nao nome de arquivo: blog/index.html e pagina de verdade e
# quase ficou de fora por se chamar index igual ao redirect da raiz
FORA = {'index.html', 'modelo-artifact.html',
        'google059c8323d85f2102.html'}  # verificacao do Search Console, nao mexer

CLARITY = '''  <!-- Microsoft Clarity -->
  <script type="text/javascript">
    (function(c,l,a,r,i,t,y){
        c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
        t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
        y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
    })(window, document, "clarity", "script", "x1k7e0jtub");
  </script>
'''

PIXEL = '''  <!-- Meta Pixel Code -->
  <script>
  !function(f,b,e,v,n,t,s)
  {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};
  if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
  n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];
  s.parentNode.insertBefore(t,s)}(window, document,'script',
  'https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', '2052213209030357');
  fbq('track', 'PageView');
  </script>
  <noscript><img height="1" width="1" style="display:none"
  src="https://www.facebook.com/tr?id=2052213209030357&ev=PageView&noscript=1"
  /></noscript>
  <!-- End Meta Pixel Code -->
'''


def paginas():
    for raiz, _, arquivos in os.walk(SITE):
        if os.sep + 'crm' in raiz:
            continue
        for nome in sorted(arquivos):
            if not nome.endswith('.html'):
                continue
            caminho = os.path.join(raiz, nome)
            rel = os.path.relpath(caminho, SITE).replace(os.sep, '/')
            if rel not in FORA:
                yield caminho


def main():
    for caminho in paginas():
        rel = os.path.relpath(caminho, SITE).replace(os.sep, '/')
        s = io.open(caminho, encoding='utf-8').read()
        if '</head>' not in s:
            print(f'  {rel:44s} sem <head>, pulado')
            continue
        # caminho relativo dos assets: o blog fica um nivel abaixo
        prefixo = '../' * rel.count('/')
        eventos = f'  <script src="{prefixo}assets/wh-eventos.js" defer></script>\n'

        novo, feito = s, []
        for marca, bloco in (('clarity.ms', CLARITY), ('fbevents.js', PIXEL), ('wh-eventos.js', eventos)):
            if marca not in novo:
                novo = novo.replace('</head>', bloco + '</head>', 1)
                feito.append(marca.split('.')[0])

        if novo != s:
            io.open(caminho, 'w', encoding='utf-8').write(novo)
        print(f'  {rel:44s} {"+ " + ", ".join(feito) if feito else "ja tinha tudo"}')


if __name__ == '__main__':
    main()
