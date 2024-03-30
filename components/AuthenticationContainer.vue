<script setup lang="ts">
import Loading from "./Loading.vue";

const model = defineModel<string>();

const authenticating = ref(false);

const authenticate = async () => {
  authenticating.value = true;

  // code取得
  const clientId = (await clientIdStorage.getValue()) ?? "";
  const redirectUri = encodeURIComponent(browser.identity.getRedirectURL());
  const scopes = ["chat:write", "channels:read", "groups:read"];
  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${clientId}&user_scope=${scopes.join(",")}&redirect_uri=${redirectUri}`;
  const responseUrl = await browser.identity.launchWebAuthFlow({
    interactive: true,
    url: authUrl,
  });
  // TODO: exceptも含めて例外処理
  const code = new URL(responseUrl).searchParams.get("code");

  // トークン取得
  const clientSecret = (await clientSecretStorage.getValue()) ?? "";
  const res = await fetch("https://slack.com/api/oauth.v2.access", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `client_id=${clientId}&client_secret=${clientSecret}&code=${code}&redirect_uri=${redirectUri}`,
  });

  const { ok, authed_user: user } = await res.json();
  // TODO: exceptも含めて例外処理
  if (!ok) {
    showErrorToast("認証に失敗しました");
    authenticating.value = false;
  }

  model.value = user.access_token;
  accessTokenStorage.setValue(user.access_token ?? null);

  authenticating.value = false;
};
</script>

<template>
  <v-btn color="primary" @click="authenticate">Slackで認証</v-btn>
  <Loading :loading="authenticating" />
</template>
