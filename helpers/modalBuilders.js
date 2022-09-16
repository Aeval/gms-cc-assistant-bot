const {
  ActionRowBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
} = require("discord.js");

module.exports = function buildMissionModal() {
  const modal = new ModalBuilder()
    .setCustomId("missionModal")
    .setTitle("Create New Mission");

  const missionTitleInput = new TextInputBuilder()
    .setCustomId("missionTitleInput")
    .setLabel("Enter a title for the mission")
    .setPlaceholder("The Hunt for the Red October!")
    .setStyle(TextInputStyle.Short);

  const missionDetailsInput = new TextInputBuilder()
    .setCustomId("missionDetailsInput")
    .setLabel("Enter the prompt text for the mission!")
    .setStyle(TextInputStyle.Paragraph);

  const firstActionRow = new ActionRowBuilder().addComponents(
    missionTitleInput
  );
  const secondActionRow = new ActionRowBuilder().addComponents(
    missionDetailsInput
  );

  // Add inputs to the modal
  modal.addComponents(firstActionRow, secondActionRow);

  return modal;
};
