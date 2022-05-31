/* @refresh reload */
import { render } from "solid-js/web";
import { StateContextProvider } from "./components/Context/StateContext";
import Home from "./pages";

render(
  () => (
    <StateContextProvider>
      <Home />
    </StateContextProvider>
  ),
  document.getElementById("root") as HTMLElement
);
