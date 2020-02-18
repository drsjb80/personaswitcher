const themes = require('./themes');

test('test the isDefaultTheme function', () => {
  expect(themes.isDefaultTheme("firefox-compact-dark@mozilla.org")).toBe(true);
  expect(themes.isDefaultTheme("this_is_a_random_string")).toBe(false);
});
