import { View } from "backbone.marionette";

import template from "./template.pug";
import { boardModel } from "../../store";

export default View.extend({
  className: "card mb-2",

  template,

  initialize() {
    boardModel.tags.on("change remove", (model, collection, options) => {
      if (this.model.get("tags").includes(model.get("id"))) {
        this.render();
      }
    });
  },

  templateContext() {
    return {
      title: this.model.get("title"),
      tags: this.getTags(),
    };
  },

  getTags() {
    const tags = [];
    this.model.get("tags").forEach((id) => {
      const tagModel = boardModel.tags.get(id);
      if (tagModel) tags.push(tagModel.toJSON());
    });
    return tags;
  },
});
