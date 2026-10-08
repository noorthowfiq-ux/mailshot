const nodemailer = require('nodemailer');
const Campaign = require('../models/Campaign');
const transport = require('../config/mailer');


const DELAY_MS = Number(process.env.SEND_DELAY_MS || 400);

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const escapeHtml = (s) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

async function processCampaign(campaignId) {
  const campaign = await Campaign.findById(campaignId);
  if (!campaign || campaign.status !== 'sending') return;

  const html =
    `<pre style="font:14px/1.6 Helvetica,Arial,sans-serif;white-space:pre-wrap">` +
    escapeHtml(campaign.body) + `</pre>`;

  for (const r of campaign.recipients) {
    if (r.status !== 'queued') continue;
    try {
      const info = await transport.sendMail({
        from: process.env.MAIL_FROM,
        to: r.email,
        subject: campaign.subject,
        text: campaign.body,
        html,
      });
      r.status = 'sent';
      r.sentAt = new Date();
      r.previewUrl = nodemailer.getTestMessageUrl(info) || undefined;
    } catch (err) {
      r.status = 'failed';
      r.error = err.message;
    }
   
    await campaign.save();
    await sleep(DELAY_MS);
  }

  campaign.sentCount = campaign.recipients.filter((r) => r.status === 'sent').length;
  campaign.failedCount = campaign.recipients.filter((r) => r.status === 'failed').length;
  campaign.status =
    campaign.failedCount === 0 ? 'sent'
    : campaign.sentCount === 0 ? 'failed'
    : 'partial';

  await campaign.save();
  console.log(`[mailer] campaign ${campaignId} finished — ${campaign.status}`);
}



module.exports = { processCampaign };