window.onload = function() {

function getUsernameFromCookie() {
	var cookieValue = $.cookie("user_id");
	if (!cookieValue) {
		return null
	}
	var username = cookieValue.split("|")[0]
	return username
}

function getUser() {
	var username = getUsernameFromCookie()
	if (!username) {
		return null
	}
	data = $.ajax({
		type: "GET",
		url: '/control/getuser?username='+username,
		async: false
	}).responseText
	var obj = JSON.parse(data)
	return obj
}

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

var entryCreationForm = $($($.parseHTML(panels)).filter('.create-entry-form')[0])

// define Panel "object" creator
function Panel(sel) {
	d = $($.parseHTML(panels))
	var pSel = d.filter('#' + sel)[0]

	// user topbar panel
	if (sel == 'user-topbar') {
		$this = makePanel(pSel, {
			top: function() {return "-30"},
			left: function() {return "50%"},
			width: function() {return "129"},
			height: function() {return "20"}
		}, {
			top: function() {return "0"},
			left: function() {return "0"},
			width: function() {return "100%"},
			height: function() {return "100px"}
		})
		return $this
	}

	// user pages panel
	if (sel == 'user-pages') {
		$this = makePanel(pSel, {
			top: function() {return "95"},
			left: function() {return "-150"},
			width: function() {return "129"},
			height: function() {return "20"},
		}, {
			top: function() {return "95px"},
			left: function() {return "0px"},
			width: function() {return "50%"},
			height: function() {return $this.parent().height() - 95}
		})
		return $this
	}
	// user notifications panel
	if (sel == 'user-notifications') {
		$this = makePanel(pSel, {
			top: function() {return "95"},
			left: function() {return "101%"},
			width: function() {return "129"},
			height: function() {return "20"},
		}, {
			top: function() {return "95px"},
			left: function() {return $this.parent().width()/2 - 5},
			width: function() {return $this.parent().width()/2 + 5},
			height: function() {return $this.parent().height() - 95}
		})
		return $this
	}
	// private logs entry list
	if (sel == 'private-log-entry-list') {
		$this = makePanel(pSel, {
			top: function() {return "95"},
			left: function() {return "-130"},
			width: function() {return "129"},
			height: function() {return "20"},
		}, {
			top: function() {return "95px"},
			left: function() {return 0},
			width: function() {return 150},
			height: function() {return $this.parent().height() - 95}
		})
		return $this
	}
	// private logs entry viewer
	if (sel == 'private-log-entry-viewer') {
		$this = makePanel(pSel, {
			top: function() {return "95"},
			left: function() {return "101%"},
			width: function() {return "129"},
			height: function() {return "20"},
		}, {
			top: function() {return "95px"},
			left: function() {return 145},
			width: function() {return $this.parent().width() - 145},
			height: function() {return $this.parent().height() - 95}
		})
		return $this
	}

	// default panel
	$this = makePanel(pSel, {
		top: function() {return "-30"},
		left: function() {return "650"},
		width: function() {return "129"},
		height: function() {return "20"}
	}, {
		top: function() {return "0"},
		left: function() {return "0"},
		width: function() {return "100%"},
		height: function() {return "100%"}
	})
	return $this
}

var entryAnimationDuration = 300
var openPanels = [];

function makePanel(html, closedcss, opencss) {
	var $this = $(html);

	// define panel data
	$.data($this, 'closed-css', closedcss);
	$.data($this, 'open-css', opencss);

	// define panel methods
	$this.getClosedCSS = function() {
		return $.data(this, 'closed-css')
	}
	
	$this.open = function() {
		if (openPanels.indexOf($this) != -1) {
			return
		}
		openPanels.push($this)
		$('.panel').promise().done(function() {
			o = $.data($this, 'open-css')
			$this.animate({
				"top": o.top(),
				"left": o.left(),
				"width": o.width(),
			}, entryAnimationDuration, function() {
				o = $.data($this, 'open-css')
				$this.animate({
					'height': o.height()
				}, entryAnimationDuration, function() {
				})
			});	
		})
	}
	$this.close = function() {
		var i = openPanels.indexOf($this)
		if (i > -1) {
			openPanels.pop(i)
		}
		c = $.data($this, 'closed-css')
		$this.animate({
			'height': c.height(),
		}, entryAnimationDuration, function() {
			c = $.data($this, 'closed-css')
			$this.animate({
				"width": c.width(),
				"top": c.top(),
				"left": c.left(),
			}, entryAnimationDuration, function() {

			})
		});
	}

	$this.snapClose = function() {
		var i = openPanels.indexOf($this)
		if (i > -1) {
			openPanels.pop(i)
		}
		c = $.data($this, 'closed-css')
		$this.css({
			"height": c.height(),
			"top": c.top(),
			"left": c.left(),
			"width": c.width(),
		});
	}

	$this.snapOpen = function() {
		var i = openPanels.indexOf($this)
		if (i > -1) {
			openPanels.pop(i)
		}
		o = $.data($this, 'open-css')
		$this.css({
			"height": o.height(),
			"top": o.top(),
			"left": o.left(),
			"width": o.width(),
		});
	}

	$this.isOpen = function() {
		return openPanels.indexOf($this) > -1
	}

	$this.snapClose()
	return $this
}

function closeAllPanels() {
	while (openPanels.length > 0) {
		openPanels.pop().close()
	}
}

function closeAllPanelsExcept(ps) {
	var keep = []
	while (openPanels.length > 0) {
		var panel = openPanels.pop()
		if (ps.indexOf(panel) > -1) {
			keep.push(panel)
		} else {
			panel.close()
		}
	}
	openPanels = keep
}

// Create default panels
// account created panel
accountCreatedPanel = Panel('account-created')

// login form panel
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
		if (response == 'Success') {
			$('.error', $form).html("")
			window.location.hash = '#!mylog/home'

		} else {
			$('span.error#username-password', $form).html("<div class=\"error\">Username or password is invalid.</div>")
		}
	});
	request.fail(function (jqXHR, textStatus, errorThrown){
	});
	request.always(function () {
		$inputs.prop("disabled", false);
	});
	event.preventDefault();
})

// registration form panel
registerPanel = Panel('register')
registerForm = $('form', registerPanel)
registerForm.submit(function(event) {
	var $form = $(this)
	var $inputs = $form.find('input')
	var serializedData = $form.serialize();
	$inputs.prop("disabled", true);
	request = $.ajax({
		url: "/control/register",
		type: "post",
		data: serializedData
	});
	request.done(function (response, textStatus, jqXHR){
		if (response.indexOf('Success') > -1) {
			$('.error', $form).html("")
			window.location.hash = '#!accountcreated'

		} else {
			if (response.indexOf('username_is_invalid') > -1) {
				$('span.error#username-is-invalid', $form).html("<div class=\"error\">Username must be 3 to 20 characters and contain only numbers, letters, hyphens, and underscores.</div>")
			} else {
				$('span.error#username-is-invalid', $form).html("")
			}
			if (response.indexOf('username_is_taken') > -1) {
				$('span.error#username-is-taken', $form).html("<div class=\"error\">This username is taken.</div>")
			} else {
				$('span.error#username-is-taken', $form).html("")
			}
			if (response.indexOf('passwords_dont_match') > -1) {
				$('span.error#passwords-dont-match', $form).html("<div class=\"error\">Passwords don't match.</div>")
			} else {
				$('span.error#passwords-dont-match', $form).html("")
			}
		}
	});
	request.fail(function (jqXHR, textStatus, errorThrown){
	});
	request.always(function () {
		$inputs.prop("disabled", false);
	});
	event.preventDefault();
})

// browse logs panel
browsePanel = Panel('browse')

// user panels created elsewhere

$bgTitle = $('div.bg-title')
titleAnimationDuration = 600
function setTitle(s) {
	if ($bgTitle.html() == s) {
		return
	}
	$bgTitle.animate({
		opacity: 0
	}, titleAnimationDuration, function() {
		$bgTitle.html(s)
		$bgTitle.animate({
			opacity: .2
		}, titleAnimationDuration)
	})
}


// Update on hashchange
$(window).on('hashchange',function(){ 
	hashChanged()
});

userTopbarPanel = null
userPagesPanel = null
userNotificationsPanel = null
privateLogEntryListPanel = null
privateLogEntryViewerPanel = null
function hashChanged() {
	hash = window.location.hash
	hash = hash.split("!")[1]
	if (!hash) {
		return
	}
	hashlist = hash.split('/')
	if (/^login$/.test(hashlist[0])) {
		closeAllPanels()
		loginPanel.open()
		setTitle('Login')
	}
	if (/^register$/.test(hashlist[0])) {
		closeAllPanels()
		registerPanel.open()
		setTitle('Register')
	}
	if (/^accountcreated$/.test(hashlist[0])) {
		closeAllPanels()
		accountCreatedPanel.open()
		setTitle('')
	}
	if (/^browse$/.test(hashlist[0])) {
		closeAllPanels()
		browsePanel.open()
		setTitle('Browse Public Logs')
	}

	if (/^mylog$/.test(hashlist[0])) {
		var user = getUser()
		if (!user) {
			window.location.hash="#!login"
			return
		}
		if (!userTopbarPanel) {
			userTopbarPanel = Panel('user-topbar')
			mobiScreen.append(userTopbarPanel)
		}
		setTitle("My MobiLog")
		$('div.user-topbar-username', userTopbarPanel).html(user.username)
		if (!userTopbarPanel.isOpen()) {
			closeAllPanels()
		}
		if (hashlist.length < 2) {
			window.location.hash="#!mylog/home"
		}
		userTopbarPanel.open()
		if (hashlist[1] == 'home') {
			closeAllPanelsExcept([userTopbarPanel])
			if (!userPagesPanel) {
				userPagesPanel = Panel('user-pages')
				mobiScreen.append(userPagesPanel)
			}
			if (!userNotificationsPanel) {
				userNotificationsPanel = Panel('user-notifications')
				mobiScreen.append(userNotificationsPanel)
			}
			userPagesPanel.open()
			userNotificationsPanel.open()
		}
		if (hashlist[1] == 'privatelog') {
			if (hashlist.length < 3) {
				window.location.hash="#!mylog/privatelog/createentry"
			}
			closeAllPanelsExcept([userTopbarPanel])
			if (!privateLogEntryListPanel) {
				privateLogEntryListPanel = Panel('private-log-entry-list')
				mobiScreen.append(privateLogEntryListPanel)
			}
			if (!privateLogEntryViewerPanel) {
				privateLogEntryViewerPanel = Panel('private-log-entry-viewer')
				mobiScreen.append(privateLogEntryViewerPanel)
			}
			privateLogEntryListPanel.open()
			privateLogEntryViewerPanel.open()
			if (hashlist[2] == 'createentry') {
				privateLogEntryViewerPanel.html(entryCreationForm) // IN PROGRESS.  NEED TO PUT CONTENT IN INNER PANEL
			}
		}
		if (hashlist[1] == 'citizenprofiles') {
			closeAllPanelsExcept([userTopbarPanel])
		}
		if (hashlist[1] == 'accountmanager') {
			closeAllPanelsExcept([userTopbarPanel])
		}
	}
}

// on window resize
$(window).resize(function() {
	var ps = []
	while (openPanels.length > 0) {
		var p = openPanels.pop()
		p.snapOpen()
		ps.push(p)
	}
	openPanels = ps;
})

// on load
$(function() {
	// append default panels
	mobiScreen.append(loginPanel)
	mobiScreen.append(browsePanel)
	mobiScreen.append(registerPanel)
	mobiScreen.append(accountCreatedPanel)
	hashChanged()
})

}
