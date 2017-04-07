; This library contains functions regarding interacting With
; Firefox. All tests should start, end, and restart Firefox
; by calling these functions.


; ==========================================================
; Starts Firefox Developer Edition, connects to it through MozRepl, then
; waits for the Firefox window to be active
; Returns - The process ID of the started Firefox window
; ==============================================================================
Func InitializeFirefox()
   If _Singleton("PSTest", 1) = 0 Then
	  If IsDeclared("testName") Then
		 MsgBox(64, "Warning", "'" & $testName & "' was not started, an automated test is already running.")
	  Else
		 MsgBox(64, "Warning", "New test was not started, an automated test is already running.")
	  EndIf
	  Exit(-1)
   EndIf

   If ProcessExists("firefox.exe") Then
	  Local $iMsgBoxAnswer = MsgBox(33, "Firefox is already running", "Please close all Firefox processes, then hit 'Ok' to proceed.")
	  If $iMsgBoxAnswer == 1 Then
		 Sleep(3000)
		 If ProcessExists("firefox.exe") Then
			Local $iMsgBoxAnswer = MsgBox(64, "Firefox is still running", "Firefox was not closed, aborting test.")
			Exit(0)
		 EndIf
	  Else
		 Exit(0)
	  EndIf
   EndIf

   $FF = @ProgramFilesDir & "\Firefox Developer Edition\firefox.exe"
   If FileExists($FF) Then
	  Local $PID = Run($FF, "", @SW_SHOWMAXIMIZED)
   Else
	  MsgBox(64, $FF, "Does not exists. Aborting tests.")
	  Exit(1)
   EndIf

   ; Wait for the Firefox window to load
   ProcessWait($PID)
   WinWaitActive("[CLASS:MozillaWindowClass]")

   ; connect to a running Firefox with MozRepl
   If _FFConnect(Default, Default, 10000) Then
	  ; ensure firefox window is active before proceeding
	  _FFLoadWait()
	  ResetPersonaSwitcherPrefs()
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Return $PID
   Else
     MsgBox(64, "", "Can't connect to Firefox. Aborting tests.")
	 Exit(1)
   EndIf
EndFunc


; ==========================================================
; Resets PersonaSwitcher's preferences, then and disconnects from Firefox
; Returns - Success			1
;           Failure			0
; ==============================================================================
Func EndFirefox()
   ResetPersonaSwitcherPrefs()
   _FFWindowClose()
   Return _FFDisconnect()
EndFunc


; ==========================================================
; Closes Firefox and starts a new session
; Returns - The process ID of the started Firefox window
; ==============================================================================
Func RestartFirefox()
   _FFWindowClose()
   _FFDisConnect()

   While ProcessExists("firefox.exe") Or _FFIsConnected()
	  Sleep(250)
   WEnd

   $FF = @ProgramFilesDir & "\Firefox Developer Edition\firefox.exe"
   Local $PID = Run($FF, "", @SW_SHOWMAXIMIZED)
   ProcessWait($PID)
   WinWaitActive("[CLASS:MozillaWindowClass]")

   ; connect to a running Firefox with MozRepl
   If _FFConnect(Default, Default, 10000) Then
	  ; ensure firefox window is active before proceeding
	  _FFLoadWait()
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Return $PID
   Else
	  MsgBox(64, "", "Can't connect to Firefox. Aborting tests.")
	  Exit(1)
   EndIf
EndFunc


; ==========================================================
; Resets Firefox's theme to the default theme through the appearance page
; Returns - Theme changed to default	True
;           Theme unchanged				False
; ==============================================================================
Func ResetToDefaultTheme()
   WinActivate("[CLASS:MozillaWindowClass]")
   WinWaitActive("[CLASS:MozillaWindowClass]")

   If _FFPrefGet("lightweightThemes.selectedThemeID") == "" Then
	  return False
   EndIf

   If Not (_FFTabGetSelected("label") == "Add-ons Manager") Then
	  _FFTabAdd("about:addons")
	  _FFLoadWait()
   EndIf

   ; get to the appearences menu on the sidebar
   _FFClick("category-theme", "id", 0)
   _FFLoadWait()

   ; send JavaScript to disable active themes
   _FFCmd("window.content.document" & _
	  ".getElementsByAttribute('active', 'true')[0]" & _
	  ".userDisabled = true", 0)
   _FFCmd("window.content.document" & _
	  ".getElementsByAttribute('active', 'true')[" & _
		 "window.content.document" & _
		 ".getElementsByAttribute('active', 'true').length - 1" & _
	  "].userDisabled = true", 0)

   If _FFPrefGet("lightweightThemes.selectedThemeID") == "" Then
	  return True
   Else
	  return False
   EndIf
EndFunc


; ==========================================================
; Grabs the id's of the installed themes, except the defaults
; Returns - array of theme ids
; ==============================================================================
Func GetInstalledThemeIds()
   ; Grab json list from preferences and parse for theme ids
   Local $jsonThemeList = _FFPrefGet("lightweightThemes.usedThemes")
   Local $themeIdList = StringRegExp($jsonThemeList, '("id":"[^\"]*")', 3) ; Regex for format "id":"286995"

   ; Pass in only the id of a theme into the themeIdList array
   For $i = 0 To UBound($themeIdList) - 1
	  $themeIdList[$i] = StringTrimRight(StringTrimLeft($themeIdList[$i], 6), 1)
	  Next
   return $themeIdList
EndFunc


; ==========================================================
; Grabs the id's of the installed themes, appends dark and light themes to end of list
; Returns - array of theme ids
; ==============================================================================
Func GetAllThemeIds()
   Local $themeIdList = GetInstalledThemeIds()
   Local $devThemes = ["firefox-compact-light@mozilla.org", "firefox-compact-dark@mozilla.org"]
   _ArrayAdd($themeIdList, $devThemes)
   Return $themeIdList
EndFunc


; ==========================================================
; Grabs the local URL of the current displayed Firefox theme's background image
; Returns - Success		URL for background image of displayed theme
;           Failure 	False
; ==============================================================================
Func GetDisplayedThemeBackground()
   Local $Cmd = _FFCmd('getComputedStyle(' & _
		 'Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
		 '.getService(Components.interfaces.nsIWindowMediator)' & _
		 '.getMostRecentWindow("navigator:browser").document' & _
		 '.getElementsByAttribute("id", "main-window")[0]' & _
	  ').backgroundImage', 0)
   return StringTrimRight(StringTrimLeft($Cmd, 5), 2)
EndFunc