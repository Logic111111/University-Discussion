import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseBlocks, parseInline } from '../src/lib/markdown.ts';

test('headings, paragraphs and rules', () => {
  const blocks = parseBlocks('# Title\n\nFirst line\nsecond line\n\n---\n## Next');
  assert.deepEqual(blocks, [
    { t: 'heading', level: 1, text: 'Title' },
    { t: 'p', text: 'First line second line' },
    { t: 'hr' },
    { t: 'heading', level: 2, text: 'Next' },
  ]);
});

test('fenced code is kept verbatim', () => {
  const blocks = parseBlocks('```cpp\nint a = 2 * 3; // **not bold**\n\n  indented\n```\nafter');
  assert.deepEqual(blocks, [
    { t: 'code', lang: 'cpp', code: 'int a = 2 * 3; // **not bold**\n\n  indented' },
    { t: 'p', text: 'after' },
  ]);
});

test('display math on one line and across lines', () => {
  assert.deepEqual(parseBlocks('$$E = mc^2$$'), [{ t: 'math', tex: 'E = mc^2' }]);
  assert.deepEqual(parseBlocks('$$\n\\frac{a}{b}\n+ c\n$$\ntext'), [
    { t: 'math', tex: '\\frac{a}{b}\n+ c' },
    { t: 'p', text: 'text' },
  ]);
});

test('widget tags with string and numeric props', () => {
  assert.deepEqual(parseBlocks('<OscilloscopeWidget frequency={100} title="Scope" />'), [
    { t: 'widget', name: 'OscilloscopeWidget', props: { frequency: 100, title: 'Scope' } },
  ]);
  assert.deepEqual(parseBlocks('<HardwareSandbox/>'), [{ t: 'widget', name: 'HardwareSandbox', props: {} }]);
});

test('lists and quotes', () => {
  assert.deepEqual(parseBlocks('- a\n- **b**\n\n1. one\n2. two\n> quoted\n> more'), [
    { t: 'list', ordered: false, items: ['a', '**b**'] },
    { t: 'list', ordered: true, items: ['one', 'two'] },
    { t: 'quote', text: 'quoted more' },
  ]);
});

test('inline marks, math and links', () => {
  assert.deepEqual(parseInline('a **b** *c* `d*e*` $Q_{rr}$ [x](https://ex.com)'), [
    { t: 'text', v: 'a ' },
    { t: 'strong', c: [{ t: 'text', v: 'b' }] },
    { t: 'text', v: ' ' },
    { t: 'em', c: [{ t: 'text', v: 'c' }] },
    { t: 'text', v: ' ' },
    { t: 'code', v: 'd*e*' },
    { t: 'text', v: ' ' },
    { t: 'math', v: 'Q_{rr}' },
    { t: 'text', v: ' ' },
    { t: 'link', c: [{ t: 'text', v: 'x' }], href: 'https://ex.com' },
  ]);
});

test('unsafe link targets are neutralised', () => {
  assert.deepEqual(parseInline('[x](javascript:alert(1))')[0], { t: 'link', c: [{ t: 'text', v: 'x' }], href: '#' });
});

test('prices are not mistaken for math', () => {
  assert.deepEqual(parseInline('costs $5 and $10'), [{ t: 'text', v: 'costs $5 and $10' }]);
});
