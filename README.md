# html_lustre_converter

The Lustreizer. Convert regular HTML markup into Lustre syntax.

[![Package Version](https://img.shields.io/hexpm/v/html_lustre_converter)](https://hex.pm/packages/html_lustre_converter)
[![Hex Docs](https://img.shields.io/badge/hex-docs-ffaff3)](https://hexdocs.pm/html_lustre_converter/)

This package depends on the `javascript_dom_parser` package, which only works in
the browser. If you wish to run this using the Deno runtime you will need to
call the `install_polyfill` function from the `javascript_dom_parser/deno_polyfill`
module. It may not be possible to use this library elsewhere.

```sh
gleam add html_lustre_converter
```
```gleam
import html_lustre_converter

pub fn main() {
  "<h1>Hello, Joe!</h1>"
  |> html_lustre_converter.convert
  |> should.equal("html.h1([], [text(\"Hello, Joe!\")])")
}
```

Further documentation can be found at <https://hexdocs.pm/html_lustre_converter>.
