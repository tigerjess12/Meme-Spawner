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

const fs = require('fs');
const path = require('path');

const permissionsFile = path.join(__dirname, '../settings/permissions.json');

function isUserAllowed(interaction) {
    if (!fs.existsSync(permissionsFile)) {
        console.error('Permissions file not found.');
        return false;
    }

    const permissions = JSON.parse(fs.readFileSync(permissionsFile, 'utf-8'));
    const guildId = interaction.guild.id;

    // Check if the guild exists in permissions
    if (!permissions.guilds || !permissions.guilds[guildId]) {
        console.error(`No permissions configured for guild: ${guildId}`);
        return false;
    }

    const guildPermissions = permissions.guilds[guildId];
    const allowedUserId = guildPermissions.allowedUserId;
    const allowedRoleId = guildPermissions.allowedRoleId;

    // Check if the user is the allowed user
    if (interaction.user.id === allowedUserId) {
        console.log(`User ${interaction.user.id} is allowed (matched allowedUserId).`);
        return true;
    }

    // Check if the user has the allowed role
    if (allowedRoleId && interaction.member.roles.cache.has(allowedRoleId)) {
        console.log(`User ${interaction.user.id} is allowed (matched allowedRoleId).`);
        return true;
    }

    console.error(`User ${interaction.user.id} is not allowed.`);
    return false;
}

module.exports = { isUserAllowed };