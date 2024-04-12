import gleeunit
import gleeunit/should
import html_lustre_converter
import javascript_dom_parser/deno_polyfill

pub fn main() {
  deno_polyfill.install_polyfill()
  gleeunit.main()
}

pub fn empty_test() {
  ""
  |> html_lustre_converter.convert
  |> should.equal("")
}

pub fn h1_test() {
  "<h1></h1>"
  |> html_lustre_converter.convert
  |> should.equal("html.h1([], [])")
}

pub fn h1_2_test() {
  "<h1></h1><h1></h1>"
  |> html_lustre_converter.convert
  |> should.equal("[html.h1([], []), html.h1([], [])]")
}

pub fn h1_3_test() {
  "<h1></h1><h1></h1><h1></h1><h1></h1><h1></h1>"
  |> html_lustre_converter.convert
  |> should.equal(
    "[
  html.h1([], []),
  html.h1([], []),
  html.h1([], []),
  html.h1([], []),
  html.h1([], []),
]",
  )
}

pub fn h1_4_test() {
  "<h1>Jello, Hoe!</h1>"
  |> html_lustre_converter.convert
  |> should.equal("html.h1([], [text(\"Jello, Hoe!\")])")
}

pub fn text_test() {
  "Hello, Joe!"
  |> html_lustre_converter.convert
  |> should.equal("text(\"Hello, Joe!\")")
}

pub fn element_lustre_does_not_have_a_helper_for_test() {
  "<marquee>I will die mad that this element was removed</marquee>"
  |> html_lustre_converter.convert
  |> should.equal(
    "element(\"marquee\", [], [text(\"I will die mad that this element was removed\")])",
  )
}

pub fn attribute_test() {
  "<a href=\"https://gleam.run/\">The best site</a>"
  |> html_lustre_converter.convert
  |> should.equal(
    "html.a([attribute.href(\"https://gleam.run/\")], [text(\"The best site\")])",
  )
}

pub fn other_attribute_test() {
  "<a data-thing=\"1\">The best site</a>"
  |> html_lustre_converter.convert
  |> should.equal(
    "html.a([attribute(\"data-thing\", \"1\")], [text(\"The best site\")])",
  )
}

pub fn no_value_attribute_test() {
  "<p type=good></p>"
  |> html_lustre_converter.convert
  |> should.equal("html.p([attribute.type_(\"good\")], [])")
}

pub fn void_br_test() {
  "<br>"
  |> html_lustre_converter.convert
  |> should.equal("html.br([])")
}

pub fn void_br_with_attrs_test() {
  "<br class=good>"
  |> html_lustre_converter.convert
  |> should.equal("html.br([attribute.class(\"good\")])")
}

pub fn its_already_a_page_test() {
  "<html><head><title>Hi</title></head><body>Yo</body></html>"
  |> html_lustre_converter.convert
  |> should.equal(
    "html.html(\n  [],\n  [html.head([], [html.title([], [text(\"Hi\")])]), html.body([], [text(\"Yo\")])],\n)",
  )
}

pub fn its_already_a_page_1_test() {
  "<html><head></head><body>Yo</body></html>"
  |> html_lustre_converter.convert
  |> should.equal(
    "html.html([], [html.head([], []), html.body([], [text(\"Yo\")])])",
  )
}

pub fn text_with_a_quote_in_it_test() {
  "Here is a quote \" "
  |> html_lustre_converter.convert
  |> should.equal("text(\"Here is a quote \\\" \")")
}

pub fn non_string_attribute_test() {
  "<br autoplay>"
  |> html_lustre_converter.convert
  |> should.equal("html.br([attribute(\"autoplay\", \"\")])")
}

pub fn bool_attribute_test() {
  "<br required>"
  |> html_lustre_converter.convert
  |> should.equal("html.br([attribute.required(True)])")
}

pub fn int_attribute_test() {
  "<br width=\"400\">"
  |> html_lustre_converter.convert
  |> should.equal("html.br([attribute.width(400)])")
}

pub fn full_page_test() {
  let code =
    "
<!doctype html>
<html>
  <head>
    <title>Hello!</title>
  </head>
  <body>
    <h1>Goodbye!</h1>
  </body>
</html>
  "
    |> html_lustre_converter.convert

  code
  |> should.equal(
    "html.html(
  [],
  [
    html.head([], [html.title([], [text(\"Hello!\")])]),
    html.body([], [html.h1([], [text(\"Goodbye!\")])]),
  ],
)",
  )
}

pub fn comment_test() {
  "<h1><!-- This is a comment --></h1>"
  |> html_lustre_converter.convert
  |> should.equal("html.h1([], [])")
}

pub fn trailing_whitespace_test() {
  "<h1>Hello </h1><h2>world</h2>"
  |> html_lustre_converter.convert
  |> should.equal(
    "[html.h1([], [text(\"Hello \")]), html.h2([], [text(\"world\")])]",
  )
}
