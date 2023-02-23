export interface IArrayElement<T> {
    index: number,
    data: T
}


export function ToElementArray<T>(data_list: T[]): IArrayElement<T>[] {
    const ret = []
    for (const i in data_list) {
        ret.push({"index": i, "data": data_list[i]})
    }
    return ret
}