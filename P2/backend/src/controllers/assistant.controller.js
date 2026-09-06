const Anthropic = require('@anthropic-ai/sdk');
const config = require('../config');

// Assistant d'accueil/orientation affiché sur la page d'accueil — aide les
// visiteurs à s'orienter (matière, niveau, inscription) sans jamais faire
// le travail scolaire à leur place (ce n'est pas un tuteur IA).
const SYSTEM_PROMPT = `Tu es l'assistant d'accueil de Gandal, une plateforme guinéenne de soutien scolaire (primaire, collège, lycée) à Conakry et dans toute la Guinée.

Ton rôle : aider les visiteurs du site à s'orienter — tu n'es PAS un tuteur et tu ne réponds pas aux exercices scolaires.
Tu peux :
- Expliquer ce qu'est Gandal (mise en relation avec des enseignants pour des cours particuliers en présentiel ou en ligne, quiz gratuits d'auto-évaluation).
- Aider à choisir une matière (Mathématiques, Français, Sciences Physiques, SVT) et un niveau (primaire, collège, lycée).
- Expliquer comment s'inscrire, réserver un cours avec un enseignant, ou faire un quiz.
- Orienter vers les bonnes pages : "Trouver un enseignant" (/repetiteurs), "Faire un quiz" (/quiz), "S'inscrire" (/register).

Réponds toujours en français, de façon brève, chaleureuse et concrète (2 à 4 phrases maximum). Si on te pose une question de cours ou un exercice à résoudre, explique poliment que ce n'est pas ton rôle et invite la personne à réserver un enseignant ou à consulter "Mes cours"/"Mes exercices" une fois inscrite. Ne invente jamais de prix précis, de nom d'enseignant, ou de fonctionnalité qui n'existe pas sur la plateforme.`;

let client = null;
function getClient() {
  if (!config.ANTHROPIC_API_KEY) return null;
  if (!client) client = new Anthropic({ apiKey: config.ANTHROPIC_API_KEY });
  return client;
}

const assistantController = {
  async chat(req, res) {
    const anthropic = getClient();
    if (!anthropic) {
      return res.status(503).json({ error: "Assistant indisponible : ANTHROPIC_API_KEY non configurée." });
    }
    try {
      const { messages } = req.body;
      if (!Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: 'messages requis' });
      }
      // Historique et taille de message bornés pour contenir les coûts/abus.
      const trimmed = messages.slice(-10).map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: String(m.content || '').slice(0, 2000),
      }));

      const response = await anthropic.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 400,
        system: SYSTEM_PROMPT,
        messages: trimmed,
      });

      const text = response.content.find(b => b.type === 'text')?.text || '';
      res.json({ reply: text });
    } catch (err) {
      res.status(500).json({ error: "Erreur de l'assistant, réessaie dans un instant." });
    }
  },
};

module.exports = assistantController;
