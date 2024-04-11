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
