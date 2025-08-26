import { fetchPatch } from "./FetchCtrl";
import { ActorTagGroupData } from "../data/ActorTagGroupData";
import { CommonPriority } from "../data/WebData";
import { BaseGroupCtrl } from "./BaseGroupCtrl";

const baseUrl = "/actor_tag_group"

// region 继承基础控制器
class ActorTagGroupCtrl extends BaseGroupCtrl<ActorTagGroupData> {
	protected getDataClass() {
		return ActorTagGroupData
	}
}

const actorTagGroupCtrl = new ActorTagGroupCtrl(baseUrl)

export async function getActorTagGroupList() {
	return await actorTagGroupCtrl.getList()
}

export async function getActorTagGroup(group_id: number) {
	return await actorTagGroupCtrl.getById(group_id)
}

export async function addActorTagGroup(actor_group: ActorTagGroupData) {
	return await actorTagGroupCtrl.add(actor_group)
}

export async function updateActorTagGroup(actor_group: ActorTagGroupData) {
	return await actorTagGroupCtrl.update(actor_group)
}


export async function delActorTagGroup(group_id: number) {
	return await actorTagGroupCtrl.delete(group_id)
}

export async function updatePriorities(priorities: CommonPriority[]) {
	return await actorTagGroupCtrl.updatePriorities(priorities)
}

// endregion 继承基础控制器

export async function addActorTagToGroup(group_id: number, tag_id: number) {
	const url = `${baseUrl}/${group_id}/add_tag/${tag_id}`
	return await fetchPatch(url)
}

export async function delActorTagFromGroup(group_id: number, tag_id: number) {
	const url = `${baseUrl}/${group_id}/remove_tag/${tag_id}`
	return await fetchPatch(url)
}

