'use strict';

const ICE_UFRAG = "V6j+"; 
// const ICE_UFRAG = "driver"; 
const ICE_PWD = "OEKutPgoHVk/99FfqPOf444w";
// const ICE_PWD = "oversteeroversteeroversteer";

const statusDisplay = this.document.querySelector('#server-status');
const connectionStateElement = this.document.querySelector('#connection-state');
const signallingStateElement = this.document.querySelector('#signalling-state')
const sdpOfferElement = this.document.querySelector('#sdp-offer-textarea');
const sdpAnswerElement = this.document.querySelector('#sdp-answer-textarea');
const regenerateButton = this.document.querySelector('#regenerate-button');
const connectButton = this.document.querySelector('#connect-button');
const logElement = this.document.querySelector('#logs');

// const logInfo = thing => {this.console.log(thing); logElement.innerHTML += thing+'<br>'}
const logInfo = thing => {this.console.log(thing);}
const logError = thing => {this.console.error(thing); statusDisplay.textContent = "error"}

let peerConnection;
let dataChannel;

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
        logError("adapter didn't load. stuff might not work. maybe.")
    }
    logInfo("confirmed webRTC support")

    connectButton.onclick = function () {
        // if (dataChannel.readyState == "open") {
        if (dataChannel.readyState === "open") {
            logInfo("sending message");
            dataChannel.send("HOWDY");
        } else {
            logInfo("data channel is not open");
        }
    }

    regenerateButton.onclick = function() {
        sdpOfferElement.textContent = "";
        sdpAnswerElement.textContent = "";
        startWebRTC();
    };
}

async function startWebRTC() {

    if (peerConnection !== undefined) {
        logInfo("closing existing peer connection");
        peerConnection.close();
    }

    logInfo("creating new peer connection");
    peerConnection = new RTCPeerConnection();
    peerConnection.onsignalingstatechange = event => {
        logInfo(`signaling state change: ${peerConnection.signalingState}`);
        signallingStateElement.textContent = peerConnection.signalingState;
    };
    peerConnection.onconnectionstatechange = event => {
        logInfo(`connection state change: ${peerConnection.connectionState}`);
        connectionStateElement.textContent = peerConnection.connectionState;
    };
    peerConnection.onicecandidate = event => {
        if (event.candidate) {
            logInfo(`ice candidate: ${event.candidate.candidate}`)
        } else {
            logInfo("all ice candidates have been sent (?)")
        }
    };
    peerConnection.ondatachannel = event => {
        logInfo("we got a data channel? (why? wtf)")
    };

    dataChannel = peerConnection.createDataChannel('telemetry');
    dataChannel.onclose = event => {
        logInfo("data channel opened");
    };
    dataChannel.onopen =  event => {
        logInfo("data channel closed");
    };
    dataChannel.onmessage = event => {
        logInfo(`got message on data channel: ${event.data}`);
    };

    peerConnection.onnegotiationneeded = event => {
        logInfo('negotiation needed');
        peerConnection.createOffer()
        .then(function(offer) {
            offer.sdp = offer.sdp.replace(/^a=ice-ufrag.*$/m, `a=ice-ufrag:${ICE_UFRAG}`)
            offer.sdp = offer.sdp.replace(/^a=ice-pwd.*$/m, `a=ice-pwd:${ICE_PWD}`)
            sdpOfferElement.textContent = offer.sdp;
            return peerConnection.setLocalDescription(offer);
        })
        .then(function() {
            sdpAnswerElement.textContent = predefinedRemoteAnswer;
            return peerConnection.setRemoteDescription(
                new RTCSessionDescription({type: "answer",  sdp: predefinedRemoteAnswer})
            );
        })
        .catch(logInfo);
    };
}

const predefinedRemoteAnswer = `v=0
o=- 521628857 1575883112 IN IP4 0.0.0.0
s=-
t=0 0
a=fingerprint:sha-256 53:59:1A:45:F2:A8:21:62:71:D5:6F:3E:A2:F6:6D:4F:EF:46:0F:44:92:A0:EA:F1:45:02:6F:EF:0F:FE:58:9C
a=group:BUNDLE 0
a=ice-lite
m=application 9 DTLS/SCTP 5000
c=IN IP4 0.0.0.0
a=setup:passive
a=mid:0
a=sendrecv
a=sctpmap:5000 webrtc-datachannel 1024
a=ice-ufrag:${ICE_UFRAG}
a=ice-pwd:${ICE_PWD}
a=candidate:foundation 1 udp 2130706431 TrackBuddyServer.local 5000 typ host generation 0
a=candidate:foundation 1 udp 2130706431 TrackBuddyServer.local 5001 typ host generation 0
a=candidate:foundation 1 udp 2130706431 TrackBuddyServer.local 5002 typ host generation 0
a=candidate:foundation 1 udp 2130706431 TrackBuddyServer.local 5003 typ host generation 0
a=candidate:foundation 1 udp 2130706431 TrackBuddyServer.local 5004 typ host generation 0
a=candidate:foundation 1 udp 2130706431 TrackBuddyServer.local 5005 typ host generation 0
a=end-of-candidates
`

// function getOfferFromURL() {
//     const expectedQueryPrefix = "?sdp-offer=";
//     const queryString = this.location.search;
//     if (!queryString) {
//         logInfo("empty query string");
//         return "";
//     }
//     if (!queryString.startsWith(expectedQueryPrefix)) {
//         logInfo("bad query string");
//         return "";
//     }
//     logInfo("got SDP offer from URL");
//     return decodeURIComponent(queryString.substring(expectedQueryPrefix.length, queryString.length));
// }
