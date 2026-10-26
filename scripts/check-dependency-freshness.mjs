// Dependabot proposes upgrades one package at a time; nothing here answered the
// monthly question -- across the whole toolchain, how much is behind, and is
// anything vulnerable? This runs `npm outdated` and `npm audit` and renders one
// report. It reads only: no install, no manifest edit, no merge.
//
//     node scripts/check-dependency-freshness.mjs --github-output --output report.md

import { readFileSync } from 'node:fs';
import { appendFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

const EMPTY_AUDIT = {
  info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0,
};

export function normalizeOutdated(outdated = {}) {
  return Object.entries(outdated)
    .map(([name, details]) => ({
      name,
      type: details.type ?? 'unknown',
      current: details.current ?? 'unknown',
      wanted: details.wanted ?? 'unknown',
      latest: details.latest ?? 'unknown',
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
}

export function normalizeAudit(audit = {}) {
  const counts = audit.metadata?.vulnerabilities ?? {};
  return Object.fromEntries(
    Object.keys(EMPTY_AUDIT).map((severity) => [severity, Number(counts[severity] ?? 0)]),
  );
}

const VERSION_PATTERN = /^(\d+(?:\.\d+)*)(?:-([0-9A-Za-z.-]+))?/u;

export function parseVersion(version) {
  const match = VERSION_PATTERN.exec(String(version).trim());
  if (!match) return null;
  return {
    release: match[1].split('.').map(Number),
    prerelease: match[2] ? match[2].split('.') : null,
  };
}

// semver 11.4: numeric identifiers compare as numbers and rank below
// alphanumeric ones, which compare lexically; a shorter list loses a tie.
// Comparing only the trailing number would rank beta.9 above rc.1.
function comparePrerelease(left, right) {
  const length = Math.max(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const a = left[index];
    const b = right[index];
    if (a === undefined) return -1;
    if (b === undefined) return 1;
    const aNumeric = /^\d+$/u.test(a);
    const bNumeric = /^\d+$/u.test(b);
    if (aNumeric && bNumeric) {
      if (Number(a) !== Number(b)) return Number(a) > Number(b) ? 1 : -1;
    } else if (aNumeric !== bNumeric) {
      return aNumeric ? -1 : 1;
    } else if (a !== b) {
      return a > b ? 1 : -1;
    }
  }
  return 0;
}

export function isNewer(candidate, reference) {
  const left = parseVersion(candidate);
  const right = parseVersion(reference);
  if (!left || !right) return false;

  const length = Math.max(left.release.length, right.release.length);
  for (let index = 0; index < length; index += 1) {
    const a = left.release[index] ?? 0;
    const b = right.release[index] ?? 0;
    if (a !== b) return a > b;
  }

  // Same release segment: a stable release outranks any pre-release of it.
  if (!left.prerelease && right.prerelease) return true;
  if (left.prerelease && !right.prerelease) return false;
  if (!left.prerelease && !right.prerelease) return false;
  return comparePrerelease(left.prerelease, right.prerelease) > 0;
}

export function statusFor({ current, wanted, latest }) {
  if (current !== wanted) {
    return wanted === latest ? 'In-range update available' : 'In-range update, newer major to assess';
  }
  if (current === latest) return 'OK';
  // VuePress 2 ships as release candidates, and its `latest` dist-tag still
  // points at the 1.x line -- so the installed copy is routinely *ahead* of
  // `latest`. Reporting that as an available update would make every monthly
  // run cry wolf about three of the four dependencies.
  return isNewer(latest, current) ? 'Newer release to assess' : '已超前 dist-tag latest';
}

// A red line needs an honest way to say "reviewed, not now". Without one the
// only ways to clear it are to leave the monthly check red forever or to widen
// the range in package.json to make the report shut up -- and a range is a
// compatibility statement, not a mute button.
//
// `deferredLatest` is what makes a deferral expire by itself: once npm publishes
// something newer than the release it was reviewed against, the row comes back.
// An entry without it is ignored, because that would be a silenced check rather
// than a postponed one.
export const DEFERRALS_PATH = new URL('../.github/dependency-deferrals.json', import.meta.url);

export function loadDeferrals(path = DEFERRALS_PATH) {
  let parsed;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return {};
  }
  const entries = parsed?.deferrals ?? {};
  const deferrals = {};
  for (const [name, entry] of Object.entries(entries)) {
    const reviewed = String(entry?.deferredLatest ?? '').trim();
    const reason = String(entry?.reason ?? '').trim();
    if (reviewed && reason) deferrals[name.toLowerCase()] = { reviewed, reason };
  }
  return deferrals;
}

export function deferralFor(row, deferrals = loadDeferrals()) {
  const entry = deferrals[String(row.name ?? '').toLowerCase()];
  if (!entry) return null;
  // Still covered only while npm has not moved past the reviewed release.
  return isNewer(row.latest, entry.reviewed) ? null : entry;
}

export function needsMaintenance(row, deferrals = undefined) {
  const status = statusFor(row);
  if (status === 'OK' || status === '已超前 dist-tag latest') return false;
  return !deferralFor(row, deferrals ?? loadDeferrals());
}

function runNpm(args) {
  // npm is a shim on Windows; spawning it without a shell fails with EINVAL.
  const isWindows = process.platform === 'win32';
  const command = isWindows ? (process.env.ComSpec ?? 'cmd.exe') : 'npm';
  const commandArgs = isWindows ? ['/d', '/s', '/c', `npm ${args.join(' ')}`] : args;
  return spawnSync(command, commandArgs, { encoding: 'utf8' });
}

function describeNpmError(error) {
  return [error.code, error.summary].filter(Boolean).join(' ') || JSON.stringify(error);
}

export function checkDependencies({ npm = runNpm } = {}) {
  // `npm outdated` exits 1 when something is outdated and `npm audit` exits 1 on
  // a finding. Both are answers, not failures.
  const outdatedResult = npm(['outdated', '--json', '--long', '--all=false']);
  const auditResult = npm(['audit', '--json']);
  const errors = [];
  let rows = [];
  let audit = { ...EMPTY_AUDIT };

  if (![0, 1].includes(outdatedResult.status)) {
    errors.push((outdatedResult.stderr || `npm outdated exited ${outdatedResult.status}`).trim());
  } else {
    try {
      const outdated = outdatedResult.stdout.trim() ? JSON.parse(outdatedResult.stdout) : {};
      // A registry failure still exits 1 and prints {"error": {...}} on stdout;
      // read as a package map it becomes one row named "error" that looks "OK".
      if (outdated.error) throw new Error(describeNpmError(outdated.error));
      rows = normalizeOutdated(outdated);
    } catch (error) {
      errors.push(`npm outdated failed: ${error.message}`);
    }
  }

  if (![0, 1].includes(auditResult.status)) {
    errors.push((auditResult.stderr || `npm audit exited ${auditResult.status}`).trim());
  } else {
    try {
      const parsed = JSON.parse(auditResult.stdout);
      // Same shape on failure: all-zero counts would pass as a clean audit.
      if (parsed.error) throw new Error(describeNpmError(parsed.error));
      audit = normalizeAudit(parsed);
    } catch (error) {
      errors.push(`npm audit failed: ${error.message}`);
    }
  }

  return { rows, audit, checkError: errors.join('; ') };
}

export function renderMarkdown(rows, { audit = EMPTY_AUDIT, checkError = '' } = {}) {
  const lines = [
    '# 文件站依賴新鮮度',
    '',
    '| 套件 | 類型 | 已安裝 | 範圍內可用 | npm latest | 狀態 |',
    '| --- | --- | --- | --- | --- | --- |',
  ];

  for (const row of rows) {
    lines.push(
      `| \`${row.name}\` | \`${row.type}\` | \`${row.current}\` | \`${row.wanted}\` | `
      + `\`${row.latest}\` | ${statusFor(row)} |`,
    );
  }
  if (rows.length === 0 && !checkError) {
    lines.push('| — | — | — | — | — | 全部為最新 |');
  }

  lines.push(
    '',
    '## npm audit',
    '',
    '| Info | Low | Moderate | High | Critical | 合計 |',
    '| --- | --- | --- | --- | --- | --- |',
    `| ${audit.info} | ${audit.low} | ${audit.moderate} | ${audit.high} | ${audit.critical} `
    + `| ${audit.total} |`,
  );

  if (checkError) {
    lines.push('', `> 檢查失敗：${checkError}`);
  }

  lines.push(
    '',
    '範圍內更新交給 Dependabot；跨 rc 或 major 要先讀 release notes，並以 `npm run build`',
    '（含 `check:links`）確認 13 頁與全部內部連結仍然成立才合併。',
    '',
  );
  return `${lines.join('\n')}\n`;
}

async function writeGithubOutput({ needsAttention, checkFailed, reportPath }) {
  const outputPath = process.env.GITHUB_OUTPUT;
  if (!outputPath) return;
  await appendFile(outputPath, [
    `needs_attention=${needsAttention ? 'true' : 'false'}`,
    `check_failed=${checkFailed ? 'true' : 'false'}`,
    `report_path=${reportPath}`,
    '',
  ].join('\n'), 'utf8');
}

function parseArgs(args) {
  const options = { output: 'dependency-freshness-report.md', githubOutput: false };
  for (let index = 0; index < args.length; index += 1) {
    if (args[index] === '--github-output') {
      options.githubOutput = true;
    } else if (args[index] === '--output' && args[index + 1]) {
      options.output = args[index + 1];
      index += 1;
    }
  }
  return options;
}

// Only run the check when this file is the entry point. Without the guard, merely
// importing it -- which the unit tests do -- spawns `npm outdated` and `npm audit`
// and overwrites the report file, so the tests would depend on the network to
// assert pure functions.
const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const options = parseArgs(process.argv.slice(2));
  const deferrals = loadDeferrals();
  const { rows, audit, checkError } = checkDependencies();
  const report = renderMarkdown(rows, { audit, checkError });
  await writeFile(options.output, report, 'utf8');
  process.stdout.write(report);

  if (options.githubOutput) {
    await writeGithubOutput({
      needsAttention:
        rows.some((row) => needsMaintenance(row, deferrals)) ||
        audit.total > 0 ||
        Boolean(checkError),
      checkFailed: Boolean(checkError),
      reportPath: options.output,
    });
  }
}
