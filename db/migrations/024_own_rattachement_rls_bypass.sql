-- Bug trouvé en testant le middleware applicatif (pas seulement en psql
-- manuel) : pour savoir SI un utilisateur a accès à un établissement, il
-- faut interroger etablissement_utilisateurs — mais cette table est déjà
-- protégée par la policy tenant_isolation (022), qui exige
-- app.current_etablissement_id. Cette variable n'est justement pas encore
-- posée à ce stade de la requête : c'est elle qu'on est en train de
-- déterminer. Sans correctif, la vérification d'accès renvoie toujours
-- 0 ligne et bloque même l'utilisateur légitime.
--
-- Correctif : une policy PERMISSIVE (OR, pas AND, avec tenant_isolation)
-- qui laisse un utilisateur voir ses PROPRES lignes de rattachement, quel
-- que soit le contexte tenant courant. Ce n'est pas une élévation de
-- privilège : consulter ses propres rattachements est toujours légitime,
-- c'est précisément le fait qui permet de déterminer le contexte.
--
-- Le middleware pose app.current_utilisateur_id juste après authentification,
-- avant toute résolution de contexte établissement (voir
-- ResolveEtablissementContext::handle).

CREATE POLICY own_rattachement_visible ON etablissement_utilisateurs
  AS PERMISSIVE
  USING (utilisateur_id = current_setting('app.current_utilisateur_id', true)::bigint);
