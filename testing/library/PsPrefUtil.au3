; ==========================================================
; Name ..........: OpenPersonaSwitcherPrefs
; Description ...: Opens Persona Switcher's options page
; Return Value ..: Success      - True
;                  Failure      - False
; ==============================================================================
Func OpenPersonaSwitcherPrefs()
   ; open addons page
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
	  MsgBox(64, "", "Unable to reach Persona Switcher preferences.")
	  return False
   EndIf
EndFunc



; ==========================================================
; Name ..........: ResetPersonaSwitcherPrefs
; Description ...: Resets all of Persona Switcher's preferences on the about:config page
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


Func GetPsOption(ByRef $sOption)
   Return _FFPrefGet("extensions.personaswitcher." & $sOption)
EndFunc

Func SetPsOption(ByRef $sOption, ByRef $value, $copyToClipboard = False)
   Local $oldValue = GetPsOption($sOption)
   If ($value == $oldValue Or _
		 ($value And $oldValue == 1) Or _
		 (Not $value And $oldValue == 0)) Then
	  Return False
   Else
	  Local $returnVal = True

	  OpenPersonaSwitcherPrefs()
	  TabToPref($sOption)

	  If isBool($value) Then
		 Send("{SPACE}")
		 Sleep(500)
	  Else
		 Send($value, 1)
		 Sleep(500)
	  EndIf

	  If $copyToClipboard Then
		 $returnVal = GetTextFromFocusedField()
	  EndIf

	  Send("{ENTER}")
	  WinWaitActive("[CLASS:MozillaWindowClass]")
	  Sleep(500)
	  Return $returnVal
   EndIf
EndFunc

Func ResetPsOption(ByRef $sOption)
   _FFPrefReset("extensions.personaswitcher." & $sOption)
EndFunc


Func GetTextFromFocusedField()
   Send("^a")
   Sleep(500)
   Send("^c")
   Sleep(500)
   Return ClipGet()
EndFunc

Func TabToPref(ByRef $sOption)
   Local $tabMap[40]

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


   For $i = 0 To UBound($tabMap) - 1
	  If ($tabMap[$i] = $sOption) Then
		 Send("{TAB " & $i & "}")
		 Sleep(500)
		 Return True
	  EndIf
   Next

   MsgBox(64, '', "Preference error")
   Return False
EndFunc
