var _, $;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');



var cssFiles = ['ep_foot_note/static/css/styles.css'];

var footNoteCounter = 1;

function aceDomLineProcessLineAttributes(name,context){
	var cls = context.cls;
	var domLine  = context.domline;
	var footnote = /(?:^| )fnsuperscript:([A-Za-z0-9]*)/.exec(cls);
	var isPresent;

	if (footnote){
		isPresent = (footnote[1] == 'fn');
	}

	if (isPresent){

		var modifier = {
		  preHtml: '<sup>',
		  postHtml: '</sup>',
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
	editorInfo.ace_addFootNote = _(addFootNote).bind(context);
}


function addFootNote(){
	var rep = this.rep;
	var documentAttributeManager = this.documentAttributeManager;

	/*if(rep.selStart){
		var line = rep.selStart[0];
		documentAttributeManager.setAttributeOnLine(line,'footnote','fn');
	}*/

	//TODO LOKN: find the page break and add the foot note within the page...
	 /*var len = $(this.rep.lines.atIndex(55).lineNode).find(".pageBreakComputed").length;
	 if(len >0 ){
		//line has page break....
	 }*/


	 //find the last line and add the superscript and the text...
	 var lastLineNo = this.rep.lines.length() - 1;
	 var len = this.rep.lines.atIndex(lastLineNo).text.length;
     if(len > 0){//means there is some text there.... so press enter and add the foot note
 	 	this.editorInfo.ace_doReturnKey();
 	 	//increment the last line index , since Enter key is pressed..
	    lastLineNo++;
	 }

	 //TODO: Have a popup to get the foot note from the user
	 this.editorInfo.ace_performDocumentReplaceRange([lastLineNo,0],[lastLineNo,len],footNoteCounter + ' Sample Footnote');
	 this.rep.selStart = [lasLineNo,0];
	 this.rep.selEnd = [lasLineNo,(footNoteCounter+'').length-1];

	 //sample setting atttribute
 	 this.editorInfo.ace_toggleAttributeOnSelection("fnsuperscript");
 	 //this.documentAttributeManager.setAttributeOnLine(8,'hrline','hr')
}

function aceAttribsToClasses(hook,context){
	if(context.key == "fnsuperscript"){
		return ['fnsuperscript:fn'];
	}
}

function aceRegisterBlockElements(){
	return ['sup'];
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