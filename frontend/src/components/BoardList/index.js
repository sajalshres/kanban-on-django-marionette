import { View, CollectionView } from "backbone.marionette";

import BoardItemView from "../BoardItem";
import AddBoardItemView from "../AddBoardItem";
import template from "./template.pug";

export default CollectionView.extend({
  className: "container-fluid",

  childViewContainer: ".k-board-list",

  childView: BoardItemView,

  template,

  onRender() {
    this.addChildView(new AddBoardItemView(), this.children.length);
  },
});
