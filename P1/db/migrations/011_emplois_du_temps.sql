CREATE TABLE emplois_du_temps (
    id             bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    classe_id      bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    matiere_id     bigint NOT NULL REFERENCES matieres(id) ON DELETE CASCADE,
    enseignant_id  bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    jour_semaine   smallint NOT NULL CHECK (jour_semaine BETWEEN 1 AND 7),
    heure_debut    time NOT NULL,
    heure_fin      time NOT NULL,
    salle          varchar(50),
    created_at     timestamptz NOT NULL DEFAULT now(),
    updated_at     timestamptz NOT NULL DEFAULT now(),
    CHECK (heure_fin > heure_debut)
);
CREATE INDEX idx_edt_classe     ON emplois_du_temps(classe_id);
CREATE INDEX idx_edt_enseignant ON emplois_du_temps(enseignant_id);
