import { View } from "backbone.marionette";
import template from "./template.pug";

export default View.extend({
  tagName: "main",

  template,

  regions: {
    navigation: ".k-navigation-region",
    content: ".k-content-region",
  },
});
