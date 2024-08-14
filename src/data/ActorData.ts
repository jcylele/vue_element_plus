import EditableData from "./EditableData";
import {Base64} from "js-base64";

const res_state = ["未下载", "已下载", "大文件", "已删除"]

interface ResFileInfo {
    res_state: number,
    res_size: number,
    img_count: number,
    video_count: number,
}

export default class ActorData extends EditableData {
    readonly actor_name: string
    rel_tags: number[]
    actor_category: number
    readonly completed: boolean
    remark: string
    main_actor: string
    // file_info: FileInfo
    total_post_count: number
    unfinished_post_count: number
    finished_post_count: number
    res_info: ResFileInfo[]
    href: string
    score: number

    get post_desc() {
        let desc = `[${this.finished_post_count}`
        if (this.unfinished_post_count > 0) {
            desc += `(+${this.unfinished_post_count})`
        }
        desc += `/${this.total_post_count}]`
        return desc
    }

    get show_score() {
        return this.score / 2
    }

    set show_score(val: number) {
        this.score = val * 2
    }

    constructor(json_data?) {
        super(json_data);
        // this.actor_category = ActorCategory.getByValue(json_data.actor_category)
        if (json_data.remark) {
            this.remark = Base64.decode(json_data.remark)
        }
    }

    sortTags(compareFn?: (a: number, b: number) => number) {
        this.rel_tags.sort(compareFn)
    }

    hasTag(tag_id: number) {
        return this.rel_tags.indexOf(tag_id) >= 0
    }

    formatResFileInfo(rfi: ResFileInfo): string {
        let size = rfi.res_size / (1024 * 1024 * 1024)
        size = Math.floor(size * 100) / 100
        return `${res_state[rfi.res_state - 1]}: ${size}G(${rfi.img_count}P,${rfi.video_count}V)`
    }

    get icon() {
        return `http://localhost:1314/_icon/${this.actor_name}.jfif`
    }

    get remark_list() {
        if (this.remark != null && this.remark != "") {
            return this.remark.split("\n")
        }
        return []
    }
}