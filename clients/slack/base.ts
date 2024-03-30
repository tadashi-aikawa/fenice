import { AsyncResult, err, ok } from "owlelia";

const BASE_URL = "https://slack.com/api";

type Path = `/${string}`;
type Query = { [key: string]: string | number | boolean | null | undefined };
export type RequestError = {
  title?: string;
  message: string;
};

function buildUrl(path: Path, query: Query = {}): string {
  for (const qk of Object.keys(query)) {
    if (query[qk] == null) {
      delete query[qk];
    } else {
      query[qk] = query[qk]!.toString();
    }
  }
  const queryStr = new URLSearchParams(query as any).toString();

  return `${BASE_URL}${path}${queryStr ? "?" + queryStr : ""}`;
}

export async function createGetDefaultHeaders(): Promise<HeadersInit> {
  const token = await accessTokenStorage.getValue();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function createPostDefaultHeaders(): Promise<HeadersInit> {
  const token = await accessTokenStorage.getValue();
  return {
    "Content-Type": "application/json;charset=utf-8",
    Authorization: `Bearer ${token}`,
  };
}

export async function getRequest<R>(args: {
  path: Path;
  query?: Query;
  headers?: HeadersInit;
}): AsyncResult<R, RequestError> {
  const url = buildUrl(args.path, args.query);
  const headers = args.headers ?? (await createGetDefaultHeaders());

  const res = await fetch(url, { headers });
  return handleResponse<R>(res);
}

export async function postRequest<R>(args: {
  path: Path;
  query?: Query;
  json?: Object;
  headers?: HeadersInit;
}): AsyncResult<R, RequestError> {
  const url = buildUrl(args.path, args.query);
  const headers = args.headers ?? (await createPostDefaultHeaders());
  const body = args.json ? JSON.stringify(args.json) : undefined;

  const res = await fetch(url, { method: "POST", headers, body });
  return handleResponse<R>(res);
}

async function handleResponse<R>(res: Response): AsyncResult<R, RequestError> {
  if (!res.ok) {
    return err({
      message: `通信に失敗しました. status=${res.status}, message=${res.text}`,
    });
  }

  const jr = await res.json();
  if (!jr.ok) {
    return err(
      jr.response_metadata
        ? {
            title: jr.error,
            message: JSON.stringify(jr.response_metadata, null, 2),
          }
        : { message: jr.error },
    );
  }

  return ok(jr as R);
}
