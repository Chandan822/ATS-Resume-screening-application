import assert from 'node:assert/strict';
import test from 'node:test';
import {
  calculateResumeExperienceYears,
  mergeResumeLanguages,
  parseResumeDate,
  uniqueResumeValues,
} from '../utils/resumeProfileMapper.js';

test('parses common resume month and year formats', () => {
  assert.equal(parseResumeDate('2022-08').toISOString(), '2022-08-01T00:00:00.000Z');
  assert.equal(parseResumeDate('08/2022').toISOString(), '2022-08-01T00:00:00.000Z');
  assert.equal(parseResumeDate('Present'), null);
});

test('deduplicates resume skills without changing their display text', () => {
  assert.deepEqual(uniqueResumeValues(['React', ' react ', 'Node.js', '', 'N/A']), ['React', 'Node.js']);
});

test('merges parsed languages without duplicating existing profile languages', () => {
  assert.deepEqual(
    mergeResumeLanguages([{ language: 'English', proficiency: 'ADVANCED' }], ['english', 'Hindi']),
    [
      { language: 'English', proficiency: 'ADVANCED' },
      { language: 'Hindi', proficiency: 'INTERMEDIATE' },
    ]
  );
});

test('calculates non-overlapping resume experience ranges', () => {
  const years = calculateResumeExperienceYears(
    [
      { startDate: '2020-01', endDate: '2021-01' },
      { startDate: '2020-06', endDate: '2022-01' },
    ],
    new Date('2023-01-01T00:00:00.000Z')
  );
  assert.equal(years, 2);
});
