'use strict';

exports.collectContentPre = (hook, context, cb) => {
  const footNote = /fnItem-[0-9]*/.exec(context.cls);
  const state = context.state;

  if (footNote && footNote[0]) {
    context.cc.doAttrib(state, 'fnss');
    context.cc.doAttrib(state, footNote[0]);
  }
  if (context.cls && context.cls.indexOf('fnEnd') > -1) {
    context.cc.doAttrib(context.state, 'fnEnd');
  }
  if (context.cls && context.cls.indexOf('fnContent') > -1) {
    context.cc.doAttrib(context.state, 'fnContent');
  }

  return cb();
};

exports.collectContentPost = (hook, context, cb) => {
  const state = context.state;
  const lineAttributes = state.lineAttributes;
  if (context.cls && context.cls.indexOf('fnEnd') > -1) {
    delete lineAttributes.fnEndLine;
  }

  return cb();
};
