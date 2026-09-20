/**
 * Generates initials from a full name.
 * Takes the first letter of the FIRST token and the first letter of the LAST token.
 * Examples:
 * - "John Doe" -> "JD"
 * - "Anusmita Ray Chaudhuri" -> "AC"
 * - "Jane" -> "J"
 */
export function getInitials(name: string | undefined | null): string {
  if (!name || !name.trim()) {
    return 'U';
  }

  const tokens = name.trim().split(/\s+/);
  if (tokens.length === 1) {
    return tokens[0].charAt(0).toUpperCase();
  }

  const firstLetter = tokens[0].charAt(0).toUpperCase();
  const lastLetter = tokens[tokens.length - 1].charAt(0).toUpperCase();
  
  return `${firstLetter}${lastLetter}`;
}
