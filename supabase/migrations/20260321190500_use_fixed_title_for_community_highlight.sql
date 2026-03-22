UPDATE public.prompts
SET content = 'Stai scrivendo il corpo di una push notification per StepnOut, un''app che aiuta a uscire dalla comfort zone.

Un membro della community di nome {poster_first_name} ha condiviso questa storia sulla sfida "{challenge_title}": "{post_body}".

Il titolo della notifica sara fisso e gia deciso dal sistema. Tu devi scrivere solo il corpo della push notification in italiano.

Scrivi il corpo:
- max 100 caratteri

Requisiti:
- Il corpo DEVE fare chiaramente riferimento al fatto che {poster_first_name} ha fatto qualcosa o ha condiviso qualcosa (es. "Scopri cosa ha fatto Alex...", "Guarda cosa ha fatto Alex...")
- Rendi l''azione concreta e specifica (non astratta o filosofica)
- NON usare linguaggio motivazionale generico
- NON riassumere in modo vago
- Crea curiosita che invogli ad aprire l''app

Regole:
- Max 1 emoji nel corpo

Output JSON: {"body": "..."}',
    updated_at = now()
WHERE key = 'community_highlight'
  AND locale = 'it';
