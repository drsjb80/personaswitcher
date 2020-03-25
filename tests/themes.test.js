const {themes, getDefaultThemeIndex} = require('../background_scripts/themes');

// const { getDefaultThemeIndex, themes } = require('../background_scripts/themes');

test('no default themes', () => {
    expect(getDefaultThemeIndex()).toBe(0);
});

test('one default theme', () => {
    themes.defaultTheme = { "id": "bar" };
    themes.defaultThemes = [{"id": "foo"}, {"id": "bar"}];
    expect(getDefaultThemeIndex()).toBe(2);
});

/*
if (typeof jesting !== 'undefined') {
    module.exports = { themes, getDefaultThemeIndex };
}
*/

