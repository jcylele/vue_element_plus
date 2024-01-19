import ActorCategory from "../consts/ActorCategory";

export default class ActorFilterData {
    name: string
    category_list: number[]
    is_category_partial: boolean
    is_category_all: boolean
    tag_list: number[]
    no_tag: boolean
    min_score: number
    max_score: number
    show_rows: boolean[]

    get show_category() {
        return this.show_rows[0]
    }

    set show_category(val: boolean) {
        this.show_rows[0] = val
        this.resetCategory()
    }

    get show_tag() {
        return this.show_rows[1]
    }

    set show_tag(val: boolean) {
        this.show_rows[1] = val
        this.resetTags()
    }

    get show_score() {
        return this.show_rows[2]
    }

    set show_score(val: boolean) {
        this.show_rows[2] = val
        this.resetScores()
    }

    get show_name() {
        return this.show_rows[3]
    }

    set show_name(val: boolean) {
        this.show_rows[3] = val
        this.resetName()
    }

    get show_min_score() {
        return this.min_score / 2
    }

    set show_min_score(val: number) {
        this.min_score = val * 2
    }

    get show_max_score() {
        return this.max_score / 2
    }

    set show_max_score(val: number) {
        this.max_score = val * 2
    }

    constructor() {
        this.show_rows = [false, false, false, false]
        this.reset()
    }

    reset() {
        this.resetCategory()
        this.resetTags()
        this.resetScores()
        this.resetName()
    }

    clone() {
        const data = new ActorFilterData()
        data.name = this.name
        data.category_list = this.category_list.slice()
        data.tag_list = this.tag_list.slice()
        data.no_tag = this.no_tag
        data.min_score = this.min_score
        data.max_score = this.max_score
        data.show_rows = this.show_rows.slice()
        return data
    }

    copy(data: ActorFilterData) {
        this.name = data.name
        this.category_list = data.category_list.slice()
        this.tag_list = data.tag_list.slice()
        this.no_tag = data.no_tag
        this.min_score = data.min_score
        this.max_score = data.max_score
        this.show_rows = data.show_rows.slice()
    }

    resetCategory() {
        this.is_category_all = true
        this.checkAllCategory(true)
    }

    checkAllCategory(val: boolean) {
        // console.log("all", val)
        if (val) {
            this.category_list = ActorCategory.AllCategoryValues
        } else {
            this.category_list = []
        }
        this.is_category_partial = false
    }

    onCheckedCategoryChange(val: number[]) {
        // console.log("check", ...val)
        const length = this.category_list.length
        this.is_category_all = length === ActorCategory.AllCategories.length
        this.is_category_partial = length > 0 && length < ActorCategory.AllCategories.length
    }

    resetTags() {
        this.tag_list = []
        this.no_tag = false
    }

    onCheckedTagChange() {
        if (this.tag_list.length > 0) {
            this.no_tag = false
        }
    }

    checkNoTag(val: boolean) {
        if (val) {
            this.tag_list = []
        }
    }

    resetScores() {
        this.min_score = 0
        this.max_score = 10
    }

    onFilterNameChange() {

    }

    resetName() {
        this.name = ""
    }
}

