import { View } from 'backbone.marionette'

import template from './template.pug'

export default View.extend({
  className: "card k-card-board bg-secondary m-1 d-flex justify-content-center",

  template,
})
