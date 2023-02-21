import ActorData from "../data/ActorData";
import FetchCtrl from "./FetchCtrl";

const baseUrl = "http://127.0.0.1:8000/api/actor"

async function getActor(actor_name: string) {
    const url = `${baseUrl}/${actor_name}`
    const [ok, response] = await FetchCtrl.fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

async function getActorCount(actor_category: number) {
    const url = `${baseUrl}/count?category=${actor_category}`
    const [ok, response] = await FetchCtrl.fetchGet(url)
    if (!ok) {
        return [ok, response]
    }

    return [true, response.value]
}

async function getActorList(actor_category: number, limit: number = 0, start: number = 0) {
    const url = `${baseUrl}/list?category=${actor_category}&limit=${limit}&start=${start}`
    const [ok, response] = await FetchCtrl.fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const list = []
    for (const json_data of response) {
        list.push(new ActorData(json_data))
    }
    return [true, list]
}

async function removeTagFromActor(actor_name: string, tag_id: number) {
    const url = `${baseUrl}/${actor_name}/${tag_id}`
    const [ok, response] = await FetchCtrl.fetchDelete(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

async function addTagToActor(actor_name: string, tag_list: number[]) {
    let url = `${baseUrl}/${actor_name}/tag?`;
    const query_list = []
    for (const tag_id of tag_list) {
        query_list.push(`id=${tag_id}`)
    }
    url += query_list.join('&');

    const [ok, response] = await FetchCtrl.fetchPost(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

async function openActorFolder(actor_name: string) {
    const url = `${baseUrl}/${actor_name}/open`;
    return await FetchCtrl.fetchGet(url)
}

async function changeActorCategory(actor_name: string, actor_category: number) {
    const url = `${baseUrl}/${actor_name}?category=${actor_category}`;
    const [ok, response] = await FetchCtrl.fetchPatch(url)
    if (!ok) {
        return [false, response]
    }
    const actor = new ActorData(response)
    return [true, actor]
}

export default {
    getActor,
    getActorList,
    getActorCount,
    addTagToActor,
    removeTagFromActor,
    openActorFolder,
    changeActorCategory
}
