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

const {SlashCommandBuilder, EmbedBuilder} = require('discord.js');
const fs = require('fs');
const {memeFolder, sentMemesFile, defaultMemeIntervalMinutes} = require('../../config.json')
const guildConfigFile = './data/guild_config.json'

module.exports = {
    data: new SlashCommandBuilder()
        .setName("Stats")
        .setDescription("Get infomation about the amount of memes sent and how long until the bot finishes")
    async execute(interaction) {
        const guildID = interaction.guild.id;

        let sentMemes = {};
        if(fs.existsSync(sentMemesFile)){
            sentMemes = JSON.parse(fs.readFileSync(sentMemesFile, 'utf-8'));
        }

        const sentMemesForGuild = sentMemes[guildID] || [];
        const totalSent = sentMemesForGuild.length;

        const listMemes = fs.readdirSync(memeFolder);
        const totalMemes = listMemes.length;

        const remainingMemes = allMemes.filter(meme => !sentMemesForGuild.include(meme)).length;

        let intervalMinutes = defaultMemeIntervalMinutes;
        if(fs.existsSync(guildConfigFile)){
            const guildConfig = JSON.parse(fs.readFileSync(guildConfigFile, "utf-8"));
            if (guildConfig[guildID] && guildConfig[guildID].memeIntervalMinutes){
                intervalMinutes = guildConfig[guildID].memeIntervalMinutes;
            }
        }

        const estimatedTime = Math.floor((Date.now() + remainingMemes * intervalMinutes * 60 * 1000) / 1000);

        const embed = new EmbedBuilder()
            .setColor("#df1538")
            .setTitle("🧮 Statistics")
            .addFields(
                {name: "Total Memes Sent", value: '**${totalSent}**', inline:true},
                {name: "Memes Remaining", value: '**${remainingMemes}**', inline:ture},
                {name: "Time till last Meme", value: '<t:${estimatedTime}:R>', inline:false}
            )
            .setTimestamp();
        await interaction.reply({embeds:[embed], flags: 64});
    },
};