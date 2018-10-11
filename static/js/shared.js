var _ = require('ep_etherpad-lite/static/js/underscore');



var collectContentPre = function(hook, context){
  var footNote = /fnItem-[0-9]*/.exec(context.cls);
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(footNote && footNote[0]) {
    context.cc.doAttrib(state, 'fnss');
    context.cc.doAttrib(state, footNote[0]);
  }
  if (context.cls && context.cls.indexOf('fnEnd') > -1) {
    context.cc.doAttrib(context.state, "fnEnd");
  }
  if (context.cls && context.cls.indexOf('fnContent') > -1) {
    context.cc.doAttrib(context.state, "fnContent");
  }
};


var collectContentPost = function(hook, context){
  var state = context.state;
  var lineAttributes = state.lineAttributes;
  if(context.cls && context.cls.indexOf('fnEnd') > -1) {
    delete lineAttributes['fnEndLine'];
  }
};

exports.collectContentPre = collectContentPre;
exports.collectContentPost = collectContentPost;