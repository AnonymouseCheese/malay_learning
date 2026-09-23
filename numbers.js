// Numbers, prices and decimals.
//
// Malay numbers are assembled from nine words and four endings, so the app
// builds them rather than storing a list. That means the drill can throw any
// figure at you, and can aim deliberately at the two that get misheard:
//
//   belas / puluh   lima belas is 15, lima puluh is 50
//   the cents       lima ringgit lima sen is 5.05, and if the currency word
//                   gets swallowed it sounds like plain five
//
// Everything here returns the words to be spoken. Nothing here speaks.

var NUM = (function () {
  'use strict';

  var ONES = ['kosong', 'satu', 'dua', 'tiga', 'empat',
              'lima', 'enam', 'tujuh', 'lapan', 'sembilan'];

  // se- means one, and it is fused on: sepuluh, seratus, seribu. Never
  // satu puluh - that is the commonest beginner's mistake, in both directions.
  function words(n) {
    n = Math.round(n);
    if (n < 0) return 'negatif ' + words(-n);
    if (n < 10) return ONES[n];
    if (n === 10) return 'sepuluh';
    if (n === 11) return 'sebelas';
    if (n < 20) return ONES[n - 10] + ' belas';
    if (n < 100) {
      var t = Math.floor(n / 10), r = n % 10;
      return ONES[t] + ' puluh' + (r ? ' ' + ONES[r] : '');
    }
    if (n < 1000) {
      var h = Math.floor(n / 100), hr = n % 100;
      return (h === 1 ? 'seratus' : ONES[h] + ' ratus') + (hr ? ' ' + words(hr) : '');
    }
    if (n < 1000000) {
      var k = Math.floor(n / 1000), kr = n % 1000;
      return (k === 1 ? 'seribu' : words(k) + ' ribu') + (kr ? ' ' + words(kr) : '');
    }
    var m = Math.floor(n / 1000000), mr = n % 1000000;
    return (m === 1 ? 'sejuta' : words(m) + ' juta') + (mr ? ' ' + words(mr) : '');
  }

  // Digits read one at a time - how a phone number or an account number comes
  // at you, and how the part after a decimal point is read.
  function digits(str) {
    var out = [];
    String(str).split('').forEach(function (c) {
      if (c >= '0' && c <= '9') out.push(ONES[+c]);
    });
    return out.join(' ');
  }

  // ---------- money ----------
  // A price has no decimal point in it when spoken. The currency word IS the
  // point: everything before it is dollars, everything after is cents.
  //
  // Returns the careful full reading, plus the shortcuts you will actually
  // hear, so the drill can show what else the same figure sounds like.
  function price(cents, cur) {
    cents = Math.round(cents);
    var unit = cur === 'dolar' ? 'dolar' : 'ringgit';
    var big = Math.floor(cents / 100);
    var small = cents % 100;
    var full, alts = [];

    if (big === 0) {
      full = words(small) + ' sen';
    } else if (small === 0) {
      full = words(big) + ' ' + unit;
      alts.push(words(big) + ' ' + unit + ' tepat');       // exactly, nothing after
      alts.push(words(big) + ' kosong kosong');            // reading the .00 off a till
    } else {
      full = words(big) + ' ' + unit + ' ' + words(small) + ' sen';
      // Currency and sen both dropped. Only natural once the cents reach ten -
      // below that the small number needs the sen to be heard as cents at all.
      if (small >= 10) alts.push(words(big) + ' ' + words(small));
      if (small === 50) alts.push(words(big) + ' setengah');
      if (small < 10) alts.push(words(big) + ' ' + unit + ' kosong ' + words(small));
    }
    return { full: full, alts: alts };
  }

  // ---------- decimals that are not money ----------
  // After the point, digits are read singly: 2.75 is dua perpuluhan tujuh lima,
  // never dua perpuluhan tujuh puluh lima.
  function decimal(value, style) {
    var s = value.toFixed(2).replace(/0+$/, '').replace(/\.$/, '');
    var parts = s.split('.');
    var point = style === 'titik' ? 'titik' : (style === 'koma' ? 'koma' : 'perpuluhan');
    if (parts.length === 1) return words(+parts[0]);
    return words(+parts[0]) + ' ' + point + ' ' + digits(parts[1]);
  }

  // ---------- the drill ----------
  function rnd(n) { return Math.floor(Math.random() * n); }
  function pick(a) { return a[rnd(a.length)]; }
  function between(lo, hi) { return lo + rnd(hi - lo + 1); }

  // The pairs one syllable apart. These are the whole reason this drill exists.
  var TRAPS = [[11, 10], [12, 20], [13, 30], [14, 40], [15, 50],
               [16, 60], [17, 70], [18, 80], [19, 90]];

  function trapNote(n) {
    var teen = n % 10, ten = Math.floor(n / 10);
    if (n >= 11 && n <= 19) {
      var other = (n - 10) * 10;
      return words(n) + ' = ' + n + '   ·   ' + words(other) + ' = ' + other;
    }
    if (n >= 20 && n <= 90 && n % 10 === 0) {
      var t = ten + 10;
      return words(t) + ' = ' + t + '   ·   ' + words(n) + ' = ' + n;
    }
    return '';
  }

  // Realistic amounts, rather than uniform random - a hawker plate is 3 to 8,
  // a grocery run is 20 to 90, and cents cluster on the round numbers.
  function someCents() {
    var r = Math.random();
    if (r < 0.34) return pick([0, 50, 90, 20, 80, 10, 40, 60, 30, 70]);
    if (r < 0.60) return pick([5, 5, 5, 95, 99, 90, 45, 25, 75, 15]);
    if (r < 0.80) return pick([15, 50, 15, 50, 16, 60, 17, 70]);   // the trap, in the cents
    return between(1, 99);
  }

  function someDollars() {
    var r = Math.random();
    if (r < 0.45) return between(1, 12);
    if (r < 0.80) return between(13, 99);
    return between(100, 450);
  }

  // Each level returns a question: what to say, what the answer is, and what
  // else the same figure gets called.
  var LEVELS = [
    {
      id: 'ones',
      name: 'One to ten',
      sub: 'satu, dua, tiga - the nine words everything is built from',
      make: function () { return int(between(0, 10)); }
    },
    {
      id: 'teens',
      name: 'Eleven to nineteen',
      sub: 'sebelas, and then belas on everything else',
      make: function () { return int(between(11, 19)); }
    },
    {
      id: 'tens',
      name: 'Twenty to ninety-nine',
      sub: 'puluh for the tens, then the unit after it',
      make: function () { return int(between(20, 99)); }
    },
    {
      id: 'trap',
      name: 'belas or puluh',
      sub: '15 or 50 - one syllable apart, and the costliest mistake there is',
      make: function () {
        var p = pick(TRAPS);
        return int(pick([p[0], p[1]]), true);
      }
    },
    {
      id: 'hundreds',
      name: 'Hundreds',
      sub: 'seratus, dua ratus - and what comes after them',
      make: function () { return int(between(100, 999)); }
    },
    {
      id: 'thousands',
      name: 'Thousands',
      sub: 'seribu upwards, for rent, salaries and big bills',
      make: function () { return int(pick([between(1000, 9999), between(1000, 99999), between(10000, 99999)])); }
    },
    {
      id: 'priceRound',
      name: 'Round prices',
      sub: 'Whole dollars, nothing after the point',
      make: function () { return money(someDollars() * 100); }
    },
    {
      id: 'priceCents',
      name: 'Prices with cents',
      sub: 'The decimal, spoken - 5.50, 12.90, 3.05',
      make: function () { return money(someDollars() * 100 + someCents()); }
    },
    {
      id: 'priceTrap',
      name: 'The cents that catch you',
      sub: '5.15 against 5.50, and single-digit cents like 5.05',
      make: function () {
        var d = between(1, 30);
        var c = pick([5, 5, 15, 50, 15, 50, 16, 60, 5, 9, 19, 90]);
        return money(d * 100 + c, true);
      }
    },
    {
      id: 'decimals',
      name: 'Decimals that are not money',
      sub: 'perpuluhan - weights, percentages, ratings',
      make: function () {
        var v = pick([
          between(1, 9) + between(1, 9) / 10,
          between(1, 20) + between(1, 9) / 10,
          between(1, 9) + between(10, 99) / 100,
          between(0, 1) + between(1, 9) / 10
        ]);
        v = Math.round(v * 100) / 100;
        var style = pick(['perpuluhan', 'perpuluhan', 'titik']);
        return {
          kind: 'decimal',
          value: v,
          answer: String(v),
          spoken: decimal(v, style),
          alts: [decimal(v, style === 'titik' ? 'perpuluhan' : 'titik')],
          note: 'After the point the digits are read one at a time.'
        };
      }
    },
    {
      id: 'mixed',
      name: 'Everything mixed',
      sub: 'Numbers and prices together, the way real life sends them',
      make: function () {
        var l = pick(LEVELS.filter(function (x) { return x.id !== 'mixed'; }));
        return l.make();
      }
    }
  ];

  function int(n, isTrap) {
    return {
      kind: 'int',
      value: n,
      answer: String(n),
      spoken: words(n),
      alts: [],
      note: isTrap ? trapNote(n) : ''
    };
  }

  function money(cents, isTrap) {
    var cur = NUM.currency;
    var p = price(cents, cur);
    var v = cents / 100;
    var c = cents % 100;
    var note = '';
    if (isTrap) {
      if (c > 0 && c < 10) {
        note = 'Cents under ten keep their small number: ' + words(c) + ' sen = ' +
               (c < 10 ? '0' : '') + c + 'c, not ' + words(c) + ' puluh sen.';
      } else if (c === 15 || c === 50 || c === 16 || c === 60) {
        var other = c < 20 ? (c - 10) * 10 : c / 10 + 10;
        note = words(c) + ' sen = ' + c + 'c   ·   ' + words(other) + ' sen = ' + other + 'c';
      }
    }
    return {
      kind: 'price',
      value: v,
      answer: v.toFixed(2),
      spoken: p.full,
      alts: p.alts,
      note: note
    };
  }

  return {
    currency: 'ringgit',        // set by the app; 'ringgit' or 'dolar'
    words: words,
    digits: digits,
    price: price,
    decimal: decimal,
    levels: LEVELS,
    levelById: function (id) {
      for (var i = 0; i < LEVELS.length; i++) if (LEVELS[i].id === id) return LEVELS[i];
      return LEVELS[0];
    }
  };
})();
