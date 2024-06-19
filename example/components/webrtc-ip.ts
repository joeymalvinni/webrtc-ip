// import { parse_ice_candidate, minimal_parse, IceCandidate, IPH } from "./candidate";

export async function getIP(stun: string = "stun:stun.l.google.com:19302"): Promise<string> {
  if (typeof window === 'undefined') {
    return "";
  }

  const config = {
    iceServers: [{ urls: stun }]
  };

  const p = new RTCPeerConnection(config);

  return new Promise<string>((resolve, reject) => {
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
}
