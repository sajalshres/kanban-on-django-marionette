import $ from "jquery";
import { Router } from "backbone";

import NavBarView from "./components/NavBar";
import BoardDetailView from "./views/BoardDetail";
import HomeView from "./views/Home";
import { boardModel } from "./store";
import { showPageLoader } from "./utils";

import app from "./App";

export default Router.extend({
  views: {
    navBar: null,
    home: null,
    boardDetail: null,
  },

  routes: {
    "": "home",
    "board/:id": "boardDetail",
  },

  initialize() {
    app.getView().showChildView("navigation", new NavBarView());
  },

  home() {
    app.getView().showChildView("content", new HomeView());
  },

  boardDetail(id) {
    const hidePageLoader = showPageLoader();
    boardModel.set({ id: id });
    boardModel.fetch().then(() => {
      app.getView().showChildView("content", new BoardDetailView({ id }));
      setTimeout(() => {
        hidePageLoader();
      }, 1000);
    });
  },
});
