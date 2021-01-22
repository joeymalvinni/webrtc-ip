(function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
    function getIpArray(callback){
        let finalArray = []
    
        var RTCPeerConnection = getPeerConn()
        var useWebKit = !!window.webkitRTCPeerConnection;
    
        if(!RTCPeerConnection){
            var win = iframe.contentWindow;
            RTCPeerConnection = win.RTCPeerConnection
                || win.mozRTCPeerConnection
                || win.webkitRTCPeerConnection;
            useWebKit = !!win.webkitRTCPeerConnection;
        }
    
        var pc = new RTCPeerConnection(getServers(), getConstraints());
    
        function handleCandidate(candidate){
            var regex = /([0-9]{1,3}(\.[0-9]{1,3}){3}|[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7})/
            if(regex.exec(candidate) !== null){
                var ip_addr = regex.exec(candidate)[0];
                if(validateIp(ip_addr)) finalArray.push(ip_addr)
            }  
        }
    
        pc.onicecandidate = function(ice){
            if(ice.candidate) handleCandidate(ice.candidate.candidate);
        };
    
        pc.createDataChannel("fake_data_channel");
    
        pc.createOffer(function(result){
            pc.setLocalDescription(result, function(){}, function(){});
        }, function(){});
    
        setTimeout(function(){
            var lines = pc.localDescription.sdp.split('\n');
    
            lines.forEach(function(line){
                if(line.indexOf('a=candidate:') === 0)
                    handleCandidate(line);
            });
            let truncatedArray = removeDuplicates(finalArray)
            callback(truncatedArray)
        }, 100);
    
        function getServers(){
            return { 
                iceServers: [{ 
                    urls: ["stun:stun.l.google.com:19302?transport=udp"] 
                }] 
            };
        }
        
        function getConstraints(){
            return {
                optional: [{RtpDataChannels: true}]
            };
        }
        
        function getPeerConn(){
            return window.RTCPeerConnection || window.mozRTCPeerConnection || window.webkitRTCPeerConnection;
        }
        
        function validateIp(ipaddress) {  
          if (/^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ipaddress)) {  
            return (true)  
          }  
          return (false)  
        }
        
        function removeDuplicates(array){
          return [...new Set(array)];
        }
    }
    
    function getFirstIp(callback){
        getIpArray(function(ips){
            callback(ips[0] || null)
        })       
    }
    
    function getIpTypes(callback){
        getIpArray(function(ips){
            let finalIpArray = []
            ips.forEach(ip=>{
                if (ip.match(/^(192\.168\.|169\.254\.|10\.|172\.(1[6-9]|2\d|3[01]))/)) {
                    finalIpArray.push({ ip: ip, type: 'local'})
                } else if (ip.match(/^[a-f0-9]{1,4}(:[a-f0-9]{1,4}){7}$/)) {
                    finalIpArray.push({ ip: ip, type: 'IPv6'})
                } else {
                    finalIpArray.push({ ip: ip, type: 'public'})
                }
            })
            callback(finalIpArray)
        })       
    }
},{}]},{},[1]);
