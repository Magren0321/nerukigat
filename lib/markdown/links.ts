const BLANK_TARGET = '_blank';
const REQUIRED_BLANK_REL_TOKENS = ['noopener', 'noreferrer'] as const;

/**
 * Any blank browsing context receives both protections. This is deliberately
 * also applied to relative links: it is stricter than the external-link
 * requirement and avoids future regressions when a URL changes host.
 */
export const ensureSafeBlankTargetRel = (
  target: string | undefined,
  rel: string | undefined
) => {
  if (target?.toLowerCase() !== BLANK_TARGET) return rel;

  const tokens = new Set(
    (rel ?? '')
      .split(/\s+/)
      .map((token) => token.trim().toLowerCase())
      .filter(Boolean)
  );
  for (const token of REQUIRED_BLANK_REL_TOKENS) tokens.add(token);
  return Array.from(tokens).join(' ');
};
