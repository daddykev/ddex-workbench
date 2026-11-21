#!/usr/bin/env node
// functions/scripts/downloadSchemas.js
//
// Downloads the public DDEX ERN XSD schemas into the layout that
// validators/xsdValidator.js loads:
//
//   schemas/ern/<version>/release-notification.xsd
//   schemas/ern/<version>/<avs filename>
//
// The AVS filenames below must match `avsFilenames` in xsdValidator.js.
//
// Usage:
//   node scripts/downloadSchemas.js               # write into functions/schemas/ern
//   node scripts/downloadSchemas.js --out <dir>   # write into <dir>/<version>/...
//   node scripts/downloadSchemas.js --dry-run     # list what would be fetched, write nothing
//
// ddex.net redirects https:// requests to plain http://service.ddex.net, so the
// files are fetched directly from https://service.ddex.net instead.
//
// Each version is handled on its own: a version is written only if all of its
// files download, so a failed fetch never leaves a half-updated directory and
// keeps whatever is already on disk. As of 2026-11 DDEX no longer serves the
// ERN 3.8.2 main schema (service.ddex.net/xml/ern/382/ returns 404), so 3.8.2
// will fail here; keep the existing copy in schemas/ern/3.8.2/. The ERN 3.8.3
// main schema (service.ddex.net/xml/ern/383/) also returns 404, so keep a local
// backup of schemas/ern/3.8.3/ as well.

const fs = require('fs').promises;
const path = require('path');

const BASE_URL = 'https://service.ddex.net/xml';

const SCHEMAS = {
  '3.8.2': {
    main: `${BASE_URL}/ern/382/release-notification.xsd`,
    avs: `${BASE_URL}/avs/avs_20161006.xsd`,
    avsFilename: 'avs_20161006.xsd'
  },
  // The 3.8.3 main schema returns 404 from DDEX; keep a local backup.
  '3.8.3': {
    main: `${BASE_URL}/ern/383/release-notification.xsd`,
    avs: `${BASE_URL}/avs/avs_20200108.xsd`,
    avsFilename: 'avs_20200108.xsd'
  },
  '4.2': {
    main: `${BASE_URL}/ern/42/release-notification.xsd`,
    avs: `${BASE_URL}/avs/avs20200518.xsd`,
    avsFilename: 'avs20200518.xsd'
  },
  '4.3': {
    main: `${BASE_URL}/ern/43/release-notification.xsd`,
    avs: `${BASE_URL}/allowed-value-sets/allowed-value-sets.xsd`,
    avsFilename: 'allowed-value-sets.xsd'
  }
};

const DEFAULT_OUT = path.join(__dirname, '..', 'schemas', 'ern');

function parseArgs(argv) {
  const opts = { dryRun: false, out: DEFAULT_OUT };
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg === '--dry-run') {
      opts.dryRun = true;
    } else if (arg === '--out') {
      const value = argv[++i];
      if (!value) throw new Error('--out requires a directory');
      opts.out = path.resolve(value);
    } else if (arg.startsWith('--out=')) {
      opts.out = path.resolve(arg.slice('--out='.length));
    } else if (arg === '--help' || arg === '-h') {
      opts.help = true;
    } else {
      throw new Error(`Unknown argument: ${arg}`);
    }
  }
  return opts;
}

async function fetchXsd(url) {
  const response = await fetch(url, { redirect: 'follow' });
  if (!response.ok) {
    throw new Error(`GET ${url} failed: HTTP ${response.status}`);
  }
  const text = await response.text();
  if (!/<xs:schema[\s>]/.test(text)) {
    throw new Error(`GET ${url} did not return an XSD document`);
  }
  return text;
}

async function main() {
  const opts = parseArgs(process.argv.slice(2));
  if (opts.help) {
    console.log('Usage: node scripts/downloadSchemas.js [--dry-run] [--out <dir>]');
    return;
  }

  console.log(`${opts.dryRun ? '[dry run] ' : ''}Output directory: ${opts.out}`);
  const failures = [];

  for (const [version, schema] of Object.entries(SCHEMAS)) {
    const dir = path.join(opts.out, version);
    const targets = [
      { url: schema.main, file: path.join(dir, 'release-notification.xsd') },
      { url: schema.avs, file: path.join(dir, schema.avsFilename) }
    ];

    if (opts.dryRun) {
      for (const t of targets) console.log(`  ${t.url}\n    -> ${t.file}`);
      continue;
    }

    console.log(`Downloading ERN ${version} schemas...`);
    let contents;
    try {
      contents = await Promise.all(targets.map(t => fetchXsd(t.url)));
    } catch (err) {
      console.error(`  ✗ ERN ${version}: ${err.message} (nothing written for ${version})`);
      failures.push(version);
      continue;
    }
    await fs.mkdir(dir, { recursive: true });
    await Promise.all(targets.map((t, i) => fs.writeFile(t.file, contents[i])));
    for (let i = 0; i < targets.length; i++) {
      console.log(`  ✓ ${targets[i].file} (${contents[i].length} chars)`);
    }
  }

  if (failures.length) {
    console.error(`\nFailed versions: ${failures.join(', ')}. Existing files for those versions were left untouched.`);
    process.exitCode = 1;
  }
}

main().catch(err => {
  console.error(`Schema download failed: ${err.message}`);
  process.exit(1);
});
