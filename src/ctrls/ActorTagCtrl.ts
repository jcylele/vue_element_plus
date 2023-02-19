import ActorTagData from "../data/ActorTagData";
import FetchCtrl from "./FetchCtrl";

const baseUrl = "http://127.0.0.1:8000/api/actor_tag"

async function addActorTag(actor_tag: ActorTagData) {
    const url = `${baseUrl}/add`
    const [ok, response] = await FetchCtrl.fetchPost(url, actor_tag)
    if (!ok) {
        return [ok, response]
    }
    const tag = new ActorTagData(response)
    return [true, tag]
}

async function editActorTag(actor_tag: ActorTagData): Promise<[boolean, ActorTagData]>  {
    const url = `${baseUrl}/${actor_tag.tag_id}`
    const [ok, response] = await FetchCtrl.fetchPut(url, actor_tag)
    if (!ok) {
        return [ok, response]
    }
    const tag = new ActorTagData(response)
    return [true, tag]
}

async function getActorTag(tag_id: number) {
    const url = `${baseUrl}/${tag_id}`
    const [ok, response] = await FetchCtrl.fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const tag = new ActorTagData(response)
    return [true, tag]
}

async function getActorTagList() {
    const url = `${baseUrl}/list`
    const [ok, response] = await FetchCtrl.fetchGet(url)
    if (!ok) {
        return [ok, response]
    }
    const list = [] as ActorTagData[]
    for (const json_data of response) {
        list.push(new ActorTagData(json_data))
    }
    return [true, list]
}

function compareActorTag(a: ActorTagData, b: ActorTagData) : number {
    return b.tag_priority - a.tag_priority;
}

async function delActorTag(tag_id: number) {
    const url = `${baseUrl}/${tag_id}`
    return await FetchCtrl.fetchDelete(url)
}

export default {
    getActorTag,
    addActorTag,
    editActorTag,
    delActorTag,
    getActorTagList,
    compareActorTag,
}
