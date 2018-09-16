var eejs = require('ep_etherpad-lite/node/eejs/');
var ChangeSet = require("ep_etherpad-lite/static/js/Changeset");

function eejsBlock_editbarMenuLeft(hook_name,args,cb){
	args.content += eejs.require('ep_foot_note/templates/fnButton.ejs');
	return cb();

}

function getLineHTMLForExport(hook,context){
	var fn = checkFootNoteInLine(context.attribLine,context.apool);

	return true;
}


function checkFootNoteInLine(lineAttrib,pool){
	var fn= null;
	if(lineAttrib){
		var iter = ChangeSet.opIterator(lineAttrib);
		if(iter.hasNext()){

			var op = iter.next();
			fn =  ChangeSet.opAttributeValue(op,'fnss',pool);
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
  }

exports.eejsBlock_editbarMenuLeft = eejsBlock_editbarMenuLeft;
exports.getLineHTMLForExport = getLineHTMLForExport;
exports.eejsBlock_styles = eejsBlock_styles;
exports.aceAttribClasses = aceAttribClasses;
exports.exportHtmlAdditionalTags = exportHtmlAdditionalTags;