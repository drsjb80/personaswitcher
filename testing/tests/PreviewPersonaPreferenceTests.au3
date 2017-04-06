#include "..\library\PSTestingLibrary.au3"

;-----------------------------------------------------------------------------;
; This script tests for proper functionality of Persona Switcher's preview
; persona preferences

Local $testName = "Preview Persona Preferences Tests" ;
Local $tests[5]

InitializeFirefox()
Local $themeList = GetInstalledThemeIds()

; run tests and store results
$tests[0] = PreviewPersonaMinDelayTime()
$tests[1] = PreviewPersonaMaxDelayTime()
; Enable the Preview Persona preference with 10000 ms for rest of tests
EnablePreviewPersonaWithTime()
$tests[2] = PreviewThemeOnIcon($themeList)
$tests[3] = PreviewThemeOnPSwitcherMenuBar($themeList)
$tests[4] = PreviewThemeOnToolsMenu($themeList)

; save results to file
SaveResultsToFile($tests, $testName)
ResetPersonaSwitcherPrefs()
EndFirefox()

;---------------------------------------- tests ----------------------------------------;


; Testing in the Persona Switcher icon menu, that when we hover over a theme,
; a preview of that theme is displayed after 10 seconds.
Func PreviewThemeOnIcon($themeList)
   Local $sDescription
   Local $testPassed = False

   ResetToDefaultTheme()
   Local $previewThemeId = StringRegExpReplace($themeList[0], "recommended-", "")
   Local $defaultTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
   Local $startPreview = GetDisplayedThemeBackground()

   OpenPersonaSwitcherButton()
   Send("{DOWN 2}")
   Sleep(9500)

   ; grab background right before change
   $checkPreview = GetDisplayedThemeBackground()

   Sleep(1000)

   ; grab the "preview" theme image url after change and search for the theme id
   Local $previewImageUrl = GetDisplayedThemeBackground()
   Local $isPreviewTheme = StringRegExp($previewImageUrl, $previewThemeId, 0) ;return true/false

   ;getting out of the preview menu
   Send("{ESC}")
   Sleep(500)

   Local $themeHasChanged = ($defaultTheme <> _FFPrefGet("lightweightThemes.selectedThemeID"))

   If ($startPreview == $previewImageUrl) Then
	  $sDescription = "From the icon menu bar, the theme preview did not appear in 10 seconds."
   ElseIf ($checkPreview == $previewImageUrl) Or ($startPreview <> $checkPreview) Then
	  $sDescription = "From the icon menu bar, the previewed theme displayed too quickly."
   ElseIf ($themeHasChanged) Then
	  $sDescription = "From the icon menu bar, previewing a theme also changed the active theme."
   Else
	  $testPassed = True
	  $sDescription = "From the icon menu bar, the correct theme preview appeared in 10 seconds and did not change the active theme."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

;-----------------------------------------------------------------------------;
; Testing in the Persona Switcher main menu, that when we hover over a theme,
; a preview of that theme is displayed after 10 seconds.
Func PreviewThemeOnPSwitcherMenuBar($themeList)
   Local $sDescription
   Local $testPassed = False

   ;Set menu preference
   SetPsOption('main-menubar', True)

   ; grab default theme
   ResetToDefaultTheme()
   Local $previewThemeId = StringRegExpReplace($themeList[0], "recommended-", "")
   Local $defaultTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
   Local $startPreview = GetDisplayedThemeBackground()

   ; select a theme from the main menu and wait 10 secs
   OpenPersonaSwitcherMenuBar()
   Send("{DOWN}")
   Sleep(9500)

   ; grab background right before change
   $checkPreview = GetDisplayedThemeBackground()

   Sleep(1000)

   ; grab the "preview" theme image url after change and search for the theme id
   Local $previewImageUrl = GetDisplayedThemeBackground()
   Local $isPreviewTheme = StringRegExp($previewImageUrl, $previewThemeId, 0) ;return true/false

   ;getting out of the preview menu
   Send("{ESC}")
   Sleep(500)

   Local $themeHasChanged = ($defaultTheme <> _FFPrefGet("lightweightThemes.selectedThemeID"))

   If ($startPreview == $previewImageUrl) Then
	  $sDescription = "From the main menu bar, the theme preview did not appear in 10 seconds."
   ElseIf ($checkPreview == $previewImageUrl) Or ($startPreview <> $checkPreview) Then
	  $sDescription = "From the main menu bar, the previewed theme displayed too quickly."
   ElseIf ($themeHasChanged) Then
	  $sDescription = "From the main menu bar, previewing a theme also changed the active theme."
   Else
	  $testPassed = True
	  $sDescription = "From the main menu bar, the correct theme preview appeared in 10 seconds and did not change the active theme."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc
;-----------------------------------------------------------------------------;
; Testing in the Persona Switcher tools menu, that when we hover over a theme,
; a preview of that theme is displayed after 10 seconds.
Func PreviewThemeOnToolsMenu($themeList)
   Local $sDescription
   Local $testPassed = False

   ; Set menu preference
   SetPsOption('tools-submenu', True)

   ; grab default theme
   ResetToDefaultTheme()
   Local $previewThemeId = StringRegExpReplace($themeList[0], "recommended-", "")
   Local $defaultTheme = _FFPrefGet("lightweightThemes.selectedThemeID")
   Local $startPreview = GetDisplayedThemeBackground()

   ;opening the toolbar menu and previewing a theme
   OpenPersonaSwitcherToolsMenu()
   Send("{DOWN}")
   Sleep(9500)

   ; grab background right before change
   $checkPreview = GetDisplayedThemeBackground()

   Sleep(1000)

   ; grab the "preview" theme image url after change and search for the theme id
   Local $previewImageUrl = GetDisplayedThemeBackground()
   Local $isPreviewTheme = StringRegExp($previewImageUrl, $previewThemeId, 0) ;return true/false

   ;getting out of the preview menu
   Send("{ESC}")
   Sleep(500)

   Local $themeHasChanged = ($defaultTheme <> _FFPrefGet("lightweightThemes.selectedThemeID"))

   If ($startPreview == $previewImageUrl) Then
	  $sDescription = "From the tools menu, the theme preview did not appear in 10 seconds."
   ElseIf ($checkPreview == $previewImageUrl) Or ($startPreview <> $checkPreview) Then
	  $sDescription = "From the tools menu, the previewed theme displayed too quickly."
   ElseIf ($themeHasChanged) Then
	  $sDescription = "From the tools menu, previewing a theme also changed the active theme."
   Else
	  $testPassed = True
	  $sDescription = "From the tools menu, the correct theme preview appeared in 10 seconds and did not change the active theme."
   EndIf

   Return FormatTestString($testPassed, $sDescription)
EndFunc

;-----------------------------------------------------------------------------;
; Testing that the min value of the preference is 0 and nothing less can be entered.
Func PreviewPersonaMinDelayTime()
   Local $sDescription
   Local $testPassed = False

   Local $negativeValueCopy = SetPsOption('preview-delay', "-1", True)
   Local $zeroValueCopy = SetPsOption('preview-delay', "0", True)

   ; check that value is set to the min
   If $zeroValueCopy == "0" AND $negativeValueCopy <> "-1" Then
	  $testPassed = True
      $sDescription = "value -1 for the preference was not accepted, but value 0 was accepted because the min is 0"
   Else
      $sDescription = "values -1 and 0 for the preference were both accepted even though the min is 0"
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc
;------------------------------------------------------------------------------------
; Testing that the max value of the preference is 10000 and nothing larger
; can be entered.
Func PreviewPersonaMaxDelayTime()
   Local $sDescription
   Local $testPassed = False

   Local $valueCopy = SetPsOption('preview-delay', "10001", True)

   ; check that value is set to the max
   If $valueCopy == "10000" Then
	  $testPassed = True
      $sDescription = "the value 10001 was not accepted for the preference because the max is 10000"
   Else
      $sDescription = "the value 10001 was accepted for the preference even though the max is 10000"
   EndIf
   Return FormatTestString($testPassed, $sDescription)
EndFunc


;------------------------------------ helper functions ---------------------------------;


Func EnablePreviewPersonaWithTime()
   ;Set preference value to 10000ms (10 sec)
   SetPsOption('preview', True)
   SetPsOption('preview-delay', "10000")
   RestartFirefox()
EndFunc