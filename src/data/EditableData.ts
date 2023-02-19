
export default class EditableData {

    private _changed: boolean

    public get changed() {
        return this._changed;
    }

    public set changed(_: boolean) {
        this._changed = true
    }

    constructor(json_data?) {
        Object.assign(this, json_data)
    }
}