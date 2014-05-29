window.onload = function() {
var entriesLength = parseInt($("#entries-length").attr("value"))

// save initial css of all entries
var lastTrans = 0

function saveCSS() {
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
};

// Define function to stop people from leaving pages with entered text
var confirmOnPageExit = function (e) {
	// If we haven't been passed the event get the window.event
	e = e || window.event;
	var message = 'You have unsaved entries that will be lost.  Are you sure you want to leave this page?';
	// For IE6-8 and Firefox prior to version 4
	if (e) 
	{
		e.returnValue = message;
	}
	// For Chrome, Safari, IE8+ and Opera 12+
	return message;
};


function myToHtml(markup) {
	var converted = markdown.toHTML(markup)
	// console.log(converted)
	$(converted).find('a:contains("youtube")').each(function() {
		var ytLink = $(this)[0].outerHTML
		var match = ytLink.match(/watch\?v=([a-zA-Z0-9\-_]+)/);
		if (match) {
			var vidID = match[0].split('watch?v=')[1]
			converted = converted.replace(ytLink, youtubeEmbed(vidID))
		}
	})
	return converted
}

$("textarea#markdown-entry").on('click input propertychange paste', function(event) {
	var markup = $(this).val()
	var converted = myToHtml(markup)
	$("#markdown-entry-converted").html(converted)
})

$("textarea#markdown-help").on('click input propertychange paste', function(event) {
	var markup = $(this).val()
	var converted = myToHtml(markup)
	$("#markdown-help-converted").html(converted)
})

var entryMenuDist = 15
var entryAnimationDuration = 300

function openEntry(id) {
	var title = $(".page-title")
	// if (title.css("opacity") > 0) {
		// $( ".screen" ).promise().done(function() {
	title.animate({opacity: ".1"})
		// })
	// }
	selectEntry(id) 
	openMoveEntryWrapper(id)
	$( ":selected" ).promise().done(function() {
		$("#" + id + ".entry-wrapper").find(".edit").css({visibility: "visible"}).animate({opacity: 100})
		expandEntryWrapper(id)
		expandEntryTitle(id)
		// expandEntryContent(id)
	});
}

function openMoveEntryWrapper(id) {
	$("#" + id + ".entry-wrapper").animate({
		"top": "0px",
		"left": "0px",
		"width": "100%",
	}, entryAnimationDuration, function() {
		$(this).css({overflow: "scroll"})
	});

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

// function expandEntryContent(id) {
	// Entry content
	// $("#" + id + ".entry-content").animate({
	// 	height: "100%",
	// })
	// console.log(id)
	// , function() { console.log("Hi. " + id);
	// 	$(this).css({"overflow":"scroll"})
	// }).addClass("selected");
// }

function selectEntry(id) {
	$("#" + id + ".entry-content").addClass("selected")
	$("#" + id + ".entry-wrapper").addClass("selected")
	$("#" + id + ".entry-title").addClass("selected")
}

function closeEntry(id) {
	closeEntryWrapper(id)
	$(".entry-wrapper").promise().done(function() {
		$("#" + id + ".entry-wrapper").find(".edit").animate({opacity: 0}, function() {$(this).css({visibility: "hidden"})})
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
			scrollTop: 0
			// "height": orig.height,
		}, entryAnimationDuration, function() {
			$(this).css({"overflow": "Hidden"})
		})
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
$( document.body ).on("click", ".entry-title", function(event) {
	// filter out the selected entry
	if ($(this).is($(".selected") || $(this).is($(".input")))) {
		return
	}
	setHash($(this).attr("name"))
});

// My Log button is clicked
$("#mylog").click(function(event) {
	var username = getUsernameFromCookie()
	if (!username) {
		setHash("login")
		return
	}
	setHash('user/' + username)
})

function getUsernameFromCookie() {
	var cookieValue = $.cookie("user_id");
	if (!cookieValue) {
		return null
	}
	var username = cookieValue.split("|")[0]
	return username
}

hoverAnimationDuration = 100

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


// check registration form
$("input.register[name=username]").on("click keyup", function(event) {
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
	// hashChanged()
}

function appendUserLogs(username, hashlist) {
	$.get('/control/getuser?username='+username, function(data) {
		user = JSON.parse(data)
		username = user.username
		// clear the sidebar
		$(".log-entries").html("")
		// set visibility of "create entry" option
		var createEntryVisible = getUsernameFromCookie() == username
		if (createEntryVisible) {
			$("#create-entry").css({
				visibility: "visible",
				top: 0
			})

		} else {
			$("#create-entry").css({visibility: "hidden"})
		}
		// $(".log-entries").html(s)
		// add entries
		for (i = 0; i < user.entries.length; i++) {
			var e = user.entries.length - i - 1
			var $div = $("<div>", {id: "entry-" + e, name: "user/" + username + "/entry-" + e, class: "entry entry-wrapper", style:"top:" + 22*(i+createEntryVisible)+"px"});
			var $title = $("<div>", {id: "entry-" + e, name: "user/" + username + "/entry-" + e, class: "entry entry-title", text: user.entries[e].title})
			var $content = $("<div>", {id: "entry-" + e, name: "user/" + username + "/entry-" + e, class: "entry entry-content"}).html(markdown.toHTML(user.entries[e].content))
			if (username == getUsernameFromCookie()) {
				$title.append("<a class=\"internal edit\" href=\"#!user/" + username + "/entry-" + e + "/edit\">Edit</a>")
			}
			$div.append($title)
			$div.append($content)
			// $a.append($div)
			$(".log-entries").append($div)
		}
		// openEntry(hashlist[2])
		// save their CSS for animations
		saveCSS()
		// bind animation methods
		$(".entry-title").hover(function(event) {
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

		// bind scrolling behavior
		function scrollEntries(event, ui) {
			var trans = getSliderOffset(ui)
			lastTrans = trans
			$(".sidebar").find(".entry-wrapper").each(function(i, obj) {
				if (!$(this).is($(".selected"))) {
					var orig = $.data(obj, 'css');
					$(this).css({
						"top": parseInt(orig.top.split("px")[0])+trans
					});
				}
			});
		}

		lastTrans = 0;
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

		function getSliderOffset(ui) {
			var divHeight = $(".screen").height()
			var neededHeight = (user.entries.length + createEntryVisible) * 22 // NEED VARIABLES
			var diff = neededHeight - divHeight
			if (diff < 0) {
				diff = 0
			}
			var trans = ui.value * diff
			return trans
		}

		// bind link hover behavior
		$("a").hover(function(event) {
			$(this).animate({
				"color": "white",
			}, hoverAnimationDuration)},
		function(event) {
			$(this).animate({
				"color": "#00e7ff",
			}, hoverAnimationDuration)
		});

		// bind image hover behavior
		$("img").hover(function(event) {
			$(this).animate({
				"opacity": "1",
			}, hoverAnimationDuration)},
		function(event) {
			$(this).animate({
				"opacity": ".8",
			}, hoverAnimationDuration)
		});


	})
}

// Map urls to screen states with regex

$("a.internal").click(function(event) {
	event.preventDefault();
	setHash($(this).attr("href").split("#")[1]);
});

var lastUser = null

function hashChanged() {
	hash = window.location.hash
	hash = hash.split("!")[1]
	if (!hash) {
		openEntry('browse-logs')
		return
	}
	hashlist = hash.split('/')
	if (/^login$/.test(hashlist[0])) {
		closeSelectedEntry()
		$( ".entry" ).promise().done(function() {		
			openEntry('login')
		})
	}

	if (/^register$/.test(hashlist[0])) {
		closeSelectedEntry()
		$( ".entry" ).promise().done(function() {		
			openEntry('register')
		})
	}

	if (/^user$/.test(hashlist[0])) {
		if (hashlist.length > 1) {
			var username = hashlist[1]
			
			// manage entries
			closeSelectedEntry()
			if ($(".selected").length > 0) {
				return
			}
			$(".page-title").animate({opacity: "1"})
			$( ".entry" ).promise().done(function() {
				// if the user in the hash has changed, reload the logs and modify the page title
				if (username != lastUser) {
					$(".screen").animate({"left":"-50"}, function() {
						appendUserLogs(username, hashlist)
						lastUser = username
						$(".screen").animate({"left":"150"})
					})
					// modify content of page title
					$.get('/control/getuser?username='+username, function(data) {
						user = JSON.parse(data)
						$(".page-title").animate({opacity: "0"})
						$(".page-title").promise().done(function() {
							$(".page-title").html(user.pageName)
							$(".page-title").animate({opacity: "1"})
						})
					})
				}
				if (hashlist.length > 2) {
					$( ".screen" ).promise().done(function() {
						openEntry(hashlist[2])
					})
					// edit entry
					if (hashlist.length > 3 && hashlist[3] == 'edit') {
						entry = $("#" + hashlist[2] + ".entry-wrapper")
						var contentDiv = entry.find(".entry-content")
						contentDiv.animate({opacity: 0}, function() {
							$.get("/control/getuser?=" + hashlist[1], function(data) {
								var markdownContent = JSON.parse(data).entries[parseInt(hashlist[2].split("-")[1])].content
								var entryID = hashlist[2]
								var s = "<div class=\"entry entry-content\"><table class=\"markdown\"><tr><td class=\"markdown\"><form method=\"POST\"><input name=\"form-type\" type=\"hidden\" value=\"edit\"><input name=\"entry-id\" type=\"hidden\" value=\"" + entryID + "\"><br>This editor uses <a href=\"http://daringfireball.net/projects/markdown/basics\" target=\"_blank\">Markdown</a>.  Click for details about formatting with Markdown.<textarea class=\"markdown\" id=\"markdown\" name=\"markdown\" rows=\"10\" required=\"required\">" + markdownContent + "</textarea><input type=\"submit\"/ class=\"submit\"><br><!-- <span class=\"delete\">Delete</span> --></form></td><td class=\"markdown\"><span class=\"markdown\" id=\"markdown-converted\"></span></td></tr></table></div>"
								contentDiv.html(s)
								contentDiv.animate({opacity: 100})
								// bind markdown behavior
								contentDiv.find("#markdown").on('input propertychange paste click', function(event) {
									var markup = $(this).val()
									var converted = markdown.toHTML(markup)
									contentDiv.find("#markdown-converted").html(converted)
								})
								// bind delete button behavior
								// deleteButton = $(".delete")
								// deleteButton.hover(function() {
								// 	$(this).animate({
								// 		"color": "white",
								// 		"background-color": "rgba(255,0,0,1)"
								// 	}, hoverAnimationDuration)
								// }, function() {
								// 	$(this).animate({
								// 		"color": "red",
								// 		"background-color": "rgba(0,231,255,.2)"
								// 	}, hoverAnimationDuration)
								// })
								// deleteButton.click(function() {
								// 	if (window.confirm("Are you sure you want to delete this entry?")) {
								// 		$.post("/control/deleteentry")
								// 	}
								// })
							})
						})
					}
				}
			});
		}
	}

	if (/^accountcreated$/.test(hashlist[0])) {
		closeSelectedEntry()
		$( ".entry" ).promise().done(function() {		
			openEntry('accountcreated')
		})
		return
	}

	if (/^createentry$/.test(hashlist[0])) {
		closeSelectedEntry()
		$( ".entry" ).promise().done(function() {		
			openEntry('create-entry')
		})
		return
	}

	if (/^createentry$/.test(hashlist[0])) {
		closeSelectedEntry()
		$(".page-title").animate({opacity: "1"})
		appendUserLogs(username, hashlist)
		lastUser = username
		return
	}

	if (/^browse\-logs$/.test(hashlist[0])) {
		closeSelectedEntry()
		$(".page-title").animate({opacity: "1"})
		$( ".entry" ).promise().done(function() {		
			openEntry('browse-logs')
		})
		return
	}

	if (/^markdown\-help$/.test(hashlist[0])) {
		closeSelectedEntry()
		$(".page-title").animate({opacity: "1"})
		// update conversion
		var obj = $("textarea#markdown-help")
		var markup = obj.val()
		var converted = myToHtml(markup)
		$("#markdown-help-converted").html(converted)
		$( ".entry" ).promise().done(function() {		
			openEntry('markdown-help')
		})
		return
	}
}

// Generate the "Browse Logs" entry
$(function() {
	$.get('/control/getallusers', function(data) {
		users = JSON.parse(data)
		for (i = 0; i < users.length; i++) {
			username = users[i].username
			pageName = users[i].pageName
			var s = "<a class=\"browse-logs-link\" href=\"#!user/" + username + "\"><div class=\"browse-logs-option\"><div class=\"browse-logs-option-pagename\">" + pageName + "</div><div class=\"browse-logs-option-username\">" + username + "</div></div></a>"
			$(".browse-logs-container").append(s)
		}

		// bind hover behavior
		$(".browse-logs-option").hover(function(event) {
			console.log("Hover browse option")
			$(this).animate({
				"background-color": "rgba(0, 231, 255, 0.2)",
			}, hoverAnimationDuration)},
		function(event) {
			$(this).animate({
				"background-color": "rgba(0, 231, 255, 0)",
			}, hoverAnimationDuration)
		});
	})
})

// generate youtube embed code from url
function youtubeEmbed(vidID){
	var embed = '<iframe width="420" height="315" src="//www.youtube.com/embed/' + vidID + '" frameborder="0" allowfullscreen></iframe>'
	embed = embed.replace('watch?v=', 'embed/')
	return embed
}

// On load, go to specified URL and save animation locations
$(function() {
	hashChanged()
	saveCSS()
});

$(window).on('hashchange',function(){ 
	hashChanged()
});

}
