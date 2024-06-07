import ActorData from "./ActorData";

let UUID = 0

export class ActorElement {
    private uuid: number
    private actor: ActorData

    constructor(actor: ActorData) {
        this.data = actor
    }

    set data(actor: ActorData) {
        this.uuid = ++UUID
        this.actor = actor
    }

    get data() {
        return this.actor
    }

    get id() {
        return this.uuid
    }
}


export function ToActorElements(actor_list: ActorData[]): ActorElement[] {
    const ret = []
    for (const actor of actor_list) {
        ret.push(new ActorElement(actor))
    }
    return ret
}