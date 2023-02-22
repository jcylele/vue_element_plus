export interface IArrayElement {
    index: number,
    data: object
}


export function ToElementArray(data_list: object[]): IArrayElement[] {
    const ret = []
    for (const i in data_list) {
        ret.push({"index": i, "data": data_list[i]})
    }
    return ret
}