let _next_uuid = 0

export default class BaseData {
    public readonly uuid: number

    constructor(json_data?: any) {
        this.uuid = ++_next_uuid
        if (json_data) {
            Object.assign(this, json_data)
        }
    }
}