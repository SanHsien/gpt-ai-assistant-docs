import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { test } from 'node:test';

const require = createRequire(import.meta.url);
const matter = require('gray-matter');
const yaml = require('js-yaml');
const cli = require.resolve('js-yaml/bin/js-yaml.js');
const cliTimeoutMs = 10_000;

function runCli(args, input = '') {
  const result = spawnSync(process.execPath, [cli, ...args], {
    encoding: 'utf8',
    input,
    timeout: cliTimeoutMs,
  });

  assert.equal(result.error, undefined, `js-yaml CLI timed out or failed: ${args.join(' ')}`);
  return result;
}

test('VuePress frontmatter path still parses through gray-matter and js-yaml 3', () => {
  const document = matter('---\ntitle: Compatibility\ncount: 2\n---\nBody');

  assert.deepEqual(document.data, { title: 'Compatibility', count: 2 });
  assert.equal(document.content.trim(), 'Body');
  assert.deepEqual(yaml.load('title: Compatibility\ncount: 2'), {
    title: 'Compatibility',
    count: 2,
  });
});

test('js-yaml CLI keeps v1 argparse flags and error status', () => {
  const validYaml = 'name: Compatibility\nvalue: 42\n';
  const help = runCli(['--help']);
  const json = runCli(['-j'], validYaml);
  const compact = runCli(['-c'], validYaml);
  const malformed = runCli(['-c'], 'name: [broken\n');

  assert.equal(help.status, 0);
  assert.match(help.stdout, /-c, --compact/);

  assert.equal(json.status, 0);
  assert.deepEqual(JSON.parse(json.stdout), { name: 'Compatibility', value: 42 });

  assert.equal(compact.status, 0);
  assert.deepEqual(JSON.parse(compact.stdout), { name: 'Compatibility', value: 42 });

  assert.equal(malformed.status, 1);
  assert.match(malformed.stderr, /YAMLException/);
});
