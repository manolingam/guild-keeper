const express = require('express');

const HIREUS_V2_ROUTER = express.Router();

HIREUS_V2_ROUTER.post('/consultation', async (req, res) => {
  let {
    name,
    email,
    bio,
    telegramHandle,
    discordHandle,
    twitterHandle,
    contactType,
    projectType,
    projectSpecs,
    specsLink,
    projectName,
    projectDescription,
    servicesRequired,
    selectedDay,
    budgetRange,
    specificInfo,
    priority,
    transaction_hash
  } = req.body;

  if (selectedDay === '') {
    selectedDay = new Date().toLocaleDateString();
  } else {
    selectedDay = new Date(selectedDay).toLocaleDateString();
  }

  await req.RAID_CENTRAL_V2_BASE('Raids v2').create(
    [
      {
        fields: {
          Name: name,
          Email: email,
          Bio: bio,
          'Telegram Handle': telegramHandle,
          'Discord Handle': discordHandle,
          'Twitter Handle': twitterHandle,
          'Preferred Contact Method': contactType,
          'Project Type': projectType,
          'Project Specs': projectSpecs,
          'Specs Link': specsLink,
          'Project Name': projectName,
          'Project Description': projectDescription,
          'Services Required': servicesRequired,
          'Expected Deadline': selectedDay,
          'Budget Range': budgetRange,
          'Additional Information': specificInfo,
          Priorities: priority,
          'Consultation Hash': transaction_hash
        }
      }
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        return res.json('ERROR');
      }
      records.forEach(function (record) {
        let id = record.getId();
        return res.json(id);
      });
    }
  );

  try {
    let Discord = req.DISCORD;
    let embed = new Discord.MessageEmbed()
      .setColor('#ff3864')
      .setTitle(
        transaction_hash !== 'not paid'
          ? 'Paid Submission'
          : 'Unpaid Submission'
      )
      .setURL(
        transaction_hash !== 'not paid'
          ? `https://etherscan.io/tx/${transaction_hash}`
          : null
      )
      .setAuthor(name)
      .addFields(
        {
          name: 'Project Name',
          value: projectName
        },
        {
          name: 'Project Type',
          value: projectType
        },
        {
          name: 'Specs Link',
          value: specsLink ? specsLink : 'None Provided'
        },

        {
          name: 'Budget Range',
          value: budgetRange
        },
        {
          name: 'Services Required',
          value: servicesRequired
        },
        {
          name: 'Priority',
          value: priority
        },
        {
          name: 'Email',
          value: email
        },
        {
          name: 'Discord',
          value: discordHandle || 'NaN'
        },
        {
          name: 'Twitter Handle',
          value: twitterHandle || 'NaN'
        },
        {
          name: 'Preffered Contact Channel',
          value: contactType
        }
      )
      .setTimestamp();

    req.CLIENT.guilds.cache
      .get(process.env.GUILD_ID)
      .channels.cache.get(process.env.CLIENT_SUBMISSION_CHANNEL_ID)
      .send(embed);
  } catch (err) {
    console.log('Error', err);

    let Discord = req.DISCORD;
    let embed = new Discord.MessageEmbed()
      .setColor('#ff3864')
      .setTitle(
        'Something went wrong with the recent client submission notification. Check airtable for data.'
      );

    req.CLIENT.guilds.cache
      .get(process.env.GUILD_ID)
      .channels.cache.get(process.env.BOT_CENTER_CHANNEL_ID)
      .send(embed);
  }
});

HIREUS_V2_ROUTER.post('/feedback', async (req, res) => {
  let { raidID, feedbackOne, feedbackTwo, rating } = req.body;

  await req.RAID_CENTRAL_V2_BASE('Raids v2').update(
    [
      {
        id: raidID,
        fields: {
          'How did you hear about us?': feedbackOne,
          'What can be better?': feedbackTwo,
          Rating: Number(rating)
        }
      }
    ],
    function (err, records) {
      if (err) {
        console.error(err);
        res.json('ERROR');
        return;
      }
      records.forEach(function (record) {
        res.json('SUCCESS');
      });
    }
  );
});

module.exports = HIREUS_V2_ROUTER;
