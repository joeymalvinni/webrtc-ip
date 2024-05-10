import { parse_ice_candidate, IceCandidate } from "./candidate";

export async function getIPs(stun: string = "stun:stun.l.google.com:19302"): Promise<string[]> {
  if (typeof window !== 'undefined') {
    const config = {
      iceServers: [{ urls: stun }]
    };

    const p = new RTCPeerConnection(config);
    const ips: string[] = [];

    // Return a promise that resolves when gathering of ICE candidates is complete
    return new Promise<string[]>((resolve, reject) => {
      p.onicecandidate = (event) => {
        if (event.candidate && event.candidate.candidate) {
          let parsed: IceCandidate = parse_ice_candidate(event.candidate.candidate);

          if (parsed.type !== "host") {
            ips.push(parsed.ip);
          }
        } else {
          resolve(ips);
        }
      };

      p.createDataChannel('');
      p.createOffer().then((offer) => {
        return p.setLocalDescription(offer);
      }).catch((error) => {
        reject(error);
      });
    });
  } else {
    return [];
  }
}