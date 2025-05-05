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


const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { permissionsFile, ownerId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setrole')
        .setDescription('Set the role allowed to use bot commands for this guild.')
        .addRoleOption(option =>
            option.setName('role')
                .setDescription('The role to allow')
                .setRequired(true)
        ),
    async execute(interaction) {
        const guildId = interaction.guild.id;

        // Load permissions
        let permissions = {};
        if (fs.existsSync(permissionsFile)) {
            permissions = JSON.parse(fs.readFileSync(permissionsFile, 'utf-8'));
        }

        // Ensure the guilds object exists
        if (!permissions.guilds) {
            permissions.guilds = {};
        }

        // Ensure the guild has default permissions
        if (!permissions.guilds[guildId]) {
            permissions.guilds[guildId] = {
                allowedUserId: ownerId,
                allowedRoleId: null
            };
        }

        // Check if the user has Administrator permission
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            const guildPermissions = permissions.guilds[guildId];
            const allowedUserId = guildPermissions.allowedUserId;

            // Check if the user is the allowed user
            if (interaction.user.id !== allowedUserId) {
                await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
                return;
            }
        }

        const role = interaction.options.getRole('role');

        // Update the allowed role for the guild
        permissions.guilds[guildId].allowedRoleId = role.id;

        fs.writeFileSync(permissionsFile, JSON.stringify(permissions, null, 2));

        await interaction.reply(`The role ${role.name} has been set as the allowed role for this guild.`);
    },
};