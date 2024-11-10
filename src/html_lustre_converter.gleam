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
/// If the source document contains SVGs, we need one more import from lustre/element:
/// ```gleam
/// import lustre/element.{element, text, svg}
/// ```
///
/// If you are only using SVGs, that's all you need to import
/// ```gleam
/// import lustre/element/svg
/// ```
///
pub fn convert(html: String) -> String {
  let documents =
    html
    |> parser.parse_to_records
    |> strip_body_wrapper(html)
    |> print_children(StripWhitespace, HTML)

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
  SVG
  HTML
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

fn print_text(t: String) -> Document {
  doc.from_string("html.text(" <> print_string(t) <> ")")
}

fn print_string(t: String) -> String {
  "\"" <> string.replace(t, "\"", "\\\"") <> "\""
}

fn print_svg_element(
  tag: String,
  attributes: List(#(String, String)),
  children: List(HtmlNode),
  ws: WhitespaceMode,
) -> Document {
  let tag = string.lowercase(tag)
  let attributes =
    list.map(attributes, fn(a) { print_attribute(a, SVG) })
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
    | "fespotlight"
    | "title" -> {
      doc.from_string("svg." <> tag <> "(")
      |> doc.append(attributes)
      |> doc.append(doc.from_string(")"))
    }

    "textarea" -> {
      let content = doc.from_string(print_string(get_text_content(children)))
      doc.from_string("text." <> tag)
      |> doc.append(wrap([attributes, content], "(", ")"))
    }

    "text" -> {
      let content = doc.from_string(print_string(get_text_content(children)))
      doc.from_string("svg." <> tag)
      |> doc.append(wrap([attributes, content], "(", ")"))
    }

    "use" -> {
      doc.from_string("svg.use_")
      |> doc.append(attributes)
    }

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
    | // Filter effects
      "fediffuselighting"
    | "femerge"
    | "fespecularlighting"
    | "fetile"
    | // Gradient Elements
      "lineargradient"
    | "radialgradient" -> {
      let children = wrap(print_children(children, ws, SVG), "[", "]")
      doc.from_string("svg." <> string.replace(tag, "-", "_"))
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    _ -> {
      let children = wrap(print_children(children, ws, SVG), "[", "]")
      let tag = doc.from_string(print_string(tag))
      doc.from_string("element")
      |> doc.append(wrap([tag, attributes, children], "(", ")"))
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
    list.map(given_attributes, fn(a) { print_attribute(a, HTML) })
    |> wrap("[", "]")

  case tag {
    "area"
    | "base"
    | "br"
    | "col"
    | "embed"
    | "hr"
    | "img"
    | "input"
    | "link"
    | "meta"
    | "param"
    | "source"
    | "track"
    | "wbr" -> {
      doc.from_string("html." <> tag <> "(")
      |> doc.append(attributes)
      |> doc.append(doc.from_string(")"))
    }

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
    | "iframe"
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
    | "style"
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
      let children = wrap(print_children(children, ws, HTML), "[", "]")
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    "svg" -> {
      let attributes =
        list.map(given_attributes, fn(a) { print_attribute(a, SVG) })
        |> wrap("[", "]")

      let children = wrap(print_children(children, ws, SVG), "[", "]")
      doc.from_string("svg.svg")
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    "pre" -> {
      let children =
        wrap(print_children(children, PreserveWhitespace, HTML), "[", "]")
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    "option" | "textarea" | "title" | "script" -> {
      let content = doc.from_string(print_string(get_text_content(children)))
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, content], "(", ")"))
    }

    _ -> {
      let children = wrap(print_children(children, ws, HTML), "[", "]")
      let tag = doc.from_string(print_string(tag))
      doc.from_string("element")
      |> doc.append(wrap([tag, attributes, children], "(", ")"))
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
  svg_mode: OutputMode,
) -> List(Document) {
  list.filter_map(children, fn(node) {
    case node {
      Element(tag, attrs, children) -> {
        case svg_mode {
          SVG -> Ok(print_svg_element(tag, attrs, children, ws))
          HTML -> Ok(print_element(tag, attrs, children, ws))
        }
      }
      Comment(_) -> Error(Nil)
      Text(t) if ws == StripWhitespace -> {
        case string.trim_left(t) {
          "" -> Error(Nil)
          t -> Ok(print_text(t))
        }
      }
      Text(t) -> Ok(print_text(t))
    }
  })
}

fn print_attribute(
  attribute: #(String, String),
  svg_mode: OutputMode,
) -> Document {
  case attribute.0 {
    "action"
    | "alt"
    | "attribute"
    | "autocomplete"
    | "class"
    | "download"
    | "enctype"
    | "for"
    | "form_action"
    | "form_enctype"
    | "form_method"
    | "form_target"
    | "href"
    | "id"
    | "map"
    | "max"
    | "method"
    | "min"
    | "msg"
    | "name"
    | "none"
    | "on"
    | "pattern"
    | "placeholder"
    | "rel"
    | "role"
    | "src"
    | "step"
    | "target"
    | "value"
    | "wrap" -> {
      doc.from_string(
        "attribute." <> attribute.0 <> "(" <> print_string(attribute.1) <> ")",
      )
    }

    "viewbox" ->
      doc.from_string(
        "attribute(\"viewBox\", " <> print_string(attribute.1) <> ")",
      )

    "type" ->
      doc.from_string("attribute.type_(" <> print_string(attribute.1) <> ")")

    "checked"
    | "controls"
    | "disabled"
    | "form_novalidate"
    | "loop"
    | "novalidate"
    | "readonly"
    | "required"
    | "selected" -> {
      doc.from_string("attribute." <> attribute.0 <> "(True)")
    }

    "width" | "height" | "cols" | "rows" -> {
      case svg_mode {
        SVG -> {
          let children = [
            doc.from_string(print_string(attribute.0)),
            doc.from_string(print_string(attribute.1)),
          ]
          doc.from_string("attribute")
          |> doc.append(wrap(children, "(", ")"))
        }
        HTML ->
          doc.from_string(
            "attribute." <> attribute.0 <> "(" <> attribute.1 <> ")",
          )
      }
    }

    _ -> {
      let children = [
        doc.from_string(print_string(attribute.0)),
        doc.from_string(print_string(attribute.1)),
      ]
      doc.from_string("attribute")
      |> doc.append(wrap(children, "(", ")"))
    }
  }
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
