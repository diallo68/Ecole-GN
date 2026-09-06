-- Table globale, non tenant-scopée : un utilisateur (ex. parent) peut être
-- rattaché à plusieurs établissements via etablissement_utilisateurs.
CREATE TABLE utilisateurs (
    id                  bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom                 varchar(100) NOT NULL,
    prenom              varchar(100) NOT NULL,
    telephone           varchar(20) NOT NULL UNIQUE,
    email               varchar(255) UNIQUE,
    mot_de_passe_hash   varchar(255) NOT NULL,
    langue_preferee     varchar(10) NOT NULL DEFAULT 'fr',
    est_super_admin     boolean NOT NULL DEFAULT false,
    statut              varchar(20) NOT NULL DEFAULT 'actif'
                          CHECK (statut IN ('actif','suspendu')),
    created_at          timestamptz NOT NULL DEFAULT now(),
    updated_at          timestamptz NOT NULL DEFAULT now()
);
