import { fetchPost } from "./FetchCtrl";
import { FolderData } from "../data/FolderData";
import { CommonPriority } from "../data/WebData";
import { BaseGroupCtrl } from "./BaseGroupCtrl";


const baseUrl = "/favorite_folder"

// 继承基础控制器

class FolderCtrl extends BaseGroupCtrl<FolderData> {
	protected getDataClass() {
		return FolderData;
	}
}

// 创建实例
const folderCtrl = new FolderCtrl(baseUrl);

export async function getFolders() {
	return await folderCtrl.getList()
}

export async function getFolder(folder_id: number) {
	return await folderCtrl.getById(folder_id)
}

export async function addFolder(data: FolderData) {
	return await folderCtrl.add(data)
}

export async function updateFolder(data: FolderData) {
	return await folderCtrl.update(data)
}

export async function deleteFolder(folder_id: number) {
	return await folderCtrl.delete(folder_id)
}

export async function updatePriorities(priorities: CommonPriority[]) {
	return await folderCtrl.updatePriorities(priorities)
}

// endregion 继承基础控制器

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

