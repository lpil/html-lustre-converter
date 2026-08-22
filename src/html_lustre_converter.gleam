import glam/doc.{type Document}
import gleam/list
import gleam/string
import javascript_dom_parser.{type HtmlNode, Comment, Element, Text} as parser

/// Convert a string of HTML in to the same document but using the Lustre HTML
/// syntax.
///
/// The resulting code is expected to be in a module with these imports:
///
/// ```gleam
/// import lustre/element/html
/// import lustre/attribute.{attribute}
/// import lustre/element.{element, text}
/// ```
///
/// If the source document contains SVGs, you also need to import lustre/element/svg:
/// ```gleam
/// import lustre/element/svg
/// ```
///
pub fn convert(html: String) -> String {
  let documents =
    html
    |> parser.parse_to_records
    |> strip_body_wrapper(html)
    |> print_children(StripWhitespace, Html)

  case documents {
    [] -> doc.empty
    [document] -> document
    _ -> wrap(documents, "[", "]")
  }
  |> doc.to_string(80)
}

type WhitespaceMode {
  PreserveWhitespace
  StripWhitespace
}

type OutputMode {
  Svg
  Html
}

fn strip_body_wrapper(html: HtmlNode, source: String) -> List(HtmlNode) {
  let full_page = string.contains(source, "<head>")
  case html {
    Element("HTML", [], [Element("HEAD", [], []), Element("BODY", [], nodes)])
      if !full_page
    -> nodes
    _ -> [html]
  }
}

type BoolMode {
  YesNo
  TrueFalse
}

fn parse_bool(bool: String, mode: BoolMode) -> Result(Bool, Nil) {
  case mode, string.lowercase(bool) {
    YesNo, "yes" | TrueFalse, "true" -> Ok(True)
    YesNo, "no" | TrueFalse, "false" -> Ok(False)
    _, _ -> Error(Nil)
  }
}

fn print_text(t: String) -> Document {
  print_fn("html.text", [print_string(t)])
}

fn print_string(t: String) -> Document {
  let string =
    t
    |> string.replace("\\", "\\\\")
    |> string.replace("\"", "\\\"")
  doc.from_string("\"" <> string <> "\"")
}

fn print_svg_element(
  tag: String,
  attributes: List(#(String, String)),
  children: List(HtmlNode),
  ws: WhitespaceMode,
) -> Document {
  let tag = string.lowercase(tag)
  let attributes =
    list.map(attributes, fn(a) { print_attribute(a, Svg) })
    |> wrap("[", "]")

  case tag {
    // SVG non-container elements
    // Anmation elements
    "animate"
    | "animatemotion"
    | "animatetransform"
    | "mpath"
    | "set"
    | // Basic shapes
      "circle"
    | "ellipse"
    | "line"
    | "polygon"
    | "polyline"
    | "rect"
    | // Filter effects
      "feblend"
    | "fecolormatrix"
    | "fecomponenttransfer"
    | "fecomposite"
    | "feconvolvematrix"
    | "fedisplacementmap"
    | "fedropshadow"
    | "feflood"
    | "fefunca"
    | "fefuncb"
    | "fefuncg"
    | "fefuncr"
    | "fegaussianblur"
    | "feimage"
    | "femergenode"
    | "femorphology"
    | "feoffset"
    | "feturbulance"
    | // Gradient elements
      "stop"
    | // Graphical elements
      "image"
    | "path"
    | // Lighting elements
      "fedistantlight"
    | "fepointlight"
    | "fespotlight" -> print_fn("svg." <> tag, [attributes])

    "textarea" -> {
      let content = print_string(get_text_content(children))
      print_fn("text." <> tag, [attributes, content])
    }

    "text" -> {
      let content = print_string(get_text_content(children))
      print_fn("svg." <> tag, [attributes, content])
    }

    "use" -> print_fn("svg.use_", [attributes])

    // SVG container elements
    "defs"
    | "g"
    | "marker"
    | "mask"
    | "missing-glyph"
    | "pattern"
    | "switch"
    | "symbol"
    | // Descriptive elements
      "desc"
    | "metadata"
    | "title"
    | // Filter effects
      "fediffuselighting"
    | "femerge"
    | "fespecularlighting"
    | "fetile"
    | // Gradient Elements
      "lineargradient"
    | "radialgradient" -> {
      let children = wrap(print_children(children, ws, Svg), "[", "]")
      print_fn("svg." <> string.replace(tag, "-", "_"), [attributes, children])
    }

    _ -> {
      let children = wrap(print_children(children, ws, Svg), "[", "]")
      let tag = print_string(tag)
      print_fn("element", [tag, attributes, children])
    }
  }
}

fn print_element(
  tag: String,
  given_attributes: List(#(String, String)),
  children: List(HtmlNode),
  ws: WhitespaceMode,
) -> Document {
  let tag = string.lowercase(tag)
  let attributes =
    list.map(given_attributes, fn(a) { print_attribute(a, Html) })
    |> wrap("[", "]")

  case tag {
    "area"
    | "base"
    | "br"
    | "col"
    | "embed"
    | "hr"
    | "iframe"
    | "img"
    | "input"
    | "link"
    | "meta"
    | "param"
    | "source"
    | "track"
    | "wbr" -> print_fn("html." <> tag, [attributes])

    "a"
    | "abbr"
    | "address"
    | "article"
    | "aside"
    | "audio"
    | "b"
    | "bdi"
    | "bdo"
    | "blockquote"
    | "body"
    | "button"
    | "canvas"
    | "caption"
    | "cite"
    | "code"
    | "colgroup"
    | "data"
    | "datalist"
    | "dd"
    | "del"
    | "details"
    | "dfn"
    | "dialog"
    | "div"
    | "dl"
    | "dt"
    | "em"
    | "fieldset"
    | "figcaption"
    | "figure"
    | "footer"
    | "form"
    | "h1"
    | "h2"
    | "h3"
    | "h4"
    | "h5"
    | "h6"
    | "head"
    | "header"
    | "hgroup"
    | "html"
    | "i"
    | "ins"
    | "kbd"
    | "label"
    | "legend"
    | "li"
    | "main"
    | "map"
    | "mark"
    | "math"
    | "menu"
    | "meter"
    | "nav"
    | "noscript"
    | "object"
    | "ol"
    | "optgroup"
    | "output"
    | "p"
    | "picture"
    | "portal"
    | "progress"
    | "q"
    | "rp"
    | "rt"
    | "ruby"
    | "s"
    | "samp"
    | "search"
    | "section"
    | "select"
    | "slot"
    | "small"
    | "span"
    | "strong"
    | "sub"
    | "summary"
    | "sup"
    | "table"
    | "tbody"
    | "td"
    | "template"
    | "text"
    | "tfoot"
    | "th"
    | "thead"
    | "time"
    | "tr"
    | "u"
    | "ul"
    | "var"
    | "video" -> {
      let children = wrap(print_children(children, ws, Html), "[", "]")
      print_fn("html." <> tag, [attributes, children])
    }

    "svg" -> {
      let attributes =
        list.map(given_attributes, fn(a) { print_attribute(a, Svg) })
        |> wrap("[", "]")

      let children = wrap(print_children(children, ws, Svg), "[", "]")
      print_fn("svg.svg", [attributes, children])
    }

    "pre" -> {
      let children =
        wrap(print_children(children, PreserveWhitespace, Html), "[", "]")
      print_fn("html." <> tag, [attributes, children])
    }

    "script" | "style" | "textarea" | "title" | "option" -> {
      let content = print_string(get_text_content(children))
      print_fn("html." <> tag, [attributes, content])
    }

    _ -> {
      let children = wrap(print_children(children, ws, Html), "[", "]")
      let tag = print_string(tag)
      print_fn("element", [tag, attributes, children])
    }
  }
}

fn get_text_content(nodes: List(HtmlNode)) -> String {
  list.filter_map(nodes, fn(node) {
    case node {
      Text(t) -> Ok(t)
      _ -> Error(Nil)
    }
  })
  |> string.concat
}

fn print_children(
  children: List(HtmlNode),
  ws: WhitespaceMode,
  mode: OutputMode,
) -> List(Document) {
  print_children_loop(children, ws, mode, [])
}

fn print_children_loop(
  in: List(HtmlNode),
  ws: WhitespaceMode,
  mode: OutputMode,
  acc: List(Document),
) -> List(Document) {
  case in {
    [] -> list.reverse(acc)

    [Element(tag, attrs, children), ..in] if mode == Svg -> {
      let child = print_svg_element(tag, attrs, children, ws)
      print_children_loop(in, ws, mode, [child, ..acc])
    }

    [Element(tag, attrs, children), ..in] -> {
      let child = print_element(tag, attrs, children, ws)
      print_children_loop(in, ws, mode, [child, ..acc])
    }

    [Comment(_), ..in] -> print_children_loop(in, ws, mode, acc)

    [Text(input), ..in] if ws == StripWhitespace -> {
      let trimmed = string.trim(input)

      let trimmed = case input {
        _ if trimmed == "" -> trimmed
        " " <> _ | "\t" <> _ | "\n" <> _ -> " " <> trimmed
        _ -> trimmed
      }

      let trimmed = case
        trimmed != ""
        && {
          string.ends_with(input, " ")
          || string.ends_with(input, "\n")
          || string.ends_with(input, "\t")
        }
      {
        True -> trimmed <> " "
        False -> trimmed
      }

      case trimmed {
        "" -> print_children_loop(in, ws, mode, acc)
        t -> print_children_loop(in, ws, mode, [print_text(t), ..acc])
      }
    }

    [Text(t), ..in] -> {
      print_children_loop(in, ws, mode, [print_text(t), ..acc])
    }
  }
}

fn print_attribute(attribute: #(String, String), mode: OutputMode) -> Document {
  case attribute.0 {
    "abbr"
    | "accept_charset"
    | "accesskey"
    | "action"
    | "alt"
    | "aria-activedescendant"
    | "aria-autocomplete"
    | "aria-braillelabel"
    | "aria-brailleroledescription"
    | "aria-checked"
    | "aria-colindextext"
    | "aria-controls"
    | "aria-current"
    | "aria-describedby"
    | "aria-description"
    | "aria-details"
    | "aria-errormessage"
    | "aria-flowto"
    | "aria-haspopup"
    | "aria-invalid"
    | "aria-keyshortcuts"
    | "aria-label"
    | "aria-labelledby"
    | "aria-live"
    | "aria-orientation"
    | "aria-owns"
    | "aria-placeholder"
    | "aria-pressed"
    | "aria-relevant"
    | "aria-roledescription"
    | "aria-rowindextext"
    | "aria-sort"
    | "aria-valuemax"
    | "aria-valuemin"
    | "aria-valuenow"
    | "aria-valuetext"
    | "attribute"
    | "autocapitalize"
    | "autocomplete"
    | "charset"
    | "class"
    | "closedby"
    | "colorspace"
    | "command"
    | "commandfor"
    | "content"
    | "contenteditable"
    | "crossorigin"
    | "datatime"
    | "decoding"
    | "dir"
    | "dirname"
    | "download"
    | "enctype"
    | "enterkeyhint"
    | "fetchpriorty"
    | "for"
    | "form"
    | "formaction"
    | "formenctype"
    | "formmethod"
    | "formtarget"
    | "href"
    | "hreflang"
    | "id"
    | "inputmode"
    | "integrity"
    | "is"
    | "itemid"
    | "itemprop"
    | "itemscope"
    | "itemtype"
    | "lang"
    | "list"
    | "loading"
    | "max"
    | "media"
    | "method"
    | "min"
    | "name"
    | "nonce"
    | "on"
    | "pattern"
    | "placeholder"
    | "popover"
    | "popovertarget"
    | "popovertargetaction"
    | "poster"
    | "preload"
    | "referrerpolicy"
    | "rel"
    | "role"
    | "scope"
    | "size"
    | "sizes"
    | "src"
    | "step"
    | "target"
    | "title"
    | "usemap"
    | "value"
    | "wrap" -> {
      let name = string.replace(attribute.0, each: "-", with: "_")
      print_fn("attribute." <> name, [print_string(attribute.1)])
    }

    "viewbox" ->
      print_fn("attribute", [
        doc.from_string("\"viewBox\""),
        print_string(attribute.1),
      ])

    "type" | "as" ->
      print_fn("attribute." <> attribute.0 <> "_", [print_string(attribute.1)])

    "alpha"
    | "autocorrect"
    | "autofocus"
    | "autoplay"
    | "blocking"
    | "checked"
    | "controls"
    | "disabled"
    | "formnovalidate"
    | "hidden"
    | "inert"
    | "ismap"
    | "loop"
    | "multiple"
    | "muted"
    | "novalidate"
    | "open"
    | "playsinline"
    | "readonly"
    | "required"
    | "selected"
    | "shadowrootclonable"
    | "shadowrootdelegatesfocus"
    | "shadowrootserializable" ->
      print_fn("attribute." <> attribute.0, [doc.from_string("True")])

    "aria-colcount"
    | "aria-colindex"
    | "aria-colspan"
    | "aria-hidden"
    | "aria-level"
    | "aria-posinset"
    | "aria-rowcount"
    | "aria-rowindex"
    | "aria-rowspan"
    | "aria-setsize"
    | "cols"
    | "colspan"
    | "height"
    | "maxlength"
    | "minlength"
    | "rows"
    | "rowspan"
    | "span"
    | "tabindex"
    | "width" -> {
      case mode {
        Svg ->
          print_fn("attribute", [
            print_string(attribute.0),
            print_string(attribute.1),
          ])

        Html -> {
          let name = string.replace(attribute.0, each: "-", with: "_")
          print_fn("attribute." <> name, [doc.from_string(attribute.1)])
        }
      }
    }

    "aria-atomic"
    | "aria-busy"
    | "aria-disabled"
    | "aria-expanded"
    | "aria-modal"
    | "aria-multiline"
    | "aria-multiselectable"
    | "aria-readonly"
    | "aria-required"
    | "aria-selected"
    | "spellcheck"
    | "writingsuggestions" -> {
      let name = string.replace(attribute.0, each: "-", with: "_")

      print_fn("attribute." <> name, [
        case parse_bool(attribute.1, TrueFalse) {
          Ok(True) | Error(Nil) -> doc.from_string("True")
          Ok(False) -> doc.from_string("False")
        },
      ])
    }
    "translate" ->
      print_fn("attribute." <> attribute.0, [
        case parse_bool(attribute.1, YesNo) {
          Ok(True) | Error(Nil) -> doc.from_string("True")
          Ok(False) -> doc.from_string("False")
        },
      ])

    "aria-" as namespace <> rest | "data-" as namespace <> rest ->
      print_fn("attribute." <> string.remove_suffix(namespace, "-"), [
        print_string(rest),
        print_string(attribute.1),
      ])

    _ ->
      print_fn("attribute", [
        print_string(attribute.0),
        print_string(attribute.1),
      ])
  }
}

fn print_fn(name: String, arguments: List(Document)) -> Document {
  doc.append(doc.from_string(name), wrap(arguments, "(", ")"))
}

fn wrap(items: List(Document), open: String, close: String) -> Document {
  let comma = doc.concat([doc.from_string(","), doc.space])
  let open = doc.concat([doc.from_string(open), doc.soft_break])
  let trailing_comma = doc.break("", ",")
  let close = doc.concat([trailing_comma, doc.from_string(close)])

  items
  |> doc.join(with: comma)
  |> doc.prepend(open)
  |> doc.nest(by: 2)
  |> doc.append(close)
  |> doc.group
}
