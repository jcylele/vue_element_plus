import { BASE_URL } from "../data/Consts";
import { fetchDelete, fetchGet, fetchPost } from "./FetchCtrl";
import { FolderData } from "../data/FolderData";
import ActorData from "../data/ActorData";
import { ActorElement } from "../data/ArrayElement";


const baseUrl = `${BASE_URL}/api/favorite_folder`

export async function getFolders() {
	const url = `${baseUrl}/list`
	const [ok, response] = await fetchGet(url)
	if (!ok) {
		return [ok, response]
	}
	const folders = response.map((item: any) => new FolderData(item))
	return [true, folders]
}

export async function getFolder(folder_id: number) {
	const url = `${baseUrl}/${folder_id}`
	const [ok, response] = await fetchGet(url)
	if (!ok) {
		return [ok, response]
	}
	const folder = new FolderData(response)
	return [true, folder]
}

export async function addFolder(data: FolderData) {
	const url = `${baseUrl}/add`
	const [ok, response] = await fetchPost(url, data)
	if (!ok) {
		return [ok, response]
	}
	const folder = new FolderData(response)
	return [true, folder]
}

export async function updateFolder(data: FolderData) {
	const url = `${baseUrl}/${data.folder_id}/update`
	const [ok, response] = await fetchPost(url, data)
	if (!ok) {
		return [ok, response]
	}
	const folder = new FolderData(response)
	return [true, folder]
}

export async function deleteFolder(folder_id: number) {
	const url = `${baseUrl}/${folder_id}`
	const [ok, response] = await fetchDelete(url)
	if (!ok) {
		return [ok, response]
	}
	return [true, response.value]
}

export async function addActorToFolder(actor_id: number, folder_id: number) {
	const url = `${baseUrl}/${folder_id}/add_actor/${actor_id}`
	return await fetchPost(url)
}

export async function delActorFromFolder(actor_id: number, folder_id: number) {
	const url = `${baseUrl}/${folder_id}/remove_actor/${actor_id}`
	return await fetchPost(url)
}

export async function batchAddActorToFolder(folder_id: number, actor_ids: number[]) {
	const url = `${baseUrl}/${folder_id}/batch_add_actor`
	return await fetchPost(url, actor_ids)
}

export async function batchDelActorFromFolder(folder_id: number, actor_ids: number[]) {
	const url = `${baseUrl}/${folder_id}/batch_remove_actor`
	return await fetchPost(url, actor_ids)
}

export async function getFolderActors(folder_id: number) {
	const url = `${baseUrl}/${folder_id}/actors`
	const [ok, response] = await fetchGet(url)
	if (!ok) {
		return [ok, response]
	}
	const actors = response.map((item: any) => new ActorElement(new ActorData(item)))
	return [true, actors]
}

export async function reorderActorsInFolder(folder_id: number, actor_ids: number[]) {
	const url = `${baseUrl}/${folder_id}/reorder`
	const [ok, response] = await fetchPost(url, actor_ids)
	if (!ok) {
		return [ok, response]
	}
	const actors = response.map((item: any) => new ActorData(item))
	return [true, actors]
}