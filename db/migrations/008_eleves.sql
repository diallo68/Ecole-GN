CREATE TABLE eleves (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id  bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    matricule         varchar(30) NOT NULL,
    nom               varchar(100) NOT NULL,
    prenom            varchar(100) NOT NULL,
    date_naissance    date,
    sexe              varchar(1) CHECK (sexe IN ('M','F')),
    photo_url         text,
    statut            varchar(20) NOT NULL DEFAULT 'actif'
                        CHECK (statut IN ('actif','inactif','diplome')),
    created_at        timestamptz NOT NULL DEFAULT now(),
    updated_at        timestamptz NOT NULL DEFAULT now(),
    UNIQUE (etablissement_id, matricule)
);
CREATE INDEX idx_eleves_etablissement ON eleves(etablissement_id);
CREATE INDEX idx_eleves_nom_prenom    ON eleves(nom, prenom);
