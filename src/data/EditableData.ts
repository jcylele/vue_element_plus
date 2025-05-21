import BaseData from "./BaseData";

export default class EditableData extends BaseData {
    private _changed: boolean

    public get changed() {
        return this._changed;
    }

    public set changed(_: boolean) {
        this._changed = true
    }

    constructor(json_data?) {
        super(json_data)
        this._changed = false
    }
}