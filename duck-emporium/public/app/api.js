const FALLBACK_ERROR = {
  error: {
    code: "INTERNAL",
    message: "Service temporarily unavailable, please try again.",
  },
};

async function request(method, path, body) {
  const init = {
    method,
    credentials: "same-origin",
    headers: {},
  };
  if (body !== undefined) {
    init.headers["content-type"] = "application/json";
    init.body = JSON.stringify(body);
  }
  let res;
  try {
    res = await fetch(path, init);
  } catch {
    return { ok: false, status: 0, body: FALLBACK_ERROR };
  }
  let payload = null;
  try {
    payload = await res.json();
  } catch {
    payload = null;
  }
  if (res.status >= 500 || res.status === 0) {
    return { ok: false, status: res.status, body: FALLBACK_ERROR };
  }
  return { ok: res.ok, status: res.status, body: payload };
}

export function get(path) {
  return request("GET", path);
}
export function post(path, body) {
  return request("POST", path, body ?? {});
}
export function patch(path, body) {
  return request("PATCH", path, body ?? {});
}
export function del(path) {
  return request("DELETE", path);
}
