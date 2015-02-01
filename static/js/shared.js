var _ = require('ep_etherpad-lite/static/js/underscore');



var collectContentPre = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(tname == "footnote"){
    lineAttributes['footnote'] = 'fn';
  }
};

var collectContentPost = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(tname == 'footnote'){
    delete lineAttributes['footnote'];
  }
};

exports.collectContentPre = collectContentPre;
exports.collectContentPost = collectContentPost;