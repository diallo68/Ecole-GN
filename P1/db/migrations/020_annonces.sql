CREATE TABLE annonces (
    id                bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    etablissement_id  bigint NOT NULL REFERENCES etablissements(id) ON DELETE CASCADE,
    auteur_id         bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    titre             varchar(150) NOT NULL,
    contenu           text NOT NULL,
    cible_type        varchar(20) NOT NULL CHECK (cible_type IN ('etablissement','classe')),
    cible_id          bigint,
    publiee_le        timestamptz NOT NULL DEFAULT now(),
    created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_annonces_etablissement ON annonces(etablissement_id);
