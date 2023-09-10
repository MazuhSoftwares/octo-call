import { FC, ReactElement } from "react";
import { Provider } from "react-redux";
import { RenderOptions, RenderResult, render } from "@testing-library/react";
import { AppStore, setupAppStore, PreloadedAppState } from "../state";

export interface FullRenderResult extends RenderResult {
  store: AppStore;
}

export interface FullRenderOptions extends Omit<RenderOptions, "queries"> {
  preloadedState?: PreloadedAppState;
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
  const store = setupAppStore({ preloadedState });
  const Wrapper: FC = () => (
    <CustomWrapper>
      <Provider store={store}>{ui}</Provider>
    </CustomWrapper>
  );
  const result = render(ui, { ...renderOptions, wrapper: Wrapper });
  return { ...result, store };
}
