import React from "react";
import { Environment } from "../environments/environments.js";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import App from "./App.jsx";
import "./index.css";

// Get client ID from environment or use a placeholder
// In a real production environment, this should be properly configured
const clientId =
    Environment.GOOGLE_CLIENT_ID ||
    "123456789-dummy.apps.googleusercontent.com";

createRoot(document.getElementById("root")).render(
    <Provider store={store}>
        <PayPalScriptProvider>
            <GoogleOAuthProvider clientId={clientId}>
                <App />
            </GoogleOAuthProvider>
        </PayPalScriptProvider>
    </Provider>
);
