let _next_uuid = 0

export default class EditableData {
    public readonly uuid: number
    private _changed: boolean

    public get changed() {
        return this._changed;
    }

    public set changed(_: boolean) {
        this._changed = true
    }

    constructor(json_data?) {
        this.uuid = ++_next_uuid
        console.log("uuid", this.uuid)
        Object.assign(this, json_data)
    }
}