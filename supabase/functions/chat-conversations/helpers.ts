export function organizeSuggestions(suggestions: string): string[] {
  return suggestions
    .split("\n")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
