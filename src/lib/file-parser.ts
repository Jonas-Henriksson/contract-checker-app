/**
 * Client-side file parser supporting PDF, DOCX, DOC, RTF, and TXT.
 * All parsing happens in the browser — no server required.
 */

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.doc', '.rtf', '.txt'] as const;
type SupportedExtension = (typeof SUPPORTED_EXTENSIONS)[number];

function getExtension(filename: string): string {
  const idx = filename.lastIndexOf('.');
  return idx >= 0 ? filename.slice(idx).toLowerCase() : '';
}

export function isSupportedFile(filename: string): boolean {
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(getExtension(filename));
}

export function getSupportedExtensionsString(): string {
  return SUPPORTED_EXTENSIONS.join(', ');
}

export const ACCEPT_STRING = SUPPORTED_EXTENSIONS.join(',');

/**
 * Parse an uploaded file and return its text content.
 * Throws on unsupported types or parse failures.
 */
export async function parseFile(file: File): Promise<string> {
  const ext = getExtension(file.name) as SupportedExtension;

  switch (ext) {
    case '.txt':
      return parseTxt(file);
    case '.pdf':
      return parsePdf(file);
    case '.docx':
    case '.doc':
      return parseDocx(file);
    case '.rtf':
      return parseRtf(file);
    default:
      throw new Error(`Unsupported file type: ${ext}. Supported: ${getSupportedExtensionsString()}`);
  }
}

/** Plain text — just read as string */
async function parseTxt(file: File): Promise<string> {
  return file.text();
}

/** PDF via pdfjs-dist */
async function parsePdf(file: File): Promise<string> {
  const pdfjsLib = await import('pdfjs-dist');

  // Set the worker source to the bundled worker
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: string[] = [];
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item: any) => ('str' in item ? item.str : ''))
      .join(' ');
    pages.push(pageText);
  }

  return pages.join('\n\n');
}

/** DOCX/DOC via mammoth */
async function parseDocx(file: File): Promise<string> {
  const mammoth = await import('mammoth');
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value;
}

/** RTF — strip formatting tags with regex */
async function parseRtf(file: File): Promise<string> {
  const raw = await file.text();
  return stripRtf(raw);
}

/**
 * Strip RTF control words and groups to extract plain text.
 * Handles common RTF constructs: control words, groups, hex escapes, Unicode.
 */
function stripRtf(rtf: string): string {
  // If it doesn't start with {\rtf, it's probably not RTF — return as-is
  if (!rtf.startsWith('{\\rtf')) {
    return rtf;
  }

  let text = rtf;

  // Remove header/font/color/style tables (groups starting with specific keywords)
  text = text.replace(/\{\\(?:fonttbl|colortbl|stylesheet|info|pict|object|listtable|listoverridetable)[^{}]*(?:\{[^{}]*\}[^{}]*)*\}/gi, '');

  // Replace common RTF special characters
  text = text.replace(/\\par\b/g, '\n');
  text = text.replace(/\\tab\b/g, '\t');
  text = text.replace(/\\line\b/g, '\n');
  text = text.replace(/\\page\b/g, '\n\n');
  text = text.replace(/\\\\/g, '\\');
  text = text.replace(/\\\{/g, '{');
  text = text.replace(/\\\}/g, '}');
  text = text.replace(/\\lquote\b/g, '\u2018');
  text = text.replace(/\\rquote\b/g, '\u2019');
  text = text.replace(/\\ldblquote\b/g, '\u201C');
  text = text.replace(/\\rdblquote\b/g, '\u201D');
  text = text.replace(/\\emdash\b/g, '\u2014');
  text = text.replace(/\\endash\b/g, '\u2013');
  text = text.replace(/\\bullet\b/g, '\u2022');

  // Handle Unicode escapes: \uNNNN followed by a replacement char
  text = text.replace(/\\u(-?\d+)[?]?/g, (_, code) => {
    const num = parseInt(code, 10);
    return String.fromCharCode(num < 0 ? num + 65536 : num);
  });

  // Handle hex escapes: \'XX
  text = text.replace(/\\'([0-9a-fA-F]{2})/g, (_, hex) =>
    String.fromCharCode(parseInt(hex, 16))
  );

  // Remove remaining control words (e.g., \b, \fs24, \i0)
  text = text.replace(/\\[a-z]+[-]?\d*\s?/gi, '');

  // Remove remaining curly braces
  text = text.replace(/[{}]/g, '');

  // Clean up whitespace
  text = text.replace(/\r\n/g, '\n');
  text = text.replace(/[ \t]+/g, ' ');
  text = text.replace(/\n{3,}/g, '\n\n');
  text = text.trim();

  return text;
}
