import { AsyncResult, err, ok } from "owlelia";

const BASE_URL = "https://slack.com/api";

type Path = `/${string}`;
type Query = { [key: string]: string | number | boolean | null | undefined };
export type RequestError = {
  title: string;
  message: string;
};

export type ResponseBase =
  | {
      ok: true;
    }
  | {
      ok: false;
      error: "token_revoked" | "invalid_auth" | "token_expired";
    }
  | {
      ok: false;
      error: string;
      response_metadata?: any;
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

export async function createDefaultHeaders(): Promise<HeadersInit> {
  const token = await accessTokenStorage.getValue();
  return {
    Authorization: `Bearer ${token}`,
  };
}

export async function getRequest<R>(args: {
  path: Path;
  query?: Query;
}): AsyncResult<R, RequestError> {
  const url = buildUrl(args.path, args.query);
  const headers = await createDefaultHeaders();
  const res = await fetch(url, { headers });
  return handleResponse<R>(res);
}

export async function postRequest<R>(args: {
  path: Path;
  query?: Query;
  json?: Object;
  formData?: FormData;
}): AsyncResult<R, RequestError> {
  const url = buildUrl(args.path, args.query);

  let headers, body;
  if (args.json) {
    headers = {
      ...(await createDefaultHeaders()),
      "Content-Type": "application/json;charset=utf-8",
    };
    body = JSON.stringify(args.json);
  } else if (args.formData) {
    // https://zenn.dev/kariya_mitsuru/articles/25c9aeb27059e7
    headers = await createDefaultHeaders();
    body = args.formData;
  } else {
    headers = await createDefaultHeaders();
    body = undefined;
  }

  const res = await fetch(url, { method: "POST", headers, body });
  return handleResponse<R>(res);
}

async function handleResponse<R>(res: Response): AsyncResult<R, RequestError> {
  if (!res.ok) {
    return err({
      title: `通信が失敗しました`,
      message: `status=${res.status}, message=${res.text}`,
    });
  }

  const jr = (await res.json()) as ResponseBase;
  if (jr.ok) {
    return ok(jr as R);
  }

  // 認証期間切れの場合はOAuth 2.0をやり直しさせるためトークンを空にする
  if (jr.error === "token_expired") {
    accessTokenStorage.setValue(null);
    return err({
      title: "アクセストークンの有効期限が切れました",
      message: "Slackとの再認証が必要です",
    });
  }

  // refresh_tokenが無効の場合はOAuth 2.0をやり直しさせるためトークンを空にする
  if (jr.error === "token_revoked") {
    accessTokenStorage.setValue(null);
    return err({
      title: "リフレッシュトークンが無効です",
      message: "Slackとの再認証が必要です",
    });
  }

  return err(
    "response_metadata" in jr
      ? {
          title: jr.error,
          message: JSON.stringify(jr.response_metadata, null, 2),
        }
      : { title: jr.error, message: "エラーが発生しました" },
  );
}
