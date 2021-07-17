import $ from "jquery";
import { View } from "backbone.marionette";

import template from "./template.pug";
import { boardModel } from "../../store";

export default View.extend({
  className: "card mb-2",

  template,

  ui: {
    cardTitle: ".k-card-title",
    cardDescription: ".k-card-desc",
    cardSelectAssignee: ".k-card-assignee",
    cardSelectPriority: ".k-card-priority",
    cardSelectTags: ".k-card-tags",
    cardSaveButton: ".k-card-save-btn",
    cardDeleteButton: ".k-card-delete-btn",
  },

  events: {
    "click @ui.cardSaveButton": "updateCard",
    "click @ui.cardDeleteButton": "deleteCard",
  },

  modelEvents: {
    change: "render",
  },

  initialize() {
    boardModel.tags.on("change remove", (model, collection, options) => {
      if (this.model.get("tags").includes(model.get("id"))) {
        this.render();
      }
    });
    boardModel.members.on("change remove", (model, collection, options) => {
      if (this.model.get("assignees").includes(model.get("id"))) {
        this.render();
      }
    });
  },

  onRender() {
    this.onAttach();
  },

  onAttach() {
    const id = this.model.get("id");
    $(`#cardSelectAssignee${id}`).selectize();
    $(`#cardSelectPriority${id}`).selectize();
    $(`#cardSelectTag${id}`).selectize();
  },

  templateContext() {
    return {
      id: this.model.get("id"),
      title: this.model.get("title"),
      description: this.model.get("description"),
      priority: this.model.get("priority"),
      priorityClass: this.getPriorityClass(this.model.get("priority")),
      tags: this.getTags(),
      assignees: this.getAssignees(),
    };
  },

  getTags() {
    return boardModel.tags.toJSON().map((tag) => {
      const isSelected = this.model.get("tags").some((id) => tag.id === id);
      return { ...tag, selected: isSelected };
    });
  },

  getAssignees() {
    return boardModel.members.toJSON().map((assignee) => {
      const isSelected = this.model
        .get("assignees")
        .some((id) => assignee.id === id);
      return { ...assignee, selected: isSelected };
    });
  },

  getPriorityClass(priority) {
    switch (priority) {
      case "H":
        return "text-danger";
      case "M":
        return "text-warning";
      case "L":
        return "text-primary";
      default:
        return "text-primary";
    }
  },

  updateCard() {
    this.model.save(
      {
        title: this.ui.cardTitle.val(),
        description: this.ui.cardDescription.val(),
        tags: this.ui.cardSelectTags.val(),
        assignees: this.ui.cardSelectAssignee.val(),
        priority: this.ui.cardSelectPriority.val(),
      },
      { patch: true }
    );
  },

  deleteCard() {
    confirm("This action will delete the card. Are you sure?") &&
      this.model.destroy();
  },
});
