require('dotenv').config(); // لتحميل المتغيرات من ملف .env
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel, VoiceConnectionStatus } = require('@discordjs/voice');
const express = require('express'); // <-- إضافة Express
const app = express();
const port = process.env.PORT || 3000;

// سيرفر وهمي لـ Render
app.get('/', (req, res) => {
  res.send('Bot is running!');
});
app.listen(port, () => {
  console.log(`Express server running on port ${port}`);
});

const client = new Client();

let connection; // لتخزين الاتصال بالروم

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);

  const channelId = process.env.CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (!channelId || !guildId) {
    console.error('Missing CHANNEL_ID or GUILD_ID in .env file.');
    return;
  }

  // دالة لدخول الروم
  const joinChannel = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Channel not found.');
        return;
      }

      connection = joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        selfMute: true,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      connection.on(VoiceConnectionStatus.Disconnected, () => {
        console.log('تم فصل الاتصال من الروم');
        connection = null; // إعادة تعيين الاتصال
      });

      console.log('تم دخول البوت إلى الروم');
    } catch (error) {
      console.error('Error joining voice channel:', error.message);
    }
  };

  // دالة للخروج من الروم
  const leaveChannel = () => {
    if (connection) {
      connection.disconnect(); // فصل الاتصال
      console.log('تم خروج البوت من الروم');
    } else {
      console.log('البوت ليس في الروم.');
    }
  };

  // أوامر للتحكم في دخول وخروج البوت من الروم
  client.on('message', async (message) => {
    if (message.content === '!join') {
      await joinChannel(); // دخول الروم عند كتابة !join
    } else if (message.content === '!leave') {
      leaveChannel(); // خروج البوت عند كتابة !leave
    }
  });
});

client.login(process.env.TOKEN);
