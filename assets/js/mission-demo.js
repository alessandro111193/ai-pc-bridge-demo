/* Mission Control — entirely local demonstration; no commands or API calls. */
(() => {
  "use strict";
  const root = document.querySelector("#missione-live");
  if (!root) return;
  const $ = selector => root.querySelector(selector);
  const stages = [
    {
      title: "Richiesta ricevuta",
      info: "Il Bridge individua il progetto selezionato e verifica gli accessi autorizzati.",
      terminal: "$ bridge project inspect\n✓ Progetto selezionato: il mio sito\n✓ Accesso alla cartella autorizzata",
      page: "Controllo del sito",
      detail: "La pagina sarà verificata durante la simulazione.",
      log: "Richiesta registrata nel progetto."
    },
    {
      title: "Terminale aperto",
      info: "L'IA legge i file autorizzati ed esegue i test disponibili.",
      terminal: "$ git status\nOn branch main\n$ npm test\n✕ Errore: componente non caricato",
      page: "Controllo del sito",
      detail: "Il sistema ha rilevato un problema.",
      log: "Diagnosi avviata · controlli sul progetto."
    },
    {
      title: "Errore individuato nel browser",
      info: "La verifica dell'anteprima individua il problema di caricamento.",
      terminal: "$ inspect browser\n✕ Risorsa non trovata: app.js\n→ Controllo percorso asset",
      page: "Errore di caricamento",
      detail: "La pagina non riesce a caricare uno script.",
      log: "Problema individuato: percorso dello script."
    },
    {
      title: "Correzione e test",
      info: "La modifica di esempio viene applicata e verificata con nuovi test.",
      terminal: "$ edit index.html\n✓ Percorso asset corretto\n$ npm test\n✓ Test completati\n$ verify preview\n✓ Pagina caricata",
      page: "Sito ripristinato",
      detail: "La pagina si carica correttamente dopo la verifica.",
      log: "Correzione verificata · risultato da controllare."
    },
    {
      title: "Control Room aggiornata",
      info: "L'attività si sposta su Fatto e il checkpoint di esempio viene registrato.",
      terminal: "$ bridge project checkpoint\n✓ Task completato\n✓ Checkpoint salvato\n✓ Pronto per il prossimo lavoro",
      page: "Sito ripristinato",
      detail: "Anteprima corretta, test eseguiti.",
      log: "Task completato · checkpoint di esempio salvato."
    }
  ];
  const play = $("#mission-play");
  const reset = $("#mission-reset");
  const stage = $(".mission-stage");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");
  let step = -1;
  let timer = null;
  let isPlaying = false;

  const noMotion = () => reduced.matches || document.documentElement.classList.contains("motion-off");
  const stopTimer = () => {
    if (timer !== null) clearTimeout(timer);
    timer = null;
    isPlaying = false;
    stage.classList.remove("is-playing");
  };
  const task = (finished) => {
    const el = document.createElement("div");
    el.className = "mission-task" + (finished ? " done" : "");
    el.textContent = (finished ? "✓ " : "") + "Risolvere errore sito";
    return el;
  };
  function show(index) {
    step = index;
    const data = stages[index];
    $("#mission-terminal").textContent = data.terminal;
    const page = $("#mission-page");
    page.className = "mission-page" + (index === 2 ? " problem" : index >= 3 ? " fixed" : "");
    page.querySelector("strong").textContent = data.page;
    page.querySelector("p").textContent = data.detail;
    $("#mission-status").textContent = data.title;
    $("#mission-explain").textContent = data.info;
    $("#mission-log").textContent = data.log;
    $("#mission-todo").replaceChildren();
    $("#mission-doing").replaceChildren();
    $("#mission-done").replaceChildren();
    (index === 4 ? $("#mission-done") : $("#mission-doing")).append(task(index === 4));
    root.querySelectorAll("[data-phase]").forEach((element, i) => {
      element.classList.toggle("active", i === index);
      element.classList.toggle("complete", i < index);
    });
    root.dataset.missionStep = String(index);
    root.dispatchEvent(new CustomEvent("aipc:mission-phase", {detail: {step: index, title: data.title}}));
    if (index === 4) {
      stopTimer();
      play.disabled = false;
      play.textContent = "▶ Rivedi la missione";
    }
  }
  function advance() {
    if (!isPlaying || step >= stages.length - 1) return;
    show(step + 1);
    if (step < stages.length - 1) timer = setTimeout(advance, 2200);
  }
  function begin() {
    stopTimer();
    step = -1;
    isPlaying = true;
    stage.classList.add("is-playing");
    play.disabled = true;
    play.textContent = "Missione in esecuzione…";
    advance();
  }
  function pause() {
    if (!isPlaying) return;
    stopTimer();
    play.disabled = false;
    play.textContent = "▶ Continua la missione";
  }
  function resume() {
    if (step < 0 || step >= stages.length - 1) return begin();
    isPlaying = true;
    stage.classList.add("is-playing");
    play.disabled = true;
    play.textContent = "Missione in esecuzione…";
    timer = setTimeout(advance, 450);
  }
  function restart() {
    stopTimer();
    step = -1;
    $("#mission-terminal").textContent = "$ bridge project inspect\nIn attesa del comando…";
    const page = $("#mission-page");
    page.className = "mission-page";
    page.querySelector("strong").textContent = "Controllo del sito";
    page.querySelector("p").textContent = "La pagina sarà verificata durante la simulazione.";
    $("#mission-status").textContent = "Pronto per la simulazione";
    $("#mission-explain").textContent = "Premi “Avvia la missione” per vedere il percorso.";
    $("#mission-log").textContent = "In attesa della missione.";
    $("#mission-todo").replaceChildren(task(false));
    $("#mission-doing").replaceChildren();
    $("#mission-done").replaceChildren();
    root.dataset.missionStep = "ready";
    root.querySelectorAll("[data-phase]").forEach(element => element.classList.remove("active", "complete"));
    play.disabled = false;
    play.textContent = noMotion() ? "Mostra subito il risultato" : "▶ Avvia la missione";
  }
  play.addEventListener("click", () => {
    if (noMotion()) {stopTimer();show(stages.length - 1);return;}
    if (step >= 0 && step < stages.length - 1 && !isPlaying) resume();
    else begin();
  });
  reset.addEventListener("click", restart);
  document.addEventListener("visibilitychange", () => {if (document.hidden) pause();});
  const motionChange = () => {
    if (noMotion()) {
      pause();
      if (step === -1) play.textContent = "Mostra subito il risultato";
    } else if (step === -1) play.textContent = "▶ Avvia la missione";
  };
  new MutationObserver(motionChange).observe(document.documentElement, {attributes: true,attributeFilter:["class"]});
  reduced.addEventListener("change", motionChange);
  restart();
})();