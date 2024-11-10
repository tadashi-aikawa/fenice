<script setup lang="ts">
interface Props {
  url: string;
  title: string;
  previewText?: string;
  type?: "csv" | "tsv";
}
const props = withDefaults(defineProps<Props>(), {
  type: "csv",
});

const delimiter = computed(() => {
  switch (props.type) {
    case "csv":
      return ",";
    case "tsv":
      return "\t";
    default:
      throw new ExhaustiveError(props.type);
  }
});

const matrix = computed<string[][] | null>(
  () =>
    props.previewText?.split("\n").map((row) => row.split(delimiter.value)) ??
    null,
);
const maxColNum = matrix.value
  ? max(matrix.value?.map((row) => row.length))
  : 0;
</script>

<template>
  <v-sheet elevation="2" class="pa-3" style="max-width: 660px">
    <div class="d-flex ga-1">
      <v-icon style="font-size: 3.8em; color: dimgray"
        >mdi-file-delimited</v-icon
      >
      <div>
        <a :href="url" class="link">
          <h3>{{ title }}</h3>
        </a>
        <div class="text-caption mb-3">{{ type }}</div>
      </div>
    </div>

    <template v-if="matrix">
      <div style="overflow-x: auto">
        <table>
          <tr v-for="row in matrix">
            <td v-for="i in maxColNum - 1">
              {{ row[i] ?? "" }}
            </td>
          </tr>
        </table>
      </div>

      <div class="text-caption mt-2 text-grey">
        ※ 表示内容はファイルの一部分(preview)の可能性があります
      </div>
    </template>
  </v-sheet>
</template>

<style scoped>
.link {
  text-decoration: none;
}
table {
  border-collapse: collapse;
}
td {
  border: 1px dotted dimgray;
  padding: 0.1rem 0.5rem;
  white-space: nowrap;
}

::-webkit-scrollbar {
  width: 5px;
  height: 5px;
}
</style>
