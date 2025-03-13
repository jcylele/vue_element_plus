import ActorData from "../data/ActorData";
import {fetchGet, fetchPatch, fetchPost, logWarn} from "./FetchCtrl";
import ActorFilterData from "../data/ActorFilterData";
import {Base64} from "js-base64";
import {BatchActorGroup} from "../data/SimpleForms";
import {BASE_URL} from "../data/Consts";
import ResSizeCount from "../data/ResSizeCount";
import {ActorResult} from "../data/WebData";

const baseUrl = `${BASE_URL}/api/actor`

function _toActorResult(json_obj): ActorResult {
    return new ActorResult(json_obj)
}

function _toActorList(json_data): ActorData[] {
    const list = []
    for (const json_obj of json_data) {
        list.push(new ActorData(json_obj))
    }
    return list
}

function _toActorResultMap(json_data): Map<number, ActorResult> {
    const map = new Map<number, ActorResult>()
    for (const json_obj of json_data) {
        const ar = _toActorResult(json_obj)
        map.set(ar.actor.actor_id, ar)
    }
    return map
}


export async function getActorCount(filter_condition: ActorFilterData) {
    const url = `${baseUrl}/count`
    const [ok, response] = await fetchPost(url, filter_condition)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

export async function getActorIds(filter_condition: ActorFilterData, limit: number = 0, start: number = 0) {
    const url = `${baseUrl}/list?limit=${limit}&start=${start}`
    return await fetchPost(url, filter_condition)
}

export async function linkSameActors(actor_ids: number[]) {
    const url = `${baseUrl}/link`;
    const [ok, response] = await fetchPost(url, actor_ids)
    if (!ok) {
        return [false, response]
    }

    return [true, _toActorResultMap(response)]
}

export async function unlinkSameActors(actor_ids: number[]) {
    const url = `${baseUrl}/unlink`;
    const [ok, response] = await fetchPost(url, actor_ids)
    if (!ok) {
        return [false, response]
    }

    return [true, _toActorResultMap(response)]
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

    return [true, _toActorResultMap(response)]
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
    return [true, _toActorResult(response)]
}

export async function changeActorScore(actor_id: number, score: number) {
    const url = `${baseUrl}/${actor_id}/score?val=${score}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    return [true, _toActorResultMap(response)]
}

export async function changeActorRemark(actor_id: number, remark: string) {
    const encoded_remark = Base64.encodeURI(remark)
    const url = `${baseUrl}/${actor_id}/remark?val=${encoded_remark}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    return [true, _toActorResult(response)]
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
    return [true, _toActorResultMap(response)]
}


export async function getActorFileInfo(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/file_info`;
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }
    return [true, response]
}


export async function getActorLogs(actor_id: number) {
    const url = `${baseUrl}/${actor_id}/logs`;
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }
    return [true, response]
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
    const [ok, response] = await fetchGet(url)
    if (!ok) {
        return [false, response]
    }
    const rsc_list: ResSizeCount[] = []
    for (const json_obj of response) {
        const rsc = new ResSizeCount(json_obj)
        rsc_list.push(rsc)
    }
    return [true, rsc_list]
}

export async function resetManual() {
    const url = `${baseUrl}/reset_manual`
    return await fetchGet(url)
}

export async function findSimilarActorNames() {
    const url = `${baseUrl}/similar_names`
    return await fetchGet(url)
}