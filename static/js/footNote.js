'use strict';

const _ = require('ep_etherpad-lite/static/js/underscore');

const cssFiles = ['ep_foot_note/static/css/styles.css'];


exports.aceCreateDomLine = (name, context) => {
  // debugger;
  const cls = context.cls;
  const footnote = /(?:^| )fnss:([A-Za-z0-9]*)/.exec(cls);
  let isPresent;

  if (footnote) {
    isPresent = (footnote[1] === 'fn');
  }

  if (isPresent) {
    const modifier = {
      extraOpenTags: '<sup>',
      extraCloseTags: '</sup>',
      cls,
    };
    return [modifier];
  }
  return [];
};

exports.aceDomLineProcessLineAttributes = (name, context) => {
  const cls = context.cls;


  if (cls && cls.indexOf('fnEnd') > -1) {
    const modifier = {
      preHtml: '',
      postHtml: '',
      processedMarker: true,
    };
    return [modifier];
  }
  return [];
};

const _getFirstFNLineIndex = () => {
  let endLineIndex = null;
  const padInner = $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]').contents();
  const documentLines = padInner.find('div.ace-line');
  documentLines.each((lineIndex, line) => {
    const supTags = $(line).find('.sup');
    if (!endLineIndex && supTags.length === 1) {
      const match =  /fnItem-[0-9]*/gi.exec($(supTags[0]).attr('class'));
      if (match && padInner.find('.'+match[0]).length > 1) {
        if ($(line).attr('id') === padInner.find('.'+match[0]).last().parent().attr('id')) {
          endLineIndex = lineIndex;
        }
      }
    }
  });

  return endLineIndex;
};

let fixLineOrder = function () {
  const fnIds = [];
  const documentAttributeManager = this.documentAttributeManager;
  const rep = this.rep;
  const editorInfo = this.editorInfo;
  let counter = 1;
  const lastLineTexts = [];
  const padInner = $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]').contents();
  padInner.find('.sup').each((index, item) => {
    const match =  /fnItem-[0-9]*/gi.exec($(item).attr('class'));
    if(match && fnIds.indexOf(match[0]) === -1) {
      const fnPair = padInner.find('.'+match[0]);
      if (fnPair.length > -1) {
        padInner.find('.'+match[0]).find('sup').text(counter);
        lastLineTexts.push({id: match[0], text: $(fnPair[1]).parent().text().replace(counter, '').replace('*', '').trim()});
        fnIds.push(match[0]);
        counter++;
      } else {
        fnPair.remove(); //remove orbs
      }
    }
  });
  let lastLineIndex = _getFirstFNLineIndex()
  if (!lastLineIndex) return;
  lastLineTexts.forEach(function (textItem, index) {
    const lastLine = rep.lines.atIndex(lastLineIndex);
    let len = 0;
    if (lastLine && lastLine.text) {
      len = lastLine.text.length;
    }
    editorInfo.ace_performSelectionChange([lastLineIndex, 0], [lastLineIndex, len]);
    editorInfo.ace_replaceRange([lastLineIndex, 0], [lastLineIndex, len], `${index+1} ${textItem.text}`);
    rep.selStart = [lastLineIndex, 0];
    rep.selEnd = [lastLineIndex, (`${index+1}`).length];
    editorInfo.ace_setAttributeOnSelection('fnss', true);
    editorInfo.ace_setAttributeOnSelection(textItem.id, true);
    editorInfo.ace_setAttributeOnSelection('fnEnd', true);
    if(documentAttributeManager.getAttributeOnLine(lastLineIndex, 'fnEndLine') !== '')
      documentAttributeManager.setAttributeOnLine(lastLineIndex, 'fnEndLine', textItem.id);
    lastLineIndex++;
  });
};

const _getFootnoteCount = (html) => {
  const classes = [];
  $(html).find('.sup').each((index, item) => {
    const match =  /fnItem-[0-9]*/gi.exec($(item).attr('class'));
    if(match && classes.indexOf(match[0]) === -1) {
      classes.push(match[0]);
    }
  });

  return classes.length;
};
/*
 * Method which adds the superscript next to the cursor
 * and also adds the footnote to the bottom of the page
 */
let addFootNote = function (footNoteText) {
  const editorInfo = this.editorInfo;
  const rep = this.rep;
  const fnId = `fnItem-${Date.now()}`;
  // find the foot note counter...
  let fnCounter = _getFootnoteCount(editorInfo.ace_getFormattedCode())+1;
  // find the last line and add the superscript and the text...
  let lastLNo = rep.lines.length() - 1;

  // set the superscript after the selection
  const initialEnd = [rep.selEnd[0], (rep.selEnd[1] + fnCounter.toString().length + 1)];
  const end = rep.selEnd;
  editorInfo.ace_replaceRange(end, end, `${fnCounter}`);
  rep.selStart = end;
  rep.selEnd = [end[0], end[1] + (`${fnCounter}`).length];
  editorInfo.ace_setAttributeOnSelection('fnss', true);
  editorInfo.ace_setAttributeOnSelection(fnId, true);
  editorInfo.ace_setAttributeOnSelection('fnContent', true);

  // Add the foot note to the end of the page
  let len = rep.lines.atIndex(lastLNo).text.length;
  if (len > 0) { // means there is some text there.... so press enter and add the foot note
    editorInfo.ace_performSelectionChange([lastLNo, len], [lastLNo, len]);
    editorInfo.ace_doReturnKey();
    // increment the last line index , since Enter key is pressed..
    lastLNo++;
    // get lenth again
    len = rep.lines.atIndex(lastLNo).text.length;
  }

  editorInfo.ace_replaceRange([lastLNo, 0], [lastLNo, len], `${fnCounter} ${footNoteText}`);
  rep.selStart = [lastLNo, 0];
  rep.selEnd = [lastLNo, (`${fnCounter}`).length];
  editorInfo.ace_setAttributeOnSelection('fnss', true);
  editorInfo.ace_setAttributeOnSelection(fnId, true);
  editorInfo.ace_setAttributeOnSelection('fnEnd', true);
  this.documentAttributeManager.setAttributeOnLine(lastLNo, 'fnEndLine', fnId);
  fixLineOrder();
  editorInfo.ace_performSelectionChange(initialEnd, initialEnd);
  editorInfo.ace_focus();
};

/**
 * Popup manager object which creates the popup to get the footnote text
 * Also calls the addfootnote method from footnote context
*/

const fnPopupManager = (function FootNotePopupManager() {
  return {
    container: null,

    insertPopupContainer() {
      this.container = $('#footNotePopup');// this.padOuter.find('#footNotePopup');
      this.addEventListener();
    },

    getFootNoteContext() {
      return this.footNoteContext;
    },

    setFootNoteContext(footNoteContext) {
      this.footNoteContext = footNoteContext;
    },

    showPopup(footNoteContext) {
      // $("#footNotePopup").show();
      if (this.container == null) this.insertPopupContainer();
      this.container.addClass('popup-show');
      this.container.show();
      this.setFootNoteContext(footNoteContext);
      setTimeout(() => {
        $('#fnInput').focus();
      });
    },

    addEventListener() {
      const container = this.container;
      const inputField = container.find('#fnInput');

      const doInsertFootNote = () => {
        const footNoteText = inputField.val();
        container.removeClass('popup-show');
        container.hide();

        if (footNoteText === '') return;

        this.getFootNoteContext().ace.callWithAce((ace) => {
          ace.ace_addFootNote(footNoteText);
          inputField.val('');
        }, 'addFootNote', true);
      };

      inputField.focus();
      // add on click event listener..
      inputField.on('keyup', (e) => {
        if (e.keyCode === 13) {
          doInsertFootNote();
        }
      });

      container.find('#fnAdd').on('click', doInsertFootNote);
      // cancel click event listener
      container.find('#fnCancel').on('click', () => {
        inputField.val('');
        container.removeClass('popup-show');
        container.hide();
      });
    },
  };
})();

exports.postAceInit = (hook, context) => {
  const hs = $('#footnote-button');
  hs.on('click', () => {
    fnPopupManager.showPopup(context);
  });
};

exports.aceInitialized = function (hook, context) {
  const editorInfo = context.editorInfo;
  editorInfo.ace_addFootNote = _(addFootNote).bind(context);
  fixLineOrder = _(fixLineOrder).bind(context);
};

exports.aceAttribsToClasses = (hook, context) => {
  const attribClasses = [];
  const attribs = ['fnss', 'fnContent', 'fnEnd', 'fnEndLine'];
  if (attribs.indexOf(context.key) > -1) {
    attribClasses.push('fnss');
  } else if (/(?:^| )(fnItem-[0-9]*)/.exec(context.key)) {
    attribClasses.push(context.key);
  }

  return attribClasses;
};

exports.aceRegisterBlockElements = () => (['fn', 'fnss', 'sup']);


exports.aceEditorCSS = () => cssFiles;

exports.postToolbarInit = (hookName, context) => {
  const editbar = context.toolbar;

  editbar.registerCommand('addFootNote', () => {
    fnPopupManager.showPopup(context);
  });
};

exports.aceAttribClasses = (hook, attr) => {
  attr.fn = 'tag:sup';
  attr.fnss = 'tag:sup';
  attr.sup = 'tag:sup';

  return attr;
};

exports.aceEditEvent = (hook, context, cb) => {
  const callstack = context.callstack;
  if (['setup', 'handleKeyEvent'].indexOf(callstack.type) === -1 && callstack.docTextChanged) {
    const rep = context.rep;
    const editorInfo = context.editorInfo;
    const docAttrManager = context.documentAttributeManager;
    const startLine = rep.selStart[0];
    const startPos = rep.selStart[1];
    const attribs = docAttrManager.getAttributesOnPosition(startLine, startPos - 1);

    let itemId;
    let isContentElem = false;
    attribs.forEach((elem) => {
      const attrName = elem[0];
      if (attrName === 'fnContent') {
        isContentElem = true;
      } else if (attrName.indexOf('fnItem') > -1) {
        itemId = attrName;
      }
    });

    if (isContentElem) {
      editorInfo.ace_performSelectionChange([startLine, startPos - 1], rep.selEnd);
      editorInfo.ace_setAttributeOnSelection('fnss', false);
      editorInfo.ace_setAttributeOnSelection('fnContent', false);
      editorInfo.ace_setAttributeOnSelection(itemId, false);
      editorInfo.ace_performSelectionChange([startLine, startPos], [startLine, startPos]);
    }
  }
  if (callstack.type === 'addFootNote') {
    const repEnd = [context.rep.selEnd[0], context.rep.selEnd[1]];
    context.editorInfo.ace_performSelectionChange(repEnd, repEnd);
    context.editorInfo.ace_focus();
  }

  return cb();
};
