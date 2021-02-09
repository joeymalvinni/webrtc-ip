/*
*   This module provides the worker functions that return the IP addresses.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/

const { ip_regex_array, is_ipv6, is_ipv4 } = require('./ip_validator');
const peer = require('./peer_conn');

function getIPArray(timer){
    // Timing validation.
    if(timer < 100) throw new Error('Custom timeout cannot be under 100 milliseconds.');

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
                    resolve(unique(IPs.flat(5)))
                };
                // reset the peer connection.
                reset();
            // Set the Timeout to the custom timer, default to 500 milliseconds.
            }, timer || 500);
        });
    };

    function handleIceCandidates(ip){
        if(is_mdns(ip)){
            let array = [];
            let possible_ips = mdns.exec(ip)
            if(possible_ips){
                let arr = [];
                for(let i = 0; i < possible_ips.length; i++){
                    ipify(possible_ips[i]).then(arr.push)
                }
                array.push(arr)
            }
            push(array.flat(Infinity))
        } else {
            var array = [];
            // Looping over the two regexs for IPv6 and IPv4
            for(let regex of ip_regex_array){
                let arr = [];
                // Getting all of the strings that match either IP format in an array
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
        }
    };

    function push(ip){
        // Checks if the IP addresses givin are already in the array. 
        if(!IPs.includes(ip)){
            IPs.push(unique(ip.flat(5)));
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

// Exporting the module.
module.exports = getIPArray;