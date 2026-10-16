import {describeOps} from './techniques.js';
// Original gameplay effects; names draw on Chinese myth and classical ritual objects.
export const EFFECTS={cleanse:{name:'涤尘',text:'绝技后净化全队灼烧与破绽'},rally:{name:'启灵',text:'绝技后为其他存活队友增加 1 点灵力'},leech:{name:'归元',text:'绝技后恢复自身攻击 100% 的气血'},shatter:{name:'碎玉',text:'绝技后对命中的存活目标追加一次攻击 60% 的破盾'},chain:{name:'天雷',text:'绝技后追加攻击全体敌人，造成 25% 攻击伤害'},execute:{name:'诛邪',text:'攻击半血以下敌人伤害提高 30%'},burn:{name:'焚天',text:'绝技命中施加灼烧，目标接下来两次行动后各损失 4% 最大气血；攻击灼烧目标伤害 +20%'},mark:{name:'破绽',text:'绝技命中标记目标，持续目标两次行动；队友攻击标记目标伤害 +15%'},ward:{name:'护道',text:'绝技后为最低血量队友增加自身攻击 80% 的护盾'},spring:{name:'回生',text:'绝技后治疗最低血量队友，自身攻击的 70%'},echo:{name:'追击',text:'绝技后追击最低血量敌人，造成 45% 攻击伤害'},focus:{name:'聚灵',text:'绝技后保留 1 点灵力，下次绝技更快释放'}};
const names={weapon:['桃木剑','青锋剑','玄铁剑','七星剑','龙泉剑','纯阳剑','三尖两刃刀','火尖枪','降魔杵','金箍棒','轩辕剑','诛仙剑'],artifact:['招魂幡','辟邪印','玉净瓶','照妖镜','紫金葫芦','风火轮','混天绫','乾坤圈','玲珑塔','山河社稷图','太极图','盘古幡']};
const op=(type,target,value=2,pierce=false)=>({type,target,value,pierce});
const d=(target,value,pierce=false)=>op('damage',target,value,pierce),h=(target,value)=>op('heal',target,value),w=(target,value)=>op('shield',target,value);
const ITEM_OPS=[
 [op('burn','weak',2)],
 [op('mark','front',2),d('front',.2)],
 [w('self',1),op('weaken','front',1)],
 [op('energy','weakAlly',1),h('weakAlly',.35)],
 [op('armorBreak','front',2),d('front',.3)],
 [op('cleanse','self'),op('energy','self',1)],
 [op('shatter','back',1.2),d('back',.45,true)],
 [d('front',.55),op('burn','front',3)],
 [op('weaken','enemies',1),w('weakAlly',.65)],
 [d('weak',.4),d('weak',.4),h('self',.4)],
 [d('enemies',.4,true),op('mark','front',2)],
 [op('energy','self',1),d('back',.7,true)],
 [op('drain','weak',1),op('mark','weak',1)],
 [op('cleanse','weakAlly'),w('weakAlly',.65)],
 [h('weakAlly',.8),op('regen','weakAlly',2)],
 [op('shatter','back',.8),op('mark','back',2)],
 [op('drain','back',1),h('self',.65)],
 [op('burn','weak',2),op('energy','self',1)],
 [w('frontAllies',.8),op('weaken','weak',2)],
 [d('front',.7),op('drain','front',1)],
 [w('allies',.85),op('taunt','self',1)],
 [h('allies',.5),op('cleanse','allies')],
 [op('energy','weakAlly',1),w('allies',.55)],
 [op('armorBreak','enemies',2),d('enemies',.35,true)]
];
const itemSets=['ember','blade','bastion','spring','hunt','spirit','hunt','ember','bastion','blade','spring','spirit','hunt','bastion','spring','blade','spirit','ember','ember','blade','bastion','spring','spirit','hunt'];
const weights=[[1,0,.25],[1.1,0,.15],[.65,.25,.6],[.8,.2,.25],[1,.1,.2],[.9,.15,.25],[1.15,0,.15],[1.1,.1,.1],[.7,.2,.5],[1,.2,.1],[1.15,.1,.1],[1.2,0,.15],[.2,.9,.3],[0,1,.6],[0,1.1,.25],[.25,.85,.3],[.15,1,.3],[.3,.8,.25],[.1,1.1,.4],[.4,.8,.2],[0,1,.8],[.1,1.15,.3],[.2,1,.4],[.45,.75,.2]];
export const SETS={
 ember:{name:'离火二仪',ops:[op('burn','enemies',1)],description:'绝技后灼烧全体敌人 1 次行动'},
 blade:{name:'破军二仪',ops:[op('armorBreak','front',2),d('front',.3)],description:'绝技后破甲敌方前排单体并追击 30% 攻击'},
 bastion:{name:'玄武二仪',ops:[w('allies',.4)],description:'绝技后为全体队友添加 40% 攻击护盾'},
 spring:{name:'长生二仪',ops:[op('regen','weakAlly',2)],description:'绝技后为最低血量队友添加 2 次行动回春'},
 hunt:{name:'诛邪二仪',ops:[op('mark','back',2),d('back',.3,true)],description:'绝技后标记敌方后排单体并穿透追击 30% 攻击'},
 spirit:{name:'太虚二仪',ops:[op('energy','weakAlly',1)],description:'绝技后为最低血量队友增加 1 点灵力'}
};
export const GEAR=Object.entries(names).flatMap(([kind,list],row)=>list.map((name,i)=>{const art=row*12+i;return{id:`${kind}_${i}`,kind,name,rarity:i<3?'R':i<6?'SR':i<10?'SSR':'UR',effect:`item_${art}`,ops:ITEM_OPS[art],weights:weights[art],set:itemSets[art],art,icon:kind==='weapon'?'⚔':'◈',source:'取材于中国神话、仙侠与传统器物意象；属性、套装与技能为原创游戏设定'};}));
for(const g of GEAR)EFFECTS[g.effect]={name:g.name+(g.id==='weapon_11'?'·聚灵':''),text:describeOps(g.ops)};
for(const [id,set]of Object.entries(SETS))EFFECTS['set_'+id]={name:set.name,text:set.description};
export const GEAR_BY_ID=Object.fromEntries(GEAR.map(g=>[g.id,g]));
export const REFINE_COPIES=[1,2,4,7,11,16];
export function freshArmory(){return{owned:{},equipped:{},training:{},pools:{weapon:{draws:0,pity:0,ur:0},artifact:{draws:0,pity:0,ur:0}}};}
export function itemTraining(a,id){return a?.training?.[id]||{level:1,refine:0};}
export function itemStats(a,id){const g=GEAR_BY_ID[id],t=itemTraining(a,id),base={R:.04,SR:.07,SSR:.11,UR:.16}[g.rarity]*(1+(t.level-1)*.02+t.refine*.1);return Object.fromEntries(['atk','hp','def'].map((key,i)=>[key,base*g.weights[i]]));}
export function gearBonus(armory,id){const result={atk:0,hp:0,def:0,effects:[]};const sets={};for(const gid of Object.values(armory?.equipped?.[id]||{})){const g=GEAR_BY_ID[gid];if(!g)continue;const stats=itemStats(armory,gid);for(const k of ['atk','hp','def'])result[k]+=stats[k];result.effects.push(g.effect);sets[g.set]=(sets[g.set]||0)+1;}for(const [set,count]of Object.entries(sets))if(count===2)result.effects.push('set_'+set);return result;}
export function gearOperations(armory,id){return gearBonus(armory,id).effects.map(effect=>{const g=GEAR.find(g=>g.effect===effect);return{effect,ops:g?g.ops:SETS[effect.slice(4)].ops,scale:g?1+itemTraining(armory,g.id).refine*.1:1};});}
export function enhanceGear(s,id,kind){if(!Object.hasOwn(GEAR_BY_ID,id)||!s.armory.owned[id]||!['level','refine'].includes(kind))return{error:'无效的器物培养'};const t=itemTraining(s.armory,id);if(kind==='level'){if(t.level===20)return{error:'已达器物等级上限 20'};t.level=20;}else{if(t.refine===5)return{error:'已达精炼五星'};const need=REFINE_COPIES[t.refine+1];if(s.armory.owned[id]<need)return{error:'累计抽到 '+need+' 件同名器物可精炼'};t.refine++;}(s.armory.training??={})[id]=t;return{ok:true};}
export function drawGear(s,kind,amount=10,random=Math.random){if(!['weapon','artifact'].includes(kind)||![1,10].includes(amount))return{error:'无效的器物池'};const p=s.armory.pools[kind],results=[];for(let i=0;i<amount;i++){const roll=random(),rarity=p.ur>=79||roll<.03?'UR':p.pity>=19||roll<.15?'SSR':roll<.5?'SR':'R';const choices=GEAR.filter(g=>g.kind===kind&&g.rarity===rarity),g=choices[Math.min(choices.length-1,Math.floor(random()*choices.length))];results.push({id:g.id,isNew:!s.armory.owned[g.id]});s.armory.owned[g.id]=(s.armory.owned[g.id]||0)+1;p.draws++;p.pity=['SSR','UR'].includes(rarity)?0:p.pity+1;p.ur=rarity==='UR'?0:p.ur+1;}return{results};}
export function equipGear(s,hero,id){const g=GEAR_BY_ID[id];if(!s.roster[hero]||!g||!s.armory.owned[id])return{error:'尚未拥有英雄或器物'};const used=Object.entries(s.armory.equipped).filter(([h,slots])=>h!==hero&&slots[g.kind]===id).length;if(used>=s.armory.owned[id])return{error:'此器物已全部装备，再抽同名器物可给更多英雄使用'};(s.armory.equipped[hero]??={})[g.kind]=id;return{ok:true};}
export function restoreArmory(raw,roster,{legacy=false}={}){const a=freshArmory();if(!raw||!raw.owned||!raw.equipped)throw Error('器物存档缺失');const n=(v,max)=>{if(!Number.isSafeInteger(v)||v<0||v>max)throw Error('器物存档数值无效');return v;};for(const [id,count]of Object.entries(raw.owned)){if(!Object.hasOwn(GEAR_BY_ID,id))throw Error('未知器物');a.owned[id]=n(count,1e12);}if((!legacy||Object.hasOwn(raw,'training'))&&(!raw.training||typeof raw.training!=='object'||Array.isArray(raw.training)))throw Error('器物培养数据缺失或无效');const uses={};for(const [hero,slots]of Object.entries(raw.equipped)){if(!Object.hasOwn(roster,hero))throw Error('器物装备英雄无效');a.equipped[hero]={};for(const [kind,id]of Object.entries(slots)){if(!Object.hasOwn(GEAR_BY_ID,id)||GEAR_BY_ID[id].kind!==kind)throw Error('器物槽位无效');uses[id]=(uses[id]||0)+1;if(uses[id]>(a.owned[id]||0))throw Error('装备数量超过持有量');a.equipped[hero][kind]=id;}}for(const kind of ['weapon','artifact']){const p=raw.pools?.[kind];a.pools[kind]={draws:n(p?.draws,1e12),pity:n(p?.pity,19),ur:n(p?.ur,79)};}for(const [id,t]of Object.entries(raw.training||{})){if(!Object.hasOwn(GEAR_BY_ID,id)||!a.owned[id])throw Error('器物培养目标无效');const level=n(t.level,20),refine=n(t.refine,5);if(level<1||a.owned[id]<REFINE_COPIES[refine])throw Error('器物培养数值无效');a.training[id]={level,refine};}return a;}
