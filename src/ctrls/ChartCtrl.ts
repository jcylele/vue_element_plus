import {fetchGet} from "./FetchCtrl";

const baseUrl = "http://127.0.0.1:8000/api/chart"

export async function getScoresByTag(tag_id: number) {
    const url = `${baseUrl}/scores_of_tag/${tag_id}`;
    return await fetchGet(url)
}

export async function getTagsByScore(min_score: number, max_score: number) {
    const url = `${baseUrl}/tags_of_score?min=${min_score}&max=${max_score}`;
    return await fetchGet(url)
}