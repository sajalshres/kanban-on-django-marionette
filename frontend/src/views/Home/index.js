import { View } from "backbone.marionette";

import { boardCollection } from "../../store";
import WelcomeView from "../../components/Welcome";
import BoardListView from "../../components/BoardList";
import template from "./template.pug";

export default View.extend({
  tagName: "div",

  template,

  regions: {
    welcome: ".k-welcome-section",
    boards: ".k-boards-section",
  },

  initialize(options) {},

  fetchBoardList() {
    return new Promise((resolve, reject) => {
      boardCollection.fetch().done((response) => {
        resolve("OK");
      });
    });
  },

  async onRender() {    
    this.getRegion("welcome").show(new WelcomeView());

    await this.fetchBoardList();
    this.boardListView = new BoardListView({
      collection: boardCollection,
    });
    this.getRegion("boards").show(this.boardListView);
  },
});
