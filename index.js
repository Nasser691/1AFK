require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');
const app = express();
const port = process.env.PORT || 3000;

app.get('/', (req, res) => {
  res.send('Bot is running!');
});
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

const client = new Client();

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);

  const channelId = process.env.CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (!channelId || !guildId) {
    console.error('Missing CHANNEL_ID or GUILD_ID in .env file.');
    return;
  }

  // كل دقيقة نفحص إذا داخل الروم ولا لا
  setInterval(async () => {
    try {
      const connection = getVoiceConnection(guildId);

      if (connection) {
        // إذا البوت متصل بالفعل، لا تسوي شيء
        console.log('الحساب متصل بالفعل في الروم');
        return;
      }

      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Channel not found.');
        return;
      }

      joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        selfMute: true,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      console.log('✅ تم إدخال الحساب إلى الروم');
    } catch (error) {
      console.error('Error joining voice channel:', error.message);
    }
  }, 60000); // كل 60 ثانية
});

client.login(process.env.TOKEN);
