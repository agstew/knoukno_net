import { countWords, stageForPosition, validGeneratedQuestion } from './openai.js';

describe('AI question requirements', () => {
  test('moves through law, location, hiring, and people in order', () => {
    expect([1, 2, 3, 4].map((position) => stageForPosition(position, 4))).toEqual([
      'law',
      'location',
      'hiring',
      'people',
    ]);
  });

  test('counts words separated by any whitespace', () => {
    expect(countWords('one  two\nthree')).toBe(3);
  });

  test('accepts substantial output near the configured target', () => {
    const prompt = `${'decision '.repeat(799)}why?`;
    const example = 'evidence '.repeat(800);
    expect(validGeneratedQuestion({ prompt, example }, 800)).toBe(true);
  });

  test('rejects short output and prompts without a direct question', () => {
    expect(validGeneratedQuestion({ prompt: 'Choose now?', example: 'Example.' }, 800)).toBe(false);
    expect(
      validGeneratedQuestion(
        { prompt: 'decision '.repeat(800), example: 'evidence '.repeat(800) },
        800,
      ),
    ).toBe(false);
  });
});