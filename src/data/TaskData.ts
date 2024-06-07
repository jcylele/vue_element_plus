import EditableData from "./EditableData";
import {DownloadLimitForm} from "./SimpleForms";

export default class TaskData extends EditableData {
    readonly uid: number
    desc: string
    download_limit: DownloadLimitForm
    worker_count: Map<string, number>
    queue_count: Map<string, number>

    constructor(json_data?) {
        super(json_data);
        this.download_limit = new DownloadLimitForm(json_data.download_limit)
    }
}