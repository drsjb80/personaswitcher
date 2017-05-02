#include "..\library\PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;
; This script tests various methods of changing themes with Persona Switcher

Local $testName = "Theme Selecting Tests"
Local $tests[6]

InitializeFirefox()
SetPsOption("main-menubar", true)

; run tests and store results
$tests[0] = SelectThemeCaseOne()	; "Ctrl" + "Alt" + "D" selects default theme
$tests[1] = SelectThemeCaseTwo()	; 'CTRL' + 'ALT' + 'R' rotates through all personas
$tests[2] = SelectThemeCaseThree()	; PSwitcher Menu ('CTRL' + 'ALT' + 'P')
$tests[3] = SelectThemeCaseFour()	; PSwitcher Menu (by F10 Shortcut)
$tests[4] = SelectThemeCaseFive()	; Firefox toolbar (by F10 Shortcut)
; !!! OpenPersonaSwitcherButton() function in PsTestingLibrary not currently working, test omitted
$tests[5] = "ERROR - test must be updated for webextension" ; SelectThemeCaseSix() ; PSwitcher icon button

SaveResultsToFile($tests, $testName)
EndFirefox()

;------------------------------------ tests ----------------------------------;

;Press "Ctrl" + "Alt" + "D"
;Check if theme changes to default theme
Func SelectThemeCaseOne()
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()
   Local $defaultTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; change the theme from default to the first in the theme list
   _FFPrefSet("lightweightThemes.selectedThemeID", GetInstalledThemeIds()[0])

   ; change back to default
   Sleep(1000)
   Send("^!d")

   ; check that theme at the start of the test has been changed
   If $defaultTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testPassed = True
	  $sDescription = "'CTRL' + 'ALT' + 'D' correctly selected the default theme."
   Else
	  $sDescription = "'CTRL' + 'ALT' + 'D' did not select the default theme."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

; Press "Ctrl" + "Alt" + "R"
; Loop through all personas and back to the first
; Check if theme rotates each time (exccluding default)
; Check if the theme rotates back to the original persona
Func SelectThemeCaseTwo()
   Local $sDescription
   Local $testPassed = False

   Send("^!r")
   Sleep(1000)
   Local $size = Ubound(GetInstalledThemeIds())
   Local $originalTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   For $i = 1 To $size - 1
	  Send("^!r")
	  Sleep(1000)
	  if $originalTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
		 $sDescription = "'CTRL' + 'ALT' + 'R' did not rotate through all personas before returning to starting persona."
		 Return FormatTestString($testPassed, $sDescription)
	  EndIf
   Next

   ; rotate theme to different theme
   Send("^!r")
   Sleep(750)
   Local $endingTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   If $originalTheme == $endingTheme Then
	  $testPassed = True
	  $sDescription = "'CTRL' + 'ALT' + 'R' correctly rotated through all personas."
   Else
	  $sDescription = "'CTRL' + 'ALT' + 'R' did not return to starting persona." & _
		 @CRLF & "  starting persona ID: " & $originalTheme & _
		 @CRLF & "  ending persona ID: " & $endingTheme
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc



;Press "Ctrl" + "Alt" + "P"
;Use down arrow key to select theme
;Press Enter Key
;Check if theme changes to theme selected
Func SelectThemeCaseThree()
   Local $sDescription
   Local $testPassed = False

   ; set theme to default
   ResetToDefaultTheme()
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
	  $sDescription = "Theme was not selected using the PSwitcher Menu ('CTRL' + 'ALT' + 'P') on the Firefox Menu Bar."
   Else
	  $testPassed = True
	  $sDescription = "Theme was selected using the PSwitcher Menu ('CTRL' + 'ALT' + 'P') on the Firefox Menu Bar."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

; Select PSSwitcher Menu on Menu Bar
; Select Theme
; Check if theme changed
Func SelectThemeCaseFour()
   Local $sDescription
   Local $testPassed = False

   ; set theme to default
   ResetToDefaultTheme()
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
	  $sDescription = "Theme was selected through PSwitcher Menu (by F10 Shortcut) on the Firefox Menu Bar."
   Else
	  $testPassed = True
	  $sDescription = "Theme was selected through PSwitcher Menu (by F10 Shortcut) on the Firefox Menu Bar."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

; send keys 'f10', 't' to open firefox toolbar
; then send key 'p' to select PersonaSwitcher
; use arrow keys to navigate themes, enter to select
Func SelectThemeCaseFive()
   Local $sDescription
   Local $testPassed = False

   ; set theme to default
   ResetToDefaultTheme()
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
	  $sDescription = "Theme was not selected through the Firefox toolbar (by F10 Shortcut)."
   Else
	  $testPassed = True
	  $sDescription = "Theme was selected through the Firefox toolbar (by F10 Shortcut)."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

; click on the persona switcher icon and switch the persona
; check if the persona has been changed
Func SelectThemeCaseSix()
   Local $sDescription
   Local $testPassed = False

   ; set theme to default
   ResetToDefaultTheme()
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
	  $sDescription = "Theme was not selected through the PSwitcher icon button."
   Else
	  $testPassed = True
	  $sDescription = "Theme was selected through the PSwitcher icon button."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc
