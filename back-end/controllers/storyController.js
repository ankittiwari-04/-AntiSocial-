const makeNotImplemented = (action) => (req, res) => {
  res.status(501).json({ message: `${action} controller is available for service-layer wiring.` });
};

module.exports = {
  create: makeNotImplemented("create"),
  read: makeNotImplemented("read"),
  update: makeNotImplemented("update"),
  remove: makeNotImplemented("remove"),
};
