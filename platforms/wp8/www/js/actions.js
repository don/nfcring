cordova.define("nfcring/actions",

function(require, exports, module) {
    module.exports = {
        twitter: {
            label: "Twitter",
            optionText: "What is your Twitter Username?",
            placeHolder: "@nfcring",
            prefix: "http://twitter.com/",
            format: function(option) {
                return this.prefix + option;
            }
        },
        facebook: {
            label: "Facebook",
            optionText: "What is your Facebook Page URL?",
            placeHolder: "http://facebook.com/ring.cake24",
            prefix: "http://facebook.com/",
            format: function(option) {
                return this.prefix + option;
            }
        },
        clone: {
            label: "Clone Ring",
            isClone: true,
            requiresString: false
        },
        website: {
            label: "Website",
            optionText: "What is the URL of the website?",
            placeHolder: "http://mclear.co.uk",
            format: function(option) {
                return option;
            }
        },
        etherpad: {
            label: "Etherpad",
            optionText: "What is your Pad URL?",
            placeHolder: "http://beta.etherpad.org/p/foowie",
            format: function(option) {
                return option;
            }
        },
        youtube: {
            label: "Youtube",
            optionText: "What is your Youtube Video / Channel?",
            placeHolder: "johnyma22",
            prefix: "http://youtube.com",
            format: function(option) {
                return this.prefix + option;
            }
        }
    };
});
