/*
*   This file is the entire script combined in working order.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/

// [---------------------------------------------------------------------------]
// File: ip_validator.js

/*
*   This module validates the two types of IP addresses.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/

// The function that checks if the given IPv4 address is valid.
function is_ipv4(ip){
    return regex_v4.test(ip);
};

// Checks if the IPv6 address is valid.
function is_ipv6(ip){
    return regex_v6.test(ip);
};

// Simple IP regex that works on both IPv6 and IPv4
var simpleIPRegex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/g;

// IPv4 regex used to determine whether an IP is IPv4 or not.
let regex_v4 = /((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])/;

// The IPv6 regex used when determining an IPv6 address.
let regex_v6 = /((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))/;

// Exporting the two regexes in an array to be used in the main detector.
let ip_regex_array = [regex_v6, regex_v4]


// [---------------------------------------------------------------------------]
// File: peer_conn.js

/*
*   This module provides the main WebRTC functions that return IP addresses from the STUN request.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/


function peer(callback){
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
            urls: 'stun:stun.l.google.com:19302'
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

// [---------------------------------------------------------------------------]
// File: public_ip.js

/*
*   This module provides the worker functions that return the public IP addresses.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/


function publicIPs(timer){
    // Timing validation.
    if(timer) if(timer < 100) throw new Error('Custom timeout cannot be under 100 milliseconds.');

    // IPs is the final array of all valid IPs found.
    var IPs = [];
    // Creating the peer connection request while handling the callback event.
    var peerConn = peer(handleIceCandidates);

    function getIps(){
        // Returning a promise.
        return new Promise(function(resolve, reject) {
            // Starting the peer connection.
            peerConn.start();
            // Setting the timer.
            setTimeout(() => {
                // Checking if the IP array exists.
                if(!IPs || IPs === []){
                    // Rejecting the error
                    reject('No IP addresses were found.')
                } else {
                    // Return the unique IP addresses in an array.
                    resolve(unique(IPs.flat(Infinity)))
                };
                // reset the peer connection.
                reset();
            // Set the Timeout to the custom timer, default to 500 milliseconds.
            }, timer || 500);
        });
    };

    function handleIceCandidates(ip){
        var array = [];
        // Looping over the two regexs for IPv6 and IPv4
        for(let regex of ip_regex_array){
            let arr = [];
            // Lutting all of the strings that match either IP format in an array
        	let possible_ips_array = regex.exec(ip)
            if(possible_ips_array){
                // Looping over that array
            	for(let i = 0; i < possible_ips_array.length; i++){
                    // Checking if the "IP" is valid
                	if(is_ipv4(possible_ips_array[i]) || is_ipv6(possible_ips_array[i])){
                        arr.push(possible_ips_array[i])
                    };
                };
                array.push(arr);
            };
        };
        // Final function that does more checks to determine the array's validity,
        // Also flattens the array to remove extraneous sub-arrays.
        push(array.flat(Infinity))
    };

    function push(ip){
        // Checks if the IP addresses givin are already in the array. 
        if(!IPs.includes(ip)){
            IPs.push(unique(ip.flat(Infinity)));
        };
    };

    function reset(){
        // Stops the peer connection to the STUN server.
        peerConn.stop()
    };
    // Use this to only return unique IP addresses.
    function unique(a) {
        return Array.from(new Set(a));
    };

    return getIps();
};

// [---------------------------------------------------------------------------]
// File: index.js

/*
*   This module combines all of the worker modules into the main functions that get exported.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/

// Categorizes the IPs by IP, type, and IPv4.
function getIPTypes(timer){
    // Returning the result as a promise.
    return new Promise(function(resolve, reject) {
        // Final array
        let finalIpArray = []
        // Getting the raw IPs in an array.
        publicIPs(timer).then((ips)=>{
            // Looping over each IP.
            ips.forEach(ip => {
                if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                    // The IP is private.
                    finalIpArray.push({ ip: ip, type: 'private', IPv4: true })
                } else if (ip.match(/((([0-9A-Fa-f]{1,4}:){7}([0-9A-Fa-f]{1,4}|:))|(([0-9A-Fa-f]{1,4}:){6}(:[0-9A-Fa-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){5}(((:[0-9A-Fa-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9A-Fa-f]{1,4}:){4}(((:[0-9A-Fa-f]{1,4}){1,3})|((:[0-9A-Fa-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){3}(((:[0-9A-Fa-f]{1,4}){1,4})|((:[0-9A-Fa-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){2}(((:[0-9A-Fa-f]{1,4}){1,5})|((:[0-9A-Fa-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9A-Fa-f]{1,4}:){1}(((:[0-9A-Fa-f]{1,4}){1,6})|((:[0-9A-Fa-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9A-Fa-f]{1,4}){1,7})|((:[0-9A-Fa-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))/)) {
                    // The IP is an IPv6 address.
                    finalIpArray.push({ ip: ip, type: 'IPv6', IPv4: false })
                } else {
                    // Assume the IP is public.
                    finalIpArray.push({ ip: ip, type: 'public', IPv4: true })
                }
            })
            // Resolving the promise.
            resolve(finalIpArray)
        }).catch(reject)
    })
}

// Filters out IPv4 addresses.
function getIPv4(timer) {
    return getIPTypes(timer).then(ips => {
        // Filters the IP by IPv4.
        const ip = ips.filter(ip => ip.IPv4);
        // Loops over each object and extracts the IP.
        for(let i = 0; i < ip.length; i++){
            ip[i] = ip[i].ip
        }
        // Returns undefined if the array is empty.
        return ip ? ip : '';
    });
}

// Filters out IPv6 addresses.
function getIPv6(timer) {
    // Getting the IPs by type.
    return getIPTypes(timer).then(ips => {
        // Filtering the IPs by IPv6.
        const ip = ips.filter(ip => ip.type === 'IPv6');
        // Extracting the IPs
        for(let i = 0; i < ip.length; i++){
            // Removing all other data from the object.
            ip[i] = ip[i].ip
        }
        // Returning the IP or undefined.
        return ip ? ip.ip : '';
    });
}

// Returns all of the functions in an object, default to getting all of the IPs without any filtering applied.
function getIPs(timer){
	return Object.assign(
        publicIPs(timer), {
            types: getIPTypes,
            public: publicIPs,
            IPv4: getIPv4,
            IPv6: getIPv6,
        }
    )
};