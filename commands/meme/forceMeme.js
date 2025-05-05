/*
 * This file is part of MemeFeed.
 *
 * MemeFeed is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3 of the License
 *
 * MemeFeed is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with MemeFeed. If not, see <https://www.gnu.org/licenses/>.
 */

const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { isUserAllowed } = require('../../utils/permissions');
const memesFolder = path.join(__dirname, '../../Memes');
const sentMemesFile = path.join(__dirname, '../../data/sent_memes.json');

function saveSentMemes(guildId, meme) {
    try {
        let currentData = {};
        if (fs.existsSync(sentMemesFile)) {
            currentData = JSON.parse(fs.readFileSync(sentMemesFile, 'utf-8'));
        }

        if (!currentData[guildId]) {
            currentData[guildId] = [];
        }

        currentData[guildId].push(meme);

        fs.writeFileSync(sentMemesFile, JSON.stringify(currentData, null, 2));
    } catch (error) {
        console.error('Error saving sent_memes.json:', error);
    }
}

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
        .setName('forcememe')
        .setDescription('Force send a random meme to the channel.'),
    async execute(interaction) {
        if (!isUserAllowed(interaction)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
            return;
        }

        const guildId = interaction.guild.id;
        const sentMemes = getSentMemes(guildId);

        // Get all memes from the memes folder
        const allMemes = fs.readdirSync(memesFolder);

        // Filter out memes that have already been sent
        const unsentMemes = allMemes.filter(meme => !sentMemes.includes(meme));

        if (unsentMemes.length === 0) {
            await interaction.reply({ content: 'No unsent memes are available to send.', flags: 64 });
            return;
        }

        // Pick a random meme from the unsent memes
        const randomMeme = unsentMemes[Math.floor(Math.random() * unsentMemes.length)];
        const memePath = path.join(memesFolder, randomMeme);

        // Send the random meme
        try {
            await interaction.reply({ files: [memePath] });

            // Save the meme to the sent list
            saveSentMemes(guildId, randomMeme);
            console.log(`Random meme "${randomMeme}" sent and saved.`);
        } catch (error) {
            console.error('Error sending random meme:', error);
            await interaction.reply({ content: 'Failed to send the meme. Please try again later.', flags: 64 });
        }
    },
};
