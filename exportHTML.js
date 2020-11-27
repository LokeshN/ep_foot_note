'use strict';

const ChangeSet = require('ep_etherpad-lite/static/js/Changeset');

exports.exportHtmlAdditionalTags = (hook, pad, cb) => cb(['fn', 'fnss', 'sup']);

const checkFootNoteInLine = (lineAttrib, pool) => {
  let fn = null;
  if (lineAttrib) {
    const iter = ChangeSet.opIterator(lineAttrib);
    if (iter.hasNext()) {
      const op = iter.next();
      fn = ChangeSet.opAttributeValue(op, 'fnEndLine', pool);
    }
  }

  return fn;
};

exports.getLineHTMLForExport = async (hook, context) => {
  const fn = checkFootNoteInLine(context.attribLine, context.apool);
  context.lineContent = context.lineContent.replace(/<fnss/g, '<sup');
  context.lineContent = context.lineContent.replace(/<\/fnss/g, '</sup');
  let text = context.text;
  if (context.text.indexOf('*') === 0) {
    text = context.text.replace('*', '');
  }
  if (fn) {
    context.lineContent = `<span class="fnEndLine">${context.lineContent.replace(context.text, text)}</span>`;
  }

  return context.lineContent;
};
