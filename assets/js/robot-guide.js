/* AI-PC Bridge mascot director — presentation only; never accesses the user's PC */
(()=>{"use strict";
const hero=document.querySelector(".hero");
const heroWrap=document.querySelector(".robot-hero-wrap");
const heroImg=heroWrap?.querySelector(".robot-hero");
const mission=document.querySelector("#missione-live");
const guide=mission?.querySelector(".mission-robot-guide");
const guideImg=guide?.querySelector("img");
const status=mission?.querySelector("#mission-status");
const line=mission?.querySelector("#robot-mission-line");
const chat=mission?.querySelector("#mission-chat-answer");
const userBubble=mission?.querySelector(".mission-chat-user");
const dock=document.querySelector("#robot-dock");
const dockImg=dock?.querySelector("img");
const dockAction=document.querySelector("#robot-dock-action");
const dockClose=document.querySelector("#robot-dock-close");
const footer=document.querySelector("footer");
if(!hero||!heroImg||!mission||!status||!line||!chat)return;
const scripts={
 "Pronto per la simulazione":{state:"idle",say:"Sono pronto. Quando vuoi, partiamo!",chat:"AI-PC: Sono pronto. Avvia la missione per vedere come procedo.",turn:0},
 "Richiesta ricevuta":{state:"analyzing",say:"Messaggio ricevuto! Verifico progetto e permessi.",chat:"AI-PC: Ricevuto! Identifico il progetto e gli strumenti autorizzati.",turn:-12},
 "Terminale aperto":{state:"analyzing",say:"Apro il terminale. Leggo i risultati dei test.",chat:"AI-PC: Eseguo i controlli nel terminale del progetto.",turn:18},
 "Errore individuato nel browser":{state:"analyzing",say:"Trovato! Lo script è collegato al percorso sbagliato.",chat:"AI-PC: Ho trovato lo script non caricato. Verifico dove correggere il percorso.",turn:24},
 "Correzione e test":{state:"solving",say:"Correggo il percorso e rieseguo le verifiche.",chat:"AI-PC: Correggo il collegamento, rieseguo i test e controllo la pagina.",turn:-19},
 "Control Room aggiornata":{state:"success",say:"Risolto! Aggiorno attività e checkpoint.",chat:"AI-PC: Test di esempio superati! Task su Fatto e checkpoint registrato.",turn:0}
};
const assets={idle:"robot-idle.svg",analyzing:"robot-analyzing.svg",solving:"robot-solving.svg",success:"robot-success.svg"};
const reduce=window.matchMedia("(prefers-reduced-motion: reduce)");
let current="idle",dockDismissed=false,scrollQueued=false,typingTimer=null;
const animationsOff=()=>reduce.matches||document.documentElement.classList.contains("motion-off");
function setImage(img,state){if(!img)return;const src="assets/img/"+assets[state];if(!img.getAttribute("src")?.endsWith(assets[state]))img.src=src;}
function syncStage(){
 const entry=scripts[status.textContent]||scripts["Pronto per la simulazione"];
 current=entry.state;line.textContent=entry.say;chat.textContent=entry.chat;
 [heroImg,guideImg,dockImg].forEach(img=>setImage(img,entry.state));
 heroWrap.style.setProperty("--head-turn",entry.turn+"deg");
 guide?.style.setProperty("--head-turn",entry.turn+"deg");
 guide?.classList.toggle("robot-busy",entry.state==="analyzing"||entry.state==="solving");
 guide?.classList.toggle("robot-success",entry.state==="success");
 mission.dataset.robotState=entry.state;
const phaseNames={"Pronto per la simulazione":"idle","Richiesta ricevuta":"received","Terminale aperto":"terminal","Errore individuato nel browser":"error","Correzione e test":"solving","Control Room aggiornata":"complete"};
mission.dataset.phase=phaseNames[status.textContent]||"idle";
}
new MutationObserver(syncStage).observe(status,{childList:true,subtree:true,characterData:true});
syncStage();
const originalPrompt=userBubble?.textContent||"";
function typePrompt(){
 if(!userBubble)return;
 if(typingTimer!==null){clearInterval(typingTimer);typingTimer=null}
 if(animationsOff()){userBubble.textContent=originalPrompt;return}
 let i=0;userBubble.textContent="";
 typingTimer=setInterval(()=>{
  i=Math.min(i+3,originalPrompt.length);userBubble.textContent=originalPrompt.slice(0,i);
  if(i===originalPrompt.length){clearInterval(typingTimer);typingTimer=null}
 },22);
}
mission.querySelector("#mission-play")?.addEventListener("click",typePrompt);
mission.querySelector("#mission-reset")?.addEventListener("click",()=>{
 if(typingTimer!==null){clearInterval(typingTimer);typingTimer=null}
 if(userBubble)userBubble.textContent=originalPrompt;
});
const clamp=(v,min,max)=>Math.min(max,Math.max(min,v));
hero.addEventListener("pointermove",e=>{
 if(e.pointerType!=="mouse"||animationsOff()||current!=="idle")return;
 const r=heroWrap.getBoundingClientRect();
 const gaze=clamp((e.clientX-(r.left+r.width/2))/Math.max(r.width,1),-1,1);
 const tilt=clamp((e.clientY-(r.top+r.height/2))/Math.max(r.height,1),-1,1);
 heroWrap.style.setProperty("--head-turn",(gaze*17).toFixed(1)+"deg");
 heroWrap.style.setProperty("--head-roll",(tilt*5).toFixed(1)+"deg");
},{passive:true});
hero.addEventListener("pointerleave",()=>{heroWrap.style.setProperty("--head-turn","0deg");heroWrap.style.setProperty("--head-roll","0deg")},{passive:true});
function handleScroll(){
 scrollQueued=false;
 if(!dock||dockDismissed)return;
 const h=hero.getBoundingClientRect(),m=mission.getBoundingClientRect(),f=footer?.getBoundingClientRect();
 const pastHero=h.bottom<190;
 const overMission=m.top<innerHeight*.88&&m.bottom>innerHeight*.12;
 const nearFooter=Boolean(f&&f.top<innerHeight-20);
 const show=pastHero&&!overMission&&!nearFooter;
 dock.hidden=!show;dock.classList.toggle("is-visible",show);
 if(animationsOff())dock.classList.add("no-motion");else dock.classList.remove("no-motion");
}
addEventListener("scroll",()=>{if(!scrollQueued){scrollQueued=true;requestAnimationFrame(handleScroll)}},{passive:true});
addEventListener("resize",handleScroll,{passive:true});reduce.addEventListener("change",handleScroll);
const motionToggle=document.querySelector("#motion-toggle");motionToggle?.addEventListener("click",handleScroll);
dockAction?.addEventListener("click",()=>mission.scrollIntoView({behavior:animationsOff()?"auto":"smooth",block:"start"}));
dockClose?.addEventListener("click",()=>{dockDismissed=true;if(dock)dock.hidden=true});
document.addEventListener("visibilitychange",()=>{if(document.hidden&&typingTimer!==null){clearInterval(typingTimer);typingTimer=null;if(userBubble)userBubble.textContent=originalPrompt}});
handleScroll();
})();