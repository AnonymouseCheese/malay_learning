# Everyday Malay

A web app for learning spoken Malay on a phone. No install, no libraries, no
build step — a browser opens the files directly.

Malay is written in the ordinary alphabet, so unlike the hiragana app there is
no writing system to get past. What is left is the part that actually matters
in a shop or a taxi: hearing it, and saying it back.

## How it is laid out

The home screen has three parts.

**Numbers & money** sits at the top, because it is the hardest listening job in
the language and the one with money riding on it. It is a drill of its own,
described below.

**At home** is a kept section rather than a taught one — the phrases that come
up around the house, and a place to add your own.

**The course** is seventeen units in teaching order, starting with the words you
cannot do without and ending with the patterns you build your own sentences
from. Each unit carries its words, its phrases, and a short note on how that
corner of the language works.

| # | Unit | What it covers |
| --- | --- | --- |
| 1 | First words | yes, no, thank you, sorry, can, want |
| 2 | Greetings | hello, goodbye, how are you |
| 3 | Meeting people | your name, where you are from, small talk |
| 4 | Numbers | counting, and the belas / puluh trap |
| 5 | Money and paying | prices, change, haggling, catching the figure |
| 6 | Food and drink | ordering at a stall, saying how you want it |
| 7 | Shopping | asking for things, sizes, bargaining |
| 8 | Getting around | taxis, buses, trains, directions |
| 9 | Places | the shop, the toilet, the bank |
| 10 | Time and days | the clock, the week, and no tenses at all |
| 11 | People and family | who is who, and how to address them |
| 12 | Health and the body | saying what hurts |
| 13 | Feelings and opinions | liking, wanting, thinking |
| 14 | Daily life | weather, the house, the routine |
| 15 | Work and study | the office, the shift, the class |
| 16 | When things go wrong | lost, stuck, needing help fast |
| 17 | Making your own sentences | the patterns everything is built from |

1,074 words and phrases in total, plus the At home section and as many numbers
as the drill cares to generate.

## The four modes

Every unit opens the same menu. A control at the top decides whether you are
drilling the **words**, the **phrases**, or both.

- **Listen & repeat** — the Malay appears and is read aloud. You say it back,
  then reveal the English.
- **English → Malay** — the English appears. You say the Malay from memory,
  then reveal it and hear it.
- **Listening quiz** — the phrase is spoken with no text at all, and you pick
  its meaning from four. The wrong answers come from the same unit, so guessing
  from the shape of the English does not work.
- **Phrasebook** — the whole list, readable, with every line tappable to hear,
  and every phrase broken into its words. See below.
- **Exam** — twelve questions mixed across all three modes, scored at the end,
  with the ones you missed listed for another look.

What comes up next is weighted. Something barely tested, or recently got wrong,
comes round sooner; something settled drops back.

## Numbers & money

The reason this has its own section rather than being a unit.

A price in Malay carries no decimal point when it is spoken. **The currency word
is the point** — everything before *ringgit* or *dolar* is dollars, everything
after is cents:

```
lima ringgit lima puluh sen        5.50
```

Then the shortcuts start. *sen* gets dropped. *setengah* — half — stands in for
fifty. All three of these are the same price:

```
lima ringgit lima puluh sen    ·    lima lima puluh    ·    lima setengah
```

Two things get misheard, and each has a level of its own:

**belas against puluh.** *lima belas* is 15, *lima puluh* is 50. One syllable
apart, ten times the money. The same pair bites again down in the cents —
*lima belas sen* is 15c, *lima puluh sen* is 50c.

**Cents under ten.** They keep their small number, so 5.05 is *lima ringgit
lima sen*. If the currency word gets swallowed in a noisy hawker centre, that
sounds exactly like plain five.

Eleven levels, from *satu dua tiga* up through hundreds and thousands to prices
and decimals, and each runs in either direction:

- **Hear it → type it** — a figure is spoken, you type the digits. The harder
  way round, and the one that matters at a counter.
- **See it → say it** — a price is shown, you say it in Malay, then check.

After each answer the app shows the careful reading, whatever else the same
figure gets called, and — on the trap levels — the pair it is one syllable away
from.

Decimals that are not money get their own level too: those are read with
*perpuluhan* (or *titik* in speech), and the digits after the point are read one
at a time — 2.75 is *dua perpuluhan tujuh lima*, never *tujuh puluh lima*.

Prices can be set to **dolar** for Singapore or **ringgit** for Malaysia. It
changes what is spoken as well as what is shown.

## The phrasebook, and word by word

A phrase list is not much use if you cannot see which word is doing what. So
every phrase in the app is broken into its words, each sitting directly above
what it means:

```
Tolong    masakkan       sesuatu
please    cook for me    something
                                        Please cook something.
```

The meanings come from the unit word lists — 594 of them are already written
out there, so the two cannot drift apart — with a shorter form generated for
stacking, and extra entries for words that only ever turn up inside a phrase.
Multi-word ideas are matched first and whole, so *terima kasih* glosses as
"thank you" rather than "receive" and "love". **All 430 phrases are covered,
with no word left blank.**

The **word by word** button in the phrasebook hides the meanings, which turns
the same list into a self-test. The breakdown appears on the drill cards too,
once you have revealed the answer.

Above the phrases, the unit's words are listed tight — Malay on the left,
meaning on the right — as a plain reference to read down.

## At home

The phrases that come up around the house day after day — cooking, cleaning,
laundry, the shopping, the children, days off, and the small courtesies that
matter more than any of it.

It works like any other unit, with one addition: **+ add** in the phrasebook
lets you save a phrase of your own. It is stored on the device, joins the drills
straight away, and can be deleted with the × on its row.

Malay is what the app teaches, and it is the right thing to learn — it is what
works everywhere else in Singapore and across the causeway. But the person you
talk to at home may be Indonesian, so **every phrase in this section carries its
Indonesian wording underneath**: *bisa* not *boleh*, *mau* not *nak*, *tidak* or
*nggak* not *tak*, *jam* not *pukul* for the time, *delapan* not *lapan* for
eight.

Where a phrase is word-for-word the same in both, it says **"Same in
Indonesian"** rather than leaving a blank — a blank cannot tell you whether the
two match or whether nobody checked. 45 of the 58 differ; 13 are identical.

Tap the Indonesian line on its own to hear just that, read by an Indonesian
voice where the device has one. The grammar is identical either way, so
learning the Malay costs you nothing at home.

## Sound

The browser's own speech synthesis reads everything, so there is nothing to
host and it works offline.

Malay voices are not installed on every device. Where there is no `ms` voice,
the app falls back to an Indonesian one — the two are close enough in sound to
learn from — and says on the home screen which it found. Where there is neither,
it says that too, so a bad accent is never mistaken for the right one.

One volume control at the bottom of the home screen governs every sound in the
app, and switching it off hides the listening modes rather than leaving them to
fail silently.

## What is kept

Progress, your added phrases, and your settings live in `localStorage` on the
device. Nothing is sent anywhere. **Reset all progress** at the bottom of the
home screen clears the statistics and leaves your added phrases alone.

## The files

```
index.html    every screen, hidden until needed
style.css     one stylesheet, dark and light
data.js       the course - 17 units plus the At home section
numbers.js    Malay numbers, prices and decimals, built rather than listed
gloss.js      word-by-word meanings, built from the unit word lists
app.js        the drills, the scoring, and the speech
```

`numbers.js` has no opinions about the interface and `app.js` does not know how
Malay counts, so either can be worked on without touching the other.
