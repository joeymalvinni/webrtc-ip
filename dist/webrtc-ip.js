"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getIP = getIP;
function getIP() {
    return __awaiter(this, arguments, void 0, function* (stun = "stun:stun.l.google.com:19302") {
        if (typeof window === 'undefined') {
            return "";
        }
        const config = {
            iceServers: [{ urls: stun }]
        };
        const p = new RTCPeerConnection(config);
        return new Promise((resolve, reject) => {
            p.onicecandidate = (event) => {
                if (event.candidate && event.candidate.candidate) {
                    let split = event.candidate.candidate.split(" ");
                    if (split[7] !== "host") {
                        resolve(split[4]);
                    }
                }
            };
            p.createDataChannel('ip channel');
            p.createOffer()
                .then((offer) => p.setLocalDescription(offer))
                .catch(reject);
        });
    });
}
