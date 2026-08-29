CREATE TABLE evaluations (
    id                              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    classe_matiere_enseignant_id    bigint NOT NULL REFERENCES classe_matiere_enseignant(id) ON DELETE CASCADE,
    periode_id                      bigint NOT NULL REFERENCES periodes_evaluation(id) ON DELETE CASCADE,
    type                            varchar(20) NOT NULL
                                      CHECK (type IN ('devoir','composition','interrogation')),
    libelle                         varchar(100) NOT NULL,
    coefficient                     numeric(3,1) NOT NULL DEFAULT 1,
    date_evaluation                 date NOT NULL,
    created_at                      timestamptz NOT NULL DEFAULT now(),
    updated_at                      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_evaluations_cme     ON evaluations(classe_matiere_enseignant_id);
CREATE INDEX idx_evaluations_periode ON evaluations(periode_id);
