import { CollectionView } from "backbone.marionette";
import $ from "jquery";
import { boardModel } from "../../store";
import CardItemView from "../CardItem";
import template from "./template.pug";

export default CollectionView.extend({
  className: "card k-card-lane me-4 mb-4",

  childViewContainer: ".card-body",

  childView: CardItemView,

  template,

  templateContext() {
    return {
      title: this.model.get("title"),
      tags: boardModel.tags.toJSON(),
      assignees: boardModel.members.toJSON(),
    };
  },

  ui: {
    laneTextInput: ".k-lane-text-input",
    laneRemoveButton: ".k-lane-remove-btn",
    addCardTitle: ".k-add-card-title",
    addCardDescription: ".k-add-card-text",
    addCardSelectAssignee: ".k-add-card-select-assignee",
    addCardSelectPriority: ".k-add-card-select-priority",
    addCardSelectTags: ".k-add-card-select-tags",
    addCardSaveButton: ".k-add-card-save-btn",
  },

  events: {
    "change @ui.laneTextInput": "changeTitle",
    "click @ui.laneRemoveButton": "removeLane",
    "click @ui.addCardSaveButton": "addCard",
  },

  collectionEvents: {
    destroy: "render",
  },

  initialize(options) {
    console.log({ Members: boardModel.members.toJSON() });
    boardModel.tags.on("add change destroy", () => {
      this.render();
    });
    this.collection = this.model.cards;
  },

  onRender() {
    console.log("LaneItem Rendered");
    this.onAttach();
  },

  onAttach() {
    /**
     * attach is the ideal event to setup any external DOM listeners such as
     * jQuery plugins that use the view's el, but not its contents.
     */
    const id = this.model.get("id");
    $(`#addSelectAssignee${id}`).selectize();
    $(`#addSelectPriority${id}`).selectize();
    $(`#addSelectTags${id}`).selectize();
  },

  changeTitle() {
    this.model.updateLaneTitle({ title: this.ui.laneTextInput.val() });
  },

  removeLane() {
    confirm("This will remove all the lane cards, are you sure?") &&
      this.model.destroy();
  },

  addCard() {
    this.model.cards.create({
      title: this.ui.addCardTitle.val(),
      description: this.ui.addCardDescription.val(),
      lane: this.model.get("id"),
      tags: this.ui.addCardSelectTags.val().map((tag) => parseInt(tag)),
      assignees: this.ui.addCardSelectAssignee.val(),
      priority: this.ui.addCardSelectPriority.val(),
    });
    this.render();
  },
});
