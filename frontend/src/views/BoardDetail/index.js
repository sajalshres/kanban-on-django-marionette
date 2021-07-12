import { View } from "backbone.marionette";

import BoardHeaderView from "../../components/BoardHeader";
import LaneListView from "../../components/LaneList";
import { boardModel } from "../../store";
import template from "./template.pug";

export default View.extend({
  className: "container-fluid",

  template,

  regions: {
    header: "#k-board-header",
    lanes: "#k-board-lanes",
  },

  initialize(options) {
    View.prototype.initialize.apply(this, [options]);
  },

  async onRender() {
    this.getRegion("header").show(
      new BoardHeaderView({
        model: boardModel,
      })
    );
    this.getRegion("lanes").show(
      new LaneListView({
        collection: boardModel.lanes,
      })
    );
  },

  onDestroy() {
    boardModel.members.reset();
    boardModel.tags.reset();
    boardModel.lanes.reset();
    boardModel.clear();
  },
});
