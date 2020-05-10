'use strict';

const logInfo = thing => this.console.log(thing);
const logError = thing => this.console.error(thing);

function getOfferFromURL() {
    const expectedQueryPrefix = "?sdp-offer=";
    var queryString = this.location.search;
    if (!queryString) {
        logInfo("empty query string");
        return "";
    }
    if (!queryString.startsWith(expectedQueryPrefix)) {
        logInfo("bad query string");
        return "";
    }
    logInfo("got an SDP offer");
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

    logInfo(this.getOfferFromURL());

    this.startWebRTC();
}

function handleButtonPress() {
    
}

async function startWebRTC() {
    var peerConnection = new RTCPeerConnection();
    logInfo(peerConnection)
    peerConnection.onicecandidate = logInfo;
    peerConnection.ondatachannel = logInfo;

    var dataChannel = peerConnection.createDataChannel('telemetryChannel');
    dataChannel.onopen = logInfo;
    dataChannel.onclose = logInfo;
    try {
        const offer = await peerConnection.createOffer();
        logInfo(offer.sdp);
    } catch (e) {
        logError("failed to create a session description");
    }
}