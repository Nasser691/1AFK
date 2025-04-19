require('dotenv').config(); // لتحميل المتغيرات من ملف .env
const { Client } = require('discord.js-selfbot-v13');
const { joinVoiceChannel } = require('@discordjs/voice');
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

client.on('ready', async () => {
  console.log(`${client.user.username} is ready!`);

  const channelId = process.env.CHANNEL_ID;
  const guildId = process.env.GUILD_ID;

  if (!channelId || !guildId) {
    console.error('Missing CHANNEL_ID or GUILD_ID in .env file.');
    return;
  }

  // تأخير دخول الروم لمدة دقيقة بعد بدء البوت
  setTimeout(async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Channel not found.');
        return;
      }

      // انضمام البوت إلى الروم بعد التأخير
      joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        selfMute: true,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      console.log('تم دخول الروم بعد دقيقة.');

    } catch (error) {
      console.error('Error joining voice channel:', error.message);
    }
  }, 60000); // تأخير لمدة 60 ثانية (دقيقة واحدة)
});

client.login(process.env.TOKEN);
