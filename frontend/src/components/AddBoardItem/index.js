import { Model } from "backbone";
import { View } from "backbone.marionette";

import { boardCollection } from "../../store";
import template from "./template.pug";

export default View.extend({
  className: "card k-card-board bg-secondary m-1 d-flex justify-content-center",

  template,

  ui: {
    addBoardButton: ".k-add-board-btn",
    addBoardInput: ".k-add-board-input",
  },

  events: {
    "click @ui.addBoardButton": "addBoard",
  },

  initialize() {
    this.model = new Model.extend({ id: 999 });
  },

  addBoard() {
    boardCollection.create({ name: this.ui.addBoardInput.val() });
  },
});
