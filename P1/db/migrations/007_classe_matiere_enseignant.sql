CREATE TABLE classe_matiere_enseignant (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    classe_id      bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    matiere_id     bigint NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
    enseignant_id  bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    coefficient    numeric(3,1),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    UNIQUE (classe_id, matiere_id)
);
CREATE INDEX idx_cme_classe      ON classe_matiere_enseignant(classe_id);
CREATE INDEX idx_cme_enseignant  ON classe_matiere_enseignant(enseignant_id);
