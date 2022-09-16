module.exports = function addSharecodeOpt(option, req) {
  return option
    .setName("sharecode")
    .setDescription("Your pilot's ShareCode from COMP/CON")
    .setRequired(req);
};
