import html_lustre_converter
import lustre
import lustre/attribute
import lustre/element.{type Element}
import lustre/element/html
import lustre/event

pub fn main() {
  let app = lustre.simple(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)

  Nil
}

pub type Model {
  Model(rendered_lustre: String)
}

fn init(_flags) -> Model {
  Model(rendered_lustre: "")
}

pub type Msg {
  UserUpdatedHtml(String)
}

pub fn update(_model: Model, msg: Msg) -> Model {
  case msg {
    UserUpdatedHtml(html) -> {
      let html = html_lustre_converter.convert(html)
      Model(rendered_lustre: html)
    }
  }
}

fn view(model: Model) -> Element(Msg) {
  layout([
    html.div([attribute.class("grid grid-cols-2 font-mono h-screen")], [
      html.section(
        [
          attribute.class(
            "block w-full h-full border-2 border-r-1 border-[#ffaff3]",
          ),
        ],
        [
          html.textarea(
            [
              attribute.class("bg-transparent p-4 block w-full h-full"),
              attribute.placeholder(
                "Hello! Paste your HTML here and I'll convert it to Lustre",
              ),
              event.on_input(UserUpdatedHtml),
            ],
            "",
          ),
        ],
      ),
      html.section(
        [attribute.class("bg-[#282c34] border-2 border-l-1 border-[#ffaff3]")],
        [
          html.textarea(
            [
              attribute.class(
                "bg-transparent text-gray-300 p-4 block w-full h-full",
              ),
            ],
            model.rendered_lustre,
          ),
        ],
      ),
    ]),
  ])
}

fn layout(children: List(Element(a))) -> Element(a) {
  html.div([], [
    html.link([
      attribute.rel("stylesheet"),
      attribute.href("priv/static/app.css"),
    ]),
    ..children
  ])
}
