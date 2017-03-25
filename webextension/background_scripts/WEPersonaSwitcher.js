// Verify if we need to load the default preferences by checking if the 
// default_loaded flag is undefined. 
var checkDefaultsLoaded = browser.storage.local.get("defaults_loaded");
checkDefaultsLoaded.then(result => { if(undefined === result.defaults_loaded) {
										loadDefaults();
									}else{
										onError(result.error);
									}});

function loadDefaults(){
	var setting = browser.storage.local.set(
		{
			default_loaded: true,

			defaultKeyShift: false,
			defaultKeyControl: true,
			defaultKeyAlt: true,
			defaultKeyMeta: false,
			defaultKeyAccel: false,
			defaultKeyOS: false,
			defaultKey: "D",

			rotateKeyShift: false,
			rotateKeyControl: true,
			rotateKeyAlt: true,
			rotateKeyMeta: false,
			rotateKeyAccel: false,
			rotateKeyOS: false,
			rotateKey: "R",

			autoKeyShift: false,
			autoKeyControl: true,
			autoKeyAlt: true,
			autoKeyMeta: false,
			autoKeyAccel: false,
			autoKeyOS: false,
			autoKey: "A",

			accessKey: "P",

			activateKeyShift: false,
			activateKeyControl: true,
			activateKeyAlt: true,
			activateKeyMeta: false,
			activateKeyAccel: false,
			activateKeyOs: false,
			activateKey: "P",

			auto: false,
			autoMinutes: 30,
			random: false,
			startupSwitch: false,
			preview: false,
			previewDelay: 0,
			iconPreview: true,
			toolboxMinHeight: 0,
			toolsMenu: true,
			mainMenuBar: false,

			//hidden preferences
			debug: true,
			notificationWorkaround: true,
			toolboxMaxHeight: 200,
			fastSwitch: false,
			staticPopups: false,
			current: 0
		});
	setting.catch(onError);
}

function onError(error) {
	console.log(`Error: ${error}`);
}

// Handle the request message from options.js to load the defaults
// after the user presses the reset button on the preferences menu.
function handleMessage(request, sender, sendResponse) {
  if("load defaults" === request.message){
	loadDefaults();
  	sendResponse({response: "defaults loaded"});
  }
}

browser.runtime.onMessage.addListener(handleMessage);
