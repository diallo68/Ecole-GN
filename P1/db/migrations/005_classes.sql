CREATE TABLE classes (
    id                       bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id         bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire_id        bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    niveau                   varchar(30) NOT NULL,
    libelle                  varchar(50) NOT NULL,
    enseignant_titulaire_id  bigint REFERENCES utilisateurs(id) ON DELETE SET NULL,
    effectif_max             integer,
    created_at               timestamptz NOT NULL DEFAULT now(),
    updated_at               timestamptz NOT NULL DEFAULT now(),
    UNIQUE (annee_scolaire_id, libelle)
);
CREATE INDEX idx_classes_etablissement  ON classes(etablissement_id);
CREATE INDEX idx_classes_annee_scolaire ON classes(annee_scolaire_id);
