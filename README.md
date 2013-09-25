Fork of John McLear's NFC Ring, set to build locally, instead of using PhoneGap Build.

Uses Cordova CLI 2.9.7 for compatibility with PhoneGap Build.

    npm install cordova@2.9.7 -g
    
Uses 2 plugins

    cordova plugin add https://github.com/chariotsolutions/phonegap-nfc.git
    cordova plugin add http://github.com/phonegap-build/BarcodeScanner.git
    
Cordova and the Android SDK must be installed to build.

Compile and deploy to device with 

    $ cordova run
    
Some of the changes...

 * Refactor into as a single page app
 * Move action definition to a module
 * Remove sweetspot logic (that should be a separate app)
 * Improve NFC read and write code
 * Additional handling to QR scanning
 * ...
 
Some known issues
 * back button doesn't always do the right thing
 * clone does not work


