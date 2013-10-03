/*jshint quotmark: false, strict: false, browser: true */
/*global cordova, nfc, ndef, alert */

// actions are defined in external module
var actions = cordova.require('nfcring/actions');

var app = {
    currentAction: {},
    lastWriteAttempt: 0,
    lastReadAttempt: 0,
    writeMode: false,
    initialize: function() {
        this.bind();
    },
    bind: function() {
        document.addEventListener('deviceready', this.deviceready, false);
    },
    deviceready: function() {
        console.log('deviceready');

        app.addButtons();
        console.log('buttons');
        
        app.addActions();
        console.log('actions');
        

        nfc.addNdefListener(
            app.onNfc,
            function() {
                console.log("Success.  Listening for rings..");
            },
            function(reason) {
                console.log("NFC failed. " + JSON.stringify(reason));
                var message = "There was an error starting NFC.";

                if (reason === "NO_NFC") {
                    message = "No NFC hardware was found on this device.";
                } else if (reason === "NFC_DISABLED") {
                    message = "Please enable NFC in your device settings.";                    
                }
                navigator.notification.alert(message, function() {}, "NFC Required");
                $('#newActionButton, #readRingButton, #scanButton').attr('disabled', 'disabled');
            }
        );

    },
    onNfc: function(nfcEvent) {
        if (app.writeMode) {
            app.writeNfc(nfcEvent);
        } else {
            app.readNfc(nfcEvent);
        }
    },
    readNfc: function(nfcEvent) {
        console.log("readNfc");

        // WP8 only (for now)
        // Read max once per second
        if ((new Date() - app.lastReadAttempt) < 1000) {
            console.log("Reading too fast. Bailing out.");
            return;
        }
        
        app.lastReadAttempt = new Date();

        var records = nfcEvent.tag.ndefMessage,
            record;

        console.log(records);

        // a ring (or tag) can contain multiple NFC records
        // we're assuming there is one record for now
        record = records[0];

        // the tag contains a URI
        if (isType(record, ndef.TNF_WELL_KNOWN, ndef.RTD_URI)) {
            var uri = ndef.uriHelper.decodePayload(record.payload),
                callback = function(buttonIndex) {
                    if (buttonIndex === 1) {
                        window.open(uri);
                    }
                };
            navigator.notification.confirm(uri, callback, "URI", "View, Close");
        } else {
            // we don't know what type of data there is, attempt to display it anyway
            var payloadAsString = nfc.bytesToString(record.payload);
            navigator.notification.alert(payloadAsString);
        }
    },
    writeNfc: function(nfcEvent) {
        
        // WP8 only (for now)
        // Write max every 1 second
        if ((new Date() - app.lastWriteAttempt) < 1000) {
            console.log("Writing too fast. Bailing out.");
            return;
        }
        
        app.lastWriteAttempt = new Date();

        // TODO handle when format is null
        var uri = app.currentAction.format(app.currentAction.optionValue);

        console.log("Writing ", uri);

        // create a ndefMessage
        var ndefMessage = [
            ndef.uriRecord(uri)
        ];

        nfc.write(ndefMessage,
            function() {
                app.writeMode = false;
                navigator.notification.vibrate(100);
                console.log("Wrote " + JSON.stringify(ndefMessage));

                // Toast or updating the HTML would be a better UX
                navigator.notification.alert("Your ring is ready", function() {}, "Woohoo!");
            },
            function(reason) {
                navigator.notification.alert(
                    "Sorry, there was a problem writing your data. Please try again.",
                    function() {}, "Write Failed");
                console.log("Inlay write failed " + reason);
            }
        );
    },
    addButtons: function() {
        // bind buttons after device ready since actions need phonegap

        // main navigation
        $('#newActionButton').on('click', app.newAction);
        $('#scanButton').on('click', scanQR);
        $('#readRingButton').on('click', app.readRing);
        // Can WP8 exit or is it not allowed like on iOS?
        $('#exitButton').on('click', function() { navigator.notification.alert("Exit is disabled."); });

        // sub navigation
        $('#finishReadButton').on('click', app.home);
        $('#finishWriteButton').on('click', app.home);
        $('#finishFormButton').on('click', app.processForm);
    },
    addActions: function() {
        // go through each item in actions and render to UI
        $.each(actions, function(key, action) {

            if (!action.image) {
                action.image = key.toLowerCase() + ".png";
            }

            var a = $("<a></a>");
            a.click(function() { app.doAction(key); });
            a.addClass("ringAction paddedIcon");
            a.append("<img src=\"img/" + action.image + "\">");
            a.append(action.label);
            $(".action > .actionContents > .ringActions").append(a);
        });
    },
    home: function() {
        $('.step').hide();
        $("#landing").show();
        app.writeMode = false;
    },
    newAction: function() {
        $("#landing").hide();
        // TODO handle back button here
        $('#action').show();
    },
    readRing: function() {
        $('#landing').hide();
        $('#readRing').show();
    },
    doAction: function(actionKey) {

        $('.step').hide();

        var action = actions[actionKey];
        app.currentAction = action;

        $('.option > .actionName').hide();
        $('.option > .actionContents > form > input').attr("placeholder", action.placeHolder);
        $('.option > .actionContents > form > label').text(action.optionText);
        $('#optionInput').focus();
        $('#action').val(action.label);

        $('#option').show();
    },
    processForm: function(e) {

        if (e) { e.preventDefault(); }

        // get the data from the form
        app.currentAction.optionValue = $('#optionInput').val();
        $('#optionInput').val("");
        $('.step').hide();
        $('#writeRing').show();
        app.writeMode = true;
    }
};

// TODO this should go in phonegap-nfc
function isType(record, tnf, rtd) {
    if (record.tnf === tnf) { // TNF is 3-bit
        var recordType;
        if (typeof(rtd) === 'string') {
            recordType = rtd;
        } else {
            recordType = nfc.bytesToString(rtd);
        }
        return (nfc.bytesToString(record.type) === recordType);
    }
    return false;
}

// website generates a QR code containing JSON
// { "action": "twitter", "option": "nfcring" }
// The user can scan it and we'll write a tag
function scanQR() {
    navigator.notification.alert("QR Scanning is disabled.");
    // var scanner = cordova.require("cordova/plugin/BarcodeScanner");
    // scanner.scan(function(result) {
    // 
    //     if (result.cancelled) { // user cancelled the scan
    //         return;
    //     }
    // 
    //     try {
    //         var qrData = result.text,
    //             json = JSON.parse(qrData),
    //             actionName = json.action,
    //             optionValue = json.option;
    // 
    //         if (actionName) {
    //             if (actions[actionName]) {
    //                 app.currentAction = actions[actionName];
    //                 app.currentAction.optionValue = optionValue; // could be null
    //                 app.writeMode = true;
    //                 $('#landing').hide();
    //                 $('#writeRing').show();
    //                 app.writeMode = true;
    //             } else {
    //                 alert("I don't know how to process action '" + actionName + "'");
    //             }
    //         } else {
    //             alert("No action was defined in QR Data " + qrData);
    //         }
    //     } catch(e) {
    //         alert("Error parsing QR Data " + qrData);
    //     }
    // 
    // }, function() {
    //     alert('uh oh error - please let us know!');
    // });
}
