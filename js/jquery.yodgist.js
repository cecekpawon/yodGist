/*
+-------------------------+
| yodGist - jQuery plugin |
+-------------------------+
| Github gist embed       |
+-------------------------+
| @cecekpawon - thrsh.net |
+-------------------------+
| v 1.0 - 2/4/2014        |
| v 1.1 - 2/6/2014        |
| v 1.2 - 7/7/2014        |
| v 1.3 - 8/29/2014       |
+-------------------------+
*/

(function($) {
  var yodGist = function(element, options) {
    this.options = $.extend({
      id:  0,
      class: "",
      type: "",
      file: "",
      replace : true,
      html : false,
      linenumber : true,
      meta : true,
      replacelinebreak: false,
      converttable: false,
      style : true,
      debug : false,
      complete : null
    }, options || {});

    this.el = $(element);
    this.res = this.data = {};
    this.content = null;

    this.url = {
      base: "https://gist.github.com/",
      api: "https://api.github.com/gists/"
    }

    this.init();
  };

  yodGist.prototype = {
    init: function() {
      var _this = this;

      _this.loading();

      _this.id = _this.options.id;
      _this.classname = _this.options.classname;
      _this.type = _this.options.type;
      _this.file = _this.options.file;

      var file = "", url = _this.options.html ? _this.url.base + _this.id + ".json" : _this.url.api + _this.id;

      _this.key = {raw: _this.file || 0, html: "div"};

      if (_this.file) file = "file=" + _this.file + "&";

      try {
        $.getJSON(url + "?" + file + "callback=?", function(gistdata){
          _this.data = _this.options.html ? gistdata : gistdata.data;
          _this.results();
        }).fail( function(e, status, error) {
          _this.error("fetch error " + status, error);
        });
      } catch (e) {
        _this.error("fetch unhandled error", e);
      }
    },

    log: function(label, data) {
      if (this.debug) console.log(label + ": " + data);
    },

    error: function(label, data) {
      this.log(label, data);

      this.res.error = {
        label: label,
        data: data
      }

      return this.complete();
    },

    results: function() {
      if (this.data.hasOwnProperty("files")) {
        if (this.options.html) {
          this.render_html();
        } else {
          this.render_raw();
        }

        if (this.options.replace) this.replace();

        this.complete();
      } else {
        this.error("error", "no files");
      }
    },

    escapeHtml: function(s) {
      return s
        .replace(/&/gm, "&amp;")
        .replace(/</gm, "&lt;")
        .replace(/>/gm, "&gt;")
        .replace(/"/gm, "&quot;")
        .replace(/'/gm, "&#039;");
    },

    loading: function() {
      if (this.options.replace) {
        this.el.append($("<div/>", {"class": "yodgist_loading", html: "Loading.."}));
      }
    },

    toBR: function(s) {
      return s.replace(/[\r\n]/gmi, "<br />");
    },

    render_html: function() {
      var _this = this, data = _this.data;

      if (data.hasOwnProperty(_this.key.html)) {
        var html = $(data.div),
          files = html.find(".gist-file");

        _this.res.user = {login: data.owner, html_url: _this.url.base + data.owner};

        _this.res.files = {};

        files.each(function(){

          var thisfile = $(this),
            data = $(this).clone().find(".gist-data"),
            source = data.find("article, .line-data"),
            linenumber = thisfile.find(".line-numbers"),
            meta = thisfile.find(".gist-meta"),
            needLinenumber = (_this.options.linenumber && linenumber.length) || false,
            needconvert = (_this.options.converttable && linenumber.length) || false;

          source
            .find("pre div").after(document.createTextNode("\n"))
            .find("p").after(document.createTextNode("\n"));

          source = $.trim(source.text());

          if (_this.options.replacelinebreak) {
            source = _this.toBR(source);
          }

          var rawlink = meta.find("a[href*=gist]").first().attr("href"),
            permalink = meta.find("a[href*=gist]").last(),
            filename = permalink.text();

          _this.res.files[filename] = {
            filename: filename,
            permalink: permalink.attr("href"),
            raw_url: rawlink,
            content: source
          };

          if (needconvert) {
            var source_data = thisfile.find(".line-data pre"),
              source_data_html = source_data.html();

            source_data_html = source_data_html.replace(/(<\/div>+)/gi, "\r\n").replace(/<div([^>]+)>([^\r\n]+)/gi, "$2");

            var source_ul = $("<ul/>", {style: "list-style: none; padding: 0; margin: 0;"});

            if (needLinenumber) {
              $("<li/>", {"class": "line-numbers"}).append(linenumber.children()).appendTo(source_ul);
              linenumber.remove();
            }

            $("<li/>", {"class": "line-data"}).append(
              $("<pre/>", {style: "margin: 0;"}).append(
                $("<code/>", {html: source_data_html})
              )
            ).appendTo(source_ul);

            source_ul.find("li").attr("style", "display: inline-block; vertical-align: top; max-width: " + (needLinenumber ? 50 : 100) + "%;");
            thisfile.find(".file-data").empty().append(source_ul);
          }

          if (!_this.options.linenumber) {
            linenumber.remove();
          }

          if (!_this.options.meta) {
            meta.remove();
          }
        });

        _this.res.stylesheet = (data.stylesheet.match(/http/i) ? "" :  _this.url.base) + data.stylesheet;
        _this.content = html;
      } else {
        this.error("error", "no data");
      }
    },

    render_raw: function() {
      var data = this.data;

      if (Object.keys(data.files).length) {
        this.content = $("<div/>");

        for (var a in data.files) {
          var content = data.files[a].content;

          if (!this.file || (this.file === a)) {
            this.content.append(
              $("<pre/>", {"class": this.classname}).append(
                $("<code/>", {"class": this.type, html: this.escapeHtml(content)})
              )
            );
          }

          if (this.options.replacelinebreak) {
            data.files[a].content = this.toBR(content);
          }
        }

        this.res = data;
      } else {
        this.error("error", "no data");
      }
    },

    replace: function() {
      if (!this.content || !this.res.files) {
        return this.error("error", "no data");
      }

      var target = this.content;

      if (this.options.html) {
        if (this.options.style) {
          target.find(".gist-data").addClass(this.classname);

          var css_id = "yodgist_css", css = $("head #" + css_id);

          if (!css.length && this.res.stylesheet) {
            $("head").append($("<link/>", {id: css_id, rel: "stylesheet", type: "text/css", href: this.res.stylesheet}))
          }
        }
      } else {
        target = this.content.children();
      }

      this.el.replaceWith($("<div/>", {"class": "yodgist_wrap"}).append(target));
    },

    complete: function() {
      this.el.find(".yodgist_loading").remove();

      if ($.isFunction(this.options.complete)) {
        this.options.complete.call(this);
      }
    }
  };

  $.fn.yodGist = function(options) {
    return this.each(function() {
      if (id = $(this).attr("data-gist-id").replace(/[^a-z0-9]/i, "")) {
        classname = $(this).attr("data-gist-class") || "";
        if (type = $(this).attr("data-gist-type") || "") {
          type = " " + type.replace(/(language\-)/ig, "") + " ";
          type = type.replace(/([^\s]+)/ig, "language-$1").trim();
        }
        file = $(this).attr("data-gist-file") || "";
        options = $.extend({}, {id: id, classname: classname, type: type, file: file}, options);

        var keys = ["replace", "html", "linenumber", "meta", "replacelinebreak", "converttable", "style", "debug"];

        for (var a in keys) {
          var attr, key = keys[a];
          if (attr = $(this).attr("data-gist-" + key)) {
           if (attr.match(/^(true|1)$/i)) options[key] = true;
           else if (attr.match(/^(false|0)$/i)) options[key] = false;
          }
        }

        new yodGist(this, options);
      }
    });
  };

}(jQuery));