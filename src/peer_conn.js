/*
*   This module provides the main WebRTC functions that return IP addresses from the STUN request.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/


function peerConnection(callback){
    // Creating the peer connection.
    var WebRTCPeerConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
    // Initializing the connection.
    var createdConnection;

    // Main start function.
    function start(){
        // Creating the actual connection.
        createConnection()
        // Log the STUN request.
        createStunRequest()
    };

    // Stop function to reset the connection.
    function stop(){
        // Checking if the connection has been created or not.
        if (createdConnection) {
            // Attempt to close it, if RTCPeerConnection.close() is not supported, remove the event listeners.
            try {
                createdConnection.close();
            } finally {
                createdConnection.onicecandidate = () => {};
                createdConnection = null;
            };
        };
    };

    // Function that makes the connection request to Google's STUN server
    function createConnection(){
        let iceServers = [{
            urls: 'stun:stun.l.google.com:19302?transport=udp'
        }];
        // Creating the connection with the STUN server.
        createdConnection = new WebRTCPeerConnection({ iceServers });
        // Handling the ICE candidate event.
        createdConnection.onicecandidate = (data) => handleCandidates(data);
        // Creation of the fake data channel.
        createdConnection.createDataChannel('fake_data_channel');
    };

    // Function that creates the STUN request offer needed to get the IPs.
    function createStunRequest(){
        // Create the offer that exposes the IP addresses.
        return createdConnection.createOffer().then(sdp => createdConnection.setLocalDescription(sdp));
    };

    // Handling the onIceCandidate event.
    function handleCandidates(ice){
        // Checking if the ICE candidate lines given are valid.
        if (ice && ice.candidate && ice.candidate.candidate) {
            // Returning the IPs to the main function.
            callback(ice && ice.candidate && ice.candidate.candidate);
        };
    };

    // Returning the main functions needed.
    return {
        start, 
        stop,
        createConnection,
        createStunRequest,
        handleCandidates
    };
};

// Exporting the module.
module.exports = peerConnection;