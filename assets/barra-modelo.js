/* BARRA FIXA DAS PAGINAS DE MODELO (14/10/2026)
 *
 * No celular, o unico convite para conversar ficava no fim da pagina, depois da
 * planta, das etapas e das perguntas. Quem se interessava no meio do caminho
 * precisava rolar ate o fim. Esta barra fica presa no rodape da tela com
 * "Quero esse modelo no meu terreno" e leva ao mesmo WhatsApp do botao do fim
 * (por isso passa pelas seis perguntas de qualifica.js, como ele).
 *
 * Some quando o convite do fim da pagina aparece, para nao ficarem dois botoes
 * iguais na tela. So no celular: no computador o botao do fim ja esta perto.
 *
 * Serve as duas paginas de modelo: as fixas (modelos/*.html) e a montada na hora
 * (modelo.html?m=), que cria o botao do fim depois; por isso o link e lido no clique.
 */
(function () {
  'use strict';
  if (!window.matchMedia || !matchMedia('(max-width: 760px)').matches) return;

  var css = '' +
    '.whb{position:fixed;left:0;right:0;bottom:0;z-index:9000;padding:10px 14px calc(10px + env(safe-area-inset-bottom));' +
    'background:rgba(255,253,248,.96);box-shadow:0 -6px 24px rgba(60,20,0,.14);transform:translateY(110%);transition:transform .3s ease;' +
    'font-family:Poppins,system-ui,-apple-system,sans-serif;}' +
    '.whb.on{transform:none;}' +
    '.whb a{display:flex;align-items:center;justify-content:center;gap:9px;background:#25D366;color:#fff;text-decoration:none;' +
    'border-radius:12px;padding:14px 16px;font-size:15px;font-weight:700;}' +
    'body.whb-pad{padding-bottom:84px;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var ZAP = '<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.8 14.2c-.2.6-1.4 1.2-2 1.3-.5.1-1.1.1-1.8-.1-.4-.1-.9-.3-1.6-.6-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.4.7-.4h.5c.2 0 .4 0 .6.4.2.5.7 1.8.8 1.9.1.2.1.3 0 .5-.1.2-.1.3-.3.5l-.4.5c-.1.2-.3.4-.1.7.2.3.9 1.4 1.8 2.3 1.3 1.2 2.4 1.6 2.7 1.8.3.2.5.1.7-.1l.6-.7c.2-.3.4-.2.7-.1.3.1 1.7.8 2 .9.3.1.5.2.6.3.1.2.1.7-.1 1.3z"/></svg>';

  function inicia() {
    var barra = document.createElement('div');
    barra.className = 'whb';
    barra.innerHTML = '<a href="https://wa.me/554730910877" target="_blank" rel="noopener">' + ZAP + 'Quero esse modelo no meu terreno</a>';
    document.body.appendChild(barra);
    document.body.classList.add('whb-pad');
    var link = barra.querySelector('a');

    // O link e o mesmo do botao do fim; lido no clique, antes de qualifica.js (que escuta o documento).
    link.addEventListener('click', function () {
      var fim = document.querySelector('.cta .wabtn');
      if (fim) link.href = fim.href;
    });

    // Aparece depois da primeira tela; some quando o convite do fim esta visivel.
    var noFim = false;
    function atualiza() { barra.classList.toggle('on', window.scrollY > window.innerHeight * 0.6 && !noFim); }
    window.addEventListener('scroll', atualiza, { passive: true });
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function (es) { es.forEach(function (e) { noFim = e.isIntersecting; }); atualiza(); });
      var olha = function () { var c = document.querySelector('.cta'); if (c) { obs.observe(c); return true; } return false; };
      if (!olha()) { var mo = new MutationObserver(function () { if (olha()) mo.disconnect(); }); mo.observe(document.body, { childList: true, subtree: true }); }
    }
    atualiza();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', inicia); else inicia();
})();
