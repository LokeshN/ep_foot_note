var eejs = require('ep_etherpad-lite/node/eejs/');
var ChangeSet = require("ep_etherpad-lite/static/js/Changeset");


function getLineHTMLForExport(hook,context){
	var fn = checkFootNoteInLine(context.attribLine,context.apool);
	context.lineContent = context.lineContent.replace(/<fnss/g, '<sup');
	context.lineContent = context.lineContent.replace(/<\/fnss/g, '</sup');

	if (fn) {
		context.lineContent = '<span class="fnEndLine">' + context.lineContent + '</span>';
	}

	return true;
}


function checkFootNoteInLine(lineAttrib,pool){
	var fn= null;
	if(lineAttrib){
		var iter = ChangeSet.opIterator(lineAttrib);
		if(iter.hasNext()){

			var op = iter.next();
			fn =  ChangeSet.opAttributeValue(op,'fnEndLine',pool);
 		}

	}
	return fn;
}

function eejsBlock_styles (hook_name, args, cb) {
  args.content = args.content + eejs.require("ep_foot_note/templates/styles.html", {}, module);
  return cb();
}

var exportHtmlAdditionalTags = function(hook, pad, cb){
	var tags  = ['fn', 'fnss', 'sup']
	cb(tags);
};

var aceAttribClasses = function(hook_name, attr, cb){
	attr.fnss  = 'tag:sup';
	attr.fn  = 'tag:sup';
	attr.sup = 'tag:sup';
	cb(attr);
};

var padInitToolbar = function (hookName, args) {
	var toolbar = args.toolbar;

	var button = toolbar.button({
		command: 'addFootNote',
		localizationId: 'ep_foot_note.toolbar.add_foot_note.title',
		class: 'buttonicon fnbtn'
	});

	toolbar.registerButton('addFootNote', button);
};

exports.getLineHTMLForExport = getLineHTMLForExport;
exports.eejsBlock_styles = eejsBlock_styles;
exports.aceAttribClasses = aceAttribClasses;
exports.exportHtmlAdditionalTags = exportHtmlAdditionalTags;
exports.padInitToolbar = padInitToolbar;
