import type { ResourceType } from '../types/goal';

export interface LinkDetectionResult {
  type: ResourceType;
  label: string;
  domain: string;
  normalizedUrl: string;
}

const KNOWN_PRACTICE_DOMAINS = [
  'leetcode.com',
  'leetcode.cn',
  'hackerrank.com',
  'codeforces.com',
  'codewars.com',
  'exercism.org',
  'exercism.io',
  'neetcode.io',
  'algoexpert.io',
  'frontendmentor.io',
  'kaggle.com',
  'atcoder.jp',
  'spoj.com',
  'topcoder.com',
  'cses.fi',
  'projecteuler.net',
  'codesignal.com',
  'interviewbit.com',
  'codechef.com',
  'stratascratch.com',
];

/**
 * Normalizes a URL string by ensuring a valid protocol
 */
export function normalizeUrl(inputUrl: string): string {
  const trimmed = inputUrl.trim();
  if (!trimmed) return '';
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

/**
 * Extracts a clean hostname domain without 'www.'
 */
export function extractDomain(inputUrl: string): string {
  try {
    const normalized = normalizeUrl(inputUrl);
    const parsed = new URL(normalized);
    return parsed.hostname.replace(/^www\./i, '').toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Detects the resource type and returns formatted information
 */
export function detectLinkType(rawUrl: string): LinkDetectionResult {
  const normalizedUrl = normalizeUrl(rawUrl);
  let domain = '';
  let pathname = '';

  try {
    const parsed = new URL(normalizedUrl);
    domain = parsed.hostname.replace(/^www\./i, '').toLowerCase();
    pathname = parsed.pathname.toLowerCase();
  } catch {
    domain = rawUrl.toLowerCase().trim();
  }

  // 1. YouTube Detection
  const isYouTube =
    domain === 'youtube.com' ||
    domain.endsWith('.youtube.com') ||
    domain === 'youtu.be';

  if (isYouTube) {
    return {
      type: 'youtube',
      label: 'Watch on YouTube',
      domain: domain || 'youtube.com',
      normalizedUrl,
    };
  }

  // 2. Known Practice Sites Detection
  const isGeeksforGeeksPractice =
    (domain === 'geeksforgeeks.org' || domain.endsWith('.geeksforgeeks.org')) &&
    (domain.startsWith('practice.') || pathname.includes('practice'));

  const isPractice =
    isGeeksforGeeksPractice ||
    KNOWN_PRACTICE_DOMAINS.some(
      (practiceDomain) =>
        domain === practiceDomain || domain.endsWith(`.${practiceDomain}`)
    );

  if (isPractice) {
    return {
      type: 'practice',
      label: 'Practice',
      domain: domain || 'practice',
      normalizedUrl,
    };
  }

  // 3. Generic Resource
  return {
    type: 'generic',
    label: 'Open Resource',
    domain: domain || 'resource',
    normalizedUrl,
  };
}
