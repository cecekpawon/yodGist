## What

yodGist - Github gist embed (jQuery plugin) 

## Dev

[@cecekpawon](https://twitter.com/cecekpawon) / [THRSH](http://blog.thrsh.net)

##Features:

- 2 output mode: traditional pre / HTML
- Option via data attributes
- Replace given element
- Read ID + filename from attributes
- Linenumber & footer swap
- Linebreak replace
- Callback & full object results

##Demo
https://cecekpawon.github.io/yodGist/

##Usages:
```html
<div data-gist-id="3833406" data-gist-html="1" data-gist-class="scroll" data-gist-file="index.php" class="example_1"></div>
```

###OR

```javascript
$(document).ready(function() {
  $('[data-gist-id]').yodGist({
    linenumber : false,
    html : true,
    meta: false,
    replacelinebreak: true,
    debug: true,
    complete: function() {
      console.log(this.res)
    }
  });
});
```

##CSS fix:

- Read `style.css` file


##Options:

**Required:**
- Data attribute : `data-gist-id` (Gist id)

**Optional:**
 - *Boolean :* `replace`, `html`, `linenumber`, `meta`, `replacelinebreak`, `converttable`, `style`, `debug`
 - *String :* `id`, `class`, `file`
 - *Function :* `complete` (callback) 

| Option            | Default Value | Description |
| -------------     |:-------------:| -----|
| replace           | `true`        | replace element: "`<pre><code>`" (html syntax highlighting) |
| html              | `false`       | - `true`: syntax highlighting<br>- `false` : "`<pre><code>`" (raw) |
| linenumber        | `true`        | line number (html: `true`) |
| meta              | `true`        | meta footer (html: true) |
| replacelinebreak  | `false`       | replace "`\r \n`: "`<br />`" |
| converttable      | `false`       | fix broken "`<table>`" linenumber to "`<ul>`" (html:` true`) |
| style             | `true`        | inject github CSS (html: `true`) |
| debug             | `false`       | console log results / errors |
| complete          | `null`        | callback function parsing done |
| class             | `<empty-string>`        | class attribute to new created element |
| file              | `<empty-string>`        | line number (html: `true`) |


**Return (complete callback):**

- this.res : full `object` results
