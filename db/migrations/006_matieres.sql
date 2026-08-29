CREATE TABLE matieres (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id    bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    nom                 varchar(100) NOT NULL,
    coefficient_defaut  numeric(3,1) NOT NULL DEFAULT 1,
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (etablissement_id, nom)
);
CREATE INDEX idx_matieres_etablissement ON matieres(etablissement_id);
