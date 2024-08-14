import ActorTagData from "../data/ActorTagData";
import {fetchDelete, fetchGet, fetchPost, fetchPut} from "./FetchCtrl";
import AllActorTagPriorities from "../data/ActorTagPriority";

const baseUrl = "http://127.0.0.1:8000/api/actor_tag"

export async function addActorTag(actor_tag: ActorTagData) {
    const url = `${baseUrl}/add`
    const [ok, response] = await fetchPost(url, actor_tag)
    if (!ok) {
        return [ok, response]
    }
    const tag = new ActorTagData(response)
    return [true, tag]
}

export async function updateTagName(actor_tag: ActorTagData): Promise<[boolean, ActorTagData]> {
    const url = `${baseUrl}/${actor_tag.tag_id}?tag_name=${actor_tag.tag_name}`;
    const [ok, response] = await fetchPut(url, actor_tag)
    if (!ok) {
        return [ok, response]
    }
    const tag = new ActorTagData(response)
    return [true, tag]
}

export async function updatePriorities(tag_priorities: AllActorTagPriorities) {
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
