CREATE TABLE inscriptions (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eleve_id            bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    classe_id           bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    annee_scolaire_id   bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    date_inscription    date NOT NULL DEFAULT current_date,
    statut              varchar(20) NOT NULL DEFAULT 'inscrit'
                          CHECK (statut IN ('inscrit','abandonne')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (eleve_id, annee_scolaire_id)
);
CREATE INDEX idx_inscriptions_classe ON inscriptions(classe_id);
CREATE INDEX idx_inscriptions_annee  ON inscriptions(annee_scolaire_id);
