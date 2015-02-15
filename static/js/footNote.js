var _, $;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');



var cssFiles = ['ep_foot_note/static/css/styles.css'];



/*function aceDomLineProcessLineAttributes(name,context){
	debugger;
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
}*/

function aceCreateDomLine(name, context){
  debugger;
  var cls = context.cls;
  var domline = context.domline;
  var footnote = /(?:^| )fnss:([A-Za-z0-9]*)/.exec(cls);
  var isPresent;

 	if (footnote){
 		isPresent = (footnote[1] == 'fn');
	}

  if (isPresent){
    var modifier = {
      extraOpenTags: '<sup>',
      extraCloseTags: '</sup>',
      cls: cls
    };
    return [modifier];
  }
  return [];
}


var contxt = null;
//var buttonPressed = false;
function postAceInit(hook,context){
	var hs = $('#footnote-button');
    //var _this = this;
	hs.on('click', function(){
	     //buttonPressed = true;
	     debugger;
		 contxt = context;
		fnPopupManager.showPopup(contxt);
		 
  	});
}


function callAddFootNote(footNoteText){
	contxt.ace.callWithAce(function(ace){
								ace.ace_addFootNote(footNoteText);
						},'addFootNote' , true);
}


function aceInitialized(hook,context){
	var editorInfo = context.editorInfo;
	editorInfo.ace_addFootNote = _(addFootNote).bind(context);
}


function addFootNote(footNoteText){

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

	 debugger;


	 //find the foot note counter...
	 var footNoteCounter = 1;
	 //find the last line and add the superscript and the text...
	 var lastLineNo = this.rep.lines.length() - 1;
	 var fnssPresent =  this.documentAttributeManager.getAttributeOnLine(lastLineNo-1, "fnss");
	 if(fnssPresent){
		footNoteCounter = parseInt(this.rep.lines.atIndex(lastLineNo-1).text.split(" ")[0]);
		if(!isNaN(footNoteCounter))
			footNoteCounter++;
	 }

	//set the superscript after the selection
	var start = rep.selStart;
	var end = rep.selEnd;
	this.editorInfo.ace_replaceRange(end,end,footNoteCounter+'');
	this.rep.selStart = end;
	this.rep.selEnd = [end[0],end[1]+(footNoteCounter+'').length];
    this.editorInfo.ace_setAttributeOnSelection("fnss","fn");

	 //Add the foot note to the end of the page
	 var len = this.rep.lines.atIndex(lastLineNo).text.length;
	 if(len > 0){//means there is some text there.... so press enter and add the foot note
		this.editorInfo.ace_doReturnKey();
		//increment the last line index , since Enter key is pressed..
		lastLineNo++;
	 }

	 //TODO: Have a popup to get the foot note from the user
	 //this.documentAttributeManager.setAttributeOnLine(lastLineNo,'fnsuperscript','fn');
	 //this.editorInfo.ace_performDocumentReplaceRange([lastLineNo,0],[lastLineNo,len],footNoteCounter + ' Sample Footnote');
	 this.editorInfo.ace_replaceRange([lastLineNo,0],[lastLineNo,len],footNoteCounter + ' '+footNoteText);
	 this.rep.selStart = [lastLineNo,0];
	 this.rep.selEnd = [lastLineNo,(footNoteCounter+'').length];
	 //sample setting atttribute
	 //this.documentAttributeManager.setAttributeOnLine(lastLineNo,'fnsuperscript','fn');
	 this.editorInfo.ace_setAttributeOnSelection("fnss","fn");
	 //footNoteCounter++;
	 //this.documentAttributeManager.setAttributeOnLine(8,'hrline','hr')

}

function aceAttribsToClasses(hook,context){
	if(context.key == "fnss"){
		return ['fnss:fn'];
	}
}

function aceRegisterBlockElements(){
	return [];
}


function aceEditorCSS(){
  return cssFiles;
}




var fnPopupManager = (function FootNotePopupManager(){

	return {
		container:null,

		insertPopupContainer:function(){
			 $('iframe[name="ace_outer"]').contents().find("#outerdocbody").prepend('<div id="footNotePopup" class="fn-popup" style="display: block;"><div><input id="fnInput" type="text"/></div> <div style="padding-top:10px"><input type="button" id="fnAdd" value="Add"/><input style="margin-left:10px" type="button" value="Cancel" id="fnCancel"/></div></div>');
  			 this.container = $('iframe[name="ace_outer"]').contents().find('#footNotePopup');//this.padOuter.find('#footNotePopup');
			 this.addEventListener();
		},
		
		getFootNoteContext:function(){
			return this.footNoteContext;
		},
		
		setFootNoteContext:function(footNoteContext){
			this.footNoteContext = footNoteContext;
		},
		
		showPopup:function(footNoteContext){
			//$("#footNotePopup").show();
			if(this.container == null)
				this.insertPopupContainer();
			this.container.show();
			this.setFootNoteContext(footNoteContext);
		},

		addEventListener:function(){
		
		  
			//add on click event listener..
			 this.container.find('#fnAdd').on('click',function(){
				 var footNoteText = $('iframe[name="ace_outer"]').contents().find('#fnInput').val();
				 var container = $('iframe[name="ace_outer"]').contents().find('#footNotePopup');//this.padOuter.find('#footNotePopup');
				 container.hide();
				 
				 if(footNoteText == "")return;
				 
				 fnPopupManager.getFootNoteContext().ace.callWithAce(function(ace){
								ace.ace_addFootNote(footNoteText);
						},'addFootNote' , true);
				 
				// fnPopupManager.getFootNoteContext().callAddFootNote(this.footNoteText);
			    //var form = $(this).parent().parent();
			    //$('iframe[name="ace_outer"]').contents().find('#comments').find('#newComment').addClass("hidden").removeClass("visible");

  			});
			//cancel click event listener
			this.container.find('#fnCancel').on('click',function(){
				 //this.footNoteText = $("#fnInput").text();
				 var container = $('iframe[name="ace_outer"]').contents().find('#footNotePopup');//this.padOuter.find('#footNotePopup');
				 container.hide();
			    //var form = $(this).parent().parent();
			    //$('iframe[name="ace_outer"]').contents().find('#comments').find('#newComment').addClass("hidden").removeClass("visible");

  			});
		}



	}

})();




//hooks
exports.aceEditorCSS = aceEditorCSS;
exports.aceCreateDomLine = aceCreateDomLine;
exports.postAceInit = postAceInit;
exports.aceInitialized = aceInitialized;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceRegisterBlockElements = aceRegisterBlockElements;