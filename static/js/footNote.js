var _, $;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');



var cssFiles = ['ep_foot_note/static/css/styles.css'];


function aceDomLineProcessLineAttributes(name,context){
	var cls = context.cls;
	var domLine  = context.domline;
	var footnote = /(?:^| )footnote:([A-Za-z0-9]*)/.exec(cls);
	var isPresent;

	if (footnote){
		isPresent = (footnote[1] == 'fn');
	}

	if (isPresent){

		var modifier = {
		  preHtml: '',
		  postHtml: '',
		  processedMarker: true
		};
		return [modifier];
   }

   return [];
}


function postAceInit(hook,context){
	var hs = $('#fnline-button');
	hs.on('click', function(){
	     context.ace.callWithAce(function(ace){
			        ace.ace_addFootNote();
	      },'addFootNote' , true);
  	});
}


function aceInitialized(hook,context){
	var editorInfo = context.editorInfo;
	editorInfo.ace_addHorizontalLine = _(addHorizontalLine).bind(context);
}


function addFootNote(){
	var rep = this.rep;
	var documentAttributeManager = this.documentAttributeManager;

	if(rep.selStart){
		var line = rep.selStart[0];
		documentAttributeManager.setAttributeOnLine(line,'footnote','fn');
	}
}

function aceAttribsToClasses(hook,context){
	if(context.key == "footnote"){
		return ['footnote:fn'];
	}
}

function aceRegisterBlockElements(){
	return [];
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