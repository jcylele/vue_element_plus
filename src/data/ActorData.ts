import EditableData from "./EditableData";
import {Base64} from "js-base64";

const res_state = ["未下载", "已下载", "大文件", "已删除"]

interface ResFileInfo {
    res_state: number,
    res_size: number,
    img_count: number,
    video_count: number,
}

interface ActorFileInfo {
    res_info: ResFileInfo[]
    total_post_count: number
    unfinished_post_count: number
    finished_post_count: number
}

export default class ActorData extends EditableData {
    readonly actor_name: string
    actor_category: number
    score: number
    href: string
    has_main_actor: boolean
    remark: string
    tag_ids: number[]
    file_info: ActorFileInfo

    get post_desc() {
        if (this.file_info.unfinished_post_count > 0) {
            return `[${this.file_info.finished_post_count}(+${this.file_info.unfinished_post_count})/${this.file_info.total_post_count}]`
        } else {
            return `[${this.file_info.finished_post_count}/${this.file_info.total_post_count}]`
        }
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
        } else {
            this.remark = ""
        }
    }

    sortTags(compareFn?: (a: number, b: number) => number) {
        this.tag_ids.sort(compareFn)
    }

    hasTag(tag_id: number) {
        return this.tag_ids.indexOf(tag_id) >= 0
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