import EditableData from "./EditableData";
import {str_res_state} from "./Consts";

const GB1 = 1024 * 1024 * 1024

class ResFileInfo extends EditableData {
    res_state: number
    res_size: number
    img_count: number
    video_count: number

    constructor(json_data?) {
        super(json_data);
    }

    public get res_state_class() {
        return `res${this.res_state}`
    }

    public get str_img_count() {
        return `${this.img_count}P`
    }

    public get str_video_count() {
        return `${this.video_count}V`
    }

    public get str_state() {
        return str_res_state[this.res_state]
    }

    public get str_size() {
        let size = this.res_size / GB1
        size = Math.floor(size * 100) / 100
        return `${size}G`
    }

    public get desc() {
        let size = this.res_size / GB1
        size = Math.floor(size * 100) / 100
        return `${str_res_state[this.res_state]}: ${size}G(${this.img_count}P,${this.video_count}V)`
    }
}

export default class ActorFileInfo extends EditableData {
    res_info: ResFileInfo[]
    total_post_count: number
    unfinished_post_count: number
    finished_post_count: number

    constructor(json_data?) {
        super(json_data);

        if (!json_data) {
            return
        }

        // default values for specific fields
        this.res_info = []
        for (const rfi of json_data.res_info) {
            this.res_info.push(new ResFileInfo(rfi))
        }
    }
}