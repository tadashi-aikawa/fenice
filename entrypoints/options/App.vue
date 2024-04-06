<script setup lang="ts">
import { smartLineBreakSplit } from "@/utils/collections";
import { crucialMessageConditionsStorage } from "@/utils/storage";
import AuthenticationContainer from "@/components/AuthenticationContainer.vue";

interface State {
  tab: "auth" | "search";
  accessToken: string;
  clientId: string;
  clientSecret: string;
  crucialMessageConditions: string;
}
const state = reactive<State>({
  tab: "auth",
  accessToken: "",
  clientId: "",
  clientSecret: "",
  crucialMessageConditions: "",
});

onBeforeMount(async () => {
  state.accessToken = (await accessTokenStorage.getValue()) ?? "";
  state.clientId = (await clientIdStorage.getValue()) ?? "";
  state.clientSecret = (await clientSecretStorage.getValue()) ?? "";
  state.crucialMessageConditions =
    (await crucialMessageConditionsStorage.getValue())?.join("\n") ?? "";
});

const handleClickSave = async () => {
  await clientIdStorage.setValue(state.clientId);
  await clientSecretStorage.setValue(state.clientSecret);
  await crucialMessageConditionsStorage.setValue(
    smartLineBreakSplit(state.crucialMessageConditions),
  );
  close();
};

const close = () => {
  window.close();
};

const clearAuth = async () => {
  await accessTokenStorage.setValue("");
};
</script>

<template>
  <v-container style="width: 800px">
    <v-card :elevation="2">
      <v-tabs v-model="state.tab" align-tabs="center">
        <v-tab value="auth">Auth</v-tab>
        <v-tab value="search">Search</v-tab>
      </v-tabs>

      <v-window v-model="state.tab" class="pa-5">
        <v-window-item value="auth">
          <div class="d-flex flex-column align-center">
            <v-text-field
              v-model="state.clientId"
              label="Slack appのclient_id"
              required
              style="width: 480px"
            />
            <v-text-field
              v-model="state.clientSecret"
              label="Slack appのclient_secret"
              type="password"
              required
              style="width: 480px"
            />

            <template v-if="state.accessToken">
              <v-btn color="warning" @click="clearAuth"
                >Slackの認証クリア</v-btn
              >
            </template>
            <template v-else>
              <AuthenticationContainer v-model="state.accessToken" />
            </template>
          </div>
        </v-window-item>

        <v-window-item value="search">
          <v-textarea
            v-model="state.crucialMessageConditions"
            label="重要メッセージの条件 (改行区切りで複数指定)"
            auto-grow
          />
        </v-window-item>
      </v-window>
    </v-card>

    <div class="d-flex justify-center ga-4 mt-4">
      <v-btn color="primary" @click="handleClickSave">更新</v-btn>
      <v-btn @click="close">キャンセル</v-btn>
    </div>
  </v-container>
</template>
