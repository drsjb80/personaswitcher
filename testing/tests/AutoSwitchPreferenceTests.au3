#include "..\library\PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;
; This script tests Persona Switcher's 'switch every _ minutes' preference

Local $testName = "Auto Switch Preference Tests"
Local $tests[3]

InitializeFirefox()

; run tests and store results
$tests[0] = SwitchThemeOneMin()
$tests[1] = SwitchThemeMinValue()
$tests[2] = SwitchThemeMaxValue()

SaveResultsToFile($tests, $testName)
EndFirefox()


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
