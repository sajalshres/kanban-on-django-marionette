import { CollectionView } from "backbone.marionette";
import LaneItemView from "../LaneItem";

import template from "./template.pug";

export default CollectionView.extend({
  className: "contaner-fluid",

  childViewContainer: ".k-lanes-list",

  childView: LaneItemView,

  template,

  onRender() {
    console.log("LaneList rendered");
  },
});
