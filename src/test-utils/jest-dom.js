const isInDocument = (element) => {
  if (!element) return false;
  return Boolean(element.ownerDocument && element.ownerDocument.contains(element));
};

const toBeInTheDocument = (received) => {
  const pass = isInDocument(received);
  return {
    pass,
    message: () =>
      pass
        ? "Das Element ist im Dokument vorhanden."
        : "Das Element ist nicht im Dokument vorhanden.",
  };
};

if (typeof expect !== "undefined" && expect.extend) {
  expect.extend({ toBeInTheDocument });
}

export { toBeInTheDocument };
