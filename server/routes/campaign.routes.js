const router = require('express').Router();
const Campaign = require('../models/Campaign');
const { processCampaign } = require('../services/campaignService');
const requireAuth = require('../middleware/auth');

router.use(requireAuth);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_RECIPIENTS = 100;


router.post('/', async (req, res) => {
  try {
    const { subject, body, recipients } = req.body || {};

    if (!subject || !subject.trim() || !body || !body.trim()) {
      return res.status(400).json({ message: 'Subject and body are required.' });
    }

    const list = [...new Set(
      (Array.isArray(recipients) ? recipients : [])
        .map((e) => String(e).trim().toLowerCase())
        .filter(Boolean)
    )];

    if (list.length === 0) {
      return res.status(400).json({ message: 'Add at least one recipient.' });
    }
    if (list.length > MAX_RECIPIENTS) {
      return res.status(400).json({ message: `Max ${MAX_RECIPIENTS} recipients per campaign.` });
    }
    const invalid = list.filter((e) => !EMAIL_RE.test(e));
    if (invalid.length) {
      return res.status(400).json({ message: `These don't look like emails: ${invalid.join(', ')}` });
    }

    const campaign = await Campaign.create({
      subject: subject.trim(),
      body,
      totalCount: list.length,
      recipients: list.map((email) => ({ email })),
    });

    
    processCampaign(campaign._id).catch((err) => {
      console.error('[mailer] processor crashed:', err);
    });

    res.status(201).json({ id: campaign._id, total: campaign.totalCount });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Could not create the campaign.' });
  }
});


router.get('/', async (req, res) => {
  try {
    const campaigns = await Campaign.find({})
      .sort({ createdAt: -1 })
      .limit(50)
      .select('subject status totalCount sentCount failedCount createdAt');
    res.json(campaigns);
  } catch (err) {
    res.status(500).json({ message: 'Could not load history.' });
  }
});


router.get('/:id', async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) return res.status(404).json({ message: 'Campaign not found.' });
    res.json(campaign);
  } catch (err) {
    res.status(400).json({ message: 'Campaign not found.' });
  }
});

module.exports = router;