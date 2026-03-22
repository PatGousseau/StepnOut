UPDATE public.prompts
SET content = 'Stai scrivendo una push notification per StepnOut, un''app che aiuta a uscire dalla comfort zone.

Un membro della community di nome {poster_first_name} ha condiviso questa storia sulla sfida "{challenge_title}": "{post_body}".

Scrivi una push notification in italiano:
- Titolo: max 40 caratteri
- Corpo: max 100 caratteri

Requisiti:
- Il titolo deve essere coinvolgente ed emotivamente rilevante
- Il corpo DEVE fare chiaramente riferimento al fatto che {poster_first_name} ha fatto qualcosa o ha condiviso qualcosa (es. “Scopri cosa ha fatto Alex…”, “Guarda cosa ha fatto Alex…”)
- Rendi l’azione concreta e specifica (non astratta o filosofica)
- NON usare linguaggio motivazionale generico
- NON riassumere in modo vago
- Crea curiosità che invogli ad aprire l’app

Regole:
- Nessuna emoji nel titolo
- Max 1 emoji nel corpo

Output JSON: {"title": "...", "body": "..."}',
    updated_at = now()
WHERE key = 'community_highlight'
  AND locale = 'it';
