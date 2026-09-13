import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';

const siteRoot = path.resolve('docs/.vuepress/dist');
const siteBase = '/gpt-ai-assistant-docs/';

async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listHtmlFiles(fullPath) : [fullPath];
  }));

  return nested.flat().filter((file) => file.endsWith('.html'));
}

function pageUrl(file) {
  const relative = path.relative(siteRoot, file).split(path.sep).join('/');
  return new URL(relative, `https://docs.invalid${siteBase}`);
}

function localTarget(href, sourceUrl) {
  if (href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) {
    return null;
  }

  const targetUrl = new URL(href, sourceUrl);
  if (targetUrl.origin !== sourceUrl.origin) return null;
  if (!targetUrl.pathname.startsWith(siteBase)) {
    throw new Error(`internal link escapes site base: ${href}`);
  }

  const relative = decodeURIComponent(targetUrl.pathname.slice(siteBase.length));
  return relative === '' || relative.endsWith('/')
    ? path.join(siteRoot, relative, 'index.html')
    : path.join(siteRoot, relative);
}

const htmlFiles = await listHtmlFiles(siteRoot);
const failures = [];
let checked = 0;

for (const file of htmlFiles) {
  const html = await readFile(file, 'utf8');
  const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);

  for (const href of hrefs) {
    try {
      const target = localTarget(href, pageUrl(file));
      if (!target) continue;
      checked += 1;
      await access(target);
    } catch (error) {
      failures.push(`${path.relative(siteRoot, file)} -> ${href}: ${error.message}`);
    }
  }
}

if (failures.length > 0) {
  throw new Error(`Broken internal links:\n${failures.join('\n')}`);
}

console.log(`Checked ${checked} internal links across ${htmlFiles.length} pages.`);
