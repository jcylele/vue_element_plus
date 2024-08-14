import {ISortItem} from "./Interfaces";

export default class SortedList<T extends ISortItem> {
    private readonly list: T[]
    private is_dirty: boolean
    private dict: Map<number, T>

    constructor(origin_list: T[]) {
        // console.log(origin_list)
        this.list = origin_list
        this.is_dirty = true
        this.dict = new Map<number, T>()
        for (const item of origin_list) {
            this.dict.set(item.key, item)
        }
    }

    get sorted_list(): T[] {
        if (this.is_dirty) {
            this.list.sort(this.compareItem)
            this.is_dirty = false
        }
        return this.list
    }

    compareItem(a: T, b: T): number {
        return b.priority - a.priority;
    }

    add(item: T) {
        this.dict.set(item.key, item)

        this.list.push(item)
        this.is_dirty = true
    }

    update(item: T) {
        this.dict.set(item.key, item)

        for (let i = 0; i < this.list.length; i++) {
            let listItem = this.list[i]
            if (listItem.key == item.key) {
                this.list[i] = item
                if (listItem.priority != item.priority){
                    this.is_dirty = true
                }
                return
            }
        }
    }

    remove(key: number) {
        this.dict.delete(key)

        for (let i = 0; i < this.list.length; i++) {
            if (this.list[i].key == key) {
                this.list.splice(i, 1)
                return
            }
        }
    }

    get(key:number): T {
        return this.dict.get(key)
    }
}