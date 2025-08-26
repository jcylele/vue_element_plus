import { ActorTagData } from "../data/ActorTagData";
import { fetchDelete, fetchGet, fetchPost, fetchPostStr } from "./FetchCtrl";
import { CommonPriority } from "../data/WebData";

const baseUrl = "/actor_tag"

export async function getActorTagList() {
	const url = `${baseUrl}/list`
	return await fetchGet(url, ActorTagData, true)
}

export async function addActorTag(actor_tag: ActorTagData) {
	const url = `${baseUrl}/add`
	return await fetchPost<ActorTagData>(url, actor_tag, ActorTagData, false)
}

export async function updateTagName(tag_id: number, tag_name: string) {
	const url = `${baseUrl}/${tag_id}/name`;
	return await fetchPostStr(url, tag_name)
}

export async function updatePriorities(tag_priorities: CommonPriority[]) {
	const url = `${baseUrl}/priority`
	return await fetchPost(url, tag_priorities)
}

export async function getActorTag(tag_id: number) {
	const url = `${baseUrl}/${tag_id}`
	return await fetchGet<ActorTagData>(url, ActorTagData, false)
}


export async function delActorTag(tag_id: number) {
	const url = `${baseUrl}/${tag_id}`
	return await fetchDelete(url)
}
