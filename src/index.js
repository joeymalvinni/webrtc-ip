const publicIPs = require('./public_ip.js')

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
        getAllIPs(timer), {
            types: getIPTypes,
            public: publicIPs,
            IPv4: getIPv4,
            IPv6: getIPv6,
        }
    )
};

module.exports = getIPs