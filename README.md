# 🚀 Meme Spawner! 😂
This is a Discord bot for sharing memes and bringing fun to your server. It's fully open-sourced under the **GNU GPL v3** license.

### ⚙️ Available Commands:

* `/upload`: Your dankest memes with the server!
* `/start`: Initiate the automatic meme spawning in the designated channel.
* `/stop`: Halt the automatic meme spawning.
* `/setchannel`: Designate the specific channel where the bot will post memes.
* `/fetchmeme`: Get a random meme on demand from reddit (Not very good)!
* `/forcememe`: Get a random meme from your meme folder.
* `/info`: Display information about the bot and creator (ME C:).


## Setup

Follow these steps to set up the Meme Spawner bot:

1.  **📥 Clone the Repository:**
    ```bash
    git clone [https://github.com/tigerjess12/Meme-Spawner.git](https://github.com/tigerjess12/Meme-Spawner.git)
    cd Meme-Spawner
    ```

2. **Install Dependencies**
    ```bash
    npm install
    ```

3.  **⚙️ Configure the Bot:**
    Open the `config.json` file and update the following crucial fields:
    * `token`: Your Discord bot's **private token**. Keep this secret!
    * `clientId`: Your bot's **Application ID**. You can find this in your Discord Developer Portal.
    * `ownerID`: Your **Discord user ID**. This gives you administrative control.
    * `guildId`: Your **Guild ID**.
    * *Optional:* Explore other fields to customize the bot's behavior to your liking.

4. **Permissions**
    in
      ```bash
      settings/permissions.json
      ```
      You can change the permssions here or with commands in chat

5.  **🚀 Deploy Commands:**
    Run this command in your terminal to register the bot's commands with Discord:
    ```bash
    node deploy-commands.js
    ```
    
6.  **🚦 Start the Bot:**
    Launch the bot!
    ```bash
    node index.js
    ```


## 📜 License

This project is proudly licensed under the **GNU General Public License v3.0**. For complete details, please refer to the [LICENSE](LICENSE) file.

## 📢 Important Redistribution Notice

The `info` file/command included with this bot **must remain intact and unmodified** in all redistributions. This ensures proper credit to the original creator. Thank you for respecting the open-source spirit!
