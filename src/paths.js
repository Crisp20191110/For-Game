// Original build-defining rules, informed by the requested experience, not a copy of an unverified game.
export const PATHS={
 fire:{name:'离火燎原',core:'nezha',rarity:'SSR',seal:'焰',set:'ember',team:['long','nezha','yan','zao_shen','huang'],style:'灼烧 → 引爆 → 持续清场',detail:'全队每施加 3 次灼烧，焚尽所有正在灼烧的敌人：造成其最大气血 6% 的伤害（无视防御，可被护盾吸收）。每次行动最多触发一次。',hint:'罗宣、朱雀铺群体灼烧，哪吒连击，灶神边治疗边点火。',counter:'净化可以移除火种；优先保护核心哪吒。',trial:'玄武守关',foe:['lingbao','yuan','chen','qing','ling'],enemyPath:'bastion'},
 sword:{name:'万剑归宗',core:'chen',rarity:'SSR',seal:'剑',set:'blade',team:['yangjian','long','chen','qing','ling'],style:'标记 / 破甲 → 蓄剑 → 穿透追击',detail:'全队每对标记或破甲目标造成 3 次直接命中，剑阵追击敌方后排最低血量者，造成全队最高攻击 120% 的伤害，无视一半防御。每次行动最多触发一次。',hint:'先用黄帝、吕洞宾标记，再用杨戬破盾与穿透；连击加快剑阵。',counter:'对手净化会切断剑意积累。',trial:'长生守关',foe:['long','qing','nuwa','yushi','tao'],enemyPath:'lotus'},
 thunder:{name:'九霄雷狱',core:'lei',rarity:'SR',seal:'雷',set:'hunt',team:['yuan','baihu','lei','dianmu','tao'],style:'群体命中 → 连锁落雷 → 压制灵力',detail:'单次行动直接命中至少 3 名敌人时，额外雷击最低血量的 2 名敌人，各造成全队最高攻击 45% 的伤害，并削减 1 点灵力。每回合最多触发两次。',hint:'雷震子、电母的群体绝技触发落雷，削减灵力拖慢敌方绝技。',counter:'敌人减员后群攻触发会减少，保留单体收割位。',trial:'太虚守关',foe:['yuan','fuxi','moqiu','ling','ye'],enemyPath:'spirit'},
 bastion:{name:'玄武反震',core:'lingbao',rarity:'UR',seal:'御',set:'bastion',team:['lingbao','xuanwu','yuan','yue','wu_gang'],style:'护盾吸收 → 反震 → 再护前排',detail:'全队护盾累计吸收达到核心攻击的 200% 时，对敌方前排反震核心攻击 100% 的伤害，并为我方前排增加核心攻击 30% 的护盾。每次行动最多触发一次。',hint:'灵宝天尊、李靖与玄武持续护盾，让敌方攻击也能触发反击。',counter:'破盾移除不计吸收，破盾队可以克制反震。',trial:'破军守关',foe:['shi','chen','qing','ling','he'],enemyPath:'sword'},
 lotus:{name:'青莲回天',core:'nuwa',rarity:'UR',seal:'莲',set:'spring',team:['houtu','qing','nuwa','shennong','yue'],style:'有效治疗 → 莲华 → 攻守转化',detail:'全队累计有效治疗达到全队初始总气血的 8% 时，以核心攻击 35% 对敌方全体造成无视防御的伤害，并净化最低血量队友。每次行动最多触发一次；满血空疗不计入。',hint:'女娲、神农提供治疗与回春；受伤后的有效治疗才能转化为输出。',counter:'快攻击杀核心、灵力削减都会打断治疗循环。',trial:'离火守关',foe:['shi','nezha','yan','zao_shen','ye'],enemyPath:'fire'},
 spirit:{name:'太虚连携',core:'fuxi',rarity:'UR',seal:'灵',set:'spirit',team:['ziwei','fuxi','yuanshi','meng_zhang','qing'],style:'额外充能 → 连携追击 → 全队护盾',detail:'全队由技能获得的额外灵力累计 4 点时，追击最低血量敌人，造成全队最高攻击 90% 的伤害，并为全队添加核心攻击 20% 的护盾。灵力已满时不计入；每次行动最多触发一次。',hint:'伏羲、元始天尊为队友充能，吕洞宾自聚灵，连携兼顾输出与保护。',counter:'敌方削减灵力能拖慢绝技，但给补充灵力留出空间。',trial:'雷狱守关',foe:['yuan','qing','lei','tao','dianmu'],enemyPath:'thunder'}
};
export function freshPaths(){return{focus:'fire',active:null,proofs:Object.fromEntries(Object.keys(PATHS).map(k=>[k,0])),lastBatch:null};}
export function activePath(source){const id=source.path;return id&&Object.hasOwn(PATHS,id)&&source.team.includes(PATHS[id].core)?id:null;}
export function restorePaths(raw,roster,pools){if(!raw||!Object.hasOwn(PATHS,raw.focus)||(raw.active!==null&&!Object.hasOwn(PATHS,raw.active)))throw Error('流派进度无效');const state=freshPaths();state.focus=raw.focus;state.active=raw.active;if(raw.active&&!roster[PATHS[raw.active].core])throw Error('未拥有流派核心');for(const id of Object.keys(PATHS)){const n=raw.proofs?.[id];if(!Number.isInteger(n)||n<0||n>3)throw Error('试阵进度无效');state.proofs[id]=n;}if(raw.lastBatch!==null){const b=raw.lastBatch;if(!b||![1,10,100].includes(b.amount)||!Object.hasOwn(pools,b.pool)||!Array.isArray(b.results)||b.results.length!==b.amount)throw Error('百抽记录无效');state.lastBatch={pool:b.pool,amount:b.amount,results:b.results.map(r=>{if(!Object.hasOwn(roster,r.id)||typeof r.isNew!=='boolean')throw Error('百抽记录无效');return{id:r.id,isNew:r.isNew};})};}return state;}
// Reactions read a frozen action list: reactions never recursively charge another reaction.
export function makePathReactions(left,right,units){const sources={left,right},state={};for(const side of ['left','right']){const id=activePath(sources[side]);state[side]={id,charge:0,triggers:0,damage:0,round:0,roundTriggers:0};}
 const alive=side=>units.filter(u=>u.side===side&&u.hp>0),weak=xs=>[...xs].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.slot-b.slot)[0];
 function process(actor,original,round){const actions=[],chains=[];
  for(const side of [actor.side,actor.side==='left'?'right':'left']){const m=state[side];if(!m.id)continue;const friends=alive(side),enemies=alive(side==='left'?'right':'left'),core=friends.find(u=>u.id===PATHS[m.id].core);if(!core||!enemies.length)continue;if(m.round!==round){m.round=round;m.roundTriggers=0;}
   const own=original.filter(a=>a.side===side),offense=actor.side===side?original.filter(a=>a.type==='damage'):[];const top=Math.max(...friends.map(u=>u.atk));let ready=false,threshold=1;
   if(m.id==='fire'){m.charge+=actor.side===side?original.filter(a=>a.status==='burn').length:0;threshold=3;ready=m.charge>=threshold&&enemies.some(u=>u.burn>0);}
   if(m.id==='sword'){m.charge+=offense.filter(a=>a.exposed).length;threshold=3;ready=m.charge>=threshold;}
   if(m.id==='thunder'){ready=new Set(offense.map(a=>a.target)).size>=3&&m.roundTriggers<2;}
   if(m.id==='bastion'){m.charge+=own.filter(a=>a.type==='damage').reduce((n,a)=>n+(a.absorbed||0),0);threshold=core.atk*2;ready=m.charge>=threshold;}
   if(m.id==='lotus'){m.charge+=own.filter(a=>a.type==='heal').reduce((n,a)=>n+a.amount,0);threshold=units.filter(u=>u.side===side).reduce((n,u)=>n+u.maxHp,0)*.08;ready=m.charge>=threshold;}
   if(m.id==='spirit'){m.charge+=own.filter(a=>a.status==='energy').reduce((n,a)=>n+(a.gain||0),0);threshold=4;ready=m.charge>=threshold;}
   if(!ready)continue;if(m.id!=='thunder')m.charge-=threshold;m.triggers++;m.roundTriggers++;let dealt=0;const source=PATHS[m.id].name;
   function hit(target,raw,defense=1){if(!target||target.hp<=0)return;const amount=Math.max(1,Math.round(raw-target.def*defense)),absorbed=Math.min(target.shield,amount),actual=Math.min(target.hp,amount-absorbed);target.shield-=absorbed;target.hp-=actual;dealt+=actual;actions.push({type:'damage',target:target.id,side:target.side,amount:actual,absorbed,source,chain:m.id,owner:core.id,ownerSide:side});}
   function shield(target,value){const amount=Math.min(Math.round(value),Math.max(0,Math.round(target.maxHp*.6)-target.shield));target.shield+=amount;actions.push({type:'shield',target:target.id,side,amount,source,chain:m.id,owner:core.id,ownerSide:side});}
   if(m.id==='fire')for(const target of enemies.filter(u=>u.burn>0))hit(target,target.maxHp*.06,0);
   if(m.id==='sword'){const back=enemies.filter(u=>u.slot>=2);hit(weak(back.length?back:enemies),top*1.2,.5);}
   if(m.id==='thunder')for(const target of [...enemies].sort((a,b)=>a.hp/a.maxHp-b.hp/b.maxHp||a.slot-b.slot).slice(0,2)){hit(target,top*.45);target.energy=Math.max(0,target.energy-1);actions.push({type:'status',status:'drain',target:target.id,side:target.side,amount:1,source,chain:m.id,owner:core.id,ownerSide:side});}
   if(m.id==='bastion'){const front=enemies.filter(u=>u.slot<2);hit(weak(front.length?front:enemies),core.atk);for(const target of friends.filter(u=>u.slot<2))shield(target,core.atk*.3);}
   if(m.id==='lotus'){for(const target of enemies)hit(target,core.atk*.35,0);const target=weak(friends);for(const k of ['burn','mark','weaken','armorBreak'])target[k]=0;actions.push({type:'status',status:'cleanse',target:target.id,side,amount:0,source,chain:m.id,owner:core.id,ownerSide:side});}
   if(m.id==='spirit'){hit(weak(enemies),top*.9);for(const target of friends)shield(target,core.atk*.2);}
   m.damage+=dealt;chains.push({id:m.id,side,name:source,damage:dealt,trigger:m.triggers});
  }
  return{actions,chains};
 }
 return{process,summary:()=>Object.fromEntries(Object.entries(state).map(([side,m])=>[side,{id:m.id,triggers:m.triggers,damage:m.damage}]))};
}
