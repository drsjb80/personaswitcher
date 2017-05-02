Documentation detailing how to set up your system to run these tests exists
in the "doc" folder, titled "Automated Testing Setup and Information.pdf".

The testing directory in its current state has several issues.

We have done our best to make note of the known issues within the tests
themselves, but because different systems produce different results, there
may be unknown issues that exist as well.

==== Known Issues ====

/library/PsTestingLibrary.au3:
 -OpenPersonaSwitcherButton() function opens the PS menu but is not
  navigatable through the arrow keys and does not highlight a theme once
  opened. Because of this, tests that call this function are currently
  failing. Affected tests are PreviewPersonaPreferenceTests and
  SelectThemeTests.
  
 -ResetToDefaultTheme() sends the PS keyboard shortcut to reset to the
  default theme. Ideally this function should not depend on Persona
  Switcher
  to operate.
  
/library/PreferenceUtil.au3:
 -The ResetPersonaSwitcherPrefs() function works as intended, however its
  current implementation is abrubt in that it must open the preference page
  to do so. Ideally this function should happen in the background as it did
  in the tests for the bootstrap add-on. This lengthens the run time of
  every test because this function is called in both the
  InitializeFirefox() and EndFirefox() functions.
  
 -Advanced options are not yet functional in the SetPsOption() function.
  
 -At the time of writing these tests, AutoIt does not natively have a way
  to represent key-value pairs. Because of this, a map is represented as
  two arrays - one in GetPrefKeyArray() and the other in
  GetPrefValueArray().
  The index of each element of these arrays corresponds a key to its value.
  
 -The SetPsOption() function  works correctly but should ideally scroll to 
  the changed preference to be more intuitive for users watching a testing
  run.
 
/tests/KeyboardShortcutPreferencesTests.au3:
 -Currently unknown reasons are causing multiple tests to fail.
  An updated method for grabbing the list of themes in the correct order is
  also needed and may fix these failing tests.
  
/tests/IconPreviewPreferenceTests.au3:
 -These tests sometimes fail for unknown reasons across different machines.
  Suspected that the logic for checking a menu item for icons is flawed.

/AutomatedTestRunner.au3:
 -This script it experimental and may not run as smoothly as running tests
  individually. It is included for convenience purposes. Moving the
  cursor while a test is running will stop the test runner and abort the
  current test.