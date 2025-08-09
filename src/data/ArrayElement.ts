import ActorData from "./ActorData";

export class ActorElement {
    private actor: ActorData
    selected: boolean

    constructor(actor: ActorData) {
        this.data = actor
        this.selected = false
    }

    set data(actor: ActorData) {
        this.actor = actor
    }

    get data() {
        return this.actor
    }

    get uuid() {
        return this.actor.uuid
    }
}


export function ToActorElements(actor_list: ActorData[]): ActorElement[] {
    const ret: ActorElement[] = []
    for (const actor of actor_list) {
        ret.push(new ActorElement(actor))
    }
    return ret
}