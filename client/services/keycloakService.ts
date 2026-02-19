// Keycloak service - DEPRECATED, use local AuthContext instead
// This service is no longer used

/*
import Keycloak, { KeycloakInitOptions, KeycloakInstance } from "keycloak-js";
import { keycloakConfig } from "../config/keycloakConfig";

let keycloak: KeycloakInstance | null = null;

export const initKeycloak = async (options?: KeycloakInitOptions) => {
  if (keycloak) return keycloak;

  keycloak = new Keycloak({
    url: keycloakConfig.url,
    realm: keycloakConfig.realm,
    clientId: keycloakConfig.clientId,
  });

  await keycloak.init({
    onLoad: "check-sso",
    checkLoginIframe: false,
    ...options,
  });

  return keycloak;
};

export const kcLogin = (options?: Parameters<KeycloakInstance["login"][0]>) => {
  if (!keycloak) return;
  return keycloak.login(options as any);
};

export const kcLogout = (options?: Parameters<KeycloakInstance["logout"][0]>) => {
  if (!keycloak) return;
  return keycloak.logout(options as any);
};

export const getToken = () => keycloak?.token ?? null;

export const updateToken = (minValidity = 5) => keycloak?.updateToken(minValidity) ?? Promise.reject("Keycloak not initialized");

export const getUserProfile = async () => {
  if (!keycloak) return null;
  try {
    return await keycloak.loadUserProfile();
  } catch (e) {
    return null;
  }
};

export const getKeycloakInstance = () => keycloak;
*/
