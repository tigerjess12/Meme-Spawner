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

module.exports = {
    data: new SlashCommandBuilder()
        .setName('info')
        .setDescription('Get information about the bot and its creator.'),
    async execute(interaction) {
        const embed = new EmbedBuilder()
              .setAuthor({
                name: "Meme Spawner",
              })
              .setTitle("Meme Spawner Repo")
              .setURL("https://github.com/tigerjess12/Meme-Spawner")
              .setDescription("This discord bot was created by **tigerjess12**,\n\nIt's an open-source project made by them and is available under the GPL licensing agreement.\n\nThis bot was designed to share memes for your community, which they can upload to.")
              .addFields(
                {
                  name: "Creator",
                  value: "Made by __tigerjess12__",
                  inline: true
                },
                {
                  name: "GitHub",
                  value: "[GitHub](https://github.com/tigerjess12/Meme-Spawner)\nYou can download the source code here",
                  inline: true
                },
                {
                  name: "Report Issues here",
                  value: "[Issue Report](https://github.com/tigerjess12/Meme-Spawner/issues)",
                  inline: true
                },
                {
                  name: "Version",
                  value: "2.0.1",
                  inline: false
                },
                {
                  name: "LICENSE",
                  value: "This bot is licensed under the GNU GPL v3. See the LICENSE file for details.",
                  inline: false
                },
              )
              .setThumbnail("https://avatars.githubusercontent.com/u/71166173?v=4")
              .setColor("#f50000")
              .setFooter({
                text: "GNU GENERAL PUBLIC LICENSE Copyright (C) 2025 tigerjess12",
                iconURL: "https://yt3.googleusercontent.com/ytc/AIdro_nHIyT70E9Kg3868fDfhUACYeW8FdwO3liWY-O-Ia2nwWA=s900-c-k-c0x00ffffff-no-rj",
              });           

            await interaction.reply({ embeds: [embed] });
    },
};