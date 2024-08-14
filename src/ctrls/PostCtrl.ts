import {fetchPost} from "./FetchCtrl";
import {PostCommentForm, PostConditionForm, PostData} from "../data/PostData";

const baseUrl = "http://127.0.0.1:8000/api/post"

export async function getActors(form: PostConditionForm) {
    const url = `${baseUrl}/actor_list`
    return await fetchPost(url, form)
}

export async function getPosts(form: PostConditionForm) {
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

export async function setPostComment(post_id: number, comment: string) {
    const url = `${baseUrl}/set_comment`
    const form = new PostCommentForm()
    form.post_id = post_id
    form.comment = comment
    return await fetchPost(url, form)
}