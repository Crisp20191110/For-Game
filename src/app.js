import { SAVE_KEY, REALMS, SLOTS, SLOT_NAMES, QUALITIES, fresh, xpNeed, stats, replenish, chop, resolveDrop, breakthrough, upgradeCost, upgrade, enemy, battle, rewardBattle, QUESTS, claim, restore } from './game.js';

const $ = selector => document.querySelector(selector);
const icons = { weapon: '⚔', robe: '衣', charm: '◈' };
let state = fresh(), tab = 'home', fighting = false, busy = false, storageWarning = '', toastTimer;
try { const raw = localStorage.getItem(SAVE_KEY); if (raw) state = restore(raw); }
catch { storageWarning = '存档不可用，已进入临时修行。请导出存档备份。'; }
function save() {
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
  catch { if (!storageWarning) { storageWarning = '浏览器无法保存进度，请在设置中导出存档'; toast(storageWarning); } }
}
function toast(message) { $('#toast').textContent = message; $('#toast').classList.add('show'); clearTimeout(toastTimer); toastTimer = setTimeout(() => $('#toast').classList.remove('show'), 2800); }
function openModal(html) { $('#modal-body').innerHTML = html; if (!$('#modal').open) $('#modal').showModal(); }
function closeModal() { $('#modal').close(); }
function header() {
  $('#realm').textContent = REALMS[state.realm]; $('#coins').textContent = state.coins; $('#fruit').textContent = state.fruit; $('#power').textContent = stats(state).power;
  $('#regen').textContent = state.fruit >= 50 ? '灵露已满' : `${Math.max(1, Math.ceil((30000 - (Date.now() - state.fruitAt)) / 1000))}秒 +1`;
  $('#quest-dot').hidden = !QUESTS.some(q => state[q.key] >= q.target && !state.claimed.includes(q.id));
}
function render() {
  header();
  document.querySelectorAll('[data-tab]').forEach(b => { b.classList.toggle('active', b.dataset.tab === tab); b.setAttribute('aria-current', b.dataset.tab === tab ? 'page' : 'false'); });
  const st = stats(state);
  if (tab === 'home') $('#page').innerHTML = `
    <section class="scene"><img src="/public/landscape.svg" alt="青山云雾之间，一株挂满金色灵果的古树，树下有一位修行者"><div class="scene-label">青岚洞天<small>一树一世界 · 一叶一修行</small></div><span class="scene-tag">灵树 · ${state.tree} 阶</span><div class="scene-verse">且听风吟，静待花开</div><button class="tree-hit" data-action="pray" aria-label="点击灵树祈愿"></button><div class="scene-footer">${state.chops === 0 ? '轻叩灵树，开启你的第一份机缘' : '山间一日清欢，胜却人间无数'}</div></section>
    <section class="cultivate"><div class="section-title"><span>${REALMS[state.realm]} <small> / ${state.realm === 7 ? '道无止境' : '下一境 · ' + REALMS[state.realm + 1]}</small></span><button class="text-button" data-action="breakthrough">${state.realm === 7 ? '已臻化境' : '突破境界 ↗'}</button></div><div class="xp-row"><div class="xp-track"><div class="xp-fill" style="width:${Math.min(100, state.xp / xpNeed(state) * 100)}%"></div></div><span class="xp-value">修为 ${state.xp} / ${xpNeed(state)}</span></div></section>
    <section class="pray-area"><button class="primary" data-action="pray">${state.pending ? '查看未收取灵物' : '灵 树 祈 愿'}<small>${state.pending ? '机缘未尽' : '❧ 消耗 1 灵露'}</small></button><p class="pray-hint">必得一件灵物 · 修为 +8 · 灵石 +3</p></section><div class="quick-stats"><span>⚔ 攻击 <b>${st.atk}</b></span><span>♡ 气血 <b>${st.hp}</b></span><span>◇ 防御 <b>${st.def}</b></span></div>`;
  if (tab === 'adventure') {
    const foe = enemy(state.stage);
    $('#page').innerHTML = `<section class="page-content"><h2 class="page-heading">山海历练</h2><p class="page-sub">越过一重山，便遇一重天。<br>每次挑战气血全满，失败无损失。</p><div class="arena"><div class="arena-head">青岚山境 · 第 ${state.stage} 关 ${foe.boss ? '· 山君试炼' : ''}</div><div class="fighters"><div class="fighter" id="player-fighter"><div class="fighter-icon">仙</div><strong>山中散人</strong><div class="hp-track"><div id="player-hp"></div></div><div class="hp-label" id="player-hp-label">${st.hp} / ${st.hp}</div></div><span class="versus">VS</span><div class="fighter enemy" id="enemy-fighter"><div class="fighter-icon">${foe.boss ? '虎' : ['妖', '岩', '狐', '影'][(state.stage - 1) % 5]}</div><strong>${foe.name}</strong><div class="hp-track"><div id="enemy-hp"></div></div><div class="hp-label" id="enemy-hp-label">${foe.hp} / ${foe.hp}</div></div></div><div class="battle-log" id="battle-log">${foe.boss ? '山君踞守此地，小心应战。' : '风起林间，前方似有灵息涌动。'}</div></div><button class="primary" data-action="battle">启程历练 <small>自动回合战斗</small></button><div class="card"><div class="section-title"><span>通关机缘</span><small>每关首次获胜</small></div><p>◈ 灵石 ${25 + state.stage * 5}　 ·　 修为 12　 ·　 灵露 3</p></div><p class="tip">遇到强敌？祈愿更好的装备、突破境界，或培养灵兽后再来。</p></section>`;
  }
  if (tab === 'character') $('#page').innerHTML = `<section class="page-content"><h2 class="page-heading">自在修行</h2><p class="page-sub">不争朝夕，只问长生。</p><div class="stat-grid"><div><strong>${st.atk}</strong><small>攻击</small></div><div><strong>${st.hp}</strong><small>气血</small></div><div><strong>${st.def}</strong><small>防御</small></div></div><div class="section-title"><span>随身灵物</span><small>祈愿获得 · 同部位替换</small></div>${SLOTS.map(slot => { const item = state.equipped[slot]; return `<div class="equip-row"><div class="equip-icon" style="color:${item ? QUALITIES[item.quality].color : '#86967e'}">${icons[slot]}</div><div><h3>${item ? item.name : SLOT_NAMES[slot] + ' · 尚未结缘'}</h3><p>${item ? `攻击 ${item.atk} · 气血 ${item.hp} · 防御 ${item.def}` : '去灵树下，求一份机缘'}</p></div><span class="quality" style="color:${item ? QUALITIES[item.quality].color : '#86967e'}">${item ? QUALITIES[item.quality].name : '—'}</span></div>`; }).join('')}<div class="card card-row"><div><h3>♧ 洞天灵树 <span class="pill">${state.tree} 阶</span></h3><p>提升高品质灵物的出现概率</p></div><button class="secondary" data-action="tree" ${state.tree >= 10 ? 'disabled' : ''}>${state.tree >= 10 ? '已满阶' : `培育 · ${upgradeCost(state, 'tree')} ◈`}</button></div><div class="card card-row"><div><h3>♧ 青丘灵狐 <span class="pill">${state.pet ? state.pet + ' 级' : '待结契'}</span></h3><p>每级攻击 +4，气血 +16</p></div><button class="secondary" data-action="pet" ${state.pet >= 20 ? 'disabled' : ''}>${state.pet >= 20 ? '已满级' : `${state.pet ? '培养' : '结契'} · ${upgradeCost(state, 'pet')} ◈`}</button></div><p class="tip">灵树当前天品概率 ${(1.5 + (state.tree - 1) * 1.4).toFixed(1)}%。装备属性随境界、灵树等级与品质提升。</p></section>`;
  if (tab === 'quests') $('#page').innerHTML = `<section class="page-content"><h2 class="page-heading">仙途有缘</h2><p class="page-sub">来时一身清风，归时满袖星辰。</p>${QUESTS.map(q => { const done = state.claimed.includes(q.id), ready = state[q.key] >= q.target; return `<div class="card quest"><div><h3>${q.name}</h3><p>${q.detail} · ${Math.min(state[q.key], q.target)}/${q.target}</p><small>◈ ${q.coins} 灵石　❧ ${q.fruit} 灵露</small></div><button class="secondary" data-claim="${q.id}" ${done || !ready ? 'disabled' : ''}>${done ? '已领取' : ready ? '领取' : '修行中'}</button></div>`; }).join('')}<p class="tip">仙缘奖励每份存档限领一次。灵露最多储存 50 滴，记得及时使用。</p></section>`;
}
function dropModal() {
  const item = state.pending; if (!item) return;
  const quality = QUALITIES[item.quality], old = state.equipped[item.slot];
  openModal(`<p class="eyebrow">灵树赐福 · 机缘已至</p><h2>得一件山中灵物</h2><div class="drop-icon" style="color:${quality.color}">${icons[item.slot]}</div><div class="drop-name" style="color:${quality.color}">${item.name}</div><p class="drop-meta">${quality.name} · ${SLOT_NAMES[item.slot]} · ${REALMS[item.level - 1]}之物</p><div class="drop-stats">${[['atk', '攻击'], ['hp', '气血'], ['def', '防御']].map(([key, name]) => { const diff = item[key] - (old?.[key] || 0); return `<div><small>${name}</small><strong>${item[key]}</strong><em class="${diff < 0 ? 'negative' : ''}">${diff >= 0 ? '+' : ''}${diff}</em></div>`; }).join('')}</div><p class="tip" style="text-align:center">${old ? '装备后，原有灵物会自动分解为灵石' : '装备灵物，提升你的历练实力'}</p><div class="modal-buttons"><button class="secondary" data-action="sell">分解 +${8 + item.quality * 8 + item.level * 2} ◈</button><button class="primary" data-action="equip">装备灵物</button></div>`);
}
async function pray() {
  if (state.pending) return dropModal();
  if (busy) return;
  replenish(state);
  const result = chop(state);
  if (result.error) return toast(result.error);
  busy = true; save(); header();
  const scene = $('.scene'); scene?.classList.add('shake');
  if (scene) { const leaf = document.createElement('span'); leaf.className = 'leaf-particle'; leaf.textContent = '❧'; scene.append(leaf); }
  await new Promise(r => setTimeout(r, 350));
  busy = false; render(); dropModal();
}
async function fight() {
  if (fighting) return;
  fighting = true;
  const result = battle(state), button = $('[data-action="battle"]');
  button.disabled = true; button.textContent = '交锋中…';
  try {
    for (const turn of result.turns) {
      await new Promise(r => setTimeout(r, 180));
      $('#player-hp').style.width = `${turn.hp / result.player.hp * 100}%`;
      $('#enemy-hp').style.width = `${turn.enemyHp / result.foe.hp * 100}%`;
      $('#player-hp-label').textContent = `${turn.hp} / ${result.player.hp}`;
      $('#enemy-hp-label').textContent = `${turn.enemyHp} / ${result.foe.hp}`;
      $('#battle-log').textContent = `${turn.side === 'player' ? '你' : result.foe.name}${turn.crit ? '会心一击' : '出招'}，造成 ${turn.damage} 点伤害`;
      const target = $(turn.side === 'player' ? '#enemy-fighter' : '#player-fighter');
      target.classList.remove('touched'); void target.offsetWidth; target.classList.add('touched');
    }
    const reward = rewardBattle(state, result); save(); header();
    $('#battle-log').innerHTML = reward ? `<span class="battle-result">此战告捷 · 灵石 +${reward.coins}<br><small>修为 +12 · 灵露 +3</small></span>` : '<span class="battle-result">胜败乃修行常事<br><small>提升装备后，再来一战 · 无损失</small></span>';
    button.textContent = result.won ? '前往下一关 →' : '再试一次';
    button.dataset.action = 'next-battle';
  } finally { fighting = false; button.disabled = false; }
}
function settings() {
  if (fighting) return toast('先静候这一场历练结束');
  openModal(`<p class="eyebrow">一叶问仙 · v1.0</p><h2>山中手记</h2><div class="settings-copy"><b>修行小记</b><br>祈愿获得装备与修为 → 突破境界 → 历练赢取灵石 → 培养灵树与灵狐。<br><br><b>在 iPhone 上安装</b><br>用 Safari 打开部署后的 HTTPS 地址，点“分享”→“添加到主屏幕”。首次联网加载完成后可离线游玩。<br><br><b>存档只在此浏览器</b><br>进度自动保存在本机；清除网站数据会丢失进度。添加到主屏幕前，建议导出存档备份，再在主屏幕应用中导入。</div><div class="settings-buttons"><button class="secondary" data-action="export">导出存档备份</button><button class="secondary" data-action="import">导入存档</button><button class="secondary danger" data-action="reset-confirm">重新开始修行</button></div><button class="close" data-action="close">返回洞天</button>`);
}
document.addEventListener('click', async event => {
  const nav = event.target.closest('[data-tab]');
  if (nav) { if (fighting || busy) return toast('稍候片刻，机缘正在发生'); tab = nav.dataset.tab; render(); window.scrollTo({ top: 0 }); return; }
  const claimButton = event.target.closest('[data-claim]');
  if (claimButton && claim(state, claimButton.dataset.claim)) { save(); render(); toast('仙缘已收下，灵石与灵露已入囊'); return; }
  const action = event.target.closest('[data-action]')?.dataset.action;
  if (!action) return;
  if (action === 'pray') return pray();
  if (action === 'close') return closeModal();
  if (action === 'equip' || action === 'sell') {
    const result = resolveDrop(state, action === 'equip'); if (!result) return;
    closeModal(); save(); render(); toast(action === 'equip' ? `灵物已装备${result.coins ? `，旧物分解 +${result.coins} 灵石` : ''}` : `灵物已分解，灵石 +${result.coins}`);
  }
  if (action === 'breakthrough') {
    const result = breakthrough(state); if (result.error) return toast(result.error);
    save(); render(); toast(`破境成功 · ${result.realm}！灵露恢复 10 滴`);
  }
  if (action === 'tree' || action === 'pet') {
    const result = upgrade(state, action); if (result.error) return toast(result.error);
    save(); render(); toast(action === 'tree' ? `灵树已升至 ${result.level} 阶` : `青丘灵狐已升至 ${result.level} 级`);
  }
  if (action === 'battle') return fight();
  if (action === 'next-battle') { render(); return; }
  if (action === 'export') {
    save(); const url = URL.createObjectURL(new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' }));
    const a = document.createElement('a'); a.href = url; a.download = `一叶问仙-${new Date().toISOString().slice(0, 10)}.json`; a.click(); setTimeout(() => URL.revokeObjectURL(url), 60000); toast('已生成备份，请保存到“文件”');
  }
  if (action === 'import') $('#import-file').click();
  if (action === 'reset-confirm') openModal('<h2>重入凡尘？</h2><p class="settings-copy">这会删除当前进度。建议先导出存档。确认后，从一株灵树重新开始。</p><div class="modal-buttons"><button class="secondary" data-action="close">保留修行</button><button class="primary" data-action="reset">确认重来</button></div>');
  if (action === 'reset') { state = fresh(); tab = 'home'; save(); closeModal(); render(); toast('一念起，仙途再启'); }
});
$('#settings').addEventListener('click', settings);
$('#import-file').addEventListener('change', async event => {
  const file = event.target.files[0]; if (!file) return;
  try {
    if (file.size > 100000) throw new Error();
    const imported = restore(await file.text());
    openModal(`<h2>接续这段仙缘？</h2><p class="settings-copy">备份境界：${REALMS[imported.realm]}<br>历练进度：第 ${imported.stage} 关<br>导入将替换当前修行进度。</p><div class="modal-buttons"><button class="secondary" data-action="close">取消</button><button class="primary" id="confirm-import">确认导入</button></div>`);
    $('#confirm-import').onclick = () => { state = imported; tab = 'home'; save(); closeModal(); render(); toast('存档已恢复，仙途继续'); };
  } catch { toast('无法读取这个存档，请选择本游戏导出的 JSON 文件'); }
  finally { event.target.value = ''; }
});
$('#modal').addEventListener('cancel', () => { /* Pending equipment remains available on the home screen. */ });
setInterval(() => { const previous = state.fruit; replenish(state); header(); if (state.fruit !== previous) save(); }, 1000);
document.addEventListener('visibilitychange', () => { replenish(state); save(); header(); });
window.addEventListener('pagehide', save);
render();
if (storageWarning) toast(storageWarning);
if ('serviceWorker' in navigator && window.isSecureContext) navigator.serviceWorker.register('/sw.js').catch(() => toast('离线缓存暂不可用，联网游玩不受影响'));
