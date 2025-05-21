import ActorData from "../data/ActorData";
import {fetchGet, fetchPatch, fetchPost, logInfo, logWarn} from "./FetchCtrl";
import {ActorFilterData} from "../data/ActorFilterData";
import {Base64} from "js-base64";
import {BASE_URL} from "../data/Consts";
import ResSizeCount from "../data/ResSizeCount";
import {ActorListResult, ActorResult, BaseResult} from "../data/WebData";

const baseUrl = `${BASE_URL}/api/actor`

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

function logResult(br: BaseResult) {
    if (br.succeed) {
        logInfo(br.msg)
    } else {
        logWarn(br.msg)
    }
}

function _onActorListResult(response): Map<number, ActorData> {
    const alr = new ActorListResult(response)
    logResult(alr)
    return alr.actor_map
}


function _onActorResult(response): ActorData {
    const ar = new ActorResult(response)
    logResult(ar)
    return ar.actor
}


function _onActorResultList(response): Map<number, ActorData> {
    const actor_map = new Map<number, ActorData>()
    for (const json_obj of response) {
        const ar = new ActorResult(json_obj)
        logResult(ar)
        actor_map.set(ar.actor.actor_id, ar.actor)
    }
    return actor_map
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

export async function linkSameActors(actor_ids: number[], score: number, remark: string, tag_list: number[]) {
    const url = `${baseUrl}/link`;
    const form = new LinkActorForm()
    form.actor_ids = actor_ids
    form.score = score
    form.remark = remark
    form.tag_list = tag_list
    const [ok, response] = await fetchPost(url, form)
    if (!ok) {
        return [false, response]
    }

    const actor_map = _onActorListResult(response)
    return [true, actor_map]
}

export async function unlinkSameActors(actor_ids: number[]) {
    const url = `${baseUrl}/unlink`;
    const [ok, response] = await fetchPost(url, actor_ids)
    if (!ok) {
        return [false, response]
    }

    const actor_map = _onActorListResult(response)
    return [true, actor_map]
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

    const actor_map = _onActorResultList(response)
    return [true, actor_map]
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
    return [true, _onActorResult(response)]
}

export async function changeActorScore(actor_id: number, score: number) {
    const url = `${baseUrl}/${actor_id}/score?val=${score}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }

    const actor_map = _onActorListResult(response)
    return [true, actor_map]
}

export async function changeActorRemark(actor_id: number, remark: string) {
    const encoded_remark = Base64.encodeURI(remark)
    const url = `${baseUrl}/${actor_id}/remark?val=${encoded_remark}`;
    const [ok, response] = await fetchPatch(url)
    if (!ok) {
        return [false, response]
    }

    const actor_map = _onActorListResult(response)
    return [true, actor_map]
}

export async function ChangeActorTag(actor_id: number, tag_list: number[]) {
    let url = `${baseUrl}/${actor_id}/tag`;
    const [ok, response] = await fetchPost(url, tag_list)
    if (!ok) {
        return [false, response]
    }

    const actor_map = _onActorListResult(response)
    return [true, actor_map]
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

export async function clearFolderOfGroup(group_id: number) {
    const url = `${baseUrl}/clear_group_folder/${group_id}`
    return await fetchGet(url)
}