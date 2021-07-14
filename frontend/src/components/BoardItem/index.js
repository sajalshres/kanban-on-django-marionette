import { View } from "backbone.marionette";
import template from "./template.pug";

export default View.extend({
  className: "card k-card-board bg-primary m-1 d-flex",

  template,

  templateContext() {
    return {
      id: this.model.get("id"),
      name: this.model.get("name"),
    };
  },

  ui: {
    deleteBoardButton: ".k-board-delete-btn",
    editBoardButton: ".k-edit-board-btn",
    editBoardInput: ".k-edit-board-input",
  },

  events: {
    "click @ui.deleteBoardButton": "deleteBoard",
    "click @ui.editBoardButton": "editBoard",
  },

  deleteBoard() {
    confirm(
      "Deleteing this board will remove all dependent items. Are you sure?"
    ) && this.model.destroy();
  },

  editBoard() {
    this.model.save({ name: this.ui.editBoardInput.val() }, { patch: true });
  },
});
