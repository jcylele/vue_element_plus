import { fetchGet, fetchPost, SingleResult } from "./FetchCtrl";
import DownloadingVideoStats from "../data/DownloadingVideoStats";
import { ITagCount } from "../data/SchemasOthers";

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