import $ from "jquery";
import { assign } from "lodash";

class Api {
  constructor(csrfToken) {
    this.csrfToken = csrfToken;
  }

  get(url, data) {
    return $.getJSON(url, data);
  }

  post(url, data, options) {
    let contentType = "application/x-www-form-urlencoded; charset=UTF-8";
    if (options && options.sendAsJSON) {
      data = JSON.stringify(data);
      contentType = "application/json";
    }
    return $.ajax(
      url,
      assign(
        {
          data,
          contentType,
          type: "POST",
          headers: { "X-CSRFToken": this.csrfToken },
        },
        options
      )
    );
  }

  put(url, data, options) {
    if (!options) options = {};
    return this.post(url, data, assign(options, { type: "PUT" }));
  }

  patch(url, data, options) {
    if (!options) options = {};
    return this.post(url, data, assign(options, { type: "PATCH" }));
  }

  delete(url, data, options) {
    if (!options) options = {};
    return this.post(url, data, assign(options, { type: "DELETE" }));
  }
}

export const api = new Api();

export default api;
