const {
  Client,
  GatewayIntentBits,
  Collection,
  TextChannel,
  ActionRowBuilder,
  SelectMenuBuilder,
} = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");
const buildMissionModal = require("../helpers/modalBuilders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("postmission")
    .setDescription("Post a mission from your COMP/CON console."),
  async execute(interaction) {
    if (interaction.user.bot) return;

    const row = new ActionRowBuilder().addComponents(
      new SelectMenuBuilder()
        .setCustomId("missionSelect")
        .addPlaceholder("Select a mission...")
    );

    await interaction.showModal(modal);

    const filter = (interaction) => interaction.customId === "missionModal";
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
        if (missionSnapshot.empty) {
          interaction.reply("Mission could not be found!");
          return;
        }
        const missionData = missionSnapshot.docs[0].data();
        // TODO: Change this to display mission prompt with acceptance reacts
        interaction.reply(
          `Mission ${missionData.mission_title} was created by ${missionData.mission_organizer_user}!`
        );
      });
  },
};
