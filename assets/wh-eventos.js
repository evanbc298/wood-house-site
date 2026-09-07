/* ─────────────────────────────────────────────────────────────
   Wood House — evento de conversão do Meta

   Dispara o evento padrão "Lead" quando alguém clica em qualquer
   botão de WhatsApp do site. É esse sinal que permite ao Meta
   otimizar a campanha por conversa em vez de por clique solto.

   Por que assim: o formulário do Meta está travado na permissão da
   Página, e nenhum formulário do site manda lead pro CRM. O clique
   no WhatsApp é a única intenção real e mensurável que existe hoje.

   Usa delegação num listener só, então vale pros ~99 links que já
   existem e pros que forem criados depois, sem tocar em cada botão.
   ───────────────────────────────────────────────────────────── */
(function () {
  "use strict";

  var JANELA_ANTI_DUPLO = 1500; // ms; evita contar 2x o duplo clique
  var ultimoEnvio = 0;

  function ehLinkDeWhatsApp(href) {
    if (!href) return false;
    return href.indexOf("wa.me/") !== -1 ||
           href.indexOf("api.whatsapp.com") !== -1 ||
           href.indexOf("web.whatsapp.com") !== -1;
  }

  // Sobe do elemento clicado até achar a âncora. Cobre o caso comum
  // de o clique cair num <span> ou num ícone dentro do botão.
  function acoraMaisProxima(no) {
    while (no && no !== document) {
      if (no.tagName === "A") return no;
      no = no.parentNode;
    }
    return null;
  }

  document.addEventListener("click", function (evento) {
    var alvo = evento.target;
    if (!alvo || alvo.nodeType !== 1) return;

    var link = acoraMaisProxima(alvo);
    if (!link) return;

    var href = link.getAttribute("href") || "";
    if (!ehLinkDeWhatsApp(href)) return;

    var agora = Date.now();
    if (agora - ultimoEnvio < JANELA_ANTI_DUPLO) return;
    ultimoEnvio = agora;

    // Se o pixel não carregou (bloqueador, página sem pixel), sai
    // quieto. O clique segue normalmente de qualquer jeito.
    if (typeof window.fbq !== "function") return;

    try {
      window.fbq("track", "Lead", {
        content_name: document.title || location.pathname,
        content_category: "whatsapp",
        source_url: location.pathname
      });
    } catch (e) {
      /* nunca deixar o rastreamento atrapalhar o clique do usuário */
    }
  }, true);
})();
