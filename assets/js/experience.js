"use strict";
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const reduced = matchMedia("(prefers-reduced-motion: reduce)");
let paused = reduced.matches;
document.documentElement.classList.add("js");
const motionButton = $("#motion-toggle");
function syncMotion() {
 document.documentElement.classList.toggle("motion-off", paused);
 motionButton.textContent = paused ? "Attiva animazioni" : "Pausa animazioni";
 motionButton.setAttribute("aria-pressed", String(paused));
}
syncMotion();
motionButton.addEventListener("click", () => { paused = !paused; syncMotion(); });
reduced.addEventListener("change", e => { paused = e.matches; syncMotion(); });
const observer = new IntersectionObserver(entries => {
 for (const entry of entries) if(entry.isIntersecting) { entry.target.classList.add("in"); observer.unobserve(entry.target); }
}, {threshold: .08});
$$(".reveal").forEach(el => observer.observe(el));
function progress() { const height = document.documentElement.scrollHeight - innerHeight; document.documentElement.style.setProperty("--progress",height > 0 ? scrollY / height : 0); }
addEventListener("scroll",progress,{passive:true}); progress();
const scenarios = {
 site: {prompt:"«Crea una pagina per il mio progetto e aprila nel browser.»",reply:"Controllo la cartella e preparo il lavoro.",title:"Sito del progetto",steps:["Controlla la cartella autorizzata","Prepara struttura e file","Avvia l’anteprima locale","Apri il browser e verifica"],result:"Anteprima pronta da rivedere, con i file del progetto."},
 fix: {prompt:"«Il login non funziona. Trova il problema e verifica la correzione.»",reply:"Leggo il codice e riproduco l’errore prima di modificarlo.",title:"Correzione del login",steps:["Leggi codice e log autorizzati","Individua la causa dell’errore","Applica una modifica mirata","Esegui i test disponibili"],result:"Correzione e risultati dei test da controllare."},
 resume: {prompt:"«Riprendiamo il sito da dove eravamo rimasti nella chat precedente.»",reply:"Recupero ciò che è stato salvato nel progetto.",title:"Ripresa del progetto",steps:["Seleziona il progetto corretto","Recupera note e punto di ripresa","Controlla lo stato reale dei file","Proponi il prossimo passo"],result:"Contesto recuperato. Il lavoro può continuare."}
};
let active = "site", step = 0, lastTick = 0, demoVisible = false;
const workbench = $(".workbench");
new IntersectionObserver(([e]) => {demoVisible=e.isIntersecting;lastTick=performance.now();},{threshold:.15}).observe(workbench);
function renderScenario() {
 const s = scenarios[active];
 $("#scenario-prompt").textContent=s.prompt; $("#scenario-reply").textContent=s.reply;
 $("#task-title").textContent=s.title;
 const list=$("#execution-steps");list.replaceChildren(...s.steps.map((text,i)=>{const li=document.createElement("li");li.textContent=text;li.className=i<step?"complete":i===step?"current":"";return li;}));
 $("#step-count").textContent=String(Math.min(step+1,4)).padStart(2,"0")+" / 04";
 $("#task-state").textContent=step===4?"DA VERIFICARE":"IN CORSO";
 $("#task-detail").textContent=step===4?s.result:"Passaggi e risultati raccolti nello stesso progetto.";
 $("#execution-status").textContent=step===4?"Esempio concluso — nessun comando eseguito":"Esempio in riproduzione";
 workbench.style.setProperty("--task-progress",Math.min((step+1)*20,100)+"%");
 $$("[data-scenario]").forEach(b=>b.setAttribute("aria-pressed",String(b.dataset.scenario===active)));
}
function restart(name=active) {active=name;step=paused?4:0;lastTick=performance.now();renderScenario();}
$$("[data-scenario]").forEach(b=>b.addEventListener("click",()=>restart(b.dataset.scenario)));
$("#replay").addEventListener("click",()=>restart());
setInterval(()=>{if(paused||document.hidden||!demoVisible||step>=4)return; if(performance.now()-lastTick>1800){step++;lastTick=performance.now();renderScenario();}},250);
restart();
$$("[data-panel]").forEach(b=>b.addEventListener("click",()=>{
 $$("[data-panel]").forEach(t=>t.setAttribute("aria-pressed",String(t===b)));
 $$(".dashboard-panel").forEach(p=>{p.hidden=p.id!==b.dataset.panel;});
}));

