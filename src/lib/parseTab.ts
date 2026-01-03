export function parseTab(input: string) {
  // Normalize newlines
  const lines = input.replace(/\r/g, '').split('\n').filter(Boolean);
  if (!lines.length) return [];

  // header may be tab or comma separated depending on export; try to detect
  const headerLine = lines[0];
  const delimiter = headerLine.includes('\t') ? '\t' : headerLine.includes(',') ? ',' : '\t';
  const headers = headerLine.split(delimiter).map((h) => h.trim());

  const rows = [];
  for (let i = 1; i < lines.length; i++) {
    const raw = lines[i];
    // allow tabs inside fields if quoted - basic
    const cells = raw.split(delimiter).map((c) => c.trim());
    if (cells.length === 0) continue;
    const obj: Record<string, string> = {};
    for (let j = 0; j < headers.length; j++) {
      obj[headers[j]] = cells[j] ?? '';
    }
    rows.push(obj);
  }

  return rows;
}

export default parseTab;
