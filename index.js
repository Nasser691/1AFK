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

  // التحقق من دخول الحساب الشخصي أولًا
  const checkIfInVoiceChannel = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Channel not found.');
        return false;
      }

      const member = channel.guild.members.cache.get(client.user.id);
      if (member && member.voice.channel) {
        console.log('البوت في الروم الآن');
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error checking voice channel:', error.message);
      return false;
    }
  };

  // التأخير بين دخول البوت أو الحساب الشخصي
  const joinChannel = async () => {
    try {
      const channel = await client.channels.fetch(channelId);
      if (!channel) {
        console.error('Channel not found.');
        return;
      }

      // انضمام البوت إلى الروم
      joinVoiceChannel({
        channelId: channel.id,
        guildId: guildId,
        selfMute: true,
        selfDeaf: true,
        adapterCreator: channel.guild.voiceAdapterCreator,
      });
      console.log('تم دخول البوت إلى الروم');
    } catch (error) {
      console.error('Error joining voice channel:', error.message);
    }
  };

  // إذا كنت في الروم، انتظر دقيقة ثم يدخل البوت
  setTimeout(async () => {
    if (await checkIfInVoiceChannel()) {
      console.log('انت في الروم الآن، سيتم تأخير دخول البوت لمدة دقيقة.');
      setTimeout(joinChannel, 60000); // تأخير لمدة 60 ثانية (دقيقة واحدة) بعد دخولك
    } else {
      console.log('البوت ليس في الروم، سيتم دخول البوت على الفور');
      joinChannel(); // دخول البوت مباشرة
    }
  }, 1000); // هذا التأخير الأول قبل أن يبدأ التحقق
});

client.login(process.env.TOKEN);
