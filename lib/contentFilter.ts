const blockedTerms: Record<string, string> = {};

export const filterResponse = (text: string, lang: string): string => {
  let filtered = text;
  Object.entries(blockedTerms).forEach(([term, replacement]) => {
    const regex = new RegExp(term, "gi");
    filtered = filtered.replace(regex, replacement);
  });
  return filtered;
};
