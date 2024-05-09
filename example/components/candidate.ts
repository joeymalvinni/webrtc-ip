export interface IceCandidate {
    foundation: string;
    component: string;
    protocol: string;
    priority: string;
    ip: string;
    port: string;
    type: string;
    relatedAddress?: string;
    relatedPort?: string;
    generation?: string;
    ufrag?: string;
    networkCost?: string;
    tcptype?: string;
}

export function parse_ice_candidate(candidate_string: string): IceCandidate {
    const attr: string[] = candidate_string.split(" "); 

    const candidate: IceCandidate = {
        foundation: attr[0].split(":")[1], // remove the "candidate:" part
        component: attr[1],
        protocol: attr[2],
        priority: attr[3],
        ip: attr[4],
        port: attr[5],
        type: attr[7],
    };

    // parse optional attributes
    for (let i = 8; i < attr.length; i += 2) {
        const key = attr[i];
        const value = attr[i + 1];
        if (key === "raddr") {
            candidate.relatedAddress = value;
        } else if (key === "rport") {
            candidate.relatedPort = value;
        } else if (key === "generation") {
            candidate.generation = value;
        } else if (key === "ufrag") {
            candidate.ufrag = value;
        } else if (key === "network-cost") {
            candidate.networkCost = value;
        } else if (key === "tcptype") {
            candidate.tcptype = value;
        }
    }

    return candidate;
}