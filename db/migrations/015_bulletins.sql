CREATE TABLE bulletins (
    id                      bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    eleve_id                bigint NOT NULL REFERENCES eleves(id) ON DELETE CASCADE,
    periode_id              bigint NOT NULL REFERENCES periodes_evaluation(id) ON DELETE CASCADE,
    moyenne_generale        numeric(4,2),
    rang                    integer,
    effectif_classe         integer,
    appreciation_generale   text,
    pdf_url                 text,
    statut                  varchar(20) NOT NULL DEFAULT 'brouillon'
                              CHECK (statut IN ('brouillon','valide','publie')),
    valide_par              bigint REFERENCES utilisateurs(id) ON DELETE SET NULL,
    genere_le               timestamptz,
    created_at              timestamptz NOT NULL DEFAULT now(),
    updated_at              timestamptz NOT NULL DEFAULT now(),
    UNIQUE (eleve_id, periode_id)
);
CREATE INDEX idx_bulletins_periode ON bulletins(periode_id);
