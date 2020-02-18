const isDefaultTheme = require('./isDefaultTheme');

test('test the isDefaultTheme function', () => {
  expect(isDefaultTheme("firefox-compact-dark@mozilla.org")).toBe(true);
  expect(isDefaultTheme("this_is_a_random_string")).toBe(false);
});
