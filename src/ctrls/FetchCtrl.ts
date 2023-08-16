async function _fetch(url: string, init?: RequestInit) {
    try {
        // console.log(url, init)
        const response = await fetch(url, init);
        const text = await response.text();
        // console.log(text)
        if (response.ok) {
            const json_data = JSON.parse(text)
            return [true, json_data]
        }
        console.log(text)
        return [false, text]
    } catch (e) {
        console.log(e)
        return [false, e]
    }
}

export async function fetchGet(url: string) {
    return _fetch(url)
}

export async function fetchPost(url: string, form_data = {}) {
    const requestOptions = {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form_data)
    };
    return _fetch(url, requestOptions)
}

export async function fetchPut(url: string, form_data) {
    const requestOptions = {
        method: "PUT",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form_data)
    };
    return _fetch(url, requestOptions)
}

export async function fetchPatch(url: string, form_data?) {
    const requestOptions = {
        method: "PATCH",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify(form_data)
    };
    return _fetch(url, requestOptions)
}

export async function fetchDelete(url: string) {
    const requestOptions = {
        method: "DELETE",
    };
    return _fetch(url, requestOptions)
}