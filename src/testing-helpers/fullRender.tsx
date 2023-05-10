import { Provider } from "react-redux";
import { RenderOptions, RenderResult, render } from "@testing-library/react";
import { RootState, AppStore, setupAppStore } from "../state";
import { PreloadedState } from "@reduxjs/toolkit";

interface FullRenderResult extends RenderResult {
  store: AppStore;
}

interface FullRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedState<RootState>;
}

export default function fullRender(
  ui: React.ReactElement,
  options: FullRenderOptions = {}
): FullRenderResult {
  const { preloadedState, ...renderOptions } = options;
  const store = setupAppStore(preloadedState);
  const result = render(<Provider store={store}>{ui}</Provider>, renderOptions);
  return { ...result, store };
}
