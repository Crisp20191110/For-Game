export const SAVE_KEY = 'one-leaf-immortal-v1';
export const REALMS = ['凡尘初醒', '炼气', '筑基', '结丹', '元婴', '化神', '归真', '问道'];
export const SLOTS = ['weapon', 'robe', 'charm'];
export const SLOT_NAMES = { weapon: '灵剑', robe: '仙衣', charm: '玉佩' };
export const QUALITIES = [
  { name: '凡品', color: '#839789', multi: 1 },
  { name: '灵品', color: '#58a97e', multi: 1.4 },
  { name: '珍品', color: '#6b9bb7', multi: 2 },
  { name: '仙品', color: '#b68cd3', multi: 3 },
  { name: '天品', color: '#d9af59', multi: 4.5 }
];
const names = { weapon: ['青竹剑', '听雨剑', '流云剑', '照夜剑', '太初剑'], robe: ['素纱衣', '青岚衣', '霜华衣', '星河衣', '九霄衣'], charm: ['山石佩', '碧叶佩', '明月佩', '紫宸佩', '长生佩'] };
export function fresh(now = Date.now()) {
  return { version: 1, realm: 0, xp: 0, coins: 80, fruit: 30, fruitAt: now, tree: 1, pet: 0, stage: 1, chops: 0, wins: 0, claimed: [], equipped: { weapon: null, robe: null, charm: null }, pending: null, lastSeen: now };
}
export function xpNeed(s) { return 35 + s.realm * 35; }
export function stats(s) {
  const result = { atk: 12 + s.realm * 9 + s.pet * 4, hp: 110 + s.realm * 65 + s.pet * 16, def: 3 + s.realm * 3 };
  for (const item of Object.values(s.equipped)) if (item) {
    result.atk += item.atk; result.hp += item.hp; result.def += item.def;
  }
  result.power = result.atk * 5 + result.def * 4 + Math.floor(result.hp / 3);
  return result;
}
export function replenish(s, now = Date.now()) {
  const elapsed = Math.max(0, now - s.fruitAt);
  const gain = Math.floor(elapsed / 30000);
  if (s.fruit >= 50) s.fruitAt = now;
  else if (gain > 0) {
    s.fruit = Math.min(50, s.fruit + gain);
    s.fruitAt = s.fruit === 50 ? now : s.fruitAt + gain * 30000;
  }
  s.lastSeen = now;
  return gain;
}
export function chop(s, random = Math.random) {
  if (s.pending) return { error: '先收下或分解眼前的灵物吧' };
  if (s.fruit < 1) return { error: '灵露不足，每 30 秒恢复 1 滴' };
  s.fruit--; s.chops++; s.xp += 8; s.coins += 3;
  const roll = random();
  const bonus = (s.tree - 1) * .014;
  const quality = roll < .015 + bonus ? 4 : roll < .08 + bonus * 2 ? 3 : roll < .25 + bonus * 2 ? 2 : roll < .60 + bonus ? 1 : 0;
  const slot = SLOTS[Math.min(2, Math.floor(random() * 3))];
  const level = s.realm + 1;
  const value = Math.round((6 + level * 4 + s.tree * 2) * QUALITIES[quality].multi);
  s.pending = { slot, quality, level, name: names[slot][quality], atk: slot === 'weapon' ? value : Math.ceil(value * .25), hp: slot === 'robe' ? value * 7 : value * 2, def: slot === 'charm' ? Math.ceil(value * .6) : Math.ceil(value * .15) };
  return { item: s.pending };
}
export function resolveDrop(s, equip) {
  if (!s.pending) return false;
  const old = s.equipped[s.pending.slot];
  if (equip) s.equipped[s.pending.slot] = s.pending;
  const sold = equip ? old : s.pending;
  const coins = sold ? 8 + sold.quality * 8 + sold.level * 2 : 0;
  s.coins += coins; s.pending = null;
  return { coins };
}
export function breakthrough(s) {
  if (s.realm >= REALMS.length - 1) return { error: '已臻问道之境，继续踏遍山海吧' };
  if (s.xp < xpNeed(s)) return { error: '修为尚浅，再向灵树借几分机缘' };
  s.xp -= xpNeed(s); s.realm++; s.fruit = Math.min(50, s.fruit + 10);
  return { realm: REALMS[s.realm] };
}
export function upgradeCost(s, kind) { return kind === 'tree' ? 70 * s.tree * s.tree : 60 * (s.pet + 1); }
export function upgrade(s, kind) {
  if (!['tree', 'pet'].includes(kind)) return { error: '未知升级' };
  if (s[kind] >= (kind === 'tree' ? 10 : 20)) return { error: '已达最高等级' };
  const cost = upgradeCost(s, kind);
  if (s.coins < cost) return { error: '灵石不足，历练和分解灵物可获得灵石' };
  s.coins -= cost; s[kind]++;
  return { level: s[kind] };
}
export function enemy(stage) {
  const names = ['山野精怪', '青苔石灵', '迷途狐妖', '幽谷剑影', '赤焰山君'];
  return { name: names[(stage - 1) % 5], atk: 8 + stage * 4, hp: 65 + stage * 38, def: 1 + stage * 2, boss: stage % 5 === 0 };
}
export function battle(s, random = Math.random) {
  const player = stats(s), foe = enemy(s.stage), turns = [];
  let hp = player.hp, enemyHp = foe.hp;
  for (let i = 0; i < 100 && hp > 0 && enemyHp > 0; i++) {
    const crit = random() < .18;
    const damage = Math.max(1, player.atk - foe.def) * (crit ? 2 : 1);
    enemyHp = Math.max(0, enemyHp - damage);
    turns.push({ side: 'player', damage, crit, hp, enemyHp });
    if (!enemyHp) break;
    const taken = Math.max(1, foe.atk - player.def);
    hp = Math.max(0, hp - taken);
    turns.push({ side: 'enemy', damage: taken, crit: false, hp, enemyHp });
  }
  return { won: enemyHp === 0, turns, player, foe, stage: s.stage };
}
export function rewardBattle(s, result) {
  if (!result.won || result.stage !== s.stage) return false;
  const coins = 25 + s.stage * 5;
  s.coins += coins; s.xp += 12; s.fruit = Math.min(50, s.fruit + 3); s.stage++; s.wins++;
  return { coins };
}
export const QUESTS = [
  { id: 'first', name: '初见机缘', detail: '向灵树祈愿 5 次', key: 'chops', target: 5, coins: 50, fruit: 10 },
  { id: 'win', name: '初试锋芒', detail: '赢得 1 次历练', key: 'wins', target: 1, coins: 60, fruit: 10 },
  { id: 'realm', name: '引气入体', detail: '突破至炼气境', key: 'realm', target: 1, coins: 80, fruit: 10 },
  { id: 'chops', name: '心诚则灵', detail: '向灵树祈愿 30 次', key: 'chops', target: 30, coins: 150, fruit: 20 },
  { id: 'journey', name: '山海行者', detail: '赢得 10 次历练', key: 'wins', target: 10, coins: 250, fruit: 20 }
];
export function claim(s, id) {
  const q = QUESTS.find(q => q.id === id);
  if (!q || s.claimed.includes(id) || s[q.key] < q.target) return false;
  s.claimed.push(id); s.coins += q.coins; s.fruit = Math.min(50, s.fruit + q.fruit); return true;
}
export function restore(raw, now = Date.now()) {
  const data = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!data || data.version !== 1) throw new Error('存档版本不兼容');
  const state = fresh(now);
  const limits = { realm: 7, xp: 1e9, coins: 1e9, fruit: 50, tree: 10, pet: 20, stage: 100000, chops: 1e9, wins: 1e9 };
  for (const [key, max] of Object.entries(limits)) {
    const min = ['tree', 'stage'].includes(key) ? 1 : 0;
    if (!Number.isSafeInteger(data[key]) || data[key] < min || data[key] > max) throw new Error('存档数据无效');
    state[key] = data[key];
  }
  function item(value, slot) {
    if (value == null) return null;
    if (!SLOTS.includes(value.slot) || (slot && value.slot !== slot) || !Number.isInteger(value.quality) || value.quality < 0 || value.quality > 4 || !Number.isInteger(value.level) || value.level < 1 || value.level > 8) throw new Error('灵物数据无效');
    for (const k of ['atk', 'hp', 'def']) if (!Number.isSafeInteger(value[k]) || value[k] < 0 || value[k] > 100000) throw new Error('属性数据无效');
    return { slot: value.slot, quality: value.quality, level: value.level, name: names[value.slot][value.quality], atk: value.atk, hp: value.hp, def: value.def };
  }
  for (const slot of SLOTS) state.equipped[slot] = item(data.equipped?.[slot], slot);
  state.pending = item(data.pending);
  state.claimed = QUESTS.filter(q => data.claimed?.includes(q.id)).map(q => q.id);
  state.fruitAt = Number.isFinite(data.fruitAt) ? Math.min(now, Math.max(0, data.fruitAt)) : now;
  replenish(state, now);
  return state;
}
