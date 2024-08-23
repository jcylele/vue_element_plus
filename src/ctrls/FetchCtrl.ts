// import 'element-plus/es/components/message/style/css'
import {ElMessage} from 'element-plus'

export function logInfo(msg: string) {
    ElMessage({message: msg, type: "success"})
}

export function logWarn(msg: string) {
    ElMessage({message: msg, type: "warning"})
}

export function logError(msg: string) {
    ElMessage({message: msg, type: "error"})
}

const rtrim = /^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g;

function trim(text) {
    text = (text == null)
        ? ""
        : (text + "").replace(rtrim, "");
    return text;
}

function replacer(key, value) {
    return typeof this[key] === "string" ? trim(value) : value;
}

export function parseDict(json_obj){
    let ret = new Map<number, number>()
    for(const key in json_obj){
        if (json_obj.hasOwnProperty(key)){
            ret.set(parseInt(key), json_obj[key])
        }
    }
    return ret
}

async function _fetch(url: string, init?: RequestInit) {
    try {
        const response = await fetch(url, init);
        const text = await response.text();

        if (response.ok) {
            const json_data = JSON.parse(text)
            return [true, json_data]
        }

        ElMessage({message: text, type: "warning"})
        return [false, undefined]
    } catch (e) {
        ElMessage({message: e.message, type: "error"})
        return [false, undefined]
    }
}

export async function fetchGet(url: string) {
    return _fetch(url)
}

export async function fetchPost(url: string, form_data = {}) {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form_data, replacer)
    };
    return _fetch(url, requestOptions)
}

export async function fetchPut(url: string, form_data) {
    const requestOptions = {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form_data, replacer)
    };
    return _fetch(url, requestOptions)
}

export async function fetchPatch(url: string, form_data?) {
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form_data, replacer)
    };
    return _fetch(url, requestOptions)
}

export async function fetchDelete(url: string) {
    const requestOptions = {
        method: "DELETE",
    };
    return _fetch(url, requestOptions)
}