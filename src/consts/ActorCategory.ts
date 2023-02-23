export default class ActorCategory {
    // Create new instances of the same class as static attributes
    static Init = new ActorCategory("init", 1, "New added, not checked yet")
    static Liked = new ActorCategory("liked", 2, "I like her!")
    static Dislike = new ActorCategory("dislike", 3, "Not my type, bye")
    static Enough = new ActorCategory("enough", 4, "I like her, but later")

    private static _AllCategories = [ActorCategory.Init, ActorCategory.Liked, ActorCategory.Enough, ActorCategory.Dislike]

    public static get AllCategories() {
        return this._AllCategories;
    }
    public static get AllCategoryValues() {
        return this._AllCategories.map((category, _, __) => category.value)
    }

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