# LiveChatGPT-TelegramBot
Telegram Live Chat GPT Bot - a bot based on the GPT model for implementing live chat in Telegram.

# Demo

<img src="https://media.giphy.com/media/JEAfUZXddAM9mNB7cB/giphy.gif" width="50%" height="50%"/><img src="https://media.giphy.com/media/OjACpI4fSRanG5m33e/giphy.gif" width="50%" height="50%"/>

## Note
The bot uses the official OpenAI API. Simulate the live replies on the ChatGPT website, use this bot on Telegram.

## Install:
```bash
# Clone the repository, navigate to the directory, and install.
git clone https://github.com/ZenDarkmaster/LiveChatGPT-TelegramBot.git
cd LiveChatGPT-TelegramBot
npm i

# Copy the .env file from the template.
cp .env.example .env

# Edit the .env file adding your token, API key and Telegram account ID to the whitelist.
nano .env

# Test
node bot.js

# Run in background
npm install -g pm2
pm2 start bot.js
```

## Bot commands:
**/ask**
Ask normal questions or let the bot write code for you.
```
/ask 
Write a simple code example in JavaScript.
```

**/reload**
Reload chat history. The bot will forget everything.
```
/reload
```
