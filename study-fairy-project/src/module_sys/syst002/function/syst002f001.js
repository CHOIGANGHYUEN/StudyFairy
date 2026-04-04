import { useRouter } from "vue-router";

export function useSyst002v001() {
  const router = useRouter();
  const goToMenu = (path) => {
    router.push(path);
  };
  return { goToMenu };
}
