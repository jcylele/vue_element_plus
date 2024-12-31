import {fetchGet, fetchPost} from "./FetchCtrl";
import {BASE_URL} from "../data/Consts";

const baseUrl = `${BASE_URL}/api/chart`

export async function getRelativesByTag(tag_id: number, limit: number) {
    const url = `${baseUrl}/relative_of_tag?id=${tag_id}&limit=${limit}`;
    return await fetchGet(url)
}

export async function getScoresByTag(tag_ids: number[]) {
    const url = `${baseUrl}/scores_of_tag`;
    return await fetchPost(url, tag_ids)
}

export async function getTagsByScore(min_score: number, max_score: number, limit: number) {
    const url = `${baseUrl}/tags_of_score?min=${min_score}&max=${max_score}&limit=${limit}`;
    return await fetchGet(url)
}