Fork of John McLear's NFC Ring, set to build locally, instead of using PhoneGap Build.

This is the WP8 version based on the modified Android version
See WP8 and Android branches https://github.com/don/nfcring

Uses Cordova CLI 3.0.9 

    npm install cordova@3.0.9
    
Uses 3 plugins.

    cordova plugin add https://github.com/chariotsolutions/phonegap-nfc.git
    notifications-alert
    notifications-vibrate
    
Note that the barcode scanning functionality is removed for now until the barcode scanner is updated for Corodva 3.0

Cordova and the Windows Phone SDK must be installed to build.

Edit the code in www/ not under platforms

Deploy the changes to the wp8 project

    > cordova build

Open Visual Studio and deploy to a Windows Phone 8 Device
    $ cordova run
    
Some of the changes...

 * Refactor into as a single page app
 * Move action definition to a module
 * Remove sweetspot logic (that should be a separate app)
 * Improve NFC read and write code

Difference from the Android version
* Barcode scanner is disabled
* Exit is disabled
* Reading tags works, but you need to click "ignore" when windows prompts you about the tag. Then you can view the URI in a popup and optional open the URI in the PhoneGap InAppBrowser.
* Writing tags works, but unfortunately you'll get a prompt about windows reading the old contents of the tag while you're writing to the tag.

Basically this app is not very useful unless I can get WP8 to stop processing the tags when the app is in the forground. See https://github.com/chariotsolutions/phonegap-nfc/issues/61
