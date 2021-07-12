import { View } from "backbone.marionette";
import { boardModel } from "../../store";
import $ from "jquery";

import template from "./template.pug";

export default View.extend({
  tagName: "nav",

  className: "navbar navbar-light bg-light mb-2",

  template,

  templateContext() {
    return {
      name: this.model.get("name"),
      tags: this.model.tags.toJSON(),
    };
  },

  ui: {
    addLaneButton: ".k-add-lane-modal-btn",
    addTagButton: ".k-add-tag-btn",
    addTagInput: ".k-add-tag-input",
    editTagInput: ".k-tag-edit-input",
    deleteTagButton: ".k-tag-delete-btn",
    addLaneInput: ".k-add-lane-input",
  },

  events: {
    "click @ui.addLaneButton": "addLane",
    "click @ui.addTagButton": "addTag",
    "change @ui.editTagInput": "editTag",
    "click @ui.deleteTagButton": "deleteTag",
  },

  addTag() {
    boardModel.tags.create({
      name: this.ui.addTagInput.val(),
      board: boardModel.get("id"),
    });
    this.render()
  },

  editTag(event) {
    const id = $(event.currentTarget).data("id");
    const newName = $(event.currentTarget).val();
    const model = this.model.tags.get(id);
    model.save({ name: newName }, { patch: true });
  },

  deleteTag(event) {
    const id = $(event.currentTarget).data("id");
    const model = this.model.tags.get(id);
    confirm("This action will affect dependent cards, Are you sure?") &&
      model.destroy();
    this.render();
  },

  addLane() {
    boardModel.lanes.createLane({
      boardId: boardModel.get("id"),
      title: this.ui.addLaneInput.val(),
    });
    this.ui.addLaneInput.val("");
  },
});
