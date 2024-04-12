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
pub fn convert(html: String) -> String {
  let documents =
    html
    |> parser.parse_to_records
    |> strip_body_wrapper(html)
    |> print_children(StripWhitespace)

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
  doc.from_string("text(" <> print_string(t) <> ")")
}

fn print_string(t: String) -> String {
  "\"" <> string.replace(t, "\"", "\\\"") <> "\""
}

fn print_element(
  tag: String,
  attributes: List(#(String, String)),
  children: List(HtmlNode),
  ws: WhitespaceMode,
) -> Document {
  let tag = string.lowercase(tag)
  let attributes =
    list.map(attributes, print_attribute)
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
    | "option"
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
    | "script"
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
    | "svg"
    | "table"
    | "tbody"
    | "td"
    | "template"
    | "text"
    | "tfoot"
    | "th"
    | "thead"
    | "time"
    | "title"
    | "tr"
    | "u"
    | "ul"
    | "var"
    | "video" -> {
      let children = wrap(print_children(children, ws), "[", "]")
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    "pre" -> {
      let children =
        wrap(print_children(children, PreserveWhitespace), "[", "]")
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    "textarea" -> {
      let content = doc.from_string(print_string(get_text_content(children)))
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, content], "(", ")"))
    }

    _ -> {
      let children = wrap(print_children(children, ws), "[", "]")
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
) -> List(Document) {
  list.filter_map(children, fn(node) {
    case node {
      Element(a, b, c) -> Ok(print_element(a, b, c, ws))
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

fn print_attribute(attribute: #(String, String)) -> Document {
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
      doc.from_string("attribute." <> attribute.0 <> "(" <> attribute.1 <> ")")
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
