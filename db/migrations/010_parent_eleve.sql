-- Table de liaison many-to-many. Volontairement SANS colonne
-- etablissement_id : un parent peut être lié à des enfants scolarisés
-- dans des établissements différents (cahier des charges §3). Voir
-- 022_rls_policies.sql pour la note sur son exclusion du périmètre RLS.
CREATE TABLE parent_eleve (
    id                      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    utilisateur_id          bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE CASCADE,
    eleve_id                bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    lien                    varchar(20) NOT NULL
                              CHECK (lien IN ('pere','mere','tuteur_legal','autre')),
    est_contact_principal   boolean NOT NULL DEFAULT false,
    created_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (utilisateur_id, eleve_id)
);
CREATE INDEX idx_parent_eleve_utilisateur ON parent_eleve(utilisateur_id);
CREATE INDEX idx_parent_eleve_eleve       ON parent_eleve(eleve_id);
