(()=>{'use strict';
function localISO(d=new Date()){const y=d.getFullYear(),m=String(d.getMonth()+1).padStart(2,'0'),day=String(d.getDate()).padStart(2,'0');return`${y}-${m}-${day}`}
function fixedSundays(){let a=[],d=new Date(FIRST+'T12:00:00'),today=localISO();while(localISO(d)<=today){a.push(localISO(d));d.setDate(d.getDate()+7)}return a.reverse()}
window.sundays=fixedSundays;
function refresh(){try{if(window.view==='freq'&&typeof renderFreq==='function')renderFreq();if(window.view==='overview'&&typeof renderOverview==='function')renderOverview();if(window.view==='dashboard'&&typeof renderDashboard==='function')renderDashboard()}catch(e){console.warn('Sunday refresh skipped',e)}}
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refresh()});window.addEventListener('focus',refresh,{passive:true});setTimeout(refresh,80);
})();