const {
  Client,
  GatewayIntentBits,
  Collection,
  TextChannel,
} = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const buildMissionModal = require("../helpers/modalBuilders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registermission")
    .setDescription("Register and post a new mission for pilots to take on"),
  async execute(interaction, DB) {
    if (interaction.user.bot) return;

    const modal = buildMissionModal();
    const guildMissionCollectionRef = await DB.collection("lancer-db")
      .doc(interaction.guildId)
      .collection("players")
      .doc(interaction.user.id)
      .collection("missions");

    // Display modal to user
    await interaction.showModal(modal);

    // Only get input from mission modal
    const filter = (interaction) => interaction.customId === "missionModal";

    // Save input as mission inside player doc
    await interaction
      .awaitModalSubmit({ filter, time: 120_000 })
      .then(async (interaction) => {
        await guildMissionCollectionRef.add({
          //prettier-ignore
          mission_title: interaction.fields.getTextInputValue("missionTitleInput"),
          mission_key: interaction.fields
            .getTextInputValue("missionTitleInput")
            .split(" ")
            .join("_")
            .toLowerCase(),
          //prettier-ignore
          mission_description: interaction.fields.getTextInputValue("missionDetailsInput"),
          mission_organizer_id: interaction.user.id,
          mission_organizer_user: interaction.user.username,
          created_at: new Date().toISOString(),
        });

        // Get newly created mission
        const missionSnapshot = await guildMissionCollectionRef
          .where(
            "mission_key",
            "==",
            interaction.fields
              .getTextInputValue("missionTitleInput")
              .split(" ")
              .join("_")
              .toLowerCase()
          )
          .get();

        // Handle no mission found
        if (missionSnapshot.empty) {
          interaction.reply("Mission could not be found!");
          return;
        }

        // Display the mission string
        const missionData = missionSnapshot.docs[0].data();
        interaction.reply(
          `Mission ${missionData.mission_title} was created by ${missionData.mission_organizer_user}!`
        );
      });
  },
};
