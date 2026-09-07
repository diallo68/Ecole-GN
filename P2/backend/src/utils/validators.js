const Joi = require('joi');
const { NIVEAUX_VALUES } = require('./niveaux');

// Inscription/connexion par email uniquement sur ce projet (pas de SMS).
const sendCode = Joi.object({
  email:  Joi.string().email().required(),
  prenom: Joi.string().trim().min(2).max(50).required(),
});

const register = Joi.object({
  prenom:        Joi.string().trim().min(2).max(50).required(),
  nom:           Joi.string().trim().max(50).allow('').optional(),
  phone:         Joi.string().trim().min(6).max(20).required(), // simple champ de contact, pas un identifiant
  photo:         Joi.string().uri({ scheme: ['https'] }).allow('').optional(),
  pieceIdentite: Joi.string().uri({ scheme: ['https'] }).allow('').optional(),
  email:    Joi.string().email().required(),
  code:     Joi.string().length(6).required(),
  password: Joi.string().min(8).required(),
  city:     Joi.string().trim().max(100).optional(),
  role:     Joi.string().valid('eleve', 'parent', 'repetiteur').required(),
  niveau:   Joi.when('role', { is: 'eleve', then: Joi.string().valid(...NIVEAUX_VALUES).required(), otherwise: Joi.forbidden() }),
});

const login = Joi.object({
  email:    Joi.string().email().required(),
  password: Joi.string().required(),
});

// Complète le profil après inscription — photo et pièce d'identité restent
// optionnelles pour le moment (pas de vérification d'identité obligatoire).
const updateMe = Joi.object({
  photo:         Joi.string().uri({ scheme: ['https'] }).allow('').optional(),
  pieceIdentite: Joi.string().uri({ scheme: ['https'] }).allow('').optional(),
});

const updateRepetiteurProfile = Joi.object({
  bio:          Joi.string().max(1000).allow('').optional(),
  matieres:     Joi.array().items(Joi.string()).optional(),
  niveaux:      Joi.array().items(Joi.string().valid(...NIVEAUX_VALUES)).optional(),
  tarifHoraire: Joi.number().min(0).optional(),
  disponible:   Joi.boolean().optional(),
  avatar:       Joi.string().uri({ scheme: ['https'] }).allow('').optional(),
});

function validate(schema) {
  return (req, res, next) => {
    const { error, value } = schema.validate(req.body, { abortEarly: false, stripUnknown: true, convert: true });
    if (error) {
      return res.status(400).json({ error: 'Données invalides', details: error.details.map(d => d.message).join(' | ') });
    }
    req.body = value;
    next();
  };
}

module.exports = {
  schemas: { sendCode, register, login, updateMe, updateRepetiteurProfile },
  validate,
};
