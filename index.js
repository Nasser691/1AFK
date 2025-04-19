require('dotenv').config(); // لتحميل المتغيرات من ملف .env
const { Client, Intents } = require('discord.js-selfbot-v13'); // أضف Intents هنا
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

const client = new Client({ intents: [Intents.FLAGS.GUILDS] }); // إضافة الIntents

let isInVoiceChannel = false; // متغير للتأكد من حالة البوت في الروم

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on('messageCreate', async (message) => {
  if (message.author.id !== client.user.id) return; // تأكد من أن الرسالة من البوت نفسه

  const channelId = process.env.CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (message.content.toLowerCase() === '!join' && !isInVoiceChannel) {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Channel not found.');
        return;
      }

      // انضمام البوت إلى الروم فقط إذا لم يكن فيه
      joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        selfMute: true,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });

      isInVoiceChannel = true; // تحديث الحالة
      message.reply('تم دخول الروم!');
    } catch (error) {
      console.error('Error joining voice channel:', error.message);
    }
  } else if (message.content.toLowerCase() === '!leave' && isInVoiceChannel) {
    const connection = client.voice.connections.get(guildId);
    if (connection) {
      connection.disconnect();
      isInVoiceChannel = false; // تحديث الحالة
      message.reply('تم الخروج من الروم!');
    } else {
      message.reply('البوت ليس في الروم!');
    }
  } else {
    message.reply('الأمر غير صالح أو البوت في الروم بالفعل!');
  }
});

client.login(process.env.TOKEN);
