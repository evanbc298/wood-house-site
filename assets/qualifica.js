/* QUALIFICACAO NO SITE (09/10/2026)
 *
 * Os botoes de WhatsApp do site mandavam o visitante direto para a conversa,
 * sem pergunta nenhuma: a equipe atendia sem saber se a pessoa tem terreno, e
 * o contato nem chegava ao CRM. Este arquivo abre, no clique desses botoes, seis
 * perguntas rapidas (as mesmas do formulario do anuncio). A resposta vai para a
 * Central como lead de origem "Site", e a primeira mensagem sai pelo WhatsApp
 * da empresa, como acontece com os leads do Meta.
 *
 * Tres cuidados para nao perder contato:
 *   - em todo passo ha o link "Prefiro ir direto ao WhatsApp";
 *   - quem ja respondeu nesta visita vai direto nos proximos cliques;
 *   - se o envio falhar, o botao vira o WhatsApp de sempre.
 * Nao entram: os links do rodape, o de corretor/parceiro, o de fornecedor e
 * qualquer link marcado com data-direto.
 *
 * Tudo aqui dentro (estilo e janela) para bastar uma linha <script> na pagina.
 */
(function () {
  'use strict';
  var DESTINO = 'https://central-wh-server-production.up.railway.app/api/public/lead';
  var FONE = '554730910877';
  var CHAVE = 'wh_qualificou';
  var FORA = /corretor|parceir|fornecedor|plano\+?direto|plano%20direto/i;

  function jaRespondeu() { try { return sessionStorage.getItem(CHAVE) === '1'; } catch (e) { return false; } }
  function marcaRespondeu() { try { sessionStorage.setItem(CHAVE, '1'); } catch (e) { /* sem armazenamento, segue */ } }

  var css = '' +
    '.whq-fundo{position:fixed;inset:0;z-index:99999;background:rgba(26,8,0,.72);display:none;align-items:flex-end;justify-content:center;font-family:Poppins,system-ui,-apple-system,sans-serif;}' +
    '.whq-fundo.on{display:flex;}' +
    '.whq{background:#FFFDF8;color:#5C1A00;width:100%;max-width:460px;border-radius:20px 20px 0 0;padding:22px 22px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.3);max-height:92vh;overflow:auto;position:relative;}' +
    '@media (min-width:640px){.whq-fundo{align-items:center;}.whq{border-radius:20px;padding:28px 28px 22px;}}' +
    '.whq-x{position:absolute;top:10px;right:12px;width:38px;height:38px;border:none;background:none;font-size:26px;line-height:1;color:#9A7A5C;cursor:pointer;}' +
    '.whq-topo{display:flex;align-items:baseline;justify-content:space-between;gap:12px;padding-right:34px;}' +
    '.whq h2{font-size:20px;font-weight:800;line-height:1.2;margin:0;color:#5C1A00;}' +
    '.whq-conta{font-size:12px;color:#9A7A5C;white-space:nowrap;}' +
    '.whq-barra{height:4px;background:#EADBC0;border-radius:4px;margin:12px 0 6px;overflow:hidden;}' +
    '.whq-barra i{display:block;height:100%;background:#CDA96C;border-radius:4px;transition:width .25s;}' +
    '.whq-dica{font-size:13px;color:#9A7A5C;margin:0 0 6px;line-height:1.45;}' +
    '.whq-perg{display:none;padding-top:10px;}.whq-perg.on{display:block;}' +
    '.whq-rot{display:block;font-size:17px;font-weight:700;margin-bottom:12px;line-height:1.3;}' +
    '.whq-chips{display:flex;flex-direction:column;gap:8px;}' +
    '.whq-chips label{display:block;cursor:pointer;}' +
    '.whq-chips input{position:absolute;opacity:0;pointer-events:none;}' +
    '.whq-chips span{display:block;border:1.5px solid #E7D6B8;border-radius:12px;padding:13px 16px;font-size:15px;font-weight:600;background:#fff;}' +
    '.whq-chips input:checked+span{border-color:#5C1A00;background:#FFF5E3;}' +
    '.whq-chips input:focus-visible+span{outline:2px solid #CDA96C;outline-offset:2px;}' +
    '.whq-campo{width:100%;box-sizing:border-box;border:1.5px solid #E7D6B8;border-radius:12px;padding:13px 14px;font:inherit;font-size:16px;color:#5C1A00;background:#fff;margin-bottom:10px;}' +
    '.whq-campo:focus{outline:none;border-color:#5C1A00;}' +
    '.whq-sub{display:block;font-size:13px;font-weight:600;margin:0 0 5px;color:#6B3A1E;}' +
    '.whq-btn{display:block;width:100%;border:none;border-radius:999px;padding:14px 18px;font:inherit;font-size:15px;font-weight:700;cursor:pointer;margin-top:12px;background:#128C5E;color:#fff;text-align:center;text-decoration:none;box-sizing:border-box;}' +
    '.whq-btn[disabled]{opacity:.6;cursor:default;}' +
    '.whq-rodape{display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:14px;}' +
    '.whq-volta{border:none;background:none;font:inherit;font-size:13px;color:#9A7A5C;cursor:pointer;padding:6px 0;}' +
    '.whq-direto{font-size:13px;color:#9A7A5C;text-decoration:underline;}' +
    '.whq-erro{font-size:13px;color:#B91C1C;min-height:18px;margin-top:8px;}' +
    '.whq-lgpd{font-size:11px;color:#9A7A5C;margin:12px 0 0;line-height:1.45;}.whq-lgpd a{color:inherit;}' +
    '.whq-ok{text-align:center;padding:8px 0 4px;}.whq-ok .ic{width:54px;height:54px;border-radius:50%;background:#E3F5EC;color:#128C5E;font-size:28px;line-height:54px;margin:0 auto 12px;}' +
    '.whq-ok p{font-size:14.5px;color:#6B3A1E;line-height:1.55;margin:8px 0 0;}';

  var PERGS = [
    { n: 'terreno', t: 'Você já possui terreno?', o: [['Sim, já tenho o terreno', 'Sim, já tenho'], ['Não, ainda estou procurando', 'Ainda procurando']] },
    { n: 'prazo', t: 'Quando pretende iniciar a obra?', o: [['Imediato', 'Imediato'], ['Em até 6 meses', 'Em até 6 meses'], ['Ainda pesquisando, sem prazo definido', 'Ainda pesquisando']] },
    { n: 'quartos', t: 'Quantos quartos?', o: [['2', '2'], ['3', '3'], ['4 ou mais', '4 ou mais']] },
    { n: 'faixa', t: 'Quanto pretende investir na casa?', o: [['Até R$ 250 mil', 'Até R$ 250 mil'], ['R$ 250 mil a R$ 350 mil', 'R$ 250 a 350 mil'], ['R$ 350 mil a R$ 450 mil', 'R$ 350 a 450 mil'], ['Acima de R$ 450 mil', 'Acima de R$ 450 mil']] }
  ];
  var TOTAL = PERGS.length + 2;       // + cidade + nome e WhatsApp

  var fundo, caixa, passo = 0, linkOriginal = '', resp = {};

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function monta() {
    var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);
    fundo = document.createElement('div'); fundo.className = 'whq-fundo'; fundo.setAttribute('role', 'dialog'); fundo.setAttribute('aria-modal', 'true'); fundo.setAttribute('aria-label', 'Antes de falar com a gente');
    var h = '<div class="whq"><button type="button" class="whq-x" aria-label="Fechar">&times;</button>' +
      '<div id="whqForm"><div class="whq-topo"><h2>Antes de te chamar</h2><span class="whq-conta" id="whqConta"></span></div>' +
      '<div class="whq-barra"><i id="whqBarra"></i></div>' +
      '<p class="whq-dica" id="whqDica">Seis perguntas rápidas, para a gente já te responder com o que serve para o seu caso.</p>';
    PERGS.forEach(function (p) {
      h += '<div class="whq-perg"><span class="whq-rot">' + esc(p.t) + '</span><div class="whq-chips">' +
        p.o.map(function (o) { return '<label><input type="radio" name="whq_' + p.n + '" value="' + esc(o[0]) + '"><span>' + esc(o[1]) + '</span></label>'; }).join('') + '</div></div>';
    });
    h += '<div class="whq-perg"><label class="whq-rot" for="whqCidade">Em qual cidade pretende construir?</label>' +
      '<input class="whq-campo" id="whqCidade" type="text" autocomplete="address-level2" maxlength="60" placeholder="Cidade e estado">' +
      '<button type="button" class="whq-btn" id="whqSeguir">Continuar</button></div>' +
      '<div class="whq-perg"><span class="whq-rot">Para onde a gente responde?</span>' +
      '<label class="whq-sub" for="whqNome">Seu nome</label><input class="whq-campo" id="whqNome" type="text" autocomplete="name" maxlength="80">' +
      '<label class="whq-sub" for="whqFone">WhatsApp com DDD</label><input class="whq-campo" id="whqFone" type="tel" inputmode="tel" autocomplete="tel" maxlength="20" placeholder="(47) 99999-9999">' +
      '<div style="position:absolute;left:-9999px" aria-hidden="true"><label>Website<input type="text" id="whqHp" tabindex="-1" autocomplete="off"></label></div>' +
      '<button type="button" class="whq-btn" id="whqEnviar">Quero falar sobre a minha casa</button>' +
      '<p class="whq-lgpd">Usamos esses dados só para falar com você sobre o seu projeto. <a href="politica-privacidade.html" target="_blank" rel="noopener">Política de privacidade</a>.</p></div>' +
      '<div class="whq-erro" id="whqErro" role="alert"></div>' +
      '<div class="whq-rodape"><button type="button" class="whq-volta" id="whqVolta">&lsaquo; Voltar</button>' +
      '<a class="whq-direto" id="whqDireto" target="_blank" rel="noopener">Prefiro ir direto ao WhatsApp</a></div></div>' +
      '<div class="whq-ok" id="whqOk" style="display:none"><div class="ic">&#10003;</div><h2>Recebemos, obrigado!</h2>' +
      '<p>A nossa equipe vai te chamar no WhatsApp. Se preferir, você já pode abrir a conversa agora.</p>' +
      '<a class="whq-btn" id="whqAbrir" target="_blank" rel="noopener">Abrir o WhatsApp</a></div></div>';
    fundo.innerHTML = h;
    document.body.appendChild(fundo);
    caixa = fundo.querySelector('.whq');

    fundo.addEventListener('click', function (e) { if (e.target === fundo) fecha(); });
    fundo.querySelector('.whq-x').addEventListener('click', fecha);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && fundo.classList.contains('on')) fecha(); });
    Array.prototype.forEach.call(fundo.querySelectorAll('.whq-chips input'), function (r) {
      r.addEventListener('change', function () { setTimeout(function () { mostra(passo + 1, true); }, 200); });
    });
    el('whqSeguir').addEventListener('click', function () {
      if (!el('whqCidade').value.trim()) { erro('Informe a cidade.'); return; }
      mostra(passo + 1, true);
    });
    el('whqCidade').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); el('whqSeguir').click(); } });
    el('whqVolta').addEventListener('click', function () { mostra(passo - 1); });
    el('whqFone').addEventListener('input', function () {
      var f = el('whqFone'), d = f.value.replace(/\D/g, '').slice(0, 11), s = d;
      if (d.length > 2) s = '(' + d.slice(0, 2) + ') ' + d.slice(2);
      if (d.length > 6) s = '(' + d.slice(0, 2) + ') ' + d.slice(2, d.length - 4) + '-' + d.slice(d.length - 4);
      f.value = s;
    });
    // o aviso de erro some assim que a pessoa volta a digitar
    ['whqNome', 'whqFone', 'whqCidade'].forEach(function (id) { el(id).addEventListener('input', function () { erro(''); }); });
    el('whqEnviar').addEventListener('click', envia);
    // Quem pula a pergunta tambem conta como "ja passou por aqui".
    el('whqDireto').addEventListener('click', function () { marcaRespondeu(); evento('site_pulou_perguntas'); setTimeout(fecha, 100); });
    el('whqAbrir').addEventListener('click', function () { setTimeout(fecha, 100); });
  }
  function el(id) { return document.getElementById(id); }
  function erro(t) { el('whqErro').textContent = t || ''; }
  function evento(n) { try { window.clarity('event', n); } catch (e) { /* sem Clarity */ } }

  function mostra(n, foco) {
    passo = Math.max(0, Math.min(TOTAL - 1, n));
    var ps = fundo.querySelectorAll('.whq-perg');
    for (var i = 0; i < ps.length; i++) ps[i].classList.toggle('on', i === passo);
    el('whqConta').textContent = (passo + 1) + ' de ' + TOTAL;
    el('whqBarra').style.width = Math.round((passo + 1) / TOTAL * 100) + '%';
    el('whqDica').style.display = passo === 0 ? '' : 'none';
    el('whqVolta').style.visibility = passo > 0 ? 'visible' : 'hidden';
    erro('');
    if (foco) { var c = ps[passo].querySelector('.whq-campo'); if (c) c.focus(); }
  }
  function marcado(n) { var r = fundo.querySelector('input[name="whq_' + n + '"]:checked'); return r ? r.value : ''; }

  function abre(href) {
    if (!fundo) monta();
    linkOriginal = href;
    el('whqDireto').href = href; el('whqAbrir').href = href;
    el('whqForm').style.display = ''; el('whqOk').style.display = 'none';
    mostra(0);
    fundo.classList.add('on');
    document.documentElement.style.overflow = 'hidden';
    evento('site_abriu_perguntas');
  }
  function fecha() { if (fundo) fundo.classList.remove('on'); document.documentElement.style.overflow = ''; }

  // O que a pessoa estava olhando: o texto que o botao ja mandaria no WhatsApp
  // e a pagina. Vai como nota na ficha do lead.
  function contexto() {
    var partes = ['Veio pelo site'];
    try {
      var m = /[?&]text=([^&]*)/.exec(linkOriginal);
      if (m) { var t = decodeURIComponent(m[1].replace(/\+/g, ' ')).replace(/\s+/g, ' ').trim().slice(0, 140); if (t) partes.push('botão: "' + t + '"'); }
    } catch (e) { /* texto estranho no link: fica sem */ }
    var pg = (location.pathname.split('/').pop() || 'inicio') + (location.search && /[?&]m=/.test(location.search) ? location.search.slice(0, 40) : '');
    partes.push('página: ' + pg.slice(0, 60));
    try {
      var q = new URLSearchParams(location.search), a = [];
      [['utm_source', 'origem'], ['utm_campaign', 'campanha'], ['utm_content', 'anúncio']].forEach(function (p) {
        var v = (q.get(p[0]) || '').replace(/[^\w\sÀ-ÿ.-]/g, ' ').trim().slice(0, 50); if (v) a.push(p[1] + ' ' + v);
      });
      if (a.length) partes.push(a.join(', '));
    } catch (e) { /* navegador antigo */ }
    return partes.join(' | ');
  }

  function envia() {
    if (el('whqHp').value) return;
    var d = {
      terreno: marcado('terreno'), prazo: marcado('prazo'), dormitorios: marcado('quartos'), faixa_investimento: marcado('faixa'),
      regiao: el('whqCidade').value.trim(), nome: el('whqNome').value.trim(), telefone: el('whqFone').value.replace(/\D/g, ''),
      origem: 'Site', nota_extra: contexto()
    };
    var faltas = [[!d.terreno, 0], [!d.prazo, 1], [!d.dormitorios, 2], [!d.faixa_investimento, 3], [!d.regiao, 4]];
    for (var i = 0; i < faltas.length; i++) if (faltas[i][0]) { mostra(faltas[i][1]); erro('Falta responder esta.'); return; }
    if (!d.nome) { erro('Informe o seu nome.'); return; }
    if (d.telefone.length < 10) { erro('Informe o WhatsApp com DDD.'); return; }
    erro('');
    var b = el('whqEnviar'); b.disabled = true; b.textContent = 'Enviando...';
    fetch(DESTINO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function () {
        marcaRespondeu();
        el('whqForm').style.display = 'none'; el('whqOk').style.display = 'block';
        try { window.fbq('track', 'Lead'); } catch (e) { /* sem pixel */ }
        evento('lead_site');
      })
      .catch(function () {
        // Nao finge que enviou: o botao vira o WhatsApp de sempre.
        b.disabled = false; b.textContent = 'Quero falar sobre a minha casa';
        el('whqErro').innerHTML = 'Não conseguimos enviar agora. <a href="' + esc(linkOriginal) + '" target="_blank" rel="noopener">Chame a gente no WhatsApp</a>.';
      });
  }

  // O clique em qualquer botao de WhatsApp do site. Vale tambem para os botoes
  // que a pagina cria depois (os dos modelos), porque escuta o documento.
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href*="wa.me/' + FONE + '"]') : null;
    if (!a || a.hasAttribute('data-direto')) return;
    if (fundo && fundo.contains(a)) return;                 // os links de dentro da propria janela
    if (a.closest('footer') || FORA.test(a.getAttribute('href') || '')) return;
    if (jaRespondeu()) return;
    if (e.ctrlKey || e.metaKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    abre(a.href);
  }, true);
})();
