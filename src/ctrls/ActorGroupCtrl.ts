import {fetchDelete, fetchGet, fetchPost} from "./FetchCtrl";
import ActorGroupData from "../data/ActorGroupData";

const baseUrl = "http://127.0.0.1:8000/api/actor_group"

export async function getActorGroupList() {
    const url = `${baseUrl}/list`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }
    const list = [] as ActorGroupData[]
    for (const json_data of response) {
        list.push(new ActorGroupData(json_data))
    }
    return [true, list]
}

export async function getActorGroup(group_id: number) {
    const url = `${baseUrl}/${group_id}`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }
    let group = new ActorGroupData(response)
    return [true, group]
}

export async function addActorGroup(actor_group: ActorGroupData) {
    const url = `${baseUrl}/add`
    const [ok, response] = await fetchPost(url, actor_group)
    if (!ok) {
        return [false, response]
    }
    const group = new ActorGroupData(response)
    return [true, group]
}

export async function updateActorGroup(actor_group: ActorGroupData): Promise<[boolean, ActorGroupData]> {
    const url = `${baseUrl}/update`;
    const [ok, response] = await fetchPost(url, actor_group)
    if (!ok) {
        return [false, response]
    }
    const group = new ActorGroupData(response)
    return [true, group]
}


export async function delActorGroup(group_id: number) {
    const url = `${baseUrl}/${group_id}`
    const [ok, response] = await fetchDelete(url)
    if (!ok) {
        return [false, response]
    }
    return [true, response.value]
}