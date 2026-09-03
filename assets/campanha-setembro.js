/* ============================================================
   Campanha de setembro — faixa de aviso do brinde
   Wood House Construtora

   TUDO que se edita está no bloco CAMPANHA abaixo.
   Para desligar a campanha: mude ATIVA para false.
   ============================================================ */

const CAMPANHA = {
  ativa: true,

  // ATENÇÃO: data assumida, o usuário ainda não confirmou o prazo real.
  // Formato AAAA-MM-DD. Depois desta data a faixa some sozinha.
  encerraEm: '2026-09-30',

  titulo: 'Fechou projeto em setembro, o spa vai junto.',
  detalhe: 'Spa Jurere 160 com 10 jatos, aquecimento e cromoterapia.',
  textoBotao: 'Quero saber mais',

  foto: 'assets/spa-jurere.jpg',
  whatsapp: '554797194337',
  mensagem: 'Olá! Vi a campanha de setembro no site e quero saber mais sobre o spa que vai junto com o projeto.',

  // troque a chave se quiser que quem já fechou veja a faixa de novo
  chave: 'wh-campanha-set-2026',
};

(function () {
  if (!CAMPANHA.ativa) return;

  // some sozinha depois do prazo
  const fim = new Date(CAMPANHA.encerraEm + 'T23:59:59-03:00');
  if (!isNaN(fim) && new Date() > fim) return;

  const css = `
    .wh-camp {
      position: fixed; left: 0; right: 0; bottom: 0; z-index: 9000;
      background: #1C0C00; color: #FFF5E3;
      border-top: 1px solid rgba(205,169,108,0.35);
      box-shadow: 0 -8px 30px rgba(0,0,0,0.28);
      font-family: 'Poppins', system-ui, -apple-system, sans-serif;
      transform: translateY(110%); transition: transform .45s cubic-bezier(.2,.8,.2,1);
    }
    .wh-camp.on { transform: translateY(0); }
    .wh-camp-in {
      max-width: 1180px; margin: 0 auto; padding: 14px 56px 14px 18px;
      display: flex; align-items: center; gap: 16px;
    }
    .wh-camp img {
      width: 52px; height: 52px; border-radius: 10px; object-fit: cover;
      flex-shrink: 0; border: 1.5px solid rgba(255,245,227,0.7);
    }
    .wh-camp-txt { flex: 1; min-width: 0; }
    .wh-camp-kick {
      font-size: 10.5px; font-weight: 700; letter-spacing: .18em;
      color: #CDA96C; margin-bottom: 3px;
    }
    .wh-camp-tit {
      font-size: 15px; font-weight: 700; line-height: 1.25; color: #FFF5E3;
    }
    .wh-camp-det {
      font-size: 12.5px; font-weight: 400; line-height: 1.35;
      color: rgba(255,245,227,0.62); margin-top: 2px;
    }
    .wh-camp-btn {
      flex-shrink: 0; background: #CDA96C; color: #2A1200;
      text-decoration: none; border-radius: 99px;
      padding: 11px 22px; font-size: 13.5px; font-weight: 700;
      white-space: nowrap; transition: background .2s;
    }
    .wh-camp-btn:hover { background: #DBBB83; }
    .wh-camp-x {
      position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
      background: none; border: 0; cursor: pointer; padding: 8px; line-height: 0;
      color: rgba(255,245,227,0.45); font-size: 20px; font-weight: 400;
    }
    .wh-camp-x:hover { color: rgba(255,245,227,0.9); }

    @media (max-width: 720px) {
      .wh-camp-in { padding: 12px 44px 12px 14px; gap: 12px; flex-wrap: wrap; }
      .wh-camp img { width: 44px; height: 44px; }
      .wh-camp-tit { font-size: 14px; }
      .wh-camp-det { display: none; }
      .wh-camp-btn { width: 100%; text-align: center; padding: 11px 18px; }
    }

    /* ─── bloco dentro da página do modelo ─── */
    .wh-brinde {
      display: flex; align-items: center; gap: 20px;
      background: #1C0C00; border-radius: 16px;
      padding: 22px 24px; margin: 0 0 22px;
      border: 1px solid rgba(205,169,108,0.30);
    }
    .wh-brinde img {
      width: 92px; height: 92px; border-radius: 12px; object-fit: cover;
      flex-shrink: 0; border: 2px solid rgba(255,245,227,0.75);
    }
    .wh-brinde-txt { flex: 1; min-width: 0; }
    .wh-brinde-kick {
      font-size: 11px; font-weight: 700; letter-spacing: .2em;
      color: #CDA96C; margin-bottom: 6px;
    }
    .wh-brinde-tit {
      font-size: 21px; font-weight: 800; line-height: 1.2;
      color: #FFF5E3; letter-spacing: -0.01em; margin-bottom: 7px;
    }
    .wh-brinde-det {
      font-size: 14px; font-weight: 400; line-height: 1.5;
      color: rgba(255,245,227,0.72);
    }
    .wh-brinde-det i { font-style: normal; color: rgba(255,245,227,0.48); }

    @media (max-width: 640px) {
      .wh-brinde { flex-direction: column; align-items: flex-start; gap: 14px; padding: 20px; }
      .wh-brinde img { width: 72px; height: 72px; }
      .wh-brinde-tit { font-size: 19px; }
    }
  `;

  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  const link = 'https://wa.me/' + CAMPANHA.whatsapp + '?text=' + encodeURIComponent(CAMPANHA.mensagem);

  /* API usada pelas páginas de modelo (vendas.html e modelo.html).
     Elas chamam WHCampanha.bloco() dentro do template do modal, logo acima do
     botão de WhatsApp. Se a campanha estiver desligada ou vencida, o objeto não
     existe e o template simplesmente não renderiza nada. */
  window.WHCampanha = {
    bloco: function () {
      return ''
        + '<div class="wh-brinde">'
        +   '<img src="' + CAMPANHA.foto + '" alt="Spa Jurere 160">'
        +   '<div class="wh-brinde-txt">'
        +     '<div class="wh-brinde-kick">BRINDE DE SETEMBRO</div>'
        +     '<div class="wh-brinde-tit">Fechou este projeto em setembro, o spa vai junto.</div>'
        +     '<div class="wh-brinde-det">Spa Jurere 160 com 10 jatos, aquecimento e cromoterapia, '
        +       'instalado junto com a obra. <i>O deck não está incluso, e a gente também faz para você.</i></div>'
        +   '</div>'
        + '</div>';
    }
  };

  // a faixa respeita quem já fechou; o bloco do modelo continua aparecendo
  try {
    if (localStorage.getItem(CAMPANHA.chave) === 'fechada') return;
  } catch (e) { /* navegador sem storage, segue mostrando */ }

  const bar = document.createElement('div');
  bar.className = 'wh-camp';
  bar.setAttribute('role', 'region');
  bar.setAttribute('aria-label', 'Campanha de setembro');
  bar.innerHTML =
    '<div class="wh-camp-in">' +
      '<img src="' + CAMPANHA.foto + '" alt="Spa Jurere 160">' +
      '<div class="wh-camp-txt">' +
        '<div class="wh-camp-kick">BRINDE DE SETEMBRO</div>' +
        '<div class="wh-camp-tit">' + CAMPANHA.titulo + '</div>' +
        '<div class="wh-camp-det">' + CAMPANHA.detalhe + '</div>' +
      '</div>' +
      '<a class="wh-camp-btn" href="' + link + '" target="_blank" rel="noopener">' + CAMPANHA.textoBotao + '</a>' +
      '<button class="wh-camp-x" aria-label="Fechar aviso">&times;</button>' +
    '</div>';

  // a faixa é fixa no rodapé, então precisa abrir espaço embaixo para não
  // tapar o fim da página nem o botão flutuante do WhatsApp
  const folga = document.createElement('style');
  folga.textContent = `
    body.wh-camp-on { padding-bottom: var(--wh-camp-h, 0px) !important; }
    body.wh-camp-on .wpp-wrap { bottom: calc(32px + var(--wh-camp-h, 0px)) !important; }
  `;
  document.head.appendChild(folga);

  function medir() {
    document.documentElement.style.setProperty('--wh-camp-h', bar.offsetHeight + 'px');
  }

  function limpar() {
    document.body.classList.remove('wh-camp-on');
    document.documentElement.style.removeProperty('--wh-camp-h');
    window.removeEventListener('resize', medir);
  }

  bar.querySelector('.wh-camp-x').addEventListener('click', function () {
    bar.classList.remove('on');
    limpar();
    try { localStorage.setItem(CAMPANHA.chave, 'fechada'); } catch (e) {}
    setTimeout(function () { bar.remove(); }, 450);
  });

  // O script roda no <head>, antes do body existir, para que WHCampanha já esteja
  // disponível quando as páginas de modelo montarem o modal. Por isso a faixa só
  // é inserida quando o documento estiver pronto.
  function montarBarra() {
    document.body.appendChild(bar);

    // entra depois de um respiro, para não competir com o carregamento da página
    setTimeout(function () {
      medir();
      document.body.classList.add('wh-camp-on');
      bar.classList.add('on');
      window.addEventListener('resize', medir);
      window.addEventListener('scroll', agendarChecagem, { passive: true });
      agendarChecagem();
    }, 1400);
  }

  // Se o bloco da campanha estiver visível na página do modelo, a faixa se recolhe.
  // Dizer a mesma coisa duas vezes na mesma tela enfraquece a oferta.
  let pendente = false;
  function agendarChecagem() {
    if (pendente) return;
    pendente = true;
    requestAnimationFrame(function () {
      pendente = false;
      if (!bar.isConnected) return;
      const bloco = document.querySelector('.wh-brinde');
      let sobrepondo = false;
      if (bloco) {
        const r = bloco.getBoundingClientRect();
        sobrepondo = r.bottom > 0 && r.top < window.innerHeight;
      }
      bar.classList.toggle('on', !sobrepondo);
      document.body.classList.toggle('wh-camp-on', !sobrepondo);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', montarBarra);
  } else {
    montarBarra();
  }
})();
