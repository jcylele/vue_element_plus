import ActorData from "../data/ActorData";
import {fetchGet, fetchPatch, fetchPost} from "./FetchCtrl";
import ActorFilterData from "../data/ActorFilterData";
import {Base64} from "js-base64";
import {BatchActorGroup} from "../data/SimpleForms";

const baseUrl = "http://127.0.0.1:8000/api/actor"


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

export async function linkSameActors(actor_ids: number[]) {
    const url = `${baseUrl}/link`;
    const [ok, response] = await fetchPost(url, actor_ids)
    if (!ok) {
        return [false, response]
    }

    const map = {}
    for (const json_data of response) {
        const actor = new ActorData(json_data)
        map[actor.actor_id] = actor
    }
    return [true, map]
}

export async function unlinkSameActors(actor_ids: number[]) {
    const url = `${baseUrl}/unlink`;
    const [ok, response] = await fetchPost(url, actor_ids)
    if (!ok) {
        return [false, response]
    }

    const map = {}
    for (const json_data of response) {
        const actor = new ActorData(json_data)
        map[actor.actor_id] = actor
    }
    return [true, map]
}


export async function batchChangeActorGroup(actor_ids: number[], group_id: number) {
    const url = `${baseUrl}/batch/group`;
    let form = new BatchActorGroup()
    form.group_id = group_id
    form.actor_ids = actor_ids
    const [ok, response] = await fetchPost(url, form)
    if (!ok) {
        return [false, response]
    }

    const list = []
    for (const json_data of response) {
        list.push(new ActorData(json_data))
    }
    return [true, list]
}

export async function getActor(actor_id: number) {
    const url = `${baseUrl}/${actor_id}`
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function changeActorGroup(actor_id: number, group_id: number) {
    const url = `${baseUrl}/${actor_id}/group?val=${group_id}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function changeActorScore(actor_id: number, score: number) {
    const url = `${baseUrl}/${actor_id}/score?val=${score}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function changeActorRemark(actor_id: number, remark: string) {
    const encoded_remark = Base64.encodeURI(remark)
    const url = `${baseUrl}/${actor_id}/remark?val=${encoded_remark}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export async function openActorFolder(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/open`;
    return await fetchGet(url)
}

export async function resetActorPosts(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/reset_posts`;
    return await fetchPatch(url)
}

export async function clearActorFolder(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/clear`;
    return await fetchGet(url)
}

export async function ChangeActorTag(actor_id: number, tag_list: number[]) {
    let url = `${baseUrl}/${actor_id}/tag`;
    const [ok, response] = await fetchPost(url, tag_list)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}


export async function getFileInfo(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/file_info`;
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }
    return [true, response]
}


export async function getLinkedActors(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/linked`;
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }

    const list = []
    for (const json_data of response) {
        list.push(new ActorData(json_data))
    }
    return [true, list]
}