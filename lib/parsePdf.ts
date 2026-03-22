import * as pdfjsLib from 'pdfjs-dist';
import type { TextItem } from 'pdfjs-dist/types/src/display/api';
import { PaperData, PaperSection } from '@/context/PaperContext';
/* ── Initialize the PDF.js worker ── */
if (typeof window !== 'undefined') {
  pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
}
/* ──────────────────────────────────────────────
   Known academic section heading patterns.
   Used to detect headings in the extracted text.
   ────────────────────────────────────────────── */
const KNOWN_HEADINGS = [
  'abstract',
  'introduction',
  'background',
  'literature review',
  'related work',
  'theoretical framework',
  'methodology',
  'methods',
  'method',
  'materials and methods',
  'experimental setup',
  'experiment',
  'experiments',
  'data collection',
  'data analysis',
  'results',
  'findings',
  'analysis',
  'discussion',
  'discussion and analysis',
  'implications',
  'limitations',
  'future work',
  'future directions',
  'conclusion',
  'conclusions',
  'concluding remarks',
  'summary',
  'recommendations',
  'references',
  'bibliography',
  'appendix',
  'appendices',
  'acknowledgements',
  'acknowledgments',
  'declarations',
  'conflict of interest',
  'funding',
  'supplementary material',
  'supplementary materials',
];
/* ── Types for font-size based heading detection ── */
interface TextFragment {
  text: string;
  fontSize: number;
  fontName: string;
  y: number; // vertical position on page
  pageIndex: number;
}
/**
 * Extract all text fragments with font metadata from a PDF ArrayBuffer.
 */
async function extractTextFragments(
  arrayBuffer: ArrayBuffer
): Promise<TextFragment[]> {
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const fragments: TextFragment[] = [];
  for (let i = 0; i < pdf.numPages; i++) {
    const page = await pdf.getPage(i + 1);
    const textContent = await page.getTextContent();
    for (const item of textContent.items) {
      const textItem = item as TextItem;
      if (!textItem.str || textItem.str.trim() === '') continue;
      fragments.push({
        text: textItem.str,
        fontSize: Math.abs(textItem.transform[0]) || Math.abs(textItem.transform[3]) || 12,
        fontName: textItem.fontName || '',
        y: textItem.transform[5],
        pageIndex: i,
      });
    }
  }
  return fragments;
}
/**
 * Group text fragments into lines based on position.
 * Fragments on the same page at similar Y positions belong to the same line.
 */
function groupIntoLines(
  fragments: TextFragment[]
): { text: string; fontSize: number; fontName: string; pageIndex: number }[] {
  if (fragments.length === 0) return [];
  const lines: {
    text: string;
    fontSize: number;
    fontName: string;
    pageIndex: number;
    y: number;
  }[] = [];
  let currentLine = {
    text: fragments[0].text,
    fontSize: fragments[0].fontSize,
    fontName: fragments[0].fontName,
    pageIndex: fragments[0].pageIndex,
    y: fragments[0].y,
  };
  for (let i = 1; i < fragments.length; i++) {
    const frag = fragments[i];
    // Same line if same page and Y is within ~2 units
    if (
      frag.pageIndex === currentLine.pageIndex &&
      Math.abs(frag.y - currentLine.y) < 2
    ) {
      currentLine.text += frag.text;
    } else {
      lines.push({ ...currentLine });
      currentLine = {
        text: frag.text,
        fontSize: frag.fontSize,
        fontName: frag.fontName,
        pageIndex: frag.pageIndex,
        y: frag.y,
      };
    }
  }
  lines.push({ ...currentLine });
  return lines;
}
/**
 * Determine whether a line is likely a section heading.
 * Uses multiple heuristics:
 *  1. Matches a known heading pattern
 *  2. Has a larger font size than the body median
 *  3. Uses a bold font
 *  4. Is a short standalone line (< 80 chars)
 *  5. Starts with a numbered section like "1." or "1.1"
 */
function isHeadingLine(
  line: { text: string; fontSize: number; fontName: string },
  medianBodySize: number
): boolean {
  const trimmed = line.text.trim();
  if (trimmed.length === 0) return false;
  // Strip leading numbers like "1.", "1.1", "2.", "II.", roman numerals
  const stripped = trimmed
    .replace(/^[\d]+(\.\d+)*\.?\s+/u, '')       // "1.", "1.1.", "2.3 "
    .replace(/^[IVXLCDM]+\.?\s+/u, '')           // "IV. "
    .replace(/^[a-z]\)\s+/iu, '')                // "a) "
    .trim();
  const lowerStripped = stripped.toLowerCase();
  // 1. Known heading match
  const matchesKnown = KNOWN_HEADINGS.some(
    (h) => lowerStripped === h || lowerStripped.startsWith(h + ':')
  );
  // 2. Font size significantly larger than body text
  const isBigger = line.fontSize > medianBodySize * 1.15;
  // 3. Bold font (heuristic: font name contains "Bold", "Heavy", "Black")
  const isBold = /bold|heavy|black/i.test(line.fontName);
  // 4. Short line (headings are typically short)
  const isShort = trimmed.length < 80;
  // 5. Line is ALL CAPS (some papers use this for headings)
  const isAllCaps =
    trimmed.length > 3 &&
    trimmed === trimmed.toUpperCase() &&
    /[A-Z]/.test(trimmed);
  // Scoring: need at least 2 signals to consider it a heading
  let score = 0;
  if (matchesKnown) score += 2; // strong signal
  if (isBigger) score += 2;     // strong signal
  if (isBold) score += 1;
  if (isShort) score += 1;
  if (isAllCaps) score += 1;
  return score >= 2;
}
/**
 * Get the median font size from lines (used as "body text size" baseline).
 */
function getMedianFontSize(lines: { fontSize: number }[]): number {
  if (lines.length === 0) return 12;
  const sizes = lines.map((l) => l.fontSize).sort((a, b) => a - b);
  const mid = Math.floor(sizes.length / 2);
  return sizes.length % 2 !== 0
    ? sizes[mid]
    : (sizes[mid - 1] + sizes[mid]) / 2;
}
/**
 * Attempt to extract title and authors from the first page.
 * The title is typically the largest font text on page 0.
 * Authors follow the title in smaller (but still above-body) font.
 */
function extractTitleAndAuthors(
  lines: {
    text: string;
    fontSize: number;
    fontName: string;
    pageIndex: number;
  }[],
  medianBodySize: number
): { title: string; authors: string } {
  const firstPageLines = lines.filter((l) => l.pageIndex === 0);
  // Find the largest font size on the first page
  let maxSize = 0;
  for (const l of firstPageLines) {
    if (l.fontSize > maxSize) maxSize = l.fontSize;
  }
  // Title lines: largest font on page 0
  const titleThreshold = maxSize * 0.9;
  const titleLines = firstPageLines.filter(
    (l) => l.fontSize >= titleThreshold && l.text.trim().length > 0
  );
  const title = titleLines.map((l) => l.text.trim()).join(' ') || 'Untitled Paper';
  // Authors: lines after title that are larger than body but smaller than title
  const authorCandidates: string[] = [];
  let pastTitle = false;
  for (const l of firstPageLines) {
    if (l.fontSize >= titleThreshold) {
      pastTitle = true;
      continue;
    }
    if (pastTitle && l.fontSize > medianBodySize && l.text.trim().length > 0) {
      authorCandidates.push(l.text.trim());
    }
    // Stop collecting after we hit body-sized text or a heading
    if (pastTitle && l.fontSize <= medianBodySize && l.text.trim().length > 10) {
      break;
    }
  }
  const authors = authorCandidates.join(', ') || 'Unknown Author';
  return { title, authors };
}
/**
 * Slug-ify a heading text into an ID.
 */
function toSectionId(heading: string): string {
  return heading
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50)
    || 'section';
}
/**
 * Clean up a heading string: strip leading numbering, normalize casing.
 */
function cleanHeading(raw: string): string {
  let cleaned = raw.trim();
  // Remove leading numbering
  cleaned = cleaned
    .replace(/^[\d]+(\.\d+)*\.?\s+/u, '')
    .replace(/^[IVXLCDM]+\.?\s+/u, '')
    .replace(/^[a-z]\)\s+/iu, '')
    .trim();
  // If all caps, convert to title case
  if (cleaned.length > 3 && cleaned === cleaned.toUpperCase()) {
    cleaned = cleaned
      .toLowerCase()
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }
  return cleaned || raw.trim();
}
/* ══════════════════════════════════════════════════
   Public API
   ══════════════════════════════════════════════════ */
/**
 * Parse a PDF File into structured PaperData.
 * Runs entirely client-side using pdfjs-dist.
 */
export async function parsePdf(file: File): Promise<PaperData> {
  const arrayBuffer = await file.arrayBuffer();
  const fragments = await extractTextFragments(arrayBuffer);
  const lines = groupIntoLines(fragments);
  const medianSize = getMedianFontSize(lines);
  // Extract title and authors from the first page
  const { title, authors } = extractTitleAndAuthors(lines, medianSize);
  // Find heading lines and split into sections
  const sections: PaperSection[] = [];
  let currentHeading: string | null = null;
  let currentContent: string[] = [];
  let usedIds = new Set<string>();
  for (const line of lines) {
    const trimmedText = line.text.trim();
    if (!trimmedText) continue;
    if (isHeadingLine(line, medianSize)) {
      // Flush previous section
      if (currentHeading !== null) {
        const cleaned = cleanHeading(currentHeading);
        let id = toSectionId(cleaned);
        // Ensure unique id
        if (usedIds.has(id)) {
          let counter = 2;
          while (usedIds.has(`${id}-${counter}`)) counter++;
          id = `${id}-${counter}`;
        }
        usedIds.add(id);
        const sectionContent = currentContent.join('\n').trim();
        if (sectionContent.length > 0) {
          sections.push({
            id,
            heading: cleaned,
            content: sectionContent,
          });
        }
      }
      currentHeading = trimmedText;
      currentContent = [];
    } else {
      // Only collect content if we're inside a section
      if (currentHeading !== null) {
        currentContent.push(trimmedText);
      }
      // If we haven't found a heading yet, skip (preamble / title area)
    }
  }
  // Flush final section
  if (currentHeading !== null) {
    const cleaned = cleanHeading(currentHeading);
    let id = toSectionId(cleaned);
    if (usedIds.has(id)) {
      let counter = 2;
      while (usedIds.has(`${id}-${counter}`)) counter++;
      id = `${id}-${counter}`;
    }
    usedIds.add(id);
    const sectionContent = currentContent.join('\n').trim();
    if (sectionContent.length > 0) {
      sections.push({
        id,
        heading: cleaned,
        content: sectionContent,
      });
    }
  }
  // Filter out References / Bibliography (optional, usually not useful content)
  const filteredSections = sections.filter(
    (s) =>
      !/^(references|bibliography|appendix|appendices)$/i.test(s.heading)
  );
  // Fallback: if no sections detected, put everything in a single "Content" section
  const finalSections =
    filteredSections.length > 0
      ? filteredSections
      : [
        {
          id: 'content',
          heading: 'Content',
          content: lines.map((l) => l.text).join('\n'),
        },
      ];
  return {
    title,
    authors,
    institution: '', // Not reliably extractable from all PDFs
    category: 'RESEARCH PAPER',
    year: new Date().getFullYear().toString(),
    sections: finalSections,
  };
}