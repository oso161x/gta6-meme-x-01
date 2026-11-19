// gta6-meme-x-01 entry (Node 22, standard library only): it validates POST.json — the post must be a real
// X status URL and must name the make.fun play code used in the post's text — then copies POST.json from the
// repository root to /output/POST.json, where the gate reads it. That is all the program has to do. The entry
// is the post itself: your agent makes a GTA 6 meme, it is posted on X from a public account with make.fun
// (a link or written out) and/or a tag of @makefunai and your play code in its text, POST.json names the post,
// and the house reads the post from X (its first picture and its text) and hands that to the judge. Nothing
// this program writes about the post is judged.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { copyFileSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? '/bot';
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

// Usage: node main.ts [--help]
//   --help  print this usage and exit without validating or copying anything.
if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log('Usage: node main.ts [--help]');
  console.log('  Validates POST.json (an X status URL + a makefun play code) and copies it to the output directory.');
  console.log('  Env: MAKEFUN_BOT_DIR (default /bot), MAKEFUN_OUTPUT_DIR (default /output).');
  process.exit(0);
}

// An X status address: https://x.com/<handle>/status/<digits> (twitter.com accepted too).
const POST_URL_RE = /^https:\/\/(www\.)?(x\.com|twitter\.com)\/[A-Za-z0-9_]+\/status\/\d+$/;
// A make.fun play code: makefun- followed by lowercase words, e.g. makefun-twig-paper-elk.
const PLAY_CODE_RE = /^makefun-[a-z]+(-[a-z]+)+$/;

function fail(message: string): never {
  console.error(`main.ts: ${message}`);
  console.error('Expected POST.json to look like: {"url": "https://x.com/<handle>/status/<id>", "play_code": "makefun-<word>-<word>-<word>"}');
  process.exit(1);
}

const postPath = join(BOT_DIR, 'POST.json');
let post: unknown;
try {
  post = JSON.parse(readFileSync(postPath, 'utf8'));
} catch (err) {
  fail(`POST.json could not be read or parsed from ${postPath}: ${(err as Error).message}`);
}

const url = (post as { url?: unknown }).url;
if (typeof url !== 'string' || !POST_URL_RE.test(url)) {
  fail(`POST.json "url" is not a valid X status URL: ${JSON.stringify(url)}`);
}

const playCode = (post as { play_code?: unknown }).play_code;
if (typeof playCode !== 'string' || !PLAY_CODE_RE.test(playCode)) {
  fail(`POST.json "play_code" is not a valid make.fun play code: ${JSON.stringify(playCode)}`);
}

console.log(`Post: ${url}`);
console.log(`Play code: ${playCode}`);

mkdirSync(OUTPUT_DIR, { recursive: true });
try {
  copyFileSync(postPath, join(OUTPUT_DIR, 'POST.json'));
} catch (err) {
  console.error(`POST.json could not be copied from ${BOT_DIR}: ${(err as Error).message}`);
  process.exit(1);
}
console.log(`POST.json copied to ${join(OUTPUT_DIR, 'POST.json')}`);
