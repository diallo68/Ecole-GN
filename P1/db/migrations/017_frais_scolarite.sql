CREATE TABLE frais_scolarite (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id    bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    annee_scolaire_id   bigint NOT NULL REFERENCES annees_scolaires(id) ON DELETE CASCADE,
    niveau              varchar(30) NOT NULL,
    montant_total       numeric(10,2) NOT NULL CHECK (montant_total >= 0),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now(),
    UNIQUE (annee_scolaire_id, niveau)
);
CREATE INDEX idx_frais_etablissement ON frais_scolarite(etablissement_id);
