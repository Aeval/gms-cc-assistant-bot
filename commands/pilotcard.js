const { SlashCommandBuilder, EmbedBuilder, bold } = require("discord.js");
const getPlayerPrimaryPilotShareCode = require("../helpers/getPilotData");
const getPilotData = require("../helpers/getPilotData");
const addSharecodeOpt = require("../helpers/optionBuilders");
const isDivisibleBy3 = require("../helpers/math");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pilotcard")
    .setDescription("Get lancer pilot card given share code")
    .addStringOption((option) => addSharecodeOpt(option, false)),
  async execute(interaction, DB) {
    const guildPlayerPilotsCollectionRef = await DB.collection("lancer-db")
      .doc(interaction.guildId)
      .collection("players")
      .doc(interaction.user.id)
      .collection("pilots");

    const primaryPilot = await guildPlayerPilotsCollectionRef
      .where("primary", "==", true)
      .limit(1)
      .get();

    if (!interaction.options.getString("sharecode")) {
      if (primaryPilot.empty) {
        interaction.reply("Primary pilot could not be found!");
        return;
      }

      const primaryPilotShareCode = await primaryPilot.docs[0].data()
        .pilot_sharecode;

      pilotWrapper = await getPilotData(primaryPilotShareCode);
    } else {
      pilotWrapper = await getPilotData(
        interaction.options.getString("sharecode")
      );
    }

    const activeMech = pilotWrapper.pilotData.mechs.find(
      (mech) => mech.id === pilotWrapper.pilotData.state.active_mech_id
    );
    const talentArr = pilotWrapper.pilotData.talents;
    const skillArr = pilotWrapper.pilotData.skills;

    if (!isDivisibleBy3(skillArr)) {
      skillArr.push({
        id: "f_\u200b",
        rank: "",
      });
    }

    if (!isDivisibleBy3(talentArr)) {
      talentArr.push({
        id: "f_\u200b",
        rank: "",
      });
    }

    console.log(pilotWrapper.pilotData);

    const pilotCardEmbed = new EmbedBuilder()
      .setColor("#991E2A")
      .setTitle(pilotWrapper.pilotData.callsign)
      .setURL(
        "https://compcon.app/#/pilot/" + pilotWrapper.pilotData.id + "/sheet/1"
      )
      .setAuthor({
        name: pilotWrapper.pilotData.name,
        url:
          "https://compcon.app/#/pilot/" +
          pilotWrapper.pilotData.id +
          "/sheet/1",
      })
      .setDescription(
        `PILOT LEVEL: ${bold(
          pilotWrapper.pilotData.level
        )} | BACKGROUND: ${bold(
          pilotWrapper.pilotData.background
            ? pilotWrapper.pilotData.background
            : "N/A"
        )}`
      )
      .setThumbnail(
        pilotWrapper.pilotData.cloud_portrait
          ? pilotWrapper.pilotData.cloud_portrait
          : "https://compcon.app/static/img/pilot/nodata.png"
      )
      .setTimestamp()
      .setFooter({
        text: "Pilot Authenticated via COMP/CON Portal",
      });

    pilotCardEmbed.addFields(
      {
        name: "FRAME CONFIGURATION OPTIONS",
        //prettier-ignore
        value: `[ ${"HULL"}: ${bold(pilotWrapper.pilotData.mechSkills[0])} ${"AGI"}: ${bold(pilotWrapper.pilotData.mechSkills[1])} ${"SYS"}: ${bold(pilotWrapper.pilotData.mechSkills[2])} ${"ENG"}: ${bold(pilotWrapper.pilotData.mechSkills[3])} ]`,
      },
      {
        name: "\u200b",
        value: "PILOT TALENT AUDIT",
      }
    );

    // Loop talents
    talentArr
      .filter((talent) => talent.id.split("_").length > 1)
      .forEach((talent) => {
        console.log(talent.id.split("_").length);
        pilotCardEmbed.addFields({
          name: talent.id.split("_").slice(1).join(" ").toUpperCase(),
          value: talent.rank ? `Rank ${talent.rank}` : "\u200b",
          inline: true,
        });
      });

    pilotCardEmbed.addFields({
      name: "\u200b",
      value: "PILOT SKILL TRIGGER AUDIT",
    });

    // Loop skills
    skillArr
      .filter((skill) => skill.id.split("_").length > 1)
      .forEach((skill) => {
        console.log(skill.id.split("_").length);
        pilotCardEmbed.addFields({
          name: skill.id.split("_").slice(1).join(" ").toUpperCase(),
          value: skill.rank ? `Rank ${skill.rank}` : "\u200b",
          inline: true,
        });
      });

    pilotCardEmbed.addFields(
      {
        name: "\u200b",
        value: "ACTIVE MECH",
      },
      {
        name: activeMech ? activeMech.name : "No Active Mech",
        value: activeMech
          ? activeMech.frame.split("_").slice(1).join(" ").toUpperCase()
          : "Frame Unavailable",
        inline: true,
      },
      {
        name: activeMech ? activeMech.current_hp.toString() : "N/A",
        value: "CURRENT HP",
        inline: true,
      }
    );

    //prettier-ignore
    // interaction.reply(`// Pilot: ${pilotWrapper.pilotData.name.split(" ")[0]} '${pilotWrapper.pilotData.callsign}' ${pilotWrapper.pilotData.name.split(" ")[1]}`);
    await interaction.reply({embeds: [pilotCardEmbed]});
  },
};
