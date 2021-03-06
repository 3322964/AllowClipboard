﻿///<reference path="references.ts" />

//Runs in the context of the webpage but isolated.
module AllowClipboard.ContentScript {
    var userAllowedClipboard:boolean;

    /* Add the client API to the web page */
    var clientScript = document.createElement('script');
    clientScript.src = chrome.extension.getURL('allowClipboardClient.js');
    document.head.appendChild(clientScript);

    var commonScript = document.createElement('script');
    commonScript.src = chrome.extension.getURL('common.js');
    document.head.appendChild(commonScript);

    /* Add event listener for AllowClipboard messages */
    window.addEventListener("message", event => {
        // We only accept messages from ourselves
        if (event.source != window) {
            return;
        }
        
        var message = <AllowClipboard.Common.IAllowClipboardMessage> event.data;

        if (message.type != "AllowClipboard") {
            return;
        }

        if (typeof userAllowedClipboard === 'undefined') {
            userAllowedClipboard = confirm('Allow this webpage to access your Clipboard?');
        }

        if (!userAllowedClipboard) {
            window.postMessage(new AllowClipboard.Common.AllowClipboardResponseMessage(message.operation, message.clientId, message.operationId, false), "*");
            return;
        }

        switch (message.operation) {
            case "Read":
                var readMessage = <AllowClipboard.Common.AllowClipboardReadMessage> message;
                chrome.runtime.sendMessage(readMessage, (response:AllowClipboard.Common.AllowClipboardReadResponseMessage) => {
                    window.postMessage(response, "*");
                });
                break;
            case "Write":
                var writeMessage = <AllowClipboard.Common.AllowClipboardWriteMessage> message;
                chrome.runtime.sendMessage(writeMessage,(response: AllowClipboard.Common.AllowClipboardWriteResponseMessage) => {
                    window.postMessage(response, "*");
                });
                break;
            default:
                console.log("Unknown AllowClipboard operation: " + message.operation);
        }
    }, false);
}

