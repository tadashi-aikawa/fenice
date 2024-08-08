import { AsyncNullable, AsyncResult, err, ok } from "owlelia";

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
  let result = await handleResponse<R>(res);

  // refresh tokenの更新などによりretry要求された場合はもう一度だけリクエスト
  if (result.isOk() && result.value.retry) {
    const res = await fetch(url, { headers });
    result = await handleResponse<R>(res);
  }

  if (result.isErr()) {
    return err(result.error);
  }
  if (result.value.retry) {
    return err({
      title: "retryループエラー",
      message: "ネストしてのretryリクエストはできません",
    });
  }
  return ok(result.value.value);
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
  let result = await handleResponse<R>(res);

  // refresh tokenの更新などによりretry要求された場合はもう一度だけリクエスト
  if (result.isOk() && result.value.retry) {
    const res = await fetch(url, { method: "POST", headers, body });
    result = await handleResponse<R>(res);
  }

  if (result.isErr()) {
    return err(result.error);
  }
  if (result.value.retry) {
    return err({
      title: "retryループエラー",
      message: "ネストしてのretryリクエストはできません",
    });
  }
  return ok(result.value.value);
}

// レスポンスを解析し、必要に応じて認証のリクエストを行うこともあります
async function handleResponse<R>(
  res: Response,
): AsyncResult<{ retry: false; value: R } | { retry: true }, RequestError> {
  if (!res.ok) {
    return err({
      title: `通信が失敗しました`,
      message: `status=${res.status}, message=${res.text}`,
    });
  }

  const jr = (await res.json()) as ResponseBase;
  if (jr.ok) {
    return ok({ retry: false, value: jr as R });
  }

  // 認証期間切れの場合はrefresh tokenでaccess tokenを更新する
  if (jr.error === "token_expired") {
    console.debug(`🐠 Refresh access token...`);
    const rErr = await refreshTokens();
    if (rErr) {
      console.debug(`⚠️ Refresh error: ${JSON.stringify(rErr)}`);
      return err(rErr);
    }
    return ok({ retry: true });
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

/**
 * access tokenをrefreshします
 */
async function refreshTokens(): AsyncNullable<RequestError> {
  const accessToken = await accessTokenStorage.getValue();
  if (!accessToken) {
    return;
  }

  const refreshToken = await refreshTokenStorage.getValue();
  const clientId = await clientIdStorage.getValue();
  const clientSecret = await clientSecretStorage.getValue();
  if (!refreshToken || !clientId || !clientSecret) {
    return;
  }

  const [res, error] = (
    await postOauthV2Access({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    })
  ).unwrap();
  if (error) {
    return error;
  }

  await accessTokenStorage.setValue(res.access_token);
  await refreshTokenStorage.setValue(res.refresh_token);

  return null;
}

export async function postOauthV2Access(args: {
  client_id: string;
  client_secret: string;
  grant_type: "refresh_token";
  refresh_token: string;
}) {
  const formData = new FormData();
  formData.append("client_id", args.client_id);
  formData.append("client_secret", args.client_secret);
  formData.append("grant_type", args.grant_type);
  formData.append("refresh_token", args.refresh_token);

  return await postRequest<{
    ok: boolean;
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>({
    path: "/oauth.v2.access",
    formData,
  });
}
