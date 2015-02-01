var _, $;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');



var cssFiles = ['ep_horizontal_line/static/css/styles.css'];


function aceDomLineProcessLineAttributes(name,context){
	var cls = context.cls;
	var domLine  = context.domline;
	var hrline = /(?:^| )hrline:([A-Za-z0-9]*)/.exec(cls);
	var isPresent;

	if (hrline){
		isPresent = (hrline[1] == 'hr');
	}

	if (isPresent){

		var modifier = {
		  preHtml: '',
		  postHtml: '<hr></hr>',
		  processedMarker: true
		};
		return [modifier];
   }

   return [];
}


function postAceInit(hook,context){
	var hs = $('#hrline-button');
	hs.on('click', function(){
	     context.ace.callWithAce(function(ace){
			        ace.ace_addHorizontalLine();
	      },'addHorizontalLine' , true);
  	});
}


function aceInitialized(hook,context){
	var editorInfo = context.editorInfo;
	editorInfo.ace_addHorizontalLine = _(addHorizontalLine).bind(context);
}


function addHorizontalLine(){
	var rep = this.rep;
	var documentAttributeManager = this.documentAttributeManager;

	if(rep.selStart){
		var line = rep.selStart[0];
		documentAttributeManager.setAttributeOnLine(line,'hrline','hr');
	}
}

function aceAttribsToClasses(hook,context){
	if(context.key == "hrline"){
		return ['hrline:hr'];
	}
}

function aceRegisterBlockElements(){
	return ["hr"];
}


function aceEditorCSS(){
  return cssFiles;
}





//hooks
exports.aceEditorCSS = aceEditorCSS;
exports.aceDomLineProcessLineAttributes = aceDomLineProcessLineAttributes;
exports.postAceInit = postAceInit;
exports.aceInitialized = aceInitialized;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceRegisterBlockElements = aceRegisterBlockElements;