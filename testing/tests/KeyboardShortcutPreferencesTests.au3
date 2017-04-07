#include "..\library\PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's keyboard
; shortcut preferences

Local $testName = "Keyboard Shortcut Preferences Tests"
Local $tests[9]

InitializeFirefox()
Local $themeList = GetAllThemeIds()

; run tests and store results
$tests[0] = DefaultPersona_DifferentKeyAndChar()
$tests[1] = DefaultPersona_ExtraKey()
$tests[2] = RotatePersona_RotateAll($themeList)
$tests[3] = RotatePersona_DifferentKeyAndChar($themeList)
$tests[4] = RotatePersona_ExtraKey($themeList)
$tests[5] = AutoSwitch_DifferentKeyAndChar()
$tests[6] = AutoSwitch_ExtraKey()
$tests[7] = AutoSwitch_DoublePress()
$tests[8] = AutoSwitch_Disable()

SaveResultsToFile($tests, $testName)
EndFirefox()
Exit(0)


;---------------------------------------- tests ----------------------------------------;


;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Default Persona
; shortcut will change the theme back to default.
; Changed Ctrl + Alt + D to Shift + Alt + W
Func DefaultPersona_DifferentKeyAndChar()
   Local $sDescription
   Local $testPassed = False
   Local $defaultThemeId
   Local $isDefault = False

   ; Grab default theme
   If (ResetToDefaultTheme()) Then
	  Local $defaultThemeId = _FFPrefGet("lightweightThemes.selectedThemeID")
   EndIf

   ; Select any other theme except default
   SelectTheme()
   Local $selectedTheme =  _FFPrefGet("lightweightThemes.selectedThemeID")

   SetPsOption("defshift", True)
   SetPsOption("defcontrol", False)
   SetPsOption("defkey", "W")

   ; use the new key combination to reset the theme to default
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("+!w")
   Sleep(500)

   ; check if the theme is actually the default theme after the shortcut key
   If $defaultThemeId == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	   $isDefault = True
   EndIf

   ; Check if selected theme was changed to default after the shortcut key
   If $selectedTheme ==  $defaultThemeId AND Not $isDefault Then
      $sDescription = "the default persona shortcut did not change the theme to default theme with the new combination : Shift + Alt + W"
   Else
      $sDescription = "the default persona shortcut changed the theme to the default with the new combination : Shift + Alt + W"
	  $testPassed = True
   EndIf

   ResetPsOption("defcontrol") ; ctrl
   ResetPsOption("defshift") ; shift
   ResetPsOption("defkey") ; key

   Return FormatTestString($testPassed, $sDescription)
 EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Default Persona
; shortcut will change the theme back to default.
; Changed Ctrl + Alt + D to Shift + Ctrl + Alt + D
Func DefaultPersona_ExtraKey()
   Local $sDescription
   Local $testPassed = False
   Local $defaultThemeId
   Local $isDefault = False

   ; Grab default theme
   If (ResetToDefaultTheme()) Then
	  Local $defaultThemeId = _FFPrefGet("lightweightThemes.selectedThemeID")
   EndIf

   ; Select any other theme except default
   SelectTheme()
   Local $selectedTheme =  _FFPrefGet("lightweightThemes.selectedThemeID")

   SetPsOption("defshift", True)

   ; use the new key combination to reset the theme to default
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("+^!d")
   Sleep(500)

   ; check if the theme is actually the default theme after the shortcut key
   If $defaultThemeId == _FFPrefGet("lightweightThemes.selectedThemeID") Then
	   $isDefault = True
   EndIf

   ; Check if selected theme was changed to default after the shortcut key
   If $selectedTheme ==  $defaultThemeId AND Not $isDefault Then
      $sDescription = "the default persona shortcut did not change the theme to default theme with the new combination : Shift + Ctrl + Alt + D"
   Else
      $sDescription = "the default persona shortcut changed the theme to the default with the new combination : Shift + Ctrl + Alt + D"
	  $testPassed = True
   EndIf

   ResetPsOption("defshift") ; shift

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------
; Testing that Rotate Persona shortcut will rotate through the themes in the
; correct order.
Func RotatePersona_RotateAll($themeList)
   Local $sDescription
   Local $testPassed = False

   ;ResetToDefaultTheme()
   ;ResetRotateCurrentPref(UBound($themeList))

   Local $firstTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   For $i = 0 To UBound($themeList) - 1
	  ; grabbing the id of the next theme
	  Local $nextThemeId = GetNextThemeId($themeList)

	  Send("^!r")
	  Sleep(1000)

	  Local $currentTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

	  ; ensure the current theme is actually the next theme in the list
	  If $currentTheme == $nextThemeId Then
		 $result = True
	  ElseIf $nextThemeId == $firstTheme Then
		 ; this means we have cycled through them all
		 $result = True
		 ResetRotateCurrentPref(UBound($themeList))
		 ExitLoop
	  Else
		 ;MsgBox(0, "", $currentTheme & @CRLF & $nextThemeId)
		 $result = False
		 ExitLoop
	  EndIf
   Next

   If $result Then
	 $sDescription = "Rotated through all the personas successfully with the rotate persona shortcut"
	 $testPassed = True
   Else
     $sDescription = "Did not rotate through all the personas successfully wih the rotate persona shortcut"
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Rotate Persona
; shortcut will change the theme to the next theme on the rotate list.
; Changed Ctrl + Alt + R to Shift + Alt + W
Func RotatePersona_DifferentKeyAndChar($themeList)
   Local $sDescription
   Local $testPassed = False

   ResetRotateCurrentPref(UBound($themeList))

   ; grabbing the id of the next theme
   Local $nextThemeId = GetNextThemeId($themeList)

   SetPsOption("rotshift", True)
   SetPsOption("rotcontrol", False)
   SetPsOption("rotkey", "W")

   ; use the new key combination to change to the next theme
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("+!w")
   Sleep(1000)

   Local $currentTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; ensure the current theme is actually the next theme in the list
   If $currentTheme == $nextThemeId Then
	  $sDescription = "the rotate persona shortcut changed the theme to the next theme on the list with the new combination : Shift + Alt + W"
	  $testPassed = True
   Else
	  ;MsgBox(0, "", $currentTheme & @CRLF & $nextThemeId)
      $sDescription = "the rotate persona shortcut did not change the theme to the next theme on the list with the new combination : Shift + Alt + W"
   EndIF

   ResetPsOption("rotcontrol") ;ctrl
   ResetPsOption("rotshift") ;shift
   ResetPsOption("rotkey") ;key

   Return FormatTestString($testPassed, $sDescription)

EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Rotate Persona
; shortcut will change the theme to the next theme on the rotate list.
; Changed Ctrl + Alt + R to Shift + Ctrl + Alt + R
Func RotatePersona_ExtraKey($themeList)
   Local $sDescription
   Local $testPassed = False

   ResetRotateCurrentPref(UBound($themeList))

   ; grabbing the id of the next theme
   Local $nextThemeId = GetNextThemeId($themeList)

   SetPsOption("rotshift", True)

   ; use the new key combination to change to the next theme
   Send("+^!r")
   Sleep(1500)

   ; ensure the current theme is actually the next theme in the list
   If ($nextThemeId == _FFPrefGet("lightweightThemes.selectedThemeID")) Then
	  $sDescription = "the rotate persona shortcut changed the theme to the next theme on the list with the new combination : Shift + Ctrl + Alt + R"
	  $testPassed = True
   Else
      $sDescription = "the rotate persona shortcut did not change the theme to the next theme on the list with the new combination : Shift + Ctrl + Alt + R"
   EndIf

   ResetPsOption("rotshift") ;shift

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Toggle Auto Switch
; shortcut will change the theme and enable "Switch every __ minutes" preference.
; Changed Ctrl + Alt + A to Shift + Alt + W
Func AutoSwitch_DifferentKeyAndChar()
   Local $sDescription
   Local $testPassed = False

   SetPsOption("autoshift", True)
   SetPsOption("autocontrol", False)
   SetPsOption("autokey", "W")

   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; use the new key combination to change theme and enable "Switch every __ minutes"
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("+!w")
   Sleep(500)

   ; grab the value for the "Switch every __ minutes" preference
   Local $isSwitchEnabled = GetPsOption("auto")

   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") AND Not $isSwitchEnabled Then
      $sDescription = "the auto switch shortcut did not change the theme or enabled the 'Switch every __ minutes' preference with the new combination: Shift + Alt + W"
   Else
      $sDescription = "the auto switch shortcut changed the theme and enabled the 'Switch every __ minutes' preference with the new combination: Shift + Alt + W"
	  $testPassed = True
   EndIf

   ResetPsOption("autocontrol") ;ctrl
   ResetPsOption("autoshift") ;shift
   ResetPsOption("autokey") ;key
   ResetPsOption("auto")

   Return FormatTestString($testPassed, $sDescription)
 EndFunc
 ;------------------------------------------------------------------------------
; Testing that the new shortcut key combination assigned to the Toggle Auto Switch
; shortcut will change the theme and enable "Switch every __ minutes" preference.
; Changed Ctrl + Alt + A to Shift + Ctrl + Alt + A
Func AutoSwitch_ExtraKey()
   Local $sDescription
   Local $testPassed = False

   SetPsOption("autoshift", True)

   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   ; use the new key combination to change theme and enable "Switch every __ minutes"
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("+^!a")
   Sleep(500)

   ; grab the value for the "Switch every __ minutes" preference
   Local $isSwitchEnabled = GetPsOption("auto")

   If $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") AND Not $isSwitchEnabled Then
      $sDescription = "the auto switch shortcut did not change the theme or enabled the 'Switch every __ minutes' preference with the new combination: Shift + Ctrl + Alt + A"
   Else
      $sDescription = "the auto switch shortcut changed the theme and enabled the 'Switch every __ minutes' preference with the new combination: Shift + Ctrl + Alt + A"
	  $testPassed = True
   EndIf

   ResetPsOption("autoshift") ;shift
   ResetPsOption("auto")

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------
; Testing that pressing the Toggle Auto Switch shortcut twice will change the
; theme once and disable the "Switch every __ minutes" preference.
Func AutoSwitch_DoublePress()
   Local $sDescription
   Local $testPassed = False

   Local $startTheme = _FFPrefGet("lightweightThemes.selectedThemeID")

   Send("^!a")
   Sleep(500)
   Send("^!a")
   Sleep(500)

   ; checking the current value for the switch preference
   Local $isSwitchEnabled = GetPsOption("auto")

   If $isSwitchEnabled AND $startTheme == _FFPrefGet("lightweightThemes.selectedThemeID") Then
      $sDescription = "Pressing the auto switch shortcut twice did not change the theme or disable the 'Switch every __ minutes' preference"
   Else
      $sDescription = "Pressing the auto switch shortcut twice changed the theme once and disabled the 'Switch every __ minutes' preference"
	  $testPassed = True
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------
; Testing that the Toggle Auto Switch shortcut disables the "Switch every __ minutes"
; preference if it is already enabled.
Func AutoSwitch_Disable()
   Local $sDescription
   Local $testPassed = False

   ; enable the "Switch every __minutes" preference
   SetPsOption("auto", True)

   ; use the shortcut to disable "Switch every __ minutes"
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Send("^!a")
   Sleep(500)

   ; checking the current value for the switch preference
   Local $isSwitchEnabled = GetPsOption("auto")

   If $isSwitchEnabled Then
      $sDescription = "While the 'Switch every __ minutes' preference was enabled, the auto switch shortcut did not disable it"
   Else
	  $sDescription = "While the 'Switch every __ minutes' preference was enabled, the auto switch shortcut was able to disable it"
	  $testPassed = True
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------
; Helper function to change the theme, except default
Func SelectTheme()
   ; ensure firefox window is active before proceeding
   OpenPersonaSwitcherToolsMenu()
   Sleep(500)
   Send("{ENTER}")
   Sleep(500)
EndFunc
;------------------------------------------------------------------------------
; Helper function to grab the next theme id in the rotate persona list
Func GetNextThemeId($themeList)
   Local $rotateCurrentIndex = GetPsOption("current")
   Local $arrayIndex = Mod($rotateCurrentIndex + 1, UBound($themeList))

   Return $themeList[$arrayIndex]
EndFunc
;------------------------------------------------------------------------------
; Helper function to manually reset the current index preference for the
; rotate persona shortcut
Func ResetRotateCurrentPref($themeListSize)
   While(GetPsOption("current") >= $themeListSize-1)
	  Send("^!r")
	  Sleep(500)
	  if(GetPsOption("current") == 0) Then
		 ExitLoop
	  EndIf
   WEnd
EndFunc