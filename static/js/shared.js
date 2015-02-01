var _ = require('ep_etherpad-lite/static/js/underscore');



var collectContentPre = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(tname == "hrline"){
    lineAttributes['hrline'] = 'hr';
  }
};

var collectContentPost = function(hook, context){
  var tname = context.tname;
  var state = context.state;
  var lineAttributes = state.lineAttributes

  if(tname == 'hrline'){
    delete lineAttributes['hrline'];
  }
};

exports.collectContentPre = collectContentPre;
exports.collectContentPost = collectContentPost;