(function(){
  const answers={keep:'',problem:'',resource:'',status:''};
  let step=1;
  const total=4;
  const qs=[...document.querySelectorAll('.command-question')];
  const next=document.getElementById('command-next');
  const back=document.getElementById('command-back');
  if(!next) return;

  const routes={
    beginners:['Beginners Guide',()=>showView('beginners')],
    research:['Research Tree',()=>showView('research')],
    nobles:['Noble Program',()=>showView('nobles')],
    army:['Army Simulator',()=>showView('simulator')],
    pvp:['PvP Guide',()=>showView('pvp')],
    tips:['Economy & Tips',()=>showView('tips')],
    alliance:['Alliance Guide',()=>showView('alliance')]
  };
  const data={
    stage:{
      '1-9':{label:'K1–K9 · Learn and Protect',orders:[['Join and communicate with your alliance','Alliance protection and guidance matter more than visible power this early.','alliance'],['Keep every production building active','Collect often, plant crops, and avoid idle queues.','beginners']],avoid:['Rushing Keep levels','A higher Keep with no research, troops, or economy becomes an easy target.'],ready:['Your foundation is stable','You understand shields, queues, alliance rules, and your core resource loop.']},
      '10-14':{label:'K10–K14 · Build the Foundation',orders:[['Choose one main troop direction','Do not spread research and training evenly across every troop type.','research'],['Begin one Merchant and one Collier','Start the economy pipeline before Silver and materials become severe bottlenecks.','tips']],avoid:['Leveling every noble equally','Give each noble one job and invest in the few that support your current plan.'],ready:['Your account has defined jobs','You have a main fighter, an economy noble, active research, and balanced buildings.']},
      '15-17':{label:'K15–K17 · Stop Growing Blindly',orders:[['Complete required research before pushing Keep','Account strength should catch up before the next visible Keep jump.','research'],['Build daily Trade Merit income','Run Merchant trades consistently instead of waiting until Silver is gone.','tips']],avoid:['Optional power research before requirements','Power numbers do not help if they delay troop tiers, economy, or required progression.'],ready:['Your research supports your Keep','Your troops, economy nobles, and resource reserves are not lagging behind.']},
      '18-20':{label:'K18–K20 · Prepare for K21',orders:[['Reserve Wood and Silver for required progression','Do not spend either resource casually; both disappear quickly here.','research'],['Push one Collier toward Automation IV','Mining and refined materials become a major wall approaching K21.','tips']],avoid:['Entering K21 with no material pipeline','A weak Collier, empty refinery, and poor Trade Merit flow will stall the account.'],ready:['Your K21 pipeline is prepared','Required research, troop progression, Merchant, Collier, and materials are all moving.']},
      '21+':{label:'K21+ · Optimize and Compete',orders:[['Audit army composition and research efficiency','Stop buying power that does not improve real battle results.','army'],['Specialize nobles and equipment','Every main noble should have a clearly defined battlefield or economy job.','nobles']],avoid:['Copying high-power players without context','Their research, equipment, traits, and spending level may not match yours.'],ready:['Your account follows a deliberate doctrine','Army, nobles, research, and alliance role reinforce one another.']}
    },
    problem:{
      upgrade:[['Identify the exact blocker before spending anything','Check required buildings, research, resources, and refined materials in that order.','beginners'],['Protect the resource tied to the blocker','Do not convert or spend the resource your next requirement needs.','tips']],
      silver:[['Stop leveling secondary nobles','Prioritize required research, main troops, one combat noble, one Merchant, and one Collier.','nobles'],['Trade replaceable surplus consistently','Stone is often safest to sell when no major construction is pending.','tips']],
      army:[['Audit troop tier, composition, and main noble','Visible army power alone does not show whether the formation works.','army'],['Concentrate research on the army you actually use','Scattered military research creates expensive, weak armies.','research']],
      pvp:[['Scout and calculate healing cost before attacking','A win that costs more than the reward is still a bad attack.','pvp'],['Match noble role, traits, troops, and elements','A strong noble used with the wrong army can still lose badly.','army']],
      nobles:[['Assign every noble one clear job','Combat, trade, exploration, industry, or breeding—not everything at once.','nobles'],['Compare role fit before visible power','Traits, rarity, equipment, and army purpose matter more than one power number.','nobles']],
      direction:[['Follow one progression path at a time','Economy → required research → main noble → main army → PvP refinement.','beginners'],['Use the daily checklist below','Consistent queues and trades beat random bursts of activity.','tips']]
    },
    resource:{
      food:['Maintain one troop-rebuild reserve','Use long crops offline and do not sell Food before war or training events.','tips'],
      wood:['Stop selling Wood until research is covered','Wood is usually the most dangerous basic resource to trade below K21.','research'],
      stone:['Check the next Keep and building requirements','After those are covered, surplus Stone is often useful for Silver trades.','tips'],
      silver:['Improve Housing, Treasury support, and Merchant flow','Then cut wasteful noble and troop spending.','tips'],
      materials:['Keep one Collier working and improve mining talents','Mining rate, capacity, protection, and Automation are your pipeline.','tips'],
      none:['Build reserves before the bottleneck arrives','Prepare Wood, Silver, Trade Merits, and refined materials ahead of your next stage.','tips']
    }
  };

  function update(){
    qs.forEach(q=>q.classList.toggle('active',Number(q.dataset.step)===step));
    document.getElementById('command-step-label').textContent=`Step ${step} of ${total}`;
    document.getElementById('command-progress-bar').style.width=`${step/total*100}%`;
    back.disabled=step===1;
    const field=['keep','problem','resource','status'][step-1];
    next.disabled=!answers[field];
    next.textContent=step===total?'Build My Plan ✦':'Next →';
  }
  document.querySelectorAll('.command-choice-grid button').forEach(btn=>btn.addEventListener('click',()=>{
    const f=btn.dataset.field; answers[f]=btn.dataset.value;
    btn.closest('.command-choice-grid').querySelectorAll('button').forEach(b=>b.classList.toggle('selected',b===btn));
    update();
  }));
  next.addEventListener('click',()=>{ if(step<total){step++;update()}else buildPlan(); });
  back.addEventListener('click',()=>{if(step>1){step--;update()}});
  document.getElementById('command-retake').addEventListener('click',()=>{
    document.getElementById('command-results').hidden=true;document.getElementById('command-wizard').hidden=false;step=1;update();window.scrollTo({top:0,behavior:'smooth'});
  });

  function uniqueOrders(list){const seen=new Set();return list.filter(x=>!seen.has(x[0])&&seen.add(x[0])).slice(0,5)}
  function buildPlan(){
    const st=data.stage[answers.keep];
    let orders=[...st.orders,...data.problem[answers.problem],data.resource[answers.resource]];
    if(answers.status==='rushed') orders.push(['Pause the next Keep upgrade','Bring research, troop tier, buildings, and economy nobles closer to your current level.','beginners']);
    if(answers.status==='casual') orders.push(['Use medium and long timers','Choose crops, trades, mines, and queues that finish near your next login.','tips']);
    if(answers.status==='active') orders.push(['Cycle short trades and profitable raids','Your activity can turn speed into more Silver, merits, and targeted resources.','tips']);
    orders=uniqueOrders(orders);
    while(orders.length<5) orders.push(['Check alliance orders before committing resources','Events, war, and diplomacy can change the best move for the day.','alliance']);
    document.getElementById('command-summary').textContent=`${st.label}. Your plan prioritizes ${labelProblem(answers.problem).toLowerCase()} while protecting your ${labelResource(answers.resource).toLowerCase()} situation.`;
    const wrap=document.getElementById('command-orders');wrap.innerHTML='';
    orders.forEach((o,i)=>{
      const article=document.createElement('article');article.className='command-order';
      article.innerHTML=`<span class="command-order-num">${String(i+1).padStart(2,'0')}</span><div><h3>${o[0]}</h3><p>${o[1]}</p><button type="button">Open ${routes[o[2]][0]} →</button></div><label title="Mark complete"><input type="checkbox"><i>✓</i></label>`;
      article.querySelector('button').addEventListener('click',routes[o[2]][1]);wrap.appendChild(article);
    });
    document.getElementById('command-avoid-title').textContent=st.avoid[0];document.getElementById('command-avoid-copy').textContent=st.avoid[1];
    document.getElementById('command-ready-title').textContent=st.ready[0];document.getElementById('command-ready-copy').textContent=st.ready[1];
    document.getElementById('command-wizard').hidden=true;document.getElementById('command-results').hidden=false;
    localStorage.setItem('eeCommandAnswers',JSON.stringify(answers));
    document.getElementById('command-results').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function labelProblem(v){return ({upgrade:'being unable to upgrade',silver:'Silver income',army:'army strength',pvp:'PvP performance',nobles:'noble development',direction:'clear progression'})[v]}
  function labelResource(v){return ({food:'Food',wood:'Wood',stone:'Stone',silver:'Silver',materials:'refined materials',none:'general resources'})[v]}

  document.querySelectorAll('[data-command-problem]').forEach(b=>b.addEventListener('click',()=>{answers.problem=b.dataset.commandProblem;document.getElementById('command-wizard').hidden=false;document.getElementById('command-results').hidden=true;step=1;document.querySelectorAll('[data-field="problem"]').forEach(x=>x.classList.toggle('selected',x.dataset.value===answers.problem));update();document.getElementById('command-wizard').scrollIntoView({behavior:'smooth'})}));

  const daily=[...document.querySelectorAll('[data-daily]')];
  const today=new Date().toISOString().slice(0,10);let saved={};try{saved=JSON.parse(localStorage.getItem('eeDailyChecklist')||'{}')}catch(e){}
  if(saved.date!==today)saved={date:today,items:{}};
  daily.forEach(c=>{c.checked=!!saved.items[c.dataset.daily];c.closest('label').classList.toggle('done',c.checked);c.addEventListener('change',()=>{saved.items[c.dataset.daily]=c.checked;c.closest('label').classList.toggle('done',c.checked);localStorage.setItem('eeDailyChecklist',JSON.stringify(saved))})});
  document.getElementById('command-reset-daily').addEventListener('click',()=>{saved={date:today,items:{}};daily.forEach(c=>{c.checked=false;c.closest('label').classList.remove('done')});localStorage.setItem('eeDailyChecklist',JSON.stringify(saved))});
  update();
})();