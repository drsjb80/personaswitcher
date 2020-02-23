const startup = require('./startup');



test(" t", () => {
  const preferences = {};

  preferences.auto = false;
  preferences.random = false;
  preferences.startupSwitch = false;
  preferences.preview = false;
  preferences.iconPreview = true;
  preferences.toolsMenu = false;
  preferences.debug = false;
  preferences.fastSwitch = false;
  preferences.autoMinutes = 30;
  preferences.previewDelay = 100;
  preferences.current = 0;
  preferences.currentThemeId = null;
  preferences.defaults_loaded = true;

  expect(startup.loadDefaultPrefsIfNeeded).tobe(Promise.resolve());
})

test ("load default preferences test", () => {
    const b = startup.loadDefaultPrefs();

    expect(b.preferences.preview).toBe(true);
    expect(b.preferences.auto).tobe(false);
    expect(b.preferences.random).tobe(false);
    expect(b.preferences.startupSwitch).tobe(false);
    expect(b.preferences.preview).tobe(false);
    expect(b.preferences.iconPreview).tobe(true);
    expect(b.preferences.toolsMenu).tobe(false);
    expect(b.preferences.debug).tobe(false);
    expect(b.preferences.fastSwitch).tobe(false);
    expect(b.preferences.autoMinutes).tobe(30);
    expect(b.preferences.previewDelay).tobe(100);
    expect(b.preferences.current).tobe(0);
    expect(b.preferences.currentThemeId).tobe(null);
    expect(b.preferences.defaults_loaded).tobe(true);
});
