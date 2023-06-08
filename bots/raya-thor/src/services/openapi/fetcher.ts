import {
	ApiError,
	type ApiResponse,
	type CreateFetch,
	type FetchConfig,
	type Method,
	type OpArgumentType,
	type OpErrorType,
	type OpenapiPaths,
	type Request,
	type TypedFetch,
	type _TypedFetch,
} from "./types";

const sendBody = (method: Method) =>
	method === "post" ||
	method === "put" ||
	method === "patch" ||
	method === "delete";

function queryString(parameters: Record<string, unknown>): string {
	const qs: string[] = [];

	const encode = (key: string, value: unknown) =>
		`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`;

	for (const key of Object.keys(parameters)) {
		const value = parameters[key];
		// eslint-disable-next-line no-eq-null, eqeqeq
		if (value != null) {
			if (Array.isArray(value)) {
				for (const v of value) {
					qs.push(encode(key, v));
				}
			} else {
				qs.push(encode(key, value));
			}
		}
	}

	if (qs.length) {
		return `?${qs.join("&")}`;
	}

	return "";
}

function getPath(path: string, payload: Record<string, any>) {
	return path.replace(/{([^}]+)}/g, (_, key) => {
		const value = encodeURIComponent(payload[key]);
		delete payload[key];
		return value;
	});
}

function getQuery(
	method: Method,
	payload: Record<string, any>,
	query: string[]
) {
	let queryObject = {} as any;

	if (sendBody(method)) {
		for (const key of query) {
			queryObject[key] = payload[key];
			delete payload[key];
		}
	} else {
		queryObject = { ...payload };
	}

	return queryString(queryObject);
}

function getHeaders(body?: string, init?: HeadersInit) {
	const headers = new Headers(init);

	if (body !== undefined && !headers.has("Content-Type")) {
		headers.append("Content-Type", "application/json");
	}

	if (!headers.has("Accept")) {
		headers.append("Accept", "application/json");
	}

	return headers;
}

function getBody(method: Method, payload: any) {
	const body = sendBody(method) ? JSON.stringify(payload) : undefined;
	// If delete don't send body if empty
	return method === "delete" && body === "{}" ? undefined : body;
}

function mergeRequestInit(
	first?: RequestInit,
	second?: RequestInit
): RequestInit {
	const headers = new Headers(first?.headers);
	const other = new Headers(second?.headers);

	for (const [key, value] of other.entries()) headers.set(key, value);
	return { ...first, ...second, headers };
}

function getFetchParameters(request: Request) {
	// Clone payload
	// if body is a top level array [ 'a', 'b', param: value ] with param values
	// using spread [ ...payload ] returns [ 'a', 'b' ] and skips custom keys
	// cloning with Object.assign() preserves all keys
	const payload = Object.assign(
		Array.isArray(request.payload) ? [] : {},
		request.payload
	);

	const path = getPath(request.path, payload);
	const query = getQuery(request.method, payload, request.queryParams);
	const body = getBody(request.method, payload);
	const headers = getHeaders(body, request.init?.headers);
	const url = request.baseUrl + path + query;

	const init = {
		...request.init,
		method: request.method.toUpperCase(),
		headers,
		body,
	};

	return { url, init };
}

async function getResponseData(response: Response) {
	const contentType = response.headers.get("content-type");
	if (response.status === 204 /* no content */) {
		return undefined;
	}

	if (contentType?.includes("application/json")) {
		return response.json();
	}

	const text = await response.text();
	try {
		return JSON.parse(text);
	} catch {
		return text;
	}
}

async function fetchJson(url: string, init: RequestInit): Promise<ApiResponse> {
	const response = await fetch(url, init);

	const data = await getResponseData(response);

	const result = {
		headers: response.headers,
		url: response.url,
		ok: response.ok,
		status: response.status,
		statusText: response.statusText,
		data,
	};

	if (result.ok) {
		return result;
	}

	throw new ApiError(result);
}

async function fetchUrl<R>(request: Request) {
	const { url, init } = getFetchParameters(request);

	const response = await request.fetch(url, init);

	return response as ApiResponse<R>;
}

function createFetch<OP>(fetch: _TypedFetch<OP>): TypedFetch<OP> {
	const fun = async (payload: OpArgumentType<OP>, init?: RequestInit) => {
		try {
			return await fetch(payload, init);
		} catch (error) {
			if (error instanceof ApiError) {
				throw new fun.Error(error);
			}

			throw error;
		}
	};

	fun.Error = class extends ApiError {
		constructor(error: ApiError) {
			super(error);
			Object.setPrototypeOf(this, new.target.prototype);
		}

		getActualType() {
			return {
				status: this.status,
				data: this.data,
			} as OpErrorType<OP>;
		}
	};

	return fun;
}

function fetcher<Paths>() {
	let baseUrl = "";
	let defaultInit: RequestInit = {};
	const fetch = fetchJson;

	return {
		configure(config: FetchConfig) {
			baseUrl = config.baseUrl || "";
			defaultInit = config.init || {};
		},
		path: <P extends keyof Paths>(path: P) => ({
			method: <M extends keyof Paths[P]>(method: M) => ({
				create: ((queryParameters?: Record<string, true | 1>) =>
					createFetch(async (payload, init) =>
						fetchUrl({
							baseUrl: baseUrl || "",
							path: path as string,
							method: method as Method,
							queryParams: Object.keys(queryParameters || {}),
							payload,
							init: mergeRequestInit(defaultInit, init),
							fetch,
						})
					)) as CreateFetch<M, Paths[P][M]>,
			}),
		}),
	};
}

export const Fetcher = {
	for: <Paths extends OpenapiPaths<Paths>>() => fetcher<Paths>(),
};
