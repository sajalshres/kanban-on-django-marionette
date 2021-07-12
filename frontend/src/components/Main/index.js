import { View } from "backbone.marionette";
import template from "./template.pug";

export default View.extend({
  tagName: "main",

  className: "container-fluid",

  template,
});
