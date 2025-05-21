let _next_uuid = 0

export default class BaseData {
    public readonly uuid: number

    constructor(json_data?) {
        this.uuid = ++_next_uuid
        Object.assign(this, json_data)
    }
}