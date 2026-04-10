import type { Card } from '@/domain/types'
import { safeGetItem, safeSetItem, safeRemoveItem, isStorageAvailable } from '@/utils/storage'

export interface CardMeaning {
  upright: string
  reversed: string
  desc: string
  biddyUrl: string
}

// All 78 tarot card meanings from tarotapi.dev (Waite's Pictorial Key to the Tarot)
// with Biddy Tarot links for detailed readings
const CARD_MEANINGS: Record<string, CardMeaning> = {
  // ==================== MAJOR ARCANA ====================
  'The Fool': {
    upright:
      'Folly, mania, extravagance, intoxication, delirium, frenzy, bewrayment.',
    reversed:
      'Negligence, absence, distribution, carelessness, apathy, nullity, vanity.',
    desc: 'With light step, as if earth and its trammels had little power to restrain him, a young man in gorgeous vestments pauses at the brink of a precipice among the great heights of the world; he surveys the blue distance before him-its expanse of sky rather than the prospect below. His act of eager walking is still indicated, though he is stationary at the given moment; his dog is still bounding. The edge which opens on the depth has no terror; it is as if angels were waiting to uphold him, if it came about that he leaped from the height. His countenance is full of intelligence and expectant dream. He has a rose in one hand and in the other a costly wand, from which depends over his right shoulder a wallet curiously embroidered. He is a prince of the other world on his travels through this one-all amidst the morning glory, in the keen air. The sun, which shines behind him, knows whence he came, whither he is going, and how he will return by another path after many days. He is the spirit in search of experience.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/fool/',
  },
  'The Magician': {
    upright:
      'Skill, diplomacy, address, subtlety; sickness, pain, loss, disaster, snares of enemies; self-confidence, will; the Querent, if male.',
    reversed: 'Physician, Magus, mental disease, disgrace, disquiet.',
    desc: "A youthful figure in the robe of a magician, having the countenance of divine Apollo, with smile of confidence and shining eyes. Above his head is the mysterious sign of the Holy Spirit, the sign of life, like an endless cord, forming the figure 8 in a horizontal position. About his waist is a serpent-cincture, the serpent appearing to devour its own tail. In the Magician's right hand is a wand raised towards heaven, while the left hand is pointing to the earth. On the table in front of the Magician are the symbols of the four Tarot suits, signifying the elements of natural life, which lie like counters before the adept, and he adapts them as he wills.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/magician/',
  },
  'The High Priestess': {
    upright:
      'Secrets, mystery, the future as yet unrevealed; the woman who interests the Querent, if male; the Querent herself, if female; silence, tenacity; mystery, wisdom, science.',
    reversed: 'Passion, moral or physical ardour, conceit, surface knowledge.',
    desc: 'She has the lunar crescent at her feet, a horned diadem on her head, with a globe in the middle place, and a large solar cross on her breast. The scroll in her hands is inscribed with the word Tora, signifying the Greater Law, the Secret Law and the second sense of the Word. It is partly covered by her mantle, to shew that some things are implied and some spoken. She is seated between the white and black pillars--J. and B.--of the mystic Temple, and the veil of the Temple is behind her: it is embroidered with palms and pomegranates.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/high-priestess/',
  },
  'The Empress': {
    upright:
      'Fruitfulness, action, initiative, length of days; the unknown, clandestine; also difficulty, doubt, ignorance.',
    reversed:
      'Light, truth, the unravelling of involved matters, public rejoicings; according to another reading, vacillation.',
    desc: 'A stately figure, seated, having rich vestments and royal aspect, as of a daughter of heaven and earth. Her diadem is of twelve stars, gathered in a cluster. The symbol of Venus is on the shield which rests near her. A field of corn is ripening in front of her, and beyond there is a fall of water. The sceptre which she bears is surmounted by the globe of this world. She is the inferior Garden of Eden, the Earthly Paradise, all that is symbolized by the visible house of man.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/empress/',
  },
  'The Emperor': {
    upright:
      'Stability, power, protection, realization; a great person; aid, reason, conviction; also authority and will.',
    reversed:
      'Benevolence, compassion, credit; also confusion to enemies, obstruction, immaturity.',
    desc: "He has a form of the Crux ansata for his sceptre and a globe in his left hand. He is a crowned monarch--commanding, stately, seated on a throne, the arms of which axe fronted by rams' heads. He is executive and realization, the power of this world, here clothed with the highest of its natural attributes. He is the virile power, to which the Empress responds.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/emperor/',
  },
  'The Hierophant': {
    upright:
      'Marriage, alliance, captivity, servitude; by another account, mercy and goodness; inspiration; the man to whom the Querent has recourse.',
    reversed: 'Society, good understanding, concord, overkindness, weakness.',
    desc: 'He wears the triple crown and is seated between two pillars, but they are not those of the Temple which is guarded by the High Priestess. In his left hand he holds a sceptre terminating in the triple cross, and with his right hand he gives the well-known ecclesiastical sign which is called that of esotericism, distinguishing between the manifest and concealed part of doctrine. At his feet are the crossed keys, and two priestly ministers in albs kneel before him.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/hierophant/',
  },
  'The Lovers': {
    upright: 'Attraction, love, beauty, trials overcome.',
    reversed:
      'Failure, foolish designs. Another account speaks of marriage frustrated and contrarieties of all kinds.',
    desc: 'The sun shines in the zenith, and beneath is a great winged figure with arms extended, pouring down influences. In the foreground are two human figures, male and female, unveiled before each other, as if Adam and Eve when they first occupied the paradise of the earthly body. Behind the man is the Tree of Life, bearing twelve fruits, and the Tree of the Knowledge of Good and Evil is behind the woman; the serpent is twining round it. The figures suggest youth, virginity, innocence and love before it is contaminated by gross material desire.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/lovers/',
  },
  'The Chariot': {
    upright:
      'Succour, providence also war, triumph, presumption, vengeance, trouble.',
    reversed: 'Riot, quarrel, dispute, litigation, defeat.',
    desc: 'An erect and princely figure carrying a drawn sword and corresponding, broadly speaking, to the traditional description. On the shoulders of the victorious hero are supposed to be the Urim and Thummim. He has led captivity captive; he is conquest on all planes--in the mind, in science, in progress, in certain trials of initiation. He has thus replied to the sphinx, and it is on this account that I have accepted the variation of Éliphas Lévi; two sphinxes thus draw his chariot.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/chariot/',
  },
  Strength: {
    upright:
      'Power, energy, action, courage, magnanimity; also complete success and honours.',
    reversed:
      'Despotism, abuse if power, weakness, discord, sometimes even disgrace.',
    desc: 'A woman, over whose head there broods the same symbol of life which we have seen in the card of the Magician, is closing the jaws of a lion. The only point in which this design differs from the conventional presentations is that her beneficent fortitude has already subdued the lion, which is being led by a chain of flowers. Fortitude, in one of its most exalted aspects, is connected with the Divine Mystery of Union; the virtue, of course, operates in all planes, and hence draws on all in its symbolism.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/strength/',
  },
  'The Hermit': {
    upright:
      'Prudence, circumspection; also and especially treason, dissimulation, roguery, corruption.',
    reversed: 'Concealment, disguise, policy, fear, unreasoned caution.',
    desc: 'The variation from the conventional models in this card is only that the lamp is not enveloped partially in the mantle of its bearer, who blends the idea of the Ancient of Days with the Light of the World It is a star which shines in the lantern. I have said that this is a card of attainment, and to extend this conception the figure is seen holding up his beacon on an eminence.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/hermit/',
  },
  'Wheel of Fortune': {
    upright: 'Destiny, fortune, success, elevation, luck, felicity.',
    reversed: 'Increase, abundance, superfluity.',
    desc: "The symbolism is not exclusively Egyptian, as the four Living Creatures of Ezekiel occupy the angles of the card, and the wheel itself follows other indications in respect of Ezekiel's vision, as illustrative of the particular Tarot Key. With the French occultist, and in the design itself, the symbolic picture stands for the perpetual motion of a fluidic universe and for the flux of human life. The Sphinx is the equilibrium therein.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/wheel-of-fortune/',
  },
  Justice: {
    upright:
      'Equity, rightness, probity, executive; triumph of the deserving side in law.',
    reversed:
      'Law in all its departments, legal complications, bigotry, bias, excessive severity.',
    desc: 'The figure is seated between pillars, like the High Priestess, and on this account it seems desirable to indicate that the moral principle which deals unto every man according to his works--while, of course, it is in strict analogy with higher things;--differs in its essence from the spiritual justice which is involved in the idea of election.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/justice/',
  },
  'The Hanged Man': {
    upright:
      'Wisdom, circumspection, discernment, trials, sacrifice, intuition, divination, prophecy.',
    reversed: 'Selfishness, the crowd, body politic.',
    desc: 'The gallows from which he is suspended forms a Tau cross, while the figure--from the position of the legs--forms a fylfot cross. There is a nimbus about the head of the seeming martyr. It should be noted (1) that the tree of sacrifice is living wood, with leaves thereon; (2) that the face expresses deep entrancement, not suffering; (3) that the figure, as a whole, suggests life in suspension, but life and not death.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/hanged-man/',
  },
  Death: {
    upright:
      'End, mortality, destruction, corruption also, for a man, the loss of a benefactor for a woman, many contrarieties; for a maid, failure of marriage projects.',
    reversed:
      'Inertia, sleep, lethargy, petrifaction, somnambulism; hope destroyed.',
    desc: 'The veil or mask of life is perpetuated in change, transformation and passage from lower to higher, and this is more fitly represented in the rectified Tarot by one of the apocalyptic visions than by the crude notion of the reaping skeleton. Behind it lies the whole world of ascent in the spirit. The mysterious horseman moves slowly, bearing a black banner emblazoned with the Mystic Rose, which signifies life.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/death/',
  },
  Temperance: {
    upright: 'Economy, moderation, frugality, management, accommodation.',
    reversed:
      'Things connected with churches, religions, sects, the priesthood, sometimes even the priest who will marry the Querent; also disunion, unfortunate combinations, competing interests.',
    desc: 'A winged angel, with the sign of the sun upon his forehead and on his breast the square and triangle of the septenary. It is held to be pouring the essences of life from chalice to chalice. It has one foot upon the earth and one upon waters, thus illustrating the nature of the essences.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/temperance/',
  },
  'The Devil': {
    upright:
      'Ravage, violence, vehemence, extraordinary efforts, force, fatality; that which is predestined but is not for this reason evil.',
    reversed: 'Evil fatality, weakness, pettiness, blindness.',
    desc: 'The Horned Goat of Mendes, with wings like those of a bat, is standing on an altar. At the pit of the stomach there is the sign of Mercury. The right hand is upraised and extended, being the reverse of that benediction which is given by the Hierophant in the fifth card. In the left hand there is a great flaming torch, inverted towards the earth. A reversed pentagram is on the forehead. There is a ring in front of the altar, from which two chains are carried to the necks of two figures, male and female.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/devil/',
  },
  'The Tower': {
    upright:
      'Misery, distress, indigence, adversity, calamity, disgrace, deception, ruin. It is a card in particular of unforeseen catastrophe.',
    reversed:
      'According to one account, the same in a lesser degree also oppression, imprisonment, tyranny.',
    desc: 'It is idle to indicate that it depicts min in all its aspects, because it bears this evidence on the surface. It is said further that it contains the first allusion to a material building, but I do not conceive that the Tower is more or less material than the pillars which we have met with in three previous cases.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/tower/',
  },
  'The Star': {
    upright:
      'Loss, theft, privation, abandonment; another reading says-hope and bright prospects.',
    reversed: 'Arrogance, haughtiness, impotence.',
    desc: 'A great, radiant star of eight rays, surrounded by seven lesser stars--also of eight rays. The female figure in the foreground is entirely naked. Her left knee is on the land and her right foot upon the water. She pours Water of Life from two great ewers, irrigating sea and land. Behind her is rising ground and on the right a shrub or tree, whereon a bird alights. The figure expresses eternal youth and beauty.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/star/',
  },
  'The Moon': {
    upright:
      'Hidden enemies, danger, calumny, darkness, terror, deception, occult forces, error.',
    reversed:
      'Instability, inconstancy, silence, lesser degrees of deception and error.',
    desc: 'The distinction between this card and some of the conventional types is that the moon is increasing on what is called the side of mercy, to the right of the observer. It has sixteen chief and sixteen secondary rays. The card represents life of the imagination apart from life of the spirit. The path between the towers is the issue into the unknown.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/moon/',
  },
  'The Sun': {
    upright: 'Material happiness, fortunate marriage, contentment.',
    reversed: 'The same in a lesser sense.',
    desc: 'The naked child mounted on a white horse and displaying a red standard has been mentioned already as the better symbolism connected with this card. It is the destiny of the Supernatural East and the great and holy light which goes before the endless procession of humanity, coming out from the walled garden of the sensitive life and passing on the journey home.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/sun/',
  },
  Judgement: {
    upright:
      'Change of position, renewal, outcome. Another account specifies total loss though lawsuit.',
    reversed:
      'Weakness, pusillanimity, simplicity; also deliberation, decision, sentence.',
    desc: 'The great angel is here encompassed by clouds, but he blows his bannered trumpet, and the cross as usual is displayed on the banner. The dead are rising from their tombs--a woman on the right, a man on the left hand, and between them their child, whose back is turned. But in this card there are more than three who are restored, and it has been thought worth while to make this variation.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/major-arcana/judgement/',
  },
  'The World': {
    upright:
      'Assured success, recompense, voyage, route, emigration, flight, change of place.',
    reversed: 'Inertia, fixity, stagnation, permanence.',
    desc: 'As this final message of the Major Trumps is unchanged--and indeed unchangeable--in respect of its design, it has been partly described already regarding its deeper sense. It represents also the perfection and end of the Cosmos, the secret which is within it, the rapture of the universe when it understands itself in God. It is further the state of the soul in the consciousness of Divine Vision, reflected from the self-knowing spirit.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/major-arcana/world/',
  },

  // ==================== WANDS ====================
  'Ace of Wands': {
    upright:
      'Creation, invention, enterprise, the powers which result in these; principle, beginning, source; birth, family, origin, and in a sense the virility which is behind them; the starting point of enterprises; according to another account, money, fortune, inheritance.',
    reversed:
      'Fall, decadence, ruin, perdition, to perish also a certain clouded joy.',
    desc: 'A hand issuing from a cloud grasps a stout wand or club.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/ace-of-wands/',
  },
  'Two of Wands': {
    upright:
      'Between the alternative readings there is no marriage possible; on the one hand, riches, fortune, magnificence; on the other, physical suffering, disease, chagrin, sadness, mortification.',
    reversed: 'Surprise, wonder, enchantment, emotion, trouble, fear.',
    desc: 'A tall man looks from a battlemented roof over sea and shore; he holds a globe in his right hand, while a staff in his left rests on the battlement; another is fixed in a ring. The Rose and Cross and Lily should be noticed on the left side.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/two-of-wands/',
  },
  'Three of Wands': {
    upright:
      'He symbolizes established strength, enterprise, effort, trade, commerce, discovery; those are his ships, bearing his merchandise, which are sailing over the sea. The card also signifies able co-operation in business.',
    reversed:
      'The end of troubles, suspension or cessation of adversity, toil and disappointment.',
    desc: "A calm, stately personage, with his back turned, looking from a cliff's edge at ships passing over the sea. Three staves are planted in the ground, and he leans slightly on one of them.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/three-of-wands/',
  },
  'Four of Wands': {
    upright:
      'They are for once almost on the surface--country life, haven of refuge, a species of domestic harvest-home, repose, concord, harmony, prosperity, peace, and the perfected work of these.',
    reversed:
      'The meaning remains unaltered; it is prosperity, increase, felicity, beauty, embellishment.',
    desc: 'From the four great staves planted in the foreground there is a great garland suspended; two female figures uplift nosegays; at their side is a bridge over a moat, leading to an old manorial house.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/four-of-wands/',
  },
  'Five of Wands': {
    upright:
      'Imitation, as, for example, sham fight, but also the strenuous competition and struggle of the search after riches and fortune. In this sense it connects with the battle of life. Hence some attributions say that it is a card of gold, gain, opulence.',
    reversed: 'Litigation, disputes, trickery, contradiction.',
    desc: 'A posse of youths, who are brandishing staves, as if in sport or strife. It is mimic warfare.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/five-of-wands/',
  },
  'Six of Wands': {
    upright:
      "The card has been so designed that it can cover several significations; on the surface, it is a victor triumphing, but it is also great news, such as might be carried in state by the King's courier; it is expectation crowned with its own desire, the crown of hope, and so forth.",
    reversed:
      'Apprehension, fear, as of a victorious enemy at the gate; treachery, disloyalty, as of gates being opened to the enemy; also indefinite delay.',
    desc: 'A laurelled horseman bears one staff adorned with a laurel crown; footmen with staves are at his side.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/six-of-wands/',
  },
  'Seven of Wands': {
    upright:
      'It is a card of valour, for, on the surface, six are attacking one, who has, however, the vantage position. On the intellectual plane, it signifies discussion, wordy strife; in business--negotiations, war of trade, barter, competition.',
    reversed:
      'Perplexity, embarrassments, anxiety. It is also a caution against indecision.',
    desc: 'A young man on a craggy eminence brandishing a staff; six other staves are raised towards him from below.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/seven-of-wands/',
  },
  'Eight of Wands': {
    upright:
      'Activity in undertakings, the path of such activity, swiftness, as that of an express messenger; great haste, great hope, speed towards an end which promises assured felicity; generally, that which is on the move; also the arrows of love.',
    reversed:
      'Arrows of jealousy, internal dispute, stingings of conscience, quarrels; and domestic disputes for persons who are married.',
    desc: 'The card represents motion through the immovable-a flight of wands through an open country; but they draw to the term of their course.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/eight-of-wands/',
  },
  'Nine of Wands': {
    upright:
      'The card signifies strength in opposition. If attacked, the person will meet an onslaught boldly; and his build shews, that he may prove a formidable antagonist. With this main significance there are all its possible adjuncts--delay, suspension, adjournment.',
    reversed: 'Obstacles, adversity, calamity.',
    desc: 'The figure leans upon his staff and has an expectant look, as if awaiting an enemy. Behind are eight other staves--erect, in orderly disposition, like a palisade.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/nine-of-wands/',
  },
  'Ten of Wands': {
    upright:
      'A card of many significances, and some of the readings cannot be harmonized. I set aside that which connects it with honour and good faith. The chief meaning is oppression simply, but it is also fortune, gain, any kind of success, and then it is the oppression of these things.',
    reversed: 'Contrarieties, difficulties, intrigues, and their analogies.',
    desc: 'A man oppressed by the weight of the ten staves which he is carrying.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/ten-of-wands/',
  },
  'Page of Wands': {
    upright:
      'Dark young man, faithful, a lover, an envoy, a postman. Beside a man, he will bear favourable testimony concerning him. A dangerous rival, if followed by the Page of Cups. Has the chief qualities of his suit. He may signify family intelligence.',
    reversed:
      'Anecdotes, announcements, evil news. Also indecision and the instability which accompanies it.',
    desc: 'In a scene similar to the former, a young man stands in the act of proclamation. He is unknown but faithful, and his tidings are strange.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/page-of-wands/',
  },
  'Knight of Wands': {
    upright:
      'Departure, absence, flight, emigration. A dark young man, friendly. Change of residence.',
    reversed: 'Rupture, division, interruption, discord.',
    desc: 'He is shewn as if upon a journey, armed with a short wand, and although mailed is not on a warlike errand. He is passing mounds or pyramids. The motion of the horse is a key to the character of its rider, and suggests the precipitate mood, or things connected therewith.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/knight-of-wands/',
  },
  'Queen of Wands': {
    upright:
      'A dark woman, countrywoman, friendly, chaste, loving, honourable. If the card beside her signifies a man, she is well disposed towards him; if a woman, she is interested in the Querent. Also, love of money, or a certain success in business.',
    reversed:
      'Good, economical, obliging, serviceable. Signifies also--but in certain positions and in the neighbourhood of other cards tending in such directions--opposition, jealousy, even deceit and infidelity.',
    desc: "The Wands throughout this suit are always in leaf, as it is a suit of life and animation. Emotionally and otherwise, the Queen's personality corresponds to that of the King, but is more magnetic.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/queen-of-wands/',
  },
  'King of Wands': {
    upright:
      'Dark man, friendly, countryman, generally married, honest and conscientious. The card always signifies honesty, and may mean news concerning an unexpected heritage to fall in before very long.',
    reversed: 'Good, but severe; austere, yet tolerant.',
    desc: 'The physical and emotional nature to which this card is attributed is dark, ardent, lithe, animated, impassioned, noble. The King uplifts a flowering wand, and wears, like his three correspondences in the remaining suits, what is called a cap of maintenance beneath his crown.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-wands/king-of-wands/',
  },

  // ==================== CUPS ====================
  'Ace of Cups': {
    upright:
      'House of the true heart, joy, content, abode, nourishment, abundance, fertility; Holy Table, felicity hereof.',
    reversed: 'House of the false heart, mutation, instability, revolution.',
    desc: 'The waters are beneath, and thereon are water-lilies; the hand issues from the cloud, holding in its palm the cup, from which four streams are pouring; a dove, bearing in its bill a cross-marked Host, descends to place the Wafer in the Cup; the dew of water is falling on all sides.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/ace-of-cups/',
  },
  'Two of Cups': {
    upright:
      'Love, passion, friendship, affinity, union, concord, sympathy, the interrelation of the sexes, and--as a suggestion apart from all offices of divination--that desire which is not in Nature, but by which Nature is sanctified.',
    reversed:
      'Lust, cupidity, jealousy, wish, desire, but the card may also give, says W., "that desire which is not in nature, but by which nature is sanctified."',
    desc: "A youth and maiden are pledging one another, and above their cups rises the Caduceus of Hermes, between the great wings of which there appears a lion's head.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/two-of-cups/',
  },
  'Three of Cups': {
    upright:
      'The conclusion of any matter in plenty, perfection and merriment; happy issue, victory, fulfilment, solace, healing.',
    reversed:
      'Expedition, dispatch, achievement, end. It signifies also the side of excess in physical enjoyment, and the pleasures of the senses.',
    desc: 'Maidens in a garden-ground with cups uplifted, as if pledging one another.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/three-of-cups/',
  },
  'Four of Cups': {
    upright:
      'Weariness, disgust, aversion, imaginary vexations, as if the wine of this world had caused satiety only; another wine, as if a fairy gift, is now offered the wastrel, but he sees no consolation therein.',
    reversed: 'Novelty, presage, new instruction, new relations.',
    desc: 'A young man is seated under a tree and contemplates three cups set on the grass before him; an arm issuing from a cloud offers him another cup. His expression notwithstanding is one of discontent with his environment.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/four-of-cups/',
  },
  'Five of Cups': {
    upright:
      'It is a card of loss, but something remains over; three have been taken, but two are left; it is a card of inheritance, patrimony, transmission, but not corresponding to expectations; with some interpreters it is a card of marriage, but not without bitterness or frustration.',
    reversed:
      'News, alliances, affinity, consanguinity, ancestry, return, false projects.',
    desc: 'A dark, cloaked figure, looking sideways at three prone cups two others stand upright behind him; a bridge is in the background, leading to a small keep or holding.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/five-of-cups/',
  },
  'Six of Cups': {
    upright:
      'A card of the past and of memories, looking back, as--for example--on childhood; happiness, enjoyment, but coming rather from the past; things that have vanished.',
    reversed: 'The future, renewal, that which will come to pass presently.',
    desc: 'Children in an old garden, their cups filled with flowers.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/six-of-cups/',
  },
  'Seven of Cups': {
    upright:
      'Fairy favours, images of reflection, sentiment, imagination, things seen in the glass of contemplation; some attainment in these degrees, but nothing permanent or substantial is suggested.',
    reversed: 'Desire, will, determination, project.',
    desc: 'Strange chalices of vision, but the images are more especially those of the fantastic spirit.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/seven-of-cups/',
  },
  'Eight of Cups': {
    upright:
      'The card speaks for itself on the surface, but other readings are entirely antithetical--giving joy, mildness, timidity, honour, modesty. In practice, it is usually found that the card shews the decline of a matter, or that a matter which has been thought to be important is really of slight consequence.',
    reversed: 'Great joy, happiness, feasting.',
    desc: 'A man of dejected aspect is deserting the cups of his felicity, enterprise, undertaking or previous concern.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/eight-of-cups/',
  },
  'Nine of Cups': {
    upright:
      'Concord, contentment, physical bien-être; also victory, success, advantage; satisfaction for the Querent or person for whom the consultation is made.',
    reversed:
      'Truth, loyalty, liberty; but the readings vary and include mistakes, imperfections, etc.',
    desc: "A goodly personage has feasted to his heart's content, and abundant refreshment of wine is on the arched counter behind him, seeming to indicate that the future is also assured.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/nine-of-cups/',
  },
  'Ten of Cups': {
    upright:
      "Contentment, repose of the entire heart; the perfection of that state; also perfection of human love and friendship; if with several picture-cards, a person who is taking charge of the Querent's interests.",
    reversed: 'Repose of the false heart, indignation, violence.',
    desc: 'Appearance of Cups in a rainbow; it is contemplated in wonder and ecstacy by a man and woman below, evidently husband and wife. His right arm is about her; his left is raised upward; she raises her right arm. The two children dancing near them have not observed the prodigy but are happy after their own manner.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/ten-of-cups/',
  },
  'Page of Cups': {
    upright:
      'Fair young man, one impelled to render service and with whom the Querent will be connected; a studious youth; news, message; application, reflection, meditation; also these things directed to business.',
    reversed: 'Taste, inclination, attachment, seduction, deception, artifice.',
    desc: 'A fair, pleasing, somewhat effeminate page, of studious and intent aspect, contemplates a fish rising from a cup to look at him. It is the pictures of the mind taking form.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/page-of-cups/',
  },
  'Knight of Cups': {
    upright:
      'Arrival, approach--sometimes that of a messenger; advances, proposition, demeanour, invitation, incitement.',
    reversed: 'Trickery, artifice, subtlety, swindling, duplicity, fraud.',
    desc: 'Graceful, but not warlike; riding quietly, wearing a winged helmet, referring to those higher graces of the imagination which sometimes characterize this card. He too is a dreamer, but the images of the side of sense haunt him in his vision.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/knight-of-cups/',
  },
  'Queen of Cups': {
    upright:
      'Good, fair woman; honest, devoted woman, who will do service to the Querent; loving intelligence, and hence the gift of vision; success, happiness, pleasure; also wisdom, virtue; a perfect spouse and a good mother.',
    reversed:
      'The accounts vary; good woman; otherwise, distinguished woman but one not to be trusted; perverse woman; vice, dishonour, depravity.',
    desc: 'Beautiful, fair, dreamy--as one who sees visions in a cup. This is, however, only one of her aspects; she sees, but she also acts, and her activity feeds her dream.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/queen-of-cups/',
  },
  'King of Cups': {
    upright:
      'Fair man, man of business, law, or divinity; responsible, disposed to oblige the Querent; also equity, art and science, including those who profess science, law and art; creative intelligence.',
    reversed:
      'Dishonest, double-dealing man; roguery, exaction, injustice, vice, scandal, pillage, considerable loss.',
    desc: 'He holds a short sceptre in his left hand and a great cup in his right; his throne is set upon the sea; on one side a ship is riding and on the other a dolphin is leaping.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-cups/king-of-cups/',
  },

  // ==================== SWORDS ====================
  'Ace of Swords': {
    upright:
      'Triumph, the excessive degree in everything, conquest, triumph of force. It is a card of great force, in love as well as in hatred. The crown may carry a much higher significance than comes usually within the sphere of fortune-telling.',
    reversed:
      'The same, but the results are disastrous; another account says--conception, childbirth, augmentation, multiplicity.',
    desc: 'A hand issues from a cloud, grasping as word, the point of which is encircled by a crown.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/ace-of-swords/',
  },
  'Two of Swords': {
    upright:
      'Conformity and the equipoise which it suggests, courage, friendship, concord in a state of arms; another reading gives tenderness, affection, intimacy.',
    reversed: 'Imposture, falsehood, duplicity, disloyalty.',
    desc: 'A hoodwinked female figure balances two swords upon her shoulders.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/two-of-swords/',
  },
  'Three of Swords': {
    upright:
      'Removal, absence, delay, division, rupture, dispersion, and all that the design signifies naturally, being too simple and obvious to call for specific enumeration.',
    reversed:
      'Mental alienation, error, loss, distraction, disorder, confusion.',
    desc: 'Three swords piercing a heart; cloud and rain behind.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/three-of-swords/',
  },
  'Four of Swords': {
    upright:
      "Vigilance, retreat, solitude, hermit's repose, exile, tomb and coffin. It is these last that have suggested the design.",
    reversed:
      'Wise administration, circumspection, economy, avarice, precaution, testament.',
    desc: 'The effigy of a knight in the attitude of prayer, at full length upon his tomb.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/four-of-swords/',
  },
  'Five of Swords': {
    upright:
      'Degradation, destruction, revocation, infamy, dishonour, loss, with the variants and analogues of these.',
    reversed: 'The same; burial and obsequies.',
    desc: 'A disdainful man looks after two retreating and dejected figures. Their swords lie upon the ground. He carries two others on his left shoulder, and a third sword is in his right hand, point to earth. He is the master in possession of the field.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/five-of-swords/',
  },
  'Six of Swords': {
    upright: 'Journey by water, route, way, envoy, commissionary, expedient.',
    reversed:
      'Declaration, confession, publicity; one account says that it is a proposal of love.',
    desc: 'A ferryman carrying passengers in his punt to the further shore. The course is smooth, and seeing that the freight is light, it may be noted that the work is not beyond his strength.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/six-of-swords/',
  },
  'Seven of Swords': {
    upright:
      'Design, attempt, wish, hope, confidence; also quarrelling, a plan that may fail, annoyance. The design is uncertain in its import, because the significations are widely at variance with each other.',
    reversed: 'Good advice, counsel, instruction, slander, babbling.',
    desc: 'A man in the act of carrying away five swords rapidly; the two others of the card remain stuck in the ground. A camp is close at hand.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/seven-of-swords/',
  },
  'Eight of Swords': {
    upright:
      'Bad news, violent chagrin, crisis, censure, power in trammels, conflict, calumny; also sickness.',
    reversed:
      'Disquiet, difficulty, opposition, accident, treachery; what is unforeseen; fatality.',
    desc: 'A woman, bound and hoodwinked, with the swords of the card about her. Yet it is rather a card of temporary durance than of irretrievable bondage.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/eight-of-swords/',
  },
  'Nine of Swords': {
    upright:
      'Death, failure, miscarriage, delay, deception, disappointment, despair.',
    reversed: 'Imprisonment, suspicion, doubt, reasonable fear, shame.',
    desc: 'One seated on her couch in lamentation, with the swords over her. She is as one who knows no sorrow which is like unto hers. It is a card of utter desolation.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/nine-of-swords/',
  },
  'Ten of Swords': {
    upright:
      'Whatsoever is intimated by the design; also pain, affliction, tears, sadness, desolation. It is not especially a card of violent death.',
    reversed:
      'Advantage, profit, success, favour, but none of these are permanent; also power and authority.',
    desc: 'A prostrate figure, pierced by all the swords belonging to the card.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/ten-of-swords/',
  },
  'Page of Swords': {
    upright:
      'Authority, overseeing, secret service, vigilance, spying, examination, and the qualities thereto belonging.',
    reversed:
      'More evil side of these qualities; what is unforeseen, unprepared state; sickness is also intimated.',
    desc: 'A lithe, active figure holds a sword upright in both hands, while in the act of swift walking. He is passing over rugged land, and about his way the clouds are collocated wildly. He is alert and lithe, looking this way and that.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/page-of-swords/',
  },
  'Knight of Swords': {
    upright:
      'Skill, bravery, capacity, defence, address, enmity, wrath, war, destruction, opposition, resistance, ruin. There is therefore a sense in which the card signifies death, but it carries this meaning only in its proximity to other cards of fatality.',
    reversed: 'Imprudence, incapacity, extravagance.',
    desc: 'He is riding in full course, as if scattering his enemies. In the design he is really a prototypical hero of romantic chivalry. He might almost be Galahad, whose sword is swift and sure because he is clean of heart.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/knight-of-swords/',
  },
  'Queen of Swords': {
    upright:
      'Widowhood, female sadness and embarrassment, absence, sterility, mourning, privation, separation.',
    reversed: 'Malice, bigotry, artifice, prudery, bale, deceit.',
    desc: 'Her right hand raises the weapon vertically and the hilt rests on an arm of her royal chair the left hand is extended, the arm raised her countenance is severe but chastened; it suggests familiarity with sorrow.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/queen-of-swords/',
  },
  'King of Swords': {
    upright:
      'Whatsoever arises out of the idea of judgment and all its connexions-power, command, authority, militant intelligence, law, offices of the crown, and so forth.',
    reversed: 'Cruelty, perversity, barbarity, perfidy, evil intention.',
    desc: 'He sits in judgment, holding the unsheathed sign of his suit. He recalls, of course, the conventional Symbol of justice in the Trumps Major, and he may represent this virtue, but he is rather the power of life and death, in virtue of his office.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-swords/king-of-swords/',
  },

  // ==================== PENTACLES ====================
  'Ace of Pentacles': {
    upright:
      'Perfect contentment, felicity, ecstasy; also speedy intelligence; gold.',
    reversed:
      'The evil side of wealth, bad intelligence; also great riches. In any case it shews prosperity, comfortable material conditions, but whether these are of advantage to the possessor will depend on whether the card is reversed or not.',
    desc: 'A hand--issuing, as usual, from a cloud--holds up a pentacle.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/ace-of-pentacles/',
  },
  'Two of Pentacles': {
    upright:
      'On the one hand it is represented as a card of gaiety, recreation and its connexions, which is the subject of the design; but it is read also as news and messages in writing, as obstacles, agitation, trouble, embroilment.',
    reversed:
      'Enforced gaiety, simulated enjoyment, literal sense, handwriting, composition, letters of exchange.',
    desc: 'A young man, in the act of dancing, has a pentacle in either hand, and they are joined by that endless cord which is like the number 8 reversed.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/two-of-pentacles/',
  },
  'Three of Pentacles': {
    upright:
      'Métier, trade, skilled labour; usually, however, regarded as a card of nobility, aristocracy, renown, glory.',
    reversed:
      'Mediocrity, in work and otherwise, puerility, pettiness, weakness.',
    desc: 'A sculptor at his work in a monastery. Compare the design which illustrates the Eight of Pentacles. The apprentice or amateur therein has received his reward and is now at work in earnest.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/three-of-pentacles/',
  },
  'Four of Pentacles': {
    upright:
      'The surety of possessions, cleaving to that which one has, gift, legacy, inheritance.',
    reversed: 'Suspense, delay, opposition.',
    desc: 'A crowned figure, having a pentacle over his crown, clasps another with hands and arms; two pentacles are under his feet. He holds to that which he has.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/four-of-pentacles/',
  },
  'Five of Pentacles': {
    upright:
      'The card foretells material trouble above all, whether in the form illustrated--that is, destitution--or otherwise. For some cartomancists, it is a card of love and lovers-wife, husband, friend, mistress; also concordance, affinities.',
    reversed: 'Disorder, chaos, ruin, discord, profligacy.',
    desc: 'Two mendicants in a snow-storm pass a lighted casement.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/five-of-pentacles/',
  },
  'Six of Pentacles': {
    upright:
      'Presents, gifts, gratification another account says attention, vigilance now is the accepted time, present prosperity, etc.',
    reversed: 'Desire, cupidity, envy, jealousy, illusion.',
    desc: 'A person in the guise of a merchant weighs money in a pair of scales and distributes it to the needy and distressed. It is a testimony to his own success in life, as well as to his goodness of heart.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/six-of-pentacles/',
  },
  'Seven of Pentacles': {
    upright:
      'These are exceedingly contradictory; in the main, it is a card of money, business, barter; but one reading gives altercation, quarrels--and another innocence, ingenuity, purgation.',
    reversed:
      'Cause for anxiety regarding money which it may be proposed to lend.',
    desc: 'A young man, leaning on his staff, looks intently at seven pentacles attached to a clump of greenery on his right; one would say that these were his treasures and that his heart was there.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/seven-of-pentacles/',
  },
  'Eight of Pentacles': {
    upright:
      'Work, employment, commission, craftsmanship, skill in craft and business, perhaps in the preparatory stage.',
    reversed:
      'Voided ambition, vanity, cupidity, exaction, usury. It may also signify the possession of skill, in the sense of the ingenious mind turned to cunning and intrigue.',
    desc: 'An artist in stone at his work, which he exhibits in the form of trophies.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/eight-of-pentacles/',
  },
  'Nine of Pentacles': {
    upright:
      'Prudence, safety, success, accomplishment, certitude, discernment.',
    reversed: 'Roguery, deception, voided project, bad faith.',
    desc: 'A woman, with a bird upon her wrist, stands amidst a great abundance of grapevines in the garden of a manorial house. It is a wide domain, suggesting plenty in all things.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/nine-of-pentacles/',
  },
  'Ten of Pentacles': {
    upright:
      'Gain, riches; family matters, archives, extraction, the abode of a family.',
    reversed:
      'Chance, fatality, loss, robbery, games of hazard; sometimes gift, dowry, pension.',
    desc: "A man and woman beneath an archway which gives entrance to a house and domain. They are accompanied by a child, who looks curiously at two dogs accosting an ancient personage seated in the foreground. The child's hand is on one of them.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/ten-of-pentacles/',
  },
  'Page of Pentacles': {
    upright:
      'Application, study, scholarship, reflection another reading says news, messages and the bringer thereof; also rule, management.',
    reversed:
      'Prodigality, dissipation, liberality, luxury; unfavourable news.',
    desc: 'A youthful figure, looking intently at the pentacle which hovers over his raised hands. He moves slowly, insensible of that which is about him.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/page-of-pentacles/',
  },
  'Knight of Pentacles': {
    upright:
      'Utility, serviceableness, interest, responsibility, rectitude-all on the normal and external plane.',
    reversed:
      'inertia, idleness, repose of that kind, stagnation; also placidity, discouragement, carelessness.',
    desc: 'He rides a slow, enduring, heavy horse, to which his own aspect corresponds. He exhibits his symbol, but does not look therein.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/knight-of-pentacles/',
  },
  'Queen of Pentacles': {
    upright: 'Opulence, generosity, magnificence, security, liberty.',
    reversed: 'Evil, suspicion, suspense, fear, mistrust.',
    desc: 'The face suggests that of a dark woman, whose qualities might be summed up in the idea of greatness of soul; she has also the serious cast of intelligence; she contemplates her symbol and may see worlds therein.',
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/queen-of-pentacles/',
  },
  'King of Pentacles': {
    upright:
      'Valour, realizing intelligence, business and normal intellectual aptitude, sometimes mathematical gifts and attainments of this kind; success in these paths.',
    reversed: 'Vice, weakness, ugliness, perversity, corruption, peril.',
    desc: "The figure calls for no special description the face is rather dark, suggesting also courage, but somewhat lethargic in tendency. The bull's head should be noted as a recurrent symbol on the throne.",
    biddyUrl:
      'https://biddytarot.com/tarot-card-meanings/minor-arcana/suit-of-pentacles/king-of-pentacles/',
  },
}

// LocalStorage key for custom meanings
const CUSTOM_MEANINGS_KEY = 'tarot-custom-meanings'

// In-memory cache of custom meanings
let customMeaningsCache: Record<string, Partial<CardMeaning>> | null = null

function loadCustomMeanings(): Record<string, Partial<CardMeaning>> {
  if (customMeaningsCache) return customMeaningsCache

  if (!isStorageAvailable()) {
    customMeaningsCache = {}
    return customMeaningsCache
  }

  const raw = safeGetItem(CUSTOM_MEANINGS_KEY)
  if (raw) {
    try {
      const parsed = JSON.parse(raw)
      customMeaningsCache = parsed
      return parsed
    } catch {
      // Ignore parse errors
    }
  }

  customMeaningsCache = {}
  return customMeaningsCache
}

function saveCustomMeaningsToStorage(
  meanings: Record<string, Partial<CardMeaning>>,
): void {
  if (!isStorageAvailable()) return

  safeSetItem(CUSTOM_MEANINGS_KEY, JSON.stringify(meanings))
  customMeaningsCache = meanings
}

export function saveCustomMeaning(
  cardName: string,
  field: 'upright' | 'reversed' | 'desc',
  value: string,
): void {
  const custom = loadCustomMeanings()
  if (!custom[cardName]) {
    custom[cardName] = {}
  }
  custom[cardName][field] = value
  saveCustomMeaningsToStorage(custom)
}

export function hasCustomMeanings(): boolean {
  const custom = loadCustomMeanings()
  return Object.keys(custom).length > 0
}

export function clearCustomMeanings(): void {
  safeRemoveItem(CUSTOM_MEANINGS_KEY)
  customMeaningsCache = {}
}

export function getCardMeaning(card: Card): CardMeaning {
  const base = CARD_MEANINGS[card.name] || {
    upright: 'Unknown meaning',
    reversed: 'Unknown meaning',
    desc: 'No description available.',
    biddyUrl: 'https://biddytarot.com/tarot-card-meanings/',
  }

  const custom = loadCustomMeanings()
  const customMeaning = custom[card.name]

  if (!customMeaning) return base

  return {
    upright: customMeaning.upright ?? base.upright,
    reversed: customMeaning.reversed ?? base.reversed,
    desc: customMeaning.desc ?? base.desc,
    biddyUrl: base.biddyUrl,
  }
}
