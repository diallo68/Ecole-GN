CREATE TABLE etablissements (
    id          bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nom         varchar(255) NOT NULL,
    cycle       varchar(20) NOT NULL
                  CHECK (cycle IN ('primaire','college','lycee','mixte')),
    adresse     varchar(255),
    ville       varchar(255),
    region      varchar(255),
    logo_url    text,
    statut      varchar(20) NOT NULL DEFAULT 'actif'
                  CHECK (statut IN ('actif','inactif')),
    created_at  timestamptz NOT NULL DEFAULT now(),
    updated_at  timestamptz NOT NULL DEFAULT now()
);
