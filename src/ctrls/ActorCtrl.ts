import ActorData from "../data/ActorData";
import {fetchDelete, fetchGet, fetchPatch, fetchPost} from "./FetchCtrl";
import ActorFilterData from "../data/ActorFilterData";

const baseUrl = "http://127.0.0.1:8000/api/actor"

export async function getActor(actor_name: string) {
    const url = `${baseUrl}/${actor_name}`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function getActorCount(filter_condition: ActorFilterData) {
    const url = `${baseUrl}/count`
    const [ok, response] = await fetchPost(url, filter_condition)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function getActorList(filter_condition: ActorFilterData, limit: number = 0, start: number = 0) {
    const url = `${baseUrl}/list?limit=${limit}&start=${start}`
    const [ok, response] = await fetchPost(url, filter_condition)
    if (!ok) {
        return [ok, response]
    }
    const list = []
    for (const json_data of response) {
        list.push(new ActorData(json_data))
    }
    return [true, list]
}

export async function removeTagFromActor(actor_name: string, tag_id: number) {
    const url = `${baseUrl}/${actor_name}/${tag_id}`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function addTagToActor(actor_name: string, tag_list: number[]) {
    let url = `${baseUrl}/${actor_name}/tag?`;
    const query_list = []
    for (const tag_id of tag_list) {
        query_list.push(`id=${tag_id}`)
    }
    url += query_list.join('&');

    const [ok, response] = await fetchPost(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function openActorFolder(actor_name: string) {
    const url = `${baseUrl}/${actor_name}/open`;
    return await fetchGet(url)
}

export async function changeActorCategory(actor_name: string, actor_category: number) {
    const url = `${baseUrl}/${actor_name}?category=${actor_category}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}
