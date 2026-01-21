import { fetchGet, fetchPost, SingleResult } from "./FetchCtrl";
import DownloadingVideoStats from "../data/DownloadingVideoStats";
import { IActorNameStatsNode, IActorWithMissingPosts, IGroupTimeStats, ITagCount } from "../data/SchemasOthers";
import { ActorNameStatsForm, GroupTimeStatsForm } from "../data/WebData";

const baseUrl = "/chart"

export async function getRelativesByTag(tag_id: number, limit: number) {
	const url = `${baseUrl}/relative_of_tag?id=${tag_id}&limit=${limit}`;
	return await fetchGet<ITagCount>(url, undefined, true)
}

export async function getScoresByTag(tag_ids: number[]) {
	const url = `${baseUrl}/scores_of_tag`;
	return await fetchPost<number[][]>(url, tag_ids)
}

export async function getTagsByScore(min_score: number, max_score: number, limit: number) {
	const url = `${baseUrl}/tags_of_score?min=${min_score}&max=${max_score}&limit=${limit}`;
	return await fetchGet<ITagCount>(url, undefined, true)
}

export async function getGroupSizes(): Promise<SingleResult<Map<number, number>>> {
	const url = `${baseUrl}/down_size_of_groups`;
	return await fetchGet<Map<number, number>>(url, undefined, false)
}

export async function getDownloadingFileStats() {
	const url = `${baseUrl}/downloading_video_stats`;
	return await fetchGet<DownloadingVideoStats>(url, DownloadingVideoStats, true)
}

export async function getGroupTimeStats(group_ids: number[], start_date: string, end_date: string) {
	const url = `${baseUrl}/actor_group_time_stats`;
	const form = new GroupTimeStatsForm()
	form.group_ids = group_ids
	form.start_date = start_date
	form.end_date = end_date
	return await fetchPost<IGroupTimeStats>(url, form, undefined, true)
}

export async function getActorNameStats(is_prefix: boolean, min_length: number, max_length: number, top_count: number) {
	const url = is_prefix ? `${baseUrl}/actor_name_prefix_stats` : `${baseUrl}/actor_name_postfix_stats`;
	const form = new ActorNameStatsForm()
	form.min_len = min_length
	form.max_len = max_length
	form.limit = top_count
	return await fetchPost<IActorNameStatsNode>(url, form, undefined, false)
}

export async function getActorNameSubstringStats(min_length: number, max_length: number, top_count: number) {
	const url = `${baseUrl}/actor_name_substring_stats`;
	const form = new ActorNameStatsForm()
	form.min_len = min_length;
	form.max_len = max_length;
	form.limit = top_count;
	return await fetchPost(url, form, undefined, false)
}