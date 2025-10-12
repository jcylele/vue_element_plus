
import {str_res_state, video_state_color} from "./Consts";
import {format_file_size_gb} from "./DataUtil";
import BaseData from "./BaseData";

class ActorFileInfo extends BaseData {
    res_state: number
    img_size: number
    video_size: number
    img_count: number
    video_count: number

    public get res_state_color(): string {
        return video_state_color[this.res_state]
    }

    public get str_img_count() {
        return `${this.img_count}P`
    }

    public get str_video_count() {
        return `${this.video_count}V`
    }

    public get str_video_size() {
        return format_file_size_gb(this.video_size)
    }

    public get str_state() {
        return str_res_state[this.res_state]
    }

    public get col_count() {
        return 4
    }

    public col_val(index: number): string {
        switch (index) {
            case 1:
                return this.str_state
            case 2:
                return this.str_video_size
            case 3:
                return this.str_img_count
            case 4:
                return this.str_video_count
            default:
                return "???"
        }
    }
}
export default class ActorFileDetail extends BaseData {
	thumbnail_count: number
    res_info: ActorFileInfo[]
    total_post_count: number
    unfinished_post_count: number
    finished_post_count: number
	is_completed: boolean

    constructor(json_data?) {
        super(json_data);

        if (!json_data) {
            return
        }

        this.res_info = json_data.res_info.map(rfi => new ActorFileInfo(rfi))
    }
}