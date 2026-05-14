/**
 * One-shot script: split long kinh markdown into per-chapter files.
 * Reads from .backup-content/*, writes to content/<slug>/NN-<chapter-slug>.md.
 * Run once: bun run scripts/split-chapters.ts
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";

type Source = {
  srcFile: string;
  outDir: string;
  title: string;
  image: string;
  description?: string;
  author?: string;
};

const sources: Source[] = [
  {
    srcFile: ".backup-content/kinh-dieu-phap-lien-hoa.md",
    outDir: "content/kinh-dieu-phap-lien-hoa",
    title: "Kinh Diệu Pháp Liên Hoa",
    image: "/images/kinh-dieu-phap-lien-hoa.jpg",
    description: "Diệu Pháp Liên Hoa Kinh — 28 phẩm",
  },
  {
    srcFile: ".backup-content/kinh-dia-tang/index.md",
    outDir: "content/kinh-dia-tang",
    title: "Kinh Địa Tạng",
    image: "/images/kinh-dia-tang.jpg",
    author: "Hòa thượng Thích Trí Tịnh",
  },
];

function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/gi, "d")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function pad2(n: number): string {
  return n.toString().padStart(2, "0");
}

function splitOne(src: Source) {
  const raw = readFileSync(src.srcFile, "utf8");
  // Strip frontmatter
  const body = raw.replace(/^---[\s\S]*?---\n/, "");
  const lines = body.split("\n");

  // Find h2 headings ("## ")
  const headings: { lineIdx: number; raw: string; title: string }[] = [];
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith("## ")) {
      const title = line.replace(/^##\s+/, "").trim();
      headings.push({ lineIdx: i, raw: line, title });
    }
  }

  if (!existsSync(src.outDir)) mkdirSync(src.outDir, { recursive: true });

  // Index page (kinh root)
  const indexFrontmatter = [
    "---",
    `title: ${JSON.stringify(src.title)}`,
    src.description ? `description: ${JSON.stringify(src.description)}` : "",
    `image: ${JSON.stringify(src.image)}`,
    src.author ? `author: ${JSON.stringify(src.author)}` : "",
    "kinh: true",
    "---",
    "",
    `# ${src.title}`,
    "",
    src.author ? `_${src.author}_` : "",
    "",
    "## Mục lục",
    "",
  ]
    .filter(Boolean)
    .join("\n");

  const tocLines: string[] = [];

  // Split each chapter
  for (let h = 0; h < headings.length; h++) {
    const cur = headings[h];
    const next = headings[h + 1];
    const startLine = cur.lineIdx + 1;
    const endLine = next ? next.lineIdx : lines.length;
    const chapterBody = lines.slice(startLine, endLine).join("\n").trim();

    const chapterNum = h + 1;
    const chapterSlug = slugify(cur.title);
    const fileName = `${pad2(chapterNum)}-${chapterSlug}.md`;
    const filePath = join(src.outDir, fileName);

    const prev = h > 0 ? `${pad2(h)}-${slugify(headings[h - 1].title)}` : "";
    const nextSlug = next ? `${pad2(h + 2)}-${slugify(next.title)}` : "";

    const chapterContent = [
      "---",
      `title: ${JSON.stringify(cur.title)}`,
      `chapter: ${chapterNum}`,
      `kinh: ${JSON.stringify(src.title)}`,
      `image: ${JSON.stringify(src.image)}`,
      prev ? `prev: ${JSON.stringify(`./${prev}`)}` : "prev: false",
      nextSlug ? `next: ${JSON.stringify(`./${nextSlug}`)}` : "next: false",
      "---",
      "",
      `# ${cur.title}`,
      "",
      chapterBody,
      "",
    ]
      .filter(Boolean)
      .join("\n");

    writeFileSync(filePath, chapterContent, "utf8");
    tocLines.push(`${chapterNum}. [${cur.title}](./${pad2(chapterNum)}-${chapterSlug})`);
  }

  // Write index.md
  writeFileSync(
    join(src.outDir, "index.md"),
    indexFrontmatter + tocLines.join("\n") + "\n",
    "utf8",
  );

  console.log(`✓ ${src.title}: ${headings.length} chapters → ${src.outDir}`);
}

for (const s of sources) splitOne(s);
