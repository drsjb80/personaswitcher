; This library contains functions related to getting, setting, and
; resetting Persona Switcher's preferences. Tests that interface
; with Persona Switcher's preferences should do so through these
; functions.


; ==========================================================
; Opens Persona Switcher's options page. Ends calling script on failure
; ==============================================================================
Func OpenPersonaSwitcherPrefs()
   WinActivate("[CLASS:MozillaWindowClass]")
   WinWaitActive("[CLASS:MozillaWindowClass]")

   If Not (_FFTabGetSelected("label") == "Add-ons Manager") Then
	  _FFTabAdd("about:addons")
	  _FFLoadWait()
   EndIf

   ; get to the extensions menu on the sidebar
   _FFClick("category-extension", "id", 0)
   _FFLoadWait()

   ; send JavaScript to open prefs
   _FFCmd("window.content.document.getElementsByAttribute('name', 'Persona Switcher')[0].showPreferences()", 0)

   ; wait at most 3 seconds for the preferences window to be open
   If WinWaitActive("Persona Switcher preferences", "", 3) Then
	  return True
   Else
	  MsgBox(64, "", "Unable to reach Persona Switcher preferences, aborting tests")
	  Exit(1)
   EndIf
EndFunc


; ==========================================================
; Resets all of Persona Switcher's preferences on the about:config page
; ==============================================================================
Func ResetPersonaSwitcherPrefs()
   _FFPrefReset("extensions.personaswitcher.accesskey")
   _FFPrefReset("extensions.personaswitcher.activateaccel")
   _FFPrefReset("extensions.personaswitcher.activatealt")
   _FFPrefReset("extensions.personaswitcher.activatecontrol")
   _FFPrefReset("extensions.personaswitcher.activatekey")
   _FFPrefReset("extensions.personaswitcher.activatemeta")
   _FFPrefReset("extensions.personaswitcher.activateos")
   _FFPrefReset("extensions.personaswitcher.activateshift")
   _FFPrefReset("extensions.personaswitcher.auto")
   _FFPrefReset("extensions.personaswitcher.autoaccel")
   _FFPrefReset("extensions.personaswitcher.autoalt")
   _FFPrefReset("extensions.personaswitcher.autocontrol")
   _FFPrefReset("extensions.personaswitcher.autokey")
   _FFPrefReset("extensions.personaswitcher.autometa")
   _FFPrefReset("extensions.personaswitcher.autominutes")
   _FFPrefReset("extensions.personaswitcher.autoos")
   _FFPrefReset("extensions.personaswitcher.autoshift")
   _FFPrefReset("extensions.personaswitcher.current")
   _FFPrefReset("extensions.personaswitcher.debug")
   _FFPrefReset("extensions.personaswitcher.defaccel")
   _FFPrefReset("extensions.personaswitcher.defalt")
   _FFPrefReset("extensions.personaswitcher.defcontrol")
   _FFPrefReset("extensions.personaswitcher.defkey")
   _FFPrefReset("extensions.personaswitcher.defmeta")
   _FFPrefReset("extensions.personaswitcher.defos")
   _FFPrefReset("extensions.personaswitcher.defshift")
   _FFPrefReset("extensions.personaswitcher.fastswitch")
   _FFPrefReset("extensions.personaswitcher.icon-preview")
   _FFPrefReset("extensions.personaswitcher.main-menubar")
   _FFPrefReset("extensions.personaswitcher.notification-workaround")
   _FFPrefReset("extensions.personaswitcher.preview")
   _FFPrefReset("extensions.personaswitcher.preview-delay")
   _FFPrefReset("extensions.personaswitcher.random")
   _FFPrefReset("extensions.personaswitcher.rotaccel")
   _FFPrefReset("extensions.personaswitcher.rotalt")
   _FFPrefReset("extensions.personaswitcher.rotcontrol")
   _FFPrefReset("extensions.personaswitcher.rotkey")
   _FFPrefReset("extensions.personaswitcher.rotmeta")
   _FFPrefReset("extensions.personaswitcher.rotos")
   _FFPrefReset("extensions.personaswitcher.rotshift")
   _FFPrefReset("extensions.personaswitcher.startup-switch")
   _FFPrefReset("extensions.personaswitcher.static-popups")
   _FFPrefReset("extensions.personaswitcher.toolbox-maxheight")
   _FFPrefReset("extensions.personaswitcher.toolbox-minheight")
   _FFPrefReset("extensions.personaswitcher.tools-submenu")
EndFunc


; ==========================================================
; Returns the value from the passed persona switcher preference
; Parameters - $sOption			String associated with preference to get
; ==============================================================================
Func GetPsOption(Const $sOption)
   WinWaitActive("[CLASS:MozillaWindowClass]")
   Return _FFPrefGet("extensions.personaswitcher." & $sOption)
EndFunc


; ==========================================================
; Sets the value of the passed persona switcher preference
; Parameters - $sOption			String associated with preference to set
;              $value			Value to set preference
;              $copyToClipboard	Copy the text field of this preference after setting it
; ==============================================================================
Func SetPsOption(Const $sOption, Const $value, $copyToClipboard = False)
   Local $oldValue = GetPsOption($sOption)
   If Not $copyToClipboard And ($value == $oldValue Or _
		 ($value And $oldValue == 1) Or _
		 (Not $value And $oldValue == 0)) Then
	  Return False
   Else
	  Local $returnVal = True

	  OpenPersonaSwitcherPrefs()
	  TabToPref($sOption)

	  If isBool($value) Then
		 Sleep(500)
		 Send("{SPACE}")
		 Sleep(500)
	  Else
		 Send($value, 1)
		 Sleep(500)
	  EndIf

	  Send("{ENTER}")
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Sleep(1000)

	  If $copyToClipboard Then
		 OpenPersonaSwitcherPrefs()
		 TabToPref($sOption)
		 $returnVal = GetTextFromFocusedField()
		 Send("{ENTER}")
		 WinWaitActive("[CLASS:MozillaWindowClass]")
	  EndIf

	  Return $returnVal
   EndIf
EndFunc


; ==========================================================
; Resets the value from the passed persona switcher preference
; Parameters - $sOption			String associated with preference to reset
; ==============================================================================
Func ResetPsOption(Const $sOption)
   _FFPrefReset("extensions.personaswitcher." & $sOption)
EndFunc



; Copies the text from the focued field and returns the clipboard contents
Func GetTextFromFocusedField()
   Send("^a")
   Sleep(500)
   Send("^c")
   Sleep(500)
   Return ClipGet()
EndFunc

; Tabs to the passed in preference (assumes persona switcher's option page is open)
Func TabToPref(Const $sOption)
   Local $tabMap[40]

   ; index = # of tabs to reach preference
   $tabMap[0] = 'defshift'
   $tabMap[1] = 'defcontrol'
   $tabMap[5] = 'defos'
   $tabMap[6] = 'defkey'
   $tabMap[7] = 'rotshift'
   $tabMap[8] = 'rotcontrol'
   $tabMap[13] = 'rotkey'
   $tabMap[14] = 'autoshift'
   $tabMap[15] = 'autocontrol'
   $tabMap[20] = 'autokey'
   $tabMap[21] = 'accesskey'
   $tabMap[22] = 'activateshift'
   $tabMap[23] = 'activatecontrol'
   $tabMap[24] = 'activatealt'
   $tabMap[28] = 'activatekey'
   $tabMap[29] = 'auto'
   $tabMap[30] = 'autominutes'
   $tabMap[31] = 'random'
   $tabMap[32] = 'startup-switch'
   $tabMap[33] = 'preview'
   $tabMap[34] = 'preview-delay'
   $tabMap[35] = 'icon-preview'
   $tabMap[37] = 'toolbox-minheight'
   $tabMap[38] = 'tools-submenu'
   $tabMap[39] = 'main-menubar'

   WinWaitActive("Persona Switcher preferences")

   For $i = 0 To UBound($tabMap) - 1
	  If ($tabMap[$i] = $sOption) Then
		 Send("{TAB " & $i & "}")
		 Sleep(500)
		 Return True
	  EndIf
   Next

   ; preference wasn't found
   MsgBox(64, 'PsPrefUtil Error', "'" & $sOption & "' was not found")
   Exit(1)
EndFunc
