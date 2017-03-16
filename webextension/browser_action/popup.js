//boolean that will be utilized by the preferences to choose to display the icon on the popup menu
var showIcon = false;
if (showIcon === true) {
    var getThemes = browser.runtime.sendMessage({command: "Return-Theme-List-With-Icons"});
    getThemes.then(buildMenuWithIcons, handleError);
} else {
    var getThemes = browser.runtime.sendMessage({command: "Return-Theme-List-With-No-Icons"});
    getThemes.then(buildMenuNoIcons, handleError);
}

function buildMenuWithIcons(themeList) {
	var themes = themeList.themes;
	for (var index = 0; index < themes.length; index++) {
		var themeChoice = document.createElement("div");
		themeChoice.setAttribute("class", "button theme");
		var textNode = document.createTextNode(themes[index].name);
		themeChoice.appendChild(textNode);
		var themeImg = document.createElement("img");
		themeImg.setAttribute("class", "button icon");
		themeImg.setAttribute("src", themes[index].iconURL);
		themeChoice.insertBefore(themeImg, textNode);
		themeChoice.addEventListener('click', clickListener(themes[index]));
		themeChoice.addEventListener('mouseover', mouseOverListener(themes[index]));
		themeChoice.addEventListener('mouseout',  mouseOutListener(themes[index]));
		document.body.appendChild(themeChoice);
		console.log("ImgUrl: ", themes[index].iconURL);
  }
}

function buildMenuNoIcons(themeList) {
	var themes = themeList.themes;
	for (var index = 0; index < themes.length; index++) {
		var themeChoice = document.createElement("div");
		themeChoice.setAttribute("class", "button class");
		var textNode = document.createTextNode(themes[index].name);
		themeChoice.appendChild(textNode);	
		themeChoice.addEventListener('click', clickListener(themes[index]));
		themeChoice.addEventListener('mouseover', mouseOverListener(themes[index]));
		themeChoice.addEventListener('mouseout',  mouseOutListener(themes[index]));
		document.body.appendChild(themeChoice);
		console.log("ImgUrl: ", themes[index].iconURL);
  }
}
//Helper functions
var clickListener = function(theTheme) { 
		return function() { browser.runtime.sendMessage({command: "Switch-Themes", theme: theTheme}); } 
	};

var alarmListener;
	var mouseOverListener = function(theTheme) { 
		return function() { 
			const when = Date.now()+1000;
			var innerAlarmListener = function(alarmInfo) {browser.runtime.sendMessage({command: "Preview-Theme", theme: theTheme}); };
			browser.alarms.create({when});
			browser.alarms.onAlarm.addListener(innerAlarmListener);
			alarmListener = innerAlarmListener;
		}
	};
	
	var mouseOutListener = function(theTheme) { 
		return function() { 
			browser.alarms.clearAll();
			browser.alarms.onAlarm.removeListener(alarmListener);
			browser.runtime.sendMessage({command: "End-Preview", theme: theTheme}); 
		}
	};

function handleError(error) {
console.log(`Error: ${error}`);
}