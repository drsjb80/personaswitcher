#cs ----------------------------------------------------------------------------
 AutoIt Version: 3.3.14.2
 Author:         Trever Mock
#ce ----------------------------------------------------------------------------

#include "_PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;

Local $testName = "Select a Theme Test" ; name of test category (ex: Toolbar Tests)
Local $tests[7] ; size of array = number of tests

; start Firefox and setup for tests
InitializeFirefox()

; Reset Persona Switcher Preferences to Defaults and enable the toolbar menu
ResetPersonaSwitcherPrefs()
_FFPrefSet("extensions.personaswitcher.main-menubar", true)

; run tests and store results
$tests[0] = SelectThemeCaseOne()	; "Ctrl" + "Alt" + "D" selects default theme
$tests[1] = SelectThemeCaseTwo()	; 'CTRL' + 'ALT' + 'R' rotates through all personas
$tests[2] = SelectThemeCaseThree()	; PSwitcher Menu ('ALT' + 'P')
$tests[3] = SelectThemeCaseFour()	; PSwitcher Menu ('CTRL' + 'ALT' + 'P')
$tests[4] = SelectThemeCaseFive()	; PSwitcher Menu (by F10 Shortcut)
$tests[5] = SelectThemeCaseSix()	; Firefox toolbar (by F10 Shortcut)
$tests[6] = SelectThemeCaseSeven()	; PSwitcher icon button

; save results to file
SaveResultsToFile($tests, $testName)

; disconnect and close from Firefox
EndFirefox()

;------------------------------------ tests ----------------------------------;

;Press "Ctrl" + "Alt" + "D"
;Check if theme changes to default theme
Func SelectThemeCaseOne()
   Local $testResults

   ; store the default theme information
   Local $defaultTheme = ""	; The default theme id is the empty string

   ; change the theme from default to the first in the theme list
   _FFPrefSet("lightweightThemes.selectedThemeID", GetListOfThemeIds()[0])

   ; change back to default
   Send("{CTRLDOWN}")
   Sleep(500)
   Send("{ALTDOWN}")
   Sleep(500)
   Send("{d}")
   Sleep(500)
   Send("{CTRLUP}")
   Sleep(500)
   Send("{ALTUP}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $defaultTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST PASSED: 'CTRL' + 'ALT' + 'D' correctly selected the default theme"
   Else
	  $testResults = "TEST FAILED: 'CTRL' + 'ALT' + 'D' did not select the default theme"
   EndIf

   return $testResults
EndFunc

; Press "Ctrl" + "Alt" + "R"
; Loop through all personas and back to the first
; Check if theme rotates each time (exccluding default)
; Check if the theme rotates back to the original persona
Func SelectThemeCaseTwo()
   Local $testResults

   ; Copied from PS Testing Library 'GetListOfThemeIds' function to get size of list
   Local $jsonThemeList = _FFPrefGet("lightweightThemes.usedThemes")
   Local $themesWithId = StringRegExp($jsonThemeList, '("id":"\d*")', 3) ; Regex for format "id":"286995"
   Local $size = Ubound($themesWithId, 1)

   Send("{CTRLDOWN}")
   Sleep(500)
   Send("{ALTDOWN}")
   Sleep(500)
   Send("{r}")
   Sleep(500)

   Local $originalTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   Local $i = 0
   While $i <= $size
	  Send("{r}")
	  Sleep(500)
	  if $originalTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
		 $testResults = "TEST FAILED: 'CTRL' + 'ALT' + 'R' does not rotate through personas correctly"
		 Send("{CTRLUP}")
		 Sleep(500)
		 Send("{ALTUP}")
		 Sleep(500)
		 return $testResults
	  else
		 $i = $i + 1
	  EndIf
   WEnd

   ; rotate theme to different theme
   Send("{r}")
   Sleep(500)
   Send("{CTRLUP}")
   Sleep(500)
   Send("{ALTUP}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $originalTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST PASSED: 'CTRL' + 'ALT' + 'R' correctly rotates through all personas"
   Else
	  $testResults = "TEST FAILED: 'CTRL' + 'ALT' + 'R' does not rotate through personas correctly"
   EndIf

   return $testResults
EndFunc

;Press "Alt" + "P"
;Use down arrow key to select theme
;Press Enter Key
;Check if theme changes to theme selected
Func SelectThemeCaseThree()
   Local $testResults

   ; set theme to default
   _FFPrefSet("lightweightThemes.selectedThemeID", "")
   Sleep(500)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; select next theme
   Send("{ALTDOWN}")
   Sleep(500)
   Send("{p}")
   Sleep(500)
   Send("{ALTUP}")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not selected using the PSwitcher Menu ('ALT' + 'P') on the Firefox Menu Bar"
   Else
	  $testResults = "TEST PASSED: theme was selected using the PSwitcher Menu ('ALT' + 'P') on the Firefox Menu Bar"
   EndIf

   return $testResults
EndFunc

;Press "Ctrl" + "Alt" + "P"
;Use down arrow key to select theme
;Press Enter Key
;Check if theme changes to theme selected
Func SelectThemeCaseFour()
   Local $testResults

   ; set theme to default
   _FFPrefSet("lightweightThemes.selectedThemeID", "")
   Sleep(500)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; select next theme
   Send("{CTRLDOWN}")
   Sleep(500)
   Send("{ALTDOWN}")
   Sleep(500)
   Send("{p}")
   Sleep(500)
   Send("{CTRLUP}")
   Sleep(500)
   Send("{ALTUP}")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not selected using the PSwitcher Menu ('CTRL' + 'ALT' + 'P') on the Firefox Menu Bar"
   Else
	  $testResults = "TEST PASSED: theme was selected using the PSwitcher Menu ('CTRL' + 'ALT' + 'P') on the Firefox Menu Bar"
   EndIf

   return $testResults
EndFunc

; Select PSSwitcher Menu on Menu Bar
; Select Theme
; Check if theme changed
Func SelectThemeCaseFive()
   Local $testResults

   ; set theme to default
   _FFPrefSet("lightweightThemes.selectedThemeID", "")
   Sleep(500)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; select next theme
   Send("{f10}")
   Sleep(500)
   Send("p")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was selected through PSwitcher Menu (by F10 Shortcut) on the Firefox Menu Bar"
   Else
	  $testResults = "TEST PASSED: theme was selected through PSwitcher Menu (by F10 Shortcut) on the Firefox Menu Bar"
   EndIf

   Return $testResults
EndFunc

; send keys 'f10', 't' to open firefox toolbar
; then send key 'p' to select PersonaSwitcher
; use arrow keys to navigate themes, enter to select
Func SelectThemeCaseSix()
   Local $testResults

   ; set theme to default
   _FFPrefSet("lightweightThemes.selectedThemeID", "")
   Sleep(500)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; select next theme
   Send("{f10}")
   Sleep(500)
   Send("t")
   Sleep(500)
   Send("p")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not selected through the Firefox toolbar (by F10 Shortcut)"
   Else
	  $testResults = "TEST PASSED: theme was selected through the Firefox toolbar (by F10 Shortcut)"
   EndIf

   Return $testResults
EndFunc

; click on the persona switcher icon and switch the persona
; check if the persona has been changed
Func SelectThemeCaseSeven()
   Local $testResults

   ; set theme to default
   _FFPrefSet("lightweightThemes.selectedThemeID", "")
   Sleep(500)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; select next theme
   OpenPersonaSwitcherButton()
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
   Send("{Enter}")
   Sleep(500)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testResults = "TEST FAILED: theme was not selected through the PSwitcher icon button"
   Else
	  $testResults = "TEST PASSED: theme was selected through the PSwitcher icon button"
   EndIf

   Return $testResults
EndFunc
