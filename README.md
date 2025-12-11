# Joker Forge

A web app that allows you to make Balatro Jokers using Steammodded with ease. It aims to lower the barrier to entry for mod creation, moving beyond simple stat adjustments to enable the creation of truly unique and complex Joker behaviors, all without requiring direct Lua scripting knowledge from the user. The core philosophy is abstraction and empowerment: abstracting the underlying SMODS code into intuitive visual components, thereby empowering users to translate their creative gameplay ideas into functional mods.

[Try It Out](https://jokerforge.jaydchw.com/)

It does this with a Trigger > Condition > Effect system. Most vanilla jokers follow this system. With this system, less complex jokers like Droll Joker become: When a Hand is Played (Trigger) > If Scoring Cards = Flush (Condition) > Then +10 Mult (Effect). Jokers abilities are set using the built-in Rule Builder.

**STILL EARLY IN DEV, EXPECT ISSUES, MISSING FEATURES, AND ANNOYANCES FOR NOW**

## Implementation Status Checklist

The plan here is to implement enough triggers, conditions, and effects, so as that each vanilla joker in Balatro can be replicated within Joker Forge.

### Triggers

#### Fully Implemented

- [x] **Hand Played** - When a hand is played (default trigger)
- [x] **Card Scored** - When an individual card is scored
- [x] **Hand Discarded** - When a hand is discarded (before discard happens)
- [x] **Card Discarded** - When a card is discarded
- [x] **Blind Selected** - When a blind is selected
- [x] **Blind Skipped** - When a blind is skipped
- [x] **Boss Defeated** - When a boss blind is defeated
- [x] **Booster Opened** - When a booster pack is opened
- [x] **Booster Skipped** - When a booster pack is skipped
- [x] **Consumable Used** - When a consumable is used
- [x] **Hand Drawn** - When a hand is drawn
- [x] **First Hand Drawn** - When the first hand is drawn
- [x] **Shop Exited** - When exiting the shop
- [x] **Passive** - Always active, for specific effects like Pareidolia, and game rules like hand size
- [x] **Round End** - At the end of a round
- [x] **Shop Reroll** - When the shop is rerolled (Flash Card)
- [x] **Card Held in Hand** - Triggers for each card held in hand
- [x] **Card Bought** - When a card is purchased
- [x] **Card Sold** - When a card is sold
- [x] **When this Card is Sold** - When this specific card is sold
- [x] **Card Destroyed** - When a card is destroyed
- [x] **When shop is Entered** - When the shop is entered
- [x] **When this Joker is Bought** - When specifically this joker is bought (different from add to deck)
- [x] **When a Playing Card is Added** - When a playing card is added to your deck (Hologram)
- [x] **Ante Start** - At the start of an ante

#### Not Implemented Yet

- [ ] **Joker Added/Removed** - When a Joker is added/removed from your list (Joker Stencil)
- [ ] **When a Card is Modified** - When any card is modified (enhanced, etc) (difficult)
---

### Conditions

#### Fully Implemented

- [x] **Hand Type** - Check poker hand type (Flush, Straight, etc.)
- [x] **Card Count** - Check number of cards in hand
- [x] **Suit Count** - Check cards of specific suits
- [x] **Rank Count** - Check cards of specific ranks
- [x] **Card Rank** - Check individual card rank (for card_scored trigger)
- [x] **Card Suit** - Check individual card suit (for card_scored trigger)
- [x] **Card Enhancement** - Check for card enhancements (Gold, Steel, etc.)
- [x] **Card Seal** - Check for card seals (Gold, Red, Blue, Purple)
- [x] **Player Money** - Check player's current money
- [x] **Remaining Hands** - Check hands left in round
- [x] **Remaining Discards** - Check discards left in round
- [x] **Joker Count** - Check number of jokers owned
- [x] **Blind Type** - Check current blind type (Small, Big, Boss)
- [x] **Random Chance** - Probability-based conditions
- [x] **Internal Variable** - Check joker's internal variable values
- [x] **First Played Hand** - Check if this is the first hand played in the round
- [x] **First Discarded Hand** - Check if this is the first hand discarded in the round
- [x] **Ante Level** - Check current ante level
- [x] **Hand Size** - Check current hand size
- [x] **Deck Size** - Check remaining deck size
- [x] **Deck Count By Rank, Suit, Enhancement, Seal, Edition** - Check the specifics of the cards in your full deck
- [x] **Specific Joker** - Check if you have a specific joker in your list
- [x] **Generic Compare** - Check GameVars and Vars against a value/eachother
- [x] **Consumable Type** - Check for card sold and consumable used
- [x] **Glass Card Destroyed** - Check to see if a glass card got destroyed (Glass Joker)
- [x] **Triggered Boss Blind Ability** - Check if the boss blind's ability was triggered (Matador)
- [x] **Most/Least Played Poker Hand** - Check if the hand played is your most/least played (Obelisk)
- [x] **Consumable Held** - Check for specific consumable/s held
- [x] **Score Threshold** - Check if score meets requirement (Mr. Bones)
- [x] **Lucky Card Triggered** - Check if a lucky card succesfully triggered (Lucky Cat)
- [x] **Edition Count** - Check how many cards with editions are in hand played
- [x] **Enhancement Count** - Check how many cards with enhancements are in hand played
- [x] **Seal Count** - Check how many cards with seals are in hand played
- [x] **Check Specific Poker Hand Level** - Check a specific poker hands level
- [x] **Culmative Chip/Rank Check** - Check for if cards rank/chips add up to a certain number
- [x] **Consumable Count** - Check number of consumables owned

---

### Effects

#### Fully Implemented

- [x] **Add Chips** - Add flat chips to score
- [x] **Apply X Chips** - Multiply chips by value
- [x] **Apply ^Chips** - Exponentially multiply chips by value
- [x] **Add Mult** - Add flat mult to score
- [x] **Apply X Mult** - Multiply mult by value
- [x] **Apply ^Mult** - Exponentially multiply mult by value
- [x] **Add Dollars** - Give money to player
- [x] **Retrigger Cards** - Retrigger scored cards (card_scored trigger only)
- [x] **Level Up Hand** - Increase poker hand level
- [x] **Edit Discard** - Give/take/set discards
- [x] **Edit Hand** - Give/take/set hands
- [x] **Destroy Self** - Destroy the joker
- [x] **Add Card to Deck** - Add new playing cards to deck/hand (this is half done, still an error with scoring triggers)
- [x] **Copy Triggered Card** - Copy the card that triggered the effect
- [x] **Copy Played Card** - Copy specific cards from played hand
- [x] **Edit Triggered Card** - Modify card properties (rank, suit, enhancement, seal)
- [x] **Delete Triggered Card** - Destroys/deletes cards when scored/discarded
- [x] **Modify Internal Variable** - Change joker's internal variable values
- [x] **Create Tarot Card** - Create a random or set tarot card
- [x] **Create Planet Card** - Create a random or set planet card
- [x] **Create Spectral Card** - Create a random or set spectral card
- [x] **Destroy Consumable** - Destroy a random or specific spectral/tarot/planet card
- [x] **Copy Consumable** - Copy a random or specific spectral/tarot/planet card
- [x] **Edit Hand Size** - Give/take/set hand size (Turtle Bean)
- [x] **Create Joker** - Create a different joker (Random, By ID)
- [x] **Copy Joker** - Make a copy of another joker (Random, By ID, By Index)
- [x] **Destroy Joker** - Destroy another joker (Random, By ID, By Index)
- [x] **Create Skip Tags** - Create a set or random skip tag
- [x] **Set Dollars** - Set dollars to a value
- [x] **Show Message** - Just show a simple little message
- [x] **Disable Boss Blind** - Disables the boss blinds unique effect (Luchador, Chicot)
- [x] **Copy Ability of Adjacent Joker** - Blueprint/Brainstorm logic
- [x] **Modify Sell Value** - Change sell value of this or other jokers (Egg, Gift Card)
- [x] **Permanent Card Modifications** - Add permanent bonuses to cards (Hiker)
- [x] **Modify Probability** - Oops All 6s! support
- [x] **All [Cards] in the Shop are Free** - Changes the buy price of certain packs/cards (planet, joker, tarot, spectral) to be free
- [x] **All Cards are Scored** - Splash logic
- [x] **Combine Suits** - Treat two or more suits as the same suit (Smeared Joker)
- [x] **Combine Ranks** - Treat two or more ranks as the same rank
- [x] **Cards May Appear Multiple Times** - Showman logic
- [x] **Allowing Debt** - Credit Card logic
- [X] **Alter Blind Requirement** - I.E. 2X blind requirement, 0.5x blind requirement
- [X] **Beat Current Blind** - Completes the current blind
- [x] **Add/Subtract/Set Joker Slots** - Would be cool i guess lol
- [x] **Add/Subtract/Set Consumable Slots** - also self-explanatory
- [x] **Destroy Card in Hand** - Destroys a random or set (by index, rank, suit) card in hand

#### Not Implemented Yet

- [ ] **Apply Edition to Joker** - Apply an edition to a random/set Joker owned

---

### Code Generation Features

#### Implemented

- [x] **Condition Function Generation** - Creates helper functions for conditions
- [x] **Effect Chaining** - Multiple effects in one rule using `extra` field
- [x] **Context-Aware Generation** - Different code for different triggers
- [x] **Parameter Validation** - Handles conditional parameter visibility
- [x] **Lua Code Output** - Generates proper SMODS-compatible Lua
- [x] **Atlas Generation** - Creates sprite atlases from uploaded images
- [x] **Mod Packaging** - Complete mod folder structure with JSON metadata
- [x] **Mod Metadata Editing** - Edit parameters like description, version, etc.
- [x] **Sticker Compatibility** - Perishable, Rental, etc. 
- [x] **Blueprint Compatibility Logic** - Actual blueprint behavior code
- [x] **Unlock Condition Generation** - Custom unlock requirements

#### Not Implemented Yet

- [ ] **Localization Support** - Multiple language support

---

### UI Features

#### Implemented

- [x] **Rule Builder Modal** - Visual rule creation interface
- [x] **Condition Groups** - AND/OR logic between condition groups
- [x] **Parameter Fields** - Dynamic form fields based on condition/effect type
- [x] **Trigger Filtering** - Only show applicable conditions/effects for selected trigger
- [x] **Rule Description** - Human-readable rule summaries
- [x] **Joker Card Preview** - Visual joker card with hover tooltips
- [x] **Image Upload** - Custom joker sprite upload with validation
- [x] **Export System** - Generate and download complete mod packages
- [x] **Import System** - Import existing jokers/rules from files

#### Not Implemented Yet

- [ ] **Dynamic Code Display** - Live preview of generated Lua code in rule builder
- [ ] **Undo/Redo System** - History management for rule editing
- [ ] **Help System** - Integrated tooltips and documentation

---

# Usage

Go to [the website](https://jokerforge.jaydchw.com/) to start creating jokers

### Running Locally

1. **Prerequisites**

   - Node.js (v16 or higher)
   - npm

2. **Setup**

   ```bash
   # Clone the repository
   git clone https://github.com/Jayd-H/joker-forge.git
   cd joker-forge

   # Install dependencies
   npm install

   # Start the development server
   npm run dev
   ```

# Acknowledgements

Icons from Heroicons, favicon from SVGRepo (this should be temporary).

Thank you balatro modding discord server for answering benign questions.
