require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const client = new Client();

app.get('/', (req, res) => {
  res.send('Bot is running!');
});
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

client.on('ready', () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.id !== client.user.id) return;

  const channelId = process.env.CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (!channelId || !guildId) {
    console.error('⚠️ تأكد من .env');
    return;
  }

  const connection = getVoiceConnection(guildId);

  if (message.content === '!join') {
    if (connection) {
      message.channel.send('❌ البوت داخل الروم فعليًا!');
    } else {
      try {
        const channel = await client.channels.fetch(channelId);
        joinVoiceChannel({
          channelId: channel.id,
          guildId: guildId,
          selfMute: true,
          selfDeaf: true,
          adapterCreator: channel.guild.voiceAdapterCreator,
        });
        message.channel.send('✅ تم دخول الروم بنجاح');
      } catch (err) {
        console.error(err);
        message.channel.send('❌ فشل في دخول الروم');
      }
    }
  }

  if (message.content === '!leave') {
    if (connection) {
      connection.destroy();
      message.channel.send('✅ تم الخروج من الروم');
    } else {
      message.channel.send('❌ البوت ليس في أي روم!');
    }
  }
});

client.login(process.env.TOKEN);
