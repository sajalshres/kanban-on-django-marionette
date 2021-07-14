import { CollectionView } from "backbone.marionette";

import BoardItemView from "../BoardItem";
import AddBoardItemView from "../AddBoardItem";
import template from "./template.pug";
import { boardCollection } from "../../store";

export default CollectionView.extend({
  className: "container-fluid",

  childViewContainer: ".k-board-list",

  childView: BoardItemView,

  template,

  initialize() {
    boardCollection.on("add change destroy", () => {
      this.render();
    });
  },

  onRender() {
    this.addChildView(new AddBoardItemView(), this.children.length);
  },
});
