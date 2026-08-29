CREATE TABLE periodes_evaluation (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id    bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire_id   bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    libelle             varchar(30) NOT NULL,
    date_debut          date NOT NULL,
    date_fin            date NOT NULL,
    statut              varchar(20) NOT NULL DEFAULT 'en_cours'
                          CHECK (statut IN ('en_cours','cloturee')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (annee_scolaire_id, libelle),
    CHECK (date_fin > date_debut)
);
CREATE INDEX idx_periodes_etablissement ON periodes_evaluation(etablissement_id);
