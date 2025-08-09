import { GroupEntity } from "../data/Interfaces";
import { CommonPriority } from "../data/WebData";
import { fetchDelete, fetchGet, fetchPost } from "./FetchCtrl";

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

// 定义可构造的泛型约束
type Constructable<T> = new (data?: any) => T;

// 基础控制器类
export abstract class BaseGroupCtrl<T extends GroupEntity> {
	protected baseUrl: string;

	constructor(baseUrl: string) {
		this.baseUrl = baseUrl;
	}

	protected abstract getDataClass(): Constructable<T>;

	async getList(): Promise<[boolean, T[] | any]> {
		const url = `${this.baseUrl}/list`;
		const [ok, response] = await fetchGet(url);
		if (!ok) {
			return [ok, response];
		}
		const DataClass = this.getDataClass();
		const items = response.map((item: any) => new DataClass(item));
		return [true, items];
	}

	async getById(id: number): Promise<[boolean, T | any]> {
		const url = `${this.baseUrl}/${id}`;
		const [ok, response] = await fetchGet(url);
		if (!ok) {
			return [ok, response];
		}
		const DataClass = this.getDataClass();
		const item = new DataClass(response);
		return [true, item];
	}

	async add(data: T): Promise<[boolean, T | any]> {
		const url = `${this.baseUrl}/add`;
		const [ok, response] = await fetchPost(url, data.toForm());
		if (!ok) {
			return [ok, response];
		}
		const DataClass = this.getDataClass();
		const item = new DataClass(response);
		return [true, item];
	}

	async update(data: T): Promise<[boolean, T | any]> {
		const url = `${this.baseUrl}/${data.key}/update`;
		const [ok, response] = await fetchPost(url, data.toForm());
		if (!ok) {
			return [ok, response];
		}
		const DataClass = this.getDataClass();
		const item = new DataClass(response);
		return [true, item];
	}

	async delete(id: number): Promise<[boolean, any]> {
		const url = `${this.baseUrl}/${id}`;
		const [ok, response] = await fetchDelete(url);
		if (!ok) {
			return [ok, response];
		}
		return [true, response.value];
	}

	async updatePriorities(priorities: CommonPriority[]): Promise<[boolean, any]> {
		const url = `${this.baseUrl}/priority`
		const [ok, response] = await fetchPost(url, priorities)
		if (!ok) {
			return [ok, response]
		}
		return [true, response.value]
	}
}