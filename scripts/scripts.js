window.onload = function() {

// button animations
var hoverAnimationDuration = 100
$(".topbar-option").hover(function(event) {
	$(this).animate({
		"background-color": "rgba(255, 255, 255, .2)",
		"box-shadow": "0px 0px 1px black",
		"color": "rgba(0, 231, 255, .5)",
		"font-size":"17px"
	}, hoverAnimationDuration)},
function(event) {
	$(this).animate({
		"background-color":" rgba(255, 255, 255, .2)",
		"box-shadow": "0px 0px 5px black",
		"color": "rgba(0, 0, 0, .5)",
		"font-size":"18px"
	}, hoverAnimationDuration)
});

// create the screen for the panels
var mobiScreen = $(".screen")

// get panel template html
var panels = $.ajax({
	type: "GET",
	url: '/static/panelsHTML',
	async: false
}).responseText;

// define Panel "object" creator
function Panel(sel) {
	d = $($.parseHTML(panels))
	return makePanel(d.filter('#' + sel)[0])
}

var entryAnimationDuration = 300
var openPanel = null;

function makePanel(html) {
	var $this = $(html);

	// define panel data
	$.data($this, 'closed-css', {
		top: $this.css('top'),
		left: $this.css('left'),
		width: $this.css('width'),
		height: $this.css('height'),
	});

	// define panel methods
	$this.getClosedCSS = function() {
		return $.data(this, 'closed-css')
	}
	
	$this.open = function() {
		if (openPanel) {
			openPanel.close()
		}
		openPanel = $this
		$('.panel').promise().done(function() {
			$this.animate({
				"top": "0px",
				"left": "0px",
				"width": "100%",
			}, entryAnimationDuration, function() {
				$this.animate({
					'height': '100%'
				}, entryAnimationDuration, function() {

				})
			});			
		})
	}

	$this.close = function() {
		c = $.data($this, 'closed-css')
		$this.animate({
			'height': c.height
		}, entryAnimationDuration, function() {
			$this.animate({
				"top": c.top,
				"left": c.left,
				"width": c.width,
			}, entryAnimationDuration, function() {

			})
		});

	}

	return $this
}

// Create default panels
loginPanel = Panel('login')
loginForm = $('form', loginPanel)
loginForm.submit(function(event) {
	var $form = $(this)
	var $inputs = $form.find('input')
	var serializedData = $form.serialize();
	$inputs.prop("disabled", true);
	request = $.ajax({
		url: "/control/login",
		type: "post",
		data: serializedData
	});
	request.done(function (response, textStatus, jqXHR){
		console.log(response);
		if (response == 'Success') {
			$('.error', $form).html("")
			window.location.hash = '#!mylog'

		} else {
			$('span.error', $form).html("<div class=\"error\">Username or password is invalid.</div>")
		}
	});
	request.fail(function (jqXHR, textStatus, errorThrown){
		console.log("Server error.");
	});
	request.always(function () {
		$inputs.prop("disabled", false);
	});
	event.preventDefault();
})
console.log(loginForm)
browsePanel = Panel('browse')


// Update on hashchange
$(window).on('hashchange',function(){ 
	hashChanged()
});

function hashChanged() {
	hash = window.location.hash
	hash = hash.split("!")[1]
	hashlist = hash.split('/')
	if (/^login$/.test(hashlist[0])) {
		loginPanel.open()
	}
	if (/^browse$/.test(hashlist[0])) {
		browsePanel.open()
	}
	if (/^mylog$/.test(hashlist[0])) {
		browsePanel.open()
	}
}

// on load
$(function() {
	// append default panels
	mobiScreen.append(loginPanel)
	mobiScreen.append(browsePanel)
	hashChanged()
})

}
