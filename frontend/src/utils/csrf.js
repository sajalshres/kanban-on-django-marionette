import $ from "jquery";

// CSRF for AJAX-requests
function csrfSafeMethod(method) {
  // these HTTP methods do not require CSRF protection
  return /^(GET|HEAD|OPTIONS|TRACE)$/.test(method);
}

function sameOrigin(url) {
  // test that a given url is a same-origin URL
  // url could be relative or scheme relative or absolute
  const host = document.location.host; // host + port
  const protocol = document.location.protocol;
  const sr_origin = `//${host}`;
  const origin = protocol + sr_origin;
  // Allow absolute or scheme relative URLs to same origin
  return (
    url == origin ||
    url.slice(0, origin.length + 1) === `${origin}/` ||
    url == sr_origin ||
    url.slice(0, sr_origin.length + 1) === `${sr_origin}/` ||
    // or any other URL that isn't scheme relative or absolute i.e relative.
    !/^(\/\/|http:|https:).*/.test(url)
  );
}

$.ajaxSetup({
  beforeSend(xhr, settings) {
    if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
      // Send the token to same-origin, relative URLs only.
      // Send the token only if the method warrants CSRF protection
      // Using the CSRFToken value acquired earlier
      xhr.setRequestHeader("X-CSRFToken", window.csrfToken);
    }
  },

  statusCode: {
    401() {
      window.location.replace("#login");
    },
  },

  error(jqXHR, textStatus, errorThrown) {
    if (
      jqXHR.status == 404 ||
      jqXHR.status == 405 ||
      jqXHR.status == 410 ||
      jqXHR.status == 414 ||
      jqXHR.status >= 500
    ) {
      const index = Math.floor(Math.random() * 2.999999) + 1;
      const errorBlock = $(
        `<div>Error</div>`
      );
      errorBlock.css({
        position: "fixed",
        top: "50%",
        left: "50%",
        marginLeft: -230,
        marginTop: -160,
        zIndex: 999999999,
      });
      errorBlock.appendTo($("body"));
      errorBlock.on("click", function () {
        $(this).remove();
      });
    }
  },
});
