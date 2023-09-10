import fullRender, { FullRenderOptions } from "./fullRender";

export default function fullHookRender(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  useIt: any,
  options: FullRenderOptions = {}
) {
  return new Promise((resolve) => {
    function HookEnv() {
      const result = useIt();
      resolve(result);
      return <div data-testid="full-hook-render-env" />;
    }

    return fullRender(<HookEnv />, options);
  });
}
