export const TRAITS = [
 {key:'attack',name:'Choose the chaos',number:'01 / ATTACK',help:'How should your creation ruin their day?',options:[{id:'laser',name:'Death laser',icon:'↗'},{id:'orbit',name:'Bullet bloom',icon:'✳'},{id:'charge',name:'Rage charge',icon:'ϟ'}]},
 {key:'weakness',name:'Give them a chance',number:'02 / WEAKNESS',help:'Every monster has a flaw. Even yours.',options:[{id:'glass',name:'Glass core',icon:'◇'},{id:'overheat',name:'Overheats',icon:'♨'},{id:'slow',name:'Heavy feet',icon:'⌁'}]},
 {key:'body',name:'Make it ridiculous',number:'03 / BODY',help:'The face of your extremely bad decisions.',options:[{id:'duck',name:'Angry duck',icon:'◒'},{id:'dog',name:'Ruff Pup',icon:'♧'},{id:'cat',name:'Mischief Kit',icon:'♢'}]}
];
export const RESULT_COPY = {
 victory:{label:'STREAMER WINS',tag:'BOSS DEFEATED',title:'Monster made. Monster slain.',message:'You defeated the boss. Your chat owes you an apology.',feed:'Streamer wins!',color:'#d8ff62',tone:660},
 survived:{label:'STREAMER SURVIVED',tag:'TIME UP / STILL STANDING',title:'Still alive. Still talking.',message:'You survived the full minute. The boss is still standing, too.',feed:'Streamer survived!',color:'#8cd9ff',tone:440},
 defeat:{label:'CHAT WINS',tag:'STREAMER KNOCKED OUT',title:'Chat sends its regards.',message:'Your community built a monster. This time, it got you.',feed:'Chat wins by knockout!',color:'#ff8ba5',tone:160}
};
export const DUCK_FORMS = [
 {name:'Angry Duck',title:'SMALL BIRD. BIG GRUDGE.',color:'#f4cf55'},
 {name:'Stormwing',title:'THE CROWD GAVE IT WINGS.',color:'#77d9ec'},
 {name:'Quacklord',title:'YOUR CHAT CREATED A MONARCH.',color:'#b297ff'}
];
export const EVOLUTION_FORMS = {
 duck:DUCK_FORMS,
 dog:[{name:'Ruff Pup',title:'WHO LET CHAT TRAIN THIS DOG?',color:'#e9ab70'},{name:'Stormhound',title:'THE PACK HAS FOUND ITS THUNDER.',color:'#6ed6db'},{name:'Howlking',title:'YOUR COMMUNITY SUMMONED THE ALPHA.',color:'#f2b367'}],
 cat:[{name:'Mischief Kit',title:'NINE LIVES. ZERO REMORSE.',color:'#f0b38f'},{name:'Moonclaw',title:'THE CHAT AWAKENED A NIGHT HUNTER.',color:'#a8b8ff'},{name:'Astralynx',title:'THE STARS ANSWER TO THIS CAT.',color:'#d1a0f8'}]
};
export const normalizeBody=body=>body==='slime'?'dog':body==='bot'?'cat':body;
export const formsFor=body=>EVOLUTION_FORMS[normalizeBody(body)]||DUCK_FORMS;
export class BossEvolution {
 constructor(first=8,second=16){if(!Number.isInteger(first)||!Number.isInteger(second)||first<1||second<=first||second>10000)throw Error('Use whole-number goals: first at least 1, second greater than first, maximum 10000.');this.goals=[first,second];this.viewers=new Set()}
 record(user){const before=this.stage;this.viewers.add(user);return this.stage>before}
 get count(){return this.viewers.size}
 get stage(){return this.count>=this.goals[1]?2:this.count>=this.goals[0]?1:0}
}
export const DuckEvolution=BossEvolution; // Compatibility for saved integrations.
export class VoteBox {
 constructor(){this.clear()}
 clear(){this.votes=Object.fromEntries(TRAITS.map(t=>[t.key,new Map()]));this.names=new Map()}
 cast(user,name,text){const id=normalizeBody(text.trim().toLowerCase().replace(/^!/, ''));const trait=TRAITS.find(t=>t.options.some(o=>o.id===id));if(!trait)return false;this.votes[trait.key].set(user,id);this.names.set(user,name);return true}
 counts(key){return Object.fromEntries(TRAITS.find(t=>t.key===key).options.map(o=>[o.id,[...this.votes[key].values()].filter(v=>v===o.id).length]))}
 winner(key){const c=this.counts(key);return Object.keys(c).reduce((a,b)=>c[b]>c[a]?b:a)}
 get total(){return Object.values(this.votes).reduce((n,v)=>n+v.size,0)}
 recipe(){return Object.fromEntries(TRAITS.map(t=>[t.key,this.winner(t.key)]))}
 contributors(){const winners=this.recipe();return [...this.names].filter(([id])=>TRAITS.some(t=>this.votes[t.key].get(id)===winners[t.key])).map(([,n])=>n)}
}
export const MUTATIONS = [
 {id:'split',name:'Splinter shots',icon:'⋔',help:'Every attack releases six projectiles that split in flight.'},
 {id:'twin',name:'Twin strike',icon:'Ⅱ',help:'Each attack echoes once, with its own warning.'},
 {id:'haste',name:'Rage engine',icon:'ϟ',help:'25% shorter attack cooldowns and 20% faster projectiles and charges.'}
];
export const POWERS = [
 {id:'rage',name:'Rage burst',help:'Faster attacks and new projectiles for 4 seconds.',team:'BOSS'},
 {id:'barrage',name:'Bullet ambush',help:'Launch 12 extra projectiles around the boss.',team:'BOSS'},
 {id:'shield',name:'Iron hide',help:'Boss takes half damage for 4 seconds.',team:'BOSS'},
 {id:'scramble',name:'Scramble',help:'Reverse movement controls for 2.5 seconds.',team:'BOSS'},
 {id:'heal',name:'Second chance',help:'Restore 1 heart. Two successful uses per round.',team:'STREAMER'},
 {id:'cleanse',name:'Clear the air',help:'Clear hostile bullets and pending rings. Two uses per round.',team:'STREAMER'}
];
export class Ballot {
 constructor(kind,options,duration,fallback){this.kind=kind;this.options=options;this.duration=duration;this.remaining=duration;this.fallback=fallback;this.votes=new Map();this.closed=false}
 cast(user,name,text){const id=text.trim().toLowerCase().replace(/^!/, '');if(this.closed||!this.options.some(o=>o.id===id))return false;this.votes.set(user,{id,name});return true}
 counts(){return Object.fromEntries(this.options.map(o=>[o.id,[...this.votes.values()].filter(v=>v.id===o.id).length]))}
 resolve(){this.closed=true;const counts=this.counts(),max=Math.max(...Object.values(counts));const tied=this.options.filter(o=>counts[o.id]===max).map(o=>o.id);const id=tied.includes(this.fallback)?this.fallback:tied[0];return {id,count:counts[id],total:this.votes.size,names:[...this.votes.values()].filter(v=>v.id===id).map(v=>v.name)}}
}
const clamp=(n,a,b)=>Math.min(b,Math.max(a,n));
export class Battle {
 constructor(recipe,evolution=new BossEvolution()){recipe={...recipe,body:normalizeBody(recipe.body)};
  this.evolution=evolution;this.evolutionStage=EVOLUTION_FORMS[recipe.body]?evolution.stage:0;this.evolutionRemaining=0;this.recipe={...recipe};this.currentAttack=recipe.attack;this.time=0;
  this.player={x:500,y:470,hp:5,invuln:0,dash:0,cooldown:0};
  this.boss={x:500,y:210,hp:recipe.weakness==='glass'?750:1080,maxHp:recipe.weakness==='glass'?750:1080};
  this.shots=[];this.bullets=[];this.particles=[];this.trails=[];this.damageNumbers=[];this.bossTrails=[];this.volleys=[];this.recoil=0;
  this.attackClock=1.6;this.warning=null;this.laser=null;this.charge=null;this.echoClock=null;
  this.vulnerable=0;this.fire=0;this.result=null;this.events=[];this.hitFlash=0;this.hurtFlash=0;
  this.mutation=null;this.mutationTriggered=false;this.lastChoice=null;this.attackCredit=null;
  this.poll=new Ballot('attack',TRAITS[0].options,10,this.currentAttack);this.suspendedPoll=null;this.powerPoll=new Ballot('power',POWERS,12,'rage');this.powerTimers={rage:0,shield:0,scramble:0};this.powerUses={heal:0,cleanse:0};this.lastPower=null;this.damageTaken=0;
 }
 emit(type){this.events.push(type)}
 cast(user,name,text){if(this.result)return false;const accepted=this.poll.kind==='mutation'?this.poll.cast(user,name,text):this.poll.cast(user,name,text)||this.powerPoll.cast(user,name,text);if(accepted&&EVOLUTION_FORMS[this.recipe.body])this.evolution.record(user);return accepted}
 clearLiveVotes(){this.poll.votes.clear();this.suspendedPoll?.votes.clear();this.powerPoll.votes.clear()}
 resolvePower(){const choice=this.powerPoll.resolve();if(choice.total){this.lastPower={...choice,applied:true};const id=choice.id;if(id==='heal'){if(this.powerUses.heal>=2||this.player.hp>=5)this.lastPower.applied=false;else{this.player.hp++;this.powerUses.heal++}}else if(id==='cleanse'){if(this.powerUses.cleanse>=2)this.lastPower.applied=false;else{this.bullets=[];this.volleys=[];this.powerUses.cleanse++}}else if(id==='barrage'){for(let i=0;i<12;i++)this.spawnBullet(this.boss.x,this.boss.y,i*Math.PI/6+this.time*.3,180,6)}else this.powerTimers[id]=id==='scramble'?2.5:4;this.emit('power-picked')}this.powerPoll=new Ballot('power',POWERS,12,'rage')}
 resolvePoll(){
  const poll=this.poll,choice=poll.resolve();this.lastChoice={...choice,kind:poll.kind};
  if(poll.kind==='mutation'){
   this.mutation=choice.id;this.poll=this.suspendedPoll;this.suspendedPoll=null;
   this.attackClock=1.2;this.player.invuln=1;this.emit('mutation-applied');
  }else{
   this.currentAttack=choice.id;this.attackCredit=choice;this.attackClock=Math.min(this.attackClock,.4);
   this.poll=new Ballot('attack',TRAITS[0].options,10,this.currentAttack);this.emit('attack-picked');
  }
 }
 beginMutation(){
  this.mutationTriggered=true;this.suspendedPoll=this.poll;
  this.poll=new Ballot('mutation',MUTATIONS,8,'split');
  this.warning=null;this.laser=null;this.charge=null;this.echoClock=null;
  this.shots=[];this.bullets=[];this.volleys=[];this.bossTrails=[];this.emit('mutation-open');
 }
 hit(){if(this.player.invuln>0||this.result)return;this.player.hp--;this.damageTaken++;this.player.invuln=1.15;this.hurtFlash=.3;this.emit('hurt');if(this.player.hp<=0)this.finish('chat','knockout')}
 finish(winner,reason=winner==='you'?'boss-defeated':this.player.hp<=0?'knockout':'timeout'){if(this.result)return;const outcome=winner==='you'?'victory':reason==='timeout'&&this.player.hp>0?'survived':'defeat';this.result={winner,reason,outcome,seconds:Math.min(60,this.time),score:Math.round(Math.min(60,this.time)*100+this.damageTaken*25),hp:this.player.hp};if(this.poll)this.poll.closed=true;this.powerPoll.closed=true;this.emit(outcome==='victory'?'win':outcome==='survived'?'survived':'lose')}
 attack(echo=false,type=this.currentAttack){const p=this.player,b=this.boss;const windup=(this.mutation?.38:.5)*(1-this.evolutionStage*.12);this.warning={type,credit:this.attackCredit,x:p.x,y:p.y,angle:Math.atan2(p.y-b.y,p.x-b.x),left:windup,duration:windup,echo};this.emit('warning')}
 spawnBullet(x,y,a,speed,r=7,split=false){this.bullets.push({x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r,age:0,split})}
 unleash(w){
  const b=this.boss,slow=this.recipe.weakness==='slow'?.65:1,speed=(1+this.evolutionStage*.08)*slow*(this.mutation==='haste'?1.2:1)*(this.powerTimers.rage>0?1.25:1);
  if(w.type==='laser')this.laser={x:b.x,y:b.y,angle:w.angle-.2,left:.72+this.evolutionStage*.08,sweep:(this.mutation?.85:.6)*(1+this.evolutionStage*.22)};
  if(w.type==='orbit'){const count=(this.mutation?26:22)+this.evolutionStage*4;for(let i=0;i<count;i++)this.spawnBullet(b.x,b.y,i*Math.PI*2/count+this.time*.35,220*speed);if(this.mutation)this.volleys.push({left:.35,x:b.x,y:b.y,count:26+this.evolutionStage*4,speed:190*speed,angle:this.time*.35+Math.PI/26})}
  if(w.type==='charge'){const d=Math.hypot(w.x-b.x,w.y-b.y)||1;this.charge={vx:(w.x-b.x)/d*750*speed,vy:(w.y-b.y)/d*750*speed,left:.7,wake:0}}
  if(this.mutation==='split'){for(let i=0;i<6;i++)this.spawnBullet(b.x,b.y,i*Math.PI/3+this.time*.25,150*speed,6,true)}
  if(this.mutation==='twin'&&!w.echo){this.echoClock=.8;this.echoAttack=w.type}
  if(this.evolutionStage>0){const count=this.evolutionStage===2?10:4;for(let i=0;i<count;i++)this.spawnBullet(b.x,b.y,i*Math.PI*2/count+this.time,155*speed,5)}this.recoil=.3;this.vulnerable=this.recipe.weakness==='overheat'?1.45:0;this.emit('attack');
 }
 step(dt,keys){
  if(this.result)return;dt=clamp(dt,0,.05);this.events=[];
  // Mutation is a safe intermission: both the combat clock and attack ballot pause.
  if(this.poll.kind==='mutation'){this.poll.remaining=Math.max(0,this.poll.remaining-dt);if(this.poll.remaining===0)this.resolvePoll();return}
  if(this.evolutionRemaining>0){this.evolutionRemaining=Math.max(0,this.evolutionRemaining-dt);return}
  if(EVOLUTION_FORMS[this.recipe.body]&&this.evolutionStage<this.evolution.stage){this.evolutionStage++;this.evolutionRemaining=2;this.warning=null;this.laser=null;this.charge=null;this.echoClock=null;this.shots=[];this.bullets=[];this.volleys=[];this.bossTrails=[];this.attackClock=.8;this.player.invuln=Math.max(this.player.invuln,.8);this.emit('evolution');return}
  this.time+=dt;for(const id of Object.keys(this.powerTimers))this.powerTimers[id]=Math.max(0,this.powerTimers[id]-dt);this.powerPoll.remaining=Math.max(0,this.powerPoll.remaining-dt);if(this.powerPoll.remaining===0)this.resolvePower();this.poll.remaining=Math.max(0,this.poll.remaining-dt);if(this.poll.remaining===0)this.resolvePoll();
  let p=this.player,b=this.boss;p.invuln=Math.max(0,p.invuln-dt);p.cooldown=Math.max(0,p.cooldown-dt);p.dash=Math.max(0,p.dash-dt);this.vulnerable=Math.max(0,this.vulnerable-dt);this.hitFlash=Math.max(0,this.hitFlash-dt);this.hurtFlash=Math.max(0,this.hurtFlash-dt);this.recoil=Math.max(0,this.recoil-dt);this.bossTrails.forEach(v=>v.left-=dt);this.bossTrails=this.bossTrails.filter(v=>v.left>0);
  this.trails.forEach(v=>v.left-=dt);this.trails=this.trails.filter(v=>v.left>0);
  this.damageNumbers.forEach(v=>{v.left-=dt;v.y-=35*dt});this.damageNumbers=this.damageNumbers.filter(v=>v.left>0);
  let dx=Number(keys.has('d')||keys.has('ArrowRight'))-Number(keys.has('a')||keys.has('ArrowLeft')),dy=Number(keys.has('s')||keys.has('ArrowDown'))-Number(keys.has('w')||keys.has('ArrowUp'));if(this.powerTimers.scramble>0){dx=-dx;dy=-dy}let len=Math.hypot(dx,dy)||1;
  if(keys.has('Shift')&&p.cooldown<=0&&(dx||dy)){p.dash=.18;p.invuln=Math.max(p.invuln,.25);p.cooldown=2;this.emit('dash')}
  const speed=p.dash>0?850:260;if(p.dash>0)this.trails.push({x:p.x,y:p.y,left:.2});p.x=clamp(p.x+dx/len*speed*dt,32,968);p.y=clamp(p.y+dy/len*speed*dt,100,568);
  this.fire-=dt;if(keys.has(' ')&&this.fire<=0){this.fire=.22;const a=Math.atan2(b.y-p.y,b.x-p.x);this.shots.push({x:p.x,y:p.y,vx:Math.cos(a)*750,vy:Math.sin(a)*750,r:4});this.emit('shoot')}
  if(this.echoClock!==null){this.echoClock-=dt;if(this.echoClock<=0&&!this.warning&&!this.charge&&!this.laser){this.attack(true,this.echoAttack);this.echoClock=null}}
  this.attackClock-=dt;if(this.attackClock<=0&&!this.warning&&!this.charge&&!this.laser&&this.echoClock===null){this.attack();this.attackClock=(this.currentAttack==='orbit'?1.9:2.25)*(this.mutation?.82:1)*(this.mutation==='haste'?.75:1)*(this.powerTimers.rage>0?.65:1)*(1-this.evolutionStage*.1)}
  if(this.warning){this.warning.left-=dt;if(this.warning.left<=0){this.unleash(this.warning);this.warning=null}}
  if(this.charge){this.bossTrails.push({x:b.x,y:b.y,left:.24});if(this.mutation){this.charge.wake-=dt;if(this.charge.wake<=0){this.charge.wake=.16;const a=Math.atan2(this.charge.vy,this.charge.vx);for(const side of [-1,1])this.spawnBullet(b.x,b.y,a+side*Math.PI/2,135,5)}}b.x=clamp(b.x+this.charge.vx*dt,65,935);b.y=clamp(b.y+this.charge.vy*dt,120,525);this.charge.left-=dt;if(this.charge.left<=0)this.charge=null}else{b.x+=(500+Math.sin(this.time*.65)*110-b.x)*dt*1.1;b.y+=(210+Math.cos(this.time*.5)*35-b.y)*dt*1.1}
  if(Math.hypot(p.x-b.x,p.y-b.y)<64+this.evolutionStage*7)this.hit();
  if(this.laser){this.laser.left-=dt;this.laser.angle+=this.laser.sweep*dt;let x=p.x-this.laser.x,y=p.y-this.laser.y,c=Math.cos(this.laser.angle),s=Math.sin(this.laser.angle);if(x*c+y*s>0&&Math.abs(-x*s+y*c)<23)this.hit();if(this.laser.left<=0)this.laser=null}
  for(const s of this.shots){
   if(this.result)break;s.x+=s.vx*dt;s.y+=s.vy*dt;
   if(Math.hypot(s.x-b.x,s.y-b.y)<57+this.evolutionStage*7){
    const damage=(this.vulnerable>0?16:8)*(this.powerTimers.shield>0?.5:1);b.hp=Math.max(0,b.hp-damage);s.dead=true;this.hitFlash=.08;this.emit('boss-hit');
    this.particles.push({x:s.x,y:s.y,left:.25});if(this.damageNumbers.length<12)this.damageNumbers.push({x:s.x,y:s.y-10,value:damage,left:.55});
    // Clamp at half health so a volley cannot skip the community's mutation vote.
    if(!this.mutationTriggered&&b.hp<=b.maxHp*.5){b.hp=b.maxHp*.5;this.beginMutation();return}
    if(b.hp<=0)this.finish('you');
   }
  }
  for(const volley of this.volleys){volley.left-=dt;if(volley.left<=0){for(let i=0;i<volley.count;i++)this.spawnBullet(volley.x,volley.y,volley.angle+i*Math.PI*2/volley.count,volley.speed)}}this.volleys=this.volleys.filter(v=>v.left>0);
  const children=[];
  for(const v of this.bullets){v.x+=v.vx*dt;v.y+=v.vy*dt;v.age+=dt;
   if(v.split&&v.age>=.65){v.dead=true;const a=Math.atan2(v.vy,v.vx),speed=Math.hypot(v.vx,v.vy);for(const offset of [-.35,.35])children.push({x:v.x,y:v.y,vx:Math.cos(a+offset)*speed,vy:Math.sin(a+offset)*speed,r:5,age:0,split:false});continue}
   if(Math.hypot(v.x-p.x,v.y-p.y)<v.r+13){this.hit();v.dead=true}
  }
  this.shots=this.shots.filter(v=>!v.dead&&v.x>-30&&v.x<1030&&v.y>-30&&v.y<630);this.bullets=this.bullets.filter(v=>!v.dead&&v.x>-30&&v.x<1030&&v.y>60&&v.y<630).concat(children);this.particles.forEach(v=>v.left-=dt);this.particles=this.particles.filter(v=>v.left>0);
  if(this.time>=60)this.finish('chat','timeout');
 }
}

