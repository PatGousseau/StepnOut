WITH payload AS (
  SELECT $sidequests${
  "quests": [
    {
      "title": "Backstreet Bakery Run",
      "summary": "Find a bakery you have never entered and buy one small thing.",
      "why_it_hits": "A tiny errand becomes a neighborhood discovery.",
      "instructions": "Walk or transit to a bakery off your usual route, choose the item that catches your eye, eat it nearby, and note one detail about the place you would not have known otherwise.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "One-Block Safari",
      "summary": "Study one ordinary block like it is a travel destination.",
      "why_it_hits": "It turns familiar streets into fresh terrain.",
      "instructions": "Pick a block near home, walk it slowly, notice signs, textures, sounds, plants, and windows, then choose the most interesting thing you found as the block's unofficial landmark.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Museum in One Room",
      "summary": "Visit one gallery room and ignore the rest.",
      "why_it_hits": "Limiting the scope makes culture feel easy.",
      "instructions": "Go to a free or cheap museum, choose a single room, spend at least twenty minutes there, pick your favorite object, and leave before you feel obligated to see everything.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sunrise Beverage",
      "summary": "Have coffee, tea, or juice outside at sunrise.",
      "why_it_hits": "The day starts with a cinematic reset.",
      "instructions": "Check sunrise time, bring or buy a simple drink, sit somewhere with a clear eastern view, and stay until the light noticeably changes.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Ferry Ride",
      "summary": "Take the shortest public ferry or water taxi available.",
      "why_it_hits": "Water makes even a small trip feel like travel.",
      "instructions": "Find a cheap local boat route, ride it one stop or round-trip, keep your phone mostly away, and watch the shoreline like you are arriving somewhere new.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Library Blind Pull",
      "summary": "Borrow a book from a shelf you rarely visit.",
      "why_it_hits": "Chance picks can spark unexpected curiosity.",
      "instructions": "Go to a library, choose an aisle you normally skip, pull three books by title or cover, borrow one, and read the first ten pages somewhere quiet.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bench With a View",
      "summary": "Find the best public bench within walking distance.",
      "why_it_hits": "It creates a small place to return to.",
      "instructions": "Walk until you find three possible benches, sit on each for five minutes, then crown one the winner based on view, comfort, and people-watching.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "going_far",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Market Color Hunt",
      "summary": "Visit a market and buy food in one chosen color.",
      "why_it_hits": "A simple constraint makes shopping playful.",
      "instructions": "Pick a color before you go, visit a grocery, farmers market, or corner shop, choose one affordable item in that color, and build a snack or meal around it.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Old Photo Reshoot",
      "summary": "Recreate an old photo in its original place.",
      "why_it_hits": "It links past and present in a visible way.",
      "instructions": "Find an old personal or family photo taken nearby, go to the spot if possible, recreate the angle, and compare what changed without posting unless you want to.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pocket Picnic",
      "summary": "Eat a portable snack somewhere not meant for meals.",
      "why_it_hits": "It breaks lunch out of autopilot.",
      "instructions": "Pack or buy a simple snack, choose a safe public spot like steps, a plaza, or a park edge, eat slowly, and give the place a made-up restaurant name.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Station-to-Station Walk",
      "summary": "Walk between two transit stops you usually ride past.",
      "why_it_hits": "It fills in a missing piece of your city map.",
      "instructions": "Pick two familiar bus, tram, or train stops, get off at one, walk to the next, and notice what exists in the gap you usually skip.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Postcard to Someone Real",
      "summary": "Send a postcard from your own town.",
      "why_it_hits": "It makes ordinary places feel worth sharing.",
      "instructions": "Buy or make a cheap postcard, write a brief note to someone who would enjoy surprise mail, stamp it, and drop it in a mailbox the same day.",
      "goal_tags": [
        "connection",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Hardware Store Quest",
      "summary": "Browse a hardware store for one strangely useful object.",
      "why_it_hits": "Practical places can feel like invention labs.",
      "instructions": "Visit a hardware or discount store, wander aisles you usually ignore, buy nothing or one cheap item under a set limit, and imagine three uses for it.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "did_something_unusual",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Long Way Home",
      "summary": "Take a deliberately different route back from an errand.",
      "why_it_hits": "It adds novelty without extra planning.",
      "instructions": "Do one normal errand, then return by a route that adds at least ten minutes, avoiding your default streets and stopping once when something draws your attention.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "planning",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Art Roll Call",
      "summary": "Find three pieces of public art in one outing.",
      "why_it_hits": "The city becomes a free gallery.",
      "instructions": "Search a map or wander a likely area, visit three murals, sculptures, plaques, or installations, and pick the one you would show a visiting friend.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Sound Map",
      "summary": "Collect the sounds of a place with your ears only.",
      "why_it_hits": "Listening changes the texture of a familiar area.",
      "instructions": "Sit or walk outside for twenty minutes, identify ten distinct sounds, arrange them from pleasant to annoying, and notice which one you would normally tune out.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Corner Shop Dinner",
      "summary": "Build dinner entirely from one small local shop.",
      "why_it_hits": "Constraint turns a routine meal into a game.",
      "instructions": "Choose a corner store, bodega, or mini market, set a small budget, buy ingredients for a simple meal or snack plate, and eat it without adding anything from home.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Borrowed View",
      "summary": "Visit the top floor of a public building.",
      "why_it_hits": "A new height gives a new mental angle.",
      "instructions": "Find a library, university building, mall, or municipal building with public access, go to an upper floor, look out for five minutes, and identify one landmark.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Plant Identification Walk",
      "summary": "Learn the names of five plants near you.",
      "why_it_hits": "Naming things makes the world feel richer.",
      "instructions": "Walk through a street or park, use signs, a guidebook, or a plant app, identify five plants, and choose the one you would most want outside your door.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cash-Only Treat",
      "summary": "Spend only loose change or a small bill on a treat.",
      "why_it_hits": "A tight limit makes choice satisfying.",
      "instructions": "Take a fixed small amount of cash, visit a shop, bakery, kiosk, or market, buy the best thing within the limit, and enjoy the decision without adding card money.",
      "goal_tags": [
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Midday Movie Escape",
      "summary": "See a matinee alone or with a friend.",
      "why_it_hits": "Daytime cinema feels mildly luxurious.",
      "instructions": "Choose a cheap matinee or community screening, arrive without rushing, sit somewhere you normally would not, and take a short walk afterward before returning to routine.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Alleyway Architecture",
      "summary": "Explore safe alleys or side streets for overlooked details.",
      "why_it_hits": "Back routes reveal the hidden face of a place.",
      "instructions": "Pick a well-lit area in daytime, walk only safe public paths, look for doors, vines, garages, tiles, or old signs, and turn back anywhere that feels private or sketchy.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "going_far",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Local History Dig",
      "summary": "Research one plaque, old building, or street name.",
      "why_it_hits": "A fact can make a street feel haunted by stories.",
      "instructions": "Find a marker or curious name nearby, read it in person, look up one reliable source on your phone, and tell someone the most surprising detail.",
      "goal_tags": [
        "novelty",
        "better_stories",
        "connection"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Newspaper Hour",
      "summary": "Read a physical newspaper in a public place.",
      "why_it_hits": "It slows down information and changes your posture.",
      "instructions": "Buy, borrow, or find a newspaper, sit in a cafe, library, or park, read for thirty minutes, and circle or remember one article worth mentioning later.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Wrong-Aisle Grocery Tour",
      "summary": "Inspect three grocery aisles you never use.",
      "why_it_hits": "It reveals other people's everyday worlds.",
      "instructions": "Go to a grocery store, choose three unfamiliar aisles, read labels and ingredients, pick one item to learn about or buy, and skip judgment in favor of curiosity.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friendship Errand Swap",
      "summary": "Run one small errand with a friend and make it social.",
      "why_it_hits": "Chores feel lighter when shared.",
      "instructions": "Ask a friend if they need to pick up groceries, mail something, or walk a dog, join them for the errand, and add a five-minute detour for a treat or view.",
      "goal_tags": [
        "connection",
        "momentum",
        "fun"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "playful"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Doorstep Sketch",
      "summary": "Draw the view from your front door or building exit.",
      "why_it_hits": "Making marks forces new attention.",
      "instructions": "Bring paper and any pen, stand or sit just outside your home, sketch for ten minutes without aiming for beauty, and label three details you had never noticed.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Dessert Before Dinner",
      "summary": "Eat dessert first somewhere outside the home.",
      "why_it_hits": "It gently scrambles a rule without consequences.",
      "instructions": "Choose a modest dessert from a bakery, diner, or store, eat it before your normal meal, and notice whether the small reversal changes your mood.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Five-Dollar Bouquet",
      "summary": "Make or buy the cheapest possible flowers for your space.",
      "why_it_hits": "Small beauty can shift a whole room.",
      "instructions": "Gather legal fallen flowers, buy a low-cost bunch, or combine greenery from a market, put it in any container, and place it somewhere you will pass often today.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Transit Dice",
      "summary": "Let chance choose a short transit outing.",
      "why_it_hits": "Randomness cuts through overthinking.",
      "instructions": "Pick a safe transit line, roll a die or use a random number for stops, ride that far in daytime, step out for fifteen minutes, then return or continue if inspired.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Public Stair Climb",
      "summary": "Climb a notable outdoor stairway at a relaxed pace.",
      "why_it_hits": "A little effort creates a sense of arrival.",
      "instructions": "Find a public stair street, park steps, or monument stairs, climb slowly with rests, look back from the top, and skip it if conditions are unsafe or inaccessible.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "physically_demanding"
      ]
    },
    {
      "title": "Thrift Store Character Study",
      "summary": "Find an outfit piece for an imaginary character.",
      "why_it_hits": "Secondhand objects invite storytelling.",
      "instructions": "Visit a thrift store, choose one item that suggests a life or personality, do not buy unless you want it, and invent where its fictional owner is going tonight.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bridge Pause",
      "summary": "Cross a pedestrian-safe bridge and stop in the middle.",
      "why_it_hits": "Bridges make transition physical.",
      "instructions": "Walk to a safe bridge, pause where allowed, look both directions, name what you are leaving behind and what you are walking toward, then continue across.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cafe Without Your Usual Order",
      "summary": "Order something you have never tried at a familiar cafe.",
      "why_it_hits": "A small deviation keeps routine from hardening.",
      "instructions": "Go to a cafe you know, choose a drink or snack outside your pattern, sit long enough to taste it properly, and decide if it earns a second chance.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Friend's Playlist Walk",
      "summary": "Let someone else soundtrack your walk.",
      "why_it_hits": "Borrowed music changes familiar scenery.",
      "instructions": "Ask a friend for three songs or a short playlist, walk outside while listening, avoid skipping, and send them one sentence about the moment that matched best.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Hour Tourist",
      "summary": "Act like a visitor in your own town for one hour.",
      "why_it_hits": "Permission to look around changes everything.",
      "instructions": "Choose a central area, wear comfortable shoes, visit one landmark or viewpoint, read one sign, take one unhurried break, and ask what you would recommend to a guest.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Quiet Church Visit",
      "summary": "Sit inside a church, temple, or meditation hall open to visitors.",
      "why_it_hits": "Sacred spaces offer rare public quiet.",
      "instructions": "Find a place that welcomes respectful visitors, enter during open hours, sit silently for ten minutes, observe the architecture, and leave a donation only if you wish.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Lunch Counter Seat",
      "summary": "Eat at a counter instead of a table.",
      "why_it_hits": "It changes the social geometry of a meal.",
      "instructions": "Choose an affordable diner, cafe, market stall, or bar counter in daytime, order something simple, sit facing the action, and notice the rhythm of the workers.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Map the Smells",
      "summary": "Take a walk guided by scents.",
      "why_it_hits": "Smell creates strong, unexpected memories.",
      "instructions": "Walk a safe route for twenty minutes, stop whenever you notice a distinct scent, mentally mark where it is strongest, and choose the smell that best defines the area.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Sports Half-Hour",
      "summary": "Watch part of a casual local game.",
      "why_it_hits": "Community energy is easier to join as a witness.",
      "instructions": "Find a public park, school field, or community court with a game happening, watch respectfully for twenty to thirty minutes, cheer quietly if appropriate, and leave before it drags.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Oldest Thing Nearby",
      "summary": "Find the oldest visible object or building within a short walk.",
      "why_it_hits": "Age adds depth to ordinary surroundings.",
      "instructions": "Walk around your area looking for dates, materials, plaques, trees, or architectural clues, identify your best candidate, and verify it lightly if information is available.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Reverse Commute",
      "summary": "Travel opposite your normal direction during commute hours.",
      "why_it_hits": "It reveals another flow of the city.",
      "instructions": "At a safe daytime hour, take a bus, train, bike, or walk in the opposite direction from your routine for fifteen to thirty minutes, then come back by a different path.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Repair Mission",
      "summary": "Fix one small thing you have been ignoring.",
      "why_it_hits": "Visible completion creates momentum fast.",
      "instructions": "Choose a loose button, squeaky hinge, messy cable, flat bike tire, or wobbly item, gather only what you need, fix it today, and stop after one repair.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Payphone Ghost Hunt",
      "summary": "Search for an old payphone or phone booth.",
      "why_it_hits": "Obsolete objects make the present feel strange.",
      "instructions": "Look up or wander toward likely public spots, find a remaining payphone, phone booth, or empty mounting place, observe it like an artifact, and imagine one call made there.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "New Spice Dinner",
      "summary": "Cook with one spice or sauce you have never used.",
      "why_it_hits": "A tiny ingredient can change the whole evening.",
      "instructions": "Buy or borrow one affordable spice, condiment, or sauce, add it to a simple dish, taste carefully, and write the name on a note so it can enter your kitchen vocabulary.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cemetery Names Walk",
      "summary": "Walk respectfully through a cemetery and read names.",
      "why_it_hits": "It is quiet, grounding, and full of human traces.",
      "instructions": "Visit during open daytime hours, walk respectfully on paths, read a few inscriptions, notice dates and symbols, and leave without photographing private grief or disturbing anything.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Park Table Office",
      "summary": "Do one admin task at an outdoor table.",
      "why_it_hits": "Changing the setting makes boring work less stale.",
      "instructions": "Take one manageable task like paying a bill, replying to an email, or sorting a form, go to a park table or plaza seat, finish it, then close the device.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Dessert Map",
      "summary": "Compare two nearby sweet spots with a friend.",
      "why_it_hits": "A simple tasting becomes a shared mini-adventure.",
      "instructions": "Pick two affordable bakeries, ice cream shops, or grocery desserts within easy reach, split small items with someone, and declare a winner by texture, mood, and value.",
      "goal_tags": [
        "fun",
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Underpass Gallery",
      "summary": "Explore murals or posters under a public overpass.",
      "why_it_hits": "Edges of the city often hold raw visual energy.",
      "instructions": "Choose a safe, legal, daylight route near an underpass or viaduct, look for sanctioned art, layers of posters, and infrastructure details, and leave if the area feels unsafe.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Handwritten Recipe Trial",
      "summary": "Cook from a handwritten or family recipe.",
      "why_it_hits": "Food becomes a bridge to someone else's habits.",
      "instructions": "Ask someone for a simple recipe or use an old card, follow it as written as much as possible, and share a photo or taste with the person if appropriate.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bookstore First Lines",
      "summary": "Read first lines from ten books in a shop or library.",
      "why_it_hits": "It is literary speed dating without commitment.",
      "instructions": "Visit a bookstore or library, choose ten books from mixed sections, read only the first line of each, and pick the one that most makes you want a second sentence.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "City Hall Peek",
      "summary": "Visit a public government building just to see it.",
      "why_it_hits": "Civic spaces feel different when not tied to errands.",
      "instructions": "During open hours, enter city hall, a courthouse lobby, or a public office building where visitors are allowed, observe the architecture and signage, then leave without needing a reason.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Miniature Golf Mood",
      "summary": "Play mini golf, darts, bowling, or another low-stakes game.",
      "why_it_hits": "Structured silliness makes connection easy.",
      "instructions": "Invite one person or go solo, choose a cheap casual game venue, play one round without caring about scores, and make one dramatic celebration for your best shot.",
      "goal_tags": [
        "fun",
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Rain Walk Deluxe",
      "summary": "Take a short walk in rain with proper gear.",
      "why_it_hits": "Weather becomes atmosphere instead of inconvenience.",
      "instructions": "When rain is safe and mild, wear a jacket or bring an umbrella, walk for fifteen minutes, notice reflections and smells, then come home and change into dry clothes.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Ingredient Bakery Test",
      "summary": "Compare the same pastry from two places.",
      "why_it_hits": "Focused tasting sharpens everyday pleasure.",
      "instructions": "Choose one item like a croissant, cookie, or empanada, buy it from two nearby shops, taste both side by side, and pick the winner without turning it into a big project.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Public Fountain Pause",
      "summary": "Sit near a fountain, river, or water feature.",
      "why_it_hits": "Moving water softens city noise.",
      "instructions": "Find a public water feature, sit or stand nearby for ten minutes, watch the surface instead of your phone, and notice how the sound changes the space.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Unused Mug Cafe",
      "summary": "Bring a neglected mug to a friend's place for tea.",
      "why_it_hits": "Small objects can create cozy rituals.",
      "instructions": "Choose a mug you rarely use, bring it to a friend's home or invite them to yours, make any hot drink, and let the mug start a conversation about old belongings.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Domain Listening",
      "summary": "Listen to an old radio play or public-domain album outside.",
      "why_it_hits": "Old audio gives modern places a time-slip feeling.",
      "instructions": "Download a free old recording, take headphones to a park or bench, listen for twenty minutes, and imagine how the same place might have looked when it was made.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Side Street Breakfast",
      "summary": "Eat breakfast at a place you have passed but ignored.",
      "why_it_hits": "Morning discovery changes the whole day tone.",
      "instructions": "Choose a modest cafe, diner, bakery, or food stall on a street you rarely use, order breakfast or a drink, and sit long enough to watch the neighborhood wake up.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Free Event Drop-In",
      "summary": "Attend the first thirty minutes of a free local event.",
      "why_it_hits": "Low commitment makes community easier to sample.",
      "instructions": "Check a library, park, university, gallery, or community calendar, pick one free event today, attend for thirty minutes, and give yourself permission to leave politely afterward.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "The Compliment Detour",
      "summary": "Give one sincere compliment to someone you already know.",
      "why_it_hits": "Connection grows through specific noticing.",
      "instructions": "Think of a friend, coworker, neighbor, or family member you will see or message today, offer a concrete compliment about something real, and avoid making it a performance.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Pocket Notebook Field Trip",
      "summary": "Take notes in a public place for twenty minutes.",
      "why_it_hits": "Observation makes ordinary scenes feel alive.",
      "instructions": "Bring paper, sit in a cafe, park, lobby, or station, write down overheard fragments without identifying people, colors, movements, and one question the place raises.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Smallest Museum",
      "summary": "Visit a tiny museum, archive room, or historical house.",
      "why_it_hits": "Small institutions often feel personal and strange.",
      "instructions": "Find a little local museum with same-day hours, pay only if it fits your budget, spend under an hour, and ask yourself what object the place is secretly proudest of.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cross-Town Snack",
      "summary": "Travel to a different neighborhood for one snack.",
      "why_it_hits": "A single food can justify a mini journey.",
      "instructions": "Choose an affordable snack known in another area, travel there by foot, bike, or transit, eat it nearby, then return by a slightly different route.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "going_far"
      ]
    },
    {
      "title": "Balcony or Window Weather Report",
      "summary": "Watch the sky for fifteen uninterrupted minutes.",
      "why_it_hits": "It is calm without becoming an assignment.",
      "instructions": "Sit at a window, stoop, balcony, or doorway, watch clouds, light, wind, or passing shadows, and describe the weather in one sentence that sounds like a movie scene.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Unfamiliar Produce",
      "summary": "Buy and taste one fruit or vegetable new to you.",
      "why_it_hits": "Curiosity becomes edible.",
      "instructions": "Visit a grocery or market, choose one unfamiliar produce item within budget, ask or look up how to eat it safely, prepare it simply, and decide who might like it.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Friend Photo Walk",
      "summary": "Take a walk with a friend and photograph only textures.",
      "why_it_hits": "A shared constraint turns wandering into play.",
      "instructions": "Meet for thirty to sixty minutes, walk without a destination, each photograph five textures like brick, bark, fabric, metal, or peeling paint, then compare favorites over a quick drink or goodbye.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Bus Window Cinema",
      "summary": "Ride a bus route for scenery, not transportation.",
      "why_it_hits": "The window turns the city into a moving film.",
      "instructions": "Pick a route with safe daytime service, ride for twenty to forty minutes, sit by a window, notice three scenes, and get off somewhere easy to return from.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "One-Shelf Deep Dive",
      "summary": "Explore one shelf of your own books, games, or records.",
      "why_it_hits": "Forgotten possessions can feel newly borrowed.",
      "instructions": "Choose a single shelf at home, handle every item, pick one to revisit for fifteen minutes, and remove or relocate one thing that no longer belongs there.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Open Mic Witness",
      "summary": "Attend an open mic as an audience member.",
      "why_it_hits": "Vulnerability is contagious from the seats.",
      "instructions": "Find a cafe, bar, bookstore, or community open mic, go with a friend or solo, stay for at least three performers, clap generously, and avoid judging like a critic.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "group_social_situations",
        "nighttime"
      ]
    },
    {
      "title": "The Cheapest Menu Item",
      "summary": "Order the cheapest item at a new-to-you food spot.",
      "why_it_hits": "Budget limits make exploration accessible.",
      "instructions": "Pick a restaurant, food truck, or cafe you have never tried, order the lowest-priced food or drink you genuinely want, and assess the place by atmosphere as much as taste.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Public Garden Slow Lap",
      "summary": "Walk one slow lap through a garden or landscaped space.",
      "why_it_hits": "Designed nature rewards unhurried attention.",
      "instructions": "Visit a public garden, campus, courtyard, or park bed, walk slowly for twenty minutes, smell leaves or flowers where allowed, and choose the plant with the best personality.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Record Store Roulette",
      "summary": "Listen to one album chosen by its cover.",
      "why_it_hits": "Visual taste leads you into new sound.",
      "instructions": "Visit a record store or library music section, pick an album by cover alone, stream or preview it later today, and listen to at least three tracks without skipping.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Night Market Glow",
      "summary": "Visit an evening market or food street after dark.",
      "why_it_hits": "Nighttime makes familiar commerce feel festive.",
      "instructions": "Choose a safe, active night market, food truck row, or lit shopping street, go with someone if preferred, buy a small snack or just browse, and head home before you are tired.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Stoop Conversation",
      "summary": "Sit outside with someone you live near or with.",
      "why_it_hits": "Unplanned-feeling time can deepen easy connection.",
      "instructions": "Invite a roommate, partner, neighbor you already know, or friend to sit on a stoop, balcony, bench, or curb for twenty minutes with drinks, and let the talk wander.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Alternate Grocery Entrance",
      "summary": "Enter a familiar store from a different side or route.",
      "why_it_hits": "Small spatial changes wake up attention.",
      "instructions": "Go to a store you use often, approach from a street or entrance you rarely use, shop for only one needed item, and notice how the layout feels from the new angle.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Local Newsletter Treasure Hunt",
      "summary": "Follow one tip from a neighborhood newsletter or bulletin board.",
      "why_it_hits": "It connects you to the living calendar around you.",
      "instructions": "Check a local newsletter, flyer wall, library board, or community site, choose one small listing happening today, and show up or visit the mentioned place briefly.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Soup From Scratch-ish",
      "summary": "Make a simple soup using what you already have.",
      "why_it_hits": "It turns scraps into warmth and competence.",
      "instructions": "Search your kitchen for vegetables, beans, noodles, broth, or spices, make a basic soup without shopping if possible, and eat it from your best bowl.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Monument at Odd Angle",
      "summary": "Visit a known monument and view it from the least famous side.",
      "why_it_hits": "It challenges the postcard version of a place.",
      "instructions": "Go to a public monument, statue, or landmark, circle it fully if allowed, stand where tourists rarely stand, and notice repairs, backs, shadows, and surrounding daily life.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Shared Errand Playlist",
      "summary": "Create a two-person soundtrack for a boring outing.",
      "why_it_hits": "Music turns necessity into a tiny ritual.",
      "instructions": "Before an errand with a friend or partner, each choose three songs, play them on the way, and let every song own a different stretch of the trip.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Local Ingredient Ask",
      "summary": "Ask a shopkeeper you are already buying from how to use one item.",
      "why_it_hits": "Practical curiosity opens light connection.",
      "instructions": "At a market, deli, spice shop, or grocery counter, choose an unfamiliar item, ask the staff a simple use question while making a purchase, and try their suggestion today or soon.",
      "goal_tags": [
        "novelty",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "talking_to_strangers"
      ]
    },
    {
      "title": "Pocket Trash Hero",
      "summary": "Clean up one tiny public area for ten minutes.",
      "why_it_hits": "It creates visible good without grandstanding.",
      "instructions": "Bring gloves or a bag, choose a small safe area like a curb, park edge, or building front, pick up only safe litter for ten minutes, dispose of it properly, and wash up.",
      "goal_tags": [
        "momentum",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cheap Seat Performance",
      "summary": "Attend a low-cost student, community, or rehearsal performance.",
      "why_it_hits": "Live art makes a normal night feel charged.",
      "instructions": "Look for a same-day cheap ticket, donation show, campus performance, or open rehearsal, go alone or with someone, stay through the end, and talk about one standout moment afterward.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "nighttime"
      ]
    },
    {
      "title": "Window Shopping With Rules",
      "summary": "Browse shops without buying, using one specific theme.",
      "why_it_hits": "It makes consumption observational instead of automatic.",
      "instructions": "Pick a street with stores, choose a theme like lamps, jackets, notebooks, or blue objects, browse for thirty minutes, and select the imaginary winner without purchasing.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Transit Endcap",
      "summary": "Ride to the end of a short line and back.",
      "why_it_hits": "Terminus places feel quietly revealing.",
      "instructions": "Choose a safe, manageable bus or train line, ride to its final stop during daytime, step out for ten minutes if the area feels comfortable, then return.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Sundown Roofline Watch",
      "summary": "Watch the last light hit buildings.",
      "why_it_hits": "It turns evening into an event.",
      "instructions": "Find a safe public spot, window, hill, bridge, or parking deck with roofline views, arrive before sunset, watch colors shift for fifteen minutes, and leave before it gets too cold or late.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Foreign-Language Grocery Label",
      "summary": "Buy one packaged food with a label partly in another language.",
      "why_it_hits": "A pantry item becomes a doorway into another culture.",
      "instructions": "Visit an international grocery or aisle, choose a modest item you can understand enough to use safely, look up one word on the label, and taste or cook it today.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Rearrange One Corner",
      "summary": "Change one corner of your home for the day.",
      "why_it_hits": "A small spatial shift can refresh attention.",
      "instructions": "Pick one chair, plant, lamp, stack, or table corner, move or reset it in under thirty minutes, use the new setup once today, and leave bigger redecorating for another time.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friend's Neighborhood Tour",
      "summary": "Ask a friend to show you three ordinary spots near them.",
      "why_it_hits": "You see someone through their daily map.",
      "instructions": "Visit a friend's area, ask them to show you a favorite bench, shop, shortcut, tree, or view, keep it under an hour, and share one spot from your world another day.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Clock Hunt",
      "summary": "Find three public clocks and compare their moods.",
      "why_it_hits": "Timekeeping becomes architecture.",
      "instructions": "Walk through a downtown, station, campus, or shopping area, look for clocks on towers, walls, signs, or displays, and decide which one seems most trustworthy.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Pan Experiment",
      "summary": "Cook dinner using only one pan and no recipe.",
      "why_it_hits": "Creative limits reduce decision fatigue.",
      "instructions": "Choose ingredients you already have or buy two cheap ones, make a simple one-pan meal, season boldly but safely, and name the dish even if it is imperfect.",
      "goal_tags": [
        "creativity",
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Poetry Shelf Hit",
      "summary": "Read three poems in a library or bookstore.",
      "why_it_hits": "Short writing can land hard in little time.",
      "instructions": "Find the poetry section, pick any book, read three poems standing or seated, copy down one line by hand if allowed, and leave with that line in your head.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Outdoor Phone Call Walk",
      "summary": "Call someone while walking outside.",
      "why_it_hits": "Movement makes conversation feel easier.",
      "instructions": "Choose someone you already know, ask if they have fifteen minutes, walk a calm route while you talk, and end the call before either of you starts multitasking.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Unvisited Park Gate",
      "summary": "Enter a familiar park through a gate you never use.",
      "why_it_hits": "New entry points create new stories.",
      "instructions": "Go to a park you know, approach from an unfamiliar side, enter there, take a loop you have not taken before, and exit somewhere different if practical.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Kitchen Table Tasting",
      "summary": "Host a tiny tasting of three versions of one food.",
      "why_it_hits": "Focused comparison makes simple food social.",
      "instructions": "Invite one or two people or do it solo, gather three teas, apples, chips, cheeses, chocolates, or crackers, taste them side by side, and invent categories beyond best and worst.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "social"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Stationery Field Trip",
      "summary": "Visit a stationery or art-supply aisle for one useful tool.",
      "why_it_hits": "Materials invite future making without demanding it.",
      "instructions": "Browse a stationery shop, dollar store, or art aisle, choose one pen, paper, tape, or folder under a small budget, and use it once before the day ends.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "City Steps Reading",
      "summary": "Read ten pages on public steps or a plaza.",
      "why_it_hits": "A private act becomes lightly public.",
      "instructions": "Bring a book or borrowed magazine, find safe public steps, a plaza ledge, or amphitheater seat, read ten pages, and look up between pages to absorb the setting.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Sincere Thank-You Note",
      "summary": "Write and deliver or send one specific thank-you.",
      "why_it_hits": "Gratitude feels better when it has an address.",
      "instructions": "Choose someone who helped you in a concrete way, write three to five sentences by hand or message, send it today, and do not ask for anything in return.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Odd Statue Biography",
      "summary": "Invent a life story for a public statue or mascot.",
      "why_it_hits": "It adds narrative to a fixed object.",
      "instructions": "Find a statue, storefront figure, mural character, or public mascot, observe details for five minutes, then create a short backstory about where it came from and what it wants.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Shortcut Test",
      "summary": "Test whether a suspected shortcut is actually shorter.",
      "why_it_hits": "It turns efficiency into exploration.",
      "instructions": "Choose two nearby points you often travel between, take your normal route one way and a possible shortcut back, time both casually, and decide which route has better scenery.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Evening Window Lights Walk",
      "summary": "Walk after dusk to notice lit windows and storefronts.",
      "why_it_hits": "The city becomes intimate at night.",
      "instructions": "Choose a safe, well-lit route and go with someone if preferred, walk for twenty minutes, look at light patterns without intruding, and return before the area empties out.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Borrow a Skill Snack",
      "summary": "Let a friend teach you one tiny skill.",
      "why_it_hits": "Learning feels warmer when it is personal.",
      "instructions": "Ask someone to show you a small thing they know, like folding dumplings, tying a knot, chess opening, plant cutting, or camera setting, practice for twenty minutes, and thank them properly.",
      "goal_tags": [
        "connection",
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "with_other_people",
        "at_home",
        "near_home"
      ],
      "type_tags": [
        "social",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Single-Object Clean",
      "summary": "Clean one object until it looks noticeably better.",
      "why_it_hits": "A small shine gives immediate payoff.",
      "instructions": "Pick shoes, a kettle, mirror, bike chain, keyboard, sink, or lamp, clean only that object with safe supplies, stop when improvement is visible, and enjoy the before-after privately.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Hotel Lobby Posture",
      "summary": "Sit briefly in a grand public lobby or atrium.",
      "why_it_hits": "Borrowed elegance changes your pace.",
      "instructions": "Find a hotel, office atrium, mall, or cultural building where public sitting is allowed, sit for ten minutes, observe the choreography of arrivals, and leave respectfully without pretending to be a guest.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Farmer's Market Question",
      "summary": "Ask one vendor about the best way to eat something seasonal.",
      "why_it_hits": "Seasonality becomes a conversation, not a concept.",
      "instructions": "Visit a market, buy or consider one affordable item, ask the vendor how they like to prepare it, and try the idea or save it for your next meal.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Two-Bridges Loop",
      "summary": "Make a walking loop using two bridges or crossings.",
      "why_it_hits": "Loops feel complete and gently adventurous.",
      "instructions": "Find two safe crossings over water, tracks, or a major road, walk out on one and back on the other, and pause once to watch movement below.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "No-Phone First Mile",
      "summary": "Begin a walk with your phone hidden for the first mile or fifteen minutes.",
      "why_it_hits": "It breaks the reflex to mediate everything.",
      "instructions": "Choose a safe familiar route, silence and pocket your phone, walk until your chosen mark, then check it only if needed and notice what boredom revealed.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Notice Board Browse",
      "summary": "Read flyers on a community bulletin board.",
      "why_it_hits": "Flyers expose the odd ecosystem of local life.",
      "instructions": "Find a board at a library, cafe, campus, grocery, or community center, read at least ten flyers, and choose the event, lost item, or service that feels most intriguing.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Tea Ceremony",
      "summary": "Make tea with deliberate attention for yourself or someone else.",
      "why_it_hits": "A common drink becomes a quiet ritual.",
      "instructions": "Choose any tea or herb, heat water carefully, use a cup you like, sit down while it steeps, and drink without doing another task for the first five minutes.",
      "goal_tags": [
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Different Door Dinner",
      "summary": "Pick up dinner through a window, counter, or market stall.",
      "why_it_hits": "Changing the transaction changes the night.",
      "instructions": "Choose an affordable takeout window, food cart, deli counter, or market stall you have not tried, order one simple item, and eat it somewhere nearby rather than rushing home.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "talking_to_strangers",
        "nighttime"
      ]
    },
    {
      "title": "Tiny Donation Drop",
      "summary": "Donate one useful item to a local collection point.",
      "why_it_hits": "Letting go becomes an outward-facing action.",
      "instructions": "Choose one clean, useful book, coat, pantry item, or household object, confirm a nearby donation box or shop accepts it today, deliver it, and resist turning it into a whole purge.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Themed Commute Outfit",
      "summary": "Dress around one subtle theme for the day.",
      "why_it_hits": "Private style play can change your energy.",
      "instructions": "Choose a low-key theme like navy, old movie, gardener, sharp shoes, or soft textures, build an outfit from what you own, wear it for a normal outing, and notice how you carry yourself.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Secret Ingredient Potluck for Two",
      "summary": "Cook or buy one dish containing a mystery ingredient for a friend.",
      "why_it_hits": "A tiny reveal adds play to eating together.",
      "instructions": "Invite one person, prepare or buy a simple snack with one non-allergenic secret ingredient, have them guess after tasting, then switch roles another time if they enjoy it.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Arcade Ten Tokens",
      "summary": "Play a few old-school arcade or pinball games.",
      "why_it_hits": "Physical games create quick, vivid fun.",
      "instructions": "Find an arcade, barcade, bowling alley, or pizza place with machines, set a strict small budget, play until it is gone, and celebrate one ridiculous failure.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Park Ranger Question",
      "summary": "Ask a park worker or volunteer one practical question.",
      "why_it_hits": "Local expertise makes a place come alive.",
      "instructions": "At a park, garden, museum, or nature center, approach only if staff are available, ask about a trail, tree, bird, or feature, thank them, and follow one suggestion if easy.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Table for One Upgrade",
      "summary": "Take yourself out for a modest solo meal.",
      "why_it_hits": "Solo public ease is a quiet confidence move.",
      "instructions": "Choose a casual place within budget, ask for a table or counter seat, order something you want, stay off your phone for the first ten minutes, and leave when satisfied.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Lost-and-Found Memory Box",
      "summary": "Gather five small objects from your home that tell a story.",
      "why_it_hits": "Everyday things become personal artifacts.",
      "instructions": "Choose five objects smaller than your hand, place them together, write or speak one sentence about each, then return them or keep the temporary exhibit for the day.",
      "goal_tags": [
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Evening Class Taster",
      "summary": "Drop into a beginner class, workshop, or trial session.",
      "why_it_hits": "Trying a room before committing lowers the stakes.",
      "instructions": "Find a same-day beginner session like dance, pottery, language, yoga, chess, or cooking, confirm cost and level, attend with curiosity, and let being new be part of the point.",
      "goal_tags": [
        "novelty",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 2,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "group_social_situations",
        "nighttime"
      ]
    },
    {
      "title": "Bike Rack Census",
      "summary": "Observe what bikes in one area reveal about local life.",
      "why_it_hits": "Ordinary infrastructure becomes social data.",
      "instructions": "Visit a station, campus, or shopping street, look at bikes or scooters for ten minutes without touching, notice locks, baskets, stickers, and wear, and infer what riders need there.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "New Route to an Old Friend",
      "summary": "Visit someone using a route you have never taken.",
      "why_it_hits": "Connection and exploration stack together.",
      "instructions": "When meeting a friend or family member, plan a different route by transit, walking, or bike, leave a little extra time, and tell them one thing you saw on the way.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mini Language Mission",
      "summary": "Learn five useful words connected to a place you visit.",
      "why_it_hits": "Language adds texture to exploration.",
      "instructions": "Before or during a visit to an international market, restaurant, cultural center, or neighborhood, learn five relevant words, use none unless appropriate, and notice them on signs or labels.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "did_something_unusual"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Slowest Elevator",
      "summary": "Ride an old public elevator just for the atmosphere.",
      "why_it_hits": "Mechanical spaces can feel like time capsules.",
      "instructions": "Find a safe public elevator in a library, department store, station, or old building, ride up and down once with a real purpose or public access, and notice sounds, buttons, and pace.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friendship Voice Memo",
      "summary": "Send a short voice note instead of a text.",
      "why_it_hits": "Hearing a voice adds warmth without scheduling.",
      "instructions": "Pick someone you genuinely like, record a voice memo under one minute with a small update or memory, send it, and do not worry about sounding polished.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Sculpture Pose",
      "summary": "Quietly mirror the pose of a statue or sculpture.",
      "why_it_hits": "It brings humor into your body without big risk.",
      "instructions": "Find a public sculpture, check that you are not blocking anyone, hold a subtle version of its pose for ten seconds, and move on with dignity or laughter.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Grocery Receipt Poem",
      "summary": "Turn a receipt into a tiny poem at home or in a cafe.",
      "why_it_hits": "Everyday language becomes raw material.",
      "instructions": "Save a receipt, circle interesting words, rearrange or copy them into a short poem, and keep it private unless you feel like sharing with one person.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Harbor or Trainyard Gaze",
      "summary": "Watch a working edge of the city from a safe public spot.",
      "why_it_hits": "Seeing systems move can feel strangely energizing.",
      "instructions": "Find a legal viewpoint of a harbor, rail yard, bus depot, airport approach, or loading dock, watch for twenty minutes, and trace how goods or people move through the scene.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Dollar Upgrade",
      "summary": "Improve one daily routine with the smallest purchase possible.",
      "why_it_hits": "Tiny investments can feel disproportionately satisfying.",
      "instructions": "Set a very small budget, buy something like a lemon, candle, hook, cloth, stamp, or binder clip, use it today to improve a meal, room, errand, or desk.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Neighborhood Flag Hunt",
      "summary": "Notice flags, banners, and symbols around you.",
      "why_it_hits": "Public identity becomes visible once you look.",
      "instructions": "Walk through a few blocks, count flags, team banners, religious symbols, civic signs, or decorative pennants, and choose the one whose story you most want to understand.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Stop Invitation",
      "summary": "Invite someone to join you for only one stop, drink, or loop.",
      "why_it_hits": "Small invitations are easier to accept.",
      "instructions": "Text someone nearby with a specific, low-pressure offer like one coffee, one park loop, or one errand, keep it brief if they say yes, and enjoy the compactness.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "followed_impulses"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old-School Photo Booth",
      "summary": "Take a photo strip alone or with someone.",
      "why_it_hits": "The physical strip makes a tiny souvenir.",
      "instructions": "Find a photo booth in a mall, arcade, bar, station, or cinema, pay only if reasonable, take one strip, and keep it somewhere visible or give a frame to your companion.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Local Podcast Walk",
      "summary": "Listen to an episode about your city while walking in it.",
      "why_it_hits": "Context overlays place with new meaning.",
      "instructions": "Choose a local history, news, food, or culture episode, walk somewhere related or simply nearby, listen for twenty to forty minutes, and pause when a place mentioned intersects your route.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Try the Lunch Special",
      "summary": "Order a weekday special you would usually skip.",
      "why_it_hits": "It lets someone else's plan choose for you.",
      "instructions": "Go to a casual restaurant, cafe, cafeteria, or food truck, pick the posted special if it fits your diet and budget, and let the surprise be part of the meal.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Found Shadow Walk",
      "summary": "Look for interesting shadows at a specific time of day.",
      "why_it_hits": "Light turns the street into temporary art.",
      "instructions": "Go out in morning or late afternoon sun, walk for twenty minutes, look for shadows from fences, trees, signs, and people, and pick the most dramatic one before it disappears.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Community Garden Fence Tour",
      "summary": "Walk around a community garden and read its signs.",
      "why_it_hits": "Shared growing spaces reveal local care.",
      "instructions": "Find a community garden with public paths or visible fencing, visit respectfully without entering private plots unless invited, read posted rules or names, and notice what is thriving.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Almost-Empty Fridge Meal",
      "summary": "Make a meal from the last bits before shopping.",
      "why_it_hits": "Resourcefulness feels satisfying and low-cost.",
      "instructions": "Look through your fridge and pantry, choose three odds and ends, turn them into a toast, bowl, omelet, pasta, salad, or soup, and avoid shopping until after you eat.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Landmark at Blue Hour",
      "summary": "Visit a landmark just after sunset.",
      "why_it_hits": "Blue hour makes familiar places cinematic.",
      "instructions": "Pick a safe, well-lit landmark, arrive around dusk with a friend if preferred, stay for the deepening blue light, take in the atmosphere, then head home before it gets late.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Museum Gift Shop Only",
      "summary": "Visit a museum gift shop without seeing the museum.",
      "why_it_hits": "Gift shops are condensed versions of culture.",
      "instructions": "Choose a museum or gallery shop open to the public, browse books, cards, replicas, and odd souvenirs, buy nothing or one small item, and infer the museum's personality.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Question Dinner",
      "summary": "Share a meal where everyone answers one real question.",
      "why_it_hits": "Structure creates depth without heaviness.",
      "instructions": "Eat with one or more people, ask one question like what place shaped you, what object would you save, or what skill do you envy, and let each person answer without debate.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Fifteen-Minute Floor Reset",
      "summary": "Clear the visible floor in one room.",
      "why_it_hits": "Fast physical change can lift the whole space.",
      "instructions": "Set a fifteen-minute timer, pick up only items on the floor of one room or hallway, return or contain them, and stop when the timer ends even if the room is not perfect.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "growth_edge"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Corner Landmark Drawing",
      "summary": "Draw one local landmark on an envelope or scrap.",
      "why_it_hits": "Drawing makes place personal, not just seen.",
      "instructions": "Sit where you can view a shop sign, tower, tree, bridge, or mailbox, sketch it for ten minutes, add the date and location, and keep or mail it.",
      "goal_tags": [
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Late-Night Diner Slice",
      "summary": "Have a safe late snack under bright diner lights.",
      "why_it_hits": "Night food carries a different kind of story.",
      "instructions": "Choose a reputable late-night diner, pizza slice shop, or dessert place in a busy safe area, go with someone if possible, order one small thing, and return directly home afterward.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "nighttime"
      ]
    },
    {
      "title": "Take the Scenic Escalator",
      "summary": "Find a dramatic escalator, stair, or ramp and ride or walk it.",
      "why_it_hits": "Urban movement can be surprisingly theatrical.",
      "instructions": "Visit a mall, station, museum, library, or public building with an interesting vertical path, use it slowly without blocking others, and notice the view shift as you move.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Unread Manual Adventure",
      "summary": "Read the manual for one device you already own.",
      "why_it_hits": "You may unlock a hidden feature in plain sight.",
      "instructions": "Choose a camera, appliance, bike light, app setting, or tool, read the quick guide or manual for fifteen minutes, and try one feature you have never used.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Cheese or Bread Board",
      "summary": "Build a tiny board from two nearby shops.",
      "why_it_hits": "It makes ordinary shopping feel curated.",
      "instructions": "Buy bread, cheese, fruit, olives, or crackers from one or two local places within a small budget, arrange them nicely at home or in a park, and share if you can.",
      "goal_tags": [
        "novelty",
        "creativity",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Bird Hour",
      "summary": "Spend twenty minutes watching birds in one spot.",
      "why_it_hits": "Wildlife appears when you stop rushing.",
      "instructions": "Go to a park, waterfront, courtyard, or window, stay still for twenty minutes, identify birds if you can, and pay attention to behavior more than names.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Unsent Postcard",
      "summary": "Write a postcard to your future self and keep it.",
      "why_it_hits": "It captures the day without becoming journaling homework.",
      "instructions": "Use a postcard or scrap card, write where you are, what the weather is, and one thing you want remembered, then tuck it into a book or drawer to find later.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Rooftop Without Drama",
      "summary": "Visit a legal public rooftop or high terrace.",
      "why_it_hits": "Elevation gives everyday life a bigger frame.",
      "instructions": "Find a public rooftop garden, library terrace, mall deck, or observation area, confirm access, spend ten minutes looking outward, and avoid restricted or unsafe roofs.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mini Roadside Attraction",
      "summary": "Visit a weird local landmark or oversized object.",
      "why_it_hits": "Odd places make easy stories.",
      "instructions": "Search for a quirky but legal nearby landmark, statue, giant sign, historic marker, or novelty building, travel there within your limits, take it in, and learn one fact.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Borrowed Recipe Lunch",
      "summary": "Ask a friend what they make when they are tired, then make it.",
      "why_it_hits": "Everyday recipes reveal real lives.",
      "instructions": "Text someone for their easiest satisfying meal, choose one that fits your budget and diet, make it today, and report back with thanks and a rating for comfort.",
      "goal_tags": [
        "connection",
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Familiar Street Backward",
      "summary": "Walk a common route in the opposite direction.",
      "why_it_hits": "Reverse order makes details jump out.",
      "instructions": "Choose a route you often walk, start from the usual endpoint, move slowly back to the start, and look for signs, trees, windows, and slopes you usually miss.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Community Board RSVP",
      "summary": "Commit to one future event from a flyer you find today.",
      "why_it_hits": "A tiny plan seeds future novelty.",
      "instructions": "Browse a local board or online calendar, choose one event within the next two weeks that genuinely interests you, put it on your calendar, and invite one person only if it helps.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The No-Menu Choice",
      "summary": "Let a trusted friend choose your cafe order.",
      "why_it_hits": "Handing off a tiny decision feels freeing.",
      "instructions": "Go with someone who knows your dietary limits, let them choose one drink or snack for you within a budget, accept it graciously, and swap roles if they want.",
      "goal_tags": [
        "novelty",
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Mailbox Walk",
      "summary": "Walk to a farther mailbox to send something small.",
      "why_it_hits": "An errand becomes a purposeful stroll.",
      "instructions": "Write a note, return a form, or mail a postcard, choose a mailbox farther than your nearest one, walk there, drop it in, and take a different route back.",
      "goal_tags": [
        "novelty",
        "momentum",
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "One-Hour Craft Borrow",
      "summary": "Try a craft using borrowed or household materials.",
      "why_it_hits": "Making with limits reduces perfectionism.",
      "instructions": "Use paper, thread, cardboard, tape, fabric scraps, or borrowed supplies to make one small object in under an hour, then display or use it today.",
      "goal_tags": [
        "creativity",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Outdoor Chess Watch",
      "summary": "Watch or play a casual public chess game.",
      "why_it_hits": "Public strategy has a quiet intensity.",
      "instructions": "Find a park, library, cafe, or community space with chess tables or boards, watch respectfully or play one low-stakes game, and leave before competitiveness takes over.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Newspaper Classifieds Dive",
      "summary": "Read classifieds, community listings, or missed connections.",
      "why_it_hits": "Tiny ads reveal hidden human plots.",
      "instructions": "Find a local paper or website, browse listings for fifteen minutes, choose the most intriguing ad or announcement, and imagine the scene around it.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Forgotten Playlist",
      "summary": "Listen to an old playlist while revisiting a matching place.",
      "why_it_hits": "Music can collapse time in a powerful way.",
      "instructions": "Choose a playlist from a past season of your life, take a walk or transit ride while listening, and visit one place that fits the era if it is easy and safe.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Harmless Dare Dinner",
      "summary": "Let each person add one harmless rule to a shared meal.",
      "why_it_hits": "Rules create laughter without chaos.",
      "instructions": "Eat with friends or family, let each person suggest one mild rule like no phones, everyone uses a different utensil, or describe the food like critics, and keep it kind.",
      "goal_tags": [
        "fun",
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social",
        "creative"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Library Event Sample",
      "summary": "Attend a library talk, club, demo, or screening.",
      "why_it_hits": "Libraries make trying things unusually low-pressure.",
      "instructions": "Check today's library calendar, choose an event that is free and open, attend for at least half of it, and browse one related shelf afterward.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "The Shortest Hike",
      "summary": "Find a nature trail under one mile and complete it.",
      "why_it_hits": "It delivers outdoor satisfaction without a big expedition.",
      "instructions": "Look up a short, safe trail or park loop nearby, bring water and appropriate shoes, walk it at an easy pace, and stop for one view or plant along the way.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Fashion Archive",
      "summary": "Ask someone you know about an old clothing item they kept.",
      "why_it_hits": "Clothes hold identity and memory.",
      "instructions": "Invite a friend or family member to show you one old garment, accessory, or pair of shoes, ask where it came from, and share one item of your own if you like.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Free Sample Field Notes",
      "summary": "Taste a free sample or demo food and actually consider it.",
      "why_it_hits": "A tiny public offering becomes mindful and social.",
      "instructions": "Visit a market or store that offers samples without pressure, try one if available and safe for you, thank the person, and decide whether the taste surprised you.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "One Object Museum Label",
      "summary": "Write a museum label for something in your home.",
      "why_it_hits": "It turns your belongings into artifacts.",
      "instructions": "Choose one ordinary object, write a short label with title, date or guess, material, origin, and significance, place it beside the object for the day.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Hill Quest",
      "summary": "Find the highest nearby point you can reach safely.",
      "why_it_hits": "A view gives a small sense of conquest.",
      "instructions": "Use a map or your eyes to locate a hill, overpass, park rise, or upper street, walk there at a comfortable pace, look out, and return before fatigue.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "physically_demanding"
      ]
    },
    {
      "title": "Cinema Lobby Watch",
      "summary": "Visit a movie theater lobby and choose a future film.",
      "why_it_hits": "Anticipation has its own pleasure.",
      "instructions": "Go to a cinema, browse posters and showtimes without needing to buy a ticket, pick one movie you would actually see, and note who might enjoy it with you.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friend Book Swap",
      "summary": "Swap one book, comic, or magazine with someone for a week.",
      "why_it_hits": "Taste becomes a shared object.",
      "instructions": "Ask a friend to trade something readable, exchange in person if possible, explain why you chose yours, and read at least five pages of theirs today.",
      "goal_tags": [
        "connection",
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "with_other_people",
        "solo",
        "at_home"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Under-Ten-Minute Dance",
      "summary": "Play three songs and dance at home or outside somewhere private.",
      "why_it_hits": "It shifts energy quickly without needing skill.",
      "instructions": "Choose three songs, clear a little space, move however feels good for the full set, and if outside, pick a private or low-traffic place where you feel comfortable.",
      "goal_tags": [
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Train Station Coffee",
      "summary": "Drink coffee or tea in a station without traveling far.",
      "why_it_hits": "Stations carry possibility even when you stay local.",
      "instructions": "Visit a train, bus, or ferry station with public seating, buy or bring a drink, sit for fifteen minutes watching departures, and imagine one trip you could take someday.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Five-Senses Lunch",
      "summary": "Eat one meal outside and notice each sense once.",
      "why_it_hits": "It makes a normal meal more vivid.",
      "instructions": "Take lunch to a bench, courtyard, stoop, or park, notice one sight, sound, smell, texture, and taste, then finish the meal normally without turning it into an exercise.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "New Taboo Topic, Softly",
      "summary": "Discuss a rarely asked but safe question with someone close.",
      "why_it_hits": "Intimacy grows when conversation leaves autopilot.",
      "instructions": "With a trusted person, ask a gentle unusual question like what era would you visit, what job seems secretly hard, or what family habit shaped you, and listen without interrogating.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Art Supply Window Test",
      "summary": "Choose a color you are drawn to and use it today.",
      "why_it_hits": "Color can steer creativity quickly.",
      "instructions": "Visit an art, craft, or stationery aisle or use supplies at home, pick one color, make a small mark, note, doodle, outfit accent, or meal choice built around it.",
      "goal_tags": [
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Podcast Guest Hunt",
      "summary": "Find a local person mentioned online and visit their public work.",
      "why_it_hits": "It connects names to real places.",
      "instructions": "Listen to or read a local interview, choose a guest with a public shop, mural, book, menu, or project, visit or sample it today if accessible, and keep expectations modest.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Morning Market Before the Rush",
      "summary": "Arrive at a market right when it opens.",
      "why_it_hits": "Early hours reveal setup energy.",
      "instructions": "Check opening time for a farmers market, flea market, or food hall, arrive near the start, walk one full lap before buying, and notice what vendors do before crowds arrive.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Tiny Apology",
      "summary": "Offer one clean apology for a small real thing.",
      "why_it_hits": "It clears static in a relationship.",
      "instructions": "Choose a minor moment you genuinely regret, send or say a brief apology with no excuses and no demand for reassurance, then let the other person respond or not.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old Building Doorways",
      "summary": "Look for beautiful or unusual entrances in an older area.",
      "why_it_hits": "Doorways hint at lives behind them.",
      "instructions": "Walk a street with older buildings during daylight, photograph or simply notice doors, handles, tiles, buzzers, and thresholds from public space, and pick your favorite entry.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cooking Show Copycat",
      "summary": "Make the simplest dish from a cooking video without buying special gear.",
      "why_it_hits": "Watching turns into doing before inspiration fades.",
      "instructions": "Choose a short cooking video with basic ingredients, simplify it if needed, cook it today, and accept a rough version rather than hunting for perfection.",
      "goal_tags": [
        "creativity",
        "momentum",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Five-Minute Performance",
      "summary": "Perform a song, poem, or reading for one trusted person.",
      "why_it_hits": "A tiny audience makes expression feel real.",
      "instructions": "Choose something under five minutes, invite someone kind to listen, perform it without apologizing first, and let the moment end with thanks rather than critique.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "City Map Without GPS",
      "summary": "Navigate a short route using posted maps or memory.",
      "why_it_hits": "It rebuilds confidence in your sense of direction.",
      "instructions": "Pick a simple destination within safe reach, put GPS away after checking basics, navigate using street signs, landmarks, and transit maps, and use your phone only if genuinely lost.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Seasonal Shelf Refresh",
      "summary": "Put one seasonal object where you can see it.",
      "why_it_hits": "It marks time passing in a tangible way.",
      "instructions": "Find or buy cheaply one seasonal item like citrus, pinecone, flower, shell, candle, leaf, or fabric, place it on a shelf or table, and let it change the room's mood.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Reading Aloud",
      "summary": "Read a short passage aloud in a quiet outdoor spot.",
      "why_it_hits": "Your voice in open air feels different.",
      "instructions": "Choose a poem, letter, page, or speech, find a low-traffic park corner or waterside spot, read it aloud softly once, and notice which line feels best spoken.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Shop Gift",
      "summary": "Buy or make a tiny gift from one nearby shop.",
      "why_it_hits": "Specific generosity feels lively and concrete.",
      "instructions": "Think of someone, visit one store or use one material source, choose a small item under a set budget that suits them, and give or mail it without waiting for an occasion.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Hidden Courtyard Search",
      "summary": "Find a public courtyard, atrium, or pocket plaza.",
      "why_it_hits": "Semi-hidden spaces feel like urban secrets.",
      "instructions": "Walk through a downtown, campus, hospital, museum district, or shopping area, look for publicly accessible inner spaces, sit for five minutes in one, and respect all posted rules.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Two-Person Memory Walk",
      "summary": "Walk past a place tied to a shared memory.",
      "why_it_hits": "Place helps stories resurface naturally.",
      "instructions": "Invite someone connected to a school, job, restaurant, park, or old apartment area, walk by together if practical, and trade details each of you remembers differently.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "No-Buy Mall Drift",
      "summary": "Walk through a mall as a climate-controlled promenade.",
      "why_it_hits": "Commercial spaces become social landscapes.",
      "instructions": "Go to a mall or shopping arcade, set a no-buy or tiny-buy rule, walk both levels or wings, people-watch respectfully, and choose the storefront with the strongest atmosphere.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "low_energy"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Home Soundtrack Reset",
      "summary": "Play one full album while doing nothing productive.",
      "why_it_hits": "It gives music your whole attention again.",
      "instructions": "Choose an album you do not know well or used to love, sit or lie down, listen from start to finish or at least one side, and avoid scrolling during the first three tracks.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Soup Run",
      "summary": "Try soup from a local spot and eat it slowly.",
      "why_it_hits": "Soup is comfort with a sense of place.",
      "instructions": "Find an affordable soup at a cafe, deli, market, or restaurant, eat it there or nearby, notice broth, texture, and warmth, and save the place for future cold days.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Public Domain Drawing Class",
      "summary": "Use a free online lesson in a park or library.",
      "why_it_hits": "Skill practice feels less boxed-in outside home.",
      "instructions": "Find a short free drawing tutorial, bring paper and pencil to a library table, park bench, or cafe, follow it for twenty minutes, and keep the result regardless of quality.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Evening Walk With Rules",
      "summary": "Walk at dusk using one sensory rule.",
      "why_it_hits": "A rule makes the fading day vivid.",
      "instructions": "Choose a safe route, decide on a rule like follow warm lights, turn toward music, or notice reflections, walk for twenty minutes, and stop if the area feels unsafe.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Community Pool Toe-Dip",
      "summary": "Visit a public pool, beach, or splash area briefly.",
      "why_it_hits": "Water changes the body's sense of the day.",
      "instructions": "Check hours and cost, bring essentials, swim or simply sit with feet near water for thirty to sixty minutes, and leave before the outing becomes a production.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Local Specialty Search",
      "summary": "Find one food your area is known for and try a modest version.",
      "why_it_hits": "It connects taste to place identity.",
      "instructions": "Look up or ask what local dish, pastry, drink, or ingredient is associated with your area, buy an affordable version, and learn one sentence about its origin.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Silent Bookstore Date",
      "summary": "Browse books beside someone without talking for fifteen minutes.",
      "why_it_hits": "Companionable silence can feel intimate.",
      "instructions": "Go with a friend or partner to a bookstore or library, split up or browse side by side silently, each choose one book to show the other, then talk afterward.",
      "goal_tags": [
        "connection",
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Trash-to-Use Upgrade",
      "summary": "Turn one recyclable container into something useful.",
      "why_it_hits": "Improvising usefulness is quietly satisfying.",
      "instructions": "Pick a clean jar, box, tin, or bag, remove labels if desired, turn it into storage, a vase, a planter, or a travel kit, and use it today.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Lecture Wild Card",
      "summary": "Attend a talk on a subject you know almost nothing about.",
      "why_it_hits": "Unfamiliar expertise can be surprisingly energizing.",
      "instructions": "Find a university, library, museum, or bookstore talk today, choose a topic outside your lane, stay for the main portion, and write down one term to look up later.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Nearby Border Crossing",
      "summary": "Cross a neighborhood, district, or town border on purpose.",
      "why_it_hits": "Invisible lines become part of your mental map.",
      "instructions": "Find a nearby boundary on a map, walk, bike, or transit across it, notice whether anything changes, and take a brief pause just over the line.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Three-Ingredient Cocktail or Mocktail",
      "summary": "Mix a simple drink from three ingredients.",
      "why_it_hits": "It adds ceremony to an ordinary evening.",
      "instructions": "Use what you have or buy one cheap ingredient, combine three safe ingredients into a cocktail, mocktail, spritz, or tea drink, serve it nicely, and name it after the day.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Theater Poster Walk",
      "summary": "Find posters for live shows and choose one imaginary ticket.",
      "why_it_hits": "Posters hint at the city's creative pulse.",
      "instructions": "Walk near theaters, campuses, cafes, or arts districts, read show posters and flyers, pick the one you would attend if time and money aligned, and note the date.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cookbook Random Page",
      "summary": "Open a cookbook at random and make something inspired by it.",
      "why_it_hits": "Chance bypasses dinner indecision.",
      "instructions": "Use a cookbook or library cookbook, open randomly, choose the closest feasible recipe or element, make a simplified version today, and do not shop for rare ingredients.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Night Sky Name One Thing",
      "summary": "Go outside at night and identify one celestial object.",
      "why_it_hits": "The sky widens the day without needing travel.",
      "instructions": "Choose a safe viewing spot, use an astronomy app or simple guide, identify the moon phase, a planet, constellation, or bright star, and look without the app for a full minute.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Pay Attention to Doors Closing",
      "summary": "Spend fifteen minutes in a station watching departures.",
      "why_it_hits": "Departures create small emotional scenes.",
      "instructions": "Visit a transit station, sit where allowed, watch trains, buses, or ferries leave, notice gestures and timing, and leave before the watching feels intrusive.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Public Thank You",
      "summary": "Thank someone whose work you usually pass silently.",
      "why_it_hits": "It adds warmth to routine transactions.",
      "instructions": "During a normal interaction with a cashier, driver, cleaner, librarian, receptionist, or barista, offer a specific, brief thank you, then move on without forcing conversation.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "Houseplant Field Trip",
      "summary": "Take one plant outside for fresh light or cleaning.",
      "why_it_hits": "Care becomes visible and a little comic.",
      "instructions": "If safe for the plant, bring it to a balcony, stoop, courtyard, or window area, wipe leaves or water it, let it sit briefly in appropriate light, and return it.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Archive Scan",
      "summary": "Digitize or photograph five old papers or photos.",
      "why_it_hits": "Preserving fragments gives the past a safer home.",
      "instructions": "Choose five meaningful photos, letters, recipes, tickets, or documents, photograph or scan them in good light, label them simply, and put originals back carefully.",
      "goal_tags": [
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Unusual Breakfast Ingredient",
      "summary": "Add one savory, sweet, or spicy twist to breakfast.",
      "why_it_hits": "Morning novelty is low-cost and immediate.",
      "instructions": "Use or buy one small ingredient you rarely have at breakfast, like chili crisp, herbs, tahini, pickles, berries, or miso, add it to a simple meal, and taste without multitasking.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Street Tree Favorite",
      "summary": "Choose a favorite tree on a nearby route.",
      "why_it_hits": "Repeated places become more personal when you pick favorites.",
      "instructions": "Walk a familiar street, look closely at trunks, bark, leaves, roots, and shape, choose one tree as today's favorite, and notice it next time you pass.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Polished Shoes Outing",
      "summary": "Clean your shoes, then take them somewhere ordinary.",
      "why_it_hits": "A small upgrade changes your sense of readiness.",
      "instructions": "Wipe, polish, or lace one pair of shoes, then wear them on a short errand, cafe visit, or walk, and notice whether the cared-for detail changes your posture.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cheap Flowers for a Public Table",
      "summary": "Bring a small flower or branch to a shared meal or workspace.",
      "why_it_hits": "Low-key beauty can shift a social setting.",
      "instructions": "Buy a cheap stem or legally gather fallen greenery, place it in a jar at a shared table, kitchen, or picnic, and let it be simple rather than decorative perfection.",
      "goal_tags": [
        "connection",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Flea Market Object Biography",
      "summary": "Visit a flea market and invent histories for three objects.",
      "why_it_hits": "Used objects practically ask for stories.",
      "instructions": "Go to a flea market, antique mall, or thrift aisle, pick three objects without needing to buy them, imagine who owned them and why they let them go.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One New Stretch of Waterfront",
      "summary": "Walk a waterfront section you have not walked before.",
      "why_it_hits": "Edges between land and water feel restorative.",
      "instructions": "Find a river, lake, canal, harbor, or pond path, choose a safe unfamiliar stretch, walk for thirty minutes, and stop once to watch the water closely.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friend's Favorite Cheap Meal",
      "summary": "Try the budget meal a friend swears by.",
      "why_it_hits": "Recommendations feel like borrowed local knowledge.",
      "instructions": "Ask someone for their favorite cheap meal near you or easy order anywhere, try it today if feasible, and send them your honest but kind reaction.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Elevated Train Shadow",
      "summary": "Walk under or beside elevated tracks in daylight.",
      "why_it_hits": "Infrastructure gives streets a strong mood.",
      "instructions": "Choose a safe public route under elevated rail, highways, or tram lines, walk for fifteen to thirty minutes in daylight, notice rhythm, shade, columns, and businesses that live beneath.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old Radio Hour",
      "summary": "Listen to live local radio while driving, walking, or cooking.",
      "why_it_hits": "Broadcasts create a shared present tense.",
      "instructions": "Tune into a local station you rarely hear, listen for thirty minutes without skipping, and note one ad, song, caller, or host phrase that anchors it to your area.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Two-Cafe Writing Relay",
      "summary": "Write a note in one cafe and finish it in another.",
      "why_it_hits": "Changing rooms changes the thought.",
      "instructions": "Start a letter, list, scene, or plan over a cheap drink or water where allowed, move to a second public spot, finish it there, and keep the total under an hour.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Tiny Public Workout",
      "summary": "Use one piece of outdoor fitness equipment gently.",
      "why_it_hits": "It makes movement playful and accessible.",
      "instructions": "Find a park fitness station, pull-up bar, balance beam, or path marker, try one safe low-intensity movement for five minutes, and stop well before strain or embarrassment builds.",
      "goal_tags": [
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "growth_edge"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "did_something_unusual"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Applause Mission",
      "summary": "Go somewhere you can applaud live effort.",
      "why_it_hits": "Cheering connects you to other people's courage.",
      "instructions": "Attend a recital, open mic, school game, street performance, or community event, stay long enough to clap for someone, and make your applause generous but appropriate.",
      "goal_tags": [
        "connection",
        "better_stories",
        "fun"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "Unfamiliar Newspaper Section",
      "summary": "Read a section of the paper you usually ignore.",
      "why_it_hits": "It changes the information diet without a big commitment.",
      "instructions": "Find a newspaper or news site, choose a section like obituaries, agriculture, arts, business, or local courts, read for fifteen minutes, and summarize one odd fact to someone.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Candlelight Dinner",
      "summary": "Eat a simple dinner by candle or dim lamp at home.",
      "why_it_hits": "Atmosphere makes ordinary food feel intentional.",
      "instructions": "Use a candle safely or a warm lamp, make or order a modest meal, put your phone away for the first ten minutes, and let the room feel like somewhere else.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Public Transit Compliment Map",
      "summary": "Notice three pieces of good design on transit.",
      "why_it_hits": "Appreciating systems reduces daily irritation.",
      "instructions": "On a bus, train, tram, or station, look for useful signs, handles, seats, colors, maps, or accessibility features, choose three that work well, and notice one that does not.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One Local Blog Trail",
      "summary": "Follow a recommendation from an old local blog post.",
      "why_it_hits": "Outdated internet can lead to surprising places.",
      "instructions": "Search for a local blog or article from years ago, choose a cafe, walk, shop, or landmark still around, visit it, and compare the old description with today.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Family Phrase Collection",
      "summary": "Ask a relative or close person for a saying they grew up with.",
      "why_it_hits": "Small phrases carry whole histories.",
      "instructions": "Call or message someone you know well, ask what phrase, proverb, joke, or warning they heard often growing up, write it down, and ask when people used it.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Little Free Library Loop",
      "summary": "Visit three little free libraries or book swaps.",
      "why_it_hits": "Tiny public exchanges feel neighborly.",
      "instructions": "Map or wander to three book boxes, browse without taking more than you will use, leave a book if you have one, and note the personality of each box.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Stop Museum Sketch",
      "summary": "Sketch one museum object for ten minutes.",
      "why_it_hits": "Drawing creates a deeper visit than browsing.",
      "instructions": "Visit a free or affordable museum or gallery, choose one object, sketch it for ten minutes from a bench or standing spot, and read the label only after drawing.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Grocery Store Exit Interview",
      "summary": "After shopping, sit outside and observe what people carry.",
      "why_it_hits": "It reveals the everyday logistics of a place.",
      "instructions": "Buy one needed item, sit safely outside the store for ten minutes, notice bags, carts, flowers, pet food, and hurried faces without staring, then head home.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Local Trail by Transit",
      "summary": "Reach a small nature spot without a car.",
      "why_it_hits": "It proves escape can be accessible.",
      "instructions": "Choose a park, trail, beach, or river reachable by transit, pack water and fare, spend thirty to ninety minutes there, and plan the return before you lose service or energy.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Shared Childhood Snack",
      "summary": "Exchange childhood snacks with a friend.",
      "why_it_hits": "Food nostalgia makes easy, personal conversation.",
      "instructions": "Each person brings or buys one snack they loved as a kid, taste both, tell the story attached to it, and allow the snack to be objectively terrible.",
      "goal_tags": [
        "fun",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Drawer Museum",
      "summary": "Curate one drawer into a temporary exhibit.",
      "why_it_hits": "Sorting becomes storytelling instead of cleaning.",
      "instructions": "Open one drawer, choose five interesting contents, arrange them on a table with a loose theme, remove one thing that does not belong, then put the drawer back together.",
      "goal_tags": [
        "novelty",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Different Library Branch",
      "summary": "Visit a library branch you have never used.",
      "why_it_hits": "Same institution, different neighborhood personality.",
      "instructions": "Find a branch within reach, visit for twenty to forty minutes, explore its displays, seating, and community board, and check out or photograph the call number of one appealing item.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Street Food Standing Meal",
      "summary": "Eat a small meal standing where locals stand.",
      "why_it_hits": "It feels immediate and rooted in place.",
      "instructions": "Pick a reputable cart, stall, bakery window, or slice shop, order one item, eat in the accepted nearby spot without blocking anyone, and notice the rhythm of regulars.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Sun Patch Sit",
      "summary": "Find a patch of sunlight and sit in it briefly.",
      "why_it_hits": "Simple warmth can change the day fast.",
      "instructions": "At home, in a park, or near a window, find a comfortable sun patch, sit for ten minutes with skin protected as needed, and do nothing more ambitious than noticing light.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Object Return",
      "summary": "Return something you borrowed or meant to give back.",
      "why_it_hits": "Completion restores trust and clears mental clutter.",
      "instructions": "Identify one borrowed item, container, book, tool, or piece of clothing, arrange a simple handoff or drop-off today, and include a brief thanks if overdue.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Open Studio Peek",
      "summary": "Visit an artist open studio, gallery opening, or maker space tour.",
      "why_it_hits": "Seeing work in progress demystifies creativity.",
      "instructions": "Find a free or low-cost open studio or gallery event, attend for thirty minutes, look at materials and process, and ask a question only if it feels natural.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Staircase Map",
      "summary": "Locate three outdoor staircases or ramps.",
      "why_it_hits": "Vertical shortcuts reveal hidden city structure.",
      "instructions": "Walk a hilly or dense area in daylight, find three public staircases, ramps, or stepped paths, use at least one, and mark the most useful for future walks.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "physically_demanding"
      ]
    },
    {
      "title": "The Best Seat Test",
      "summary": "Try three seats in one public place.",
      "why_it_hits": "Choosing place deliberately changes comfort.",
      "instructions": "At a library, plaza, cafe, park, or station, sit briefly in three allowed spots, compare view, noise, light, and privacy, then settle in the best one for ten minutes.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Budget Date",
      "summary": "Plan a two-person outing under a strict tiny budget.",
      "why_it_hits": "Constraints can make connection inventive.",
      "instructions": "Set a low total budget with a friend or partner, combine a walk, shared snack, free view, or public event, and spend more attention than money.",
      "goal_tags": [
        "connection",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cook Outside the Recipe",
      "summary": "Change one ingredient in a familiar dish.",
      "why_it_hits": "It adds creativity without risking dinner completely.",
      "instructions": "Make something you know, swap or add one ingredient you already have, keep the rest familiar, and decide whether the change belongs in the permanent version.",
      "goal_tags": [
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Cemetery Symbol Search",
      "summary": "Look for repeated symbols in an old cemetery.",
      "why_it_hits": "Visual patterns reveal cultural history.",
      "instructions": "Visit respectfully during open hours, look for carved flowers, hands, birds, books, anchors, or military markers, choose one symbol to look up afterward, and avoid interrupting mourners.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Song Karaoke",
      "summary": "Sing one karaoke song, privately or at a venue.",
      "why_it_hits": "A short performance can feel wildly alive.",
      "instructions": "Choose a song you know enough, sing at home, in a private room, or at a friendly karaoke night, commit to the full song, and skip self-roasting afterward.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Corner Store Coffee Compare",
      "summary": "Try coffee from a humble local spot.",
      "why_it_hits": "Everyday places can surprise you.",
      "instructions": "Buy a small coffee or tea from a corner store, gas station, kiosk, or deli you have ignored, drink it outside or on a walk, and rate it on usefulness, not luxury.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Handwritten Menu Hunt",
      "summary": "Find a handwritten menu, sign, or chalkboard special.",
      "why_it_hits": "Handwritten signs feel immediate and human.",
      "instructions": "Walk through a market street or food area, look for handwritten specials or signs, choose the most appealing or odd one, and buy only if it fits your budget.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "followed_impulses",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Aisle of Childhood",
      "summary": "Visit the toy, cereal, or school-supply aisle and notice memories.",
      "why_it_hits": "Objects can unlock old versions of you.",
      "instructions": "Go to a store, browse one childhood-coded aisle for ten minutes, identify one item that triggers a memory, and leave without buying unless it genuinely delights you.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Public Piano Try",
      "summary": "Play a few notes on a public piano if available.",
      "why_it_hits": "It is a gentle brush with public expression.",
      "instructions": "Find a public piano in a station, library, mall, or street, play a simple tune or a few notes when it is allowed and not disruptive, then let someone else have space.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Name Origins",
      "summary": "Learn why one neighborhood or street has its name.",
      "why_it_hits": "Names stop being background noise.",
      "instructions": "Pick a street, park, or district name nearby, look up its origin from a credible source, then walk there or past its sign and repeat the story to yourself or someone else.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Block Generosity",
      "summary": "Do one small helpful act on your block.",
      "why_it_hits": "Care feels more real when it has a location.",
      "instructions": "Choose a simple act like sweeping shared steps, bringing in a bin, watering a public planter if allowed, or leaving a kind note for a known neighbor, and keep it modest.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Late Library Glow",
      "summary": "Visit a library during its evening hours.",
      "why_it_hits": "Quiet public spaces feel different after dark.",
      "instructions": "Choose a library open after sunset in a safe area, browse or read for thirty minutes, notice the evening crowd, and leave with enough time for a comfortable trip home.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "The Small Plate Crawl",
      "summary": "Share two tiny dishes at two different nearby places.",
      "why_it_hits": "It makes dinner feel like an urban ramble.",
      "instructions": "Go with one or two people, choose two affordable spots close together, order one small plate or snack at each, walk between them, and keep the crawl short.",
      "goal_tags": [
        "novelty",
        "fun",
        "connection"
      ],
      "barrier_tags": [
        "going_far",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Mailbox Memory Letter",
      "summary": "Write to someone about one shared memory.",
      "why_it_hits": "Specific memories strengthen relationships.",
      "instructions": "Pick a person and a memory you both might enjoy, write a brief letter or card describing one scene, mail it or photograph and send it today.",
      "goal_tags": [
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "social_hesitation",
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Free Trial Hobby Hour",
      "summary": "Use a free intro, trial, or open hour for a hobby space.",
      "why_it_hits": "Sampling lowers the pressure to become a hobby person.",
      "instructions": "Find a climbing gym, dance studio, makerspace, meditation hall, language meetup, or craft shop with an intro option, check safety and cost, attend once, and do not commit today.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 2,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "Shoe Store Walk Test",
      "summary": "Try on a style of shoe you would not normally wear.",
      "why_it_hits": "Embodied curiosity beats abstract taste.",
      "instructions": "Visit a shoe store, try one pair outside your usual style within store rules, walk a few steps, notice how they change your stance, and buy nothing unless planned.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old Movie Location Walk",
      "summary": "Visit a public spot used in a film or show.",
      "why_it_hits": "Fiction overlays reality in a fun way.",
      "instructions": "Look up a nearby filming location that is public and safe, visit it, compare the camera version with real life, and avoid disturbing residents or businesses.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Sentence Diary Bench",
      "summary": "Write one sentence about today from a bench.",
      "why_it_hits": "It captures life without becoming a big practice.",
      "instructions": "Find a public bench or outdoor seat, sit for five minutes, write one sentence that could only belong to today, then put the note away.",
      "goal_tags": [
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighboring Town Main Street",
      "summary": "Take a short trip to a nearby town center.",
      "why_it_hits": "Going slightly farther can feel like real travel.",
      "instructions": "Choose a nearby town or district reachable today, spend one to two hours walking its main street, buy a cheap snack or browse free, and return before logistics get tiring.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Local Mascot Search",
      "summary": "Find a school, team, shop, or town mascot in the wild.",
      "why_it_hits": "Mascots reveal local humor and pride.",
      "instructions": "Walk or search around schools, sports fields, shops, or civic buildings, spot a mascot on a sign, statue, mural, or sticker, and decide whether it is charming or alarming.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Five-Minute Window Wash",
      "summary": "Clean one window or mirror and look through it.",
      "why_it_hits": "Clear glass gives immediate visual reward.",
      "instructions": "Choose one window or mirror, clean it safely with supplies you have, then spend one minute looking through or into it as if it were newly installed.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Skill Barter Coffee",
      "summary": "Trade tiny advice with a friend over a drink.",
      "why_it_hits": "Everyone gets to be useful for a moment.",
      "instructions": "Meet or call a friend, each bring one small question the other might help with, keep advice to ten minutes each, and spend the rest of the time catching up.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "followed_impulses"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Evening Ferry Lights",
      "summary": "Ride a boat or waterfront route after sunset.",
      "why_it_hits": "Reflections make the night feel expansive.",
      "instructions": "Choose a safe public ferry, river bus, or waterfront promenade with evening activity, go with someone if preferred, enjoy the lights for one short route, and return directly.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "The Local Zine Hunt",
      "summary": "Find a zine, pamphlet, or small-press rack.",
      "why_it_hits": "DIY publishing shows a city's undercurrent.",
      "instructions": "Visit a bookstore, cafe, record shop, library, or art space likely to carry zines, browse briefly, buy one cheap item or take a free pamphlet, and read it today.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Room Scent Reset",
      "summary": "Change the scent of one room naturally.",
      "why_it_hits": "Smell alters mood quickly and subtly.",
      "instructions": "Open a window, simmer citrus or herbs, make coffee, light a safe candle, or bring in flowers, focus on one room, and notice the first moment it smells different.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Basketball Free Throws",
      "summary": "Shoot ten free throws at a public court.",
      "why_it_hits": "A clear little challenge adds physical play.",
      "instructions": "Bring or borrow a ball, visit a public court when not crowded, shoot ten free throws or easy shots, count makes without judgment, and yield the court to active players.",
      "goal_tags": [
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Map of Personal Firsts",
      "summary": "Visit or mark three places where you first did something.",
      "why_it_hits": "Your own history becomes a map.",
      "instructions": "Think of first job, first apartment, first date, first class, first big purchase, or first friend in town, visit one place or map three, and recall the scene briefly.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cook for the Freezer",
      "summary": "Make one extra portion for future you.",
      "why_it_hits": "It creates a gift without ceremony.",
      "instructions": "Cook a simple meal, intentionally make one extra serving, label and freeze or refrigerate it, and picture the tired version of you who will find it.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Sign Typography",
      "summary": "Notice lettering styles on old and new signs.",
      "why_it_hits": "Fonts reveal eras and personalities.",
      "instructions": "Walk a commercial street, look at ten signs, compare hand-painted, neon, plastic, serif, and digital lettering, and choose the sign that best fits its business.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Unexpected Museum Audio Guide",
      "summary": "Use an audio guide or app for one exhibit.",
      "why_it_hits": "A voice can unlock details you would miss.",
      "instructions": "At a museum, historic site, or public art walk, use a free or cheap audio guide for one section only, listen fully, then look silently for a few minutes.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Good Pen Letter",
      "summary": "Use your best pen to write an ordinary note.",
      "why_it_hits": "Nice tools make communication feel deliberate.",
      "instructions": "Choose your favorite pen or buy a cheap smooth one, write a note, list, card, or recipe by hand, and deliver, mail, or place it somewhere useful today.",
      "goal_tags": [
        "connection",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Bridge Picnic",
      "summary": "Eat a snack near a bridge, not on traffic lanes.",
      "why_it_hits": "Bridges add drama to simple food.",
      "instructions": "Choose a safe pedestrian bridge, riverbank, or park with bridge views, bring a snack, sit where allowed, watch crossings for ten minutes, and pack out trash.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Local Ingredient Dinner Party",
      "summary": "Make one dish around an ingredient grown or made nearby.",
      "why_it_hits": "Dinner becomes connected to place.",
      "instructions": "Buy a local vegetable, bread, cheese, sauce, beer, honey, or tofu within budget, cook or serve it simply, and tell anyone eating where it came from.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "group_social_situations"
      ]
    },
    {
      "title": "First Bus of the Day",
      "summary": "Take an early bus or train just a few stops.",
      "why_it_hits": "Early transit has a distinct, focused mood.",
      "instructions": "Check schedules, ride a safe early route for a short distance, observe who is already moving, get a warm drink if you want, and return or continue your day.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The No-Recipe Salad",
      "summary": "Build a salad from textures, not instructions.",
      "why_it_hits": "It makes eating feel inventive and fresh.",
      "instructions": "Choose something crunchy, soft, sharp, rich, and bright from what you have or a cheap shop, combine them, dress simply, and name the best texture.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "playful"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Dock Sit",
      "summary": "Sit on a safe public dock, pier, or waterside edge.",
      "why_it_hits": "Waterfront edges invite reflection without forcing it.",
      "instructions": "Find a legal public dock, pier, marina bench, or seawall, sit for fifteen minutes, watch boats, birds, or ripples, and keep a safe distance from edges.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old Friend Micro-Reunion",
      "summary": "Meet someone you have not seen in a while for exactly one hour.",
      "why_it_hits": "Bounded time makes reconnection easier.",
      "instructions": "Invite an old friend or acquaintance for coffee, a walk, or lunch with a clear one-hour window, ask what has changed since last time, and end before it becomes vague.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Kitchen Label Upgrade",
      "summary": "Label three containers, shelves, or cords clearly.",
      "why_it_hits": "Small order reduces future friction.",
      "instructions": "Use tape, paper, or labels you have, mark three things that often cause confusion, like spices, leftovers, chargers, or pantry jars, and stop after three.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Free Gallery Opening Lap",
      "summary": "Attend a gallery opening and do one slow lap.",
      "why_it_hits": "Art openings blend people-watching and culture.",
      "instructions": "Find a public opening or reception, arrive early if crowds bother you, walk the room slowly, look at every piece once, and leave without needing to network.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 1,
      "avoid_flags": [
        "group_social_situations",
        "nighttime"
      ]
    },
    {
      "title": "The Best Public Bathroom Quest",
      "summary": "Find the cleanest or most interesting public restroom in an area.",
      "why_it_hits": "It is practical, funny, and oddly revealing.",
      "instructions": "While out in a mall, museum, library, station, or large store, compare two or three restrooms you are allowed to use, judge cleanliness, design, and usefulness, and remember the winner.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Five-Dollar Spice Route",
      "summary": "Spend a small budget at a spice or international grocery.",
      "why_it_hits": "Flavor exploration stays cheap and vivid.",
      "instructions": "Set a strict small amount, browse spices, sauces, teas, or snacks, buy one item you can use today, and smell or taste it before adding it to food.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Ordinary Object Interview",
      "summary": "Ask someone close about one object they use daily.",
      "why_it_hits": "Everyday tools reveal routines and values.",
      "instructions": "Ask a roommate, partner, coworker, or family member about their bag, mug, keychain, notebook, or tool, listen for the story, and share one of yours if invited.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Walk to the Next Zip Code",
      "summary": "Cross into a neighboring postal area and back.",
      "why_it_hits": "It makes an invisible boundary tangible.",
      "instructions": "Check a map for the nearest zip or postal code edge, walk or transit there safely, cross it, notice any change in signs or buildings, and return by a different street.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Theater at Home",
      "summary": "Watch a short film with the room set like a cinema.",
      "why_it_hits": "Atmosphere upgrades a familiar screen.",
      "instructions": "Choose a short film under thirty minutes, dim lights, make a snack, silence your phone, watch without pausing, and talk or write one reaction afterward.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Corner Instrument Listen",
      "summary": "Listen to one street musician for a full song.",
      "why_it_hits": "It honors live music as more than background.",
      "instructions": "If you encounter a street musician in a safe public place, stop for one complete song, tip if you can and want, and notice what changes when you stop walking.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Architecture Style Hunt",
      "summary": "Find three examples of one architectural feature.",
      "why_it_hits": "Patterns make streets more legible.",
      "instructions": "Choose a feature like arches, bay windows, brickwork, balconies, columns, tiles, or fire escapes, walk until you find three examples, and decide which building wears it best.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Breakfast Invite",
      "summary": "Invite someone to meet before the day gets busy.",
      "why_it_hits": "Morning connection feels quietly special.",
      "instructions": "Ask a friend, coworker, or neighbor you know to meet for a quick breakfast, pastry, or walk, keep it under forty-five minutes, and enjoy the unusual timing.",
      "goal_tags": [
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people",
        "did_something_unusual"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Pocket Declutter Walk",
      "summary": "Empty one pocket, bag pouch, or wallet section outdoors.",
      "why_it_hits": "Fresh air makes tiny sorting less tedious.",
      "instructions": "Take your bag or jacket to a bench or outdoor table, empty one compartment, throw away trash, keep what matters, and stop before turning it into a full bag overhaul.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Chess Puzzle",
      "summary": "Solve one puzzle from a book or app in a public spot.",
      "why_it_hits": "A small mental challenge feels different outside.",
      "instructions": "Bring a puzzle book or app to a cafe, library, park, or transit ride, solve one chess, crossword, logic, or word puzzle, and quit after one if you want.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Takeout Plate Upgrade",
      "summary": "Serve takeout on real plates with one added detail.",
      "why_it_hits": "It turns convenience into a cared-for meal.",
      "instructions": "Buy modest takeout or leftovers, plate it nicely at home or a picnic table, add herbs, lemon, sauce, or a cloth napkin, and eat seated.",
      "goal_tags": [
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Historic Hotel Walkthrough",
      "summary": "Walk through the public areas of a historic hotel.",
      "why_it_hits": "Old hospitality spaces feel theatrical and layered.",
      "instructions": "Find a hotel known for history and open public areas, enter respectfully, look at lobby details, photos, or displays, buy coffee only if you want, and avoid guest-only spaces.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Stop Volunteer Taste",
      "summary": "Do a short, pre-arranged volunteer shift or drop-in task.",
      "why_it_hits": "Helping is energizing when the scope is clear.",
      "instructions": "Choose a legitimate organization with a same-day or short shift like food sorting, park cleanup, or event setup, confirm requirements, show up on time, and keep your commitment manageable.",
      "goal_tags": [
        "connection",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "felt_more_alive",
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 2,
      "social_level": 2,
      "physical_level": 2,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers",
        "group_social_situations"
      ]
    },
    {
      "title": "The Silliest Hat Try-On",
      "summary": "Try on a hat or accessory outside your usual style.",
      "why_it_hits": "Low-stakes self-consciousness practice can be fun.",
      "instructions": "Visit a thrift store, costume aisle, or hat shop with a friend or solo, try one unusual accessory respectfully, observe your reaction, and buy nothing unless it delights you.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "City Smell Memory",
      "summary": "Find one smell that reminds you of another place.",
      "why_it_hits": "Scent connects geography and memory fast.",
      "instructions": "Walk through a food street, park, laundromat area, bakery block, or waterfront, notice a smell that transports you, and name the place or time it recalls.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The First Page Cafe",
      "summary": "Start a new book in a cafe and stop after chapter one.",
      "why_it_hits": "Beginnings have their own spark.",
      "instructions": "Bring or borrow a book you have not started, sit with a drink or water where allowed, read the first chapter only, and decide whether it deserves another outing.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Public Transit Portraits in Words",
      "summary": "Describe three people without appearance judgments.",
      "why_it_hits": "It sharpens observation with respect.",
      "instructions": "On transit or in a station, privately write three one-sentence descriptions based on actions, objects, posture, or mood, avoid identifying details, and delete or keep them for yourself.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old Recipe Phone Call",
      "summary": "Call someone to ask how they make one dish.",
      "why_it_hits": "Recipes become a reason for connection.",
      "instructions": "Choose a dish associated with someone you know, call or message for their method, ask one follow-up, and cook or plan the dish without demanding exact measurements.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "creative"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Hammock or Blanket Sit",
      "summary": "Bring a blanket to a park and stay put.",
      "why_it_hits": "Comfort outdoors feels like a mini vacation.",
      "instructions": "Pack a blanket or small mat, choose a park or beach spot, sit or lie down for thirty minutes, bring a book or snack if desired, and leave no trace.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Last-Minute Matinee",
      "summary": "Pick a movie starting within the next hour.",
      "why_it_hits": "Spontaneity makes a regular day bend.",
      "instructions": "Check nearby cinemas or community screenings, choose the soonest affordable showing that fits your schedule, go without over-researching, and let surprise be part of it.",
      "goal_tags": [
        "novelty",
        "fun",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "One-Page Family Tree",
      "summary": "Sketch a tiny family or friendship tree from memory.",
      "why_it_hits": "Relationships become visible in a new shape.",
      "instructions": "On one page, map a small branch of family, chosen family, coworkers, or friends, include one place or trait for each person, and ask someone to correct one detail if you like.",
      "goal_tags": [
        "connection",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Bridge History",
      "summary": "Learn when one bridge was built and why.",
      "why_it_hits": "Infrastructure gains a backstory.",
      "instructions": "Visit or view a nearby bridge, look up its date, designer, or purpose, then cross or watch it with that fact in mind.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "going_far",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Good Bowl Meal",
      "summary": "Eat a meal from your nicest bowl.",
      "why_it_hits": "Using saved-for-later things makes today count.",
      "instructions": "Choose your best bowl, plate, or cup, serve an ordinary meal in it, sit somewhere pleasant, and resist saving the nice object for an imaginary occasion.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Group Game Table",
      "summary": "Play one tabletop game with two or more people.",
      "why_it_hits": "Rules create easy shared momentum.",
      "instructions": "Invite people at home, a cafe, or a game store, choose a short game under an hour, explain lightly, play once, and let the winner enjoy a tiny victory.",
      "goal_tags": [
        "fun",
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 2,
      "social_level": 3,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "Civic Meeting Sampler",
      "summary": "Attend twenty minutes of a local public meeting.",
      "why_it_hits": "It reveals how decisions sound in real life.",
      "instructions": "Find a council, school board, neighborhood, or committee meeting open to the public, attend in person or online for a short segment, listen respectfully, and leave quietly if needed.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 2,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Corner Store Bouquet",
      "summary": "Buy the least fancy flowers from a convenience shop.",
      "why_it_hits": "Unpretentious beauty has charm.",
      "instructions": "Find a small affordable bouquet at a corner store, grocery, or market, bring it home or to someone, trim stems if needed, and place it where it feels unexpectedly elegant.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Find the Oldest Menu",
      "summary": "Look for a restaurant or cafe with history on display.",
      "why_it_hits": "Food places carry local memory.",
      "instructions": "Visit or pass by an older establishment, look for old menus, photos, dates, or signs, buy something small if appropriate, and learn how long it has been there.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The New Neighbor Walk",
      "summary": "Walk through a residential area you rarely visit, respectfully.",
      "why_it_hits": "Different homes reveal different rhythms of life.",
      "instructions": "Choose a safe public street in daylight, walk without photographing private spaces closely, notice gardens, porches, cars, and sounds, and return before you feel like you are loitering.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Hour No-Spend Date",
      "summary": "Spend time with someone using only free public space.",
      "why_it_hits": "It proves connection does not require purchases.",
      "instructions": "Invite someone for a park loop, library browse, waterfront sit, gallery visit, or neighborhood walk, set a one-hour window, and bring water or snacks from home.",
      "goal_tags": [
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "planning"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Recipe Label Read",
      "summary": "Read the label of a packaged food you often eat.",
      "why_it_hits": "Familiar products become less invisible.",
      "instructions": "Choose one food or drink you use regularly, read its ingredients, origin, and packaging claims, look up one unfamiliar term, and decide if anything surprises you.",
      "goal_tags": [
        "novelty"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Pool Spectator",
      "summary": "Visit a swim meet, skate session, or rink as a spectator.",
      "why_it_hits": "Watching skill in public spaces is energizing.",
      "instructions": "Find a community pool, ice rink, skate park, or sports facility with public viewing, watch respectfully for twenty minutes, and cheer only where appropriate.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Personal Uniform",
      "summary": "Wear a simplified outfit that feels like a uniform.",
      "why_it_hits": "Reducing choices can feel crisp and cinematic.",
      "instructions": "Choose a simple repeated color, silhouette, or item combination from your closet, wear it for the day or outing, and notice whether it changes decision fatigue.",
      "goal_tags": [
        "novelty",
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Storefront Window Reflection",
      "summary": "Use reflections to see your street differently.",
      "why_it_hits": "Reflections make ordinary walks layered.",
      "instructions": "Walk a commercial street, look at reflections in windows, cars, puddles, and glass doors, notice overlapping images, and choose the reflection that feels most like a film shot.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "not_knowing",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friend Errand Interview",
      "summary": "Ask a friend to narrate why they shop where they shop.",
      "why_it_hits": "Routines become stories when explained.",
      "instructions": "Join someone for a normal errand, ask why they choose that store, route, brand, or timing, listen for practical logic, and share one of your own routine reasons.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Tiny Toast",
      "summary": "Make a toast to something specific during a meal.",
      "why_it_hits": "A small ritual marks the day.",
      "instructions": "With a drink of any kind, alone or with others, raise a toast to a person, completed errand, weather change, or absurd survival of the week, then continue eating.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Hidden Book Dedications",
      "summary": "Read dedications in ten books.",
      "why_it_hits": "Dedications are tiny windows into private lives.",
      "instructions": "At home, a library, or bookstore, open ten books to their dedication pages, read them, and choose the one that makes you most curious about the relationship behind it.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Long Bench Lunch",
      "summary": "Eat on the longest bench or table you can find.",
      "why_it_hits": "Scale turns lunch into a little scene.",
      "instructions": "Find a long public bench, picnic table, cafeteria table, or plaza seat, eat a simple meal there, and notice who else shares the long line of space.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Fountain Coinless Wish",
      "summary": "Make a wish at a fountain without throwing anything.",
      "why_it_hits": "It keeps the ritual without litter or cost.",
      "instructions": "Find a fountain or water feature, stand nearby, make a private wish or intention, watch the water for a minute, and leave the fountain exactly as you found it.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Costume Detail",
      "summary": "Add one costume-like detail to normal clothes.",
      "why_it_hits": "A subtle character shift makes the day playful.",
      "instructions": "Choose one scarf, pin, socks, ring, color, or hairstyle that suggests a character or era, wear it during an ordinary outing, and keep it subtle enough to enjoy.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Food Court Tour",
      "summary": "Eat at a food court stall you have never tried.",
      "why_it_hits": "Food courts compress many worlds into one room.",
      "instructions": "Visit a mall, market, campus, or transit food court, walk a full lap before choosing, order one affordable item from a new stall, and sit where you can watch the crowd.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The One-Minute Speech",
      "summary": "Give a tiny prepared speech to a friend or mirror.",
      "why_it_hits": "Speaking clearly is a small growth edge.",
      "instructions": "Pick a topic you care about, prepare one minute of thoughts, say it aloud to a trusted person, voice memo, or mirror, and stop at one minute.",
      "goal_tags": [
        "connection",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sunset Errand Stack",
      "summary": "Time one ordinary errand to end near sunset.",
      "why_it_hits": "It folds beauty into necessity.",
      "instructions": "Choose a grocery run, pickup, return, or walk, plan it so you can pause at a west-facing view near sunset, watch for five minutes, then finish the errand.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Old-Fashioned Phone Call",
      "summary": "Call instead of texting for one practical plan.",
      "why_it_hits": "Real-time voice can cut through friction.",
      "instructions": "Choose a low-stakes plan with someone you know, call to decide time, place, or details in under five minutes, and enjoy not sending ten messages.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Sticker Trail",
      "summary": "Notice stickers on poles, laptops, signs, or windows.",
      "why_it_hits": "Stickers reveal unofficial culture.",
      "instructions": "Walk a lively street, campus, or arts area, look for stickers without peeling or adding any, note themes and layers, and choose the funniest or most mysterious one.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Song Walk Home",
      "summary": "Let one song determine your route home.",
      "why_it_hits": "Following impulse creates a tiny adventure.",
      "instructions": "Play a song as you leave an errand or transit stop, walk in the direction that seems to match it until the song ends, then navigate home normally.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "followed_impulses",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Public Thermos",
      "summary": "Bring a hot drink to an outdoor place.",
      "why_it_hits": "Preparation makes a small outing feel intentional.",
      "instructions": "Fill a thermos or travel cup, walk to a park, overlook, pier, or plaza, drink it slowly, and notice how having your own drink changes the outing.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Found Poetry Walk",
      "summary": "Make a poem from words on signs you pass.",
      "why_it_hits": "The city supplies the language.",
      "instructions": "Walk for twenty minutes, collect words from signs, menus, posters, and labels in order, then arrange ten of them into a short poem at home or on a bench.",
      "goal_tags": [
        "novelty",
        "creativity",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Three-Stop Nostalgia Tour",
      "summary": "Visit three places from an earlier life chapter.",
      "why_it_hits": "Memory becomes physical and story-rich.",
      "instructions": "Choose three nearby spots from school, work, dating, moving, or childhood, visit or pass them in one route, and notice which feels smaller, larger, or unchanged.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Garden Volunteer Chat",
      "summary": "Learn how a garden or park is maintained.",
      "why_it_hits": "Care systems become visible.",
      "instructions": "If you see posted information or available staff or volunteers, read or ask one brief question about maintenance, planting, or volunteering, then appreciate one cared-for detail.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "talking_to_strangers"
      ]
    },
    {
      "title": "The One-Item Upgrade Walk",
      "summary": "Walk to buy exactly one practical upgrade.",
      "why_it_hits": "Purposeful shopping avoids drift and overspending.",
      "instructions": "Choose one inexpensive needed item like batteries, hooks, socks, soap, tape, or a notebook, walk or transit to get it, buy only that, and use it today.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "spending_money",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Tea From Another Country",
      "summary": "Try a tea style from a culture unfamiliar to you.",
      "why_it_hits": "A simple cup can carry geography.",
      "instructions": "Buy or brew an affordable tea like genmaicha, mint, masala chai, rooibos, yerba mate, or oolong, learn one fact about it, and drink it without multitasking.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Polite Decline Practice",
      "summary": "Say no to one optional thing clearly and kindly.",
      "why_it_hits": "A boundary can be a quiet adventure.",
      "instructions": "Choose a real low-stakes request, invitation, upsell, or habit you do not want today, decline simply without overexplaining, and use the freed time for something pleasant.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Station Platform Sketch",
      "summary": "Sketch the geometry of a transit platform.",
      "why_it_hits": "Transit design becomes visual art.",
      "instructions": "Bring paper, stand or sit safely away from edges, draw lines, signs, benches, tracks, and people as simple shapes for ten minutes, and stop when your ride comes.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Dessert After Dark",
      "summary": "Go out for one dessert in the evening.",
      "why_it_hits": "A small nighttime outing feels celebratory.",
      "instructions": "Choose a safe dessert shop, bakery, ice cream place, or cafe open after dinner, go with someone or solo, order one modest treat, and make the dessert the whole point.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "spending_money",
        "nighttime"
      ]
    },
    {
      "title": "Home Movie Trailer Night",
      "summary": "Watch only trailers for films you might never see.",
      "why_it_hits": "It samples many worlds quickly.",
      "instructions": "Pick a theme like old noir, foreign animation, 90s thrillers, or documentaries, watch five trailers, choose the most intriguing, and add only one to a future list.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 1,
      "avoid_flags": []
    },
    {
      "title": "The Friendly Wave Route",
      "summary": "Wave to people you already recognize on your route.",
      "why_it_hits": "Low-pressure acknowledgment builds local warmth.",
      "instructions": "Walk a route where you might see familiar neighbors, staff, dog walkers, or building people, offer a small wave or nod to those you recognize, and do not force interaction.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One Interesting Errand Receipt",
      "summary": "Keep a receipt and annotate the outing around it.",
      "why_it_hits": "A mundane slip becomes a story anchor.",
      "instructions": "After a purchase, write on the receipt where you were, what the weather was, and one thing you noticed, then tuck it into a book or discard it later.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Tiny Public Garden Sketch",
      "summary": "Draw one leaf, flower, or planter from life.",
      "why_it_hits": "Focused looking calms and sharpens.",
      "instructions": "Find a public planter, garden bed, or tree, draw one small plant detail for ten minutes, label the color even if your pen is black, and leave the plant untouched.",
      "goal_tags": [
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Shared Map Pin",
      "summary": "Exchange one favorite local map pin with a friend.",
      "why_it_hits": "Personal recommendations feel intimate and useful.",
      "instructions": "Send someone a favorite bench, cafe, view, shop, or walk pin, ask for one back, and visit theirs today or schedule it while the idea is fresh.",
      "goal_tags": [
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cultural Center Lobby Visit",
      "summary": "Step inside a cultural institute or community center.",
      "why_it_hits": "These places often hide events, art, and resources.",
      "instructions": "Find a cultural center, embassy institute, community hall, or heritage organization open to visitors, browse public displays or flyers, and note one future event.",
      "goal_tags": [
        "novelty",
        "better_stories",
        "connection"
      ],
      "barrier_tags": [
        "not_knowing",
        "spending_money"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Mundane Photo Album",
      "summary": "Take five photos of ordinary useful things at home.",
      "why_it_hits": "It honors the unnoticed infrastructure of your life.",
      "instructions": "Photograph five humble things like a kettle, shoes, keys, sink, lamp, or chair, avoid staging, and look at them together as if they documented a vanished home.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Dog Park Watch",
      "summary": "Watch a dog park from outside or a bench.",
      "why_it_hits": "Pure animal chaos can lift the mood.",
      "instructions": "Visit a dog park or dog-friendly area, watch respectfully without entering if you do not have a dog, notice play styles, and do not pet dogs without owner permission.",
      "goal_tags": [
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Tiny Bravery Outfit",
      "summary": "Wear one item you like but rarely dare to wear.",
      "why_it_hits": "A small visibility stretch can feel liberating.",
      "instructions": "Choose a garment, accessory, color, or makeup detail that feels slightly bold but appropriate, wear it on a short outing, and let discomfort pass without changing immediately.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local History Audio Walk",
      "summary": "Make a short self-guided walk from one history source.",
      "why_it_hits": "Facts become place-based when you move through them.",
      "instructions": "Read or listen to a brief local history piece, choose two related spots, visit them in order, and imagine the old scene over the current one.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Sidewalk Chalk Kindness",
      "summary": "Leave a small chalk drawing or message where allowed.",
      "why_it_hits": "It adds temporary cheer without permanence.",
      "instructions": "Use washable chalk on a legal sidewalk or driveway, draw a small flower, arrow, hopscotch, or friendly phrase, keep it nonpolitical and noncommercial, and avoid private property.",
      "goal_tags": [
        "creativity",
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Plate Potluck",
      "summary": "Bring one small dish to share with people you already know.",
      "why_it_hits": "Food lowers the barrier to gathering.",
      "instructions": "Make or buy one simple shareable plate, bring it to work, a friend's place, a club, or family table with permission, and keep the gesture casual.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "with_other_people"
      ],
      "type_tags": [
        "social"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money",
        "group_social_situations"
      ]
    },
    {
      "title": "Hardware Aisle Color Walk",
      "summary": "Browse paint chips and choose a color for your current mood.",
      "why_it_hits": "Color names and swatches invite reflection lightly.",
      "instructions": "Visit a hardware store paint aisle, browse chips without making a mess, pick one color that matches today, and take a free card only if allowed.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Quietest Place Nearby",
      "summary": "Search for the quietest public spot within fifteen minutes.",
      "why_it_hits": "Quiet becomes something you can locate.",
      "instructions": "Walk or transit within a short radius, test a library corner, park path, churchyard, courtyard, or side street, stay in the quietest spot for five minutes.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "going_far",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friendship Walk-and-Return",
      "summary": "Walk with someone until a chosen landmark, then turn back.",
      "why_it_hits": "A shared endpoint keeps plans simple.",
      "instructions": "Pick a landmark like a bridge, mural, store, tree, or corner, walk there with a friend while talking, turn around when you reach it, and avoid extending unless both want to.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "planning",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Makers Shelf",
      "summary": "Find products made in your city or region.",
      "why_it_hits": "Labels reveal a local economy around you.",
      "instructions": "Visit a grocery, gift shop, market, or co-op, look for three locally made items, buy one only if useful or affordable, and learn where it is produced.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Neighboring Campus Walk",
      "summary": "Walk through a public college or school campus area.",
      "why_it_hits": "Campuses have distinct rhythms and hidden paths.",
      "instructions": "Choose a campus with public access, visit during daytime, walk main paths and public courtyards, read one event poster, and avoid restricted buildings or student privacy.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Leftover Picnic",
      "summary": "Eat leftovers outdoors instead of at the fridge.",
      "why_it_hits": "It upgrades practicality with scenery.",
      "instructions": "Pack leftovers safely, take them to a bench, stoop, park, or courtyard, eat with real utensils if possible, and return containers home.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Oldest Tree Search",
      "summary": "Find a very old-looking tree and spend time with it.",
      "why_it_hits": "Living age feels grounding.",
      "instructions": "Walk to a park, cemetery, campus, or old street, look for the largest or most weathered tree, observe bark and branches for ten minutes, and avoid climbing or damaging it.",
      "goal_tags": [
        "novelty",
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Small-Town Hardware Coffee",
      "summary": "Visit a hybrid shop, diner, or old general store.",
      "why_it_hits": "Multi-purpose places carry local character.",
      "instructions": "Find a hardware store with coffee, general store, old diner, or mixed-use shop nearby, browse or buy something small, and notice what roles the place serves.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Two-Page Zine",
      "summary": "Make a tiny folded zine about your day.",
      "why_it_hits": "It turns daily fragments into an object.",
      "instructions": "Fold one sheet of paper into a mini booklet, fill it with notes, drawings, receipts, or observations from today, and give it to one person or keep it.",
      "goal_tags": [
        "creativity",
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Busker Route",
      "summary": "Walk a route where street performers often appear.",
      "why_it_hits": "Live art makes public space feel generous.",
      "instructions": "Choose a safe busy area known for performers, walk during active hours, stop for one performance if present, tip if you can, and keep moving if none appear.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Hour Digital Archaeology",
      "summary": "Look through photos from exactly one old month.",
      "why_it_hits": "It reveals forgotten scenes without endless scrolling.",
      "instructions": "Pick a month from a past year, browse only that folder for up to one hour, choose five photos worth saving or sharing, and stop before reorganizing everything.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Public Clock Appointment",
      "summary": "Meet someone under a public clock or distinctive sign.",
      "why_it_hits": "Old-fashioned meeting points feel romantic and clear.",
      "instructions": "Choose a clock, sign, statue, or fountain, arrange to meet someone there at a specific time, avoid constant location texting, and enjoy the tiny ceremony of arrival.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "playful",
        "social"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Art in a Hospital Lobby",
      "summary": "Visit public art in a hospital, clinic, or medical campus.",
      "why_it_hits": "Care spaces often hold unexpectedly thoughtful art.",
      "instructions": "Only if public access is allowed and you are not disrupting care, walk through a lobby or corridor with art, look at three pieces, and leave quietly.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Hour Window Shop Outfit",
      "summary": "Build an imaginary outfit from shop windows only.",
      "why_it_hits": "Style play stays free and observational.",
      "instructions": "Walk a retail street or mall, choose pieces from different windows without entering if you prefer, assemble an imaginary outfit for a specific occasion, and name the occasion.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Shortcut Gift",
      "summary": "Show someone a useful route you know.",
      "why_it_hits": "Local knowledge becomes generosity.",
      "instructions": "Invite a friend, coworker, or visitor to walk a shortcut, scenic path, or easier transit connection with you, explain why it helps, and let them decide if it suits them.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Three-Texture Snack",
      "summary": "Build a snack with crunchy, creamy, and bright elements.",
      "why_it_hits": "Texture makes simple food feel designed.",
      "instructions": "Use pantry items or a small shop run to combine three textures, like crackers, cheese, pickles, fruit, yogurt, nuts, or toast, and eat it plated rather than standing.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Legal Wall Art Watch",
      "summary": "Visit a sanctioned graffiti wall or mural zone.",
      "why_it_hits": "Public creativity feels alive and changing.",
      "instructions": "Find a legal mural alley, art wall, or street-art district, visit in daylight, look closely at layers and signatures, and never add marks unless explicitly permitted.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Family Map Call",
      "summary": "Ask someone where an important family story happened.",
      "why_it_hits": "Stories become more real with geography.",
      "instructions": "Call or message a relative or close elder, ask where a meaningful move, meeting, job, or event took place, find it on a map, and ask one follow-up.",
      "goal_tags": [
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "social_hesitation"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective",
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Table Reset",
      "summary": "Clear and set one table as if guests were coming.",
      "why_it_hits": "Prepared space changes how you inhabit home.",
      "instructions": "Choose a desk, dining table, coffee table, or bedside surface, clear it, wipe it, place one useful or beautiful object, and use it once today.",
      "goal_tags": [
        "momentum",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Train Overlook",
      "summary": "Watch trains from a safe legal viewpoint.",
      "why_it_hits": "Trains make movement visible and dramatic.",
      "instructions": "Find a station platform, bridge with pedestrian access, park, or viewing area where train-watching is safe, stay behind barriers, watch for twenty minutes, and do not trespass.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Different Grocery Basket",
      "summary": "Shop with a hand basket instead of a cart, or the reverse.",
      "why_it_hits": "Changing the container changes choices.",
      "instructions": "On a normal grocery trip, choose the opposite carrying method from your usual, buy only what fits comfortably or intentionally, and notice how it affects pace and decisions.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "One-Hour Local Playlist",
      "summary": "Listen only to musicians from your area for an hour.",
      "why_it_hits": "Local sound gives place another layer.",
      "instructions": "Search for artists from your city or region, make or use a short playlist, listen while walking, cooking, or riding transit, and save one track you would replay.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Last Page First",
      "summary": "Read the last page of a book you do not plan to read.",
      "why_it_hits": "It breaks a literary taboo harmlessly.",
      "instructions": "At a library, bookstore, or your shelf, choose a book you are unlikely to read soon, read only the final page, and imagine the journey that led there.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Laundromat Sit",
      "summary": "Spend time in a laundromat, doing laundry or just observing respectfully.",
      "why_it_hits": "Laundromats are intimate public infrastructure.",
      "instructions": "If you have laundry, do one load at a laundromat; if not, only enter if it feels appropriate, buy a drink nearby, and notice the rhythms without staring.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Bold Reservation",
      "summary": "Book a table, class, or ticket you have been circling.",
      "why_it_hits": "A small commitment turns someday into scheduled.",
      "instructions": "Choose one realistic thing you keep considering, confirm cost and time, make the reservation or buy the ticket today, and put it on your calendar.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 2,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Sculpture Garden Lunch",
      "summary": "Eat near outdoor sculpture or public art.",
      "why_it_hits": "Art changes the backdrop of a meal.",
      "instructions": "Find a sculpture garden, plaza artwork, campus installation, or mural-adjacent bench, bring or buy lunch, eat nearby, and choose which artwork would be the best dining companion.",
      "goal_tags": [
        "novelty",
        "creativity",
        "better_stories"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Neighborhood Accent Listen",
      "summary": "Notice the mix of languages and accents in public space.",
      "why_it_hits": "It reveals the human range around you.",
      "instructions": "Sit in a station, market, park, or food court, listen respectfully without eavesdropping for content, notice language rhythms and tones, and reflect on how many worlds share the place.",
      "goal_tags": [
        "novelty",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One New Breakfast Place",
      "summary": "Try a breakfast spot before your normal day begins.",
      "why_it_hits": "It creates a story before routine takes over.",
      "instructions": "Choose a nearby diner, bakery, cafe, cart, or market stall opening early, order something simple, sit or stand for a few minutes, and continue your day from there.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "more_stories",
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Object You Avoid",
      "summary": "Handle one household task object you keep ignoring.",
      "why_it_hits": "Approaching the avoided thing can be oddly freeing.",
      "instructions": "Pick one pile, form, broken item, tool, or unopened package, spend exactly fifteen minutes dealing with it, make one concrete move, and stop before it becomes a saga.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Art Night Walk",
      "summary": "See lit public art after dark.",
      "why_it_hits": "Lighting changes the emotional charge of art.",
      "instructions": "Choose a safe, active area with illuminated murals, sculptures, projections, or monuments, go with someone if desired, walk for thirty minutes, and head home while energy is still good.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "planning"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 1,
      "avoid_flags": [
        "nighttime"
      ]
    },
    {
      "title": "Tiny Guest Ritual",
      "summary": "Invite someone over for one specific small thing.",
      "why_it_hits": "Hosting feels easier when the scope is tiny.",
      "instructions": "Ask one person to come by for tea, a snack, a song, a plant cutting, or a ten-minute tour of something, prepare only that, and let it stay simple.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Book Dedication Gift",
      "summary": "Buy or borrow a book because of its dedication.",
      "why_it_hits": "A hidden page guides the choice.",
      "instructions": "Browse a library or used bookstore, read dedications until one grabs you, borrow or buy the book if feasible, and read a few pages today.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "followed_impulses"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Street Corner Weather Test",
      "summary": "Find the windiest, warmest, or coolest corner nearby.",
      "why_it_hits": "Microclimates make streets feel alive.",
      "instructions": "Walk a few blocks, compare temperature and wind at corners, alleys, sunny walls, and shade, and identify the spot with the strongest weather personality.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "going_far"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The One-Lap Gallery Date",
      "summary": "Take someone through a gallery with a time limit.",
      "why_it_hits": "Brief culture prevents museum fatigue.",
      "instructions": "Invite a friend or partner to a free gallery, set a thirty-minute limit, each choose one favorite and one confusing piece, then leave to discuss elsewhere.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "shared_more_with_people",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Cook a Color",
      "summary": "Make a meal dominated by one color.",
      "why_it_hits": "Visual constraints make food playful and creative.",
      "instructions": "Pick a color, use ingredients you have or buy cheaply, cook or assemble a simple meal mostly in that color, and allow one contrasting garnish if needed.",
      "goal_tags": [
        "fun",
        "creativity",
        "novelty"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Old Sign Route",
      "summary": "Search for faded painted signs or ghost ads.",
      "why_it_hits": "Old commerce lingers like urban archaeology.",
      "instructions": "Walk older commercial streets in daylight, look above eye level for faded lettering, wall ads, or old shop signs, and choose the one most resistant to disappearing.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Courage Question",
      "summary": "Ask someone you know a question you usually avoid.",
      "why_it_hits": "A mild edge can deepen familiarity.",
      "instructions": "Choose a trusted person and a respectful question that is personal but not invasive, ask when there is space, accept a short answer, and answer it yourself if they ask back.",
      "goal_tags": [
        "connection"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Seating Audit",
      "summary": "Notice where a neighborhood lets people sit.",
      "why_it_hits": "Seating reveals who public space welcomes.",
      "instructions": "Walk for twenty minutes, count benches, ledges, chairs, bus shelters, and hostile designs, sit in one allowed place, and decide where seating is most needed.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Handmade Sign Appreciation",
      "summary": "Find and appreciate handmade signs.",
      "why_it_hits": "Imperfect lettering carries human urgency.",
      "instructions": "Look for hand-drawn store signs, yard sale notices, protest art, lost pet flyers, or menu boards, pick the most expressive one, and avoid photographing sensitive personal information.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "spending_money",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Short Train to Nowhere",
      "summary": "Take a short rail trip with no major destination.",
      "why_it_hits": "Movement itself can be enough.",
      "instructions": "Buy the cheapest suitable fare or use a pass, ride a few stops to a station you do not know, walk around for fifteen minutes if safe, and return.",
      "goal_tags": [
        "novelty",
        "momentum",
        "better_stories"
      ],
      "barrier_tags": [
        "planning",
        "not_knowing"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Quiet Bar Seat",
      "summary": "Sit at a bar early and have one non-rushed drink or snack.",
      "why_it_hits": "Bars before crowds can feel contemplative.",
      "instructions": "Choose a reputable place during quiet early hours, order one drink or nonalcoholic option and food if needed, sit for thirty minutes, and leave before the night turns loud.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "Neighborhood Mural Backstory",
      "summary": "Learn who made one mural and why.",
      "why_it_hits": "Public art gains depth through authorship.",
      "instructions": "Find a mural, look for a signature, plaque, or online listing, learn one fact about the artist or theme, then revisit the image with that context.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Pantry Passport",
      "summary": "Make a snack inspired by a place you want to visit.",
      "why_it_hits": "Travel desire becomes edible today.",
      "instructions": "Choose a country, region, or city, use ingredients you already have or one cheap purchase, make a simple inspired snack, and read one paragraph about the place while eating.",
      "goal_tags": [
        "novelty",
        "fun",
        "creativity"
      ],
      "barrier_tags": [
        "low_energy",
        "spending_money"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Borrow a Dog Walk",
      "summary": "Join a friend you know while they walk their dog.",
      "why_it_hits": "Pets make walks more social and grounded.",
      "instructions": "Ask a dog-owning friend if you can join their normal walk, follow their dog's routine and boundaries, do not take over, and enjoy the slower sniff-based pace.",
      "goal_tags": [
        "connection",
        "fun",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "playful"
      ],
      "outcome_tags": [
        "shared_more_with_people",
        "explored_more",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Strongly Worded Review Read",
      "summary": "Read funny local reviews of a place, then visit neutrally.",
      "why_it_hits": "Expectations and reality collide.",
      "instructions": "Choose a cafe, park, landmark, or shop with dramatic online reviews, read a few, visit briefly, and decide what the reviewers missed or exaggerated.",
      "goal_tags": [
        "novelty",
        "fun",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "One-Bag Donation Walk",
      "summary": "Fill one small bag for donation and walk it over.",
      "why_it_hits": "A contained purge becomes action, not chaos.",
      "instructions": "Set a small bag, choose only clean useful items, fill it in twenty minutes, confirm a donation site, and deliver it today instead of leaving it by the door.",
      "goal_tags": [
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "reflective",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Alternate Lunch Hour",
      "summary": "Take lunch at an unusual time and observe the difference.",
      "why_it_hits": "Timing changes the atmosphere of everyday places.",
      "instructions": "If your schedule allows, eat earlier or later than usual, choose a public spot, notice who is there at that hour, and return to your day without making it complicated.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Embroidery of Place",
      "summary": "Stitch or draw a simple symbol of your neighborhood.",
      "why_it_hits": "Making a place-symbol builds belonging.",
      "instructions": "Use thread, pen, marker, or fabric scraps to create a tiny icon like a bridge, tree, sign, skyline, or animal, finish in under an hour, and keep it imperfect.",
      "goal_tags": [
        "creativity",
        "connection"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "creative",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Long Table Invite",
      "summary": "Sit at a communal table where it is normal.",
      "why_it_hits": "Shared space creates light social possibility without pressure.",
      "instructions": "Visit a cafe, library, food hall, or beer garden with communal seating, sit at the long table if comfortable, do your own thing, and chat only if it naturally happens.",
      "goal_tags": [
        "connection",
        "novelty"
      ],
      "barrier_tags": [
        "social_hesitation",
        "overthinking"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "social",
        "exploratory",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "days_less_repetitive"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Neighborhood Construction Watch",
      "summary": "Observe a construction site from a safe public distance.",
      "why_it_hits": "Watching things being built adds momentum.",
      "instructions": "Find a legal viewing spot near a construction project, stay outside barriers, watch for ten minutes, notice machines, signals, and stages, and do not interfere or photograph workers intrusively.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The First Warm Day Rule",
      "summary": "Do one thing outside that you saved for nice weather.",
      "why_it_hits": "Acting on weather makes the day feel alive.",
      "instructions": "If the weather is pleasant, choose a simple outdoor action like lunch, reading, calling someone, walking to a shop, or sitting in a park, and do it today rather than postponing.",
      "goal_tags": [
        "novelty",
        "momentum",
        "fun"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "followed_impulses",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Tiny Dessert Delivery",
      "summary": "Bring a small sweet to someone nearby.",
      "why_it_hits": "Surprise generosity creates a shared moment.",
      "instructions": "Buy or make one small dessert, drop it to a friend, neighbor you know, coworker, or family member with a short note, and do not stay unless invited.",
      "goal_tags": [
        "connection",
        "fun"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "near_home",
        "with_other_people"
      ],
      "type_tags": [
        "social",
        "playful"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Public Map Trace",
      "summary": "Use a physical map posted in a station or park.",
      "why_it_hits": "Physical maps make orientation tangible.",
      "instructions": "Find a posted transit, trail, campus, or neighborhood map, trace your current location and one possible route with your eyes, then walk a small part of it.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory"
      ],
      "outcome_tags": [
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Art Opening Outfit Test",
      "summary": "Dress slightly sharper and attend a free arts event.",
      "why_it_hits": "Looking the part can help you enter new rooms.",
      "instructions": "Choose a free gallery, reading, launch, or concert, wear something that feels a notch elevated, attend for thirty to sixty minutes, and let yourself belong without networking hard.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "social_hesitation",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "explored_more",
        "felt_more_alive",
        "more_stories"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 2,
      "night_level": 0,
      "avoid_flags": [
        "group_social_situations"
      ]
    },
    {
      "title": "The Ordinary Walk, One Lens",
      "summary": "Walk your usual route looking only for circles.",
      "why_it_hits": "A visual constraint refreshes repetition.",
      "instructions": "Choose a route you know, look for circles in wheels, signs, drains, cups, windows, and patterns, count twenty, and let the route be otherwise normal.",
      "goal_tags": [
        "novelty",
        "creativity"
      ],
      "barrier_tags": [
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Mini Home Concert",
      "summary": "Play one live song for your household or a friend.",
      "why_it_hits": "Live music feels special even when rough.",
      "instructions": "Use an instrument, voice, or simple percussion, perform one song or rhythm for someone kind or yourself, record only if you want, and end with applause.",
      "goal_tags": [
        "fun",
        "connection",
        "creativity"
      ],
      "barrier_tags": [
        "going_far",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "creative",
        "social",
        "growth_edge"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "felt_more_alive",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 1,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Local Food History Bite",
      "summary": "Eat something while reading about its local history.",
      "why_it_hits": "Taste and story reinforce each other.",
      "instructions": "Choose a local dish, immigrant food tradition, old bakery, or market item, read a short article about it, then eat a modest version while the context is fresh.",
      "goal_tags": [
        "novelty",
        "better_stories"
      ],
      "barrier_tags": [
        "low_energy",
        "not_knowing"
      ],
      "context_tags": [
        "at_home",
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": [
        "spending_money"
      ]
    },
    {
      "title": "The Best Door Handle",
      "summary": "Search for the most satisfying public door handle.",
      "why_it_hits": "Tactile details make architecture intimate.",
      "instructions": "Visit shops, libraries, older buildings, or public halls, notice door handles you are allowed to use, compare weight, shape, and material, and crown a favorite.",
      "goal_tags": [
        "novelty",
        "fun"
      ],
      "barrier_tags": [
        "spending_money",
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "playful",
        "exploratory"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Half-Hour Sketchy Skill",
      "summary": "Try a beginner skill badly on purpose for thirty minutes.",
      "why_it_hits": "Permission to be rough makes starting easier.",
      "instructions": "Pick juggling, origami, whistling, sketching, basic dance, knot tying, or chopsticks, practice for thirty minutes using a short guide, and aim for a funny first attempt.",
      "goal_tags": [
        "fun",
        "creativity",
        "momentum"
      ],
      "barrier_tags": [
        "overthinking",
        "feeling_self_conscious"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "playful",
        "creative",
        "growth_edge"
      ],
      "outcome_tags": [
        "followed_impulses",
        "felt_more_alive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The City at Noon",
      "summary": "Spend twenty minutes outside exactly around noon.",
      "why_it_hits": "Midday has a stark, overlooked personality.",
      "instructions": "Step outside near noon, choose a plaza, park, main street, or courtyard, notice shadows, lunch crowds, delivery rhythms, and heat or brightness, then return to your day.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "explored_more"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Friend's Commute Ride-Along",
      "summary": "Join someone for part of their normal commute or route.",
      "why_it_hits": "Seeing another routine expands your world.",
      "instructions": "Ask someone you know if you can accompany a short leg of their commute, school run, or regular walk, respect their timing, and notice what they notice.",
      "goal_tags": [
        "novelty",
        "connection",
        "better_stories"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "with_other_people"
      ],
      "type_tags": [
        "exploratory",
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "did_something_unusual",
        "explored_more",
        "shared_more_with_people"
      ],
      "stretch_level": "moderate_push",
      "cost_level": 0,
      "planning_level": 1,
      "social_level": 2,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Single Candle Read",
      "summary": "Read by one lamp or candle-like light for twenty minutes.",
      "why_it_hits": "Lighting changes the texture of attention.",
      "instructions": "Choose safe warm lighting, read a book, magazine, letter, or poem for twenty minutes, keep other screens away, and stop before your eyes get tired.",
      "goal_tags": [
        "novelty",
        "momentum"
      ],
      "barrier_tags": [
        "low_energy",
        "overthinking"
      ],
      "context_tags": [
        "at_home",
        "solo"
      ],
      "type_tags": [
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 0,
      "planning_level": 0,
      "social_level": 0,
      "physical_level": 0,
      "distance_level": 0,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "Public Transit Kindness Seat",
      "summary": "Ride transit while paying attention to seat etiquette.",
      "why_it_hits": "Tiny civility changes shared space.",
      "instructions": "On a bus or train, stand or sit attentively, offer space if someone needs it more, keep your bag contained, and notice how small choices affect the ride.",
      "goal_tags": [
        "connection",
        "momentum"
      ],
      "barrier_tags": [
        "social_hesitation"
      ],
      "context_tags": [
        "out_in_the_city",
        "with_other_people",
        "solo"
      ],
      "type_tags": [
        "social",
        "reflective"
      ],
      "outcome_tags": [
        "days_less_repetitive",
        "shared_more_with_people"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 0,
      "social_level": 1,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    },
    {
      "title": "The Oldest Restaurant Nearby",
      "summary": "Visit or research the oldest restaurant you can reach.",
      "why_it_hits": "Long-running places hold communal memory.",
      "instructions": "Find a likely old restaurant, diner, cafe, or bar, visit for a drink or small item if affordable, read its history, and imagine how many ordinary meals happened there.",
      "goal_tags": [
        "novelty",
        "better_stories",
        "connection"
      ],
      "barrier_tags": [
        "not_knowing"
      ],
      "context_tags": [
        "near_home",
        "out_in_the_city",
        "solo"
      ],
      "type_tags": [
        "exploratory",
        "reflective"
      ],
      "outcome_tags": [
        "more_stories",
        "explored_more",
        "days_less_repetitive"
      ],
      "stretch_level": "easy_win",
      "cost_level": 1,
      "planning_level": 1,
      "social_level": 0,
      "physical_level": 1,
      "distance_level": 1,
      "night_level": 0,
      "avoid_flags": []
    }
  ]
}$sidequests$::jsonb AS data
)
INSERT INTO public.side_quests (
  title,
  summary,
  why_it_hits,
  instructions,
  goal_tags,
  barrier_tags,
  context_tags,
  type_tags,
  outcome_tags,
  stretch_level,
  cost_level,
  planning_level,
  social_level,
  physical_level,
  distance_level,
  night_level,
  avoid_flags,
  is_active
)
SELECT
  title,
  summary,
  why_it_hits,
  instructions,
  goal_tags,
  barrier_tags,
  context_tags,
  type_tags,
  outcome_tags,
  stretch_level,
  cost_level,
  planning_level,
  social_level,
  physical_level,
  distance_level,
  night_level,
  avoid_flags,
  true
FROM payload,
jsonb_to_recordset(payload.data -> 'quests') AS q(
  title text,
  summary text,
  why_it_hits text,
  instructions text,
  goal_tags text[],
  barrier_tags text[],
  context_tags text[],
  type_tags text[],
  outcome_tags text[],
  stretch_level text,
  cost_level integer,
  planning_level integer,
  social_level integer,
  physical_level integer,
  distance_level integer,
  night_level integer,
  avoid_flags text[]
);
