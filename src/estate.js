export const BUILDINGS={garden:{name:'百草灵圃',role:'healer',icon:'❀',description:'种植灵药，医仙派驻提高修行效率'},forge:{name:'神工炼器阁',role:'guard',icon:'鼎',description:'温养法宝，御守派驻提高修行效率'},library:{name:'万法藏经楼',role:'mage',icon:'卷',description:'参悟道法，术法派驻提高修行效率'}};
export const RELICS={sword:{name:'镇岳剑',stat:'atk',per:.02,description:'全队攻击，每重 +2%'},bell:{name:'护心钟',stat:'hp',per:.025,description:'全队气血，每重 +2.5%'},mirror:{name:'玄光镜',stat:'def',per:.03,description:'全队防御，每重 +3%'}};
export function freshEstate(now){return{level:1,buildings:{garden:1,forge:1,library:1},assignments:{garden:null,forge:null,library:null},insight:0,totalInsight:0,lastHarvest:now,relics:{sword:0,bell:0,mirror:0},equipped:'sword',elixirs:0,expedition:null,expeditions:0};}
export function estateRate(s,heroes){const e=s.estate;return Object.entries(e.buildings).reduce((sum,[id,l])=>sum+l+(e.assignments[id]?(heroes[e.assignments[id]]?.role===BUILDINGS[id].role?2:1):0),0);}
export function harvestPreview(s,heroes,now=Date.now()){const elapsed=Math.max(0,Math.min(now-s.estate.lastHarvest,24*3600000));return {minutes:Math.floor(elapsed/60000),amount:Math.floor(elapsed/60000)*estateRate(s,heroes)};}
export function harvest(s,heroes,now=Date.now()){const p=harvestPreview(s,heroes,now);if(p.minutes<1)return{error:'每分钟积累一次修行心得，可先完成参悟或探索'};s.estate.insight+=p.amount;s.estate.totalInsight+=p.amount;s.estate.lastHarvest=Math.max(s.estate.lastHarvest,now);return p;}
export function estateAction(s,kind,id,heroes,now=Date.now()){
 const e=s.estate;
 // Accrue the old rate before changing buildings or assignments.
 if(kind==='assign'){if(!Object.hasOwn(BUILDINGS,id.building)||(id.hero&&!s.roster[id.hero]))return{error:'派驻对象无效'};harvest(s,heroes,now);if(id.hero)for(const k in e.assignments)if(e.assignments[k]===id.hero)e.assignments[k]=null;e.assignments[id.building]=id.hero||null;return{message:'派驻已更新；神仙仍可出战'};}
 if(kind==='upgrade'){if(!Object.hasOwn(BUILDINGS,id))return{error:'建筑不存在'};const cap=Math.min(10,1+Math.floor((s.stage-1)/5));if(e.buildings[id]>=cap)return{error:`当前建筑上限 ${cap} 级；每通关 5 次历练提高一级`};harvest(s,heroes,now);e.buildings[id]++;return{message:'建筑已免费升级'};}
 if(kind==='meditate'){e.insight+=30;e.totalInsight+=30;return{message:'主动参悟获得 30 心得，可无限次进行'};}
 if(kind==='alchemy'){const cap=Math.min(10,1+Math.floor((s.stage-1)/5));if(e.elixirs>=cap)return{error:`丹道上限 ${cap} 重；推进历练解锁`};e.elixirs++;return{message:'炼制九转灵丹，永久全队气血 +1%'};}
 if(kind==='forge'){if(!Object.hasOwn(RELICS,id))return{error:'法宝不存在'};const cap=Math.min(10,1+Math.floor((s.stage-1)/5));if(e.relics[id]>=cap)return{error:`炼器上限 ${cap} 重；推进历练解锁`};e.relics[id]++;return{message:RELICS[id].name+'已免费精炼'};}
 if(kind==='equip'){if(!Object.hasOwn(RELICS,id))return{error:'法宝不存在'};e.equipped=id;return{message:'全队佩用法宝已更换'};}
 if(kind==='realm'){const cap=Math.min(10,1+Math.floor((s.stage-1)/5));if(e.level>=cap)return{error:`仙府境界上限 ${cap}；推进历练解锁`};const cost=e.level*60;if(e.insight<cost)return{error:`还需 ${cost-e.insight} 心得；可领取离线修行或免费主动参悟`};e.insight-=cost;e.level++;return{message:'仙府突破，全队攻击与气血再增 1%'};}
 if(kind==='explore'){if(e.expedition)return{error:'已有探索待完成'};e.expedition={endsAt:now+60000,team:[...s.team],reward:60+e.level*10};return{message:'队伍投影进入秘境，1 分钟后可领取，不影响出战'};}
 if(kind==='claim-explore'){if(!e.expedition||now<e.expedition.endsAt)return{error:'探索尚未完成'};const amount=e.expedition.reward;e.insight+=amount;e.totalInsight+=amount;e.expeditions++;e.expedition=null;return{message:`秘境探索完成，获得 ${amount} 心得`};}
 return{error:'未知仙府操作'};
}
export function estateBonus(e){const b={atk:0,hp:0,def:0};if(!e)return b;b.atk=(e.level-1)*.01;b.hp=(e.level-1)*.01+e.elixirs*.01;const relic=RELICS[e.equipped];if(relic)b[relic.stat]+=e.relics[e.equipped]*relic.per;return b;}
