require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, getVoiceConnection } = require('@discordjs/voice');
const express = require('express');
const app = express();

const port = process.env.PORT || 3000;
const client = new Client();
let isInVoiceChannel = false;

// سيرفر وهمي لـ Render
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
  // تجاهل الردود على الردود أو الرسائل من غير الحساب نفسه
  if (message.author.id !== client.user.id || message.reference) return;

  const channelId = process.env.CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (!channelId || !guildId) {
    console.error('⚠️ تأكد من تعيين CHANNEL_ID و GUILD_ID في .env');
    return;
  }

  // أمر الدخول
  if (message.content === '!join' && !isInVoiceChannel) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) return console.log('❌ لم يتم العثور على الروم');

      joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        selfMute: true,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      isInVoiceChannel = true;
      message.channel.send('✅ تم دخول الروم');

    } catch (err) {
      console.error('خطأ أثناء دخول الروم:', err);
      message.channel.send('❌ فشل في دخول الروم');
    }
  }

  // أمر الخروج
  else if (message.content === '!leave' && isInVoiceChannel) {
    try {
      const connection = getVoiceConnection(guildId);
      if (connection) {
        connection.destroy();
        isInVoiceChannel = false;
        message.channel.send('✅ تم الخروج من الروم');
      } else {
        message.channel.send('❌ لا يوجد اتصال صوتي');
      }
    } catch (err) {
      console.error('خطأ أثناء الخروج من الروم:', err);
      message.channel.send('❌ فشل في الخروج من الروم');
    }
  }
});
client.login(process.env.TOKEN);
