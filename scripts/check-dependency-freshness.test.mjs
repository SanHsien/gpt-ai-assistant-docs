// 依賴新鮮度：「已評估但這次不升」的出口。
//
// 沒有出口時，遇到不該升的項目只剩兩條路：讓每月檢查永遠紅，或把 package.json 的
// 範圍放寬讓報告閉嘴——後者是把相容性宣告當消音鍵。deferral 一定要帶
// deferredLatest，npm 一發出比它新的版本就自動失效，所以不會變成永久靜音。

import assert from 'node:assert/strict';
import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { pathToFileURL } from 'node:url';

import { deferralFor, loadDeferrals, needsMaintenance } from './check-dependency-freshness.mjs';

function deferralsFile(payload) {
  const directory = mkdtempSync(join(tmpdir(), 'docs-deferrals-'));
  const path = join(directory, 'dependency-deferrals.json');
  writeFileSync(path, JSON.stringify(payload), 'utf8');
  return pathToFileURL(path);
}

test('an entry without a reviewed release is ignored', () => {
  const path = deferralsFile({ deferrals: { vuepress: { reason: 'later' } } });

  assert.deepEqual(loadDeferrals(path), {});
});

test('an entry with a reviewed release and a reason is read', () => {
  const path = deferralsFile({
    deferrals: { vuepress: { deferredLatest: '2.0.0-rc.30', reason: '要先重建站台' } },
  });

  assert.deepEqual(loadDeferrals(path), {
    vuepress: { reviewed: '2.0.0-rc.30', reason: '要先重建站台' },
  });
});

test('a missing file defers nothing', () => {
  assert.deepEqual(loadDeferrals(pathToFileURL(join(tmpdir(), 'no-such-deferrals.json'))), {});
});

test('a deferral expires once npm moves past the reviewed release', () => {
  const deferrals = { vuepress: { reviewed: '2.0.0-rc.30', reason: '要先重建站台' } };

  const stillCovered = deferralFor(
    { name: 'vuepress', current: '2.0.0-rc.29', wanted: '2.0.0-rc.29', latest: '2.0.0-rc.30' },
    deferrals,
  );
  const movedOn = deferralFor(
    { name: 'vuepress', current: '2.0.0-rc.29', wanted: '2.0.0-rc.29', latest: '2.0.0-rc.31' },
    deferrals,
  );

  assert.equal(stillCovered?.reason, '要先重建站台');
  assert.equal(movedOn, null);
});

test('a deferred row does not demand maintenance, an undeferred one does', () => {
  const row = { name: 'vuepress', current: '2.0.0-rc.29', wanted: '2.0.0-rc.29', latest: '2.0.0-rc.30' };

  assert.equal(needsMaintenance(row, {}), true);
  assert.equal(
    needsMaintenance(row, { vuepress: { reviewed: '2.0.0-rc.30', reason: '要先重建站台' } }),
    false,
  );
});
