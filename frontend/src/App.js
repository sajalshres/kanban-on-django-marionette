import $ from "jquery";
import _ from "lodash";
import { history } from "backbone";
import { Application } from "backbone.marionette";

import LoginView from "./views/Login";
import Router from "./router";
import { auth } from "./store";
import { setupBackboneTailingSlashes } from "./utils";
import AppLayoutView from "./components/AppLayout";

import "./utils/csrf";
import "./sass/style.scss";
import "bootstrap/dist/js/bootstrap.min";
import "selectize";

const App = Application.extend({
  region: "#app",

  onStart() {
    this.preventReload();
    this.startAuth();
    setupBackboneTailingSlashes();
  },

  startAuth() {
    auth.setFromResponse(window.INITIAL_DATA);

    auth.on("change:logged_in", () => {
      if (auth.get("logged_in") === true) {
        this.showView(new AppLayoutView());
        this.startRouter();
      } else {
        this.showView(new LoginView());
      }
    });

    auth.on("logout", () => {
      if (this.router) this.router.navigate("/");
      this.stopRouter();
      this.showView(new LoginView());
    });

    if (auth.get("logged_in") === true) {
      this.showView(new AppLayoutView());
      this.startRouter();
    } else {
      this.showView(new LoginView());
    }
  },

  startRouter() {
    this.router = new Router();
    history.start({ pushState: true });
  },

  stopRouter() {
    delete this.router;
    history.stop();
  },

  preventReload() {
    $(window.document).on("click", "a[href]:not([data-bypass])", function (e) {
      if (
        typeof e.target.src !== "undefined" &&
        e.target.src.indexOf("projectwonderful") > -1
      ) {
        //do not capture clicks in ad
        return true;
      }

      if (!e.metaKey && !e.ctrlKey && !e.shiftKey) {
        let protocol = this.protocol + "//";
        let href = this.href;
        href = href.slice(protocol.length);
        href = href.slice(href.indexOf("/") + 1);

        if (href.slice(protocol.length) !== protocol) {
          e.preventDefault();
          history.navigate(href, true);
        }
      }
    });
  },
});

const app = new App();

export default app;
