import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import store from "./store.js";
import "./index.css";
import App from "./App.jsx";

const normalizedPathname = window.location.pathname.replace(/\/{2,}/g, "/");

if (normalizedPathname !== window.location.pathname) {
  window.history.replaceState(
    window.history.state,
    "",
    `${normalizedPathname}${window.location.search}${window.location.hash}`,
  );
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </StrictMode>,
);
