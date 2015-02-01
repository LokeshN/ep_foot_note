describe("Horizontalline", function(){
  //create a new pad before each test run
  beforeEach(function(cb){
    helper.newPad(cb);
    this.timeout(60000);
  });



  it("Add horizontal line", function(done) {
	//debugger;
    var inner$ = helper.padInner$;
    var chrome$ = helper.padChrome$;

    //get the first text element out of the inner iframe
    var $firstTextElement = inner$("div").first();

    //press enter
    $firstTextElement.sendkeys('{enter}');
	//$firstTextElement.sendkeys('{enter}');

	$firstTextElement = inner$("div").first();
	$firstTextElement.sendkeys('{selectall}');

    //get the hr button and click it
    var $hrButton = chrome$("#hrline-button");
    $hrButton.click();

	//check hr is present
 	var $hrDomElement = inner$("div:nth-child(1)");
	var ishrPresent = $hrDomElement.find("hr").length == 1;
	expect(ishrPresent).to.be(true);
	done();

  });



});
