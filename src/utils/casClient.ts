const getCasBaseUrl = (): string => {
  const baseCasUrl = import.meta.env.VITE_APP_CAS_ENDPOINT as string | undefined;
  if (!baseCasUrl) throw new Error("VITE_APP_CAS_ENDPOINT no esta definido");

  // Accept endpoint with or without protocol/trailing slash.
  return baseCasUrl.replace(/^https?:\/\//i, "").replace(/\/+$/, "");
};

export const casLogin = async (): Promise<any> => {
  const serviceUrl = window.location.origin + window.location.pathname;
  const ticket = new URLSearchParams(window.location.search).get("ticket");

  if (!ticket) {
    const loginUrl = `https://${getCasBaseUrl()}/cas/login?service=${encodeURIComponent(serviceUrl)}`;
    window.location.href = loginUrl;
    return Promise.reject("Redirecting to CAS login");
  }

  const validateUrl = `https://${getCasBaseUrl()}/cas/p3/serviceValidate?ticket=${encodeURIComponent(
    ticket
  )}&service=${encodeURIComponent(serviceUrl)}&format=JSON`;

  const res = await fetch(validateUrl);
  const contentType = res.headers.get("content-type");

  if (!contentType?.includes("application/json")) {
    const text = await res.text();
    throw new Error(`CAS response is not JSON. Raw response: ${text}`);
  }

  const data = await res.json();
  const success = data?.serviceResponse?.authenticationSuccess;

  if (!success?.user) {
    throw new Error("CAS authentication did not return a valid user");
  }

  // Remove ticket param to avoid reuse/re-validation on refresh.
  window.history.replaceState(null, "", window.location.pathname);

  return {
    user: success.user,
    attributes: success.attributes || {},
  };
};

export const casLogout = (): void => {
  const logoutUrl = `https://${getCasBaseUrl()}/cas/logout`;
  window.location.href = logoutUrl;
};
