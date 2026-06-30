import { useApp } from "@/contexts/AppContext";
import type { Screen } from "@/reducers/appReducer";

export function useNav() {
  const { state, dispatch } = useApp();

  function goTo(screen: Screen) {
    dispatch({ type: "SET_SCREEN", payload: screen });
  }

  function goBack() {
    const backMap: Partial<Record<Screen, Screen>> = {
      create: "onboarding",
      join:   "onboarding",
      entry:  "home",
      add:    "home",
    };
    const target = backMap[state.screen];
    if (target) dispatch({ type: "SET_SCREEN", payload: target });
  }

  return { screen: state.screen, goTo, goBack };
}
