<script setup lang="ts">
import { crucialMessageConditionsStorage } from "@/utils/storage";

interface State {
  clientId: string;
  clientSecret: string;
  crucialMessageConditions: string;
}
const state = reactive<State>({
  clientId: "",
  clientSecret: "",
  crucialMessageConditions: "",
});

onBeforeMount(async () => {
  state.clientId = (await clientIdStorage.getValue()) ?? "";
  state.clientSecret = (await clientSecretStorage.getValue()) ?? "";
  state.crucialMessageConditions =
    (await crucialMessageConditionsStorage.getValue())?.join("\n") ?? "";
});

const handleClickSave = async () => {
  await clientIdStorage.setValue(state.clientId);
  await clientSecretStorage.setValue(state.clientSecret);
  await crucialMessageConditionsStorage.setValue(
    state.crucialMessageConditions.split("\n"),
  );
  close();
};

const close = () => {
  window.close();
};
</script>

<template>
  <v-container style="width: 800px">
    <v-text-field
      v-model="state.clientId"
      label="Slack appのclient_id"
      required
    />
    <v-text-field
      v-model="state.clientSecret"
      label="Slack appのclient_secret"
      type="password"
      required
    />
    <v-textarea
      v-model="state.crucialMessageConditions"
      label="重要メッセージの条件 (改行区切りで複数指定)"
      auto-grow
    />
    <div class="d-flex justify-center ga-4">
      <v-btn color="primary" @click="handleClickSave">更新</v-btn>
      <v-btn @click="close">キャンセル</v-btn>
    </div>
  </v-container>
</template>
