/* AMPLIAR FOTO E PLANTA NA PROPRIA PAGINA (14/10/2026)
 *
 * O Clarity mostrou 71 toques "mortos" nas fichas do catalogo em 3 dias: o cliente
 * tocava na planta e na foto grande para ver de perto, e nada acontecia. As fotos
 * da galeria abriam em outra aba, o que no navegador do WhatsApp e do Instagram
 * tira a pessoa da ficha.
 *
 * Agora: toque na foto do topo, na planta ou numa foto da galeria abre a imagem
 * em tela cheia, aqui mesmo. Toque duplo aproxima (e arrastar passeia pela planta),
 * setas ou deslizar trocam de foto, X ou tocar fora fecha.
 * Escuta o documento, entao vale tambem para o que a pagina monta depois.
 */
(function () {
  'use strict';
  // [data-amplia]: foto de fundo (data-bg) que tambem abre; as da mesma secao viram um grupo (15/10, pagina principal).
  var ALVOS = '.hero-img, .planta-box img, .gallery a, .gallery img, [data-amplia]';
  var css = '' +
    '.amp{position:fixed;inset:0;z-index:99998;background:rgba(12,6,2,.94);display:none;}' +
    '.amp.on{display:block;}' +
    '.amp-rolo{position:absolute;inset:0;overflow:auto;-webkit-overflow-scrolling:touch;display:flex;align-items:center;justify-content:center;}' +
    '.amp-rolo img{max-width:100%;max-height:100%;object-fit:contain;display:block;margin:auto;user-select:none;-webkit-user-select:none;}' +
    '.amp.perto .amp-rolo{display:block;}' +
    '.amp.perto .amp-rolo img{max-width:none;max-height:none;width:250%;}' +
    '.amp-x,.amp-seta{position:absolute;z-index:2;border:none;background:rgba(255,253,248,.14);color:#fff;font:inherit;cursor:pointer;border-radius:999px;}' +
    '.amp-x{top:calc(12px + env(safe-area-inset-top));right:12px;width:44px;height:44px;font-size:26px;line-height:44px;}' +
    '.amp-seta{top:50%;transform:translateY(-50%);width:44px;height:44px;font-size:24px;line-height:44px;}' +
    '.amp-ant{left:10px;}.amp-prox{right:10px;}' +
    '.amp-dica{position:absolute;left:0;right:0;bottom:calc(14px + env(safe-area-inset-bottom));text-align:center;color:rgba(255,253,248,.7);font:500 12.5px Poppins,system-ui,sans-serif;pointer-events:none;}' +
    '.hero-img,.planta-box img,[data-amplia]{cursor:zoom-in;}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var caixa, rolo, img, dica, lista = [], pos = 0;
  function monta() {
    caixa = document.createElement('div');
    caixa.className = 'amp';
    caixa.innerHTML = '<div class="amp-rolo"><img alt=""></div>' +
      '<button class="amp-x" type="button" aria-label="Fechar">&times;</button>' +
      '<button class="amp-seta amp-ant" type="button" aria-label="Foto anterior">&#8249;</button>' +
      '<button class="amp-seta amp-prox" type="button" aria-label="Próxima foto">&#8250;</button>' +
      '<div class="amp-dica">Toque duas vezes para aproximar</div>';
    document.body.appendChild(caixa);
    rolo = caixa.querySelector('.amp-rolo'); img = caixa.querySelector('img'); dica = caixa.querySelector('.amp-dica');
    caixa.querySelector('.amp-x').addEventListener('click', fecha);
    caixa.querySelector('.amp-ant').addEventListener('click', function (e) { e.stopPropagation(); vai(-1); });
    caixa.querySelector('.amp-prox').addEventListener('click', function (e) { e.stopPropagation(); vai(1); });
    rolo.addEventListener('click', function (e) { if (e.target === rolo && !caixa.classList.contains('perto')) fecha(); });
    var ultimo = 0;
    img.addEventListener('click', function (e) {
      e.stopPropagation();
      var agora = Date.now();
      if (agora - ultimo < 350) {
        var perto = caixa.classList.toggle('perto');
        if (perto) { var r = img.getBoundingClientRect(); rolo.scrollLeft = (e.clientX - r.left) / r.width * img.scrollWidth - rolo.clientWidth / 2; rolo.scrollTop = (e.clientY - r.top) / r.height * img.scrollHeight - rolo.clientHeight / 2; }
        dica.textContent = perto ? 'Arraste para ver os detalhes · toque duas vezes para voltar' : 'Toque duas vezes para aproximar';
      }
      ultimo = agora;
    });
    var x0 = null;
    rolo.addEventListener('touchstart', function (e) { x0 = e.touches.length === 1 ? e.touches[0].clientX : null; }, { passive: true });
    rolo.addEventListener('touchend', function (e) {
      if (x0 === null || caixa.classList.contains('perto')) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 60) vai(dx < 0 ? 1 : -1);
    }, { passive: true });
    document.addEventListener('keydown', function (e) {
      if (!caixa.classList.contains('on')) return;
      if (e.key === 'Escape') fecha(); if (e.key === 'ArrowRight') vai(1); if (e.key === 'ArrowLeft') vai(-1);
    });
  }
  function mostra() {
    img.src = lista[pos];
    caixa.classList.remove('perto');
    dica.textContent = 'Toque duas vezes para aproximar';
    var varias = lista.length > 1;
    caixa.querySelector('.amp-ant').style.display = varias ? '' : 'none';
    caixa.querySelector('.amp-prox').style.display = varias ? '' : 'none';
  }
  function vai(d) { if (lista.length < 2) return; pos = (pos + d + lista.length) % lista.length; mostra(); }
  function abre(src, grupo) {
    if (!caixa) monta();
    lista = grupo && grupo.length ? grupo : [src];
    pos = Math.max(0, lista.indexOf(src));
    mostra();
    caixa.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    if (window.whEvento) try { window.whEvento('amplia_imagem'); } catch (e) { /* sem medicao, segue */ }
  }
  function fecha() { caixa.classList.remove('on', 'perto'); document.documentElement.style.overflow = ''; }

  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest(ALVOS) : null;
    if (!el) return;
    var a = el.closest('.gallery a');
    var fundo = function (x) { return x.getAttribute('data-amplia') || x.getAttribute('data-bg'); };
    if (el.hasAttribute('data-amplia')) {
      var sec = el.closest('section') || document;
      var grupo = [].map.call(sec.querySelectorAll('[data-amplia]'), fundo).filter(Boolean);
      if (fundo(el)) { e.preventDefault(); abre(fundo(el), grupo); }
      return;
    }
    var src = a ? a.getAttribute('href') : (el.currentSrc || el.src);
    if (!src) return;
    e.preventDefault();
    var noGrupo = el.closest('.planta-box') ? [src]
      : [].map.call(document.querySelectorAll('.gallery a'), function (x) { return x.getAttribute('href'); });
    if (!a && el.classList.contains('hero-img') && noGrupo.indexOf(src) < 0) noGrupo = [src].concat(noGrupo);
    abre(src, noGrupo);
  });
})();
