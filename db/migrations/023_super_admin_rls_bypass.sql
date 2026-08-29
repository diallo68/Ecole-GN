-- La policy tenant_isolation sur `etablissements` (022) exige un
-- app.current_etablissement_id posé — impossible par construction pour
-- l'endpoint de listing global (GET/POST /etablissements), qui n'a pas
-- d'établissement précis dans son URL. Un super-admin plateforme doit
-- pourtant pouvoir lister/créer des établissements.
--
-- Solution : une policy PERMISSIVE additionnelle (les policies RLS
-- permissives se combinent en OR, pas en AND) qui laisse passer une ligne
-- si la session est marquée super-admin. Le middleware applicatif
-- (ResolveEtablissementContext) pose app.is_super_admin après avoir vérifié
-- utilisateurs.est_super_admin — la RLS ne fait ici que refléter une
-- décision déjà prise en application, elle n'accorde aucun privilège par
-- elle-même.
--
-- Scopée à `etablissements` uniquement : tout le reste (classes, eleves,
-- notes, ...) continue d'exiger un app.current_etablissement_id explicite,
-- y compris pour un super-admin — voir ResolveEtablissementContext, qui
-- résout etablissement_id normalement dès que la route en porte un
-- (POST /etablissements/{etablissementId}/utilisateurs, etc.).

CREATE POLICY super_admin_bypass ON etablissements
  AS PERMISSIVE
  USING (current_setting('app.is_super_admin', true) = 'true');
