const { SlashCommandBuilder } = require("discord.js");
const getPilotData = require("../helpers/getPilotData");
const addSharecodeOpt = require("../helpers/optionBuilders");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("registerpilot")
    .setDescription("Register and post a new mission for pilots to take on")
    .addStringOption((option) => addSharecodeOpt(option, true))
    .addBooleanOption((option) => {
      return option
        .setName("setprimary")
        .setDescription("Is this your primary pilot?")
        .setRequired(true);
    }),
  async execute(interaction, DB) {
    if (interaction.user.bot) return;

    const guildPlayerDocRef = await DB.collection("lancer-db")
      .doc(interaction.guildId)
      .collection("players")
      .doc(interaction.user.id);

    const guildPlayerPilotsCollectionRef = await DB.collection("lancer-db")
      .doc(interaction.guildId)
      .collection("players")
      .doc(interaction.user.id)
      .collection("pilots");

    const pilotWrapper = await getPilotData(
      interaction.options.getString("sharecode")
    );

    const playerDoc = await guildPlayerDocRef.get();
    if (!playerDoc.exists) {
      await guildPlayerDocRef.set({
        playerDiscordId: interaction.user.id,
        playerDiscordName: interaction.user.username,
        ccId: pilotWrapper.metadata.iid,
      });
    } else {
      await guildPlayerDocRef.update({
        playerDiscordId: interaction.user.id,
        playerDiscordName: interaction.user.username,
        ccId: pilotWrapper.metadata.iid,
      });
    }

    if (interaction.options.getBoolean("setprimary")) {
      const primaryPilotSnapshot = await guildPlayerPilotsCollectionRef
        .where("primary", "==", true)
        .get();

      if (!primaryPilotSnapshot.empty) {
        for (const pilotDoc of primaryPilotSnapshot.docs) {
          await pilotDoc.ref.update({ primary: false });
        }
      }
    }

    const pilotDoc = await guildPlayerPilotsCollectionRef
      .doc(pilotWrapper.pilotData.id)
      .get();

    if (!pilotDoc.exists) {
      await guildPlayerPilotsCollectionRef.doc(pilotWrapper.pilotData.id).set({
        primary: interaction.options.getBoolean("setprimary"),
        pilot_id: pilotWrapper.pilotData.id,
        pilot_sharecode: pilotWrapper.metadata.shareCode,
        pilot_name: pilotWrapper.pilotData.name,
        pilot_callsign: pilotWrapper.pilotData.callsign,
        last_updated: new Date().toISOString(),
      });
    } else {
      await guildPlayerPilotsCollectionRef
        .doc(pilotWrapper.pilotData.id)
        .update({
          primary: interaction.options.getBoolean("setprimary"),
          pilot_id: pilotWrapper.pilotData.id,
          pilot_sharecode: pilotWrapper.metadata.shareCode,
          pilot_name: pilotWrapper.pilotData.name,
          pilot_callsign: pilotWrapper.pilotData.callsign,
          last_updated: new Date().toISOString(),
        });
    }

    interaction.reply("Pilot registered to " + interaction.user.username + "!");
  },
};
