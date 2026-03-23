import { getFirestopStatusLabel } from "@/lib/firestop-status";

type PdfPage = {
  title: string;
  lines: string[];
};

const PAGE_WIDTH = 612;
const PAGE_HEIGHT = 792;
const LEFT_MARGIN = 48;
const TOP_Y = 752;
const BOTTOM_MARGIN = 48;
const LINE_HEIGHT = 16;
const MAX_CHARS_PER_LINE = 92;

function sanitizePdfText(value: string) {
  return value
    .normalize("NFKD")
    .replace(/[^\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapLine(line: string, maxChars = MAX_CHARS_PER_LINE) {
  if (!line.trim()) {
    return [""];
  }

  const words = line.split(/\s+/);
  const wrapped: string[] = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;

    if (candidate.length <= maxChars) {
      current = candidate;
      continue;
    }

    if (current) {
      wrapped.push(current);
    }

    if (word.length <= maxChars) {
      current = word;
      continue;
    }

    let remaining = word;

    while (remaining.length > maxChars) {
      wrapped.push(remaining.slice(0, maxChars));
      remaining = remaining.slice(maxChars);
    }

    current = remaining;
  }

  if (current) {
    wrapped.push(current);
  }

  return wrapped;
}

function paginateLines(title: string, lines: string[]) {
  const maxLinesPerPage = Math.floor((TOP_Y - BOTTOM_MARGIN) / LINE_HEIGHT);
  const wrappedLines = lines.flatMap((line) => wrapLine(line));
  const pages: PdfPage[] = [];

  for (let index = 0; index < wrappedLines.length; index += maxLinesPerPage) {
    pages.push({
      title,
      lines: wrappedLines.slice(index, index + maxLinesPerPage),
    });
  }

  return pages.length ? pages : [{ title, lines: ["No content available."] }];
}

function buildPageStream(page: PdfPage, pageNumber: number, totalPages: number) {
  const commands = [
    "BT",
    "/F1 18 Tf",
    `1 0 0 1 ${LEFT_MARGIN} ${TOP_Y} Tm`,
    `(${sanitizePdfText(page.title)}) Tj`,
    "/F1 10 Tf",
    `${LINE_HEIGHT} TL`,
    `1 0 0 1 ${LEFT_MARGIN} ${TOP_Y - 28} Tm`,
  ];

  page.lines.forEach((line, index) => {
    if (index > 0) {
      commands.push("T*");
    }

    commands.push(`(${sanitizePdfText(line)}) Tj`);
  });

  commands.push("ET");
  commands.push(
    `BT /F1 9 Tf 1 0 0 1 ${LEFT_MARGIN} 24 Tm (Page ${pageNumber} of ${totalPages}) Tj ET`
  );

  return commands.join("\n");
}

export function buildPdfDocument(title: string, lines: string[]) {
  const pages = paginateLines(title, lines);
  const fontObjectNumber = 3;
  const objectContents = new Map<number, string>();
  const pageObjectNumbers: number[] = [];
  let nextObjectNumber = 4;

  pages.forEach((page, index) => {
    const contentObjectNumber = nextObjectNumber++;
    const pageObjectNumber = nextObjectNumber++;
    const stream = buildPageStream(page, index + 1, pages.length);

    objectContents.set(
      contentObjectNumber,
      `<< /Length ${Buffer.byteLength(stream, "utf8")} >>\nstream\n${stream}\nendstream`
    );
    objectContents.set(
      pageObjectNumber,
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumber} 0 R >>`
    );

    pageObjectNumbers.push(pageObjectNumber);
  });

  objectContents.set(1, "<< /Type /Catalog /Pages 2 0 R >>");
  objectContents.set(
    2,
    `<< /Type /Pages /Kids [${pageObjectNumbers
      .map((pageObjectNumber) => `${pageObjectNumber} 0 R`)
      .join(" ")}] /Count ${pageObjectNumbers.length} >>`
  );
  objectContents.set(
    fontObjectNumber,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );

  const maxObjectNumber = Math.max(...objectContents.keys());
  let pdf = "%PDF-1.4\n%\xFF\xFF\xFF\xFF\n";
  const offsets: number[] = [0];

  for (let objectNumber = 1; objectNumber <= maxObjectNumber; objectNumber += 1) {
    const content = objectContents.get(objectNumber);

    if (!content) {
      continue;
    }

    offsets[objectNumber] = Buffer.byteLength(pdf, "utf8");
    pdf += `${objectNumber} 0 obj\n${content}\nendobj\n`;
  }

  const xrefOffset = Buffer.byteLength(pdf, "utf8");
  pdf += `xref\n0 ${maxObjectNumber + 1}\n`;
  pdf += "0000000000 65535 f \n";

  for (let objectNumber = 1; objectNumber <= maxObjectNumber; objectNumber += 1) {
    const offset = offsets[objectNumber] ?? 0;
    pdf += `${offset.toString().padStart(10, "0")} 00000 n \n`;
  }

  pdf += `trailer\n<< /Size ${maxObjectNumber + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(pdf);
}

export function buildProjectPdfLines(input: {
  projectName: string;
  client: string | null;
  siteAddress: string | null;
  floorplansCount: number;
  firestops: Array<{
    code: string;
    status: string;
    type: string;
    locationDescription: string | null;
    roomZone: string | null;
    floorplanTitle: string | null;
    floorName: string | null;
    systemName: string | null;
    fireRating: string | null;
    substrate: string | null;
    installedBy: string | null;
    installedAt: string | null;
    inspectedBy: string | null;
    inspectionDate: string | null;
    inspectionNotes: string | null;
    beforePhoto: string | null;
    afterPhoto: string | null;
    notes: string | null;
  }>;
}) {
  const lines = [
    `Project: ${input.projectName}`,
    `Client: ${input.client || "-"}`,
    `Address: ${input.siteAddress || "-"}`,
    `Floorplans: ${input.floorplansCount}`,
    `Firestops: ${input.firestops.length}`,
    "",
  ];

  input.firestops.forEach((firestop, index) => {
    lines.push(`Firestop ${index + 1}`);
    lines.push(`Code: ${firestop.code}`);
    lines.push(`Status: ${getFirestopStatusLabel(firestop.status as Parameters<typeof getFirestopStatusLabel>[0], "en")}`);
    lines.push(`Type: ${firestop.type}`);
    lines.push(`Room / Zone: ${firestop.roomZone || "-"}`);
    lines.push(`Location: ${firestop.locationDescription || "-"}`);
    lines.push(`Floor / Section: ${firestop.floorName || "-"}`);
    lines.push(`Drawing / Area: ${firestop.floorplanTitle || "-"}`);
    lines.push(`System: ${firestop.systemName || "-"}`);
    lines.push(`Rating: ${firestop.fireRating || "-"}`);
    lines.push(`Substrate: ${firestop.substrate || "-"}`);
    lines.push(`Installed by: ${firestop.installedBy || "-"}`);
    lines.push(`Installation date: ${firestop.installedAt || "-"}`);
    lines.push(`Inspected by: ${firestop.inspectedBy || "-"}`);
    lines.push(`Inspection date: ${firestop.inspectionDate || "-"}`);
    lines.push(`Inspection notes: ${firestop.inspectionNotes || "-"}`);
    lines.push(`Before photo URL: ${firestop.beforePhoto || "-"}`);
    lines.push(`After photo URL: ${firestop.afterPhoto || "-"}`);
    lines.push(`Notes: ${firestop.notes || "-"}`);
    lines.push("");
  });

  return lines;
}

export function buildFloorplanPdfLines(input: {
  projectName: string;
  floorplanTitle: string;
  floorName: string | null;
  firestops: Array<{
    code: string;
    status: string;
    type: string;
    locationDescription: string | null;
    roomZone: string | null;
    systemName: string | null;
    fireRating: string | null;
    substrate: string | null;
    installedBy: string | null;
    installedAt: string | null;
    inspectedBy: string | null;
    inspectionDate: string | null;
    inspectionNotes: string | null;
    beforePhoto: string | null;
    afterPhoto: string | null;
    notes: string | null;
  }>;
}) {
  const lines = [
    `Project: ${input.projectName}`,
    `Drawing / Area: ${input.floorplanTitle}`,
    `Floor / Section: ${input.floorName || "-"}`,
    `Firestops: ${input.firestops.length}`,
    "",
  ];

  input.firestops.forEach((firestop, index) => {
    lines.push(`Firestop ${index + 1}`);
    lines.push(`Code: ${firestop.code}`);
    lines.push(`Status: ${getFirestopStatusLabel(firestop.status as Parameters<typeof getFirestopStatusLabel>[0], "en")}`);
    lines.push(`Type: ${firestop.type}`);
    lines.push(`Room / Zone: ${firestop.roomZone || "-"}`);
    lines.push(`Location: ${firestop.locationDescription || "-"}`);
    lines.push(`System: ${firestop.systemName || "-"}`);
    lines.push(`Rating: ${firestop.fireRating || "-"}`);
    lines.push(`Substrate: ${firestop.substrate || "-"}`);
    lines.push(`Installed by: ${firestop.installedBy || "-"}`);
    lines.push(`Installation date: ${firestop.installedAt || "-"}`);
    lines.push(`Inspected by: ${firestop.inspectedBy || "-"}`);
    lines.push(`Inspection date: ${firestop.inspectionDate || "-"}`);
    lines.push(`Inspection notes: ${firestop.inspectionNotes || "-"}`);
    lines.push(`Before photo URL: ${firestop.beforePhoto || "-"}`);
    lines.push(`After photo URL: ${firestop.afterPhoto || "-"}`);
    lines.push(`Notes: ${firestop.notes || "-"}`);
    lines.push("");
  });

  return lines;
}
