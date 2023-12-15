import ActorCategory from "../consts/ActorCategory";
import EditableData from "./EditableData";

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
    actor_category: ActorCategory
    readonly completed: boolean
    star: boolean
    remark: string
    // file_info: FileInfo
    post_info: number[]
    res_info: ResFileInfo[]
    href: string

    constructor(json_data?) {
        super(json_data);
        this.actor_category = ActorCategory.getByValue(json_data.actor_category)
    }

    sortTags(compareFn?: (a: number, b: number) => number) {
        this.rel_tags.sort(compareFn)
    }

    hasTag(tag_id: number) {
        return this.rel_tags.indexOf(tag_id) >= 0
    }

    hasFolder() {
        return this.actor_category.value == ActorCategory.Init.value
            || this.actor_category.value === ActorCategory.Liked.value;
    }

    formatResFileInfo(rfi: ResFileInfo): string {
        let size = rfi.res_size / (1024 * 1024 * 1024)
        size = Math.floor(size * 100) / 100
        return `${res_state[rfi.res_state - 1]}: ${size}G(${rfi.img_count}P,${rfi.video_count}V)`
    }
}