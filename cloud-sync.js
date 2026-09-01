/* Vila Jacuí MW — sincronização compartilhada */
(() => {
  const API='https://fttvimhhxopvzxqrpsuk.supabase.co/functions/v1/mw-shared';
  const SESSION='vjMwSharedPassword';
  const originalLoad=window.loadConversos;
  const originalSave=window.saveConversos;
  let password=sessionStorage.getItem(SESSION)||'';
  let syncing=false;
  let lastCloud='';

  function refreshAll(){
    try{ window.renderTable?.(); window.renderFreqTable?.(); window.renderTempleTable?.(); window.refreshDashboard?.(); }catch(e){}
  }
  async function request(action,payload){
    const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password,action,payload})});
    if(!r.ok) throw new Error(r.status===401?'Senha incorreta':'Falha de conexão');
    return r.json();
  }
  async function pull(){
    if(!password||syncing)return;
    try{
      const d=await request('get');
      const list=Array.isArray(d?.payload?.conversos)?d.payload.conversos:[];
      const sig=JSON.stringify(list);
      if(sig!==lastCloud){
        syncing=true;
        originalSave(list);
        lastCloud=sig;
        syncing=false;
        refreshAll();
      }
      setStatus('Sincronizado','ok');
    }catch(e){ setStatus('Sem conexão','bad'); }
  }
  async function push(list){
    if(!password||syncing)return;
    try{
      const sig=JSON.stringify(list);
      await request('set',{conversos:list});
      lastCloud=sig;
      setStatus('Sincronizado','ok');
    }catch(e){ setStatus('Não sincronizado','bad'); }
  }
  function setStatus(text,cls){
    const el=document.getElementById('mwCloudStatus');
    if(el){el.textContent=text;el.dataset.state=cls||'';}
  }
  function installSaveHook(){
    window.saveConversos=function(list){ originalSave(list); push(list); };
  }
  function makeLogin(){
    const gate=document.createElement('div'); gate.id='mwLoginGate';
    gate.innerHTML=`<div class="mw-login-card"><img src="vj_logo.png" alt=""><div class="mw-login-kicker">ALA VILA JACUÍ</div><h1>Acompanhamento de Recém-Conversos</h1><p>Acesso interno · dados sincronizados</p><form id="mwLoginForm"><input id="mwPassword" type="password" autocomplete="current-password" placeholder="Senha" required><button>Entrar</button><div id="mwLoginError"></div></form></div>`;
    document.body.appendChild(gate);
    document.getElementById('mwLoginForm').addEventListener('submit',async e=>{
      e.preventDefault(); const btn=e.target.querySelector('button'),err=document.getElementById('mwLoginError');
      password=document.getElementById('mwPassword').value; btn.disabled=true; btn.textContent='Entrando…'; err.textContent='';
      try{ await request('get'); sessionStorage.setItem(SESSION,password); gate.remove(); await pull(); start(); }
      catch(ex){ password=''; err.textContent=ex.message; btn.disabled=false; btn.textContent='Entrar'; }
    });
  }
  function addStatus(){
    const h=document.querySelector('.header-actions'); if(!h||document.getElementById('mwCloudStatus'))return;
    const s=document.createElement('span');s.id='mwCloudStatus';s.className='mw-cloud-status';s.textContent='Sincronizando…';h.prepend(s);
    const out=document.createElement('button');out.className='btn-header-action';out.textContent='🔒 Sair';out.onclick=()=>{sessionStorage.removeItem(SESSION);location.reload();};h.appendChild(out);
  }
  function start(){ addStatus(); pull(); setInterval(pull,4000); window.addEventListener('focus',pull); document.addEventListener('visibilitychange',()=>{if(!document.hidden)pull();}); }
  installSaveHook();
  document.addEventListener('DOMContentLoaded',async()=>{ if(password){ try{await request('get');await pull();start();}catch(e){sessionStorage.removeItem(SESSION);password='';makeLogin();} } else makeLogin(); });
})();