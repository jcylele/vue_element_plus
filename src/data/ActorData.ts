import EditableData from "./EditableData";
import {Base64} from "js-base64";
import {PostData} from "./PostData";
import {ResState} from "./Enums";
import ActorFileInfo from "./FileInfo";


export default class ActorData extends EditableData {
    actor_id: number
    actor_name: string
    actor_group_id: number
    score: number
    href: string
    has_main_actor: boolean
    remark: string
    commented_posts: PostData[]
    tag_ids: number[]
    file_info: ActorFileInfo

    get is_video_all() {
        if (!this.file_info) {
            return false
        }
        let un_down_video_count = 0
        for (const resFileInfo of this.file_info.res_info) {
            switch (resFileInfo.res_state) {
                case ResState.Init:
                case ResState.Skip:
                    un_down_video_count += resFileInfo.video_count
                    break
            }
        }
        if (un_down_video_count > 0) {
            return false
        }
        if (this.file_info.finished_post_count < this.file_info.total_post_count) {
            return false
        }
        return true
    }

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

    get has_remark() {
        return (this.remark !== "") || this.commented_posts.length > 0
    }

    constructor(json_data?) {
        super(json_data);

        // default values for specific fields
        this.tag_ids ??= []
        this.remark = ""
        this.commented_posts = []

        if (!json_data) {
            return
        }

        if (json_data.remark) {
            this.remark = Base64.decode(json_data.remark)
        }
        for (const jsonDatum of json_data.commented_posts) {
            this.commented_posts.push(new PostData(jsonDatum))
        }
    }

    sortTags(compareFn?: (a: number, b: number) => number) {
        this.tag_ids.sort(compareFn)
    }

    hasTag(tag_id: number) {
        return this.tag_ids.indexOf(tag_id) >= 0
    }

    get icon() {
        return `http://localhost:1314/_icon/${this.actor_name}.jfif`
    }
}