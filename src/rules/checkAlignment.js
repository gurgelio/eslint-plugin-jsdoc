import iterateJsdoc from '../iterateJsdoc.js';

/**
 * @param {string} string
 * @returns {string}
 */
const trimStart = (string) => {
  return string.replace(/^\s+/u, '');
};

export default iterateJsdoc(({
  sourceCode,
  jsdocNode,
  report,
  indent,
}) => {
  // `indent` is whitespace from line 1 (`/**`), so slice and account for "/".
  const indentLevel = indent.length + 1;
  const sourceLines = sourceCode.getText(jsdocNode).split('\n')
    .slice(1)
    .map((line) => {
      return line.split('*')[0];
    })
    .filter((line) => {
      return !trimStart(line).length;
    });

  /** @type {import('eslint').Rule.ReportFixer} */
  const fix = (fixer) => {
    const replacement = sourceCode.getText(jsdocNode).split('\n')
      .map((line, index) => {
        // Ignore the first line and all lines not starting with `*`
        const ignored = !index || trimStart(line.split('*')[0]).length;

        return ignored ? line : `${indent} ${trimStart(line)}`;
      })
      .join('\n');

    return fixer.replaceText(jsdocNode, replacement);
  };

  sourceLines.some((line, lineNum) => {
    if (line.length !== indentLevel) {
      report('Expected JSDoc block to be aligned.', fix, {
        line: lineNum + 1,
      });

      return true;
    }

    return false;
  });
}, {
  iterateAllJsdocs: true,
  meta: {
    docs: {
      description: 'Reports invalid alignment of JSDoc block asterisks.',
      url: 'https://github.com/gajus/eslint-plugin-jsdoc/blob/main/docs/rules/check-alignment.md#repos-sticky-header',
    },
    fixable: 'code',
    type: 'layout',
  },
});
