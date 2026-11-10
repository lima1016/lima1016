import { writeFileSync } from 'node:fs';
import Parser from 'rss-parser';

/* =========================================================
 *  Terminal-style GitHub profile
 *  - 매시간 GitHub Actions 가 실행 → terminal.svg + README.md 재생성
 *  - Uptime 은 CAREER_START 기준으로 자동 계산
 *  - 블로그 글은 tistory RSS 에서 가져옴
 * ========================================================= */

// 실제 시작은 2020.03 이지만 공백기를 제외한 "실경력" 기준 시작점.
// (2026.11 기준 5년 11개월) — 이후로는 매달 자동으로 1개월씩 증가
const CAREER_START = { year: 2020, month: 12 };
const BLOG_URL = 'https://lima1016.tistory.com';
const RSS_URL = `${BLOG_URL}/rss`;
const POST_COUNT = 5;

// GitHub dark palette
const C = {
  bg: '#0d1117', bar: '#161b22', line: '#21262d', border: '#30363d',
  fg: '#e6edf3', muted: '#7d8590',
  red: '#ff7b72', orange: '#ffa657', yellow: '#e3b341', green: '#3fb950',
  blue: '#58a6ff', purple: '#d2a8ff', cyan: '#56d4dd',
};

const STACK = [
  { key: 'language',  color: C.red,    items: ['Java', 'Python'] },
  { key: 'framework', color: C.green,  items: ['Spring Boot', 'Spring Cloud', 'MyBatis'] },
  { key: 'messaging', color: C.yellow, items: ['Kafka', 'RSocket'] },
  { key: 'database',  color: C.blue,   items: ['PostgreSQL', 'Redis', 'MongoDB', 'OpenSearch'] },
  { key: 'devops',    color: C.purple, items: ['Docker', 'GitLab CI/CD', 'Jenkins', 'Nginx'] },
  { key: 'tools',     color: C.orange, items: ['IntelliJ', 'Postman', 'Jira'] },
];

const CAREER = [
  { hash: 'a3f9c21', head: true, role: 'Backend Engineer',  at: 'GIT' },
  { hash: '7b2e4d0',             role: 'EDR Backend',       at: 'AhnLab' },
  { hash: '1c8a5f3',             role: 'Backend Developer', at: 'Gaeasoft' },
];

const PROJECTS = [
  { name: 'cosmos',      status: 'Up',       desc: 'NASA data platform · MSA' },
  { name: 'bull-talk',   status: 'Up',       desc: 'Real-time stock chat' },
  { name: 'eat-burn',    status: 'Up',       desc: 'Food vision + LLM nutrition' },
  { name: 'study_alone', status: 'Learning', desc: 'Always studying' },
];

const LOGO = [
  ' _     ___ __  __    _    ',
  '| |   |_ _|  \\/  |  / \\   ',
  '| |    | || |\\/| | / _ \\  ',
  '| |___ | || |  | |/ ___ \\ ',
  '|_____|___|_|  |_/_/   \\_\\',
];

/* ---------- helpers ---------- */

const esc = (s) => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;').replace(/'/g, '&apos;');

const truncate = (s, n) => ([...s].length > n ? [...s].slice(0, n - 1).join('') + '…' : s);

function uptime(now = new Date()) {
  const kst = new Date(now.getTime() + 9 * 3600 * 1000);
  let months = (kst.getUTCFullYear() - CAREER_START.year) * 12 + (kst.getUTCMonth() + 1 - CAREER_START.month);
  const y = Math.floor(months / 12), m = months % 12;
  const plural = (n, w) => `${n} ${w}${n === 1 ? '' : 's'}`;
  return m ? `${plural(y, 'year')}, ${plural(m, 'month')}` : plural(y, 'year');
}

function fmtDate(d) {
  const kst = new Date(new Date(d).getTime() + 9 * 3600 * 1000);
  const mm = String(kst.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(kst.getUTCDate()).padStart(2, '0');
  return `${mm}.${dd}`;
}

/* ---------- SVG builder ---------- */

const W = 860, PADX = 32, LH = 24, CH = 8.4; // CH: monospace 문자 폭(14px 기준) 추정
const FONT = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', 'D2Coding', monospace`;

// 애니메이션 타이밍 (초)
const TYPE_SPEED = 0.055;  // 명령어 한 글자
const AFTER_CMD = 0.35;    // 엔터 후 출력까지
const LINE_GAP = 0.07;     // 출력 줄 사이
const AFTER_BLOCK = 0.45;  // 섹션 사이

function buildSvg(posts) {
  const out = [];
  let y = 0;
  let T = 0.4; // 현재 시점
  let clipId = 0;

  // 시점 at 에 나타나는 요소
  const show = (el, at = T) =>
    out.push(`<g opacity="0">${el}<set attributeName="opacity" to="1" begin="${at.toFixed(2)}s" fill="freeze"/></g>`);

  // segs = [[text, color, {x, bold}], ...]
  const textEl = (segs, opts = {}) => {
    const x0 = opts.x ?? PADX;
    const size = opts.size ?? 14;
    const parts = segs.map(([t, color, o = {}]) => {
      const xAttr = o.x != null ? ` x="${o.x}"` : '';
      const w = o.bold ? ' font-weight="600"' : '';
      return `<tspan${xAttr} fill="${color}"${w}>${esc(t)}</tspan>`;
    }).join('');
    return `<text x="${x0}" y="${y}" font-size="${size}" xml:space="preserve">${parts}</text>`;
  };
  const line = (segs, opts) => { show(textEl(segs, opts)); T += LINE_GAP; };

  // 프롬프트 + 한 글자씩 타이핑되는 명령어
  const prompt = (cmd) => {
    show(textEl([['➜ ', C.green], ['~ ', C.blue]]));
    const x = PADX + 4 * CH, id = `c${clipId++}`;
    const n = [...cmd].length, dur = n * TYPE_SPEED;
    const values = Array.from({ length: n + 1 }, (_, i) => (i === n ? W : (i * CH * 1.04).toFixed(1))).join(';');
    out.push(`<clipPath id="${id}"><rect x="${x}" y="${y - 16}" height="22" width="0">` +
      `<animate attributeName="width" values="${values}" calcMode="discrete" begin="${T.toFixed(2)}s" dur="${dur.toFixed(2)}s" fill="freeze"/></rect></clipPath>`);
    out.push(`<text x="${x}" y="${y}" font-size="14" fill="${C.fg}" clip-path="url(#${id})" xml:space="preserve">${esc(cmd)}</text>`);
    // 타이핑 중 커서
    out.push(`<rect y="${y - 13}" width="${CH}" height="17" fill="${C.fg}" opacity="0">` +
      `<set attributeName="opacity" to="1" begin="${T.toFixed(2)}s"/>` +
      `<animate attributeName="x" values="${Array.from({ length: n + 1 }, (_, i) => (x + i * CH * 1.04).toFixed(1)).join(';')}" calcMode="discrete" begin="${T.toFixed(2)}s" dur="${(dur + TYPE_SPEED).toFixed(2)}s" fill="freeze"/>` +
      `<set attributeName="opacity" to="0" begin="${(T + dur + AFTER_CMD * 0.6).toFixed(2)}s" fill="freeze"/></rect>`);
    T += dur + AFTER_CMD;
  };
  const comment = (t) => show(textEl([[`# ${t}`, C.muted]], { size: 12 }));
  const divider = () => {
    y += 16;
    T += AFTER_BLOCK;
    show(`<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="${C.line}"/>`);
    y += 30;
  };

  // ---- title bar
  y = 38 + 34;

  // ---- neofetch
  prompt('neofetch');
  y += 14;
  const logoTop = y + 34; // 오른쪽 정보 블록과 세로 중앙 정렬
  const infoX = PADX + 290, labelW = 72;
  const info = [
    ['Role',   'Backend Engineer', C.fg],
    ['Uptime', uptime(),           C.fg],
    ['Focus',  'Event-driven · MSA', C.fg],
    ['Study',  'Georgia Tech · AI', C.fg],
    ['Blog',   BLOG_URL.replace('https://', ''), C.blue],
  ];
  // 로고와 정보가 한 줄씩 나란히 출력
  LOGO.forEach((l, i) => {
    show(`<text x="${PADX}" y="${logoTop + i * 19}" font-size="15" font-weight="600" fill="${C.purple}" xml:space="preserve">${esc(l)}</text>`, T + i * LINE_GAP);
  });
  let iy = y - 4;
  show(`<text x="${infoX}" y="${iy}" font-size="14" font-weight="600"><tspan fill="${C.green}">lima</tspan><tspan fill="${C.muted}">@</tspan><tspan fill="${C.green}">github</tspan></text>`);
  T += LINE_GAP;
  iy += 18;
  show(`<text x="${infoX}" y="${iy}" font-size="14" fill="${C.muted}">────────────────────────</text>`);
  info.forEach(([k, v, col]) => {
    iy += LH;
    T += LINE_GAP;
    show(`<text x="${infoX}" y="${iy}" font-size="14"><tspan fill="${C.yellow}">${esc(k)}</tspan><tspan x="${infoX + labelW}" fill="${col}">${esc(v)}</tspan></text>`);
  });
  y = iy + 22;
  T += LINE_GAP;
  const swatch = [C.red, C.yellow, C.green, C.blue, C.purple, C.muted];
  swatch.forEach((c, i) => show(`<rect x="${infoX + i * 34}" y="${y - 12}" width="34" height="14" fill="${c}"/>`, T + i * 0.04));
  y += 6;
  divider();

  // ---- stack
  comment('기술 스택');
  y += LH; prompt('cat stack.yml');
  const valX = PADX + 12 * CH;
  STACK.forEach(({ key, color, items }) => {
    y += LH;
    const segs = [[`${key}:`, color, { bold: true }]];
    items.forEach((it, i) => {
      segs.push([it, color, i === 0 ? { x: valX } : {}]);
      if (i < items.length - 1) segs.push([', ', C.muted]);
    });
    line(segs);
  });
  divider();

  // ---- career
  comment('경력');
  y += LH; prompt('git log --oneline career');
  CAREER.forEach(({ hash, head, role, at }) => {
    y += LH;
    const segs = [[hash, C.yellow]];
    if (head) segs.push(['(HEAD)', C.blue, { x: PADX + 9 * CH }]);
    segs.push([role, C.fg, { x: PADX + 17 * CH }]);
    segs.push(['@ ', C.muted, { x: PADX + 37 * CH }]);
    segs.push([at, C.fg]);
    line(segs);
  });
  divider();

  // ---- projects
  comment('프로젝트');
  y += LH; prompt('docker ps');
  const colS = PADX + 15 * CH, colD = PADX + 28 * CH;
  y += LH;
  line([['NAME', C.muted], ['STATUS', C.muted, { x: colS }], ['DESCRIPTION', C.muted, { x: colD }]]);
  PROJECTS.forEach(({ name, status, desc }) => {
    y += LH;
    const sc = status === 'Up' ? C.green : C.yellow;
    line([[name, C.blue], [`● ${status}`, sc, { x: colS }], [desc, C.fg, { x: colD }]]);
  });
  divider();

  // ---- blog
  comment('최근 블로그 글 (자동 갱신)');
  y += LH; prompt(`tail -n ${posts.length} blog.log`);
  posts.forEach(({ date, title }) => {
    y += LH;
    line([[date, C.muted], [truncate(title, 52), C.fg, { x: PADX + 8 * CH }]]);
  });
  divider();

  // ---- 마지막 프롬프트 + 깜빡이는 커서
  show(textEl([['➜ ', C.green], ['~ ', C.blue]]));
  out.push(`<rect x="${PADX + 4 * CH}" y="${y - 13}" width="${CH}" height="17" fill="${C.fg}" opacity="0">` +
    `<animate attributeName="opacity" values="1;1;0;0" keyTimes="0;0.5;0.5;1" dur="1.1s" begin="${T.toFixed(2)}s" repeatCount="indefinite"/></rect>`);
  y += 26;

  const H = Math.ceil(y);
  const dots = [['#ff5f56', 22], ['#ffbd2e', 42], ['#27c93f', 62]]
    .map(([c, x]) => `<circle cx="${x}" cy="19" r="6" fill="${c}"/>`).join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" role="img" aria-label="lima@github terminal profile">
<style>text{font-family:${FONT}}</style>
<defs><clipPath id="r"><rect width="${W}" height="${H}" rx="12"/></clipPath></defs>
<g clip-path="url(#r)">
<rect width="${W}" height="${H}" fill="${C.bg}"/>
<rect width="${W}" height="38" fill="${C.bar}"/>
<line x1="0" x2="${W}" y1="38" y2="38" stroke="${C.border}"/>
${dots}
<text x="${W / 2}" y="24" font-size="12" fill="${C.muted}" text-anchor="middle">lima@github: ~</text>
${out.join('\n')}
</g>
<rect x="0.5" y="0.5" width="${W - 1}" height="${H - 1}" rx="12" fill="none" stroke="${C.border}"/>
</svg>
`;
}

/* ---------- README ---------- */

const README = `<div align="center">

<a href="${BLOG_URL}">
  <img src="./terminal.svg" alt="lima@github terminal profile" width="100%"/>
</a>

<br/><br/>

<a href="${BLOG_URL}"><img src="https://img.shields.io/badge/Blog-tistory-0d1117?style=flat-square&logo=tistory&logoColor=e3b341&labelColor=161b22"/></a>
<a href="https://github.com/lima1016/study_alone"><img src="https://img.shields.io/badge/study__alone-repo-0d1117?style=flat-square&logo=github&labelColor=161b22"/></a>
<a href="https://github.com/f-lab-edu/bull-talk"><img src="https://img.shields.io/badge/bull--talk-repo-0d1117?style=flat-square&logo=github&labelColor=161b22"/></a>
<a href="https://github.com/lima1016/Eat-Burn"><img src="https://img.shields.io/badge/Eat--Burn-repo-0d1117?style=flat-square&logo=github&labelColor=161b22"/></a>

</div>
`;

/* ---------- main ---------- */

async function fetchPosts() {
  const parser = new Parser({ headers: { Accept: 'application/rss+xml, application/xml, text/xml; q=0.1' } });
  const feed = await parser.parseURL(RSS_URL);
  return feed.items.slice(0, POST_COUNT).map((it) => ({ date: fmtDate(it.pubDate || it.isoDate), title: it.title }));
}

(async () => {
  let posts;
  try {
    posts = await fetchPosts();
  } catch (e) {
    console.error('RSS fetch failed:', e.message);
    if (!process.env.PREVIEW) process.exit(1); // Actions 에서는 실패 시 기존 파일 유지
    posts = JSON.parse(process.env.PREVIEW);
  }
  writeFileSync('terminal.svg', buildSvg(posts), 'utf8');
  writeFileSync('README.md', README, 'utf8');
  console.log('업데이트 완료');
})();
