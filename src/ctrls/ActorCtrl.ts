import { ActorData } from "../data/ActorData";
import { fetchDelete, fetchGet, fetchPatch, fetchPost, fetchPostStr, logErrorCode, logInfo } from "./FetchCtrl";
import { ActorFilterData } from "../data/ActorFilterData";
import { ResSizeCount } from "../data/ResSizeCount";
import { ActorVideoInfo } from "../data/ActorVideoInfo";
import { ResFileInfo } from "../data/ResFileInfo";
import { ICommentCount, IPostFetchTimeStats, IUnifiedResponse, IMissingPost } from "../data/SchemasOthers";
import { ErrorCode } from "../data/Enums";
import { ActorFileDetail } from "../data/FileInfo";
import { ActorLog } from "../data/ActorLog";
import { LogMessages } from "../data/Messages";

const baseUrl = "/actor"

class BatchActorGroup {
	actor_ids: number[]
	group_id: number
}

class LinkActorForm {
	actor_ids: number[]
	score: number
	tag_list: number[]
	remark: string
}

function _toActorMap(list: ActorData[]): Map<number, ActorData> {
	const ret = new Map<number, ActorData>()
	for (const actor of list) {
		ret.set(actor.actor_id, actor)
	}
	return ret
}

export async function getActorCount(filter_condition: ActorFilterData) {
	const url = `${baseUrl}/count`
	return await fetchPost<number>(url, filter_condition, undefined, false)
}

export async function getActorCountInGroups() {
	const url = `${baseUrl}/actor_count_in_groups`
	return await fetchGet(url)
}

export async function getActorCountInFolders() {
	const url = `${baseUrl}/actor_count_in_folders`
	return await fetchGet(url)
}

export async function getActorIds(filter_condition: ActorFilterData, limit: number = 0, start: number = 0) {
	const url = `${baseUrl}/list?limit=${limit}&start=${start}`
	return await fetchPost<number>(url, filter_condition, undefined, true)
}

export async function linkSameActors(actor_ids: number[], score: number, remark: string, tag_list: number[]) {
	const url = `${baseUrl}/link`;
	const form = new LinkActorForm()
	form.actor_ids = actor_ids
	form.score = score
	form.remark = remark
	form.tag_list = tag_list
	const [ok, actor_list] = await fetchPost<ActorData>(url, form, ActorData, true)
	if (!ok) {
		return [false, undefined]
	}
	return [true, _toActorMap(actor_list)]
}

export async function unlinkSameActors(actor_ids: number[]) {
	const url = `${baseUrl}/unlink`;
	const [ok, actor_list] = await fetchPost<ActorData>(url, actor_ids, ActorData, true)
	if (!ok) {
		return [false, undefined]
	}
	return [true, _toActorMap(actor_list)]
}


export async function batchChangeActorGroup(actor_ids: number[], group_id: number, group_name: string) {
	const url = `${baseUrl}/batch/group`;
	let form = new BatchActorGroup()
	form.group_id = group_id
	form.actor_ids = actor_ids
	const [ok, response_list] = await fetchPost(url, form, undefined, true)
	if (!ok) {
		return [false, undefined]
	}

	const actor_map = new Map<number, ActorData>()
	for (const response of response_list) {
		const actor = new ActorData(response.data!)
		if (response.error_code !== ErrorCode.Success) {
			logErrorCode(response.error_code)
		} else {
			logInfo(LogMessages.ActorChangeGroup(actor.actor_name, group_name))
		}
		actor_map.set(actor.actor_id, actor)
	}
	return [true, actor_map]
}

export async function getActor(actor_id: number) {
	const url = `${baseUrl}/${actor_id}`
	return await fetchGet<ActorData>(url, ActorData, false)
}

export async function changeActorGroup(actor_id: number, group_id: number) {
	const url = `${baseUrl}/${actor_id}/group?val=${group_id}`;
	return await fetchPatch<ActorData>(url, undefined, ActorData, false)
}

export async function changeActorScore(actor_id: number, score: number) {
	const url = `${baseUrl}/${actor_id}/score?val=${score}`;
	const [ok, actor_list] = await fetchPatch<ActorData>(url, undefined, ActorData, true)
	if (!ok) {
		return [false, undefined]
	}
	return [true, _toActorMap(actor_list)]
}

export async function changeActorRemark(actor_id: number, remark: string) {
	const url = `${baseUrl}/${actor_id}/remark`;
	const [ok, actor_list] = await fetchPostStr<ActorData>(url, remark, ActorData, true)
	if (!ok) {
		return [false, undefined]
	}
	return [true, _toActorMap(actor_list)]
}

export async function changeActorComment(actor_id: number, comment: string) {
	const url = `${baseUrl}/${actor_id}/comment`;
	return await fetchPostStr<ActorData>(url, comment, ActorData, false)
}

export async function ChangeActorTag(actor_id: number, tag_list: number[]) {
	let url = `${baseUrl}/${actor_id}/tag`;
	const [ok, actor_list] = await fetchPost<ActorData>(url, tag_list, ActorData, true)
	if (!ok) {
		return [false, undefined]
	}
	return [true, _toActorMap(actor_list)]
}

export async function openActorFolder(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/open`;
	return await fetchGet(url)
}

export async function openActorThumbnailFolder(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/open_thumbnail_folder`;
	return await fetchGet(url)
}

export async function resetActorResStates(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/reset_res_states`;
	return await fetchPatch<ActorFileDetail>(url, undefined, ActorFileDetail, false)
}

export async function resetLastPostId(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/reset_last_post_id`;
	return await fetchPatch(url)
}

export async function clearActorFolder(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/clear`;
	return await fetchPatch<ActorFileDetail>(url, undefined, ActorFileDetail, false)
}


export async function getActorFileInfo(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/file_info`;
	return await fetchGet<ActorFileDetail>(url, ActorFileDetail, false)
}

export async function getActorVideoInfo(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/video_stats`;
	return await fetchGet<ActorVideoInfo>(url, ActorVideoInfo, true)
}

export async function getActorDownloadingFiles(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/downloading_files`;
	return await fetchGet<ResFileInfo>(url, ResFileInfo, true)
}

export async function removeDownloadingFiles(actor_id: number, percent: number) {
	const url = `${baseUrl}/remove_downloading_files?actor_id=${actor_id}&percent=${percent}`;
	return await fetchDelete(url)
}

export async function renameActorFiles(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/rename_files`;
	return await fetchGet(url)
}

export async function removeActorFiles(actor_id: number, is_landscape: boolean) {
	const url = `${baseUrl}/${actor_id}/remove_by_dir?is_landscape=${is_landscape}`;
	return await fetchPatch(url)
}

export async function getActorLogs(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/logs`;
	return await fetchGet<ActorLog>(url, ActorLog, true)
}


export async function getLinkedActorIds(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/linked`;
	return await fetchGet(url)
}

export async function getLinkedActorGroupIds(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/linked_groups`;
	return await fetchGet(url)
}


export async function getVideoSizes(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/video_sizes`
	return await fetchGet<ResSizeCount>(url, ResSizeCount, true)
}

export async function getPostFetchTimeStats(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/post_fetch_time_stats`
	return await fetchGet<IPostFetchTimeStats>(url, undefined, true)
}

export async function getPostFetchDates(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/post_fetch_dates`
	return await fetchGet<string>(url, undefined, true)
}

export async function getMissingPosts(actor_id: number) {
	const url = `${baseUrl}/${actor_id}/missing_posts`
	return await fetchGet<IMissingPost>(url, undefined, true)
}

export async function getComments() {
	const url = `${baseUrl}/comments`
	return await fetchGet<ICommentCount>(url, undefined, true)
}

export async function clearFolderOfGroup(group_id: number) {
	const url = `${baseUrl}/clear_group_folder/${group_id}`
	return await fetchGet(url)
}