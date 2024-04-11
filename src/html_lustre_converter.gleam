import glam/doc.{type Document}
import gleam/list
import gleam/string
import javascript_dom_parser.{type HtmlNode, Comment, Element, Text} as parser

// TODO: do not unwrap the body the source contained body/head
// TODO: attributes
// TODO: void elements

// TODO: document
pub fn convert(html: String) -> String {
  let documents =
    html
    |> parser.parse_to_records
    |> strip_body_wrapper(html)
    |> list.map(print)

  case documents {
    [] -> doc.empty
    [document] -> document
    _ -> wrap(documents, "[", "]")
  }
  |> doc.to_string(80)
}

fn strip_body_wrapper(html: HtmlNode, source: String) -> List(HtmlNode) {
  case html {
    Element("HTML", [], [Element("HEAD", [], []), Element("BODY", [], nodes)]) ->
      nodes
    _ -> [html]
  }
}

fn print(html: HtmlNode) -> Document {
  case html {
    Element(tag, attributes, children) ->
      print_element(tag, attributes, children)
    Text(t) -> print_text(t)
    Comment(_) -> doc.empty
  }
}

fn print_text(t: String) -> Document {
  doc.from_string("text(")
  |> doc.append(print_string(t))
  |> doc.append(doc.from_string(")"))
}

fn print_string(t: String) -> Document {
  doc.from_string("\"" <> string.replace(t, "\"", "\"\\\"" <> "\"") <> "\"")
}

fn print_element(
  tag: String,
  attributes: List(#(String, String)),
  children: List(HtmlNode),
) -> Document {
  let tag = string.lowercase(tag)
  let attributes =
    list.map(attributes, print_attribute)
    |> wrap("[", "]")
  let children =
    list.map(children, print)
    |> wrap("[", "]")

  case tag {
    "a"
    | "abbr"
    | "address"
    | "area"
    | "article"
    | "aside"
    | "audio"
    | "b"
    | "base"
    | "bdi"
    | "bdo"
    | "blockquote"
    | "body"
    | "br"
    | "button"
    | "canvas"
    | "caption"
    | "cite"
    | "code"
    | "col"
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
    | "embed"
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
    | "hr"
    | "html"
    | "i"
    | "iframe"
    | "img"
    | "input"
    | "ins"
    | "kbd"
    | "label"
    | "legend"
    | "li"
    | "link"
    | "main"
    | "map"
    | "mark"
    | "math"
    | "menu"
    | "meta"
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
    | "pre"
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
    | "source"
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
    | "textarea"
    | "tfoot"
    | "th"
    | "thead"
    | "time"
    | "title"
    | "tr"
    | "track"
    | "u"
    | "ul"
    | "var"
    | "video"
    | "wbr" -> {
      doc.from_string("html." <> tag)
      |> doc.append(wrap([attributes, children], "(", ")"))
    }

    _ -> {
      let tag = print_string(tag)
      doc.from_string("element")
      |> doc.append(wrap([tag, attributes, children], "(", ")"))
    }
  }
}

fn print_attribute(attribute: #(String, String)) -> Document {
  doc.from_string(attribute.0)
  |> doc.append(doc.from_string("="))
  |> doc.append(print_string(attribute.1))
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
