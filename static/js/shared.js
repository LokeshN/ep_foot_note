var _ = require('ep_etherpad-lite/static/js/underscore');



var collectContentPre = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(tname == "fnss"){
    lineAttributes['fnss'] = 'fn';
  }
};

var collectContentPost = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(tname == 'fnss'){
    delete lineAttributes['fnss'];
  }
};

exports.collectContentPre = collectContentPre;
exports.collectContentPost = collectContentPost;