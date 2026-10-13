import test from 'node:test';
import assert from 'node:assert/strict';
import { fresh, chop, resolveDrop, stats, breakthrough, upgrade, battle, rewardBattle, claim, restore, replenish, xpNeed } from '../src/game.js';

test('祈愿消耗资源并生成灵物，未处理灵物不会被覆盖', () => {
  const s = fresh(); const result = chop(s, () => .1);
  assert.equal(result.item.slot, 'weapon'); assert.equal(result.item.quality, 2);
  assert.equal(s.fruit, 29); assert.equal(s.xp, 8); assert.equal(s.coins, 83);
  assert.ok(chop(s).error); assert.equal(s.fruit, 29);
  const before = stats(s); resolveDrop(s, true);
  assert.ok(stats(s).atk > before.atk); assert.equal(s.pending, null);
});
test('分解与替换装备只能领取一次灵石', () => {
  const s = fresh(); chop(s, () => .1); resolveDrop(s, true);
  chop(s, () => .1); const amount = s.coins;
  assert.deepEqual(resolveDrop(s, true), { coins: 26 }); assert.equal(s.coins, amount + 26);
  assert.equal(resolveDrop(s, true), false);
  chop(s, () => .1); const sale = s.coins; resolveDrop(s, false); assert.equal(s.coins, sale + 26);
});
test('灵露不足时无法祈愿；离线恢复封顶且不受未来时钟影响', () => {
  const s = fresh(100000); s.fruit = 0;
  assert.ok(chop(s).error); assert.equal(s.chops, 0);
  replenish(s, 159999); assert.equal(s.fruit, 1);
  replenish(s, 160000); assert.equal(s.fruit, 2);
  replenish(s, 10000000); assert.equal(s.fruit, 50);
  replenish(s, 1); assert.equal(s.fruit, 50);
});
test('突破扣除正确修为，满境界不能继续突破', () => {
  const s = fresh(); assert.ok(breakthrough(s).error);
  s.xp = xpNeed(s); assert.equal(breakthrough(s).realm, '炼气'); assert.equal(s.xp, 0);
  s.realm = 7; s.xp = 999; assert.ok(breakthrough(s).error); assert.equal(s.realm, 7);
});
test('培养正确扣费，余额不足与满级不再扣费', () => {
  const s = fresh(); assert.equal(upgrade(s, 'tree').level, 2); assert.equal(s.coins, 10);
  assert.ok(upgrade(s, 'tree').error); assert.equal(s.coins, 10);
  s.coins = 1000; const before = stats(s); upgrade(s, 'pet'); assert.equal(stats(s).atk, before.atk + 4);
  s.tree = 10; const balance = s.coins; assert.ok(upgrade(s, 'tree').error); assert.equal(s.coins, balance);
});
test('战斗胜负、奖励与关卡推进，重复结算被拒绝', () => {
  const s = fresh(); s.stage = 10; assert.equal(battle(s, () => 1).won, false);
  const old = structuredClone(s); assert.equal(rewardBattle(s, battle(s, () => 1)), false); assert.deepEqual(s, old);
  s.stage = 1; chop(s, () => .001); resolveDrop(s, true);
  const result = battle(s, () => 1); assert.equal(result.won, true);
  assert.ok(result.turns.at(-1).enemyHp === 0);
  const balance = s.coins; assert.deepEqual(rewardBattle(s, result), { coins: 30 });
  assert.equal(s.coins, balance + 30); assert.equal(s.stage, 2); assert.equal(s.wins, 1);
  assert.equal(rewardBattle(s, result), false);
});
test('仙缘必须达成且仅领取一次', () => {
  const s = fresh(); assert.equal(claim(s, 'first'), false);
  s.chops = 5; assert.equal(claim(s, 'first'), true); assert.equal(s.coins, 130);
  assert.equal(claim(s, 'first'), false); assert.equal(claim(s, 'missing'), false);
});
test('存档保留装备和未收取灵物，并正确恢复离线资源', () => {
  const s = fresh(100000); chop(s, () => .1); resolveDrop(s, true); chop(s, () => .9);
  const restored = restore(JSON.stringify(s), 160000);
  assert.equal(restored.fruit, 30); assert.deepEqual(restored.equipped, s.equipped); assert.deepEqual(restored.pending, s.pending);
});
test('损坏、越界及注入存档被拒绝或净化', () => {
  assert.throws(() => restore('{')); assert.throws(() => restore({ version: 2 }));
  const s = fresh(); s.coins = -1; assert.throws(() => restore(s)); s.coins = 80;
  chop(s, () => .1); s.pending.name = '<img src=x onerror=alert(1)>';
  assert.equal(restore(s).pending.name, '流云剑'); s.pending.quality = 8; assert.throws(() => restore(s));
});
