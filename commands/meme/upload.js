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

const { SlashCommandBuilder, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const { isUserAllowed } = require('../../utils/permissions');
const { memesFolder } = require('../../config.json');
const uploadfetch = require('node-fetch');
const { v4: uuidv4 } = require('uuid');
const channelAssignments = require('../../data/channel_assignments.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('upload')
        .setDescription('Upload a meme (image or video) to the memes folder.')
        .addAttachmentOption(option =>
            option.setName('file')
                .setDescription('The meme file to upload')
                .setRequired(true)
        ),
    async execute(interaction) {
        if (!isUserAllowed(interaction)) {
            await interaction.reply({ content: 'You do not have permission to use this command.', flags: 64 });
            return;
        }

        // Defer the reply to prevent interaction expiration
        await interaction.deferReply({ flags: 64 });

        const attachment = interaction.options.getAttachment('file');

        // Validate the file type
        const validExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.mp4', '.webm','.mov', '.webp'];
        const fileExtension = path.extname(attachment.name).toLowerCase();

        if (!validExtensions.includes(fileExtension)) {
            await interaction.editReply({ content: 'Invalid file type. Only images and videos are allowed.' });
            return;
        }

        // Validate file size (e.g., max 8 MB)
        const maxFileSize = 8 * 1024 * 1024; // 8 MB
        if (attachment.size > maxFileSize) {
            await interaction.editReply({ content: 'File size exceeds the 8 MB limit.' });
            return;
        }

        // Ensure the memes folder exists
        if (!fs.existsSync(memesFolder)) {
            fs.mkdirSync(memesFolder, { recursive: true });
        }

        let filePath = path.join(memesFolder, attachment.name);

        // Generate a unique file name if the file already exists
        if (fs.existsSync(filePath)) {
            const baseName = path.basename(attachment.name, fileExtension);
            const uniqueId = uuidv4();
            const uniqueFileName = `${baseName}-${uniqueId}${fileExtension}`;
            filePath = path.join(memesFolder, uniqueFileName);
        }

        // Download and save the file
        try {
            const response = await uploadfetch(attachment.url);
            if (!response.ok) throw new Error('Failed to download the file.');

            const arrayBuffer = await response.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            fs.writeFileSync(filePath, buffer);

            // Send a copy to the authmeme channel
            const guildId = interaction.guild.id;
            const authMemeChannelId = channelAssignments[guildId]?.authmeme;

            if (authMemeChannelId) {
                const authMemeChannel = await interaction.guild.channels.fetch(authMemeChannelId);
                if (authMemeChannel) {
                    const attachment = new AttachmentBuilder(filePath);
            
                    // Create buttons for interaction
                    const row = new ActionRowBuilder().addComponents(
                        new ButtonBuilder()
                            .setCustomId('reject_meme')
                            .setLabel('Reject')
                            .setStyle(ButtonStyle.Danger)
                    );
            
                    const authMessage = await authMemeChannel.send({
                        content: `A meme has been uploaded by ${interaction.user.tag}.`,
                        files: [attachment],
                        components: [row]
                    });
            
                    const filter = i => ['approve_meme', 'reject_meme'].includes(i.customId) && i.user.id === interaction.user.id;
                    const collector = authMessage.createMessageComponentCollector({ filter, time: 60000 }); // 1 hour
            
                    collector.on('collect', async i => {
                        if (i.customId === 'reject_meme') {
                            // Delete the uploaded meme file
                            if (fs.existsSync(filePath)) {
                                fs.unlinkSync(filePath);
                            }
                            await i.reply({ content: 'The meme has been rejected and deleted.', flags: 64});
                            collector.stop();
                        }
                    });
            
                    collector.on('end', collected => {
                        if (collected.size === 0) {
                            console.log('No interaction received within 1 hour.');
                        }
                    });
                }
            }

            await interaction.editReply(`The file "${attachment.name}" has been successfully uploaded to the memes folder and sent for review.`);
        } catch (error) {
            console.error('Error uploading file:', error);
            await interaction.editReply({ content: 'Failed to upload the file. Please try again later.', flags: 64 });
        }
    },
};