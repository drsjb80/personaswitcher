; Persona Switcher Testing Library
; includes all other library files for Persona Switcher's automated tests.
; contains functions related to interacting with Persona Switcher.

#include <FF V0.6.0.1b-15.au3>
#include <Array.au3>
#include <File.au3>
#include <Date.au3>
#include <Misc.au3>

#include "FirefoxUtil.au3"
#include "PreferenceUtil.au3"
#include "ResultsWriter.au3"


; ==========================================================
; Call's Persona Switcher's rotate() function
; ==============================================================================
Func PersonaSwitcherRotate()
   _FFCmd('Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
   '.getService(Components.interfaces.nsIWindowMediator)' & _
   '.getMostRecentWindow("navigator:browser")' & _
   '.PersonaSwitcher.rotate()')
EndFunc


; ==========================================================
; Resets Firefox's theme to the default theme through Persona Switcher
; Returns - ThemeID is empty string			True
;           ThemeID is not empty string		False
; ==============================================================================
Func ResetToDefaultThemePS()
   _FFCmd("PersonaSwitcher.setDefault()")
   Sleep(500)

   If _FFPrefGet("lightweightThemes.selectedThemeID") == "" Then
	  return True
   Else
	  return False
   EndIf
EndFunc


; ==========================================================
; Opens the popup associated with the Persona Switcher button loacted in the navigator toolbar
; Returns - Success			1
;           Failure			0
; ==============================================================================
Func OpenPersonaSwitcherButton()
   Local $PSDocument
   Local $PSButton
   Local $PSPopup
   Local $PSmsg = 'try{PSDocument=Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
	  '.getService(Components.interfaces.nsIWindowMediator)' & _
	  '.getMostRecentWindow("navigator:browser").document;' & _
	  'PSButton=PSDocument.getElementsByAttribute("id", "personaswitcher-button")[0];' & _
	  'PSPopup=PSDocument.getElementsByAttribute("id", "personaswitcher-button-popup")[0];' & _
	  'PSPopup.openPopup(PSButton, "after_start", 0,0,false,false,null);}' & _
	  'catch(e){"Unable to open Persona Switcher Button";};'
   return __FFSend($PSmsg)
EndFunc


; ==========================================================
; Opens the popup associated with the Persona Switcher tools menu
; ==============================================================================
Func OpenPersonaSwitcherToolsMenu()
   Local $browserxul = 'Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
	  '.getService(Components.interfaces.nsIWindowMediator)' & _
	  '.getMostRecentWindow("navigator:browser").document'

   _FFCmd($browserxul & '.getElementsByAttribute(' & _
	  '"id", "menu_ToolsPopup")[0].showPopup()')
   _FFCmd($browserxul & '.getElementsByAttribute(' & _
	  '"id", "personaswitcher-tools-submenu-popup")[0].showPopup()')

   Sleep(500)
   Send("{RIGHT}")
   Sleep(500)
EndFunc


; ==========================================================
; Opens the popup associated with the Persona Switcher main menubar
; ==============================================================================
Func OpenPersonaSwitcherMenuBar()
   Local $browserxul = 'Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
	  '.getService(Components.interfaces.nsIWindowMediator)' & _
	  '.getMostRecentWindow("navigator:browser").document'

   _FFCmd($browserxul & '.getElementsByAttribute(' & _
	  '"id", "personaswitcher-main-menubar-popup")[0].showPopup()')

   Sleep(500)
   Send("{DOWN}")
   Sleep(500)
EndFunc