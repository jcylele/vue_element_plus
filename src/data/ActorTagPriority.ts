class ActorTagPriority {
    tag_id: number
    tag_priority: number

    constructor(id: number, priority: number) {
        this.tag_id = id
        this.tag_priority = priority
    }
}

export default class AllActorTagPriorities {
    tag_priorities: ActorTagPriority[]

    constructor() {
        this.tag_priorities = []
    }

    push(id: number, priority: number) {
        this.tag_priorities.push(new ActorTagPriority(id, priority))

    }

    length() {
        return this.tag_priorities.length
    }
}