var _, $;

var $ = require('ep_etherpad-lite/static/js/rjquery').$;
var _ = require('ep_etherpad-lite/static/js/underscore');

var cssFiles = ['ep_foot_note/static/css/styles.css'];


function aceCreateDomLine(name, context){
  //debugger;
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

function aceDomLineProcessLineAttributes (name, context) {
	var cls = context.cls;


	if(cls && cls.indexOf('fnEnd') > -1) {
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
	var hs = $('#footnote-button');
    hs.on('click', function(){
	     fnPopupManager.showPopup(context);

  	});
}


function aceInitialized(hook,context){
	var editorInfo = context.editorInfo;
	editorInfo.ace_addFootNote = _(addFootNote).bind(context);
	fixLineOrder = _(fixLineOrder).bind(context);
}


var fixLineOrder = function () {
	var rep = this.rep;
	var editorInfo = this.editorInfo;
        var documentAttributeManager = this.documentAttributeManager;
	var html = this.editorInfo.ace_getFormattedCode();

	var supItems = [];
	var sIds = [];
	var endItems = [];
	var eIds = [];
	var endItemIndex = null;

	// To fix numbering and order
	$(html).find('div').each(function (lineIndex, line) {
	   var lineText = $(line).text();
	   var curPos = 0;
	   var textItems =	 $(line).children().map(function (ik, item) {
		   var itemText = $(item).text();
		   if ($(item).hasClass('fnContent')) {
			   var itemId = /fnItem-[0-9]*/gi.exec($(item).attr('class'));

			   supItems.push({
				   lineIndex: lineIndex,
				   start: curPos,
				   end: (curPos + itemText.length),
				   text: itemText,
				   id: itemId[0]
			   });
			   sIds.push(itemId[0]);
		   }

		   if ($(item).hasClass('fnEnd')) {
			   var itemId = /fnItem-[0-9]*/gi.exec($(item).attr('class'));

			   if (!endItemIndex) {
				   endItemIndex = lineIndex;
			   }
			   endItems.push({
				   id: itemId[0],
				   lineText: lineText
			   });
			   eIds.push(itemId[0]);
		   }

		   curPos += itemText.length;

		   return itemText
	   });

	});

/* To remove orbs
	var startIds = sIds.filter(function(i) {return eIds.indexOf(i) < 0;});
	var endIds = eIds.filter(function(i) {return sIds.indexOf(i) < 0;});
	var singleIds = startIds.concat(endIds);*/

	var supCount = supItems.length;
	endItemIndex += (supCount -1);
	supItems = supItems.reverse();
	$.each(supItems, function (key, item){
	   editorInfo.ace_performSelectionChange([item.lineIndex, item.start],[item.lineIndex,item.end]);
	   editorInfo.ace_replaceRange([item.lineIndex, item.start], [item.lineIndex,item.end], supCount+'');
	   rep.selStart = [item.lineIndex, item.start];
	   rep.selEnd = [item.lineIndex,item.end];
	   if ((item.end - item.start) !== (supCount+'').length) {
		editorInfo.ace_performSelectionChange([item.lineIndex, item.start],[item.lineIndex, (item.start + (supCount+'').length)]);
	    rep.selEnd = [item.lineIndex, (item.start + (supCount+'').length)];
	   }
	   editorInfo.ace_setAttributeOnSelection("fnss", true);
	   editorInfo.ace_setAttributeOnSelection(item.id, true);
	   editorInfo.ace_setAttributeOnSelection("fnContent", true);


	   var endItem = endItems.find(function (eItem) {
		   return eItem.id === item.id;
	   });

	   var endLineText = rep.lines.atIndex(endItemIndex).text;
	   editorInfo.ace_performSelectionChange([endItemIndex, 0],[endItemIndex, endLineText.length]);
	   editorInfo.ace_replaceRange([endItemIndex, 0],[endItemIndex, endLineText.length], supCount + ' ' + endItem.lineText.substr(endItem.lineText.split(' ')[0].length));
	   rep.selStart = [endItemIndex, 0];
	   rep.selEnd = [endItemIndex, (supCount+'').length];

	   editorInfo.ace_setAttributeOnSelection("fnss", true);
	   editorInfo.ace_setAttributeOnSelection(endItem.id, true);
	   editorInfo.ace_setAttributeOnSelection("fnEnd", true);
	   documentAttributeManager.setAttributeOnLine(endItemIndex, 'fnEndLine', true);
	   endItemIndex--;
	   supCount--;
	});

};
/*
 * Method which adds the superscript next to the cursor and also adds the footnote to the bottom of the page
 */
function addFootNote(footNoteText){
	var rep = this.rep;
	var documentAttributeManager = this.documentAttributeManager;
	var timestamp = Date.now();
	var padInner = $('iframe[name="ace_outer"]').contents().find('iframe[name="ace_inner"]').contents();
	var editorInfo = this.editorInfo;
	 //find the foot note counter...
	 var footNoteCounter = 1;
	 //find the last line and add the superscript and the text...
	 var lastLineNo = this.rep.lines.length() - 1;
	 var fnssPresent =  this.documentAttributeManager.getAttributeOnLine(lastLineNo, "fnEndLine");
	 if(fnssPresent){
		var textItem = this.rep.lines.atIndex(lastLineNo).text.split(" ")[0];
		if (textItem[0] === '*'){
			textItem = textItem.substr(1);
		}

		footNoteCounter = parseInt(textItem);
		if(!isNaN(footNoteCounter))
			footNoteCounter++;
	 }

	//set the superscript after the selection
	var start = rep.selStart;
	var initialEnd = [rep.selEnd[0], (rep.selEnd[1]+footNoteCounter.toString().length + 1)];
	var end = rep.selEnd;
	this.editorInfo.ace_replaceRange(end,end,footNoteCounter+'');
	this.rep.selStart = end;
	this.rep.selEnd = [end[0],end[1]+(footNoteCounter+'').length];
	this.editorInfo.ace_setAttributeOnSelection("fnss", true);
	this.editorInfo.ace_setAttributeOnSelection("fnItem-"+timestamp, true);
	this.editorInfo.ace_setAttributeOnSelection("fnContent", true);

	//Add the foot note to the end of the page
	var len = this.rep.lines.atIndex(lastLineNo).text.length;
	if(len > 0){//means there is some text there.... so press enter and add the foot note
		this.editorInfo.ace_performSelectionChange([lastLineNo,len], [lastLineNo,len]);
		this.editorInfo.ace_doReturnKey();
		//increment the last line index , since Enter key is pressed..
		lastLineNo++;
		//get lenth again
		len = this.rep.lines.atIndex(lastLineNo).text.length;
	}

	this.editorInfo.ace_replaceRange([lastLineNo,0],[lastLineNo,len],footNoteCounter+ ' ' +footNoteText);
	this.rep.selStart = [lastLineNo,0];
	this.rep.selEnd = [lastLineNo,(footNoteCounter+'').length];

	this.editorInfo.ace_setAttributeOnSelection("fnss", true);
	this.editorInfo.ace_setAttributeOnSelection("fnItem-"+timestamp, true);
	this.editorInfo.ace_setAttributeOnSelection("fnEnd", true);
	this.documentAttributeManager.setAttributeOnLine(lastLineNo, 'fnEndLine', true);
	fixLineOrder();
	this.editorInfo.ace_performSelectionChange(initialEnd, initialEnd);

	this.editorInfo.ace_focus();
}

function aceAttribsToClasses(hook,context){
	var attribClasses = [];
	if(context.key == "fnss"){
		attribClasses.push('fnss');
	}
	if(/(?:^| )(fnItem-[0-9]*)/.exec(context.key)){
		attribClasses.push(context.key);
	}
	if (context.key === "fnContent" || context.key === "fnEnd") {
		attribClasses.push(context.key);
	}
	if (context.key === "fnEndLine") {
		attribClasses.push(context.key);
	}

	return attribClasses;
}

function aceRegisterBlockElements(){
	return (['fn', 'fnss', 'sup']);
}


function aceEditorCSS(){
  return cssFiles;
}

var postToolbarInit = function (hookName, context) {
    var editbar = context.toolbar;

    editbar.registerCommand('addFootNote', function () {
		fnPopupManager.showPopup(context);
    });
}

/**
 * Popup manager object which creates the popup to get the footnote text
 * Also calls the addfootnote method from footnote context
*/

var fnPopupManager = (function FootNotePopupManager(){

	return {
		container:null,

		insertPopupContainer:function(){
			var cancelText = html10n.get('ep_foot_note.btn_cancel') || 'Cancel';
			var addText = html10n.get('ep_foot_note.btn_submit') || 'Submit';
			var inputtext = html10n.get('ep_foot_note.input_placeholder') || 'Add your footnote here…';
			 $('iframe[name="ace_outer"]').contents().find("#outerdocbody").prepend('<div id="footNotePopup" class="fn-popup popup popup-content" style="display: block;"><div id="footNotePopupHeader"><h2 data-l10n-id="ep_foot_note.title">Add a footnote</h2><div id="footNotePopupDescription"><span data-l10n-id="ep_foot_note.description">Footnotes can include anything from a citation to parenthetical information, outside sources, copyright permissions, background information. The selected text will receive a number which will refer to the explanation on the bottom of the topic.</span></div></div><div><input id="fnInput" type="text" placeholder="'+inputtext+'"/></div><div id="footNotePopupFooter"><input type="button" class="btn btn-primary" id="fnAdd" value="'+addText+'"/><input type="button" class="btn" value="'+cancelText+'" id="fnCancel"/></div></div>');
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
			this.container.addClass('popup-show');
			this.container.show();
			this.setFootNoteContext(footNoteContext);
			setTimeout(function () {
				$('iframe[name="ace_outer"]').contents().find('#fnInput').focus();
			});
		},

		addEventListener:function(){

			var doInsertFootNote = function () {
				var footNoteText = $('iframe[name="ace_outer"]').contents().find('#fnInput').val();
				var container = $('iframe[name="ace_outer"]').contents().find('#footNotePopup');//this.padOuter.find('#footNotePopup');
				container.removeClass('popup-show');
				container.hide();

				if(footNoteText == "")return;

				fnPopupManager.getFootNoteContext().ace.callWithAce(function(ace){
								ace.ace_addFootNote(footNoteText);
								$('iframe[name="ace_outer"]').contents().find('#fnInput').val("")
						},'addFootNote' , true);

			}

			$('iframe[name="ace_outer"]').contents().find('#fnInput').focus();
			//add on click event listener..
			$('iframe[name="ace_outer"]').contents().find('#fnInput').on('keyup', function (e) {
				console.log(e);
				if (e.keyCode === 13) {
					doInsertFootNote();
				}
			})
			this.container.find('#fnAdd').on('click', doInsertFootNote);
			//cancel click event listener
			this.container.find('#fnCancel').on('click',function(){
				 //this.footNoteText = $("#fnInput").text();
				 $('iframe[name="ace_outer"]').contents().find('#fnInput').val("")
				 var container = $('iframe[name="ace_outer"]').contents().find('#footNotePopup');//this.padOuter.find('#footNotePopup');
				 container.removeClass('popup-show');
				 container.hide();
			    //var form = $(this).parent().parent();
			    //$('iframe[name="ace_outer"]').contents().find('#comments').find('#newComment').addClass("hidden").removeClass("visible");

  			});
		}



	}

})();

exports.aceAttribClasses = function(hook, attr){
	attr.fn = 'tag:sup';
	attr.fnss = 'tag:sup';
	attr.sup = 'tag:sup';

	return attr;
}

exports.aceEditEvent = function (hook, context) {
	if (context.callstack.type !== 'setup' && context.callstack.docTextChanged && !context.callstack.type !== 'handleKeyEvent') {
		var rep = context.rep;
		var editorInfo = context.editorInfo;
		var startLine = rep.selStart[0];
		var startPos = rep.selStart[1];
		var attribs = context.documentAttributeManager.getAttributesOnPosition(startLine, startPos-1);

		var itemId;
		var isContentElem = false;
		attribs.forEach(function (elem) {
			var attrName = elem[0];
			if (attrName === 'fnContent') {
				isContentElem = true;
			} else if (attrName.indexOf("fnItem") > -1) {
				console.log('attrName', attrName);
				itemId = attrName;
			}
		});

		if (isContentElem) {
			editorInfo.ace_performSelectionChange([startLine, startPos-1], rep.selEnd);
			editorInfo.ace_setAttributeOnSelection('fnss', false);
			editorInfo.ace_setAttributeOnSelection('fnContent', false);
			editorInfo.ace_setAttributeOnSelection(itemId, false);
			editorInfo.ace_performSelectionChange([startLine, startPos], [startLine, startPos]);
		}
	}
	if (context.callstack.type === 'addFootNote') {
		var repEnd = [context.rep.selEnd[0], context.rep.selEnd[1]];
		console.log(repEnd);
		console.log(context);
		context.editorInfo.ace_performSelectionChange(repEnd, repEnd);
		context.editorInfo.ace_focus();
	}
}

//hooks
exports.aceEditorCSS = aceEditorCSS;
exports.aceCreateDomLine = aceCreateDomLine;
exports.postAceInit = postAceInit;
exports.aceInitialized = aceInitialized;
exports.aceAttribsToClasses = aceAttribsToClasses;
exports.aceRegisterBlockElements = aceRegisterBlockElements;
exports.postToolbarInit = postToolbarInit;
exports.aceDomLineProcessLineAttributes = aceDomLineProcessLineAttributes;
