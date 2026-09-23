// Word-by-word meanings.
//
// A phrase list is not much use if you cannot see which word is doing what, so
// every phrase in the app can be broken into its words with a short meaning
// printed under each one:
//
//     Tolong    masakkan        sesuatu
//     please    cook for me     something
//
// The meanings come from the unit word lists first - 594 of them are already
// written out there, and repeating them here would only let the two drift
// apart. What this file adds is:
//
//   1. a SHORT form of each meaning, because "please / help" is too wide to
//      stack under one word, and "please" is what is wanted;
//   2. EXTRA entries for words that turn up inside a phrase but were never
//      listed on their own;
//   3. longest-match-first lookup, so "terima kasih" and "peti sejuk" gloss as
//      the single ideas they are, rather than four unrelated halves.

var GLOSS = (function () {
  'use strict';

  // "eat / food" -> "eat".  "you (casual)" -> "you".
  // The first sense is nearly always the one meant inside a phrase.
  function shorten(meaning) {
    return meaning
      .replace(/\([^)]*\)/g, '')
      .split('/')[0]
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Words that appear inside phrases but are not headwords in any unit, plus
  // the handful whose first listed sense is the wrong one for running text.
  var EXTRA = {
    // not listed anywhere
    'sesuatu': 'something',
    'masakkan': 'cook for me',
    'masakin': 'cook for me',
    'bagi': 'give',
    'beritahu': 'tell',
    'ambil': 'fetch',
    'pasti': 'sure',
    'gula-gula': 'sweets',
    'tak payah': 'no need',
    'tak apa': 'never mind',
    'apa-apa': 'anything',
    'sama-sama': 'you are welcome',
    'banyak-banyak': 'very much',
    'baik-baik': 'just fine',
    'kadang-kadang': 'sometimes',
    'asing-asing': 'separately',
    'barang-barang': 'things',
    'seorang': 'one person',
    'diri': 'self',
    'sekali': 'at once',
    'tadi': 'just now',
    'terus': 'straight on',
    'tepat': 'exactly',
    'yang': 'the one',
    'ke': 'to',
    'di': 'at',
    'dari': 'from',
    'pada': 'at',
    'kepada': 'to',
    'dengan': 'with',
    'untuk': 'for',
    'dan': 'and',
    'atau': 'or',
    'tapi': 'but',
    'sebab': 'because',
    'kalau': 'if',
    'macam': 'like',
    'pun': 'even',
    'lah': '',
    'ya': 'yes',
    'ke?': 'is it',

    // listed, but the first sense is not the one used in running text
    'tolong': 'please',
    'ada': 'have',
    'nak': 'want',
    'mahu': 'want',
    'boleh': 'can',
    'kena': 'must',
    'dah': 'already',
    'sudah': 'already',
    'belum': 'not yet',
    'jangan': 'do not',
    'tak': 'not',
    'tidak': 'not',
    'bukan': 'not',
    'saya': 'I',
    'awak': 'you',
    'dia': 'he/she',
    'kita': 'we',
    'kami': 'we',
    'saja': 'only',
    'sikit': 'a little',
    'lagi': 'more',
    'juga': 'also',
    'lepas': 'after',
    'dulu': 'first',
    'nanti': 'later',
    'sekejap': 'a moment',
    'berapa': 'how much',
    'mana': 'where',
    'bila': 'when',
    'apa': 'what',
    'siapa': 'who',
    'kenapa': 'why',
    'macam mana': 'how',
    'ini': 'this',
    'itu': 'that',
    'sini': 'here',
    'sana': 'there',
    'balik': 'go home',
    'jaga': 'look after',
    'hantar': 'take',
    'simpan': 'keep',
    'buang': 'throw out',
    'cuci': 'wash',
    'basuh': 'wash',
    'lap': 'wipe',
    'sapu': 'sweep',
    'kemas': 'tidy',
    'lipat': 'fold',
    'gosok': 'iron',
    'sidai': 'hang out',
    'tukar': 'change',
    'beli': 'buy',
    'masak': 'cook',
    'makan': 'eat',
    'minum': 'drink',
    'buat': 'do',
    'habis': 'run out',
    'siap': 'done',
    'penat': 'tired',
    'letih': 'tired',
    'sihat': 'well',
    'sakit': 'unwell',
    'cuti': 'day off',
    'rehat': 'rest',
    'kerja': 'work',
    'duit': 'money',
    'baki': 'change',
    'resit': 'receipt',
    'barang': 'things',
    'anak': 'child',
    'sekolah': 'school',
    'bilik': 'room',
    'meja': 'table',
    'lantai': 'floor',
    'tandas': 'toilet',
    'pinggan': 'plate',
    'baju': 'clothes',
    'cadar': 'bedsheets',
    'sayur': 'vegetables',
    'garam': 'salt',
    'pedas': 'spicy',
    'sedap': 'lovely',
    'kurang': 'less',
    'panaskan': 'heat up',
    'faham': 'understand',
    'ulang': 'repeat',
    'tanya': 'ask',
    'risau': 'worry',
    'hati-hati': 'be careful',
    'bagus': 'good',
    'terima kasih': 'thank you',
    'peti sejuk': 'fridge',
    'mesin basuh': 'washing machine',
    'duit kecil': 'small change',
    'tengah hari': 'midday',
    'makan malam': 'dinner',
    'makan tengah hari': 'lunch',
    'hari ini': 'today',
    'minggu depan': 'next week',
    'hujung minggu': 'weekend',
    'pukul berapa': 'what time',
    'berapa orang': 'how many people',

    // the rest of the course
    '_____': 'any word',
    'belok': 'turn',
    'panggil': 'call',
    'jom': 'let us',
    'pendapat': 'opinion',
    'duduk': 'sit',
    'cerita': 'story',
    'mari': 'come',
    'ribu': 'thousand',
    'ratus': 'hundred',
    'tu': 'that',
    'sifar': 'zero',
    'kilo': 'kilo',
    'sekilo': 'a kilo',
    'peratus': 'per cent',
    'tulis': 'write',
    'scan': 'scan',
    'keluarkan': 'take out',
    'tanpa': 'without',
    'daging babi': 'pork',
    'cadang': 'recommend',
    'buatan': 'made in',
    'jaminan': 'warranty',
    'pulangkan': 'return',
    'meter': 'meter',
    'letak': 'put',
    'tempat letak kereta': 'car park',
    'terdekat': 'nearest',
    'perjalanan': 'journey',
    'lambat': 'late',
    'sehari': 'a day',
    'kacang': 'nuts',
    'bawa': 'bring',
    'terangkan': 'explain',
    'hubungi': 'contact',
    'pula': 'rather',
    'sesiapa': 'anyone',
    'bujang': 'single',

    // -nya on a feeling turns it into an exclamation
    'seronoknya': 'what fun',
    'cantiknya': 'how lovely',
    'makanlah': 'do eat',

    // forms of address, kept as what they literally are
    'bang': 'brother',
    'kak': 'sister',

    // names and brands gloss as themselves, so they are never left blank
    'singapura': 'Singapore',
    'bishan': 'Bishan',
    'melaka': 'Melaka',
    'ben': 'Ben',
    'paynow': 'PayNow',
    'qr': 'QR'
  };

  // Built once: every unit headword, shortened, then EXTRA laid over the top.
  var MAP = {};
  if (typeof UNITS !== 'undefined') {
    UNITS.forEach(function (u) {
      u.words.forEach(function (w) {
        var key = w[0].toLowerCase();
        if (!MAP[key]) MAP[key] = shorten(w[1]);
      });
    });
  }
  Object.keys(EXTRA).forEach(function (k) { MAP[k] = EXTRA[k]; });

  // Multi-word entries have to be tried before their parts, longest first,
  // or "terima kasih" glosses as "receive" + "love".
  var KEYS = Object.keys(MAP)
    .filter(function (k) { return k.indexOf(' ') > -1; })
    .sort(function (a, b) { return b.split(' ').length - a.split(' ').length; });
  var MAX = KEYS.length ? KEYS[0].split(' ').length : 1;

  function clean(t) { return t.toLowerCase().replace(/[.,!?;:]+$/, '').replace(/^[¿¡]+/, ''); }

  // Returns [{ ms: 'Tolong', en: 'please' }, ...] - one entry per word, or per
  // multi-word idea. en is '' where nothing is known, and the caller decides
  // how to show that.
  function parts(phrase) {
    var raw = String(phrase).split(/\s+/).filter(Boolean);
    var out = [];
    var i = 0;
    while (i < raw.length) {
      var hit = null, span = 1;
      for (var n = Math.min(MAX, raw.length - i); n >= 2; n--) {
        var joined = raw.slice(i, i + n).map(clean).join(' ');
        if (MAP[joined] !== undefined) { hit = MAP[joined]; span = n; break; }
      }
      if (hit === null) {
        var one = clean(raw[i]);
        hit = MAP[one] !== undefined ? MAP[one] : '';
      }
      // Sentence punctuation belongs to the phrase, not to the word. Leaving
      // it on gives columns reading "sesuatu." above "something".
      var shown = raw.slice(i, i + span).join(' ').replace(/[.,!?;:]+$/, '');
      out.push({ ms: shown, en: hit });
      i += span;
    }
    return out;
  }

  // How much of a phrase could be glossed - used by the coverage check.
  function coverage(phrase) {
    var p = parts(phrase);
    var known = p.filter(function (x) { return x.en !== ''; }).length;
    return { known: known, total: p.length, gaps: p.filter(function (x) { return x.en === ''; }) };
  }

  return { parts: parts, coverage: coverage, map: MAP };
})();
