import { FC, ReactElement } from "react";
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
  ui: ReactElement,
  options: FullRenderOptions = {}
): FullRenderResult {
  const {
    preloadedState,
    wrapper: CustomWrapper = ({ children }) => children,
    ...renderOptions
  } = options;
  const store = setupAppStore(preloadedState);
  const Wrapper: FC = () => (
    <CustomWrapper>
      <Provider store={store}>{ui}</Provider>
    </CustomWrapper>
  );
  const result = render(ui, { ...renderOptions, wrapper: Wrapper });
  return { ...result, store };
}
