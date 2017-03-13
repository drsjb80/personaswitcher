; Persona Switcher Testing Library
; includes functions required to run Persona Switcher's automated tests

#include <FF V0.6.0.1b-15.au3>
#include <Array.au3>
#include <File.au3>
#include <Date.au3>
#include <Misc.au3>

#include "PsTestUtil.au3"
#include "PsPrefUtil.au3"



; ==========================================================
; Name ..........: PersonaSwitcherRotate
; Description ...: Call's Persona Switcher's rotate() function
; ==============================================================================
Func PersonaSwitcherRotate()
   _FFCmd('Components.classes["@mozilla.org/appshell/window-mediator;1"]' & _
   '.getService(Components.interfaces.nsIWindowMediator)' & _
   '.getMostRecentWindow("navigator:browser")' & _
   '.PersonaSwitcher.rotate()')
EndFunc



; ==========================================================
; Name ..........: ResetToDefaultTheme
; Description ...: Resets Firefox's theme to the default theme through Persona Switcher
; Return Value ..: ThemeID is empty string      - True
;                  ThemeID is not empty string  - False
; ==============================================================================
Func ResetToDefaultTheme()
   _FFCmd("PersonaSwitcher.setDefault()")
   Sleep(500)

   If _FFPrefGet("lightweightThemes.selectedThemeID") == "" Then
	  return True
   Else
	  return False
   EndIf
EndFunc



; ==========================================================
; Name ..........: ResetToDefaultThemeFF
; Description ...: Resets Firefox's theme to the default theme through the appearance page
; Return Value ..: Theme changed to default - True
;                  Theme unchanged          - False
; ==============================================================================
Func ResetToDefaultThemeFF()
   If _FFPrefGet("lightweightThemes.selectedThemeID") == "" Then
	  return False
   EndIf

   ; open addons page
   _FFTabAdd("about:addons")
   _FFLoadWait()

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

   _FFTabClose()
   _FFLoadWait()
   Sleep(1000)

   If _FFPrefGet("lightweightThemes.selectedThemeID") == "" Then
	  return True
   Else
	  return False
   EndIf
EndFunc



; ==========================================================
; Name ..........: OpenPersonaSwitcherButton
; Description ...: Opens the popup associated with the Persona Switcher button loacted in the navigator toolbar
; Return Value ..: Success      - 1
;                  Failure      - 0
; ==============================================================================
Func OpenPersonaSwitcherButton()
   Local $PSDocument
   Local $PSButton
   Local $PSPopup
   Local $PSmsg = 'try{PSDocument=Components.classes["@mozilla.org/appshell/window-mediator;1"].getService(Components.interfaces.nsIWindowMediator).getMostRecentWindow("navigator:browser").document;PSButton=PSDocument.getElementsByAttribute("id", "personaswitcher-button")[0];PSPopup=PSDocument.getElementsByAttribute("id", "personaswitcher-button-popup")[0];PSPopup.openPopup(PSButton, "after_start", 0,0,false,false,null);}catch(e){"Unable to open Persona Switcher Button";};'
   return __FFSend($PSmsg)
EndFunc



; ==========================================================
; Name ..........: GetListOfThemeIds
; Description ...: Grabs the id's of the installed themes, except the defaults
; Return Value ..: array of theme ids
; ==============================================================================
Func GetListOfThemeIds()
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
; Name ..........: GetAllThemeIds
; Description ...: Grabs the id's of the installed themes,
;                  appends dark and light themes to end of list
; Return Value ..: array of theme ids
; ==============================================================================
Func GetAllThemeIds()
   Local $themeIdList = GetListOfThemeIds()
   Local $devThemes = ["firefox-compact-light@mozilla.org", "firefox-compact-dark@mozilla.org"]
   _ArrayAdd($themeIdList, $devThemes)
   Return $themeIdList
EndFunc



; ==========================================================
; Name ..........: GetDisplayedThemeBackground
; Description ...: Grabs the local URL of the current displayed Firefox theme's background image
; Return Value ..: Success      - URL for background image of displayed theme
;                  Failure      - False
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
