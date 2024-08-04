<script setup lang="ts">
import { User } from "@/clients/slack/models";
import { lastUsedEmojiMapStorage, updateLastUsedEmojis } from "@/utils/storage";
import { fallbackEmojiMap, getUnicodeEmojis } from "@/utils/strings";
import { autocompletion, CompletionContext } from "@codemirror/autocomplete";
import { EditorView } from "codemirror";
import { DateTime } from "owlelia";
import { render } from "vue";
import { Codemirror } from "vue-codemirror";
import Emoji from "./blocks/Emoji.vue";

const text = defineModel<string>({ required: true });
defineProps<{
  width: string;
  maxHeight: string;
}>();

type UserSuggestion = { label: string; user: User };
const userSuggestions = ref<UserSuggestion[]>([]);
onMounted(async () => {
  const to = (users: User[]) =>
    users
      .filter((x) => !x.deleted)
      .map((x) => ({
        label: `@${x.name} `,
        user: x,
      }));

  usersCacheStorage.watch((newValue) => {
    userSuggestions.value = to(newValue.members);
  });
  userSuggestions.value = to((await usersCacheStorage.getValue()).members);
});
const lastMentionedByUser = ref<Record<string, number>>({});
onMounted(async () => {
  lastMentionedUserMapStorage.watch((newValue) => {
    lastMentionedByUser.value = newValue;
  });
  lastMentionedByUser.value = await lastMentionedUserMapStorage.getValue();
});

type EmojiSuggestion = { label: string; emoji: string };
const unicodeEmojiSuggestions = getUnicodeEmojis().map((x) => ({
  label: `:${x}: `,
  emoji: x,
}));
const fallbackEmojiSuggestions = Object.keys(fallbackEmojiMap).map((x) => ({
  label: `:${x}: `,
  emoji: x,
}));
const emojiSuggestions = ref<EmojiSuggestion[]>([]);
onMounted(async () => {
  const to = (emojis: string[]) =>
    emojis.map((x) => ({
      label: `:${x}: `,
      emoji: x,
    }));

  emojiCacheStorage.watch((newValue) => {
    emojiSuggestions.value = to(Object.keys(newValue.emoji))
      .concat(unicodeEmojiSuggestions)
      .concat(fallbackEmojiSuggestions);
  });

  emojiSuggestions.value = to(
    Object.keys((await emojiCacheStorage.getValue()).emoji),
  )
    .concat(unicodeEmojiSuggestions)
    .concat(fallbackEmojiSuggestions);
});
const lastUsedByEmoji = ref<Record<string, number>>({});
onMounted(async () => {
  lastUsedEmojiMapStorage.watch((newValue) => {
    lastUsedByEmoji.value = newValue;
  });
  lastUsedByEmoji.value = await lastUsedEmojiMapStorage.getValue();
});

type Suggestion = UserSuggestion | EmojiSuggestion;

// ----

function customRender(completion: any) {
  const suggestion = completion as Suggestion;

  const div = document.createElement("div");
  div.style.display = "inline-flex";
  div.style.alignItems = "center";
  div.style.gap = "5px";
  div.style.padding = "3px";

  if ("user" in suggestion) {
    const img = document.createElement("img");
    img.src = suggestion.user.profile.image_24;
    img.style.height = "24px";
    div.appendChild(img);

    const nameEl = document.createElement("span");
    nameEl.textContent = suggestion.user.real_name;
    nameEl.style.fontSize = "16px";
    nameEl.style.fontWeight = "bold";
    div.appendChild(nameEl);

    const slugEl = document.createElement("span");
    slugEl.textContent = suggestion.user.name;
    slugEl.className = "fenice-user-completion__label-name";
    div.appendChild(slugEl);
  } else if ("emoji" in suggestion) {
    const emojiVDOM = h(Emoji, {
      item: { type: "emoji", name: suggestion.emoji },
    });
    render(emojiVDOM, div);

    const nameEl = document.createElement("span");
    nameEl.textContent = suggestion.label;
    nameEl.style.fontSize = "16px";
    div.appendChild(nameEl);
  }

  return div;
}

function myCompletions(context: CompletionContext) {
  let word = context.matchBefore(/[@:][^@: ]+:?/);
  if (!word) {
    return null;
  }
  if (word.from === word.to && !context.explicit) {
    return null;
  }

  if (word.text.startsWith("@")) {
    const name = word.text.slice(1);
    return {
      from: word.from,
      options: userSuggestions.value
        .filter((x) => x.label.includes(name))
        .sort(sorter((x) => Number(x.label.startsWith(name)), "desc"))
        .sort(
          sorter((x) => lastMentionedByUser.value[x.user.id] ?? -1, "desc"),
        ),
      filter: false,
    };
  }

  if (word.text.startsWith(":")) {
    const name = word.text.slice(1);
    return {
      from: word.from,
      options: emojiSuggestions.value
        .filter((x) => x.label.includes(name))
        .sort(sorter((x) => Number(x.label.startsWith(name)), "desc"))
        .sort(sorter((x) => lastUsedByEmoji.value[x.emoji] ?? -1, "desc")),
      filter: false,
    };
  }

  return null;
}

const completionConfig = {
  // activateOnTyping: true,
  maxRenderedOptions: 20,

  // オートコンプリート
  override: [myCompletions],
  // デフォルトアイコンは無効化
  icons: false,
  addToOptions: [
    // オートコンプリート
    {
      render: customRender,
      position: 50,
    },
  ],
  // ソート無効化
  compareCompletions: () => 0,
};
const completionExtension = autocompletion(completionConfig);

const updateListenerExtension = EditorView.updateListener.of(async (update) => {
  if (update.transactions.some((tr) => tr.isUserEvent("input.complete"))) {
    const transaction = update.transactions.find((tr) =>
      tr.isUserEvent("input.complete"),
    );
    if (transaction) {
      const selected = (transaction as any).annotations[0].value as Suggestion;

      if ("user" in selected) {
        lastMentionedUserMapStorage.setValue({
          ...lastMentionedByUser.value,
          [selected.user.id]: DateTime.now().unix,
        });
      } else if ("emoji" in selected) {
        await updateLastUsedEmojis([selected.emoji]);
      }
    }
  }
});

const customTheme = EditorView.theme({
  '[aria-selected="true"] .fenice-user-completion__label-name': {
    color: "white",
  },
  ".fenice-user-completion__label-name": {
    color: "gray",
  },
  ".cm-completionLabel": { display: "none" },
  "*": {
    fontFamily: "'Segoe UI', Arial, Meiryo, sans-serif",
  },
  ".cm-line": {
    lineHeight: "1.5",
  },
});
</script>

<template>
  <Codemirror
    v-model="text"
    autofocus
    :extensions="[completionExtension, updateListenerExtension, customTheme]"
    :style="{
      width,
      maxHeight,
      fontSize: '14px',
    }"
  ></Codemirror>
</template>
