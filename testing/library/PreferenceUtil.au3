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
   _FFCmd('window.content.document.getElementsByAttribute("name", "Persona Switcher")[0].showPreferences();', 0)
   _FFLoadWait()
   Sleep(1000)
   return True

EndFunc


; ==========================================================
; Resets all of Persona Switcher's preferences on the about:config page
; ==============================================================================
Func ResetPersonaSwitcherPrefs()
   Local $prefs = GetPrefKeyArray()

   For $i = 0 To UBound($prefs) - 1
	  _FFPrefReset("extensions.personaswitcher." & $prefs[$i])
   Next
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
	  OpenPersonaSwitcherPrefs()
	  Local $sOptionId = GetIdFromPref($sOption)

	  If isBool($value) Then
		 Local $sValue = $value ? "true" : "false"
		 _FFCmd('window.content.document.getElementsByClassName("inline-options-browser")[0]._contentWindow.document.getElementById("' & $sOptionId & '").checked = ' & $sValue)
		 Sleep(500)
	  Else
		 _FFCmd('window.content.document.getElementsByClassName("inline-options-browser")[0]._contentWindow.document.getElementById("' & $sOptionId & '").value = ' & '"' & $value & '"')
		 Sleep(500)
	  EndIf

	  If $copyToClipboard Then
		 Return _FFCmd('window.content.document.getElementsByClassName("inline-options-browser")[0]._contentWindow.document.getElementById("' & $sOptionId & '").value')
	  EndIf

	  Return True
   EndIf

EndFunc


; ==========================================================
; Resets the value from the passed persona switcher preference
; Parameters - $sOption			String associated with preference to reset
; ==============================================================================
Func ResetPsOption(Const $sOption)
   _FFPrefReset("extensions.personaswitcher." & $sOption)
EndFunc


Func GetIdFromPref(Const $sOption)
   Local $prefMapKey = GetPrefKeyArray()
   Local $prefMapValue = GetPrefValueArray()

   For $i = 0 To UBound($prefMapKey) - 1
	  If ($prefMapKey[$i] = $sOption) Then
		 Return $prefMapValue[$i]
	  EndIf
   Next

   ; preference wasn't found
   MsgBox(64, 'PsPrefUtil Error', "'" & $sOption & "' was not found.")
   Exit(1)
EndFunc


; Copies the text from the focued field and returns the clipboard contents
Func GetTextFromFocusedField()
   Send("^a")
   Sleep(500)
   Send("^c")
   Sleep(500)
   Return ClipGet()
EndFunc


Func GetPrefKeyArray()
   Local $prefMapKey[46]

   $prefMapKey[0] = 'defshift'
   $prefMapKey[1] = 'defcontrol'
   $prefMapKey[2] = 'defalt'
   $prefMapKey[3] = 'defmeta'
   $prefMapKey[4] = 'defaccel'
   $prefMapKey[5] = 'defos'
   $prefMapKey[6] = 'defkey'

   $prefMapKey[7] = 'rotshift'
   $prefMapKey[8] = 'rotcontrol'
   $prefMapKey[9] = 'rotalt'
   $prefMapKey[10] = 'rotmeta'
   $prefMapKey[11] = 'rotaccel'
   $prefMapKey[12] = 'rotos'
   $prefMapKey[13] = 'rotkey'

   $prefMapKey[14] = 'autoshift'
   $prefMapKey[15] = 'autocontrol'
   $prefMapKey[16] = 'autoalt'
   $prefMapKey[17] = 'autometa'
   $prefMapKey[18] = 'autoaccel'
   $prefMapKey[19] = 'autoos'
   $prefMapKey[20] = 'autokey'

   $prefMapKey[21] = "accesskey"

   $prefMapKey[22] = 'activateshift'
   $prefMapKey[23] = 'activatecontrol'
   $prefMapKey[24] = 'activatealt'
   $prefMapKey[25] = 'activatemeta'
   $prefMapKey[26] = 'activateaccel'
   $prefMapKey[27] = 'activateos'
   $prefMapKey[28] = 'activatekey'

   $prefMapKey[29] = 'toolsshift'
   $prefMapKey[30] = 'toolscontrol'
   $prefMapKey[31] = 'toolsalt'
   $prefMapKey[32] = 'toolsmeta'
   $prefMapKey[33] = 'toolsaccel'
   $prefMapKey[34] = 'toolsos'
   $prefMapKey[35] = 'toolskey'

   $prefMapKey[36] = "auto"
   $prefMapKey[37] = "autominutes"
   $prefMapKey[38] = "random"
   $prefMapKey[39] = "startup-switch"
   $prefMapKey[40] = "preview"
   $prefMapKey[41] = "preview-delay"
   $prefMapKey[42] = "icon-preview"
   $prefMapKey[43] = "toolbox-minheight"

   $prefMapKey[44] = "tools-submenu"
   $prefMapKey[45] = "main-menubar"

   Return $prefMapKey
EndFunc


Func GetPrefValueArray()
   Local $prefMapValue[46]

   $prefMapValue[0] = "default-key-shift"
   $prefMapValue[1] = "default-key-control"
   $prefMapValue[2] = "default-key-alt"
   $prefMapValue[3] = "default-key-meta"
   $prefMapValue[4] = "default-key-accel"
   $prefMapValue[5] = "default-key-os"
   $prefMapValue[6] = "default-key"

   $prefMapValue[7] = "rotate-key-shift"
   $prefMapValue[8] = "rotate-key-control"
   $prefMapValue[9] = "rotate-key-alt"
   $prefMapValue[10] = "rotate-key-meta"
   $prefMapValue[11] = "rotate-key-accel"
   $prefMapValue[12] = "rotate-key-os"
   $prefMapValue[13] = "rotate-key"

   $prefMapValue[14] = "auto-key-shift"
   $prefMapValue[15] = "auto-key-control"
   $prefMapValue[16] = "auto-key-alt"
   $prefMapValue[17] = "auto-key-meta"
   $prefMapValue[18] = "auto-key-accel"
   $prefMapValue[19] = "auto-key-os"
   $prefMapValue[20] = "auto-key"

   $prefMapValue[21] = "access-key"

   $prefMapValue[22] = "activate-key-shift"
   $prefMapValue[23] = "activate-key-control"
   $prefMapValue[24] = "activate-key-alt"
   $prefMapValue[25] = "activate-key-meta"
   $prefMapValue[26] = "activate-key-accel"
   $prefMapValue[27] = "activate-key-os"
   $prefMapValue[28] = "activate-key"

   $prefMapValue[29] = "tools-key-shift"
   $prefMapValue[30] = "tools-key-control"
   $prefMapValue[31] = "tools-key-alt"
   $prefMapValue[32] = "tools-key-meta"
   $prefMapValue[33] = "tools-key-accel"
   $prefMapValue[34] = "tools-key-os"
   $prefMapValue[35] = "tools-key"

   $prefMapValue[36] = "auto"
   $prefMapValue[37] = "auto-minutes"
   $prefMapValue[38] = "random"
   $prefMapValue[39] = "startup-switch"
   $prefMapValue[40] = "preview"
   $prefMapValue[41] = "preview-delay"
   $prefMapValue[42] = "icon-preview"
   $prefMapValue[43] = "toolbox-minheight"

   $prefMapValue[44] = "tools-menu"
   $prefMapValue[45] = "main-menubar"

   Return $prefMapValue
EndFunc