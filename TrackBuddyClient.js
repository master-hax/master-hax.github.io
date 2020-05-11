'use strict';
const statusDisplay = this.document.querySelector('#server-status');
const connectionStateElement = this.document.querySelector('#connection-state');
const signallingStateElement = this.document.querySelector('#signalling-state')
const sdpOfferElement = this.document.querySelector('#sdp-offer-textarea');
const regenerateButton = this.document.querySelector('#regenerate-button');
const sdpAnswerElement = this.document.querySelector('#sdp-answer-textarea');
const connectButton = this.document.querySelector('#connect-button');

const logInfo = thing => this.console.log(thing);
const logError = thing => {this.console.error(thing); statusDisplay.textContent = "error"}

function getOfferFromURL() {
    const expectedQueryPrefix = "?sdp-offer=";
    const queryString = this.location.search;
    if (!queryString) {
        logInfo("empty query string");
        return "";
    }
    if (!queryString.startsWith(expectedQueryPrefix)) {
        logInfo("bad query string");
        return "";
    }
    logInfo("got SDP offer from URL");
    return decodeURIComponent(queryString.substring(expectedQueryPrefix.length, queryString.length));
}

window.onload = function() {

    if (!this.RTCPeerConnection) {
        logError("browser does not have webRTC support!")
        return;
    }

    if (!this.RTCPeerConnection.prototype.createDataChannel) {
        logError("browser does not have webRTC data channel support!")
        return;
    }

    if (!this.adapter) {
        logError("adapter didn't load. stuff might not work tbh.")
    }

    logInfo("confirmed webRTC support")
    // dataChannel.close()
    // peerConnection.close()

    const sdpOfferFromUrl = this.getOfferFromURL()
    if (!!sdpOfferFromUrl) {
        sdpTextInput.value = sdpOfferFromUrl;
    }

    this.startWebRTC();
}

async function startWebRTC() {

    // logInfo("starting webRTC server with SDP offer:\n" + sdpOffer.trim() + String.fromCharCode(13, 10));

    const peerConnection = new RTCPeerConnection();
    let localOffer;

    peerConnection.onsignalingstatechange = logInfo;
    peerConnection.onconnectionstatechange = logInfo;
    peerConnection.onicecandidate = logInfo;
    peerConnection.ondatachannel = logInfo;

    regenerateButton.onclick = function() {
        peerConnection.createOffer()
        .then(function(offer) {
            let promise = peerConnection.setLocalDescription(offer);
            localOffer = offer;
            // sdpOfferElement.textContent = offer.sdp+"|";
            sdpOfferElement.textContent = JSON.stringify(offer);
            regenerateButton.value = "regenerate";
            return promise;
        })
        .catch(function(err) {
          logError("failed to regenerate local description: " + err)
        })
    };

    connectButton.onclick = function() {
        let answerText = sdpAnswerElement.value;
        logInfo("got answer:\n" + answerText);
        peerConnection.setRemoteDescription(new RTCSessionDescription(
            JSON.parse(answerText)
        ));
    }

    // let answer;
    // try {
    //     answer = await peerConnection.createAnswer();
    // } catch (err) {
    //     logError("failed to create an answer: " + err);
    //     return;
    // }
    // logInfo("got SDP answer:\n"+answer.sdp);



    // const dataChannel = peerConnection.createDataChannel('telemetryChannel');
    // dataChannel.onopen = logInfo;
    // dataChannel.onclose = logInfo;

    // try {
    //     await peerConnection.setRemoteDescription(new RTCSessionDescription({
    //         type: 'offer',
    //         sdp: sdpOffer
    //     }));
    // } catch (err) {
    //     logError("failed to set local description: " + err)
    //     return;
    // }

    // let answer;
    // try {
    //     answer = await peerConnection.createAnswer();
    // } catch (err) {
    //     logError("failed to create an answer: " + err);
    //     return;
    // }
    // logInfo("got SDP answer:\n"+answer.sdp);

    

}
