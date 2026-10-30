import { access, readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

export const DEFAULT_SITE_ROOT = path.resolve('docs/.vuepress/dist');
export const DEFAULT_SITE_BASE = '/gpt-ai-assistant-docs/';

export async function listHtmlFiles(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => {
    const fullPath = path.join(directory, entry.name);
    return entry.isDirectory() ? listHtmlFiles(fullPath) : [fullPath];
  }));

  return nested.flat().filter((file) => file.endsWith('.html'));
}

export function pageUrl(file, siteRoot = DEFAULT_SITE_ROOT, siteBase = DEFAULT_SITE_BASE) {
  const relative = path.relative(siteRoot, file).split(path.sep).join('/');
  return new URL(relative, `https://docs.invalid${siteBase}`);
}

export function extractAnchors(html) {
  const anchors = new Set();
  for (const match of html.matchAll(/\bid="([^"]+)"/g)) {
    anchors.add(match[1]);
  }
  for (const match of html.matchAll(/<a\b[^>]*\bname="([^"]+)"/gi)) {
    anchors.add(match[1]);
  }
  return anchors;
}

export function localTarget(href, sourceUrl, siteRoot = DEFAULT_SITE_ROOT, siteBase = DEFAULT_SITE_BASE) {
  if (href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
    return null;
  }

  const targetUrl = new URL(href, sourceUrl);
  if (targetUrl.origin !== sourceUrl.origin) return null;
  if (!targetUrl.pathname.startsWith(siteBase)) {
    throw new Error(`internal link escapes site base: ${href}`);
  }

  const hash = targetUrl.hash ? decodeURIComponent(targetUrl.hash.slice(1)) : '';
  const relative = decodeURIComponent(targetUrl.pathname.slice(siteBase.length));
  const filePath = relative === '' || relative.endsWith('/')
    ? path.join(siteRoot, relative, 'index.html')
    : path.join(siteRoot, relative);

  return { filePath, hash };
}

export async function checkBuiltLinks({ siteRoot = DEFAULT_SITE_ROOT, siteBase = DEFAULT_SITE_BASE } = {}) {
  const htmlFiles = await listHtmlFiles(siteRoot);
  const anchorCache = new Map();
  const failures = [];
  let checked = 0;

  async function getAnchors(filePath) {
    if (!anchorCache.has(filePath)) {
      const html = await readFile(filePath, 'utf8');
      anchorCache.set(filePath, extractAnchors(html));
    }
    return anchorCache.get(filePath);
  }

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    anchorCache.set(file, extractAnchors(html));
    const hrefs = [...html.matchAll(/\bhref="([^"]+)"/g)].map((match) => match[1]);

    for (const href of hrefs) {
      try {
        const target = localTarget(href, pageUrl(file, siteRoot, siteBase), siteRoot, siteBase);
        if (!target) continue;
        checked += 1;
        await access(target.filePath);

        if (target.hash) {
          const anchors = await getAnchors(target.filePath);
          if (!anchors.has(target.hash) && !anchors.has(encodeURIComponent(target.hash))) {
            failures.push(
              `${path.relative(siteRoot, file)} -> ${href}: anchor "#${target.hash}" not found in ${path.relative(siteRoot, target.filePath)}`,
            );
          }
        }
      } catch (error) {
        failures.push(`${path.relative(siteRoot, file)} -> ${href}: ${error.message}`);
      }
    }
  }

  if (failures.length > 0) {
    throw new Error(`Broken internal links:\n${failures.join('\n')}`);
  }

  return { checked, pageCount: htmlFiles.length };
}

const invokedDirectly = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (invokedDirectly) {
  const customRoot = process.env.DOCS_DIST ?? process.argv[2];
  const { checked, pageCount } = await checkBuiltLinks(
    customRoot ? { siteRoot: path.resolve(customRoot) } : {},
  );
  console.log(`Checked ${checked} internal links across ${pageCount} pages.`);
}
