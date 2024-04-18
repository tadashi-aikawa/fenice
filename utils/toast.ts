import { RequestError } from "@/clients/slack/base";
import { Id, toast } from "vue3-toastify";

export function showErrorToast(error: RequestError): Id;
export function showErrorToast(message: string): Id;
export function showErrorToast(arg: RequestError | string): Id {
  const option = {
    autoClose: false,
    dangerouslyHTMLString: true,
    theme: "dark",
  } as const;

  if (typeof arg === "string") {
    return toast.error(arg, option);
  } else {
    return toast.error(`<h3>${arg.title}</h3><p>${arg.message}</p>`, option);
  }
}

export function showSuccessToast(message: string): Id {
  return toast.success(message, {
    autoClose: 3000,
    transition: "flip",
    pauseOnFocusLoss: false,
    hideProgressBar: true,
  });
}

export function showInfoToast(message: string): Id {
  return toast.info(message, {
    autoClose: 3000,
    transition: "bounce",
    pauseOnFocusLoss: false,
    hideProgressBar: true,
    theme: "colored",
  });
}
