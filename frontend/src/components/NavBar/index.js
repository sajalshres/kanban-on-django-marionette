import { View } from "backbone.marionette";

import { auth } from "../../store";
import template from "./template.pug";

export default View.extend({
  tagName: "nav",

  className: "navbar navbar-expand-md navbar-dark bg-primary mb-2",

  template,

  events: {
    "click .k-user-logout-btn": () => auth.logout(),
  },
});
