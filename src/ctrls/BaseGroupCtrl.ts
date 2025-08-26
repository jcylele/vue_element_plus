import { GroupEntity } from "../data/Interfaces";
import { CommonPriority } from "../data/WebData";
import { Constructable, fetchDelete, fetchGet, fetchPost, ListResult, SingleResult, VoidResult } from "./FetchCtrl";


export function swapGroup<T extends GroupEntity>(group_list: T[], group_id: number, up: boolean): CommonPriority[] | undefined {
	const index = group_list.findIndex(group => group.key == group_id)
	const swap_index = up ? index - 1 : index + 1
	if (swap_index < 0 || swap_index >= group_list.length) {
		return undefined
	}
	// swap these 2 groups
	const swap_group = group_list[swap_index]
	group_list[swap_index] = group_list[index]
	group_list[index] = swap_group
	// check if need update priorities
	const priorities: CommonPriority[] = []
	for (const [index, group] of group_list.entries()) {
		if (group.priority !== index + 1) {
			priorities.push(new CommonPriority(group.key, index + 1))
		}
	}
	return priorities
}

// 基础控制器类
export abstract class BaseGroupCtrl<T extends GroupEntity> {
	protected baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	protected abstract getDataClass(): Constructable<T>;

	async getList(): Promise<ListResult<T>> {
		const url = `${this.baseUrl}/list`;
		const DataClass = this.getDataClass();
		return await fetchGet(url, DataClass, true);
	}

	async getById(id: number): Promise<SingleResult<T>> {
		const url = `${this.baseUrl}/${id}`;
		const DataClass = this.getDataClass();
		return await fetchGet(url, DataClass, false);
	}

	async add(data: T): Promise<SingleResult<T>> {
		const url = `${this.baseUrl}/add`;
		const DataClass = this.getDataClass();
		return await fetchPost(url, data.toForm(), DataClass, false);
	}

	async update(data: T): Promise<SingleResult<T>> {
		const url = `${this.baseUrl}/${data.key}/update`;
		const DataClass = this.getDataClass();
		return await fetchPost(url, data.toForm(), DataClass, false);
	}

	async delete(id: number): Promise<VoidResult> {
		const url = `${this.baseUrl}/${id}`;
		return await fetchDelete(url, undefined, false);
	}

	async updatePriorities(priorities: CommonPriority[]): Promise<VoidResult> {
		const url = `${this.baseUrl}/priority`
		return await fetchPost(url, priorities, undefined, false);
	}
}