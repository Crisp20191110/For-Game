import {freshEstate} from './estate.js';
import { HEROES, HERO_BY_ID, heroStats, validateTeam, teamPower, teamBattle, seededRandom } from './heroes.js';
export const SAVE_KEY='one-leaf-squad-v3';
export const POOLS = {
 standard:{name:'万仙常驻',subtitle:'三界群仙 · 永久开放',description:'72 位英雄全部可得，收集属于你的仙盟。',featured:'chen'},
 featured:{name:'莲焰神君',subtitle:'哪吒概率 UP',description:'SSR 中 50% 为哪吒；若未获得，下一个 SSR 必为哪吒。',featured:'nezha'},
 beginner:{name:'初入仙途',subtitle:'前十抽必得 SSR',description:'新手专属 20 抽，第一组十抽必有 SSR。',featured:'yue'},
 cloud:{name:'云阙招贤',subtitle:'云阙阵营定向',description:'只招募云阙英雄，更容易组成同阵营羁绊。',featured:'yangjian',faction:'cloud'},
 moon:{name:'月华邀仙',subtitle:'月华阵营定向',description:'只招募月华英雄，聚月光之力护佑仙盟。',featured:'doumu',faction:'moon'},
 wild:{name:'山海唤灵',subtitle:'山海阵营定向',description:'只招募山海英雄，借天地灵气破敌阵。',featured:'wukong',faction:'wild'}
};
function poolState(){return {pity:0,guarantee:0,featuredNext:false,draws:0,mythicPity:0};}
export function poolProgress(s,id=s.activePool){return s.pools[id];}
export function ssrRate(progress,id){return (id==='beginner'&&progress.draws===9)||progress.pity>=49?1:Math.min(1,.10+Math.max(0,progress.pity-39)*.06);}
export const LEGACY_KEY='one-leaf-immortal-v1';
export const STARTERS=['shi','qing','yan','ling','ye'];
const DAY=86400000,clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function periods(now=Date.now()){const day=Math.floor((now+28800000)/DAY),week=Math.floor((day+3)/7);return{day,week,nextDay:(day+1)*DAY-28800000,nextWeek:(week*7+4)*DAY-28800000};}
export const BOTS=[
 {id:'bamboo',name:'竹间客',factor:.78,offset:-100,team:['shi','qing','yan','ling','ye']},
 {id:'rain',name:'听雨眠',factor:.88,offset:-55,team:['yuan','zhu','xing','ling','he']},
 {id:'moon',name:'江上月',factor:.96,offset:0,team:['shi','xue','xing','ling','ye']},
 {id:'cloud',name:'云不归',factor:1.02,offset:40,team:['yuan','qing','yan','tao','he']},
 {id:'snow',name:'折雪衣',factor:1.08,offset:80,team:['yuan','xue','xing','yue','ye']},
 {id:'stone',name:'守山人',factor:1.14,offset:125,team:['long','zhu','lei','tao','he']},
 {id:'star',name:'星河渡',factor:1.20,offset:170,team:['yuan','chen','tai','ling','he']},
 {id:'crane',name:'鹤九霄',factor:1.28,offset:220,team:['long','chen','huang','yue','ming']}
];
function daily(day){return{day,draws:0,wins:0,duels:0,claimed:[]};}
function weekly(week,baseLevel){return{week,tower:0,claimed:[],baseLevel};}
function arena(week,anchor=1){return{week,rating:1000,matches:0,wins:0,recent:[],anchor,bots:BOTS.map(b=>({id:b.id,rating:1000+b.offset}))};}
export function fresh(now=Date.now()){
 const p=periods(now);
 return{version:5,estate:freshEstate(now),savedAt:now,activePool:'standard',pools:Object.fromEntries(Object.keys(POOLS).map(id=>[id,poolState()])),unlimited:true,roster:Object.fromEntries(STARTERS.map(id=>[id,{level:1,star:0,copies:1}])),team:[...STARTERS],draws:0,pity:0,guarantee:0,stage:1,wins:0,renown:0,seq:0,claimed:[],lastPool:'standard',lastDraw:[],daily:daily(p.day),weekly:weekly(p.week,1),arena:arena(p.week),lastSeason:null,lastSeen:now,legacy:null};
}
export function levelLimit(s){return Math.min(100,20+Math.floor((s.stage-1)/5)*5);}
export function draw(s,amount=1,random=Math.random,poolId=s.activePool){
 if(![1,10].includes(amount)||!Object.hasOwn(POOLS,poolId))return{error:'无效的招募方式'};
 const config=POOLS[poolId],p=s.pools[poolId];
 if(poolId==='beginner'&&p.draws+amount>20)return{error:'新手池共开放 20 抽，余下次数可单抽，之后请前往常驻或 UP 卡池'};
 const results=[];
 for(let i=0;i<amount;i++){
  const roll=random(),rate=ssrRate(p,poolId);let rarity;
  if(p.mythicPity>=149)rarity='UR';else if(roll<rate)rarity=random()<.2?'UR':'SSR';else if(p.guarantee>=9||roll<rate+.30)rarity='SR';else rarity='R';
  let candidates=HEROES.filter(h=>h.rarity===rarity&&(!config.faction||h.faction===config.faction));
  if(poolId==='featured'&&rarity==='SSR'){
   if(p.featuredNext||random()<.5){candidates=[HERO_BY_ID[config.featured]];p.featuredNext=false;}
   else {candidates=candidates.filter(h=>h.id!==config.featured);p.featuredNext=true;}
  }
  const h=candidates[clamp(Math.floor(random()*candidates.length),0,candidates.length-1)],isNew=!s.roster[h.id];
  if(isNew)s.roster[h.id]={level:1,star:0,copies:1};else s.roster[h.id].copies++;
  p.mythicPity=rarity==='UR'?0:p.mythicPity+1;p.pity=['SSR','UR'].includes(rarity)?0:p.pity+1;p.guarantee=rarity==='R'?p.guarantee+1:0;p.draws++;
  s.draws++;s.daily.draws++;results.push({id:h.id,isNew});
 }
 s.pity=s.pools.standard.pity;s.guarantee=s.pools.standard.guarantee;
 s.activePool=poolId;s.lastPool=poolId;s.lastDraw=results;return{results};
}
export const STAR_COPIES=[1,2,4,7,11,16];
export function train(s,id,all=false){const own=s.roster[id];if(!own)return{error:'尚未招募该英雄'};const cap=levelLimit(s);if(own.level>=cap)return{error:'已达当前等级上限，推进历练可解锁'};own.level=all?cap:own.level+1;return{level:own.level};}
export function ascend(s,id){const own=s.roster[id];if(!own)return{error:'尚未招募该英雄'};if(own.star>=5)return{error:'已达五星'};if(own.copies<STAR_COPIES[own.star+1])return{error:`累计招募 ${STAR_COPIES[own.star+1]} 次该英雄后解锁下一星`};own.star++;return{star:own.star};}
export function setSlot(s,slot,id){
 if(!Number.isInteger(slot)||slot<0||slot>4||!s.roster[id])return{error:'无效的阵位或英雄'};
 const previous=s.team.indexOf(id),old=s.team[slot];s.team[slot]=id;if(previous>=0)s.team[previous]=old;
 validateTeam(s.team);return{swapped:previous>=0};
}
export function averageLevel(s){return s.team.reduce((sum,id)=>sum+s.roster[id].level,0)/5;}
export function botSquads(s){
 const a=s.arena,avg=averageLevel(s),winrate=a.recent.length>=3?a.recent.filter(Boolean).length/a.recent.length:.5;
 const pressure=clamp(1+(winrate-.5)*.3,.88,1.12),anchor=clamp(a.anchor,avg*.65,avg*1.4);
 const averageStar=s.team.reduce((sum,id)=>sum+s.roster[id].star,0)/5;
 return BOTS.map(b=>{
  const level=clamp(Math.round(anchor*b.factor*pressure),1,100),star=clamp(Math.round(averageStar*b.factor*.85),0,5);
  const roster=Object.fromEntries(b.team.map(id=>[id,{level,star,copies:1}]));
  return{...b,roster,estate:s.estate,level,power:teamPower(b.team,roster,false,s.estate),rating:a.bots.find(x=>x.id===b.id).rating,bot:true};
 });
}
export function leaderboard(s){return[...botSquads(s),{id:'player',name:'你的仙盟',bot:false,team:s.team,power:teamPower(s.team,s.roster,false,s.estate),rating:s.arena.rating}].sort((a,b)=>b.rating-a.rating||a.id.localeCompare(b.id));}
export function syncTime(s,now=Date.now()){
 const time=Math.max(s.lastSeen,now),p=periods(time);let changed=false;
 if(p.day>s.daily.day){s.daily=daily(p.day);changed=true;}
 if(p.week>s.weekly.week){s.lastSeason={rating:s.arena.rating,rank:leaderboard(s).findIndex(b=>b.id==='player')+1,matches:s.arena.matches};s.arena=arena(p.week,averageLevel(s));s.weekly=weekly(p.week,averageLevel(s));changed=true;}
 s.lastSeen=time;return changed;
}
export function opponent(s,mode,id){
 if(mode==='arena')return botSquads(s).find(b=>b.id===id)||null;
 const stage=mode==='tower'?s.weekly.tower+1:s.stage;
 if(mode==='tower'&&stage>10)return null;
 const team=BOTS[(stage-1)%BOTS.length].team;
 const level=clamp(mode==='tower'?Math.round(s.weekly.baseLevel*(.75+stage*.18)):1+Math.floor((stage-1)*1.3),1,100);
 const star=mode==='tower'?0:clamp(Math.floor((stage-1)/25),0,5);
 const roster=Object.fromEntries(team.map(id=>[id,{level,star,copies:1}]));
 return{id:mode,name:mode==='tower'?`通天塔 · 第 ${stage} 层`:`山海试炼 · 第 ${stage} 关`,team,roster,power:teamPower(team,roster)};
}
export function startBattle(s,mode,id,seed=Date.now()){
 if(!['arena','adventure','tower'].includes(mode))return{error:'未知挑战'};
 const foe=opponent(s,mode,id);if(!foe)return{error:'对手不存在或本周试炼已经完成'};
 return{...teamBattle({team:s.team,roster:s.roster,estate:s.estate},foe,{seed}),mode,opponent:foe.id,foe,seq:s.seq,week:s.arena.week,stage:s.stage,floor:s.weekly.tower+1};
}
export function settle(s,result,now=Date.now()){
 syncTime(s,now);
 if(result.seq!==s.seq||!['arena','adventure','tower'].includes(result.mode))return false;
 if(result.mode!=='adventure'&&result.week!==s.arena.week)return false;
 if(result.mode==='adventure'&&result.stage!==s.stage)return false;
 if(result.mode==='tower'&&result.floor!==s.weekly.tower+1)return false;
 const won=result.winner==='left';
 if(result.mode==='arena'){
  const a=s.arena,b=a.bots.find(b=>b.id===result.opponent);if(!b)return false;
  const expected=1/(1+10**((b.rating-a.rating)/400)),delta=Math.round(32*((result.winner==='draw'?.5:won?1:0)-expected));
  a.rating=Math.max(0,a.rating+delta);b.rating=Math.max(0,b.rating-delta);a.matches++;a.wins+=Number(won);a.recent=[...a.recent,won].slice(-8);
  const avg=averageLevel(s),bound=clamp(a.anchor,avg*.65,avg*1.4);a.anchor=bound+(avg-bound)*.22;
  for(const other of a.bots)if(other.id!==b.id){const profile=BOTS.find(x=>x.id===other.id);other.rating=Math.max(0,other.rating+Math.round(clamp((a.rating+profile.offset-other.rating)*.08,-10,10)));}
  s.daily.duels++;s.renown+=won?12:3;s.seq++;return{won,delta};
 }
 s.seq++;
 if(won){s.renown+=result.mode==='tower'?25:10;if(result.mode==='tower')s.weekly.tower++;else{s.stage++;s.wins++;s.daily.wins++;}}
 return{won,renown:won?(result.mode==='tower'?25:10):0};
}
export const QUESTS=[
 {id:'summon',name:'引仙入盟',key:'draws',target:10,reward:20,detail:'累计招募 10 次'},
 {id:'travel',name:'五人成阵',key:'wins',target:5,reward:50,detail:'通关 5 次历练'},
 {id:'collector',name:'群仙毕至',key:'collection',target:HEROES.length,reward:100,detail:`收集全部 ${HEROES.length} 名英雄`},
 {id:'duelist',name:'仙盟争锋',key:'arenaWins',target:10,reward:100,detail:'本赛季赢得 10 场五人论道'}
];
export const DAILIES=[{id:'login',name:'仙盟问安',key:null,target:1,reward:10},{id:'draw',name:'十连结缘',key:'draws',target:20,reward:30},{id:'travel',name:'山海征途',key:'wins',target:3,reward:40},{id:'arena',name:'五人论道',key:'duels',target:3,reward:40}];
export function progress(s,q){return q.key==='collection'?Object.keys(s.roster).length:q.key==='arenaWins'?s.arena.wins:s[q.key];}
export function claim(s,kind,id,now=Date.now()){
 syncTime(s,now);
 if(kind==='daily'){const q=DAILIES.find(q=>q.id===id);if(!q||s.daily.claimed.includes(id)||(q.key&&s.daily[q.key]<q.target))return false;s.daily.claimed.push(id);s.renown+=q.reward;return true;}
 if(kind==='chapter'){const q=QUESTS.find(q=>q.id===id);if(!q||s.claimed.includes(id)||progress(s,q)<q.target)return false;s.claimed.push(id);s.renown+=q.reward;return true;}
 if(kind==='weekly'){const target=id==='tower3'?3:id==='tower10'?10:0;if(!target||s.weekly.claimed.includes(id)||s.weekly.tower<target)return false;s.weekly.claimed.push(id);s.renown+=target===3?60:200;return true;}
 return false;
}
export function migrateLegacy(d,now=Date.now()){
 if(!d||![1,2].includes(d.version)||!Number.isSafeInteger(d.realm)||d.realm<0||d.realm>9999||!Number.isSafeInteger(d.stage)||d.stage<1)throw new Error('旧存档无效');
 const s=fresh(now);s.legacy={version:d.version,realm:d.realm,stage:d.stage};
 for(const h of Object.values(s.roster))h.level=Math.min(20,1+d.realm);
 s.arena=arena(periods(now).week,averageLevel(s));s.weekly=weekly(periods(now).week,averageLevel(s));return s;
}
export function restore(raw,now=Date.now()){
 const d=typeof raw==='string'?JSON.parse(raw):raw;
 if([1,2].includes(d?.version))return migrateLegacy(d,now);
 if(!d||![3,4,5].includes(d.version))throw new Error('存档版本无效');
 const n=(value,max=1e12,min=0)=>{if(!Number.isSafeInteger(value)||value<min||value>max)throw new Error('存档数值无效');return value;};
 const list=(v,allowed)=>{if(!Array.isArray(v))throw new Error('存档列表无效');return[...new Set(v.filter(x=>allowed.includes(x)))];};
 const s=fresh(now);s.roster={};
 if(!d.roster||typeof d.roster!=='object')throw new Error('英雄数据无效');
 for(const h of HEROES)if(Object.hasOwn(d.roster,h.id)){const v=d.roster[h.id];s.roster[h.id]={level:n(v.level,100,1),star:n(v.star,5),copies:n(v.copies,1e12,1)};if(s.roster[h.id].copies<STAR_COPIES[s.roster[h.id].star])throw new Error('星级数据无效');}
 s.team=validateTeam(d.team);if(s.team.some(id=>!s.roster[id]))throw new Error('未拥有的英雄不能出战');
 for(const k of ['draws','wins','renown','seq'])s[k]=n(d[k]);s.stage=n(d.stage,100000,1);s.pity=n(d.pity,49);s.guarantee=n(d.guarantee,9);
 if(d.version>=4){
  if(!Object.hasOwn(POOLS,d.activePool))throw new Error('卡池无效');s.activePool=d.activePool;
  for(const id of Object.keys(POOLS)){const v=d.pools?.[id];if(!v||typeof v.featuredNext!=='boolean')throw new Error('卡池保底无效');s.pools[id]={pity:n(v.pity,49),guarantee:n(v.guarantee,9),featuredNext:v.featuredNext,draws:n(v.draws,id==='beginner'?20:1e12),mythicPity:d.version>=5?n(v.mythicPity,149):0};}
  s.pity=s.pools.standard.pity;s.guarantee=s.pools.standard.guarantee;
 }else{s.pools.standard={pity:s.pity,guarantee:s.guarantee,featuredNext:false,draws:s.draws,mythicPity:0};}
 s.lastPool=Object.hasOwn(POOLS,d.lastPool)?d.lastPool:'standard';
 s.claimed=list(d.claimed,QUESTS.map(q=>q.id));
 if(!Array.isArray(d.lastDraw)||d.lastDraw.length>10)throw new Error('抽卡记录无效');
 s.lastDraw=d.lastDraw.map(x=>{if(!s.roster[x.id]||typeof x.isNew!=='boolean')throw new Error('抽卡记录无效');return{id:x.id,isNew:x.isNew};});
 s.daily={day:n(d.daily?.day),draws:n(d.daily?.draws),wins:n(d.daily?.wins),duels:n(d.daily?.duels),claimed:list(d.daily?.claimed,DAILIES.map(q=>q.id))};
 const decimal=v=>{if(typeof v!=='number'||!Number.isFinite(v)||v<1||v>100)throw new Error('等级基准无效');return v;};
 s.weekly={week:n(d.weekly?.week),tower:n(d.weekly?.tower,10),baseLevel:decimal(d.weekly?.baseLevel),claimed:list(d.weekly?.claimed,['tower3','tower10'])};
 if(!Array.isArray(d.arena?.recent)||d.arena.recent.length>8||d.arena.recent.some(x=>typeof x!=='boolean'))throw new Error('竞技记录无效');
 s.arena={week:n(d.arena.week),rating:n(d.arena.rating),matches:n(d.arena.matches),wins:n(d.arena.wins),anchor:decimal(d.arena.anchor),recent:d.arena.recent,bots:BOTS.map(b=>({id:b.id,rating:n(d.arena.bots?.find(x=>x.id===b.id)?.rating)}))};
 if(s.arena.week!==s.weekly.week)throw new Error('赛季不一致');
 s.lastSeason=d.lastSeason?{rating:n(d.lastSeason.rating),rank:n(d.lastSeason.rank,9,1),matches:n(d.lastSeason.matches)}:null;
 s.legacy=d.legacy?{version:n(d.legacy.version,2,1),realm:n(d.legacy.realm,9999),stage:n(d.legacy.stage,100000,1)}:null;
 if(d.version>=5){
  const e=d.estate;if(!e)throw new Error('仙府数据缺失');s.estate={...freshEstate(now),level:n(e.level,10,1),insight:n(e.insight),totalInsight:n(e.totalInsight),lastHarvest:n(e.lastHarvest,1e15),pendingInsight:e.pendingInsight??0,elixirs:n(e.elixirs,10),expeditions:n(e.expeditions)};
  if(typeof s.estate.pendingInsight!=='number'||!Number.isFinite(s.estate.pendingInsight)||s.estate.pendingInsight<0||s.estate.pendingInsight>=1)throw new Error('离线收益零头无效');
  for(const id of ['garden','forge','library']){s.estate.buildings[id]=n(e.buildings?.[id],10,1);const hero=e.assignments?.[id];if(hero!==null&&!s.roster[hero])throw new Error('派驻英雄无效');s.estate.assignments[id]=hero;}
  const assigned=Object.values(s.estate.assignments).filter(Boolean);if(new Set(assigned).size!==assigned.length)throw new Error('重复派驻');
  for(const id of ['sword','bell','mirror'])s.estate.relics[id]=n(e.relics?.[id],10);
  if(!['sword','bell','mirror'].includes(e.equipped))throw new Error('法宝无效');s.estate.equipped=e.equipped;
  if(e.expedition){s.estate.expedition={endsAt:n(e.expedition.endsAt,1e15),team:validateTeam(e.expedition.team),reward:n(e.expedition.reward,160,70)};}
 }
 s.savedAt=Number.isSafeInteger(d.savedAt)?d.savedAt:0;
 s.lastSeen=Number.isFinite(d.lastSeen)?Math.min(now,Math.max(0,d.lastSeen)):now;syncTime(s,now);return s;
}
