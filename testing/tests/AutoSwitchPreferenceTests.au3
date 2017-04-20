#include "..\library\PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;
; This script tests Persona Switcher's 'switch every _ minutes' preference

Local $testName = "Auto Switch Preference Tests"
Local $tests[6]

InitializeFirefox()

; run tests and store results
$tests[0] = SwitchTheme()
$tests[1] = NoSwitch()
$tests[2] = SwitchThemeOneMin()
$tests[3] = SwitchThemeOneMinWithKeys()
$tests[4] = SwitchThemeMinValue()
$tests[5] = SwitchThemeMaxValue()

SaveResultsToFile($tests, $testName)
EndFirefox()

;------------------------------------ tests ----------------------------------;
; Testing that the theme changes when the "Switch every __ minutes"
; preference is enabled
Func SwitchTheme()
   Local $sDescription
   Local $testPassed = False

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; Enable switch theme preference
   SetPsOption("auto", True)

   ; check that theme at the start of the test has been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
      $sDescription = "After enabling the 'switch every _ minutes' preference, the theme did not immediately change."
   Else
	  $testPassed = True
      $sDescription = "After enabling the 'switch every _ minutes' preference, the theme immediately changed."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

;******************************************************************************
; Testing that the theme does not change when the "Switch every __ minutes"
; preference goes from enabled to disabled
Func NoSwitch()
   Local $sDescription
   Local $testPassed = False

   ; Enable switch theme preference
   SetPsOption("auto", True)

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; Disable Switch Theme preference
   SetPsOption("auto", False)

   ; check that theme at the start of the test has not been changed
   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $testPassed = True
      $sDescription = "After disabling the 'switch every _ minutes' preference, the theme did not immediately change."
   Else
      $sDescription = "After disabling the 'switch every _ minutes' preference, the theme immediately changed."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

;******************************************************************************
; Testing that the theme changes after 1 minute when the "Switch every __ minutes"
; preference is enabled and set to 1 minute
Func SwitchThemeOneMin()
   Local $sDescription
   Local $testPassed = False

   ; Enable switch theme preference and to 1 min
   SetPsOption("auto", True)
   SetPsOption("autominutes", "1")

   ; get the current theme
   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; wait one minute (5 second window)
   SleepWithMsgBox(57500)
   If $startTheme <> _FFPrefGet("lightweightThemes.selectedThemeID") Then
	  $sDescription = "After setting 'switch ever _ minutes' to one minute, the theme changed in under a minute."
   Else
	  Sleep(5000)
	  If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
		 $sDescription = "After setting 'switch ever _ minutes' to one minute and waiting one minute, the theme was not changed."
	  Else
		 $testPassed = True
		 $sDescription = "After setting 'switch ever _ minutes' to one minute and waiting one minute, the theme changed."
	  EndIf
   EndIf

   ResetPsOption("auto")
   ResetPsOption("autominutes")

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;******************************************************************************
; Testing that the theme changes when "Switch every __ minutes" preference is
; enabled through the shortcut key (default = ctrl + alt + a) and also changes
; again after 1 minute
Func SwitchThemeOneMinWithKeys()
   Local $sDescription
   Local $testPassed = False
   Local $noThemeChange = false

   ; Enable switch theme preference and to 1 min
   SetPsOption("auto", False)
   SetPsOption("autominutes", "1")

   ; get the current theme
   Local $firstTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   Send("^!a")
   Sleep(500)

   ; get the current theme
   Local $secondTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   If $firstTheme == $secondTheme Then
	  $sDescription = "Theme was not rotated by pressing 'ctrl + alt + a' to enable the 'switch every _ minutes' preference."
   Else
	  ; wait one minute (10 second window)
	  SleepWithMsgBox(55000)

	  If $secondTheme <> _FFPrefGet("lightweightThemes.selectedThemeID") Then
		 $sDescription = "After pressing 'ctrl + alt + a' to enable the 'switch every _ minutes'" & _
			" preference, the theme automatically changed in under a minute."
	  Else
		 Sleep(10000)
		 If $secondTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
			$sDescription = "After pressing 'ctrl + alt + a' to enable the 'switch every _ minutes'" & _
			   " preference, the theme was not automatically changed after a minute."
		 Else
			$testPassed = True
			$sDescription = "After pressing 'ctrl + alt + a' to enable the 'switch every _ minutes'" & _
			   " preference, the theme was automatically changed in a minute."
		 EndIf
	  EndIf
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;******************************************************************************
; Testing that the min value of the preference is 1 and nothing less can be entered.
Func SwitchThemeMinValue()
   Local $sDescription
   Local $testPassed = False

   SetPsOption("auto", True)

   ; Update preference value to 0 min and copy actual stored result to clipboard
   Local $valueCopy = SetPsOption("autominutes", "0", True)

   ; check that value is set to the min
   If $valueCopy >= 1 Then
	  $testPassed = True
      $sDescription = "Persona Switcher did not allow a value less than the minimum (1) for the 'switch every _ minutes' preference to be entered."
   Else
      $sDescription = "Persona Switcher allowed a value less than the minimum (1) for the 'switch every _ minutes' preference to be entered."
   EndIf

   ResetPsOption("autominutes")
   Return FormatTestString($testPassed, $sDescription)
EndFunc
;******************************************************************************
; Testing that the max value of the preference is 999 and nothing larger
; can be entered.
Func SwitchThemeMaxValue()
   Local $sDescription
   Local $testPassed = False

   Local $valueCopy = SetPsOption("autominutes", 1000, True)

   ; check that value is set to the max
   If $valueCopy <= 999 Then
	  $testPassed = True
      $sDescription = "Persona Switcher did not allow a value less than the maximum (999) for the 'switch every _ minutes' preference to be entered."
   Else
      $sDescription = "Persona Switcher allowed a value less than the maximum (999) for the 'switch every _ minutes' preference to be entered."
   EndIf

   ResetPsOption("autominutes")
   Return FormatTestString($testPassed, $sDescription)
EndFunc


Func SleepWithMsgBox(byRef $time)
   Local $cmd = "MsgBox(0, ' Please Wait...', ' Waiting one minute for theme " & _
	  "to switch.' & @CRLF & ' This mesage will automatically close.', 55)"
   Run(@AutoItExe & ' /AutoIt3ExecuteLine "' & $cmd & '"')
   Sleep($time)
   WinActivate("[CLASS:MozillaWindowClass]")
   WinWaitActive("[CLASS:MozillaWindowClass]")
EndFunc
