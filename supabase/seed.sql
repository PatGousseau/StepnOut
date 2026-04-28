-- Seed data for local development
-- Run with: supabase db reset

-- =============================================================================
-- USERS (auth.users + profiles)
-- Password for all test users: "password123"
-- Note: A trigger auto-creates profiles when auth.users are inserted
-- =============================================================================

-- Create auth users (trigger will auto-create basic profiles)
-- Note: String columns cannot be NULL in GoTrue, must use empty strings (except phone which has unique constraint)
INSERT INTO auth.users (
  id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
  created_at, updated_at, confirmation_token, recovery_token,
  email_change, email_change_token_new, email_change_token_current,
  phone_change, phone_change_token, reauthentication_token,
  raw_app_meta_data, raw_user_meta_data
)
VALUES
  ('11111111-1111-1111-1111-111111111111', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'alice@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}'),
  ('22222222-2222-2222-2222-222222222222', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'bob@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}'),
  ('33333333-3333-3333-3333-333333333333', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'charlie@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}'),
  ('44444444-4444-4444-4444-444444444444', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'admin@test.com', extensions.crypt('password123', extensions.gen_salt('bf')), now(), now(), now(), '', '', '', '', '', '', '', '', '{"provider": "email", "providers": ["email"]}', '{}');

-- Create identities for users (required for auth to work)
INSERT INTO auth.identities (id, user_id, identity_data, provider, provider_id, created_at, updated_at)
VALUES
  ('11111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '{"sub": "11111111-1111-1111-1111-111111111111", "email": "alice@test.com"}', 'email', '11111111-1111-1111-1111-111111111111', now(), now()),
  ('22222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', '{"sub": "22222222-2222-2222-2222-222222222222", "email": "bob@test.com"}', 'email', '22222222-2222-2222-2222-222222222222', now(), now()),
  ('33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '{"sub": "33333333-3333-3333-3333-333333333333", "email": "charlie@test.com"}', 'email', '33333333-3333-3333-3333-333333333333', now(), now()),
  ('44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', '{"sub": "44444444-4444-4444-4444-444444444444", "email": "admin@test.com"}', 'email', '44444444-4444-4444-4444-444444444444', now(), now());

-- =============================================================================
-- MEDIA (placeholder entries for posts, challenges, and profiles)
-- =============================================================================

INSERT INTO public.media (id, file_path, thumbnail_path, upload_status, created_at)
VALUES
  -- Post images
  (1, 'image/seed_1.jpg', null, 'completed', now() - interval '20 days'),
  (2, 'image/seed_2.jpg', null, 'completed', now() - interval '18 days'),
  (3, 'image/seed_3.jpg', null, 'completed', now() - interval '15 days'),
  (4, 'image/seed_4.jpg', null, 'completed', now() - interval '10 days'),
  (5, 'image/seed_5.jpg', null, 'completed', now() - interval '5 days'),
  (6, 'video/seed_6.mp4', 'thumbnails/video/seed_6.jpg', 'completed', now() - interval '3 days'),
  -- Challenge images
  (7, 'image/seed_1.jpg', null, 'completed', now() - interval '21 days'),
  (8, 'image/seed_2.jpg', null, 'completed', now() - interval '14 days'),
  (9, 'image/seed_3.jpg', null, 'completed', now() - interval '7 days'),
  -- Profile images
  (10, 'image/seed_4.jpg', null, 'completed', now() - interval '30 days'),
  (11, 'image/seed_5.jpg', null, 'completed', now() - interval '25 days'),
  (12, 'image/seed_6.jpg', null, 'completed', now() - interval '20 days'),
  (13, 'image/seed_1.jpg', null, 'completed', now() - interval '60 days'),
  -- Extra post images
  (14, 'image/seed_2.jpg', null, 'completed', now() - interval '18 days'),
  (15, 'image/seed_3.jpg', null, 'completed', now() - interval '17 days'),
  (16, 'image/seed_4.jpg', null, 'completed', now() - interval '11 days'),
  (17, 'image/seed_5.jpg', null, 'completed', now() - interval '9 days'),
  (18, 'image/seed_6.jpg', null, 'completed', now() - interval '4 days'),
  (19, 'image/seed_1.jpg', null, 'completed', now() - interval '2 days');

SELECT setval('public.media_id_seq', (SELECT MAX(id) FROM public.media));

-- Update profiles with full data (trigger created basic profiles)
UPDATE public.profiles SET username = 'alice', name = 'Alice Johnson', is_admin = false, first_login = false, eula_accepted = true, profile_media_id = 10 WHERE id = '11111111-1111-1111-1111-111111111111';
UPDATE public.profiles SET username = 'bob', name = 'Bob Smith', is_admin = false, first_login = false, eula_accepted = true, profile_media_id = 11 WHERE id = '22222222-2222-2222-2222-222222222222';
UPDATE public.profiles SET username = 'charlie', name = 'Charlie Brown', is_admin = false, first_login = false, eula_accepted = true, profile_media_id = 12 WHERE id = '33333333-3333-3333-3333-333333333333';
UPDATE public.profiles SET username = 'admin', name = 'Admin User', is_admin = true, first_login = false, eula_accepted = true, profile_media_id = 13 WHERE id = '44444444-4444-4444-4444-444444444444';

-- =============================================================================
-- CHALLENGES
-- =============================================================================

INSERT INTO public.challenges (id, title, title_it, description, description_it, difficulty, created_by, is_active, image_media_id, created_at, updated_at)
VALUES
  (1, 'Talk to a stranger', 'Parla con uno sconosciuto', 'Start a conversation with someone you don''t know. It could be at a coffee shop, in line at the store, or anywhere else.', 'Inizia una conversazione con qualcuno che non conosci. Potrebbe essere in un bar, in fila al negozio o in qualsiasi altro posto.', 'easy', '44444444-4444-4444-4444-444444444444', false, 7, now() - interval '21 days', now() - interval '14 days'),
  (2, 'Try a new food', 'Prova un nuovo cibo', 'Order something you''ve never tried before at a restaurant. Step outside your comfort zone with your taste buds!', 'Ordina qualcosa che non hai mai provato prima al ristorante. Esci dalla tua zona di comfort con le tue papille gustative!', 'easy', '44444444-4444-4444-4444-444444444444', false, 8, now() - interval '14 days', now() - interval '7 days'),
  (3, 'Public speaking', 'Parlare in pubblico', 'Give a short speech or presentation in front of at least 3 people. Share something you''re passionate about!', 'Fai un breve discorso o presentazione davanti ad almeno 3 persone. Condividi qualcosa che ti appassiona!', 'hard', '44444444-4444-4444-4444-444444444444', true, 9, now() - interval '7 days', now());

SELECT setval('public.challenges_id_seq', (SELECT MAX(id) FROM public.challenges));

-- =============================================================================
-- CONTENT PIECES
-- =============================================================================

-- Card formats:
--   { "type": "text", "body": "..." }
--   { "type": "text", "body": "...", "link": { "url": "...", "label": "..." } }
--   { "type": "youtube", "video_id": "...", "caption": "..." }
--   { "type": "link", "url": "...", "label": "...", "description": "..." }

INSERT INTO public.content_pieces (
  id,
  title,
  category,
  hook,
  cards,
  cover_image_path,
  is_featured,
  created_at,
  updated_at
)
VALUES
  (
    1,
    'Un passo nonostante il tremore',
    'fear',
    'La paura non è sempre un segnale di pericolo: molto spesso è un segnale di importanza. Questo pezzo aiuta a leggerla senza farsi comandare da lei.',
    '[
      { "type": "text", "body": "C''è una cosa che quasi nessuno ti dice sulla paura: non arriva solo quando sei in pericolo. Arriva anche quando sei vicino a qualcosa che conta. Un invito che ti espone. Una domanda che potrebbe ricevere un no. Un complimento che ti rende visibile. Una conversazione sincera che potrebbe cambiare il modo in cui una persona ti guarda. Per questo, se vuoi costruire una vita più viva, non puoi aspettare che la paura sparisca. Devi imparare a non prenderla sempre alla lettera." },
      { "type": "text", "body": "Il problema è che la paura è molto convincente. Ti parla come se stesse proteggendo la tua dignità, quando spesso sta solo proteggendo le tue abitudini. Ti dice: \"Non scrivere\", \"non parlare\", \"non avvicinarti\", \"non chiedere\", \"non esporti\". E così eviti, ti calmi, tiri un piccolo sospiro di sollievo. Solo che quel sollievo ha un prezzo: ogni volta che scappi, una parte di te registra che quella situazione doveva davvero essere pericolosa. Così il confine del tuo mondo si restringe un po''." },
      { "type": "text", "body": "Per questo il coraggio non è una qualità per pochi. Non è la dote dei carismatici, dei sicuri di sé, di quelli che \"non hanno problemi\". Il coraggio, nella vita quotidiana, somiglia molto di più a questo: sentire il tremore e restare presenti abbastanza a lungo da scoprire che non tutto quello che temi accade davvero. A volte il no arriva, sì. A volte la voce trema. A volte non fai una gran figura. Ma quasi mai succede la catastrofe interiore che avevi immaginato. E impari che puoi reggere." },
      { "type": "text", "body": "La verità è che le persone non restano bloccate perché sono deboli. Restano bloccate perché sono diventate molto brave a evitarsi il disagio. Eppure il disagio, quando non è distruttivo ma dosato, è spesso la porta d''ingresso della crescita. Il coraggio non ti chiede di diventare un altro: ti chiede di smettere, per qualche secondo, di obbedire sempre alla parte di te che vuole solo essere al sicuro." },
      { "type": "text", "body": "Forse è questa la definizione più onesta di uscire dalla comfort zone: non fare cose enormi, ma smettere di lasciare che la paura abbia sempre l''ultima parola. Ogni volta che non la lasci decidere da sola, succede una cosa sottile ma potente: non diventi invincibile. Diventi più libero." }
    ]'::jsonb,
    'esplora/sulla-paura-passo-tremore.jpg',
    true,
    now() - interval '1 day',
    now() - interval '1 day'
  ),
  (
    2,
    'La paura di restare soli crea rapporti infelici',
    'fear',
    'Un video breve ma molto nitido su una paura che fa più danni di quanto sembri: quella di restare soli. Utile quando una sfida sociale tocca il bisogno di conferma più che il desiderio di incontro.',
    '[
      { "type": "text", "body": "In questo video di Internazionale con Alain de Botton, il punto non è \"imparare a bastarsi\", ma riconoscere una dinamica scomoda: molte relazioni non nascono da una scelta, ma da una fuga dalla solitudine." },
      { "type": "link", "url": "https://REPLACE_ME-internazionale-de-botton-paura-soli", "label": "Guarda il video su Internazionale", "description": "Alain de Botton — La paura di restare soli crea rapporti infelici" },
      { "type": "text", "body": "È un contenuto prezioso perché aiuta a distinguere tra autenticità e dipendenza emotiva: se sto cercando l''altro per condividere qualcosa, o solo per non sentirmi vuoto. Quella differenza cambia tutto, soprattutto nelle sfide che toccano appuntamenti, approcci, attese e rifiuto." }
    ]'::jsonb,
    'esplora/sulla-paura-restare-soli.jpg',
    false,
    now() - interval '2 days',
    now() - interval '2 days'
  ),
  (
    3,
    'Dire la verità senza spogliarsi del tutto',
    'vulnerability',
    'Molte persone confondono vulnerabilità con esposizione totale. Questo pezzo rimette ordine: essere vulnerabili non significa dire tutto, ma dire qualcosa di vero.',
    '[
      { "type": "text", "body": "La vulnerabilità è una parola bella, ma spesso viene capita male. C''è chi la usa come sinonimo di sincerità radicale, come se essere autentici significasse raccontare tutto, sempre, a chiunque. Non è così. La vulnerabilità non è assenza di confini, non è rovesciare addosso agli altri tutto quello che proviamo, e non è neppure una specie di esibizione del dolore. È più sobria, più sottile, più matura: è il gesto di non nascondere del tutto quello che è essenziale in noi quando la situazione chiede presenza, verità e misura." },
      { "type": "text", "body": "Le relazioni profonde nascono dall''incontro tra due movimenti: una persona che si mostra un po'' di più e un''altra che risponde in modo sufficientemente presente, rispettoso, umano. La ricerca relazionale insiste proprio su questo: non basta rivelarsi, conta anche la qualità della risposta ricevuta. Per questo la vulnerabilità funziona solo quando è scelta, contestuale, consensuale. Non è un dovere morale: è un rischio calibrato che, se accolto bene, può aprire fiducia, vicinanza, senso di realtà." },
      { "type": "text", "body": "Il motivo per cui fa così paura è semplice: quando smetti di controllare completamente l''immagine che dai, rinunci a una parte della tua armatura. La domanda implicita diventa: \"Se ti faccio vedere questa parte di me, resti?\". Per questo tante persone preferiscono ironizzare, alleggerire, cambiare discorso. Meglio essere opachi che rischiare di essere toccati. Ma il prezzo è trattenersi sempre." },
      { "type": "text", "body": "Se non lasci mai vedere niente di vivo, le persone possono starti vicino senza avvicinarsi davvero. Possono frequentarti, ridere con te, perfino volerti bene — ma senza incontrarti fino in fondo. È una forma di protezione che col tempo diventa solitudine: non perché manchino i contatti, ma perché manca l''esperienza di essere conosciuti. E questa esperienza non arriva quando fai una performance impeccabile. Arriva quando smetti di essere solo gestito e diventi, almeno un po'', presente." },
      { "type": "text", "body": "Essere vulnerabili non vuol dire parlare sempre di cose enormi. Vuol dire fare spazio al vero anche nelle cose piccole. Dire: \"Mi farebbe piacere\". Dire: \"Questa cosa mi ha colpito\". Dire: \"Mi sento fuori posto\". Dire: \"Ti posso chiedere una mano?\". Dire: \"Con te sto bene\". Non è poco. È già moltissimo. La vulnerabilità ben dosata non ti rende meno dignitoso: ti rende più leggibile, più umano, più incontrabile." }
    ]'::jsonb,
    'esplora/vulnerabilita-dire-verita.jpg',
    false,
    now() - interval '3 days',
    now() - interval '3 days'
  ),
  (
    4,
    'L''arte di essere fragili',
    'vulnerability',
    'Un contenuto elegante, colto ma accessibile, per chi ha bisogno di sentire che la fragilità non è un difetto da correggere.',
    '[
      { "type": "text", "body": "Questo intervento di Alessandro D''Avenia sul canale TEDx Talks merita spazio perché viene da una voce letteraria italiana capace di parlare di fragilità senza psicologese e senza retorica." },
      { "type": "youtube", "video_id": "REPLACE_ME_davenia_tedx_id", "caption": "Alessandro D''Avenia — L''arte di essere fragili (TEDx)" },
      { "type": "text", "body": "D''Avenia arriva a questo talk dopo un percorso da scrittore e docente che include anche il libro \"L''arte di essere fragili. Come Leopardi può salvarti la vita\": è quindi un contenuto ideale per utenti intelligenti, sensibili, magari diffidenti verso il linguaggio motivazionale. La fragilità non viene \"superata\"; viene riconosciuta come materia viva dell''esistenza, e proprio per questo diventa meno umiliante e più abitabile." }
    ]'::jsonb,
    'esplora/vulnerabilita-arte-fragili.jpg',
    false,
    now() - interval '4 days',
    now() - interval '4 days'
  ),
  (
    5,
    'Vergogna',
    'vulnerability',
    'Un articolo utile quando vuoi dare profondità psicologica a una parola usata spesso ma capita poco.',
    '[
      { "type": "text", "body": "In questo approfondimento di State of Mind la vergogna viene trattata per quello che spesso è: un''emozione sociale che tocca il giudizio, l''inadeguatezza, la paura di essere rifiutati e il ritiro dalle relazioni." },
      { "type": "link", "url": "https://REPLACE_ME-stateofmind-vergogna", "label": "Leggi l''articolo su State of Mind", "description": "Approfondimento sulla vergogna come emozione sociale" },
      { "type": "text", "body": "È una lettura preziosa perché spiega bene un punto centrale: non sempre le persone evitano perché \"non ne hanno voglia\"; molte reagiscono a un senso di inferiorità o di esposizione troppo doloroso. Questo pezzo aiuta a normalizzare quel vissuto senza banalizzarlo." }
    ]'::jsonb,
    'esplora/vulnerabilita-vergogna.jpg',
    false,
    now() - interval '5 days',
    now() - interval '5 days'
  ),
  (
    6,
    'Le relazioni non nascono dalla performance',
    'connection',
    'Molti sanno socializzare, pochi sanno davvero incontrare. Questo pezzo parla di quella differenza sottile ma enorme tra fare presenza e creare contatto.',
    '[
      { "type": "text", "body": "Una delle illusioni più comuni nelle relazioni è questa: pensiamo che per connetterci dobbiamo risultare interessanti. Più brillanti, più sciolti, più simpatici, più desiderabili, più \"giusti\". Così entriamo nelle conversazioni come se fossero piccoli colloqui: controlliamo il tono, filtriamo le parole, dosiamo quanto mostrare. Il risultato? A volte la conversazione riesce, ma l''incontro no. Ci siamo parlati, sì. Però non ci siamo davvero trovati." },
      { "type": "text", "body": "La connessione vera raramente nasce da una performance ben riuscita. Nasce molto più spesso da un abbassamento della sorveglianza. Quando una persona smette di voler colpire e comincia a essere presente. Quando invece di pensare \"cosa devo dire adesso?\" sente davvero la frase dell''altro. Non è un caso se la solitudine non dipende solo dal numero di persone intorno a noi: dipende moltissimo dalla qualità percepita dei legami." },
      { "type": "text", "body": "Le relazioni profonde chiedono una cosa semplice da dire e difficilissima da fare: lasciare che l''altro incontri qualcuno che non sia interamente costruito per piacere. Vuol dire togliere un po'' di armatura. Per esempio: non rispondere subito con un aneddoto su di te, ma restare davvero sulla storia dell''altro. Non cercare per forza la battuta efficace. Non fingere sicurezza quando puoi permetterti un \"non lo so\". Non avere paura di un silenzio breve." },
      { "type": "text", "body": "Questo è decisivo per StepnOut, perché molte sfide possono essere interpretate in due modi opposti. Parlare con uno sconosciuto può diventare una prova di audacia egoica — \"vediamo se ce la faccio\" — oppure un esercizio di contatto umano — \"vediamo cosa succede se incontro davvero una persona\". Nel primo caso cerchi prestazione. Nel secondo cerchi realtà. E la realtà, quasi sempre, è più trasformativa." },
      { "type": "text", "body": "La connessione vera non richiede di essere perfetti, ma di essere un po'' meno difesi. Di arrivare meno preparati e più disponibili. Di tollerare il piccolo disordine dell''incontro. È lì che gli altri smettono di essere pubblico, specchio o minaccia. E tornano a essere quello che sono: altri esseri umani, con le loro paure, il loro bisogno di essere visti, la loro fame di verità." }
    ]'::jsonb,
    'esplora/connessione-non-performance.jpg',
    false,
    now() - interval '6 days',
    now() - interval '6 days'
  ),
  (
    7,
    'Per sentirci meno soli dobbiamo ritrovare il senso di comunità',
    'connection',
    'Un video breve, illuminante, quasi "fondativo" per il tema dell''app. Ricorda che il contrario della solitudine non è la folla: è appartenenza.',
    '[
      { "type": "text", "body": "Questo video tradotto in italiano spiega una cosa che per StepnOut è centrale: non basta essere connessi, bisogna sentirsi parte di qualcosa." },
      { "type": "link", "url": "https://REPLACE_ME-debotton-comunita", "label": "Guarda il video", "description": "Alain de Botton — Per sentirci meno soli dobbiamo ritrovare il senso di comunità" },
      { "type": "text", "body": "Alain de Botton insiste sul fatto che mettere emozioni e pensieri dentro una comunità affiatata non ci rende solo meno soli, ma riduce anche impulsi distruttivi e compulsivi. È un ottimo pezzo da mettere prima di sfide che riguardano nonni, vicinato, famiglia, gruppi o senso civico, perché amplia l''idea di \"uscire dalla comfort zone\": non solo esporsi, ma tornare in relazione." }
    ]'::jsonb,
    'esplora/connessione-comunita.jpg',
    false,
    now() - interval '7 days',
    now() - interval '7 days'
  ),
  (
    8,
    'Il silenzio delle ragazze',
    'connection',
    'Una tesi che resta addosso: tante relazioni si rompono nel punto esatto in cui una persona sceglie di non dire più ciò che pensa per non perdere il legame.',
    '[
      { "type": "text", "body": "In questo testo, tradotto e pubblicato da Internazionale, Carol Gilligan mette a fuoco una dinamica potentissima: il momento in cui, per proteggere la relazione, una persona sacrifica la propria voce." },
      { "type": "link", "url": "https://REPLACE_ME-internazionale-gilligan-silenzio", "label": "Leggi l''articolo su Internazionale", "description": "Carol Gilligan — Il silenzio delle ragazze" },
      { "type": "text", "body": "Il valore di questo pezzo è enorme, perché trasforma il tema della connessione in qualcosa di più esigente della semplice presenza: una relazione non è davvero viva se per mantenerla devi smettere di dire ciò che senti. Un contenuto molto forte per utenti giovani, soprattutto quando il nodo non è \"come socializzare\", ma \"come restare veri senza perdere appartenenza\"." }
    ]'::jsonb,
    'esplora/connessione-silenzio-ragazze.jpg',
    false,
    now() - interval '8 days',
    now() - interval '8 days'
  ),
  (
    9,
    'Il coraggio ordinario non fa rumore',
    'stories',
    'Non tutte le svolte hanno la musica in sottofondo. Questo pezzo restituisce dignità ai gesti minimi: una telefonata, una domanda, una frase detta finalmente senza travestirla.',
    '[
      { "type": "text", "body": "Siamo pieni di immagini spettacolari del coraggio. Il discorso decisivo. Il viaggio da soli. Il salto nel vuoto. La rivoluzione perfetta. Ma il vero coraggio, quasi sempre, arriva con vestiti normali. Non fa rumore. Non annuncia niente. A volte succede in una cucina, davanti a un genitore con cui parli solo di cose pratiche. A volte in ascensore, quando invece di guardare il telefono fai una domanda vera. A volte in un messaggio scritto e riscritto dieci volte, che alla fine invii così com''è." },
      { "type": "text", "body": "È facile sottovalutare questi momenti proprio perché sono piccoli. Non sembrano epici. Non cambiano il tuo feed. Eppure spesso sono loro che spostano davvero la vita. Perché in quei secondi stai facendo qualcosa di molto raro: interrompi una versione abituale di te. Quella che minimizza. Quella che si arrangia. Quella che lascia perdere. Quella che si protegge facendo finta di non volere nulla. Il gesto può essere minuscolo, ma il significato è enorme." },
      { "type": "text", "body": "Pensa a quante storie importanti iniziano male, o comunque in modo goffo. Una conversazione imbarazzata. Un invito che esce storto. Un confronto in cui la voce non è ferma. La vita non premia solo chi sa fare bene le cose. A volte premia soprattutto chi le fa abbastanza da permettere all''incontro di esistere. C''è una tenerezza particolare in questo tipo di coraggio, perché non ha niente di eroico nel senso classico. Non vuole dominare. Vuole partecipare." },
      { "type": "text", "body": "Forse la maturità emotiva è anche questo: smettere di aspettare il momento in cui saremo perfettamente pronti. E imparare a riconoscere il valore morale, affettivo, umano dei gesti minimi. Perché chiedere scusa davvero, fare un complimento senza ironia, dire \"mi manchi\" a un nonno, parlare con qualcuno che di solito ignori, fermarti ad ascoltare — sono tutte cose piccole solo per chi non le deve fare. Per chi le deve fare, a volte, sono montagne." },
      { "type": "text", "body": "E allora sì: onoriamo anche il coraggio ordinario. Quello che non fa curriculum. Quello che non impressiona nessuno. Quello che però, silenziosamente, rimette in moto la vita." }
    ]'::jsonb,
    'esplora/storie-coraggio-ordinario.jpg',
    false,
    now() - interval '9 days',
    now() - interval '9 days'
  ),
  (
    10,
    'No pain no gain',
    'stories',
    'Una storia di disconnessione, perdita e riconnessione raccontata da una voce italiana che non ha bisogno di abbellire nulla.',
    '[
      { "type": "text", "body": "Questo intervento su TED di Marco Confortola è forte perché non racconta il coraggio come una linea retta." },
      { "type": "youtube", "video_id": "REPLACE_ME_confortola_ted_id", "caption": "Marco Confortola — No pain no gain (TED)" },
      { "type": "text", "body": "La pagina ufficiale descrive il passaggio dalla connessione estrema con il corpo e la montagna alla disconnessione dal mondo dopo l''amputazione, fino a una nuova ricerca di relazione con se stesso e con gli altri. È prezioso perché offre una storia vera di vulnerabilità non romantica: il dolore non viene negato, ma attraversato. Molto più utile per utenti adulti di qualunque contenuto \"motivazionale\" standard." }
    ]'::jsonb,
    'esplora/storie-no-pain-no-gain.jpg',
    false,
    now() - interval '10 days',
    now() - interval '10 days'
  ),
  (
    11,
    'Parlarne tra amici',
    'stories',
    'Un episodio audio potente, concreto e molto contemporaneo. Mostra cosa succede quando degli uomini si ritrovano a parlare davvero di rabbia, tensione e paura.',
    '[
      { "type": "text", "body": "Questo episodio di \"Parlarne tra amici\" dal programma \"Il tuffo\", prodotto da Rai Radio 3 e distribuito su RaiPlay Sound, segue un gruppo di uomini e ragazzi che si incontra per mettere in parole rabbia e tensioni quotidiane prima che diventino violenza." },
      { "type": "link", "url": "https://REPLACE_ME-raiplaysound-parlarne-tra-amici", "label": "Ascolta il podcast su RaiPlay Sound", "description": "Il tuffo — Parlarne tra amici" },
      { "type": "text", "body": "È uno dei contenuti più interessanti di tutta la selezione perché porta la vulnerabilità fuori dalla teoria e la mostra come pratica sociale: parlare non elimina il conflitto, ma lo rende meno cieco. Ottimo per un pubblico giovane che ha bisogno di vedere la sincerità non come perdita di status, ma come forma di responsabilità." }
    ]'::jsonb,
    'esplora/storie-parlarne-tra-amici.jpg',
    false,
    now() - interval '11 days',
    now() - interval '11 days'
  ),
  (
    12,
    'Quando la tua zona di comfort si restringe',
    'science',
    'La zona di comfort non è una casa stabile: se la assecondi sempre, tende a diventare più piccola. Questo pezzo spiega il meccanismo in modo chiaro, umano e non tecnico.',
    '[
      { "type": "text", "body": "La zona di comfort viene spesso raccontata come se fosse un posto innocuo: uno spazio caldo, protetto, da cui ogni tanto bisognerebbe uscire per diventare persone migliori. Ma in realtà, psicologicamente, la questione è più precisa: la comfort zone non è solo ciò che conosci, è anche il repertorio di azioni che hai imparato a considerare tollerabili. E questo repertorio non resta fermo. Può ampliarsi, certo. Ma può anche restringersi." },
      { "type": "text", "body": "Succede soprattutto quando l''evitamento diventa una strategia abituale. All''inizio eviti una singola situazione che ti mette in allarme. Poi cominci a usare piccoli comportamenti protettivi per \"reggere meglio\": parli meno del necessario, ripassi tutto in testa, tieni il telefono in mano, fai finta di essere occupato, lasci che siano sempre gli altri a iniziare. Nella letteratura sull''ansia sociale questi comportamenti vengono chiamati safety behaviors: danno sollievo breve, ma mantengono il problema." },
      { "type": "text", "body": "È qui che la comfort zone cambia faccia. Non è più protezione: diventa riduzione delle possibilità. Alcuni autori descrivono nella timidezza proprio questo fenomeno, cioè un repertorio limitato di azioni che tende a ripetersi sempre uguale perché il cambiamento viene vissuto come minaccia. E più eviti, meno ti senti efficace. Meno ti senti efficace, più eviti. Il circolo si chiude." },
      { "type": "text", "body": "Per questo la crescita personale seria non coincide con l''adrenalina. Coincide con l''apprendimento. L''obiettivo non è buttarsi nelle situazioni più difficili, ma restare a contatto con ciò che temi in modo abbastanza graduale da permettere al cervello e al corpo di aggiornare le proprie previsioni. È anche il motivo per cui i programmi di esposizione funzionano: non perché insegnino a \"non provare ansia\", ma perché aiutano a scoprire che molte situazioni temute sono affrontabili." },
      { "type": "text", "body": "In pratica, la tua zona di comfort non è il luogo dove stai bene: è il luogo dove sai già cosa aspettarti. E queste non sono la stessa cosa. Uscire dalla comfort zone non è un gesto teatrale. È, molto più spesso, una scelta di apprendimento: fare una cosa diversa abbastanza volte da non doverla più vivere come una minaccia assoluta. Meno glamour di come la raccontano online. Ma infinitamente più vero." }
    ]'::jsonb,
    'esplora/scienza-comfort-restringe.jpg',
    false,
    now() - interval '12 days',
    now() - interval '12 days'
  ),
  (
    13,
    'Ansia sociale, solitudine e regolazione emotiva',
    'science',
    'Sentirsi soli non è solo una conseguenza esterna, ma un circuito emotivo che si autoalimenta. Un pezzo che dà spessore scientifico alla relazione tra paura sociale e isolamento.',
    '[
      { "type": "text", "body": "Questo articolo di State of Mind tiene insieme tre parole che nell''esperienza reale vanno spesso insieme: ansia sociale, solitudine e difficoltà di regolazione emotiva." },
      { "type": "link", "url": "https://REPLACE_ME-stateofmind-ansia-solitudine", "label": "Leggi l''articolo su State of Mind", "description": "Ansia sociale, solitudine e regolazione emotiva" },
      { "type": "text", "body": "Il valore per StepnOut è pratico e profondo insieme: aiuta a capire che l''isolamento non nasce solo dalla mancanza di contatti, ma anche dal modo in cui interpretiamo e gestiamo le emozioni nelle relazioni. In altre parole, spiega perché uscire dalla comfort zone può migliorare non solo la vita sociale, ma anche il rapporto con i propri stati interni." }
    ]'::jsonb,
    'esplora/scienza-ansia-sociale.jpg',
    false,
    now() - interval '13 days',
    now() - interval '13 days'
  ),
  (
    14,
    'Un centimetro oltre',
    'practice',
    'Non serve diventare temerari. Serve allenare micro-spostamenti ripetuti nel tempo. Questo pezzo dà dignità alle sfide piccole, che sono poi quelle che cambiano davvero il carattere quotidiano.',
    '[
      { "type": "text", "body": "La trasformazione personale viene spesso raccontata come una rottura: una decisione enorme, una giornata memorabile, una versione nuova di sé che compare quasi tutta insieme. Ma la vita emotiva delle persone funziona molto più spesso per centimetri che per chilometri. Un messaggio mandato invece che cancellato. Un saluto tenuto aperto un secondo in più. Un \"come stai davvero?\" dove di solito metteresti una battuta. Un favore chiesto senza premettere mille scuse. Un no detto con calma. Un sì detto senza aspettare di sentirsi completamente pronti." },
      { "type": "text", "body": "Le sfide quotidiane funzionano proprio per questo. Non ti chiedono di diventare coraggioso una volta per tutte. Ti chiedono di spostare leggermente la soglia di ciò che sei disposto a reggere. Nei modelli basati sull''esposizione il cambiamento non avviene perché la persona fa una cosa gigantesca, ma perché incontra più volte, in modo gestibile, ciò che tendeva a evitare. Non serve un''impresa. Serve continuità." },
      { "type": "text", "body": "C''è anche un altro vantaggio nelle sfide piccole: non lasciano troppo spazio alla fantasia eroica. E la fantasia eroica, spesso, è un modo elegante per rimandare. Aspettiamo il giorno giusto, il momento perfetto, la sicurezza piena. Nel frattempo non facciamo nulla. I centimetri, invece, costringono alla realtà. Oggi posso fare solo questo? Bene. Faccio questo. È poco? Forse. Ma è vivo." },
      { "type": "text", "body": "Il micro-coraggio ha una qualità morale bellissima: è democratico. Non appartiene solo agli estroversi, ai disinvolti, a quelli che amano stare al centro. Appartiene anche alle persone sensibili, prudenti, lente, introspettive. Una buona sfida non ti umilia: ti allena. Non ti rompe: ti allarga. Non cancella la paura; la rende meno sovrana." },
      { "type": "text", "body": "Nella pratica quotidiana, uscire dalla comfort zone non dovrebbe somigliare a un esame di valore personale. Dovrebbe somigliare a un allenamento gentile ma serio. Oggi un centimetro. Domani forse due. Alcuni giorni niente applausi, niente svolte, niente euforia. Solo una piccola prova fatta fino in fondo. È così che si costruisce una nuova immagine di sé: non con un exploit, ma con una serie di esperienze che dicono, lentamente, \"questa cosa la posso fare\". E a un certo punto ti accorgi che il mondo non è diventato meno impegnativo. Sei tu che sei diventato un po'' più capace di starci dentro." }
    ]'::jsonb,
    'esplora/pratica-centimetro-oltre.jpg',
    false,
    now() - interval '14 days',
    now() - interval '14 days'
  ),
  (
    15,
    'Parla con Noi! Benessere Psicologico',
    'practice',
    'Un contenuto istituzionale, ma non freddo: pubblico, domande vere, esperti e casi concreti. Una voce di servizio pubblico che integra bene i pezzi più intimi e narrativi.',
    '[
      { "type": "text", "body": "Questo programma in quattro appuntamenti mette al centro un pubblico attivo che fa domande a esperti su bullismo, dipendenze, comportamenti di rischio e altri temi del benessere quotidiano." },
      { "type": "link", "url": "https://REPLACE_ME-rai-parla-con-noi", "label": "Ascolta il programma", "description": "Parla con Noi! Benessere Psicologico — Rai" },
      { "type": "text", "body": "Per il progetto è utile soprattutto perché traduce temi psicologici complessi in situazioni quotidiane e concrete: non parla sopra le persone, ma a partire dalle loro domande. In particolare, gli episodi su comportamenti di rischio e bullismo mostrano quanto paura, solitudine, pressione del gruppo e dinamiche affettive entrino nella vita ordinaria. Un contenuto meno \"letterario\" di altri in lista, ma proprio per questo molto utilizzabile come contrappunto pratico e civile." }
    ]'::jsonb,
    'esplora/pratica-parla-con-noi.jpg',
    false,
    now() - interval '15 days',
    now() - interval '15 days'
  )
ON CONFLICT (id) DO UPDATE
SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  hook = EXCLUDED.hook,
  cards = EXCLUDED.cards,
  cover_image_path = EXCLUDED.cover_image_path,
  is_featured = EXCLUDED.is_featured,
  created_at = EXCLUDED.created_at,
  updated_at = EXCLUDED.updated_at;

SELECT setval('public.content_pieces_id_seq', (SELECT MAX(id) FROM public.content_pieces));

-- =============================================================================
-- POSTS (challenge submissions and discussion posts)
-- =============================================================================

-- Challenge 1 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (1, '11111111-1111-1111-1111-111111111111', 'I talked to someone at the coffee shop today! We ended up chatting for 20 minutes about travel. Such a great experience!', 1, 1, false, false, now() - interval '20 days'),
  (2, '22222222-2222-2222-2222-222222222222', 'Met a fellow dog owner at the park. Turns out we live on the same street! 🐕', 1, 2, false, true, now() - interval '19 days');

-- Challenge 2 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (3, '11111111-1111-1111-1111-111111111111', 'Tried sushi for the first time! I was nervous but it was actually delicious 🍣', 2, 3, false, false, now() - interval '12 days'),
  (4, '33333333-3333-3333-3333-333333333333', 'Finally tried Ethiopian food. The injera bread was so unique!', 2, 4, false, false, now() - interval '10 days');

-- Challenge 3 submissions (current active challenge)
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (5, '22222222-2222-2222-2222-222222222222', 'Gave a presentation at work today about my hobby project. Hands were shaking but I did it! 💪', 3, 5, false, false, now() - interval '3 days');

-- Discussion posts (no challenge)
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (6, '33333333-3333-3333-3333-333333333333', 'This app has really helped me push my boundaries. What''s been your favorite challenge so far?', null, null, false, false, now() - interval '8 days'),
  (7, '11111111-1111-1111-1111-111111111111', 'Feeling nervous about this week''s challenge but I''m going to do it!', null, null, false, false, now() - interval '2 days');

-- More challenge 1 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (9, '33333333-3333-3333-3333-333333333333', 'Asked for directions even though I had Google Maps open. Baby steps right? 😅', 1, 14, false, false, now() - interval '18 days'),
  (10, '44444444-4444-4444-4444-444444444444', 'Complimented a stranger on their jacket. They looked so happy it made my whole day.', 1, 15, false, false, now() - interval '17 days');

-- More challenge 2 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (11, '22222222-2222-2222-2222-222222222222', 'Tried durian. I will not be doing that again. 0/10 experience but 10/10 for stepping out of my comfort zone', 2, 16, false, false, now() - interval '11 days'),
  (12, '44444444-4444-4444-4444-444444444444', 'Had crickets at a food festival! Crunchy but honestly not bad with hot sauce 🦗', 2, 17, false, true, now() - interval '9 days');

-- More challenge 3 submissions
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (13, '11111111-1111-1111-1111-111111111111', 'Spoke up at a community meeting for the first time. My voice was shaking but people actually agreed with my point!', 3, 18, false, false, now() - interval '4 days'),
  (14, '33333333-3333-3333-3333-333333333333', 'Did a toast at my friend''s birthday dinner. 15 people staring at me. Survived.', 3, 19, false, false, now() - interval '2 days'),
  (15, '44444444-4444-4444-4444-444444444444', 'Led the standup at work today instead of just listening. Small win but it counts!', 3, null, false, false, now() - interval '1 day');

-- More discussion posts
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (16, '22222222-2222-2222-2222-222222222222', 'Hot take: the easy challenges are actually harder than the hard ones because you have no excuse not to do them', null, null, false, false, now() - interval '15 days'),
  (17, '44444444-4444-4444-4444-444444444444', 'What do you all do when you feel like chickening out? I need strategies lol', null, null, false, false, now() - interval '6 days'),
  (18, '11111111-1111-1111-1111-111111111111', 'Just realized I''ve done 5 challenges in a row without skipping. Who even am I anymore??', null, null, false, false, now() - interval '4 days'),
  (19, '33333333-3333-3333-3333-333333333333', 'The growth is real. I used to dread Mondays because of new challenges. Now I look forward to them.', null, null, false, false, now() - interval '1 day'),
  (20, '22222222-2222-2222-2222-222222222222', 'Anyone else feel like this app is basically free therapy? 😂', null, null, false, false, now() - interval '6 hours');

-- Challenge submissions with default body (no custom text)
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (21, '44444444-4444-4444-4444-444444444444', 'Just completed this week''s challenge!', 1, null, false, false, now() - interval '16 days'),
  (22, '33333333-3333-3333-3333-333333333333', 'Just completed this week''s challenge!', 2, null, false, false, now() - interval '8 days'),
  (23, '11111111-1111-1111-1111-111111111111', 'Just completed this week''s challenge!', 3, null, false, false, now() - interval '1 day');

-- Welcome posts
INSERT INTO public.post (id, user_id, body, challenge_id, media_id, is_welcome, featured, created_at)
VALUES
  (8, '33333333-3333-3333-3333-333333333333', '', null, null, true, false, now() - interval '20 days'),
  (24, '11111111-1111-1111-1111-111111111111', '', null, null, true, false, now() - interval '19 days'),
  (25, '22222222-2222-2222-2222-222222222222', '', null, null, true, false, now() - interval '15 days'),
  (26, '44444444-4444-4444-4444-444444444444', '', null, null, true, false, now() - interval '12 days'),
  (27, '33333333-3333-3333-3333-333333333333', '', null, null, true, false, now() - interval '6 days'),
  (28, '22222222-2222-2222-2222-222222222222', '', null, null, true, false, now() - interval '3 days'),
  (29, '11111111-1111-1111-1111-111111111111', '', null, null, true, false, now() - interval '1 day');

SELECT setval('public.post_id_seq', (SELECT MAX(id) FROM public.post));

-- =============================================================================
-- COMMENTS
-- =============================================================================

INSERT INTO public.comments (id, post_id, user_id, body, parent_comment_id, created_at)
VALUES
  (1, 1, '22222222-2222-2222-2222-222222222222', 'That''s awesome! I need to try this too.', null, now() - interval '19 days'),
  (2, 1, '33333333-3333-3333-3333-333333333333', 'Love hearing these stories! ❤️', null, now() - interval '19 days'),
  (3, 2, '11111111-1111-1111-1111-111111111111', 'That''s such a cool coincidence!', null, now() - interval '18 days'),
  (4, 3, '22222222-2222-2222-2222-222222222222', 'Welcome to the sushi club! 🍣', null, now() - interval '11 days'),
  (5, 5, '11111111-1111-1111-1111-111111111111', 'So proud of you! That takes courage.', null, now() - interval '2 days'),
  (6, 5, '33333333-3333-3333-3333-333333333333', 'You''re inspiring me to try this challenge!', null, now() - interval '2 days'),
  (7, 6, '11111111-1111-1111-1111-111111111111', 'The stranger challenge was my favorite - it really opened my eyes!', null, now() - interval '7 days'),
  (8, 6, '22222222-2222-2222-2222-222222222222', 'Same here! Each one gets a little easier.', null, now() - interval '7 days'),
  (9, 5, '22222222-2222-2222-2222-222222222222', 'facts. first time is always the scariest.', 5, now() - interval '2 days' + interval '5 minutes'),
  (10, 5, '44444444-4444-4444-4444-444444444444', 'fr, and you nailed it.', 9, now() - interval '2 days' + interval '10 minutes'),
  (11, 6, '33333333-3333-3333-3333-333333333333', 'same, it felt weirdly empowering.', 7, now() - interval '7 days' + interval '20 minutes'),
  (12, 6, '11111111-1111-1111-1111-111111111111', 'lol yep, exposure therapy but wholesome', 11, now() - interval '7 days' + interval '30 minutes'),
  -- Comments on new posts
  (13, 9, '11111111-1111-1111-1111-111111111111', 'Haha that totally counts!', null, now() - interval '17 days'),
  (14, 10, '22222222-2222-2222-2222-222222222222', 'This is so wholesome', null, now() - interval '16 days'),
  (15, 10, '33333333-3333-3333-3333-333333333333', 'Making someone''s day is the best feeling', null, now() - interval '16 days'),
  (16, 10, '11111111-1111-1111-1111-111111111111', 'I''m stealing this idea', null, now() - interval '16 days'),
  (17, 11, '11111111-1111-1111-1111-111111111111', 'LMAO the honesty 😂', null, now() - interval '10 days'),
  (18, 11, '33333333-3333-3333-3333-333333333333', 'durian is an acquired taste... that I will never acquire', null, now() - interval '10 days'),
  (19, 12, '11111111-1111-1111-1111-111111111111', 'ok but hot sauce makes everything edible', null, now() - interval '8 days'),
  (20, 12, '22222222-2222-2222-2222-222222222222', 'you are braver than any marine', null, now() - interval '8 days'),
  (21, 12, '33333333-3333-3333-3333-333333333333', 'the real challenge was keeping it down 😂', null, now() - interval '8 days'),
  (22, 13, '22222222-2222-2222-2222-222222222222', 'That takes guts! Proud of you', null, now() - interval '3 days'),
  (23, 13, '33333333-3333-3333-3333-333333333333', 'speaking truth to power 💪', null, now() - interval '3 days'),
  (24, 13, '44444444-4444-4444-4444-444444444444', 'this is exactly what this challenge is about', null, now() - interval '3 days'),
  (25, 14, '11111111-1111-1111-1111-111111111111', 'toasts are TERRIFYING, well done', null, now() - interval '1 day'),
  (26, 14, '22222222-2222-2222-2222-222222222222', 'your friend is lucky to have you', null, now() - interval '1 day'),
  (27, 16, '11111111-1111-1111-1111-111111111111', 'THIS. the easy ones haunt me more', null, now() - interval '14 days'),
  (28, 16, '33333333-3333-3333-3333-333333333333', 'facts, no hiding behind "it''s too hard"', null, now() - interval '14 days'),
  (29, 16, '44444444-4444-4444-4444-444444444444', 'never thought of it that way but you''re right', null, now() - interval '13 days'),
  (30, 16, '11111111-1111-1111-1111-111111111111', 'exactly why I skip the easy ones... wait', 28, now() - interval '13 days'),
  (31, 17, '11111111-1111-1111-1111-111111111111', 'I count down from 5 and just GO before my brain catches up', null, now() - interval '5 days'),
  (32, 17, '33333333-3333-3333-3333-333333333333', 'I tell myself "future me will be grateful"', null, now() - interval '5 days'),
  (33, 17, '22222222-2222-2222-2222-222222222222', 'honestly just opening this app helps. seeing everyone else doing scary stuff', null, now() - interval '5 days'),
  (34, 18, '22222222-2222-2222-2222-222222222222', 'character development arc 🔥', null, now() - interval '3 days'),
  (35, 18, '33333333-3333-3333-3333-333333333333', 'you''re a different person and we love to see it', null, now() - interval '3 days'),
  (36, 19, '11111111-1111-1111-1111-111111111111', 'same!! the dread turned into excitement somehow', null, now() - interval '12 hours'),
  (37, 19, '22222222-2222-2222-2222-222222222222', 'growth mindset activated', null, now() - interval '10 hours'),
  (38, 20, '11111111-1111-1111-1111-111111111111', 'lol cheaper than therapy at least', null, now() - interval '4 hours'),
  (39, 20, '33333333-3333-3333-3333-333333333333', 'my therapist would approve tbh', null, now() - interval '3 hours'),
  (40, 20, '44444444-4444-4444-4444-444444444444', 'we should add "go to actual therapy" as a challenge 😂', null, now() - interval '2 hours');

SELECT setval('public.comments_id_seq', (SELECT MAX(id) FROM public.comments));

-- =============================================================================
-- LIKES
-- =============================================================================

INSERT INTO public.likes (id, post_id, comment_id, user_id, created_at)
VALUES
  -- Post likes
  (1, 1, null, '22222222-2222-2222-2222-222222222222', now() - interval '19 days'),
  (2, 1, null, '33333333-3333-3333-3333-333333333333', now() - interval '19 days'),
  (3, 1, null, '44444444-4444-4444-4444-444444444444', now() - interval '18 days'),
  (4, 2, null, '11111111-1111-1111-1111-111111111111', now() - interval '18 days'),
  (5, 2, null, '33333333-3333-3333-3333-333333333333', now() - interval '18 days'),
  (6, 3, null, '22222222-2222-2222-2222-222222222222', now() - interval '11 days'),
  (7, 4, null, '11111111-1111-1111-1111-111111111111', now() - interval '9 days'),
  (8, 5, null, '11111111-1111-1111-1111-111111111111', now() - interval '2 days'),
  (9, 5, null, '33333333-3333-3333-3333-333333333333', now() - interval '2 days'),
  (10, 5, null, '44444444-4444-4444-4444-444444444444', now() - interval '2 days'),
  (11, 6, null, '11111111-1111-1111-1111-111111111111', now() - interval '7 days'),
  (12, 6, null, '22222222-2222-2222-2222-222222222222', now() - interval '7 days'),
  -- Post 10 (compliment stranger) - lots of likes, old = high popular score
  (13, 10, null, '11111111-1111-1111-1111-111111111111', now() - interval '16 days'),
  (14, 10, null, '22222222-2222-2222-2222-222222222222', now() - interval '16 days'),
  (15, 10, null, '33333333-3333-3333-3333-333333333333', now() - interval '16 days'),
  -- Post 12 (crickets) - heavily liked
  (16, 12, null, '11111111-1111-1111-1111-111111111111', now() - interval '8 days'),
  (17, 12, null, '22222222-2222-2222-2222-222222222222', now() - interval '8 days'),
  (18, 12, null, '33333333-3333-3333-3333-333333333333', now() - interval '8 days'),
  (19, 12, null, '44444444-4444-4444-4444-444444444444', now() - interval '7 days'),
  -- Post 13 (community meeting) - well liked + many comments
  (20, 13, null, '22222222-2222-2222-2222-222222222222', now() - interval '3 days'),
  (21, 13, null, '33333333-3333-3333-3333-333333333333', now() - interval '3 days'),
  (22, 13, null, '44444444-4444-4444-4444-444444444444', now() - interval '3 days'),
  -- Post 16 (hot take) - most popular discussion post
  (23, 16, null, '11111111-1111-1111-1111-111111111111', now() - interval '14 days'),
  (24, 16, null, '22222222-2222-2222-2222-222222222222', now() - interval '14 days'),
  (25, 16, null, '33333333-3333-3333-3333-333333333333', now() - interval '13 days'),
  (26, 16, null, '44444444-4444-4444-4444-444444444444', now() - interval '13 days'),
  -- Post 17 (chickening out) - well liked
  (27, 17, null, '11111111-1111-1111-1111-111111111111', now() - interval '5 days'),
  (28, 17, null, '22222222-2222-2222-2222-222222222222', now() - interval '5 days'),
  (29, 17, null, '33333333-3333-3333-3333-333333333333', now() - interval '5 days'),
  -- Post 18 (5 in a row)
  (30, 18, null, '22222222-2222-2222-2222-222222222222', now() - interval '3 days'),
  (31, 18, null, '44444444-4444-4444-4444-444444444444', now() - interval '3 days'),
  -- Post 19 (growth is real) - recent + liked
  (32, 19, null, '11111111-1111-1111-1111-111111111111', now() - interval '12 hours'),
  (33, 19, null, '22222222-2222-2222-2222-222222222222', now() - interval '10 hours'),
  (34, 19, null, '44444444-4444-4444-4444-444444444444', now() - interval '8 hours'),
  -- Post 20 (free therapy) - very recent, some likes
  (35, 20, null, '11111111-1111-1111-1111-111111111111', now() - interval '4 hours'),
  (36, 20, null, '33333333-3333-3333-3333-333333333333', now() - interval '3 hours'),
  -- Post 14 (toast)
  (37, 14, null, '11111111-1111-1111-1111-111111111111', now() - interval '1 day'),
  (38, 14, null, '44444444-4444-4444-4444-444444444444', now() - interval '1 day'),
  -- Post 15 (standup) - barely liked, text only
  (39, 15, null, '22222222-2222-2222-2222-222222222222', now() - interval '12 hours'),
  -- Comment likes
  (40, null, 1, '11111111-1111-1111-1111-111111111111', now() - interval '18 days'),
  (41, null, 5, '22222222-2222-2222-2222-222222222222', now() - interval '2 days'),
  (42, null, 17, '22222222-2222-2222-2222-222222222222', now() - interval '10 days'),
  (43, null, 20, '11111111-1111-1111-1111-111111111111', now() - interval '8 days'),
  (44, null, 27, '22222222-2222-2222-2222-222222222222', now() - interval '13 days'),
  (45, null, 31, '33333333-3333-3333-3333-333333333333', now() - interval '4 days'),
  (46, null, 40, '11111111-1111-1111-1111-111111111111', now() - interval '1 hour');

SELECT setval('public.likes_id_seq', (SELECT MAX(id) FROM public.likes));

-- =============================================================================
-- NOTIFICATIONS
-- =============================================================================

INSERT INTO public.notifications (notification_id, user_id, trigger_user_id, post_id, comment_id, action_type, is_read, created_at)
VALUES
  (1, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, null, 'like', true, now() - interval '19 days'),
  (2, '11111111-1111-1111-1111-111111111111', '33333333-3333-3333-3333-333333333333', 1, null, 'like', true, now() - interval '19 days'),
  (3, '11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 1, 1, 'comment', true, now() - interval '19 days'),
  (4, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 5, null, 'like', false, now() - interval '2 days'),
  (5, '22222222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 5, null, 'like', false, now() - interval '2 days'),
  (6, '22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 5, 5, 'comment', false, now() - interval '2 days');

SELECT setval('public.notifications_notification_id_seq', (SELECT MAX(notification_id) FROM public.notifications));

-- =============================================================================
-- APP_CONFIG
-- =============================================================================

INSERT INTO public.app_config (id, key, value, created_at)
VALUES
  (1, 'share_link', 'https://linktr.ee/stepnout', now());

SELECT setval('public.app_config_id_seq', (SELECT MAX(id) FROM public.app_config));
