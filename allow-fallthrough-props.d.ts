import "@vue/runtime-core";
import "@vue/runtime-dom";

// for vue components
declare module "@vue/runtime-core" {
  export interface AllowedComponentProps {
    type?: unknown;
    tabindex?: string;
    autofocus?: boolean;
    inert?: boolean;

    // @のフォールスルー属性
    onChange?: unknown;
    onClick?: unknown;
    onPaste?: unknown;
    onFocus?: unknown;
    onKeyup?: unknown;
    onKeydown?: unknown;

    // TODO: フォールスルー属性が増えたら追加していく
  }
}

// for native html elements
declare module "@vue/runtime-dom" {
  export interface HTMLAttributes {
    // allow any data-* attr
    [key: `data-${string}`]: string;
  }
}

export {};
