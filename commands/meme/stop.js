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

const { SlashCommandBuilder } = require('discord.js');
const { isUserAllowed } = require('../../utils/permissions');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('stop')
        .setDescription('Stop posting memes in the current channel.'),
    async execute(interaction) {
        if (!isUserAllowed(interaction)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
            return;
        }

        const guildId = interaction.guild.id;

        if (global.memeIntervals && global.memeIntervals[guildId]) {
            clearInterval(global.memeIntervals[guildId]);
            delete global.memeIntervals[guildId];
            await interaction.reply('Meme posting has been stopped for this guild.');
        } else {
            await interaction.reply('No meme posting is currently active for this guild.');
        }
    },
};