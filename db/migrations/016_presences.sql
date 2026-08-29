CREATE TABLE presences (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eleve_id        bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    classe_id       bigint NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    date            date NOT NULL,
    statut          varchar(20) NOT NULL
                      CHECK (statut IN ('present','absent','retard','excuse')),
    saisi_par       bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    sync_uuid       uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    statut_sync     varchar(20) NOT NULL DEFAULT 'synced'
                      CHECK (statut_sync IN ('synced','pending')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (eleve_id, classe_id, date)
);
CREATE INDEX idx_presences_classe_date ON presences(classe_id, date);
