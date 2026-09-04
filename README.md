## 🗺️ Escape From Tarkov : Carte interactive des documents Battle Pass

Fork francophone de [Perofunyang/battlepass_interactive_map](https://github.com/Perofunyang/battlepass_interactive_map).

# **[Accueil fansite / Home](https://coyotte-hue.github.io/battlepass_interactive_map/)**

Pages carte : [Français](https://coyotte-hue.github.io/battlepass_interactive_map/fr.html) · [English](https://coyotte-hue.github.io/battlepass_interactive_map/en.html) · [한국어](https://coyotte-hue.github.io/battlepass_interactive_map/ko.html)

### 📌 Le projet

Carte interactive web des positions de spawn des documents Battle Pass de Escape From Tarkov : Technical, PMC, Project, Blueprints, Test, User, Medical, Financial, sur toutes les maps (Customs, Factory, Ground Zero, Interchange, Icebreaker, Lab, Labyrinth, Lighthouse, Reserve, Shoreline, Streets of Tarkov, Woods).

### ✨ Ce fork ajoute

- Page **française** (`fr.html`) + sélecteur 3 langues KO / EN / FR
- **Mobile** : sidebar en tiroir, cibles tactiles 44px, modale bottom-sheet
- **Perf** : `loading="lazy"` sur marqueurs, previews et modales

### 📁 Structure

- `index.html` : accueil fansite NORVINSK.INTEL (guide, cartes, marchands, quiz) avec liens vers la carte
- `fr.html` / `en.html` / `ko.html` : carte interactive FR / EN / KO
- `js/i18n.js` : traductions (KO, EN, FR)
- `js/app.js` : logique carte (Leaflet)
- `data/*.js` : positions des spawns par map (descriptions d'origine en coréen, `detailDesc`)
- `assets/` : cartes, icônes, previews

## ⚖️ Licence & avertissement

- **Code & contenu** : [CC BY-NC 4.0 (usage non commercial uniquement)](https://creativecommons.org/licenses/by-nc/4.0/)
- **Crédit** : projet d'origine © Perofunyang, conservé dans l'historique du fork.
- **Avertissement** : outil de fan non officiel. Les assets, images de maps et marques liés à *Escape From Tarkov* appartiennent à **Battlestate Games**.