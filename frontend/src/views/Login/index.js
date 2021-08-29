import { View } from "backbone.marionette";

import { auth } from "../../store";
import template from "./template.pug";

export default View.extend({
  tagName: "main",

  className: "container-fluid bg-light min-vh-100",

  template,

  ui: {
    form: "form",
    passwordConfirmSection: ".k-confirm-section",
    usernameInput: ".k-login-username",
    passwordInput: ".k-login-password",
    passwordConfirmInput: ".k-confirm-password",
    emailInput: ".k-login-email",
    newUserButton: ".k-newuser-button",
    registerButton: ".k-register-button",
    cancelButton: ".k-cancel-button",
  },

  events: {
    submit: "onSubmit",
    "click @ui.newUserButton": "onNewUser",
    "click @ui.registerButton": "onRegister",
    "click @ui.cancelButton": "onCancel",
  },

  templateContext() {
    return {
      isNewUser: this.isNewUser,
    };
  },

  initialize() {
    this.isNewUser = false;
  },

  onSubmit(event) {
    event.preventDefault();
    const { usernameInput, passwordInput } = this.ui;
    console.log({ auth: auth });
    auth
      .login({ username: usernameInput.val(), password: passwordInput.val() })
      .fail((response) => {
        console.error("login failed!!!");
        console.error({ response });
      });
  },

  onNewUser(event) {
    event.preventDefault();
    this.isNewUser = true;
    this.render();
  },

  onRegister(event) {
    event.preventDefault();
    const { usernameInput, emailInput, passwordInput, passwordConfirmInput } =
      this.ui;

    if (passwordInput.val() !== passwordConfirmInput.val()) {
      alert("Password and Confirm Password doesnot match!");
      return;
    }

    const registerResult = auth
      .register({
        username: usernameInput.val(),
        email: emailInput.val(),
        password1: passwordInput.val(),
        password2: passwordConfirmInput.val(),
      })
      .done(() => {
        location.reload();
      })
      .fail((response) => {
        console.log({ failedResponse: response });
        alert(`${response.responseText}`);
        return;
      });
    console.log({ registerResult });
  },

  onCancel(event) {
    event.preventDefault();
    this.isNewUser = false;
    this.render();
  },
});
