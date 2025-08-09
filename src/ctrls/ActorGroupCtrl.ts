import { fetchPost } from "./FetchCtrl";
import ActorGroupData from "../data/ActorGroupData";
import { BASE_URL } from "../data/Consts";
import ActorGroupCond from "../data/ActorGroupCond";
import { CommonPriority } from "../data/WebData";
import { BaseGroupCtrl } from "./BaseGroupCtrl";

const baseUrl = `${BASE_URL}/api/actor_group`

// region 继承基础控制器
class ActorGroupCtrl extends BaseGroupCtrl<ActorGroupData> {
	protected getDataClass() {
		return ActorGroupData
	}
}

const actorGroupCtrl = new ActorGroupCtrl(baseUrl)

export async function getActorGroupList() {
	return await actorGroupCtrl.getList()
}

export async function getActorGroup(group_id: number) {
	return await actorGroupCtrl.getById(group_id)
}

export async function addActorGroup(actor_group: ActorGroupData) {
	return await actorGroupCtrl.add(actor_group)
}

export async function updateActorGroup(actor_group: ActorGroupData): Promise<[boolean, ActorGroupData]> {
	return await actorGroupCtrl.update(actor_group)
}


export async function delActorGroup(group_id: number) {
	return await actorGroupCtrl.delete(group_id)
}

export async function updatePriorities(priorities: CommonPriority[]) {
	return await actorGroupCtrl.updatePriorities(priorities)
}

// endregion 继承基础控制器

export async function setGroupCondition(group_id: number, cond_list: ActorGroupCond[]) {
	const url = `${baseUrl}/${group_id}/set_condition`
	return await fetchPost(url, cond_list)
}