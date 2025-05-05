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


const postedMemesFile = path.join(__dirname, '../../data/posted_reddit_memes.json');
let postedMemes = new Set();

if (fs.existsSync(postedMemesFile)) {
    try {
        postedMemes = new Set(JSON.parse(fs.readFileSync(postedMemesFile, 'utf-8')));
    } catch (error) {
        console.warn('Error decoding posted_reddit_memes.json. Starting with an empty set.');
    }
}

function savePostedMemes() {
    fs.writeFileSync(postedMemesFile, JSON.stringify([...postedMemes]));
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fetchmeme')
        .setDescription('Fetch a meme from Reddit.')
        .addStringOption(option =>
            option.setName('subreddit')
                .setDescription('The subreddit to fetch memes from')
                .setRequired(false)
        ),
        async execute(interaction) {
            const subreddit = interaction.options.getString('subreddit') || '';
            const url = subreddit ? `https://meme-api.com/gimme/${subreddit}` : 'https://meme-api.com/gimme';
        
            try {
                await interaction.deferReply();


                while (true) {
                    const response = await fetch(url);
                    if (!response.ok) throw new Error('Failed to fetch meme.');
                    const data = await response.json();
        
                    const memeUrl = data.url;
                    const nsfw = data.nsfw;
        
                    if (!nsfw && !postedMemes.has(memeUrl)) {
                        postedMemes.add(memeUrl);
                        savePostedMemes();
                        await interaction.editReply(`Here is your meme: ${memeUrl} \nSubreddit: ${data.subreddit}`);
                        break;
                    }
                }
            } catch (error) {
                console.error(error);
                await interaction.editReply('Failed to fetch a meme. Please try again later.');
            }
        },
};