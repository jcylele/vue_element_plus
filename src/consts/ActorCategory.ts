export default class ActorCategory {
    // Create new instances of the same class as static attributes
    static All = new ActorCategory("All", 0, "All Actors", false)
    static Init = new ActorCategory("Init", 1, "New Actors")
    static Liked = new ActorCategory("Liked", 2, "Liked Actors")
    static Dislike = new ActorCategory("Dislike", 3, "Unliked Actors")
    static Enough = new ActorCategory("Enough", 4, "No More, Thanks")

    readonly name: string
    readonly value: number
    readonly desc: string
    readonly selectable: boolean;

    constructor(name, value, desc, selectable = true) {
        this.name = name
        this.value = value
        this.desc = desc
        this.selectable = selectable
    }

    static getByValue(value: number): ActorCategory {
        for (const tag_name in ActorCategory) {
            if (ActorCategory[tag_name].value === value){
                return ActorCategory[tag_name]
            }
        }
    }
}