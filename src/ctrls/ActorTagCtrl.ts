import { ActorTagData } from "../data/ActorTagData";
import { fetchDelete, fetchGet, fetchPost, fetchPostStr, fetchPut } from "./FetchCtrl";
import { CommonPriority } from "../data/WebData";
import { BASE_URL } from "../data/Consts";

const baseUrl = `${BASE_URL}/api/actor_tag`

export async function addActorTag(actor_tag: ActorTagData) {
	const url = `${baseUrl}/add`
	const [ok, response] = await fetchPost(url, actor_tag)
	if (!ok) {
		return [ok, response]
	}
	const tag = new ActorTagData(response)
	return [true, tag]
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
	const [ok, response] = await fetchGet(url)
	if (!ok) {
		return [ok, response]
	}
	const tag = new ActorTagData(response)
	return [true, tag]
}

export async function getActorTagList() {
	const url = `${baseUrl}/list`
	const [ok, response] = await fetchGet(url)
	if (!ok) {
		return [ok, response]
	}
	const list = [] as ActorTagData[]
	for (const json_data of response) {
		list.push(new ActorTagData(json_data))
	}
	// list.sort(compareActorTag)
	return [true, list]
}


export async function delActorTag(tag_id: number) {
	const url = `${baseUrl}/${tag_id}`
	return await fetchDelete(url)
}
