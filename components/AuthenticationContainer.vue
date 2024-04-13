<script setup lang="ts">
import { RequestError } from "@/clients/slack/base";
import Loading from "./Loading.vue";

const props = defineProps<{
  clientId: string;
  clientSecret: string;
}>();

const model = defineModel<string>();

const authenticating = ref(false);

const authenticate = async () => {
  authenticating.value = true;

  // code取得
  const redirectUri = encodeURIComponent(browser.identity.getRedirectURL());
  const scopes = [
    "chat:write",
    "channels:read",
    "files:write",
    "search:read",
    "users:read",
    "usergroups:read",
    "emoji:read",
  ];
  const authUrl = `https://slack.com/oauth/v2/authorize?client_id=${props.clientId}&user_scope=${scopes.join(",")}&redirect_uri=${redirectUri}`;

  try {
    const responseUrl = await browser.identity.launchWebAuthFlow({
      interactive: true,
      url: authUrl,
    });
    const code = new URL(responseUrl).searchParams.get("code");

    // トークン取得
    const res = await fetch("https://slack.com/api/oauth.v2.access", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `client_id=${props.clientId}&client_secret=${props.clientSecret}&code=${code}&redirect_uri=${redirectUri}`,
    });

    const { ok, authed_user: user, error } = await res.json();
    if (!ok) {
      showErrorToast(`認証に失敗しました: ${error}`);
      authenticating.value = false;
      return;
    }

    model.value = user.access_token;
    accessTokenStorage.setValue(user.access_token ?? null);

    await clientIdStorage.setValue(props.clientId);
    await clientSecretStorage.setValue(props.clientSecret);

    authenticating.value = false;

    window.location.replace("/top.html");
  } catch (e) {
    showErrorToast(e as RequestError);
    authenticating.value = false;
  }
};
</script>

<template>
  <v-btn color="primary" @click="authenticate">Slackと認証</v-btn>
  <Loading :loading="authenticating" />
</template>
