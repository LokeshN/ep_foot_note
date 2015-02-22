describe("Footnote", function(){
  //create a new pad before each test run
  beforeEach(function(cb){
    helper.newPad(cb);
    this.timeout(60000);
  });



  it("Add footnote", function(done) {
	debugger;
    var inner$ = helper.padInner$;
    var chrome$ = helper.padChrome$;
    var outer$  = helper.padOuter$;

    //get the first text element out of the inner iframe
    var $firstTextElement = inner$("div").first();

    //press enter
    $firstTextElement.sendkeys('{enter}');
	//$firstTextElement.sendkeys('{enter}');

	$firstTextElement = inner$("div").first();
	$firstTextElement.sendkeys('{selectall}');

    //get the FN button and click it
    var $fnButton = chrome$("#footnote-button");
    $fnButton.click();

	outer$("#fnInput").val("Sample Footnote");
	var $addButton = outer$("#fnAdd");
	$addButton.click();

	//check fn is present
 	var $fnDomElement = inner$("div:nth-child(2)");
	var isfnPresent = $fnDomElement.find("sup").length == 1;
	expect(isfnPresent).to.be(true);
	done();

  });



});
