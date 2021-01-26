/*
*   This module provides the worker functions that return the private IP addresses.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/

function getPrivateIPs(timer) {
    // Timing validation.
    if(timer) if(timer < 100) throw new Error('Custom timeout cannot be under 100 milliseconds.');

    // Returns the data as a Promise.
    return new Promise((resolve, reject)=>{
        // The final array of IP addresses.
        var ipArray = [];
        // emptyConnection is the actual WebRTC peer connection.
        var emptyConnection = window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        // Starting the peer connection.
        var pc = new emptyConnection();
        // List of IPs to remove duplicates.
        var ipList = {};

        // Main function that starts the connection and timer.
        function start(){
            // Creating the fake data channel.
            pc.createDataChannel("");
            // Handling the ICE candidates.
            pc.onicecandidate = handleCandidates;
            // Creating the fake connection.
            createConnection();
            // Starting the timer.
            startTimer();
        };

        // Final validation to remove IP duplicates.
        function push(ip) {
            // Checking if the IP is not in the list and adding the IP if it is not.
            if (!ipList[ip]) ipArray.push(ip);
            // Marking the IP on the list to prevent duplicate IPs.
            ipList[ip] = true;
        };
        
        // Main function that returns the SDP.
        function createConnection(){
            // Creating the offer to get the SDP.
            pc.createOffer(function(data) {
                // Splitting the SDP by line to gracefully extract the candidate line.
                data.sdp.split('\n').forEach(function(line) {
                    // If the line is not the candidate line, keep looping.
                    if (line.indexOf('candidate') === -1) return;
                    // The line is a candidate line, so match the IP addresses and push them to the list.
                    line.match(simpleIPRegex).forEach(push);
                });
                // Setting the SDP as the local description to trigger the onIceCandidate event.
                pc.setLocalDescription(data);
            },  function(){});
        };  //  ^^^^^^^^ The empty function is needed to properly create the connection in this case.

        // Handling the ICE candidates.
        function handleCandidates(ice) {
            // Validating that the ICE parameter passed is valid, the candidate is valid, 
            // the candidate line is valid, and finally validating that the candidate line contains an IP addres.
            if (!ice || !ice.candidate || !ice.candidate.candidate || !ice.candidate.candidate.match(simpleIPRegex)) return;
            // Pushing all valid IP addresses.
            ice.candidate.candidate.match(simpleIPRegex).forEach(push);
        };

        // This function waits until all of the IP addresses are collected and returns them to the user.
        function startTimer(){
            // Setting the timeout.
            setTimeout(()=>{
                // Validating that the array is valid.
                if(ipArray && ipArray !== [] && ipArray.length){
                    // Resolving the array in the promise.
                    resolve(ipArray);
                    // Cleaning up the peer connection.
                    stop();
                } else {
                    // No candidates were found, report the error.
                    reject('No IPs found.');
                    // Cleaning the peer connection.
                    stop();
                };
            }, timer || 500);
            //       || ^^^^ The time is not set so use the default, 500.
        }   // ^^^^^ Waiting for the custom time specified.

        // Stop function to reset the connection.
        function stop(){
            // Checking if the connection has been created or not.
            if (pc) {
                // Attempt to close it, if RTCPeerConnection.close() is not supported, remove the event listeners.
                try {
                    // Closing the peer connection.
                    pc.close();
                } finally {
                    // Removing all event listeners.
                    pc.onicecandidate = () => {};
                    // Clearing the peer connection object.
                    pc = null;
                };
            };
        };
        
        // Returning the start function.
        return start();
    })
}

module.exports = getPrivateIPs;