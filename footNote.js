var eejs = require('ep_etherpad-lite/node/eejs/');
var ChangeSet = require("ep_etherpad-lite/static/js/Changeset");

function eejsBlock_editbarMenuLeft(hook_name,args,cb){
	args.content += eejs.require('ep_foot_note/templates/fnButton.ejs');
	return cb();

}

function getLineHTMLForExport(hook,context){
	var fn = checkFootNoteInLine(context.attribLine,context.apool);
	if(fn){
		return '';
	}
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


exports.eejsBlock_editbarMenuLeft = eejsBlock_editbarMenuLeft;
exports.getLineHTMLForExport = getLineHTMLForExport;
exports.eejsBlock_styles = eejsBlock_styles;
