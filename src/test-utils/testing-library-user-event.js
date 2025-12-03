import { act } from "react";

const fireEvent = (element, event) => {
  act(() => {
    element.dispatchEvent(event);
  });
};

const click = async (element) => {
  fireEvent(
    element,
    new MouseEvent("click", { bubbles: true, cancelable: true, composed: true })
  );
};

const selectOptions = async (select, value) => {
  if (!(select instanceof Element) || select.tagName.toLowerCase() !== "select") {
    throw new Error("selectOptions erwartet ein Select-Element");
  }
  // Unterstützt einfache Einzelauswahl
  select.value = value;
  fireEvent(select, new Event("change", { bubbles: true }));
};

const setup = () => ({
  click,
  selectOptions,
});

const userEvent = { setup };

export default userEvent;
export { setup };
