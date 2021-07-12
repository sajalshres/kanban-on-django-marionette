import { View } from "backbone.marionette";

import { auth } from "../../store";
import template from "./template.pug";

export default View.extend({
  tagName: "main",

  className: "container-fluid bg-light min-vh-100",

  template,

  ui: {
    form: "form",
    username: "#k-login-username",
    password: "#k-login-password",
  },

  events: {
    "submit form": "login",
  },

  login(event) {
    event.preventDefault();
    const { username, password } = this.ui;
    auth
      .login({ username: username.val(), password: password.val() })
      .fail((response) => {
        console.error("login failed!!!");
        console.error({ response });
      });
  },
});
