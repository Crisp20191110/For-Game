import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, chop, batchPray, resolveDrop, stats, breakthrough, upgrade, battle, rewardBattle, claim, restore, syncTime, periods, realmName, realmGate, rivals, leaderboard, duel, settleDuel, eventBattle, settleEvent, claimDaily, claimWeekly, BOT_PROFILES } from '../src/game.js';
const NOW = Date.parse('2026-10-13T12:00:00+08:00');
const DAY = 86400000;
function rng(seed = 42) { return () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; }; }
function winReady() { const s = fresh(NOW); s.realm = 5; s.pet = 10; batchPray(s, rng()); return s; }

test('资源无限：零余额可以重复祈愿、培养、突破，不扣除货币或等待恢复', () => {
  const s = fresh(NOW);
  assert.equal(s.unlimited, true); assert.equal(s.coins, 0); assert.equal(s.fruit, 0);
  for (let i = 0; i < 100; i++) { assert.ok(chop(s, () => .1).item); resolveDrop(s, true); }
  assert.equal(s.chops, 100); assert.equal(s.daily.chops, 100);
  assert.equal(upgrade(s, 'tree').level, 2); assert.equal(upgrade(s, 'pet').level, 1);
  assert.equal(breakthrough(s).realm, '炼气'); assert.equal(s.coins, 0); assert.equal(s.fruit, 0); assert.equal(s.xp, 0);
});
test('未处理灵物不能覆盖，分解或装备只能结算一次', () => {
  const s = fresh(NOW); chop(s, () => .1);
  assert.ok(chop(s).error); assert.equal(s.chops, 1);
  assert.ok(batchPray(s).error); assert.equal(s.chops, 1);
  assert.ok(resolveDrop(s, true)); assert.equal(resolveDrop(s, true), false);
  assert.ok(stats(s).atk > stats(fresh(NOW)).atk);
});
test('十连处理10件灵物，按当前流派战力择优，图鉴不会重复', () => {
  const s = fresh(NOW), random = rng(); let before = stats(s).power;
  for (let i = 0; i < 30; i++) { const result = batchPray(s, random); assert.ok(result.upgrades >= 0); assert.ok(stats(s).power >= before); before = stats(s).power; }
  assert.equal(s.chops, 300); assert.equal(s.pending, null); assert.equal(s.collection.length, new Set(s.collection).size);
});
test('突破由通关解锁、问道之后继续重天，培养上限随境界增长', () => {
  const s = fresh(NOW); breakthrough(s); assert.ok(breakthrough(s).error);
  s.stage = realmGate(s); assert.equal(breakthrough(s).realm, '筑基');
  s.realm = 7; s.stage = realmGate(s); assert.equal(breakthrough(s).realm, '1重天·凡尘初醒');
  assert.equal(realmName(s.realm), '1重天·凡尘初醒'); assert.ok(s.titles.includes('ascended'));
  s.tree = 11; assert.ok(upgrade(s, 'tree').error); s.realm++; assert.equal(upgrade(s, 'tree').level, 12);
});
test('三种流派有真实的攻防与会心差异', () => {
  const s = fresh(NOW), base = stats(s); s.style = 'sword'; const sword = stats(s);
  assert.ok(sword.atk > base.atk); assert.ok(sword.hp < base.hp); assert.ok(sword.crit > base.crit);
  s.style = 'guard'; assert.ok(stats(s).hp > base.hp); assert.ok(stats(s).def > base.def);
});
test('历练胜负、过期结果、重复结算，失败不推进关卡', () => {
  const s = fresh(NOW); s.stage = 100;
  const failure = battle(s, () => .99); assert.equal(failure.won, false);
  assert.equal(rewardBattle(s, failure).won, false); assert.equal(s.stage, 100); assert.equal(rewardBattle(s, failure), false);
  s.stage = 1; s.realm = 5; const result = battle(s, () => .99);
  assert.equal(result.won, true); assert.equal(rewardBattle(s, result).renown, 10); assert.equal(s.stage, 2);
  assert.equal(s.daily.wins, 1); assert.equal(rewardBattle(s, result), false);
});
test('成长路线奖励一次领取，称号自动入册', () => {
  const s = fresh(NOW); assert.equal(claim(s, 'first'), false); batchPray(s);
  assert.equal(claim(s, 'first'), true); assert.equal(s.renown, 20); assert.ok(s.titles.includes('novice'));
  assert.equal(claim(s, 'first'), false); assert.equal(claim(s, 'missing'), false);
});
test('排行榜包含玩家及8个明确机器人，刷新和读取不会改排名或实力', () => {
  const s = fresh(NOW), before = JSON.stringify(s);
  const board = leaderboard(s); assert.equal(board.length, 9); assert.equal(board.filter(b => b.bot).length, 8);
  assert.deepEqual(leaderboard(s), board); assert.equal(JSON.stringify(s), before);
  assert.ok(rivals(s).at(0).power < stats(s).power); assert.ok(rivals(s).at(-1).power > stats(s).power);
});
test('机器人对战使用固定快照，Elo胜负真实结算，重复领奖被阻止', () => {
  const s = winReady(); const result = duel(s, 'bamboo', () => .99);
  const foe = structuredClone(result.foe); s.realm++;
  assert.deepEqual(result.foe, foe); assert.equal(result.won, true);
  const reward = settleDuel(s, result, NOW); assert.ok(reward.delta > 0); assert.equal(s.arena.matches, 1); assert.equal(s.daily.duels, 1);
  assert.equal(settleDuel(s, result, NOW), false); assert.equal(s.arena.matches, 1);
  assert.ok(duel(s, 'not-a-bot').error);
});
test('战力提升后机器人平滑追赶，连败降低压力，属性不按渲染频率变化', () => {
  const s = fresh(NOW); s.realm = 5; const first = rivals(s)[0];
  assert.ok(first.atk < stats(s).atk); const result = duel(s, 'bamboo', () => .99);
  settleDuel(s, result, NOW); assert.ok(rivals(s)[0].atk >= first.atk);
  s.arena.recent = Array(8).fill(false); const low = rivals(s)[0].power;
  s.arena.recent = Array(8).fill(true); const high = rivals(s)[0].power;
  assert.ok(high > low); assert.ok(high / low < 1.5);
  const before = structuredClone(s.arena); for (let i = 0; i < 100; i++) leaderboard(s);
  assert.deepEqual(s.arena, before);
});
test('300场模拟包含胜负、可超越对手；升级后仍能持续匹配', () => {
  const s = fresh(NOW), random = rng(901); let wins = 0;
  for (let i = 0; i < 300; i++) {
    if (i % 25 === 0) { s.realm++; batchPray(s, random); }
    const result = duel(s, BOT_PROFILES[i % 8].id, random); wins += Number(result.won);
    assert.ok(settleDuel(s, result, NOW));
    for (const b of rivals(s)) assert.ok(Number.isFinite(b.power) && b.power > 0);
  }
  assert.ok(wins > 45 && wins < 255, `Unexpectedly one-sided win rate: ${wins}/300`);
  assert.equal(s.arena.matches, 300); assert.equal(s.arena.recent.length, 8);
});
test('北京时间零点刷新每日任务，不能重复领奖或倒拨时钟领取', () => {
  const before = Date.parse('2026-10-13T23:59:59+08:00'), s = fresh(before);
  assert.equal(claimDaily(s, 'login', before), true); assert.equal(claimDaily(s, 'login', before), false);
  const tomorrow = before + 1000; assert.equal(syncTime(s, tomorrow), true);
  assert.equal(claimDaily(s, 'login', tomorrow), true); assert.equal(s.logins, 2);
  assert.equal(claimDaily(s, 'login', before), false); assert.equal(s.logins, 2);
  assert.equal(claimDaily(s, 'pray', tomorrow), false); batchPray(s); batchPray(s);
  assert.equal(claimDaily(s, 'pray', tomorrow), true); assert.equal(claimDaily(s, 'pray', tomorrow), false);
});
test('周一刷新赛季、榜单与试炼，保留角色并产生上期战报', () => {
  const before = Date.parse('2026-10-18T23:59:59+08:00'), s = winReady(); syncTime(s, before);
  s.arena.rating = 2000; s.arena.matches = 6; s.weekly.tower = 8;
  const realm = s.realm, equipment = structuredClone(s.equipped);
  assert.equal(syncTime(s, before + 1000), true); assert.equal(s.arena.rating, 1000); assert.equal(s.arena.matches, 0);
  assert.equal(s.weekly.tower, 0); assert.equal(s.realm, realm); assert.deepEqual(s.equipped, equipment);
  assert.equal(s.lastSeason.rank, 1); assert.ok(s.titles.includes('season'));
  assert.equal(periods(before + 1000).nextWeek - (before + 1000), 7 * DAY);
});
test('跨周的竞技/活动旧结果不会写入新赛季', () => {
  const before = Date.parse('2026-10-18T23:59:59+08:00'), s = fresh(before);
  const match = duel(s, 'bamboo'), event = eventBattle(s, 'boss');
  assert.equal(settleDuel(s, match, before + 1000), false); assert.equal(settleEvent(s, event, before + 1000), false);
  assert.equal(s.arena.matches, 0); assert.equal(s.weekly.bossTries, 0);
});
test('通天塔固定周基准、逐层变强、十层封顶、奖励防重复', () => {
  const s = fresh(NOW), first = eventBattle(s, 'tower', () => .99).foe;
  s.realm = 100; assert.deepEqual(eventBattle(s, 'tower').foe, first);
  for (let i = 0; i < 10; i++) { const r = eventBattle(s, 'tower', () => .99); assert.equal(r.won, true); assert.equal(settleEvent(s, r, NOW).floor, i + 1); assert.equal(settleEvent(s, r, NOW), false); }
  assert.ok(eventBattle(s, 'tower').error); assert.equal(claimWeekly(s, 'tower10', NOW), true);
  assert.ok(s.titles.includes('tower')); assert.equal(claimWeekly(s, 'tower10', NOW), false);
});
test('首领记录真实伤害，至多十二回合；多次挑战保留最高分', () => {
  const s = fresh(NOW), result = eventBattle(s, 'boss', () => .99);
  assert.ok(result.turns.length <= 24); assert.ok(result.damage > 0);
  const first = settleEvent(s, result, NOW); assert.equal(s.weekly.bossTries, 1);
  assert.equal(settleEvent(s, result, NOW), false);
  s.realm = 5; const next = settleEvent(s, eventBattle(s, 'boss', () => .99), NOW);
  assert.ok(next.best >= first.best); assert.equal(s.weekly.bossTries, 2);
});
test('旧版存档迁移保留成长装备和任务，自动切到无限资源', () => {
  const s = winReady(); chop(s, () => .1);
  const legacy = { ...s, version: 1, coins: 80, fruit: 29, xp: 17, claimed: ['first'] };
  for (const k of ['daily', 'weekly', 'arena', 'collection', 'titles', 'renown', 'seq', 'style']) delete legacy[k];
  const restored = restore(JSON.stringify(legacy), NOW);
  assert.equal(restored.version, 2); assert.equal(restored.unlimited, true);
  assert.equal(restored.realm, s.realm); assert.deepEqual(restored.equipped, s.equipped); assert.deepEqual(restored.pending, s.pending);
  assert.ok(restored.titles.includes('novice')); assert.equal(restored.arena.bots.length, 8);
});
test('新版存档往返保留排名、活动和未收取装备；下周加载正确刷新', () => {
  const s = winReady(); claimDaily(s, 'login', NOW); settleDuel(s, duel(s, 'bamboo'), NOW); chop(s, () => .1);
  const saved = JSON.stringify(s); assert.ok(!saved.includes('Infinity'));
  assert.deepEqual(restore(saved, NOW), s);
  const next = restore(saved, NOW + 7 * DAY); assert.equal(next.arena.matches, 0); assert.equal(next.arena.rating, 1000); assert.deepEqual(next.equipped, s.equipped);
});
test('损坏、越界、原型名称和注入数据被拒绝或净化', () => {
  assert.throws(() => restore('{', NOW)); assert.throws(() => restore({ version: 3 }, NOW));
  const s = fresh(NOW); s.realm = -1; assert.throws(() => restore(s, NOW)); s.realm = 0;
  s.style = 'toString'; assert.throws(() => restore(s, NOW)); s.style = 'balanced';
  chop(s, () => .1); s.pending.name = '<img src=x onerror=alert(1)>';
  assert.equal(restore(s, NOW).pending.name, '流云剑'); s.pending.quality = 9; assert.throws(() => restore(s, NOW));
});
