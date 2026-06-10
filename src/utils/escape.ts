const map: Record<string, string> = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  "\"": "&quot;",
};

const pattern = /[&<>"]/g;

export function escapeHtml(input: string): string {
  return String(input).replace(pattern, (m) => map[m] ?? m);
}
