// import 'element-plus/es/components/message/style/css'
import { ElMessage } from 'element-plus'
import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { BASE_URL } from '../data/Consts';
import { ErrorCode } from '../data/Enums';
import { ErrorMessages, LogMessages } from '../data/Messages';

export type SingleResult<T> = [true, T] | [false, undefined]
export type VoidResult = [true, null] | [false, undefined]
export type ListResult<T> = [true, T[]] | [false, undefined]
export type FetchResult<T> = SingleResult<T> | ListResult<T>
// TypeScript 中，(new (data: any) => T) 是一种类型，代表了“一个可以被 new 的、接收一个 data 参数并返回 T 类型实例的构造函数”
export type Constructable<T> = new (data?: any) => T;

export function logInfo(msg: string) {
	ElMessage({ message: msg, type: "success" })
}

export function logWarn(msg: string) {
	ElMessage({ message: msg, type: "warning" })
}

export function logError(msg: string) {
	ElMessage({ message: msg, type: "error" })
}

export function logErrorCode(code: ErrorCode) {
	ElMessage({ message: ErrorMessages[code], type: "error" })
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

const apiClient: AxiosInstance = axios.create({
	// 建议设置baseURL，指向您的FastAPI后端
	baseURL: BASE_URL,
	timeout: 10000,
	headers: {
		'Content-Type': 'application/json',
	},
	// transformRequest 会在请求发送前处理请求数据
	// 这让我们可以统一处理所有JSON请求，剔除字符串值的多余空格
	transformRequest: [
		(data, headers) => {
			// 不要处理 FormData
			if (data instanceof FormData) {
				return data;
			}
			// 如果是对象，则使用我们的 replacer 来进行序列化
			if (data && typeof data === 'object') {
				const contentType = headers['Content-Type'];
				if (contentType && typeof contentType === 'string' && contentType.includes('application/json')) {
					return JSON.stringify(data, replacer);
				}
			}
			return data;
		},
	],
});

// 添加响应拦截器来全局处理错误
apiClient.interceptors.response.use(
	(response) => {
		// 2xx 范围内的状态码都会触发该函数
		return response;
	},
	(error) => {
		// 超出 2xx 范围的状态码都会触发该函数
		if (error.response) {
			// 服务器返回了错误状态码
			// FastAPI 通常将错误信息放在 'detail' 字段中
			const errorMsg = error.response.data?.detail || error.message;
			logError(LogMessages.RequestError(errorMsg, error.response.status));
		} else if (error.request) {
			// 请求已发出，但没有收到响应
			logError(LogMessages.NetworkError());
		} else {
			// 发送请求时出了点问题
			logError(LogMessages.RequestFailed(error.message));
		}
		return Promise.reject(error);
	}
);

/**
 * 如果提供了模型构造函数，就用它来“水合”数据
 * @param data 数据
 * @param model 模型构造函数
 * @returns 水合后的数据
 */
function _onFetched<T>(response: any, model: Constructable<T> | undefined, is_list: true): ListResult<T>
function _onFetched<T>(response: any, model: Constructable<T> | undefined, is_list: false): SingleResult<T>
function _onFetched<T>(response: any, model?: Constructable<T>, is_list?: boolean): FetchResult<T>
function _onFetched<T>(response: any, model?: Constructable<T>, is_list: boolean = false): FetchResult<T> {
	if (response.error_code !== ErrorCode.Success) {
		logErrorCode(response.error_code)
		return [false, undefined]
	}
	const data = response.data
	if (model) {
		if (is_list) {
			return [true, data.map(item => new model(item))];
		} else {
			return [true, new model(data)];
		}
	} else {
		if (is_list) {
			return [true, data];
		} else {
			return [true, data];
		}
	}
}

export async function fetchGet<T>(url: string, model: Constructable<T> | undefined, is_list: true): Promise<ListResult<T>>;
export async function fetchGet<T>(url: string, model: Constructable<T> | undefined, is_list: false): Promise<SingleResult<T>>;
export async function fetchGet<T>(url: string, model?: Constructable<T>, is_list?: boolean): Promise<FetchResult<T>>;
export async function fetchGet<T>(url: string, model?: Constructable<T>, is_list: boolean = false): Promise<FetchResult<T>> {
	try {
		const response: AxiosResponse = await apiClient.get(url);
		return _onFetched(response.data, model, is_list)
	} catch (error) {
		return [false, undefined]
	}
}

export async function fetchPost<T>(url: string, form_data: any, model: Constructable<T> | undefined, is_list: true): Promise<ListResult<T>>;
export async function fetchPost<T>(url: string, form_data: any, model: Constructable<T> | undefined, is_list: false): Promise<SingleResult<T>>;
export async function fetchPost<T>(url: string, form_data?: any, model?: Constructable<T>, is_list?: boolean): Promise<FetchResult<T>>;
export async function fetchPost<T>(url: string, form_data?: any, model?: Constructable<T>, is_list: boolean = false): Promise<FetchResult<T>> {
	try {
		const response: AxiosResponse = await apiClient.post(url, form_data);
		return _onFetched(response.data, model, is_list)
	} catch (error) {
		return [false, undefined]
	}
}

export async function fetchPostStr<T>(url: string, data: string, model: Constructable<T> | undefined, is_list: true): Promise<ListResult<T>>;
export async function fetchPostStr<T>(url: string, data: string, model: Constructable<T> | undefined, is_list: false): Promise<SingleResult<T>>;
export async function fetchPostStr<T>(url: string, data: string, model?: Constructable<T>, is_list?: boolean): Promise<FetchResult<T>>;
export async function fetchPostStr<T>(url: string, data = "", model?: Constructable<T>, is_list: boolean = false): Promise<FetchResult<T>> {
	try {
		const response: AxiosResponse = await apiClient.post(url, data, {
			headers: { 'Content-Type': 'text/plain; charset=utf-8' },
		});
		return _onFetched(response.data, model, is_list)
	} catch (error) {
		return [false, undefined]
	}
}

export async function fetchPut<T>(url: string, form_data: any, model: Constructable<T> | undefined, is_list: true): Promise<ListResult<T>>;
export async function fetchPut<T>(url: string, form_data: any, model: Constructable<T> | undefined, is_list: false): Promise<SingleResult<T>>;
export async function fetchPut<T>(url: string, form_data?: any, model?: Constructable<T>, is_list?: boolean): Promise<FetchResult<T>>;
export async function fetchPut<T>(url: string, form_data?: any, model?: Constructable<T>, is_list: boolean = false): Promise<FetchResult<T>> {
	try {
		const response: AxiosResponse = await apiClient.put(url, form_data);
		return _onFetched(response.data, model, is_list)
	} catch (error) {
		return [false, undefined]
	}
}

export async function fetchPatch<T>(url: string, form_data: any, model: Constructable<T> | undefined, is_list: true): Promise<ListResult<T>>;
export async function fetchPatch<T>(url: string, form_data: any, model: Constructable<T> | undefined, is_list: false): Promise<SingleResult<T>>;
export async function fetchPatch<T>(url: string, form_data?: any, model?: Constructable<T>, is_list?: boolean): Promise<FetchResult<T>>;
export async function fetchPatch<T>(url: string, form_data?: any, model?: Constructable<T>, is_list: boolean = false): Promise<FetchResult<T>> {
	try {
		const response: AxiosResponse = await apiClient.patch(url, form_data);
		return _onFetched(response.data, model, is_list)
	} catch (error) {
		return [false, undefined]
	}
}

export async function fetchDelete<T>(url: string, model: Constructable<T> | undefined, is_list: true): Promise<ListResult<T>>;
export async function fetchDelete<T>(url: string, model: Constructable<T> | undefined, is_list: false): Promise<SingleResult<T>>;
export async function fetchDelete<T>(url: string, model?: Constructable<T>, is_list?: boolean): Promise<FetchResult<T>>;
export async function fetchDelete<T>(url: string, model?: Constructable<T>, is_list: boolean = false): Promise<FetchResult<T>> {
	try {
		const response: AxiosResponse = await apiClient.delete(url);
		return _onFetched(response.data, model, is_list)
	} catch (error) {
		return [false, undefined]
	}
}