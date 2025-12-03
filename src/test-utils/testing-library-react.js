import React from "react";
import { act } from "react";
import { createRoot } from "react-dom/client";

if (typeof global !== "undefined") {
  global.IS_REACT_ACT_ENVIRONMENT = true;
}

const normalize = (value) => (value || "").toString().replace(/\s+/g, " ").trim();

const matchText = (content, matcher) => {
  const normalizedContent = normalize(content);
  if (matcher instanceof RegExp) {
    return matcher.test(normalizedContent);
  }
  if (typeof matcher === "string") {
    return normalizedContent === normalize(matcher);
  }
  return false;
};

const getAccessibleName = (element) => {
  if (element.getAttribute) {
    const ariaLabel = element.getAttribute("aria-label");
    if (ariaLabel) return normalize(ariaLabel);
  }
  return normalize(element.textContent || "");
};

const queryAll = (container, predicate) => {
  return Array.from(container.querySelectorAll("*"))
    .filter((node) => node.nodeType === 1)
    .filter(predicate);
};

const resolveRole = (element) => {
  if (element.getAttribute && element.getAttribute("role")) {
    return element.getAttribute("role");
  }
  const tag = element.tagName ? element.tagName.toLowerCase() : "";
  if (tag === "button") return "button";
  if (tag === "input" && element.type === "checkbox") return "checkbox";
  if (tag === "select") return "combobox";
  if (tag === "table") return "table";
  if (tag === "tr") return "row";
  if (tag === "td" || tag === "th") return "cell";
  return null;
};

const makeQueries = (container) => {
  const queryByText = (matcher) =>
    queryAll(container, (el) => matchText(el.textContent || "", matcher))[0] || null;

  const getByText = (matcher) => {
    const result = queryByText(matcher);
    if (!result) {
      throw new Error(`Kein Element mit Text ${matcher} gefunden`);
    }
    return result;
  };

  const queryByRole = (role, options = {}) => {
    const { name } = options;
    return (
      queryAll(container, (el) => {
        const resolvedRole = resolveRole(el);
        if (resolvedRole !== role) return false;
        if (name == null) return true;
        return matchText(getAccessibleName(el), name);
      })[0] || null
    );
  };

  const getByRole = (role, options = {}) => {
    const result = queryByRole(role, options);
    if (!result) {
      throw new Error(`Kein Element mit Rolle ${role} gefunden`);
    }
    return result;
  };

  const queryByLabelText = (matcher) => {
    const ariaMatch = queryAll(container, (el) => {
      const ariaLabel = el.getAttribute ? el.getAttribute("aria-label") : null;
      return ariaLabel ? matchText(ariaLabel.trim(), matcher) : false;
    })[0];
    if (ariaMatch) return ariaMatch;

    const label = queryAll(container, (el) => el.tagName && el.tagName.toLowerCase() === "label")
      .find((el) => matchText((el.textContent || "").trim(), matcher));
    if (label) {
      const controlId = label.getAttribute("for");
      if (controlId) {
        return container.querySelector(`#${controlId}`);
      }
      return label.querySelector("input,select,textarea,button");
    }
    return null;
  };

  const getByLabelText = (matcher) => {
    const result = queryByLabelText(matcher);
    if (!result) {
      throw new Error(`Kein Element mit Label ${matcher} gefunden`);
    }
    return result;
  };

  return {
    queryByText,
    getByText,
    queryByRole,
    getByRole,
    queryByLabelText,
    getByLabelText,
  };
};

const screen = makeQueries(document.body);

const render = (ui) => {
  const container = document.createElement("div");
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => {
    root.render(ui);
  });

  const queries = makeQueries(container);

  const rerender = (nextUi) => {
    act(() => {
      root.render(nextUi);
    });
  };

  const unmount = () => {
    act(() => {
      root.unmount();
      if (container.parentNode) {
        container.parentNode.removeChild(container);
      }
    });
  };

  Object.assign(screen, queries);

  return { container, rerender, unmount, ...queries };
};

const cleanup = () => {
  document.body.innerHTML = "";
};

export { render, screen, cleanup };
