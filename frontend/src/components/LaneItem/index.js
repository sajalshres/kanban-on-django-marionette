import { CollectionView } from "backbone.marionette";

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
    };
  },

  ui: {
    laneTextInput: ".k-lane-text-input",
    laneRemoveButton: ".k-lane-remove-btn",
  },

  events: {
    "change @ui.laneTextInput": "changeTitle",
    "click @ui.laneRemoveButton": "removeLane",
  },

  initialize(options) {
    this.collection = this.model.cards;
  },

  onRender() {
    console.log("LaneItem Rendered");
  },

  changeTitle() {
    this.model.updateLaneTitle({ title: this.ui.laneTextInput.val() });
  },

  removeLane() {
    confirm("This will remove all the lane cards, are you sure?") &&
      this.model.destroy();
  },
});
