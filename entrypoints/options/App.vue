<script setup lang="ts">
interface State {
  clientId: string;
  clientSecret: string;
}
const state = reactive<State>({
  clientId: "",
  clientSecret: "",
});

onBeforeMount(async () => {
  state.clientId = (await clientIdStorage.getValue()) ?? "";
  state.clientSecret = (await clientSecretStorage.getValue()) ?? "";
});

const handleClickSave = async () => {
  await clientIdStorage.setValue(state.clientId);
  await clientSecretStorage.setValue(state.clientSecret);
  close();
};

const close = () => {
  window.close();
};
</script>

<template>
  <v-container>
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
    <div class="d-flex justify-center ga-4">
      <v-btn color="primary" @click="handleClickSave">更新</v-btn>
      <v-btn @click="close">キャンセル</v-btn>
    </div>
  </v-container>
</template>
