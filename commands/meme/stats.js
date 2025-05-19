/*
*   Meme Spawner Bot - discord bot for sharing memes
*   Copyright (C) 2025  tigerjess12
*   
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation version 3 of the License.
*   
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*   
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const { memesFolder, sentMemesFile, defaultMemeIntervalMinutes } = require('../../config.json');
const guildConfigFile = './data/guild_config.json';

module.exports = {
    data: new SlashCommandBuilder()
        .setName("stats")
        .setDescription("Get information about the bot's statistics"),
    async execute(interaction) {
        const guildID = interaction.guild.id;

        let sentMemes = {};
        if (fs.existsSync(sentMemesFile)) {
            sentMemes = JSON.parse(fs.readFileSync(sentMemesFile, 'utf-8'));
        }

        const sentMemesForGuild = sentMemes[guildID] || [];
        const totalSent = sentMemesForGuild.length;

        if (!fs.existsSync(memesFolder)) {
            return interaction.reply({
                content: "❌ The meme folder is not configured or does not exist. Please check the bot's configuration.",
                ephemeral: true
            });
        }

        const allMemes = fs.readdirSync(memesFolder);
        const totalMemes = allMemes.length;

        const remainingMemes = allMemes.filter(meme => !sentMemesForGuild.includes(meme)).length;

        let intervalMinutes = defaultMemeIntervalMinutes;
        if (fs.existsSync(guildConfigFile)) {
            const guildConfig = JSON.parse(fs.readFileSync(guildConfigFile, "utf-8"));
            if (guildConfig[guildID] && guildConfig[guildID].memeIntervalMinutes) {
                intervalMinutes = guildConfig[guildID].memeIntervalMinutes;
            }
        }

        // Calculate estimated time until the last meme
        const estimatedTime = Math.floor((Date.now() + remainingMemes * intervalMinutes * 60 * 1000) / 1000);

        // Bot uptime
        const uptime = process.uptime(); // in seconds
        const uptimeHours = Math.floor(uptime / 3600);
        const uptimeMinutes = Math.floor((uptime % 3600) / 60);
        const uptimeSeconds = Math.floor(uptime % 60);

        // Bot ping
        const ping = interaction.client.ws.ping;

        
        const embed = new EmbedBuilder()
            .setColor("#df1538")
            .setTitle("🧮 Bot Statistics")
            .addFields(
                { name: "Total Memes Sent", value: `**${totalSent}**`, inline: false },
                { name: "Memes Remaining", value: `**${remainingMemes}**`, inline: false },
                { name: "Time till Last Meme", value: `<t:${estimatedTime}:R>`, inline: false },
                { name: "Bot Uptime", value: `**${uptimeHours}h ${uptimeMinutes}m ${uptimeSeconds}s**`, inline: true },
                { name: "Ping", value: `**${ping}ms**`, inline: true },

            )
            .setTimestamp();

        await interaction.reply({ embeds: [embed], flags: 64 });
    },
};