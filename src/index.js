/*
*   This module provides the main functions that get IP addresses.
*   Copyright 2021 © Joey Malvinni
*   License: MIT
*/

const publicIPs = require('./public_ip.js')
const privateIPs = require('./private_ip.js')

// Main function that gets both IP types and concats them.
async function getAllIPs(timing){
    // Final array.
    var array = []
    // Getting the public IPs.
    let public = await publicIPs(timing)
    // Pushing to the main array.
    array.push(public)
    // Getting all private IPs.
    let private = await privateIPs(timing)
    // Pushing to the array.
    array.push(private);
    // Flatting the array and returning all unique IP addresses.
    return unique(array.flat(5));

    // Unique worker function
    function unique(a) {
        return Array.from(new Set(a));
    };
}


// Categorizes the IPs by IP, type, and IPv4.
function getIPTypes(timer){
    // Returning the result as a promise.
    return new Promise(function(resolve, reject) {
        // Final array
        let finalIpArray = []
        // Getting the raw IPs in an array.
        getAllIPs(timer).then((ips)=>{
            // Looping over each IP.
            ips.forEach(ip => {
                if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                    // The IP is private.
                    finalIpArray.push({ ip: ip, type: 'private', IPv4: true })
                } else if (ip.match(ip_regex_array[1])) {
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

function getPublicIPs(timer){
    // Getting the IPs by type.
    return getIPTypes(timer).then(ips => {
        // Filtering the IPs by IPv6.
        const ip = ips.filter(ip => ip.type === 'public');
        // Extracting the IPs
        for(let i = 0; i < ip.length; i++){
            // Removing all other data from the object.
            ip[i] = ip[i].ip
        }
        // Returning the IP or undefined.
        return ip ? ip.ip : '';
    });
}

function getPrivateIPs(timer){
    // Getting the IPs by type.
    return getIPTypes(timer).then(ips => {
        // Filtering the IPs by IPv6.
        const ip = ips.filter(ip => ip.type === 'private');
        // Extracting the IPs
        for(let i = 0; i < ip.length; i++){
            // Removing all other data from the object.
            ip[i] = ip[i].ip
        }
        // Returning the IP or undefined.
        return ip ? ip.ip : '';
    });
}

// Returns all of the functions in an object, default to getting the raw IPs.
function getIPs(timer){
	return Object.assign(
        getAllIPs(timer), {
            getAllIPs, 
            getIPTypes,
            getPrivateIPs,
            getPublicIPs,
            getIPv4,
            getIPv6
        }
    )
};

module.exports = getIPs