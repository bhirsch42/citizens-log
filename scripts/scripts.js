window.onload = function() {

 (function($){
    $(window).load(function(){
      $(".entry-content").mCustomScrollbar({
        horizontalScroll:true,
        autoDraggerLength:false
      });
      $(".entry-content").mCustomScrollbar({
        mouseWheel:false,
        scrollButtons:{
          enable:true
        }
      });
    });
  })(jQuery);

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

var entryMenuDist = 15
var entryAnimationDuration = 300
var entriesLength = parseInt($("#entries-length").attr("value"))

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
$( ".entry" ).click(function(event) {
	// filter out the selected entry
	if ($(this).is($(".selected"))) {
		return
	}
	var id = $(".entry-wrapper.selected").attr("id")
	deselectEntry(id)
	closeEntry(id)
	$( ".entry" ).promise().done(function() {
		if ($(".selected").length > 0) {
			return
		}
		openEntry(event.target.id)
		window.history.pushState("This", "That", "/" + event.target.id)
	});
});

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

// go to the entry specified in the url, when page loads
$(function() {
	var id = location.pathname.split("entry-")[1]
	if (!id) {
		openEntry("entry-0")
	}
	openEntry("entry-" + id)
});


}
