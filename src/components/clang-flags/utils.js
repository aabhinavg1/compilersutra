export function normalizeText(value) {
  return String(value ?? '').toLowerCase().replace(/\s+/g, ' ').trim();
}

export function isFuzzyMatch(needle, haystack) {
  const text = String(needle ?? '');
  const value = String(haystack ?? '');
  if (!text || text.length < 3) {
    return false;
  }
  let index = 0;
  for (let i = 0; i < value.length && index < text.length; i += 1) {
    if (value[i] === text[index]) {
      index += 1;
    }
  }
  return index === text.length;
}

export function getPublicFlag(option) {
  return option?.publicFlag || option?.flag || '';
}

export function getFlagSearchNames(option) {
  return uniqueValues([
    getPublicFlag(option),
    option?.flag,
    ...(option?.spellings || []),
    ...(option?.searchAliases || []),
    option?.aliasTargetFlag,
    option?.alias,
  ]).map((item) => normalizeText(item));
}

function scoreExactFlagMatch(option, queryVariants) {
  const flag = normalizeText(option?.flag);
  const publicFlag = normalizeText(getPublicFlag(option));
  const spellings = (option?.spellings || []).map((item) => normalizeText(item));
  let score = 0;

  if (queryVariants.some((variant) => variant === flag || variant === publicFlag || spellings.includes(variant))) {
    score += 100;
  } else {
    // searchAliases / other names — weaker than an exact spelling match
    score += 10;
  }

  // Prefer real Clang driver options over clang-cl compatibility spellings
  // when both share a surface form (e.g. -O2).
  if (option?.category === 'CL Compatibility' || option?.group === 'cl_Group') {
    score -= 40;
  }
  if ((option?.visibility || []).includes('ClangOption')) {
    score += 5;
  }
  if (option?.group === 'O_Group' || option?.category === 'Optimization') {
    score += 8;
  }

  return score;
}

export function findFlagOption(options, requestedFlag) {
  const query = normalizeText(requestedFlag);
  if (!query || !Array.isArray(options)) {
    return null;
  }

  const queryVariants = uniqueValues([
    query,
    query.startsWith('-') ? query.slice(1) : `-${query}`,
  ]).map((item) => normalizeText(item));

  const matches = options.filter((option) => {
    const names = getFlagSearchNames(option);
    return queryVariants.some((variant) => names.includes(variant));
  });
  if (!matches.length) {
    return null;
  }

  return matches
    .slice()
    .sort((a, b) => scoreExactFlagMatch(b, queryVariants) - scoreExactFlagMatch(a, queryVariants))[0];
}

export function scoreFlagOption(option, query, tokens = []) {
  if (!query) {
    return 0;
  }

  const haystack = String(option?.searchText ?? '');
  const flag = normalizeText(option?.flag);
  const publicFlag = normalizeText(getPublicFlag(option));
  const names = getFlagSearchNames(option);
  let score = 0;

  if (names.includes(query)) score += 200;
  if (publicFlag === query) score += 195;
  if (publicFlag.startsWith(query)) score += 120;
  if (flag === query) score += 190;
  if (flag.startsWith(query)) score += 110;
  if (isFuzzyMatch(query, publicFlag)) score += 35;
  if (isFuzzyMatch(query, flag)) score += 30;
  if (haystack.includes(query)) score += 75;
  if (tokens.length && tokens.every((token) => haystack.includes(token))) score += 50;
  if (normalizeText(option?.category).includes(query)) score += 18;
  if (normalizeText(option?.kind).includes(query)) score += 12;
  if (option?.groupLabel && normalizeText(option.groupLabel).includes(query)) score += 10;
  if (option?.help && normalizeText(option.help).includes(query)) score += 8;
  if (!score && haystack.includes(query)) score = 4;
  return score;
}

export function uniqueValues(values) {
  return [...new Set((values || []).filter(Boolean))];
}

export function splitHighlightedText(text, query) {
  const value = String(text ?? '');
  const needle = String(query ?? '').trim();

  if (!needle) {
    return [{ text: value, highlighted: false }];
  }

  const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const matcher = new RegExp(escaped, 'ig');
  const parts = [];
  let lastIndex = 0;

  for (const match of value.matchAll(matcher)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ text: value.slice(lastIndex, index), highlighted: false });
    }
    parts.push({
      text: value.slice(index, index + match[0].length),
      highlighted: true,
    });
    lastIndex = index + match[0].length;
  }

  if (!parts.length) {
    return [{ text: value, highlighted: false }];
  }

  if (lastIndex < value.length) {
    parts.push({ text: value.slice(lastIndex), highlighted: false });
  }

  return parts;
}

export function joinList(values) {
  return uniqueValues(values).join(', ');
}
