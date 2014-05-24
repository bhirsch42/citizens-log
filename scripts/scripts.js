window.onload = function() {
var entriesLength = parseInt($("#entries-length").attr("value"))

// save initial css of all entries
$(function() {
	$(".entry").each(function() {
		var $this = $(this);
		$.data(this, 'css', {
			top: $this.css('top'),
			left: $this.css('left'),
			width: $this.css('width'),
			height: $this.css('height'),
			overflow: $this.css('overflow')
		});
	});
});

// $.getScript("scripts/markdown.min.js", function() {
// 	$(function() {
// 		$(".entry-content").each(function() {
// 			var markup = $(this).text()
// 			var converted = markdown.toHTML(markup)
// 			$(this).html(converted)
// 		})
// 	})

// });

$("#markdown").on('input propertychange paste', function(event) {
	var markup = $(this).val()
	var converted = markdown.toHTML(markup)
	// console.log(converted)
	$("#markdown-converted").html(converted)
})

var entryMenuDist = 15
var entryAnimationDuration = 300

function openEntry(id) {
	selectEntry(id) 
	openMoveEntryWrapper(id)
	$( ":selected" ).promise().done(function() {
		expandEntryWrapper(id)
		expandEntryTitle(id)
		expandEntryContent(id)
	});
}

function openMoveEntryWrapper(id) {
	$("#" + id + ".entry-wrapper").animate({
		"top": "0px",
		"left": "0px",
		"width": "100%",
	}, entryAnimationDuration);

	$("#" + id + ".entry-title").animate({
		'background-color': 'rgba(0, 231, 255, 0.6)'
	}, entryAnimationDuration)
}

function expandEntryWrapper(id) {
	$("#" + id + ".entry-wrapper").animate({
		// "top": "50px",
		// "left": "200px",
		// "width": "500px",
		// "bottom":"0"
		"height": "100%"
	}, entryAnimationDuration);
}

function expandEntryTitle(id) {
	// Entry title
	$("#" + id + ".entry-title").animate({
		"width": "100%"
	});
}

function expandEntryContent(id) {
	// Entry content
	$("#" + id + ".entry-content").animate({
		height: "100%",
	}, function() {
		$(this).css({"overflow":"scroll"})
	}).addClass("selected");
}

function selectEntry(id) {
	$("#" + id + ".entry-content").addClass("selected")
	$("#" + id + ".entry-wrapper").addClass("selected")
	$("#" + id + ".entry-title").addClass("selected")
}

function closeEntry(id) {
	closeEntryWrapper(id)
	$(".entry-wrapper").promise().done(function() {
		closeMoveEntryWrapper(id)
	});
}

function closeMoveEntryWrapper(id) {
	$("#" + id + ".entry-wrapper").each(function() {
		var orig = $.data(this, 'css')	
		$(this).animate({
			"top": parseInt(orig.top.split("px")[0])+lastTrans,
			"left": orig.left,
			"width": orig.width,
			// "height": orig.height,
		}, entryAnimationDuration)
	});
	$("#" + id + ".entry-title").each(function() {
		var orig = $.data(this, 'css')	
		$(this).animate({
		'background-color': 'rgba(0, 231, 255, 0.2)'
		}, entryAnimationDuration)
	});
}

function closeEntryWrapper(id) {
	$("#" + id + ".entry-wrapper").each(function() {
		var orig = $.data(this, 'css')	
		$(this).animate({
			// "top": orig.top,
			// "left": orig.left,
			// "width": orig.width,
			"height": orig.height,
		}, entryAnimationDuration)
	});
}

function closeEntryTitle(id) {
	$("#" + id + ".entry-title").each(function() {
		var orig = $.data(this, 'css')	
		$(this).animate({
			"top": orig.top,
			"left": orig.left,
			"width": orig.width,
			"height": orig.height,
		}, entryAnimationDuration)
	});
}

function closeEntryContent() {
	$(".selected.entry-content").each(function() {
		var orig = $.data(this, 'css')	
		$(this).animate({
			"top": orig.top,
			"left": orig.left,
			"width": orig.width,
			"height": orig.height,
		}, entryAnimationDuration).css({
			"overflow": orig.overflow
		})
	});
}

function deselectEntry() {
	$(".selected").removeClass("selected")
}

// entry is clicked
// $( ".entry" ).click(function(event) {
// 	// filter out the selected entry
// 	if ($(this).is($(".selected") || $(this).is($(".input")))) {
// 		return
// 	}
// });

hoverAnimationDuration = 100

// entry is hovered
$( ".entry-title" ).hover(function(event) {
	// filter out the selected entry
	if ($(this).is($(".selected"))) {
		return
	}
	$(this).animate({
		"background-color":"rgba(0, 231, 255, 0.6)"
}, hoverAnimationDuration)},
function(event) {
	if ($(this).is($(".selected"))) {
		return
	}
	$(this).animate({
		'background-color': 'rgba(0, 231, 255, 0.2)'
	}, hoverAnimationDuration)

});

// toolbar options are hovered
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

// links are hovered
$("a").hover(function(event) {
	$(this).animate({
		"color": "white",
	}, hoverAnimationDuration)},
function(event) {
	$(this).animate({
		"color": "#00e7ff",
	}, hoverAnimationDuration)
});


// slider

function getSliderOffset(ui) {
	var divHeight = $(".screen").height()
	var neededHeight = entriesLength * 22 // NEED VARIABLES
	var diff = neededHeight - divHeight
	if (diff < 0) {
		diff = 0
	}
	var trans = ui.value * diff
	return trans
}

var lastTrans = 0

function scrollEntries(event, ui) {
	var trans = getSliderOffset(ui)
	lastTrans = trans
	$( ".entry-wrapper" ).each(function(i, obj) {
		if (!$(this).is($(".selected"))) {
			var orig = $.data(obj, 'css');
			$(this).css({
				"top": parseInt(orig.top.split("px")[0])+trans
			});
		}
	});
}

$(function() {
	$( "#slider-vertical" ).slider({
		orientation: "vertical",
		step: 1.0/1000,
		range: "min",
		min: -1.0,
		max: 0.0,
		value: 0,
		slide: scrollEntries
	});
});

// check registration form
$("input#reg-username").keyup(function(event) {
	console.log("WHAT")
	if (!/^[-_0-9a-zA-Z]{3,20}$/.test($(this).val())) {
		$(".username-error").html("Username may only contain numbers, letters, hyphens, and underscores, and must be 3 to 20 characters.")
	} else {
		$(".username-error").html("")
	}
})


function closeSelectedEntry() {
	if ($(".entry-wrapper.selected").length == 0) {
		return
	}
	var id = $(".entry-wrapper.selected").attr("id")
	deselectEntry(id)
	closeEntry(id)
}

function setHash(newhash) {
	newhash = "!" + newhash
	if ("#" + newhash == window.location.hash) {
		return
	}
	window.location.hash = newhash
	hashChanged()
}


// Map urls to screen states with regex

$("a").click(function(event) {
	console.log("Link cliked.")
	event.preventDefault();
	setHash($(this).attr("href").split("#")[1]);
});

$("a").click(function(event) {
	console.log("Link cliked.")
	event.preventDefault();
	setHash($(this).attr("href").split("#")[1]);
});

function hashChanged() {
	hash = window.location.hash
	hash = hash.split("!")[1]
	hashlist = hash.split('/')
	if (/^login$/.test(hashlist[0])) {
		closeSelectedEntry()
		openEntry('login')
		return
	}
	if (/^register$/.test(hashlist[0])) {
		closeSelectedEntry()
		openEntry('register')
		return
	}
	if (/^mylog$/.test(hashlist[0])) {
		closeSelectedEntry()
		if (hashlist[1] == "create-entry") {
			closeSelectedEntry()
			openEntry('create-entry')
		}
		// console.log($.getJSON('/control/getuser'))
		// setHash('user/'+ $.getJSON('/control/getuser').username)
		return
	}
	if (/^user$/.test(hashlist[0])) {
		var username = hashlist[1]
		$.ajax({
			url: '/control/getuser?username=' + username,
			type: 'GET',
		    success: function(data) {console.log(JSON.parse(data).entries)}
		})
		return
	}

	// if (hashlist[0].equals('entry')) {
	// 	var new_id = parseInt(hashlist[1])
	// 	var id = $(".entry-wrapper.selected").attr("id")
	// 	deselectEntry(id)
	// 	closeEntry(id)
	// 	$( ".entry" ).promise().done(function() {
	// 		if ($(".selected").length > 0) {
	// 			return
	// 		}
	// 		openEntry(new_id)
	// 	});
	// }
}

// On load, go to specified URL
$(function() {
	hashChanged()
});


}
