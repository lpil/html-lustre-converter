//// Provide a basic commandline interface for the conversion which
//// reads a file and prints the result to standard out

import argv
import gleam/io
import html_lustre_converter
import javascript_dom_parser/deno_polyfill
import simplifile

pub fn main() {
  deno_polyfill.install_polyfill()

  case argv.load().arguments {
    [filename] -> {
      let assert Ok(contents) = simplifile.read(filename)
      io.println(html_lustre_converter.convert(contents))
    }
    _ -> io.println("Usage: html_lustre_converter <FILENAME>")
  }
}
