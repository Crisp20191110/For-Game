export const RARITIES = {
  R: { name: '灵品', color: '#7b9c88', rate: .70, factor: 1 },
  SR: { name: '仙品', color: '#9b85b8', rate: .25, factor: 1.10 },
  SSR: { name: '神品', color: '#d2ac62', rate: .05, factor: 1.22 }
};
export const ROLES = { guard: '御守', blade: '剑修', mage: '术法', healer: '医仙', assassin: '影袭' };
export const FACTIONS = { cloud: '云阙', moon: '月华', wild: '山海' };
export const HEROES = [
  { id:'qing', name:'陆青山', title:'松风剑客', rarity:'R', role:'blade', faction:'cloud', mark:'剑', skill:'松风连斩', lore:'青山一剑，护人间烟火。' },
  { id:'shi', name:'石守一', title:'不动山君', rarity:'R', role:'guard', faction:'wild', mark:'山', skill:'山岳护阵', lore:'守住这方山，便守住归途。' },
  { id:'ling', name:'苏灵芷', title:'百草医仙', rarity:'R', role:'healer', faction:'moon', mark:'芷', skill:'春回万物', lore:'以草木之心，疗世间离伤。' },
  { id:'yan', name:'沈照烟', title:'离火散人', rarity:'R', role:'mage', faction:'cloud', mark:'焰', skill:'离火焚阵', lore:'一灯照夜，一火破迷障。' },
  { id:'ye', name:'夜行舟', title:'无声渡客', rarity:'R', role:'assassin', faction:'moon', mark:'影', skill:'渡影追魂', lore:'风过无痕，剑落有声。' },
  { id:'zhu', name:'竹忘言', title:'空山剑使', rarity:'R', role:'blade', faction:'wild', mark:'竹', skill:'松风连斩', lore:'心有空山，万籁皆剑。' },
  { id:'xue', name:'洛听雪', title:'霜华剑主', rarity:'SR', role:'blade', faction:'moon', mark:'雪', skill:'松风连斩', lore:'剑上霜华，来自千山之雪。' },
  { id:'yuan', name:'岳沉渊', title:'玄岳镇使', rarity:'SR', role:'guard', faction:'cloud', mark:'岳', skill:'山岳护阵', lore:'玄甲载山河，寸步亦不退。' },
  { id:'tao', name:'桃夭夭', title:'桃源灵医', rarity:'SR', role:'healer', faction:'wild', mark:'桃', skill:'春回万物', lore:'花开有时，愿故人无恙。' },
  { id:'xing', name:'司星遥', title:'观星术士', rarity:'SR', role:'mage', faction:'moon', mark:'星', skill:'离火焚阵', lore:'借一缕星辉，照见未至之途。' },
  { id:'he', name:'鹤无踪', title:'云中刺客', rarity:'SR', role:'assassin', faction:'cloud', mark:'鹤', skill:'渡影追魂', lore:'白鹤掠过，长空不留名。' },
  { id:'lei', name:'闻雷', title:'惊雷行者', rarity:'SR', role:'mage', faction:'wild', mark:'雷', skill:'离火焚阵', lore:'踏雷而行，扫尽山间阴霾。' },
  { id:'chen', name:'谢无尘', title:'太虚剑尊', rarity:'SSR', role:'blade', faction:'cloud', mark:'虚', skill:'松风连斩', lore:'剑出太虚，斩断万重因果。' },
  { id:'long', name:'龙玄策', title:'苍龙帝君', rarity:'SSR', role:'guard', faction:'wild', mark:'龙', skill:'山岳护阵', lore:'苍龙覆鳞，守万家灯火。' },
  { id:'yue', name:'月见璃', title:'广寒神女', rarity:'SSR', role:'healer', faction:'moon', mark:'月', skill:'春回万物', lore:'月光所及，皆是她的归人。' },
  { id:'huang', name:'凤九离', title:'九霄炎君', rarity:'SSR', role:'mage', faction:'wild', mark:'凤', skill:'离火焚阵', lore:'九霄浴火，焚尽旧日尘埃。' },
  { id:'ming', name:'墨归冥', title:'幽冥剑隐', rarity:'SSR', role:'assassin', faction:'moon', mark:'冥', skill:'渡影追魂', lore:'向死而生，于影中求道。' },
  { id:'tai', name:'太初子', title:'天机道祖', rarity:'SSR', role:'mage', faction:'cloud', mark:'初', skill:'离火焚阵', lore:'观万物始终，问天地本心。' }
];
export const HERO_BY_ID = Object.fromEntries(HEROES.map(h => [h.id, h]));
const BASE = {
  guard:{hp:650,atk:48,def:38,speed:65}, blade:{hp:420,atk:85,def:20,speed:92},
  mage:{hp:350,atk:93,def:14,speed:78}, healer:{hp:390,atk:68,def:19,speed:83}, assassin:{hp:320,atk:97,def:13,speed:112}
};
export function heroStats(id, level=1, star=0) {
  const h=HERO_BY_ID[id]; if(!h) throw new Error('未知英雄');
  const scale=(1+(level-1)*.075)*(1+star*.08)*RARITIES[h.rarity].factor;
  const st=Object.fromEntries(Object.entries(BASE[h.role]).map(([k,v])=>[k,k==='speed'?v:Math.round(v*scale)]));
  return {...st,power:Math.round(st.atk*5+st.def*4+st.hp/3)};
}
export function validateTeam(team) {
  if(!Array.isArray(team)||team.length!==5||new Set(team).size!==5||team.some(id=>typeof id!=='string'||!Object.hasOwn(HERO_BY_ID,id))) throw new Error('队伍必须由五名不同的英雄组成');
  return [...team];
}
export function synergy(team) {
  const counts={}; for(const id of team){const f=HERO_BY_ID[id].faction;counts[f]=(counts[f]||0)+1;}
  const [faction,size]=Object.entries(counts).sort((a,b)=>b[1]-a[1])[0];
  return {faction,size,bonus:size>=5?.14:size>=3?.08:0};
}
export function teamPower(team, roster, normalized=false) {
  validateTeam(team); const bond=synergy(team);
  return Math.round(team.reduce((sum,id)=>sum+heroStats(id,normalized?50:roster[id].level,normalized?0:roster[id].star).power,0)*(1+bond.bonus));
}
export const SKILL_RULES = {
  guard:'绝技：全队获得自身攻击 90% 的护盾，自己嘲讽敌方 2 次行动。',
  blade:'绝技：对前排单体造成 225% 攻击伤害，优先斩杀残血目标。',
  mage:'绝技：对敌方全体造成 90% 攻击伤害。',
  healer:'绝技：治疗全队，恢复自身攻击 110% 的气血；普攻改为治疗最低血量队友。',
  assassin:'绝技：优先攻击后排最低血量目标，造成 210% 攻击伤害并无视一半防御。'
};
export function seededRandom(seed){let x=seed>>>0;return()=>{x=(Math.imul(x,1664525)+1013904223)>>>0;return x/4294967296;};}
// Shared deterministic simulator: the same engine is usable in the browser and on a PK server.
export function teamBattle(left,right,{seed=1,normalized=false,maxRounds=30}={}) {
  validateTeam(left.team);validateTeam(right.team);
  const random=seededRandom(seed),events=[];
  function create(side,source){const bond=synergy(source.team);return source.team.map((id,slot)=>{
    const st=heroStats(id,normalized?50:source.roster[id].level,normalized?0:source.roster[id].star);
    st.hp=Math.round(st.hp*(1+bond.bonus));st.atk=Math.round(st.atk*(1+bond.bonus));
    return {id,side,slot,...st,maxHp:st.hp,shield:0,energy:0,taunt:0,role:HERO_BY_ID[id].role};
  });}
  const a=create('left',left),b=create('right',right),all=[...a,...b];
  const living=xs=>xs.filter(x=>x.hp>0);
  const snapshot=()=>all.map(x=>({id:x.id,side:x.side,hp:x.hp,maxHp:x.maxHp,shield:x.shield,energy:x.energy}));
  const initial=snapshot();
  let rounds=0;
  for(let round=1;round<=maxRounds && living(a).length && living(b).length;round++){
    rounds=round;
    // Random tie-break avoids a permanent first-player advantage at equal speed.
    const order=all.map(x=>({x,tie:random()})).sort((u,v)=>v.x.speed-u.x.speed||u.tie-v.tie).map(o=>o.x);
    for(const actor of order){
      if(actor.hp<=0||!living(a).length||!living(b).length)continue;
      const allies=living(actor.side==='left'?a:b),foes=living(actor.side==='left'?b:a);
      const special=actor.energy>=2;actor.energy=special?0:actor.energy+1;
      const actions=[];
      function damage(target,multi,pierce=false){
        const crit=random()<.15;
        let amount=Math.max(Math.round(actor.atk*.25),Math.round(actor.atk*multi-target.def*(pierce?.5:1)))*(crit?1.5:1);
        amount=Math.round(amount);const absorbed=Math.min(target.shield,amount);target.shield-=absorbed;
        const actual=Math.min(target.hp,amount-absorbed);target.hp-=actual;
        actions.push({target:target.id,side:target.side,type:'damage',amount:actual,absorbed,crit});
      }
      function heal(target,multi){const amount=Math.min(target.maxHp-target.hp,Math.round(actor.atk*multi));target.hp+=amount;actions.push({target:target.id,side:target.side,type:'heal',amount});}
      const taunter=foes.find(x=>x.taunt>0);
      const front=foes.filter(x=>x.slot<2), back=foes.filter(x=>x.slot>=2);
      const weakest=xs=>[...xs].sort((u,v)=>u.hp/u.maxHp-v.hp/v.maxHp||u.slot-v.slot)[0];
      if(actor.role==='healer'){
        if(special)for(const target of allies)heal(target,1.1);else heal(weakest(allies),1.05);
      }else if(special&&actor.role==='guard'){
        for(const target of allies){const amount=Math.round(actor.atk*.9);target.shield=Math.min(Math.round(target.maxHp*.6),target.shield+amount);actions.push({target:target.id,side:target.side,type:'shield',amount});}
        actor.taunt=2;
      }else if(special&&actor.role==='mage'){
        for(const target of foes)damage(target,.9);
      }else{
        const pool=actor.role==='assassin'?(back.length?back:foes):(front.length?front:foes);
        const target=taunter||weakest(pool);
        damage(target,special?(actor.role==='assassin'?2.1:2.25):1,special&&actor.role==='assassin');
        if(taunter)taunter.taunt--;
      }
      events.push({round,actor:actor.id,side:actor.side,special,skill:special?HERO_BY_ID[actor.id].skill:actor.role==='healer'?'灵息回春':'普通攻击',actions,units:snapshot()});
    }
  }
  const leftAlive=living(a).length,rightAlive=living(b).length;
  // Survivors and then total remaining HP percentage decide a round-cap result.
  const leftHp=a.reduce((sum,x)=>sum+x.hp/x.maxHp,0),rightHp=b.reduce((sum,x)=>sum+x.hp/x.maxHp,0);
  const score=leftAlive-rightAlive||leftHp-rightHp;
  return {winner:Math.abs(score)<1e-8?'draw':score>0?'left':'right',rounds,initial,events,leftAlive,rightAlive};
}
