import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const aiModerate = async (req, res, next) => {
  const content = req.body.content || '';
  if (!content || content.length < 5) return next();

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 100,
      messages: [{
        role: 'user',
        content: `You are a content moderator. Is this post appropriate? Reply JSON only: {"safe": true/false, "reason": "brief reason"}\n\nPost: "${content.substring(0, 500)}"`,
      }],
    });

    const result = JSON.parse(response.content[0].text);
    if (!result.safe) return res.status(400).json({ message: `Post rejected: ${result.reason}` });
    return next();
  } catch {
    return next();
  }
};

export default aiModerate;
