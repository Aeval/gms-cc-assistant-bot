const {
  Client,
  GatewayIntentBits,
  Collection,
  TextChannel,
} = require("discord.js");
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("message")
    .setDescription("Sends Lancer-formatted comms message")
    .addStringOption((option) => {
      return option
        .setName("msg")
        .setDescription("The message to send")
        .setRequired(true);
    }),
  async execute(interaction) {
    const inter = await interaction;
    console.log(inter);
    const message = inter.options.getString("msg");
    console.log(message);
    inter.reply("// " + message);
  },
};
