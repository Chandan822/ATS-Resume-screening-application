const EMPTY_VALUES = new Set(['', 'n/a', 'na', 'none', 'null', 'unknown']);

export const normalizeResumeValue = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim().replace(/\s+/g, ' ');
};

export const normalizeResumeKey = (value) => normalizeResumeValue(value).toLowerCase();

export const isUsefulResumeValue = (value) => {
  const normalized = normalizeResumeKey(value);
  return normalized.length > 0 && !EMPTY_VALUES.has(normalized);
};

/**
 * Convert the date formats commonly returned by the resume parser into a
 * stable UTC date. Values such as "Present" intentionally return null.
 */
export const parseResumeDate = (value) => {
  const normalized = normalizeResumeValue(value);
  if (!isUsefulResumeValue(normalized) || /^(present|current|ongoing|now)$/i.test(normalized)) return null;

  let match = normalized.match(/^(\d{4})$/);
  if (match) return new Date(Date.UTC(Number(match[1]), 0, 1));

  match = normalized.match(/^(\d{4})[-/.](\d{1,2})$/);
  if (match) return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, 1));

  match = normalized.match(/^(\d{1,2})[-/.](\d{4})$/);
  if (match) return new Date(Date.UTC(Number(match[2]), Number(match[1]) - 1, 1));

  const parsed = new Date(normalized);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const uniqueResumeValues = (values = []) => {
  const unique = [];
  const seen = new Set();

  for (const value of values) {
    const normalized = normalizeResumeValue(value);
    const key = normalizeResumeKey(normalized);
    if (!isUsefulResumeValue(normalized) || seen.has(key)) continue;
    seen.add(key);
    unique.push(normalized);
  }

  return unique;
};

export const calculateResumeExperienceYears = (experiences = [], now = new Date()) => {
  const ranges = experiences
    .map((experience) => {
      const start = parseResumeDate(experience?.startDate);
      if (!start) return null;

      const parsedEnd = parseResumeDate(experience?.endDate);
      const end = experience?.isCurrentJob || !parsedEnd ? now : parsedEnd;
      if (end <= start) return null;
      return { start, end };
    })
    .filter(Boolean)
    .sort((a, b) => a.start - b.start);

  if (ranges.length === 0) return 0;

  const merged = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) {
      previous.end = new Date(Math.max(previous.end.getTime(), range.end.getTime()));
    } else {
      merged.push({ ...range });
    }
  }

  const months = merged.reduce((total, range) => total + (range.end - range.start) / (1000 * 60 * 60 * 24 * 365.25) * 12, 0);
  return Math.round((months / 12) * 10) / 10;
};

export const mergeResumeLanguages = (existingLanguages, parsedLanguages = []) => {
  const existing = Array.isArray(existingLanguages) ? existingLanguages : [];
  const merged = existing
    .map((language) => {
      if (typeof language === 'string') return { language: normalizeResumeValue(language), proficiency: 'INTERMEDIATE' };
      return {
        language: normalizeResumeValue(language?.language),
        proficiency: normalizeResumeValue(language?.proficiency) || 'INTERMEDIATE',
      };
    })
    .filter((language) => isUsefulResumeValue(language.language));

  const known = new Set(merged.map((language) => normalizeResumeKey(language.language)));
  for (const language of uniqueResumeValues(parsedLanguages)) {
    if (!known.has(normalizeResumeKey(language))) {
      merged.push({ language, proficiency: 'INTERMEDIATE' });
      known.add(normalizeResumeKey(language));
    }
  }

  return merged;
};
