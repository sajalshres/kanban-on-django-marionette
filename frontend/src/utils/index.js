import $ from "jquery";
import { extend, isFunction } from "lodash";
import { sync } from "backbone";

export const showPageLoader = () => {
  $(".page-loader").css("display", "flex");

  return () => {
    $(".page-loader").css("display", "none");
  };
};

export const setupBackboneTailingSlashes = () => {
  // Update Backbone.sync to add trailing slashes
  const _sync = sync;
  sync = (method, model, options) => {
    if (
      model.localStorage ||
      (model.collection && model.collection.localStorage)
    )
      return _sync(method, model, options);
    let _url = isFunction(model.url) ? model.url() : model.url;
    if (!_url) throw new Error("There is no URL set on the model/collection.");
    _url += _url.charAt(_url.length - 1) === "/" ? "" : "/";
    options = extend(options, {
      url: _url,
    });
    return _sync(method, model, options);
  };
};

export default {
  showPageLoader,
};
