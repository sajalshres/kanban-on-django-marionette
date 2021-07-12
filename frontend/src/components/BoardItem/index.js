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
});
