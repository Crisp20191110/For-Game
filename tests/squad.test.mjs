import test from 'node:test';
import assert from 'node:assert/strict';
import {HEROES,HERO_BY_ID,heroStats,validateTeam,teamPower,synergy,teamBattle,seededRandom} from '../src/heroes.js';
import {fresh,draw,train,ascend,setSlot,levelLimit,STARTERS,botSquads,leaderboard,startBattle,settle,claim,syncTime,restore} from '../src/squad.js';
const NOW=Date.parse('2026-10-13T12:00:00+08:00');
function squad(team,level=1){return{team,roster:Object.fromEntries(team.map(id=>[id,{level,star:0,copies:1}]))};}
test('18位原创英雄，三个稀有度五种职业，新号已可五人出战',()=>{
 assert.equal(HEROES.length,18);assert.equal(new Set(HEROES.map(h=>h.id)).size,18);assert.equal(new Set(HEROES.map(h=>h.role)).size,5);
 const s=fresh(NOW);assert.equal(s.team.length,5);assert.equal(new Set(s.team).size,5);assert.ok(teamPower(s.team,s.roster)>0);assert.equal(s.unlimited,true);
});
test('单抽与十连的累计保底，SSR重置两种保底且不消耗资源',()=>{
 const s=fresh(NOW);for(let i=0;i<9;i++)draw(s,1,()=>.99);
 assert.equal(s.guarantee,9);assert.equal(HERO_BY_ID[draw(s,1,()=>.99).results[0].id].rarity,'SR');assert.equal(s.guarantee,0);
 for(let i=0;i<39;i++)draw(s,1,()=>.99);assert.equal(s.pity,49);
 assert.equal(HERO_BY_ID[draw(s,1,()=>.99).results[0].id].rarity,'SSR');assert.equal(s.pity,0);assert.equal(s.guarantee,0);assert.equal(s.draws,50);
 assert.ok(draw(s,11).error);assert.equal(s.draws,50);
});
test('跨十连保底、重复英雄与上次结果正确保存',()=>{
 const s=fresh(NOW);s.pity=45;const result=draw(s,10,()=>.99);
 assert.equal(HERO_BY_ID[result.results[4].id].rarity,'SSR');assert.equal(s.pity,5);assert.equal(s.lastDraw.length,10);
 assert.ok(s.roster.zhu.copies>1);assert.equal(s.daily.draws,10);
 const copy=restore(JSON.stringify(s),NOW);assert.deepEqual(copy,s);
});
test('招募随机种子覆盖卡池，保底不会破坏合法英雄与唯一阵容',()=>{
 const s=fresh(NOW),random=seededRandom(92);for(let i=0;i<200;i++)draw(s,10,random);
 assert.equal(Object.keys(s.roster).length,18);assert.deepEqual(s.team,STARTERS);assert.ok(s.pity<50);assert.ok(s.guarantee<10);
});
test('培养无限材料、关卡解锁上限，觉醒取累计同名招募而不扣卡',()=>{
 const s=fresh(NOW);assert.equal(train(s,'qing',true).level,20);assert.ok(train(s,'qing',true).error);
 s.stage=6;assert.equal(levelLimit(s),25);assert.equal(train(s,'qing',true).level,25);
 assert.ok(ascend(s,'qing').error);s.roster.qing.copies=16;
 for(let i=0;i<5;i++)assert.equal(ascend(s,'qing').star,i+1);
 assert.equal(s.roster.qing.copies,16);assert.ok(ascend(s,'qing').error);
});
test('五人不可重复，换已有英雄交换阵位，未拥有者不能入队',()=>{
 const s=fresh(NOW);assert.equal(setSlot(s,0,'ling').swapped,true);assert.equal(s.team[3],'shi');assert.equal(s.team[0],'ling');
 assert.ok(setSlot(s,0,'chen').error);assert.ok(setSlot(s,5,'qing').error);
 assert.throws(()=>validateTeam(['qing','qing','yan','ling','ye']));assert.throws(()=>validateTeam(['qing']));
 draw(s,1,()=>0);assert.ok(s.roster.chen);assert.equal(setSlot(s,0,'chen').swapped,false);assert.equal(new Set(s.team).size,5);
});
test('三人及五人同阵营羁绊、等级与星级都改变真实属性',()=>{
 assert.equal(synergy(STARTERS).bonus,0);assert.equal(synergy(['yuan','qing','yan','ling','ye']).bonus,.08);
 assert.equal(synergy(['yuan','qing','yan','he','chen']).bonus,.14);
 assert.ok(heroStats('qing',20,1).hp>heroStats('qing',20,0).hp);assert.ok(heroStats('qing',20).atk>heroStats('qing',1).atk);
});
test('共享引擎：固定种子可复盘，双方五人逐个行动，伤害/护盾/治疗真实改变状态',()=>{
 const a=squad(STARTERS,10),b=squad(['yuan','xue','xing','tao','he'],10);
 const result=teamBattle(a,b,{seed:123});assert.deepEqual(teamBattle(a,b,{seed:123}),result);
 assert.equal(result.initial.length,10);assert.ok(result.events.length>10);assert.ok(result.rounds<=30);
 assert.ok(result.events.some(e=>e.actions.some(a=>a.type==='heal'&&a.amount>0)));
 assert.ok(result.events.some(e=>e.actions.some(a=>a.type==='shield')));
 assert.ok(result.events.some(e=>e.special));
 for(const e of result.events)for(const u of e.units){assert.ok(u.hp>=0&&u.hp<=u.maxHp);assert.ok(u.shield>=0);}
 assert.equal(a.roster.qing.level,10);assert.equal(a.roster.qing.hp,undefined);
});
test('影袭普攻优先后排，普通剑修优先前排，治疗不能复活阵亡者',()=>{
 const r=teamBattle(squad(STARTERS),squad(['yuan','xue','xing','tao','he']),{seed:23});
 const assassination=r.events.find(e=>HERO_BY_ID[e.actor].role==='assassin'&&!e.special);
 const target=assassination.actions[0].target,enemyTeam=assassination.side==='left'?['yuan','xue','xing','tao','he']:STARTERS;
 assert.ok(enemyTeam.indexOf(target)>=2);
 const sword=r.events.find(e=>HERO_BY_ID[e.actor].role==='blade'&&!e.special);
 const enemySword=sword.side==='left'?['yuan','xue','xing','tao','he']:STARTERS;assert.ok(enemySword.indexOf(sword.actions[0].target)<2);
 const dead=new Set();for(const e of r.events)for(const u of e.units){const key=u.side+u.id;if(dead.has(key))assert.equal(u.hp,0);if(u.hp===0)dead.add(key);}
});
test('同阵容同等级对战没有固定先手必胜，强队能击败弱队',()=>{
 const a=squad(STARTERS,10);const wins={left:0,right:0,draw:0};for(let seed=0;seed<100;seed++)wins[teamBattle(a,a,{seed}).winner]++;
 assert.ok(wins.left>15&&wins.right>15,JSON.stringify(wins));
 assert.equal(teamBattle(squad(STARTERS,20),squad(STARTERS,1),{seed:33}).winner,'left');
});
test('机器人有完整五人阵容，刷新稳定；培养后逐步追赶，连败减压',()=>{
 const s=fresh(NOW);assert.equal(botSquads(s).length,8);assert.equal(leaderboard(s).length,9);
 for(const b of botSquads(s))assert.equal(validateTeam(b.team).length,5);
 const before=JSON.stringify(s);assert.deepEqual(botSquads(s),botSquads(s));assert.equal(JSON.stringify(s),before);
 for(const id of s.team)train(s,id,true);const low=botSquads(s)[0].level;
 const result=startBattle(s,'arena','bamboo',89);assert.equal(result.winner,'left');assert.ok(settle(s,result,NOW).delta>0);
 assert.ok(botSquads(s)[0].level>=low);s.arena.recent=Array(8).fill(false);const easier=botSquads(s)[4].power;s.arena.recent=Array(8).fill(true);assert.ok(botSquads(s)[4].power>easier);
});
test('战斗快照固定且只能结算一次，历练与活动使用同一队伍引擎',()=>{
 const s=fresh(NOW);for(const id of s.team)train(s,id,true);
 const result=startBattle(s,'adventure',null,11);assert.equal(result.winner,'left');assert.equal(settle(s,result,NOW).won,true);assert.equal(s.stage,2);assert.equal(settle(s,result,NOW),false);
 const tower=startBattle(s,'tower',null,11);assert.ok(settle(s,tower,NOW).won);assert.equal(s.weekly.tower,1);
 const duel=startBattle(s,'arena','bamboo',12),snapshot=structuredClone(duel);draw(s,10);assert.deepEqual(duel,snapshot);
 assert.ok(settle(s,duel,NOW));assert.equal(settle(s,duel,NOW),false);
});
test('每日和章节领奖单次结算，跨日和跨周刷新但保留英雄',()=>{
 const s=fresh(NOW);draw(s,10);assert.equal(claim(s,'chapter','summon',NOW),true);assert.equal(claim(s,'chapter','summon',NOW),false);
 assert.equal(claim(s,'daily','login',NOW),true);assert.equal(claim(s,'daily','login',NOW),false);
 const next=NOW+86400000;syncTime(s,next);assert.equal(claim(s,'daily','login',next),true);assert.equal(claim(s,'daily','login',NOW),false);
 const roster=structuredClone(s.roster);s.arena.matches=5;s.arena.rating=1300;s.weekly.tower=4;syncTime(s,NOW+7*86400000);
 assert.equal(s.arena.rating,1000);assert.equal(s.weekly.tower,0);assert.deepEqual(s.roster,roster);assert.equal(s.lastSeason.matches,5);
});
test('跨周的机器人战斗结果不能写入新赛季',()=>{
 const now=Date.parse('2026-10-18T23:59:59+08:00'),s=fresh(now),r=startBattle(s,'arena','bamboo',1);
 assert.equal(settle(s,r,now+1000),false);assert.equal(s.arena.matches,0);
});
test('v1/v2迁移折算初始等级并保留摘要；v3往返包含卡池保底与阵容',()=>{
 for(const version of [1,2]){const s=restore({version,realm:7,stage:20},NOW);assert.equal(s.roster.qing.level,8);assert.deepEqual(s.legacy,{version,realm:7,stage:20});assert.equal(s.stage,1);}
 const s=fresh(NOW);draw(s,10,seededRandom(99));setSlot(s,0,'ling');train(s,'qing',true);
 assert.deepEqual(restore(JSON.stringify(s),NOW),s);
});
test('存档拒绝不存在英雄、重复阵位、伪造星级和非法保底',()=>{
 const s=fresh(NOW);s.team[0]='constructor';assert.throws(()=>restore(s,NOW));s.team=[...STARTERS];s.team[1]='shi';assert.throws(()=>restore(s,NOW));s.team=[...STARTERS];
 s.pity=50;assert.throws(()=>restore(s,NOW));s.pity=0;s.roster.qing.star=5;assert.throws(()=>restore(s,NOW));
 assert.throws(()=>restore('{',NOW));
});
