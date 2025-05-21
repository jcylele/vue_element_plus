import {fetchGet, fetchPost} from "./FetchCtrl";
import {PostCommentForm, PostData, PostFilterForm} from "../data/PostData";
import {ActorPostInfo} from "../data/WebData";
import {BASE_URL} from "../data/Consts";

const baseUrl = `${BASE_URL}/api/post`

export async function getPostCountList(form: PostFilterForm) {
    const url = `${baseUrl}/post_count_list`
    const [ok, response] = await fetchPost(url, form)
    if (!ok) {
        return [ok, response]
    }
    const list: ActorPostInfo[] = []
    for (const json_data of response) {
        const post = new ActorPostInfo(json_data)
        list.push(post)
    }
    list.sort((a, b) => a.actor_name.localeCompare(b.actor_name))
    return [true, list]
}

export async function getPosts(form: PostFilterForm) {
    const url = `${baseUrl}/post_list`
    const [ok, response] = await fetchPost(url, form)
    if (!ok) {
        return [ok, response]
    }
    const post_list = []
    for (const json_data of response) {
        const post = new PostData(json_data)
        post_list.push(post)
    }
    return [true, post_list]
}

export async function setPostComment(post_id: string, comment: string) {
    const url = `${baseUrl}/set_comment`
    const form = new PostCommentForm()
    form.post_id = post_id
    form.comment = comment
    return await fetchPost(url, form)
}