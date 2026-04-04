import { useToastStore } from "@/stores/useToastStore";

export function useToast() {
  const store = useToastStore();

  return {
    success: (msg, duration) => store.addToast(msg, "success", duration),
    error: (msg, duration) => store.addToast(msg, "error", duration),
    info: (msg, duration) => store.addToast(msg, "info", duration),
    warning: (msg, duration) => store.addToast(msg, "warning", duration),

    remove: (id) => store.removeToast(id),
  };
}
