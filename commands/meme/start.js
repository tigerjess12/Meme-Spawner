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
const fs = require('fs');
const path = require('path');
const { isUserAllowed } = require('../../utils/permissions');
const { memesFolder, sentMemesFile, channelAssignmentsFile, defaultMemeIntervalMinutes } = require('../../config.json');

const guildConfigFile = './data/guild_config.json';

// Store intervals for each guild
global.memeIntervals = {};

function saveGuildConfig(guildId, intervalMinutes) {
    try { 
        let guildConfig = {};
        if (fs.existsSync(guildConfigFile)){
            guildConfig = JSON.parse(fs.readFileSync(guildConfigFile, "utf-8"));
        }

        if (!guildConfig[guildId]) {
            guildConfig[guildId] = {};
        }

        guildConfig[guildId].memeIntervalMinutes = intervalMinutes;

        fs.writeFileSync(guildConfigFile, JSON.stringify(guildConfig, null, 2));
    } catch (error) {
        console.error("Errror saving config", error);
    }
}

function saveSentMemes(guildId, meme) {
    try {
        let currentData = {};
        if (fs.existsSync(sentMemesFile)) {
            currentData = JSON.parse(fs.readFileSync(sentMemesFile, 'utf-8'));
        }

        if (!currentData[guildId]) {
            currentData[guildId] = [];
        }

        // Check if the meme is already in the list
        if (!currentData[guildId].includes(meme)) {
            currentData[guildId].push(meme);
            fs.writeFileSync(sentMemesFile, JSON.stringify(currentData, null, 2));
        } else {
            console.log(`Meme "${meme}" has already been sent for guild ${guildId}.`);
        }

        return currentData;
    } catch (error) {
        console.error('Error saving sent_memes.json:', error);
        return null;
    }
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('start')
        .setDescription('Start posting memes in the assigned channel.')
        .addIntegerOption(option =>
            option.setName('minutes')
                .setDescription('Interval in minutes for posting memes')
                .setRequired(false)
        ),
    async execute(interaction) {
        if (!isUserAllowed(interaction)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
            return;
        }

        let channelAssignments = {};
        if (fs.existsSync(channelAssignmentsFile)) {
            channelAssignments = JSON.parse(fs.readFileSync(channelAssignmentsFile, 'utf-8'));
        }

        const guildId = interaction.guild.id;
        const channelId = interaction.channel.id;
        const minutes = interaction.options.getInteger('minutes') || defaultMemeIntervalMinutes;

        if (!channelAssignments[guildId] || channelAssignments[guildId].meme !== channelId) {
            await interaction.reply('This channel is not assigned for meme posting.');
            return;
        }

        saveGuildConfig(guildId, minutes)

        let currentData = {};
        if (fs.existsSync(sentMemesFile)) {
            currentData = JSON.parse(fs.readFileSync(sentMemesFile, 'utf-8'));
        }

        if (!currentData[guildId]) {
            currentData[guildId] = [];
        }

        const unsentMemes = fs.readdirSync(memesFolder).filter(file => !currentData[guildId].includes(file));

        if (unsentMemes.length === 0) {
            await interaction.reply('All memes have already been sent.');
            return;
        }

        const randomMeme = unsentMemes[Math.floor(Math.random() * unsentMemes.length)];
        const memePath = path.join(memesFolder, randomMeme);

        try {
            console.log(`Sending meme immediately: ${randomMeme}`);
            await interaction.reply({ files: [memePath] });
            saveSentMemes(guildId, randomMeme);
        } catch (error) {
            console.error('Error sending meme:', error);
            await interaction.reply('Failed to send the first meme. Please try again.');
            return;
        }

        if (global.memeIntervals[guildId]) {
            clearInterval(global.memeIntervals[guildId]);
        }

        const interval = setInterval(async () => {
            const unsentMemes = fs.readdirSync(memesFolder).filter(file => !currentData[guildId].includes(file));
        
            if (unsentMemes.length === 0) {
                console.log('No unsent memes left. Stopping...');
                clearInterval(interval);
                delete global.memeIntervals[guildId];
                await interaction.followUp('All memes have been sent. Stopping meme posting.');
                return;
            }
        
            const randomMeme = unsentMemes[Math.floor(Math.random() * unsentMemes.length)];
            const memePath = path.join(memesFolder, randomMeme);
        
            try {
                console.log(`Sending meme: ${randomMeme}`);
                await interaction.channel.send({ files: [memePath] });
                currentData = saveSentMemes(guildId, randomMeme); // Update currentData after saving
            } catch (error) {
                console.error('Error sending meme:', error);
            }
        }, minutes * 60 * 1000);

        global.memeIntervals[guildId] = interval;
    },
};