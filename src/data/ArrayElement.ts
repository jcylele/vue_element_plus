import ActorData from "./ActorData";

export class ActorElement {
    private actor: ActorData

    constructor(actor: ActorData) {
        this.data = actor
    }

    set data(actor: ActorData) {
        this.actor = actor
    }

    get data() {
        return this.actor
    }

    get id() {
        return this.actor.actor_id
    }
}


export function ToActorElements(actor_list: ActorData[]): ActorElement[] {
    const ret = []
    for (const actor of actor_list) {
        ret.push(new ActorElement(actor))
    }
    return ret
}