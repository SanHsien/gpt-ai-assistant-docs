import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import {
  checkBuiltLinks,
  extractAnchors,
  localTarget,
  pageUrl,
} from './check-built-links.mjs';

const scriptPath = fileURLToPath(new URL('./check-built-links.mjs', import.meta.url));

function createFixtureSite(pages) {
  const root = mkdtempSync(join(tmpdir(), 'check-links-test-'));
  for (const [subpath, content] of Object.entries(pages)) {
    const fullPath = join(root, subpath);
    mkdirSync(join(fullPath, '..'), { recursive: true });
    writeFileSync(fullPath, content, 'utf8');
  }
  return root;
}

test('extractAnchors extracts ids and legacy a[name] anchors', () => {
  const html = '<h1 id="intro">Intro</h1><a name="legacy-section"></a><div id="foo-bar"></div>';
  const anchors = extractAnchors(html);

  assert.equal(anchors.has('intro'), true);
  assert.equal(anchors.has('legacy-section'), true);
  assert.equal(anchors.has('foo-bar'), true);
  assert.equal(anchors.has('non-existent'), false);
});

test('localTarget resolves same-page and cross-page anchor links', () => {
  const root = '/site';
  const base = '/gpt-ai-assistant-docs/';
  const source = join(root, 'page.html');
  const sourceUrl = pageUrl(source, root, base);

  assert.equal(localTarget('mailto:test@example.com', sourceUrl, root, base), null);
  assert.equal(localTarget('tel:12345', sourceUrl, root, base), null);
  assert.equal(localTarget('javascript:void(0)', sourceUrl, root, base), null);

  assert.deepEqual(localTarget('#section', sourceUrl, root, base), {
    filePath: source,
    hash: 'section',
  });

  assert.deepEqual(localTarget('./other.html#topic', sourceUrl, root, base), {
    filePath: join(root, 'other.html'),
    hash: 'topic',
  });

  assert.deepEqual(
    localTarget('/gpt-ai-assistant-docs/other.html#%E9%96%8B%E5%A7%8B', sourceUrl, root, base),
    {
      filePath: join(root, 'other.html'),
      hash: '開始',
    },
  );
});

test('checkBuiltLinks passes when all internal and anchor links exist', async () => {
  const site = createFixtureSite({
    'index.html':
      '<h1 id="top">Title</h1><a href="/gpt-ai-assistant-docs/about.html#team">About</a><a href="#top">Top</a>',
    'about.html': '<h2 id="team">Team</h2><a href="/gpt-ai-assistant-docs/#top">Home</a>',
  });

  const result = await checkBuiltLinks({ siteRoot: site });
  assert.equal(result.pageCount, 2);
  assert.equal(result.checked, 3);
});

test('checkBuiltLinks rejects when a target anchor does not exist', async () => {
  const site = createFixtureSite({
    'index.html':
      '<h1 id="top">Title</h1><a href="/gpt-ai-assistant-docs/about.html#missing">Missing</a>',
    'about.html': '<h2 id="team">Team</h2>',
  });

  await assert.rejects(
    () => checkBuiltLinks({ siteRoot: site }),
    /anchor "#missing" not found in about\.html/,
  );
});

test('CLI check:links exits non-zero when HTML contains a non-existent anchor', () => {
  const site = createFixtureSite({
    'index.html': '<a href="#broken-anchor">Broken</a>',
  });

  const result = spawnSync(process.execPath, [scriptPath, site], {
    encoding: 'utf8',
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /anchor "#broken-anchor" not found/);
});

test('CLI check:links honors DOCS_DIST env and exits non-zero on non-existent anchor', () => {
  const site = createFixtureSite({
    'index.html': '<a href="#broken-anchor">Broken</a>',
  });

  const result = spawnSync(process.execPath, [scriptPath], {
    encoding: 'utf8',
    env: { ...process.env, DOCS_DIST: site },
  });

  assert.notEqual(result.status, 0);
  assert.match(result.stderr, /anchor "#broken-anchor" not found/);
});

test('CLI check:links exits 0 when all internal anchors exist', () => {
  const site = createFixtureSite({
    'index.html': '<h1 id="welcome">Welcome</h1><a href="#welcome">Self</a>',
  });

  const result = spawnSync(process.execPath, [scriptPath, site], {
    encoding: 'utf8',
  });

  assert.equal(result.status, 0);
  assert.match(result.stdout, /Checked 1 internal links across 1 pages/);
});
