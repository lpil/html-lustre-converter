import gleam/javascript/promise
import html_lustre_converter
import lustre
import lustre/attribute.{attribute}
import lustre/effect.{type Effect}
import lustre/element.{type Element}
import lustre/element/html
import lustre/element/svg
import lustre/event
import plinth/browser/clipboard
import plinth/javascript/global

pub fn main() {
  let app = lustre.application(init, update, view)
  let assert Ok(_) = lustre.start(app, "#app", Nil)
  Nil
}

pub type Model {
  Model(rendered_lustre: String, copy_button_text: String)
}

const copy_button_default_text = "Copy"

const copy_button_copied_text = "Copied"

fn init(_flags) -> #(Model, Effect(e)) {
  let model =
    Model(rendered_lustre: "", copy_button_text: copy_button_default_text)
  #(model, effect.none())
}

pub type Msg {
  UserUpdatedHtml(String)
  UserClickedCopy
  CopyFeedbackWindowEnded
}

pub fn update(model: Model, msg: Msg) -> #(Model, Effect(Msg)) {
  case msg {
    UserClickedCopy -> {
      let copy_effect = effect.from(copy_to_clipboard(_, model.rendered_lustre))
      let model = Model(..model, copy_button_text: copy_button_copied_text)
      #(model, copy_effect)
    }

    CopyFeedbackWindowEnded -> {
      let model = Model(..model, copy_button_text: copy_button_default_text)
      #(model, effect.none())
    }

    UserUpdatedHtml(html) -> {
      let html = html_lustre_converter.convert(html)
      let model = Model(..model, rendered_lustre: html)
      #(model, effect.none())
    }
  }
}

fn view(model: Model) -> Element(Msg) {
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
              "Hello!\nPaste your HTML here and I'll convert it to Lustre",
            ),
            event.on_input(UserUpdatedHtml),
          ],
          "",
        ),
      ],
    ),
    html.section(
      [
        attribute.class(
          "bg-[#282c34] border-2 border-l-1 border-[#ffaff3] relative",
        ),
      ],
      [
        html.textarea(
          [
            attribute.class(
              "bg-transparent text-gray-300 p-4 block w-full h-full",
            ),
          ],
          model.rendered_lustre,
        ),
        html.button(
          [
            event.on_click(UserClickedCopy),
            attribute.class(
              "flex items-center gap-2 absolute bottom-3 right-3 bg-[#ffaff3] py-2 px-3 rounded-md font-bold transition-opacity hover:opacity-75",
            ),
          ],
          [
            lucide_copy_icon(),
            element.text(model.copy_button_text)
          ],
        ),
      ],
    ),
  ])
}

fn copy_to_clipboard(dispatch: fn(Msg) -> Nil, text: String) -> Nil {
  {
    use _ <- promise.map(clipboard.write_text(text))
    use <- set_timeout(1000)
    dispatch(CopyFeedbackWindowEnded)
  }
  Nil
}

fn set_timeout(delay: Int, callback: fn() -> anything) -> Nil {
  let callback = fn(_) {
    callback()
    Nil
  }
  global.set_timeout(callback, delay)
}

fn lucide_copy_icon() -> Element(a) {
    svg.svg(
      [
        attribute.class("w-5 h-5"),
        attribute("stroke-linejoin", "round"),
        attribute("stroke-linecap", "round"),
        attribute("stroke-width", "2.5"),
        attribute("stroke", "currentColor"),
        attribute("fill", "none"),
        attribute("viewBox", "0 0 24 24"),
        attribute("xmlns", "http://www.w3.org/2000/svg"),
      ],
      [
        svg.rect([
          attribute("ry", "2"),
          attribute("rx", "2"),
          attribute("y", "8"),
          attribute("x", "8"),
          attribute("height", "14"),
          attribute("width", "14"),
        ]),
        svg.path([
          attribute("d", "M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"),
        ]),
      ],
    )
}
