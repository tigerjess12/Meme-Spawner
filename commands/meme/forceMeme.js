/*
*   Meme Spawner Bot - discord bot for sharing memes
*   Copyright (C) 2025  tigerjess12
*
*   This program is free software: you can redistribute it and/or modify
*   it under the terms of the GNU General Public License as published by
*   the Free Software Foundation version 3 of the License.
*
*   This program is distributed in the hope that it will be useful,
*   but WITHOUT ANY WARRANTY; without even the implied warranty of
*   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*   GNU General Public License for more details.
*
* You should have received a copy of the GNU General Public License
* along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { isUserAllowed } = require('../../utils/permissions');
const memesFolder = path.join(__dirname, '../../Memes');
const sentMemesFile = path.join(__dirname, '../../data/sent_memes.json');

function getSentMemes(guildId) {
    try {
        if (fs.existsSync(sentMemesFile)) {
            const currentData = JSON.parse(fs.readFileSync(sentMemesFile, 'utf-8'));
            return currentData[guildId] || [];
        }
    } catch (error) {
        console.error('Error reading sent_memes.json:', error);
    }
    return [];
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('randommeme')
        .setDescription('Sends a random meme to the channel.'),
    async execute(interaction) {
        if (!isUserAllowed(interaction)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
            return;
        }

        const guildId = interaction.guild.id;
        const sentMemes = getSentMemes(guildId);

        // Read all files from the memes folder
        let memeFiles;
        try {
            memeFiles = fs.readdirSync(memesFolder).filter(file => /\.(png|jpg|jpeg|gif)$/i.test(file));
            if (memeFiles.length === 0) {
                await interaction.reply({ content: 'No memes found in the memes folder.', flags: 64 });
                return;
            }
        } catch (error) {
            console.error('Error reading memes folder:', error);
            await interaction.reply({ content: 'An error occurred while trying to read the memes folder.', flags: 64 });
            return;
        }

        // Filter out already sent memes
        const availableMemes = memeFiles.filter(meme => !sentMemes.includes(meme));

         if (availableMemes.length === 0) {
            await interaction.reply({ content: 'All memes in the folder have been sent in this server.', flags: 64 });
            return;
        }

        // Select a random meme
        const randomIndex = Math.floor(Math.random() * availableMemes.length);
        const randomMeme = availableMemes[randomIndex];
        const memePath = path.join(memesFolder, randomMeme);

        //
        await interaction.reply({ files: [memePath] });


    },
};