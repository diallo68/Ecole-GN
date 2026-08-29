CREATE TABLE notes (
    id              bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    evaluation_id   bigint NOT NULL REFERENCES evaluations(id) ON DELETE CASCADE,
    eleve_id        bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    valeur          numeric(4,2) CHECK (valeur IS NULL OR (valeur >= 0 AND valeur <= 20)),
    appreciation    text,
    saisie_par      bigint NOT NULL REFERENCES utilisateurs(id) ON DELETE RESTRICT,
    sync_uuid       uuid NOT NULL DEFAULT gen_random_uuid() UNIQUE,
    statut_sync     varchar(20) NOT NULL DEFAULT 'synced'
                      CHECK (statut_sync IN ('synced','pending')),
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now(),
    UNIQUE (evaluation_id, eleve_id)
);
CREATE INDEX idx_notes_eleve ON notes(eleve_id);
