// Keep the original key so v1 progress migrates in place.
export const SAVE_KEY = 'one-leaf-immortal-v1';
export const REALMS = ['凡尘初醒', '炼气', '筑基', '结丹', '元婴', '化神', '归真', '问道'];
export const SLOTS = ['weapon', 'robe', 'charm'];
export const SLOT_NAMES = { weapon: '灵剑', robe: '仙衣', charm: '玉佩' };
export const QUALITIES = [
  { name: '凡品', color: '#839789', multi: 1 }, { name: '灵品', color: '#58a97e', multi: 1.4 },
  { name: '珍品', color: '#6b9bb7', multi: 2 }, { name: '仙品', color: '#b68cd3', multi: 3 },
  { name: '天品', color: '#d9af59', multi: 4.5 }
];
export const STYLES = {
  balanced: { name: '逍遥', description: '均衡攻防 · 会心 18%', atk: 1, hp: 1, def: 1, crit: .18 },
  sword: { name: '剑修', description: '攻击 +25% · 气血 −15% · 会心 28%', atk: 1.25, hp: .85, def: 1, crit: .28 },
  guard: { name: '玄甲', description: '气血 +30% · 防御 +30% · 攻击 −12%', atk: .88, hp: 1.3, def: 1.3, crit: .10 }
};
const itemNames = { weapon: ['青竹剑', '听雨剑', '流云剑', '照夜剑', '太初剑'], robe: ['素纱衣', '青岚衣', '霜华衣', '星河衣', '九霄衣'], charm: ['山石佩', '碧叶佩', '明月佩', '紫宸佩', '长生佩'] };
const DAY = 86400000;
const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
const count = (n, max = 1e12, min = 0) => { if (!Number.isSafeInteger(n) || n < min || n > max) throw new Error('存档数据无效'); return n; };
export function periods(now = Date.now()) {
  const day = Math.floor((now + 8 * 3600000) / DAY);
  return { day, week: Math.floor((day + 3) / 7), nextDay: (day + 1) * DAY - 8 * 3600000, nextWeek: (Math.floor((day + 3) / 7) * 7 + 4) * DAY - 8 * 3600000 };
}
export function realmName(realm) { return realm < 8 ? REALMS[realm] : `${Math.floor(realm / 8)}重天·${REALMS[realm % 8]}`; }
export function power(st) { return st.atk * 5 + st.def * 4 + Math.floor(st.hp / 3); }
export function stats(s) {
  const result = { atk: 12 + s.realm * 9 + s.pet * 4, hp: 110 + s.realm * 65 + s.pet * 16, def: 3 + s.realm * 3 };
  for (const item of Object.values(s.equipped)) if (item) for (const key of ['atk', 'hp', 'def']) result[key] += item[key];
  const style = STYLES[s.style] || STYLES.balanced;
  for (const key of ['atk', 'hp', 'def']) result[key] = Math.round(result[key] * style[key]);
  return { ...result, crit: style.crit, power: power(result) };
}
export const BOT_PROFILES = [
  { id: 'bamboo', name: '竹间客', factor: .78, style: 'balanced', offset: -100 },
  { id: 'rain', name: '听雨眠', factor: .87, style: 'guard', offset: -55 },
  { id: 'cloud', name: '云不归', factor: .95, style: 'sword', offset: -10 },
  { id: 'moon', name: '江上月', factor: 1.02, style: 'balanced', offset: 35 },
  { id: 'snow', name: '折雪衣', factor: 1.09, style: 'sword', offset: 80 },
  { id: 'stone', name: '守山人', factor: 1.16, style: 'guard', offset: 125 },
  { id: 'star', name: '星河渡', factor: 1.24, style: 'balanced', offset: 170 },
  { id: 'crane', name: '鹤九霄', factor: 1.33, style: 'sword', offset: 220 }
];
function arenaState(week, st) {
  return { week, rating: 1000, matches: 0, wins: 0, recent: [], anchor: { atk: st.atk, hp: st.hp, def: st.def }, bots: BOT_PROFILES.map(b => ({ id: b.id, rating: 1000 + b.offset })) };
}
function dailyState(day) { return { day, chops: 0, wins: 0, duels: 0, claimed: [] }; }
function weeklyState(week, st) { return { week, tower: 0, bossBest: 0, bossTries: 0, claimed: [], base: { atk: st.atk, hp: st.hp, def: st.def } }; }
export function fresh(now = Date.now()) {
  const s = { version: 2, unlimited: true, realm: 0, xp: 0, coins: 0, fruit: 0, tree: 1, pet: 0, stage: 1, chops: 0, wins: 0, renown: 0, seq: 0, style: 'balanced', claimed: [], collection: [], titles: [], equipped: { weapon: null, robe: null, charm: null }, pending: null, lastSeen: now, logins: 0, lastSeason: null };
  const p = periods(now), st = stats(s);
  s.daily = dailyState(p.day); s.weekly = weeklyState(p.week, st); s.arena = arenaState(p.week, st);
  return s;
}
export function syncTime(s, now = Date.now()) {
  // A clock moving backwards cannot reopen an already completed period.
  const time = Math.max(s.lastSeen, now), p = periods(time);
  let changed = false;
  if (p.day > s.daily.day) { s.daily = dailyState(p.day); changed = true; }
  if (p.week > s.weekly.week) {
    s.lastSeason = { week: s.arena.week, rating: s.arena.rating, rank: leaderboard(s).findIndex(b => b.id === 'player') + 1, matches: s.arena.matches };
    if (s.arena.matches >= 5 && s.lastSeason.rank <= 3) unlock(s, 'season');
    s.weekly = weeklyState(p.week, stats(s)); s.arena = arenaState(p.week, stats(s)); changed = true;
  }
  s.lastSeen = time;
  return changed;
}
export function replenish(s, now = Date.now()) { return syncTime(s, now); }
export function xpNeed(s) { return 35 + s.realm * 35; } // Legacy display compatibility; cultivation is unlimited.
export function realmGate(s) { return s.realm * 3 + 1; }
export function upgradeLimit(s, kind) { return kind === 'tree' ? Math.min(50, s.realm + 3) : Math.min(20000, s.realm * 2 + 5); }
export function upgradeCost() { return 0; }
export function upgrade(s, kind) {
  if (!['tree', 'pet'].includes(kind)) return { error: '未知培养项目' };
  if (s[kind] >= upgradeLimit(s, kind)) return { error: '已达当前境界培养上限，突破后继续' };
  s[kind]++; return { level: s[kind] };
}
export function breakthrough(s) {
  if (s.realm >= 9999) return { error: '已达本版重天上限' };
  if (s.stage < realmGate(s)) return { error: `先通关第 ${realmGate(s) - 1} 关，再突破境界` };
  s.realm++; unlock(s, s.realm >= 8 ? 'ascended' : ''); return { realm: realmName(s.realm) };
}
export function chop(s, random = Math.random) {
  if (s.pending) return { error: '先处理未收取灵物' };
  s.chops++; s.daily.chops++;
  const roll = random(), bonus = Math.min(9, s.tree - 1) * .014;
  const quality = roll < .015 + bonus ? 4 : roll < .08 + bonus * 2 ? 3 : roll < .25 + bonus * 2 ? 2 : roll < .60 + bonus ? 1 : 0;
  const slot = SLOTS[clamp(Math.floor(random() * 3), 0, 2)], level = s.realm + 1;
  const value = Math.round((6 + level * 4 + s.tree * 2) * QUALITIES[quality].multi);
  s.pending = { slot, quality, level, name: itemNames[slot][quality], atk: slot === 'weapon' ? value : Math.ceil(value * .25), hp: slot === 'robe' ? value * 7 : value * 2, def: slot === 'charm' ? Math.ceil(value * .6) : Math.ceil(value * .15) };
  const id = `${slot}:${quality}`;
  if (!s.collection.includes(id)) s.collection.push(id);
  if (s.collection.length === 15) unlock(s, 'collector');
  return { item: s.pending };
}
export function resolveDrop(s, equip) {
  if (!s.pending) return false;
  if (equip) s.equipped[s.pending.slot] = s.pending;
  s.pending = null; return { coins: 0 };
}
export function batchPray(s, random = Math.random) {
  if (s.pending) return { error: '先处理未收取灵物，再十连祈愿' };
  let upgrades = 0, best = 0;
  for (let i = 0; i < 10; i++) {
    const item = chop(s, random).item, before = stats(s).power, old = s.equipped[item.slot];
    s.equipped[item.slot] = item;
    const better = stats(s).power > before;
    if (!better) s.equipped[item.slot] = old; else upgrades++;
    best = Math.max(best, item.quality); resolveDrop(s, false);
  }
  return { upgrades, best };
}
export function enemy(stage) {
  const names = ['山野精怪', '青苔石灵', '迷途狐妖', '幽谷剑影', '赤焰山君'];
  return { name: names[(stage - 1) % 5], atk: 8 + stage * 4, hp: 65 + stage * 38, def: 1 + stage * 2, crit: .10, boss: stage % 5 === 0 };
}
export function combat(player, foe, random = Math.random, maxRounds = 60) {
  const turns = []; let hp = player.hp, enemyHp = foe.hp;
  for (let i = 0; i < maxRounds && hp > 0 && enemyHp > 0; i++) {
    const crit = random() < (player.crit ?? .18);
    const damage = Math.max(Math.ceil(player.atk * .2), player.atk - foe.def) * (crit ? 2 : 1);
    enemyHp = Math.max(0, enemyHp - damage); turns.push({ side: 'player', damage, crit, hp, enemyHp });
    if (!enemyHp) break;
    const enemyCrit = random() < (foe.crit ?? .18);
    const taken = Math.max(Math.ceil(foe.atk * .2), foe.atk - player.def) * (enemyCrit ? 2 : 1);
    hp = Math.max(0, hp - taken); turns.push({ side: 'enemy', damage: taken, crit: enemyCrit, hp, enemyHp });
  }
  return { won: enemyHp === 0, draw: hp > 0 && enemyHp > 0, damage: foe.hp - enemyHp, turns, player, foe };
}
export function battle(s, random = Math.random) { return { ...combat(stats(s), enemy(s.stage), random), stage: s.stage, seq: s.seq, mode: 'adventure' }; }
export function rewardBattle(s, result) {
  if (result.mode !== 'adventure' || result.seq !== s.seq || result.stage !== s.stage) return false;
  s.seq++;
  if (!result.won) return { won: false, renown: 0 };
  s.renown += 10; s.stage++; s.wins++; s.daily.wins++;
  return { won: true, renown: 10 };
}
export function rivals(s) {
  const current = stats(s), a = s.arena;
  const rate = a.recent.length >= 3 ? a.recent.filter(Boolean).length / a.recent.length : .5;
  const adjustment = clamp(1 + (rate - .5) * .3, .88, 1.12);
  return BOT_PROFILES.map(profile => {
    const st = {};
    // Changes follow the player's build gradually; large equipment jumps retain an advantage.
    for (const key of ['atk', 'hp', 'def']) st[key] = Math.max(1, Math.round(clamp(a.anchor[key], current[key] * .65, current[key] * 1.4) * profile.factor * adjustment * STYLES[profile.style][key]));
    return { ...profile, ...st, power: power(st), crit: STYLES[profile.style].crit, rating: a.bots.find(b => b.id === profile.id).rating, bot: true };
  });
}
export function leaderboard(s) {
  return [...rivals(s), { id: 'player', name: '山中散人', power: stats(s).power, rating: s.arena.rating, bot: false }].sort((a, b) => b.rating - a.rating || a.id.localeCompare(b.id));
}
export function tier(rating) { return rating >= 1600 ? '问道' : rating >= 1400 ? '天枢' : rating >= 1200 ? '玉衡' : rating >= 1050 ? '青云' : '初入'; }
export function duel(s, id, random = Math.random) {
  const foe = rivals(s).find(b => b.id === id);
  if (!foe) return { error: '这位道友不在本届榜单中' };
  return { ...combat(stats(s), foe, random), mode: 'arena', seq: s.seq, week: s.arena.week, opponent: id };
}
export function settleDuel(s, result, now = Date.now()) {
  syncTime(s, now);
  if (result.mode !== 'arena' || result.seq !== s.seq || result.week !== s.arena.week) return false;
  const a = s.arena, bot = a.bots.find(b => b.id === result.opponent);
  if (!bot) return false;
  const expected = 1 / (1 + 10 ** ((bot.rating - a.rating) / 400));
  const delta = Math.round(32 * ((result.draw ? .5 : result.won ? 1 : 0) - expected));
  a.rating = Math.max(0, a.rating + delta); bot.rating = Math.max(0, bot.rating - delta);
  a.matches++; a.wins += Number(result.won); s.seq++; s.daily.duels++; s.renown += result.won ? 12 : 3;
  a.recent = [...a.recent, result.won].slice(-8);
  const current = stats(s);
  for (const key of ['atk', 'hp', 'def']) {
    const bounded = clamp(a.anchor[key], current[key] * .65, current[key] * 1.4);
    a.anchor[key] = Math.max(1, Math.round(bounded + clamp((current[key] - bounded) * .22, -bounded * .18, bounded * .18)));
  }
  // Other simulated competitors make bounded progress only when a match finishes.
  for (const b of a.bots) if (b.id !== bot.id) {
    const p = BOT_PROFILES.find(p => p.id === b.id);
    b.rating = Math.max(0, b.rating + Math.round(clamp((a.rating + p.offset - b.rating) * .08, -10, 10)));
  }
  if (a.wins >= 10) unlock(s, 'duelist');
  return { delta, rating: a.rating };
}
export function eventBattle(s, kind, random = Math.random) {
  if (!['tower', 'boss'].includes(kind)) return { error: '未知活动' };
  if (kind === 'tower' && s.weekly.tower >= 10) return { error: '本周十层试炼已完成，下周再会' };
  const base = s.weekly.base, floor = s.weekly.tower + 1;
  const foe = kind === 'tower' ? { name: `通天塔 · 第 ${floor} 层`, atk: Math.round(base.atk * (.7 + floor * .22)), hp: Math.round(base.hp * (.7 + floor * .22)), def: Math.round(base.def * (.7 + floor * .22)), crit: .12 } : { name: '太古木灵', atk: Math.round(base.atk * 1.3), hp: Math.round(base.hp * 1000), def: base.def, crit: .10 };
  return { ...combat(stats(s), foe, random, kind === 'boss' ? 12 : 60), mode: kind, seq: s.seq, week: s.weekly.week, floor };
}
export function settleEvent(s, result, now = Date.now()) {
  syncTime(s, now);
  if (!['tower', 'boss'].includes(result.mode) || result.seq !== s.seq || result.week !== s.weekly.week || (result.mode === 'tower' && result.floor !== s.weekly.tower + 1)) return false;
  s.seq++;
  if (result.mode === 'tower') { if (result.won) { s.weekly.tower++; s.renown += 25; } return { won: result.won, floor: s.weekly.tower }; }
  const score = Math.round(result.damage / s.weekly.base.hp * 100);
  const improved = score > s.weekly.bossBest;
  s.weekly.bossBest = Math.max(s.weekly.bossBest, score); s.weekly.bossTries++;
  return { score, improved, best: s.weekly.bossBest };
}
export const TITLES = { novice: '青岚新秀', explorer: '山海行者', ascended: '重天问道', collector: '万物藏家', duelist: '论道十胜', tower: '登天客', boss: '镇灵仙师', season: '仙榜三甲', regular: '七日逍遥' };
function unlock(s, id) { if (TITLES[id] && !s.titles.includes(id)) s.titles.push(id); }
export const QUESTS = [
  { id: 'first', name: '第一章 · 与树结缘', detail: '祈愿 5 次', key: 'chops', target: 5, renown: 20, title: 'novice' },
  { id: 'win', name: '第二章 · 初试锋芒', detail: '通关 1 次历练', key: 'wins', target: 1, renown: 30 },
  { id: 'realm', name: '第三章 · 引气入体', detail: '达到炼气境', key: 'realm', target: 1, renown: 40 },
  { id: 'chops', name: '第四章 · 心诚则灵', detail: '祈愿 30 次', key: 'chops', target: 30, renown: 50 },
  { id: 'journey', name: '第五章 · 山海行者', detail: '通关 10 次历练', key: 'wins', target: 10, renown: 100, title: 'explorer' },
  { id: 'heaven', name: '第六章 · 重天之门', detail: '完成第八次突破，开启重天', key: 'realm', target: 8, renown: 200, title: 'ascended' }
];
export function claim(s, id) {
  const q = QUESTS.find(q => q.id === id);
  if (!q || s.claimed.includes(id) || s[q.key] < q.target) return false;
  s.claimed.push(id); s.renown += q.renown; unlock(s, q.title); return true;
}
export const DAILIES = [
  { id: 'login', name: '洞天问安', detail: '每日来洞天看一看', key: null, target: 1, reward: 10 },
  { id: 'pray', name: '灵树盛会', detail: '今日祈愿 20 次', key: 'chops', target: 20, reward: 30 },
  { id: 'travel', name: '巡山访友', detail: '今日通关 3 次历练', key: 'wins', target: 3, reward: 40 },
  { id: 'duel', name: '以武会友', detail: '今日完成 3 场论道', key: 'duels', target: 3, reward: 40 }
];
export function claimDaily(s, id, now = Date.now()) {
  syncTime(s, now);
  const q = DAILIES.find(q => q.id === id);
  if (!q || s.daily.claimed.includes(id) || (q.key && s.daily[q.key] < q.target)) return false;
  s.daily.claimed.push(id); s.renown += q.reward;
  if (id === 'login') { s.logins++; if (s.logins >= 7) unlock(s, 'regular'); }
  return true;
}
export const WEEKLIES = [
  { id: 'tower3', name: '试炼初成', key: 'tower', target: 3, reward: 60 },
  { id: 'tower10', name: '十层登天', key: 'tower', target: 10, reward: 200, title: 'tower' },
  { id: 'boss300', name: '木灵试锋', key: 'bossBest', target: 300, reward: 80 },
  { id: 'boss1000', name: '镇守山河', key: 'bossBest', target: 1000, reward: 200, title: 'boss' }
];
export function claimWeekly(s, id, now = Date.now()) {
  syncTime(s, now); const q = WEEKLIES.find(q => q.id === id);
  if (!q || s.weekly.claimed.includes(id) || s.weekly[q.key] < q.target) return false;
  s.weekly.claimed.push(id); s.renown += q.reward; unlock(s, q.title); return true;
}
export function nextGoal(s) {
  const q = QUESTS.find(q => !s.claimed.includes(q.id));
  if (q) return { ...q, current: Math.min(s[q.key], q.target), ready: s[q.key] >= q.target };
  return { name: '重天之路', detail: `下一境：${realmName(s.realm + 1)} · 通关第 ${realmGate(s) - 1} 关`, current: Math.min(s.stage, realmGate(s)), target: realmGate(s), ready: false };
}
export function restore(raw, now = Date.now()) {
  const d = typeof raw === 'string' ? JSON.parse(raw) : raw;
  if (!d || ![1, 2].includes(d.version)) throw new Error('存档版本不兼容');
  const s = fresh(now);
  const bounds = { realm: 9999, tree: 50, pet: 20000, stage: 100000, chops: 1e12, wins: 1e12 };
  for (const [key, max] of Object.entries(bounds)) s[key] = count(d[key], max, ['tree', 'stage'].includes(key) ? 1 : 0);
  function item(value, slot) {
    if (value == null) return null;
    if (!SLOTS.includes(value.slot) || (slot && value.slot !== slot)) throw new Error('灵物部位无效');
    const quality = count(value.quality, 4), level = count(value.level, 10000, 1);
    const st = Object.fromEntries(['atk', 'hp', 'def'].map(k => [k, count(value[k], 1e8)]));
    return { slot: value.slot, quality, level, name: itemNames[value.slot][quality], ...st };
  }
  for (const slot of SLOTS) s.equipped[slot] = item(d.equipped?.[slot], slot);
  s.pending = item(d.pending);
  function ids(value, allowed) { if (!Array.isArray(value)) throw new Error('存档列表无效'); return [...new Set(value.filter(id => allowed.includes(id)))]; }
  s.claimed = ids(d.claimed, QUESTS.map(q => q.id));
  if (d.version === 1) {
    // Migrate progress; former currencies intentionally become unlimited rather than Infinity in JSON.
    for (const entry of [...Object.values(s.equipped), s.pending]) if (entry && !s.collection.includes(`${entry.slot}:${entry.quality}`)) s.collection.push(`${entry.slot}:${entry.quality}`);
    for (const q of QUESTS) if (s.claimed.includes(q.id)) unlock(s, q.title);
    s.arena = arenaState(periods(now).week, stats(s)); s.weekly = weeklyState(periods(now).week, stats(s));
    return s;
  }
  if (!Object.hasOwn(STYLES, d.style)) throw new Error('流派无效'); s.style = d.style;
  for (const key of ['renown', 'seq', 'logins']) s[key] = count(d[key]);
  s.collection = ids(d.collection, SLOTS.flatMap(slot => QUALITIES.map((_, i) => `${slot}:${i}`)));
  s.titles = ids(d.titles, Object.keys(TITLES));
  const maxPeriod = periods(now).day + 366;
  const st = value => Object.fromEntries(['atk', 'hp', 'def'].map(k => [k, count(value?.[k], 1e9, 1)]));
  s.daily = { day: count(d.daily?.day, maxPeriod), chops: count(d.daily?.chops), wins: count(d.daily?.wins), duels: count(d.daily?.duels), claimed: ids(d.daily?.claimed, DAILIES.map(q => q.id)) };
  s.weekly = { week: count(d.weekly?.week, maxPeriod), tower: count(d.weekly?.tower, 10), bossBest: count(d.weekly?.bossBest), bossTries: count(d.weekly?.bossTries), claimed: ids(d.weekly?.claimed, WEEKLIES.map(q => q.id)), base: st(d.weekly?.base) };
  if (!Array.isArray(d.arena?.recent) || d.arena.recent.length > 8 || d.arena.recent.some(v => typeof v !== 'boolean')) throw new Error('竞技记录无效');
  s.arena = { week: count(d.arena.week, maxPeriod), rating: count(d.arena.rating), matches: count(d.arena.matches), wins: count(d.arena.wins), recent: d.arena.recent, anchor: st(d.arena.anchor), bots: BOT_PROFILES.map(b => ({ id: b.id, rating: count(d.arena.bots?.find(saved => saved.id === b.id)?.rating) })) };
  if (s.arena.week !== s.weekly.week) throw new Error('活动周期不一致');
  s.lastSeason = d.lastSeason == null ? null : { week: count(d.lastSeason.week, maxPeriod), rank: count(d.lastSeason.rank, 9, 1), rating: count(d.lastSeason.rating), matches: count(d.lastSeason.matches) };
  s.lastSeen = Number.isFinite(d.lastSeen) ? clamp(d.lastSeen, 0, now) : now;
  syncTime(s, now);
  return s;
}
