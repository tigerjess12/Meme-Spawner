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

const { SlashCommandBuilder, ChannelType } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { isUserAllowed } = require('../../utils/permissions');

const channelAssignmentsFile = path.join(__dirname, '../../data/channel_assignments.json');

let channelAssignments = {};
try {
    if (fs.existsSync(channelAssignmentsFile)) {
        channelAssignments = JSON.parse(fs.readFileSync(channelAssignmentsFile, 'utf-8'));
    }
} catch (error) {
    console.error('Error reading channel assignments file:', error);
}

function saveChannelAssignments() {
    try {
        fs.writeFileSync(channelAssignmentsFile, JSON.stringify(channelAssignments, null, 2));
    } catch (error) {
        console.error('Error saving channel assignments file:', error);
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setchannel')
        .setDescription('Set a channel for meme posting or authmemes.')
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('The channel to set.')
                .setRequired(true)
        )
        .addStringOption(option =>
            option
                .setName('type')
                .setDescription('The type of channel to set (meme or authmeme).')
                .setRequired(true)
                .addChoices(
                    { name: 'Meme', value: 'meme' },
                    { name: 'AuthMeme', value: 'authmeme' }
                )
        ),
    async execute(interaction) {
        try {
            if (!isUserAllowed(interaction)) {
                await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
                return;
            }

            const guildId = interaction.guild.id;
            const channel = interaction.options.getChannel('channel');
            const type = interaction.options.getString('type');

            if (!channel || ![ChannelType.GuildText, ChannelType.GuildAnnouncement].includes(channel.type)) {
                await interaction.reply({ content: 'Please specify a valid text channel.', flags: 64 });
                return;
            }

            if (!channelAssignments[guildId]) {
                channelAssignments[guildId] = { meme: null, authmeme: null };
            }

            channelAssignments[guildId][type] = channel.id;
            saveChannelAssignments();

            await interaction.reply(`Channel ${channel} has been set for ${type === 'meme' ? 'meme posting' : 'authmemes'}.`);
        } catch (error) {
            console.error('Error executing setchannel command:', error);
            await interaction.reply({ content: 'An unexpected error occurred while executing the command.', flags: 64 });
        }
    },
};